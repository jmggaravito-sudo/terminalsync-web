import { NextResponse } from "next/server";
import { authenticate } from "@/lib/marketplace/auth";
import { validatePublisherOnboard } from "@/lib/marketplace/schema";
import {
  createExpressAccount,
  createOnboardingLink,
  fetchAccountState,
} from "@/lib/marketplace/stripeConnect";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

/** GET /api/marketplace/publishers — read the current user's publisher
 *  profile (or 404 if they haven't onboarded yet). */
export async function GET(req: Request) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const { data, error } = await sb
    .from("publishers")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ publisher: null }, { status: 404 });
  return NextResponse.json({ publisher: data });
}

/** POST /api/marketplace/publishers — onboard a publisher. Creates the
 *  publisher row + a fresh Stripe Express account, returns a one-time
 *  onboarding URL the client redirects to. Idempotent: re-POSTing for an
 *  existing publisher returns a refreshed onboarding link. */
export async function POST(req: Request) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.email) {
    return NextResponse.json({ error: "Account email required for Stripe Connect" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const lang = readLang(req);

  const existing = await sb
    .from("publishers")
    .select("id, stripe_account_id, slug, display_name")
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing.error) return NextResponse.json({ error: existing.error.message }, { status: 500 });

  let stripeAccountId = existing.data?.stripe_account_id ?? null;
  let publisherId = existing.data?.id ?? null;

  if (!existing.data) {
    const v = validatePublisherOnboard(body);
    if (!v.ok) return NextResponse.json({ errors: v.errors }, { status: 400 });

    try {
      stripeAccountId = await createExpressAccount({ email: user.email });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Stripe error" },
        { status: 502 },
      );
    }

    const insert = await sb
      .from("publishers")
      .insert({
        user_id: user.id,
        display_name: v.data.displayName,
        slug: v.data.slug,
        bio: v.data.bio ?? null,
        website: v.data.website ?? null,
        stripe_account_id: stripeAccountId,
        payout_enabled: false,
      })
      .select("id")
      .single();
    if (insert.error) {
      return NextResponse.json({ error: insert.error.message }, { status: 500 });
    }
    publisherId = insert.data.id;
  }

  if (!stripeAccountId) {
    return NextResponse.json({ error: "Stripe account not linked" }, { status: 500 });
  }

  let onboardingUrl: string;
  try {
    onboardingUrl = await createOnboardingLink(stripeAccountId, lang);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Stripe error" },
      { status: 502 },
    );
  }

  return NextResponse.json({ publisherId, onboardingUrl });
}

/** PATCH /api/marketplace/publishers — refresh `payout_enabled` from
 *  Stripe. Called when the publisher returns from the hosted onboarding
 *  flow; the webhook also updates this on `account.updated` events. */
export async function PATCH(req: Request) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const { data: pub, error } = await sb
    .from("publishers")
    .select("id, stripe_account_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!pub?.stripe_account_id) {
    return NextResponse.json({ error: "No Stripe account on file" }, { status: 404 });
  }

  let state: { payoutEnabled: boolean; chargesEnabled: boolean };
  try {
    state = await fetchAccountState(pub.stripe_account_id);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Stripe error" },
      { status: 502 },
    );
  }

  const update = await sb
    .from("publishers")
    .update({ payout_enabled: state.payoutEnabled })
    .eq("id", pub.id);
  if (update.error) return NextResponse.json({ error: update.error.message }, { status: 500 });

  return NextResponse.json({ payoutEnabled: state.payoutEnabled, chargesEnabled: state.chargesEnabled });
}

function readLang(req: Request): "es" | "en" {
  const url = new URL(req.url);
  const q = url.searchParams.get("lang");
  return q === "en" ? "en" : "es";
}
