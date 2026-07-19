#!/usr/bin/env node
/**
 * Create the two Mercado Pago subscription plans (preapproval_plan) for
 * Terminal Sync — Pro and Max — in Colombian pesos (COP), billed monthly.
 *
 * It talks to the MP REST API directly. Run it with YOUR access token in the
 * environment; it prints the two plan ids, which are NOT secret and are what
 * go into MERCADOPAGO_PLAN_PRO / MERCADOPAGO_PLAN_MAX on the site.
 *
 * Usage:
 *   MERCADOPAGO_ACCESS_TOKEN=APP_USR-... \
 *   node scripts/mercadopago/create-plans.mjs --pro 70000 --max 140000
 *
 * Flags:
 *   --pro   N   monthly amount in COP for the Pro plan  (required)
 *   --max   N   monthly amount in COP for the Max plan  (required)
 *   --back-url  success/return URL (default https://terminalsync.ai/es/checkout/success)
 *   --currency  ISO currency id (default COP)
 *
 * Nothing here is Terminal Sync-specific beyond the plan names — safe to re-run
 * (MP allows multiple plans; just don't create duplicates you won't use).
 */

const MP_API = "https://api.mercadopago.com";

const args = process.argv.slice(2);
function flag(name, fallback = null) {
  const i = args.indexOf(name);
  if (i === -1) return fallback;
  const v = args[i + 1];
  if (!v || v.startsWith("--")) throw new Error(`Missing value for ${name}`);
  return v;
}

const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
if (!token) {
  console.error("Missing MERCADOPAGO_ACCESS_TOKEN in the environment.");
  process.exit(1);
}

let proAmount, maxAmount;
try {
  proAmount = Number(flag("--pro"));
  maxAmount = Number(flag("--max"));
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
if (!Number.isFinite(proAmount) || !Number.isFinite(maxAmount) || proAmount <= 0 || maxAmount <= 0) {
  console.error("Both --pro and --max must be positive COP amounts, e.g. --pro 70000 --max 140000");
  process.exit(1);
}

const currency = flag("--currency", "COP");
const backUrl = flag("--back-url", "https://terminalsync.ai/es/checkout/success");

async function createPlan(reason, amount) {
  const res = await fetch(`${MP_API}/preapproval_plan`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reason,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: amount,
        currency_id: currency,
      },
      back_url: backUrl,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.id) {
    throw new Error(
      `${reason}: HTTP ${res.status} — ${data.message || JSON.stringify(data)}`,
    );
  }
  return data.id;
}

try {
  const proId = await createPlan("Terminal Sync Pro", proAmount);
  console.log(`\n✅ Pro  plan created: ${proId}  (${proAmount} ${currency}/mes)`);
  const maxId = await createPlan("Terminal Sync Max", maxAmount);
  console.log(`✅ Max  plan created: ${maxId}  (${maxAmount} ${currency}/mes)`);

  console.log("\n── Pegá estos valores como env vars (Vercel + entorno) ──");
  console.log(`MERCADOPAGO_PLAN_PRO=${proId}`);
  console.log(`MERCADOPAGO_PLAN_MAX=${maxId}`);
} catch (err) {
  console.error("\n❌ Failed:", err instanceof Error ? err.message : err);
  process.exit(1);
}
