// MCP manifest validation. A "manifest" is the snippet that ends up inside
// the user's claude_desktop_config.json under `mcpServers.<name>`. We
// validate the shape strictly enough to reject obvious junk submissions
// without locking out legitimate MCP server configs.
//
// Reference: https://modelcontextprotocol.io/docs

import { createHash } from "node:crypto";

export interface McpManifest {
  /** stdio transport — invoked binary + args. Most servers today. */
  command?: string;
  args?: string[];
  /** sse transport — remote URL. Less common, but valid. */
  url?: string;
  /** Env vars passed to the spawned process. Values that look like secrets
   *  must use the ${SECRET:NAME} placeholder so the desktop client knows
   *  to substitute from the OS Keychain. */
  env?: Record<string, string>;
  /** Optional: connector author can declare what scopes the user is
   *  granting. Surfaced in the install confirmation dialog. */
  scopes?: string[];
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

const SECRET_PATTERN = /^\$\{SECRET:[A-Z0-9_]+\}$/;
const SUSPICIOUS_VALUE_HINTS = ["sk_", "key_", "token_", "ghp_", "AKIA"];

export function validateManifest(raw: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, errors: ["manifest must be a JSON object"], warnings };
  }
  const m = raw as Record<string, unknown>;

  const hasStdio = typeof m.command === "string";
  const hasSse = typeof m.url === "string";
  if (!hasStdio && !hasSse) {
    errors.push("must define either `command` (stdio) or `url` (sse)");
  }
  if (hasStdio && hasSse) {
    errors.push("use either `command` or `url`, not both");
  }

  if (hasStdio) {
    if (m.args !== undefined) {
      if (!Array.isArray(m.args) || m.args.some((a) => typeof a !== "string")) {
        errors.push("`args` must be an array of strings");
      }
    }
  }

  if (hasSse) {
    try {
      const u = new URL(m.url as string);
      if (u.protocol !== "https:") {
        errors.push("`url` must be https://");
      }
    } catch {
      errors.push("`url` is not a valid URL");
    }
  }

  if (m.env !== undefined) {
    if (typeof m.env !== "object" || Array.isArray(m.env) || m.env === null) {
      errors.push("`env` must be an object");
    } else {
      for (const [k, v] of Object.entries(m.env)) {
        if (typeof v !== "string") {
          errors.push(`env.${k} must be a string`);
          continue;
        }
        // Hard reject: looks like a real secret pasted in plaintext.
        const looksLikeSecret = SUSPICIOUS_VALUE_HINTS.some((p) => v.startsWith(p));
        if (looksLikeSecret) {
          errors.push(
            `env.${k} looks like a real secret — use the \${SECRET:NAME} placeholder instead`,
          );
          continue;
        }
        // Soft warn: anything non-trivial that isn't a placeholder probably
        // should be — but config defaults like "true" or "production" are fine.
        if (!SECRET_PATTERN.test(v) && v.length > 24) {
          warnings.push(
            `env.${k} is long and not a placeholder — confirm it's not a secret`,
          );
        }
      }
    }
  }

  if (m.scopes !== undefined) {
    if (!Array.isArray(m.scopes) || m.scopes.some((s) => typeof s !== "string")) {
      errors.push("`scopes` must be an array of strings");
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}

/** Canonicalize manifest JSON (sorted keys, no whitespace) and return the
 *  sha256 hex digest. Stored on the version row so install clients can
 *  verify integrity before merging into claude_desktop_config.json. */
export function manifestChecksum(m: McpManifest): string {
  const canonical = JSON.stringify(sortKeys(m));
  return createHash("sha256").update(canonical).digest("hex");
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, k) => {
        acc[k] = sortKeys((value as Record<string, unknown>)[k]);
        return acc;
      }, {});
  }
  return value;
}
