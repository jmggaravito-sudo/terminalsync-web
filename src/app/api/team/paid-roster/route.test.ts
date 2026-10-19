import { beforeEach, describe, expect, it, vi } from "vitest";

const { getSupabaseAdmin, listPaidTeamRoster } = vi.hoisted(() => ({
  getSupabaseAdmin: vi.fn(), listPaidTeamRoster: vi.fn(),
}));
vi.mock("@/lib/supabaseAdmin", () => ({ getSupabaseAdmin }));
vi.mock("@/lib/teamFeature", () => ({ isTeamFeatureEnabled: vi.fn(() => process.env.TEAM_FEATURE_ENABLED === "1") }));
vi.mock("@/lib/teamPaidRoster", () => ({
  listPaidTeamRoster,
  TeamPaidRosterError: class TeamPaidRosterError extends Error {
    constructor(public code: string) { super(code); }
  },
}));
import { DELETE, GET, POST } from "./route";

const req = (token = "valid") => new Request("https://example.test/api/team/paid-roster", {
  headers: token ? { authorization: `Bearer ${token}` } : {},
});

describe("paid Team roster API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("TEAM_FEATURE_ENABLED", "1");
    getSupabaseAdmin.mockReturnValue({ auth: { getUser: vi.fn(async (token: string) => token === "valid"
      ? { data: { user: { id: "verified-owner" } }, error: null }
      : { data: { user: null }, error: { status: 401 } }) } });
    listPaidTeamRoster.mockResolvedValue({
      has_active_team: true,
      seat_limit: 3,
      assigned_count: 1,
      occupied_seats: 2,
      available_slots: 1,
      roster: [{ member_number: 1, assigned_at: "2026-10-18T00:00:00.000Z", eligible: true }],
    });
  });

  it("does not authenticate or read roster when Team is disabled", async () => {
    vi.stubEnv("TEAM_FEATURE_ENABLED", "0");
    expect((await GET(req())).status).toBe(503);
    expect(getSupabaseAdmin).not.toHaveBeenCalled();
    expect(listPaidTeamRoster).not.toHaveBeenCalled();
  });

  it("returns the authenticated owner's identifier-free paid roster", async () => {
    const response = await GET(req());

    expect(response.status).toBe(200);
    expect(listPaidTeamRoster).toHaveBeenCalledWith("verified-owner");
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
    expect(getSupabaseAdmin).not.toHaveBeenCalled();
    expect(listPaidTeamRoster).not.toHaveBeenCalled();
  });
});
