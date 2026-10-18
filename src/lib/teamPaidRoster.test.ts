import { describe, expect, it, vi } from "vitest";

const { getSupabaseAdmin } = vi.hoisted(() => ({ getSupabaseAdmin: vi.fn() }));
vi.mock("@/lib/supabaseAdmin", () => ({ getSupabaseAdmin }));

import { TeamPaidRosterError, listPaidTeamRoster } from "./teamPaidRoster";

describe("paid Team roster owner view", () => {
  it("projects member records without exposing employee UUIDs", async () => {
    getSupabaseAdmin.mockReturnValue({
      rpc: vi.fn().mockResolvedValue({
        error: null,
        data: {
          has_active_team: true,
          seat_limit: 3,
          assigned_count: 2,
          occupied_seats: 3,
          available_slots: 0,
          roster: [
            { employee_user_id: "00000000-0000-0000-0000-000000000002", created_at: "2026-10-18T00:00:00.000Z", eligible: true },
            { employee_user_id: "00000000-0000-0000-0000-000000000003", created_at: "2026-10-18T00:01:00.000Z", eligible: true },
          ],
        },
      }),
    });

    const result = await listPaidTeamRoster("00000000-0000-0000-0000-000000000001");

    expect(result).toEqual({
      has_active_team: true,
      seat_limit: 3,
      assigned_count: 2,
      occupied_seats: 3,
      available_slots: 0,
      roster: [
        { member_number: 1, assigned_at: "2026-10-18T00:00:00.000Z", eligible: true },
        { member_number: 2, assigned_at: "2026-10-18T00:01:00.000Z", eligible: true },
      ],
    });
    expect(JSON.stringify(result)).not.toContain("00000000-0000-0000-0000-000000000002");
  });

  it("fails closed when the database response is malformed", async () => {
    getSupabaseAdmin.mockReturnValue({ rpc: vi.fn().mockResolvedValue({ error: null, data: { has_active_team: true } }) });
    await expect(listPaidTeamRoster("00000000-0000-0000-0000-000000000001")).rejects.toEqual(expect.any(TeamPaidRosterError));
  });
});
