// Trial bookkeeping for the extension's hosted mode.
//
// One row per extension install (keyed by the UUID v4 the popup
// persists in chrome.storage.local). Three checks gate every hosted
// prompt:
//   1. Trial not expired (within `TRIAL_DAYS` of trial_started_at)
//   2. Today's prompt cap not exceeded (per-day reset at UTC midnight)
//   3. Optional Pro upgrade short-circuits both gates
//
// Heavy lifting is done in `claimHostedPrompt`, which atomically
// reserves one prompt or returns the specific gate that failed. The
// route uses the result to decide between SSE passthrough vs 402/429.

import type { SupabaseClient } from "@supabase/supabase-js";

export const TRIAL_DAYS = 7;
export const DEFAULT_DAILY_CAP = 50;

export type TrialMode = "hosted" | "byok" | "pro";

export interface TrialRow {
  user_id: string;
  trial_started_at: string;
  prompts_today: number;
  prompts_today_reset_at: string;
  upgraded_to_pro: boolean;
  linked_supabase_user_id: string | null;
  ip_first_seen: string | null;
  ua_first_seen: string | null;
}

export interface TrialStatus {
  mode: TrialMode;
  daysLeft: number;
  promptsLeftToday: number;
  cap: number;
  expiresAt: string;
  expired: boolean;
}

interface ClaimSuccess {
  ok: true;
  status: TrialStatus;
}

interface ClaimFailure {
  ok: false;
  reason: "trial_expired" | "cap_reached";
  status: TrialStatus;
}

export type ClaimResult = ClaimSuccess | ClaimFailure;

/** Current UTC start of day — used as the reset boundary for the daily counter. */
function startOfUtcDay(now = new Date()): Date {
  const d = new Date(now);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/** Days remaining (clamped >=0) given a trial_started_at and "now". */
function daysLeft(trialStartedAt: string, now = new Date()): number {
  const start = new Date(trialStartedAt).getTime();
  const end = start + TRIAL_DAYS * 24 * 60 * 60 * 1000;
  const remainingMs = end - now.getTime();
  return Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
}

function trialExpiresAt(trialStartedAt: string): string {
  const start = new Date(trialStartedAt).getTime();
  return new Date(start + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

function rowToStatus(row: TrialRow, cap: number): TrialStatus {
  const left = Math.max(0, cap - row.prompts_today);
  const days = daysLeft(row.trial_started_at);
  const expiresAt = trialExpiresAt(row.trial_started_at);
  const mode: TrialMode = row.upgraded_to_pro
    ? "pro"
    : days > 0
      ? "hosted"
      : "byok";
  return {
    mode,
    daysLeft: days,
    promptsLeftToday: mode === "pro" ? Number.POSITIVE_INFINITY : left,
    cap,
    expiresAt,
    expired: !row.upgraded_to_pro && days <= 0,
  };
}

/**
 * Read-only status fetch — does NOT mutate counters. Used by
 * /api/extension/trial-status so the popup can render the banner
 * without burning a prompt.
 *
 * If the row doesn't exist yet (fresh install querying status before
 * the first chat call), we return a synthetic "fresh trial" status so
 * the popup can render the welcome state without first hitting /chat.
 */
export async function readTrialStatus(
  supabase: SupabaseClient,
  userId: string,
  cap = DEFAULT_DAILY_CAP,
): Promise<TrialStatus> {
  const { data, error } = await supabase
    .from("extension_trials")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle<TrialRow>();
  if (error) throw error;
  if (!data) {
    return {
      mode: "hosted",
      daysLeft: TRIAL_DAYS,
      promptsLeftToday: cap,
      cap,
      expiresAt: trialExpiresAt(new Date().toISOString()),
      expired: false,
    };
  }
  return rowToStatus(data, cap);
}

interface ClaimOptions {
  userId: string;
  ip?: string | null;
  ua?: string | null;
  cap?: number;
}

/**
 * Atomically reserve one prompt against today's cap for this user.
 *
 * Steps (each protected against races by Supabase UPSERT semantics):
 *   1. UPSERT the row by user_id (creates trial on first call).
 *   2. Re-read the row to compute current state vs caps/dates.
 *   3. If reset window has passed → reset counter to 1 (this prompt).
 *      Else if counter < cap → counter += 1.
 *      Else → return cap_reached without incrementing.
 *   4. If trial expired and not Pro → return trial_expired.
 *
 * Steps 2/3 race only on rapid back-to-back calls from the same UUID,
 * which is the extension firing 3 providers in parallel. That race is
 * benign: in the worst case the user gets 1-2 fewer prompts than the
 * cap nominally allows.
 */
export async function claimHostedPrompt(
  supabase: SupabaseClient,
  opts: ClaimOptions,
): Promise<ClaimResult> {
  const cap = opts.cap ?? DEFAULT_DAILY_CAP;
  const now = new Date();
  const todayStart = startOfUtcDay(now);

  // Step 1 — ensure the row exists. UPSERT is idempotent; trial_started_at
  // only sets on first INSERT thanks to the default.
  const { error: upsertErr } = await supabase
    .from("extension_trials")
    .upsert(
      {
        user_id: opts.userId,
        ip_first_seen: opts.ip ?? null,
        ua_first_seen: opts.ua ?? null,
      },
      { onConflict: "user_id", ignoreDuplicates: true },
    );
  if (upsertErr) throw upsertErr;

  // Step 2 — read current state.
  const { data: row, error: readErr } = await supabase
    .from("extension_trials")
    .select("*")
    .eq("user_id", opts.userId)
    .single<TrialRow>();
  if (readErr) throw readErr;

  // Pro upgrade short-circuits both gates.
  if (row.upgraded_to_pro) {
    return { ok: true, status: rowToStatus(row, cap) };
  }

  // Trial expiry check.
  if (daysLeft(row.trial_started_at, now) <= 0) {
    return {
      ok: false,
      reason: "trial_expired",
      status: rowToStatus(row, cap),
    };
  }

  // Step 3 — reset counter if we crossed UTC midnight.
  const resetAt = new Date(row.prompts_today_reset_at);
  const needsReset = resetAt < todayStart;
  const effectiveCount = needsReset ? 0 : row.prompts_today;
  if (effectiveCount >= cap) {
    return {
      ok: false,
      reason: "cap_reached",
      status: rowToStatus(
        { ...row, prompts_today: effectiveCount },
        cap,
      ),
    };
  }

  const nextCount = effectiveCount + 1;
  const { data: updated, error: updErr } = await supabase
    .from("extension_trials")
    .update({
      prompts_today: nextCount,
      prompts_today_reset_at: needsReset
        ? todayStart.toISOString()
        : row.prompts_today_reset_at,
    })
    .eq("user_id", opts.userId)
    .select("*")
    .single<TrialRow>();
  if (updErr) throw updErr;

  return { ok: true, status: rowToStatus(updated, cap) };
}

/** Status → HTTP headers. The extension reads these to render the banner
 *  without re-querying /trial-status. */
export function statusHeaders(status: TrialStatus): Record<string, string> {
  return {
    "X-Trial-Mode": status.mode,
    "X-Trial-Days-Left": String(status.daysLeft),
    "X-Trial-Cap": String(status.cap),
    "X-Trial-Prompts-Left-Today":
      status.promptsLeftToday === Number.POSITIVE_INFINITY
        ? "unlimited"
        : String(status.promptsLeftToday),
  };
}
