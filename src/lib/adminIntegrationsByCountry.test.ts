import { describe, expect, it } from "vitest";
import { listConnectors } from "./connectors";
import {
  buildIntegrationRows,
  connectionKind,
  countByCountry,
  filterRows,
  summaryLine,
  supervisionStatus,
} from "./adminIntegrationsByCountry";
import type { ConnectorMeta } from "./connectors";

function meta(over: Partial<ConnectorMeta>): ConnectorMeta {
  return {
    slug: "x",
    name: "X",
    logo: "",
    category: "automation",
    status: "available",
    simpleTitle: "",
    simpleSubtitle: "",
    devTitle: "",
    devSubtitle: "",
    ctaUrl: "",
    affiliate: false,
    tagline: "",
    hasManifest: true,
    deliveredTo: ["claude", "codex", "gemini"],
    requiresEnvSecrets: false,
    markets: ["GLOBAL"],
    ...over,
  };
}

describe("supervisionStatus", () => {
  it("ok -> working", () => {
    expect(supervisionStatus(meta({ installableForAi: true, installableForAiReason: "ok" })).status).toBe("working");
  });
  it("remote-needs-login and unverified-needs-key -> login-pending (never 'working')", () => {
    for (const r of ["remote-needs-login", "unverified-needs-key"] as const) {
      expect(supervisionStatus(meta({ installableForAi: true, installableForAiReason: r })).status).toBe("login-pending");
    }
  });
  it("installableForAi=false -> blocked with a Spanish reason", () => {
    const s = supervisionStatus(meta({ installableForAi: false, installableForAiReason: "no-jsonrpc-id" }));
    expect(s.status).toBe("blocked");
    expect(s.explanation).toMatch(/formato|identificador/);
  });
  it("missing supervision (or first-party sidecar) -> unverified, not blocked", () => {
    expect(supervisionStatus(meta({})).status).toBe("unverified");
    expect(supervisionStatus(meta({ firstParty: true, installableForAi: true, installableForAiReason: "ok" })).status).toBe("unverified");
  });
});

describe("connectionKind", () => {
  it("classifies remote / token / local / none", () => {
    expect(connectionKind(meta({ installSpec: "mcp-remote@latest" }))).toBe("remote-login");
    expect(connectionKind(meta({ installSpec: "mcp-remote@latest", requiresEnvSecrets: true }))).toBe("remote-token");
    expect(connectionKind(meta({ installSpec: "@x/y", requiresEnvSecrets: true }))).toBe("token");
    expect(connectionKind(meta({ installSpec: "@x/y" }))).toBe("local");
    expect(connectionKind(meta({ hasManifest: false }))).toBe("none");
  });
});

describe("filters, counts and summary", () => {
  const rows = buildIntegrationRows([
    meta({ slug: "siigo", name: "Siigo", markets: ["CO"], installableForAi: true, installableForAiReason: "remote-needs-login" }),
    meta({ slug: "alegra", name: "Alegra", markets: ["CO", "MX"], installableForAi: true, installableForAiReason: "ok" }),
    meta({ slug: "gusto", name: "Gusto", markets: ["US"], installableForAi: false, installableForAiReason: "no-manifest" }),
    meta({ slug: "slack", name: "Slack", markets: ["GLOBAL"], installableForAi: true, installableForAiReason: "ok" }),
    meta({ slug: "old", name: "Old", markets: ["CO"], hidden: true }),
    meta({ slug: "soon", name: "Soon", markets: ["CO"], status: "soon" }),
  ]);

  it("drops hidden and not-yet-available connectors", () => {
    expect(rows.map((r) => r.slug).sort()).toEqual(["alegra", "gusto", "siigo", "slack"]);
  });

  it("country filter includes globals; GLOBAL filter is only globals", () => {
    const names = (c: Parameters<typeof filterRows>[1]["country"], view: "all" | "working" | "installable" = "all") =>
      filterRows(rows, { country: c, query: "", view }).map((r) => r.slug).sort();
    expect(names("CO")).toEqual(["alegra", "siigo", "slack"]);
    expect(names("MX")).toEqual(["alegra", "slack"]);
    expect(names("GLOBAL")).toEqual(["slack"]);
    expect(names("CO", "working")).toEqual(["alegra", "slack"]);
    expect(names("US")).toEqual(["gusto", "slack"]);
    expect(names("US", "installable")).toEqual(["slack"]);
  });

  it("text search ignores accents and case", () => {
    expect(filterRows(rows, { country: "ALL", query: "ALÉGRA", view: "all" }).map((r) => r.slug)).toEqual(["alegra"]);
  });

  it("counts per country", () => {
    const co = countByCountry(rows).find((c) => c.code === "CO");
    expect(co).toEqual({ code: "CO", total: 3, supervised: 2, specific: 2 });
  });

  it("summary line", () => {
    expect(summaryLine(rows, "CO", "es")).toContain("3 integraciones para Colombia: 2 supervisadas");
    expect(summaryLine(rows, "CO", "en")).toContain("3 integrations for Colombia: 2 supervised");
  });
});

describe("real catalog", () => {
  it("every visible ficha yields a row with markets and a status", async () => {
    const rows = buildIntegrationRows(await listConnectors("es"));
    expect(rows.length).toBeGreaterThan(40);
    for (const r of rows) {
      expect(r.markets.length, r.slug).toBeGreaterThan(0);
      expect(r.explanation.length, r.slug).toBeGreaterThan(0);
    }
    const siigo = rows.find((r) => r.slug === "siigo")!;
    expect(siigo.markets).toEqual(["CO"]);
    expect(siigo.status).toBe("login-pending");
  });
});
