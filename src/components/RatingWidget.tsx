import { useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface RatingWidgetProps {
  thesisId: string;
  currentRating?: number;
  avgRating: number;
  totalRatings: number;
  onRated: () => void;
}

const RatingWidget = ({ thesisId, currentRating, avgRating, totalRatings, onRated }: RatingWidgetProps) => {
  const [hovered, setHovered] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleRate = async (score: number) => {
    if (!user) return;
    const { error } = await supabase.from("ratings").upsert(
      { thesis_id: thesisId, user_id: user.id, score },
      { onConflict: "thesis_id,user_id" }
    );
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Rated!" });
      onRated();
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => handleRate(star)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={`h-5 w-5 ${
                star <= (hovered || currentRating || 0)
                  ? "fill-accent text-accent"
                  : "text-muted-foreground/30"
              }`}
            />
          </button>
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        {avgRating > 0 ? `${avgRating.toFixed(1)} (${totalRatings})` : "No ratings yet"}
      </span>
    </div>
  );
};

export default RatingWidget;
