import { describe, expect, it } from "vitest";
import { extractSecretNames, manifestRequiresEnvSecrets } from "./secrets";

describe("extractSecretNames", () => {
  it("finds a single placeholder in a string value", () => {
    const env = { NOTION_API_KEY: "${SECRET:NOTION_API_KEY}" };
    expect(extractSecretNames(env)).toEqual(["NOTION_API_KEY"]);
  });

  it("walks nested objects and arrays", () => {
    const manifest = {
      mcpServers: {
        thing: {
          command: "npx",
          args: ["-y", "@org/pkg", "--token", "${SECRET:GH_TOKEN}"],
          env: {
            API_KEY: "${SECRET:API_KEY}",
            REGION: "us-east-1",
          },
        },
      },
    };
    expect(extractSecretNames(manifest)).toEqual(["API_KEY", "GH_TOKEN"]);
  });

  it("returns names sorted ascending so the output is stable", () => {
    // Note the insertion order is z → a → m; sorted output guarantees
    // the manifest endpoint can compare/checksum responses across runs.
    const obj = {
      a: "${SECRET:Z_KEY}",
      b: "${SECRET:A_KEY}",
      c: "${SECRET:M_KEY}",
    };
    expect(extractSecretNames(obj)).toEqual(["A_KEY", "M_KEY", "Z_KEY"]);
  });

  it("dedupes the same placeholder appearing multiple times", () => {
    const obj = {
      a: "${SECRET:DUP}",
      b: "${SECRET:DUP}",
      nested: { c: "${SECRET:DUP}" },
    };
    expect(extractSecretNames(obj)).toEqual(["DUP"]);
  });

  it("rejects lowercase secret names (deliberate)", () => {
    // The convention is uppercase. Lowercase would suggest a stray
    // user mistake; we'd rather fail loudly than silently treat as a
    // secret. The regex requires [A-Z0-9_]+.
    const obj = { a: "${SECRET:lowercase_key}" };
    expect(extractSecretNames(obj)).toEqual([]);
  });

  it("returns [] when nothing resembles a placeholder", () => {
    const obj = {
      env: { REGION: "us-east-1", FOO: "literal" },
      args: ["-y", "@org/pkg"],
    };
    expect(extractSecretNames(obj)).toEqual([]);
  });

  it("handles primitives and nulls without crashing", () => {
    expect(extractSecretNames(null)).toEqual([]);
    expect(extractSecretNames(undefined)).toEqual([]);
    expect(extractSecretNames(42)).toEqual([]);
    expect(extractSecretNames(true)).toEqual([]);
    expect(extractSecretNames("")).toEqual([]);
  });
});

describe("manifestRequiresEnvSecrets", () => {
  it("returns true when at least one placeholder is present", () => {
    expect(
      manifestRequiresEnvSecrets({ env: { K: "${SECRET:K}" } }),
    ).toBe(true);
  });

  it("returns false on a manifest with no placeholders", () => {
    expect(
      manifestRequiresEnvSecrets({
        mcpServers: {
          static: { command: "npx", args: ["-y", "pkg"] },
        },
      }),
    ).toBe(false);
  });

  it("returns false on null/undefined input", () => {
    expect(manifestRequiresEnvSecrets(null)).toBe(false);
    expect(manifestRequiresEnvSecrets(undefined)).toBe(false);
  });
});
