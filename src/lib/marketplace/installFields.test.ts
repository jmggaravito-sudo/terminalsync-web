import { describe, expect, it } from "vitest";
import {
  deriveInstallFromManifest,
  mergeInstallFields,
  readInstallOverrideFromFrontmatter,
} from "./installFields";

describe("deriveInstallFromManifest", () => {
  it("returns empty for null/undefined manifest", () => {
    expect(deriveInstallFromManifest(undefined)).toEqual({});
    expect(deriveInstallFromManifest(null)).toEqual({});
  });

  it("returns empty when no mcpServers", () => {
    expect(deriveInstallFromManifest({})).toEqual({});
    expect(deriveInstallFromManifest({ otherKey: 1 })).toEqual({});
  });

  it("returns empty for multi-server manifests (ambiguous)", () => {
    const manifest = {
      mcpServers: {
        a: { command: "npx", args: ["-y", "a"] },
        b: { command: "npx", args: ["-y", "b"] },
      },
    };
    expect(deriveInstallFromManifest(manifest)).toEqual({});
  });

  it("detects npm shape", () => {
    const manifest = {
      mcpServers: {
        gmail: {
          command: "npx",
          args: ["-y", "@gongrzhe/server-gmail-autoauth-mcp"],
        },
      },
    };
    const out = deriveInstallFromManifest(manifest);
    expect(out.installMethod).toBe("npm");
    expect(out.installSpec).toBe("@gongrzhe/server-gmail-autoauth-mcp");
    expect(out.installArgs).toBeUndefined();
  });

  it("captures extra args after npm package", () => {
    const manifest = {
      mcpServers: {
        x: { command: "npx", args: ["-y", "pkg", "--flag", "value"] },
      },
    };
    const out = deriveInstallFromManifest(manifest);
    expect(out.installSpec).toBe("pkg");
    expect(out.installArgs).toEqual(["--flag", "value"]);
  });

  it("detects local (node) shape", () => {
    const manifest = {
      mcpServers: {
        custom: { command: "node", args: ["/Users/me/mcp/server.js"] },
      },
    };
    const out = deriveInstallFromManifest(manifest);
    expect(out.installMethod).toBe("local");
    expect(out.installSpec).toBe("/Users/me/mcp/server.js");
  });

  it("returns empty for unrecognized commands (e.g. python, go binaries)", () => {
    const manifest = {
      mcpServers: {
        py: { command: "python3", args: ["/abs/server.py"] },
      },
    };
    expect(deriveInstallFromManifest(manifest)).toEqual({});
  });

  it("returns empty for npx without -y", () => {
    const manifest = {
      mcpServers: { x: { command: "npx", args: ["pkg"] } },
    };
    expect(deriveInstallFromManifest(manifest)).toEqual({});
  });

  it("extracts ${SECRET:NAME} env mappings into installEnv", () => {
    const manifest = {
      mcpServers: {
        gmail: {
          command: "npx",
          args: ["-y", "@gongrzhe/server-gmail-autoauth-mcp"],
          env: {
            GMAIL_API_KEY: "${SECRET:GMAIL_API_KEY}",
            DEBUG: "true",
          },
        },
      },
    };
    const out = deriveInstallFromManifest(manifest);
    expect(out.installEnv).toEqual({ GMAIL_API_KEY: "GMAIL_API_KEY" });
  });

  it("returns env undefined when no SECRET placeholders", () => {
    const manifest = {
      mcpServers: {
        x: {
          command: "npx",
          args: ["-y", "pkg"],
          env: { DEBUG: "true" },
        },
      },
    };
    const out = deriveInstallFromManifest(manifest);
    expect(out.installEnv).toBeUndefined();
  });
});

describe("readInstallOverrideFromFrontmatter", () => {
  it("reads flat fields", () => {
    const fm = {
      installMethod: "github",
      installSpec: "https://github.com/owner/repo",
      installArgs: ["--debug"],
      installEnv: { API_KEY: "MY_KEY" },
    };
    expect(readInstallOverrideFromFrontmatter(fm)).toEqual({
      installMethod: "github",
      installSpec: "https://github.com/owner/repo",
      installArgs: ["--debug"],
      installEnv: { API_KEY: "MY_KEY" },
    });
  });

  it("ignores non-string args", () => {
    const fm = { installArgs: ["--debug", 42, null, "value"] };
    expect(readInstallOverrideFromFrontmatter(fm)).toEqual({
      installArgs: ["--debug", "value"],
    });
  });

  it("returns empty for empty fm", () => {
    expect(readInstallOverrideFromFrontmatter({})).toEqual({});
  });
});

describe("mergeInstallFields", () => {
  it("override wins per-field", () => {
    const derived = {
      installMethod: "npm",
      installSpec: "pkg-a",
      installArgs: ["--auto"],
    };
    const override = { installMethod: "github", installSpec: "https://x/y" };
    expect(mergeInstallFields(derived, override)).toEqual({
      installMethod: "github",
      installSpec: "https://x/y",
      installArgs: ["--auto"],
      installEnv: undefined,
    });
  });

  it("falls back to derived when override missing", () => {
    const derived = { installMethod: "npm", installSpec: "pkg" };
    expect(mergeInstallFields(derived, {})).toEqual({
      installMethod: "npm",
      installSpec: "pkg",
      installArgs: undefined,
      installEnv: undefined,
    });
  });
});
