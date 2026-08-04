import { foldAccents } from "./searchFilter";

export interface CitableThesis {
  id: string;
  title: string;
  author_name: string;
  degree_type: string | null;
  graduation_year: number | null;
  created_at: string;
}

const THESIS_URL_BASE = "https://www.hexbiblio.fr/database";

// graduation_year is optional metadata; created_at (submission date) always
// exists, so a citation never ends up with a blank year.
function citationYear(thesis: CitableThesis): number {
  return thesis.graduation_year ?? new Date(thesis.created_at).getFullYear();
}

function citationUrl(thesis: CitableThesis): string {
  return `${THESIS_URL_BASE}/${thesis.id}`;
}

export function buildApaCitation(thesis: CitableThesis, degreeLabel: string): string {
  const year = citationYear(thesis);
  const bracket = degreeLabel ? ` [${degreeLabel}]` : "";
  return `${thesis.author_name}. (${year}). ${thesis.title}${bracket}. Hexbiblio. ${citationUrl(thesis)}`;
}

// BibTeX has no dedicated "bachelor's thesis" entry type — @mastersthesis is
// the closest standard type for anything short of a doctorate, with `type`
// overriding its default rendered text ("Master's thesis") to whatever this
// thesis's actual degree_type is.
function bibtexEntryType(degreeType: string | null): "phdthesis" | "mastersthesis" {
  return degreeType === "PhD" ? "phdthesis" : "mastersthesis";
}

// "Marie Dupont" -> "dupont2024" — surname (last word, as author_name is
// always entered first-name-then-last, see SubmitThesis.tsx) plus year,
// accent-folded so the key stays valid BibTeX syntax.
function citationKey(thesis: CitableThesis): string {
  const words = thesis.author_name.trim().split(/\s+/);
  const surname = foldAccents(words[words.length - 1] || "auteur").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  return `${surname || "auteur"}${citationYear(thesis)}`;
}

export function buildBibtexCitation(thesis: CitableThesis, degreeLabel: string): string {
  const lines = [
    `@${bibtexEntryType(thesis.degree_type)}{${citationKey(thesis)},`,
    `  author = {${thesis.author_name}},`,
    `  title = {${thesis.title}},`,
    `  year = {${citationYear(thesis)}},`,
  ];
  if (degreeLabel) lines.push(`  type = {${degreeLabel}},`);
  lines.push(`  note = {Hexbiblio},`, `  url = {${citationUrl(thesis)}},`, `}`);
  return lines.join("\n");
}

// RIS: the format Zotero, Mendeley and EndNote actually import (drag the
// .ris file in, or File > Import) — there's no such thing as a distinct
// "Zotero format" to target directly.
export function buildRisCitation(thesis: CitableThesis, degreeLabel: string): string {
  const lines = [
    "TY  - THES",
    `AU  - ${thesis.author_name}`,
    `TI  - ${thesis.title}`,
    `PY  - ${citationYear(thesis)}`,
  ];
  if (degreeLabel) lines.push(`M3  - ${degreeLabel}`);
  lines.push(`UR  - ${citationUrl(thesis)}`, "ER  - ");
  return lines.join("\n");
}
