import { NextResponse } from "next/server";
import { authenticate, isAdmin } from "@/lib/marketplace/auth";
import { siteUrl } from "@/lib/stripe";
import {
  createPreapprovalPlan,
  listPreapprovalPlans,
  mercadoPagoConfigured,
} from "@/lib/mercadopago";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin-only bootstrap: create the two Mercado Pago subscription plans (Pro +
 * Max) in COP using the MERCADOPAGO_ACCESS_TOKEN that lives server-side on
 * Vercel. Runs on the server so the token never leaves Vercel and never
 * reaches the operator's browser or a chat transcript.
 *
 * GET  → lists existing plans (so you can grab already-created ids).
 * POST → creates Pro + Max (amounts default to the agreed COP prices) and
 *        returns their ids, which you then set as MERCADOPAGO_PLAN_PRO / _MAX.
 *
 * Gate: same Bearer access_token + ADMIN_EMAILS allowlist as every other
 * /api/admin route.
 */

const DEFAULT_PRO_COP = 79000;
const DEFAULT_MAX_COP = 159000;

async function requireAdmin(req: Request) {
  const user = await authenticate(req);
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function GET(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  // Optional ?token=TEST-... override (admin-only) to list a test account's
  // plans without swapping the production env var.
  const tokenOverride = new URL(req.url).searchParams.get("token") ?? undefined;
  if (!mercadoPagoConfigured && !tokenOverride) {
    return NextResponse.json(
      { error: "MERCADOPAGO_ACCESS_TOKEN not set on the server." },
      { status: 503 },
    );
  }
  const plans = await listPreapprovalPlans(tokenOverride);
  return NextResponse.json({
    plans: plans.map((p) => ({
      id: p.id,
      reason: p.reason,
      status: p.status,
      amount: p.auto_recurring?.transaction_amount,
      currency: p.auto_recurring?.currency_id,
    })),
  });
}

interface Body {
  proAmount?: number;
  maxAmount?: number;
  currency?: string;
  /** Optional TEST-... token to create plans on a test account without
   *  swapping the production env var. Admin-only. Never logged. */
  token?: string;
}

export async function POST(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    // Empty body is fine — fall back to the agreed defaults.
  }

  const tokenOverride =
    typeof body.token === "string" && body.token.trim() ? body.token.trim() : undefined;

  if (!mercadoPagoConfigured && !tokenOverride) {
    return NextResponse.json(
      { error: "MERCADOPAGO_ACCESS_TOKEN not set on the server." },
      { status: 503 },
    );
  }

  const proAmount = Number.isFinite(body.proAmount) ? Number(body.proAmount) : DEFAULT_PRO_COP;
  const maxAmount = Number.isFinite(body.maxAmount) ? Number(body.maxAmount) : DEFAULT_MAX_COP;
  const currency = body.currency ?? "COP";
  if (proAmount <= 0 || maxAmount <= 0) {
    return NextResponse.json(
      { error: "proAmount and maxAmount must be positive." },
      { status: 400 },
    );
  }

  const backUrl = `${siteUrl()}/es/checkout/success`;

  try {
    const pro = await createPreapprovalPlan(
      { reason: "Terminal Sync Pro", amount: proAmount, currency, backUrl },
      tokenOverride,
    );
    const max = await createPreapprovalPlan(
      { reason: "Terminal Sync Max", amount: maxAmount, currency, backUrl },
      tokenOverride,
    );
    return NextResponse.json({
      created: true,
      test: Boolean(tokenOverride),
      pro: { id: pro.id, amount: proAmount, currency },
      max: { id: max.id, amount: maxAmount, currency },
      envVars: {
        MERCADOPAGO_PLAN_PRO: pro.id,
        MERCADOPAGO_PLAN_MAX: max.id,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
