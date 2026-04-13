import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import RatingWidget from "@/components/RatingWidget";
import CommentSection from "@/components/CommentSection";
import BookmarkButton from "@/components/BookmarkButton";
import { ArrowLeft, Download, Calendar, User } from "lucide-react";

const ThesisDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [thesis, setThesis] = useState<any>(null);
  const [userRating, setUserRating] = useState<number | undefined>();
  const [avgRating, setAvgRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchThesis = async () => {
    if (!id) return;
    const { data } = await supabase.from("theses").select("*").eq("id", id).single();
    setThesis(data);
    setLoading(false);
  };

  const fetchRatings = async () => {
    if (!id) return;
    const { data } = await supabase.from("ratings").select("*").eq("thesis_id", id);
    if (data) {
      setTotalRatings(data.length);
      setAvgRating(data.length ? data.reduce((s, r) => s + r.score, 0) / data.length : 0);
      if (user) {
        const mine = data.find((r) => r.user_id === user.id);
        setUserRating(mine?.score);
      }
    }
  };

  useEffect(() => {
    fetchThesis();
    fetchRatings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!thesis) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-lg text-muted-foreground">Thesis not found</p>
        <Link to="/database"><Button variant="outline" className="mt-4">Back to Database</Button></Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link to="/database" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Database
      </Link>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Badge variant="secondary">{thesis.field}</Badge>
              <h1 className="text-2xl font-bold leading-tight">{thesis.title}</h1>
            </div>
            <BookmarkButton thesisId={thesis.id} />
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><User className="h-4 w-4" />{thesis.author_name}</span>
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(thesis.created_at).toLocaleDateString()}</span>
          </div>

          <RatingWidget thesisId={thesis.id} currentRating={userRating} avgRating={avgRating} totalRatings={totalRatings} onRated={fetchRatings} />

          <div>
            <h2 className="mb-2 text-lg font-semibold">Abstract</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{thesis.abstract}</p>
          </div>

          {thesis.file_url && (
            <a href={thesis.file_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" /> Download PDF
              </Button>
            </a>
          )}

          <hr className="border-border" />

          <CommentSection thesisId={thesis.id} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ThesisDetail;
