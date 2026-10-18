import { TeamMetadataError } from "@/lib/teamMetadata";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SHA256 = /^[0-9a-f]{64}$/;
export const MAX_TEAM_TEXT_BYTES = 64 * 1024;
export class TeamTextDeliveryInputError extends Error {}

function invalid(): never {
  throw new TeamTextDeliveryInputError("Invalid Team delivery request");
}

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) invalid();
  return value as Record<string, unknown>;
}

export function parseTeamTextDeliveryRequest(value: unknown) {
  const body = object(value);
  if (Object.keys(body).some((key) => key !== "content" && key !== "operationId")) invalid();
  if (typeof body.content !== "string" || body.content.length === 0) invalid();
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(body.content)) invalid();
  const contentBytes = new TextEncoder().encode(body.content).byteLength;
  if (contentBytes < 1 || contentBytes > MAX_TEAM_TEXT_BYTES) invalid();
  if (typeof body.operationId !== "string" || !UUID.test(body.operationId)) invalid();
  return { content: body.content, operationId: body.operationId };
}

export function parseTeamDeliveryId(value: unknown) {
  if (typeof value !== "string" || !UUID.test(value)) invalid();
  return value;
}

export function parseTeamDeliveryListQuery(req: Request) {
  const url = new URL(req.url);
  const allowed = new Set(["threadId", "limit", "beforeCreatedAt", "beforeDeliveryId"]);
  if ([...url.searchParams.keys()].some((key) => !allowed.has(key))) invalid();
  const one = (key: string) => {
    const values = url.searchParams.getAll(key);
    if (values.length > 1) invalid();
    return values[0];
  };
  const threadId = parseTeamDeliveryId(one("threadId"));
  const rawLimit = one("limit");
  const limit = rawLimit === undefined ? 50 : /^(?:[1-9]|[1-4]\d|50)$/.test(rawLimit) ? Number(rawLimit) : invalid();
  const rawCreatedAt = one("beforeCreatedAt");
  const beforeCreatedAt = rawCreatedAt === undefined ? null : Number.isFinite(Date.parse(rawCreatedAt)) ? rawCreatedAt : invalid();
  const rawDeliveryId = one("beforeDeliveryId");
  const beforeDeliveryId = rawDeliveryId === undefined ? null : parseTeamDeliveryId(rawDeliveryId);
  if ((beforeCreatedAt === null) !== (beforeDeliveryId === null)) invalid();
  return { threadId, limit, beforeCreatedAt, beforeDeliveryId };
}

export function safeTeamTextDeliveryReceipt(value: unknown) {
  if (!Array.isArray(value) || value.length !== 1) throw new TeamMetadataError("Unexpected Team delivery receipt");
  const row = object(value[0]);
  if (typeof row.id !== "string" || !UUID.test(row.id)
      || typeof row.recipient_user_id !== "string" || !UUID.test(row.recipient_user_id)
      || typeof row.created_at !== "string" || !Number.isFinite(Date.parse(row.created_at))
      || typeof row.expires_at !== "string" || !Number.isFinite(Date.parse(row.expires_at))) {
    throw new TeamMetadataError("Unexpected Team delivery receipt");
  }
  return { id: row.id, createdAt: row.created_at, expiresAt: row.expires_at };
}

export function safeTeamTextDelivery(value: unknown) {
  if (!Array.isArray(value) || value.length !== 1) return null;
  const row = object(value[0]);
  if (typeof row.id !== "string" || !UUID.test(row.id)
      || typeof row.content !== "string" || row.content.length === 0
      || new TextEncoder().encode(row.content).byteLength > MAX_TEAM_TEXT_BYTES
      || typeof row.created_at !== "string" || !Number.isFinite(Date.parse(row.created_at))
      || typeof row.expires_at !== "string" || !Number.isFinite(Date.parse(row.expires_at))) {
    throw new TeamMetadataError("Unexpected Team delivery");
  }
  return { id: row.id, content: row.content, createdAt: row.created_at, expiresAt: row.expires_at };
}

export function safeTeamTextDeliveryList(value: unknown) {
  if (!Array.isArray(value) || value.length > 50) throw new TeamMetadataError("Unexpected Team delivery list");
  return value.map((item) => {
    const row = object(item);
    if (typeof row.id !== "string" || !UUID.test(row.id)
        || typeof row.turn_id !== "string" || !UUID.test(row.turn_id)
        || typeof row.created_at !== "string" || !Number.isFinite(Date.parse(row.created_at))
        || typeof row.expires_at !== "string" || !Number.isFinite(Date.parse(row.expires_at))) {
      throw new TeamMetadataError("Unexpected Team delivery list");
    }
    return { id: row.id, turnId: row.turn_id, createdAt: row.created_at, expiresAt: row.expires_at };
  });
}
