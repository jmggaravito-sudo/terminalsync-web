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
      expect(items.length).toBe(15);
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
});
