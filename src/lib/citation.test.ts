import { describe, it, expect } from "vitest";
import { buildApaCitation, buildBibtexCitation, buildRisCitation, type CitableThesis } from "./citation";

const thesis: CitableThesis = {
  id: "abc-123",
  title: "L'impact des réseaux sociaux sur la mémoire collective",
  author_name: "Marie Dupont",
  degree_type: "Master",
  graduation_year: 2024,
  created_at: "2024-06-01T00:00:00Z",
};

describe("buildApaCitation", () => {
  it("includes author, year, title, degree bracket and a link back to the thesis", () => {
    const citation = buildApaCitation(thesis, "Master");
    expect(citation).toBe(
      "Marie Dupont. (2024). L'impact des réseaux sociaux sur la mémoire collective [Master]. Hexbiblio. https://hexbiblio.vercel.app/database/abc-123",
    );
  });

  it("omits the bracket entirely when there's no degree label", () => {
    const citation = buildApaCitation(thesis, "");
    expect(citation).not.toContain("[");
  });

  it("falls back to the submission year when graduation_year is missing", () => {
    const noGradYear: CitableThesis = { ...thesis, graduation_year: null };
    expect(buildApaCitation(noGradYear, "Master")).toContain("(2024)");
  });
});

describe("buildBibtexCitation", () => {
  it("uses @mastersthesis for a Master's degree, with a surname+year key", () => {
    const citation = buildBibtexCitation(thesis, "Master");
    expect(citation).toContain("@mastersthesis{dupont2024,");
    expect(citation).toContain("author = {Marie Dupont},");
    expect(citation).toContain("title = {L'impact des réseaux sociaux sur la mémoire collective},");
    expect(citation).toContain("year = {2024},");
    expect(citation).toContain("type = {Master},");
    expect(citation).toContain("url = {https://hexbiblio.vercel.app/database/abc-123},");
  });

  it("uses @phdthesis for a PhD", () => {
    const phd: CitableThesis = { ...thesis, degree_type: "PhD" };
    expect(buildBibtexCitation(phd, "Doctorat")).toContain("@phdthesis{dupont2024,");
  });

  it("folds accents out of the citation key so it stays valid BibTeX syntax", () => {
    const accented: CitableThesis = { ...thesis, author_name: "Émile Bélanger" };
    expect(buildBibtexCitation(accented, "Master")).toContain("@mastersthesis{belanger2024,");
  });

  it("omits the type field when there's no degree label", () => {
    expect(buildBibtexCitation(thesis, "")).not.toContain("type =");
  });
});

describe("buildRisCitation", () => {
  it("produces a THES-type RIS record importable by Zotero/Mendeley/EndNote", () => {
    const citation = buildRisCitation(thesis, "Master");
    expect(citation).toBe(
      [
        "TY  - THES",
        "AU  - Marie Dupont",
        "TI  - L'impact des réseaux sociaux sur la mémoire collective",
        "PY  - 2024",
        "M3  - Master",
        "UR  - https://hexbiblio.vercel.app/database/abc-123",
        "ER  - ",
      ].join("\n"),
    );
  });

  it("omits the M3 (type of work) line when there's no degree label", () => {
    expect(buildRisCitation(thesis, "")).not.toContain("M3");
  });
});
