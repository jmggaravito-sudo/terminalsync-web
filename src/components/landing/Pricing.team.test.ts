import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getDict } from "@/content";
import { Pricing } from "./Pricing";

describe("Team card on the public pricing surface", () => {
  it.each(["en", "es"] as const)("renders accurate localized Team pricing and trial terms without enabling checkout in %s", (locale) => {
    const html = renderToStaticMarkup(createElement(Pricing, { dict: getDict(locale) }));
    const card = html.match(/<article id="plan-team"[\s\S]*?<\/article>/)?.[0];

    expect(card).toBeTruthy();
    expect(card).toContain("$59");
    expect(card).toContain(locale === "en" ? "Team" : "Team");
    expect(card).toContain(locale === "en" ? "/employee/mo" : "/empleado/mes");
    expect(card).toContain(locale === "en" ? "new users" : "nuevos usuarios");
    expect(card).toContain(locale === "en" ? "no automatic charge" : "no hay cobro automático");
    expect(card).toContain(locale === "en" ? "requires approval" : "requiere aprobación");
    expect(card).toContain(locale === "en" ? "Shared spaces" : "Espacios compartidos");
    expect(card).toContain(locale === "en" ? "no card required" : "sin tarjeta");
    expect(card).not.toContain("<button");
    expect(card).not.toContain("href=");
  });
});
