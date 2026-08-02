import { describe, it, expect } from "vitest";
import { findBibliographySection } from "./extractSources";

// Builds a fake pdf object matching the subset of unpdf's PDFDocumentProxy
// that findBibliographySection actually uses: `numPages` and
// `getPage(n).getTextContent()` returning `{ items: [{ str }] }`.
function fakePdf(pages: string[][]) {
  return {
    numPages: pages.length,
    getPage: async (n: number) => ({
      getTextContent: async () => ({
        items: pages[n - 1].map((str) => ({ str })),
      }),
    }),
  };
}

describe("findBibliographySection", () => {
  it("locates the bibliography via the table of contents and stops at the annex heading", async () => {
    // page 1 is a ToC entry ("Bibliographie ... 8"); page 8 carries the real
    // heading + first references; page 10 starts the annexes, which must be
    // excluded even though it's within the forward-read window.
    const pages: string[][] = Array.from({ length: 12 }, () => ["Filler content."]);
    pages[0] = ["Introduction 3", "Chapitre 1 5", "Bibliographie 8", "Annexes 10"];
    pages[7] = ["Bibliographie", "Dupont, M. (2020). Premier titre. Éditeur A."];
    pages[8] = ["Martin, J. (2019). Second titre. Éditeur B."];
    pages[9] = ["Annexes", "Retranscription d'entretien qui ne doit pas apparaître."];

    const { text, source } = await findBibliographySection(fakePdf(pages), 20000);

    expect(source).toBe("toc");
    expect(text).toContain("Dupont, M.");
    expect(text).toContain("Martin, J.");
    expect(text).not.toContain("Retranscription");
    expect(text).not.toContain("Annexes");
  });

  it("locates the ToC entry even with a long Word-style dot-leader before the page number", async () => {
    // Reproduces a real failure seen on a theses.fr import: a Word-generated
    // ToC put 100+ dots between "References" and its page number, well past
    // what a small fixed non-digit character cap would tolerate — without
    // the [.\s]-specific match in findTocPageNumber, this ToC entry is
    // invisible and the section is never found at page 6.
    const pages: string[][] = Array.from({ length: 12 }, () => ["Filler content."]);
    pages[0] = [`References ${".".repeat(120)} 6`];
    pages[5] = ["References", "Smith, A. (2018). A title. A press."];

    const { text, source } = await findBibliographySection(fakePdf(pages), 20000);

    expect(source).toBe("toc");
    expect(text).toContain("Smith, A.");
  });

  it("falls back to scanning backward from the end when there's no usable ToC entry", async () => {
    // The heading sits on the very last page, outside the 20-page ToC scan
    // window (TOC_SCAN_PAGES) entirely, so there's no year-next-to-a-heading
    // text anywhere in that window to be mistaken for a ToC page number.
    const pages: string[][] = Array.from({ length: 25 }, () => ["Filler content."]);
    pages[24] = ["Bibliography", "Smith, A. (2018). A title. A press."];

    const { source, text } = await findBibliographySection(fakePdf(pages), 20000);

    expect(source).toBe("backward-scan");
    expect(text).toContain("Smith, A.");
  });

  it("falls back to the last pages when no heading can be found at all", async () => {
    const pages: string[][] = Array.from({ length: 20 }, (_, i) => [`Page ${i + 1} filler content.`]);

    const { source, text } = await findBibliographySection(fakePdf(pages), 20000);

    expect(source).toBe("fallback");
    // FALLBACK_PAGES is 15 of 20 total pages, so extraction should start at page 6.
    expect(text).toContain("Page 6 filler");
    expect(text).not.toContain("Page 5 filler");
  });

  it("stops reading once maxChars is reached, instead of walking the whole section", async () => {
    const pages: string[][] = [["Bibliographie"], ["a".repeat(50)], ["b".repeat(50)], ["c".repeat(50)]];

    const { text } = await findBibliographySection(fakePdf(pages), 60);

    expect(text).toContain("Bibliographie");
    expect(text).toContain("a".repeat(50));
    expect(text).not.toContain("b".repeat(50));
    expect(text).not.toContain("c".repeat(50));
  });
});
