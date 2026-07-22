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
 * STATUS: code-complete rail. Checkout (this file) + subscription activation
 * (src/app/api/webhooks/mercadopago via the provider-neutral upsert in
 * subscriptionState.ts) are wired end-to-end. To GO LIVE it needs a real
 * `MERCADOPAGO_ACCESS_TOKEN`, the preapproval plans created in the MP
 * dashboard (MERCADOPAGO_PLAN_PRO / _MAX), x-signature verification on the
 * webhook, and NEXT_PUBLIC_MERCADOPAGO_ENABLED=1 to surface the button. Field
 * names follow MP's documented /preapproval shape; verify against the live API.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { type PlanId, siteUrl } from "./stripe";

const MP_API = "https://api.mercadopago.com";

/** Read an env var, stripping surrounding whitespace/newlines. Pasting an
 *  access token or plan id into a hosting dashboard commonly drags a
 *  trailing "\n" along, which then fails matching (or reaches MP verbatim).
 *  Returns undefined for missing OR blank-after-trim. Mirrors `envId` in
 *  stripe.ts. */
function mpEnv(name: string): string | undefined {
  const trimmed = process.env[name]?.trim();
  return trimmed ? trimmed : undefined;
}

const accessToken = mpEnv("MERCADOPAGO_ACCESS_TOKEN");

/** True when the webhook signing secret is configured — when it is, the
 *  webhook MUST reject unsigned/invalid requests. */
export const mercadoPagoWebhookSecretSet = Boolean(
  mpEnv("MERCADOPAGO_WEBHOOK_SECRET"),
);

/**
 * Verify Mercado Pago's `x-signature` header (official scheme).
 *
 * MP sends `x-signature: ts=<unix>,v1=<hmac>` and `x-request-id`. The signed
 * manifest is `id:<data.id>;request-id:<x-request-id>;ts:<ts>;` (data.id
 * lowercased), HMAC-SHA256'd with the webhook secret from the MP dashboard.
 * Returns false when the secret is unset (caller decides whether to enforce).
 */
