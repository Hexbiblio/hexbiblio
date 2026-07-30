import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { fieldLabel, degreeLabel } from "@/i18n/fields";

interface SourceThesisRef {
  id: string;
  title: string;
  field: string;
  degree_type?: string | null;
}

interface SourceCardProps {
  raw_citation: string;
  title?: string | null;
  authors?: string | null;
  year?: number | null;
  theses?: SourceThesisRef | null;
}

const SourceCard = ({ raw_citation, title, authors, year, theses }: SourceCardProps) => {
  const { language, t } = useLanguage();
  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader className="pb-2">
        {theses && (
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="text-xs">{fieldLabel(theses.field, language)}</Badge>
            {theses.degree_type && <Badge variant="outline" className="text-xs">{degreeLabel(theses.degree_type, language)}</Badge>}
          </div>
        )}
        <CardTitle className="line-clamp-2 text-base leading-snug">
          {title || raw_citation}
        </CardTitle>
        {(authors || year) && (
          <p className="text-sm text-muted-foreground">
            {[authors, year].filter(Boolean).join(" — ")}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {title && <p className="line-clamp-3 text-sm text-muted-foreground">{raw_citation}</p>}
        {theses && (
          <Link
            to={`/database/${theses.id}`}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <BookOpen className="h-3 w-3 shrink-0" />
            <span className="truncate">{t("sources.fromThesis")}: {theses.title}</span>
          </Link>
        )}
      </CardContent>
    </Card>
  );
};

export default SourceCard;
