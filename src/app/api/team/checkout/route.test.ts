import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  verifiedTeamUser: vi.fn(),
  getSupabaseAdmin: vi.fn(),
  rpc: vi.fn(),
  retrievePrice: vi.fn(),
  createSession: vi.fn(),
  retrieveSession: vi.fn(),
}));

vi.mock("@/lib/teamMetadata", () => ({ verifiedTeamUser: mocks.verifiedTeamUser }));
vi.mock("@/lib/supabaseAdmin", () => ({ getSupabaseAdmin: mocks.getSupabaseAdmin }));
vi.mock("@/lib/stripe", () => ({
  stripe: {
    prices: { retrieve: mocks.retrievePrice },
    checkout: { sessions: { create: mocks.createSession, retrieve: mocks.retrieveSession } },
  },
  siteUrl: () => "https://terminalsync.test/",
}));

import { POST } from "./route";

const ownerId = "11111111-1111-4111-8111-111111111111";
const requestId = "22222222-2222-4222-8222-222222222222";
const intentId = "33333333-3333-4333-8333-333333333333";
const idempotencyKey = "team-checkout:44444444-4444-4444-8444-444444444444";
const priceId = "price_team59test";

function intent(state: string, extras: Record<string, unknown> = {}) {
  return {
    id: intentId,
    owner_user_id: ownerId,
    request_id: requestId,
    stripe_price_id: priceId,
    seats: 64,
    mode: "subscription",
    idempotency_key: idempotencyKey,
    state,
    stripe_session_id: null,
    ...extras,
  };
}

function price() {
  return {
    id: priceId,
    active: true,
    livemode: false,
    currency: "usd",
    unit_amount: 5900,
    recurring: { interval: "month", interval_count: 1 },
  };
}

