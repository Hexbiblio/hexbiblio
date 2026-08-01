// Test-only stub for the Deno "npm:unpdf" specifier imported by
// supabase/functions/_shared/extractSources.ts. Vitest runs under Node, which
// can't resolve that specifier, so vitest.config.ts aliases it here. Only
// findBibliographySection (pure logic, takes a fake `pdf` object) is under
// test — getDocumentProxy should never actually run.
export async function getDocumentProxy(): Promise<never> {
  throw new Error("getDocumentProxy stub should not be called in tests");
}
