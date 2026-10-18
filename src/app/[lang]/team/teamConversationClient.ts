import { isSafeTeamSpaceDisplayName } from "@/lib/teamSpaceDisplayName";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SHA_256 = /^[0-9a-f]{64}$/;
const TEAM_ALIAS = /^[a-z0-9][a-z0-9._-]{1,28}[a-z0-9]$/;

export type ConversationRequestKind = "document" | "context";
export type ConversationDecision = "accepted" | "declined";
export type ConversationStatus = "pending" | ConversationDecision;
export type ConversationDirection = "inbound" | "outbound";

/**
 * V3 UI deliberately has no free-text metadata. A request can state only a
 * kind plus an optional count; this makes a URL, path, document title, or
 * contextual body impossible to leak to the other participant pre-approval.
 */
export type ConversationMetadata = Partial<{
  itemCount: number;
}>;

export type ConversationTarget = {
  relationshipId: string;
  spaceId: string;
  spaceName: string;
  counterpartyAlias: string | null;
};

export type ConversationThread = {
  threadId: string;
  spaceId: string;
  spaceName: string;
  lastActivityAt: string;
};

/** Opaque pagination state. It is used only to make an explicit next-page request. */
export type ConversationThreadCursor = {
  beforeActivityAt: string;
  beforeThreadId: string;
};

export type ConversationTurn = {
  threadId: string;
  id: string;
  status: ConversationStatus;
  kind: ConversationRequestKind;
  metadata: ConversationMetadata;
  createdAt: string;
  respondedAt: string | null;
  direction: ConversationDirection;
  canRespond: boolean;
};

/** Opaque pagination state. It is never rendered, persisted, or put in a link. */
export type ConversationTurnCursor = {
  beforeCreatedAt: string;
  beforeTurnId: string;
};

export type ConversationThreadPage = {
  threads: ConversationThread[];
  nextCursor: ConversationThreadCursor | null;
};

export type ConversationTurnPage = {
  turns: ConversationTurn[];
  nextCursor: ConversationTurnCursor | null;
};

export type ConversationDraft = {
  kind: ConversationRequestKind;
  itemCount: string;
};

export type PreparedConversationTurn = {
  kind: ConversationRequestKind;
  metadata: ConversationMetadata;
  manifestHash: string;
  operationId: string;
};

