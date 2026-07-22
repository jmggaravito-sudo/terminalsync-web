import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  isBundleItemKind,
  resolveBundleItems,
  type BundleItemRef,
} from "./bundleItems";

/**
 * Kits REFERENTIAL-INTEGRITY GATE.
 *
 * A Kit (Stack Pack) is the role-level bundle: it declares
 * `items: [{kind, slug}]` referencing connectors, skills, cli-tools, and
 * plugins BY REFERENCE (content/kits/RULES.md → pieces → Plugin → Kit). The
 * catalog loader (`loadFileKits` → `resolveBundleItems`) resolves those refs and
 * — by design — DROPS any item that doesn't resolve SILENTLY (a content error
 * must not 500 the catalog). That safety valve hides the exact failure this gate
 * catches: a kit that references a connector/skill/cli/plugin slug that was
 * renamed, hidden, or never existed ships INCOMPLETE — the card renders with a
 * piece quietly missing, no error anywhere. It is the same silent-drop bug that
 * bit plugins before `plugins.integrity.test.ts`.
 *
 * The catalog route test only pins ONE kit (marketing-campaign-seo). This gate
 * covers every kit, in both locales, so no kit can go public with a dangling
 * reference. It resolves through the SAME `resolveBundleItems` the loader uses,
 * so gate and loader never drift.
 *
 * Kit LOGOS are already gated elsewhere: `loadFileKits` throws when a kit's
 * `logo` asset is missing, so a broken logo fails the catalog route test.
 */

const LOCALES = ["en", "es"];
const KITS_DIR = path.join(process.cwd(), "content", "kits");

interface DeclaredItem {
  kind: string;
  slug: string;
}

/** Mirror of route.ts `parseKitItems` (private there) — pulls the declared
 *  (kind, slug) pairs straight from frontmatter, before any resolution. */
function declaredItems(fmItems: unknown): DeclaredItem[] {
  if (!Array.isArray(fmItems)) return [];
  const out: DeclaredItem[] = [];
  for (const value of fmItems) {
    if (!value || typeof value !== "object") continue;
    const row = value as Record<string, unknown>;
    if (
      typeof row.kind === "string" &&
      typeof row.slug === "string" &&
      row.slug.trim()
    ) {
      out.push({ kind: row.kind, slug: row.slug.trim() });
    }
  }
  return out;
}

function kitFiles(lang: string): string[] {
  const dir = path.join(KITS_DIR, lang);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".md")).sort();
}

describe("kits integrity gate — every available kit's declared items resolve", () => {
  it("has kits to check (guards against a content/loader break)", () => {
    expect(kitFiles("en").length).toBeGreaterThan(0);
  });

  it("resolves every declared item of every available kit (nothing silently dropped)", async () => {
    let checkedKits = 0;
    let checkedItems = 0;

    for (const lang of LOCALES) {
      for (const file of kitFiles(lang)) {
        const slug = file.replace(/\.md$/, "");
        const raw = fs.readFileSync(path.join(KITS_DIR, lang, file), "utf8");
        const { data } = matter(raw);
        const fm = data as Record<string, unknown>;
        // Mirror the loader: only "available" kits reach the public catalog.
        if (typeof fm.status !== "string" || fm.status.trim() !== "available") {
          continue;
        }

        const declared = declaredItems(fm.items);
        // A kit must bundle at least one real piece (RULES.md).
        expect(
          declared.length,
          `[${lang}] kit ${slug} declares at least one item`,
        ).toBeGreaterThan(0);

        // Every declared kind must be a valid pillar (a typo'd kind is dropped
        // by the loader's parseKitItems — catch it here instead).
        for (const item of declared) {
          expect(
            isBundleItemKind(item.kind),
            `[${lang}] kit ${slug} item "${item.kind}:${item.slug}" has a valid kind`,
          ).toBe(true);
        }

        const refs: BundleItemRef[] = declared.map((item, index) => ({
          kind: item.kind as BundleItemRef["kind"],
          slug: item.slug,
          sortOrder: index,
        }));
        const resolved = await resolveBundleItems(refs, lang);

        // Each declared piece must survive resolution — present by (kind, slug).
        for (const item of declared) {
          const found = resolved.find(
            (r) => r.kind === item.kind && r.slug === item.slug,
          );
          expect(
            found,
            `[${lang}] kit ${slug} item "${item.kind}:${item.slug}" must resolve (it is silently dropped otherwise)`,
          ).toBeDefined();
          checkedItems += 1;
        }
        checkedKits += 1;
      }
    }

    // Sanity: we actually exercised kits + items, not a silently-empty loop.
    expect(checkedKits).toBeGreaterThan(0);
    expect(checkedItems).toBeGreaterThan(0);
  });
});
