import { useState } from "react";
import { Star, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

interface RatingWidgetProps {
  thesisId: string;
  currentRating?: number;
  avgRating: number;
  totalRatings: number;
  onRated: () => void;
  currentAccuracy?: number;
  avgAccuracy: number;
  totalAccuracy: number;
  onAccuracyRated: () => void;
}

const StarRow = ({
  label,
  icon: Icon,
  current,
  avg,
  total,
  onRate,
  colorClass,
  noRatingsLabel,
}: {
  label: string;
  icon: React.ElementType;
  current?: number;
  avg: number;
  total: number;
  onRate: (score: number) => void;
  colorClass: string;
  noRatingsLabel: string;
}) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-3">
      <Icon className={`h-4 w-4 ${colorClass}`} />
      <span className="text-xs font-medium w-16">{label}</span>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onRate(star)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={`h-4 w-4 ${
                star <= (hovered || current || 0) ? `fill-current ${colorClass}` : "text-muted-foreground/30"
              }`}
            />
          </button>
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {avg > 0 ? `${avg.toFixed(1)} (${total})` : noRatingsLabel}
      </span>
    </div>
  );
};

const RatingWidget = ({
  thesisId,
  currentRating,
  avgRating,
  totalRatings,
  onRated,
  currentAccuracy,
  avgAccuracy,
  totalAccuracy,
  onAccuracyRated,
}: RatingWidgetProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleRate = async (score: number) => {
    if (!user) return;
    const { error } = await supabase.from("ratings").upsert(
      { thesis_id: thesisId, user_id: user.id, score },
      { onConflict: "thesis_id,user_id" }
    );
    if (error) toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    else { toast({ title: t("rating.rated") }); onRated(); }
  };

  const handleAccuracy = async (score: number) => {
    if (!user) return;
    const { error } = await supabase.from("accuracy_ratings").upsert(
      { thesis_id: thesisId, user_id: user.id, score },
      { onConflict: "thesis_id,user_id" }
    );
    if (error) toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    else { toast({ title: t("rating.accuracyRated") }); onAccuracyRated(); }
  };

  return (
    <div className="space-y-2">
      <StarRow label={t("rating.quality")} icon={Star} current={currentRating} avg={avgRating} total={totalRatings} onRate={handleRate} colorClass="text-accent" noRatingsLabel={t("rating.noRatings")} />
      <StarRow label={t("rating.accuracy")} icon={Target} current={currentAccuracy} avg={avgAccuracy} total={totalAccuracy} onRate={handleAccuracy} colorClass="text-primary" noRatingsLabel={t("rating.noRatings")} />
    </div>
  );
};

export default RatingWidget;
