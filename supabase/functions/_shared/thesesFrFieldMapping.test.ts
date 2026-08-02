import { describe, it, expect } from "vitest";
import { parseTheseFrDefenseYear } from "./thesesFrFieldMapping";

describe("parseTheseFrDefenseYear", () => {
  it("extracts the year from theses.fr's DD/MM/YYYY format", () => {
    // Real samples fetched live from theses.fr's API — confirmed the same
    // format on both the search and detail endpoints.
    expect(parseTheseFrDefenseYear("15/12/2020")).toBe(2020);
    expect(parseTheseFrDefenseYear("29/10/2010")).toBe(2010);
    expect(parseTheseFrDefenseYear("17/12/2018")).toBe(2018);
  });

  it("handles placeholder dates where only the year is meaningful", () => {
    expect(parseTheseFrDefenseYear("01/01/1994")).toBe(1994);
  });

  it("regression: does not fall for the old .slice(0, 4) bug (would have read '15/1' as the year)", () => {
    const year = parseTheseFrDefenseYear("15/12/2020");
    expect(year).not.toBe(15);
    expect(year).toBe(2020);
  });

  it("returns null for missing or malformed dates instead of a garbage number", () => {
    expect(parseTheseFrDefenseYear(null)).toBeNull();
    expect(parseTheseFrDefenseYear(undefined)).toBeNull();
    expect(parseTheseFrDefenseYear("")).toBeNull();
    expect(parseTheseFrDefenseYear("not a date")).toBeNull();
    expect(parseTheseFrDefenseYear("2020-12-15")).toBeNull(); // wrong separator entirely
  });
});
