import { afterEach, describe, expect, it, vi } from "vitest";

const mock = vi.hoisted(() => ({ token: vi.fn(), save: vi.fn(), crm: vi.fn() }));
vi.mock("@/lib/voiceStudioLicense", () => ({
  emailFromLicenseToken: mock.token, LICENSE_VERSION: "current-test-version",
}));
vi.mock("@/lib/voiceStudioConsent", () => ({ recordVoiceLicense: mock.save }));
vi.mock("@/lib/voiceStudioCrm", () => ({ markLeadLicensed: mock.crm }));
import { POST } from "./route";

function request(body: unknown) {
  return new Request("https://example.test/api/voice-studio/license/accept", {
    method: "POST", body: JSON.stringify(body),
  });
}
const input = { token: "email-link", channel: "https://www.youtube.com/@channel" };

afterEach(() => { vi.resetAllMocks(); vi.unstubAllEnvs(); });

describe("voice license acceptance", () => {
  it("uses identity from the signed link and records before notifying", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    mock.token.mockReturnValue("Buyer@Example.Test");
    mock.save.mockResolvedValue("recorded");
    expect((await POST(request({ ...input, email: "other@example.test" }))).status).toBe(200);
    expect(mock.save).toHaveBeenCalledWith(expect.objectContaining({ email: "buyer@example.test", channel: input.channel }));
    expect(mock.save.mock.invocationCallOrder[0]).toBeLessThan(mock.crm.mock.invocationCallOrder[0]);
  });

  it("does not record again or send another notification on repeat acceptance", async () => {
    mock.token.mockReturnValue("buyer@example.test");
    mock.save.mockResolvedValue("already_signed");
    const result = await POST(request(input));
    expect(result.status).toBe(200);
    expect(await result.json()).toEqual({ ok: true, alreadySigned: true });
    expect(mock.crm).not.toHaveBeenCalled();
  });

  it("does not show success on storage failure or reactivate a revoked signature", async () => {
    mock.token.mockReturnValue("buyer@example.test");
    mock.save.mockRejectedValueOnce(new Error("storage down")).mockResolvedValueOnce("revoked");
    expect((await POST(request(input))).status).toBe(503);
    expect((await POST(request(input))).status).toBe(409);
    expect(mock.crm).not.toHaveBeenCalled();
  });
});
