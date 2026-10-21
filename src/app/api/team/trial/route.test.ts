import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { TeamMetadataError, verifiedTeamUser, startTeamUniversalTrial, getTeamEntitlement } = vi.hoisted(() => {
  class TeamMetadataError extends Error {}
  return {
    TeamMetadataError,
    verifiedTeamUser: vi.fn(),
    startTeamUniversalTrial: vi.fn(),
    getTeamEntitlement: vi.fn(),
  };
});
vi.mock("@/lib/teamMetadata", () => ({ TeamMetadataError, verifiedTeamUser }));
vi.mock("@/lib/teamTrial", () => ({ startTeamUniversalTrial, getTeamEntitlement, TeamTrialServiceError: Error }));
vi.mock("@/lib/teamFeature", () => ({ isTeamFeatureEnabled: vi.fn(() => process.env.TEAM_FEATURE_ENABLED === "1") }));

import { GET, POST } from "./route";

const smokeUser = "00000000-0000-4000-8000-000000000001";

describe("Team trial API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("TEAM_FEATURE_ENABLED", "1");
    verifiedTeamUser.mockImplementation(async (request: Request) => request.headers.get("authorization") === "Bearer valid"
      ? { id: smokeUser }
      : null);
    startTeamUniversalTrial.mockResolvedValue({ result: "started", startsAt: "2026-10-17T00:00:00Z", expiresAt: "2026-10-24T00:00:00Z" });
    getTeamEntitlement.mockResolvedValue({ eligible: true, seat_limit: 1, source: "universal_trial", expires_at: "2026-10-24T00:00:00Z" });
  });

  afterEach(() => vi.unstubAllEnvs());

  it("keeps the established Team-off behavior before any entitlement read or mutation", async () => {
    vi.stubEnv("TEAM_FEATURE_ENABLED", "0");
    const request = new Request("https://example.test/api/team/trial", { method: "POST", headers: { authorization: "Bearer valid" } });
    expect((await POST(request)).status).toBe(503);
    expect((await GET(new Request("https://example.test/api/team/trial", { headers: { authorization: "Bearer valid" } }))).status).toBe(503);
    expect(verifiedTeamUser).not.toHaveBeenCalled();
    expect(startTeamUniversalTrial).not.toHaveBeenCalled();
    expect(getTeamEntitlement).not.toHaveBeenCalled();
  });

  it("keeps trial claim and entitlement lookup closed when the shared Team gate denies access", async () => {
    verifiedTeamUser.mockRejectedValue(new TeamMetadataError("Team smoke allowlist is unavailable"));
    const request = new Request("https://example.test/api/team/trial", { method: "POST", headers: { authorization: "Bearer valid" } });
    expect((await POST(request)).status).toBe(503);
    expect((await GET(new Request("https://example.test/api/team/trial", { headers: { authorization: "Bearer valid" } }))).status).toBe(503);
    expect(startTeamUniversalTrial).not.toHaveBeenCalled();
    expect(getTeamEntitlement).not.toHaveBeenCalled();
  });

  it("derives identity from verified bearer auth and ignores attacker-supplied body fields", async () => {
    const response = await POST(new Request("https://example.test/api/team/trial", {
      method: "POST", headers: { authorization: "Bearer valid", "content-type": "application/json" },
      body: JSON.stringify({ userId: "attacker", startsAt: "2000-01-01", durationDays: 999, seatCount: 999 }),
    }));
    expect(response.status).toBe(201);
    expect(startTeamUniversalTrial).toHaveBeenCalledWith(smokeUser);
    expect(getTeamEntitlement).toHaveBeenCalledWith(smokeUser);
  });

  it("rejects absent or invalid authentication before any entitlement mutation", async () => {
    expect((await POST(new Request("https://example.test/api/team/trial", { method: "POST" }))).status).toBe(401);
    expect((await POST(new Request("https://example.test/api/team/trial", { method: "POST", headers: { authorization: "Bearer bad" } }))).status).toBe(401);
    expect(startTeamUniversalTrial).not.toHaveBeenCalled();
  });

  it("returns only the authenticated user's current entitlement", async () => {
    const response = await GET(new Request("https://example.test/api/team/trial", { headers: { authorization: "Bearer valid" } }));
    expect(response.status).toBe(200);
    expect(getTeamEntitlement).toHaveBeenCalledWith(smokeUser);
  });

  it("projects entitlement output at the HTTP boundary", async () => {
    getTeamEntitlement.mockResolvedValueOnce({
      eligible: true, seat_limit: 1, source: "universal_trial", expires_at: "2026-10-24T00:00:00Z",
      user_id: "PRIVATE", stripe_customer_id: "SECRET", metadata: { arbitrary: "SECRET" },
    });
    const response = await GET(new Request("https://example.test/api/team/trial", { headers: { authorization: "Bearer valid" } }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ eligible: true, seat_limit: 1, source: "universal_trial", expires_at: "2026-10-24T00:00:00Z" });
  });

  it("returns an existing claim without creating a second trial", async () => {
    startTeamUniversalTrial.mockResolvedValue({ result: "already_claimed", startsAt: "2026-10-01T00:00:00Z", expiresAt: "2026-10-08T00:00:00Z" });
    getTeamEntitlement.mockResolvedValue({ eligible: false, seat_limit: 1, source: null, expires_at: null });
    const response = await POST(new Request("https://example.test/api/team/trial", { method: "POST", headers: { authorization: "Bearer valid" } }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ result: "already_claimed", entitlement: { eligible: false } });
    expect(startTeamUniversalTrial).toHaveBeenCalledTimes(1);
  });
});
