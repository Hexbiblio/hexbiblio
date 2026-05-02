import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

## First message
If the student just says hi or hasn't shared a topic, greet them briefly and ask ONE opening question (e.g. "What field are you working in?" or "What topic is on your mind?"). Do NOT pre-list all the steps.

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

  try {
    const { messages, language = "en", profile = null } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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
    if (profile && (profile.academic_level || profile.field_of_study || profile.university || profile.country || profile.bio || (profile.research_interests?.length))) {
      profileContext = `\n\n---\n## STUDENT PROFILE\nTailor your guidance, examples, and methodology suggestions to this student's background. Reference their level/field naturally when helpful, but do not over-mention it.\n`;
      if (profile.username) profileContext += `- Name: ${profile.username}\n`;
      if (profile.academic_level) profileContext += `- Academic level: ${profile.academic_level}\n`;
      if (profile.field_of_study) profileContext += `- Field of study: ${profile.field_of_study}\n`;
      if (profile.university) profileContext += `- University: ${profile.university}\n`;
      if (profile.country) profileContext += `- Country: ${profile.country}\n`;
      if (profile.research_interests?.length) profileContext += `- Research interests: ${profile.research_interests.join(", ")}\n`;
      if (profile.bio) profileContext += `- Bio: ${profile.bio}\n`;
    }

    const fullSystemPrompt = SYSTEM_PROMPT + profileContext + databaseContext + langInstruction;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
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
          JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings > Workspace > Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("thesis-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
