import { describe, expect, it } from "vitest";
import { listConnectors, type ConnectorMeta } from "./connectors";

/**
 * These tests read the real first-party markdown shipped at
 * content/connectors/<lang>/*.md — there's no fixture indirection.
 * Rationale: the catalog endpoint is what the desktop installs from,
 * so verifying the live frontmatter is exactly what we want. If
 * someone breaks a manifest by deleting a secret placeholder, this
 * suite catches it before the desktop's "necesita clave" badge
 * starts disagreeing with what the install modal actually prompts.
 */
describe("listConnectors / requiresEnvSecrets", () => {
  it("flags connectors with ${SECRET:...} in their manifest as requiresEnvSecrets=true", async () => {
    const items = await listConnectors("en");
    // Notion and Airtable both ship with a manifest that templates an
    // API key. If either ever stops requiring a secret, this test
    // breaks and forces the change to be explicit.
    const notion = items.find((c) => c.slug === "notion");
    const airtable = items.find((c) => c.slug === "airtable");
    expect(notion, "notion missing from catalog").toBeDefined();
    expect(airtable, "airtable missing from catalog").toBeDefined();
    expect(notion?.requiresEnvSecrets).toBe(true);
    expect(airtable?.requiresEnvSecrets).toBe(true);
  });

  it("ships Sheets, Calendar + Xero as installable manifests requiring OAuth secrets", async () => {
    // High-demand loop-catalog connectors that install via npx templates
    // and authenticate with an OAuth client id/secret (Google for the two
    // Google servers, a Xero custom connection for xero). If any loses its
    // manifest or secret placeholder, the
    // desktop's "necesita clave" badge would disagree with the install
    // modal — this test forces that change to be explicit.
    const items = await listConnectors("en");
    for (const slug of [
      "google-sheets", "google-calendar", "xero", "hubspot", "ahrefs",
      "todoist", "monday", "clickup", "twitter", "wordpress",
    ]) {
      const c = items.find((x) => x.slug === slug);
      expect(c, `${slug} missing from catalog`).toBeDefined();
      expect(c?.hasManifest, `${slug} should ship a manifest`).toBe(true);
      expect(c?.requiresEnvSecrets, `${slug} should require env secrets`).toBe(true);
      expect(c?.installMethod, `${slug} should derive an installMethod`).toBe("npm");
    }
  });

  it("flags affiliate-only connectors (no manifest) as requiresEnvSecrets=false", async () => {
    const items = await listConnectors("en");
    // Gmail is an affiliate-only entry — opens gmail.com, no MCP
    // manifest, so nothing to require.
    const gmail = items.find((c) => c.slug === "gmail");
    expect(gmail, "gmail missing from catalog").toBeDefined();
    expect(gmail?.hasManifest).toBe(false);
    expect(gmail?.requiresEnvSecrets).toBe(false);
  });

  it("every returned item has a boolean requiresEnvSecrets (no undefined leaks)", async () => {
    const items = await listConnectors("en");
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(
        typeof item.requiresEnvSecrets,
        `${item.slug} has non-boolean requiresEnvSecrets`,
      ).toBe("boolean");
    }
  });

  it("requiresEnvSecrets implies hasManifest (no manifest → no secrets to require)", async () => {
    const items: ConnectorMeta[] = await listConnectors("en");
    for (const item of items) {
      if (item.requiresEnvSecrets) {
        expect(
          item.hasManifest,
          `${item.slug} requires secrets but has no manifest`,
        ).toBe(true);
      }
    }
  });
});
