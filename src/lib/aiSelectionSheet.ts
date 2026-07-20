/**
 * AI-Selection metrics — live read from the AI-Selection-Events Google Sheet.
 *
 * The desktop app beacons one row per AI-selection event (no PII) → an n8n
 * webhook appends it to this Sheet. The terminal-sync repo has a daily GH
 * Action that aggregates the same Sheet into a markdown snapshot on the
 * `ops/metrics` branch. This module is the WEB read path: it re-runs the same
 * aggregation on demand so /admin/ai-selection shows LIVE numbers instead of a
 * once-a-day file.
 *
 * `aggregate()` mirrors scripts/ai-selection/build-ai-selection.mjs in the
 * terminal-sync repo — keep them in sync if the event schema changes.
 *
 * Privacy red line (same as every metrics pipeline): only classification
 * columns are read (SAFE_COLUMNS). The raw folder name / email / session id
 * never enter — the Sheet doesn't even carry them.
 */

import crypto from "node:crypto";

const DAY_MS = 86_400_000;

// Classification columns only — the PII firewall.
const SAFE_COLUMNS = [
  "event",
  "system",
  "provider",
  "hadAi",
  "minutesBucket",
  "locale",
  "plan",
  "createdAt",
] as const;

const SYSTEMS = ["byok", "courtesy", "none"] as const;
const PROVIDERS = ["claude", "codex", "gemini"] as const;

export type AiSelectionRow = Partial<Record<(typeof SAFE_COLUMNS)[number], string>>;

export interface AiSelectionAggregate {
  total: number;
  resolved: number;
  bySystem: { byok: number; courtesy: number; none: number; other: number };
  byProvider: { claude: number; codex: number; gemini: number; other: number };
  byLocale: Record<string, number>;
  byPlan: Record<string, number>;
  arrivedWithAi: number;
  arrivedWithoutAi: number;
  noAiRate: number;
  byokRate: number;
  courtesyRate: number;
  noneRate: number;
  courtesyStarted: number;
  courtesyExhausted: number;
  courtesyConverted: number;
  courtesyConversionRate: number;
  minutesBuckets: Record<string, number>;
  authNeeded: number;
  authSwitched: number;
  authConnect: number;
  authSwitchRate: number;
  last7: number;
  last30: number;
  latestMs: number | null;
  daysSinceLatest: number | null;
}

function norm(v: unknown): string {
  return String(v ?? "").trim();
}

function asBool(v: unknown): boolean {
  return ["true", "1", "yes", "y", "si", "sí"].includes(norm(v).toLowerCase());
}

function bump(obj: Record<string, number>, key: string): void {
  const k = key || "unknown";
  obj[k] = (obj[k] || 0) + 1;
}

