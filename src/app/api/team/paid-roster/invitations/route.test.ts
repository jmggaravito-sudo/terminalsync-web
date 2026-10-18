import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  verifiedTeamUser,
  createPaidRosterInvitation,
  acceptPaidRosterInvitation,
  revokePaidRosterInvitation,
} = vi.hoisted(() => ({
  verifiedTeamUser: vi.fn(),
  createPaidRosterInvitation: vi.fn(),
  acceptPaidRosterInvitation: vi.fn(),
  revokePaidRosterInvitation: vi.fn(),
}));

vi.mock("@/lib/teamMetadata", () => ({
  verifiedTeamUser,
  TeamMetadataError: class TeamMetadataError extends Error {},
}));
vi.mock("@/lib/teamPaidRosterInvitation", () => ({
  createPaidRosterInvitation,
  acceptPaidRosterInvitation,
  revokePaidRosterInvitation,
  TeamPaidRosterInvitationError: class TeamPaidRosterInvitationError extends Error {},
}));

import { DELETE, POST as create } from "./route";
import { POST as accept } from "./accept/route";

const token = "a".repeat(43);
const auth = { authorization: "Bearer verified" };

describe("opaque paid Team roster invitation routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifiedTeamUser.mockResolvedValue({ id: "verified-user" });
    createPaidRosterInvitation.mockResolvedValue({ token, expiresAt: "2026-10-25T00:00:00.000Z" });
    acceptPaidRosterInvitation.mockResolvedValue(true);
    revokePaidRosterInvitation.mockResolvedValue(true);
  });

  it("creates a server-generated invitation without accepting employee identifiers", async () => {
    const arbitraryEmployeeId = "00000000-0000-0000-0000-000000000001";
    const response = await create(new Request("https://example.test/api/team/paid-roster/invitations", {
      method: "POST", headers: { ...auth, "content-type": "application/json" },
      body: JSON.stringify({ employeeUserId: arbitraryEmployeeId, userId: arbitraryEmployeeId }),
    }));

    expect(response.status).toBe(201);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(createPaidRosterInvitation).toHaveBeenCalledWith("verified-user");
    expect(createPaidRosterInvitation).not.toHaveBeenCalledWith(expect.anything(), expect.anything());
    expect(await response.json()).toEqual({ invitationToken: token, expiresAt: "2026-10-25T00:00:00.000Z" });
  });

  it("uses only the authenticated recipient or owner for acceptance and revocation", async () => {
    const arbitraryEmployeeId = "00000000-0000-0000-0000-000000000001";
    const accepted = await accept(new Request("https://example.test/api/team/paid-roster/invitations/accept", {
      method: "POST", headers: { ...auth, "content-type": "application/json" },
      body: JSON.stringify({ token, userId: arbitraryEmployeeId, employeeUserId: arbitraryEmployeeId }),
    }));
    const revoked = await DELETE(new Request("https://example.test/api/team/paid-roster/invitations", {
      method: "DELETE", headers: { ...auth, "content-type": "application/json" }, body: JSON.stringify({ token }),
    }));

    expect(accepted.status).toBe(200);
    expect(revoked.status).toBe(200);
    expect(acceptPaidRosterInvitation).toHaveBeenCalledWith("verified-user", token);
    expect(revokePaidRosterInvitation).toHaveBeenCalledWith("verified-user", token);
    expect(JSON.stringify(acceptPaidRosterInvitation.mock.calls)).not.toContain(arbitraryEmployeeId);
    expect(JSON.stringify(revokePaidRosterInvitation.mock.calls)).not.toContain(arbitraryEmployeeId);
  });

  it("fails closed for unauthenticated, malformed, exhausted, or unavailable invitations", async () => {
    verifiedTeamUser.mockResolvedValueOnce(null);
    expect((await create(new Request("https://example.test/api/team/paid-roster/invitations", { method: "POST" }))).status).toBe(401);
    expect(createPaidRosterInvitation).not.toHaveBeenCalled();

    const malformed = await accept(new Request("https://example.test/api/team/paid-roster/invitations/accept", {
      method: "POST", headers: { ...auth, "content-type": "application/json" }, body: JSON.stringify({ token: 123 }),
    }));
    expect(malformed.status).toBe(400);
    expect(acceptPaidRosterInvitation).not.toHaveBeenCalled();

    acceptPaidRosterInvitation.mockResolvedValueOnce(false);
    const exhausted = await accept(new Request("https://example.test/api/team/paid-roster/invitations/accept", {
      method: "POST", headers: { ...auth, "content-type": "application/json" }, body: JSON.stringify({ token }),
    }));
    expect(exhausted.status).toBe(404);
    expect(await exhausted.json()).toEqual({ error: "Invitation unavailable" });
  });
});
