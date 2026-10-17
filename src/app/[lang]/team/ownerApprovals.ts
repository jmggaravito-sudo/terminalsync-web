export type OwnerApproval = {
  id: string;
  spaceName: string;
  kind: "document" | "context";
  status: "pending" | "accepted" | "declined";
  canRespond: boolean;
  label: string | null;
  category: string | null;
  itemCount: number | null;
  createdAt: string | null;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const boundedText = (value: unknown): string | null =>
  typeof value === "string" && value.trim().length > 0 && value.length <= 120 ? value.trim() : null;

/** Strict allow-list parser for the v2 safe projection. Never keep or render arbitrary payload fields. */
export function parseOwnerApprovals(value: unknown): OwnerApproval[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((row): OwnerApproval[] => {
    if (!row || typeof row !== "object" || Array.isArray(row)) return [];
    const r = row as Record<string, unknown>;
    if (typeof r.id !== "string" || !UUID.test(r.id) || typeof r.space_name !== "string" || r.space_name.length > 200 ||
      r.role !== "owner" || typeof r.can_respond !== "boolean" ||
      !["pending", "accepted", "declined"].includes(String(r.status)) ||
      !["document", "context"].includes(String(r.request_kind))) return [];
    const metadata = r.metadata && typeof r.metadata === "object" && !Array.isArray(r.metadata)
      ? r.metadata as Record<string, unknown> : {};
    const createdAt = typeof r.created_at === "string" && Number.isFinite(Date.parse(r.created_at)) ? r.created_at : null;
    return [{
      id: r.id,
      spaceName: r.space_name,
      kind: r.request_kind as OwnerApproval["kind"],
      status: r.status as OwnerApproval["status"],
      canRespond: r.can_respond,
      label: boundedText(metadata.label),
      category: boundedText(metadata.category),
      itemCount: typeof metadata.itemCount === "number" && Number.isInteger(metadata.itemCount) && metadata.itemCount >= 0 && metadata.itemCount <= 1_000_000 ? metadata.itemCount : null,
      createdAt,
    }];
  });
}
