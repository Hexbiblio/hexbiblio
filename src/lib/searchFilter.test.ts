import { describe, it, expect } from "vitest";
import { buildIlikeOrFilter, foldAccents } from "./searchFilter";

describe("buildIlikeOrFilter", () => {
  it("builds one ilike condition per column", () => {
    expect(buildIlikeOrFilter(["title", "authors"], "sociologie")).toBe(
      'title.ilike."%sociologie%",authors.ilike."%sociologie%"',
    );
  });

  it("keeps a comma inside the quoted value instead of splitting the filter", () => {
    // The regression this helper exists for: PostgREST separates `or=(...)`
    // conditions on commas, so an unquoted "Dupont, M." became two broken
    // conditions. Each column must still contribute exactly one condition.
    const filter = buildIlikeOrFilter(["raw_citation", "authors"], "Dupont, M.");
    expect(filter).toBe('raw_citation.ilike."%Dupont, M.%",authors.ilike."%Dupont, M.%"');
    expect(filter.split('",').length).toBe(2);
  });

  it("escapes quotes and backslashes so the value can't break out", () => {
    expect(buildIlikeOrFilter(["title"], 'a"b')).toBe('title.ilike."%a\\"b%"');
    expect(buildIlikeOrFilter(["title"], "a\\b")).toBe('title.ilike."%a\\\\b%"');
  });

  it("trims surrounding whitespace", () => {
    expect(buildIlikeOrFilter(["title"], "  histoire  ")).toBe('title.ilike."%histoire%"');
  });
});

describe("foldAccents", () => {
  // Must match unaccent_immutable() in the 20260802090000 migration exactly —
  // this is what makes a typed "memoire" find a stored "mémoire" via
  // websearch_to_tsquery on both sides of the comparison.
  it("strips common French accents", () => {
    expect(foldAccents("mémoire")).toBe("memoire");
    expect(foldAccents("société éducative à Noël")).toBe("societe educative a Noel");
  });

  it("leaves unaccented text untouched", () => {
    expect(foldAccents("machine learning finance")).toBe("machine learning finance");
  });

  it("preserves websearch operators (quotes, hyphen exclusion) so they still parse server-side", () => {
    expect(foldAccents('"réseaux sociaux" -éducation')).toBe('"reseaux sociaux" -education');
  });
});
