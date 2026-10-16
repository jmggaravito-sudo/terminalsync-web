import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { middleware } from "@/middleware";
import {
  EUROPE_COUNTRIES,
  EU_COUNTRIES,
  isEuropeCountry,
  regionForCountry,
  regionFromCookieString,
  regionFromHeaders,
} from "./region";

describe("lista de países de Europa", () => {
  it("UE-27 + EEE (IS, LI, NO) + GB + CH = 32 países", () => {
    expect(EU_COUNTRIES).toHaveLength(27);
    expect(EUROPE_COUNTRIES.size).toBe(32);
    for (const c of ["ES", "FR", "DE", "IT", "PT", "IE", "SE", "PL", "GR", "HR", "IS", "LI", "NO", "GB", "CH"]) {
      expect(isEuropeCountry(c), c).toBe(true);
    }
  });

  it("no incluye países fuera de Europa ni europeos fuera del alcance", () => {
    for (const c of ["US", "CO", "MX", "AR", "BR", "CL", "PE", "CA", "AU", "JP", "IN", "TR", "UA", "RU", "RS", "AD", "MC"]) {
      expect(isEuropeCountry(c), c).toBe(false);
    }
  });

  it("es insensible a mayúsculas y espacios", () => {
    expect(isEuropeCountry(" es ")).toBe(true);
    expect(isEuropeCountry("gb")).toBe(true);
  });
});

describe("región por país y fail-safe", () => {
  it("Europa => eu", () => {
    expect(regionForCountry("ES")).toBe("eu");
    expect(regionForCountry("gb")).toBe("eu");
    expect(regionForCountry("CH")).toBe("eu");
  });

  it("resto del mundo (EE. UU., Latinoamérica...) => row", () => {
    for (const c of ["US", "CO", "MX", "AR", "BR", "CL", "PE", "EC", "CA"]) {
      expect(regionForCountry(c), c).toBe("row");
    }
  });

  it("FAIL-SAFE: país desconocido o ilegible => eu", () => {
    for (const v of [undefined, null, "", "  ", "XX", "T1", "USA", "U", "12", "??", "undefined"]) {
      expect(regionForCountry(v as string | null | undefined), String(v)).toBe("eu");
    }
  });

  it("FAIL-SAFE: sin cabecera o con lectura que lanza => eu", () => {
    expect(regionFromHeaders(new Headers())).toBe("eu");
    expect(regionFromHeaders({ get: () => { throw new Error("boom"); } })).toBe("eu");
    expect(regionFromHeaders(new Headers({ "x-vercel-ip-country": "US" }))).toBe("row");
    expect(regionFromHeaders(new Headers({ "x-vercel-ip-country": "FR" }))).toBe("eu");
  });

  it("la cookie solo relaja con el valor exacto row", () => {
    expect(regionFromCookieString("ts_region=row")).toBe("row");
    expect(regionFromCookieString("a=1; ts_region=row; b=2")).toBe("row");
    for (const c of [undefined, null, "", "ts_region=eu", "ts_region=", "ts_region=Row", "xts_region=row", "ts_region=rowx"]) {
      expect(regionFromCookieString(c), String(c)).toBe("eu");
    }
  });
});

describe("middleware: cookie ts_region", () => {
  const req = (url: string, headers: Record<string, string> = {}) =>
    new NextRequest(`https://terminalsync.ai${url}`, { headers });
  const regionCookie = (res: Response & { cookies: { get(n: string): any } }) => res.cookies.get("ts_region");

  it("visitante de EE. UU. => row, en la home estática /es y /en", () => {
    for (const p of ["/es", "/en"]) {
      const res = middleware(req(p, { "x-vercel-ip-country": "US" }));
      expect(regionCookie(res)?.value, p).toBe("row");
    }
  });

  it("visitante de España/Alemania/Reino Unido => eu", () => {
    for (const c of ["ES", "DE", "GB", "CH", "NO"]) {
      const res = middleware(req("/es/pricing", { "x-vercel-ip-country": c }));
      expect(regionCookie(res)?.value, c).toBe("eu");
    }
  });

  it("FAIL-SAFE: sin cabecera => eu", () => {
    expect(regionCookie(middleware(req("/es")))?.value).toBe("eu");
    expect(regionCookie(middleware(req("/es", { "x-vercel-ip-country": "XX" })))?.value).toBe("eu");
  });

  it("atributos: sesión, SameSite=Lax, path=/, legible por JS", () => {
    const c = regionCookie(middleware(req("/es", { "x-vercel-ip-country": "CO" })));
    expect(c.sameSite).toBe("lax");
    expect(c.path).toBe("/");
    expect(c.httpOnly).toBeFalsy();
    expect(c.maxAge).toBeUndefined();
    expect(c.expires).toBeUndefined();
  });

  it("no rompe el resto: / sigue redirigiendo por idioma y trae la cookie", () => {
    const res = middleware(req("/", { "x-vercel-ip-country": "MX", "accept-language": "en-US,en;q=0.9" }));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("https://terminalsync.ai/en");
    expect(regionCookie(res)?.value).toBe("row");
  });

  it("no rompe el resto: rutas ya localizadas pasan sin redirigir", () => {
    const res = middleware(req("/es/connectors", { "x-vercel-ip-country": "AR" }));
    expect(res.headers.get("location")).toBeNull();
    expect(res.status).toBe(200);
  });

  it("el matcher incluye /es, /en y páginas, y excluye api, _next y assets", async () => {
    const { config } = await import("@/middleware");
    const re = new RegExp(`^${config.matcher[0]}$`);
    for (const p of ["/", "/es", "/en", "/es/legal/cookies", "/en/for-developers", "/privacy"]) {
      expect(re.test(p), p).toBe(true);
    }
    for (const p of ["/api/checkout", "/api", "/_next/static/x.js", "/_next/image", "/favicon.ico", "/consent.js", "/landing-b/index.html"]) {
      expect(re.test(p), p).toBe(false);
    }
  });
});
