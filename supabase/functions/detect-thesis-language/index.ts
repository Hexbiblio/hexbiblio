import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { detectAndTranslateTitle } from "../_shared/languageDetection.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Backfill for theses submitted/imported before language detection existed
// (detected_language IS NULL) — same shape as extract-sources: internal/
// maintenance endpoint, gated on the service-role key, small batch per call,
// re-invoke (spaced out) to keep going. Lighter per-item cost than
// extract-sources (no PDF download, no 20k-char extraction) so the batch can
// be larger.
const BATCH_SIZE = 10;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (token !== SUPABASE_SERVICE_ROLE_KEY) {
      return jsonResponse({ error: "Forbidden" }, 403);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabase = createClient(supabaseUrl, SUPABASE_SERVICE_ROLE_KEY);

    const { data: pending, error: pendingError } = await supabase
      .from("theses")
      .select("id, title, abstract, origin, external_id")
      .is("detected_language", null)
      .order("created_at", { ascending: true })
      .limit(BATCH_SIZE);

    if (pendingError) throw pendingError;

    const batch = pending ?? [];
    // deno-lint-ignore no-explicit-any
    const results: any[] = [];

    for (const thesis of batch) {
      try {
        // theses.fr's own `langues` field is authoritative and must win over
        // the title/abstract heuristic — see languageDetection.ts's
        // detectAndTranslateTitle for why (theses.fr supplies a mandatory
        // French title+abstract regardless of the thesis's real language).
        let knownLanguage: string | undefined;
        if (thesis.origin === "theses_fr" && thesis.external_id) {
          const detailRes = await fetch(`https://theses.fr/api/v1/theses/these/${encodeURIComponent(thesis.external_id)}`);
          if (detailRes.ok) {
            const detail = await detailRes.json();
            knownLanguage = detail?.langues?.[0];
          }
        }

        const { detectedLanguage, titleTranslated } = await detectAndTranslateTitle(
          thesis.title,
          thesis.abstract,
          GEMINI_API_KEY,
          knownLanguage,
        );
        const { error: updateError } = await supabase
          .from("theses")
          .update({ detected_language: detectedLanguage, title_translated: titleTranslated })
          .eq("id", thesis.id);
        if (updateError) throw updateError;
        results.push({ thesis_id: thesis.id, detected_language: detectedLanguage });
      } catch (e) {
        console.error("detect-thesis-language error for thesis", thesis.id, e);
        results.push({ thesis_id: thesis.id, error: e instanceof Error ? e.message : "Unknown error" });
      }
    }

    const { count: remaining } = await supabase
      .from("theses")
      .select("id", { count: "exact", head: true })
      .is("detected_language", null);

    return jsonResponse({ processed: batch.length, remaining: remaining ?? 0, results });
  } catch (e) {
    console.error("detect-thesis-language error:", e);
    return jsonResponse({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
