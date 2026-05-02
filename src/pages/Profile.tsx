import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import ThesisCard from "@/components/ThesisCard";
import { useToast } from "@/hooks/use-toast";
import { User, Upload, X, GraduationCap, MapPin, Building2, BookOpen } from "lucide-react";

const ACADEMIC_LEVELS = [
  "High School", "Bachelor", "Master", "PhD", "Postdoc", "Professor", "Other",
];

const Profile = () => {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [academicLevel, setAcademicLevel] = useState("");
  const [country, setCountry] = useState("");
  const [university, setUniversity] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [myTheses, setMyTheses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t, language } = useLanguage();

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      if (profile) {
        setUsername(profile.username || "");
        setAcademicLevel((profile as any).academic_level || "");
        setCountry((profile as any).country || "");
        setUniversity((profile as any).university || "");
        setFieldOfStudy((profile as any).field_of_study || "");
        setBio((profile as any).bio || "");
        setInterests((profile as any).research_interests || []);
        setAvatarUrl(profile.avatar_url || null);
      }

      const { data: theses } = await supabase.from("theses").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setMyTheses(theses || []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: t("common.error"), description: language === "fr" ? "Image trop grande (max 2 Mo)" : "Image too large (max 2 MB)", variant: "destructive" });
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (upErr) {
      toast({ title: t("common.error"), description: upErr.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const publicUrl = `${data.publicUrl}?t=${Date.now()}`;
    await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("user_id", user.id);
    setAvatarUrl(publicUrl);
    setUploading(false);
    toast({ title: language === "fr" ? "Photo mise à jour" : "Avatar updated" });
  };

  const addInterest = () => {
    const v = interestInput.trim();
    if (!v || interests.includes(v) || interests.length >= 10) return;
    setInterests([...interests, v]);
    setInterestInput("");
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      username: username.trim(),
      academic_level: academicLevel || null,
      country: country.trim() || null,
      university: university.trim() || null,
      field_of_study: fieldOfStudy.trim() || null,
      bio: bio.trim() || null,
      research_interests: interests,
    } as any).eq("user_id", user.id);
    setSaving(false);
    if (error) toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    else toast({ title: t("profile.updated") });
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const fr = language === "fr";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> {t("profile.title")}</CardTitle>
          <CardDescription>{user?.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback className="text-lg">
                {(username || user?.email || "?").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {uploading ? (fr ? "Envoi..." : "Uploading...") : (fr ? "Changer la photo" : "Change photo")}
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">
                {fr ? "JPG ou PNG, 2 Mo max" : "JPG or PNG, 2 MB max"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("profile.username")}</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t("profile.yourUsername")} maxLength={50} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5" />{fr ? "Niveau académique" : "Academic level"}</Label>
              <Select value={academicLevel} onValueChange={setAcademicLevel}>
                <SelectTrigger><SelectValue placeholder={fr ? "Sélectionner" : "Select"} /></SelectTrigger>
                <SelectContent>
                  {ACADEMIC_LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{fr ? "Pays" : "Country"}</Label>
              <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder={fr ? "France" : "United States"} maxLength={80} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" />{fr ? "Université" : "University"}</Label>
              <Input value={university} onChange={(e) => setUniversity(e.target.value)} placeholder={fr ? "Sorbonne Université" : "Stanford University"} maxLength={150} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" />{fr ? "Domaine d'étude" : "Field of study"}</Label>
              <Input value={fieldOfStudy} onChange={(e) => setFieldOfStudy(e.target.value)} placeholder={fr ? "Sociologie, IA, Histoire..." : "Sociology, AI, History..."} maxLength={100} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{fr ? "Bio" : "Bio"}</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={fr ? "Parlez un peu de vous et de vos recherches..." : "Tell us about yourself and your research..."}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">{bio.length}/500</p>
          </div>

          <div className="space-y-2">
            <Label>{fr ? "Intérêts de recherche" : "Research interests"}</Label>
            <div className="flex gap-2">
              <Input
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addInterest(); } }}
                placeholder={fr ? "Ajouter un intérêt..." : "Add an interest..."}
                maxLength={40}
              />
              <Button type="button" variant="outline" onClick={addInterest}>{fr ? "Ajouter" : "Add"}</Button>
            </div>
            {interests.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {interests.map((i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {i}
                    <button onClick={() => setInterests(interests.filter((x) => x !== i))} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
            {saving ? (fr ? "Enregistrement..." : "Saving...") : t("profile.save")}
          </Button>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-bold mb-4">{t("profile.myTheses")} ({myTheses.length})</h2>
        {myTheses.length === 0 ? (
          <p className="text-muted-foreground">{t("profile.noTheses")}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {myTheses.map(thesis => <ThesisCard key={thesis.id} {...thesis} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