function object(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function validDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function safeMetadata(value: unknown): ConversationMetadata | null {
  const source = object(value);
  if (!source || Object.keys(source).some((key) => key !== "itemCount")) return null;
  // Keep the browser mirror in lock-step with the server's deliberately tiny
  // metadata envelope. This is a count-only protocol, not a content channel.
  if (new TextEncoder().encode(JSON.stringify(source)).length > 64) return null;
  const metadata: ConversationMetadata = {};
  if (source.itemCount !== undefined) {
    if (typeof source.itemCount !== "number" || !Number.isInteger(source.itemCount) || source.itemCount < 0 || source.itemCount > 1_000_000) return null;
    metadata.itemCount = source.itemCount;
  }
  return metadata;
}

function safeTurn(value: unknown): ConversationTurn | null {
  const source = object(value);
  if (!source) return null;
  const metadata = safeMetadata(source.metadata);
  if (
    typeof source.thread_id !== "string" || !UUID.test(source.thread_id) ||
    typeof source.id !== "string" || !UUID.test(source.id) ||
    !["pending", "accepted", "declined"].includes(String(source.status)) ||
    !["document", "context"].includes(String(source.request_kind)) ||
    !validDate(source.created_at) ||
    (source.responded_at !== null && !validDate(source.responded_at)) ||
    !["inbound", "outbound"].includes(String(source.direction)) ||
    typeof source.can_respond !== "boolean" ||
    (source.status === "pending" ? source.responded_at !== null : source.responded_at === null) ||
    !metadata ||
    source.can_respond !== (source.direction === "inbound" && source.status === "pending")
  ) return null;
  return {
    threadId: source.thread_id,
    id: source.id,
    status: source.status as ConversationStatus,
    kind: source.request_kind as ConversationRequestKind,
    metadata,
    createdAt: source.created_at,
    respondedAt: source.responded_at as string | null,
    direction: source.direction as ConversationDirection,
    canRespond: source.can_respond,
  };
}

function unique<T>(rows: T[], getId: (item: T) => string): T[] {
  const ids = new Set<string>();
  return rows.filter((row) => {
    const id = getId(row);
    if (ids.has(id)) return false;
    ids.add(id);
    return true;
  });
}

/** Never retain unrecognised service fields when parsing a v3 browser response. */
export function parseConversationTargets(value: unknown): ConversationTarget[] {
  const root = object(value);
  if (!root || !Array.isArray(root.targets)) return [];
  const rows = root.targets.flatMap((value): ConversationTarget[] => {
    const source = object(value);
    if (!source) return [];
    const spaceName = isSafeTeamSpaceDisplayName(source.space_name) ? source.space_name : null;
    if (
      typeof source.relationship_id !== "string" || !UUID.test(source.relationship_id) ||
      typeof source.space_id !== "string" || !UUID.test(source.space_id) ||
      !spaceName ||
      (source.counterparty_alias !== null && (typeof source.counterparty_alias !== "string" || !TEAM_ALIAS.test(source.counterparty_alias) || source.counterparty_alias.includes("..")))
    ) return [];
    return [{
      relationshipId: source.relationship_id,
      spaceId: source.space_id,
      spaceName,
      counterpartyAlias: source.counterparty_alias as string | null,
    }];
  });
  return unique(rows, (row) => row.relationshipId);
}

export function parseConversationThreads(value: unknown): ConversationThread[] {
  const root = object(value);
  if (!root || !Array.isArray(root.threads)) return [];
  const rows = root.threads.flatMap((value): ConversationThread[] => {
    const source = object(value);
    const spaceName = source && isSafeTeamSpaceDisplayName(source.space_name) ? source.space_name : null;
    if (!source || typeof source.thread_id !== "string" || !UUID.test(source.thread_id) ||
      typeof source.space_id !== "string" || !UUID.test(source.space_id) || !spaceName || !validDate(source.last_activity_at)) return [];
    return [{
      threadId: source.thread_id,
      spaceId: source.space_id,
      spaceName,
      lastActivityAt: source.last_activity_at,
    }];
  });
  return unique(rows, (row) => row.threadId);
}

export function parseConversationTurns(value: unknown): ConversationTurn[] {
  const root = object(value);
  if (!root || !Array.isArray(root.turns)) return [];
  return unique(root.turns.flatMap((row): ConversationTurn[] => {
    const turn = safeTurn(row);
    return turn ? [turn] : [];
  }), (turn) => turn.id);
}

function parseConversationThreadCursor(value: unknown): ConversationThreadCursor | null | undefined {
  if (value === null) return null;
  const source = object(value);
  if (!source || Object.keys(source).length !== 2 ||
    !validDate(source.beforeActivityAt) ||
    typeof source.beforeThreadId !== "string" || !UUID.test(source.beforeThreadId)) return undefined;
  return { beforeActivityAt: source.beforeActivityAt, beforeThreadId: source.beforeThreadId };
}

function parseConversationTurnCursor(value: unknown): ConversationTurnCursor | null | undefined {
  if (value === null) return null;
  const source = object(value);
  if (!source || Object.keys(source).length !== 2 ||
    !validDate(source.beforeCreatedAt) ||
    typeof source.beforeTurnId !== "string" || !UUID.test(source.beforeTurnId)) return undefined;
  return { beforeCreatedAt: source.beforeCreatedAt, beforeTurnId: source.beforeTurnId };
}

/**
 * A page is all-or-nothing: a missing/malformed cursor is surfaced as an
 * error instead of silently hiding older approval cards. Unknown row fields
 * are still discarded by the narrow browser projection below.
 */
export function parseConversationThreadPage(value: unknown): ConversationThreadPage | null {
  const root = object(value);
  if (!root || !Array.isArray(root.threads) || !("nextCursor" in root)) return null;
  const threads = parseConversationThreads(root);
  const nextCursor = parseConversationThreadCursor(root.nextCursor);
  if (nextCursor === undefined || threads.length !== root.threads.length) return null;
  if (nextCursor === null) return { threads, nextCursor };
  const last = threads.at(-1);
  // The cursor is opaque to the user but must be coupled to the last rendered
  // row; otherwise a syntactically valid stale cursor could skip or loop cards.
  if (!last || nextCursor.beforeActivityAt !== last.lastActivityAt || nextCursor.beforeThreadId !== last.threadId) return null;
  return { threads, nextCursor };
}

/** See parseConversationThreadPage: page parsing must not silently truncate. */
export function parseConversationTurnPage(value: unknown): ConversationTurnPage | null {
  const root = object(value);
  if (!root || !Array.isArray(root.turns) || !("nextCursor" in root)) return null;
  const turns = parseConversationTurns(root);
  const nextCursor = parseConversationTurnCursor(root.nextCursor);
  if (nextCursor === undefined || turns.length !== root.turns.length) return null;
  if (nextCursor === null) return { turns, nextCursor };
  const last = turns.at(-1);
  if (!last || nextCursor.beforeCreatedAt !== last.createdAt || nextCursor.beforeTurnId !== last.id) return null;
  return { turns, nextCursor };
}

export function parseConversationTurnConfirmation(value: unknown): ConversationTurn | null {
  const root = object(value);
  return root ? safeTurn(root.turn) : null;
}

export function metadataFromDraft(draft: ConversationDraft): ConversationMetadata | null {
  const metadata: ConversationMetadata = {};
  const count = draft.itemCount.trim();
  if (count) {
    if (!/^(?:0|[1-9]\d{0,6})$/.test(count)) return null;
    const value = Number(count);
    if (value > 1_000_000) return null;
    metadata.itemCount = value;
  }
  return metadata;
}

function canonicalMetadata(kind: ConversationRequestKind, metadata: ConversationMetadata): string {
  // The hash commits only to the optional count. It cannot carry document
  // bytes, context text, a URL, a path, an attachment, or a hidden payload.
  return JSON.stringify({
    schema: "team-conversation-v3-metadata-only",
    kind,
    metadata: {
      ...(metadata.itemCount === undefined ? {} : { itemCount: metadata.itemCount }),
    },
  });
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Builds an ephemeral, metadata-only request payload at the exact click that
 * submits a form. Neither the digest nor operation ID is rendered or stored.
 */
export async function prepareConversationTurn(draft: ConversationDraft): Promise<PreparedConversationTurn> {
  const metadata = metadataFromDraft(draft);
  if (!metadata || typeof crypto === "undefined" || !crypto.subtle || typeof crypto.randomUUID !== "function") {
    throw new Error("Could not prepare conversation metadata");
  }
  const manifestHash = toHex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonicalMetadata(draft.kind, metadata))));
  if (!SHA_256.test(manifestHash)) throw new Error("Could not prepare conversation metadata");
  return { kind: draft.kind, metadata, manifestHash, operationId: createConversationOperationId() };
}

