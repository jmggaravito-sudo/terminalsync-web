import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ authenticate: vi.fn(), stripeCreate: vi.fn() }));
vi.mock("@/lib/marketplace/auth", () => ({ authenticate: mocks.authenticate }));
vi.mock("@/lib/stripe", () => ({
  siteUrl: () => "https://terminalsync.ai",
  stripe: { checkout: { sessions: { create: mocks.stripeCreate } } },
}));
vi.mock("@/lib/supabaseAdmin", () => ({ getSupabaseAdmin: vi.fn() }));
vi.mock("server-only", () => ({}));

import { POST } from "./route";

const rid = "123e4567-e89b-42d3-a456-426614174000";
const request = (body: Record<string, unknown>) => new Request("https://terminalsync.ai/api/credits/video-exclusive/checkout", {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: "Bearer session" },
  body: JSON.stringify(body),
});

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.VIDEO_EXCLUSIVE_CHECKOUT_ENABLED;
  delete process.env.VIDEO_EXCLUSIVE_FUNDING_ENABLED;
  delete process.env.VIDEO_FUNDING_SOURCE_ISSUER;
  delete process.env.VIDEO_FUNDING_SOURCE_DESTINATION;
  mocks.authenticate.mockResolvedValue({ id: "user-from-session", email: "buyer@example.com" });
  mocks.stripeCreate.mockResolvedValue({ id: "cs_mock", url: "https://checkout.stripe.test/session" });
});
afterEach(() => {
  delete process.env.VIDEO_EXCLUSIVE_CHECKOUT_ENABLED;
  delete process.env.VIDEO_EXCLUSIVE_FUNDING_ENABLED;
  delete process.env.VIDEO_FUNDING_SOURCE_ISSUER;
  delete process.env.VIDEO_FUNDING_SOURCE_DESTINATION;
});

function enable() {
  process.env.VIDEO_EXCLUSIVE_CHECKOUT_ENABLED = "1";
  process.env.VIDEO_EXCLUSIVE_FUNDING_ENABLED = "1";
  process.env.VIDEO_FUNDING_SOURCE_ISSUER = "verified-issuer_1";
  process.env.VIDEO_FUNDING_SOURCE_DESTINATION = "ledger-prod-7";
}

describe("POST /api/credits/video-exclusive/checkout", () => {
  it("is default-off and performs no Stripe call", async () => {
    const res = await POST(request({ amountCents: 1000, requestId: rid }));
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ code: "checkout_disabled" });
    expect(mocks.stripeCreate).not.toHaveBeenCalled();
  });

  it("fails closed when trusted issuer/destination are malformed", async () => {
    enable();
    process.env.VIDEO_FUNDING_SOURCE_DESTINATION = "bad destination";
    const res = await POST(request({ amountCents: 1000, requestId: rid }));
    expect(res.status).toBe(503);
    expect(mocks.stripeCreate).not.toHaveBeenCalled();
  });

  it("requires authenticated session identity before provider work", async () => {
    enable();
    mocks.authenticate.mockResolvedValue(null);
    const res = await POST(request({ amountCents: 1000, requestId: rid }));
    expect(res.status).toBe(401);
    expect(mocks.stripeCreate).not.toHaveBeenCalled();
  });

  it.each([
    { amountCents: 1000, requestId: rid, accountId: "attacker" },
    { amountCents: 1000, requestId: rid, issuerId: "attacker" },
    { amountCents: 1000, requestId: rid, amountMicros: 1 },
  ])("rejects client-supplied identity/terms fields %#", async (body) => {
    enable();
    const res = await POST(request(body));
    expect(res.status).toBe(400);
    expect(mocks.stripeCreate).not.toHaveBeenCalled();
  });

  it("uses only a certified package and server-owned immutable exclusive metadata", async () => {
    enable();
    const res = await POST(request({ amountCents: 1000, requestId: rid, lang: "en" }));
    expect(res.status).toBe(200);
    const [params, options] = mocks.stripeCreate.mock.calls[0]!;
    expect(params.line_items[0].price_data).toMatchObject({ currency: "usd", unit_amount: 1000 });
    expect(params.metadata).toMatchObject({
      source: "terminalsync_credits",
      credit_funding_purpose: "video-exclusive",
      supabase_user_id: "user-from-session",
      credit_amount_micros: "10000000",
      video_funding_issuer_id: "verified-issuer_1",
      video_funding_destination: "ledger-prod-7",
      video_exclusive_checkout_request_id: rid,
    });
    expect(params.payment_intent_data.metadata).toEqual(params.metadata);
    expect(options.idempotencyKey).toMatch(/^video-exclusive:[a-f0-9]{64}$/);
    expect(params.success_url).toBe("https://terminalsync.ai/en");
  });

  it("reuses the same provider idempotency key for exact retry", async () => {
    enable();
    await POST(request({ amountCents: 2000, requestId: rid }));
    await POST(request({ amountCents: 2000, requestId: rid }));
    expect(mocks.stripeCreate.mock.calls[0]![1]).toEqual(mocks.stripeCreate.mock.calls[1]![1]);
  });

  it("keeps the provider request key stable if package terms are mutated", async () => {
    enable();
    await POST(request({ amountCents: 1000, requestId: rid }));
    await POST(request({ amountCents: 2000, requestId: rid }));
    expect(mocks.stripeCreate.mock.calls[0]![1]).toEqual(mocks.stripeCreate.mock.calls[1]![1]);
    expect(mocks.stripeCreate.mock.calls[0]![0].line_items).not.toEqual(mocks.stripeCreate.mock.calls[1]![0].line_items);
  });

});
