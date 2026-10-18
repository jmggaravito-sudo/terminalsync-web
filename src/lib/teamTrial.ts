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

function singleRecord(value: unknown): Record<string, unknown> {
  if (!Array.isArray(value) || value.length !== 1) {
    throw new TeamTrialServiceError("Team trial RPC returned an invalid result");
  }
  const row = value[0];
  if (!row || typeof row !== "object" || Array.isArray(row)) {
    throw new TeamTrialServiceError("Team trial RPC returned an invalid result");
  }
  return row as Record<string, unknown>;
}

function validDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

/**
 * Rebuild the public entitlement shape instead of casting an RPC row. This is
 * used both after the database call and by the HTTP route as a final boundary.
 */
export function projectTeamEntitlement(value: unknown): TeamEntitlement {
  const row = singleRecord(value);
  const eligible = row.eligible;
  const seatLimit = row.seat_limit;
  const source = row.source;
  const expiresAt = row.expires_at;
  if (
    typeof eligible !== "boolean" || typeof seatLimit !== "number" || !Number.isSafeInteger(seatLimit) || seatLimit < 1 ||
    (source !== null && source !== "paid" && source !== "admin_comp" && source !== "universal_trial") ||
    (expiresAt !== null && !validDate(expiresAt)) ||
    (eligible && source === null) || (!eligible && source !== null)
  ) {
    throw new TeamTrialServiceError("Team entitlement RPC returned an invalid result");
  }
  return {
    eligible,
    seat_limit: seatLimit as number,
    source: source as TeamEntitlement["source"],
    expires_at: expiresAt as string | null,
  };
}

/** Start once for a server-verified identity. The caller must never accept a
 * user ID, start time, duration, or seat quantity from the request body. */
export async function startTeamUniversalTrial(userId: string) {
  const sb = getSupabaseAdmin();
  if (!sb) throw new TeamTrialServiceError("Team trial database is unavailable");
  const { data, error } = await sb.rpc("start_team_universal_trial", { p_user_id: userId });
  if (error) throw new TeamTrialServiceError(`Team trial start failed: ${error.message}`);
  const row = singleRecord(data);
  const startsAt = row.starts_at;
  const expiresAt = row.expires_at;
  if (
    (row.result !== "started" && row.result !== "already_claimed") ||
    !validDate(startsAt) || !validDate(expiresAt) ||
    Date.parse(expiresAt) - Date.parse(startsAt) !== 7 * 24 * 60 * 60 * 1000
  ) {
    throw new TeamTrialServiceError("Team trial RPC returned an invalid result");
  }
  return { result: row.result as "started" | "already_claimed", startsAt, expiresAt };
}

export async function getTeamEntitlement(userId: string): Promise<TeamEntitlement> {
  const sb = getSupabaseAdmin();
  if (!sb) throw new TeamTrialServiceError("Team entitlement database is unavailable");
  const { data, error } = await sb.rpc("get_team_entitlement", { p_user_id: userId });
  if (error) throw new TeamTrialServiceError(`Team entitlement lookup failed: ${error.message}`);
  return projectTeamEntitlement(data);
}
