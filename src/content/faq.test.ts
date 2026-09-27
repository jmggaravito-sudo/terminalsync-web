import { describe, expect, it } from "vitest";
import { getHomeFaq, getPublicFaq } from "./faq";

const RETAINED_IDS = new Set([
  "launch.recipes",
  "launch.advanced_ai",
  "launch.automated_work",
  "launch.computer_use",
]);

describe("public FAQ projection", () => {
  it("keeps only the public fields in both locales", () => {
    for (const locale of ["es", "en"] as const) {
      const items = getPublicFaq(locale);
      expect(items.length).toBe(16);
      for (const item of items) {
        expect(Object.keys(item).sort()).toEqual([
          "aliases",
          "answer",
          "category",
          "id",
          "question",
        ]);
        expect(RETAINED_IDS.has(item.id)).toBe(false);
        expect(item.answer).not.toMatch(/beacon|smoke|tool_calls|f4f52f47e/i);
      }
    }
  });

  it("keeps the landing projection to ten questions", () => {
    expect(getHomeFaq("es")).toHaveLength(10);
    expect(getHomeFaq("en")).toHaveLength(10);
    expect(getHomeFaq("es").map((item) => item.id)).toEqual(
      getHomeFaq("en").map((item) => item.id),
    );
  });

  it("does not hardcode prices in the public pricing answer", () => {
    for (const locale of ["es", "en"] as const) {
      const item = getPublicFaq(locale).find((entry) => entry.id === "plans.current_pricing");
      expect(item?.answer).toBeDefined();
      expect(item?.answer).not.toMatch(/\$\d|\d+\s*(?:USD|days|días)/i);
    }
  });

  it("states verified Context limits without inventing a universal source count", () => {
    for (const locale of ["es", "en"] as const) {
      const item = getPublicFaq(locale).find((entry) => entry.id === "context.limits");
      expect(item?.answer).toBeDefined();
      expect(item?.answer).toMatch(locale === "es" ? /60\.000|16 MiB|5 MiB|20\.000|24\.000 tokens/i : /60,000|16 MiB|5 MiB|20,000|24,000-token/i);
      expect(item?.answer).toMatch(locale === "es" ? /No hay una cifra pública única|no publicamos aquí un límite numérico único/i : /no single public source-count limit|do not publish one universal numeric source or size limit/i);
      expect(item?.answer).toMatch(locale === "es" ? /Guardar o indexar.*no significa/i : /Saving or indexing.*does not mean/i);
      expect(item?.answer).not.toMatch(/ilimitad|unlimited|sin límite|no limit/i);
    }
  });

  it("keeps platform and privacy answers client-safe and legally bounded", () => {
    const platformAnswers = new Map<string, string>();
    for (const locale of ["es", "en"] as const) {
      const faq = getPublicFaq(locale);
      const platform = faq.find((item) => item.id === "platforms.launch_scope")?.answer;
      const privacy = faq.find((item) => item.id === "privacy.what_is_encrypted")?.answer;
      expect(platform).toBeDefined();
      expect(privacy).toBeDefined();
      platformAnswers.set(locale, platform ?? "");

      expect(platform).toMatch(/macOS/i);
      expect(platform).toMatch(/Windows/i);
      expect(platform).toMatch(/Linux/i);
      expect(platform).not.toMatch(/dirección|anuncies|release direction|do not present|signing is completed/i);
      expect(privacy).toMatch(locale === "es" ? /IA incluida|proveedor de IA|material de Contexto|cifran/i : /included AI|AI provider|Context material|encrypted/i);
      expect(privacy).not.toMatch(/ni nosotros podemos|neither we nor|never pass through our servers/i);
    }
    expect(platformAnswers.get("es")).toContain("en preparación");
    expect(platformAnswers.get("en")).toContain("in preparation");
  });
});
