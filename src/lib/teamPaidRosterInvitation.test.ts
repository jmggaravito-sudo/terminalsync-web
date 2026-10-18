import { describe, expect, it, vi, beforeEach } from "vitest";

const { getSupabaseAdmin } = vi.hoisted(() => ({ getSupabaseAdmin: vi.fn() }));
vi.mock("@/lib/supabaseAdmin", () => ({ getSupabaseAdmin }));

import {
  acceptPaidRosterInvitation,
  createOpaqueRosterInvitationToken,
  createPaidRosterInvitation,
  hashOpaqueRosterInvitationToken,
  isOpaqueRosterInvitationToken,
  revokePaidRosterInvitation,
  TeamPaidRosterInvitationError,
} from "./teamPaidRosterInvitation";

describe("opaque paid roster invitation helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSupabaseAdmin.mockReturnValue({ rpc: vi.fn() });
  });

  it("mints a 256-bit URL-safe capability and uses only its SHA-256 hash for RPCs", async () => {
    const token = createOpaqueRosterInvitationToken();
    expect(isOpaqueRosterInvitationToken(token)).toBe(true);
    expect(token).toHaveLength(43);
    expect(hashOpaqueRosterInvitationToken(token)).toMatch(/^[0-9a-f]{64}$/);
    const rpc = getSupabaseAdmin().rpc;
    rpc.mockResolvedValueOnce({ data: [{ expires_at: "2026-10-25T00:00:00.000Z" }], error: null });

    const invitation = await createPaidRosterInvitation("verified-owner");
    expect(invitation.token).toHaveLength(43);
    expect(rpc).toHaveBeenCalledWith("create_team_paid_roster_invitation", expect.objectContaining({
      p_owner_user_id: "verified-owner",
      p_token_hash: expect.stringMatching(/^[0-9a-f]{64}$/),
    }));
    expect(JSON.stringify(rpc.mock.calls)).not.toContain(invitation.token);
  });

  it("does not send malformed tokens to the database and maps only terminal success results to true", async () => {
    const rpc = getSupabaseAdmin().rpc;
    await expect(acceptPaidRosterInvitation("recipient", "not-a-token")).resolves.toBe(false);
    expect(rpc).not.toHaveBeenCalled();
    const token = createOpaqueRosterInvitationToken();
    rpc.mockResolvedValueOnce({ data: [{ result: "accepted" }], error: null });
    await expect(acceptPaidRosterInvitation("recipient", token)).resolves.toBe(true);
    expect(rpc).toHaveBeenCalledWith("accept_team_paid_roster_invitation", expect.objectContaining({ p_user_id: "recipient" }));
    rpc.mockResolvedValueOnce({ data: [{ result: "unavailable" }], error: null });
    await expect(revokePaidRosterInvitation("owner", token)).resolves.toBe(false);
  });

  it("treats malformed RPC data and database failures as unavailable", async () => {
    const rpc = getSupabaseAdmin().rpc;
    rpc.mockResolvedValueOnce({ data: [{ expires_at: 42 }], error: null });
    await expect(createPaidRosterInvitation("owner")).rejects.toEqual(expect.any(TeamPaidRosterInvitationError));
    rpc.mockResolvedValueOnce({ data: null, error: { message: "nope" } });
    await expect(acceptPaidRosterInvitation("recipient", createOpaqueRosterInvitationToken())).rejects.toEqual(expect.any(TeamPaidRosterInvitationError));
  });

  it("fails closed instead of selecting a first row from an ambiguous invitation RPC result", async () => {
    const rpc = getSupabaseAdmin().rpc;
    rpc.mockResolvedValueOnce({ data: [
      { expires_at: "2026-10-25T00:00:00.000Z" },
      { expires_at: "2026-10-26T00:00:00.000Z" },
    ], error: null });
    await expect(createPaidRosterInvitation("owner")).rejects.toEqual(expect.any(TeamPaidRosterInvitationError));

    rpc.mockResolvedValueOnce({ data: [{ result: "accepted" }, { result: "accepted" }], error: null });
    await expect(acceptPaidRosterInvitation("recipient", createOpaqueRosterInvitationToken())).rejects.toEqual(expect.any(TeamPaidRosterInvitationError));
  });
});
