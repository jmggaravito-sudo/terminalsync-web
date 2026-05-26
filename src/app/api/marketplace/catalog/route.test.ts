import { describe, expect, it } from "vitest";
import { GET, type CatalogResponse } from "./route";

/**
 * Integration-ish tests against the route handler. We invoke `GET` with
 * a fake Request and parse the JSON response — no Next dev server, no
 * HTTP layer.
 *
 * Supabase is not mocked: `listAllConnectors`, `listSkills`,
 * `listCliTools` and `loadBundles` either find their content on disk
 * (markdown) or short-circuit to empty arrays when the admin client
 * isn't configured (test env). That's exactly the behavior the
 * desktop relies on — a partial catalog rather than a hard failure.
 */
async function callCatalog(lang: string): Promise<{
  status: number;
  body: CatalogResponse;
  cacheControl: string | null;
}> {
  const req = new Request(`http://localhost/api/marketplace/catalog?lang=${lang}`);
  const res = await GET(req);
  const body = (await res.json()) as CatalogResponse;
  return {
    status: res.status,
    body,
    cacheControl: res.headers.get("Cache-Control"),
  };
}

describe("GET /api/marketplace/catalog", () => {
  it("returns 200 with the four pillars present (lang=es)", async () => {
    const { status, body } = await callCatalog("es");
    expect(status).toBe(200);
    expect(Array.isArray(body.connectors), "connectors").toBe(true);
    expect(Array.isArray(body.skills), "skills").toBe(true);
    expect(Array.isArray(body.cliTools), "cliTools").toBe(true);
    expect(Array.isArray(body.bundles), "bundles").toBe(true);
  });

  it("returns 200 with the four pillars present (lang=en)", async () => {
    const { status, body } = await callCatalog("en");
    expect(status).toBe(200);
    expect(Array.isArray(body.connectors)).toBe(true);
    expect(Array.isArray(body.skills)).toBe(true);
    expect(Array.isArray(body.cliTools)).toBe(true);
    expect(Array.isArray(body.bundles)).toBe(true);
  });

  it("returns non-empty connectors/skills/cliTools (first-party content shipped)", async () => {
    // These three pillars read from `content/<pillar>/<lang>/*.md`,
    // which is committed in the repo. An empty array would mean the
    // catalog scan is broken or the markdown got accidentally deleted.
    // Bundles can legitimately be empty (Supabase not configured in
    // test env) — that's covered by the type/shape test above.
    const { body } = await callCatalog("es");
    expect(body.connectors.length).toBeGreaterThan(0);
    expect(body.skills.length).toBeGreaterThan(0);
    expect(body.cliTools.length).toBeGreaterThan(0);
  });

  it("filters hidden items out of connectors and skills", async () => {
    const { body } = await callCatalog("es");
    // No leaked `hidden: true` should ever reach the public response —
    // the lib filters them, and the route filters defensively a second
    // time. If a `hidden:true` connector shows up here, one of the two
    // filters regressed.
    expect(body.connectors.every((c) => !c.hidden)).toBe(true);
    expect(body.skills.every((s) => !s.hidden)).toBe(true);
  });

  it("requiresEnvSecrets is a boolean on every connector item", async () => {
    const { body } = await callCatalog("es");
    for (const item of body.connectors) {
      expect(
        typeof item.requiresEnvSecrets,
        `${item.slug} has non-boolean requiresEnvSecrets`,
      ).toBe("boolean");
    }
  });

  it("requiresEnvSecrets is `false` on every skill (skills don't have secrets)", async () => {
    const { body } = await callCatalog("es");
    for (const item of body.skills) {
      expect(
        item.requiresEnvSecrets,
        `${item.slug} unexpectedly reports requiresEnvSecrets=true`,
      ).toBe(false);
    }
  });

  it("requiresEnvSecrets matches !!authCommand on CLI tools", async () => {
    const { body } = await callCatalog("es");
    for (const item of body.cliTools) {
      expect(
        item.requiresEnvSecrets,
        `${item.slug} authCommand=${item.authCommand} requiresEnvSecrets=${item.requiresEnvSecrets}`,
      ).toBe(Boolean(item.authCommand));
    }
  });

  it("sets the 10-min s-maxage cache header", async () => {
    const { cacheControl } = await callCatalog("es");
    expect(cacheControl).toBe(
      "public, s-maxage=600, stale-while-revalidate=3600",
    );
  });
});
