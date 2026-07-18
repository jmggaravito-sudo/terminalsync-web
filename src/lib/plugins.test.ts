import { describe, expect, it } from "vitest";
import {
  composePlugin,
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

describe("plugins — catalog (Fase 0: no public pilots yet)", () => {
  it("listPlugins is empty until Fase 1 ships pilot plugins", async () => {
    for (const lang of ["en", "es"] as const) {
      await expect(listPlugins(lang)).resolves.toEqual([]);
    }
    await expect(listPluginSlugs()).resolves.toEqual([]);
  });
});
