import { describe, expect, it } from "vitest";
import { teamJson } from "./teamApiResponse";

describe("teamJson", () => {
  it("makes every Team response no-store while preserving status and route headers", async () => {
    const response = teamJson(
      { error: "Request was not updated" },
      { status: 409, headers: { Allow: "GET", "X-Team-Test": "kept" } },
    );

    expect(response.status).toBe(409);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("allow")).toBe("GET");
    expect(response.headers.get("x-team-test")).toBe("kept");
    await expect(response.json()).resolves.toEqual({ error: "Request was not updated" });
  });
});
