import { useState, useEffect } from "react";
import { Flag, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { REPORT_REASONS } from "@/i18n/fields";

// Exactly one of the two is ever set (matches the DB's own CHECK constraint) —
// this component reports either a thesis or a comment, never both.
type ReportButtonProps = { thesisId: string; commentId?: undefined } | { thesisId?: undefined; commentId: string };

const ReportButton = (props: ReportButtonProps) => {
  const { thesisId, commentId } = props;
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [alreadyReported, setAlreadyReported] = useState(false);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    let query = supabase.from("reports").select("id").eq("reporter_id", user.id);
    query = thesisId ? query.eq("thesis_id", thesisId) : query.eq("comment_id", commentId);
    query.maybeSingle().then(({ data }) => setAlreadyReported(!!data));
  }, [user, thesisId, commentId]);

  const submit = async () => {
    if (!user || !reason) return;
    setSubmitting(true);
    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      thesis_id: thesisId ?? null,
      comment_id: commentId ?? null,
      reason,
      details: details.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
      return;
    }
    setAlreadyReported(true);
    setOpen(false);
    setReason("");
    setDetails("");
    toast({ title: t("report.submitted") });
  };

  if (!user) return null;

  if (alreadyReported) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Check className="h-3.5 w-3.5" /> {t("report.alreadyReported")}
      </span>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 gap-1 px-1.5 text-xs text-muted-foreground hover:text-destructive">
          <Flag className="h-3 w-3" /> {t("report.action")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("report.dialogTitle")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger><SelectValue placeholder={t("report.reasonPlaceholder")} /></SelectTrigger>
            <SelectContent>
              {REPORT_REASONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>{language === "fr" ? r.fr : r.en}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder={t("report.detailsPlaceholder")}
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={!reason || submitting}>
            {submitting ? t("report.submitting") : t("report.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportButton;
