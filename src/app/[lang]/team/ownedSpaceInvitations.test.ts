import { describe, expect, it } from "vitest";
import { parseOwnedSpaceInvitations } from "./ownedSpaceInvitations";

const valid = {
  id: "00000000-0000-4000-8000-000000000011",
  space_id: "00000000-0000-4000-8000-000000000012",
  space_name: "Colpensiones",
  invitee_alias: "alex.team",
  status: "accepted",
  created_at: "2026-10-23T00:00:00Z",
  responded_at: "2026-10-23T00:01:00Z",
};

describe("owner shared-space invitation projection", () => {
  it("keeps only revocable owner metadata", () => {
    expect(parseOwnedSpaceInvitations([{ ...valid, invitee_user_id: "private", content: "secret" }])).toEqual([{
      id: valid.id,
      spaceId: valid.space_id,
      spaceName: valid.space_name,
      inviteeAlias: valid.invitee_alias,
      status: "accepted",
    }]);
  });

  it("fails closed for revoked rows, malformed aliases, or inconsistent response times", () => {
    expect(parseOwnedSpaceInvitations([
      { ...valid, status: "revoked" },
      { ...valid, id: "00000000-0000-4000-8000-000000000013", invitee_alias: "../private" },
      { ...valid, id: "00000000-0000-4000-8000-000000000014", status: "pending", responded_at: valid.responded_at },
    ])).toEqual([]);
  });
});
