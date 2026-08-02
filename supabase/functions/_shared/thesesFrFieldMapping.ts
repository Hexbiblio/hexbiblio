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
