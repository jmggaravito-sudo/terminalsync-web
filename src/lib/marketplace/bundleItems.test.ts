import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  loadDbConnectorManifests,
  resolveBundleItem,
  resolveBundleItems,
} from "./bundleItems";

/**
 * Tests for the bundle-item resolver. Exercises the markdown branches of
 * each pillar — Supabase isn't configured in the test env, so the DB
 * branches short-circuit to `null` (resolved-items list silently drops
 * them). That mirrors production behavior for the empty-secrets case.
 *
 * Goal: pin the `requiresEnvSecrets` field on the resolved item so the
 * desktop's Explorar UI can compute its "necesita clave" chip uniformly.
 * Closes the gap reported in terminalsync-web#72; documents the
 * by-design hardcode on marketplace rows reported in #74.
 */

describe("resolveBundleItem — connector (markdown)", () => {
  it("connector with manifest + ${SECRET:} → hasManifest + requiresEnvSecrets both true", async () => {
    // `content/connectors/en/notion.md` has manifest.mcpServers.notion with
    // `NOTION_API_KEY: ${SECRET:NOTION_API_KEY}` — the canonical fixture.
    const item = await resolveBundleItem("connector", "notion", "en");
    expect(item).not.toBeNull();
    expect(item!.kind).toBe("connector");
    expect(item!.slug).toBe("notion");
    expect(item!.hasManifest).toBe(true);
    expect(item!.requiresEnvSecrets).toBe(true);
    // CTA should be the deep-link for installable connectors, not the
    // affiliate URL from the frontmatter.
    expect(item!.ctaUrl.startsWith("terminalsync://install/connector?slug=")).toBe(
      true,
    );
  });

  it("connector without manifest → hasManifest false + requiresEnvSecrets false", async () => {
    // `content/connectors/en/gdrive.md` is a CTA-only Anthropic listing with no
    // manifest. (gmail was the fixture here until it gained an MCP manifest —
    // picking a still-manifest-less connector keeps this asserting the
    // no-manifest branch.)
    const item = await resolveBundleItem("connector", "gdrive", "en");
    expect(item).not.toBeNull();
    expect(item!.kind).toBe("connector");
    expect(item!.hasManifest).toBe(false);
    expect(item!.requiresEnvSecrets).toBe(false);
  });

  it("connector slug not in markdown returns null (in test env Supabase is unconfigured)", async () => {
    const item = await resolveBundleItem(
      "connector",
      "made-up-slug-not-in-content",
      "en",
    );
    expect(item).toBeNull();
  });
});

describe("resolveBundleItem — skill", () => {
  it("skill always has requiresEnvSecrets=false (skills never declare env secrets)", async () => {
    const item = await resolveBundleItem("skill", "code-reviewer", "en");
    expect(item).not.toBeNull();
    expect(item!.kind).toBe("skill");
    expect(item!.requiresEnvSecrets).toBe(false);
  });
});

describe("resolveBundleItem — cli", () => {
  it("CLI tool with authCommand in markdown → requiresEnvSecrets true", async () => {
    // `content/cli-tools/en/github-cli.md` has authCommand: `gh auth login`.
    const item = await resolveBundleItem("cli", "github-cli", "en");
    expect(item).not.toBeNull();
    expect(item!.kind).toBe("cli");
    expect(item!.requiresEnvSecrets).toBe(true);
  });
});

describe("resolveBundleItems — multi-pillar batch", () => {
  it("preserves sortOrder and whyItHelps when resolving a mixed list", async () => {
    const items = await resolveBundleItems(
      [
        {
          kind: "skill",
          slug: "code-reviewer",
          sortOrder: 2,
          whyItHelps: "para revisar diffs",
        },
        {
          kind: "connector",
          slug: "notion",
          sortOrder: 1,
          whyItHelps: "para el workspace",
        },
      ],
      "en",
    );
    expect(items).toHaveLength(2);
    // Sorted by sortOrder ascending.
    expect(items[0].slug).toBe("notion");
    expect(items[0].whyItHelps).toBe("para el workspace");
    expect(items[1].slug).toBe("code-reviewer");
    expect(items[1].whyItHelps).toBe("para revisar diffs");
  });

  it("drops items that don't resolve (deleted markdown, missing DB row)", async () => {
    const items = await resolveBundleItems(
      [
        { kind: "connector", slug: "notion", sortOrder: 0 },
        { kind: "skill", slug: "does-not-exist", sortOrder: 1 },
      ],
      "en",
    );
    expect(items).toHaveLength(1);
    expect(items[0].slug).toBe("notion");
  });
});

/**
 * Tests for the catalog-side fix: bundle items that point at DB-only
 * connectors (Supabase `connector_listings`, no markdown) used to get
 * `hasManifest:false` + no install fields by default. The catalog now
 * pre-fetches the latest `connector_versions.manifest_json` in a single
 * batch query and passes it to the resolver, which hydrates the missing
 * fields. terminalsync-web#72/#74.
 */
