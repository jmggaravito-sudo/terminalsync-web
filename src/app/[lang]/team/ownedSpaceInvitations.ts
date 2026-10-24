import { isSafeTeamSpaceDisplayName } from "@/lib/teamSpaceDisplayName";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TEAM_ALIAS = /^[a-z0-9][a-z0-9._-]{1,28}[a-z0-9]$/;

export type OwnedSpaceInvitation = {
  id: string;
  spaceId: string;
  spaceName: string;
  inviteeAlias: string | null;
  status: "pending" | "accepted";
};

function validDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

/** Keep owner controls to the small metadata contract exposed by the server. */
export function parseOwnedSpaceInvitations(value: unknown): OwnedSpaceInvitation[] {
  if (!Array.isArray(value)) return [];
  const ids = new Set<string>();
  return value.flatMap((item): OwnedSpaceInvitation[] => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const row = item as Record<string, unknown>;
    if (
      typeof row.id !== "string" || !UUID.test(row.id) || ids.has(row.id) ||
      typeof row.space_id !== "string" || !UUID.test(row.space_id) ||
      !isSafeTeamSpaceDisplayName(row.space_name) ||
      (row.invitee_alias !== null && (typeof row.invitee_alias !== "string" || !TEAM_ALIAS.test(row.invitee_alias) || row.invitee_alias.includes(".."))) ||
      (row.status !== "pending" && row.status !== "accepted") ||
      !validDate(row.created_at) ||
      (row.responded_at !== null && !validDate(row.responded_at)) ||
      (row.status === "pending" ? row.responded_at !== null : row.responded_at === null)
    ) return [];
    ids.add(row.id);
    return [{
      id: row.id,
      spaceId: row.space_id,
      spaceName: row.space_name,
      inviteeAlias: row.invitee_alias,
      status: row.status,
    }];
  });
}
