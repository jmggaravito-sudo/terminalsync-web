import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getDict } from "@/content";
import { Pricing } from "./Pricing";

describe("Team card on the public pricing surface", () => {
  it.each(["en", "es"] as const)("renders localized Team pricing and non-actionable readiness disclosure in %s", (locale) => {
    const html = renderToStaticMarkup(createElement(Pricing, { dict: getDict(locale) }));
    const card = html.match(/<article id="plan-team"[\s\S]*?<\/article>/)?.[0];

    expect(card).toBeTruthy();
    expect(card).toContain("$59");
    expect(card).toContain(locale === "en" ? "Team" : "Team");
    expect(card).toContain(locale === "en" ? "7-day" : "7 días");
    expect(card).toContain(locale === "en" ? "no card required" : "sin tarjeta");
    expect(card).toContain("Stripe");
    expect(card).toContain(locale === "en" ? "checkout and trial signup are not available yet" : "pago y registro a prueba aún no están disponibles");
    expect(card).toContain(locale === "en" ? "Pro and Max stay unchanged" : "Pro y Max no cambian");
    expect(card).not.toContain("<button");
    expect(card).not.toContain("href=");
  });
});
