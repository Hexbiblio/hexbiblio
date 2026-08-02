// PostgREST reads the body of an `or=(...)` filter as a comma-separated list of
// conditions, so interpolating a raw search term into it breaks apart the moment
// the term contains a comma: searching "Dupont, M." produced
// `or=(raw_citation.ilike.%Dupont, M.%,...)` — parsed as one truncated condition
// plus a malformed one. That made author-style searches (the main way anyone
// looks something up in a bibliography) fail outright on /sources.
//
// Wrapping each value in double quotes makes PostgREST treat the comma as a
// literal. Inside those quotes only `"` and `\` still carry meaning, so those
// are the two characters to escape.
function escapeFilterValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * Builds a PostgREST `or` filter matching `search` against every column, safe
 * for terms containing commas, quotes or backslashes.
 *
 *   buildIlikeOrFilter(["title", "authors"], 'Dupont, M.')
 *   // => 'title.ilike."%Dupont, M.%",authors.ilike."%Dupont, M.%"'
 */
export function buildIlikeOrFilter(columns: string[], search: string): string {
  const value = escapeFilterValue(search.trim());
  return columns.map((column) => `${column}.ilike."%${value}%"`).join(",");
}

// The full-text search_vector columns (theses, sources) are built from
// accent-folded text via unaccent_immutable() in Postgres, so a query for
// "memoire" can match a stored "mémoire" — but only if the query sent to
// websearch_to_tsquery is folded the same way. Same NFD-normalize +
// strip-combining-marks trick already used for filenames in
// SubmitThesis.tsx's sanitizeFileName.
export function foldAccents(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "");
}
