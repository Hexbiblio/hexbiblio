import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { extractAndStoreSources } from "../_shared/extractSources.ts";
import { mapThesesFrDiscipline, parseTheseFrDefenseYear } from "../_shared/thesesFrFieldMapping.ts";
import { detectAndTranslateTitle } from "../_shared/languageDetection.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Seeds the sources corpus from theses.fr (open national doctoral-thesis
// registry, Licence Ouverte) — see 20260802100000_theses_fr_import_support.sql
// for why imported rows carry their own author_name and stay out of
// /database + /sources's "Toutes les sources" tab for now. This is an
// internal/maintenance endpoint in the same shape as extract-sources: gated
// on the service-role key, invoked by hand in small batches, re-invoked
// (spaced out) for more. Small default LIMIT and MAX_PAGES keep each call
// well within edge-function CPU/wall-clock budget and avoid hammering
// theses.fr's public API or burning through the shared GEMINI_API_KEY quota
// in one burst — this project has hit an API abuse ban once already from
// rapid automated calls (see thesis-chat-testing-safety skill).
const DEFAULT_LIMIT = 3;
const MAX_LIMIT = 5;
const PAGE_SIZE = 20;
const MAX_PAGES = 5;
const MIN_ABSTRACT_LENGTH = 150; // mirrors theses_abstract_min_length CHECK constraint
const IMPORT_USERNAME = "theses.fr";
const IMPORT_EMAIL = "import+thesesfr@hexbiblio.internal";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// deno-lint-ignore no-explicit-any
async function getOrCreateImportUser(supabase: any): Promise<string> {
  const { data: existing } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("username", IMPORT_USERNAME)
    .maybeSingle();
  if (existing) return existing.user_id;

  const { data: created, error } = await supabase.auth.admin.createUser({
    email: IMPORT_EMAIL,
    password: crypto.randomUUID(),
    email_confirm: true,
    user_metadata: { username: IMPORT_USERNAME },
  });
  if (error || !created?.user) {
    throw new Error(`could not create theses.fr import system user: ${error?.message}`);
  }
  return created.user.id;
}

interface ThesePersonne {
  nom?: string;
  prenom?: string;
}

interface TheseLite {
  nnt?: string;
}

interface TheseDetail {
  titrePrincipal?: string;
  nnt?: string;
  discipline?: string;
  dateSoutenance?: string;
  resumes?: Record<string, string>;
  auteurs?: ThesePersonne[];
  langues?: string[];
}

function formatAuthorName(auteurs: ThesePersonne[] | undefined): string {
  return (auteurs ?? [])
    .map((a) => [a.prenom, a.nom].filter((p) => p && p.trim()).join(" ").trim())
    .filter((name) => name.length > 0)
    .join(", ");
}

function isPdf(buf: Uint8Array): boolean {
  return buf.length > 4 && buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46; // "%PDF"
}

