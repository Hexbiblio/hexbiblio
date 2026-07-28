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
  { value: "Law", en: "Law", fr: "Droit" },
  { value: "Philosophy", en: "Philosophy", fr: "Philosophie" },
  { value: "Literature", en: "Literature", fr: "Littérature" },
  { value: "History", en: "History", fr: "Histoire" },
  { value: "Sociology", en: "Sociology", fr: "Sociologie" },
  { value: "Education", en: "Education", fr: "Éducation" },
  { value: "Other", en: "Other", fr: "Autre" },
];

export const DEGREE_TYPES: FieldOption[] = [
  { value: "Bachelor", en: "Bachelor", fr: "Licence" },
  { value: "Master", en: "Master", fr: "Master" },
  { value: "PhD", en: "PhD", fr: "Doctorat" },
  { value: "Other", en: "Other", fr: "Autre" },
];

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
