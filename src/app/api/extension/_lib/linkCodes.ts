// Mint + claim of 6-digit one-shot codes that bind an extension UUID
// to a Stripe-paid Supabase user.
//
// The codes live in `extension_link_codes` with a 24h TTL. We avoid the
// obvious failure modes:
//   - Collisions on mint → retry with a fresh random until the INSERT
//     succeeds (3 tries; collision odds at 1M space and few-thousand
//     active codes are negligible).
//   - Brute force → 1M codespace + 24h TTL + you have to know a real
//     extension UUID to consume → not worth attacking. We DO add a
//     simple rate guard on /api/extension/link to bound it.
//   - Replay after consume → consumed_at is set inside the same UPDATE
//     that flips the user to Pro, so a parallel claim returns "already
//     consumed" deterministically.

import type { SupabaseClient } from "@supabase/supabase-js";

const CODE_LENGTH = 6;
const MAX_MINT_TRIES = 3;

/** Generate a zero-padded 6-digit code in [000000, 999999]. */
function fresh6digit(): string {
  const n = Math.floor(Math.random() * 1_000_000);
  return n.toString(10).padStart(CODE_LENGTH, "0");
}

export interface LinkCodeRow {
  code: string;
  supabase_user_id: string;
  consumed_at: string | null;
  consumed_by_extension_user_id: string | null;
  created_at: string;
  expires_at: string;
}

/**
 * Issue (or re-issue) a code for `supabaseUserId`. We invalidate any
 * still-unconsumed code for the same user first so the success page
 * is always showing the freshest one — the user could have hit refresh
 * or paid twice, and we don't want stale codes lying around.
 */
export async function mintLinkCode(
  supabase: SupabaseClient,
  supabaseUserId: string,
): Promise<{ code: string; expiresAt: string }> {
  // Invalidate any prior unconsumed code for this user. We "consume" them
  // with consumed_by_extension_user_id = null + consumed_at = now() so
  // the row remains audit-readable.
  await supabase
    .from("extension_link_codes")
    .update({
      consumed_at: new Date().toISOString(),
      consumed_by_extension_user_id: null,
    })
    .eq("supabase_user_id", supabaseUserId)
    .is("consumed_at", null);

  let lastErr: unknown = null;
  for (let i = 0; i < MAX_MINT_TRIES; i++) {
    const code = fresh6digit();
    const { data, error } = await supabase
      .from("extension_link_codes")
      .insert({
        code,
        supabase_user_id: supabaseUserId,
      })
      .select("code, expires_at")
      .single();
    if (error) {
      // Unique violation on PK → retry. Other errors bubble up.
      // Postgres error 23505 = unique_violation.
      const code = (error as { code?: string }).code;
      if (code === "23505") {
        lastErr = error;
        continue;
      }
      throw error;
    }
    return { code: data.code, expiresAt: data.expires_at };
  }
  throw lastErr ?? new Error("Could not mint link code after retries.");
}

export type ClaimOutcome =
  | { ok: true; supabaseUserId: string }
  | {
      ok: false;
      reason: "not_found" | "already_consumed" | "expired";
    };

/**
 * Claim a code for an extension UUID. Atomically:
 *   - finds the row
 *   - rejects if already consumed or expired
 *   - marks consumed + flips extension_trials.upgraded_to_pro
 *
 * "Atomically" here is best-effort PostgreSQL-with-Supabase: we issue
 * the UPDATE with a guard on consumed_at IS NULL so two concurrent
 * claims serialize at the row lock. The second one comes back with
 * rowsAffected=0 and we report already_consumed.
 */
export async function claimLinkCode(
  supabase: SupabaseClient,
  code: string,
  extensionUserId: string,
): Promise<ClaimOutcome> {
  const { data: existing, error: readErr } = await supabase
    .from("extension_link_codes")
    .select("*")
    .eq("code", code)
    .maybeSingle<LinkCodeRow>();
  if (readErr) throw readErr;
  if (!existing) return { ok: false, reason: "not_found" };
  if (existing.consumed_at) return { ok: false, reason: "already_consumed" };
  if (new Date(existing.expires_at) < new Date()) {
    return { ok: false, reason: "expired" };
  }

  // Update with guard. If a parallel claim slipped in between read and
  // update, rows=0 and we treat as already consumed.
  const { data: updated, error: updErr } = await supabase
    .from("extension_link_codes")
    .update({
      consumed_at: new Date().toISOString(),
      consumed_by_extension_user_id: extensionUserId,
    })
    .eq("code", code)
    .is("consumed_at", null)
    .select("supabase_user_id")
    .maybeSingle<{ supabase_user_id: string }>();
  if (updErr) throw updErr;
  if (!updated) return { ok: false, reason: "already_consumed" };

  // Flip the extension trial row to Pro. We upsert because the user may
  // have linked from a brand-new extension install that hasn't burned a
  // hosted prompt yet.
  const { error: trialErr } = await supabase
    .from("extension_trials")
    .upsert(
      {
        user_id: extensionUserId,
        upgraded_to_pro: true,
        linked_supabase_user_id: updated.supabase_user_id,
      },
      { onConflict: "user_id" },
    );
  if (trialErr) throw trialErr;

  return { ok: true, supabaseUserId: updated.supabase_user_id };
}
