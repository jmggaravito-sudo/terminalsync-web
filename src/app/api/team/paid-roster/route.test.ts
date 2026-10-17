import { beforeEach, describe, expect, it, vi } from "vitest";

const { getSupabaseAdmin, listPaidTeamRoster, changePaidTeamRoster } = vi.hoisted(() => ({
  getSupabaseAdmin: vi.fn(), listPaidTeamRoster: vi.fn(), changePaidTeamRoster: vi.fn(),
}));
vi.mock("@/lib/supabaseAdmin", () => ({ getSupabaseAdmin }));
vi.mock("@/lib/teamPaidRoster", () => ({ listPaidTeamRoster, changePaidTeamRoster, TeamPaidRosterError: class TeamPaidRosterError extends Error { constructor(public code: string) { super(code); } } }));
import { DELETE, GET, POST } from "./route";
import { TeamPaidRosterError } from "@/lib/teamPaidRoster";

const req = (method: string, token = "valid", body?: unknown) => new Request("https://example.test/api/team/paid-roster", {
  method, headers: { ...(token ? { authorization: `Bearer ${token}` } : {}), ...(body === undefined ? {} : { "content-type": "application/json" }) },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});

describe("paid Team roster API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSupabaseAdmin.mockReturnValue({ auth: { getUser: vi.fn(async (token: string) => token === "valid"
      ? { data: { user: { id: "verified-owner" } }, error: null }
      : { data: { user: null }, error: { status: 401 } }) } });
    listPaidTeamRoster.mockResolvedValue({ has_active_team: true, seat_limit: 3, assigned_count: 1, occupied_seats: 2, available_slots: 1, roster: [] });
    changePaidTeamRoster.mockResolvedValue("assigned");
  });
  it("returns the authenticated owner's paid roster", async () => {
    const response = await GET(req("GET"));
    expect(response.status).toBe(200);
    expect(listPaidTeamRoster).toHaveBeenCalledWith("verified-owner");
  });
  it("rejects unauthenticated requests before roster operations", async () => {
    expect((await GET(req("GET", ""))).status).toBe(401);
    expect((await POST(req("POST", "bad", { employeeUserId: "00000000-0000-0000-0000-000000000001" }))).status).toBe(401);
    expect(listPaidTeamRoster).not.toHaveBeenCalled();
    expect(changePaidTeamRoster).not.toHaveBeenCalled();
  });
  it("assigns only the employee UUID and derives the owner from auth", async () => {
    const response = await POST(req("POST", "valid", { employeeUserId: "00000000-0000-0000-0000-000000000001", ownerUserId: "attacker" }));
    expect(response.status).toBe(400);
    expect(changePaidTeamRoster).not.toHaveBeenCalled();
    const ok = await POST(req("POST", "valid", { employeeUserId: "00000000-0000-0000-0000-000000000001" }));
    expect(ok.status).toBe(201);
    expect(changePaidTeamRoster).toHaveBeenCalledWith("assign", "verified-owner", "00000000-0000-0000-0000-000000000001");
  });
  it("supports delete and returns generic statuses", async () => {
    expect((await DELETE(req("DELETE", "valid", { employeeUserId: "00000000-0000-0000-0000-000000000002" }))).status).toBe(200);
    changePaidTeamRoster.mockRejectedValueOnce(new TeamPaidRosterError("capacity"));
    const response = await POST(req("POST", "valid", { employeeUserId: "00000000-0000-0000-0000-000000000003" }));
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: "No paid Team seats available" });
  });
});
