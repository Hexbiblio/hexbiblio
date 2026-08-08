import { Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { QUESTS, type QuestId } from "@/components/ThesisQuests";

interface QuestBadgeGridProps {
  completed: Set<QuestId>;
}

// The badge collection — one circle per QUESTS entry, reusing that array's
// own icons rather than needing new artwork (the mascot's animated version
// isn't built yet, so there's no custom badge art available). Same filled/
// greyed circle treatment as the sidebar quest widget and the Roadmap page,
// so a "done" badge here looks like the exact same state everywhere else.
const QuestBadgeGrid = ({ completed }: QuestBadgeGridProps) => {
  const { language } = useLanguage();

  return (
    <div className="flex flex-wrap gap-4">
      {QUESTS.map((q) => {
        const isDone = completed.has(q.id);
        const Icon = q.icon;
        return (
          <div key={q.id} className="flex w-16 flex-col items-center gap-1" title={q.label[language]}>
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                isDone
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground/40"
              }`}
            >
              {isDone ? <Check className="h-5 w-5" strokeWidth={3} /> : <Icon className="h-4 w-4" />}
            </div>
            <span className="line-clamp-2 text-center text-[11px] leading-tight text-muted-foreground">
              {q.label[language]}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default QuestBadgeGrid;
