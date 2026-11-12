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

  it("prices DUB and LIP as exclusive services and Shorts separately", () => {
    expect(estimateCart([video(90, { service: "LIP", shorts: [30, 60] }), video(45)]))
      .toMatchObject({ dubSeconds: 45, lipSeconds: 90, dubbing: 296, lip: 1485, shorts: 3500, total: 5281 });
  });

  it("shows one LIP charge for the 23:56 video, with no DUB charge", () => {
    expect(estimateCart([video(1436, { service: "LIP" })]))
      .toEqual({ dubSeconds: 0, lipSeconds: 1436, dubbing: 0, lip: 23694, shorts: 0, total: 23694 });
  });

  it("shows one DUB charge when LIP is not selected", () => {
    expect(estimateCart([video(1436)]))
      .toEqual({ dubSeconds: 1436, lipSeconds: 0, dubbing: 9454, lip: 0, shorts: 0, total: 9454 });
  });

  it("doesn't count unselected services or clips longer than the source", () => {
    expect(eligibleShorts(45).map((short) => short.seconds)).toEqual([30]);
    expect(estimateCart([video(45, { shorts: [30, 30, 60] }), video(90, { service: null, shorts: [90] })]))
      .toMatchObject({ dubSeconds: 45, lipSeconds: 0, shorts: 1500 });
  });
});
