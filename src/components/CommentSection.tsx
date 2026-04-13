import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Trash2 } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: { username: string | null } | null;
}

const CommentSection = ({ thesisId }: { thesisId: string }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("thesis_id", thesisId)
      .order("created_at", { ascending: false });
    if (!data) return;
    // Fetch profiles for comment authors
    const userIds = [...new Set(data.map(c => c.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, username")
      .in("user_id", userIds);
    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
    setComments(data.map(c => ({ ...c, profiles: profileMap.get(c.user_id) || null })));
  };

  useEffect(() => { fetchComments(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thesisId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("comments").insert({
      thesis_id: thesisId,
      user_id: user.id,
      content: newComment.trim(),
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setNewComment("");
      fetchComments();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("comments").delete().eq("id", id);
    fetchComments();
  };

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-lg font-semibold">
        <MessageSquare className="h-5 w-5" />
        Comments ({comments.length})
      </h3>

      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts..."
          className="min-h-[80px]"
        />
        <Button type="submit" size="sm" disabled={loading || !newComment.trim()}>
          Post Comment
        </Button>
      </form>

      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{comment.profiles?.username || "Anonymous"}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{new Date(comment.created_at).toLocaleDateString()}</span>
              </div>
              {user?.id === comment.user_id && (
                <button onClick={() => handleDelete(comment.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <p className="mt-1 text-sm">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
