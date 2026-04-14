import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ThesisCard from "@/components/ThesisCard";
import { Search } from "lucide-react";

const FIELDS = [
  "All Fields", "Computer Science", "Mathematics", "Physics", "Biology", "Chemistry",
  "Engineering", "Medicine", "Psychology", "Economics", "Law",
  "Philosophy", "Literature", "History", "Sociology", "Education", "Other",
];

const DEGREE_FILTERS = ["All Degrees", "Bachelor", "Master", "PhD", "Other"];

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
  const [search, setSearch] = useState("");
  const [fieldFilter, setFieldFilter] = useState("All Fields");
  const [degreeFilter, setDegreeFilter] = useState("All Degrees");
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchTheses = async () => {
      setLoading(true);
      let query = supabase.from("theses").select("*").order("created_at", { ascending: false });
      if (fieldFilter !== "All Fields") query = query.eq("field", fieldFilter);
      if (degreeFilter !== "All Degrees") query = query.eq("degree_type", degreeFilter);
      if (search.trim()) query = query.or(`title.ilike.%${search}%,author_name.ilike.%${search}%,abstract.ilike.%${search}%`);

      const { data } = await query;
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
  }, [search, fieldFilter, degreeFilter]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("db.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("db.subtitle")}</p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("db.searchPlaceholder")} className="pl-9" />
        </div>
        <Select value={fieldFilter} onValueChange={setFieldFilter}>
          <SelectTrigger className="w-full sm:w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {FIELDS.map((f) => <SelectItem key={f} value={f}>{f === "All Fields" ? t("db.allFields") : f}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={degreeFilter} onValueChange={setDegreeFilter}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {DEGREE_FILTERS.map((d) => <SelectItem key={d} value={d}>{d === "All Degrees" ? t("db.allDegrees") : d}</SelectItem>)}
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {theses.map((thesis) => (
            <ThesisCard key={thesis.id} {...thesis} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Database;
