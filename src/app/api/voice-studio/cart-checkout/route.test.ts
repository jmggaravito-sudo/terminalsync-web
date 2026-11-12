import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { quoteAccount } from "@/lib/voiceStudioQuoteIntake";
import { testCartStripe } from "@/lib/voiceStudioCartCheckout";
import { GET, POST } from "./route";

vi.mock("@/lib/voiceStudioQuoteIntake", async (getOriginal) => ({
  ...await getOriginal<typeof import("@/lib/voiceStudioQuoteIntake")>(), quoteAccount: vi.fn(),
}));
vi.mock("@/lib/voiceStudioCartCheckout", async (getOriginal) => ({
  ...await getOriginal<typeof import("@/lib/voiceStudioCartCheckout")>(), testCartStripe: vi.fn(),
}));

const origin = "http://localhost:3131";
const path = `${origin}/api/voice-studio/cart-checkout`;
const quoteId = "00000000-0000-4000-8000-000000000001";
const accountId = "00000000-0000-4000-8000-000000000002";
const terms = "https://example.test/test-agreement/v1";
const id = "cs_test_example";
const session = {
  id, livemode: false, mode: "payment", status: "open", payment_status: "unpaid", currency: "usd",
  amount_total: 21006, metadata: { kind: "voice-studio-cart-test" }, client_reference_id: quoteId,
  url: `https://checkout.stripe.com/c/pay/${id}`,
};
const create = vi.fn();
const retrieve = vi.fn();
const acceptance = vi.fn();
const quote = vi.fn();
const filters = vi.fn();
const createdAt = "2026-11-12T22:00:00.000Z";
const defaultQuote = {
  id: quoteId, agreement_version: "v1", rights_confirmed: true, status: "submitted", created_at: createdAt,
  estimated_cents: 21006,
  items: [{ id: "youtube-abcdefghijk", service: "LIP", seconds: 1436, shorts: [30] }],
};
const post = (body: Record<string, unknown> = { quoteId }, requestOrigin = origin) =>
  POST(new Request(path, { method: "POST", headers: { origin: requestOrigin }, body: JSON.stringify(body) }));
