/**
 * Mercado Pago — parallel payment rail to Stripe for the Terminal Sync
 * subscription. Mirrors `src/lib/stripe.ts`: a null-guard when unconfigured,
 * a plan → recurring-plan mapping, and a helper to open a checkout.
 *
 * We talk to the Mercado Pago REST API directly (no SDK dependency) — a single
 * POST to /preapproval creates a subscription and returns an `init_point`
 * checkout URL, the MP analogue of a Stripe Checkout Session URL.
 *
 * Why MP alongside Stripe: Stripe charges in USD with cards; a big slice of the
 * target (LatAm business owners) pays with Mercado Pago (local cards, account
 * balance, Rapipago/Pago Fácil, etc.). Offering both widens who can subscribe.
 *
 * STATUS: prototype. Needs a live `MERCADOPAGO_ACCESS_TOKEN` + preapproval
 * plans created in the MP dashboard to run end-to-end. Field names follow MP's
 * documented /preapproval shape but should be verified against the live API.
 */

import { type PlanId, siteUrl } from "./stripe";

const MP_API = "https://api.mercadopago.com";
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

/** True when Mercado Pago is configured. Mirrors the `stripe` null-guard so a
 *  route can 503 cleanly instead of throwing when MP isn't set up. */
export const mercadoPagoConfigured = Boolean(accessToken);

/** Maps a plan to its Mercado Pago `preapproval_plan_id` — a recurring plan
 *  created in the MP dashboard, the MP analogue of a Stripe price id. The
 *  amount + currency live ON the MP plan, so the currency-per-country decision
 *  stays in MP config, not in code (ARS, BRL, MXN, …). Agency stays lead-gen
 *  (no self-serve subscription), same as Stripe. */
export function mpPreapprovalPlanFor(plan: PlanId): string | null {
  if (plan === "pro") return process.env.MERCADOPAGO_PLAN_PRO ?? null;
  if (plan === "max") return process.env.MERCADOPAGO_PLAN_MAX ?? null;
  return null;
}

export interface CreatePreapprovalInput {
  preapprovalPlanId: string;
  payerEmail?: string;
  /** Supabase auth user id — the MP `external_reference`, mirrors the
   *  `supabase_user_id` we put in Stripe metadata so the webhook can link an
   *  MP subscription to a Terminal Sync account. */
  externalReference?: string;
  reason: string;
  backUrl: string;
}

export interface PreapprovalResult {
  id: string;
  /** The MP checkout URL to redirect the buyer to. */
  initPoint: string;
}

/** Creates a Mercado Pago subscription (preapproval) and returns its
 *  init_point checkout URL. Throws on a non-2xx so the route surfaces MP's
 *  error message. */
export async function createPreapproval(
  input: CreatePreapprovalInput,
): Promise<PreapprovalResult> {
  if (!accessToken) throw new Error("Mercado Pago not configured");

  const res = await fetch(`${MP_API}/preapproval`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      preapproval_plan_id: input.preapprovalPlanId,
      payer_email: input.payerEmail,
      external_reference: input.externalReference,
      reason: input.reason,
      back_url: input.backUrl,
      status: "pending",
    }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    id?: string;
    init_point?: string;
    message?: string;
  };

  if (!res.ok || !data.init_point || !data.id) {
    throw new Error(
      data.message || `Mercado Pago preapproval failed (HTTP ${res.status})`,
    );
  }
  return { id: data.id, initPoint: data.init_point };
}

/** Reads a preapproval's current state from MP — used by the webhook to
 *  confirm a notification before activating the subscription. */
export async function getPreapproval(
  id: string,
): Promise<{ id: string; status: string; external_reference?: string } | null> {
  if (!accessToken) return null;
  const res = await fetch(`${MP_API}/preapproval/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  return (await res.json().catch(() => null)) as {
    id: string;
    status: string;
    external_reference?: string;
  } | null;
}

export { siteUrl };
