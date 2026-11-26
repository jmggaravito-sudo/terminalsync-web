import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const html = readFileSync("public/landing-b/index.html", "utf8");
const i18n = readFileSync("public/landing-b/i18n.js", "utf8");
const card = html.match(/<article[^>]+id="plan-team"[\s\S]*?<\/article>/)?.[0] ?? "";

describe("Team on the actual static production landing", () => {
  it("publishes the approved announcement without enabling checkout or signup", () => {
    expect(card).toContain("$59");
    expect(card).toContain("USD / empleado / mes");
    expect(card).toContain("$59 USD por empleado al mes. Pro y Max no cambian. Hoy Team permite conectar equipos y gestionar invitaciones; el checkout de Stripe llegará en el lanzamiento.");
    expect(card).toContain("Para equipos de 1 a 64 personas");
    expect(card).toContain("Cada integrante conserva sus espacios privados separados");
    expect(card).toContain("La transferencia de conversaciones y documentos llegará en el lanzamiento");
    expect(card).toContain("Checkout de Stripe previsto para el lanzamiento");
    expect(card).toContain("Disponible para conectar equipos y gestionar invitaciones.");
    expect(card).not.toContain("toda cuenta nueva iniciará automáticamente una prueba Team");
    expect(card).not.toContain("no habrá cobro automático");
    expect(card).not.toContain("Próximamente: espacios compartidos para colaborar en equipo");
    expect(card).toContain("Stripe");
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
    expect(i18n).toContain("Team currently supports connecting teams and managing invitations; Stripe checkout is planned for launch.");
    expect(i18n).toContain("Conversation and document transfer is planned for launch");
    expect(i18n).toContain("Available for connecting teams and managing invitations.");
    expect(i18n).toContain("For teams of 1–64 people");
  });
  it("keeps the existing Pro and Max prices and download actions", () => {
    expect(html).toContain('$34<i> / mes</i>');
    expect(html).toContain('$54<i> / mes</i>');
    expect(html).toContain('data-cta="pricing-b-starter"');
    expect(html).toContain('data-cta="pricing-b-pro"');
  });
});
