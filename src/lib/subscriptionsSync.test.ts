import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";

// ── Controllable fakes, captured per test ────────────────────────────────
let upsertCalls: Array<{ table: string; row: Record<string, unknown> }>;
let profileRow: { id: string } | null;
let profileError: { message: string } | null;
let retrievedCustomer: { email?: string | null; deleted?: boolean } | null;
let subscriptionUpdateCalls: Array<{ id: string; metadata: Record<string, string> }>;

function makeSupabaseFake() {
  return {
    from(table: string) {
      return {
        // profiles lookup: .select("id").ilike("email", e).maybeSingle()
        select() {
          return {
            ilike() {
              return {
                async maybeSingle() {
                  return { data: profileRow, error: profileError };
                },
              };
            },
          };
        },
        // subscriptions upsert: .upsert(row, opts)
        async upsert(row: Record<string, unknown>) {
          upsertCalls.push({ table, row });
          return { error: null };
        },
      };
    },
  };
}

vi.mock("./supabaseAdmin", () => ({
  getSupabaseAdmin: () => makeSupabaseFake(),
}));

vi.mock("./stripe", () => ({
  stripe: {
    customers: {
      async retrieve() {
        return retrievedCustomer ?? { deleted: true };
      },
    },
    subscriptions: {
      async update(id: string, params: { metadata: Record<string, string> }) {
        subscriptionUpdateCalls.push({ id, metadata: params.metadata });
        return {};
      },
    },
  },
}));

// Import AFTER the mocks are registered.
import { syncSubscriptionToSupabase } from "./subscriptionsSync";

// Minimal Stripe.Subscription shaped enough for the code under test.
function fakeSub(overrides: Partial<Stripe.Subscription> = {}): Stripe.Subscription {
  return {
    id: "sub_123",
    customer: "cus_123",
    status: "trialing",
    metadata: {},
    cancel_at_period_end: false,
    trial_end: null,
    items: {
      data: [
        {
          price: { id: "price_pro_monthly" },
          current_period_start: 1_700_000_000,
          current_period_end: 1_700_600_000,
        },
      ],
    },
    ...overrides,
  } as unknown as Stripe.Subscription;
}

beforeEach(() => {
  upsertCalls = [];
  subscriptionUpdateCalls = [];
  profileRow = null;
  profileError = null;
  retrievedCustomer = null;
  // The pro price env must map for plan resolution; set it for these tests.
  process.env.STRIPE_PRICE_PRO_MONTHLY = "price_pro_monthly";
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("syncSubscriptionToSupabase — account linking", () => {
  it("links by supabase_user_id when present in metadata (desktop-app purchase)", async () => {
    const sub = fakeSub({ metadata: { supabase_user_id: "user-meta" } });
    const ok = await syncSubscriptionToSupabase(sub);
    expect(ok).toBe(true);
    expect(upsertCalls).toHaveLength(1);
    expect(upsertCalls[0].row.user_id).toBe("user-meta");
    // No email cross-match path when metadata already has the id.
    expect(subscriptionUpdateCalls).toHaveLength(0);
  });

  it("cross-matches by checkout email when metadata is missing (web purchase) and backfills metadata", async () => {
    retrievedCustomer = { email: "buyer@example.com" };
    profileRow = { id: "user-by-email" };
    const sub = fakeSub({ metadata: {} }); // web checkout: no supabase_user_id

    const ok = await syncSubscriptionToSupabase(sub);

    expect(ok).toBe(true);
    // Subscription row written under the email-resolved account — this is
    // the exact bug the audit flagged (pays but stays Free).
    expect(upsertCalls).toHaveLength(1);
    expect(upsertCalls[0].row.user_id).toBe("user-by-email");
    // Metadata backfilled so later events (updated/deleted) link directly.
    expect(subscriptionUpdateCalls).toHaveLength(1);
    expect(subscriptionUpdateCalls[0].id).toBe("sub_123");
    expect(subscriptionUpdateCalls[0].metadata.supabase_user_id).toBe(
      "user-by-email",
    );
  });

  it("does NOT link (and does not upsert) when the checkout email has no matching profile", async () => {
    retrievedCustomer = { email: "stranger@example.com" };
    profileRow = null; // no Terminal Sync account for this email
    const sub = fakeSub({ metadata: {} });

    const ok = await syncSubscriptionToSupabase(sub);

    expect(ok).toBe(false);
    expect(upsertCalls).toHaveLength(0);
    expect(subscriptionUpdateCalls).toHaveLength(0);
  });

  it("does NOT link when the customer has no email at all", async () => {
    retrievedCustomer = { email: null };
    const sub = fakeSub({ metadata: {} });

    const ok = await syncSubscriptionToSupabase(sub);

    expect(ok).toBe(false);
    expect(upsertCalls).toHaveLength(0);
  });
});
