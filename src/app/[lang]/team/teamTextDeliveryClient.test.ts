import { describe, expect, it } from "vitest";
import {
  MAX_TEAM_DELIVERY_BYTES,
  parseTeamDeliveryContent,
  parseTeamDeliveryInbox,
  parseTeamDeliveryReceipt,
  prepareTeamDelivery,
} from "./teamTextDeliveryClient";

const DELIVERY = "00000000-0000-4000-8000-000000000001";
const TURN = "00000000-0000-4000-8000-000000000002";
const OPERATION = "00000000-0000-4000-8000-000000000003";
const createdAt = "2026-10-18T12:00:00.000Z";
const expiresAt = "2026-10-25T12:00:00.000Z";

describe("Team text delivery browser contract", () => {
  it("accepts only metadata in the inbox and rejects payload leakage", () => {
    expect(parseTeamDeliveryInbox({ deliveries: [{ id: DELIVERY, turnId: TURN, createdAt, expiresAt }], nextCursor: null }))
      .toEqual({ deliveries: [{ id: DELIVERY, turnId: TURN, createdAt, expiresAt }], nextCursor: null });
    expect(parseTeamDeliveryInbox({ deliveries: [{ id: DELIVERY, turnId: TURN, createdAt, expiresAt, content: "private" }], nextCursor: null })).toBeNull();
    expect(parseTeamDeliveryInbox({ deliveries: [{ id: DELIVERY, turnId: TURN, createdAt, expiresAt }], nextCursor: null, senderUserId: "private" })).toBeNull();
    expect(parseTeamDeliveryInbox({ deliveries: [{ id: DELIVERY, turnId: TURN, createdAt: expiresAt, expiresAt: createdAt }], nextCursor: null })).toBeNull();
    expect(parseTeamDeliveryInbox({ deliveries: [{ id: DELIVERY, turnId: TURN, createdAt, expiresAt }], nextCursor: { beforeCreatedAt: expiresAt, beforeDeliveryId: DELIVERY } })).toBeNull();
    expect(parseTeamDeliveryInbox({ deliveries: [{ id: DELIVERY, turnId: TURN, createdAt, expiresAt }], nextCursor: { beforeCreatedAt: createdAt, beforeDeliveryId: DELIVERY } }))
      .toMatchObject({ nextCursor: { beforeCreatedAt: createdAt, beforeDeliveryId: DELIVERY } });
  });

  it("requires an explicit detail response and binds opened content to the requested delivery id", () => {
    expect(parseTeamDeliveryContent({ delivery: { id: DELIVERY, content: "Reviewed answer", createdAt, expiresAt } }))
      .toEqual({ id: DELIVERY, content: "Reviewed answer", createdAt, expiresAt });
    expect(parseTeamDeliveryContent({ delivery: { id: DELIVERY, content: "x".repeat(MAX_TEAM_DELIVERY_BYTES + 1), createdAt, expiresAt } })).toBeNull();
    expect(parseTeamDeliveryContent({ delivery: { id: DELIVERY, content: "Reviewed answer", createdAt, expiresAt, sender_user_id: "private" } })).toBeNull();
    expect(parseTeamDeliveryReceipt({ delivery: { id: DELIVERY, createdAt, expiresAt, content: "must not be in receipt" } })).toBeNull();
  });

  it("keeps submitted text explicit, bounded, and retryable only with its caller-supplied operation id", () => {
    expect(prepareTeamDelivery(" reviewed text ", OPERATION)).toEqual({ content: " reviewed text ", operationId: OPERATION });
    expect(prepareTeamDelivery("  ", OPERATION)).toBeNull();
    expect(prepareTeamDelivery("x".repeat(MAX_TEAM_DELIVERY_BYTES + 1), OPERATION)).toBeNull();
    expect(prepareTeamDelivery("bad\u0000text", OPERATION)).toBeNull();
    expect(prepareTeamDelivery("reviewed text", "not-a-uuid")).toBeNull();
  });
});