/** Generates a transient idempotency key. Callers retain it only in React state for a same-payload retry. */
export function createConversationOperationId(): string {
  if (typeof crypto === "undefined" || typeof crypto.randomUUID !== "function") {
    throw new Error("Could not prepare conversation metadata");
  }
  return crypto.randomUUID();
}

/**
 * A pure freshness check used before an async thread request is allowed to
 * commit UI state. Both the request sequence and the selected opaque thread
 * must still match; either mismatch fails closed.
 */
export function canCommitConversationThreadLoad(
  currentSequence: number,
  requestSequence: number,
  selectedThreadId: string | null,
  requestThreadId: string,
): boolean {
  return currentSequence === requestSequence && selectedThreadId === requestThreadId;
}

/**
 * Prepared idempotency data is usable only for the exact target/form epoch and
 * exact draft revision that created it. Any edit or target switch fails closed.
 */
export function canCommitPreparedTurn(
  currentFormEpoch: number,
  currentDraftRevision: number,
  attemptFormEpoch: number,
  attemptDraftRevision: number,
): boolean {
  return currentFormEpoch === attemptFormEpoch && currentDraftRevision === attemptDraftRevision;
}

/** A late cleanup may release only the response attempt that still owns a turn. */
export function canClearResponseAttempt(currentAttempt: number | undefined, attempt: number): boolean {
  return currentAttempt === attempt;
}

