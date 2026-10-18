import { afterEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { config, middleware } from "./middleware";

const originalTeamFeature = process.env.TEAM_FEATURE_ENABLED;

afterEach(() => {
  if (originalTeamFeature === undefined) delete process.env.TEAM_FEATURE_ENABLED;
  else process.env.TEAM_FEATURE_ENABLED = originalTeamFeature;
});

describe("Team availability middleware", () => {
  it("matches Team APIs and fails closed by default without calling their route", async () => {
    delete process.env.TEAM_FEATURE_ENABLED;
    expect(config.matcher).toContain("/api/team/:path*");

    const response = middleware(new NextRequest("https://terminalsync.ai/api/team/trial"));
    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({ error: "Team is temporarily unavailable" });
  });

  it("allows the Team route chain only after the exact server flag is enabled", () => {
    process.env.TEAM_FEATURE_ENABLED = "1";
    const response = middleware(new NextRequest("https://terminalsync.ai/api/team/trial"));
    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("does not block unrelated API routes", () => {
    delete process.env.TEAM_FEATURE_ENABLED;
    const response = middleware(new NextRequest("https://terminalsync.ai/api/checkout"));
    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });
});
