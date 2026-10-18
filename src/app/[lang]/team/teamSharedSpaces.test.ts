import { describe, expect, it } from "vitest";
import { parseOwnedTeamSpaces } from "./teamSharedSpaces";

describe("parseOwnedTeamSpaces", () => {
  it("keeps only the owned-space browser projection", () => {
    const spaces = parseOwnedTeamSpaces([{
      id: "00000000-0000-0000-0000-000000000001",
      name: " Plan anual ",
      description: "Metadatos del equipo",
      external_ref: "PRIVATE",
      created_at: "2026-10-18T00:00:00Z",
      owner_user_id: "PRIVATE",
      manifest_hash: "SECRET",
    }]);

    // API responses must already be canonical; do not trim an unsafe or
    // untrusted response into a recipient-visible display name.
    expect(spaces).toEqual([]);

    const canonical = parseOwnedTeamSpaces([{
      id: "00000000-0000-0000-0000-000000000001",
      name: "Plan anual",
      description: "Metadatos del equipo",
      external_ref: "PRIVATE",
      created_at: "2026-10-18T00:00:00Z",
      owner_user_id: "PRIVATE",
      manifest_hash: "SECRET",
    }]);
    expect(canonical).toEqual([{
      id: "00000000-0000-0000-0000-000000000001",
      name: "Plan anual",
      createdAt: "2026-10-18T00:00:00Z",
    }]);
    expect(JSON.stringify(canonical)).not.toMatch(/PRIVATE|SECRET|Metadatos/);
  });

  it("drops malformed, unsafe-name, and duplicate rows rather than retaining service data", () => {
    expect(parseOwnedTeamSpaces([
      { id: "bad", name: "No", description: null, created_at: "2026-10-18T00:00:00Z" },
      { id: "00000000-0000-0000-0000-000000000001", name: "Valid", description: null, created_at: "2026-10-18T00:00:00Z" },
      { id: "00000000-0000-0000-0000-000000000001", name: "Duplicate", description: null, created_at: "2026-10-18T00:00:00Z" },
      { id: "00000000-0000-0000-0000-000000000002", name: "https://private.example", created_at: "2026-10-18T00:00:00Z" },
      { id: "00000000-0000-0000-0000-000000000003", name: "/Users/private", created_at: "2026-10-18T00:00:00Z" },
    ])).toHaveLength(1);
  });
});

