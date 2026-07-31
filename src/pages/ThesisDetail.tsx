import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import RatingWidget from "@/components/RatingWidget";
import CommentSection from "@/components/CommentSection";
import BookmarkButton from "@/components/BookmarkButton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download, Calendar, User, GraduationCap, Tag, Pencil, X, Trash2 } from "lucide-react";
import { fieldLabel, degreeLabel, FIELDS, DEGREE_TYPES } from "@/i18n/fields";

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => currentYear - i);

const ThesisDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [thesis, setThesis] = useState<any>(null);
  const [userRating, setUserRating] = useState<number | undefined>();
  const [avgRating, setAvgRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [userAccuracy, setUserAccuracy] = useState<number | undefined>();
  const [avgAccuracy, setAvgAccuracy] = useState(0);
  const [totalAccuracy, setTotalAccuracy] = useState(0);
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Only field/degree_type/graduation_year/keywords are editable post-submission —
  // title/abstract/author/PDF stay exactly what Phase 2's AI check verified.
  // The DB also enforces this (lock_immutable_thesis_fields_trigger), this
  // is just the UI's own scope.
  const [editing, setEditing] = useState(false);
  const [editField, setEditField] = useState("");
  const [editDegree, setEditDegree] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editKeywords, setEditKeywords] = useState<string[]>([]);
  const [editKeywordInput, setEditKeywordInput] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Admin-only: lock_immutable_thesis_fields_trigger and
  // set_thesis_author_name_trigger both let admins (and only admins) touch
  // these four columns — see the DB migrations. Must stay hidden for
  // non-admin owners, since the triggers still revert/re-derive them for
  // anyone else regardless of what the UI sends.
  const [editTitle, setEditTitle] = useState("");
  const [editAuthorName, setEditAuthorName] = useState("");
  const [editAbstract, setEditAbstract] = useState("");
  const [editFileUrl, setEditFileUrl] = useState("");
  const [deleting, setDeleting] = useState(false);

  const fetchThesis = async () => {
    if (!id) return;
    const { data } = await supabase.from("theses").select("*").eq("id", id).single();
    setThesis(data);
    setLoading(false);
  };

  const fetchRatings = async () => {
    if (!id) return;
    const { data } = await supabase.from("ratings").select("*").eq("thesis_id", id);
    if (data) {
      setTotalRatings(data.length);
      setAvgRating(data.length ? data.reduce((s, r) => s + r.score, 0) / data.length : 0);
      if (user) setUserRating(data.find((r) => r.user_id === user.id)?.score);
    }
  };

  const fetchAccuracy = async () => {
    if (!id) return;
    const { data } = await supabase.from("accuracy_ratings").select("*").eq("thesis_id", id);
    if (data) {
      setTotalAccuracy(data.length);
      setAvgAccuracy(data.length ? data.reduce((s, r) => s + r.score, 0) / data.length : 0);
      if (user) setUserAccuracy(data.find((r) => r.user_id === user.id)?.score);
    }
  };

  const fetchSources = async () => {
    if (!id) return;
    const { data } = await supabase
      .from("sources")
      .select("id, raw_citation, title, authors, year")
      .eq("thesis_id", id)
      .order("created_at", { ascending: true });
    setSources(data || []);
  };

  useEffect(() => {
    fetchThesis();
    fetchRatings();
    fetchAccuracy();
    fetchSources();
  }, [id, user]);

  const startEditing = () => {
    setEditField(thesis.field || "");
    setEditDegree(thesis.degree_type || "");
    setEditYear(thesis.graduation_year ? String(thesis.graduation_year) : "");
    setEditKeywords(thesis.keywords || []);
    setEditKeywordInput("");
    if (isAdmin) {
      setEditTitle(thesis.title || "");
      setEditAuthorName(thesis.author_name || "");
      setEditAbstract(thesis.abstract || "");
      setEditFileUrl(thesis.file_url || "");
    }
    setEditing(true);
  };

  const addEditKeyword = () => {
    const kw = editKeywordInput.trim().toLowerCase();
    if (kw && !editKeywords.includes(kw) && editKeywords.length < 10) {
      setEditKeywords([...editKeywords, kw]);
      setEditKeywordInput("");
    }
  };

  const removeEditKeyword = (kw: string) => setEditKeywords(editKeywords.filter((k) => k !== kw));

  const saveEdit = async () => {
    if (!thesis) return;
    setSavingEdit(true);
    const payload: Record<string, unknown> = {
      field: editField,
      degree_type: editDegree || null,
      graduation_year: editYear ? parseInt(editYear, 10) : null,
      keywords: editKeywords,
    };
    if (isAdmin) {
      payload.title = editTitle;
      payload.author_name = editAuthorName;
      payload.abstract = editAbstract;
      payload.file_url = editFileUrl || null;
    }
    const { error } = await supabase.from("theses").update(payload).eq("id", thesis.id);
    setSavingEdit(false);
    if (error) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
      return;
    }
    setThesis({ ...thesis, ...payload });
    setEditing(false);
    toast({ title: t("detail.editSaved") });
  };

  const deleteThesis = async () => {
    if (!thesis) return;
    setDeleting(true);
    const { error } = await supabase.from("theses").delete().eq("id", thesis.id);
    setDeleting(false);
    if (error) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: t("admin.thesisDeleted") });
    navigate("/database");
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!thesis) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-lg text-muted-foreground">{t("detail.notFound")}</p>
        <Link to="/database"><Button variant="outline" className="mt-4">{t("detail.backToDb")}</Button></Link>
      </div>
    );
  }

  const isOwner = Boolean(user && thesis.user_id === user.id);
  const canEditMetadata = isOwner || isAdmin;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link to="/database" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t("detail.backToDb")}
      </Link>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              {editing ? (
                <div className="grid gap-2 sm:grid-cols-3 max-w-md">
                  <Select value={editField} onValueChange={setEditField}>
                    <SelectTrigger><SelectValue placeholder={t("submit.selectField")} /></SelectTrigger>
                    <SelectContent>
                      {FIELDS.map((f) => <SelectItem key={f.value} value={f.value}>{language === "fr" ? f.fr : f.en}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={editDegree} onValueChange={setEditDegree}>
                    <SelectTrigger><SelectValue placeholder={t("submit.selectDegree")} /></SelectTrigger>
                    <SelectContent>
                      {DEGREE_TYPES.map((d) => <SelectItem key={d.value} value={d.value}>{language === "fr" ? d.fr : d.en}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={editYear} onValueChange={setEditYear}>
                    <SelectTrigger><SelectValue placeholder={t("submit.selectYear")} /></SelectTrigger>
                    <SelectContent>
                      {YEARS.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary">{fieldLabel(thesis.field, language)}</Badge>
                  {thesis.degree_type && <Badge variant="outline">{degreeLabel(thesis.degree_type, language)}</Badge>}
                  {thesis.graduation_year && <Badge variant="outline">{thesis.graduation_year}</Badge>}
                  {canEditMetadata && (
                    <Button variant="ghost" size="sm" className="h-6 gap-1 px-1.5 text-xs text-muted-foreground" onClick={startEditing}>
                      <Pencil className="h-3 w-3" /> {t("detail.edit")}
                    </Button>
                  )}
                  {isAdmin && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 gap-1 px-1.5 text-xs text-destructive hover:text-destructive">
                          <Trash2 className="h-3 w-3" /> {t("admin.delete")}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t("admin.deleteThesisTitle")}</AlertDialogTitle>
                          <AlertDialogDescription>{t("admin.deleteThesisBody")}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t("detail.editCancel")}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={deleteThesis}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {t("admin.delete")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              )}
              {editing && isAdmin ? (
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-xl font-bold h-auto py-1.5"
                />
              ) : (
                <h1 className="text-2xl font-bold leading-tight">{thesis.title}</h1>
              )}
            </div>
            <BookmarkButton thesisId={thesis.id} />
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><User className="h-4 w-4" />{thesis.author_name}</span>
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(thesis.created_at).toLocaleDateString()}</span>
            {thesis.degree_type && (
              <span className="flex items-center gap-1"><GraduationCap className="h-4 w-4" />{degreeLabel(thesis.degree_type, language)}{thesis.graduation_year ? ` (${thesis.graduation_year})` : ""}</span>
            )}
          </div>

          {editing ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={editKeywordInput}
                  onChange={(e) => setEditKeywordInput(e.target.value)}
                  placeholder={t("submit.addKeyword")}
                  maxLength={50}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addEditKeyword(); } }}
                />
                <Button type="button" variant="outline" onClick={addEditKeyword} disabled={editKeywords.length >= 10}>{t("submit.add")}</Button>
              </div>
              {editKeywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {editKeywords.map((kw) => (
                    <Badge key={kw} variant="secondary" className="gap-1 pr-1 text-xs">
                      {kw}
                      <button type="button" onClick={() => removeEditKeyword(kw)} className="ml-0.5 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              {isAdmin && (
                <div className="space-y-3 rounded-md border border-dashed p-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">{t("submit.authorLabel")}</label>
                    <Input value={editAuthorName} onChange={(e) => setEditAuthorName(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">{t("detail.abstract")}</label>
                    <Textarea value={editAbstract} onChange={(e) => setEditAbstract(e.target.value)} rows={5} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">PDF URL</label>
                    <Input value={editFileUrl} onChange={(e) => setEditFileUrl(e.target.value)} placeholder="https://..." />
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={saveEdit}
                  disabled={savingEdit || !editField || (isAdmin && (!editTitle.trim() || !editAuthorName.trim() || !editAbstract.trim()))}
                >
                  {savingEdit ? t("submit.submitting") : t("profile.save")}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(false)} disabled={savingEdit}>
                  {t("detail.editCancel")}
                </Button>
              </div>
            </div>
          ) : (
            thesis.keywords && thesis.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                {thesis.keywords.map((kw: string) => (
                  <Badge key={kw} variant="secondary" className="text-xs">{kw}</Badge>
                ))}
              </div>
            )
          )}

          <RatingWidget
            thesisId={thesis.id}
            currentRating={userRating}
            avgRating={avgRating}
            totalRatings={totalRatings}
            onRated={fetchRatings}
            currentAccuracy={userAccuracy}
            avgAccuracy={avgAccuracy}
            totalAccuracy={totalAccuracy}
            onAccuracyRated={fetchAccuracy}
          />

          <div>
            <h2 className="mb-2 text-lg font-semibold">{t("detail.abstract")}</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{thesis.abstract}</p>
          </div>

          {thesis.file_url && (
            <a href={thesis.file_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" /> {t("detail.downloadPdf")}
              </Button>
            </a>
          )}

          {sources.length > 0 && (
            <div>
              <h2 className="mb-2 text-lg font-semibold">{t("detail.sources")} ({sources.length})</h2>
              <ol className="space-y-1.5">
                {sources.map((source, i) => (
                  <li key={source.id} className="flex gap-2 text-sm text-muted-foreground leading-snug">
                    <span className="shrink-0 text-xs tabular-nums">{i + 1}.</span>
                    <span>
                      {source.title ? (
                        <>
                          {source.authors && `${source.authors} `}
                          {source.year && `(${source.year}). `}
                          <span className="text-foreground">{source.title}</span>
                        </>
                      ) : (
                        source.raw_citation
                      )}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <hr className="border-border" />

          <CommentSection thesisId={thesis.id} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ThesisDetail;
