import { beforeEach, describe, expect, it, vi } from "vitest";
const { getSupabaseAdmin, teamMetadataRpc } = vi.hoisted(() => ({ getSupabaseAdmin: vi.fn(), teamMetadataRpc: vi.fn() }));
vi.mock("@/lib/supabaseAdmin", () => ({ getSupabaseAdmin }));
vi.mock("@/lib/teamMetadata", async importOriginal => ({ ...await importOriginal<typeof import("@/lib/teamMetadata")>(), teamMetadataRpc }));
import { GET, POST } from "./route";
import { POST as respond } from "./respond/route";
import { TeamMetadataError } from "@/lib/teamMetadata";
const auth = (token = "ok") => new Request("https://x.test", { headers: { authorization: `Bearer ${token}` } });
const requestId = "00000000-0000-0000-0000-000000000002";
const responseRequest = (accept: boolean) => new Request("https://x.test", {
  method: "POST",
  headers: { authorization: "Bearer ok", "content-type": "application/json" },
  body: JSON.stringify({ requestId, accept, userId: "attacker" }),
});

describe("Team metadata request routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSupabaseAdmin.mockReturnValue({ auth: { getUser: vi.fn(async (t: string) => t === "ok" ? { data: { user: { id: "verified" } }, error: null } : { data: { user: null }, error: Object.assign(new Error(), { status: 401 }) }) } });
    teamMetadataRpc.mockResolvedValue([]);
  });

  it("lists requests through the participant-safe v2 projection using verified identity", async () => {
    teamMetadataRpc.mockResolvedValueOnce([{ id: "request", space_id: "space", space_name: "Shared", role: "owner", can_respond: true, status: "pending", request_kind: "document", metadata: { label: "Annual index" }, created_at: "2026-10-17T00:00:00Z", responded_at: null }]);
    const response = await GET(auth());
    expect(response.status).toBe(200);
    expect(teamMetadataRpc).toHaveBeenCalledWith("list_team_space_requests_v2", { p_user_id: "verified" });
    expect(await response.json()).toMatchObject([{ role: "owner", can_respond: true, status: "pending" }]);
  });

  it("requires verified Bearer identity on list/create/approval", async () => {
    expect((await GET(new Request("https://x.test"))).status).toBe(401);
    expect((await POST(new Request("https://x.test", { method: "POST", body: "{}" }))).status).toBe(401);
    expect((await respond(new Request("https://x.test", { method: "POST", body: "{}" }))).status).toBe(401);
    expect(teamMetadataRpc).not.toHaveBeenCalled();
  });

  it("validates lowercase SHA-256 and bounded object metadata before RPC", async () => {
    const r = await POST(new Request("https://x.test", { method: "POST", headers: { authorization: "Bearer ok", "content-type": "application/json" }, body: JSON.stringify({ spaceId: "00000000-0000-0000-0000-000000000001", kind: "context", manifestHash: "A".repeat(64), metadata: {} }) }));
    expect(r.status).toBe(400);
    expect(teamMetadataRpc).not.toHaveBeenCalled();
  });

  it("rejects malformed UUIDs with 400 before either RPC", async () => {
    const request = await POST(new Request("https://x.test", { method: "POST", headers: { authorization: "Bearer ok", "content-type": "application/json" }, body: JSON.stringify({ spaceId: "------------------------------------", kind: "document", manifestHash: "a".repeat(64) }) }));
    const approval = await respond(new Request("https://x.test", { method: "POST", headers: { authorization: "Bearer ok", "content-type": "application/json" }, body: JSON.stringify({ requestId: "------------------------------------", accept: true }) }));
    expect(request.status).toBe(400);
    expect(approval.status).toBe(400);
    expect(teamMetadataRpc).not.toHaveBeenCalled();
  });

  it("rejects itemCount values outside nonnegative integer bounds before RPC", async () => {
    for (const itemCount of [-1, 1.5, 1000001]) {
      const r = await POST(new Request("https://x.test", { method: "POST", headers: { authorization: "Bearer ok", "content-type": "application/json" }, body: JSON.stringify({ spaceId: "00000000-0000-0000-0000-000000000001", kind: "context", manifestHash: "a".repeat(64), metadata: { itemCount } }) }));
      expect(r.status).toBe(400);
    }
    expect(teamMetadataRpc).not.toHaveBeenCalled();
  });

  it("uses only verified identity and no content fields reach RPC", async () => {
    const r = await POST(new Request("https://x.test", { method: "POST", headers: { authorization: "Bearer ok", "content-type": "application/json" }, body: JSON.stringify({ spaceId: "00000000-0000-0000-0000-000000000001", kind: "document", manifestHash: "a".repeat(64), metadata: { label: "Q1 report" }, userId: "attacker", content: "secret", ciphertext: "secret" }) }));
    expect(r.status).toBe(200);
    expect(teamMetadataRpc).toHaveBeenCalledWith("create_team_space_request", { p_user_id: "verified", p_space_id: "00000000-0000-0000-0000-000000000001", p_request_kind: "document", p_manifest_hash: "a".repeat(64), p_metadata: { label: "Q1 report" } });
  });

  it("returns only an allowlisted terminal confirmation after a matching owner response", async () => {
    teamMetadataRpc.mockResolvedValueOnce([{ id: requestId, status: "accepted", request_kind: "document", manifest_hash: "secret-manifest", metadata: { label: "Quarterly report", arbitrary: "never expose" }, responded_at: "2026-10-18T00:00:00Z" }]);
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
    teamMetadataRpc.mockResolvedValueOnce([{ id: requestId, status: "declined", manifest_hash: "secret-manifest", metadata: { label: "Quarterly report" } }]);
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
