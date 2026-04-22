import { createContext, useContext, ReactNode, useState } from "react";
import { useQuestProgress, QuestId } from "@/components/ThesisQuests";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface QuestContextType {
  completed: Set<QuestId>;
  justCompleted: QuestId | null;
  handleQuestProgress: (ids: QuestId[]) => void;
}

const QuestContext = createContext<QuestContextType>({} as QuestContextType);

export const useQuests = () => useContext(QuestContext);

export const QuestProvider = ({ children }: { children: ReactNode }) => {
  const { completed, complete } = useQuestProgress();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [justCompleted, setJustCompleted] = useState<QuestId | null>(null);

  const handleQuestProgress = (ids: QuestId[]) => {
    const added = complete(ids);
    if (added.length > 0) {
      const last = added[added.length - 1];
      setJustCompleted(last);
      toast({
        title: language === "fr" ? "🎉 Quête accomplie !" : "🎉 Quest complete!",
        description:
          language === "fr"
            ? `+${added.length} étape${added.length > 1 ? "s" : ""} validée${added.length > 1 ? "s" : ""}`
            : `+${added.length} step${added.length > 1 ? "s" : ""} unlocked`,
      });
      setTimeout(() => setJustCompleted(null), 1500);
    }
  };

  return (
    <QuestContext.Provider value={{ completed, justCompleted, handleQuestProgress }}>
      {children}
    </QuestContext.Provider>
  );
};
