import { beforeEach, describe, expect, it, vi } from "vitest";

const { getSupabaseAdmin } = vi.hoisted(() => ({ getSupabaseAdmin: vi.fn() }));
vi.mock("@/lib/supabaseAdmin", () => ({ getSupabaseAdmin }));

import { getTeamEntitlement, startTeamUniversalTrial, TeamTrialServiceError } from "./teamTrial";

describe("Team trial RPC output contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSupabaseAdmin.mockReturnValue({ rpc: vi.fn() });
  });

  it("projects entitlement rows and removes unexpected RPC fields", async () => {
    const rpc = getSupabaseAdmin().rpc;
    rpc.mockResolvedValueOnce({
      error: null,
      data: [{
        eligible: true,
        seat_limit: 1,
        source: "universal_trial",
        expires_at: "2026-10-24T00:00:00.000Z",
        user_id: "PRIVATE",
        metadata: { arbitrary: "SECRET" },
      }],
    });

    await expect(getTeamEntitlement("verified-user")).resolves.toEqual({
      eligible: true,
      seat_limit: 1,
      source: "universal_trial",
      expires_at: "2026-10-24T00:00:00.000Z",
    });
  });

  it("requires exactly one RPC row for trial starts and entitlement reads", async () => {
    const rpc = getSupabaseAdmin().rpc;
    rpc.mockResolvedValueOnce({ error: null, data: [] });
    await expect(startTeamUniversalTrial("verified-user")).rejects.toEqual(expect.any(TeamTrialServiceError));

    rpc.mockResolvedValueOnce({ error: null, data: [
      { eligible: true, seat_limit: 1, source: "universal_trial", expires_at: "2026-10-24T00:00:00.000Z" },
      { eligible: true, seat_limit: 1, source: "universal_trial", expires_at: "2026-10-24T00:00:00.000Z" },
    ] });
    await expect(getTeamEntitlement("verified-user")).rejects.toEqual(expect.any(TeamTrialServiceError));

    rpc.mockResolvedValueOnce({ error: null, data: {
      eligible: true,
      seat_limit: 1,
      source: "universal_trial",
      expires_at: "2026-10-24T00:00:00.000Z",
    } });
    await expect(getTeamEntitlement("verified-user")).rejects.toEqual(expect.any(TeamTrialServiceError));
  });

  it("rejects an entitlement snapshot above the canonical 64-seat limit", async () => {
    getSupabaseAdmin().rpc.mockResolvedValueOnce({ error: null, data: [{
      eligible: true, seat_limit: 65, source: "paid", expires_at: null,
    }] });
    await expect(getTeamEntitlement("verified-user")).rejects.toEqual(expect.any(TeamTrialServiceError));
  });

  it("requires a valid 168-hour trial result", async () => {
    const rpc = getSupabaseAdmin().rpc;
    rpc.mockResolvedValueOnce({ error: null, data: [{ result: "started", starts_at: "2026-10-17T00:00:00.000Z", expires_at: "2026-10-24T00:00:00.000Z", user_id: "PRIVATE" }] });
    await expect(startTeamUniversalTrial("verified-user")).resolves.toEqual({ result: "started", startsAt: "2026-10-17T00:00:00.000Z", expiresAt: "2026-10-24T00:00:00.000Z" });
  });
});