// theses.fr/api/v1/document/{nnt} doesn't always serve the PDF itself — for
// many theses it 302s to the hosting institution's own repository (most
// often HAL) and THAT page is an HTML landing page, not the file. Confirmed
// live: fetch() follows the redirect fine, but the bytes it lands on are
// text/html, not a PDF — unpdf then fails with "Invalid PDF structure".
// HAL's landing pages predictably expose the actual file at
// "<record url>/document"; other repositories (DUMAS, a university's own
// ENT) don't follow that convention, so this is a best-effort fallback for
// the HAL case specifically, not a general solution — anything else is
// skipped rather than guessed at.
async function fetchOpenAccessPdf(nnt: string): Promise<Uint8Array | null> {
  const primaryRes = await fetch(`https://theses.fr/api/v1/document/${encodeURIComponent(nnt)}`);
  if (!primaryRes.ok) return null;
  const primaryBuffer = new Uint8Array(await primaryRes.arrayBuffer());
  if (isPdf(primaryBuffer)) return primaryBuffer;

  if (primaryRes.url.includes("hal.science")) {
    const halPdfUrl = primaryRes.url.replace(/\/+$/, "") + "/document";
    const halRes = await fetch(halPdfUrl);
    if (halRes.ok) {
      const halBuffer = new Uint8Array(await halRes.arrayBuffer());
      if (isPdf(halBuffer)) return halBuffer;
    }
  }

  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    // ---- Internal/maintenance endpoint — gated on the service-role key
    // itself, not a user JWT. Never invoke with anything other than that
    // key, and never paste the key itself into chat — see CLAUDE.md. ----
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (token !== SUPABASE_SERVICE_ROLE_KEY) {
      return jsonResponse({ error: "Forbidden" }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const query = typeof body.query === "string" ? body.query.trim() : "";
    if (query.length < 2) {
      return jsonResponse({ error: "body.query (free-text search term, e.g. a French field label) is required" }, 400);
    }
    const limit = Math.min(MAX_LIMIT, Math.max(1, Number.isFinite(body.limit) ? body.limit : DEFAULT_LIMIT));

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabase = createClient(supabaseUrl, SUPABASE_SERVICE_ROLE_KEY);

    const importUserId = await getOrCreateImportUser(supabase);

    let scanned = 0;
    let inserted = 0;
    let skipped = 0;
    // deno-lint-ignore no-explicit-any
    const results: any[] = [];

    for (let pageIndex = 0; pageIndex < MAX_PAGES && inserted < limit; pageIndex++) {
      const searchUrl = `https://theses.fr/api/v1/theses/recherche/?q=${encodeURIComponent(query)}&debut=${pageIndex * PAGE_SIZE}&nombre=${PAGE_SIZE}&tri=dateDesc`;
      const searchRes = await fetch(searchUrl);
      if (!searchRes.ok) break;
      const searchData = await searchRes.json();
      const candidates: TheseLite[] = Array.isArray(searchData?.theses) ? searchData.theses : [];
      if (candidates.length === 0) break;

      for (const candidate of candidates) {
        if (inserted >= limit) break;
        const nnt = candidate.nnt;
        if (!nnt) continue;
        scanned++;

        const { data: existing } = await supabase
          .from("theses")
          .select("id")
          .eq("external_id", nnt)
          .maybeSingle();
        if (existing) {
          skipped++;
          continue;
        }

        const detailRes = await fetch(`https://theses.fr/api/v1/theses/these/${encodeURIComponent(nnt)}`);
        if (!detailRes.ok) {
          results.push({ nnt, skipped: "metadata fetch failed" });
          skipped++;
          continue;
        }
        const detail: TheseDetail = await detailRes.json();

        const title = detail.titrePrincipal?.trim() ?? "";
        const abstract = (detail.resumes?.fr ?? detail.resumes?.en ?? "").trim();
        const authorName = formatAuthorName(detail.auteurs);
        const defenseYear = parseTheseFrDefenseYear(detail.dateSoutenance);

        if (title.length < 5 || abstract.length < MIN_ABSTRACT_LENGTH || !authorName) {
          results.push({ nnt, skipped: "insufficient metadata (title/abstract/author)" });
          skipped++;
          continue;
        }

        // Open-access files only — protected/embargoed theses require Renater
        // institutional auth we don't have.
        const pdfBuffer = await fetchOpenAccessPdf(nnt);
        if (!pdfBuffer) {
          results.push({ nnt, skipped: "no direct open-access PDF found" });
          skipped++;
          continue;
        }

        const storagePath = `${importUserId}/thesesfr-${nnt}.pdf`;
        const { error: uploadError } = await supabase.storage
          .from("theses")
          .upload(storagePath, pdfBuffer, { contentType: "application/pdf", upsert: true });
        if (uploadError) {
          results.push({ nnt, error: `storage upload failed: ${uploadError.message}` });
          continue;
        }
        const { data: publicUrlData } = supabase.storage.from("theses").getPublicUrl(storagePath);
        const field = mapThesesFrDiscipline(detail.discipline);

        const { data: insertedThesis, error: insertError } = await supabase
          .from("theses")
          .insert({
            user_id: importUserId,
            title,
            author_name: authorName,
            abstract,
            field,
            file_url: publicUrlData.publicUrl,
            degree_type: "PhD",
            graduation_year: defenseYear,
            origin: "theses_fr",
            external_id: nnt,
            external_url: `https://theses.fr/${nnt}`,
          })
          .select("id")
          .single();

        if (insertError || !insertedThesis) {
          // Most likely the (lower(title), lower(author_name)) unique index —
          // a genuine duplicate under a different NNT variant. Not fatal.
          results.push({ nnt, skipped: `insert failed: ${insertError?.message}` });
          skipped++;
          continue;
        }

        // deno-lint-ignore no-explicit-any
        const resultEntry: any = { nnt, thesis_id: insertedThesis.id };

        try {
          const { inserted: sourcesInserted } = await extractAndStoreSources(
            supabase,
            insertedThesis.id,
            storagePath,
            title,
            field,
            GEMINI_API_KEY,
          );
          resultEntry.sources_inserted = sourcesInserted;
        } catch (e) {
          console.error("import-theses-fr: source extraction failed for", nnt, e);
          resultEntry.sources_error = e instanceof Error ? e.message : "unknown";
        }

        try {
          // theses.fr's own `langues` field is authoritative and must win
          // over our title/abstract heuristic — see languageDetection.ts's
          // detectAndTranslateTitle for why (a mandatory French
          // title+abstract exists regardless of the thesis's real language).
          const { detectedLanguage, titleTranslated } = await detectAndTranslateTitle(
            title,
            abstract,
            GEMINI_API_KEY,
            detail.langues?.[0],
          );
          await supabase
            .from("theses")
            .update({ detected_language: detectedLanguage, title_translated: titleTranslated })
            .eq("id", insertedThesis.id);
          resultEntry.detected_language = detectedLanguage;
        } catch (e) {
          console.error("import-theses-fr: language detection/translation failed for", nnt, e);
          resultEntry.language_error = e instanceof Error ? e.message : "unknown";
        }

        results.push(resultEntry);
        inserted++;
      }
    }

    return jsonResponse({ scanned, inserted, skipped, results });
  } catch (e) {
    console.error("import-theses-fr error:", e);
    return jsonResponse({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
