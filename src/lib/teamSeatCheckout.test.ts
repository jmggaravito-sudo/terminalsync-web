import { describe, expect, it } from "vitest";
import { isValidTeamSeatCount } from "@/lib/teamSeatCheckout";
import { MAX_TEAM_SEATS } from "@/lib/teamSeatLimits";

describe("Team checkout seat quantity", () => {
  it("accepts seat counts through the 64-seat ceiling", () => {
    expect(isValidTeamSeatCount(1)).toBe(true);
    expect(isValidTeamSeatCount(MAX_TEAM_SEATS)).toBe(true);
    expect(isValidTeamSeatCount(MAX_TEAM_SEATS + 1)).toBe(false);
  });

  it("rejects missing, non-integer, unsafe, or non-positive quantities", () => {
    for (const value of [undefined, null, "2", 0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER + 1]) {
      expect(isValidTeamSeatCount(value)).toBe(false);
    }
  });
});
