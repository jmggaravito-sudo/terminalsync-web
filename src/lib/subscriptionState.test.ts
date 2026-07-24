import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Capture every upsert the neutral writer performs.
let upsertCalls: Array<{ table: string; row: Record<string, unknown> }>;
// Queue of errors to return from successive upsert calls (null = success).
let upsertErrorQueue: Array<{ code?: string; message?: string } | null>;

vi.mock("./supabaseAdmin", () => ({
  getSupabaseAdmin: () => ({
    from(table: string) {
      return {
        async upsert(row: Record<string, unknown>) {
          upsertCalls.push({ table, row });
          const err = upsertErrorQueue.length ? upsertErrorQueue.shift() : null;
          return { error: err ?? null };
        },
      };
    },
  }),
}));

import { createHmac } from "node:crypto";
import { downgradeToFree, upsertSubscription } from "./subscriptionState";
import {
  mpPlanFromPreapprovalPlanId,
  mpPlanFromPreapproval,
  mpStatusToSubscriptionStatus,
  verifyMpWebhookSignature,
} from "./mercadopago";

beforeEach(() => {
  upsertCalls = [];
  upsertErrorQueue = [];
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.MERCADOPAGO_PLAN_PRO;
  delete process.env.MERCADOPAGO_PLAN_MAX;
});

describe("upsertSubscription — provider-neutral write", () => {
  it("stamps provider + generic id columns for a Mercado Pago row", async () => {
    const ok = await upsertSubscription({
      userId: "user-1",
      provider: "mercadopago",
      plan: "pro",
      status: "active",
      providerSubscriptionId: "mp_preapp_1",
    });
    expect(ok).toBe(true);
    expect(upsertCalls).toHaveLength(1);
    const row = upsertCalls[0].row;
    expect(row.provider).toBe("mercadopago");
    expect(row.provider_subscription_id).toBe("mp_preapp_1");
    expect(row.plan).toBe("pro");
    expect(row.status).toBe("active");
    // MP rows must NOT masquerade as Stripe in the legacy columns.
    expect(row.stripe_subscription_id).toBeUndefined();
  });

  it("keeps the legacy Stripe columns populated for a Stripe row", async () => {
    await upsertSubscription({
      userId: "user-2",
      provider: "stripe",
      plan: "max",
      status: "trialing",
      providerCustomerId: "cus_9",
      providerSubscriptionId: "sub_9",
    });
    const row = upsertCalls[0].row;
    expect(row.provider).toBe("stripe");
    expect(row.stripe_customer_id).toBe("cus_9");
    expect(row.stripe_subscription_id).toBe("sub_9");
    expect(row.provider_subscription_id).toBe("sub_9");
  });

  it("degrades gracefully for Stripe when provider columns are missing (pre-migration)", async () => {
    // First upsert fails with a missing-column error, retry (legacy shape) ok.
    upsertErrorQueue = [{ code: "PGRST204", message: "column provider does not exist" }, null];
    const ok = await upsertSubscription({
      userId: "user-stripe",
      provider: "stripe",
      plan: "pro",
      status: "active",
      providerCustomerId: "cus_1",
      providerSubscriptionId: "sub_1",
    });
    expect(ok).toBe(true);
    expect(upsertCalls).toHaveLength(2);
    // Retry row drops provider* but keeps the legacy Stripe columns → Stripe
    // keeps syncing even before migration 0024.
    const retryRow = upsertCalls[1].row;
    expect("provider" in retryRow).toBe(false);
    expect("provider_subscription_id" in retryRow).toBe(false);
    expect(retryRow.stripe_subscription_id).toBe("sub_1");
  });

  it("does NOT half-write a Mercado Pago row when provider columns are missing", async () => {
    upsertErrorQueue = [{ code: "42703", message: "column provider does not exist" }];
    const ok = await upsertSubscription({
      userId: "user-mp",
      provider: "mercadopago",
      plan: "pro",
      status: "active",
      providerSubscriptionId: "mp_1",
    });
    // MP has no legacy columns to fall back on → skip rather than write a row
    // with no rail linkage.
    expect(ok).toBe(false);
    expect(upsertCalls).toHaveLength(1);
  });

  it("does not write period fields left undefined (partial cancel update)", async () => {
    await downgradeToFree({
      userId: "user-3",
      provider: "mercadopago",
      providerSubscriptionId: "mp_preapp_3",
    });
    const row = upsertCalls[0].row;
    expect(row.plan).toBe("free");
    expect(row.status).toBe("canceled");
    expect("current_period_end" in row).toBe(false);
    expect(row.cancel_at_period_end).toBe(false);
  });
});

