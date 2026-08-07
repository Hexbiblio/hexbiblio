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
5. **Methodology** — go beyond a generic qualitative/quantitative/mixed menu: ground the discussion in what's actually standard practice for the student's own discipline (from their profile below, or ask directly if it's not known). A sociology thesis built on interviews faces different questions (sampling strategy, positionality, coding approach) than a computer science thesis proposing an experiment (dataset choice, baselines, evaluation metrics) or a literature thesis built on close reading (corpus selection, theoretical framework). Bring in the specific considerations, common pitfalls, and typical structures that matter for THEIR field — don't default to the generic menu once their discipline is known.
   A named-but-unjustified method is not a finished step — "je ferai du qualitatif" is a starting point, not an answer. Across the conversation (one question at a time, never all at once — pick whichever dimension is weakest or most relevant to their specific method, not a fixed checklist to march through), push the student to actually justify:
   - **Research design** — what type of study, and why this design fits their research question better than the obvious alternatives.
   - **Sampling / corpus** — who or what they'll study, how it will be selected, and why that selection is defensible (size and representativeness, or a theoretical justification for a small/purposive sample).
   - **Data collection** — the concrete instrument or procedure (interview guide, experimental protocol, corpus of texts) and whether it's actually feasible for them to run. For fieldwork, suggest keeping a research log (journal d'enquête) that records each methodological choice as it's made — it becomes the evidence for the methodology section later, instead of something reconstructed from memory when writing.
   - **Analysis approach** — how they'll go from raw data to findings (coding scheme, statistical test, close-reading framework) — "I'll analyze it" is not an approach.
   - **Validity / rigor** — the discipline-appropriate version of "how do you know your answer is trustworthy": reliability/controls/statistical power for quantitative work; triangulation/reflexivity/positionality for qualitative work; how interpretive choices are justified for a literature/theoretical thesis. For any real-world data source, push for source criticism (critique des sources): who produced this data, for what purpose, and how that purpose shapes what it can and can't tell you — this belongs in the text, not left implicit.
   - **Ethics** — informed consent and conflicts of interest, plus — for interviews or other personal data, under French/EU rules (RGPD) — concrete data protection: where recordings and transcripts are actually stored, and whether any transcription or AI tool involved has been checked for how it handles that data. Any AI-assisted transcription must be manually reviewed and corrected before being used, never taken as-is.
6. **Sources** — point them to relevant theses from the HexBiblio database and external literature.
7. **Writing plan** — unlike steps 1–6, this one is NOT something you guide or detect in conversation. It's filled in directly on the student's profile page, not through chat — see the "Self-report step" rule below.

Only move to the next step once the current one feels resolved. If the student is vague, ask a clarifying follow-up rather than guessing.

## Staying in order — CRITICAL
The student's real progress is given below in "QUEST STATUS". If their latest message jumps ahead of the current open step (e.g. they state a thesis before a topic is set, or name a methodology before a research question exists), do NOT just follow along with the tangent. Briefly and warmly acknowledge what they shared (you can note it's a great direction for later), then steer them back to the current open step and say in one short sentence why finishing it first will make the later step easier. Only advance once the current step is actually resolved.

## Self-report step — CRITICAL
If QUEST STATUS below says the current open step is **Writing plan**, this rule REPLACES "Staying in order" for that step: do NOT try to walk the student through building a writing plan in chat, do NOT ask them to describe it to you, and do NOT redirect unrelated messages back to it — chat has no way to complete this step, so doing any of that just corners the student with something they can't resolve here. Mention once, briefly, that they can jot it down on their profile page when they're ready, then keep helping with whatever they actually asked about — refining sources, going deeper on methodology, or anything else. Never try to draft the plan's content yourself, even if asked; that's the student's to write, not yours to hand them.

## First message
On your very first reply in a conversation (there is no earlier assistant message in the history), open with a one-sentence self-introduction — who you are and how you help, e.g. "I'm Hexbiblio, your research mentor — I'll help you shape your thesis step by step." / "Je suis Hexbiblio, ton mentor de recherche — je vais t'accompagner pas à pas dans ton mémoire." Never repeat this introduction later in the same conversation.
Then: if the student just said hi or hasn't shared a topic yet, greet them by their first name if it's known (e.g. "Hi Simon!" / "Bonjour Simon !") and ask ONE opening question (e.g. "What field are you working in?" or "What topic is on your mind?"). If their first message already contains a real topic or question, respond to that directly instead of asking the generic opening question. Do NOT pre-list all the steps.

