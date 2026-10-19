import { describe, expect, it } from "vitest";
import {
  MAX_TEAM_TEXT_BYTES,
  parseTeamDeliveryId,
  parseTeamDeliveryListQuery,
  parseTeamTextDeliveryRequest,
  safeTeamTextDelivery,
  safeTeamTextDeliveryReceipt,
  safeTeamTextDeliveryList,
} from "@/lib/teamTextDelivery";

const operationId = "00000000-0000-4000-8000-000000000001";
const deliveryId = "00000000-0000-4000-8000-000000000002";
const dates = { created_at: "2026-10-18T00:00:00.000Z", expires_at: "2026-10-25T00:00:00.000Z" };

describe("Team text delivery contract", () => {
  it("accepts a strict, bounded reviewed-text request", () => {
    const text = "Reviewed by the owner";
    expect(parseTeamTextDeliveryRequest({ content: text, operationId })).toEqual({ content: text, operationId });
    expect(parseTeamTextDeliveryRequest({ content: "é".repeat(MAX_TEAM_TEXT_BYTES / 2), operationId }).content).toHaveLength(MAX_TEAM_TEXT_BYTES / 2);
  });

  it("rejects payloads over 64 KiB, empty text, unknown fields, and malformed operation ids", () => {
    for (const body of [
      { content: "", operationId },
      { content: "contains\u0001control", operationId },
      { content: "é".repeat(MAX_TEAM_TEXT_BYTES / 2 + 1), operationId },
      ...["document", "attachment", "file", "filename", "mimeType", "url", "path", "sourceId", "storageKey", "providerObjectId"].map((field) => ({ content: "ok", operationId, [field]: "untrusted transport" })),
      { content: "ok", operationId, artifact: { id: "untrusted" } },
      { content: "ok", operationId: "not-a-uuid" },
    ]) expect(() => parseTeamTextDeliveryRequest(body)).toThrow();
    expect(() => parseTeamDeliveryId("../other-user")).toThrow();
  });

  it("projects only expected receipt/delivery fields", () => {
    expect(safeTeamTextDeliveryReceipt([{
      id: deliveryId, recipient_user_id: operationId, ...dates, content: "must not appear in receipt",
    }])).toEqual({ id: deliveryId, createdAt: dates.created_at, expiresAt: dates.expires_at });
    const safe = safeTeamTextDelivery([{ id: deliveryId, content: "text", ...dates, sender_user_id: "private" }]);
    expect(safe).toEqual({ id: deliveryId, content: "text", createdAt: dates.created_at, expiresAt: dates.expires_at });
    expect(safeTeamTextDelivery([])).toBeNull();
  });

  it("validates the recipient inbox cursor and projects metadata without payload fields", () => {
    const request = new Request(`https://x.test/api/team/deliveries?threadId=${deliveryId}&limit=2`);
    expect(parseTeamDeliveryListQuery(request)).toEqual({
      threadId: deliveryId, limit: 2, beforeCreatedAt: null, beforeDeliveryId: null,
    });
    expect(() => parseTeamDeliveryListQuery(new Request(`https://x.test/api/team/deliveries?threadId=${deliveryId}&content=leak`))).toThrow();
    expect(safeTeamTextDeliveryList([{
      id: deliveryId, turn_id: operationId, ...dates, content: "must not appear", sender_user_id: "private",
    }])).toEqual([{ id: deliveryId, turnId: operationId, createdAt: dates.created_at, expiresAt: dates.expires_at }]);
  });
});
