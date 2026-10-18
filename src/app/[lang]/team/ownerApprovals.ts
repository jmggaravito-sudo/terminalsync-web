import { safeTeamDisplayName } from "./teamDisplayName";

export type OwnerApproval = {
  id: string;
  spaceName: string;
  kind: "document" | "context";
  status: "pending" | "accepted" | "declined";
  canRespond: boolean;
  itemCount: number | null;
  createdAt: string | null;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function safeItemCount(value: unknown): number | null | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const metadata = value as Record<string, unknown>;
  if (Object.keys(metadata).some((key) => key !== "itemCount")) return undefined;
  if (metadata.itemCount === undefined) return null;
  return typeof metadata.itemCount === "number" && Number.isInteger(metadata.itemCount) && metadata.itemCount >= 0 && metadata.itemCount <= 1_000_000
    ? metadata.itemCount
    : undefined;
}

/** Strict allow-list parser for the v2 safe projection. Never keep or render arbitrary payload fields. */
export function parseOwnerApprovals(value: unknown): OwnerApproval[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((row): OwnerApproval[] => {
    if (!row || typeof row !== "object" || Array.isArray(row)) return [];
    const r = row as Record<string, unknown>;
    const spaceName = safeTeamDisplayName(r.space_name);
    const itemCount = safeItemCount(r.metadata);
    if (typeof r.id !== "string" || !UUID.test(r.id) || !spaceName || itemCount === undefined ||
      r.role !== "owner" || typeof r.can_respond !== "boolean" ||
      !["pending", "accepted", "declined"].includes(String(r.status)) ||
      !["document", "context"].includes(String(r.request_kind))) return [];
    const createdAt = typeof r.created_at === "string" && Number.isFinite(Date.parse(r.created_at)) ? r.created_at : null;
    return [{
      id: r.id,
      spaceName,
      kind: r.request_kind as OwnerApproval["kind"],
      status: r.status as OwnerApproval["status"],
      canRespond: r.can_respond,
      itemCount,
      createdAt,
    }];
  });
}
