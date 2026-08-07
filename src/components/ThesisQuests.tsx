import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Trophy, Sparkles, Target, BookOpen, FileSearch, Microscope, Library, Lightbulb, Bot, HelpCircle, NotebookPen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";

export type QuestId =
  | "discipline"
  | "theme"
  | "question"
  | "thesis"
  | "method"
  | "sources"
  | "plan";

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
  {
    // Pilot: the first step past "sources" (see competitive-analysis
    // artifact, piste 1). Deliberately self-report, not chat-detected — see
    // USER_CUES below, which has no entry for this id on purpose. A writing
    // plan takes shape over days, not one exchange, so there's no single
    // message a regex could reliably treat as "done."
    id: "plan",
    icon: NotebookPen,
    label: { en: "Draft a writing plan", fr: "Esquisser un plan de rédaction" },
    hint: { en: "Fill this in on your profile, not here", fr: "À remplir dans ton profil, pas ici" },
    placeholder: { en: "Keep chatting, or add your plan from your profile", fr: "Continue la discussion, ou ajoute ton plan depuis ton profil" },
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
  plan: "writing_plan",
};

// JS's `\b` only treats ASCII letters/digits/underscore as "word" characters,
// so it silently fails to find a boundary right before a term that STARTS
// with an accented letter — e.g. `\béconomie\b` matches "l'économie" fine
// (the accent is mid-word) but `\béconomie\b` never matches when "économie"
// itself is spelled with the accent on the very first letter, since neither
// side of that boundary position is a `\w` character. This silently broke
// the "discipline" cue for économie/éducation from day one. These two
// fragments are a Unicode-aware drop-in replacement for `\b` wherever a
// cue's word list includes an accented-first term.
const WORD_START = "(?<![\\p{L}\\p{N}_])";
const WORD_END = "(?![\\p{L}\\p{N}_])";
function wordsCue(words: string[]): RegExp {
  return new RegExp(`${WORD_START}(?:${words.join("|")})${WORD_END}`, "iu");
}

