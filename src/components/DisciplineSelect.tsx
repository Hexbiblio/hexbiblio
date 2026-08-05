import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { FIELDS } from "@/i18n/fields";

const OTHER = "Other";
const isKnownField = (value: string) => FIELDS.some((f) => f.value === value);

interface DisciplineSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}

// FIELDS' "Other" option stores nothing useful on its own — just the literal
// word "Autre"/"Other" — which is exactly the generic-bucket problem that
// motivated expanding the list in the first place (see fields.ts). This
// wraps the same Select with a required follow-up input that becomes the
// actual stored value instead, so a discipline that doesn't fit the list
// still lands as real, filterable text.
//
// `value` is decomposed into Select-vs-custom-text state once at mount —
// every call site remounts this fresh (conditional rendering or a new
// page) rather than resetting `value` on a live instance, so a value that
// doesn't match any FIELDS entry is treated as a previously-specified
// custom discipline: the select shows "Other" and the input is pre-filled
// with it, rather than showing blank.
const DisciplineSelect = ({ value, onChange, placeholder, className }: DisciplineSelectProps) => {
  const { language, t } = useLanguage();
  const [selected, setSelected] = useState(() => (value && !isKnownField(value) ? OTHER : value));
  const [customText, setCustomText] = useState(() => (value && !isKnownField(value) ? value : ""));

  const handleSelect = (v: string) => {
    setSelected(v);
    onChange(v === OTHER ? customText.trim() : v);
  };

  const handleCustomText = (text: string) => {
    setCustomText(text);
    onChange(text.trim());
  };

  return (
    <div className={className}>
      <Select value={selected} onValueChange={handleSelect}>
        <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent>
          {FIELDS.map((f) => (
            <SelectItem key={f.value} value={f.value}>{language === "fr" ? f.fr : f.en}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selected === OTHER && (
        <Input
          value={customText}
          onChange={(e) => handleCustomText(e.target.value)}
          placeholder={t("fields.specifyOther")}
          maxLength={100}
          className="mt-1.5"
        />
      )}
    </div>
  );
};

export default DisciplineSelect;
