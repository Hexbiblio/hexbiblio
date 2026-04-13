import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, Target, GraduationCap } from "lucide-react";
import BookmarkButton from "./BookmarkButton";

interface ThesisCardProps {
  id: string;
  title: string;
  author_name: string;
  field: string;
  abstract: string;
  created_at: string;
  avgRating?: number;
  avgAccuracy?: number;
  degree_type?: string | null;
  graduation_year?: number | null;
  keywords?: string[] | null;
}

const ThesisCard = ({ id, title, author_name, field, abstract, created_at, avgRating, avgAccuracy, degree_type, graduation_year, keywords }: ThesisCardProps) => {
  return (
    <Card className="group relative transition-shadow hover:shadow-lg">
      <div className="absolute right-3 top-3 z-10">
        <BookmarkButton thesisId={id} />
      </div>
      <Link to={`/database/${id}`}>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="text-xs">{field}</Badge>
            {degree_type && <Badge variant="outline" className="text-xs">{degree_type}</Badge>}
            {graduation_year && <Badge variant="outline" className="text-xs">{graduation_year}</Badge>}
          </div>
          <CardTitle className="line-clamp-2 text-lg leading-snug group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{author_name}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="line-clamp-3 text-sm text-muted-foreground">{abstract}</p>
          {keywords && keywords.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {keywords.slice(0, 4).map((kw) => (
                <span key={kw} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{kw}</span>
              ))}
              {keywords.length > 4 && <span className="text-[10px] text-muted-foreground">+{keywords.length - 4}</span>}
            </div>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(created_at).toLocaleDateString()}
            </span>
            <div className="flex items-center gap-2">
              {avgAccuracy !== undefined && avgAccuracy > 0 && (
                <span className="flex items-center gap-0.5 text-primary" title="Accuracy">
                  <Target className="h-3 w-3" />
                  {avgAccuracy.toFixed(1)}
                </span>
              )}
              {avgRating !== undefined && avgRating > 0 && (
                <span className="flex items-center gap-0.5 text-accent" title="Quality">
                  <Star className="h-3 w-3 fill-current" />
                  {avgRating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default ThesisCard;
