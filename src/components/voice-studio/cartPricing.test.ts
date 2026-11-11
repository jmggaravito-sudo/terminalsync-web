import { describe, expect, it } from "vitest";
import { eligibleShorts, estimateCart, type CartVideo } from "./cartPricing";

const video = (seconds: number, extras: Partial<CartVideo> = {}): CartVideo => ({
  id: "example", title: "Example", seconds, service: "DUB", shorts: [], ...extras,
});

describe("Voice Studio cart estimates", () => {
  it("prices one video or several by their combined duration", () => {
    expect(estimateCart([video(1440)])).toEqual(estimateCart([video(480), video(480), video(480)]));
    expect(estimateCart([video(1440)]).total).toBe(9480);
  });

  it("charges lip-sync only for LIP videos and shorts separately", () => {
    expect(estimateCart([video(90, { service: "LIP", shorts: [30, 60] }), video(45)]))
      .toMatchObject({ seconds: 135, lip: 892, shorts: 3500 });
  });

  it("prices a 90-second LIP at $14.85 without rounding twice", () => {
    expect(estimateCart([video(90, { service: "LIP" })]).total).toBe(1485);
  });

  it("doesn't count unselected services or clips longer than the source", () => {
    expect(eligibleShorts(45).map((short) => short.seconds)).toEqual([30]);
    expect(estimateCart([video(45, { shorts: [30, 30, 60] }), video(90, { service: null, shorts: [90] })]))
      .toMatchObject({ seconds: 45, shorts: 1500 });
  });
});
