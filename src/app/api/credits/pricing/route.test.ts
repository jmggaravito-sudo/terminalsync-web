import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/trm", () => ({
  TRM_FALLBACK: 3_204.51,
  getTrm: vi.fn(async () => ({ value: 3_204.51, date: "2026-08-05", source: "live" })),
}));

import { GET, OPTIONS } from "./route";

describe("GET /api/credits/pricing", () => {
  it("serves the peso price from the same place that charges it", async () => {
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.currency).toBe("COP");
    // The app must not have to multiply anything: these are the amounts a
    // customer will actually be charged.
    expect(body.packages["1000"]).toBe(34_600);
    expect(body.packages["2000"]).toBe(69_200);
  });

  it("returns a rate the app can apply to an arbitrary balance", async () => {
    const body = await (await GET()).json();
    // Balance is any amount, not one of the packages, so the app needs the rate.
    expect(body.rate).toBeCloseTo(3_204.51 * 1.08, 2);
    // The bare legal rate travels too, so the number can be explained.
    expect(body.trm).toBe(3_204.51);
    expect(body.source).toBe("live");
  });

  it("prices every package on round pesos", async () => {
    const body = await (await GET()).json();
    for (const amount of Object.values(body.packages) as number[]) {
      expect(amount % 100).toBe(0);
    }
  });

  it("allows the desktop client to read prices cross-origin", async () => {
    const res = await GET(
      new Request("https://terminalsync.ai/api/credits/pricing", {
        headers: { origin: "tauri://localhost" },
      }),
    );

    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("tauri://localhost");
    expect(res.headers.get("Access-Control-Allow-Methods")).toBe("GET, OPTIONS");
    expect(res.headers.get("Vary")).toBe("Origin");
  });

  it("answers the desktop client's preflight", async () => {
    const res = await OPTIONS(
      new Request("https://terminalsync.ai/api/credits/pricing", {
        headers: { origin: "tauri://localhost" },
      }),
    );

    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("tauri://localhost");
  });
});
