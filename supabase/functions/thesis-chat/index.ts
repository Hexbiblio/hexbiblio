import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are ThesisHub — an expert academic research advisor that helps students develop their thesis AND guides them to relevant sources from our community thesis database.

## Your Core Mission
When a student submits a research question or topic, you MUST:

1. **Identify the Discipline(s)**: Determine which academic field(s) the question belongs to.
2. **Extract Key Themes**: Identify the main research themes, concepts, and keywords.
3. **Assess the Question**: Evaluate specificity, scope, and formulation quality.
4. **Search the Database**: You will be given matching theses from the ThesisHub community database. You MUST present these as recommended sources.
5. **Provide Structured Guidance**.

## Response Format
Always respond with:
- 📚 **Discipline(s)**: The recognized academic field(s)
- 🏷️ **Key Themes**: Main themes and concepts identified
- 📊 **Assessment**: Your evaluation of the research question
- 📖 **Sources from ThesisHub Database**: Present each matching thesis with its title, author, field, and a brief note on how it relates to the student's question. If a thesis has a PDF, mention it's available for download. If no matching theses are found, say so and suggest the student check back later as the database grows.
- 💡 **Suggestions**: How to refine or improve the question
- 📖 **Recommended Methodology**: Suitable research approaches
- 🔍 **Next Steps**: Guide them on what to explore next — both in the database and in external literature

## Conversation Flow
- On the FIRST message, ask for the student's research question if they haven't provided one
- After analyzing, guide them through: refining the question → exploring database sources → literature review strategy → methodology → thesis structure
- When presenting database sources, be specific: mention thesis titles, authors, and explain WHY each source is relevant
- Encourage students to rate and comment on theses they find useful
- If the student's topic doesn't match existing theses well, suggest they explore related disciplines or broader themes in the database

## Style
- Be encouraging but academically rigorous
- Use clear structure with headers and bullet points
- Provide concrete, actionable advice
- When presenting sources, explain the connection to the student's research`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

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
        .select("id, title, author_name, field, abstract, file_url, created_at")
        .or(searchConditions)
        .order("created_at", { ascending: false })
        .limit(10);

      if (theses && theses.length > 0) {
        // Fetch average ratings for matched theses
        const thesisIds = theses.map((t: any) => t.id);
        const { data: ratings } = await supabase
          .from("ratings")
          .select("thesis_id, score")
          .in("thesis_id", thesisIds);

        const ratingMap: Record<string, { total: number; count: number }> = {};
        if (ratings) {
          for (const r of ratings) {
            if (!ratingMap[r.thesis_id]) ratingMap[r.thesis_id] = { total: 0, count: 0 };
            ratingMap[r.thesis_id].total += r.score;
            ratingMap[r.thesis_id].count += 1;
          }
        }

        databaseContext = `\n\n---\n## MATCHING THESES FROM THE THESISHUB DATABASE\nThe following theses from our community database match the student's research question. Present these as recommended sources:\n\n`;
        for (const t of theses) {
          const avg = ratingMap[t.id] ? (ratingMap[t.id].total / ratingMap[t.id].count).toFixed(1) : "No ratings";
          databaseContext += `### "${t.title}"\n- **Author**: ${t.author_name}\n- **Field**: ${t.field}\n- **Rating**: ${avg}\n- **Date**: ${new Date(t.created_at).toLocaleDateString()}\n- **Has PDF**: ${t.file_url ? "Yes (available for download)" : "No"}\n- **Abstract**: ${t.abstract.slice(0, 300)}${t.abstract.length > 300 ? "..." : ""}\n\n`;
        }
      } else {
        databaseContext = "\n\n---\n## DATABASE SEARCH RESULTS\nNo matching theses were found in the ThesisHub database for this query. Let the student know the database is growing and encourage them to check back, or suggest they explore related topics in the database.\n";
      }
    }

    // Combine system prompt with database context
    const fullSystemPrompt = SYSTEM_PROMPT + databaseContext;

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
