import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Brand voice: a mentor, not a tool — user-facing errors stay warm and never
// leak technical detail (that goes to console.error instead). msg() picks
// the FR/EN pair; the generic AI-error copy is reused for every "something
// went wrong upstream" case so a student never sees a raw status code.
function msg(language: string, en: string, fr: string): string {
  return language === "fr" ? fr : en;
}
const GENERIC_AI_ERROR_EN = "A small hiccup on our end. Try again in a moment — if it keeps happening, we're here.";
const GENERIC_AI_ERROR_FR = "Petit accroc de notre côté. Réessaie dans un instant — si ça persiste, on est là.";

const SYSTEM_PROMPT = `You are HexBiblio — an expert academic research advisor guiding students through their thesis journey via a Socratic, one-step-at-a-time conversation.

## Conversation Style — CRITICAL
- **Ask ONE question at a time.** Never dump a full multi-section analysis in a single message.
- Keep replies SHORT (typically 2–5 sentences + one focused question).
- Wait for the student's answer before moving to the next step.
- No giant templated headers (📚 🏷️ 📊 etc.) on every reply. Use a header only when the student has explicitly reached that step and you are summarizing it.
- Be warm, curious, and encouraging — like a thoughtful supervisor, not a report generator.

## The Journey (advance ONE step per exchange)
1. **Discipline** — ask what field they're working in.
2. **Theme / topic** — help them narrow to a specific area.
3. **Research question** — co-craft a clear, focused question.
4. **Thesis statement / hypothesis** — help them formulate a defendable claim.
5. **Methodology** — discuss qualitative / quantitative / mixed approaches.
6. **Sources** — point them to relevant theses from the HexBiblio database and external literature.

Only move to the next step once the current one feels resolved. If the student is vague, ask a clarifying follow-up rather than guessing.

## Staying in order — CRITICAL
The student's real progress is given below in "QUEST STATUS". If their latest message jumps ahead of the current open step (e.g. they state a thesis before a topic is set, or name a methodology before a research question exists), do NOT just follow along with the tangent. Briefly and warmly acknowledge what they shared (you can note it's a great direction for later), then steer them back to the current open step and say in one short sentence why finishing it first will make the later step easier. Only advance once the current step is actually resolved.

## First message
If the student just says hi or hasn't shared a topic, greet them by their first name if it's known (e.g. "Hi Simon!" / "Bonjour Simon !"), then ask ONE opening question (e.g. "What field are you working in?" or "What topic is on your mind?"). Do NOT pre-list all the steps.

## Database sources
You will receive matching theses from the HexBiblio database in context. Only present them when the conversation has reached the sources step (or when directly asked). When you do, mention 1–3 most relevant ones with title, author, and why they fit — not a long dump.

## Style
- Plain prose, occasional bold for emphasis. Bullet lists only when listing 3+ concrete items the student asked for.
- Never repeat the same question twice in a row.
- Stay academically rigorous but conversational.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Declared outside the try block so the catch handler can still pick the
  // right language for its error message even if something fails before
  // (or during) parsing the request body.
  let language = "en";
  try {
    const body = await req.json();
    language = body.language ?? "en";
    const { messages, currentQuest = null, completedQuests = [] } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (messages.length > 40) {
      return new Response(
        JSON.stringify({ error: msg(language, "This conversation's getting long — start a new one.", "Cette conversation devient longue — recommence une nouvelle discussion.") }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ---- Identify the caller: real logged-in user vs anonymous guest ----
    // The client sends either the user's own access token (if logged in) or
    // the public anon key (guest). Never trust anything else in the request
    // body to determine identity.
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    let userId: string | null = null;
    if (token) {
      const { data: userData } = await supabase.auth.getUser(token);
      userId = userData?.user?.id ?? null;
    }

    // ---- Server-side rate limiting (this cannot be bypassed from the client) ----
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";
    const identifier = userId ?? `guest:${ip}`;
    const limit = userId ? 40 : 3; // logged-in users vs anonymous guests, per 24h
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // ---- Minimum spacing between messages ----
    // The daily cap above doesn't stop a burst of rapid-fire requests within
    // a short window — which is exactly the kind of traffic pattern that got
    // a prior GEMINI_API_KEY's Google Cloud account flagged and denied access.
    // A human reading a reply and typing a follow-up never sends two messages
    // this close together, so this only ever blocks automated hammering.
    const MIN_INTERVAL_MS = 3000;
    const { data: lastLog } = await supabase
      .from("chat_logs")
      .select("created_at")
      .eq("identifier", identifier)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastLog && Date.now() - new Date(lastLog.created_at).getTime() < MIN_INTERVAL_MS) {
      return new Response(
        JSON.stringify({ error: msg(language, "Give it a second before sending another message.", "Laisse passer un instant avant d'envoyer un autre message.") }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { count } = await supabase
      .from("chat_logs")
      .select("id", { count: "exact", head: true })
      .eq("identifier", identifier)
      .gte("created_at", since);

    if ((count ?? 0) >= limit) {
      return new Response(
        JSON.stringify({
          error: userId
            ? msg(language, "You've hit today's limit. Let's pick this up tomorrow?", "Tu as atteint la limite du jour. On se retrouve demain ?")
            : msg(language, "Sign in to keep chatting without a limit.", "Connecte-toi pour continuer à discuter sans limite."),
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await supabase.from("chat_logs").insert({ identifier, user_id: userId });

    // ---- Load the caller's own profile server-side (never trust a client-supplied profile) ----
    let profile: any = null;
    if (userId) {
      const { data } = await supabase
        .from("profiles")
        .select("first_name, academic_level, country, university, field_of_study, research_interests, bio")
        .eq("user_id", userId)
        .maybeSingle();
      profile = data;
    }

    // Extract the latest user message to search the database
    const lastUserMessage = [...messages].reverse().find((m: any) => m.role === "user")?.content || "";

    // Search the thesis database for relevant sources
    let databaseContext = "";
    if (lastUserMessage.length > 5) {
      // Split user message into keywords for search
      const keywords = lastUserMessage
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((w: string) => w.length > 3)
        .slice(0, 8);

      // Build OR search across title, abstract, field, and author
      const searchConditions = keywords
        .map((kw: string) => `title.ilike.%${kw}%,abstract.ilike.%${kw}%,field.ilike.%${kw}%,author_name.ilike.%${kw}%`)
        .join(",");

      const { data: theses } = await supabase
        .from("theses")
        .select("id, title, author_name, field, abstract, file_url, created_at, keywords, degree_type, graduation_year")
        .or(searchConditions)
        .order("created_at", { ascending: false })
        .limit(10);

      if (theses && theses.length > 0) {
        const thesisIds = theses.map((t: any) => t.id);
        const [{ data: ratings }, { data: accRatings }] = await Promise.all([
          supabase.from("ratings").select("thesis_id, score").in("thesis_id", thesisIds),
          supabase.from("accuracy_ratings").select("thesis_id, score").in("thesis_id", thesisIds),
        ]);

        const buildMap = (arr: any[] | null) => {
          const map: Record<string, { total: number; count: number }> = {};
          for (const r of arr || []) {
            if (!map[r.thesis_id]) map[r.thesis_id] = { total: 0, count: 0 };
            map[r.thesis_id].total += r.score;
            map[r.thesis_id].count += 1;
          }
          return map;
        };
        const ratingMap = buildMap(ratings);
        const accuracyMap = buildMap(accRatings);

        databaseContext = `\n\n---\n## MATCHING THESES FROM THE HEXBIBLIO DATABASE\nThe following theses from our community database match the student's research question. Present these as recommended sources. Highlight the accuracy score — it reflects how precise and useful other students found each thesis:\n\n`;
        for (const t of theses) {
          const avgRating = ratingMap[t.id] ? (ratingMap[t.id].total / ratingMap[t.id].count).toFixed(1) : "No ratings";
          const avgAccuracy = accuracyMap[t.id] ? (accuracyMap[t.id].total / accuracyMap[t.id].count).toFixed(1) : "Not yet rated";
          databaseContext += `### "${t.title}"\n- **Author**: ${t.author_name}\n- **Field**: ${t.field}\n- **Degree**: ${t.degree_type || "Not specified"}${t.graduation_year ? ` (${t.graduation_year})` : ""}\n- **Keywords**: ${t.keywords?.length ? t.keywords.join(", ") : "None"}\n- **Quality Rating**: ${avgRating}\n- **Accuracy Score**: ${avgAccuracy}\n- **Date**: ${new Date(t.created_at).toLocaleDateString()}\n- **Has PDF**: ${t.file_url ? "Yes (available for download)" : "No"}\n- **Abstract**: ${t.abstract.slice(0, 300)}${t.abstract.length > 300 ? "..." : ""}\n\n`;
        }
      } else {
        databaseContext = "\n\n---\n## DATABASE SEARCH RESULTS\nNo matching theses were found in the HexBiblio database for this query. Let the student know the database is growing and encourage them to check back, or suggest they explore related topics in the database.\n";
      }
    }

    // Combine system prompt with database context, profile, and language instruction
    const langInstruction = language === "fr"
      ? "\n\n## LANGUAGE\nYou MUST respond entirely in French. All headers, explanations, and suggestions must be in French."
      : "";

    let profileContext = "";
    if (profile && (profile.first_name || profile.academic_level || profile.field_of_study || profile.university || profile.country || profile.bio || (profile.research_interests?.length))) {
      profileContext = `\n\n---\n## STUDENT PROFILE\nTailor your guidance, examples, and methodology suggestions to this student's background. Reference their level/field naturally when helpful, but do not over-mention it.\n`;
      if (profile.first_name) profileContext += `- First name: ${profile.first_name}\n`;
      if (profile.academic_level) profileContext += `- Academic level: ${profile.academic_level}\n`;
      if (profile.field_of_study) profileContext += `- Field of study: ${profile.field_of_study}\n`;
      if (profile.university) profileContext += `- University: ${profile.university}\n`;
      if (profile.country) profileContext += `- Country: ${profile.country}\n`;
      if (profile.research_interests?.length) profileContext += `- Research interests: ${profile.research_interests.join(", ")}\n`;
      if (profile.bio) profileContext += `- Bio: ${profile.bio}\n`;
    }

    // Roadmap step labels, matching the QuestId order defined client-side in
    // src/components/ThesisQuests.tsx — kept in sync manually since the edge
    // function can't import client source.
    const ROADMAP_ORDER = ["discipline", "theme", "question", "thesis", "method", "sources"];
    const ROADMAP_LABELS: Record<string, string> = {
      discipline: "Discipline (field of study)",
      theme: "Theme / topic",
      question: "Research question",
      thesis: "Thesis statement / hypothesis",
      method: "Methodology",
      sources: "Sources",
    };

    const doneLabels = (Array.isArray(completedQuests) ? completedQuests : [])
      .filter((id: string) => ROADMAP_LABELS[id])
      .map((id: string) => ROADMAP_LABELS[id]);

    let questContext = `\n\n---\n## QUEST STATUS (roadmap progress)\nRoadmap order: ${ROADMAP_ORDER.map((id) => ROADMAP_LABELS[id]).join(" → ")}.\n`;
    questContext += doneLabels.length ? `Already completed: ${doneLabels.join(", ")}.\n` : "Nothing completed yet.\n";
    questContext += currentQuest && ROADMAP_LABELS[currentQuest]
      ? `Current open step: **${ROADMAP_LABELS[currentQuest]}**. Focus the conversation here — see the "Staying in order" rule above.\n`
      : `All roadmap steps are complete — feel free to go deeper on sources or open follow-up questions.\n`;

    const fullSystemPrompt = SYSTEM_PROMPT + profileContext + questContext + databaseContext + langInstruction;

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Auto-updating alias, not a dated snapshot — "gemini-2.5-flash" got
        // deprecated once already, don't hardcode a dated model string here again.
        model: "gemini-flash-latest",
        messages: [
          { role: "system", content: fullSystemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: msg(language, GENERIC_AI_ERROR_EN, GENERIC_AI_ERROR_FR) }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 503) {
        // Gemini's own infrastructure is temporarily overloaded — transient,
        // not an account/key problem. Worth telling the user it's worth a retry.
        return new Response(
          JSON.stringify({ error: msg(language, GENERIC_AI_ERROR_EN, GENERIC_AI_ERROR_FR) }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("Gemini API error:", response.status, text);
      return new Response(
        JSON.stringify({ error: msg(language, GENERIC_AI_ERROR_EN, GENERIC_AI_ERROR_FR) }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("thesis-chat error:", e);
    return new Response(
      JSON.stringify({ error: msg(language, GENERIC_AI_ERROR_EN, GENERIC_AI_ERROR_FR) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
