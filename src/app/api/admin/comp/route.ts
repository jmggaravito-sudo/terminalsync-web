import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { authenticate, isAdmin } from "@/lib/marketplace/auth";
import {
  grantIncludedAi,
  revokeIncludedAiForUser,
} from "@/lib/subscriptionState";

/**
 * Admin-only "comp account" grants — give an influencer (or anyone) a free
 * Pro/Max plan without going through Stripe. Team is an additive membership
 * and never changes the base subscription.
 *
 * How it works: the `me` view derives `plan` from the `subscriptions` table
 * (LEFT JOIN … WHERE status IN ('active','trialing')). So granting a plan is
 * just an upsert of a `subscriptions` row with status='active' and a future
 * `current_period_end`. The app reads `me` and unlocks the tier immediately —
 * no card, no checkout, no Stripe record. `price_cents=0` keeps comps out of
 * MRR. Reversible via DELETE (flips the user back to free).
 *
 * Auth: Bearer access_token + email in ADMIN_EMAILS allowlist (same gate as
 * the rest of /api/admin/*). The service-role client bypasses RLS to write
 * the row.
 *
 * Endpoints:
 *   POST   { email, plan: "pro"|"max"|"team", months? }
 *          → grant / extend a Pro/Max comp, or pre-grant Team before signup
 *   GET                                            → list active comps
 *   DELETE { email }                               → revoke (back to free)
 */

export const dynamic = "force-dynamic";

// Sentinel written into the Stripe id columns so comps are distinguishable
// from real paid subscriptions (and so the GET filter can find them). Real
// subs carry `cus_…` / `sub_…`; comps carry these.
const COMP_CUSTOMER = "comp";
const COMP_SUB_PREFIX = "comp_";

type Plan = "pro" | "max" | "team";

type ProfileLookup =
  | { kind: "found"; target: { id: string; email: string } }
  | { kind: "not_found" }
  | { kind: "error" };

type SubscriptionIdentity = {
  stripe_customer_id?: string | null;
  provider_customer_id?: string | null;
  provider_subscription_id?: string | null;
};

function isPlan(v: unknown): v is Plan {
  return v === "pro" || v === "max" || v === "team";
}

/** A comp has the legacy shared sentinel. Any other provider identifier is a
 * real paid subscription (including Mercado Pago) and must never be replaced
 * or revoked by this admin utility. */
function hasRealPaidSubscription(
  subscription: SubscriptionIdentity | null | undefined,
): boolean {
  if (!subscription || subscription.stripe_customer_id === COMP_CUSTOMER) {
    return false;
  }
  return Boolean(
    subscription.stripe_customer_id ||
      subscription.provider_customer_id ||
      subscription.provider_subscription_id,
  );
}

/** Resolve a user's UUID from their email via the `profiles` table.
 *
 * `profiles.email` is CITEXT in the app schema, so `eq` remains
 * case-insensitive without the wildcard semantics of `ilike`. Crucially, a
 * query failure is not equivalent to an account that does not exist: callers
 * must fail closed rather than accidentally queue a comp during an outage.
 */
async function userIdForEmail(
  sb: ReturnType<typeof getSupabaseAdmin>,
  email: string,
): Promise<ProfileLookup> {
  if (!sb) return { kind: "error" };
  const { data, error } = await sb
    .from("profiles")
    .select("id,email")
    .eq("email", email)
    .limit(1)
    .maybeSingle();
  if (error) return { kind: "error" };
  if (!data) return { kind: "not_found" };
  return {
    kind: "found",
    target: { id: data.id as string, email: (data.email as string) ?? email },
  };
}

