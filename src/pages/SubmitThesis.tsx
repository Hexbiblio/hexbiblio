import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";

const FIELDS = [
  "Computer Science", "Mathematics", "Physics", "Biology", "Chemistry",
  "Engineering", "Medicine", "Psychology", "Economics", "Law",
  "Philosophy", "Literature", "History", "Sociology", "Education", "Other",
];

const DEGREE_TYPES = ["Bachelor", "Master", "PhD", "Other"];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => currentYear - i);

const SubmitThesis = () => {
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [abstract, setAbstract] = useState("");
  const [field, setField] = useState("");
  const [degreeType, setDegreeType] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const addKeyword = () => {
    const kw = keywordInput.trim().toLowerCase();
    if (kw && !keywords.includes(kw) && keywords.length < 10) {
      setKeywords([...keywords, kw]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (kw: string) => setKeywords(keywords.filter((k) => k !== kw));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !field) return;
    setLoading(true);

    try {
      let file_url: string | null = null;

      if (file) {
        const filePath = `${user.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from("theses").upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("theses").getPublicUrl(filePath);
        file_url = urlData.publicUrl;
      }

      const { error } = await supabase.from("theses").insert({
        user_id: user.id,
        title: title.trim(),
        author_name: authorName.trim(),
        abstract: abstract.trim(),
        field,
        file_url,
        keywords,
        degree_type: degreeType || null,
        graduation_year: graduationYear ? parseInt(graduationYear) : null,
      });

      if (error) throw error;
      toast({ title: "Thesis submitted!", description: "Your thesis has been added to the database." });
      navigate("/database");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Submit Your Thesis</CardTitle>
          <CardDescription>Share your research with the community</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Your thesis title" required maxLength={500} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author Name *</Label>
              <Input id="author" value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Full name" required maxLength={200} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Field / Discipline *</Label>
                <Select value={field} onValueChange={setField}>
                  <SelectTrigger><SelectValue placeholder="Select a field" /></SelectTrigger>
                  <SelectContent>
                    {FIELDS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Degree Type</Label>
                <Select value={degreeType} onValueChange={setDegreeType}>
                  <SelectTrigger><SelectValue placeholder="Select degree" /></SelectTrigger>
                  <SelectContent>
                    {DEGREE_TYPES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Graduation Year</Label>
              <Select value={graduationYear} onValueChange={setGraduationYear}>
                <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Keywords / Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder="Add a keyword..."
                  maxLength={50}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addKeyword(); } }}
                />
                <Button type="button" variant="outline" onClick={addKeyword} disabled={keywords.length >= 10}>Add</Button>
              </div>
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {keywords.map((kw) => (
                    <Badge key={kw} variant="secondary" className="gap-1 pr-1">
                      {kw}
                      <button type="button" onClick={() => removeKeyword(kw)} className="ml-0.5 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">Up to 10 keywords for better discoverability</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="abstract">Abstract *</Label>
              <Textarea id="abstract" value={abstract} onChange={(e) => setAbstract(e.target.value)} placeholder="Summarize your research..." className="min-h-[150px]" required maxLength={5000} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">PDF File (optional)</Label>
              <Input id="file" type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <p className="text-xs text-muted-foreground">Max 20MB</p>
            </div>
            <Button type="submit" className="w-full gap-2" disabled={loading || !field}>
              <Upload className="h-4 w-4" />
              {loading ? "Submitting..." : "Submit Thesis"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmitThesis;
