import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ThesisCard from "@/components/ThesisCard";
import { Search } from "lucide-react";

const FIELDS = [
  "All Fields", "Computer Science", "Mathematics", "Physics", "Biology", "Chemistry",
  "Engineering", "Medicine", "Psychology", "Economics", "Law",
  "Philosophy", "Literature", "History", "Sociology", "Education", "Other",
];

interface ThesisWithRating {
  id: string;
  title: string;
  author_name: string;
  field: string;
  abstract: string;
  created_at: string;
  avgRating?: number;
}

const Database = () => {
  const [theses, setTheses] = useState<ThesisWithRating[]>([]);
  const [search, setSearch] = useState("");
  const [fieldFilter, setFieldFilter] = useState("All Fields");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTheses = async () => {
      setLoading(true);
      let query = supabase.from("theses").select("*").order("created_at", { ascending: false });
      if (fieldFilter !== "All Fields") query = query.eq("field", fieldFilter);
      if (search.trim()) query = query.or(`title.ilike.%${search}%,author_name.ilike.%${search}%,abstract.ilike.%${search}%`);
      
      const { data } = await query;
      if (!data) { setLoading(false); return; }

      // Fetch avg ratings
      const thesesWithRatings: ThesisWithRating[] = [];
      for (const thesis of data) {
        const { data: ratingData } = await supabase.from("ratings").select("score").eq("thesis_id", thesis.id);
        const avg = ratingData?.length ? ratingData.reduce((s, r) => s + r.score, 0) / ratingData.length : 0;
        thesesWithRatings.push({ ...thesis, avgRating: avg });
      }
      setTheses(thesesWithRatings);
      setLoading(false);
    };
    fetchTheses();
  }, [search, fieldFilter]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Thesis Database</h1>
        <p className="text-muted-foreground mt-1">Browse and discover research from the community</p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, author, or keyword..."
            className="pl-9"
          />
        </div>
        <Select value={fieldFilter} onValueChange={setFieldFilter}>
          <SelectTrigger className="w-full sm:w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {FIELDS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : theses.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <p className="text-lg">No theses found</p>
          <p className="text-sm">Try adjusting your search or be the first to submit!</p>
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
