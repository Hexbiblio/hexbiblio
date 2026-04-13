import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar } from "lucide-react";
import BookmarkButton from "./BookmarkButton";

interface ThesisCardProps {
  id: string;
  title: string;
  author_name: string;
  field: string;
  abstract: string;
  created_at: string;
  avgRating?: number;
}

const ThesisCard = ({ id, title, author_name, field, abstract, created_at, avgRating }: ThesisCardProps) => {
  return (
    <Card className="group relative transition-shadow hover:shadow-lg">
      <div className="absolute right-3 top-3 z-10">
        <BookmarkButton thesisId={id} />
      </div>
      <Link to={`/database/${id}`}>
        <CardHeader className="pb-2">
          <Badge variant="secondary" className="w-fit text-xs">{field}</Badge>
          <CardTitle className="line-clamp-2 text-lg leading-snug group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{author_name}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="line-clamp-3 text-sm text-muted-foreground">{abstract}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(created_at).toLocaleDateString()}
            </span>
            {avgRating !== undefined && avgRating > 0 && (
              <span className="flex items-center gap-1 text-accent">
                <Star className="h-3 w-3 fill-current" />
                {avgRating.toFixed(1)}
              </span>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default ThesisCard;
