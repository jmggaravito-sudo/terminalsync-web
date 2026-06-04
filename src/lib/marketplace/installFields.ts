/**
 * Derive Phase 2 install fields from an MCP manifest.
 *
 * Background — the desktop Lab (terminal-sync) introduced a Phase 2
 * install path (`custom_mcps`) for community MCPs that don't ship with
 * the curated `cn-`/`sk-` registry. Trigger: the user drops a connector
 * with a non-prefixed slug from the Explorar drawer onto a session
 * card. To actually install, the desktop needs:
 *
 *   - `installMethod`: "npm" | "github" | "local"
 *   - `installSpec`:   npm package name | github URL | absolute path
 *   - `installArgs`:   extra args to pass after the recipe's own
 *   - `installEnv`:    map of `vault_key → env_var_name`
 *
 * The shape mirrors the desktop's `McpInstallSpec` (TS) and Rust
 * `custom_mcps::McpInstallSpec`. The endpoint adds these fields next to
 * `hasManifest` so the Lab can build the spec without a second
 * round-trip to fetch the raw manifest.
 *
 * Detection strategy (best-effort, conservative — when we can't tell
 * the method confidently we return `undefined` and the Lab falls back
 * to its "drag&drop not supported" toast):
 *
 *   - Manifest has exactly one mcpServers entry (the common case for
 *     Claude config snippets). Read its `command` + `args`.
 *   - `command === "npx" && args[0] === "-y"` → npm, spec = args[1]
 *   - `command === "node" && args[0]` exists → local, spec = args[0]
 *   - Anything else → undefined (we don't want to guess wrong)
 *
 * The github recipe is harder to autodetect from a manifest because git
 * URLs aren't typically embedded in the Claude config — they're a
 * setup step. For now we leave github install fields to be authored
 * explicitly in the connector frontmatter (`installMethod: "github"`,
 * `installSpec: "https://github.com/..."`).
 *
 * Frontmatter override: if the connector markdown declares
 * `installMethod`/`installSpec`/`installArgs`/`installEnv` at the top
 * level (outside of `manifest`), those win over the derived values.
 * That lets curators set github URLs without restructuring the
 * manifest, and overrides our derivation when it gets it wrong.
 */

export interface InstallFields {
  installMethod?: string;
  installSpec?: string;
  installArgs?: string[];
  installEnv?: Record<string, string>;
}

/** Parsed shape of an mcpServer entry — the value side of mcpServers map. */
interface McpServerEntry {
  command?: string;
  args?: unknown;
  env?: unknown;
}

/** Derive install fields from a manifest with a single mcpServers entry.
 *
 *  Returns `{}` (all undefined) when we can't confidently detect the
 *  method — that's the signal the caller uses to fall back to the
 *  curator-authored frontmatter values. */
export function deriveInstallFromManifest(
  manifest: unknown,
): InstallFields {
  if (!manifest || typeof manifest !== "object") return {};
  const m = manifest as { mcpServers?: Record<string, unknown> };
  if (!m.mcpServers || typeof m.mcpServers !== "object") return {};

  const entries = Object.values(m.mcpServers);
  // Only autodetect for the single-entry case. Multi-server manifests are
  // ambiguous — the curator must author install fields explicitly.
  if (entries.length !== 1) return {};

  const entry = entries[0] as McpServerEntry;
  if (!entry || typeof entry !== "object") return {};

  const command = typeof entry.command === "string" ? entry.command : undefined;
  const rawArgs = Array.isArray(entry.args) ? entry.args : [];
  const args = rawArgs.filter((a): a is string => typeof a === "string");

  // npm shape: `npx -y <pkg> [extra args]`
  if (command === "npx" && args[0] === "-y" && args[1]) {
    const installSpec = args[1];
    const installArgs = args.slice(2);
    return {
      installMethod: "npm",
      installSpec,
      installArgs: installArgs.length > 0 ? installArgs : undefined,
      installEnv: extractEnvMapping(entry.env),
    };
  }

  // local shape: `node /abs/path/to/server.js [extra args]`
  if (command === "node" && args[0]) {
    const installSpec = args[0];
    const installArgs = args.slice(1);
    return {
      installMethod: "local",
      installSpec,
      installArgs: installArgs.length > 0 ? installArgs : undefined,
      installEnv: extractEnvMapping(entry.env),
    };
  }

  // No confident detection — return blank fields. Curator can author
  // explicitly in frontmatter to override.
  return {};
}

/** Pull `installMethod`/`installSpec`/`installArgs`/`installEnv` from
 *  flat frontmatter values. Used as the override path when curators
 *  want to declare install metadata that the manifest auto-derive
 *  can't infer (github URLs, multi-server manifests, etc.). */
export function readInstallOverrideFromFrontmatter(
  fm: Record<string, unknown>,
): InstallFields {
  const out: InstallFields = {};
  if (typeof fm.installMethod === "string") out.installMethod = fm.installMethod;
  if (typeof fm.installSpec === "string") out.installSpec = fm.installSpec;
  if (Array.isArray(fm.installArgs)) {
    const filtered = fm.installArgs.filter(
      (a): a is string => typeof a === "string",
    );
    if (filtered.length > 0) out.installArgs = filtered;
  }
  if (
    fm.installEnv &&
    typeof fm.installEnv === "object" &&
    !Array.isArray(fm.installEnv)
  ) {
    const env: Record<string, string> = {};
    for (const [k, v] of Object.entries(fm.installEnv)) {
      if (typeof v === "string") env[k] = v;
    }
    if (Object.keys(env).length > 0) out.installEnv = env;
  }
  return out;
}

/** Merge derived + override (override wins per-field). Returns the
 *  combined `InstallFields`. The Lab's desktop wrapper requires BOTH
 *  `installMethod` AND `installSpec` to construct the spec; if either
 *  is missing in the merged result, the Lab falls back to the toast. */
export function mergeInstallFields(
  derived: InstallFields,
  override: InstallFields,
): InstallFields {
  return {
    installMethod: override.installMethod ?? derived.installMethod,
    installSpec: override.installSpec ?? derived.installSpec,
    installArgs: override.installArgs ?? derived.installArgs,
    installEnv: override.installEnv ?? derived.installEnv,
  };
}

/** Convert the `env` of a Claude config server entry to the
 *  `vault_key → env_var_name` shape the Lab expects.
 *
 *  Heuristic: an env value of `${SECRET:NAME}` translates to mapping
 *  `NAME → <key>` where `<key>` is the env var name. That matches the
 *  Lab's vault placeholder convention (`${vault:NAME}` in Claude
 *  config after install). Values that aren't placeholder-shaped are
 *  ignored — they'd be hardcoded constants the curator already set.
 *
 *  Empty result → undefined (so JSON serialization drops the field). */
function extractEnvMapping(
  env: unknown,
): Record<string, string> | undefined {
  if (!env || typeof env !== "object") return undefined;
  const out: Record<string, string> = {};
  for (const [envVar, val] of Object.entries(env as Record<string, unknown>)) {
    if (typeof val !== "string") continue;
    const match = val.match(/^\$\{SECRET:([A-Z0-9_]+)\}$/);
    if (match) {
      out[match[1]] = envVar;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}
