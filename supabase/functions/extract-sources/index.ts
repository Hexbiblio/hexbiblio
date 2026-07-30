import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { extractAndStoreSources, extractPathFromPublicUrl } from "../_shared/extractSources.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Small batch per invocation — keeps one call well within CPU/wall-clock
// limits regardless of backlog size. Re-invoke (spaced out) to keep
// processing; it reports how many are left.
const BATCH_SIZE = 3;

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

    // ---- Internal/maintenance endpoint — gated on the service-role key
    // itself, not a user JWT. This is a backfill tool the project owner
    // runs by hand, not something regular users ever call. ----
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (token !== SUPABASE_SERVICE_ROLE_KEY) {
      return jsonResponse({ error: "Forbidden" }, 403);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabase = createClient(supabaseUrl, SUPABASE_SERVICE_ROLE_KEY);

    // Theses with a PDF and no sources rows yet.
    const { data: candidates, error: candidatesError } = await supabase
      .from("theses")
      .select("id, title, field, file_url")
      .not("file_url", "is", null)
      .order("created_at", { ascending: true });

    if (candidatesError) throw candidatesError;

    const { data: alreadyDone } = await supabase.from("sources").select("thesis_id");
    const doneIds = new Set((alreadyDone ?? []).map((r: { thesis_id: string }) => r.thesis_id));

    const pending = (candidates ?? []).filter((t: { id: string }) => !doneIds.has(t.id));
    const batch = pending.slice(0, BATCH_SIZE);

    const results = [];
    for (const thesis of batch) {
      const filePath = extractPathFromPublicUrl(thesis.file_url as string, "theses");
      if (!filePath) {
        results.push({ thesis_id: thesis.id, error: "could not derive storage path from file_url" });
        continue;
      }
      try {
        const { inserted } = await extractAndStoreSources(
          supabase,
          thesis.id,
          filePath,
          thesis.title,
          thesis.field,
          GEMINI_API_KEY,
        );
        results.push({ thesis_id: thesis.id, inserted });
      } catch (e) {
        console.error("extract-sources error for thesis", thesis.id, e);
        results.push({ thesis_id: thesis.id, error: e instanceof Error ? e.message : "Unknown error" });
      }
    }

    return jsonResponse({
      processed: batch.length,
      remaining: pending.length - batch.length,
      results,
    });
  } catch (e) {
    console.error("extract-sources error:", e);
    return jsonResponse({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
