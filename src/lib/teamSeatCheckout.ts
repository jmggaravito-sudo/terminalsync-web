/** Team checkout quantity validation. This validates a requested quantity;
 * it does not provision seats or assert that Team checkout is launch-ready. */
export function isValidTeamSeatCount(seatCount: unknown): seatCount is number {
  return (
    typeof seatCount === "number" &&
    Number.isSafeInteger(seatCount) &&
    seatCount >= 1
  );
}