const get = (sessionId = id) => GET(new Request(`${path}?session_id=${sessionId}`));

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(Date, "now").mockReturnValue(Date.parse(createdAt) + 1000);
  vi.stubEnv("VERCEL_ENV", "");
  vi.stubEnv("VERCEL_TARGET_ENV", "");
  vi.stubEnv("VERCEL_URL", "");
  vi.stubEnv("VOICE_STUDIO_CART_TEST_ORIGIN", origin);
  vi.stubEnv("VOICE_STUDIO_CART_TEST_SUPABASE_URL", "https://staging.supabase.co");
  vi.stubEnv("SUPABASE_URL", "https://staging.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://staging.supabase.co");
  vi.stubEnv("VOICE_STUDIO_CART_TEST_CHECKOUT_ENABLED", "true");
  vi.stubEnv("VOICE_STUDIO_CART_STRIPE_TEST_KEY", "sk_test_example");
  vi.stubEnv("VOICE_STUDIO_CART_TESTER_EMAILS", "buyer@example.test");
  vi.stubEnv("VOICE_STUDIO_QUOTE_INTAKE_ENABLED", "true");
  vi.stubEnv("VOICE_STUDIO_SERVICE_AGREEMENT_VERSION", "v1");
  vi.stubEnv("VOICE_STUDIO_SERVICE_AGREEMENT_URL", terms);
  vi.mocked(quoteAccount).mockResolvedValue({
    id: accountId, email: "buyer@example.test", db: {
      from: (table: string) => {
        const query = { eq: (col: string, val: string) => { filters(table, col, val); return query; },
          maybeSingle: table === "voice_studio_quote_requests" ? quote : acceptance };
        return { select: () => query };
      },
    },
  } as unknown as NonNullable<Awaited<ReturnType<typeof quoteAccount>>>);
  vi.mocked(testCartStripe).mockReturnValue({ checkout: { sessions: { create, retrieve } } } as unknown as ReturnType<typeof testCartStripe>);
  quote.mockResolvedValue({ data: defaultQuote });
  acceptance.mockResolvedValue({ data: { agreement_url: terms } });
  create.mockResolvedValue(session);
  retrieve.mockResolvedValue(session);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("Voice Studio Stripe test checkout", () => {
  it.each([
    ["VOICE_STUDIO_CART_TEST_CHECKOUT_ENABLED", "false"],
    ["VOICE_STUDIO_CART_STRIPE_TEST_KEY", "sk_live_example"],
    ["VOICE_STUDIO_CART_STRIPE_TEST_KEY", ""],
    ["VOICE_STUDIO_CART_TESTER_EMAILS", ""],
    ["VOICE_STUDIO_SERVICE_AGREEMENT_URL", ""],
    ["VERCEL_ENV", "production"],
    ["VERCEL_TARGET_ENV", "production"],
    ["VOICE_STUDIO_CART_TEST_ORIGIN", "https://terminalsync.ai"],
    ["SUPABASE_URL", "https://different.supabase.co"],
  ])("fails closed with %s=%s", async (key, value) => {
    vi.stubEnv(key, value);
    expect((await post()).status).toBe(503);
    expect((await get()).status).toBe(503);
    expect(testCartStripe).not.toHaveBeenCalled();
  });

  it("requires an allowed signed-in account, matching origin and quote ownership", async () => {
    expect((await post({ quoteId }, "https://example.test")).status).toBe(403);
    vi.mocked(quoteAccount).mockResolvedValueOnce(null);
    expect((await post()).status).toBe(401);
    vi.stubEnv("VOICE_STUDIO_CART_TESTER_EMAILS", "someone@example.test");
    expect((await post()).status).toBe(403);
    vi.stubEnv("VOICE_STUDIO_CART_TESTER_EMAILS", "buyer@example.test");
    quote.mockResolvedValueOnce({ data: null });
    expect((await post()).status).toBe(404);
    expect(filters).toHaveBeenCalledWith("voice_studio_quote_requests", "account_id", accountId);
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects old terms, missing rights, declined quotes or mismatched totals", async () => {
    quote.mockResolvedValueOnce({ data: { ...defaultQuote, agreement_version: "v0" } });
    expect((await post()).status).toBe(412);
    quote.mockResolvedValueOnce({ data: { ...defaultQuote, rights_confirmed: false } });
    expect((await post()).status).toBe(412);
    quote.mockResolvedValueOnce({ data: { ...defaultQuote, status: "declined" } });
    expect((await post()).status).toBe(412);
    acceptance.mockResolvedValueOnce({ data: { agreement_url: "https://example.test/wrong" } });
    expect((await post()).status).toBe(412);
    quote.mockResolvedValueOnce({ data: { ...defaultQuote, estimated_cents: 1 } });
    expect((await post()).status).toBe(409);
    expect(create).not.toHaveBeenCalled();
  });

  it("uses exactly $210.06 for LIP and a Short, ignoring browser-supplied price; stable retries", async () => {
    const result = await post({ quoteId, amount: 1 });
    expect(result.status).toBe(200);
    expect(await result.json()).toEqual({ url: session.url });
    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      mode: "payment", currency: "usd", adaptive_pricing: { enabled: false }, automatic_tax: { enabled: false },
      cancel_url: `${origin}/voice-studio/cart-preview`,
      success_url: `${origin}/voice-studio/cart-preview/test-result?session_id={CHECKOUT_SESSION_ID}`,
      line_items: [
        { quantity: 1, price_data: { currency: "usd", unit_amount: 19506, product_data: { name: "LIP · Spanish dubbing with lip-sync" } } },
        { quantity: 1, price_data: { currency: "usd", unit_amount: 1500, product_data: { name: "Shorts / Reels in Spanish" } } },
      ],
    }), { idempotencyKey: `voice-studio-cart-test:${quoteId}` });
    vi.spyOn(Date, "now").mockReturnValue(Date.parse(createdAt) + 10_000);
    await post();
    expect(create.mock.calls[1]).toEqual(create.mock.calls[0]);
  });

  it("matches cart rounding across multiple videos and both services", async () => {
    quote.mockResolvedValueOnce({ data: {
      ...defaultQuote, estimated_cents: 10099,
      items: [
        { id: "youtube-abcdefghijk", service: "DUB", seconds: 61, shorts: [] },
        { id: "youtube-abcdefghij1", service: "DUB", seconds: 61, shorts: [] },
        { id: "youtube-abcdefghij2", service: "LIP", seconds: 60, shorts: [60] },
      ],
    } });
    create.mockResolvedValueOnce({ ...session, amount_total: 10099 });
    // The real estimate is $36.18: two 61-second DUB videos ($8.03), LIP ($8.15), and $20 Short.
    expect((await post()).status).toBe(409);
    expect(create).not.toHaveBeenCalled();
    quote.mockResolvedValueOnce({ data: {
      ...defaultQuote, estimated_cents: 3618,
      items: [
        { id: "youtube-abcdefghijk", service: "DUB", seconds: 61, shorts: [] },
        { id: "youtube-abcdefghij1", service: "DUB", seconds: 61, shorts: [] },
        { id: "youtube-abcdefghij2", service: "LIP", seconds: 60, shorts: [60] },
      ],
    } });
    create.mockReset();
    create.mockResolvedValueOnce({ ...session, amount_total: 3618 });
    expect((await post()).status).toBe(200);
    expect(create.mock.calls[0][0].line_items.map((line: {price_data: {unit_amount: number}}) => line.price_data.unit_amount))
      .toEqual([803, 815, 2000]);
  });

  it("does not reopen stale quotes or redirect to a mismatched Stripe session", async () => {
    quote.mockResolvedValueOnce({ data: { ...defaultQuote, created_at: "2026-11-12T19:00:00.000Z" } });
    const expired = await post();
    expect(expired.status).toBe(409);
    expect(await expired.json()).toMatchObject({ refreshQuote: true });
    expect(create).not.toHaveBeenCalled();
    create.mockResolvedValueOnce({ ...session, amount_total: 1 });
    expect((await post()).status).toBe(502);
    create.mockResolvedValueOnce({ ...session, livemode: true });
    expect((await post()).status).toBe(502);
  });

  it("verifies the payment from Stripe, not from a return URL, and rejects other accounts' sessions", async () => {
    expect((await get("cs_live_example")).status).toBe(400);
    expect(retrieve).not.toHaveBeenCalled();
    expect(await (await get()).json()).toEqual({ paid: false, total: 21006 });
    retrieve.mockResolvedValue({ ...session, payment_status: "paid", status: "complete" });
    expect(await (await get()).json()).toEqual({ paid: true, total: 21006 });
    quote.mockResolvedValueOnce({ data: null });
    expect((await get()).status).toBe(404);
  });
});
