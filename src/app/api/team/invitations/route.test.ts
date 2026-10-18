import { beforeEach, describe, expect, it, vi } from "vitest";

const { getSupabaseAdmin, teamMetadataRpc } = vi.hoisted(() => ({ getSupabaseAdmin: vi.fn(), teamMetadataRpc: vi.fn() }));
vi.mock("@/lib/supabaseAdmin", () => ({ getSupabaseAdmin }));
vi.mock("@/lib/teamMetadata", async (importOriginal) => ({ ...await importOriginal<typeof import("@/lib/teamMetadata")>(), teamMetadataRpc }));

import { GET, POST } from "./route";
import { TeamMetadataError } from "@/lib/teamMetadata";

const invitationId = "00000000-0000-0000-0000-000000000011";
const spaceId = "00000000-0000-0000-0000-000000000012";
const safeInvitation = {
  id: invitationId,
  space_id: spaceId,
  space_name: "Shared",
  owner_alias: "alex.team",
  role: "invitee",
  status: "pending",
  created_at: "2026-10-17T00:00:00Z",
  responded_at: null,
};

const request = (body?: BodyInit) => new Request("https://x.test", {
  method: body === undefined ? "GET" : "POST",
  headers: { authorization: "Bearer good", ...(body === undefined ? {} : { "content-type": "application/json" }) },
  body,
});

describe("Team invitations API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSupabaseAdmin.mockReturnValue({ auth: { getUser: vi.fn(async (token: string) => token === "good"
      ? { data: { user: { id: "verified" } }, error: null }
      : { data: { user: null }, error: Object.assign(new Error(), { status: 401 }) }) } });
    teamMetadataRpc.mockResolvedValue([{ result: "submitted" }]);
  });

  it("rejects absent or invalid authentication before calling the RPC", async () => {
    expect((await GET(new Request("https://x.test"))).status).toBe(401);
    expect((await GET(new Request("https://x.test", { headers: { authorization: "Bearer bad" } }))).status).toBe(401);
    expect(teamMetadataRpc).not.toHaveBeenCalled();
  });

  it("uses the invitee-only v2 projection with verified identity", async () => {
    teamMetadataRpc.mockResolvedValueOnce([{ ...safeInvitation, owner_user_id: "PRIVATE", invitee_user_id: "PRIVATE", metadata: { content: "SECRET" } }]);
    const response = await GET(request());
    expect(response.status).toBe(200);
    expect(teamMetadataRpc).toHaveBeenCalledWith("list_team_invitations_v2", { p_user_id: "verified" });
    expect(await response.json()).toEqual([safeInvitation]);
  });

  it("fails closed for malformed list rows instead of serializing an unknown contract", async () => {
    teamMetadataRpc.mockResolvedValueOnce([{ ...safeInvitation, owner_alias: 42 }]);
    const response = await GET(request());
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("42");
  });

  it("fails closed for unsafe recipient-visible space names", async () => {
    for (const space_name of ["https://private.example/space", "/Users/private/space", "Equipo\nprivado"]) {
      teamMetadataRpc.mockResolvedValueOnce([{ ...safeInvitation, space_name }]);
      expect((await GET(request())).status).toBe(503);
    }
  });

  it("reports admin configuration failure as 503 rather than success or unauthorized", async () => {
    getSupabaseAdmin.mockReturnValueOnce(null);
    const response = await GET(request());
    expect(response.status).toBe(503);
    expect(teamMetadataRpc).not.toHaveBeenCalled();
  });

  it("distinguishes malformed body from backend failure without exposing backend details", async () => {
    const bad = await POST(request("{"));
    expect(bad.status).toBe(400);
    teamMetadataRpc.mockRejectedValueOnce(new TeamMetadataError("secret raw database detail"));
    const failed = await POST(request(JSON.stringify({ spaceId, alias: "x" })));
    expect(failed.status).toBe(503);
    expect(await failed.text()).not.toContain("secret raw");
  });

  it("rejects body-supplied user IDs and content-like fields instead of silently ignoring them", async () => {
    for (const body of [
      { userId: "attacker", spaceId, alias: "hidden" },
      { ownerId: "attacker", spaceId, alias: "hidden" },
      { spaceId, alias: "hidden", description: "private" },
      { spaceId, alias: "hidden", externalRef: "/private/ref" },
    ]) {
      expect((await POST(request(JSON.stringify(body)))).status).toBe(400);
    }
    expect(teamMetadataRpc).not.toHaveBeenCalled();
  });

  it("requires a canonical space UUID before invoking the invitation RPC", async () => {
    const response = await POST(request(JSON.stringify({ spaceId: "not-a-uuid", alias: "hidden" })));
    expect(response.status).toBe(400);
    expect(teamMetadataRpc).not.toHaveBeenCalled();
  });

  it("returns the generic, identity-free invitation result and requires one confirmation", async () => {
    teamMetadataRpc.mockResolvedValueOnce([{ result: "submitted", target_user_id: "PRIVATE", metadata: { secret: "SECRET" } }]);
    const response = await POST(request(JSON.stringify({ spaceId, alias: "does-not-exist" })));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([{ result: "submitted" }]);

    teamMetadataRpc.mockResolvedValueOnce([]);
    const unexpected = await POST(request(JSON.stringify({ spaceId, alias: "does-not-exist" })));
    expect(unexpected.status).toBe(503);
  });
});
