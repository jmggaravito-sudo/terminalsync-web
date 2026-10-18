/** Canonical Team seat ceiling across checkout, billing, and roster boundaries. */
export const MAX_TEAM_SEATS = 64;

export function isValidTeamSeatCount(seatCount: unknown): seatCount is number {
  return typeof seatCount === "number" && Number.isSafeInteger(seatCount) &&
    seatCount >= 1 && seatCount <= MAX_TEAM_SEATS;
}
