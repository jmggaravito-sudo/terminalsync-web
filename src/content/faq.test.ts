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
      expect(items.length).toBe(26);
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
      const sourceCount = getPublicFaq(locale).find((entry) => entry.id === "context.source_count")?.answer;
      const sourceLimits = getPublicFaq(locale).find((entry) => entry.id === "context.source_limits")?.answer;
      const turnInclusion = getPublicFaq(locale).find((entry) => entry.id === "context.turn_inclusion")?.answer;
      expect(sourceCount).toBeDefined();
      expect(sourceLimits).toBeDefined();
      expect(turnInclusion).toBeDefined();
      expect(sourceCount).toMatch(locale === "es" ? /No tenemos aún un máximo documentado por categoría/ : /do not yet have a documented maximum by category/i);
      expect(sourceCount).toMatch(locale === "es" ? /no significa que sea ilimitado/ : /does not mean unlimited/i);
      for (const value of locale === "es"
        ? ["60.000 caracteres", "16 MiB", "5 MiB", "20.000 caracteres"]
        : ["60,000 characters", "16 MiB", "5 MiB", "20,000 characters"]) {
        expect(sourceLimits).toContain(value);
      }
      expect(sourceLimits).toMatch(locale === "es" ? /no el tamaño total admitido del archivo/ : /not the total file size accepted/i);
      expect(turnInclusion).toContain(locale === "es" ? "24.000 tokens" : "24,000 tokens");
      expect(turnInclusion).toMatch(locale === "es" ? /presupuesto estimado/ : /estimated budget/i);
      expect(turnInclusion).toMatch(locale === "es" ? /no un límite universal de la ventana del modelo ni del plan/ : /not a universal limit for the model window or plan/i);
      expect(turnInclusion).toMatch(locale === "es" ? /disponible o incluida.*no prueba/i : /available or included.*does not.*prove/i);
    }
  });

  it("explains the new library without claiming installation or unsupported citation behavior", () => {
    const requiredIds = [
      "context.library_open",
      "context.library_search",
      "context.library_marking",
      "context.library_statuses",
      "context.library_apply_share",
      "context.library_state_lifecycle",
      "context.library_citations",
      "context.library_availability",
    ];
    for (const locale of ["es", "en"] as const) {
      const faq = getPublicFaq(locale);
      for (const id of requiredIds) {
        expect(faq.some((item) => item.id === id)).toBe(true);
      }
      const answers = requiredIds.map(
        (id) => faq.find((item) => item.id === id)?.answer ?? "",
      );
      const text = answers.join(" ");
      expect(text).toMatch(locale === "es" ? /hasta 50|50 resultados/ : /up to 50|50 results/i);
      expect(text).toMatch(locale === "es" ? /no cambia.*IA|IA no cambia/i : /does not change.*AI|AI does not change/i);
      expect(text).toMatch(locale === "es" ? /no garantiza.*fragmento exacto/i : /does not guarantee.*exact fragment/i);
      expect(text).toMatch(locale === "es" ? /instalación.*comprobación/i : /installation.*verification/i);
      expect(text).toMatch(locale === "es" ? /disponible.*incluida.*usada.*citada/i : /available.*included.*used.*cited/i);
      expect(text).toMatch(locale === "es" ? /Elegir fuentes/i : /Choose sources/i);
      expect(text).not.toMatch(/todos los tipos|every context type|all context types/i);
      expect(text).toMatch(locale === "es" ? /no significa OCR/i : /does not mean OCR/i);
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
