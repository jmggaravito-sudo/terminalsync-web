import { createHash } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import { quoteAccount } from "@/lib/voiceStudioQuoteIntake";
import { verifyVoiceStudioQuoteVideo } from "@/lib/voiceStudioQuoteVideo";

vi.mock("@/lib/supabaseAdmin", () => ({ getSupabaseAdmin: () => null }));
vi.mock("@/lib/voiceStudioQuoteIntake", async (getOriginal) => ({
  ...await getOriginal<typeof import("@/lib/voiceStudioQuoteIntake")>(),
  quoteAccount: vi.fn(),
}));
vi.mock("@/lib/voiceStudioQuoteVideo", () => ({ verifyVoiceStudioQuoteVideo: vi.fn() }));

const id = "00000000-0000-4000-8000-000000000001";
const item = { id: "youtube-abcdefghijk", service: "LIP", shorts: [] };
const req = (patch: object = {}) => new Request("https://terminalsync.ai/api/voice-studio/quote-requests", {
  method: "POST", body: JSON.stringify({
    requestId: id, items: [item], rightsConfirmed: true, expectedTotal: 815, acceptedVersion: "v1", ...patch,
  }),
});
const url = "https://terminalsync.ai/voice-studio/terms/v1";
const existing = vi.fn();
const agreement = vi.fn();
const upsert = vi.fn();
const insert = vi.fn();
const filter = (maybeSingle: ReturnType<typeof vi.fn>) => ({ eq: () => ({ eq: () => ({ maybeSingle }) }) });

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("VOICE_STUDIO_QUOTE_INTAKE_ENABLED", "true");
  vi.stubEnv("VOICE_STUDIO_SERVICE_AGREEMENT_VERSION", "v1");
  vi.stubEnv("VOICE_STUDIO_SERVICE_AGREEMENT_URL", url);
  existing.mockResolvedValue({ data: null, error: null });
  agreement.mockResolvedValue({ data: null, error: null });
  upsert.mockResolvedValue({ error: null });
  insert.mockReturnValue({ select: () => ({ single: async () => ({ data: { id }, error: null }) }) });
  vi.mocked(quoteAccount).mockResolvedValue({
    id, email: "buyer@example.test", db: {
      from: (name: string) => name === "voice_studio_service_acceptances"
        ? { select: () => filter(agreement), upsert }
        : { select: () => filter(existing), insert },
    },
  } as unknown as NonNullable<Awaited<ReturnType<typeof quoteAccount>>>);
  vi.mocked(verifyVoiceStudioQuoteVideo).mockResolvedValue({ id: item.id, seconds: 60, title: "Verified title" });
});

describe("Voice Studio quote intake", () => {
  it("fails closed without an approved agreement configured", async () => {
    vi.stubEnv("VOICE_STUDIO_SERVICE_AGREEMENT_URL", "");
    expect((await POST(req())).status).toBe(503);
    expect(quoteAccount).not.toHaveBeenCalled();
  });
  it("rejects unauthenticated submissions", async () => {
    vi.mocked(quoteAccount).mockResolvedValue(null);
    expect((await POST(req())).status).toBe(401);
    expect(insert).not.toHaveBeenCalled();
  });
  it("requires a current acceptance and explicit rights confirmation", async () => {
    expect((await POST(req({ acceptedVersion: "v0" }))).status).toBe(412);
    expect((await POST(req({ rightsConfirmed: false }))).status).toBe(400);
    expect(insert).not.toHaveBeenCalled();
  });
  it("reverifies duration and rejects mismatched pricing", async () => {
    expect((await POST(req({ expectedTotal: 1 }))).status).toBe(409);
    expect(verifyVoiceStudioQuoteVideo).toHaveBeenCalledWith("https://www.youtube.com/watch?v=abcdefghijk");
    expect(upsert).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });
  it("records the acceptance and saves an unpaid request at the verified amount", async () => {
    agreement.mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({ data: { agreement_url: url }, error: null });
    expect((await POST(req())).status).toBe(201);
    expect(upsert).toHaveBeenCalledWith({ account_id: id, agreement_version: "v1", agreement_url: url },
      { onConflict: "account_id,agreement_version", ignoreDuplicates: true });
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      account_id: id, email: "buyer@example.test", estimated_cents: 815, rights_confirmed: true,
      items: [{ ...item, seconds: 60, title: "Verified title" }],
    }));
  });
  it("does not ask a returning account to sign the same version twice", async () => {
    agreement.mockResolvedValue({ data: { agreement_url: url }, error: null });
    expect((await POST(req({ acceptedVersion: null }))).status).toBe(201);
    expect(upsert).not.toHaveBeenCalled();
  });
  it("returns the original request for a replay and rejects changes under the same id", async () => {
    const request_fingerprint = createHash("sha256")
      .update(JSON.stringify({ items: [item], expectedTotal: 815 })).digest("hex");
    existing.mockResolvedValue({ data: { id, request_fingerprint }, error: null });
    const replay = await POST(req());
    expect(replay.status).toBe(200);
    expect(await replay.json()).toEqual({ id });
    expect((await POST(req({ expectedTotal: 816 }))).status).toBe(409);
    expect(verifyVoiceStudioQuoteVideo).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });
  it("rejects an add-on longer than the verified video", async () => {
    expect((await POST(req({ items: [{ ...item, shorts: [90] }] }))).status).toBe(422);
    expect(insert).not.toHaveBeenCalled();
  });
});
