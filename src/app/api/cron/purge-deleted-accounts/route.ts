/**
 * Daily cron: hard-delete accounts that were soft-deleted >30 days ago.
 *
 * Pairs with `DELETE /api/account` which sets `profiles.deleted_at`. We
 * wait the grace period so the user can sign back in to undo (a separate
 * flow clears `deleted_at` on next login if the column is set).
 *
 * What this purges per row:
 *   - `auth.admin.deleteUser(id)` — cascades to `profiles` and
 *     `subscriptions` via FK `on delete cascade`. `audit_log.user_id`
 *     becomes NULL via `on delete set null` so the audit row survives.
 *
 * Stripe is intentionally NOT touched here. The original DELETE call
 * already set `cancel_at_period_end=true`, and Stripe will fire
 * `customer.subscription.deleted` whenever the period ends. The webhook
 * handles the cleanup of `subscriptions` (which by then is gone anyway
 * via the cascade above).
 *
 * Schedule: daily at 04:00 UTC (defined in vercel.json -> crons).
 */
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GRACE_PERIOD_DAYS = 30;
/** Hard cap per run so a backlog doesn't blow past serverless time limits. */
const MAX_PURGES_PER_RUN = 200;

export async function GET(req: Request) {
  const provided = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabaseAdmin();
  if (!sb) {
    return NextResponse.json(
      { error: "Supabase admin not configured" },
      { status: 503 },
    );
  }

  const cutoff = new Date(
    Date.now() - GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data: rows, error: selErr } = await sb
    .from("profiles")
    .select("id, email, deleted_at")
    .not("deleted_at", "is", null)
    .lt("deleted_at", cutoff)
    .limit(MAX_PURGES_PER_RUN);
  if (selErr) {
    console.error("[purge-cron] select failed", selErr);
    return NextResponse.json({ error: selErr.message }, { status: 500 });
  }
  if (!rows || rows.length === 0) {
    return NextResponse.json({ purged: 0, candidates: 0 });
  }

  let purged = 0;
  const failures: Array<{ id: string; reason: string }> = [];
  for (const row of rows) {
    try {
      const { error: delErr } = await sb.auth.admin.deleteUser(row.id);
      if (delErr) {
        failures.push({ id: row.id, reason: delErr.message });
        continue;
      }
      purged++;
      // Audit (best-effort — user_id will set-null since the user is gone,
      // but the event row stays for compliance investigations).
      await sb.from("audit_log").insert({
        user_id: row.id,
        event: "account_purged",
        metadata: {
          email: row.email,
          deleted_at: row.deleted_at,
        },
      });
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      failures.push({ id: row.id, reason });
    }
  }

  if (failures.length > 0) {
    console.error("[purge-cron] some purges failed", failures);
  }
  return NextResponse.json({
    candidates: rows.length,
    purged,
    failed: failures.length,
  });
}
