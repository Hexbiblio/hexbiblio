---
name: thesis-chat-testing-safety
description: Enforces safe spacing when testing, debugging, or verifying the HexBiblio chatbot (the thesis-chat Supabase Edge Function) — whether through curl, the browser, or scripted calls. Use this BEFORE sending any live test message to thesis-chat, and especially when the user reports the chatbot is broken, asks you to "retente"/retest/verify the chat, or you're diagnosing a chat-related bug. Do NOT trigger for ordinary frontend/UI testing that never calls the live AI endpoint (button clicks, layout, navigation, non-chat features).
---

# Testing the HexBiblio chatbot safely

## Why this exists

On 2026-07-29, a burst of rapid automated test requests against the live `thesis-chat` function — sent back-to-back while debugging — got the Google Cloud project behind the `GEMINI_API_KEY` **permanently denied access** by Google (`403 PERMISSION_DENIED: Your project has been denied access. Please contact support.`). It wasn't a quota or billing issue — Google's abuse detection flagged the traffic pattern itself. Recovering required generating a brand new API key from a different Google account and updating the Supabase secret. A prior Google Cloud account was burned this way.

The lesson isn't "don't test the chatbot" — it's "test it like a human would," since that's exactly what Google's abuse detection is trying to distinguish.

## The rule

**Never send two live test messages to `thesis-chat` less than ~3-5 seconds apart.** This applies regardless of how you're calling it:
- `curl` against the deployed function URL
- Browser automation (typing into the chat input and clicking send repeatedly)
- Any test script or loop

A human reading a reply and typing a follow-up never sends messages back-to-back — bursts are exactly the signature that trips bot/abuse detection.

## How to apply it in practice

- **Prefer one well-chosen test call over several.** Before testing, think about what you actually need to verify, and try to confirm it in a single request rather than iterating live against the real endpoint.
- **If you must send more than one**, add a real delay between them — e.g. `sleep 5` between `curl` calls, or pause between browser-driven sends. Don't fire them in a tight loop or in parallel.
- **Don't test against the server-side cooldown to prove it works** by hammering it repeatedly — one or two spaced-out calls is enough to confirm the app-level rate limiting behaves as expected (see `supabase/functions/thesis-chat/index.ts`, which now rejects a message from the same identifier within 3 seconds of the last one — this is a safety net for real users, not a green light to stress-test it).
- **If you're debugging a suspected chatbot outage**, resist the instinct to retry rapidly "just to be sure." Check the Supabase function logs (Dashboard → Edge Functions → `thesis-chat` → Logs) for the actual error before sending another live request — the answer is often already there.
- **This applies to any live third-party AI API in this project**, not just Gemini specifically — the same abuse-detection dynamics apply to most providers.

## If the chatbot does get blocked again

The prior incident's diagnosis path (kept here since it worked and is likely to recur if this rule is ever ignored):
1. Check Supabase function logs for the exact Gemini error text.
2. `403 PERMISSION_DENIED: "Your project has been denied access"` → the Google Cloud account behind the key is blocked, not just the project. A new project under the *same* account will fail identically — you need a genuinely different Google account.
3. Generate a new key at https://aistudio.google.com/apikey under a fresh account, update the `GEMINI_API_KEY` secret in Supabase, and — per this skill — verify it works with a single spaced-out test call, not a burst.
