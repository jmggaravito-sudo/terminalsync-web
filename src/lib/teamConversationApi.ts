import { TeamMetadataError } from "@/lib/teamMetadata";
import { isSafeTeamSpaceDisplayName } from "@/lib/teamSpaceDisplayName";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SHA_256 = /^[0-9a-f]{64}$/;
const TEAM_ALIAS = /^[a-z0-9][a-z0-9._-]{1,28}[a-z0-9]$/;
const REQUEST_KINDS = new Set(["document", "context"]);
const TURN_STATUSES = new Set(["pending", "accepted", "declined"]);
const DECISIONS = new Set(["accepted", "declined"]);
const DIRECTIONS = new Set(["inbound", "outbound"]);
// Conversation turns are approval prompts, never a content-delivery channel.
// Keep this deliberately closed: kind describes the request and the only
// optional metadata is a count of opaque items.
const METADATA_KEYS = new Set(["itemCount"]);

export type SafeConversationMetadata = Partial<{
  itemCount: number;
}>;

export type SafeConversationTarget = {
  relationship_id: string;
  space_id: string;
  space_name: string;
  counterparty_alias: string | null;
};

export type SafeConversationThread = {
  thread_id: string;
  space_id: string;
  space_name: string;
  last_activity_at: string;
};

export type SafeConversationTurn = {
  thread_id: string;
  id: string;
  status: "pending" | "accepted" | "declined";
  request_kind: "document" | "context";
  metadata: SafeConversationMetadata;
  created_at: string;
  responded_at: string | null;
  direction: "inbound" | "outbound";
  can_respond: boolean;
};

export type ConversationCursor = {
  limit: number;
  beforeActivityAt: string | null;
  beforeThreadId: string | null;
};

export type ConversationTurnCursor = {
  limit: number;
  beforeCreatedAt: string | null;
  beforeTurnId: string | null;
};

export type CreateInitialConversationTurnInput = {
  spaceId: string;
  relationshipId: string | null;
  kind: "document" | "context";
  manifestHash: string;
  metadata: SafeConversationMetadata;
  operationId: string;
};

export type CreateFollowUpConversationTurnInput = Omit<CreateInitialConversationTurnInput, "spaceId" | "relationshipId">;

export type RespondConversationTurnInput = {
  turnId: string;
  decision: "accepted" | "declined";
  operationId: string;
};

/** A bad browser input is a 400. Malformed database output remains a 503. */
export class TeamConversationInputError extends Error {}

function inputError(): never {
  throw new TeamConversationInputError("Invalid Team conversation input");
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) inputError();
  return value as Record<string, unknown>;
}

function onlyKeys(value: Record<string, unknown>, allowed: ReadonlySet<string>) {
  if (Object.keys(value).some((key) => !allowed.has(key))) inputError();
}

function uuid(value: unknown): string {
  if (typeof value !== "string" || !UUID.test(value)) inputError();
  return value;
}

function operationId(value: unknown): string {
  return uuid(value);
}

function metadata(value: unknown): SafeConversationMetadata {
  const candidate = record(value);
  onlyKeys(candidate, METADATA_KEYS);
  const serialized = JSON.stringify(candidate);
  if (new TextEncoder().encode(serialized).length > 64) inputError();

  const output: SafeConversationMetadata = {};
  if (candidate.itemCount !== undefined) {
    if (
      typeof candidate.itemCount !== "number" ||
      !Number.isInteger(candidate.itemCount) ||
      candidate.itemCount < 0 ||
      candidate.itemCount > 1_000_000
    ) {
      inputError();
    }
    output.itemCount = candidate.itemCount;
  }
  return output;
}

function bodyObject(value: unknown, allowed: ReadonlySet<string>): Record<string, unknown> {
  const candidate = record(value);
  onlyKeys(candidate, allowed);
  return candidate;
}

function kind(value: unknown): "document" | "context" {
  if (typeof value !== "string" || !REQUEST_KINDS.has(value)) inputError();
  return value as "document" | "context";
}

function manifestHash(value: unknown): string {
  if (typeof value !== "string" || !SHA_256.test(value)) inputError();
  return value;
}

export function parseInitialConversationTurn(value: unknown): CreateInitialConversationTurnInput {
  const body = bodyObject(value, new Set(["spaceId", "relationshipId", "kind", "manifestHash", "metadata", "operationId"]));
  let relationshipId: string | null = null;
  if (body.relationshipId !== undefined && body.relationshipId !== null) relationshipId = uuid(body.relationshipId);
  return {
    spaceId: uuid(body.spaceId),
    relationshipId,
    kind: kind(body.kind),
    manifestHash: manifestHash(body.manifestHash),
    metadata: body.metadata === undefined ? {} : metadata(body.metadata),
    operationId: operationId(body.operationId),
  };
}

