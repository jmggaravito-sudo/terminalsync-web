import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ authenticate: vi.fn(), stripeCreate: vi.fn(), rpc: vi.fn() }));
vi.mock("@/lib/marketplace/auth", () => ({ authenticate: mocks.authenticate }));
vi.mock("@/lib/stripe", () => ({
  siteUrl: () => "https://terminalsync.ai",
  stripe: { checkout: { sessions: { create: mocks.stripeCreate } } },
}));
vi.mock("@/lib/supabaseAdmin", () => ({ getSupabaseAdmin: () => ({ rpc: mocks.rpc }) }));
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
  mocks.rpc.mockImplementation(async (name: string) => {
    if (name === "reserve_video_exclusive_checkout") {
      return { data: { status: "create", idempotencyKey: "video-exclusive:0123456789abcdef0123456789abcdef" }, error: null };
    }
    return { data: true, error: null };
  });
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
    expect(options.idempotencyKey).toMatch(/^video-exclusive:[a-f0-9]{32}$/);
    expect(params.success_url).toBe("https://terminalsync.ai/en");
    expect(mocks.rpc.mock.calls[0]).toEqual(["reserve_video_exclusive_checkout", {
      p_account_id: "user-from-session",
      p_request_id: rid,
      p_amount_cents: 1000,
      p_issuer_id: "verified-issuer_1",
      p_destination: "ledger-prod-7",
    }]);
    expect(mocks.rpc.mock.invocationCallOrder[0]).toBeLessThan(mocks.stripeCreate.mock.invocationCallOrder[0]!);
    expect(mocks.rpc.mock.calls[1]?.[0]).toBe("complete_video_exclusive_checkout");
  });

  it("returns the durably stored session on replay without calling Stripe again", async () => {
    enable();
    mocks.rpc
      .mockResolvedValueOnce({ data: { status: "create", idempotencyKey: "video-exclusive:0123456789abcdef0123456789abcdef" }, error: null })
      .mockResolvedValueOnce({ data: true, error: null })
      .mockResolvedValueOnce({ data: { status: "created", checkoutId: "cs_mock", url: "https://checkout.stripe.test/session" }, error: null });
    await POST(request({ amountCents: 2000, requestId: rid }));
    const replay = await POST(request({ amountCents: 2000, requestId: rid }));
    expect(replay.status).toBe(200);
    expect(mocks.stripeCreate).toHaveBeenCalledOnce();
    expect(await replay.json()).toMatchObject({ checkoutId: "cs_mock" });
  });

  it("does not recreate when Stripe succeeded but complete persistence returned an error", async () => {
    enable();
    mocks.rpc
      .mockResolvedValueOnce({ data: { status: "create", idempotencyKey: "video-exclusive:0123456789abcdef0123456789abcdef" }, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: "synthetic persistence failure" } })
      .mockResolvedValueOnce({ data: { status: "reconcile_required" }, error: null });
    const first = await POST(request({ amountCents: 1000, requestId: rid }));
    expect(first.status).toBe(409);
    const replay = await POST(request({ amountCents: 1000, requestId: rid }));
    expect(replay.status).toBe(409);
    expect(await replay.json()).toMatchObject({ code: "checkout_reconcile_required" });
    expect(mocks.stripeCreate).toHaveBeenCalledOnce();
  });

  it("returns a committed session on replay when the completion response was lost", async () => {
    enable();
    mocks.rpc
      .mockResolvedValueOnce({ data: { status: "create", idempotencyKey: "video-exclusive:0123456789abcdef0123456789abcdef" }, error: null })
      // Simulate a timeout after Postgres committed but before the RPC response reached this server.
      .mockResolvedValueOnce({ data: null, error: { message: "synthetic lost response" } })
      .mockResolvedValueOnce({ data: { status: "created", checkoutId: "cs_mock", url: "https://checkout.stripe.test/session" }, error: null });
    const first = await POST(request({ amountCents: 1000, requestId: rid }));
    expect(first.status).toBe(409);
    const replay = await POST(request({ amountCents: 1000, requestId: rid }));
    expect(replay.status).toBe(200);
    expect(await replay.json()).toMatchObject({ checkoutId: "cs_mock", url: "https://checkout.stripe.test/session" });
    expect(mocks.stripeCreate).toHaveBeenCalledOnce();
  });

  it("fails closed on mutated terms for a pinned request", async () => {
    enable();
    mocks.rpc.mockResolvedValueOnce({ data: null, error: { message: "terms mismatch" } });
    const res = await POST(request({ amountCents: 2000, requestId: rid }));
    expect(res.status).toBe(503);
    expect(mocks.stripeCreate).not.toHaveBeenCalled();
  });

  it("never recreates a session for an ambiguous durable intent", async () => {
    enable();
    mocks.rpc.mockResolvedValueOnce({ data: { status: "reconcile_required" }, error: null });
    const res = await POST(request({ amountCents: 1000, requestId: rid }));
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ code: "checkout_reconcile_required" });
    expect(mocks.stripeCreate).not.toHaveBeenCalled();
  });

  it("does not log provider error text and persists ambiguous outcomes", async () => {
    enable();
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.stripeCreate.mockRejectedValueOnce(new Error("secret provider payload"));
    const res = await POST(request({ amountCents: 1000, requestId: rid }));
    expect(res.status).toBe(502);
    expect(mocks.rpc.mock.calls.map((call) => call[0])).toContain("mark_video_exclusive_checkout_ambiguous");
    expect(JSON.stringify(log.mock.calls)).not.toContain("secret provider payload");
    log.mockRestore();
  });

});
