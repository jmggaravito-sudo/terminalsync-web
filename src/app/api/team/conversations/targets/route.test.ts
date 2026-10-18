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

import { GET } from "./route";

const spaceId = "00000000-0000-4000-8000-000000000003";
const relationshipId = "00000000-0000-4000-8000-000000000004";
const auth = (url = "https://x.test/api/team/conversations/targets") => new Request(url, {
  headers: { authorization: "Bearer ok" },
});

describe("Team conversation target API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSupabaseAdmin.mockReturnValue({ auth: { getUser: vi.fn(async () => ({ data: { user: { id: "verified-user" } }, error: null })) } });
    teamMetadataRpc.mockResolvedValue([]);
  });

  it("returns only owner-safe opaque relationship handles", async () => {
    teamMetadataRpc.mockResolvedValueOnce([{
      relationship_id: relationshipId,
      space_id: spaceId,
      space_name: "Alex shared workspace",
      counterparty_alias: "maria.team",
      invitee_user_id: "private-user",
      invitee_email_hash: "private-hash",
    }]);
    const response = await GET(auth(`https://x.test/api/team/conversations/targets?spaceId=${spaceId}`));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(teamMetadataRpc).toHaveBeenCalledWith("list_team_conversation_targets_v3", {
      p_user_id: "verified-user",
      p_space_id: spaceId,
    });
    const body = await response.json();
    expect(body).toEqual({ targets: [{
      relationship_id: relationshipId,
      space_id: spaceId,
      space_name: "Alex shared workspace",
      counterparty_alias: "maria.team",
    }] });
    expect(JSON.stringify(body)).not.toContain("private");
  });

  it("requires auth and rejects probing-shaped malformed query input before RPC", async () => {
    expect((await GET(new Request("https://x.test/api/team/conversations/targets"))).status).toBe(401);
    for (const url of [
      "https://x.test/api/team/conversations/targets?spaceId=not-a-uuid",
      `https://x.test/api/team/conversations/targets?spaceId=${spaceId}&spaceId=${spaceId}`,
      "https://x.test/api/team/conversations/targets?userId=attacker",
    ]) {
      expect((await GET(auth(url))).status).toBe(400);
    }
    expect(teamMetadataRpc).not.toHaveBeenCalled();
  });

  it("fails closed if a selector result drifts outside the requested space or alias contract", async () => {
    teamMetadataRpc.mockResolvedValueOnce([{
      relationship_id: relationshipId,
      space_id: "00000000-0000-4000-8000-000000000099",
      space_name: "Other",
      counterparty_alias: "member",
    }]);
    expect((await GET(auth(`https://x.test/api/team/conversations/targets?spaceId=${spaceId}`))).status).toBe(503);
    teamMetadataRpc.mockResolvedValueOnce([{
      relationship_id: relationshipId,
      space_id: spaceId,
      space_name: "Alex shared workspace",
      counterparty_alias: "INVALID ALIAS",
    }]);
    expect((await GET(auth())).status).toBe(503);
    teamMetadataRpc.mockResolvedValueOnce([{
      relationship_id: relationshipId,
      space_id: spaceId,
      space_name: "https://private.example/space",
      counterparty_alias: "member",
    }]);
    expect((await GET(auth())).status).toBe(503);
  });
});
