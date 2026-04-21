import { useState, useRef, useEffect } from "react";
import BotMessage from "@/components/BotMessage";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Send, Bot, User, Loader2, LogIn } from "lucide-react";
import { Link } from "react-router-dom";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/thesis-chat`;
const GUEST_MESSAGE_LIMIT = 1;
const PENDING_CHAT_KEY = "hexbiblio:pendingChat";

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
  embedded?: boolean;
}

const ChatInterface = ({ embedded = false }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { language, t } = useLanguage();
  const { user } = useAuth();

  // Restore a pending guest conversation once (on mount, or right after login).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PENDING_CHAT_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Msg[];
      if (Array.isArray(saved) && saved.length > 0) {
        setMessages(saved);
      }
      // Once the user is logged in, consume the pending chat so it isn't restored again.
      if (user) localStorage.removeItem(PENDING_CHAT_KEY);
    } catch {
      // ignore corrupted storage
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const isGuestLimitReached = !user && userMessageCount >= GUEST_MESSAGE_LIMIT;

  const handleSignInRedirect = () => {
    try {
      localStorage.setItem(PENDING_CHAT_KEY, JSON.stringify(messages));
    } catch {
      // storage may be full or unavailable — proceed without persisting
    }
  };

  useEffect(() => {
    if (messages.length === 0) return;
    const end = messagesEndRef.current;
    if (!end) return;
    // Scroll only the chat's own scroll container — not the whole page.
    const scrollParent = end.closest(".chat-scroll") as HTMLElement | null;
    if (scrollParent) {
      scrollParent.scrollTo({ top: scrollParent.scrollHeight, behavior: "smooth" });
    }
    // In embedded mode we intentionally do NOT scroll the page —
    // the conversation flows inline like ChatGPT/Claude.
  }, [messages]);

  const streamChat = async (allMessages: Msg[]) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: allMessages, language }),
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

  const isEmpty = messages.length === 0;

  // Embedded + empty: render a minimal, Google-like single search bar
  if (embedded && isEmpty) {
    return (
      <div className="w-full">
        <div className="mx-auto max-w-2xl">
          <div className="relative flex items-end gap-2 rounded-full border bg-card/80 backdrop-blur-sm px-2 py-1.5 shadow-sm transition-shadow focus-within:shadow-md">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("chat.placeholder")}
              className="min-h-[44px] max-h-[120px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 px-4 py-2.5"
              rows={1}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="shrink-0 rounded-full h-10 w-10"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render the input area (shared by both modes).
  const renderInputArea = (variant: "embedded" | "full") => {
    if (isGuestLimitReached) {
      return (
        <div className="flex flex-col items-center gap-3 py-2">
          <p className="text-sm text-muted-foreground text-center">
            {language === "fr"
              ? "Connectez-vous pour continuer la conversation et sauvegarder vos échanges."
              : "Sign in to continue chatting and save your conversations."}
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

    if (variant === "embedded") {
      return (
        <>
          <div className="relative flex items-end gap-2 rounded-full border bg-card/90 backdrop-blur-md px-2 py-1.5 shadow-sm transition-shadow focus-within:shadow-md">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("chat.placeholder")}
              className="min-h-[44px] max-h-[120px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 px-4 py-2.5"
              rows={1}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="shrink-0 rounded-full h-10 w-10"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {!user && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              {language === "fr"
                ? `${GUEST_MESSAGE_LIMIT - userMessageCount} message(s) gratuit(s) restant(s)`
                : `${GUEST_MESSAGE_LIMIT - userMessageCount} free message(s) remaining`}
            </p>
          )}
        </>
      );
    }

    return (
      <>
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("chat.placeholder")}
            className="min-h-[44px] max-h-[120px] resize-none"
            rows={1}
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {!user && (
          <p className="mt-1.5 text-center text-xs text-muted-foreground">
            {language === "fr"
              ? `${GUEST_MESSAGE_LIMIT - userMessageCount} message(s) gratuit(s) restant(s)`
              : `${GUEST_MESSAGE_LIMIT - userMessageCount} free message(s) remaining`}
          </p>
        )}
        <p className="mt-1 text-center text-xs text-muted-foreground">
          {t("chat.poweredBy")}
        </p>
      </>
    );
  };

  const renderMessages = () => (
    <>
      {messages.map((msg, i) => (
        <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
          {msg.role === "assistant" && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Bot className="h-4 w-4 text-primary" />
            </div>
          )}
          <div
            className={
              msg.role === "user"
                ? "max-w-[85%] rounded-2xl px-4 py-3 bg-primary text-primary-foreground"
                : embedded
                  ? "max-w-[92%] text-foreground"
                  : "max-w-[92%] rounded-2xl px-4 py-3 bg-card border"
            }
          >
            {msg.role === "assistant" ? (
              <BotMessage content={msg.content} />
            ) : (
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            )}
          </div>
          {msg.role === "user" && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
              <User className="h-4 w-4" />
            </div>
          )}
        </div>
      ))}

      {isLoading && messages[messages.length - 1]?.role === "user" && (
        <div className="flex gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div className="px-1 py-3">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </>
  );

  // EMBEDDED with messages: inline flow, no box, no inner scroll.
  // Input becomes a sticky pill at the bottom of the viewport.
  if (embedded) {
    return (
      <div className="w-full">
        <div className="mx-auto max-w-3xl space-y-6 pb-32">
          {renderMessages()}
        </div>
        <div className="sticky bottom-4 z-20 mt-6">
          <div className="mx-auto max-w-2xl px-4">
            {renderInputArea("embedded")}
          </div>
        </div>
      </div>
    );
  }

  // FULL page mode (e.g. /chat route): keep the bordered, scrollable layout.
  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <div className="chat-scroll flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
          {isEmpty && (
            <div className="flex flex-col items-center justify-center py-8 space-y-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Bot className="h-7 w-7 text-primary" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold">{t("chat.title")}</h2>
                <p className="text-muted-foreground text-sm max-w-md">{t("chat.subtitle")}</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 w-full max-w-xl">
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
            </div>
          )}

          {renderMessages()}
        </div>
      </div>

      <div className="border-t bg-card/80 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-4 py-3">
          {renderInputArea("full")}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;