// Best-effort mapping from theses.fr's free-text "discipline" field to
// HexBiblio's own field list (src/i18n/fields.ts's FIELDS — kept in sync
// manually here since edge functions run in a separate Deno bundle and can't
// import from src/). theses.fr's API contract doesn't publish a fixed
// discipline enum, so this matches on French keywords rather than an exact
// lookup table — more robust to wording variants, but log unmapped
// disciplines during the first real batches (see import-theses-fr) and
// extend this list from what's actually observed, rather than trusting this
// as exhaustive.

interface FieldRule {
  value: string;
  keywords: string[];
}

const RULES: FieldRule[] = [
  { value: "Computer Science", keywords: ["informatique", "intelligence artificielle"] },
  { value: "Mathematics", keywords: ["mathematique"] },
  { value: "Physics", keywords: ["physique"] },
  { value: "Biology", keywords: ["biologie", "biochimie", "genetique", "microbiologie"] },
  { value: "Chemistry", keywords: ["chimie"] },
  { value: "Engineering", keywords: ["genie civil", "genie mecanique", "genie electrique", "genie des procedes", "sciences pour l'ingenieur", "ingenierie"] },
  { value: "Medicine", keywords: ["medecine", "sciences medicales", "pharmacie", "sante publique", "odontologie"] },
  { value: "Psychology", keywords: ["psychologie"] },
  { value: "Economics", keywords: ["sciences economiques", "economie"] },
  { value: "Management", keywords: ["sciences de gestion", "gestion", "management"] },
  { value: "Marketing", keywords: ["marketing"] },
  { value: "Finance", keywords: ["finance"] },
  { value: "Sports Science", keywords: ["staps", "sciences du sport"] },
  { value: "Political Science", keywords: ["science politique", "sciences politiques"] },
  { value: "International Relations", keywords: ["relations internationales", "etudes internationales"] },
  { value: "Communication", keywords: ["sciences de l'information et de la communication", "communication"] },
  { value: "Law", keywords: ["droit"] },
  { value: "Philosophy", keywords: ["philosophie"] },
  { value: "Literature", keywords: ["litterature", "lettres", "langues"] },
  { value: "History", keywords: ["histoire"] },
  { value: "Sociology", keywords: ["sociologie", "demographie"] },
  { value: "Anthropology", keywords: ["anthropologie", "ethnologie"] },
  { value: "Arts", keywords: ["arts", "musicologie", "esthetique", "histoire de l'art"] },
  { value: "Education", keywords: ["sciences de l'education", "education"] },
];

function normalize(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function mapThesesFrDiscipline(discipline: string | null | undefined): string {
  if (!discipline) return "Other";
  const normalized = normalize(discipline);
  for (const rule of RULES) {
    if (rule.keywords.some((k) => normalized.includes(normalize(k)))) return rule.value;
  }
  return "Other";
}

// theses.fr's dateSoutenance is "DD/MM/YYYY" (confirmed live against both the
// search and detail endpoints — e.g. "15/12/2020"), not ISO/YYYY-first. A
// previous version of this import read `.slice(0, 4)`, which on that format
// grabs "15/1" instead of the year and silently stored garbage as
// graduation_year for every imported thesis. Splitting on "/" and taking the
// last segment gets the year regardless of day/month, including placeholder
// dates like "01/01/1994" where only the year is meaningful.
export function parseTheseFrDefenseYear(dateSoutenance: string | null | undefined): number | null {
  const parts = (dateSoutenance ?? "").split("/");
  if (parts.length !== 3) return null;
  const year = parseInt(parts[2], 10);
  return Number.isFinite(year) && year > 1900 && year < 2100 ? year : null;
}
