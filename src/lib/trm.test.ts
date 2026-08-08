import { describe, expect, it } from "vitest";

import { isPlausibleTrm, parseTrmRows, pickRowForDay } from "./trm";
import { copAmountForCreditPackage, creditPackageFor, CREDIT_COP_MARGIN } from "./aiCredits";

// Shape returned by datos.gov.co, newest first.
const ROWS = [
  { valor: "3204.51", vigenciadesde: "2026-08-05T00:00:00.000", vigenciahasta: "2026-08-05T00:00:00.000" },
  { valor: "3230.44", vigenciadesde: "2026-08-04T00:00:00.000", vigenciahasta: "2026-08-04T00:00:00.000" },
  { valor: "3144.14", vigenciadesde: "2026-08-01T00:00:00.000", vigenciahasta: "2026-08-03T00:00:00.000" },
];

describe("TRM lookup", () => {
  it("uses the rate whose vigencia covers the day, not merely the newest", () => {
    // Aug 1's rate is published on a Friday and stays valid all weekend. Taking
    // "the newest row" on Sunday would price at a rate that is not in force.
    expect(pickRowForDay(ROWS, "2026-08-02")?.valor).toBe("3144.14");
    expect(pickRowForDay(ROWS, "2026-08-03")?.valor).toBe("3144.14");
    expect(pickRowForDay(ROWS, "2026-08-04")?.valor).toBe("3230.44");
  });

  it("ignores a rate published for a future day", () => {
    // Asking on Aug 4 must not pick up Aug 5's rate just because it is listed.
    expect(pickRowForDay(ROWS, "2026-08-04")?.valor).toBe("3230.44");
  });

  it("falls back to the latest already-started rate past the end of a range", () => {
    expect(pickRowForDay(ROWS, "2026-08-09")?.valor).toBe("3204.51");
  });

  it("parses the value for a day", () => {
    expect(parseTrmRows(ROWS, "2026-08-05")).toMatchObject({ value: 3204.51, source: "live" });
  });

  describe("sanity guards — this priced money", () => {
    it("rejects a value outside any plausible band", () => {
      expect(isPlausibleTrm(0)).toBe(false);
      expect(isPlausibleTrm(-3204)).toBe(false);
      expect(isPlausibleTrm(3.2)).toBe(false); // a rate quoted in thousands
      expect(isPlausibleTrm(3_204_510)).toBe(false); // a stray factor of 1000
      expect(isPlausibleTrm(Number.NaN)).toBe(false);
    });

    it("rejects a jump no real TRM makes", () => {
      // A bad feed must not be able to double what a customer is charged.
      expect(isPlausibleTrm(6_400, 3_204.51)).toBe(false);
      expect(isPlausibleTrm(1_600, 3_204.51)).toBe(false);
    });

    it("accepts ordinary daily movement", () => {
      expect(isPlausibleTrm(3_230.44, 3_204.51)).toBe(true);
      expect(isPlausibleTrm(3_144.14, 3_204.51)).toBe(true);
    });

    it("refuses to parse rows carrying an implausible value", () => {
      const bad = [{ valor: "0", vigenciadesde: "2026-08-05T00:00:00.000", vigenciahasta: "2026-08-05T00:00:00.000" }];
      expect(parseTrmRows(bad, "2026-08-05")).toBeNull();
      expect(parseTrmRows([], "2026-08-05")).toBeNull();
    });
  });
});

describe("what the customer is charged", () => {
  const pkg10 = creditPackageFor(1000)!;
  const pkg20 = creditPackageFor(2000)!;
  const rate = 3_204.51 * (1 + CREDIT_COP_MARGIN);

  it("always lands on a round number of pesos", () => {
    // JM's rule: 34,600 is fine, 34,608 is not. Nobody quotes a price like that.
    for (const pkg of [pkg10, pkg20]) {
      expect(copAmountForCreditPackage(pkg, rate) % 100).toBe(0);
    }
  });

  it("charges near the real rate, not the 4,100 that had drifted", () => {
    const ten = copAmountForCreditPackage(pkg10, rate);
    expect(ten).toBe(34_600);
    // The old fixed rate charged 41,000 for the same package — about 18% more
    // than this, and 28% above the bare TRM.
    expect(ten).toBeLessThan(41_000);
  });

  it("scales with the package", () => {
    expect(copAmountForCreditPackage(pkg20, rate)).toBe(69_200);
  });
});
