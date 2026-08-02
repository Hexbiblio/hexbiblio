import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ThesisCard from "@/components/ThesisCard";
import PageControls from "@/components/PageControls";
import { Search } from "lucide-react";
import { FIELDS, DEGREE_TYPES } from "@/i18n/fields";
import { buildIlikeOrFilter } from "@/lib/searchFilter";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

// 24 divides evenly by both the 2- and 3-column grid breakpoints below, so a
// full page never ends on a half-empty row.
const PAGE_SIZE = 24;

interface ThesisWithRating {
  id: string;
  title: string;
  author_name: string;
  field: string;
  abstract: string;
  created_at: string;
  degree_type?: string | null;
  graduation_year?: number | null;
  keywords?: string[] | null;
  avgRating?: number;
  avgAccuracy?: number;
}

const Database = () => {
  const [theses, setTheses] = useState<ThesisWithRating[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [fieldFilter, setFieldFilter] = useState("All Fields");
  const [degreeFilter, setDegreeFilter] = useState("All Degrees");
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

  // Any change to what's being filtered/searched invalidates the current page —
  // going through these instead of the raw setters keeps that from needing a
  // second, page-reset-triggered fetch on top of the one the filter itself causes.
  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleFieldFilter = (v: string) => { setFieldFilter(v); setPage(1); };
  const handleDegreeFilter = (v: string) => { setDegreeFilter(v); setPage(1); };
  const goToPage = (p: number) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };

  useEffect(() => {
    const fetchTheses = async () => {
      setLoading(true);
      let query = supabase.from("theses").select("*", { count: "exact" }).order("created_at", { ascending: false });
      if (fieldFilter !== "All Fields") query = query.eq("field", fieldFilter);
      if (degreeFilter !== "All Degrees") query = query.eq("degree_type", degreeFilter);
      if (debouncedSearch.trim()) query = query.or(buildIlikeOrFilter(["title", "author_name", "abstract"], debouncedSearch));
      const from = (page - 1) * PAGE_SIZE;
      query = query.range(from, from + PAGE_SIZE - 1);

      const { data, count } = await query;
      setTotal(count ?? 0);
      if (!data) { setLoading(false); return; }

      const ids = data.map(t => t.id);
      const [{ data: ratings }, { data: accRatings }] = await Promise.all([
        supabase.from("ratings").select("thesis_id, score").in("thesis_id", ids),
        supabase.from("accuracy_ratings").select("thesis_id, score").in("thesis_id", ids),
      ]);

      const avgMap = (arr: any[] | null) => {
        const map: Record<string, { total: number; count: number }> = {};
        for (const r of arr || []) {
          if (!map[r.thesis_id]) map[r.thesis_id] = { total: 0, count: 0 };
          map[r.thesis_id].total += r.score;
          map[r.thesis_id].count += 1;
        }
        return map;
      };

      const rMap = avgMap(ratings);
      const aMap = avgMap(accRatings);

      setTheses(data.map(t => ({
        ...t,
        avgRating: rMap[t.id] ? rMap[t.id].total / rMap[t.id].count : 0,
        avgAccuracy: aMap[t.id] ? aMap[t.id].total / aMap[t.id].count : 0,
      })));
      setLoading(false);
    };
    fetchTheses();
  }, [debouncedSearch, fieldFilter, degreeFilter, page]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("db.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("db.subtitle")}</p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => handleSearch(e.target.value)} placeholder={t("db.searchPlaceholder")} className="pl-9" />
        </div>
        <Select value={fieldFilter} onValueChange={handleFieldFilter}>
          <SelectTrigger className="w-full sm:w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All Fields">{t("db.allFields")}</SelectItem>
            {FIELDS.map((f) => <SelectItem key={f.value} value={f.value}>{language === "fr" ? f.fr : f.en}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={degreeFilter} onValueChange={handleDegreeFilter}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All Degrees">{t("db.allDegrees")}</SelectItem>
            {DEGREE_TYPES.map((d) => <SelectItem key={d.value} value={d.value}>{language === "fr" ? d.fr : d.en}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : theses.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <p className="text-lg">{t("db.noTheses")}</p>
          <p className="text-sm">{t("db.tryAdjusting")}</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {theses.map((thesis) => (
              <ThesisCard key={thesis.id} {...thesis} />
            ))}
          </div>
          <PageControls page={page} pageSize={PAGE_SIZE} total={total} onPageChange={goToPage} />
        </>
      )}
    </div>
  );
};

export default Database;
