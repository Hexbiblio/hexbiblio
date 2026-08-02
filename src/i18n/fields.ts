import { Language } from "./translations";

export interface FieldOption {
  value: string;
  en: string;
  fr: string;
}

// `value` is the canonical string stored in the database — never translate it.
export const FIELDS: FieldOption[] = [
  { value: "Computer Science", en: "Computer Science", fr: "Informatique" },
  { value: "Mathematics", en: "Mathematics", fr: "Mathématiques" },
  { value: "Physics", en: "Physics", fr: "Physique" },
  { value: "Biology", en: "Biology", fr: "Biologie" },
  { value: "Chemistry", en: "Chemistry", fr: "Chimie" },
  { value: "Engineering", en: "Engineering", fr: "Ingénierie" },
  { value: "Medicine", en: "Medicine", fr: "Médecine" },
  { value: "Psychology", en: "Psychology", fr: "Psychologie" },
  { value: "Economics", en: "Economics", fr: "Économie" },
  { value: "Management", en: "Management", fr: "Management" },
  { value: "Marketing", en: "Marketing", fr: "Marketing" },
  { value: "Finance", en: "Finance", fr: "Finance" },
  { value: "Sports Science", en: "Sports Science", fr: "Sciences du sport" },
  { value: "Political Science", en: "Political Science", fr: "Sciences politiques" },
  { value: "International Relations", en: "International Relations", fr: "Relations internationales" },
  { value: "Communication", en: "Communication", fr: "Communication" },
  { value: "Law", en: "Law", fr: "Droit" },
  { value: "Philosophy", en: "Philosophy", fr: "Philosophie" },
  { value: "Literature", en: "Literature", fr: "Littérature" },
  { value: "History", en: "History", fr: "Histoire" },
  { value: "Sociology", en: "Sociology", fr: "Sociologie" },
  { value: "Anthropology", en: "Anthropology", fr: "Anthropologie" },
  { value: "Arts", en: "Arts", fr: "Arts" },
  { value: "Education", en: "Education", fr: "Éducation" },
  { value: "Other", en: "Other", fr: "Autre" },
];

export const DEGREE_TYPES: FieldOption[] = [
  { value: "Bachelor", en: "Bachelor", fr: "Licence" },
  { value: "Master", en: "Master", fr: "Master" },
  { value: "PhD", en: "PhD", fr: "Doctorat" },
  { value: "Other", en: "Other", fr: "Autre" },
];

// `academic_level` on profiles is a broader, looser notion than theses.degree_type
// (includes stages before/after a degree, e.g. high school or postdoc) — kept
// as its own list rather than reusing DEGREE_TYPES.
export const ACADEMIC_LEVELS: FieldOption[] = [
  { value: "High School", en: "High School", fr: "Lycée" },
  { value: "Bachelor", en: "Bachelor", fr: "Licence" },
  { value: "Master", en: "Master", fr: "Master" },
  { value: "PhD", en: "PhD", fr: "Doctorat" },
  { value: "Postdoc", en: "Postdoc", fr: "Post-doctorat" },
  { value: "Professor", en: "Professor", fr: "Professeur" },
  { value: "Other", en: "Other", fr: "Autre" },
];

export const REPORT_REASONS: FieldOption[] = [
  { value: "Plagiarism", en: "Plagiarism", fr: "Plagiat" },
  { value: "Inappropriate", en: "Inappropriate content", fr: "Contenu inapproprié" },
  { value: "Spam", en: "Spam", fr: "Spam" },
  { value: "Incorrect", en: "Incorrect information", fr: "Information incorrecte" },
  { value: "Other", en: "Other", fr: "Autre" },
];

// Keyed by ISO 639-1 — theses.detected_language is normalized to this format
// regardless of origin (see supabase/functions/_shared/languageDetection.ts):
// franc's native 639-3 output is mapped down to 639-1 for community
// submissions, and theses.fr's own `langues` field is already 639-1 for
// imports. Only the languages actually expected in this corpus — the
// detector itself recognizes ~400 regardless, this is purely a display label
// table, so an unmapped code just falls back to showing itself as-is.
export const LANGUAGES: FieldOption[] = [
  { value: "fr", en: "French", fr: "français" },
  { value: "en", en: "English", fr: "anglais" },
  { value: "es", en: "Spanish", fr: "espagnol" },
  { value: "de", en: "German", fr: "allemand" },
  { value: "it", en: "Italian", fr: "italien" },
  { value: "pt", en: "Portuguese", fr: "portugais" },
  { value: "nl", en: "Dutch", fr: "néerlandais" },
  { value: "ar", en: "Arabic", fr: "arabe" },
  { value: "zh", en: "Chinese", fr: "chinois" },
  { value: "ru", en: "Russian", fr: "russe" },
  { value: "ja", en: "Japanese", fr: "japonais" },
];

// A rolling 30-year window, most recent first — plenty of headroom for a
// still-young archive. Shared here rather than redeclared per page (it was
// previously duplicated in SubmitThesis.tsx and ThesisDetail.tsx).
export const YEARS: number[] = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

const buildLookup = (options: FieldOption[]) => {
  const map = new Map(options.map((o) => [o.value, o]));
  return (value: string | null | undefined, language: Language): string => {
    if (!value) return "";
    const match = map.get(value);
    return match ? match[language] : value;
  };
};

export const fieldLabel = buildLookup(FIELDS);
export const degreeLabel = buildLookup(DEGREE_TYPES);
export const reportReasonLabel = buildLookup(REPORT_REASONS);
export const languageLabel = buildLookup(LANGUAGES);
