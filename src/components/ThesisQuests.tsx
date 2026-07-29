import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Trophy, Sparkles, Target, BookOpen, FileSearch, Microscope, Library, Lightbulb, Bot, HelpCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type QuestId =
  | "discipline"
  | "theme"
  | "question"
  | "thesis"
  | "method"
  | "sources";

type Quest = {
  id: QuestId;
  icon: React.ComponentType<{ className?: string }>;
  label: { en: string; fr: string };
  hint: { en: string; fr: string };
  // Imperative prompt shown as the chat input's placeholder while this is the next open quest.
  placeholder: { en: string; fr: string };
};

export const QUESTS: Quest[] = [
  {
    id: "discipline",
    icon: BookOpen,
    label: { en: "Pick a discipline", fr: "Choisir une discipline" },
    hint: { en: "Tell the bot your field of study", fr: "Indiquez votre domaine d'étude" },
    placeholder: { en: "What's your field of study?", fr: "Quel est votre domaine d'étude ?" },
  },
  {
    id: "theme",
    icon: Lightbulb,
    label: { en: "Explore a theme", fr: "Explorer un thème" },
    hint: { en: "Narrow down to a specific topic", fr: "Affinez vers un sujet précis" },
    placeholder: { en: "What theme would you like to explore?", fr: "Quel thème souhaitez-vous explorer ?" },
  },
  {
    id: "question",
    icon: FileSearch,
    label: { en: "Frame a research question", fr: "Formuler une question de recherche" },
    hint: { en: "A clear, focused question", fr: "Une question claire et ciblée" },
    placeholder: { en: "Frame your research question...", fr: "Formulez votre question de recherche..." },
  },
  {
    id: "thesis",
    icon: Target,
    label: { en: "Thesis statement", fr: "Énoncé de thèse" },
    hint: { en: "A defendable position or claim", fr: "Une position défendable" },
    placeholder: { en: "What's your thesis or position?", fr: "Quelle est votre thèse ou position défendue ?" },
  },
  {
    id: "method",
    icon: Microscope,
    label: { en: "Choose a methodology", fr: "Choisir une méthodologie" },
    hint: { en: "Qualitative, quantitative, mixed…", fr: "Qualitative, quantitative, mixte…" },
    placeholder: { en: "What methodology are you considering?", fr: "Quelle méthodologie envisagez-vous ?" },
  },
  {
    id: "sources",
    icon: Library,
    label: { en: "Gather sources", fr: "Rassembler des sources" },
    hint: { en: "Identify key references", fr: "Identifier les références clés" },
    placeholder: { en: "What sources have you identified?", fr: "Quelles sources avez-vous identifiées ?" },
  },
];

/** The next open quest, in the fixed roadmap order above — or undefined once all are done. */
export function getNextQuest(completed: Set<QuestId>): Quest | undefined {
  return QUESTS.find((q) => !completed.has(q.id));
}

// Profile column each quest's captured value is persisted to.
// "discipline" reuses the profile's existing field_of_study column.
export const QUEST_PROFILE_FIELD: Record<QuestId, string> = {
  discipline: "field_of_study",
  theme: "research_theme",
  question: "research_question",
  thesis: "thesis_statement",
  method: "methodology",
  sources: "research_sources",
};

