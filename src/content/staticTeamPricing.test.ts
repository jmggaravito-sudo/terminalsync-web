import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const html = readFileSync("public/landing-b/index.html", "utf8");
const i18n = readFileSync("public/landing-b/i18n.js", "utf8");
const card = html.match(/<article[^>]+id="plan-team"[\s\S]*?<\/article>/)?.[0] ?? "";

describe("Team on the actual static production landing", () => {
  it("publishes the approved announcement without enabling checkout or signup", () => {
    expect(card).toContain("$59");
    expect(card).toContain("/ empleado / mes");
    expect(card).toContain("7 días");
    expect(card).toContain("sin tarjeta");
    expect(card).toContain("Stripe");
    expect(card).toContain("pago y registro a prueba aún no están disponibles");
    expect(card).toContain("Pro y Max no cambian");
    expect(card).not.toMatch(/<(?:a|button|form)\b|href=|data-cta=/);
    expect(html).toContain("grid-column:1/-1");
  });
  it("translates every new Spanish text node using the existing English dictionary", () => {
    for (const node of card.matchAll(/>([^<>]+)</g)) {
      const text = node[1].trim();
      if (!text || text === "Team" || text === "$59") continue;
      expect(i18n).toContain(JSON.stringify(text) + ": ");
    }
    expect(i18n).toContain("7-day Team trial with all Team features, no card required");
    expect(i18n).toContain("paid checkout and trial signup are not available yet");
  });
  it("keeps the existing Pro and Max prices and download actions", () => {
    expect(html).toContain('$34<i> / mes</i>');
    expect(html).toContain('$54<i> / mes</i>');
    expect(html).toContain('data-cta="pricing-b-starter"');
    expect(html).toContain('data-cta="pricing-b-pro"');
  });
});
