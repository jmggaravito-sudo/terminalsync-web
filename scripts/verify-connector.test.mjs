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

describe("remote connectors where mcp-remote cannot log in", () => {
  it.each(["en", "es"])("keeps Alegra %s on the OAuth root and blocked until login works", async (lang) => {
    const { verifyFile } = await import("./verify-connector.mjs");
    const file = `content/connectors/${lang}/alegra.md`;
    const text = (await import("node:fs")).readFileSync(file, "utf8");
    const data = (await import("gray-matter")).default(text).data;
    expect(data.manifest.mcpServers.alegra.args).toEqual(["-y", "mcp-remote@latest", "https://mcp.alegra.com"]);
    expect(data.manifest.mcpServers.alegra.env).toBeUndefined();
    expect(text).not.toContain("ALEGRA_API_TOKEN_BASE64");
    expect(data.installableForAi).toBe(false);
    expect(await verifyFile(file, { verifiedAt: "2026-10-16T00:00:00.000Z" })).toMatchObject({
      slug: "alegra", installableForAi: false, installableForAiReason: "needs-oauth",
    });
  });
  it("keeps zoom blocked: mcp-remote cannot log in there", async () => {
    const { verifyFile } = await import("./verify-connector.mjs");
    const r = await verifyFile("content/connectors/en/zoom.md", { verifiedAt: "2026-10-08T00:00:00.000Z" });
    expect(r).toMatchObject({ slug: "zoom", installableForAi: false, installableForAiReason: "needs-oauth" });
  });
  it("keeps factorial blocked: its OAuth issuer lives on another domain and mcp-remote rejects the mismatch", async () => {
    const { verifyFile } = await import("./verify-connector.mjs");
    const r = await verifyFile("content/connectors/en/factorial.md", { verifiedAt: "2026-10-16T00:00:00.000Z" });
    expect(r).toMatchObject({ slug: "factorial", installableForAi: false, installableForAiReason: "needs-oauth" });
  });
});

import fs from "node:fs";
import matter from "gray-matter";
import { OAUTH_CONNECTORS } from "./verify-connector.mjs";

describe("Google connectors stay blocked until the app can supply GOOGLE_ACCESS_TOKEN", () => {
  it("keeps gmail, google-calendar and google-sheets in OAUTH_CONNECTORS", () => {
    expect([...OAUTH_CONNECTORS].sort()).toEqual(["gmail", "google-calendar", "google-sheets"]);
  });
  it.each(["en", "es"])("%s fichas are not installable and say needs-oauth", (lang) => {
    for (const slug of OAUTH_CONNECTORS) {
      const { data } = matter(fs.readFileSync(`content/connectors/${lang}/${slug}.md`, "utf8"));
      expect(data.installableForAi).toBe(false);
      expect(data.installableForAiReason).toBe("needs-oauth");
    }
  });
});