// Strict cues that must appear in the USER's own message for a quest to count.
// Generic chatter ("hello") must NOT trigger anything.
export const USER_CUES: Record<QuestId, RegExp> = {
  discipline: /\b(sociology|psychology|biology|chemistry|physics|economics|history|philosophy|literature|engineering|computer science|medicine|law|anthropology|linguistics|education|political science|mathematics|sociologie|psychologie|biologie|chimie|physique|économie|histoire|philosophie|littérature|ingénierie|informatique|médecine|droit|anthropologie|linguistique|éducation|sciences? politiques?|mathématiques)\b/i,
  theme: /\b(impact of|effect of|influence of|role of|relationship between|focus on|interested in|my topic|topic is|effet de|influence de|rôle de|relation entre|mon sujet|sujet est|intéress)\b/i,
  question: /\?\s*$|\b(how|why|to what extent|in what ways|comment|pourquoi|dans quelle mesure|en quoi)\b.{5,}\?/i,
  thesis: /\b(i argue|i claim|my hypothesis|my thesis is|i propose that|je soutiens|mon hypothèse|ma thèse est|je propose que)\b/i,
  method: /\b(qualitative|quantitative|mixed[- ]methods?|survey|interview|case study|ethnograph|experiment|questionnaire|enquête|entretien|étude de cas|expérience|méthode mixte)\b/i,
  sources: /\b(literature review|i (have read|found|read) .{0,40}(article|paper|book|thesis)|articles? (by|from) |bibliograph|revue de littérature|j'ai (lu|trouvé) .{0,40}(article|livre|thèse))\b/i,
};

/**
 * Detect whether the user's latest message completes the *next* open quest —
 * only that one, in roadmap order. A message that happens to match a later
 * quest's cue (e.g. a question) doesn't skip ahead of earlier, still-open
 * steps (e.g. discipline, theme): the roadmap only advances one step at a time.
 */
export function detectCompletedQuests(
  userMessage: string,
  completed?: Set<QuestId>
): QuestId[] {
  const text = (userMessage ?? "").trim();
  if (text.length < 15) return [];
  const next = getNextQuest(completed ?? new Set());
  if (next && USER_CUES[next.id].test(text)) return [next.id];
  return [];
}

const MAX_STORED_VALUE_LENGTH = 400;

/**
 * Extract what to remember in the user's profile for a completed quest.
 * For "discipline" this is just the matched keyword (e.g. "sociology");
 * for the others, which are inherently sentence-level, it's the message itself.
 */
export function extractQuestValue(id: QuestId, userMessage: string): string {
  const text = (userMessage ?? "").trim();
  if (id === "discipline") {
    const match = text.match(USER_CUES.discipline);
    if (match) {
      const word = match[0];
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
  }
  return text.length > MAX_STORED_VALUE_LENGTH ? `${text.slice(0, MAX_STORED_VALUE_LENGTH).trim()}…` : text;
}

const storageKey = (uid: string) => `hexbiblio:quests:${uid}`;

export function useQuestProgress() {
  const { user } = useAuth();
  const [completed, setCompleted] = useState<Set<QuestId>>(new Set());
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);

  // Load synchronously during render (not in an effect) the first time we see
  // this user, so `completed` is already correct before any effect — e.g. a
  // sibling replaying a restored guest chat — can call complete() and clobber
  // it with a set that hasn't been loaded from storage yet.
  if (user && user.id !== loadedUserId) {
    setLoadedUserId(user.id);
    let loaded = new Set<QuestId>();
    try {
      const raw = localStorage.getItem(storageKey(user.id));
      if (raw) loaded = new Set(JSON.parse(raw));
    } catch { /* ignore */ }
    setCompleted(loaded);
  }

  const persist = (next: Set<QuestId>) => {
    if (!user) return;
    try {
      localStorage.setItem(storageKey(user.id), JSON.stringify([...next]));
    } catch { /* ignore */ }
  };

  const complete = (ids: QuestId[]) => {
    if (!user || ids.length === 0) return [] as QuestId[];
    let added: QuestId[] = [];
    setCompleted((prev) => {
      const next = new Set(prev);
      for (const id of ids) if (!next.has(id)) { next.add(id); added.push(id); }
      if (added.length) persist(next);
      return next;
    });
    return added;
  };

  const toggle = (id: QuestId) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      persist(next);
      return next;
    });
  };

  const uncomplete = (ids: QuestId[]) => {
    if (!user || ids.length === 0) return;
    setCompleted((prev) => {
      let changed = false;
      const next = new Set(prev);
      for (const id of ids) if (next.delete(id)) changed = true;
      if (changed) persist(next);
      return changed ? next : prev;
    });
  };

  return { completed, complete, toggle, uncomplete };
}

interface Props {
  completed: Set<QuestId>;
  justCompleted?: QuestId | null;
}

