import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getSupabaseAdmin, teamMetadataRpc } = vi.hoisted(() => ({ getSupabaseAdmin: vi.fn(), teamMetadataRpc: vi.fn() }));
vi.mock("@/lib/supabaseAdmin", () => ({ getSupabaseAdmin }));
vi.mock("@/lib/teamMetadata", async (importOriginal) => ({ ...await importOriginal<typeof import("@/lib/teamMetadata")>(), teamMetadataRpc }));

import { POST } from "./route";

const invitationId = "00000000-0000-0000-0000-000000000011";
const respond = (body: unknown, token = "good") => POST(new Request("https://x.test", {
  method: "POST",
  headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
  body: JSON.stringify(body),
}));

describe("Team invitation response API", () => {
  afterEach(() => vi.unstubAllEnvs());

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("TEAM_FEATURE_ENABLED", "1");
    getSupabaseAdmin.mockReturnValue({ auth: { getUser: vi.fn(async (token: string) => token === "good"
      ? { data: { user: { id: "verified" } }, error: null }
      : { data: { user: null }, error: Object.assign(new Error(), { status: 401 }) }) } });
  });

  it("returns only a matching terminal result and never reflects raw RPC columns", async () => {
    teamMetadataRpc.mockResolvedValueOnce([{ result: "accepted", owner_user_id: "PRIVATE", manifest_hash: "SECRET" }]);
    const response = await respond({ invitationId, accept: true, userId: "attacker" });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([{ result: "accepted" }]);
    expect(teamMetadataRpc).toHaveBeenCalledWith("respond_team_invitation", {
      p_user_id: "verified", p_invitation_id: invitationId, p_accept: true,
    });
  });

  it("fails closed when the database cannot confirm the requested terminal state", async () => {
    for (const result of [
      [{ result: "unavailable", owner_user_id: "PRIVATE" }],
      [{ result: "declined" }],
    ]) {
      teamMetadataRpc.mockResolvedValueOnce(result);
      const response = await respond({ invitationId, accept: true });
      expect(response.status).toBe(409);
      expect(await response.json()).toEqual({ error: "Invitation was not updated" });
    }
  });

  it("rejects malformed IDs and unexpected RPC cardinality before a false success", async () => {
    const malformed = await respond({ invitationId: "not-a-uuid", accept: true });
    expect(malformed.status).toBe(400);
    expect(teamMetadataRpc).not.toHaveBeenCalled();

    teamMetadataRpc.mockResolvedValueOnce([{ result: "accepted" }, { result: "accepted" }]);
    const multiple = await respond({ invitationId, accept: true });
    expect(multiple.status).toBe(503);
  });
});