export function parseFollowUpConversationTurn(value: unknown): CreateFollowUpConversationTurnInput {
  const body = bodyObject(value, new Set(["kind", "manifestHash", "metadata", "operationId"]));
  return {
    kind: kind(body.kind),
    manifestHash: manifestHash(body.manifestHash),
    metadata: body.metadata === undefined ? {} : metadata(body.metadata),
    operationId: operationId(body.operationId),
  };
}

export function parseConversationResponse(value: unknown): RespondConversationTurnInput {
  const body = bodyObject(value, new Set(["turnId", "decision", "operationId"]));
  if (typeof body.decision !== "string" || !DECISIONS.has(body.decision)) inputError();
  return {
    turnId: uuid(body.turnId),
    decision: body.decision as "accepted" | "declined",
    operationId: operationId(body.operationId),
  };
}

function validDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function queryValue(url: URL, key: string): string | undefined {
  const values = url.searchParams.getAll(key);
  if (values.length > 1) inputError();
  return values[0];
}

function onlyQueryKeys(url: URL, allowed: ReadonlySet<string>) {
  for (const key of url.searchParams.keys()) {
    if (!allowed.has(key)) inputError();
  }
}

function parseLimit(value: string | undefined): number {
  if (value === undefined) return 50;
  if (!/^(?:[1-9]|[1-4]\d|50)$/.test(value)) inputError();
  return Number(value);
}

function cursorDate(value: string | undefined): string | null {
  if (value === undefined || !validDate(value)) {
    if (value === undefined) return null;
    inputError();
  }
  return value;
}

function cursorId(value: string | undefined): string | null {
  if (value === undefined) return null;
  return uuid(value);
}

export function parseConversationCursor(req: Request): ConversationCursor {
  const url = new URL(req.url);
  onlyQueryKeys(url, new Set(["limit", "beforeActivityAt", "beforeThreadId"]));
  const beforeActivityAt = cursorDate(queryValue(url, "beforeActivityAt"));
  const beforeThreadId = cursorId(queryValue(url, "beforeThreadId"));
  if ((beforeActivityAt === null) !== (beforeThreadId === null)) inputError();
  return { limit: parseLimit(queryValue(url, "limit")), beforeActivityAt, beforeThreadId };
}

export function parseConversationTurnCursor(req: Request): ConversationTurnCursor {
  const url = new URL(req.url);
  onlyQueryKeys(url, new Set(["limit", "beforeCreatedAt", "beforeTurnId"]));
  const beforeCreatedAt = cursorDate(queryValue(url, "beforeCreatedAt"));
  const beforeTurnId = cursorId(queryValue(url, "beforeTurnId"));
  if ((beforeCreatedAt === null) !== (beforeTurnId === null)) inputError();
  return { limit: parseLimit(queryValue(url, "limit")), beforeCreatedAt, beforeTurnId };
}

export function parseConversationThreadId(value: unknown): string {
  return uuid(value);
}

export function parseConversationTargetSpace(req: Request): string | null {
  const url = new URL(req.url);
  onlyQueryKeys(url, new Set(["spaceId"]));
  const spaceId = queryValue(url, "spaceId");
  return spaceId === undefined ? null : uuid(spaceId);
}

function safeOutputMetadata(value: unknown): SafeConversationMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TeamMetadataError("Unexpected Team conversation metadata");
  }
  const recordValue = value as Record<string, unknown>;
  if (Object.keys(recordValue).some((key) => !METADATA_KEYS.has(key))) {
    throw new TeamMetadataError("Unexpected Team conversation metadata");
  }
  const serialized = JSON.stringify(recordValue);
  if (new TextEncoder().encode(serialized).length > 64) {
    throw new TeamMetadataError("Unexpected Team conversation metadata");
  }

  const output: SafeConversationMetadata = {};
  if (recordValue.itemCount !== undefined) {
    if (
      typeof recordValue.itemCount !== "number" ||
      !Number.isInteger(recordValue.itemCount) ||
      recordValue.itemCount < 0 ||
      recordValue.itemCount > 1_000_000
    ) {
      throw new TeamMetadataError("Unexpected Team conversation metadata");
    }
    output.itemCount = recordValue.itemCount;
  }
  return output;
}

function outputUuid(value: unknown, label: string): string {
  if (typeof value !== "string" || !UUID.test(value)) {
    throw new TeamMetadataError(`Unexpected Team conversation ${label}`);
  }
  return value;
}

function outputName(value: unknown, label: string): string {
  if (!isSafeTeamSpaceDisplayName(value)) {
    throw new TeamMetadataError(`Unexpected Team conversation ${label}`);
  }
  return value;
}

