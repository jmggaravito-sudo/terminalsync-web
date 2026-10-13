import { describe, expect, it } from "vitest";
import { classifyOutput, extractRemoteUrl, remoteTargets } from "./smoke-remote-login.mjs";

describe("smoke-remote-login", () => {
  it("extracts the vendor URL from an mcp-remote recipe", () => {
    expect(extractRemoteUrl({ command: "npx", args: ["-y", "mcp-remote@latest", "https://mcp.example.com/mcp"] })).toBe("https://mcp.example.com/mcp");
    expect(extractRemoteUrl({ command: "npx", args: ["-y", "some-server"] })).toBeNull();
    expect(extractRemoteUrl(null)).toBeNull();
  });
  it("passes when mcp-remote reaches the authorization step", () => {
    expect(classifyOutput("Please authorize this client by visiting:\nhttps://x/authorize", "").ok).toBe(true);
    expect(classifyOutput("", "https://x/authorize?client_id=1").ok).toBe(true);
  });
  it("fails on a server without dynamic client registration (Asana /v2/mcp, Zoom)", () => {
    const r = classifyOutput("Fatal error: Error: Incompatible auth server: does not support dynamic client registration", "");
    expect(r).toMatchObject({ ok: false, reason: "no-dcr" });
  });
  it("fails on a wrong URL (Siigo root answered 404)", () => {
    const r = classifyOutput('Received error (status 404): Error POSTing to endpoint: { "statusCode": 404 }', "");
    expect(r).toMatchObject({ ok: false, reason: "http-404" });
  });
  it("fails when nothing ever reaches login", () => {
    expect(classifyOutput("", "")).toMatchObject({ ok: false, reason: "no-login" });
  });
  it("only targets remote connectors that are not already declared blocked", () => {
    const slugs = remoteTargets(["siigo", "zoom", "stripe", "does-not-exist"]).map((t) => t.slug);
    expect(slugs).toContain("siigo");
    expect(slugs).not.toContain("zoom");
    expect(slugs).not.toContain("stripe");
  });
});
