import { afterEach, describe, expect, it, vi } from "vitest";
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
}> {
  const req = new Request(`http://localhost/api/marketplace/catalog?lang=${lang}`);
  const res = await GET(req);
  const body = (await res.json()) as CatalogResponse;
  return { status: res.status, body };
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

  it("parks borderline generic assistants as soon in the public catalog response", async () => {
    const parkedSlugs = ["email-drafter", "copywriter", "learn"] as const;

    for (const lang of ["en", "es"] as const) {
      const { body } = await callCatalog(lang);

      for (const slug of parkedSlugs) {
        const skill = body.skills.find((item) => item.slug === slug);
        expect(
          skill,
          `${lang}/${slug} should remain reversible in catalog data`,
        ).toBeDefined();
        expect(
          skill?.status,
          `${lang}/${slug} should not be available`,
        ).toBe("soon");
      }
    }
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

  it("exposes description (markdown body) and tokenHelpUrl on the catalog connector entries", async () => {
    // 2026-06-24: the desktop Lab's detail panel was rendering a near-
    // empty card because the catalog only exposed `tagline` (a 1-liner).
    // Two new fields fix that:
    //   - `description`: the markdown body's "simple" half (before
    //     `--- dev ---`), so the panel can render a rich explanation.
    //   - `tokenHelpUrl`: direct link to "where you generate the token"
    //     so users with `requiresEnvSecrets:true` can find it.
    //
    // Sentry is the molde-de-oro for this contract — pinned here so a
    // regression that drops either field surfaces immediately.
    const { body } = await callCatalog("es");
    const sentry = body.connectors.find((c) => c.slug === "sentry");
    expect(sentry, "sentry should be in the catalog").toBeDefined();
    expect(typeof sentry!.description).toBe("string");
    expect(sentry!.description!.length).toBeGreaterThan(40);
    expect(sentry!.tokenHelpUrl).toBe(
      "https://sentry.io/settings/account/api/auth-tokens/",
    );
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

  it("bundles expose an href pointing at /<lang>/stacks/<slug>", async () => {
    // Bundles need an `href` so the desktop's Explorar UI can render the
    // "Ver detalles" CTA without inventing the URL structure. The route
    // is `/[lang]/stacks/[slug]` — `/stacks/` not `/bundles/` because
    // "Stack Pack" is the consumer-facing brand. See terminalsync-web#73.
    //
    // In test env Supabase isn't configured so `bundles` is typically
    // []. When there ARE bundles (only with a Supabase env wired in),
    // they must include `href`. The for-loop is a no-op in CI; the
    // type assertion below pins the contract so the field can't be
    // removed without breaking compilation.
    const { body } = await callCatalog("es");
    for (const b of body.bundles) {
      expect(typeof b.href, `${b.slug} href`).toBe("string");
      expect(b.href).toBe(`/es/stacks/${b.slug}`);
    }
    const sample: Partial<CatalogResponse["bundles"][number]> = { href: "/x" };
    expect(sample.href).toBe("/x");
  });

  it("hydrates DB-only connector items in a bundle with install fields (terminalsync-web#72/#74)", async () => {
    // End-to-end coverage of the catalog-side fix: a bundle whose
    // items reference DB-only connectors used to get back items with
    // `hasManifest:false` and no install fields, breaking Phase 2
    // install in the desktop. The route now batches a query to
    // `connector_versions` and hydrates the resolved items.
    //
    // We mock the Supabase admin client so the route exercises the
    // full integration path (bundles → bundle_listings → connector
    // batch manifest → resolver) without a real database.
    const SUPABASE_MOCK = await import("@/lib/supabaseAdmin");
    const sbStub = makeSupabaseStubForBundleHydration();
    const spy = vi
      .spyOn(SUPABASE_MOCK, "getSupabaseAdmin")
      .mockReturnValue(sbStub);
    try {
      const { body } = await callCatalog("es");
      // Find the bundle the mock returned.
      const stack = body.bundles.find((b) => b.slug === "sales-stack");
      expect(stack, "bundle should be returned").toBeDefined();
      expect(stack!.items.length).toBeGreaterThan(0);

      // The DB-only item that got hydrated from connector_versions.
      const hydrated = stack!.items.find(
        (i) => i.slug === "salesforcecli-mcp",
      );
      expect(hydrated, "DB-only item should be in the bundle").toBeDefined();
      expect(hydrated!.hasManifest).toBe(true);
      expect(hydrated!.installMethod).toBe("npm");
      expect(hydrated!.installSpec).toBe(
        "@salesforce/mcp-server-salesforce",
      );
      // Manifest contains `${SECRET:SALESFORCE_TOKEN}` → flag must flip.
      expect(hydrated!.requiresEnvSecrets).toBe(true);
      expect(hydrated!.installEnv).toEqual({
        SALESFORCE_TOKEN: "SALESFORCE_TOKEN",
      });
    } finally {
      spy.mockRestore();
    }
  });

  it("declares a 10-minute revalidate window for Vercel's edge cache", async () => {
    // Asserts the route segment config — NOT the local response header.
    //
    // History: an earlier version of this test checked
    // `res.headers.get("Cache-Control")` against the literal string
    // we set on `NextResponse.json({ headers: { ... } })`. That test
    // passed locally and gave us false confidence — in production the
    // edge stripped everything except `public`, so the catalog was
    // effectively uncached, but the test never noticed because the
    // edge layer doesn't run in the unit suite.
    //
    // What governs production caching is the `revalidate` route
    // segment export, which Vercel reads to emit s-maxage at the
    // edge. That's what this test pins. If anyone bumps it or
    // removes it, the assertion fires.
    const mod = await import("./route");
    expect((mod as { revalidate?: number }).revalidate).toBe(600);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

/**
 * Build a minimal Supabase admin stub that the route's bundle path can
 * traverse:
 *
 *   1. `from("bundles").select(...).eq("status", "active").order(...)`
 *       → one fake bundle row.
 *   2. `from("bundle_listings").select(...).in("bundle_id", [bid])`
 *       → one connector item (DB-only slug).
 *   3. `from("connector_listings").select("slug, connector_versions(...)").in("slug", [...]).eq("status", "approved")`
 *       → manifest pre-fetch (new code path).
 *   4. `from("connector_listings").select("slug, name, tagline, logo_url, ...").eq("slug", X).eq("status", "approved").maybeSingle()`
 *       → resolveConnector's row lookup (existing).
 *
 * The stub distinguishes calls by the table name and (for
 * `connector_listings`) by which terminator gets invoked. PostgREST
 * builders are chainable — we model only the methods our code uses.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

function makeSupabaseStubForBundleHydration(): SupabaseClient {
  const BUNDLE_ID = "bundle-uuid-1";
  const SALESFORCE_MANIFEST = {
    mcpServers: {
      salesforce: {
        command: "npx",
        args: ["-y", "@salesforce/mcp-server-salesforce"],
        env: { SALESFORCE_TOKEN: "${SECRET:SALESFORCE_TOKEN}" },
      },
    },
  };

  return {
    from(table: string) {
      // Per-table dispatch. Each builder records calls so the terminator
      // can decide what to return based on the chain it received.
      const state: {
        filters: Array<[string, unknown]>;
        inFilter: { col: string; values: readonly unknown[] } | null;
      } = { filters: [], inFilter: null };

      // The Supabase admin client is also consumed by `listMarketplaceConnectors`
      // and other code paths during the same `GET` call. We only need to
      // hand back bespoke responses for the 4 bundle-related queries; any
      // other chain (any unknown table, any `.is()` / `.not()` / `.limit()`
      // call) gets the safe default of an empty array. Chainable methods
      // therefore have to be permissive — return the same builder for
      // anything the call site might throw at us.
      const builder: Record<string, unknown> = {
        select(_cols: string) {
          return builder;
        },
        eq(col: string, val: unknown) {
          state.filters.push([col, val]);
          return builder;
        },
        in(col: string, values: readonly unknown[]) {
          state.inFilter = { col, values };
          return builder;
        },
        is(_col: string, _val: unknown) {
          return builder;
        },
        not(_col: string, _op: string, _val: unknown) {
          return builder;
        },
        gte(_col: string, _val: unknown) {
          return builder;
        },
        lte(_col: string, _val: unknown) {
          return builder;
        },
        limit(_n: number) {
          return builder;
        },
        range(_a: number, _b: number) {
          return builder;
        },
        order(_col: string, _opts: unknown) {
          return builder;
        },
        then(resolve: (v: { data: unknown; error: null }) => unknown) {
          // Terminator for awaited builders (no `.maybeSingle()` called).
          // Returns the table-appropriate dataset.
          if (table === "bundles") {
            return resolve({
              data: [
                {
                  id: BUNDLE_ID,
                  slug: "sales-stack",
                  name: "Sales Stack",
                  tagline: "CRM + email + agenda",
                  hero_image_url: null,
                  price_cents: 1900,
                  currency: "usd",
                  purchase_count: 0,
                  sort_order: 0,
                  description_md: null,
                  is_exclusive_ts: false,
                },
              ],
              error: null,
            });
          }
          if (table === "bundle_listings") {
            return resolve({
              data: [
                {
                  bundle_id: BUNDLE_ID,
                  kind: "connector",
                  item_slug: "salesforcecli-mcp",
                  sort_order: 0,
                },
              ],
              error: null,
            });
          }
          if (table === "connector_listings") {
            // The batched manifest pre-fetch — uses `.in("slug", [...])`.
            return resolve({
              data: [
                {
                  slug: "salesforcecli-mcp",
                  connector_versions: [
                    {
                      manifest_json: SALESFORCE_MANIFEST,
                      created_at: "2026-06-21T00:00:00Z",
                    },
                  ],
                },
              ],
              error: null,
            });
          }
          return resolve({ data: [], error: null });
        },
        async maybeSingle() {
          // Terminator for the resolveConnector single-row lookup.
          if (table === "connector_listings") {
            return {
              data: {
                slug: "salesforcecli-mcp",
                name: "Salesforce MCP",
                tagline: "CRM in the agent",
                logo_url: null,
                cta_url: null,
                repo_url: "https://github.com/salesforcecli/mcp",
                source_url: null,
              },
              error: null,
            };
          }
          return { data: null, error: null };
        },
      };
      return builder;
    },
  } as unknown as SupabaseClient;
}