// Strict cues that must appear in the USER's own message for a quest to count.
// Generic chatter ("hello") must NOT trigger anything. Deliberately NOT
// exhaustive over QuestId — "plan" has no entry, since it's self-report only
// (filled in on Profile.tsx). detectCompletedQuests below reads this with
// optional chaining for exactly that reason: a missing entry means "this
// quest can't be completed through chat," not a bug.
export const USER_CUES: Partial<Record<QuestId, RegExp>> = {
  discipline: wordsCue([
    "sociology", "psychology", "biology", "chemistry", "physics", "economics", "history", "philosophy",
    "literature", "engineering", "computer science", "medicine", "law", "anthropology", "linguistics",
    "education", "political science", "mathematics",
    "sociologie", "psychologie", "biologie", "chimie", "physique", "économie", "histoire", "philosophie",
    "littérature", "ingénierie", "informatique", "médecine", "droit", "anthropologie", "linguistique",
    "éducation", "sciences? politiques?", "mathématiques",
  ]),
  theme: /\b(impact of|effect of|influence of|role of|relationship between|focus on|interested in|my topic|topic is|effet de|influence de|rôle de|relation entre|mon sujet|sujet est|intéress)\b/i,
  question: /\?\s*$|\b(how|why|to what extent|in what ways|comment|pourquoi|dans quelle mesure|en quoi)\b.{5,}\?/i,
  thesis: /\b(i argue|i claim|my hypothesis|my thesis is|i propose that|je soutiens|mon hypothèse|ma thèse est|je propose que)\b/i,
  // Naming a method used to be enough on its own ("je ferai du qualitatif")
  // — but the mentor prompt now pushes for justification, and the quest
  // shouldn't tick before the student actually gives one. This requires
  // EITHER a method name plus a justification connector in the same message
  // ("des entretiens... parce que...") OR a depth-specific term on its own
  // (échantillon, corpus, biais, validité...) — the latter covers a student
  // answering a follow-up about sampling/rigor in a later message without
  // re-naming the method they already stated earlier. Also fixes the same
  // \b-vs-accent bug as WORD_START/END above ("étude de cas" never matched)
  // and a second bug where "entretien"/"ethnograph" only matched the bare
  // singular/stem, never the natural plural or French inflections.
  method: new RegExp(
    `(?:(?=[\\s\\S]*${WORD_START}(?:qualitative|quantitative|mixed[- ]methods?|surveys?|interviews?|entretiens?|case study|ethnograph\\w*|experiments?|questionnaires?|enquêtes?|étude de cas|expérience|méthode mixte)${WORD_END})` +
      `(?=[\\s\\S]*${WORD_START}(?:parce que|car|puisque|afin de|afin d.|dans le but|étant donné|de façon à|because|since|in order to|so that|given that)${WORD_END}))` +
      `|${WORD_START}(?:échantillon|corpus|critères|biais|validité|fiabilité|triangulation|positionnalité|consentement|rgpd|protocole de recherche|journal d.enquête)${WORD_END}`,
    "iu"
  ),
  // "bibliograph" alone never matched the French "bibliographie" — the
  // shared trailing \b needs a boundary right after wherever the alternative
  // ends, and "bibliograph" is followed by "ie" (still a word char), not a
  // boundary. Spelling out the actual word forms fixes that. Also covers a
  // student directly telling the bot their sources are done ("valide mes
  // sources", "voici mes sources") — a real, common phrasing the original
  // narration-only cues ("j'ai lu...") never accounted for.
  sources: /\b(literature review|i (have read|found|read) .{0,40}(article|paper|book|thesis)|articles? (by|from) |bibliographi(e|es|que|ques)|bibliography|bibliographies|revue de littérature|j'ai (lu|trouvé) .{0,40}(article|livre|thèse)|valid\w* .{0,20}sources|voici (mes|toutes mes) sources|mes sources (sont prêtes|sont complètes|sont validées))\b/i,
};

// Quests reachable through chat detection — i.e. every id with a USER_CUES
// entry. Used to gate features that mean "the core roadmap is done" (like
// ChatInterface.tsx's mock-defense CTA) on something narrower than "every
// QuestId is complete," since a self-report-only quest like "plan" can sit
// open indefinitely without that meaning the core roadmap isn't finished.
export const CHAT_QUEST_IDS: QuestId[] = QUESTS.filter((q) => USER_CUES[q.id]).map((q) => q.id);

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
  if (!next) return [];
  if (USER_CUES[next.id]?.test(text)) return [next.id];
  // A pasted bibliography reads as a reference list, not a narrated sentence
  // ("j'ai lu l'article de..."), so the phrase-based cue above won't match
  // it. Three or more "(YYYY)"-shaped years is a strong, language- and
  // format-independent signal that the message is a list of citations.
  if (next.id === "sources" && (text.match(/\(\d{4}\)/g)?.length ?? 0) >= 3) {
    return [next.id];
  }
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

// Every quest maps to a profile column (QUEST_PROFILE_FIELD above) that's
// already written there the moment the quest completes — so "is this quest
// done" is just "is that column non-empty." Deriving completion from the
// profile itself, instead of a separately-synced flag, is what makes
// progress follow the student across devices/browsers: the value was always
// server-side, only the completion checkmark used to live in localStorage.
export const deriveCompleted = (profile: Record<string, unknown> | null): Set<QuestId> => {
  const next = new Set<QuestId>();
  if (!profile) return next;
  for (const id of Object.keys(QUEST_PROFILE_FIELD) as QuestId[]) {
    if (profile[QUEST_PROFILE_FIELD[id]]) next.add(id);
  }
  return next;
};

const QUEST_FIELDS_SELECT = Object.values(QUEST_PROFILE_FIELD).join(", ");

export function useQuestProgress() {
  const { user } = useAuth();
  const [completed, setCompleted] = useState<Set<QuestId>>(new Set());

  const refetch = async () => {
    if (!user) {
      setCompleted(new Set());
      return;
    }
    const { data } = await supabase.from("profiles").select(QUEST_FIELDS_SELECT).eq("user_id", user.id).maybeSingle();
    setCompleted(deriveCompleted(data as Record<string, unknown> | null));
  };

  useEffect(() => { refetch(); }, [user?.id]);

  // Optimistic local update so the UI checks off a quest the instant it's
  // detected in chat, without waiting on the round trip that writes the
  // actual value (and thus the real source of truth) to the profile — the
  // caller is expected to roll this back via uncomplete() if that write
  // fails, and to call refetch() once it succeeds to stay honest.
  const complete = (ids: QuestId[]) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      for (const id of ids) next.add(id);
      return next;
    });
  };

  const uncomplete = (ids: QuestId[]) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      for (const id of ids) next.delete(id);
      return next;
    });
  };

  return { completed, complete, uncomplete, refetch };
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
    <div className="rounded-lg border bg-card/80 backdrop-blur-sm p-5 shadow-sm">
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
              className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary-text"
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
      <div className="mb-4 flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-2.5">
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
