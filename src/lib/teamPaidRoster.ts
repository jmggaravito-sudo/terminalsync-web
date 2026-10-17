import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export class TeamPaidRosterError extends Error {
  constructor(readonly code: "unavailable" | "inactive" | "capacity" | "not_found" | "invalid") {
    super(code);
    this.name = "TeamPaidRosterError";
  }
}

export type PaidRosterSnapshot = {
  has_active_team: boolean;
  seat_limit: number;
  assigned_count: number;
  occupied_seats: number;
  available_slots: number;
  roster: Array<{ employee_user_id: string; created_at: string; eligible: boolean }>;
};

function service() {
  const sb = getSupabaseAdmin();
  if (!sb) throw new TeamPaidRosterError("unavailable");
  return sb;
}

export async function listPaidTeamRoster(ownerUserId: string): Promise<PaidRosterSnapshot> {
  let result;
  try { result = await service().rpc("list_team_paid_roster", { p_owner_user_id: ownerUserId }); }
  catch { throw new TeamPaidRosterError("unavailable"); }
  if (result.error) throw new TeamPaidRosterError("unavailable");
  const value = Array.isArray(result.data) ? result.data[0] : result.data;
  if (!value || typeof value.has_active_team !== "boolean" || !Number.isSafeInteger(value.seat_limit) ||
    !Number.isSafeInteger(value.assigned_count) || !Number.isSafeInteger(value.occupied_seats) ||
    !Number.isSafeInteger(value.available_slots) || !Array.isArray(value.roster) ||
    value.roster.some((row: unknown) => !row || typeof row !== "object" ||
      typeof (row as Record<string, unknown>).employee_user_id !== "string" ||
      typeof (row as Record<string, unknown>).created_at !== "string" ||
      typeof (row as Record<string, unknown>).eligible !== "boolean")) {
    throw new TeamPaidRosterError("unavailable");
  }
  return value as PaidRosterSnapshot;
}

export async function changePaidTeamRoster(action: "assign" | "revoke", ownerUserId: string, employeeUserId: string) {
  let result;
  try {
    result = await service().rpc(action === "assign" ? "assign_team_paid_employee" : "revoke_team_paid_employee", {
      p_owner_user_id: ownerUserId, p_employee_user_id: employeeUserId,
    });
  } catch { throw new TeamPaidRosterError("unavailable"); }
  if (!result.error) {
    const outcome = result.data;
    if (action === "assign" && ["assigned", "already_assigned"].includes(outcome)) return outcome;
    if (action === "revoke" && ["revoked", "not_assigned"].includes(outcome)) return outcome;
    throw new TeamPaidRosterError("unavailable");
  }
  const code = (result.error as { code?: string }).code;
  const message = (result.error as { message?: string }).message ?? "";
  if (code === "23503") throw new TeamPaidRosterError("not_found");
  if (message.includes("paid Team seat capacity reached")) throw new TeamPaidRosterError("capacity");
  if (message.includes("active paid Team required")) throw new TeamPaidRosterError("inactive");
  if (message.includes("invalid roster member")) throw new TeamPaidRosterError("invalid");
  throw new TeamPaidRosterError("unavailable");
}
