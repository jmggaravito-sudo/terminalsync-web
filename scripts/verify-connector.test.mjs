import { describe, expect, it } from "vitest";
import { parseRecipe, validateSlug } from "./verify-connector.mjs";

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
});
