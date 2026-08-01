import { describe, it, expect } from "vitest";
import { validateThesisTitle, validateThesisAbstract } from "./thesisValidation";

describe("validateThesisTitle", () => {
  it("rejects a title shorter than 5 characters", () => {
    expect(validateThesisTitle("Ab")).toBe("title_too_short");
  });

  it("trims whitespace before checking length", () => {
    expect(validateThesisTitle("  Test  ")).toBe("title_too_short"); // trims to 4 chars
  });

  it("accepts a title at the minimum length", () => {
    expect(validateThesisTitle("Abcde")).toBeNull();
  });

  it("accepts a normal title", () => {
    expect(validateThesisTitle("L'impact des réseaux sociaux sur la santé mentale")).toBeNull();
  });
});

describe("validateThesisAbstract", () => {
  it("rejects an abstract that's too short", () => {
    expect(validateThesisAbstract("Un résumé trop court.")).toBe("abstract_too_short");
  });

  it("rejects an abstract with enough characters but too few words", () => {
    // 150+ chars via a single long "word" repeated, but under the 20-word floor.
    const abstract = "a".repeat(160);
    expect(validateThesisAbstract(abstract)).toBe("abstract_too_short");
  });

  it("rejects a repetitive abstract that clears the length bar", () => {
    const abstract = Array(30).fill("mémoire mémoire mémoire mémoire").join(" ");
    expect(abstract.length).toBeGreaterThan(150);
    expect(validateThesisAbstract(abstract)).toBe("abstract_repetitive");
  });

  it("accepts a long, varied abstract", () => {
    const abstract =
      "Cette étude examine l'impact des réseaux sociaux sur la santé mentale des adolescents " +
      "en France. À travers une méthodologie mixte combinant entretiens qualitatifs et enquête " +
      "quantitative auprès de trois cents lycéens, nous analysons les corrélations entre temps " +
      "d'écran, estime de soi et symptômes anxieux.";
    expect(validateThesisAbstract(abstract)).toBeNull();
  });
});
