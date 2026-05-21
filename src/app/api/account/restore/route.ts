import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { stripe } from "@/lib/stripe";
import { corsHeaders, preflight } from "@/lib/cors";

export const runtime = "nodejs";

export async function OPTIONS(req: Request) {
  return preflight(req);
}

/** Must match GRACE_PERIOD_MS in /api/account/route.ts. Kept in lockstep
 *  so a user who is right at the boundary gets a consistent answer. */
const GRACE_PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * POST /api/account/restore — undo a soft-deletion within the 30-day grace
 * window. Called by the Tauri "Recuperar cuenta" banner that appears when
 * the user signs in and `me.deleted_at` is non-null.
 *
 * Flow:
 *   1. Verify Supabase JWT → user_id
 *   2. Read profiles.deleted_at. If null → 400 "Not marked for deletion".
 *      If older than 30 days → 410 "Grace period expired" (the purge cron
 *      should already have wiped this user, but defensively handle it).
 *   3. Clear deleted_at + deletion_reason
 *   4. If a Stripe subscription has cancel_at_period_end=true, flip it off
 *      so the user keeps their plan past the period end.
 *   5. Audit log "account_deletion_restored"
 *
 * Idempotent: calling on an account with no deleted_at returns 400 (same
 * as if no deletion was ever requested) — caller can ignore the error.
 */
export async function POST(req: Request) {
  const cors = corsHeaders(req.headers.get("origin"));
  const json = (data: unknown, status: number) =>
    NextResponse.json(data, { status, headers: cors });

  const sb = getSupabaseAdmin();
  if (!sb) {
    return json({ error: "Supabase admin not configured" }, 503);
  }

  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token) {
    return json({ error: "Missing Bearer token" }, 401);
  }
  const { data: userRes, error: userErr } = await sb.auth.getUser(token);
  if (userErr || !userRes?.user) {
    return json({ error: "Invalid token" }, 401);
  }
  const userId = userRes.user.id;

  const { data: profile, error: profErr } = await sb
    .from("profiles")
    .select("deleted_at")
    .eq("id", userId)
    .maybeSingle();
  if (profErr || !profile) {
    return json({ error: "Profile not found" }, 404);
  }
  if (!profile.deleted_at) {
    return json({ error: "Account is not marked for deletion" }, 400);
  }

  const deletedAtMs = new Date(profile.deleted_at).getTime();
  if (Date.now() - deletedAtMs > GRACE_PERIOD_MS) {
    // The purge cron should have run by now. Defensive: refuse the
    // restore so we don't end up with a half-purged account.
    return json({ error: "Grace period expired — account is being purged" }, 410);
  }

  // Clear soft-delete state.
  const nowIso = new Date().toISOString();
  const { error: updErr } = await sb
    .from("profiles")
    .update({
      deleted_at: null,
      deletion_reason: null,
      updated_at: nowIso,
    })
    .eq("id", userId);
  if (updErr) {
    console.error("[account-restore] profile update failed", { userId, updErr });
    return json({ error: "Could not clear deletion state" }, 500);
  }

  // Best-effort un-cancel of the Stripe subscription. If the period has
  // already ended by the time the restore happens, this is a no-op — the
  // subscription is already gone. The user can re-subscribe from the
  // pricing page.
  let stripeRestored = false;
  if (stripe) {
    const { data: sub } = await sb
      .from("subscriptions")
      .select("stripe_subscription_id, cancel_at_period_end, status")
      .eq("user_id", userId)
      .maybeSingle();
    const subId = sub?.stripe_subscription_id;
    if (subId && sub?.cancel_at_period_end && sub.status !== "canceled") {
      try {
        await stripe.subscriptions.update(subId, {
          cancel_at_period_end: false,
          metadata: { restored_via: "account_restore_endpoint" },
        });
        stripeRestored = true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        console.error("[account-restore] stripe restore failed", {
          userId,
          subId,
          msg,
        });
      }
    }
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    null;
  const ua = req.headers.get("user-agent") ?? null;
  await sb.from("audit_log").insert({
    user_id: userId,
    event: "account_deletion_restored",
    metadata: {
      restored_at: nowIso,
      stripe_restored: stripeRestored,
      original_deleted_at: profile.deleted_at,
    },
    ip_address: ip,
    user_agent: ua,
  });

  return json({ restored: true, stripeRestored }, 200);
}
