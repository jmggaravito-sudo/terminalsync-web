import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { stripe } from "@/lib/stripe";
import { sendAccountDeletionRequestedEmail } from "@/lib/email";
import { resolveUserLang } from "@/lib/userLang";
import { corsHeaders, preflight } from "@/lib/cors";

export const runtime = "nodejs";

export async function OPTIONS(req: Request) {
  return preflight(req, "DELETE, OPTIONS");
}

/**
 * Grace window before a soft-deleted account is purged permanently.
 * The user can sign back in inside this window and clear `deleted_at`
 * to undo the deletion. 30 days matches what most SaaS products do
 * (Stripe, GitHub, Google) and gives time for "I changed my mind"
 * emails after the confirmation goes out.
 */
const GRACE_PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

interface DeleteBody {
  /** Free-form reason text. Captured for product feedback — never blocks
   *  the deletion if missing. Max 500 chars to keep audit_log rows small. */
  reason?: string;
}

/**
 * DELETE /api/account — self-service account deletion (soft-delete).
 *
 * Auth: `Authorization: Bearer <supabase_access_token>`. Same pattern as
 * /api/audit. The verified user id from the token is the only id we
 * trust — request body cannot specify a target user.
 *
 * Flow:
 *   1. Verify Supabase JWT → user_id, email
 *   2. Mark `profiles.deleted_at = now()` (+ optional reason)
 *   3. If user has a Stripe subscription, set `cancel_at_period_end=true`
 *      so they keep access until the current period ends. Webhook will
 *      mirror the change into `subscriptions` on the next event.
 *   4. Write audit_log row `account_deletion_requested`
 *   5. Return purge date (now + 30d) so the UI can show "purges on X"
 *
 * What is NOT done here:
 *   - Hard-delete of auth row → handled by a cron job that scans for
 *     `deleted_at < now() - 30d` and calls `auth.admin.deleteUser`.
 *     Subscriptions + audit_log cascade or set-null as appropriate.
 *   - Files in the user's Google Drive (`TerminalSync_Data/`) → those
 *     are inside the user's own Drive; not ours to delete. The UI tells
 *     the user this explicitly.
 *
 * Idempotent: calling twice while already soft-deleted just returns the
 * existing `purgeAt` without re-canceling Stripe.
 */
export async function DELETE(req: Request) {
  const cors = corsHeaders(req.headers.get("origin"), "DELETE, OPTIONS");
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
  const email = userRes.user.email ?? null;

  // Body is optional — DELETE with no body is valid. Empty bodies are
  // common from curl and some Fetch implementations; treat them as {}.
  let body: DeleteBody = {};
  try {
    const text = await req.text();
    if (text.trim()) body = JSON.parse(text) as DeleteBody;
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  const reason = body.reason?.slice(0, 500).trim() || null;

  // Idempotency: if already marked deleted, return the existing purge date.
  const { data: existing, error: existingErr } = await sb
    .from("profiles")
    .select("deleted_at")
    .eq("id", userId)
    .maybeSingle();
  if (existingErr) {
    console.error("[account-delete] profile lookup failed", { userId, existingErr });
    return json({ error: "Profile lookup failed" }, 500);
  }
  if (existing?.deleted_at) {
    const purgeAt = new Date(
      new Date(existing.deleted_at).getTime() + GRACE_PERIOD_MS,
    ).toISOString();
    return json({ purgeAt, alreadyDeleted: true }, 200);
  }

  // Mark profile deleted. We do this first — if Stripe call fails after,
  // the user is still marked-for-deletion (correct) and the next cron
  // tick or manual retry can finish the Stripe cleanup.
  const deletedAtIso = new Date().toISOString();
  const { error: updErr } = await sb
    .from("profiles")
    .update({
      deleted_at: deletedAtIso,
      deletion_reason: reason,
      updated_at: deletedAtIso,
    })
    .eq("id", userId);
  if (updErr) {
    console.error("[account-delete] profile update failed", { userId, updErr });
    return json({ error: "Could not mark account for deletion" }, 500);
  }

  // Best-effort Stripe cancel-at-period-end. We don't fail the request if
  // Stripe is unreachable — the user is still soft-deleted and the cron
  // job that hard-deletes will retry. The webhook also re-syncs the row
  // if anything else changes the subscription.
  let stripeCanceled = false;
  if (stripe) {
    const { data: sub } = await sb
      .from("subscriptions")
      .select("stripe_subscription_id, status")
      .eq("user_id", userId)
      .maybeSingle();
    const subId = sub?.stripe_subscription_id;
    const cancelable =
      subId && sub?.status !== "canceled" && sub?.status !== "incomplete";
    if (cancelable) {
      try {
        await stripe.subscriptions.update(subId, {
          cancel_at_period_end: true,
          cancellation_details: {
            comment: reason ?? "User requested account deletion",
          },
          metadata: { canceled_via: "account_deletion_endpoint" },
        });
        stripeCanceled = true;
      } catch (err) {
        // Log but don't fail — the deletion request itself succeeded.
        const msg = err instanceof Error ? err.message : "Unknown error";
        console.error("[account-delete] stripe cancel failed", {
          userId,
          subId,
          msg,
        });
      }
    }
  }

  // Audit trail — event name must match the regex enforced by /api/audit
  // (`^[a-z][a-z0-9_]*$`) for consistency.
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    null;
  const ua = req.headers.get("user-agent") ?? null;
  await sb.from("audit_log").insert({
    user_id: userId,
    event: "account_deletion_requested",
    metadata: {
      email,
      reason,
      stripe_canceled: stripeCanceled,
      grace_period_days: 30,
    },
    ip_address: ip,
    user_agent: ua,
  });

  const purgeAtDate = new Date(Date.now() + GRACE_PERIOD_MS);
  const purgeAt = purgeAtDate.toISOString();

  // Best-effort confirmation email with restore instructions. Never fails
  // the request — the deletion already succeeded server-side; an email
  // hiccup shouldn't surface to the user as "deletion failed".
  if (email) {
    try {
      const firstName =
        (userRes.user.user_metadata?.first_name as string | undefined) ??
        (userRes.user.user_metadata?.full_name as string | undefined)?.split(" ")[0] ??
        "hola";
      const lang = await resolveUserLang({ userId, email });
      const purgeAtHuman = purgeAtDate.toLocaleDateString(
        lang === "en" ? "en-US" : "es",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        },
      );
      await sendAccountDeletionRequestedEmail({
        to: email,
        firstName,
        purgeAtIso: purgeAt,
        purgeAtHuman,
        reason: reason ?? undefined,
        userId,
        lang,
      });
    } catch (err) {
      console.error("[account-delete] email send failed", {
        userId,
        err: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return json({ purgeAt, alreadyDeleted: false }, 200);
}
