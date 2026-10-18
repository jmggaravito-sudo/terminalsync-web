const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const MAX_TEAM_DELIVERY_BYTES = 64 * 1024;

export type TeamDeliveryMetadata = {
  id: string;
  turnId: string;
  createdAt: string;
  expiresAt: string;
};

export type TeamDeliveryCursor = { beforeCreatedAt: string; beforeDeliveryId: string };
export type TeamDeliveryInboxPage = { deliveries: TeamDeliveryMetadata[]; nextCursor: TeamDeliveryCursor | null };

export type TeamDeliveryReceipt = {
  id: string;
  createdAt: string;
  expiresAt: string;
};

export type TeamDeliveryContent = TeamDeliveryReceipt & { content: string };

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function exactKeys(value: Record<string, unknown>, keys: string[]): boolean {
  const actual = Object.keys(value).sort();
  return actual.length === keys.length && actual.every((key, index) => key === [...keys].sort()[index]);
}

function validDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function expiresAfter(createdAt: string, expiresAt: string): boolean {
  return Date.parse(expiresAt) > Date.parse(createdAt);
}

function safeMetadata(value: unknown): TeamDeliveryMetadata | null {
  const row = record(value);
  if (!row || !exactKeys(row, ["id", "turnId", "createdAt", "expiresAt"]) ||
    typeof row.id !== "string" || !UUID.test(row.id) ||
    typeof row.turnId !== "string" || !UUID.test(row.turnId) ||
    !validDate(row.createdAt) || !validDate(row.expiresAt) || !expiresAfter(row.createdAt, row.expiresAt)) return null;
  return { id: row.id, turnId: row.turnId, createdAt: row.createdAt, expiresAt: row.expiresAt };
}

/** Parse only the metadata projection. Any content or unexpected field fails closed. */
export function parseTeamDeliveryInbox(value: unknown): TeamDeliveryInboxPage | null {
  const root = record(value);
  if (!root || !Array.isArray(root.deliveries) || root.deliveries.length > 50 ||
    Object.keys(root).some((key) => key !== "deliveries" && key !== "nextCursor")) return null;
  let nextCursor: TeamDeliveryCursor | null = null;
  if (root.nextCursor !== null) {
    const cursor = record(root.nextCursor);
    if (!cursor || !exactKeys(cursor, ["beforeCreatedAt", "beforeDeliveryId"]) ||
      !validDate(cursor.beforeCreatedAt) || typeof cursor.beforeDeliveryId !== "string" || !UUID.test(cursor.beforeDeliveryId)) return null;
    nextCursor = { beforeCreatedAt: cursor.beforeCreatedAt, beforeDeliveryId: cursor.beforeDeliveryId };
  }
  const rows = root.deliveries.map(safeMetadata);
  if (rows.some((row) => row === null)) return null;
  const ids = new Set<string>();
  for (const row of rows as TeamDeliveryMetadata[]) {
    if (ids.has(row.id)) return null;
    ids.add(row.id);
  }
  const deliveries = rows as TeamDeliveryMetadata[];
  const last = deliveries.at(-1);
  if (nextCursor && (!last || nextCursor.beforeCreatedAt !== last.createdAt || nextCursor.beforeDeliveryId !== last.id)) return null;
  return { deliveries, nextCursor };
}

export function parseTeamDeliveryReceipt(value: unknown): TeamDeliveryReceipt | null {
  const root = record(value);
  const row = root && exactKeys(root, ["delivery"]) ? record(root.delivery) : null;
  if (!row || !exactKeys(row, ["id", "createdAt", "expiresAt"]) ||
    typeof row.id !== "string" || !UUID.test(row.id) ||
    !validDate(row.createdAt) || !validDate(row.expiresAt) || !expiresAfter(row.createdAt, row.expiresAt)) return null;
  return { id: row.id, createdAt: row.createdAt, expiresAt: row.expiresAt };
}

export function parseTeamDeliveryContent(value: unknown): TeamDeliveryContent | null {
  const root = record(value);
  const row = root && exactKeys(root, ["delivery"]) ? record(root.delivery) : null;
  if (!row || !exactKeys(row, ["id", "content", "createdAt", "expiresAt"]) ||
    typeof row.id !== "string" || !UUID.test(row.id) ||
    typeof row.content !== "string" || new TextEncoder().encode(row.content).byteLength < 1 ||
    new TextEncoder().encode(row.content).byteLength > MAX_TEAM_DELIVERY_BYTES ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(row.content) ||
    !validDate(row.createdAt) || !validDate(row.expiresAt) || !expiresAfter(row.createdAt, row.expiresAt)) return null;
  return { id: row.id, content: row.content, createdAt: row.createdAt, expiresAt: row.expiresAt };
}

export function prepareTeamDelivery(content: string, operationId: string | null) {
  if (typeof content !== "string" || content.trim().length === 0 ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(content)) return null;
  const byteLength = new TextEncoder().encode(content).byteLength;
  if (byteLength < 1 || byteLength > MAX_TEAM_DELIVERY_BYTES) return null;
  const id = operationId ?? (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : null);
  if (!id || !UUID.test(id)) return null;
  return { content, operationId: id };
}
