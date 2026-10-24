import { teamJson } from "@/lib/teamApiResponse";
import { TeamMetadataError, teamMetadataFailure, teamMetadataRpc, verifiedTeamUser } from "@/lib/teamMetadata";
import { isSafeTeamSpaceDisplayName } from "@/lib/teamSpaceDisplayName";

export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TEAM_ALIAS = /^[a-z0-9][a-z0-9._-]{1,28}[a-z0-9]$/;

type OwnedInvitation = {
  id: string;
  space_id: string;
  space_name: string;
  invitee_alias: string | null;
  status: "pending" | "accepted";
  created_at: string;
  responded_at: string | null;
};

function validDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function safeOwnedInvitations(value: unknown): OwnedInvitation[] {
  if (!Array.isArray(value)) throw new TeamMetadataError("Unexpected Team owned invitations result");
  const ids = new Set<string>();
  return value.map((row) => {
    if (!row || typeof row !== "object" || Array.isArray(row)) throw new TeamMetadataError("Unexpected Team owned invitation row");
    const record = row as Record<string, unknown>;
    const { id, space_id, space_name, invitee_alias, status, created_at, responded_at } = record;
    if (
      typeof id !== "string" || !UUID.test(id) || ids.has(id) ||
      typeof space_id !== "string" || !UUID.test(space_id) ||
      !isSafeTeamSpaceDisplayName(space_name) ||
      (invitee_alias !== null && (typeof invitee_alias !== "string" || !TEAM_ALIAS.test(invitee_alias) || invitee_alias.includes(".."))) ||
      (status !== "pending" && status !== "accepted") ||
      !validDate(created_at) ||
      (responded_at !== null && !validDate(responded_at)) ||
      (status === "pending" ? responded_at !== null : responded_at === null)
    ) throw new TeamMetadataError("Unexpected Team owned invitation row");
    ids.add(id);
    return { id, space_id, space_name, invitee_alias, status, created_at, responded_at };
  });
}

function revokedConfirmation(value: unknown): Array<{ result: "revoked" }> | null {
  if (!Array.isArray(value) || value.length !== 1 || !value[0] || typeof value[0] !== "object" || Array.isArray(value[0])) {
    throw new TeamMetadataError("Unexpected Team revoke response");
  }
  return (value[0] as Record<string, unknown>).result === "revoked" ? [{ result: "revoked" }] : null;
}

export async function GET(req: Request) {
  try {
    const user = await verifiedTeamUser(req);
    if (!user) return teamJson({ error: "Unauthorized" }, { status: 401 });
    const result = await teamMetadataRpc<unknown>("list_team_owned_space_invitations_v3", { p_user_id: user.id });
    return teamJson(safeOwnedInvitations(result));
  } catch (error) {
    const failure = teamMetadataFailure(error, "Could not list shared-space invitations");
    return teamJson({ error: failure.status === 503 ? "Could not list shared-space invitations" : failure.error }, { status: failure.status });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await verifiedTeamUser(req);
    if (!user) return teamJson({ error: "Unauthorized" }, { status: 401 });
    const body: unknown = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return teamJson({ error: "Invalid invitation metadata" }, { status: 400 });
    const record = body as Record<string, unknown>;
    if (Object.keys(record).some((key) => key !== "invitationId") || typeof record.invitationId !== "string" || !UUID.test(record.invitationId)) {
      return teamJson({ error: "Invalid invitation metadata" }, { status: 400 });
    }
    const result = await teamMetadataRpc<unknown>("revoke_team_space_invitation", { p_user_id: user.id, p_invitation_id: record.invitationId });
    const confirmation = revokedConfirmation(result);
    if (!confirmation) return teamJson({ error: "Invitation was not revoked" }, { status: 409 });
    return teamJson(confirmation);
  } catch (error) {
    const failure = teamMetadataFailure(error, "Could not revoke invitation");
    return teamJson({ error: failure.status === 503 ? "Could not revoke invitation" : failure.error }, { status: failure.status });
  }
}
