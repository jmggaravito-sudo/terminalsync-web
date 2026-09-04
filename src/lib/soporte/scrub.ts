/**
 * PII/secret scrubbing for the "Corregir" loop (S3).
 *
 * The admin panel shows real customer chat turns (pregunta/respuesta) that
 * live in Supabase (private). When a correction turns into a PR against
 * `jmggaravito-sudo/terminal-sync`, that repo is NOT private in the same
 * way — nothing customer-identifying or secret should ever land in a commit
 * or PR body. Two different jobs, both pure and unit-tested:
 *
 *   - `scrubQuotedText` REDACTS emails/phones/URLs-with-querystring from
 *     text that gets quoted verbatim in the PR (the citation of what the
 *     customer asked and what the bot answered badly).
 *   - `detectSecretLike` REJECTS outright — it never tries to redact a
 *     credential, it just flags that one looks present so the route can
 *     refuse the request with 400 before anything is persisted or sent to
 *     GitHub.
 *
 * Neither function talks to Supabase or GitHub — kept side-effect free so
 * both can be exercised directly from tests without mocking anything.
 */

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

// Phone numbers: optional leading +, then digits/spaces/dashes/dots/parens,
// at least 7 digits total. Deliberately permissive on separators (customers
// paste numbers in every format imaginable) but requires enough digits that
// it doesn't eat ordinary short numbers (prices, counts, years).
const PHONE_RE = /(?<!\d)(\+?\d[\d\s().-]{5,}\d)(?!\d)/g;

// URLs that carry a querystring — the part most likely to embed a session
// id, an email, or a token as a query param. Bare URLs without "?" are left
// alone (they're usually just links to docs/marketing pages).
const URL_WITH_QUERY_RE = /https?:\/\/[^\s<>"')]+\?[^\s<>"')]*/gi;

function countDigits(s: string): number {
  return (s.match(/\d/g) ?? []).length;
}

/** Redacts emails, phone numbers, and query-string URLs. Order matters:
 *  emails first (so an email inside a URL's querystring is caught by the
 *  URL pass regardless), then URLs-with-query, then bare phone numbers. */
export function scrubQuotedText(text: string): string {
  if (!text) return text;
  let out = text.replace(EMAIL_RE, "[email redactado]");
  out = out.replace(URL_WITH_QUERY_RE, "[url redactada]");
  out = out.replace(PHONE_RE, (match) => (countDigits(match) >= 7 ? "[teléfono redactado]" : match));
  return out;
}

export interface SecretMatch {
  /** Short machine-readable kind, stable for tests/telemetry. */
  kind: "openai_style_key" | "github_token" | "google_api_key" | "private_key_block" | "long_base64_blob";
  /** Human-readable label for the 400 error message (Spanish, client-safe). */
  label: string;
}

const SECRET_PATTERNS: SecretMatch[] = [
  { kind: "openai_style_key", label: "una API key estilo sk-…" },
  { kind: "github_token", label: "un token de GitHub (ghp_/gho_/ghu_/ghs_/ghr_…)" },
  { kind: "google_api_key", label: "una API key de Google (AIza…)" },
  { kind: "private_key_block", label: "un bloque de clave privada (BEGIN PRIVATE KEY)" },
  { kind: "long_base64_blob", label: "un bloque largo tipo base64 (posible secreto/token)" },
];

const SECRET_TESTS: Record<SecretMatch["kind"], RegExp> = {
  openai_style_key: /\bsk-[A-Za-z0-9_-]{10,}\b/,
  github_token: /\bgh[pousr]_[A-Za-z0-9]{20,}\b/,
  google_api_key: /\bAIza[0-9A-Za-z_-]{30,}\b/,
  private_key_block: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,
  // 40+ contiguous base64-alphabet chars with no separators — long enough
  // that normal prose/URLs essentially never trigger it, short enough to
  // catch a pasted key/token. `=` padding at the end is optional.
  long_base64_blob: /\b[A-Za-z0-9+/]{40,}={0,2}\b/,
};

/** Returns the first secret-like pattern found in `text`, or null. Checked
 *  in the order declared in SECRET_PATTERNS so a specific match (e.g. a
 *  recognizable `sk-` key) is reported over the generic base64 catch-all
 *  when both would technically match the same substring. */
export function detectSecretLike(text: string): SecretMatch | null {
  if (!text) return null;
  for (const candidate of SECRET_PATTERNS) {
    if (SECRET_TESTS[candidate.kind].test(text)) return candidate;
  }
  return null;
}
