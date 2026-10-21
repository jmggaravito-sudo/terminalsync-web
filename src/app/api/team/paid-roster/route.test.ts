import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { verifiedTeamUser, listPaidTeamRoster } = vi.hoisted(() => ({
  verifiedTeamUser: vi.fn(), listPaidTeamRoster: vi.fn(),
}));
vi.mock("@/lib/teamMetadata", () => ({ verifiedTeamUser }));
vi.mock("@/lib/teamPaidRoster", () => ({
  listPaidTeamRoster,
  TeamPaidRosterError: class TeamPaidRosterError extends Error {
    constructor(public code: string) { super(code); }
  },
}));
import { DELETE, GET, POST } from "./route";

const smokeUser = "00000000-0000-4000-8000-000000000001";

const req = (token = "valid") => new Request("https://example.test/api/team/paid-roster", {
  headers: token ? { authorization: `Bearer ${token}` } : {},
});

describe("paid Team roster API", () => {
  afterEach(() => vi.unstubAllEnvs());

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("TEAM_FEATURE_ENABLED", "1");
    verifiedTeamUser.mockImplementation(async (request: Request) => request.headers.get("authorization") === "Bearer valid"
      ? { id: smokeUser }
      : null);
    listPaidTeamRoster.mockResolvedValue({
      has_active_team: true,
      seat_limit: 3,
      assigned_count: 1,
      occupied_seats: 2,
      available_slots: 1,
      roster: [{ member_number: 1, assigned_at: "2026-10-18T00:00:00.000Z", eligible: true }],
    });
  });

  it("does not read the roster when the shared Team gate denies access", async () => {
    verifiedTeamUser.mockRejectedValue(new Error("Team smoke allowlist is unavailable"));
    expect((await GET(req())).status).toBe(503);
    expect(listPaidTeamRoster).not.toHaveBeenCalled();
  });

  it("returns the authenticated owner's identifier-free paid roster", async () => {
    const response = await GET(req());

    expect(response.status).toBe(200);
    expect(listPaidTeamRoster).toHaveBeenCalledWith(smokeUser);
    const body = await response.json();
    expect(body).toEqual(expect.objectContaining({ roster: [{ member_number: 1, assigned_at: "2026-10-18T00:00:00.000Z", eligible: true }] }));
    expect(JSON.stringify(body)).not.toContain("employee_user_id");
  });

  it("rejects unauthenticated reads before roster operations", async () => {
    expect((await GET(req(""))).status).toBe(401);
    expect((await GET(req("bad"))).status).toBe(401);
    expect(listPaidTeamRoster).not.toHaveBeenCalled();
  });

  it("keeps roster changes fail-closed and never reads arbitrary employee UUID input", async () => {
    const arbitraryEmployeeId = "00000000-0000-0000-0000-000000000001";
    const post = await POST(new Request("https://example.test/api/team/paid-roster", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ employeeUserId: arbitraryEmployeeId }),
    }));
    const remove = await DELETE(new Request("https://example.test/api/team/paid-roster", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ employeeUserId: arbitraryEmployeeId }),
    }));

    expect(post.status).toBe(405);
    expect(remove.status).toBe(405);
    expect(post.headers.get("allow")).toBe("GET");
    expect(await post.json()).toEqual({ error: "Team roster changes are unavailable until secure employee selection is ready" });
    expect(verifiedTeamUser).not.toHaveBeenCalled();
    expect(listPaidTeamRoster).not.toHaveBeenCalled();
  });
});
