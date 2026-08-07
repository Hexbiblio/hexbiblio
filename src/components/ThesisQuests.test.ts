import { describe, it, expect } from "vitest";
import { deriveCompleted, detectCompletedQuests, QUEST_PROFILE_FIELD } from "./ThesisQuests";

describe("deriveCompleted", () => {
  it("returns an empty set for a null profile (e.g. not yet loaded)", () => {
    expect(deriveCompleted(null).size).toBe(0);
  });

  it("marks a quest complete when its mapped profile column is non-empty", () => {
    const completed = deriveCompleted({ field_of_study: "Sociologie" });
    expect(completed.has("discipline")).toBe(true);
    expect(completed.has("theme")).toBe(false);
  });

  it("marks a quest incomplete when its column is empty, null, or missing", () => {
    const completed = deriveCompleted({ field_of_study: "", research_theme: null });
    expect(completed.has("discipline")).toBe(false);
    expect(completed.has("theme")).toBe(false);
    expect(completed.has("question")).toBe(false); // column absent entirely
  });

  it("derives every quest independently from its own column — this is what makes progress follow the student across devices", () => {
    const completed = deriveCompleted({
      field_of_study: "Sociologie",
      research_theme: "Réseaux sociaux",
      research_question: null,
      thesis_statement: "",
      methodology: "Qualitative",
      research_sources: "Bourdieu",
    });
    expect([...completed].sort()).toEqual(["discipline", "method", "sources", "theme"].sort());
  });

  it("covers every QuestId via QUEST_PROFILE_FIELD, so a profile with every column filled completes every quest", () => {
    const fullProfile = Object.fromEntries(Object.values(QUEST_PROFILE_FIELD).map((col) => [col, "x"]));
    const completed = deriveCompleted(fullProfile);
    expect(completed.size).toBe(Object.keys(QUEST_PROFILE_FIELD).length);
  });
});

describe("detectCompletedQuests + deriveCompleted integration", () => {
  it("a quest already complete per the profile is never re-detected as newly completed", () => {
    // Regression guard for the cross-device fix: once the server says a
    // quest is done, chat detection must respect that immediately — not just
    // after some local flag catches up.
    const completed = deriveCompleted({ field_of_study: "Sociologie" });
    const ids = detectCompletedQuests("Je m'intéresse à la sociologie de l'éducation", completed);
    expect(ids).not.toContain("discipline");
  });

  it("never throws when the next open quest has no USER_CUES entry (self-report-only quests like 'plan')", () => {
    const completed = deriveCompleted({
      field_of_study: "Sociologie",
      research_theme: "Réseaux sociaux",
      research_question: "Comment ?",
      thesis_statement: "Je soutiens que...",
      methodology: "Qualitative",
      research_sources: "Bourdieu",
    });
    expect(completed.has("plan")).toBe(false);
    expect(() => detectCompletedQuests("N'importe quel message, même long comme celui-ci", completed)).not.toThrow();
    expect(detectCompletedQuests("N'importe quel message, même long comme celui-ci", completed)).toEqual([]);
  });

  it("detects a pasted bibliography for the 'sources' quest by counting citation years, even with no matching phrase", () => {
    // Regression for a real bug report: a student pasted a 64-entry
    // bibliography, then said "Valides mes sources" — neither matched the
    // old narration-only cue ("j'ai lu... article"), so the quest never
    // ticked despite the mentor's chat reply saying it was validated.
    const completed = deriveCompleted({
      field_of_study: "Management",
      research_theme: "Sport de haut niveau",
      research_question: "Comment ?",
      thesis_statement: "Je soutiens que...",
      methodology: "Qualitative",
    });
    const bibliography =
      "1. Commission Nationale de l'Athlétisme Professionnel (2019). Le dispositif\n" +
      "2. Comité International Olympique (2021). Plan 2021-2024 de la solidarité olympique\n" +
      "3. Cour des comptes (2019). L'école et le sport";
    expect(detectCompletedQuests(bibliography, completed)).toEqual(["sources"]);
  });

  it("still requires 3+ citation years for the bibliography-paste fallback, so a single stray year doesn't false-positive", () => {
    const completed = deriveCompleted({
      field_of_study: "Management",
      research_theme: "Sport de haut niveau",
      research_question: "Comment ?",
      thesis_statement: "Je soutiens que...",
      methodology: "Qualitative",
    });
    expect(
      detectCompletedQuests("Mon directeur recommande cet ouvrage (2019) mais je dois encore le consulter.", completed)
    ).toEqual([]);
  });

  it("detects a direct validation phrase for 'sources' ('valide mes sources'), not just narration cues", () => {
    const completed = deriveCompleted({
      field_of_study: "Management",
      research_theme: "Sport de haut niveau",
      research_question: "Comment ?",
      thesis_statement: "Je soutiens que...",
      methodology: "Qualitative",
    });
    expect(detectCompletedQuests("Valides mes sources", completed)).toEqual(["sources"]);
  });

  it("matches French inflections of 'bibliographie', which the old bare 'bibliograph' stem never matched", () => {
    const completed = deriveCompleted({
      field_of_study: "Management",
      research_theme: "Sport de haut niveau",
      research_question: "Comment ?",
      thesis_statement: "Je soutiens que...",
      methodology: "Qualitative",
    });
    expect(detectCompletedQuests("Voici ma bibliographie complète pour le mémoire", completed)).toEqual(["sources"]);
  });
});