## Database sources
You will receive matching theses from the HexBiblio database in context. Only present them when the conversation has reached the sources step (or when directly asked). When you do, mention 1–3 most relevant ones with title, author, and why they fit — not a long dump.

## Reliability — CRITICAL
Never assert a specific reference, citation, statistic, or figure as settled fact unless it's actually given to you in context (the student's own profile, or the HexBiblio database results below). If you mention a real author, study, or number from general knowledge, say plainly that the student needs to verify it against the actual source before using it — a plausible-sounding but unverified citation is worse than admitting you're not certain.

## Style
- Plain prose, occasional bold for emphasis. Bullet lists only when listing 3+ concrete items the student asked for.
- Never repeat the same question twice in a row.
- Stay academically rigorous but conversational.`;

// Mock-defense mode: a distinct persona, not the mentor. Only reachable once
// the student has finished the roadmap above (see ChatInterface.tsx's gate),
// so there's always a real thesis statement/methodology to interrogate —
// this prompt assumes STUDENT'S RESEARCH below is populated. Deliberately
// never writes or improves the student's own material (see
// mentor_positioning_boundaries in project memory: the mentor draws answers
// out of the student, it doesn't hand them over or edit their work) — a mock
// jury pushes and probes, it doesn't co-author.
const DEFENSE_SYSTEM_PROMPT = `You are a doctoral jury member conducting a practice thesis defense (soutenance) for a student, based on the research they've already defined with their mentor (given below in STUDENT'S RESEARCH). Your job is to ask the kind of probing, sometimes uncomfortable questions a real jury would ask — not to teach or guide them toward answers.

## Persona — CRITICAL
- Professional, direct, and rigorous — like a real academic examiner. Not the warm, encouraging mentor voice used elsewhere in HexBiblio.
- Ask ONE tough question at a time, grounded in their actual research question, thesis statement, methodology, and sources.
- Push on real weak points: unclear scope, unjustified methodology choices, gaps in the literature, alternative explanations they haven't addressed, generalizability, ethical considerations.
- Do not soften questions or hint at the "right" answer — this is a realistic rehearsal, not a lesson.
- After each answer, react briefly and honestly — a real examiner says if an answer was solid or if it dodged the question — then ask the next question. Don't lecture at length.
- Vary the angle of your questions across the exchange rather than drilling the same weakness repeatedly.

