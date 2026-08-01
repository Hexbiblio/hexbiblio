import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { fieldLabel } from "@/i18n/fields";
import { Link2 } from "lucide-react";

// Matches get_related_theses' RETURNS TABLE (20260801130000 migration).
interface RelatedThesis {
  thesis_id: string;
  title: string;
  author_name: string;
  field: string;
  degree_type: string | null;
  shared_sources: number;
}

const RELATED_LIMIT = 5;
// A single shared reference is often just a common intro textbook, not a
// real sign of related work — two is the floor for "these theses actually
// draw on the same literature."
const MIN_SHARED = 2;

interface RelatedThesesProps {
  thesisId: string;
}

const RelatedTheses = ({ thesisId }: RelatedThesesProps) => {
  const [related, setRelated] = useState<RelatedThesis[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

  useEffect(() => {
    const fetchRelated = async () => {
      setLoading(true);
      const { data, error } = await (supabase.rpc as any)("get_related_theses", {
        _thesis_id: thesisId,
        _limit: RELATED_LIMIT,
        _min_shared: MIN_SHARED,
      });
      if (error) console.error("get_related_theses failed:", error);
      setRelated((data as RelatedThesis[]) || []);
      setLoading(false);
    };
    fetchRelated();
  }, [thesisId]);

  // Most theses won't have any overlap yet on a young corpus — stay silent
  // rather than showing an empty-state message on every single detail page.
  if (loading || related.length === 0) return null;

  const sharedLabel = (n: number) =>
    language === "fr"
      ? `${n} source${n > 1 ? "s" : ""} en commun`
      : `${n} shared source${n > 1 ? "s" : ""}`;

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold">{t("detail.relatedTheses")}</h2>
      <p className="mb-3 text-sm text-muted-foreground">{t("detail.relatedThesesHint")}</p>
      <div className="space-y-2">
        {related.map((r) => (
          <Link
            key={r.thesis_id}
            to={`/database/${r.thesis_id}`}
            className="block rounded-lg border p-3 transition-colors hover:bg-muted/50"
          >
            <p className="text-sm font-medium leading-snug">{r.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {r.author_name} · {fieldLabel(r.field, language)}
            </p>
            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              <Link2 className="h-3 w-3" />
              {sharedLabel(r.shared_sources)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedTheses;
