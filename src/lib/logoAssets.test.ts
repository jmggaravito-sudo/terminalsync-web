import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { listPlugins } from "./plugins";
import { listSkills } from "./skills";

/**
 * Marketplace LOGO-ASSET GATE.
 *
 * Every public skill and plugin carries a `logo` field. When it's a
 * root-relative path (the default is `/skills/<slug>.svg` /
 * `/plugins/<slug>.svg`), the file MUST be committed under `public/` or the
 * catalog renders a blank card — the icon 404s in the browser and in the
 * desktop Lab's WebView. This is a real, silent failure mode: a skill can be
 * published (content on disk, catalog-ready) and still ship broken because
 * nobody committed its icon. It bit the 6 CRM skills, whose default logos were
 * never added.
 *
 * Connector logos are already covered by the catalog route test
 * (`route.test.ts` → "normalizes connector logos ... backed by committed
 * assets"). This gate closes the same hole for the other two public pillars.
 * External (https://) logos are out of scope — we only own what's in `public/`.
 */

const LOCALES = ["en", "es"];
const PUBLIC_DIR = path.join(process.cwd(), "public");

/** A logo is deliverable when it's an external URL (someone else's asset) or a
 *  root-relative path that resolves to a committed file under `public/`. */
function logoResolves(logo: string): boolean {
  if (!logo.startsWith("/")) return true; // external URL — not ours to gate.
  return fs.existsSync(path.join(PUBLIC_DIR, logo));
}

describe("marketplace logo assets — every public item's icon is committed", () => {
  it("every public skill's logo resolves to a file under public/", async () => {
    const missing: string[] = [];
    for (const lang of LOCALES) {
      for (const skill of await listSkills(lang)) {
        if (!logoResolves(skill.logo)) {
          missing.push(`[${lang}] skill ${skill.slug} → ${skill.logo}`);
        }
      }
    }
    expect(missing, "public skills whose logo asset is missing").toEqual([]);
  });

  it("every public plugin's logo resolves to a file under public/", async () => {
    const missing: string[] = [];
    for (const lang of LOCALES) {
      for (const plugin of await listPlugins(lang)) {
        if (!logoResolves(plugin.logo)) {
          missing.push(`[${lang}] plugin ${plugin.slug} → ${plugin.logo}`);
        }
      }
    }
    expect(missing, "public plugins whose logo asset is missing").toEqual([]);
  });
});
