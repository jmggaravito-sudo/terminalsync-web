import { safeTeamDisplayName } from "./teamDisplayName";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type OwnedTeamSpace = {
  id: string;
  name: string;
  createdAt: string;
};

function validDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

/**
 * Keep the browser-side owned-space contract deliberately smaller than the
 * server response. In particular, never retain owner IDs, descriptions, or
 * external refs that a future RPC change might accidentally add to this
 * endpoint. A space name is a constrained display label, never content.
 */
export function parseOwnedTeamSpaces(value: unknown): OwnedTeamSpace[] {
  if (!Array.isArray(value)) return [];
  const ids = new Set<string>();
  return value.flatMap((item): OwnedTeamSpace[] => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const row = item as Record<string, unknown>;
    const name = safeTeamDisplayName(row.name);
    if (
      typeof row.id !== "string" || !UUID.test(row.id) || ids.has(row.id) ||
      !name ||
      !validDate(row.created_at)
    ) return [];
    ids.add(row.id);
    return [{
      id: row.id,
      name,
      createdAt: row.created_at,
    }];
  });
}

