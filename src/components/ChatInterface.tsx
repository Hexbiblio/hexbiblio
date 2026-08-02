import { useState, useRef, useEffect } from "react";
import BotMessage from "@/components/BotMessage";
import MascotAvatar from "@/components/MascotAvatar";
import OnboardingCard, { OnboardingPatch } from "@/components/OnboardingCard";
import { getNextQuest, QuestId } from "@/components/ThesisQuests";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Send, UserRound, Loader2, LogIn, MessageSquare, Sparkles, Compass } from "lucide-react";
import { Link } from "react-router-dom";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/thesis-chat`;
const GUEST_MESSAGE_LIMIT = 1;
const PENDING_CHAT_KEY = "hexbiblio:pendingChat";
const PENDING_CHAT_TTL_MS = 24 * 60 * 60 * 1000; // discard an abandoned guest draft after 24h

type PendingChat = { messages: Msg[]; savedAt: number };

const SUGGESTED_QUESTIONS = {
  en: [
    "How does social media usage affect academic performance among university students?",
    "What is the impact of artificial intelligence on healthcare diagnostics?",
    "How do microplastics in ocean ecosystems affect marine biodiversity?",
    "What role does emotional intelligence play in leadership effectiveness?",
  ],
  fr: [
    "Comment l'utilisation des réseaux sociaux affecte-t-elle les performances académiques des étudiants ?",
    "Quel est l'impact de l'intelligence artificielle sur le diagnostic médical ?",
    "Comment les microplastiques dans les écosystèmes océaniques affectent-ils la biodiversité marine ?",
    "Quel rôle joue l'intelligence émotionnelle dans l'efficacité du leadership ?",
  ],
};

interface ChatInterfaceProps {
  completed?: Set<QuestId>;
  onUserMessage?: (text: string) => void;
}

const ChatInterface = ({ completed, onUserMessage }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { language, t } = useLanguage();
  const { user, session, isAdmin } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    if (!user) { setProfile(null); setProfileLoaded(false); return; }
    supabase
      .from("profiles")
      .select("first_name, last_name, academic_level, country, university, field_of_study, research_interests, bio")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => { setProfile(data); setProfileLoaded(true); });
  }, [user]);

  // Onboarding is mandatory, not skippable — it keeps showing on every visit
  // until the required fields are filled (last name and interests stay
  // optional, so they're not part of this check), blocking the rest of the
  // chat until then. First name is included because the author-name trigger
  // needs it before a student can ever submit a thesis.
  // Admin accounts skip it entirely — they're not students being onboarded.
  const needsOnboarding =
    !isAdmin &&
    !!user &&
    profileLoaded &&
    !(profile?.first_name && profile?.academic_level && profile?.field_of_study);

  // Keep the guest's in-progress conversation persisted at all times, so it
  // survives navigating to /auth by any path — not just the in-chat prompt
  // (e.g. clicking "Sign in" in the navbar instead).
  useEffect(() => {
    if (user || messages.length === 0) return;
    try {
      const payload: PendingChat = { messages, savedAt: Date.now() };
      localStorage.setItem(PENDING_CHAT_KEY, JSON.stringify(payload));
    } catch {
      // storage may be full or unavailable — proceed without persisting
    }
  }, [messages, user]);

  // Restore a pending guest conversation (on mount, or right after login).
  // Once we know who's logged in, also replay quest detection on it — the
  // messages were sent as a guest, so nothing could be captured yet.
  // Drafts older than PENDING_CHAT_TTL_MS are treated as abandoned and discarded.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PENDING_CHAT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<PendingChat>;
      const isFresh =
        Array.isArray(parsed.messages) &&
        typeof parsed.savedAt === "number" &&
        Date.now() - parsed.savedAt < PENDING_CHAT_TTL_MS;

      if (!isFresh) {
        localStorage.removeItem(PENDING_CHAT_KEY);
        return;
      }

      const saved = parsed.messages as Msg[];
      if (saved.length > 0) {
        setMessages(saved);
        if (user) {
          for (const m of saved) if (m.role === "user") onUserMessage?.(m.content);
        }
      }
      // Once the user is logged in, consume the pending chat so it isn't replayed again.
      if (user) localStorage.removeItem(PENDING_CHAT_KEY);
    } catch {
      // ignore corrupted storage
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const isGuestLimitReached = !user && userMessageCount >= GUEST_MESSAGE_LIMIT;

  useEffect(() => {
    if (messages.length === 0) return;
    const end = messagesEndRef.current;
    if (!end) return;
    // Scroll only the chat's own scroll container — not the whole page.
    const scrollParent = end.closest(".chat-scroll") as HTMLElement | null;
    if (scrollParent) {
      scrollParent.scrollTo({ top: scrollParent.scrollHeight, behavior: "smooth" });
    }
    // We intentionally do NOT scroll the page itself —
    // the conversation flows inline like ChatGPT/Claude.
  }, [messages]);

  const streamChat = async (allMessages: Msg[]) => {
    // Tell the bot where the student actually stands on the roadmap so it can
    // nudge them back in order instead of following a tangent (e.g. a thesis
    // stated before a topic is set).
    const completedSet = completed ?? new Set<QuestId>();
    const currentQuest = getNextQuest(completedSet);

     const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        messages: allMessages,
        language,
        currentQuest: currentQuest?.id ?? null,
        completedQuests: [...completedSet],
      }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "Request failed" }));
      throw new Error(err.error || `Error ${resp.status}`);
    }

    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let assistantContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newlineIdx: number;
      while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, newlineIdx);
        buffer = buffer.slice(newlineIdx + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            assistantContent += content;
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return prev.map((m, i) =>
                  i === prev.length - 1 ? { ...m, content: assistantContent } : m
                );
              }
              return [...prev, { role: "assistant", content: assistantContent }];
            });
          }
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }
  };

  const handleSend = async (text?: string) => {
    const messageText = (text || input).trim();
    if (!messageText || isLoading || isGuestLimitReached) return;

    const userMsg: Msg = { role: "user", content: messageText };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      await streamChat([...messages, userMsg]);
      onUserMessage?.(messageText);
    } catch (e: any) {
      toast({ title: t("common.error"), description: e.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const questions = SUGGESTED_QUESTIONS[language];

  // Once the user has started their quests (but not finished them), point the
  // input at whatever's next instead of the generic placeholder. Guests and
  // brand-new users (nothing completed yet) keep the default invitation.
  const nextQuest = user && completed && completed.size > 0 ? getNextQuest(completed) : undefined;
  const chatPlaceholder = nextQuest ? nextQuest.placeholder[language] : t("chat.placeholder");

  const howItWorks = [
    { icon: MessageSquare, title: t("chat.step1Title"), desc: t("chat.step1Desc") },
    { icon: Sparkles, title: t("chat.step2Title"), desc: t("chat.step2Desc") },
    { icon: Compass, title: t("chat.step3Title"), desc: t("chat.step3Desc") },
  ];

  const isEmpty = messages.length === 0;

  if (isEmpty) {
    // Still resolving whether this logged-in student needs onboarding — avoid
    // flashing the normal chat UI right before replacing it with the card.
    if (user && !profileLoaded) {
      return (
        <div className="flex justify-center py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      );
    }

    // Onboarding is mandatory: nothing else in the chat renders until it's
    // done — no skip, no suggested questions, no input box.
    if (user && needsOnboarding) {
      return (
        <div className="w-full">
          <OnboardingCard
            userId={user.id}
            firstName={profile?.first_name}
            lastName={profile?.last_name}
            onSaved={(patch: OnboardingPatch) => setProfile((prev: any) => ({ ...prev, ...patch }))}
          />
        </div>
      );
    }

    // Empty state: greeting + suggestions for everyone, "how it works" for signed-in users
    // (guests already get an equivalent explanation further down the landing page).
    return (
      <div className="w-full space-y-6">
        {user && (
          <div className="mx-auto max-w-2xl space-y-1.5 text-center">
            <h2 className="text-lg font-semibold">
              {profile?.first_name
                ? (language === "fr" ? `Bonjour ${profile.first_name} 👋` : `Hello ${profile.first_name} 👋`)
                : t("chat.title")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {profile?.field_of_study
                ? (language === "fr"
                    ? `Prêt à explorer ta prochaine question de recherche en ${profile.field_of_study} ?`
                    : `Ready to dig into your next research question in ${profile.field_of_study}?`)
                : t("chat.subtitle")}
            </p>
          </div>
        )}

        <div className="mx-auto max-w-2xl">
          <div className="relative flex items-end gap-2 rounded-full border bg-card/80 backdrop-blur-sm px-2 py-1.5 shadow-sm transition-shadow focus-within:shadow-md">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={chatPlaceholder}
              className="min-h-[44px] max-h-[120px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 px-4 py-2.5"
              rows={1}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="shrink-0 rounded-full h-10 w-10"
              aria-label={language === "fr" ? "Envoyer" : "Send"}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mx-auto grid max-w-xl gap-2 sm:grid-cols-2">
          {questions.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              className="rounded-lg border bg-card p-3 text-left text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              "{q.slice(0, 60)}..."
            </button>
          ))}
        </div>

        {user && (
          <div className="mx-auto grid max-w-xl gap-4 border-t pt-6 sm:grid-cols-3">
            {howItWorks.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center gap-1.5 text-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <p className="text-xs font-semibold">{title}</p>
                <p className="text-[11px] leading-snug text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const renderInputArea = () => {
    if (isGuestLimitReached) {
      return (
        <div className="flex flex-col items-center gap-3 rounded-lg border bg-card/90 backdrop-blur-md px-5 py-4 shadow-sm">
          <p className="text-sm text-foreground text-center max-w-md">
            {language === "fr"
              ? "Connectez-vous pour continuer la conversation. Votre échange sera conservé."
              : "Sign in to keep chatting — your conversation will be saved."}
          </p>
          <Link to="/auth">
            <Button className="gap-2 rounded-full px-6">
              <LogIn className="h-4 w-4" />
              {t("nav.signIn")}
            </Button>
          </Link>
        </div>
      );
    }

    return (
      <div className="relative flex items-end gap-2 rounded-full border bg-card/90 backdrop-blur-md px-2 py-1.5 shadow-sm transition-shadow focus-within:shadow-md">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={chatPlaceholder}
          className="min-h-[44px] max-h-[120px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 px-4 py-2.5"
          rows={1}
        />
        <Button
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading}
          size="icon"
          className="shrink-0 rounded-full h-10 w-10"
          aria-label={language === "fr" ? "Envoyer" : "Send"}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  // With messages: inline flow, no box, no inner scroll.
  // Input becomes a sticky pill at the bottom of the viewport.
  return (
    <div className="w-full">
      <div className="mx-auto max-w-3xl space-y-6 pb-32">
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-2.5 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "assistant" && (
              // Static mascot for now — the user is designing an animated (Clippy-style)
              // version for later, this is the placeholder until that exists.
              <MascotAvatar />
            )}
            <div
              className={
                msg.role === "user"
                  ? "relative max-w-[85%] rounded-2xl rounded-tr-md px-4 py-3 bg-primary text-primary-foreground"
                  : "relative max-w-[85%] rounded-2xl rounded-tl-md bg-muted px-4 py-3 text-foreground"
              }
            >
              {/* Speech-bubble tail, pointing back at the avatar it came from */}
              {msg.role === "assistant" && (
                <span className="absolute -left-1 top-3 h-3 w-3 rotate-45 rounded-[2px] bg-muted" />
              )}
              {msg.role === "assistant" ? (
                <BotMessage content={msg.content} />
              ) : (
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              )}
              {msg.role === "user" && (
                <span className="absolute -right-1 top-3 h-3 w-3 rotate-45 rounded-[2px] bg-primary" />
              )}
            </div>
            {msg.role === "user" && (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary">
                <UserRound className="h-[18px] w-[18px]" />
              </div>
            )}
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex items-start gap-2.5">
            <MascotAvatar />
            <div className="relative rounded-2xl rounded-tl-md bg-muted px-4 py-3">
              <span className="absolute -left-1 top-3 h-3 w-3 rotate-45 rounded-[2px] bg-muted" />
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
      <div className="sticky bottom-4 z-20 mt-6">
        <div className="mx-auto max-w-2xl px-4">
          {renderInputArea()}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
