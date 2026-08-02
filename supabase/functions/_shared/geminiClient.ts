// Shared Gemini caller with a transient-error retry — extracted out of
// extractSources.ts once a second call site (languageDetection.ts) needed
// the same retry behavior, to avoid the retry loop existing twice. Gemini
// occasionally returns a 503 ("high demand") unrelated to this project's own
// usage (seen live on a theses.fr import); anything else (auth, bad
// request) fails immediately since retrying won't help.
const GEMINI_MAX_ATTEMPTS = 3;
const GEMINI_RETRY_DELAY_MS = 2000; // fixed, short — callers are batch jobs humans re-run anyway, not worth real backoff logic

export async function callGemini(prompt: string, geminiApiKey: string, contextLabel: string): Promise<string> {
  let response: Response | null = null;
  for (let attempt = 1; attempt <= GEMINI_MAX_ATTEMPTS; attempt++) {
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${geminiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-flash-latest",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        stream: false,
      }),
    });
    if (res.ok || res.status !== 503 || attempt === GEMINI_MAX_ATTEMPTS) {
      response = res;
      break;
    }
    console.log(`callGemini (${contextLabel}): Gemini 503, retrying (attempt ${attempt}/${GEMINI_MAX_ATTEMPTS})`);
    await new Promise((resolve) => setTimeout(resolve, GEMINI_RETRY_DELAY_MS));
  }

  if (!response!.ok) {
    const text = await response!.text();
    throw new Error(`Gemini error ${response!.status} (${contextLabel}): ${text}`);
  }

  const data = await response!.json();
  return data?.choices?.[0]?.message?.content ?? "";
}
