import { describe, expect, it } from "vitest";
import {
  createTeamSeatContract,
  isValidTeamSeatCount,
  updateTeamSeatCount,
} from "@/lib/teamSeatContract";

describe("Team seat contract", () => {
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
});
