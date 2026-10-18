import { describe, expect, it } from "vitest";
import { parsePaidRosterOwnerView } from "./paidRosterOwnerView";

describe("paid roster owner projection", () => {
  it("copies only safe display fields and ignores an unexpected employee identifier", () => {
    const value = parsePaidRosterOwnerView({
      has_active_team: true,
      seat_limit: 3,
      assigned_count: 1,
      occupied_seats: 2,
      available_slots: 1,
      roster: [{
        member_number: 1,
        assigned_at: "2026-10-18T00:00:00.000Z",
        eligible: true,
        employee_user_id: "00000000-0000-0000-0000-000000000002",
      }],
    });

    expect(value).toEqual({
      has_active_team: true,
      seat_limit: 3,
      assigned_count: 1,
      occupied_seats: 2,
      available_slots: 1,
      roster: [{ member_number: 1, assigned_at: "2026-10-18T00:00:00.000Z", eligible: true }],
    });
    expect(JSON.stringify(value)).not.toContain("employee_user_id");
  });

  it("fails closed for malformed member records", () => {
    expect(parsePaidRosterOwnerView({ has_active_team: true, seat_limit: 2, assigned_count: 1, occupied_seats: 2, available_slots: 0, roster: [{ member_number: 0, assigned_at: "now", eligible: true }] })).toBeNull();
  });
});
