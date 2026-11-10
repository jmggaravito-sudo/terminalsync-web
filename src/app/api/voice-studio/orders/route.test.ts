import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mock = vi.hoisted(() => ({
  email: vi.fn(), license: vi.fn(), legacy: vi.fn(), send: vi.fn(),
  read: vi.fn(), submit: vi.fn(),
}));
vi.mock("@/lib/voiceStudioConsent", () => ({ voiceLicenseStatus: mock.license }));
vi.mock("@/lib/voiceStudioAuth", () => ({ emailFromClientRequest: mock.email }));
vi.mock("@/lib/voiceStudioLicense", () => ({ licenseUrl: () => "/voice-studio/license?t=test" }));
vi.mock("@/lib/voiceStudioCrm", () => ({ listClientOrders: mock.legacy }));
vi.mock("resend", () => ({ Resend: class { emails = { send: mock.send }; } }));
vi.mock("@/lib/voiceStudioProduction", async (original) => ({
  ...await original<typeof import("@/lib/voiceStudioProduction")>(),
  readProduction: mock.read, submitProduction: mock.submit,
}));
import { GET, POST } from "./route";

const entitlementId = "00000000-0000-0000-0000-000000000001";
const requestId = "00000000-0000-0000-0000-000000000002";
const request = (orders: unknown) => new Request("https://example.test/api/voice-studio/orders", {
  method: "POST", body: JSON.stringify({ requestId, entitlementId, orders, email: "other@example.test" }),
});
const source = { source_url: "https://youtu.be/abcdefghijk?si=tracking", notes: " voice note ", short_mode: "timestamp", short_timestamp: "1:20" };

beforeEach(() => { mock.license.mockResolvedValue("signed"); });
afterEach(() => { vi.resetAllMocks(); vi.unstubAllEnvs(); });

describe("client production orders", () => {
  it("uses verified identity and preserves legacy orders independently", async () => {
    mock.email.mockResolvedValue("Buyer@Example.Test");
    mock.read.mockResolvedValue({ entitlements: [], orders: [] });
    mock.legacy.mockResolvedValue(null);
    const res = await GET(new Request("https://example.test/api/voice-studio/orders"));
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("private, no-store");
    expect(mock.read).toHaveBeenCalledWith("buyer@example.test");
    expect(await res.json()).toMatchObject({ legacyOrders: [], legacyOrdersAvailable: false, email: "buyer@example.test" });
  });

  it("rejects unauthenticated writes before touching production data", async () => {
    mock.email.mockResolvedValue(null);
    expect((await POST(request([source]))).status).toBe(401);
    expect(mock.submit).not.toHaveBeenCalled();
  });

  it("canonicalizes links and never trusts a client-supplied email or credit quantity", async () => {
    mock.email.mockResolvedValue("buyer@example.test");
    mock.submit.mockResolvedValue([{ id: "order-id", created_at: new Date().toISOString() }]);
    mock.send.mockResolvedValue({ error: null });
    vi.stubEnv("RESEND_API_KEY", "test-only");
    const res = await POST(request([{ ...source, video_units: 0, status: "delivered" }]));
    expect(res.status).toBe(200);
    expect(mock.submit).toHaveBeenCalledWith("buyer@example.test", entitlementId, requestId, [{
      source_url: "https://www.youtube.com/watch?v=abcdefghijk", notes: "voice note",
      short_mode: "timestamp", short_timestamp: "1:20",
    }]);
    expect(mock.send).toHaveBeenCalledWith(expect.anything(), { idempotencyKey: "voice-studio-order/order-id" });
  });

  it("rejects duplicate links and invalid timecodes before using credits", async () => {
    mock.email.mockResolvedValue("buyer@example.test");
    expect((await POST(request([source, { ...source, source_url: "https://www.youtube.com/watch?v=abcdefghijk" }]))).status).toBe(400);
    expect((await POST(request([{ ...source, short_timestamp: "1:75" }]))).status).toBe(400);
    expect(mock.submit).not.toHaveBeenCalled();
  });

  it.each(["pending", "revoked"])("blocks %s license before touching credits", async (state) => {
    mock.email.mockResolvedValue("buyer@example.test");
    mock.license.mockResolvedValue(state);
    expect((await POST(request([source]))).status).toBe(403);
    expect(mock.submit).not.toHaveBeenCalled();
  });

  it("returns a clear no-credit error from the transactional check", async () => {
    mock.email.mockResolvedValue("buyer@example.test");
    mock.submit.mockRejectedValue({ message: "VOICE_STUDIO_INSUFFICIENT_CREDITS" });
    const res = await POST(request([source]));
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "Not enough credits remain in this plan." });
    expect(mock.send).not.toHaveBeenCalled();
  });
});
