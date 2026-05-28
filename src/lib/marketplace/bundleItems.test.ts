import { describe, expect, it } from "vitest";
import { resolveBundleItem, resolveBundleItems } from "./bundleItems";

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
    // `content/connectors/en/gmail.md` is affiliate-only; no manifest.
    const item = await resolveBundleItem("connector", "gmail", "en");
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
