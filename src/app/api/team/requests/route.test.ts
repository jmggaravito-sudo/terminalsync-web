import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const { getSupabaseAdmin, teamMetadataRpc } = vi.hoisted(() => ({ getSupabaseAdmin: vi.fn(), teamMetadataRpc: vi.fn() }));
vi.mock("@/lib/supabaseAdmin", () => ({ getSupabaseAdmin }));
vi.mock("@/lib/teamMetadata", async importOriginal => ({ ...await importOriginal<typeof import("@/lib/teamMetadata")>(), teamMetadataRpc }));
import { GET, POST } from "./route";
import { POST as respond } from "./respond/route";
import { TeamMetadataError } from "@/lib/teamMetadata";
const auth = (token = "ok") => new Request("https://x.test", { headers: { authorization: `Bearer ${token}` } });
const requestId = "00000000-0000-0000-0000-000000000002";
const spaceId = "00000000-0000-0000-0000-000000000001";
const responseRequest = (accept: boolean) => new Request("https://x.test", {
  method: "POST",
  headers: { authorization: "Bearer ok", "content-type": "application/json" },
  body: JSON.stringify({ requestId, accept, userId: "attacker" }),
});
const createRequest = (body: unknown) => new Request("https://x.test", {
  method: "POST",
  headers: { authorization: "Bearer ok", "content-type": "application/json" },
  body: JSON.stringify(body),
});

