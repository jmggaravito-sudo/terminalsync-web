import { describe, expect, it } from "vitest";
import { listPlugins, getPlugin } from "./plugins";
import { buildRawSkillPayload } from "./marketplace/rawSkill";

/**
 * Plugins REFERENTIAL-INTEGRITY GATE.
 *
 * A Plugin is glue: it BUNDLES a connector + skill(s) BY REFERENCE and never
 * copies their content (content/plugins/RULES.md → "The composition rule").
 * The loader (`getPlugin`) resolves those references at read time and — by
 * design — drops a missing piece SILENTLY (a content error must not 500 the
 * page). That safety valve hides the exact failure this gate exists to catch:
 * a plugin that is PUBLIC on the catalog but points at a connector or skill
 * that doesn't resolve, or a skill the app can't actually deliver. Such a
 * plugin "loads fine" on the site yet installs broken on the desktop —
 * the connector card is empty, or `ensure_skill_installed` 404s on /raw.
 *
 * This gate asserts, for every PUBLIC plugin, that:
 *   1. Its declared connector (if any) resolves.
 *   2. Every declared skill resolves.
 *   3. Every bundled skill is actually deliverable via /raw — the same
 *      `buildRawSkillPayload` the desktop install path hits (ok, or an
 *      `included` native skill that ships with the app).
 * It also enforces the ES/EN parity rule (RULES.md → "ES/EN parity is strict").
 *
 * Mirrors the skills delivery gate (marketplace/rawSkill.test.ts): the loop
 * that publishes a plugin can't go public until the pieces it references are
 * real and shippable.
 */

const LOCALES = ["en", "es"];

describe("plugins integrity gate — every public plugin's pieces resolve and ship", () => {
  it("has public plugins to check (guards against a total loader break)", async () => {
    const plugins = await listPlugins("en");
    expect(plugins.length).toBeGreaterThan(0);
  });

  it("resolves the connector and every skill each public plugin declares", async () => {
    for (const lang of LOCALES) {
      const plugins = await listPlugins(lang);
      for (const meta of plugins) {
        const doc = await getPlugin(lang, meta.slug);
        expect(doc, `[${lang}] plugin ${meta.slug} must load`).not.toBeNull();
        if (!doc) continue;

        // A plugin must reference at least one real piece — the loader's
        // isPublic() already enforces this, but assert it so an all-empty
        // plugin can never slip through as "public".
        expect(
          Boolean(meta.connectorSlug) || meta.skillSlugs.length > 0,
          `[${lang}] plugin ${meta.slug} references at least one piece`,
        ).toBe(true);

        // The declared connector must resolve (getPlugin silently nulls a
        // missing one). First-party connectors resolve from disk; a dangling
        // slug — or a marketplace-only connector unreachable without Supabase —
        // fails here, which is the intended catch: a public plugin should
        // bundle a delivery-safe, curated connector.
        if (meta.connectorSlug) {
          expect(
            doc.connector,
            `[${lang}] plugin ${meta.slug} connector "${meta.connectorSlug}" must resolve`,
          ).not.toBeNull();
          expect(doc.connector?.slug).toBe(meta.connectorSlug);
        }

        // Every declared skill must resolve (getPlugin skips missing ones).
        const resolved = doc.skills.map((s) => s.slug);
        for (const skillSlug of meta.skillSlugs) {
          expect(
            resolved,
            `[${lang}] plugin ${meta.slug} skill "${skillSlug}" must resolve`,
          ).toContain(skillSlug);
        }
      }
    }
  });

  it("every skill a public plugin bundles is deliverable via /raw", async () => {
    const bundled = new Set<string>();
    for (const lang of LOCALES) {
      for (const plugin of await listPlugins(lang)) {
        for (const skillSlug of plugin.skillSlugs) bundled.add(skillSlug);
      }
    }
    expect(bundled.size).toBeGreaterThan(0);

    for (const slug of bundled) {
      const result = await buildRawSkillPayload(slug);
      // Deliverable = the raw endpoint serves it (ok), OR it's a native
      // "included" skill that ships with Claude Code (409, not installed via
      // /raw but present on the client anyway). A staged/hidden/missing skill
      // returns 404/410 with no `included` flag — that's a broken public
      // plugin bundling an undeliverable skill.
      const deliverable = result.ok ? true : result.included === true;
      expect(
        deliverable,
        `skill "${slug}" is bundled by a public plugin but not deliverable via /raw`,
      ).toBe(true);
    }
  });

  it("keeps strict ES/EN parity — same public plugin slugs in both languages", async () => {
    const en = (await listPlugins("en")).map((p) => p.slug).sort();
    const es = (await listPlugins("es")).map((p) => p.slug).sort();
    expect(es, "ES public plugins must match EN (RULES.md: parity is strict)").toEqual(en);
  });
});