/** Reduce AI-selection rows to aggregate counts + rates. Touches only SAFE_COLUMNS. */
export function aggregate(
  rows: AiSelectionRow[],
  { now = Date.now() }: { now?: number } = {},
): AiSelectionAggregate {
  const bySystem = { byok: 0, courtesy: 0, none: 0, other: 0 };
  const byProvider = { claude: 0, codex: 0, gemini: 0, other: 0 };
  const byLocale: Record<string, number> = {};
  const byPlan: Record<string, number> = {};
  const minutesBuckets: Record<string, number> = {};

  let courtesyStarted = 0;
  let courtesyExhausted = 0;
  let courtesyConverted = 0;
  let authNeeded = 0;
  let authSwitched = 0;
  let authConnect = 0;
  let resolved = 0;
  let arrivedWithAi = 0;
  let arrivedWithoutAi = 0;
  let last7 = 0;
  let last30 = 0;
  let latestMs: number | null = null;

  for (const r of rows) {
    const event = norm(r.event).toLowerCase() || "resolved";

    const t = Date.parse(norm(r.createdAt));
    if (!Number.isNaN(t)) {
      if (latestMs === null || t > latestMs) latestMs = t;
      if (now - t <= 7 * DAY_MS) last7++;
      if (now - t <= 30 * DAY_MS) last30++;
    }

    switch (event) {
      case "resolved": {
        resolved++;
        const system = norm(r.system).toLowerCase();
        if ((SYSTEMS as readonly string[]).includes(system)) {
          bySystem[system as (typeof SYSTEMS)[number]]++;
        } else {
          bump(bySystem as unknown as Record<string, number>, "other");
        }
        if (system === "byok") {
          const provider = norm(r.provider).toLowerCase();
          if ((PROVIDERS as readonly string[]).includes(provider)) {
            byProvider[provider as (typeof PROVIDERS)[number]]++;
          } else {
            bump(byProvider as unknown as Record<string, number>, "other");
          }
        }
        if (asBool(r.hadAi)) arrivedWithAi++;
        else arrivedWithoutAi++;
        bump(byLocale, norm(r.locale).toLowerCase() || "unknown");
        bump(byPlan, norm(r.plan).toLowerCase() || "unknown");
        break;
      }
      case "courtesy_started":
        courtesyStarted++;
        break;
      case "courtesy_exhausted":
        courtesyExhausted++;
        if (norm(r.minutesBucket)) bump(minutesBuckets, norm(r.minutesBucket));
        break;
      case "courtesy_converted":
        courtesyConverted++;
        if (norm(r.minutesBucket)) bump(minutesBuckets, norm(r.minutesBucket));
        break;
      case "auth_needed":
        authNeeded++;
        break;
      case "auth_switched":
        authSwitched++;
        break;
      case "auth_connect":
        authConnect++;
        break;
      default:
        bump(bySystem as unknown as Record<string, number>, "other");
        break;
    }
  }

  const rate = (n: number, d: number) => (d ? n / d : 0);

  return {
    total: rows.length,
    resolved,
    bySystem,
    byProvider,
    byLocale,
    byPlan,
    arrivedWithAi,
    arrivedWithoutAi,
    noAiRate: rate(arrivedWithoutAi, arrivedWithAi + arrivedWithoutAi),
    byokRate: rate(bySystem.byok, resolved),
    courtesyRate: rate(bySystem.courtesy, resolved),
    noneRate: rate(bySystem.none, resolved),
    courtesyStarted,
    courtesyExhausted,
    courtesyConverted,
    courtesyConversionRate: rate(courtesyConverted, courtesyStarted),
    minutesBuckets,
    authNeeded,
    authSwitched,
    authConnect,
    authSwitchRate: rate(authSwitched, authNeeded),
    last7,
    last30,
    latestMs,
    daysSinceLatest: latestMs === null ? null : Math.floor((now - latestMs) / DAY_MS),
  };
}

function base64url(buf: Buffer | string): string {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/=+$/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function getAccessToken(saKey: string): Promise<string> {
  const sa = JSON.parse(saKey) as { client_email: string; private_key: string };
  const iat = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat,
      exp: iat + 3600,
    }),
  );
  const signingInput = `${header}.${claim}`;
  const signature = base64url(
    crypto.createSign("RSA-SHA256").update(signingInput).sign(sa.private_key),
  );
  const assertion = `${signingInput}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!res.ok) throw new Error(`token exchange failed: ${res.status}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

/** Read the Sheet's used range; keep ONLY SAFE_COLUMNS (PII firewall). */
export async function readAiSelectionRows(opts: {
  sheetId: string;
  tab?: string;
  saKey: string;
}): Promise<AiSelectionRow[]> {
  const { sheetId, tab = "Sheet1", saKey } = opts;
  const token = await getAccessToken(saKey);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(tab)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`sheets read failed: ${res.status}`);
  const values = (((await res.json()) as { values?: string[][] }).values || []) as string[][];
  if (values.length < 2) return [];
  const headers = values[0].map((h) => String(h).trim());
  const safe = new Set<string>(SAFE_COLUMNS);
  return values.slice(1).map((row) => {
    const obj: AiSelectionRow = {};
    headers.forEach((h, i) => {
      if (safe.has(h)) obj[h as (typeof SAFE_COLUMNS)[number]] = row[i] ?? "";
    });
    return obj;
  });
}
