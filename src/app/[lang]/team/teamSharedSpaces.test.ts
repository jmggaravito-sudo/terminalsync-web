import { describe, expect, it } from "vitest";
import { parseOwnedTeamSpaces } from "./teamSharedSpaces";

describe("parseOwnedTeamSpaces", () => {
  it("keeps only the owned-space browser projection", () => {
    const spaces = parseOwnedTeamSpaces([{
      id: "00000000-0000-0000-0000-000000000001",
      name: " Plan anual ",
      description: "Metadatos del equipo",
      created_at: "2026-10-18T00:00:00Z",
      owner_user_id: "PRIVATE",
      external_ref: "PRIVATE",
      manifest_hash: "SECRET",
    }]);

    expect(spaces).toEqual([{
      id: "00000000-0000-0000-0000-000000000001",
      name: "Plan anual",
      description: "Metadatos del equipo",
      createdAt: "2026-10-18T00:00:00Z",
    }]);
    expect(JSON.stringify(spaces)).not.toMatch(/PRIVATE|SECRET/);
  });

  it("drops malformed and duplicate rows rather than retaining service data", () => {
    expect(parseOwnedTeamSpaces([
      { id: "bad", name: "No", description: null, created_at: "2026-10-18T00:00:00Z" },
      { id: "00000000-0000-0000-0000-000000000001", name: "Valid", description: null, created_at: "2026-10-18T00:00:00Z" },
      { id: "00000000-0000-0000-0000-000000000001", name: "Duplicate", description: null, created_at: "2026-10-18T00:00:00Z" },
    ])).toHaveLength(1);
  });
});