export async function POST(req: Request) {
  const user = await authenticate(req);
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const sb = getSupabaseAdmin();
  if (!sb) {
    return NextResponse.json(
      { error: "supabase admin not configured" },
      { status: 503 },
    );
  }

  let body: { email?: string; plan?: string; months?: number };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }
  const plan = body.plan;
  if (!isPlan(plan)) {
    return NextResponse.json(
      { error: 'plan must be "pro", "max", or "team"' },
      { status: 400 },
    );
  }
  // Clamp the grant window to something sane: 1–36 months, default 12.
  const months = Math.min(36, Math.max(1, Math.round(body.months ?? 12)));

  const lookup = await userIdForEmail(sb, email);
  if (lookup.kind === "error") {
    return NextResponse.json({ error: "profile lookup failed" }, { status: 503 });
  }
  if (lookup.kind === "not_found") {
    if (plan === "team") {
      const { error } = await sb.from("team_comp_grants").upsert({ email, months, granted_by: user.email, claimed_at: null, claimed_user_id: null, updated_at: new Date().toISOString() }, { onConflict: "email" });
      if (error) return NextResponse.json({ error: "Team pre-grant failed" }, { status: 500 });
      return NextResponse.json({ ok: true, pending: true, email, plan, months });
    }
    // No account yet → PRE-GRANT. Store the intent keyed by email; the
    // `handle_new_user` DB trigger consumes it automatically when this
    // person signs up (migration 0016). Zero manual work after this.
    const { error: pgErr } = await sb.from("comp_grants").upsert(
      {
        email,
        plan,
        months,
        granted_by: user.email,
        claimed_at: null,
        claimed_user_id: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" },
    );
    if (pgErr) {
      return NextResponse.json(
        { error: `pre-grant failed: ${pgErr.message}` },
        { status: 500 },
      );
    }
    return NextResponse.json({
      ok: true,
      pending: true,
      email,
      plan,
      months,
    });
  }

  const target = lookup.target;

  if (plan === "team") {
    const { data: existingMembership, error: membershipLookupError } = await sb
      .from("team_memberships")
      .select("source")
      .eq("user_id", target.id)
      .maybeSingle();
    if (membershipLookupError) return NextResponse.json({ error: "Team membership lookup failed" }, { status: 503 });
    if (existingMembership?.source === "paid") return NextResponse.json({ error: "that account already has a paid Team membership" }, { status: 409 });
    const { error } = await sb.from("team_memberships").upsert({ user_id: target.id, status: "active", source: "admin_comp", starts_at: new Date().toISOString(), expires_at: new Date(Date.now() + months * 30 * 86400_000).toISOString(), granted_by: user.email, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    if (error) return NextResponse.json({ error: "Team membership grant failed" }, { status: 500 });
    return NextResponse.json({ ok: true, email: target.email, userId: target.id, plan, months });
  }

  // Mirror DELETE's paid-account protection before mutating an existing
  // profile. The admin comp endpoint must never replace a real Stripe row
  // with the shared comp sentinel.
  const { data: existingSubscription, error: existingSubscriptionError } = await sb
    .from("subscriptions")
    .select("stripe_customer_id,provider_customer_id,provider_subscription_id")
    .eq("user_id", target.id)
    .maybeSingle();
  if (existingSubscriptionError) {
    return NextResponse.json(
      { error: "subscription lookup failed" },
      { status: 503 },
    );
  }
  if (hasRealPaidSubscription(existingSubscription)) {
    return NextResponse.json(
      { error: "that account has a real Stripe subscription — refusing to replace it here" },
      { status: 409 },
    );
  }

  const periodEnd = new Date(Date.now() + months * 30 * 86400_000).toISOString();
  // A short, unique-ish sentinel so a UNIQUE constraint on
  // stripe_subscription_id (if any) never collides across comps.
  const sentinelSub = `${COMP_SUB_PREFIX}${target.id.slice(0, 8)}`;

  const row = {
    user_id: target.id,
    stripe_customer_id: COMP_CUSTOMER,
    stripe_subscription_id: sentinelSub,
    plan,
    status: "active" as const,
    ai_included: true,
    current_period_start: new Date().toISOString(),
    current_period_end: periodEnd,
    cancel_at_period_end: false,
    updated_at: new Date().toISOString(),
  };

  const { error } = await sb
    .from("subscriptions")
    .upsert(row, { onConflict: "user_id" });
  if (error) {
    return NextResponse.json(
      { error: `grant failed: ${error.message}` },
      { status: 500 },
    );
  }

  // A comp is a paid-tier entitlement for the account, so it must use the
  // same included-AI gate as a normal Pro/Max subscription. Without this,
  // comped users fall back to the courtesy pool even though their plan is
  // active.
  const includedAiGranted = await grantIncludedAi({ userId: target.id });
  if (!includedAiGranted) {
    return NextResponse.json(
      { error: "included AI entitlement grant failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    email: target.email,
    userId: target.id,
    plan,
    months,
    currentPeriodEnd: periodEnd,
  });
}

export async function GET(req: Request) {
  const user = await authenticate(req);
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const sb = getSupabaseAdmin();
  if (!sb) {
    return NextResponse.json(
      { error: "supabase admin not configured" },
      { status: 503 },
    );
  }

  const { data: subs, error } = await sb
    .from("subscriptions")
    .select("user_id,plan,status,current_period_end,updated_at")
    .eq("stripe_customer_id", COMP_CUSTOMER)
    .order("updated_at", { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Attach emails in a second query (avoids relying on an FK embed being
  // configured between subscriptions and profiles).
  const ids = (subs ?? []).map((s) => s.user_id as string);
  const emailById = new Map<string, string>();
  if (ids.length > 0) {
    const { data: profs } = await sb
      .from("profiles")
      .select("id,email")
      .in("id", ids);
    for (const p of profs ?? []) {
      emailById.set(p.id as string, (p.email as string) ?? "");
    }
  }

  const comps = (subs ?? []).map((s) => ({
    email: emailById.get(s.user_id as string) ?? "(unknown)",
    plan: s.plan,
    status: s.status,
    currentPeriodEnd: s.current_period_end,
    updatedAt: s.updated_at,
  }));

  // Pending pre-grants: emails queued before the person signed up. The
  // trigger clears `claimed_at` when consumed, so unclaimed = still waiting.
  let pending: Array<{ email: string; plan: string; months: number }> = [];
  const { data: pg } = await sb
    .from("comp_grants")
    .select("email,plan,months,claimed_at")
    .is("claimed_at", null)
    .order("updated_at", { ascending: false });
  if (pg) {
    pending = pg.map((g) => ({
      email: g.email as string,
      plan: g.plan as string,
      months: (g.months as number) ?? 12,
    }));
  }

  const { data: memberships, error: membershipsError } = await sb.from("team_memberships").select("user_id,status,expires_at,updated_at").eq("source", "admin_comp").eq("status", "active");
  if (membershipsError) return NextResponse.json({ error: "Team membership lookup failed" }, { status: 500 });
  const teamIds = (memberships ?? []).map((m) => m.user_id as string);
  if (teamIds.length) {
    const { data: teamProfiles, error: teamProfilesError } = await sb.from("profiles").select("id,email").in("id", teamIds);
    if (teamProfilesError) return NextResponse.json({ error: "Team profile lookup failed" }, { status: 500 });
    for (const m of memberships ?? []) comps.push({ email: teamProfiles?.find((p) => p.id === m.user_id)?.email ?? "(unknown)", plan: "team", status: m.status, currentPeriodEnd: m.expires_at, updatedAt: m.updated_at });
  }
  const { data: pendingTeam, error: pendingTeamError } = await sb.from("team_comp_grants").select("email,months").is("claimed_at", null).order("updated_at", { ascending: false });
  if (pendingTeamError) return NextResponse.json({ error: "Team pre-grant lookup failed" }, { status: 500 });
  pending.push(...(pendingTeam ?? []).map((g) => ({ email: g.email as string, plan: "team", months: g.months as number })));

  return NextResponse.json({ comps, pending });
}

export async function DELETE(req: Request) {
  const user = await authenticate(req);
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const sb = getSupabaseAdmin();
  if (!sb) {
    return NextResponse.json(
      { error: "supabase admin not configured" },
      { status: 503 },
    );
  }

  let body: { email?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  const email = (body.email ?? "").trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  const lookup = await userIdForEmail(sb, email);
  if (lookup.kind === "error") {
    return NextResponse.json({ error: "profile lookup failed" }, { status: 503 });
  }

  if (lookup.kind === "found") {
    // Check before deleting a queued grant or modifying any subscription, so a
    // profile lookup cannot turn a failed revoke into a partial revoke.
    const { data: existing, error: existingError } = await sb
      .from("subscriptions")
      .select("stripe_customer_id,provider_customer_id,provider_subscription_id")
      .eq("user_id", lookup.target.id)
      .maybeSingle();
    if (existingError) {
      return NextResponse.json({ error: "subscription lookup failed" }, { status: 503 });
    }
    if (hasRealPaidSubscription(existing)) {
      return NextResponse.json(
        { error: "that account has a real Stripe subscription — refusing to revoke it here" },
        { status: 409 },
      );
    }
  }

  // Validate the base subscription before mutating any entitlement, so a
  // failed lookup or paid-account guard cannot leave a partial Team revoke.
  const { error: teamPendingError } = await sb.from("team_comp_grants").delete().eq("email", email);
  if (teamPendingError) return NextResponse.json({ error: "Team pre-grant removal failed" }, { status: 500 });
  if (lookup.kind === "found") {
    const { error } = await sb.from("team_memberships").update({ status: "revoked", updated_at: new Date().toISOString() }).eq("user_id", lookup.target.id).eq("source", "admin_comp").eq("status", "active");
    if (error) return NextResponse.json({ error: "Team membership revoke failed" }, { status: 500 });
  }

  // Clear a pending pre-grant only after the account/subscription checks have
  // succeeded, so the operation fails closed on an unavailable lookup.
  const { error: pendingDeleteError } = await sb
    .from("comp_grants")
    .delete()
    .eq("email", email);
  if (pendingDeleteError) {
    return NextResponse.json({ error: "pending pre-grant removal failed" }, { status: 500 });
  }

  if (lookup.kind === "not_found") {
    // No account — the only thing to remove was the pending pre-grant, done.
    return NextResponse.json({ ok: true, email, pendingRemoved: true });
  }

  const target = lookup.target;
  // Only revoke if this is actually a comp — never touch a real paid sub.
  const { error } = await sb
    .from("subscriptions")
    .upsert(
      {
        user_id: target.id,
        stripe_customer_id: COMP_CUSTOMER,
        plan: "free",
        status: "canceled",
        ai_included: false,
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const includedAiRevoked = await revokeIncludedAiForUser(target.id);
  if (!includedAiRevoked) {
    return NextResponse.json(
      { error: "included AI entitlement revoke failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, email: target.email, plan: "free" });
}
