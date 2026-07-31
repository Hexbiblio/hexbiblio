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
