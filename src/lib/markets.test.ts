import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { listConnectors } from "./connectors";
import { MARKET_CODES, MARKETS, parseMarkets } from "./markets";

const DIR = path.join(process.cwd(), "content", "connectors");

function slugs(lang: string): string[] {
  return fs
    .readdirSync(path.join(DIR, lang))
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""))
    .sort();
}

function rawMarkets(lang: string, slug: string): unknown {
  const raw = fs.readFileSync(path.join(DIR, lang, `${slug}.md`), "utf8");
  return matter(raw).data.markets;
}

describe("parseMarkets", () => {
  it("accepts ISO codes and GLOBAL", () => {
    expect(parseMarkets(["CO", "MX"])).toEqual(["CO", "MX"]);
    expect(parseMarkets(["GLOBAL"])).toEqual(["GLOBAL"]);
  });
  it("rejects unknown, lowercase, empty, non-array and GLOBAL+country", () => {
    expect(() => parseMarkets(["ZZ"])).toThrow();
    expect(() => parseMarkets(["co"])).toThrow();
    expect(() => parseMarkets([])).toThrow();
    expect(() => parseMarkets(undefined)).toThrow();
    expect(() => parseMarkets("CO")).toThrow();
    expect(() => parseMarkets(["GLOBAL", "US"])).toThrow();
  });
  it("every market has es and en labels", () => {
    for (const code of MARKET_CODES) {
      expect(MARKETS[code].es.length, code).toBeGreaterThan(0);
      expect(MARKETS[code].en.length, code).toBeGreaterThan(0);
    }
  });
});

describe("connector fichas declare valid markets", () => {
  it("en and es contain the same slugs", () => {
    expect(slugs("en")).toEqual(slugs("es"));
  });

  for (const slug of slugs("en")) {
    it(`${slug}: markets are valid and identical in en and es`, () => {
      const en = parseMarkets(rawMarkets("en", slug), `en/${slug}.md markets`);
      const es = parseMarkets(rawMarkets("es", slug), `es/${slug}.md markets`);
      expect([...en].sort(), `${slug}: en and es disagree`).toEqual([...es].sort());
    });
  }

  it("exposes markets on every listed connector (no ficha without markets)", async () => {
    for (const lang of ["en", "es"]) {
      const items = await listConnectors(lang);
      const missing = items.filter((c) => !c.markets || c.markets.length === 0).map((c) => c.slug);
      expect(missing, `fichas sin markets (${lang})`).toEqual([]);
    }
  });

  it("regional tools are not marked GLOBAL by mistake", async () => {
    const items = await listConnectors("es");
    const by = (s: string) => items.find((c) => c.slug === s)?.markets;
    expect(by("siigo")).toEqual(["CO"]);
    expect(by("alegra")).toContain("CO");
    expect(by("alegra")).toContain("MX");
    expect(by("mercado-pago")).toContain("AR");
    expect(by("gusto")).toEqual(["US"]);
    expect(by("slack")).toEqual(["GLOBAL"]);
    expect(by("stripe")).toEqual(["GLOBAL"]);
    expect(by("notion")).toEqual(["GLOBAL"]);
  });
});
