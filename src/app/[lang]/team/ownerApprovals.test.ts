import { describe, expect, it } from "vitest";
import { parseOwnerApprovals } from "./ownerApprovals";

describe("parseOwnerApprovals", () => {
  it("keeps only the safe owner-actionable projection fields and bounded metadata", () => {
    const rows = parseOwnerApprovals([{ id: "00000000-0000-0000-0000-000000000001", requester_user_id: "PRIVATE", manifest_hash: "SECRET", space_id: "PRIVATE", space_name: "Shared", role: "owner", can_respond: true, status: "pending", request_kind: "document", metadata: { label: " Budget ", category: "finance", itemCount: 2, arbitrary: "never expose" }, created_at: "2026-10-17T00:00:00Z", content: "SECRET" }]);
    expect(rows).toEqual([{ id: "00000000-0000-0000-0000-000000000001", spaceName: "Shared", kind: "document", status: "pending", canRespond: true, label: "Budget", category: "finance", itemCount: 2, createdAt: "2026-10-17T00:00:00Z" }]);
    expect(JSON.stringify(rows)).not.toMatch(/PRIVATE|SECRET|arbitrary/);
  });

  it("drops malformed rows and bounds unsafe metadata rather than retaining payloads", () => {
    expect(parseOwnerApprovals([{ id: "bad", role: "owner" }, { id: "00000000-0000-0000-0000-000000000001", space_name: "x", role: "requester", can_respond: true, status: "pending", request_kind: "context" }])).toEqual([]);
    const [row] = parseOwnerApprovals([{ id: "00000000-0000-0000-0000-000000000001", space_name: "S", role: "owner", can_respond: true, status: "pending", request_kind: "context", metadata: { label: "x".repeat(121), itemCount: 1000001 } }]);
    expect(row).toMatchObject({ label: null, itemCount: null, category: null });
  });
});
