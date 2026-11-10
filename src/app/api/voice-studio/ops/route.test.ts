import { afterEach, describe, expect, it, vi } from "vitest";

const mock = vi.hoisted(() => ({ getUser: vi.fn(), read: vi.fn(), update: vi.fn() }));
vi.mock("@/lib/supabaseAdmin", () => ({ getSupabaseAdmin: () => ({ auth: { getUser: mock.getUser } }) }));
vi.mock("@/lib/voiceStudioProduction", async (original) => ({
  ...await original<typeof import("@/lib/voiceStudioProduction")>(),
  readOpsOrders: mock.read, updateProduction: mock.update,
}));
import { GET, PATCH } from "./route";

const endpoint = "https://example.test/api/voice-studio/ops";
const auth = { Authorization: "Bearer token" };
const id = "00000000-0000-0000-0000-000000000001";
const patch = (video_url: string) => new Request(endpoint, {
  method: "PATCH", headers: auth, body: JSON.stringify({
    id, status: "delivered", video_units: 2, video_url, short_url: "https://files.example.test/short",
  }),
});
const user = (email: string, email_confirmed_at: string | null = "2026-11-10") =>
  ({ data: { user: { email, email_confirmed_at } }, error: null });

afterEach(() => { vi.resetAllMocks(); vi.unstubAllEnvs(); });

describe("Voice Studio operations authorization", () => {
  it("denies anonymous and unconfirmed accounts even with a signed client link", async () => {
    expect((await GET(new Request(endpoint + "?t=client-link"))).status).toBe(401);
    vi.stubEnv("VOICE_STUDIO_OPS_EMAILS", "ops@example.test");
    mock.getUser.mockResolvedValue(user("ops@example.test", null));
    expect((await GET(new Request(endpoint, { headers: auth }))).status).toBe(401);
    expect(mock.read).not.toHaveBeenCalled();
  });

  it("denies non-team access and reads approved queues without cache", async () => {
    vi.stubEnv("VOICE_STUDIO_OPS_EMAILS", "ops@example.test");
    mock.getUser.mockResolvedValueOnce(user("buyer@example.test")).mockResolvedValueOnce(user("Ops@Example.Test"));
    expect((await PATCH(patch("https://files.example.test/long"))).status).toBe(403);
    expect(mock.update).not.toHaveBeenCalled();
    mock.read.mockResolvedValue({ orders: [], hasMore: false });
    const res = await GET(new Request(endpoint + "?status=in_progress&page=2", { headers: auth }));
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("private, no-store");
    expect(mock.read).toHaveBeenCalledWith("in_progress", 2);
  });

  it("accepts only safe HTTPS links and sends verified updates to the atomic RPC", async () => {
    vi.stubEnv("VOICE_STUDIO_OPS_EMAILS", "ops@example.test");
    mock.getUser.mockResolvedValue(user("ops@example.test"));
    expect((await PATCH(patch("javascript:alert(1)"))).status).toBe(400);
    expect(mock.update).not.toHaveBeenCalled();
    expect((await PATCH(patch("https://files.example.test/long"))).status).toBe(200);
    expect(mock.update).toHaveBeenCalledWith(id, "delivered", "https://files.example.test/long", "https://files.example.test/short", 2);
  });
});
