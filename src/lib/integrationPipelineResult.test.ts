import { describe, expect, it } from "vitest";
import { pipelineAnswer, validPipelineCountry } from "./integrationPipelineResult";

describe("country-aware integration answer", () => {
  it("accepts only concrete countries", () => {
    expect(validPipelineCountry("CO")).toBe(true);
    expect(validPipelineCountry("GLOBAL")).toBe(false);
    expect(validPipelineCountry("ZZ")).toBe(false);
  });

  it("does not call a catalog-only disabled connector ready", () => {
    expect(pipelineAnswer({ verdict: "exists", reason: "status: soon", markets: { codes: ["CO"] } }, "CO").outcome)
      .toBe("already_cataloged");
    expect(pipelineAnswer({ verdict: "exists", reason: "status: soon" }, "CO", { outcome: "catalog_blocked" }).outcome)
      .toBe("catalog_blocked");
    expect(pipelineAnswer({ verdict: "exists" }, "CO", { outcome: "needs_app_smoke" }, { status: "failure" }).outcome)
      .toBe("global_blocked");
    expect(pipelineAnswer({ verdict: "exists" }, "CO", { outcome: "needs_app_smoke" }, { status: "success" }).outcome)
      .toBe("already_cataloged");
  });

  it("requires official MCP and country evidence before build", () => {
    const research = { verdict: "ship_official", official: { exists: true }, markets: { codes: ["MX"], evidence: ["https://vendor.test/mx"] } };
    expect(pipelineAnswer(research, "CO").outcome).toBe("country_unverified");
    expect(pipelineAnswer(research, "MX").outcome).toBe("can_build");
  });
});
