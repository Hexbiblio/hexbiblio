import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ACADEMIC_LEVELS, FIELDS } from "@/i18n/fields";
import MascotAvatar from "@/components/MascotAvatar";
import { X } from "lucide-react";

const MAX_ONBOARDING_INTERESTS = 5;

export interface OnboardingPatch {
  academic_level: string | null;
  field_of_study: string | null;
  research_interests: string[];
}

interface OnboardingCardProps {
  userId: string;
  firstName?: string | null;
  onSaved: (patch: OnboardingPatch) => void;
}

const OnboardingCard = ({ userId, firstName, onSaved }: OnboardingCardProps) => {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [academicLevel, setAcademicLevel] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState("");
  const [saving, setSaving] = useState(false);

  const addInterest = () => {
    const v = interestInput.trim();
    if (!v || interests.includes(v) || interests.length >= MAX_ONBOARDING_INTERESTS) return;
    setInterests([...interests, v]);
    setInterestInput("");
  };

  const handleSave = async () => {
    setSaving(true);
    const patch: OnboardingPatch = {
      academic_level: academicLevel || null,
      field_of_study: fieldOfStudy || null,
      research_interests: interests,
    };
    const { error } = await supabase.from("profiles").update(patch as any).eq("user_id", userId);
    setSaving(false);
    if (error) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: t("onboarding.saved") });
    onSaved(patch);
  };

  // Level and field are the required fields (interests stays labeled "optional" in the UI) —
  // onboarding is mandatory now, so Save shouldn't enable on interests alone.
  const canSave = Boolean(academicLevel && fieldOfStudy);

  // The first name sits mid-sentence, not as a prefix — built inline rather
  // than through translations.ts, which only does static key lookups.
  const greetingTitle = firstName
    ? (language === "fr"
        ? `Bonjour ${firstName}, bienvenue sur Hexbiblio, je suis ton nouveau mentor`
        : `Hi ${firstName}, welcome to Hexbiblio — I'm your new mentor`)
    : (language === "fr"
        ? "Bienvenue sur Hexbiblio, je suis ton nouveau mentor"
        : "Welcome to Hexbiblio — I'm your new mentor");
  const greetingSubtitle = language === "fr"
    ? "Avant de commencer, j'ai besoin de quelques informations te concernant."
    : "Before we get started, I need a few details about you.";

  return (
    <div className="mx-auto flex max-w-2xl items-start gap-2.5">
      <MascotAvatar />
      {/* Same speech-bubble treatment as a real chat message (see ChatInterface.tsx) —
          the mentor is asking these questions, not filling out a form. */}
      <div className="relative flex-1 space-y-4 rounded-2xl rounded-tl-md bg-muted px-5 py-4 text-foreground">
        <span className="absolute -left-1 top-3 h-3 w-3 rotate-45 rounded-[2px] bg-muted" />
        <div>
          <h2 className="text-base font-semibold">{greetingTitle}</h2>
          <p className="text-sm text-muted-foreground">{greetingSubtitle}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">{t("onboarding.academicLevelLabel")}</label>
            <Select value={academicLevel} onValueChange={setAcademicLevel}>
              <SelectTrigger><SelectValue placeholder={t("onboarding.selectLevel")} /></SelectTrigger>
              <SelectContent>
                {ACADEMIC_LEVELS.map((l) => (
                  <SelectItem key={l.value} value={l.value}>{language === "fr" ? l.fr : l.en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">{t("onboarding.fieldLabel")}</label>
            <Select value={fieldOfStudy} onValueChange={setFieldOfStudy}>
              <SelectTrigger><SelectValue placeholder={t("onboarding.selectField")} /></SelectTrigger>
              <SelectContent>
                {FIELDS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>{language === "fr" ? f.fr : f.en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">{t("onboarding.interestsLabel")}</label>
          <div className="flex gap-2">
            <Input
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addInterest(); } }}
              placeholder={t("onboarding.interestsPlaceholder")}
              maxLength={40}
            />
            <Button
              type="button"
              variant="outline"
              onClick={addInterest}
              disabled={interests.length >= MAX_ONBOARDING_INTERESTS}
            >
              {t("submit.add")}
            </Button>
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

        <div className="flex justify-end pt-1">
          <Button onClick={handleSave} disabled={saving || !canSave} size="sm" className="rounded-full px-5">
            {t("onboarding.save")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingCard;
