import { isSafeTeamSpaceDisplayName } from "@/lib/teamSpaceDisplayName";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TEAM_ALIAS = /^[a-z0-9][a-z0-9._-]{1,28}[a-z0-9]$/;

function validDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

export type ReceivedInvitation = {
  id: string;
  space_id: string;
  space_name: string;
  owner_alias: string | null;
  role: "invitee";
  status: "pending" | "accepted";
  created_at: string;
};

export function parseReceivedInvitations(value: unknown): ReceivedInvitation[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    if (typeof row.id !== "string" || !UUID.test(row.id) ||
      typeof row.space_id !== "string" || !UUID.test(row.space_id) ||
      !isSafeTeamSpaceDisplayName(row.space_name) || row.role !== "invitee" || (row.status !== "pending" && row.status !== "accepted") ||
      !validDate(row.created_at) ||
      (row.owner_alias !== null && (typeof row.owner_alias !== "string" || !TEAM_ALIAS.test(row.owner_alias) || row.owner_alias.includes("..")))) return [];
    return [{ id: row.id, space_id: row.space_id, space_name: row.space_name,
      owner_alias: row.owner_alias, role: "invitee" as const, status: row.status, created_at: row.created_at }];
  });
}

export function partitionReceivedInvitations(invitations: ReceivedInvitation[]) {
  return {
    pending: invitations.filter((invitation) => invitation.status === "pending"),
    received: invitations.filter((invitation) => invitation.status === "accepted"),
  };
}

export function receivedSpaceLabel(invitation: ReceivedInvitation, lang: string): string {
  return invitation.owner_alias
    ? `${invitation.space_name} de ${invitation.owner_alias}`
    : lang === "es"
      ? `${invitation.space_name} · espacio compartido`
      : `${invitation.space_name} · shared space`;
}
