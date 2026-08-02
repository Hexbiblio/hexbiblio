import { describe, it, expect, vi, afterEach } from "vitest";
import { detectLanguage, isFrench, detectAndTranslateTitle } from "./languageDetection";

// Only the deterministic parts are covered here (no network) — same
// precedent as extractSources.test.ts, which only covers findBibliographySection
// and not the Gemini-calling extractAndStoreSources.
describe("detectLanguage", () => {
  it("detects French from a realistic title + abstract", () => {
    const title = "Émergence des institutions collectives pour la gestion des biens communs";
    const abstract =
      "Cette thèse examine comment les communautés développent des institutions de gouvernance pour gérer des ressources naturelles partagées. À partir de données sur l'expansion ferroviaire aux États-Unis au dix-neuvième siècle, ce travail montre que l'accès au marché façonne l'émergence d'arrangements de gouvernance collective.";
    expect(isFrench(detectLanguage(title, abstract))).toBe(true);
  });

  it("detects English from a realistic title + abstract, distinct from French", () => {
    const title = "Market Access and Institutional Governance";
    const abstract =
      "This dissertation examines how communities develop governance institutions to manage shared natural resources. Using data from railroad expansion in the nineteenth century United States, I show that market access shapes the emergence of collective governance arrangements.";
    const detected = detectLanguage(title, abstract);
    expect(isFrench(detected)).toBe(false);
    expect(detected).toBe("en");
  });

  it("returns \"und\" when there isn't enough text to detect anything reliably", () => {
    expect(detectLanguage("Short", "Too short")).toBe("und");
  });
});

describe("detectAndTranslateTitle", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("skips translation entirely (no Gemini call) when the known/detected language is French", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const result = await detectAndTranslateTitle("Titre en français", "un résumé en français bien assez long pour être détecté", "fake-key");
    expect(isFrench(result.detectedLanguage)).toBe(true);
    expect(result.titleTranslated).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("trusts an explicit knownLanguage over French-looking title/abstract text", async () => {
    // Reproduces a real bug found on a theses.fr import: theses.fr always
    // supplies a mandatory French title+abstract even for a thesis actually
    // written in English, so detecting from that text alone would wrongly
    // read "fr". Callers with an authoritative source (theses.fr's own
    // `langues` field) must be able to override the text-based guess.
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ choices: [{ message: { content: JSON.stringify({ translated: "Titre traduit" }) } }] }),
      }),
    );
    const result = await detectAndTranslateTitle(
      "Titre français obligatoire fourni par theses.fr",
      "Un résumé français obligatoire, mais la thèse elle-même est rédigée en anglais.",
      "fake-key",
      "en",
    );
    expect(result.detectedLanguage).toBe("en");
    expect(result.titleTranslated).toBe("Titre traduit");
  });
});
