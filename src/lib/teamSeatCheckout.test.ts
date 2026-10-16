import { describe, expect, it } from "vitest";
import { isValidTeamSeatCount } from "@/lib/teamSeatCheckout";

describe("Team checkout seat quantity", () => {
  it("accepts positive safe integers", () => {
    expect(isValidTeamSeatCount(1)).toBe(true);
    expect(isValidTeamSeatCount(Number.MAX_SAFE_INTEGER)).toBe(true);
  });

  it("rejects missing, non-integer, unsafe, or non-positive quantities", () => {
    for (const value of [undefined, null, "2", 0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
      expect(isValidTeamSeatCount(value)).toBe(false);
    }
  });
});