describe("Team metadata request routes", () => {
  afterEach(() => vi.unstubAllEnvs());

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("TEAM_FEATURE_ENABLED", "1");
    getSupabaseAdmin.mockReturnValue({ auth: { getUser: vi.fn(async (t: string) => t === "ok" ? { data: { user: { id: "verified" } }, error: null } : { data: { user: null }, error: Object.assign(new Error(), { status: 401 }) }) } });
    teamMetadataRpc.mockResolvedValue([]);
  });

  it("lists requests through an exact count-only participant-safe v2 projection using verified identity", async () => {
    const safeRow = {
      id: requestId,
      space_id: spaceId,
      space_name: "Equipo de Álex",
      role: "owner",
      can_respond: true,
      status: "pending",
      request_kind: "document",
      metadata: { itemCount: 2 },
      created_at: "2026-10-17T00:00:00Z",
      responded_at: null,
    };
    teamMetadataRpc.mockResolvedValueOnce([{ ...safeRow, requester_user_id: "PRIVATE", owner_user_id: "PRIVATE", manifest_hash: "SECRET" }]);
    const response = await GET(auth());
    expect(response.status).toBe(200);
    expect(teamMetadataRpc).toHaveBeenCalledWith("list_team_space_requests_v2", { p_user_id: "verified" });
    expect(await response.json()).toEqual([safeRow]);
  });

  it("fails closed for free text, URL/path, content, or unsafe display names in the legacy projection", async () => {
    const base = {
      id: requestId,
      space_id: spaceId,
      space_name: "Equipo de Álex",
      role: "owner",
      can_respond: true,
      status: "pending",
      request_kind: "document",
      metadata: {},
      created_at: "2026-10-17T00:00:00Z",
      responded_at: null,
    };
    for (const row of [
      { ...base, metadata: { label: "Quarterly report" } },
      { ...base, metadata: { category: "/Users/private/file" } },
      { ...base, metadata: { url: "https://private.example" } },
      { ...base, metadata: { path: "C:\\private\\file" } },
      { ...base, metadata: { content: "never expose" } },
      { ...base, space_name: "https://private.example/space" },
    ]) {
      teamMetadataRpc.mockResolvedValueOnce([row]);
      const response = await GET(auth());
      expect(response.status).toBe(503);
      expect(await response.text()).not.toContain("private");
    }
  });

  it("requires verified Bearer identity on list/create/approval", async () => {
    expect((await GET(new Request("https://x.test"))).status).toBe(401);
    expect((await POST(new Request("https://x.test", { method: "POST", body: "{}" }))).status).toBe(401);
    expect((await respond(new Request("https://x.test", { method: "POST", body: "{}" }))).status).toBe(401);
    expect(teamMetadataRpc).not.toHaveBeenCalled();
  });

  it("validates lowercase SHA-256, count-only metadata, and exact top-level input before RPC", async () => {
    const base = { spaceId, kind: "context", manifestHash: "a".repeat(64), metadata: { itemCount: 1 } };
    const invalidBodies = [
      { ...base, manifestHash: "A".repeat(64) },
      { ...base, metadata: { label: "Annual index" } },
      { ...base, metadata: { category: "/Users/private/index" } },
      { ...base, metadata: { url: "https://private.example/index" } },
      { ...base, metadata: { path: "C:\\private\\index" } },
      { ...base, metadata: { content: "private" } },
      { ...base, metadata: { itemCount: -1 } },
      { ...base, metadata: { itemCount: 1.5 } },
      { ...base, metadata: { itemCount: 1_000_001 } },
      { ...base, metadata: null },
      { ...base, userId: "attacker" },
      { ...base, content: "private" },
      { ...base, description: "private" },
      { ...base, externalRef: "/private/ref" },
    ];
    for (const body of invalidBodies) {
      expect((await POST(createRequest(body))).status).toBe(400);
    }
    expect(teamMetadataRpc).not.toHaveBeenCalled();
  });

  it("rejects malformed UUIDs with 400 before either RPC", async () => {
    const request = await POST(createRequest({ spaceId: "------------------------------------", kind: "document", manifestHash: "a".repeat(64) }));
    const approval = await respond(new Request("https://x.test", { method: "POST", headers: { authorization: "Bearer ok", "content-type": "application/json" }, body: JSON.stringify({ requestId: "------------------------------------", accept: true }) }));
    expect(request.status).toBe(400);
    expect(approval.status).toBe(400);
    expect(teamMetadataRpc).not.toHaveBeenCalled();
  });

  it("uses only verified identity and forwards only count-only metadata", async () => {
    teamMetadataRpc.mockResolvedValueOnce([{
      id: requestId,
      status: "pending",
      request_kind: "document",
      manifest_hash: "a".repeat(64),
      metadata: { itemCount: 3 },
      requester_user_id: "00000000-0000-0000-0000-000000000099",
      created_at: "2026-10-18T00:00:00Z",
    }]);
    const r = await POST(createRequest({ spaceId, kind: "document", manifestHash: "a".repeat(64), metadata: { itemCount: 3 } }));
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ id: requestId, status: "pending" });
    expect(teamMetadataRpc).toHaveBeenCalledWith("create_team_space_request", {
      p_user_id: "verified", p_space_id: spaceId, p_request_kind: "document", p_manifest_hash: "a".repeat(64), p_metadata: { itemCount: 3 },
    });
  });

  it("does not serialize manifest hashes, metadata, or requester IDs from the create RPC", async () => {
    teamMetadataRpc.mockResolvedValueOnce([{
      id: requestId,
      status: "pending",
      manifest_hash: "b".repeat(64),
      metadata: { label: "legacy private value", arbitrary: "never expose" },
      requester_user_id: "00000000-0000-0000-0000-000000000099",
    }]);
    const response = await POST(createRequest({ spaceId, kind: "context", manifestHash: "b".repeat(64), metadata: {} }));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body).toEqual({ id: requestId, status: "pending" });
    expect(JSON.stringify(body)).not.toContain("requester_user_id");
    expect(JSON.stringify(body)).not.toContain("manifest_hash");
    expect(JSON.stringify(body)).not.toContain("legacy private value");
  });

  it("fails closed when create does not return exactly one valid confirmation", async () => {
    for (const result of [[], [{ id: requestId, status: "unexpected", manifest_hash: "private" }], [{ id: requestId, status: "pending" }, { id: requestId, status: "pending" }]]) {
      teamMetadataRpc.mockResolvedValueOnce(result);
      const response = await POST(createRequest({ spaceId, kind: "context", manifestHash: "c".repeat(64), metadata: {} }));
      expect(response.status).toBe(409);
      expect(await response.json()).toEqual({ error: "Request was not created" });
    }
  });

  it("rejects malformed create/approval JSON before either mutation RPC", async () => {
    const create = await POST(new Request("https://x.test", { method: "POST", headers: { authorization: "Bearer ok", "content-type": "application/json" }, body: "{" }));
    const approval = await respond(new Request("https://x.test", { method: "POST", headers: { authorization: "Bearer ok", "content-type": "application/json" }, body: "{" }));
    expect(create.status).toBe(400);
    expect(approval.status).toBe(400);
    expect(teamMetadataRpc).not.toHaveBeenCalled();
  });

  it("returns only an allowlisted terminal confirmation after a matching owner response", async () => {
    teamMetadataRpc.mockResolvedValueOnce([{ id: requestId, status: "accepted", request_kind: "document", manifest_hash: "secret-manifest", metadata: { itemCount: 2 }, responded_at: "2026-10-18T00:00:00Z" }]);
    const response = await respond(responseRequest(true));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id: requestId, status: "accepted" });
    expect(teamMetadataRpc).toHaveBeenCalledWith("respond_team_space_request", { p_user_id: "verified", p_request_id: requestId, p_accept: true });
  });

  it("fails closed when the approval RPC does not confirm the requested transition", async () => {
    const unexpectedResults = [
      [],
      [{ id: requestId, status: "pending" }],
      [{ id: "00000000-0000-0000-0000-000000000003", status: "accepted" }],
      [{ id: requestId, status: "accepted" }, { id: requestId, status: "accepted" }],
    ];
    for (const result of unexpectedResults) {
      teamMetadataRpc.mockResolvedValueOnce(result);
      const response = await respond(responseRequest(true));
      expect(response.status).toBe(409);
      expect(await response.json()).toEqual({ error: "Request was not updated" });
    }
  });

  it("confirms a matching decline without echoing request metadata", async () => {
    teamMetadataRpc.mockResolvedValueOnce([{ id: requestId, status: "declined", manifest_hash: "secret-manifest", metadata: { itemCount: 2 } }]);
    const response = await respond(responseRequest(false));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id: requestId, status: "declined" });
  });

  it("does not expose database errors and owner response passes verified identity", async () => {
    teamMetadataRpc.mockRejectedValueOnce(new TeamMetadataError("private SQL detail"));
    const failed = await GET(auth());
    expect(failed.status).toBe(503);
    expect(await failed.text()).not.toContain("private SQL");
    teamMetadataRpc.mockResolvedValueOnce([{ id: requestId, status: "accepted", manifest_hash: "private" }]);
    const ok = await respond(responseRequest(true));
    expect(ok.status).toBe(200);
    expect(teamMetadataRpc).toHaveBeenLastCalledWith("respond_team_space_request", { p_user_id: "verified", p_request_id: requestId, p_accept: true });
  });
});