export function safeConversationTargets(value: unknown, expectedSpaceId: string | null): SafeConversationTarget[] {
  if (!Array.isArray(value)) throw new TeamMetadataError("Unexpected Team conversation targets");
  const ids = new Set<string>();
  return value.map((row) => {
    if (!row || typeof row !== "object" || Array.isArray(row)) {
      throw new TeamMetadataError("Unexpected Team conversation target");
    }
    const source = row as Record<string, unknown>;
    const relationship_id = outputUuid(source.relationship_id, "target");
    const space_id = outputUuid(source.space_id, "space");
    const space_name = outputName(source.space_name, "space name");
    const counterparty_alias = source.counterparty_alias;
    if (
      ids.has(relationship_id) ||
      (expectedSpaceId !== null && space_id !== expectedSpaceId) ||
      (counterparty_alias !== null && (
        typeof counterparty_alias !== "string" ||
        !TEAM_ALIAS.test(counterparty_alias) ||
        counterparty_alias.includes("..")
      ))
    ) {
      throw new TeamMetadataError("Unexpected Team conversation target");
    }
    ids.add(relationship_id);
    return { relationship_id, space_id, space_name, counterparty_alias };
  });
}

export function safeConversationThreads(value: unknown): SafeConversationThread[] {
  if (!Array.isArray(value)) throw new TeamMetadataError("Unexpected Team conversation threads");
  const ids = new Set<string>();
  return value.map((row) => {
    if (!row || typeof row !== "object" || Array.isArray(row)) {
      throw new TeamMetadataError("Unexpected Team conversation thread");
    }
    const source = row as Record<string, unknown>;
    const thread_id = outputUuid(source.thread_id, "thread");
    const space_id = outputUuid(source.space_id, "space");
    const space_name = outputName(source.space_name, "space name");
    const last_activity_at = source.last_activity_at;
    if (ids.has(thread_id) || !validDate(last_activity_at)) {
      throw new TeamMetadataError("Unexpected Team conversation thread");
    }
    ids.add(thread_id);
    return { thread_id, space_id, space_name, last_activity_at };
  });
}

export function safeConversationTurns(value: unknown): SafeConversationTurn[] {
  if (!Array.isArray(value)) throw new TeamMetadataError("Unexpected Team conversation turns");
  const ids = new Set<string>();
  return value.map((row) => {
    if (!row || typeof row !== "object" || Array.isArray(row)) {
      throw new TeamMetadataError("Unexpected Team conversation turn");
    }
    const source = row as Record<string, unknown>;
    const thread_id = outputUuid(source.thread_id, "thread");
    const id = outputUuid(source.id, "turn");
    const status = source.status;
    const request_kind = source.request_kind;
    const created_at = source.created_at;
    const responded_at = source.responded_at;
    const direction = source.direction;
    const can_respond = source.can_respond;
    if (
      ids.has(id) ||
      typeof status !== "string" || !TURN_STATUSES.has(status) ||
      typeof request_kind !== "string" || !REQUEST_KINDS.has(request_kind) ||
      !validDate(created_at) ||
      (responded_at !== null && !validDate(responded_at)) ||
      typeof direction !== "string" || !DIRECTIONS.has(direction) ||
      typeof can_respond !== "boolean" ||
      (status === "pending" ? responded_at !== null : responded_at === null) ||
      can_respond !== (direction === "inbound" && status === "pending")
    ) {
      throw new TeamMetadataError("Unexpected Team conversation turn");
    }
    ids.add(id);
    return {
      thread_id,
      id,
      status: status as SafeConversationTurn["status"],
      request_kind: request_kind as SafeConversationTurn["request_kind"],
      metadata: safeOutputMetadata(source.metadata),
      created_at,
      responded_at,
      direction: direction as SafeConversationTurn["direction"],
      can_respond,
    };
  });
}

export function createConversationTurnConfirmation(value: unknown): SafeConversationTurn | null {
  const turns = safeConversationTurns(value);
  if (turns.length !== 1 || turns[0].direction !== "outbound" || turns[0].can_respond) return null;
  return turns[0];
}

export function respondConversationTurnConfirmation(value: unknown, expectedTurnId: string, expectedDecision: "accepted" | "declined"): SafeConversationTurn | null {
  const turns = safeConversationTurns(value);
  if (
    turns.length !== 1 ||
    turns[0].id !== expectedTurnId ||
    turns[0].status !== expectedDecision ||
    turns[0].direction !== "inbound" ||
    turns[0].can_respond
  ) {
    return null;
  }
  return turns[0];
}

export function inputFailure(error: unknown): { error: string; status: 400 } | null {
  if (error instanceof TeamConversationInputError || error instanceof SyntaxError) {
    return { error: "Invalid conversation metadata", status: 400 };
  }
  return null;
}
