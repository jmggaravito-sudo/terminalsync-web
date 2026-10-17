import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export type TeamEntitlement = {
  eligible: boolean;
  seat_limit: number;
  source: "paid" | "admin_comp" | "universal_trial" | null;
  expires_at: string | null;
};

export class TeamTrialServiceError extends Error {
  constructor(message: string) { super(message); this.name = "TeamTrialServiceError"; }
}

/** Start once for a server-verified identity. The caller must never accept a
 * user ID, start time, duration, or seat quantity from the request body. */
export async function startTeamUniversalTrial(userId: string) {
  const sb = getSupabaseAdmin();
  if (!sb) throw new TeamTrialServiceError("Team trial database is unavailable");
  const { data, error } = await sb.rpc("start_team_universal_trial", { p_user_id: userId });
  if (error) throw new TeamTrialServiceError(`Team trial start failed: ${error.message}`);
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || !["started", "already_claimed"].includes(row.result) ||
    typeof row.starts_at !== "string" || typeof row.expires_at !== "string" ||
    Date.parse(row.expires_at) - Date.parse(row.starts_at) !== 7 * 24 * 60 * 60 * 1000) {
    throw new TeamTrialServiceError("Team trial RPC returned an invalid result");
  }
  return { result: row.result as "started" | "already_claimed", startsAt: row.starts_at, expiresAt: row.expires_at };
}

export async function getTeamEntitlement(userId: string): Promise<TeamEntitlement> {
  const sb = getSupabaseAdmin();
  if (!sb) throw new TeamTrialServiceError("Team entitlement database is unavailable");
  const { data, error } = await sb.rpc("get_team_entitlement", { p_user_id: userId });
  if (error) throw new TeamTrialServiceError(`Team entitlement lookup failed: ${error.message}`);
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row.eligible !== "boolean" || !Number.isSafeInteger(row.seat_limit) || row.seat_limit < 1 ||
    ![null, "paid", "admin_comp", "universal_trial"].includes(row.source) ||
    ![null, undefined].includes(row.expires_at) && typeof row.expires_at !== "string") {
    throw new TeamTrialServiceError("Team entitlement RPC returned an invalid result");
  }
  return row as TeamEntitlement;
}