const ThesisQuests = ({ completed, justCompleted }: Props) => {
  const { language } = useLanguage();
  const total = QUESTS.length;
  const done = completed.size;
  const pct = useMemo(() => Math.round((done / total) * 100), [done, total]);
  const allDone = done === total;
  const nextQuest = useMemo(() => getNextQuest(completed), [completed]);

  return (
    <div className="rounded-2xl border bg-card/80 backdrop-blur-sm p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Trophy className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">
              {language === "fr" ? "Votre quête de thèse" : "Your thesis quest"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {done}/{total} · {pct}%
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label={language === "fr" ? "Comment fonctionnent les quêtes" : "How quests work"}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 text-sm space-y-2.5">
              <p className="font-semibold">{language === "fr" ? "Comment ça marche ?" : "How does this work?"}</p>
              <p className="text-muted-foreground leading-relaxed">
                {language === "fr"
                  ? "Discutez de votre sujet avec l'assistant. Il repère automatiquement quand vous franchissez une étape clé — choisir une discipline, formuler une question, énoncer une thèse... — et coche la quête correspondante."
                  : "Chat with the assistant about your topic. It automatically detects when you reach a key milestone — picking a discipline, framing a question, stating a thesis... — and checks off the matching quest."}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {language === "fr"
                  ? "Chaque étape validée enregistre ce que vous avez dit dans votre profil, où vous pouvez le modifier à tout moment. Si vous videz un champ, la quête associée se déverrouille pour que l'assistant puisse la redétecter."
                  : "Each completed step saves what you said to your profile, where you can edit it anytime. Clearing a field unlocks the matching quest again so the assistant can re-detect it."}
              </p>
            </PopoverContent>
          </Popover>
          <AnimatePresence>
          {allDone && (
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
            >
              <Sparkles className="h-3 w-3" />
              {language === "fr" ? "Bravo !" : "Complete!"}
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>

      <Progress value={pct} className="mb-3 h-1.5" />

      {/* Bot helper banner — makes it obvious quests are unlocked through chat */}
      <div className="mb-4 flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 p-2.5">
        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15">
          <Bot className="h-3.5 w-3.5 text-primary" />
        </div>
        <p className="text-xs leading-snug text-foreground/80">
          {language === "fr"
            ? "Votre assistant valide chaque étape au fil de la conversation. Discutez avec lui pour cocher les quêtes."
            : "Your assistant unlocks each step as you chat. Talk with the bot to check off quests."}
        </p>
      </div>

      <ol>
        {QUESTS.map((q, i) => {
          const isDone = completed.has(q.id);
          const isCurrent = !isDone && q.id === nextQuest?.id;
          const isNew = justCompleted === q.id;
          const isLast = i === QUESTS.length - 1;
          const Icon = q.icon;
          return (
            <li key={q.id} className="relative flex gap-3">
              <div className="flex flex-col items-center">
                <motion.div
                  animate={isNew ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.5 }}
                  title={language === "fr" ? "Validé automatiquement par l'assistant" : "Auto-checked by the assistant"}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    isDone
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCurrent
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground/40"
                  }`}
                >
                  {isDone ? <Check className="h-4 w-4" strokeWidth={3} /> : <Icon className="h-3.5 w-3.5" />}
                </motion.div>
                {!isLast && (
                  <div className={`w-px flex-1 transition-colors ${isDone ? "bg-primary/40" : "bg-border"}`} />
                )}
              </div>
              <div className={`min-w-0 flex-1 ${isLast ? "pb-0" : "pb-5"}`}>
                <p
                  className={`pt-1.5 text-sm font-medium transition-colors ${
                    isDone
                      ? "text-muted-foreground line-through decoration-primary/40"
                      : isCurrent
                        ? "text-foreground"
                        : "text-muted-foreground"
                  }`}
                >
                  {q.label[language]}
                </p>
                {isCurrent && <p className="mt-0.5 text-xs text-muted-foreground">{q.hint[language]}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default ThesisQuests;
