import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export class TeamPaidRosterError extends Error {
  constructor(readonly code: "unavailable") {
    super(code);
    this.name = "TeamPaidRosterError";
  }
}

type PaidRosterMemberRecord = {
  employee_user_id: string;
  created_at: string;
  eligible: boolean;
};

type PaidRosterSnapshot = {
  has_active_team: boolean;
  seat_limit: number;
  assigned_count: number;
  occupied_seats: number;
  available_slots: number;
  roster: PaidRosterMemberRecord[];
};

/**
 * Safe owner-facing view. The database needs employee IDs to calculate
 * entitlement, but the browser never needs them until a separately-reviewed
 * member-resolution flow exists.
 */
export type PaidRosterOwnerView = {
  has_active_team: boolean;
  seat_limit: number;
  assigned_count: number;
  occupied_seats: number;
  available_slots: number;
  roster: Array<{ member_number: number; assigned_at: string; eligible: boolean }>;
};

function service() {
  const sb = getSupabaseAdmin();
  if (!sb) throw new TeamPaidRosterError("unavailable");
  return sb;
}

export async function listPaidTeamRoster(ownerUserId: string): Promise<PaidRosterOwnerView> {
  let result;
  try { result = await service().rpc("list_team_paid_roster", { p_owner_user_id: ownerUserId }); }
  catch { throw new TeamPaidRosterError("unavailable"); }
  if (result.error) throw new TeamPaidRosterError("unavailable");
  const value = Array.isArray(result.data) ? result.data[0] : result.data;
  if (!value || typeof value.has_active_team !== "boolean" || !Number.isSafeInteger(value.seat_limit) || value.seat_limit < 0 ||
    !Number.isSafeInteger(value.assigned_count) || !Number.isSafeInteger(value.occupied_seats) ||
    !Number.isSafeInteger(value.available_slots) || value.assigned_count < 0 || value.occupied_seats < 0 || value.available_slots < 0 || !Array.isArray(value.roster) ||
    value.roster.some((row: unknown) => !row || typeof row !== "object" ||
      typeof (row as Record<string, unknown>).employee_user_id !== "string" ||
      typeof (row as Record<string, unknown>).created_at !== "string" ||
      typeof (row as Record<string, unknown>).eligible !== "boolean")) {
    throw new TeamPaidRosterError("unavailable");
  }
  const snapshot = value as PaidRosterSnapshot;
  return {
    has_active_team: snapshot.has_active_team,
    seat_limit: snapshot.seat_limit,
    assigned_count: snapshot.assigned_count,
    occupied_seats: snapshot.occupied_seats,
    available_slots: snapshot.available_slots,
    roster: snapshot.roster.map((member, index) => ({
      member_number: index + 1,
      assigned_at: member.created_at,
      eligible: member.eligible,
    })),
  };
}