function checkoutRequest(body: unknown = { requestId, seats: 64, lang: "en" }) {
  return new Request("https://terminalsync.test/api/team/checkout", {
    method: "POST",
    headers: { authorization: "Bearer verified", "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function metadata() {
  return {
    plan: "team",
    source: "terminalsync_team",
    team_billing_version: "1",
    supabase_user_id: ownerId,
    team_seat_count: "64",
    team_checkout_intent_id: intentId,
    team_checkout_owner_user_id: ownerId,
    team_checkout_request_id: requestId,
    team_checkout_price_id: priceId,
    team_checkout_seats: "64",
    team_checkout_mode: "subscription",
    team_checkout_idempotency_key: idempotencyKey,
  };
}

function rpcResult(data: unknown, error: unknown = null) {
  return { data, error };
}

describe("Team paid checkout API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("TEAM_FEATURE_ENABLED", "1");
    vi.stubEnv("TEAM_PAID_CHECKOUT_ENABLED", "1");
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_source_only");
    vi.stubEnv("STRIPE_PRICE_TEAM_TEST", priceId);
    mocks.verifiedTeamUser.mockResolvedValue({ id: ownerId });
    mocks.getSupabaseAdmin.mockReturnValue({ rpc: mocks.rpc });
    mocks.retrievePrice.mockResolvedValue(price());
    mocks.createSession.mockResolvedValue({ id: "cs_team_123", url: "https://checkout.stripe.test/c/cs_team_123" });
    mocks.retrieveSession.mockResolvedValue({
      id: "cs_team_123",
      url: "https://checkout.stripe.test/c/cs_team_123",
      mode: "subscription",
      status: "open",
      livemode: false,
      metadata: metadata(),
    });
    mocks.rpc.mockImplementation(async (name: string) => {
      if (name === "reserve_team_checkout_intent") return rpcResult(intent("reserved"));
      if (name === "begin_team_checkout_provider_attempt") return rpcResult(intent("creating"));
      if (name === "bind_team_checkout_session") return rpcResult("checkout_created");
      if (name === "mark_team_checkout_intent_ambiguous") return rpcResult("ambiguous");
      throw new Error(`Unexpected RPC ${name}`);
    });
  });

  afterEach(() => vi.unstubAllEnvs());

  it("is explicitly default-off and cannot authenticate, query metadata, or call Stripe", async () => {
    vi.stubEnv("TEAM_PAID_CHECKOUT_ENABLED", "0");
    const response = await POST(checkoutRequest({ requestId, seats: 64, userId: "attacker" }));

    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ error: "Team paid checkout is not available yet" });
    expect(mocks.verifiedTeamUser).not.toHaveBeenCalled();
    expect(mocks.getSupabaseAdmin).not.toHaveBeenCalled();
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.retrievePrice).not.toHaveBeenCalled();
    expect(mocks.retrieveSession).not.toHaveBeenCalled();
    expect(mocks.createSession).not.toHaveBeenCalled();
  });

  it("requires both Team gates, so the paid flag alone remains inert", async () => {
    vi.stubEnv("TEAM_FEATURE_ENABLED", "0");
    const response = await POST(checkoutRequest());
    expect(response.status).toBe(503);
    expect(mocks.verifiedTeamUser).not.toHaveBeenCalled();
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.createSession).not.toHaveBeenCalled();
  });

  it("rejects caller-supplied user identity and malformed seats before auth, metadata, or Stripe", async () => {
    for (const body of [
      { requestId, seats: 64, userId: "attacker" },
      { requestId, seats: 64, supabaseUserId: ownerId },
      { requestId, seats: 0 },
      { requestId, seats: 65 },
      { requestId, seats: 1.5 },
    ]) {
      expect((await POST(checkoutRequest(body))).status).toBe(400);
    }
    expect(mocks.verifiedTeamUser).not.toHaveBeenCalled();
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.createSession).not.toHaveBeenCalled();
  });

  it("derives the owner from verified auth and creates exactly one $59/seat/month Stripe session after durable creation", async () => {
    const response = await POST(checkoutRequest());

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ url: "https://checkout.stripe.test/c/cs_team_123" });
    expect(mocks.rpc).toHaveBeenNthCalledWith(1, "reserve_team_checkout_intent", {
      p_owner_user_id: ownerId,
      p_request_id: requestId,
      p_stripe_price_id: priceId,
      p_seats: 64,
      p_mode: "subscription",
    });
    expect(mocks.retrievePrice).toHaveBeenCalledWith(priceId);
    expect(mocks.rpc).toHaveBeenNthCalledWith(2, "begin_team_checkout_provider_attempt", {
      p_intent_id: intentId,
      p_idempotency_key: idempotencyKey,
    });
    expect(mocks.createSession).toHaveBeenCalledTimes(1);

    const [params, options] = mocks.createSession.mock.calls[0] as [Record<string, unknown>, Record<string, unknown>];
    expect(params).toMatchObject({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 64 }],
      payment_method_collection: "always",
      success_url: "https://terminalsync.test/en/team",
      cancel_url: "https://terminalsync.test/en/team",
      locale: "en",
      metadata: metadata(),
      subscription_data: { metadata: metadata() },
    });
    expect((params.subscription_data as Record<string, unknown>).trial_period_days).toBeUndefined();
    expect((params.subscription_data as Record<string, unknown>).trial_settings).toBeUndefined();
    expect(options).toEqual({ idempotencyKey });
    expect(mocks.rpc).toHaveBeenNthCalledWith(3, "bind_team_checkout_session", {
      p_intent_id: intentId,
      p_idempotency_key: idempotencyKey,
      p_stripe_session_id: "cs_team_123",
    });

    const beginOrder = mocks.rpc.mock.invocationCallOrder[1];
    const createOrder = mocks.createSession.mock.invocationCallOrder[0];
    const bindOrder = mocks.rpc.mock.invocationCallOrder[2];
    expect(beginOrder).toBeLessThan(createOrder);
    expect(createOrder).toBeLessThan(bindOrder);
  });

  it("does not expose a base-plan mutation, owner ID, intent ID, or idempotency key to the browser", async () => {
    const response = await POST(checkoutRequest());
    const body = JSON.stringify(await response.json());
    for (const privateValue of [ownerId, intentId, idempotencyKey, "pro", "max"]) {
      expect(body).not.toContain(privateValue);
    }
  });

  it("requires verified authentication before reserving an owner-bound intent", async () => {
    mocks.verifiedTeamUser.mockResolvedValueOnce(null);
    const response = await POST(checkoutRequest());
    expect(response.status).toBe(401);
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.retrievePrice).not.toHaveBeenCalled();
    expect(mocks.createSession).not.toHaveBeenCalled();
  });

  it("fails closed before claim/create when server configuration or the remote Price drifts", async () => {
    vi.stubEnv("STRIPE_PRICE_TEAM_TEST", "not-a-price");
    expect((await POST(checkoutRequest())).status).toBe(503);
    expect(mocks.verifiedTeamUser).not.toHaveBeenCalled();
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.createSession).not.toHaveBeenCalled();

    vi.stubEnv("STRIPE_PRICE_TEAM_TEST", priceId);
    mocks.retrievePrice.mockResolvedValueOnce({ ...price(), unit_amount: 5901 });
    expect((await POST(checkoutRequest())).status).toBe(503);
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
    expect(mocks.rpc).toHaveBeenLastCalledWith("reserve_team_checkout_intent", expect.any(Object));
    expect(mocks.createSession).not.toHaveBeenCalled();
  });

  it("does not call Stripe when the service result is not bound to the verified owner/request", async () => {
    mocks.rpc.mockResolvedValueOnce(rpcResult(intent("reserved", { owner_user_id: "99999999-9999-4999-8999-999999999999" })));
    const response = await POST(checkoutRequest());
    expect(response.status).toBe(503);
    expect(mocks.retrievePrice).not.toHaveBeenCalled();
    expect(mocks.createSession).not.toHaveBeenCalled();
  });

  it("resumes only an exact existing open session and never creates a second one", async () => {
    mocks.rpc.mockResolvedValueOnce(rpcResult(intent("checkout_created", { stripe_session_id: "cs_team_123" })));
    const response = await POST(checkoutRequest());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ url: "https://checkout.stripe.test/c/cs_team_123" });
    expect(mocks.retrieveSession).toHaveBeenCalledWith("cs_team_123");
    expect(mocks.retrievePrice).not.toHaveBeenCalled();
    expect(mocks.createSession).not.toHaveBeenCalled();
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
  });

  it("quarantines creating/ambiguous results and provider failures rather than retrying create", async () => {
    mocks.rpc.mockResolvedValueOnce(rpcResult(intent("creating")));
    expect((await POST(checkoutRequest())).status).toBe(409);
    expect(mocks.retrievePrice).not.toHaveBeenCalled();
    expect(mocks.createSession).not.toHaveBeenCalled();

    vi.clearAllMocks();
    mocks.verifiedTeamUser.mockResolvedValue({ id: ownerId });
    mocks.getSupabaseAdmin.mockReturnValue({ rpc: mocks.rpc });
    mocks.retrievePrice.mockResolvedValue(price());
    mocks.createSession.mockRejectedValue(new Error("network result unknown"));
    mocks.rpc.mockImplementation(async (name: string) => {
      if (name === "reserve_team_checkout_intent") return rpcResult(intent("reserved"));
      if (name === "begin_team_checkout_provider_attempt") return rpcResult(intent("creating"));
      if (name === "mark_team_checkout_intent_ambiguous") return rpcResult("ambiguous");
      throw new Error(`Unexpected RPC ${name}`);
    });

    const response = await POST(checkoutRequest());
    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({ code: "team_checkout_reconciliation_required" });
    expect(mocks.createSession).toHaveBeenCalledTimes(1);
    expect(mocks.rpc).toHaveBeenLastCalledWith("mark_team_checkout_intent_ambiguous", {
      p_intent_id: intentId,
      p_idempotency_key: idempotencyKey,
    });
  });

  it("maps a known durable replay conflict to recovery-required before any Stripe call", async () => {
    mocks.rpc.mockResolvedValueOnce(rpcResult(null, { message: "Team checkout intent requires reconciliation" }));
    const response = await POST(checkoutRequest());
    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({ code: "team_checkout_reconciliation_required" });
    expect(mocks.retrievePrice).not.toHaveBeenCalled();
    expect(mocks.createSession).not.toHaveBeenCalled();
  });
});
