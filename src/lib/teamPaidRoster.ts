import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { MAX_TEAM_SEATS } from "@/lib/teamSeatLimits";

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

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function singleSnapshot(value: unknown): Record<string, unknown> | null {
  const row = Array.isArray(value) ? value.length === 1 ? value[0] : null : value;
  return row && typeof row === "object" && !Array.isArray(row) ? row as Record<string, unknown> : null;
}

function isSnapshot(value: Record<string, unknown> | null): value is PaidRosterSnapshot {
  if (!value) return false;
  const hasActiveTeam = value.has_active_team;
  const seatLimit = value.seat_limit;
  const assignedCount = value.assigned_count;
  const occupiedSeats = value.occupied_seats;
  const availableSlots = value.available_slots;
  const roster = value.roster;
  return typeof hasActiveTeam === "boolean" &&
    typeof seatLimit === "number" && Number.isSafeInteger(seatLimit) && seatLimit >= 0 && seatLimit <= MAX_TEAM_SEATS &&
    typeof assignedCount === "number" && Number.isSafeInteger(assignedCount) && assignedCount >= 0 && assignedCount < MAX_TEAM_SEATS &&
    typeof occupiedSeats === "number" && Number.isSafeInteger(occupiedSeats) && occupiedSeats >= 0 && occupiedSeats <= MAX_TEAM_SEATS &&
    typeof availableSlots === "number" && Number.isSafeInteger(availableSlots) && availableSlots >= 0 && availableSlots <= MAX_TEAM_SEATS &&
    Array.isArray(roster) && roster.length <= MAX_TEAM_SEATS - 1 &&
    roster.every((row): row is PaidRosterMemberRecord => Boolean(row) && typeof row === "object" && !Array.isArray(row) &&
      typeof (row as Record<string, unknown>).employee_user_id === "string" && UUID.test((row as Record<string, unknown>).employee_user_id as string) &&
      typeof (row as Record<string, unknown>).created_at === "string" && Number.isFinite(Date.parse((row as Record<string, unknown>).created_at as string)) &&
      typeof (row as Record<string, unknown>).eligible === "boolean");
}

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
  const snapshot = singleSnapshot(result.data);
  if (!isSnapshot(snapshot)) throw new TeamPaidRosterError("unavailable");
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
