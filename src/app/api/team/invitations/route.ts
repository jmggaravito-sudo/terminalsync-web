import { teamJson } from "@/lib/teamApiResponse";
import { TeamMetadataError, teamMetadataFailure, teamMetadataRpc, verifiedTeamUser } from "@/lib/teamMetadata";
import { isSafeTeamSpaceDisplayName } from "@/lib/teamSpaceDisplayName";

export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TEAM_ALIAS = /^[a-z0-9][a-z0-9._-]{1,28}[a-z0-9]$/;
const INVITATION_STATUSES = new Set(["pending", "accepted", "declined", "revoked"]);

type SafeInvitation = {
  id: string;
  space_id: string;
  space_name: string;
  owner_alias: string | null;
  role: "invitee";
  status: "pending" | "accepted" | "declined" | "revoked";
  created_at: string;
  responded_at: string | null;
};

function validDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

/**
 * `list_team_invitations_v2` is already a SQL projection, but the route is the
 * final browser boundary. Rebuild only its declared public fields so an RPC
 * drift cannot expose invitation/user metadata.
 */
function safeInvitations(value: unknown): SafeInvitation[] {
  if (!Array.isArray(value)) throw new TeamMetadataError("Unexpected Team invitations result");
  const ids = new Set<string>();
  return value.map((row) => {
    if (!row || typeof row !== "object" || Array.isArray(row)) {
      throw new TeamMetadataError("Unexpected Team invitation row");
    }
    const record = row as Record<string, unknown>;
    const { id, space_id, space_name, owner_alias, role, status, created_at, responded_at } = record;
    if (
      typeof id !== "string" || !UUID.test(id) || ids.has(id) ||
      typeof space_id !== "string" || !UUID.test(space_id) ||
      !isSafeTeamSpaceDisplayName(space_name) ||
      (owner_alias !== null && (typeof owner_alias !== "string" || !TEAM_ALIAS.test(owner_alias) || owner_alias.includes(".."))) ||
      role !== "invitee" || typeof status !== "string" || !INVITATION_STATUSES.has(status) ||
      !validDate(created_at) ||
      (responded_at !== null && !validDate(responded_at)) ||
      (status === "pending" ? responded_at !== null : responded_at === null)
    ) {
      throw new TeamMetadataError("Unexpected Team invitation row");
    }
    ids.add(id);
    return {
      id,
      space_id,
      space_name,
      owner_alias,
      role: "invitee",
      status: status as SafeInvitation["status"],
      created_at,
      responded_at,
    };
  });
}

function submittedInvitationConfirmation(value: unknown): Array<{ result: "submitted" }> {
  if (!Array.isArray(value) || value.length !== 1 || !value[0] || typeof value[0] !== "object" || Array.isArray(value[0]) || (value[0] as Record<string, unknown>).result !== "submitted") {
    throw new TeamMetadataError("Unexpected Team invitation result");
  }
  return [{ result: "submitted" }];
}

export async function GET(req: Request) {
  try {
    const user = await verifiedTeamUser(req);
    if (!user) return teamJson({ error: "Unauthorized" }, { status: 401 });
    const result = await teamMetadataRpc<unknown>("list_team_invitations_v2", { p_user_id: user.id });
    return teamJson(safeInvitations(result));
  } catch (error) {
    const failure = teamMetadataFailure(error, "Could not list invitations");
    return teamJson({ error: failure.status === 503 ? "Could not list invitations" : failure.error }, { status: failure.status });
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifiedTeamUser(req);
    if (!user) return teamJson({ error: "Unauthorized" }, { status: 401 });
    const body: unknown = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return teamJson({ error: "Invalid invitation metadata" }, { status: 400 });
    }
    const record = body as Record<string, unknown>;
    if (
      Object.keys(record).some((key) => key !== "spaceId" && key !== "alias") ||
      typeof record.spaceId !== "string" || !UUID.test(record.spaceId) ||
      typeof record.alias !== "string" || record.alias.length > 64
    ) {
      return teamJson({ error: "Invalid invitation metadata" }, { status: 400 });
    }
    const result = await teamMetadataRpc<unknown>("invite_team_alias", { p_user_id: user.id, p_space_id: record.spaceId, p_alias: record.alias });
    return teamJson(submittedInvitationConfirmation(result));
  } catch (error) {
    const failure = teamMetadataFailure(error, "Could not create invitation");
    return teamJson({ error: failure.status === 503 ? "Could not create invitation" : failure.error }, { status: failure.status });
  }
}
