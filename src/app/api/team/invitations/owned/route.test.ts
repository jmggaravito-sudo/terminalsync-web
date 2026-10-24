import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getSupabaseAdmin, teamMetadataRpc } = vi.hoisted(() => ({ getSupabaseAdmin: vi.fn(), teamMetadataRpc: vi.fn() }));
vi.mock("@/lib/supabaseAdmin", () => ({ getSupabaseAdmin }));
vi.mock("@/lib/teamMetadata", async (importOriginal) => ({ ...await importOriginal<typeof import("@/lib/teamMetadata")>(), teamMetadataRpc }));

import { DELETE, GET } from "./route";

const userId = "00000000-0000-4000-8000-000000000001";
const invitationId = "00000000-0000-4000-8000-000000000011";
const spaceId = "00000000-0000-4000-8000-000000000012";
const safeInvitation = {
  id: invitationId,
  space_id: spaceId,
  space_name: "Shared space",
  invitee_alias: "alex.team",
  status: "accepted",
  created_at: "2026-10-23T00:00:00Z",
  responded_at: "2026-10-23T00:01:00Z",
};

function request(method: "GET" | "DELETE", body?: unknown) {
  return new Request("https://x.test", {
    method,
    headers: { authorization: "Bearer good", ...(body === undefined ? {} : { "content-type": "application/json" }) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe("Team owner invitation revocation API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("TEAM_FEATURE_ENABLED", "1");
    vi.stubEnv("TEAM_SMOKE_ALLOWLIST_USER_IDS", "00000000-0000-4000-8000-000000000001,00000000-0000-4000-8000-000000000002");
    getSupabaseAdmin.mockReturnValue({ auth: { getUser: vi.fn(async () => ({ data: { user: { id: userId } }, error: null })) } });
    teamMetadataRpc.mockResolvedValue([safeInvitation]);
  });

  afterEach(() => vi.unstubAllEnvs());

  it("returns only the constrained owner-side metadata projection", async () => {
    teamMetadataRpc.mockResolvedValueOnce([{ ...safeInvitation, invitee_user_id: "PRIVATE", content: "SECRET" }]);
    const response = await GET(request("GET"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([safeInvitation]);
    expect(teamMetadataRpc).toHaveBeenCalledWith("list_team_owned_space_invitations_v3", { p_user_id: userId });
  });

  it("fails closed when the Team gate is off before auth or RPC", async () => {
    vi.stubEnv("TEAM_FEATURE_ENABLED", "0");
    expect((await GET(request("GET"))).status).toBe(503);
    expect((await DELETE(request("DELETE", { invitationId }))).status).toBe(503);
    expect(getSupabaseAdmin).not.toHaveBeenCalled();
    expect(teamMetadataRpc).not.toHaveBeenCalled();
  });

  it("revokes only a canonical invitation id from verified owner identity", async () => {
    teamMetadataRpc.mockResolvedValueOnce([{ result: "revoked", private: "SECRET" }]);
    const response = await DELETE(request("DELETE", { invitationId }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([{ result: "revoked" }]);
    expect(teamMetadataRpc).toHaveBeenCalledWith("revoke_team_space_invitation", { p_user_id: userId, p_invitation_id: invitationId });
  });

  it("rejects noncanonical or expanded bodies without calling the revoke RPC", async () => {
    for (const body of [{}, { invitationId: "bad" }, { invitationId, ownerId: userId }, { invitationId, content: "secret" }]) {
      expect((await DELETE(request("DELETE", body))).status).toBe(400);
    }
    expect(teamMetadataRpc).not.toHaveBeenCalled();
  });

  it("does not turn unavailable or malformed results into a revoke success", async () => {
    teamMetadataRpc.mockResolvedValueOnce([{ result: "unavailable" }]);
    expect((await DELETE(request("DELETE", { invitationId }))).status).toBe(409);
    teamMetadataRpc.mockResolvedValueOnce([{ result: "revoked", extra: "not exposed" }]);
    expect((await DELETE(request("DELETE", { invitationId }))).status).toBe(200);
  });
});
