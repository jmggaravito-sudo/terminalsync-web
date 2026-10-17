import { beforeEach, describe, expect, it, vi } from "vitest";

const { getSupabaseAdmin, startTeamUniversalTrial, getTeamEntitlement } = vi.hoisted(() => ({
  getSupabaseAdmin: vi.fn(),
  startTeamUniversalTrial: vi.fn(),
  getTeamEntitlement: vi.fn(),
}));
vi.mock("@/lib/supabaseAdmin", () => ({ getSupabaseAdmin }));
vi.mock("@/lib/teamTrial", () => ({ startTeamUniversalTrial, getTeamEntitlement, TeamTrialServiceError: Error }));

import { GET, POST } from "./route";

describe("Team trial API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSupabaseAdmin.mockReturnValue({ auth: { getUser: vi.fn(async (token: string) => token === "valid"
      ? { data: { user: { id: "verified-user" } }, error: null }
      : { data: { user: null }, error: new Error("invalid") }) } });
    startTeamUniversalTrial.mockResolvedValue({ result: "started", startsAt: "2026-10-17T00:00:00Z", expiresAt: "2026-10-24T00:00:00Z" });
    getTeamEntitlement.mockResolvedValue({ eligible: true, seat_limit: 1, source: "universal_trial", expires_at: "2026-10-24T00:00:00Z" });
  });

  it("derives identity from verified bearer auth and ignores attacker-supplied body fields", async () => {
    const response = await POST(new Request("https://example.test/api/team/trial", {
      method: "POST", headers: { authorization: "Bearer valid", "content-type": "application/json" },
      body: JSON.stringify({ userId: "attacker", startsAt: "2000-01-01", durationDays: 999, seatCount: 999 }),
    }));
    expect(response.status).toBe(201);
    expect(startTeamUniversalTrial).toHaveBeenCalledWith("verified-user");
    expect(getTeamEntitlement).toHaveBeenCalledWith("verified-user");
  });

  it("rejects absent or invalid authentication before any entitlement mutation", async () => {
    expect((await POST(new Request("https://example.test/api/team/trial", { method: "POST" }))).status).toBe(401);
    expect((await POST(new Request("https://example.test/api/team/trial", { method: "POST", headers: { authorization: "Bearer bad" } }))).status).toBe(401);
    expect(startTeamUniversalTrial).not.toHaveBeenCalled();
  });

  it("returns only the authenticated user's current entitlement", async () => {
    const response = await GET(new Request("https://example.test/api/team/trial", { headers: { authorization: "Bearer valid" } }));
    expect(response.status).toBe(200);
    expect(getTeamEntitlement).toHaveBeenCalledWith("verified-user");
  });
});
