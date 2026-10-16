import { describe, expect, it } from "vitest";
import { superviseExisting } from "./supervise-existing.mjs";

describe("focused supervision of existing connector", () => {
  it("does not mistake Alegra Colombia catalog presence for installability", async () => {
    const result = await superviseExisting({ slug: "alegra" }, "CO");
    expect(result.outcome).toBe("catalog_blocked");
    expect(result.checks.marketListed).toBe(true);
    expect(result.checks.statusAvailable).toBe(false);
    expect(result.checks.probeInstallable).toBe(false);
    expect(result.appSmoke).toBe("not_run");
  });

  it("rejects a path-like slug", async () => {
    await expect(superviseExisting({ slug: "../secrets" }, "CO")).rejects.toThrow("Invalid research slug");
  });
});
