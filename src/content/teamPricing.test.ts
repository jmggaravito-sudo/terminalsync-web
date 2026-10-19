import { describe, expect, it } from "vitest";
import { getDict } from "@/content";

describe("Team pricing disclosure", () => {
  it.each(["en", "es"] as const)("keeps Team distinct and honest in %s", (locale) => {
    const team = getDict(locale).pricing.plans.team;
    const copy = [team.name, team.tagline, ...team.features, team.cta].join(" ").toLowerCase();

    expect(team.price).toBe("$59");
    expect(team.priceNote).toContain("USD");
    expect(copy).toContain(locale === "en" ? "7-day (168-hour)" : "7 días (168 horas)");
    expect(copy).toContain(locale === "en" ? "automatically start" : "iniciará automáticamente");
    expect(copy).toContain(locale === "en" ? "no card" : "sin tarjeta");
    expect(copy).toContain(locale === "en" ? "stripe" : "stripe");
    expect(copy).toContain(locale === "en" ? "1–64" : "1 a 64");
    expect(copy).not.toContain("mercado");
    expect(copy).toContain(locale === "en" ? "not available" : "no están disponibles");
    expect(copy).toContain(locale === "en" ? "pro and max stay unchanged" : "pro y max no cambian");
  });
});
