import { NextResponse } from "next/server";
import { normalizePlanId, siteUrl } from "@/lib/stripe";
import {
  createPreapproval,
  mercadoPagoConfigured,
  mpPreapprovalPlanFor,
} from "@/lib/mercadopago";

export const runtime = "nodejs";

interface Body {
  plan: string;
  lang?: "es" | "en";
  email?: string;
  /** Supabase auth user id — forwarded as MP external_reference. */
  supabaseUserId?: string;
  /** Deep-link the desktop app passes; defaults to the marketing routes. */
  successUrl?: string;
}

// Same CORS posture as the Stripe checkout route: allow the Tauri desktop app
// and the marketing site.
function corsHeaders(origin: string | null): Record<string, string> {
  const allowed =
    origin &&
    (origin.startsWith("tauri://") ||
      origin === "https://terminalsync.ai" ||
      origin === "https://www.terminalsync.ai" ||
      origin.startsWith("http://localhost") ||
      origin.startsWith("http://127.0.0.1"));
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "https://terminalsync.ai",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  });
}

export async function POST(req: Request) {
  const cors = corsHeaders(req.headers.get("origin"));

  if (!mercadoPagoConfigured) {
    return NextResponse.json(
      { error: "Mercado Pago not configured. Set MERCADOPAGO_ACCESS_TOKEN." },
      { status: 503, headers: cors },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: cors });
  }

  const plan = normalizePlanId(body.plan);
  if (!plan) {
    return NextResponse.json(
      { error: `Unknown plan "${body.plan}"` },
      { status: 400, headers: cors },
    );
  }

  const preapprovalPlanId = mpPreapprovalPlanFor(plan);
  if (!preapprovalPlanId) {
    const envVar = plan === "pro" ? "MERCADOPAGO_PLAN_PRO" : "MERCADOPAGO_PLAN_MAX";
    return NextResponse.json(
      {
        error:
          plan === "agency"
            ? "Agency is lead-gen — no self-serve Mercado Pago subscription."
            : `Missing Mercado Pago plan for "${plan}". Set ${envVar}.`,
      },
      { status: 503, headers: cors },
    );
  }

  const lang: "es" | "en" = body.lang === "en" ? "en" : "es";
  const base = siteUrl();
  const backUrl = body.successUrl ?? `${base}/${lang}/checkout/success`;

  try {
    // Stamp the account key into external_reference (MP echoes it back verbatim,
    // so linking is immune to whatever email MP attaches from the payer's own
    // account). Prefer the Supabase user id when we have it (app / logged-in web);
    // fall back to the email the buyer typed so the webhook can resolve it.
    const externalReference = body.supabaseUserId ?? body.email;
    const { initPoint } = await createPreapproval({
      preapprovalPlanId,
      payerEmail: body.email,
      externalReference,
      reason: `Terminal Sync ${plan === "max" ? "Max" : "Pro"}`,
      backUrl,
    });
    // Same response shape as the Stripe route: { url } for the client to
    // redirect to.
    return NextResponse.json({ url: initPoint }, { headers: cors });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500, headers: cors });
  }
}
