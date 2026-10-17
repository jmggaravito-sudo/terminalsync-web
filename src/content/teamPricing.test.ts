import { describe, expect, it } from "vitest";
import { getDict } from "@/content";

describe("Team pricing disclosure", () => {
  it.each(["en", "es"] as const)("keeps Team distinct and honest in %s", (locale) => {
    const team = getDict(locale).pricing.plans.team;
    const copy = [team.name, team.tagline, ...team.features, team.cta].join(" ").toLowerCase();

    expect(team.price).toBe("$59");
    expect(copy).toContain(locale === "en" ? "7-day" : "7 días");
    expect(copy).toContain(locale === "en" ? "no card" : "sin tarjeta");
    expect(copy).toContain(locale === "en" ? "stripe" : "stripe");
    expect(copy).toContain(locale === "en" ? "not available" : "no están disponibles");
    expect(copy).toContain(locale === "en" ? "pro and max stay unchanged" : "pro y max no cambian");
  });
});
