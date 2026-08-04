import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Mirrors thesis-chat/index.ts's own msg() helper.
function msg(language: string, en: string, fr: string): string {
  return language === "fr" ? fr : en;
}
const GENERIC_ERROR_EN = "A small hiccup on our end. Try again in a moment — if it keeps happening, we're here.";
const GENERIC_ERROR_FR = "Petit accroc de notre côté. Réessaie dans un instant — si ça persiste, on est là.";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// LEX-04: self-service account deletion for a student deleting their own
// account — distinct from admin-delete-user, which is for an admin
// deleting someone else's and explicitly refuses a self-target. No admin
// role check here: the target is never taken from the request body, only
// ever derived from the caller's own JWT, so this can only ever delete the
// caller's own account, never anyone else's.
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let language = "en";
  try {
    const body = await req.json().catch(() => ({}));
    language = body.language ?? "en";

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return jsonResponse({ error: "Authentication required" }, 401);

    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    const callerId = userData?.user?.id;
    if (authError || !callerId) return jsonResponse({ error: "Authentication required" }, 401);

    // ---- The actual deletion. profiles.user_id still cascades, so the
    // profile row is gone; theses.user_id is ON DELETE SET NULL (LEX-04) —
    // theses stay in the corpus, with the author_name they already had,
    // just no longer linked to an account. ----
    const { error: deleteError } = await supabase.auth.admin.deleteUser(callerId);
    if (deleteError) {
      console.error("delete-own-account: deleteUser failed:", deleteError);
      return jsonResponse({ error: msg(language, GENERIC_ERROR_EN, GENERIC_ERROR_FR) }, 500);
    }

    return jsonResponse({ success: true });
  } catch (e) {
    console.error("delete-own-account error:", e);
    return jsonResponse({ error: msg(language, GENERIC_ERROR_EN, GENERIC_ERROR_FR) }, 500);
  }
});
