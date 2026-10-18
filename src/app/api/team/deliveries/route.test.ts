import { beforeEach, describe, expect, it, vi } from "vitest";

const { getSupabaseAdmin, teamMetadataRpc } = vi.hoisted(() => ({ getSupabaseAdmin: vi.fn(), teamMetadataRpc: vi.fn() }));
vi.mock("@/lib/supabaseAdmin", () => ({ getSupabaseAdmin }));
vi.mock("@/lib/teamMetadata", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/teamMetadata")>(), teamMetadataRpc,
}));
import { GET } from "./route";

const threadId = "00000000-0000-4000-8000-000000000001";
const userId = "00000000-0000-4000-8000-000000000002";
const request = (url = `https://x.test/api/team/deliveries?threadId=${threadId}`, auth = true) => new Request(url, {
  headers: auth ? { authorization: "Bearer good" } : {},
});

describe("Team recipient delivery inbox metadata API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSupabaseAdmin.mockReturnValue({ auth: { getUser: vi.fn(async () => ({ data: { user: { id: userId } }, error: null })) } });
    teamMetadataRpc.mockResolvedValue([{
      id: "00000000-0000-4000-8000-000000000003",
      turn_id: "00000000-0000-4000-8000-000000000004",
      created_at: "2026-10-18T00:00:00.000Z",
      expires_at: "2026-10-25T00:00:00.000Z",
      content: "must not appear in the inbox projection",
      sender_user_id: "private sender",
    }]);
  });

  it("lists only bounded opaque recipient metadata without content or sender ids", async () => {
    const response = await GET(request());
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("pragma")).toBe("no-cache");
    expect(teamMetadataRpc).toHaveBeenCalledWith("list_team_text_deliveries_v1", {
      p_user_id: userId, p_thread_id: threadId, p_limit: 50,
      p_before_created_at: null, p_before_delivery_id: null,
    });
    const body = await response.text();
    expect(body).not.toContain("must not appear");
    expect(body).not.toContain("private sender");
  });

  it("requires valid thread cursor and returns generic service failures", async () => {
    expect((await GET(request(undefined, false))).status).toBe(401);
    expect((await GET(request("https://x.test/api/team/deliveries?threadId=bad"))).status).toBe(400);
    expect((await GET(request(`https://x.test/api/team/deliveries?threadId=${threadId}&beforeCreatedAt=2026-10-18T00:00:00Z`))).status).toBe(400);
    expect(teamMetadataRpc).not.toHaveBeenCalled();
    teamMetadataRpc.mockRejectedValueOnce(new Error("private payload"));
    const response = await GET(request());
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("private payload");
  });
});
