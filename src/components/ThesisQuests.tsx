import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Trophy, Sparkles, Target, BookOpen, FileSearch, Microscope, Library, Lightbulb, Bot, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Progress } from "@/components/ui/progress";

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
};

export const QUESTS: Quest[] = [
  {
    id: "discipline",
    icon: BookOpen,
    label: { en: "Pick a discipline", fr: "Choisir une discipline" },
    hint: { en: "Tell the bot your field of study", fr: "Indiquez votre domaine d'étude" },
  },
  {
    id: "theme",
    icon: Lightbulb,
    label: { en: "Explore a theme", fr: "Explorer un thème" },
    hint: { en: "Narrow down to a specific topic", fr: "Affinez vers un sujet précis" },
  },
  {
    id: "question",
    icon: FileSearch,
    label: { en: "Frame a research question", fr: "Formuler une question de recherche" },
    hint: { en: "A clear, focused question", fr: "Une question claire et ciblée" },
  },
  {
    id: "thesis",
    icon: Target,
    label: { en: "Thesis statement", fr: "Énoncé de thèse" },
    hint: { en: "A defendable position or claim", fr: "Une position défendable" },
  },
  {
    id: "method",
    icon: Microscope,
    label: { en: "Choose a methodology", fr: "Choisir une méthodologie" },
    hint: { en: "Qualitative, quantitative, mixed…", fr: "Qualitative, quantitative, mixte…" },
  },
  {
    id: "sources",
    icon: Library,
    label: { en: "Gather sources", fr: "Rassembler des sources" },
    hint: { en: "Identify key references", fr: "Identifier les références clés" },
  },
];

const KEYWORDS: Record<QuestId, RegExp> = {
  discipline: /\b(discipline|field of study|domaine|champ d['’]étude)\b/i,
  theme: /\b(theme|topic|thématique|sujet)\b/i,
  question: /\b(research question|problématique|question de recherche)\b/i,
  thesis: /\b(thesis statement|thesis:|énoncé de thèse|hypothèse|hypothesis)\b/i,
  method: /\b(methodology|method:|méthodologie|qualitative|quantitative|mixed[- ]methods?)\b/i,
  sources: /\b(sources?|references?|bibliograph(?:y|ie)|littérature|literature review|revue de littérature)\b/i,
};

/** Detect which quests are satisfied by a given assistant message. */
export function detectCompletedQuests(content: string): QuestId[] {
  const out: QuestId[] = [];
  for (const q of QUESTS) {
    if (KEYWORDS[q.id].test(content)) out.push(q.id);
  }
  return out;
}

const storageKey = (uid: string) => `hexbiblio:quests:${uid}`;

export function useQuestProgress() {
  const { user } = useAuth();
  const [completed, setCompleted] = useState<Set<QuestId>>(new Set());

  useEffect(() => {
    if (!user) return;
    try {
      const raw = localStorage.getItem(storageKey(user.id));
      if (raw) setCompleted(new Set(JSON.parse(raw)));
    } catch { /* ignore */ }
  }, [user]);

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

  return { completed, complete, toggle };
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

      <ul className="space-y-2">
        {QUESTS.map((q) => {
          const isDone = completed.has(q.id);
          const isNew = justCompleted === q.id;
          const Icon = q.icon;
          return (
            <li key={q.id}>
              <motion.div
                animate={isNew ? { scale: [1, 1.04, 1] } : {}}
                transition={{ duration: 0.5 }}
                aria-disabled="true"
                title={language === "fr" ? "Validé automatiquement par l'assistant" : "Auto-checked by the assistant"}
                className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left cursor-default select-none ${
                  isDone
                    ? "border-primary/30 bg-primary/5"
                    : "border-border bg-background"
                }`}
              >
                <div
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                    isDone
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30 bg-background"
                  }`}
                >
                  {isDone ? (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </motion.span>
                  ) : (
                    <Lock className="h-2.5 w-2.5 text-muted-foreground/60" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`h-3.5 w-3.5 ${isDone ? "text-primary" : "text-muted-foreground"}`} />
                    <span
                      className={`text-sm font-medium ${
                        isDone ? "text-foreground line-through decoration-primary/40" : "text-foreground"
                      }`}
                    >
                      {q.label[language]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{q.hint[language]}</p>
                </div>
              </motion.div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ThesisQuests;
