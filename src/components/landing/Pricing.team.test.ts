import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getDict } from "@/content";
import { Pricing } from "./Pricing";

describe("Team card on the public pricing surface", () => {
  it.each(["en", "es"] as const)("frames the planned Team trial and sharing as upcoming without enabling checkout in %s", (locale) => {
    const html = renderToStaticMarkup(createElement(Pricing, { dict: getDict(locale) }));
    const card = html.match(/<article id="plan-team"[\s\S]*?<\/article>/)?.[0];

    expect(card).toBeTruthy();
    expect(card).toContain("$59");
    expect(card).toContain(locale === "en" ? "Team" : "Team");
    expect(card).toContain(locale === "en" ? "/employee/mo" : "/empleado/mes");
    expect(card).toContain(locale === "en" ? "At launch, new users" : "Al lanzamiento, los nuevos usuarios");
    expect(card).toContain(locale === "en" ? "7-day (168-hour)" : "7 días (168 horas)");
    expect(card).toContain(locale === "en" ? "there will be no automatic charge" : "no habrá cobro automático");
    expect(card).toContain(locale === "en" ? "will require approval" : "requerirá aprobación");
    expect(card).toContain(locale === "en" ? "Coming soon: shared spaces" : "Próximamente: espacios compartidos");
    expect(card).toContain(locale === "en" ? "Coming soon · no checkout yet" : "Próximamente · aún sin pago");
    expect(card).not.toContain("Mercado");
    expect(card).not.toContain("<button");
    expect(card).not.toContain("href=");
  });
});
