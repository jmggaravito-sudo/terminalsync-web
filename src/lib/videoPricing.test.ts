import { describe, expect, it } from "vitest";
import { VIDEO_PRICE_MICROS_TABLE, videoPriceMicros } from "./videoPricing";

describe("server video price", () => {
  it("fixes every model and duration the app can sell (cost x2)", () => {
    expect(VIDEO_PRICE_MICROS_TABLE).toEqual({
      "ts-video-standard": { 5: 600_000, 10: 1_200_000 },
      "ltx-2.3-text-to-video": { 5: 300_000, 10: 600_000 },
      "wan-2.6-text-to-video": { 5: 1_000_000, 10: 2_000_000 },
      "vidu-q3-turbo-image-to-video": { 5: 600_000, 10: 1_200_000 },
      "vidu-q3-image-to-video": { 5: 1_500_000, 10: 3_000_000 },
      "vidu-start-end-q2-pro": { 5: 600_000, 8: 960_000 },
      "wan-2.7-reference-to-video": { 5: 2_000_000, 10: 4_000_000 },
      "seedance-2.0-video-extend": { 5: 2_500_000, 10: 5_000_000 },
      "luma-ray-3.2-video-edit": { 5: 2_200_000, 10: 4_400_000 },
    });
  });

  it("returns the exact price for a known pair", () => {
    expect(videoPriceMicros("wan-2.6-text-to-video", 5)).toBe(1_000_000);
    expect(videoPriceMicros("vidu-start-end-q2-pro", 8)).toBe(960_000);
  });

  it.each([
    ["unknown model", "no-such-model", 5],
    ["prototype key", "__proto__", 5],
    ["unlisted duration", "ltx-2.3-text-to-video", 8],
    ["fractional duration", "ltx-2.3-text-to-video", 5.5],
    ["string duration", "ltx-2.3-text-to-video", "5"],
    ["missing model", undefined, 5],
    ["missing duration", "ltx-2.3-text-to-video", undefined],
  ])("refuses %s instead of guessing a price", (_name, model, duration) => {
    expect(videoPriceMicros(model, duration)).toBeNull();
  });
});
