import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
import { TeamMetadataError } from "@/lib/teamMetadata";

const threadId = "00000000-0000-4000-8000-000000000001";
const turnId = "00000000-0000-4000-8000-000000000002";
const spaceId = "00000000-0000-4000-8000-000000000003";
const relationshipId = "00000000-0000-4000-8000-000000000004";
const operationId = "00000000-0000-4000-8000-000000000005";
const auth = (url = "https://x.test/api/team/conversations") => new Request(url, {
  headers: { authorization: "Bearer ok" },
});
const json = (body: unknown) => new Request("https://x.test/api/team/conversations", {
  method: "POST",
  headers: { authorization: "Bearer ok", "content-type": "application/json" },
  body: JSON.stringify(body),
});

const turn = {
  thread_id: threadId,
  id: turnId,
  status: "pending",
  request_kind: "document",
  metadata: { itemCount: 2 },
  created_at: "2026-10-18T00:00:00.000Z",
  responded_at: null,
  direction: "outbound",
  can_respond: false,
  can_deliver: false,
};

describe("Team conversation root API", () => {
  afterEach(() => vi.unstubAllEnvs());

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("TEAM_FEATURE_ENABLED", "1");
    getSupabaseAdmin.mockReturnValue({
      auth: {
        getUser: vi.fn(async (token: string) => token === "ok"
          ? { data: { user: { id: "verified-user" } }, error: null }
          : { data: { user: null }, error: Object.assign(new Error(), { status: 401 }) }),
      },
    });
    teamMetadataRpc.mockResolvedValue([]);
  });

  it("requires verified identity before listing or creating", async () => {
    expect((await GET(new Request("https://x.test/api/team/conversations"))).status).toBe(401);
    expect((await POST(new Request("https://x.test/api/team/conversations", { method: "POST", body: "{}" }))).status).toBe(401);
    expect(teamMetadataRpc).not.toHaveBeenCalled();
  });

  it("lists cursor-paginated opaque threads through the verified identity and strips service fields", async () => {
    teamMetadataRpc.mockResolvedValueOnce([{
      thread_id: threadId,
      space_id: spaceId,
      space_name: "Alex shared workspace",
      last_activity_at: "2026-10-18T01:00:00.000Z",
      owner_user_id: "private-owner",
      participant_user_id: "private-member",
    }]);
    const response = await GET(auth(`https://x.test/api/team/conversations?limit=1`));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(teamMetadataRpc).toHaveBeenCalledWith("list_team_conversation_threads_v3", {
      p_user_id: "verified-user",
      p_limit: 1,
      p_before_activity_at: null,
      p_before_thread_id: null,
    });
    expect(await response.json()).toEqual({
      threads: [{
        thread_id: threadId,
        space_id: spaceId,
        space_name: "Alex shared workspace",
        last_activity_at: "2026-10-18T01:00:00.000Z",
      }],
      nextCursor: { beforeActivityAt: "2026-10-18T01:00:00.000Z", beforeThreadId: threadId },
    });
  });

  it("fails closed rather than projecting an unsafe shared-space display name", async () => {
    teamMetadataRpc.mockResolvedValueOnce([{
      thread_id: threadId,
      space_id: spaceId,
      space_name: "/Users/private/shared-space",
      last_activity_at: "2026-10-18T01:00:00.000Z",
    }]);
    const response = await GET(auth());
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("private");
  });

  it("rejects malformed, duplicated, partial, and unknown cursors before any RPC", async () => {
    for (const url of [
      "https://x.test/api/team/conversations?limit=0",
      "https://x.test/api/team/conversations?limit=1&limit=2",
      "https://x.test/api/team/conversations?beforeActivityAt=2026-10-18T01%3A00%3A00.000Z",
      `https://x.test/api/team/conversations?beforeThreadId=${threadId}`,
      "https://x.test/api/team/conversations?userId=attacker",
    ]) {
      const response = await GET(auth(url));
      expect(response.status, url).toBe(400);
    }
    expect(teamMetadataRpc).not.toHaveBeenCalled();
  });

  it("uses a single operation UUID and only an opaque item count for the initial turn, without leaking commitment/private fields", async () => {
    teamMetadataRpc.mockResolvedValueOnce([{
      ...turn,
      manifest_hash: "a".repeat(64),
      client_operation_id: operationId,
      initiator_user_id: "private-initiator",
      recipient_user_id: "private-recipient",
    }]);
    const response = await POST(json({
      spaceId,
      relationshipId,
      kind: "document",
      manifestHash: "a".repeat(64),
      metadata: { itemCount: 2 },
      operationId,
    }));
    expect(response.status).toBe(200);
    expect(teamMetadataRpc).toHaveBeenCalledWith("create_team_space_conversation_turn_v4", {
      p_user_id: "verified-user",
      p_space_id: spaceId,
      p_relationship_id: relationshipId,
      p_request_kind: "document",
      p_manifest_hash: "a".repeat(64),
      p_metadata: { itemCount: 2 },
      p_client_operation_id: operationId,
    });
    const body = await response.json();
    expect(body).toEqual({ turn });
    const serialized = JSON.stringify(body);
    for (const secret of ["manifest_hash", "client_operation_id", "private-initiator", "private-recipient"]) {
      expect(serialized).not.toContain(secret);
    }
  });

  it("rejects free text, URLs, paths, content, user fields, and invalid metadata before initial-turn RPC", async () => {
    const base = {
      spaceId,
      kind: "context",
      manifestHash: "a".repeat(64),
      metadata: { itemCount: 1 },
      operationId,
    };
    for (const body of [
      { ...base, content: "never deliver" },
      { ...base, userId: "attacker" },
      { ...base, operationId: undefined },
      { ...base, metadata: { label: "https://private.example/document" } },
      { ...base, metadata: { category: "/Users/private/document.pdf" } },
      { ...base, metadata: { url: "https://private.example/document" } },
      { ...base, metadata: { path: "C:\\private\\document.pdf" } },
      { ...base, metadata: { content: "never deliver this text" } },
      { ...base, metadata: { itemCount: "1" } },
      { ...base, metadata: { itemCount: 1.5 } },
      { ...base, metadata: null },
      { ...base, manifestHash: "A".repeat(64) },
    ]) {
      const response = await POST(json(body));
      expect(response.status).toBe(400);
    }
    expect(teamMetadataRpc).not.toHaveBeenCalled();
  });

  it("fails closed on empty or free-text create rows instead of claiming an unauthorized/failed turn", async () => {
    teamMetadataRpc.mockResolvedValueOnce([]);
    expect((await POST(json({ spaceId, kind: "context", manifestHash: "a".repeat(64), operationId }))).status).toBe(409);
    for (const metadata of [
      { label: "https://private.example/document" },
      { category: "/Users/private/document.pdf" },
      { url: "https://private.example/document" },
      { path: "C:\\private\\document.pdf" },
      { content: "private" },
    ]) {
      teamMetadataRpc.mockResolvedValueOnce([{ ...turn, metadata }]);
      const malformed = await POST(json({ spaceId, kind: "context", manifestHash: "a".repeat(64), operationId }));
      expect(malformed.status).toBe(503);
      expect(await malformed.text()).not.toContain("private");
    }
  });

  it("maps database/internal errors to generic responses", async () => {
    teamMetadataRpc.mockRejectedValueOnce(new TeamMetadataError("private SQL state"));
    const response = await GET(auth());
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("private SQL state");
  });
});
