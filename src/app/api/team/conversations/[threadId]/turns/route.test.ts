import { beforeEach, describe, expect, it, vi } from "vitest";

const { getSupabaseAdmin, teamMetadataRpc } = vi.hoisted(() => ({
  getSupabaseAdmin: vi.fn(),
  teamMetadataRpc: vi.fn(),
}));
vi.mock("@/lib/supabaseAdmin", () => ({ getSupabaseAdmin }));
vi.mock("@/lib/teamMetadata", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/teamMetadata")>(),
  teamMetadataRpc,
}));

import { GET, POST } from "./route";

const threadId = "00000000-0000-4000-8000-000000000001";
const turnId = "00000000-0000-4000-8000-000000000002";
const operationId = "00000000-0000-4000-8000-000000000005";
const params = { params: Promise.resolve({ threadId }) };
const auth = (url = `https://x.test/api/team/conversations/${threadId}/turns`) => new Request(url, {
  headers: { authorization: "Bearer ok" },
});
const json = (body: unknown) => new Request(`https://x.test/api/team/conversations/${threadId}/turns`, {
  method: "POST",
  headers: { authorization: "Bearer ok", "content-type": "application/json" },
  body: JSON.stringify(body),
});
const turn = {
  thread_id: threadId,
  id: turnId,
  status: "pending",
  request_kind: "context",
  metadata: { category: "Research" },
  created_at: "2026-10-18T00:00:00.000Z",
  responded_at: null,
  direction: "outbound",
  can_respond: false,
};

describe("Team conversation turn API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSupabaseAdmin.mockReturnValue({ auth: { getUser: vi.fn(async () => ({ data: { user: { id: "verified-user" } }, error: null })) } });
    teamMetadataRpc.mockResolvedValue([]);
  });

  it("lists paginated, metadata-only turns and does not serialize hashes or participant IDs", async () => {
    teamMetadataRpc.mockResolvedValueOnce([{
      ...turn,
      direction: "inbound",
      can_respond: true,
      manifest_hash: "a".repeat(64),
      initiator_user_id: "private-initiator",
      recipient_user_id: "private-recipient",
      client_operation_id: operationId,
    }]);
    const response = await GET(auth(`https://x.test/api/team/conversations/${threadId}/turns?limit=1`), params);
    expect(response.status).toBe(200);
    expect(teamMetadataRpc).toHaveBeenCalledWith("list_team_conversation_turns_v3", {
      p_user_id: "verified-user",
      p_thread_id: threadId,
      p_limit: 1,
      p_before_created_at: null,
      p_before_turn_id: null,
    });
    const body = await response.json();
    expect(body).toEqual({
      turns: [{ ...turn, direction: "inbound", can_respond: true }],
      nextCursor: { beforeCreatedAt: turn.created_at, beforeTurnId: turnId },
    });
    expect(JSON.stringify(body)).not.toContain("private");
    expect(JSON.stringify(body)).not.toContain("manifest_hash");
  });

  it("rejects invalid route handle, partial cursor, and unexpected query keys before RPC", async () => {
    const badParams = { params: Promise.resolve({ threadId: "not-a-uuid" }) };
    expect((await GET(auth(), badParams)).status).toBe(400);
    expect((await GET(auth(`https://x.test/api/team/conversations/${threadId}/turns?beforeCreatedAt=2026-10-18T00%3A00%3A00.000Z`), params)).status).toBe(400);
    expect((await GET(auth(`https://x.test/api/team/conversations/${threadId}/turns?content=secret`), params)).status).toBe(400);
    expect(teamMetadataRpc).not.toHaveBeenCalled();
  });

  it("creates a follow-up with verified identity, opaque thread handle, and exact operation UUID", async () => {
    teamMetadataRpc.mockResolvedValueOnce([{ ...turn, manifest_hash: "a".repeat(64), initiator_user_id: "private" }]);
    const response = await POST(json({
      kind: "context",
      manifestHash: "a".repeat(64),
      metadata: { category: "Research" },
      operationId,
    }), params);
    expect(response.status).toBe(200);
    expect(teamMetadataRpc).toHaveBeenCalledWith("create_team_conversation_turn_v3", {
      p_user_id: "verified-user",
      p_thread_id: threadId,
      p_request_kind: "context",
      p_manifest_hash: "a".repeat(64),
      p_metadata: { category: "Research" },
      p_client_operation_id: operationId,
    });
    expect(await response.json()).toEqual({ turn });
  });

  it("rejects relationship/user/content fields and a mismatched RPC thread instead of following or leaking them", async () => {
    for (const body of [
      { kind: "context", manifestHash: "a".repeat(64), operationId, relationshipId: "00000000-0000-4000-8000-000000000099" },
      { kind: "context", manifestHash: "a".repeat(64), operationId, userId: "attacker" },
      { kind: "context", manifestHash: "a".repeat(64), operationId, content: "private" },
    ]) {
      expect((await POST(json(body), params)).status).toBe(400);
    }
    expect(teamMetadataRpc).not.toHaveBeenCalled();
    teamMetadataRpc.mockResolvedValueOnce([{ ...turn, thread_id: "00000000-0000-4000-8000-000000000099" }]);
    const response = await POST(json({ kind: "context", manifestHash: "a".repeat(64), operationId }), params);
    expect(response.status).toBe(409);
  });
});
