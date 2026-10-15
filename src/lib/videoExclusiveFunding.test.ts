import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ rpc: vi.fn(), retrieve: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabaseAdmin", () => ({ getSupabaseAdmin: () => ({ rpc: mocks.rpc }) }));
vi.mock("@/lib/stripe", () => ({ stripe: { checkout: { sessions: { retrieve: mocks.retrieve } } } }));

import Stripe from "stripe";
import { allocateVideoExclusiveFunding } from "./videoExclusiveFunding";

const event = {
  id: "evt_live_1",
  type: "checkout.session.completed",
  livemode: true,
} as Stripe.Event;
const session = (overrides: Record<string, string> = {}) => ({
  id: "cs_live_1",
  livemode: true,
  mode: "payment",
  payment_status: "paid",
  amount_total: 1000,
  currency: "usd",
  url: "https://checkout.stripe.test/live-session",
  payment_intent: "pi_live_1",
  metadata: {
    source: "terminalsync_credits",
    credit_funding_purpose: "video-exclusive",
    supabase_user_id: "00000000-0000-4000-8000-000000000001",
    credit_amount_cents: "1000",
    credit_amount_micros: "10000000",
    rail: "stripe",
    video_funding_issuer_id: "verified-issuer",
    video_funding_destination: "ledger-prod-7",
    video_exclusive_checkout_request_id: "123e4567-e89b-42d3-a456-426614174000",
    ...overrides,
  },
}) as unknown as Stripe.Checkout.Session;

afterEach(() => {
  delete process.env.VIDEO_EXCLUSIVE_FUNDING_ENABLED;
  delete process.env.VIDEO_FUNDING_SOURCE_ISSUER;
  delete process.env.VIDEO_FUNDING_SOURCE_DESTINATION;
});
beforeEach(() => vi.clearAllMocks());

describe("allocateVideoExclusiveFunding", () => {
  it("requires purpose and issuer/destination to match validated server config", async () => {
    process.env.VIDEO_EXCLUSIVE_FUNDING_ENABLED = "1";
    process.env.VIDEO_FUNDING_SOURCE_ISSUER = "verified-issuer";
    process.env.VIDEO_FUNDING_SOURCE_DESTINATION = "ledger-prod-7";
    await expect(allocateVideoExclusiveFunding({
      event,
      session: session({ video_funding_destination: "attacker-ledger" }),
      amountMicros: 10_000_000,
      signatureVerifiedWithLiveSecret: true,
    })).rejects.toThrow("identity is incomplete");
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("rejects missing immutable checkout request marker", async () => {
    process.env.VIDEO_EXCLUSIVE_FUNDING_ENABLED = "1";
    process.env.VIDEO_FUNDING_SOURCE_ISSUER = "verified-issuer";
    process.env.VIDEO_FUNDING_SOURCE_DESTINATION = "ledger-prod-7";
    await expect(allocateVideoExclusiveFunding({
      event,
      session: session({ video_exclusive_checkout_request_id: "not-a-uuid" }),
      amountMicros: 10_000_000,
      signatureVerifiedWithLiveSecret: true,
    })).rejects.toThrow("identity is incomplete");
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("sends the SQL-pinned request, issuer, and destination to the allocation wrapper", async () => {
    process.env.VIDEO_EXCLUSIVE_FUNDING_ENABLED = "1";
    process.env.VIDEO_FUNDING_SOURCE_ISSUER = "verified-issuer";
    process.env.VIDEO_FUNDING_SOURCE_DESTINATION = "ledger-prod-7";
    mocks.retrieve.mockResolvedValue(session());
    mocks.rpc.mockResolvedValue({ data: true, error: null });
    await allocateVideoExclusiveFunding({
      event,
      session: session(),
      amountMicros: 10_000_000,
      signatureVerifiedWithLiveSecret: true,
    });
    expect(mocks.rpc).toHaveBeenCalledWith("allocate_video_exclusive_funding_pinned", expect.objectContaining({
      p_issuer_id: "verified-issuer",
      p_destination: "ledger-prod-7",
      p_request_id: "123e4567-e89b-42d3-a456-426614174000",
      p_checkout_session_id: "cs_live_1",
      p_amount_micros: 10_000_000,
    }));
    expect(mocks.rpc.mock.calls.map((call) => call[0])).toEqual([
      "reconcile_video_exclusive_checkout",
      "allocate_video_exclusive_funding_pinned",
    ]);
    expect(mocks.retrieve).toHaveBeenCalledWith("cs_live_1");
  });

  it("does not reconcile from a provider session whose immutable terms differ", async () => {
    process.env.VIDEO_EXCLUSIVE_FUNDING_ENABLED = "1";
    process.env.VIDEO_FUNDING_SOURCE_ISSUER = "verified-issuer";
    process.env.VIDEO_FUNDING_SOURCE_DESTINATION = "ledger-prod-7";
    mocks.retrieve.mockResolvedValue(session({ video_funding_destination: "other-ledger" }));
    await expect(allocateVideoExclusiveFunding({
      event,
      session: session(),
      amountMicros: 10_000_000,
      signatureVerifiedWithLiveSecret: true,
    })).rejects.toThrow("does not match checkout terms");
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});
