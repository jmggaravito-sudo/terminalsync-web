/** Pure Team seat-count and capability contract; this does not grant access. */
export type TeamSeatCapabilities = {
  send: true;
  receive: true;
};

export type TeamSeatContract = {
  seatCount: number;
  capabilities: TeamSeatCapabilities;
};

const TEAM_SEAT_CAPABILITIES: TeamSeatCapabilities = Object.freeze({
  send: true,
  receive: true,
});

/** Accept only a positive safe integer. No policy maximum is imposed here. */
export function isValidTeamSeatCount(seatCount: unknown): seatCount is number {
  return (
    typeof seatCount === "number" &&
    Number.isSafeInteger(seatCount) &&
    seatCount >= 1
  );
}

export function createTeamSeatContract(seatCount: unknown): TeamSeatContract {
  if (!isValidTeamSeatCount(seatCount)) {
    throw new RangeError("Team seat count must be a positive safe integer");
  }

  return { seatCount, capabilities: TEAM_SEAT_CAPABILITIES };
}

/** Validate and preserve the requested quantity without provisioning seats. */
export function updateTeamSeatCount(
  current: TeamSeatContract,
  requestedSeatCount: unknown,
): TeamSeatContract {
  if (!isValidTeamSeatCount(requestedSeatCount)) {
    throw new RangeError("Team seat count must be a positive safe integer");
  }

  return { ...current, seatCount: requestedSeatCount };
}
