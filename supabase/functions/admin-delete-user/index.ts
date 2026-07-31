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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let language = "en";
  try {
    const body = await req.json();
    language = body.language ?? "en";
    const { targetUserId } = body;

    if (!targetUserId || typeof targetUserId !== "string") {
      return jsonResponse({ error: "Missing target account" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ---- Resolve the caller's own identity from their JWT — never trust
    // anything the client claims about itself in the request body. ----
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return jsonResponse({ error: "Authentication required" }, 401);

    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    const callerId = userData?.user?.id;
    if (authError || !callerId) return jsonResponse({ error: "Authentication required" }, 401);

    // ---- Re-derive admin status server-side. Never trust an "isAdmin"
    // flag from the client — this is the only thing standing between any
    // authenticated caller and deleting an arbitrary account. ----
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleRow) {
      return jsonResponse({ error: msg(language, "You don't have access to this.", "Tu n'as pas accès à ceci.") }, 403);
    }

    // ---- Refuse self-deletion via this path — an accidental self-lockout
    // has no recovery route short of another admin or direct DB access. ----
    if (targetUserId === callerId) {
      return jsonResponse(
        { error: msg(language, "You can't delete your own account this way.", "Tu ne peux pas supprimer ton propre compte de cette façon.") },
        400,
      );
    }

    // ---- The actual deletion. profiles.user_id and theses.user_id both
    // already ON DELETE CASCADE to auth.users(id), and theses.id's own
    // cascades clean up dependent comments/ratings/bookmarks/sources — a
    // single Admin API call is sufficient, no manual cleanup needed. ----
    const { error: deleteError } = await supabase.auth.admin.deleteUser(targetUserId);
    if (deleteError) {
      console.error("admin-delete-user: deleteUser failed:", deleteError);
      return jsonResponse({ error: msg(language, GENERIC_ERROR_EN, GENERIC_ERROR_FR) }, 500);
    }

    return jsonResponse({ success: true });
  } catch (e) {
    console.error("admin-delete-user error:", e);
    return jsonResponse({ error: msg(language, GENERIC_ERROR_EN, GENERIC_ERROR_FR) }, 500);
  }
});
