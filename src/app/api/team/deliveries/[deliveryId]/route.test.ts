import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getSupabaseAdmin, teamMetadataRpc } = vi.hoisted(() => ({ getSupabaseAdmin: vi.fn(), teamMetadataRpc: vi.fn() }));
vi.mock("@/lib/supabaseAdmin", () => ({ getSupabaseAdmin }));
vi.mock("@/lib/teamMetadata", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/teamMetadata")>(), teamMetadataRpc,
}));

import { GET } from "./route";

const deliveryId = "00000000-0000-4000-8000-000000000001";
const params = { params: Promise.resolve({ deliveryId }) };
const request = (url = `https://x.test/api/team/deliveries/${deliveryId}`, authenticated = true) => new Request(url, {
  headers: authenticated ? { authorization: "Bearer good" } : {},
});

describe("Team text delivery read API", () => {
  afterEach(() => vi.unstubAllEnvs());

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("TEAM_FEATURE_ENABLED", "1");
    vi.stubEnv("TEAM_SMOKE_ALLOWLIST_USER_IDS", "00000000-0000-4000-8000-000000000001,00000000-0000-4000-8000-000000000002");
    getSupabaseAdmin.mockReturnValue({ auth: { getUser: vi.fn(async () => ({ data: { user: { id: "00000000-0000-4000-8000-000000000001" } }, error: null })) } });
    teamMetadataRpc.mockResolvedValue([{
      id: deliveryId, content: "reviewed text", created_at: "2026-10-18T00:00:00.000Z", expires_at: "2026-10-25T00:00:00.000Z",
      sender_user_id: "private sender",
    }]);
  });

  it("returns only recipient-scoped text with no-store/no-cache headers", async () => {
    const response = await GET(request(), params);
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("pragma")).toBe("no-cache");
    expect(teamMetadataRpc).toHaveBeenCalledWith("read_team_text_delivery_v1", {
      p_user_id: "00000000-0000-4000-8000-000000000001", p_delivery_id: deliveryId,
    });
    const body = await response.text();
    expect(body).toContain("reviewed text");
    expect(body).not.toContain("private sender");
  });

  it("uses the same not-found response for inaccessible or unknown deliveries", async () => {
    teamMetadataRpc.mockResolvedValueOnce([]);
    const response = await GET(request(), params);
    expect(response.status).toBe(404);
    expect(await response.text()).toBe(JSON.stringify({ error: "Delivery unavailable" }));
  });

  it("requires auth, validates opaque IDs, and rejects query parameters", async () => {
    expect((await GET(request(undefined, false), params)).status).toBe(401);
    expect((await GET(request(`https://x.test/api/team/deliveries/${deliveryId}?url=https://private.example`), params)).status).toBe(404);
    expect((await GET(request(), { params: Promise.resolve({ deliveryId: "not-a-uuid" }) })).status).toBe(404);
    expect(teamMetadataRpc).not.toHaveBeenCalled();
  });
});
