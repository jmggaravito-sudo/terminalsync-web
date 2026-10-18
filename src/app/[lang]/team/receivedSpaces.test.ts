import { describe, expect, it } from "vitest";
import { parseReceivedInvitations, partitionReceivedInvitations, receivedSpaceLabel } from "./receivedSpaces";

const INVITATION_A = "00000000-0000-0000-0000-000000000001";
const INVITATION_B = "00000000-0000-0000-0000-000000000002";
const SPACE_A = "00000000-0000-0000-0000-000000000011";
const SPACE_B = "00000000-0000-0000-0000-000000000012";
const CREATED_AT = "2026-10-17T00:00:00Z";

describe("received Team invitations", () => {
  it("separates pending and accepted invitee projections, excluding declined and owner rows", () => {
    const rows = parseReceivedInvitations([
      { id: INVITATION_A, space_id: SPACE_A, space_name: "Acme", owner_alias: "maria", role: "invitee", status: "pending", created_at: CREATED_AT, description: "private", external_ref: "PRIVATE" },
      { id: INVITATION_B, space_id: SPACE_B, space_name: "Other", owner_alias: null, role: "invitee", status: "accepted", created_at: CREATED_AT },
      { id: "00000000-0000-0000-0000-000000000003", space_id: "00000000-0000-0000-0000-000000000013", space_name: "Declined", owner_alias: "private", role: "invitee", status: "declined", created_at: CREATED_AT },
      { id: "00000000-0000-0000-0000-000000000004", space_id: "00000000-0000-0000-0000-000000000014", space_name: "Hidden", owner_alias: "not valid", role: "owner", status: "pending", created_at: CREATED_AT },
    ]);
    const collections = partitionReceivedInvitations(rows);
    expect(collections.pending).toHaveLength(1);
    expect(collections.received).toHaveLength(1);
    expect(receivedSpaceLabel(collections.pending[0], "es")).toBe("Acme de maria");
    expect(receivedSpaceLabel(collections.received[0], "es")).toBe("Other · espacio compartido");
    expect(JSON.stringify(rows)).not.toMatch(/private|PRIVATE/);
  });

  it("uses a privacy-safe localized label when owner alias is absent", () => {
    const [row] = parseReceivedInvitations([{ id: INVITATION_A, space_id: SPACE_A, space_name: "Equipo", owner_alias: null, role: "invitee", status: "accepted", created_at: CREATED_AT }]);
    expect(receivedSpaceLabel(row, "es")).toBe("Equipo · espacio compartido");
    expect(receivedSpaceLabel(row, "en")).toBe("Equipo · shared space");
  });

  it("fails closed for malformed, unsafe-name, and invalid-alias API data", () => {
    expect(parseReceivedInvitations({ error: "unauthorized" })).toEqual([]);
    expect(parseReceivedInvitations([
      { id: INVITATION_A, space_id: SPACE_A, space_name: "https://private.example/space", owner_alias: null, role: "invitee", status: "accepted", created_at: CREATED_AT },
      { id: INVITATION_B, space_id: SPACE_B, space_name: "Equipo", owner_alias: "maria..private", role: "invitee", status: "pending", created_at: CREATED_AT },
      { id: "not-a-uuid", space_id: SPACE_B, space_name: "Equipo", owner_alias: null, role: "invitee", status: "accepted", created_at: CREATED_AT },
    ])).toEqual([]);
  });
});
