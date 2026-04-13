import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are ThesisHub — an expert academic research advisor specializing in helping students develop their thesis.

## Your Core Mission
When a student submits a research question or topic, you MUST:

1. **Identify the Discipline(s)**: Determine which academic field(s) the question belongs to (e.g., Computer Science, Psychology, Sociology, Law, Economics, Biology, etc.). If it's interdisciplinary, list all relevant fields.

2. **Extract Key Themes**: Identify the main research themes, concepts, and keywords embedded in the question (e.g., "machine learning", "social inequality", "climate adaptation", "constitutional rights").

3. **Assess the Question**: Evaluate whether the research question is:
   - Specific enough to be researchable
   - Too broad or too narrow
   - Well-formulated with clear variables/concepts

4. **Provide Structured Guidance**: Always respond with:
   - 📚 **Discipline(s)**: The recognized academic field(s)
   - 🏷️ **Key Themes**: The main themes and concepts identified
   - 📊 **Assessment**: Your evaluation of the research question's quality
   - 💡 **Suggestions**: How to refine, narrow, or improve the question
   - 📖 **Recommended Methodology**: What research approaches would suit this question
   - 🔍 **Related Literature Areas**: Where to start the literature review

## Conversation Flow
- On the FIRST message, always ask for the student's research question if they haven't provided one
- After analyzing the question, guide them through: refining the question → literature review strategy → methodology selection → thesis structure
- Adapt your language to the identified discipline's conventions
- Reference relevant theoretical frameworks when appropriate
- Suggest specific databases and journals relevant to their field

## Style
- Be encouraging but academically rigorous
- Use clear structure with headers and bullet points
- Provide concrete, actionable advice — not vague platitudes
- When the discipline is clear, use that field's terminology appropriately`;

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
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
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