export function verifyMpWebhookSignature(input: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | undefined;
}): boolean {
  const secret = mpEnv("MERCADOPAGO_WEBHOOK_SECRET");
  if (!secret || !input.xSignature) return false;

  const parts: Record<string, string> = {};
  for (const kv of input.xSignature.split(",")) {
    const idx = kv.indexOf("=");
    if (idx === -1) continue;
    parts[kv.slice(0, idx).trim()] = kv.slice(idx + 1).trim();
  }
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const id = input.dataId ? input.dataId.toLowerCase() : "";
  const manifest = `id:${id};request-id:${input.xRequestId ?? ""};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");

  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(v1, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** True when Mercado Pago is configured. Mirrors the `stripe` null-guard so a
 *  route can 503 cleanly instead of throwing when MP isn't set up. */
export const mercadoPagoConfigured = Boolean(accessToken);

// Monthly amount per plan, in the MP currency. We create the subscription
// WITHOUT an associated plan (see createPreapproval) — the associated-plan
// flow demands a tokenized card (`card_token_id is required`) and gives no
// hosted checkout URL. A plan-less preapproval with the amount inline returns
// an `init_point` (MP captures the card) AND keeps our `external_reference`
// linking. So the amount/currency live here, not on a dashboard plan.
const DEFAULT_PRO_COP = 79000;
const DEFAULT_MAX_COP = 159000;
const MP_CURRENCY = mpEnv("MERCADOPAGO_CURRENCY") ?? "COP";

/** Monthly amount for a plan in the MP currency. Env overrides
 *  MERCADOPAGO_PRO_COP / MERCADOPAGO_MAX_COP; defaults are the agreed COP
 *  prices. Agency is lead-gen → no self-serve subscription (null). */
export function mpAmountFor(plan: PlanId): number | null {
  if (plan === "pro") return Number(mpEnv("MERCADOPAGO_PRO_COP")) || DEFAULT_PRO_COP;
  if (plan === "max") return Number(mpEnv("MERCADOPAGO_MAX_COP")) || DEFAULT_MAX_COP;
  return null;
}

/** Legacy: maps a plan to a pre-created `preapproval_plan_id` (associated-plan
 *  flow). No longer used for NEW checkouts — kept so the webhook can still
 *  classify subscriptions created under the old flow (see mpPlanFromPreapproval). */
export function mpPreapprovalPlanFor(plan: PlanId): string | null {
  if (plan === "pro") return mpEnv("MERCADOPAGO_PLAN_PRO") ?? null;
  if (plan === "max") return mpEnv("MERCADOPAGO_PLAN_MAX") ?? null;
  return null;
}

/** Legacy reverse lookup by `preapproval_plan_id` (associated-plan flow). Kept
 *  for back-compat + reused by mpPlanFromPreapproval. */
export function mpPlanFromPreapprovalPlanId(
  preapprovalPlanId: string | undefined | null,
): "pro" | "max" | null {
  if (!preapprovalPlanId) return null;
  if (preapprovalPlanId === mpEnv("MERCADOPAGO_PLAN_PRO")) return "pro";
  if (preapprovalPlanId === mpEnv("MERCADOPAGO_PLAN_MAX")) return "max";
  return null;
}

/** Resolve which Terminal Sync plan an MP subscription is. Plan-less
 *  subscriptions (the current flow) carry no plan_id, so classify by the
 *  recurring amount first, then by the reason text ("... Max"/"... Pro"); fall
 *  back to the legacy plan_id for subscriptions created under the old flow. */
export function mpPlanFromPreapproval(pre: PreapprovalState): "pro" | "max" | null {
  const byLegacyPlan = mpPlanFromPreapprovalPlanId(pre.preapproval_plan_id);
  if (byLegacyPlan) return byLegacyPlan;

  const amount = pre.auto_recurring?.transaction_amount;
  if (typeof amount === "number") {
    if (amount === mpAmountFor("max")) return "max";
    if (amount === mpAmountFor("pro")) return "pro";
  }

  const reason = (pre.reason ?? "").toLowerCase();
  if (reason.includes("max")) return "max";
  if (reason.includes("pro")) return "pro";
  return null;
}

/** MP preapproval status → our provider-neutral subscription status.
 *  MP statuses: pending | authorized | paused | cancelled. */
export function mpStatusToSubscriptionStatus(
  status: string | undefined,
):
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete" {
  switch (status) {
    case "authorized":
      return "active";
    case "paused":
      return "past_due";
    case "cancelled":
      return "canceled";
    default:
      // "pending" and anything unexpected: no active access yet.
      return "incomplete";
  }
}

export interface CreatePreapprovalInput {
  /** Monthly amount in the MP currency (COP). Sent inline so MP returns a
   *  hosted checkout without demanding a tokenized card. */
  amount: number;
  payerEmail?: string;
  /** Supabase auth user id (or the buyer's email) — the MP `external_reference`,
   *  mirrors the `supabase_user_id` we put in Stripe metadata so the webhook can
   *  link an MP subscription to a Terminal Sync account. */
  externalReference?: string;
  /** Human-readable subscription name, e.g. "Terminal Sync Max". Also used by
   *  the webhook as a fallback plan classifier, so keep "Pro"/"Max" in it. */
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

  // Plan-less preapproval: the amount/frequency go inline (NOT a
  // preapproval_plan_id). With `status: "pending"` and no card token, MP
  // returns an `init_point` checkout page where the buyer enters their card —
  // the associated-plan flow instead fails with "card_token_id is required".
  const res = await fetch(`${MP_API}/preapproval`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reason: input.reason,
      external_reference: input.externalReference,
      payer_email: input.payerEmail,
      back_url: input.backUrl,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: input.amount,
        currency_id: MP_CURRENCY,
      },
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

export interface PreapprovalState {
  id: string;
  status: string;
  external_reference?: string;
  preapproval_plan_id?: string;
  payer_email?: string;
  /** Present on plan-less subscriptions — the webhook classifies Pro/Max from
   *  the recurring amount (and `reason` as a fallback). */
  reason?: string;
  auto_recurring?: {
    transaction_amount?: number;
    currency_id?: string;
  };
}

export interface PreapprovalPlanSummary {
  id: string;
  reason?: string;
  status?: string;
  auto_recurring?: {
    transaction_amount?: number;
    currency_id?: string;
    frequency?: number;
    frequency_type?: string;
  };
}

/** Creates a recurring subscription plan (preapproval_plan) in MP — the MP
 *  analogue of a Stripe Price. The amount + currency live on the plan, so the
 *  currency-per-country decision (COP for Colombia) is captured here. Returns
 *  the created plan id, which is what goes in MERCADOPAGO_PLAN_PRO / _MAX. */
export async function createPreapprovalPlan(
  input: {
    reason: string;
    amount: number;
    currency: string;
    backUrl: string;
  },
  tokenOverride?: string,
): Promise<PreapprovalPlanSummary> {
  const token = tokenOverride || accessToken;
  if (!token) throw new Error("Mercado Pago not configured");
  const res = await fetch(`${MP_API}/preapproval_plan`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reason: input.reason,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: input.amount,
        currency_id: input.currency,
      },
      back_url: input.backUrl,
    }),
  });
  const data = (await res.json().catch(() => ({}))) as PreapprovalPlanSummary & {
    message?: string;
  };
  if (!res.ok || !data.id) {
    throw new Error(
      data.message || `Mercado Pago preapproval_plan failed (HTTP ${res.status})`,
    );
  }
  return data;
}

/** Lists the account's existing subscription plans — lets the admin setup page
 *  show already-created plans (and their ids) instead of creating duplicates. */
export async function listPreapprovalPlans(
  tokenOverride?: string,
): Promise<PreapprovalPlanSummary[]> {
  const token = tokenOverride || accessToken;
  if (!token) return [];
  const res = await fetch(`${MP_API}/preapproval_plan/search?limit=50`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  const data = (await res.json().catch(() => null)) as {
    results?: PreapprovalPlanSummary[];
  } | null;
  return data?.results ?? [];
}

/** Reads a preapproval's current state from MP — used by the webhook to
 *  confirm a notification before activating the subscription. Returns the
 *  fields the webhook needs to link + classify the subscription. */
export async function getPreapproval(
  id: string,
): Promise<PreapprovalState | null> {
  if (!accessToken) return null;
  const res = await fetch(`${MP_API}/preapproval/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  return (await res.json().catch(() => null)) as PreapprovalState | null;
}

export { siteUrl };
