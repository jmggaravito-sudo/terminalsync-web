import { describe, expect, it } from "vitest";
import {
  composePlugin,
  getPlugin,
  isValidPlugin,
  listPlugins,
  listPluginSlugs,
  normalizeMeta,
  type PluginMeta,
} from "./plugins";

const sampleMeta = (over: Partial<PluginMeta> = {}): PluginMeta => ({
  slug: "gmail",
  name: "Gmail",
  logo: "/plugins/gmail.svg",
  category: "communication",
  status: "available",
  tagline: "Your inbox, handled.",
  description: "The Gmail tools plus the know-how to use them.",
  author: "TerminalSync",
  marketplaceSource: "terminalsync",
  connectorSlug: "gmail",
  skillSlugs: ["gmail-usage"],
  ...over,
});

describe("plugins — composition contract", () => {
  it("a plugin is valid when it references at least one real piece", () => {
    expect(isValidPlugin({ connectorSlug: "gmail", skillSlugs: [] })).toBe(true);
    expect(isValidPlugin({ connectorSlug: undefined, skillSlugs: ["x"] })).toBe(true);
    expect(isValidPlugin({ connectorSlug: "gmail", skillSlugs: ["x"] })).toBe(true);
  });

  it("a plugin with neither a connector nor a skill is invalid", () => {
    expect(isValidPlugin({ connectorSlug: undefined, skillSlugs: [] })).toBe(false);
  });

  it("normalizeMeta reads connectorSlug + skillSlugs from frontmatter", () => {
    const meta = normalizeMeta("gmail", {
      name: "Gmail",
      category: "communication",
      connectorSlug: "gmail",
      skillSlugs: ["gmail-usage", "  ", "inbox-triage"],
    });
    expect(meta.connectorSlug).toBe("gmail");
    // blank entries are dropped
    expect(meta.skillSlugs).toEqual(["gmail-usage", "inbox-triage"]);
    expect(meta.name).toBe("Gmail");
    expect(meta.category).toBe("communication");
  });

  it("normalizeMeta defaults logo/author/status/category when absent", () => {
    const meta = normalizeMeta("acme", {});
    expect(meta.logo).toBe("/plugins/acme.svg");
    expect(meta.author).toBe("TerminalSync");
    expect(meta.status).toBe("available");
    expect(meta.category).toBe("productivity");
    expect(meta.skillSlugs).toEqual([]);
    expect(meta.connectorSlug).toBeUndefined();
  });

  it("normalizeMeta carries the included / hidden / catalogReady markers", () => {
    expect(normalizeMeta("a", { included: true }).included).toBe(true);
    expect(normalizeMeta("a", { hidden: true }).hidden).toBe(true);
    expect(normalizeMeta("a", { catalogReady: false }).catalogReady).toBe(false);
    // catalogReady is only ever `false` or undefined, never `true`
    expect(normalizeMeta("a", { catalogReady: true }).catalogReady).toBeUndefined();
  });

  it("composePlugin merges metadata with its resolved pieces", () => {
    const meta = sampleMeta();
    const doc = composePlugin(meta, null, [], "<p>hi</p>");
    expect(doc.slug).toBe("gmail");
    expect(doc.connector).toBeNull();
    expect(doc.skills).toEqual([]);
    expect(doc.bodyHtml).toBe("<p>hi</p>");
  });
});

describe("plugins — catalog (Fase 1: first pilot)", () => {
  it("lists the seo-audit pilot in both languages", async () => {
    for (const lang of ["en", "es"] as const) {
      const plugins = await listPlugins(lang);
      const seo = plugins.find((p) => p.slug === "seo-audit");
      expect(seo, `seo-audit should be listed in ${lang}`).toBeDefined();
      expect(seo?.connectorSlug).toBe("firecrawl");
      expect(seo?.skillSlugs).toEqual(["seo-auditor"]);
    }
    await expect(listPluginSlugs()).resolves.toContain("seo-audit");
  });

  it("composes the pilot by resolving its real pieces by slug", async () => {
    const doc = await getPlugin("es", "seo-audit");
    expect(doc).not.toBeNull();
    // The connector piece resolves to the real Firecrawl connector...
    expect(doc?.connector?.slug).toBe("firecrawl");
    // ...and the skill piece resolves to the real SEO Auditor skill.
    expect(doc?.skills.map((s) => s.slug)).toEqual(["seo-auditor"]);
    // The plugin file itself carries no duplicated piece content — only glue.
    expect(doc?.bodyHtml).toContain("Firecrawl");
  });

  it("returns null for a slug that does not exist", async () => {
    await expect(getPlugin("es", "nope-not-real")).resolves.toBeNull();
  });

  it("packages existing official connectors with evaluated skills (gmail, gdrive)", async () => {
    const cases = [
      { slug: "gmail", connector: "gmail", skill: "internal-comms" },
      { slug: "gdrive", connector: "gdrive", skill: "doc-coauthoring" },
      { slug: "slack", connector: "slack", skill: "internal-comms" },
      { slug: "notion", connector: "notion", skill: "doc-coauthoring" },
      { slug: "github", connector: "github", skill: "code-reviewer" },
      { slug: "stripe", connector: "stripe", skill: "internal-comms" },
    ] as const;

    for (const lang of ["en", "es"] as const) {
      const slugs = (await listPlugins(lang)).map((p) => p.slug);
      for (const c of cases) {
        expect(slugs, `${c.slug} listed in ${lang}`).toContain(c.slug);
        const doc = await getPlugin(lang, c.slug);
        expect(doc?.connector?.slug, `${c.slug} connector`).toBe(c.connector);
        expect(doc?.skills.map((s) => s.slug), `${c.slug} skill`).toEqual([c.skill]);
      }
    }
  });
});
