import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { fieldLabel } from "@/i18n/fields";
import { Quote } from "lucide-react";

// Matches get_field_essentials' RETURNS TABLE (see the 20260801120000 migration).
interface Essential {
  title: string;
  authors: string | null;
  year: number | null;
  thesis_count: number;
  sample_citation: string;
}

const ESSENTIALS_LIMIT = 12;
// A work cited by a single thesis isn't an "essential", it's just a source —
// /sources already lists those. Two distinct theses is the floor for claiming
// anything is foundational.
const MIN_THESES = 2;

interface FieldEssentialsProps {
  field: string;
  onExplore: (title: string) => void;
}

const FieldEssentials = ({ field, onExplore }: FieldEssentialsProps) => {
  const [essentials, setEssentials] = useState<Essential[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

  useEffect(() => {
    const fetchEssentials = async () => {
      setLoading(true);
      // Aggregation happens in Postgres — the alternative would be pulling every
      // source row into the browser to count them there.
      const { data, error } = await supabase.rpc("get_field_essentials", {
        _field: field === "All Fields" ? null : field,
        _limit: ESSENTIALS_LIMIT,
        _min_theses: MIN_THESES,
      });
      if (error) console.error("get_field_essentials failed:", error);
      setEssentials((data as Essential[]) || []);
      setLoading(false);
    };
    fetchEssentials();
  }, [field]);

  const citedIn = (count: number) =>
    language === "fr"
      ? `Cité dans ${count} mémoire${count > 1 ? "s" : ""}`
      : `Cited in ${count} thesis${count > 1 ? "es" : ""}`;

  // Two separate sentences rather than one template with the scope slotted in:
  // "en {domaine}" reads correctly for a real field ("en Sociologie") but is
  // ungrammatical for the catch-all ("en tous les domaines").
  const intro =
    field === "All Fields"
      ? t("sources.essentialsIntroAll")
      : language === "fr"
        ? `Les travaux les plus cités par les mémoires en ${fieldLabel(field, language)}.`
        : `The works most cited by theses in ${fieldLabel(field, language)}.`;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (essentials.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <p className="text-lg">{t("sources.noEssentials")}</p>
        <p className="text-sm mx-auto mt-1 max-w-md">{t("sources.noEssentialsHint")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{intro}</p>

      <ol className="divide-y rounded-lg border">
        {essentials.map((item, i) => (
          <li key={`${item.title}-${i}`} className="flex gap-4 p-4">
            {/* The rank is real information here — this list is ordered by how
                many students cited each work, so the number carries meaning. */}
            <span className="w-6 shrink-0 pt-0.5 text-sm font-semibold tabular-nums text-muted-foreground">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium leading-snug">{item.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {[item.authors, item.year].filter(Boolean).join(" · ") || "—"}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  <Quote className="h-3 w-3" />
                  {citedIn(Number(item.thesis_count))}
                </span>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() => onExplore(item.title)}
                >
                  {t("sources.seeCitations")}
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default FieldEssentials;
