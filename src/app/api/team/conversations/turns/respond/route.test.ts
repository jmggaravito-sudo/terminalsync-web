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

import { POST } from "./route";
import { TeamMetadataError } from "@/lib/teamMetadata";

const threadId = "00000000-0000-4000-8000-000000000001";
const turnId = "00000000-0000-4000-8000-000000000002";
const operationId = "00000000-0000-4000-8000-000000000005";
const json = (body: unknown, authenticated = true) => new Request("https://x.test/api/team/conversations/turns/respond", {
  method: "POST",
  headers: {
    ...(authenticated ? { authorization: "Bearer ok" } : {}),
    "content-type": "application/json",
  },
  body: JSON.stringify(body),
});

const responseTurn = {
  thread_id: threadId,
  id: turnId,
  status: "accepted",
  request_kind: "document",
  metadata: { label: "Quarterly packet" },
  created_at: "2026-10-18T00:00:00.000Z",
  responded_at: "2026-10-18T00:01:00.000Z",
  direction: "inbound",
  can_respond: false,
};

describe("Team conversation response API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSupabaseAdmin.mockReturnValue({ auth: { getUser: vi.fn(async () => ({ data: { user: { id: "verified-user" } }, error: null })) } });
    teamMetadataRpc.mockResolvedValue([]);
  });

  it("requires auth and only forwards verified identity + idempotent response operation", async () => {
    expect((await POST(json({}, false))).status).toBe(401);
    teamMetadataRpc.mockResolvedValueOnce([{
      ...responseTurn,
      manifest_hash: "a".repeat(64),
      response_operation_id: operationId,
      recipient_user_id: "private-recipient",
    }]);
    const response = await POST(json({ turnId, decision: "accepted", operationId }));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(teamMetadataRpc).toHaveBeenCalledWith("respond_team_conversation_turn_v3", {
      p_user_id: "verified-user",
      p_turn_id: turnId,
      p_decision: "accepted",
      p_client_operation_id: operationId,
    });
    const body = await response.json();
    expect(body).toEqual({ turn: responseTurn });
    expect(JSON.stringify(body)).not.toContain("private");
    expect(JSON.stringify(body)).not.toContain("response_operation_id");
  });

  it("rejects nonterminal decisions, missing operation ids, and payload/user injection before RPC", async () => {
    for (const body of [
      { turnId, decision: "pending", operationId },
      { turnId, decision: "accepted" },
      { turnId, decision: "accepted", operationId, content: "never" },
      { turnId, decision: "accepted", operationId, userId: "attacker" },
    ]) {
      expect((await POST(json(body))).status).toBe(400);
    }
    expect(teamMetadataRpc).not.toHaveBeenCalled();
  });

  it("fails closed when the database does not confirm the exact requested terminal response", async () => {
    for (const row of [
      [],
      [{ ...responseTurn, status: "declined" }],
      [{ ...responseTurn, id: "00000000-0000-4000-8000-000000000099" }],
      [{ ...responseTurn, direction: "outbound" }],
    ]) {
      teamMetadataRpc.mockResolvedValueOnce(row);
      const response = await POST(json({ turnId, decision: "accepted", operationId }));
      expect(response.status).toBe(409);
    }
  });

  it("fails closed without exposing malformed database metadata", async () => {
    teamMetadataRpc.mockResolvedValueOnce([{ ...responseTurn, metadata: { content: "private" } }]);
    const response = await POST(json({ turnId, decision: "accepted", operationId }));
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("private");
  });

  it("maps database errors generically", async () => {
    teamMetadataRpc.mockRejectedValueOnce(new TeamMetadataError("private response SQL detail"));
    const response = await POST(json({ turnId, decision: "accepted", operationId }));
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("private response SQL detail");
  });
});
