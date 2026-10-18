import { describe, expect, it } from "vitest";
import { parseOwnerApprovals } from "./ownerApprovals";

describe("parseOwnerApprovals", () => {
  it("keeps only the safe owner-actionable projection fields and bounded metadata", () => {
    const rows = parseOwnerApprovals([{ id: "00000000-0000-0000-0000-000000000001", requester_user_id: "PRIVATE", manifest_hash: "SECRET", space_id: "PRIVATE", space_name: "Shared", role: "owner", can_respond: true, status: "pending", request_kind: "document", metadata: { itemCount: 2 }, created_at: "2026-10-17T00:00:00Z", content: "SECRET" }]);
    expect(rows).toEqual([{ id: "00000000-0000-0000-0000-000000000001", spaceName: "Shared", kind: "document", status: "pending", canRespond: true, itemCount: 2, createdAt: "2026-10-17T00:00:00Z" }]);
    expect(JSON.stringify(rows)).not.toMatch(/PRIVATE|SECRET/);
  });

  it("allows an empty metadata object but rejects label, category, and every extra metadata field", () => {
    const safeEmpty = parseOwnerApprovals([{ id: "00000000-0000-0000-0000-000000000001", space_name: "S", role: "owner", can_respond: true, status: "pending", request_kind: "context", metadata: {} }]);
    expect(safeEmpty).toEqual([{ id: "00000000-0000-0000-0000-000000000001", spaceName: "S", kind: "context", status: "pending", canRespond: true, itemCount: null, createdAt: null }]);

    for (const metadata of [
      { label: "https://private.example/document" },
      { category: "/Users/private/document.pdf" },
      { itemCount: 1, arbitrary: "never expose" },
      { itemCount: "1" },
      { itemCount: 1.5 },
      { itemCount: -1 },
      { itemCount: 1_000_001 },
    ]) {
      expect(parseOwnerApprovals([{ id: "00000000-0000-0000-0000-000000000001", space_name: "S", role: "owner", can_respond: true, status: "pending", request_kind: "context", metadata }])).toEqual([]);
    }
  });

  it("drops malformed or unsafe display names rather than retaining a legacy payload", () => {
    expect(parseOwnerApprovals([{ id: "bad", role: "owner" }, { id: "00000000-0000-0000-0000-000000000001", space_name: "x", role: "requester", can_respond: true, status: "pending", request_kind: "context" }])).toEqual([]);
    expect(parseOwnerApprovals([{ id: "00000000-0000-0000-0000-000000000001", space_name: "/Users/private", role: "owner", can_respond: true, status: "pending", request_kind: "context", metadata: {} }])).toEqual([]);
  });
});
