// Basic anti-spam heuristics for thesis submissions. These mirror (but are
// looser than) the server-side CHECK constraints in the
// 20260730120000_lock_thesis_author_and_antispam.sql migration — the server
// is the source of truth, this just gives faster, friendlier feedback.

const MIN_TITLE_LENGTH = 5;
const MIN_ABSTRACT_LENGTH = 150;
const MIN_ABSTRACT_WORDS = 20;
const MIN_UNIQUE_WORD_RATIO = 0.3;

export type ThesisValidationError = "title_too_short" | "abstract_too_short" | "abstract_repetitive";

export function validateThesisTitle(title: string): ThesisValidationError | null {
  if (title.trim().length < MIN_TITLE_LENGTH) return "title_too_short";
  return null;
}

export function validateThesisAbstract(abstract: string): ThesisValidationError | null {
  const trimmed = abstract.trim();
  const words = trimmed.toLowerCase().split(/\s+/).filter(Boolean);

  if (trimmed.length < MIN_ABSTRACT_LENGTH || words.length < MIN_ABSTRACT_WORDS) {
    return "abstract_too_short";
  }

  const uniqueRatio = new Set(words).size / words.length;
  if (uniqueRatio < MIN_UNIQUE_WORD_RATIO) {
    return "abstract_repetitive";
  }

  return null;
}
