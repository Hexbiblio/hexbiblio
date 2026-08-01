import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SourceCard from "@/components/SourceCard";
import FieldEssentials from "@/components/FieldEssentials";
import PageControls from "@/components/PageControls";
import { Search } from "lucide-react";
import { FIELDS, DEGREE_TYPES } from "@/i18n/fields";
import { buildIlikeOrFilter } from "@/lib/searchFilter";

// Same grid as /database, same reasoning: 24 divides evenly by 2 and 3 columns.
const PAGE_SIZE = 24;

interface SourceWithThesis {
  id: string;
  raw_citation: string;
  title: string | null;
  authors: string | null;
  year: number | null;
  theses: {
    id: string;
    title: string;
    field: string;
    degree_type: string | null;
  } | null;
}

const Sources = () => {
  const [sources, setSources] = useState<SourceWithThesis[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [fieldFilter, setFieldFilter] = useState("All Fields");
  const [degreeFilter, setDegreeFilter] = useState("All Degrees");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("essentials");
  const { t, language } = useLanguage();

  // Same reasoning as Database.tsx: route filter changes through these so a
  // filter change doesn't cause both its own fetch and a second one from
  // resetting the page.
  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleFieldFilter = (v: string) => { setFieldFilter(v); setPage(1); };
  const handleDegreeFilter = (v: string) => { setDegreeFilter(v); setPage(1); };
  const goToPage = (p: number) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };

  // Clicking a key work jumps to the full list, pre-searched for that title —
  // so the ranking is a way into the citations rather than a dead-end list.
  const exploreCitations = (title: string) => {
    setSearch(title);
    setDegreeFilter("All Degrees");
    setPage(1);
    setTab("all");
  };

  useEffect(() => {
    // The key-works tab does its own aggregated query, so don't pull the full
    // source list until it's actually being shown.
    if (tab !== "all") return;
    const fetchSources = async () => {
      setLoading(true);
      // theses!inner (not the plain embed) so filtering on theses.field/degree_type
      // below actually excludes non-matching sources — PostgREST's default
      // left-join embed only filters *which* nested thesis is returned, not
      // whether the source row itself is included.
      let query = supabase
        .from("sources")
        .select("id, raw_citation, title, authors, year, theses!inner(id, title, field, degree_type)", { count: "exact" })
        .order("created_at", { ascending: false });

      if (fieldFilter !== "All Fields") query = query.eq("theses.field", fieldFilter);
      if (degreeFilter !== "All Degrees") query = query.eq("theses.degree_type", degreeFilter);
      if (search.trim()) {
        query = query.or(buildIlikeOrFilter(["raw_citation", "title", "authors"], search));
      }
      const from = (page - 1) * PAGE_SIZE;
      query = query.range(from, from + PAGE_SIZE - 1);

      const { data, count } = await query;
      setTotal(count ?? 0);
      setSources((data as unknown as SourceWithThesis[]) || []);
      setLoading(false);
    };
    fetchSources();
  }, [search, fieldFilter, degreeFilter, tab, page]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("sources.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("sources.subtitle")}</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="essentials">{t("sources.essentialsTab")}</TabsTrigger>
          <TabsTrigger value="all">{t("sources.allTab")}</TabsTrigger>
        </TabsList>

        {/* Field applies to both views, so it sits outside them. */}
        <div className="my-4">
          <Select value={fieldFilter} onValueChange={handleFieldFilter}>
            <SelectTrigger className="w-full sm:w-[220px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All Fields">{t("db.allFields")}</SelectItem>
              {FIELDS.map((f) => <SelectItem key={f.value} value={f.value}>{language === "fr" ? f.fr : f.en}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="essentials">
          <FieldEssentials field={fieldFilter} onExplore={exploreCitations} />
        </TabsContent>

        <TabsContent value="all" className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => handleSearch(e.target.value)} placeholder={t("sources.searchPlaceholder")} className="pl-9" />
            </div>
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
          ) : sources.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p className="text-lg">{t("sources.noSources")}</p>
              <p className="text-sm">{t("sources.tryAdjusting")}</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sources.map((source) => (
                  <SourceCard key={source.id} {...source} />
                ))}
              </div>
              <PageControls page={page} pageSize={PAGE_SIZE} total={total} onPageChange={goToPage} />
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Sources;
