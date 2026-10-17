import { describe, expect, it } from "vitest";
import { parseReceivedInvitations, receivedSpaceLabel } from "./receivedSpaces";

describe("received Team invitations", () => {
  it("parses only pending invitee projections", () => {
    const rows = parseReceivedInvitations([
      { id: "i1", space_id: "s1", space_name: "Acme", owner_alias: "maria", role: "invitee", status: "pending", created_at: "2026-10-17" },
      { id: "i2", space_id: "s2", space_name: "Other", owner_alias: null, role: "invitee", status: "accepted", created_at: "2026-10-17" },
      { id: "bad", space_id: "s3", space_name: "Hidden", owner_alias: "not valid", role: "owner", status: "pending", created_at: "2026-10-17" },
    ]);
    expect(rows).toHaveLength(1);
    expect(receivedSpaceLabel(rows[0], "es")).toBe("Acme de maria");
  });

  it("uses a privacy-safe localized label when owner alias is absent", () => {
    const [row] = parseReceivedInvitations([{ id: "i", space_id: "s", space_name: "Equipo", owner_alias: null, role: "invitee", status: "pending", created_at: "now" }]);
    expect(receivedSpaceLabel(row, "es")).toBe("Equipo · espacio compartido");
    expect(receivedSpaceLabel(row, "en")).toBe("Equipo · shared space");
  });

  it("fails closed for malformed API data", () => {
    expect(parseReceivedInvitations({ error: "unauthorized" })).toEqual([]);
  });
});
