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
    if (typeof row.id !== "string" || typeof row.space_id !== "string" ||
      typeof row.space_name !== "string" || row.role !== "invitee" || (row.status !== "pending" && row.status !== "accepted") ||
      typeof row.created_at !== "string" || (row.owner_alias !== null && typeof row.owner_alias !== "string")) return [];
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
