import { describe, expect, it } from "vitest";
import { normalizeTeamDisplayName, safeTeamDisplayName } from "./teamDisplayName";

describe("Team safe display names", () => {
  it("accepts only canonical persisted names", () => {
    expect(safeTeamDisplayName("Proyecto de Alex 2026")).toBe("Proyecto de Alex 2026");
    expect(safeTeamDisplayName("Árbol Ñandú-2")).toBe("Árbol Ñandú-2");
    expect(safeTeamDisplayName(" Proyecto de Alex ")).toBeNull();
  });

  it("normalizes only ordinary outer spaces for a create", () => {
    expect(normalizeTeamDisplayName(" Proyecto de Alex ")).toBe("Proyecto de Alex");
    expect(normalizeTeamDisplayName("\tProyecto de Alex")).toBeNull();
    expect(normalizeTeamDisplayName("Proyecto\nde Alex")).toBeNull();
  });

  it("rejects URL, path, punctuation, and content-shaped names", () => {
    for (const unsafe of [
      "https://private.example/team",
      "/Users/alex/secret.pdf",
      "Proyecto: secreto",
      "Proyecto_2026",
      "<script>",
      " ",
    ]) {
      expect(safeTeamDisplayName(unsafe)).toBeNull();
      expect(normalizeTeamDisplayName(unsafe)).toBeNull();
    }
  });
});
