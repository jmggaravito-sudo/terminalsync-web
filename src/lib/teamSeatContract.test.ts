import { describe, expect, it } from "vitest";
import {
  createTeamSeatContract,
  isValidTeamSeatCount,
  updateTeamSeatCount,
  acceptTeamInvitation,
  inviteTeamMember,
  revokeTeamRosterEntry,
  validateTeamRoster,
} from "@/lib/teamSeatContract";

describe("Team seat contract", () => {
  const roster = (seatCount = 3) => ({
    seatCount,
    owner: { id: "owner", capabilities: { send: true as const, receive: true as const } },
    members: [{ id: "member", capabilities: { send: true as const, receive: true as const } }],
    invitations: [] as { id: string }[],
  });

  it("accepts only positive safe-integer seat counts without an arbitrary cap", () => {
    expect(isValidTeamSeatCount(1)).toBe(true);
    expect(isValidTeamSeatCount(Number.MAX_SAFE_INTEGER)).toBe(true);
    for (const invalid of [0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, NaN, Infinity, "2", null]) {
      expect(isValidTeamSeatCount(invalid)).toBe(false);
      expect(() => createTeamSeatContract(invalid)).toThrow(RangeError);
    }
  });

  it("preserves the requested quantity after validation", () => {
    const initial = createTeamSeatContract(2);
    const updated = updateTeamSeatCount(initial, 7);
    expect(updated.seatCount).toBe(7);
    expect(initial.seatCount).toBe(2);
    expect(() => updateTeamSeatCount(initial, 0)).toThrow(RangeError);
  });

  it("gives every seat symmetric send and receive capabilities only", () => {
    const contract = createTeamSeatContract(3);
    expect(contract.capabilities).toEqual({ send: true, receive: true });
    expect(Object.keys(contract.capabilities).sort()).toEqual(["receive", "send"]);
    expect(Object.isFrozen(contract.capabilities)).toBe(true);
  });

  it("normalizes runtime-tampered capabilities during seat-count updates", () => {
    const current = {
      seatCount: 2,
      capabilities: { send: false, receive: true, receiverOnly: true },
    } as unknown as ReturnType<typeof createTeamSeatContract>;

    const updated = updateTeamSeatCount(current, 4);
    expect(updated.seatCount).toBe(4);
    expect(updated.capabilities).toBe(createTeamSeatContract(1).capabilities);
    expect(updated.capabilities).toEqual({ send: true, receive: true });
    expect(Object.keys(updated.capabilities).sort()).toEqual(["receive", "send"]);
  });

  it("validates unique IDs and capacity, with pending invitations provisionally reserving seats", () => {
    const full = inviteTeamMember(roster(3), "invite-1");
    // Provisional contract assumption: owner + active members + pending invites occupy capacity.
    expect(validateTeamRoster(full)).toBe(true);
    expect(() => inviteTeamMember(full, "invite-2")).toThrow(RangeError);
    expect(validateTeamRoster({ ...full, invitations: [{ id: "member" }] })).toBe(false);
    expect(validateTeamRoster({ ...full, seatCount: 2 })).toBe(false);
    expect(validateTeamRoster({ ...full, members: [{ id: "", capabilities: { send: true, receive: true } }] })).toBe(false);
  });

  it("accepts invalid unknown values without throwing", () => {
    for (const value of [null, undefined, 1, "x", [], {}]) expect(validateTeamRoster(value)).toBe(false);
  });

  it("accepts invitations without changing occupancy and releases capacity on revoke", () => {
    const invited = inviteTeamMember(roster(3), "invite-1");
    const accepted = acceptTeamInvitation(invited, "invite-1", "member-2");
    expect(accepted.invitations).toEqual([]);
    expect(accepted.members.map((member) => member.id)).toEqual(["member", "member-2"]);
    expect(accepted.members[1].capabilities).toEqual({ send: true, receive: true });
    expect(() => acceptTeamInvitation(invited, "invite-1", "member")).toThrow(RangeError);
    const revokedInvite = revokeTeamRosterEntry(invited, "invite-1");
    expect(revokedInvite.invitations).toEqual([]);
    expect(inviteTeamMember(revokedInvite, "invite-2").invitations).toHaveLength(1);
    const removed = revokeTeamRosterEntry(accepted, "member-2");
    expect(removed.members.map((member) => member.id)).toEqual(["member"]);
  });
  it("returns isolated roster structures on every transition", () => {
    const original = roster(4);
    const invited = inviteTeamMember(original, "invite-1");
    expect(invited).not.toBe(original);
    expect(invited.owner).not.toBe(original.owner);
    expect(invited.owner.capabilities).not.toBe(original.owner.capabilities);
    expect(invited.members[0]).not.toBe(original.members[0]);
    expect(invited.members[0].capabilities).not.toBe(original.members[0].capabilities);
    expect(invited.invitations[0]).not.toBe(original.invitations[0]);
    const accepted = acceptTeamInvitation(invited, "invite-1", "member-2");
    const revoked = revokeTeamRosterEntry(accepted, "member-2");
    for (const [result, source] of [[accepted, invited], [revoked, accepted]] as const) {
      expect(result).not.toBe(source);
      expect(result.owner).not.toBe(source.owner);
      expect(result.owner.capabilities).not.toBe(source.owner.capabilities);
      expect(result.members[0]).not.toBe(source.members[0]);
      expect(result.members[0].capabilities).not.toBe(source.members[0].capabilities);
      expect(result.invitations).not.toBe(source.invitations);
      if (result.invitations.length && source.invitations.length) {
        expect(result.invitations[0]).not.toBe(source.invitations[0]);
      }
    }
    invited.owner.id = "changed";
    invited.members[0].id = "changed-member";
    invited.invitations[0].id = "changed-invite";
    expect(original.owner.id).toBe("owner");
    expect(original.members[0].id).toBe("member");
    expect(original.invitations).toEqual([]);
    expect(accepted.owner.id).toBe("owner");
  });
});