describe("loadDbConnectorManifests — single-batch fetch + newest-version dedupe", () => {
  /** Minimal stand-in for the SupabaseClient surface our code touches:
   *  `.from(table).select(...).in(...).eq(...)` ending in an awaited
   *  `{data, error}` envelope. The mock lets each test prescribe what
   *  rows come back without needing the real client. */
  function makeSupabaseStub(
    rows: Array<{
      slug: string;
      connector_versions: Array<{ manifest_json: unknown; created_at: string }>;
    }>,
    opts: { throws?: boolean; error?: { message: string } } = {},
  ): SupabaseClient {
    const builder = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      eq: vi.fn().mockImplementation(async () => {
        if (opts.throws) throw new Error("simulated network error");
        if (opts.error) return { data: null, error: opts.error };
        return { data: rows, error: null };
      }),
    };
    return {
      from: vi.fn().mockReturnValue(builder),
    } as unknown as SupabaseClient;
  }

  it("returns empty map without hitting the DB when slugs list is empty", async () => {
    const sb = makeSupabaseStub([]);
    const map = await loadDbConnectorManifests(sb, []);
    expect(map.size).toBe(0);
    // `.from` shouldn't be called when there's nothing to query — the
    // implementation short-circuits to avoid a wasted round-trip.
    expect(sb.from).not.toHaveBeenCalled();
  });

  it("returns the newest manifest per slug when versions has multiple rows", async () => {
    // Two versions for the same listing; expect the most recent one
    // to win. Dates are intentionally out-of-insertion-order to
    // guarantee the dedupe is by `created_at`, not array position.
    const newer = {
      manifest_json: { mcpServers: { x: { command: "npx", args: ["-y", "@new/pkg"] } } },
      created_at: "2026-06-20T10:00:00Z",
    };
    const older = {
      manifest_json: { mcpServers: { x: { command: "npx", args: ["-y", "@old/pkg"] } } },
      created_at: "2024-01-01T00:00:00Z",
    };
    const sb = makeSupabaseStub([
      { slug: "foo", connector_versions: [older, newer] },
    ]);
    const map = await loadDbConnectorManifests(sb, ["foo"]);
    expect(map.size).toBe(1);
    expect(map.get("foo")).toEqual(newer.manifest_json);
  });

  it("dedupes the input slug list before querying (same slug from N bundles → 1 IN entry)", async () => {
    const sb = makeSupabaseStub([
      { slug: "x", connector_versions: [{ manifest_json: { mcpServers: {} }, created_at: "2026-01-01T00:00:00Z" }] },
    ]);
    await loadDbConnectorManifests(sb, ["x", "x", "x"]);
    // Find the call to `.in` and check it received deduped slugs.
    const builder = (sb.from as ReturnType<typeof vi.fn>).mock.results[0]
      .value as { in: ReturnType<typeof vi.fn> };
    const inCall = builder.in.mock.calls[0];
    expect(inCall[0]).toBe("slug");
    expect(inCall[1]).toEqual(["x"]);
  });

  it("returns empty map (never throws) when the query errors", async () => {
    const sb = makeSupabaseStub([], { error: { message: "PostgREST: relation does not exist" } });
    const map = await loadDbConnectorManifests(sb, ["foo", "bar"]);
    expect(map.size).toBe(0);
  });

  it("returns empty map (never throws) when the query rejects", async () => {
    // Critical for "bundle never breaks because of this fetch" —
    // verifies the try/catch around the awaited query.
    const sb = makeSupabaseStub([], { throws: true });
    const map = await loadDbConnectorManifests(sb, ["foo"]);
    expect(map.size).toBe(0);
  });

  it("silently skips slugs that have no manifest_json (empty versions array)", async () => {
    const sb = makeSupabaseStub([
      // listing exists, but the join produced no version rows
      { slug: "no-versions", connector_versions: [] },
      // listing exists and has a real version → still present
      {
        slug: "has-versions",
        connector_versions: [
          { manifest_json: { mcpServers: {} }, created_at: "2026-06-01T00:00:00Z" },
        ],
      },
    ]);
    const map = await loadDbConnectorManifests(sb, ["no-versions", "has-versions"]);
    expect(map.has("no-versions")).toBe(false);
    expect(map.has("has-versions")).toBe(true);
  });
});

describe("resolveBundleItem — connector (DB) with prefetched manifest", () => {
  // jsdom for these tests still works because `resolveConnector`'s DB
  // branch only executes if markdown lookup misses. We pass a slug
  // that we know is NOT in content/connectors so the resolver tries
  // the DB. The catch is that `resolveConnector` calls `getSupabaseAdmin()`
  // even when given a prefetched manifest — it still needs the listing
  // row to render name/tagline/logo. In production we ARE in a configured
  // env. In tests Supabase is unconfigured so the DB branch returns null
  // and we can't observe the manifest hydration end-to-end here.
  //
  // The hydration semantics are verified at two layers instead:
  // 1. `loadDbConnectorManifests` (the prefetch step) — covered above.
  // 2. The catalog route integration test (route.test.ts) — covered
  //    with full mocks of both the listings + versions queries.

  it("DB-only slug with no Supabase configured returns null (no env in test runtime)", async () => {
    // Sanity: without configured Supabase, the DB branch can't fetch
    // the listing row. The bundle skips the item — same behavior as
    // before the fix. This pins that giving the function a manifest
    // map for an unconfigured-Supabase env does NOT cause it to invent
    // a row out of thin air.
    const manifestBySlug = new Map<string, unknown>([
      [
        "made-up-db-only",
        { mcpServers: { x: { command: "npx", args: ["-y", "@x/pkg"] } } },
      ],
    ]);
    const item = await resolveBundleItem(
      "connector",
      "made-up-db-only",
      "en",
      manifestBySlug,
    );
    expect(item).toBeNull();
  });
});

describe("resolveBundleItems — backward-compat without options", () => {
  it("third argument is optional (signature stays backward-compatible)", async () => {
    // Pre-fix call shape — must keep working for every consumer
    // (`/bundles` route, `/stacks` page, the per-slug route). If this
    // breaks, every bundle page in the site breaks.
    const items = await resolveBundleItems(
      [{ kind: "connector", slug: "notion", sortOrder: 0 }],
      "en",
    );
    expect(items).toHaveLength(1);
    expect(items[0].slug).toBe("notion");
  });
});
