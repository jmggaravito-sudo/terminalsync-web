import { describe, expect, it } from "vitest";
import { parseRecipe, responseMatchesId, validateSlug } from "./verify-connector.mjs";

describe("connector installability contract", () => {
  it("accepts the npx recipe and preserves runtime args", () => {
    expect(parseRecipe({ command: "npx", args: ["-y", "--silent", "@scope/server@1.2.3", "--stdio"] })).toEqual({
      packageName: "@scope/server", packageSpec: "@scope/server@1.2.3", version: "1.2.3", runtimeArgs: ["--stdio"],
    });
  });

  it("accepts the registry flag but rejects remote wrappers and other runners", () => {
    expect(parseRecipe({ command: "npx", args: ["-y", "--registry=https://registry.npmjs.org", "server"] }).packageName).toBe("server");
    expect(parseRecipe({ command: "npx", args: ["-y", "mcp-remote@latest", "https://example.com/mcp"] }).reason).toBe("recipe-not-npx");
    expect(parseRecipe({ command: "uvx", args: ["server"] }).reason).toBe("recipe-not-npx");
  });

  it("rejects unsafe package specs and invalid slugs", () => {
    expect(parseRecipe({ command: "npx", args: ["-y", "File:../local"] }).reason).toBe("package-invalid");
    expect(validateSlug("context7")).toBe(true);
    expect(validateSlug("bad__name")).toBe(false);
    expect(validateSlug("meta-ads")).toBe(false);
    expect(validateSlug("UPPER")).toBe(false);
  });

  it("requires the exact JSON-RPC id instead of pairing by response order", () => {
    expect(responseMatchesId({ result: {} }, 1)).toBe(false);
    expect(responseMatchesId({ id: 2, result: {} }, 1)).toBe(false);
    expect(responseMatchesId({ id: 1, result: {} }, 1)).toBe(true);
  });
});

import { isMcpRemote } from "./verify-connector.mjs";
import { REASONS } from "./verify-connector.mjs";

describe("remote connectors (mcp-remote)", () => {
  it("detects an mcp-remote recipe, pinned or not", () => {
    expect(isMcpRemote({ command: "npx", args: ["-y", "mcp-remote", "https://mcp.siigo.com"] })).toBe(true);
    expect(isMcpRemote({ command: "npx", args: ["-y", "mcp-remote@latest", "https://x.test/mcp"] })).toBe(true);
    expect(isMcpRemote({ command: "npx", args: ["-y", "@scope/other-server"] })).toBe(false);
    expect(isMcpRemote(null)).toBe(false);
  });
  it("knows the remote-needs-login reason", () => {
    expect(REASONS.has("remote-needs-login")).toBe(true);
  });
});

describe("remote connectors without dynamic client registration", () => {
  it("keeps zoom blocked: mcp-remote cannot log in there", async () => {
    const { verifyFile } = await import("./verify-connector.mjs");
    const r = await verifyFile("content/connectors/en/zoom.md", { verifiedAt: "2026-10-08T00:00:00.000Z" });
    expect(r).toMatchObject({ slug: "zoom", installableForAi: false, installableForAiReason: "needs-oauth" });
  });
});
