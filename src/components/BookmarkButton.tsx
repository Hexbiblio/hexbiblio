import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

const BookmarkButton = ({ thesisId }: { thesisId: string }) => {
  const [bookmarked, setBookmarked] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (!user) return;
    supabase
      .from("bookmarks")
      .select("id")
      .eq("user_id", user.id)
      .eq("thesis_id", thesisId)
      .maybeSingle()
      .then(({ data }) => setBookmarked(!!data));
  }, [user, thesisId]);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    if (bookmarked) {
      await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("thesis_id", thesisId);
      setBookmarked(false);
      toast({ title: t("bookmark.removed") });
    } else {
      await supabase.from("bookmarks").insert({ user_id: user.id, thesis_id: thesisId });
      setBookmarked(true);
      toast({ title: t("bookmark.added") });
    }
  };

  if (!user) return null;

  return (
    <button onClick={toggle} className="rounded-full p-1.5 hover:bg-muted transition-colors">
      <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-primary text-primary" : "text-muted-foreground"}`} />
    </button>
  );
};

export default BookmarkButton;
