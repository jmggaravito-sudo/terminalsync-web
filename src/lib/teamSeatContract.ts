import { isValidTeamSeatCount } from "./teamSeatLimits";
export { isValidTeamSeatCount } from "./teamSeatLimits";

/** Pure Team seat-count and capability contract; this does not grant access. */
export type TeamSeatCapabilities = {
  send: true;
  receive: true;
};

export type TeamSeatContract = {
  seatCount: number;
  capabilities: TeamSeatCapabilities;
};

export type TeamRosterMember = { id: string; capabilities: TeamSeatCapabilities };
export type TeamRosterInvitation = { id: string };
export type TeamRoster = {
  seatCount: number;
  owner: TeamRosterMember;
  members: TeamRosterMember[];
  invitations: TeamRosterInvitation[];
};

const TEAM_SEAT_CAPABILITIES: TeamSeatCapabilities = Object.freeze({
  send: true,
  receive: true,
});

export function createTeamSeatContract(seatCount: unknown): TeamSeatContract {
  if (!isValidTeamSeatCount(seatCount)) {
    throw new RangeError("Team seat count must be an integer from 1 through 64");
  }

  return { seatCount, capabilities: TEAM_SEAT_CAPABILITIES };
}

/** Validate and preserve the requested quantity without provisioning seats. */
export function updateTeamSeatCount(
  current: TeamSeatContract,
  requestedSeatCount: unknown,
): TeamSeatContract {
  if (!isValidTeamSeatCount(requestedSeatCount)) {
    throw new RangeError("Team seat count must be an integer from 1 through 64");
  }

  return { seatCount: requestedSeatCount, capabilities: TEAM_SEAT_CAPABILITIES };
}

/** Pure roster shape validation. Pending invitations provisionally reserve capacity. */
export function validateTeamRoster(value: unknown): value is TeamRoster {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const roster = value as Partial<TeamRoster>;
  if (!isValidTeamSeatCount(roster.seatCount) || !roster.owner || !validId(roster.owner.id)) return false;
  if (!Array.isArray(roster.members) || !Array.isArray(roster.invitations)) return false;
  const ids = [roster.owner.id, ...roster.members.map((m) => m?.id), ...roster.invitations.map((i) => i?.id)];
  if (ids.some((id) => !validId(id)) || new Set(ids).size !== ids.length) return false;
  return roster.members.every((member) => hasSymmetricCapabilities(member.capabilities)) &&
    hasSymmetricCapabilities(roster.owner.capabilities) &&
    roster.members.length + roster.invitations.length + 1 <= roster.seatCount;
}

/** Invites reserve one seat provisionally; this is a capacity contract, not pricing/access policy. */
export function inviteTeamMember(roster: TeamRoster, invitationId: string): TeamRoster {
  assertRoster(roster);
  if (!validId(invitationId) || allIds(roster).includes(invitationId)) throw new RangeError("Invalid or duplicate roster ID");
  if (occupiedSeats(roster) >= roster.seatCount) throw new RangeError("Team has no available seats");
  return cloneRoster({ ...roster, invitations: [...roster.invitations, { id: invitationId }] });
}

export function acceptTeamInvitation(roster: TeamRoster, invitationId: string, memberId: string): TeamRoster {
  assertRoster(roster);
  const invitation = roster.invitations.find((item) => item.id === invitationId);
  if (!invitation || !validId(memberId) || allIds(roster).includes(memberId)) throw new RangeError("Invalid invitation or duplicate roster ID");
  return cloneRoster({
    ...roster,
    invitations: roster.invitations.filter((item) => item.id !== invitationId),
    members: [...roster.members, { id: memberId, capabilities: TEAM_SEAT_CAPABILITIES }],
  });
}

/** Revokes a pending invitation or removes an active member, releasing the reserved seat. */
export function revokeTeamRosterEntry(roster: TeamRoster, id: string): TeamRoster {
  assertRoster(roster);
  if (roster.invitations.some((item) => item.id === id)) {
    return cloneRoster({ ...roster, invitations: roster.invitations.filter((item) => item.id !== id) });
  }
  if (roster.members.some((member) => member.id === id)) {
    return cloneRoster({ ...roster, members: roster.members.filter((member) => member.id !== id) });
  }
  throw new RangeError("Roster entry not found");
}

function validId(id: unknown): id is string { return typeof id === "string" && id.trim().length > 0; }
function hasSymmetricCapabilities(value: TeamSeatCapabilities): boolean {
  return value?.send === true && value?.receive === true && Object.keys(value).length === 2;
}
function allIds(roster: TeamRoster): string[] { return [roster.owner.id, ...roster.members.map((m) => m.id), ...roster.invitations.map((i) => i.id)]; }
function occupiedSeats(roster: TeamRoster): number { return 1 + roster.members.length + roster.invitations.length; }
function assertRoster(roster: TeamRoster): void { if (!validateTeamRoster(roster)) throw new RangeError("Invalid Team roster"); }

function cloneRoster(roster: TeamRoster): TeamRoster {
  const capabilities = () => Object.freeze({ send: true as const, receive: true as const });
  return {
    seatCount: roster.seatCount,
    owner: { id: roster.owner.id, capabilities: capabilities() },
    members: roster.members.map((member) => ({ id: member.id, capabilities: capabilities() })),
    invitations: roster.invitations.map((invitation) => ({ id: invitation.id })),
  };
}