describe("Mercado Pago mapping helpers", () => {
  it("maps MP preapproval status to our subscription status", () => {
    expect(mpStatusToSubscriptionStatus("authorized")).toBe("active");
    expect(mpStatusToSubscriptionStatus("paused")).toBe("past_due");
    expect(mpStatusToSubscriptionStatus("cancelled")).toBe("canceled");
    expect(mpStatusToSubscriptionStatus("pending")).toBe("incomplete");
    expect(mpStatusToSubscriptionStatus(undefined)).toBe("incomplete");
  });

  it("reverse-resolves the plan from a preapproval_plan_id via env", () => {
    process.env.MERCADOPAGO_PLAN_PRO = "plan_pro_ars";
    process.env.MERCADOPAGO_PLAN_MAX = "plan_max_ars";
    expect(mpPlanFromPreapprovalPlanId("plan_pro_ars")).toBe("pro");
    expect(mpPlanFromPreapprovalPlanId("plan_max_ars")).toBe("max");
    expect(mpPlanFromPreapprovalPlanId("plan_unknown")).toBeNull();
    expect(mpPlanFromPreapprovalPlanId(undefined)).toBeNull();
  });

  it("classifies a plan-less preapproval by recurring amount (COP defaults)", () => {
    const base = { id: "p1", status: "authorized" };
    expect(
      mpPlanFromPreapproval({ ...base, auto_recurring: { transaction_amount: 159000 } }),
    ).toBe("max");
    expect(
      mpPlanFromPreapproval({ ...base, auto_recurring: { transaction_amount: 79000 } }),
    ).toBe("pro");
  });

  it("falls back to the reason text when the amount doesn't match", () => {
    const base = { id: "p1", status: "authorized" };
    expect(
      mpPlanFromPreapproval({ ...base, reason: "Terminal Sync Max", auto_recurring: { transaction_amount: 1 } }),
    ).toBe("max");
    expect(mpPlanFromPreapproval({ ...base, reason: "Terminal Sync Pro" })).toBe("pro");
    expect(mpPlanFromPreapproval({ ...base })).toBeNull();
  });

  it("still classifies a legacy associated-plan subscription by plan_id", () => {
    process.env.MERCADOPAGO_PLAN_MAX = "plan_max_legacy";
    expect(
      mpPlanFromPreapproval({ id: "p1", status: "authorized", preapproval_plan_id: "plan_max_legacy" }),
    ).toBe("max");
  });
});

describe("verifyMpWebhookSignature", () => {
  const secret = "mp_webhook_secret";
  const dataId = "PREAPP123";
  const requestId = "req-abc";

  function sign(id: string, reqId: string, ts: string) {
    const manifest = `id:${id.toLowerCase()};request-id:${reqId};ts:${ts};`;
    return createHmac("sha256", secret).update(manifest).digest("hex");
  }

  beforeEach(() => {
    process.env.MERCADOPAGO_WEBHOOK_SECRET = secret;
  });
  afterEach(() => {
    delete process.env.MERCADOPAGO_WEBHOOK_SECRET;
  });

  it("accepts a correctly signed request (data.id lowercased)", () => {
    const ts = "1700000000";
    const v1 = sign(dataId, requestId, ts);
    expect(
      verifyMpWebhookSignature({
        xSignature: `ts=${ts},v1=${v1}`,
        xRequestId: requestId,
        dataId,
      }),
    ).toBe(true);
  });

  it("rejects a tampered signature", () => {
    const ts = "1700000000";
    const v1 = sign("different-id", requestId, ts);
    expect(
      verifyMpWebhookSignature({
        xSignature: `ts=${ts},v1=${v1}`,
        xRequestId: requestId,
        dataId,
      }),
    ).toBe(false);
  });

  it("rejects when the secret is unset or the header is missing", () => {
    delete process.env.MERCADOPAGO_WEBHOOK_SECRET;
    expect(
      verifyMpWebhookSignature({ xSignature: "ts=1,v1=abc", xRequestId: requestId, dataId }),
    ).toBe(false);
    process.env.MERCADOPAGO_WEBHOOK_SECRET = secret;
    expect(
      verifyMpWebhookSignature({ xSignature: null, xRequestId: requestId, dataId }),
    ).toBe(false);
  });
});
