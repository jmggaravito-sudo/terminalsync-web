import { describe, expect, it } from "vitest";
import {
  canClearResponseAttempt,
  canCommitConversationThreadLoad,
  canCommitPreparedTurn,
  metadataFromDraft,
  parseConversationTargets,
  parseConversationThreadPage,
  parseConversationThreads,
  parseConversationTurnConfirmation,
  parseConversationTurnPage,
  parseConversationTurns,
} from "./teamConversationClient";

const UUID_A = "00000000-0000-0000-0000-000000000001";
const UUID_B = "00000000-0000-0000-0000-000000000002";
const UUID_C = "00000000-0000-0000-0000-000000000003";

const validTurn = (overrides: Record<string, unknown> = {}) => ({
  thread_id: UUID_A,
  id: UUID_B,
  status: "pending",
  request_kind: "context",
  metadata: { itemCount: 2 },
  created_at: "2026-10-18T00:00:00Z",
  responded_at: null,
  direction: "inbound",
  can_respond: true,
  ...overrides,
});

describe("Team conversation browser contract", () => {
  it("rejects stale thread results before they can populate a different approval view", () => {
    expect(canCommitConversationThreadLoad(7, 7, UUID_A, UUID_A)).toBe(true);
    expect(canCommitConversationThreadLoad(8, 7, UUID_A, UUID_A)).toBe(false);
    expect(canCommitConversationThreadLoad(7, 7, UUID_B, UUID_A)).toBe(false);
    expect(canCommitConversationThreadLoad(7, 7, null, UUID_A)).toBe(false);
  });

  it("projects only the safe target and thread fields", () => {
    const targets = parseConversationTargets({ targets: [{
      relationship_id: UUID_A,
      space_id: UUID_B,
      space_name: "Espacio de Alex",
      counterparty_alias: "alex",
      invitee_user_id: "PRIVATE",
      email: "PRIVATE",
    }] });
    const threads = parseConversationThreads({ threads: [{
      thread_id: UUID_C,
      space_id: UUID_B,
      space_name: "Espacio de Alex",
      last_activity_at: "2026-10-18T00:00:00Z",
      relationship_id: "PRIVATE",
      owner_user_id: "PRIVATE",
    }] });

    expect(targets).toEqual([{ relationshipId: UUID_A, spaceId: UUID_B, spaceName: "Espacio de Alex", counterpartyAlias: "alex" }]);
    expect(threads).toEqual([{ threadId: UUID_C, spaceId: UUID_B, spaceName: "Espacio de Alex", lastActivityAt: "2026-10-18T00:00:00Z" }]);
    expect(JSON.stringify({ targets, threads })).not.toMatch(/PRIVATE/);
  });

  it("drops a turn whose approval affordance or response state is inconsistent", () => {
    expect(parseConversationTurns({ turns: [{
      ...validTurn({ metadata: { itemCount: 2, content: "must drop" } }),
    }, {
      ...validTurn({ id: UUID_C, direction: "outbound", can_respond: true }),
    }] })).toEqual([]);
  });

  it("allows only a bounded item count and rejects free-text metadata before it can reach UI", () => {
    expect(metadataFromDraft({ kind: "context", itemCount: "3" })).toEqual({ itemCount: 3 });
    expect(metadataFromDraft({ kind: "document", itemCount: "3.5" })).toBeNull();
    expect(metadataFromDraft({ kind: "document", itemCount: "1000001" })).toBeNull();

    // A server response with a link, path, title, or any other extra field is
    // discarded rather than becoming recipient-visible pending metadata.
    expect(parseConversationTurnConfirmation({ turn: validTurn({
      request_kind: "document",
      metadata: { label: "https://example.test/private", itemCount: 1 },
    }) })).toBeNull();
  });

  it("makes prepared payloads usable only for their immutable form epoch and draft revision", () => {
    expect(canCommitPreparedTurn(9, 4, 9, 4)).toBe(true);
    // Editing invalidates a prepared payload before the next render can reuse it.
    expect(canCommitPreparedTurn(9, 5, 9, 4)).toBe(false);
    // Switching target remounts a new epoch even when the draft happens to match.
    expect(canCommitPreparedTurn(10, 4, 9, 4)).toBe(false);
  });

  it("clears only the response attempt that still owns its turn lock", () => {
    expect(canClearResponseAttempt(14, 14)).toBe(true);
    expect(canClearResponseAttempt(15, 14)).toBe(false);
    expect(canClearResponseAttempt(undefined, 14)).toBe(false);
  });

  it("parses opaque conversation pages all-or-nothing instead of silently truncating them", () => {
    const threads = parseConversationThreadPage({
      threads: [{
        thread_id: UUID_C,
        space_id: UUID_B,
        space_name: "Espacio Ágil 2",
        last_activity_at: "2026-10-18T00:00:00Z",
        owner_user_id: "PRIVATE",
      }],
      nextCursor: { beforeActivityAt: "2026-10-18T00:00:00Z", beforeThreadId: UUID_C },
    });
    expect(threads).toEqual({
      threads: [{ threadId: UUID_C, spaceId: UUID_B, spaceName: "Espacio Ágil 2", lastActivityAt: "2026-10-18T00:00:00Z" }],
      nextCursor: { beforeActivityAt: "2026-10-18T00:00:00Z", beforeThreadId: UUID_C },
    });

    const turns = parseConversationTurnPage({
      turns: [validTurn()],
      nextCursor: { beforeCreatedAt: "2026-10-18T00:00:00Z", beforeTurnId: UUID_B },
    });
    expect(turns?.turns).toHaveLength(1);
    expect(turns?.nextCursor).toEqual({ beforeCreatedAt: "2026-10-18T00:00:00Z", beforeTurnId: UUID_B });

    // A missing, malformed, or partial cursor becomes an explicit UI error,
    // never an implicit claim that there are no more approval cards.
    expect(parseConversationThreadPage({ threads: [], nextCursor: { beforeThreadId: UUID_C } })).toBeNull();
    expect(parseConversationTurnPage({ turns: [validTurn()], nextCursor: { beforeCreatedAt: "not-a-date", beforeTurnId: UUID_B } })).toBeNull();
    expect(parseConversationThreadPage({ threads: [], nextCursor: null })).toEqual({ threads: [], nextCursor: null });
  });
});
