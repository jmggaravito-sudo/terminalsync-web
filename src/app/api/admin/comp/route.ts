import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { authenticate, isAdmin } from "@/lib/marketplace/auth";

/**
 * Admin-only "comp account" grants — give an influencer (or anyone) a free
 * Pro/Max plan without going through Stripe.
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
 *   POST   { email, plan: "pro"|"max", months? }  → grant / extend a comp
 *   GET                                            → list active comps
 *   DELETE { email }                               → revoke (back to free)
 */

export const dynamic = "force-dynamic";

// Sentinel written into the Stripe id columns so comps are distinguishable
// from real paid subscriptions (and so the GET filter can find them). Real
// subs carry `cus_…` / `sub_…`; comps carry these.
const COMP_CUSTOMER = "comp";
const COMP_SUB_PREFIX = "comp_";

type Plan = "pro" | "max";

function isPlan(v: unknown): v is Plan {
  return v === "pro" || v === "max";
}

/** Resolve a user's UUID from their email via the `profiles` table.
 *  Case-insensitive. Returns null when no account exists yet. */
async function userIdForEmail(
  sb: ReturnType<typeof getSupabaseAdmin>,
  email: string,
): Promise<{ id: string; email: string } | null> {
  if (!sb) return null;
  const { data, error } = await sb
    .from("profiles")
    .select("id,email")
    .ilike("email", email)
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return { id: data.id as string, email: (data.email as string) ?? email };
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

  const email = (body.email ?? "").trim();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }
  if (!isPlan(body.plan)) {
    return NextResponse.json(
      { error: 'plan must be "pro" or "max"' },
      { status: 400 },
    );
  }
  // Clamp the grant window to something sane: 1–36 months, default 12.
  const months = Math.min(36, Math.max(1, Math.round(body.months ?? 12)));

  const target = await userIdForEmail(sb, email);
  if (!target) {
    return NextResponse.json(
      {
        error:
          "no account found for that email — the person must sign up in the app first, then grant the comp",
      },
      { status: 404 },
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
    plan: body.plan,
    status: "active" as const,
    price_cents: 0, // comps never count toward MRR
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

  return NextResponse.json({
    ok: true,
    email: target.email,
    userId: target.id,
    plan: body.plan,
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

  return NextResponse.json({ comps });
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
  const email = (body.email ?? "").trim();
  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  const target = await userIdForEmail(sb, email);
  if (!target) {
    return NextResponse.json({ error: "no account for that email" }, { status: 404 });
  }

  // Only revoke if this is actually a comp — never touch a real paid sub.
  const { data: existing } = await sb
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", target.id)
    .maybeSingle();
  if (existing && existing.stripe_customer_id !== COMP_CUSTOMER) {
    return NextResponse.json(
      { error: "that account has a real Stripe subscription — refusing to revoke it here" },
      { status: 409 },
    );
  }

  const { error } = await sb
    .from("subscriptions")
    .upsert(
      {
        user_id: target.id,
        stripe_customer_id: COMP_CUSTOMER,
        plan: "free",
        status: "canceled",
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, email: target.email, plan: "free" });
}
