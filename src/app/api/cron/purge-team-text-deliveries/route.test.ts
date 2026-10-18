import { beforeEach, describe, expect, it, vi } from "vitest";

const { getSupabaseAdmin, rpc } = vi.hoisted(() => ({ getSupabaseAdmin: vi.fn(), rpc: vi.fn() }));
vi.mock("@/lib/supabaseAdmin", () => ({ getSupabaseAdmin }));
import { GET } from "./route";

describe("Team text delivery expiry cron", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "cron-test-secret";
    getSupabaseAdmin.mockReturnValue({ rpc });
    rpc.mockResolvedValue({ data: 2, error: null });
  });

  it("requires the cron secret and never returns content or identifiers", async () => {
    expect((await GET(new Request("https://x.test/api/cron/purge-team-text-deliveries"))).status).toBe(401);
    const response = await GET(new Request("https://x.test/api/cron/purge-team-text-deliveries", {
      headers: { authorization: "Bearer cron-test-secret" },
    }));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(rpc).toHaveBeenCalledWith("purge_expired_team_text_deliveries", { p_limit: 500 });
    expect(await response.text()).toBe(JSON.stringify({ purged: 2 }));
  });

  it("fails closed on unavailable cleanup without leaking provider errors", async () => {
    rpc.mockResolvedValueOnce({ data: null, error: { message: "internal delivery payload" } });
    const response = await GET(new Request("https://x.test/api/cron/purge-team-text-deliveries", {
      headers: { authorization: "Bearer cron-test-secret" },
    }));
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("internal delivery payload");
  });
});
