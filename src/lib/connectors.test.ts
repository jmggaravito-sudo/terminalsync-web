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

  it("ships loop-catalog connectors as installable manifests requiring OAuth secrets", async () => {
    // High-demand loop-catalog connectors that install via npx templates and
    // authenticate with an OAuth client id / API secret. gmail is the
    // automation catalog's #1 need (email = 47 loops). If any loses its
    // manifest or secret placeholder, the desktop's "necesita clave" badge
    // would disagree with the install modal — this test forces the change to
    // be explicit.
    const items = await listConnectors("en");
    for (const slug of [
      "google-sheets", "google-calendar", "xero", "hubspot", "ahrefs",
      "todoist", "monday", "clickup", "twitter", "wordpress", "gmail",
    ]) {
      const c = items.find((x) => x.slug === slug);
      expect(c, `${slug} missing from catalog`).toBeDefined();
      expect(c?.hasManifest, `${slug} should ship a manifest`).toBe(true);
      expect(c?.requiresEnvSecrets, `${slug} should require env secrets`).toBe(true);
      expect(c?.installMethod, `${slug} should derive an installMethod`).toBe("npm");
    }
  });

  it("flags no-manifest connectors as requiresEnvSecrets=false", async () => {
    const items = await listConnectors("en");
    // Shopify is a first-party connector that connects in-app — no MCP
    // manifest in the catalog, so nothing to require here.
    const shopify = items.find((c) => c.slug === "shopify");
    expect(shopify, "shopify missing from catalog").toBeDefined();
    expect(shopify?.hasManifest).toBe(false);
    expect(shopify?.requiresEnvSecrets).toBe(false);
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

/**
 * Hasta 2026-08-07 el desktop solo escribía la config de Claude: Codex y
 * Gemini devolvían "writer not implemented yet". Un connector se presentaba
 * como universal y llegaba a UNA IA, sin que nada en el catálogo lo dijera —
 * el cliente lo instalaba y su IA no lo veía nunca (terminal-sync#1262).
 *
 * `deliveredTo` es ese dato, ahora explícito y servido.
 */
describe("listConnectors / deliveredTo (a qué IAs llega)", () => {
  it("todo connector declara a qué IAs llega", async () => {
    const items = await listConnectors("en");
    expect(items.length).toBeGreaterThan(0);
    for (const c of items) {
      expect(c.deliveredTo, `${c.slug} sin deliveredTo`).toBeDefined();
      expect(c.deliveredTo.length, `${c.slug} con deliveredTo vacío`).toBeGreaterThan(0);
    }
  });

  it("llega a las tres IAs con escritor: claude, codex y gemini", async () => {
    const items = await listConnectors("en");
    const notion = items.find((c) => c.slug === "notion");
    expect(notion).toBeDefined();
    expect([...notion!.deliveredTo].sort()).toEqual(["claude", "codex", "gemini"]);
  });

  it("no lista TerminalSync/GLM aparte — corre sobre el CLI de Claude y hereda su config", async () => {
    // Listarlo daría a entender que hay una cuarta escritura, y no la hay.
    const items = await listConnectors("en");
    for (const c of items) {
      expect(c.deliveredTo, `${c.slug} lista glm por separado`).not.toContain("glm");
    }
  });

  it("es igual para todos: la entrega es del sistema, no del connector", async () => {
    // Si esto empieza a fallar es porque alguien introdujo variación por
    // connector. No está mal — pero exige un override explícito y documentado,
    // no que se cuele silenciosamente.
    const items = await listConnectors("en");
    const shapes = new Set(items.map((c) => [...c.deliveredTo].sort().join(",")));
    expect([...shapes]).toEqual(["claude,codex,gemini"]);
  });
});
