import { createHash, randomBytes } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const OPAQUE_TOKEN = /^[A-Za-z0-9_-]{43}$/;

export class TeamPaidRosterInvitationError extends Error {
  constructor() {
    super("Team paid roster invitation unavailable");
    this.name = "TeamPaidRosterInvitationError";
  }
}

type InvitationRow = { expires_at: string };
type InvitationResultRow = { result: "accepted" | "revoked" | "unavailable" };

/** A 256-bit, URL-safe bearer capability; it is never a user identifier. */
export function createOpaqueRosterInvitationToken(): string {
  return randomBytes(32).toString("base64url");
}

export function isOpaqueRosterInvitationToken(value: unknown): value is string {
  return typeof value === "string" && OPAQUE_TOKEN.test(value);
}

/** Only this irreversible digest is sent to or stored by the database. */
export function hashOpaqueRosterInvitationToken(token: string): string {
  if (!isOpaqueRosterInvitationToken(token)) throw new TeamPaidRosterInvitationError();
  return createHash("sha256").update(token, "utf8").digest("hex");
}

function service() {
  let supabase;
  try { supabase = getSupabaseAdmin(); } catch { throw new TeamPaidRosterInvitationError(); }
  if (!supabase) throw new TeamPaidRosterInvitationError();
  return supabase;
}

function single<T>(value: unknown): T | null {
  if (Array.isArray(value)) return value.length === 1 ? (value[0] ?? null) as T | null : null;
  return (value ?? null) as T | null;
}

function validDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

export async function createPaidRosterInvitation(ownerUserId: string): Promise<{ token: string; expiresAt: string }> {
  const token = createOpaqueRosterInvitationToken();
  const tokenHash = hashOpaqueRosterInvitationToken(token);
  let rpc;
  try {
    rpc = await service().rpc("create_team_paid_roster_invitation", {
      p_owner_user_id: ownerUserId,
      p_token_hash: tokenHash,
    });
  } catch { throw new TeamPaidRosterInvitationError(); }
  if (rpc.error) throw new TeamPaidRosterInvitationError();
  const row = single<InvitationRow>(rpc.data);
  if (!row || !validDate(row.expires_at)) throw new TeamPaidRosterInvitationError();
  return { token, expiresAt: row.expires_at };
}

async function respond(
  name: "accept_team_paid_roster_invitation" | "revoke_team_paid_roster_invitation",
  userArgument: "p_user_id" | "p_owner_user_id",
  userId: string,
  token: unknown,
): Promise<boolean> {
  if (!isOpaqueRosterInvitationToken(token)) return false;
  let rpc;
  try {
    rpc = await service().rpc(name, {
      [userArgument]: userId,
      p_token_hash: hashOpaqueRosterInvitationToken(token),
    });
  } catch { throw new TeamPaidRosterInvitationError(); }
  if (rpc.error) throw new TeamPaidRosterInvitationError();
  const row = single<InvitationResultRow>(rpc.data);
  const expected = name === "accept_team_paid_roster_invitation" ? "accepted" : "revoked";
  if (!row || (row.result !== "accepted" && row.result !== "revoked" && row.result !== "unavailable")) {
    throw new TeamPaidRosterInvitationError();
  }
  return row.result === expected;
}

/** Authenticated recipient consumes a valid pending token once. */
export function acceptPaidRosterInvitation(userId: string, token: unknown): Promise<boolean> {
  return respond("accept_team_paid_roster_invitation", "p_user_id", userId, token);
}

/** Authenticated owner may revoke only the token they originally created. */
export function revokePaidRosterInvitation(ownerUserId: string, token: unknown): Promise<boolean> {
  return respond("revoke_team_paid_roster_invitation", "p_owner_user_id", ownerUserId, token);
}
