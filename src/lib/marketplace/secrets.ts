/**
 * Secret-template helpers for MCP connector manifests.
 *
 * The convention in our manifests: env values that need a user-provided
 * key are templated as `${SECRET:NAME}` where NAME is `[A-Z0-9_]+`. The
 * desktop install modal prompts the user for each NAME before writing the
 * config; the marketplace catalog endpoint uses the same scan to flag
 * connectors that require keys so the UI can show a "necesita clave"
 * indicator (and drag&drop can route to the install modal instead of
 * dropping a half-installed entry into `mcpServers`).
 *
 * Lives in `lib/` (not inside the route handler) so both the manifest
 * endpoint and the catalog endpoint share one implementation.
 */

/**
 * Walks any nested object/array, returning the unique set of secret names
 * referenced via `${SECRET:NAME}` strings. Order is sorted ascending so
 * the output is stable across runs (relied on by the manifest endpoint
 * for its JSON response and any consumer comparing checksums).
 *
 * Implementation note: the regex uses `[A-Z0-9_]+` to match secret names
 * — case-sensitive on purpose. Lowercase is intentionally rejected so a
 * stray `${SECRET:my_thing}` in a manifest doesn't silently work in dev
 * and break in prod against a stricter validator.
 */
export function extractSecretNames(obj: unknown): string[] {
  const out = new Set<string>();
  const visit = (v: unknown): void => {
    if (typeof v === "string") {
      const matches = v.matchAll(/\$\{SECRET:([A-Z0-9_]+)\}/g);
      for (const m of matches) out.add(m[1]);
      return;
    }
    if (Array.isArray(v)) {
      for (const x of v) visit(x);
      return;
    }
    if (v && typeof v === "object") {
      for (const x of Object.values(v as Record<string, unknown>)) visit(x);
    }
  };
  visit(obj);
  return Array.from(out).sort();
}

/**
 * Boolean form of `extractSecretNames` for the common case "does this
 * thing need any keys?". Used by the catalog endpoint to flag each
 * connector item so the panel can show a "necesita clave" badge without
 * shipping the full secret list. Cheap (`.length > 0` short-circuits).
 */
export function manifestRequiresEnvSecrets(manifest: unknown): boolean {
  return extractSecretNames(manifest).length > 0;
}
