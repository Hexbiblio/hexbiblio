import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ThesisCard from "@/components/ThesisCard";
import { Bookmark, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BookmarkWithThesis {
  id: string;
  thesis_id: string;
  collection_name: string | null;
  thesis: {
    id: string;
    title: string;
    author_name: string;
    field: string;
    abstract: string;
    created_at: string;
  };
}

const MyCollections = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkWithThesis[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [activeCollection, setActiveCollection] = useState<string>("All");
  const [newCollection, setNewCollection] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchBookmarks = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("bookmarks")
      .select("id, thesis_id, collection_name")
      .eq("user_id", user.id);
    if (!data) { setLoading(false); return; }

    // Fetch thesis details for each bookmark
    const thesisIds = data.map(b => b.thesis_id);
    const { data: thesesData } = await supabase
      .from("theses")
      .select("id, title, author_name, field, abstract, created_at")
      .in("id", thesisIds);

    const thesisMap = new Map(thesesData?.map(t => [t.id, t]) || []);
    const withThesis = data
      .filter(b => thesisMap.has(b.thesis_id))
      .map(b => ({ ...b, thesis: thesisMap.get(b.thesis_id)! }));
    
    setBookmarks(withThesis);
    const cols = [...new Set(withThesis.map(b => b.collection_name || "Unsorted"))];
    setCollections(cols);
    setLoading(false);
  };

  useEffect(() => { fetchBookmarks(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const filtered = activeCollection === "All"
    ? bookmarks
    : bookmarks.filter(b => (b.collection_name || "Unsorted") === activeCollection);

  const handleAddCollection = () => {
    if (!newCollection.trim()) return;
    if (!collections.includes(newCollection.trim())) {
      setCollections([...collections, newCollection.trim()]);
    }
    setNewCollection("");
  };

  const handleRemoveBookmark = async (bookmarkId: string) => {
    await supabase.from("bookmarks").delete().eq("id", bookmarkId);
    toast({ title: "Bookmark removed" });
    fetchBookmarks();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bookmark className="h-7 w-7" /> My Collections
        </h1>
        <p className="text-muted-foreground mt-1">Your saved theses organized by collection</p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Button variant={activeCollection === "All" ? "default" : "outline"} size="sm" onClick={() => setActiveCollection("All")}>
          All ({bookmarks.length})
        </Button>
        {collections.map(col => (
          <Button key={col} variant={activeCollection === col ? "default" : "outline"} size="sm" onClick={() => setActiveCollection(col)}>
            {col} ({bookmarks.filter(b => (b.collection_name || "Unsorted") === col).length})
          </Button>
        ))}
        <div className="flex items-center gap-1">
          <Input value={newCollection} onChange={(e) => setNewCollection(e.target.value)} placeholder="New collection" className="h-8 w-36 text-sm" onKeyDown={(e) => e.key === "Enter" && handleAddCollection()} />
          <Button size="sm" variant="ghost" onClick={handleAddCollection}><Plus className="h-4 w-4" /></Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <p className="text-lg">No bookmarks yet</p>
          <p className="text-sm">Browse the database and bookmark theses you find interesting!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(bookmark => (
            <div key={bookmark.id} className="relative">
              <ThesisCard {...bookmark.thesis} />
              <button onClick={() => handleRemoveBookmark(bookmark.id)} className="absolute bottom-3 right-3 rounded-full bg-destructive/10 p-1.5 text-destructive hover:bg-destructive/20">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCollections;
