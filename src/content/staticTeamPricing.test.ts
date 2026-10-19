import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const html = readFileSync("public/landing-b/index.html", "utf8");
const i18n = readFileSync("public/landing-b/i18n.js", "utf8");
const card = html.match(/<article[^>]+id="plan-team"[\s\S]*?<\/article>/)?.[0] ?? "";

describe("Team on the actual static production landing", () => {
  it("publishes the approved announcement without enabling checkout or signup", () => {
    expect(card).toContain("$59");
    expect(card).toContain("USD / empleado / mes");
    expect(card).toContain("Al lanzamiento, toda cuenta nueva iniciará automáticamente una prueba Team completa de 7 días (168 horas), sin tarjeta");
    expect(card).toContain("Al terminar, eliges un plan; no habrá cobro automático");
    expect(card).toContain("Próximamente: espacios compartidos para colaborar en equipo");
    expect(card).toContain("Para equipos de 1 a 64 personas");
    expect(card).toContain("Al lanzamiento, al terminar la prueba de 7 días (168 horas), eliges si continúas; no habrá cobro automático");
    expect(card).toContain("Al lanzamiento, compartir respuestas o documentos requerirá aprobación antes de enviarlos");
    expect(card).toContain("Stripe");
    expect(card).toContain("La prueba Team y el checkout aún no están disponibles");
    expect(card).toContain("Pro y Max no cambian");
    expect(card).not.toContain("Mercado");
    expect(card).not.toMatch(/<(?:a|button|form)\b|href=|data-cta=/);
    expect(html).toContain("grid-column:1/-1");
  });
  it("translates every new Spanish text node using the existing English dictionary", () => {
    for (const node of card.matchAll(/>([^<>]+)</g)) {
      const text = node[1].trim();
      if (!text || text === "Team" || text === "$59") continue;
      expect(i18n).toContain(JSON.stringify(text) + ": ");
    }
    expect(i18n).toContain("automatically start a full 7-day (168-hour) Team trial with no card");
    expect(i18n).toContain("after the 7-day (168-hour) trial");
    expect(i18n).toContain("will be no automatic charge");
    expect(i18n).toContain("sharing answers or documents will require approval");
    expect(i18n).toContain("For teams of 1–64 people");
    expect(i18n).toContain("The Team trial and checkout are not available yet");
  });
  it("keeps the existing Pro and Max prices and download actions", () => {
    expect(html).toContain('$34<i> / mes</i>');
    expect(html).toContain('$54<i> / mes</i>');
    expect(html).toContain('data-cta="pricing-b-starter"');
    expect(html).toContain('data-cta="pricing-b-pro"');
  });
});
