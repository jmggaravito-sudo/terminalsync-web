import { describe, expect, it } from "vitest";
import { normalizeLang } from "./userLang";

describe("normalizeLang", () => {
  it("maps English locales to en", () => {
    for (const l of ["en", "en-US", "en-GB", "EN", "en_us"]) {
      expect(normalizeLang(l)).toBe("en");
    }
  });

  it("maps Spanish and everything unknown to es (safe default)", () => {
    for (const l of ["es", "es-AR", "es-419", "ES", "pt-BR", "fr", "", null, undefined]) {
      expect(normalizeLang(l)).toBe("es");
    }
  });
});
