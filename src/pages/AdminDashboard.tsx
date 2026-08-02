import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Search, Trash2, Check, X as XIcon } from "lucide-react";
import { FIELDS, DEGREE_TYPES, reportReasonLabel } from "@/i18n/fields";
import { buildIlikeOrFilter, foldAccents } from "@/lib/searchFilter";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const ADMIN_DELETE_USER_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-delete-user`;

interface AdminThesis {
  id: string;
  title: string;
  author_name: string;
  field: string;
  degree_type: string | null;
  created_at: string;
}

interface AdminProfile {
  id: string;
  user_id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  university: string | null;
  field_of_study: string | null;
}

interface AdminReport {
  id: string;
  reason: string;
  details: string | null;
  status: "open" | "resolved" | "dismissed";
  created_at: string;
  reporter_id: string;
  thesis_id: string | null;
  comment_id: string | null;
  theses: { id: string; title: string } | null;
  comments: { id: string; content: string; thesis_id: string; theses: { id: string; title: string } | null } | null;
  reporterName?: string;
}

const displayName = (a: AdminProfile) => {
  const full = [a.first_name, a.last_name].filter(Boolean).join(" ");
  return full || a.username || "—";
};

// What the admin must type to unlock the delete button — prefer username
// (how people are identified elsewhere in the app), fall back to a short
// slice of the user_id so there's always something concrete to confirm
// even for a profile with no username or name set yet.
const confirmTarget = (a: AdminProfile) => a.username?.trim() || a.user_id.slice(0, 8);

const AdminDashboard = () => {
  const { user, session } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const [theses, setTheses] = useState<AdminThesis[]>([]);
  const [thesisSearch, setThesisSearch] = useState("");
  const debouncedThesisSearch = useDebouncedValue(thesisSearch, 300);
  const [fieldFilter, setFieldFilter] = useState("All Fields");
  const [degreeFilter, setDegreeFilter] = useState("All Degrees");
  const [thesesLoading, setThesesLoading] = useState(true);

  const [accounts, setAccounts] = useState<AdminProfile[]>([]);
  const [accountSearch, setAccountSearch] = useState("");
  const debouncedAccountSearch = useDebouncedValue(accountSearch, 300);
  const [adminUserIds, setAdminUserIds] = useState<Set<string>>(new Set());
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [confirmInput, setConfirmInput] = useState("");

  const [reports, setReports] = useState<AdminReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);

  const fetchReports = async () => {
    setReportsLoading(true);
    const { data } = await supabase
      .from("reports")
      .select(
        "id, reason, details, status, created_at, reporter_id, thesis_id, comment_id, theses:thesis_id(id, title), comments:comment_id(id, content, thesis_id, theses:thesis_id(id, title))"
      )
      .order("created_at", { ascending: false });
    const rows = (data as unknown as AdminReport[]) || [];
    const reporterIds = [...new Set(rows.map((r) => r.reporter_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, username").in("user_id", reporterIds);
    const nameMap = new Map(profiles?.map((p) => [p.user_id, p.username]) || []);
    setReports(rows.map((r) => ({ ...r, reporterName: nameMap.get(r.reporter_id) || undefined })));
    setReportsLoading(false);
  };

  useEffect(() => { fetchReports(); }, []);

  const updateReportStatus = async (id: string, status: "resolved" | "dismissed") => {
    const { error } = await supabase.from("reports").update({ status }).eq("id", id);
    if (error) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
      return;
    }
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  useEffect(() => {
    const fetchTheses = async () => {
      setThesesLoading(true);
      let query = supabase
        .from("theses")
        .select("id, title, author_name, field, degree_type, created_at")
        .order("created_at", { ascending: false });
      if (fieldFilter !== "All Fields") query = query.eq("field", fieldFilter);
      if (degreeFilter !== "All Degrees") query = query.eq("degree_type", degreeFilter);
      if (debouncedThesisSearch.trim()) {
        query = query.textSearch("search_vector", foldAccents(debouncedThesisSearch), { type: "websearch", config: "french" });
      }
      const { data } = await query;
      setTheses(data || []);
      setThesesLoading(false);
    };
    fetchTheses();
  }, [debouncedThesisSearch, fieldFilter, degreeFilter]);

  useEffect(() => {
    const fetchAccounts = async () => {
      setAccountsLoading(true);
      let query = supabase.from("profiles")
        .select("id, user_id, username, first_name, last_name, university, field_of_study")
        .order("created_at", { ascending: false });
      if (debouncedAccountSearch.trim()) {
        query = query.or(buildIlikeOrFilter(["username", "first_name", "last_name"], debouncedAccountSearch));
      }
      const [{ data: profilesData }, { data: rolesData }] = await Promise.all([
        query,
        supabase.from("user_roles").select("user_id").eq("role", "admin"),
      ]);
      setAccounts(profilesData || []);
      setAdminUserIds(new Set((rolesData || []).map((r: any) => r.user_id)));
      setAccountsLoading(false);
    };
    fetchAccounts();
  }, [debouncedAccountSearch]);

  const deleteThesis = async (id: string) => {
    const { error } = await supabase.from("theses").delete().eq("id", id);
    if (error) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
      return;
    }
    setTheses((prev) => prev.filter((thesis) => thesis.id !== id));
    toast({ title: t("admin.thesisDeleted") });
  };

  const deleteAccount = async (targetUserId: string) => {
    try {
      const resp = await fetch(ADMIN_DELETE_USER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ targetUserId, language }),
      });
      const result = await resp.json().catch(() => null);
      if (!resp.ok) throw new Error(result?.error || `Error ${resp.status}`);
      setAccounts((prev) => prev.filter((a) => a.user_id !== targetUserId));
      toast({ title: t("admin.accountDeleted") });
    } catch (error: any) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    } finally {
      setConfirmInput("");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t("admin.title")}</h1>

      <Tabs defaultValue="theses">
        <TabsList>
          <TabsTrigger value="theses">{t("admin.thesesTab")}</TabsTrigger>
          <TabsTrigger value="accounts">{t("admin.accountsTab")}</TabsTrigger>
          <TabsTrigger value="reports">
            {t("admin.reportsTab")}
            {reports.some((r) => r.status === "open") && (
              <Badge variant="destructive" className="ml-1.5 h-4 min-w-4 justify-center px-1 text-[10px]">
                {reports.filter((r) => r.status === "open").length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="theses" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={thesisSearch}
                onChange={(e) => setThesisSearch(e.target.value)}
                placeholder={t("db.searchPlaceholder")}
                className="pl-9"
              />
            </div>
            <Select value={fieldFilter} onValueChange={setFieldFilter}>
              <SelectTrigger className="w-full sm:w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All Fields">{t("db.allFields")}</SelectItem>
                {FIELDS.map((f) => <SelectItem key={f.value} value={f.value}>{language === "fr" ? f.fr : f.en}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={degreeFilter} onValueChange={setDegreeFilter}>
              <SelectTrigger className="w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All Degrees">{t("db.allDegrees")}</SelectItem>
                {DEGREE_TYPES.map((d) => <SelectItem key={d.value} value={d.value}>{language === "fr" ? d.fr : d.en}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {thesesLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : theses.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">{t("admin.noResults")}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === "fr" ? "Titre" : "Title"}</TableHead>
                  <TableHead>{language === "fr" ? "Auteur" : "Author"}</TableHead>
                  <TableHead>{language === "fr" ? "Domaine" : "Field"}</TableHead>
                  <TableHead>{language === "fr" ? "Diplôme" : "Degree"}</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">{language === "fr" ? "Actions" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {theses.map((thesis) => (
                  <TableRow key={thesis.id}>
                    <TableCell className="max-w-[240px] truncate font-medium">{thesis.title}</TableCell>
                    <TableCell>{thesis.author_name}</TableCell>
                    <TableCell>{thesis.field}</TableCell>
                    <TableCell>{thesis.degree_type || "—"}</TableCell>
                    <TableCell>{new Date(thesis.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-1 whitespace-nowrap">
                      <Link to={`/database/${thesis.id}`}>
                        <Button variant="ghost" size="sm">{t("admin.view")}</Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" aria-label={t("admin.deleteThesisTitle")}>
                            <Trash2 className="h-4 w-4" />
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
                              onClick={() => deleteThesis(thesis.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {t("admin.delete")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={accountSearch}
              onChange={(e) => setAccountSearch(e.target.value)}
              placeholder={language === "fr" ? "Rechercher par nom ou nom d'utilisateur..." : "Search by name or username..."}
              className="pl-9"
            />
          </div>

          {accountsLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : accounts.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">{t("admin.noResults")}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === "fr" ? "Nom" : "Name"}</TableHead>
                  <TableHead>{language === "fr" ? "Université" : "University"}</TableHead>
                  <TableHead>{language === "fr" ? "Domaine" : "Field"}</TableHead>
                  <TableHead>{language === "fr" ? "Rôle" : "Role"}</TableHead>
                  <TableHead className="text-right">{language === "fr" ? "Actions" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((a) => {
                  const isSelf = user?.id === a.user_id;
                  const target = confirmTarget(a);
                  return (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{displayName(a)}</TableCell>
                      <TableCell>{a.university || "—"}</TableCell>
                      <TableCell>{a.field_of_study || "—"}</TableCell>
                      <TableCell>{adminUserIds.has(a.user_id) && <Badge variant="secondary">{t("nav.admin")}</Badge>}</TableCell>
                      <TableCell className="text-right">
                        {!isSelf && (
                          <AlertDialog onOpenChange={(open) => { if (!open) setConfirmInput(""); }}>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" aria-label={t("admin.deleteAccountTitle")}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t("admin.deleteAccountTitle")}</AlertDialogTitle>
                                <AlertDialogDescription>{t("admin.deleteAccountBody")}</AlertDialogDescription>
                              </AlertDialogHeader>
                              <p className="rounded bg-muted px-2 py-1 font-mono text-sm">{target}</p>
                              <Input
                                value={confirmInput}
                                onChange={(e) => setConfirmInput(e.target.value)}
                                placeholder={t("admin.typeToConfirm")}
                              />
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t("detail.editCancel")}</AlertDialogCancel>
                                <AlertDialogAction
                                  disabled={confirmInput !== target}
                                  onClick={() => deleteAccount(a.user_id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {t("admin.confirmDelete")}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          {reportsLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : reports.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">{t("admin.noResults")}</p>
          ) : (
            <div className="space-y-3">
              {reports.map((r) => {
                const targetTitle = r.thesis_id ? r.theses?.title : r.comments?.theses?.title;
                const targetThesisId = r.thesis_id || r.comments?.thesis_id;
                return (
                  <div key={r.id} className="rounded-lg border p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <Badge variant={r.status === "open" ? "destructive" : "secondary"}>
                            {r.status === "open" ? t("admin.reportOpen") : r.status === "resolved" ? t("admin.reportResolved") : t("admin.reportDismissed")}
                          </Badge>
                          <span className="font-medium">{reportReasonLabel(r.reason, language)}</span>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-muted-foreground">{r.comment_id ? t("admin.reportOnComment") : t("admin.reportOnThesis")}</span>
                        </div>
                        {targetThesisId && (
                          <Link to={`/database/${targetThesisId}`} className="text-sm text-primary hover:underline">
                            {targetTitle || t("admin.view")}
                          </Link>
                        )}
                        {r.comments && <p className="text-sm text-muted-foreground italic">« {r.comments.content} »</p>}
                        {r.details && <p className="text-sm">{r.details}</p>}
                        <p className="text-xs text-muted-foreground">
                          {t("admin.reportedBy")} {r.reporterName || t("comments.anonymous")} · {new Date(r.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {r.status === "open" && (
                        <div className="flex shrink-0 gap-1">
                          <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => updateReportStatus(r.id, "resolved")}>
                            <Check className="h-3.5 w-3.5" /> {t("admin.reportResolve")}
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground" onClick={() => updateReportStatus(r.id, "dismissed")}>
                            <XIcon className="h-3.5 w-3.5" /> {t("admin.reportDismiss")}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
