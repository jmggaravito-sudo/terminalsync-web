import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Capture every upsert the neutral writer performs.
let upsertCalls: Array<{ table: string; row: Record<string, unknown> }>;

vi.mock("./supabaseAdmin", () => ({
  getSupabaseAdmin: () => ({
    from(table: string) {
      return {
        async upsert(row: Record<string, unknown>) {
          upsertCalls.push({ table, row });
          return { error: null };
        },
      };
    },
  }),
}));

import { createHmac } from "node:crypto";
import { downgradeToFree, upsertSubscription } from "./subscriptionState";
import {
  mpPlanFromPreapprovalPlanId,
  mpStatusToSubscriptionStatus,
  verifyMpWebhookSignature,
} from "./mercadopago";

beforeEach(() => {
  upsertCalls = [];
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
