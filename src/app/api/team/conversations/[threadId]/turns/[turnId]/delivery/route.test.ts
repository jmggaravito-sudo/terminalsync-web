import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getSupabaseAdmin, teamMetadataRpc } = vi.hoisted(() => ({ getSupabaseAdmin: vi.fn(), teamMetadataRpc: vi.fn() }));
vi.mock("@/lib/supabaseAdmin", () => ({ getSupabaseAdmin }));
vi.mock("@/lib/teamMetadata", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/teamMetadata")>(), teamMetadataRpc,
}));

import { POST } from "./route";

const threadId = "00000000-0000-4000-8000-000000000001";
const turnId = "00000000-0000-4000-8000-000000000002";
const operationId = "00000000-0000-4000-8000-000000000003";
const userId = "00000000-0000-4000-8000-000000000001";
const params = { params: Promise.resolve({ threadId, turnId }) };
const request = (body: unknown, authenticated = true) => new Request(
  `https://x.test/api/team/conversations/${threadId}/turns/${turnId}/delivery`,
  {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(authenticated ? { authorization: "Bearer good" } : {}),
    },
    body: JSON.stringify(body),
  },
);

describe("Team explicit text delivery create API", () => {
  afterEach(() => vi.unstubAllEnvs());

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("TEAM_FEATURE_ENABLED", "1");
    vi.stubEnv("TEAM_SMOKE_ALLOWLIST_USER_IDS", "00000000-0000-4000-8000-000000000001,00000000-0000-4000-8000-000000000002");
    getSupabaseAdmin.mockReturnValue({ auth: { getUser: vi.fn(async () => ({ data: { user: { id: userId } }, error: null })) } });
    teamMetadataRpc.mockResolvedValue([{
      id: "00000000-0000-4000-8000-000000000005",
      recipient_user_id: "00000000-0000-4000-8000-000000000006",
      created_at: "2026-10-18T00:00:00.000Z",
      expires_at: "2026-10-25T00:00:00.000Z",
      content: "never include in the receipt",
    }]);
  });

  it("authenticates and forwards only the exact text with a server-computed digest", async () => {
    const content = "Reviewed answer";
    const response = await POST(request({ content, operationId }), params);
    expect(response.status).toBe(201);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("pragma")).toBe("no-cache");
    expect(teamMetadataRpc).toHaveBeenCalledWith("create_team_text_delivery_v1", {
      p_user_id: userId,
      p_thread_id: threadId,
      p_turn_id: turnId,
      p_operation_id: operationId,
      p_content: content,
      p_content_sha256: createHash("sha256").update(content, "utf8").digest("hex"),
    });
    const body = await response.text();
    expect(body).not.toContain("never include in the receipt");
    expect(body).not.toContain("recipient_user_id");
  });

  it("rejects unauthenticated, oversized, and non-JSON requests before any RPC", async () => {
    expect((await POST(request({ content: "text", operationId }, false), params)).status).toBe(401);
    expect((await POST(request({ content: "é".repeat(32769), operationId }), params)).status).toBe(400);
    const wrongType = new Request(`https://x.test/api/team/conversations/${threadId}/turns/${turnId}/delivery`, {
      method: "POST", headers: { authorization: "Bearer good", "content-type": "text/plain" }, body: "text",
    });
    expect((await POST(wrongType, params)).status).toBe(400);
    expect(teamMetadataRpc).not.toHaveBeenCalled();
  });

  it("rejects destinations, documents, artifacts, locators, and unknown ids without revealing database errors", async () => {
    for (const extra of [
      { recipientId: userId },
      { document: "untrusted document" },
      { attachment: "untrusted attachment" },
      { file: "untrusted file" },
      { filename: "secret.pdf" },
      { mimeType: "application/pdf" },
      { url: "https://private.example/document" },
      { path: "/Users/private/document.pdf" },
      { sourceId: "provider-object" },
      { storageKey: "private/object" },
      { artifact: { id: "untrusted" } },
    ]) expect((await POST(request({ content: "text", operationId, ...extra }), params)).status).toBe(400);
    expect(teamMetadataRpc).not.toHaveBeenCalled();
    const conflict = new Error("turn already delivered with private content");
    teamMetadataRpc.mockRejectedValueOnce(conflict);
    const response = await POST(request({ content: "text", operationId }), params);
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("private content");
  });
});