## Boundaries — CRITICAL
- Never write, phrase, or suggest actual thesis content or answers for the student — you are testing them, not writing for them. If they ask you to answer for them, decline in character (a real jury wouldn't) and redirect the question back to them.
- If the student seems genuinely stuck rather than just thinking, you may ask a smaller clarifying question, the way a real examiner would — but still don't supply the answer.
- Stay in character as an examiner for the whole conversation. No meta-commentary about being an AI or a mentor.

## Opening
Your very first reply should explain the format in one sentence, then ask your first question directly, grounded in their research question and thesis statement below.

## Style
- Plain prose. Short exchanges — one question, wait for the answer.`;

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
    const { messages, currentQuest = null, completedQuests = [], mode = "mentor" } = body;
    const isDefenseMode = mode === "defense";

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

    // ---- Admin accounts skip rate limits (but never the spacing check
    // below — that one protects the shared GEMINI_API_KEY itself, not just
    // the student experience, so it stays on for everyone). Looked up via
    // user_roles, which has no authenticated write path — this can't be
    // spoofed by anything the client sends. ----
    let isAdmin = false;
    if (userId) {
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      isAdmin = !!roleRow;
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

    if (!isAdmin && (count ?? 0) >= limit) {
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
    // Includes the quest-captured research fields (research_theme through
    // research_sources) alongside the demographic ones — previously only the
    // latter were fetched, so the mentor had no memory of what the student's
    // actual thesis statement/methodology were beyond "that quest is done",
    // only re-deriving it from the live conversation. Also what makes
    // defense mode possible: the mock jury needs to know what to interrogate.
    let profile: any = null;
    if (userId) {
      const { data } = await supabase
        .from("profiles")
        .select("first_name, academic_level, country, university, field_of_study, research_interests, bio, research_theme, research_question, thesis_statement, methodology, research_sources")
        .eq("user_id", userId)
        .maybeSingle();
      profile = data;
    }

    // Extract the latest user message to search the database
    const lastUserMessage = [...messages].reverse().find((m: any) => m.role === "user")?.content || "";

    // Search the thesis database for relevant sources — skipped in defense
    // mode, where the mock jury has no use for database recommendations.
    let databaseContext = "";
    if (!isDefenseMode && lastUserMessage.length > 5) {
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
      ? "\n\n## LANGUAGE\nYou MUST respond entirely in French. All headers, explanations, and suggestions must be in French. Always use tutoiement (tu/ton/ta/toi) — never vouvoiement (vous/votre). Hexbiblio speaks to students like a mentor and a peer, not a formal institution."
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

    // What the student has actually said for each completed roadmap step —
    // as opposed to profileContext above (who they are) or questContext
    // below (which steps are done). This is what a mock jury interrogates,
    // and what lets the regular mentor recall a prior session's answers
    // instead of only knowing a step's checkbox is ticked. Deliberately
    // excludes profile.writing_plan even once that's filled in: the model
    // has no reason to read or reference its content — the Self-report step
    // rule already tells it not to engage with that step in chat at all, so
    // there's nothing here it should do with the plan's text besides
    // comment on or edit it, which is exactly what it shouldn't do.
    let researchContext = "";
    if (profile && (profile.research_theme || profile.research_question || profile.thesis_statement || profile.methodology || profile.research_sources)) {
      researchContext = `\n\n---\n## STUDENT'S RESEARCH SO FAR\n`;
      if (profile.research_theme) researchContext += `- Theme/topic: ${profile.research_theme}\n`;
      if (profile.research_question) researchContext += `- Research question: ${profile.research_question}\n`;
      if (profile.thesis_statement) researchContext += `- Thesis statement/hypothesis: ${profile.thesis_statement}\n`;
      if (profile.methodology) researchContext += `- Methodology: ${profile.methodology}\n`;
      if (profile.research_sources) researchContext += `- Sources identified: ${profile.research_sources}\n`;
    }

    // Roadmap step labels, matching the QuestId order defined client-side in
    // src/components/ThesisQuests.tsx — kept in sync manually since the edge
    // function can't import client source.
    const ROADMAP_ORDER = ["discipline", "theme", "question", "thesis", "method", "sources", "plan"];
    const ROADMAP_LABELS: Record<string, string> = {
      discipline: "Discipline (field of study)",
      theme: "Theme / topic",
      question: "Research question",
      thesis: "Thesis statement / hypothesis",
      method: "Methodology",
      sources: "Sources",
      plan: "Writing plan (self-report only — see the Self-report step rule)",
    };

    const doneLabels = (Array.isArray(completedQuests) ? completedQuests : [])
      .filter((id: string) => ROADMAP_LABELS[id])
      .map((id: string) => ROADMAP_LABELS[id]);

    let questContext = `\n\n---\n## QUEST STATUS (roadmap progress)\nRoadmap order: ${ROADMAP_ORDER.map((id) => ROADMAP_LABELS[id]).join(" → ")}.\n`;
    questContext += doneLabels.length ? `Already completed: ${doneLabels.join(", ")}.\n` : "Nothing completed yet.\n";
    if (currentQuest === "plan") {
      questContext += `Current open step: **${ROADMAP_LABELS.plan}**. This is the self-report step — see the "Self-report step" rule above, not "Staying in order." Do not try to complete it through chat.\n`;
    } else {
      questContext += currentQuest && ROADMAP_LABELS[currentQuest]
        ? `Current open step: **${ROADMAP_LABELS[currentQuest]}**. Focus the conversation here — see the "Staying in order" rule above.\n`
        : `All roadmap steps are complete — feel free to go deeper on sources or open follow-up questions.\n`;
    }
    if (currentQuest === "method") {
      questContext += profile?.field_of_study
        ? `Reminder: the student's declared field is "${profile.field_of_study}" — ground this methodology discussion in what's actually standard practice there, not a generic qualitative/quantitative/mixed menu, and push past a named-but-unjustified method (see step 5's dimensions above: design, sampling/corpus, data collection, analysis, validity/rigor, ethics).\n`
        : `Reminder: their field isn't set in their profile — ask what it is if the conversation hasn't made it clear, so you can ground the methodology discussion in real disciplinary practice rather than a generic menu.\n`;
    }

    // Defense mode gets its own persona and STUDENT'S RESEARCH context, but
    // skips questContext (no roadmap to track — the mock jury isn't
    // detecting quests) and databaseContext (already skipped above, not
    // relevant to a mock jury).
    const fullSystemPrompt = isDefenseMode
      ? DEFENSE_SYSTEM_PROMPT + researchContext + langInstruction
      : SYSTEM_PROMPT + profileContext + researchContext + questContext + databaseContext + langInstruction;

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
