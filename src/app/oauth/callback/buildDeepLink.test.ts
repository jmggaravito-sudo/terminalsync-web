import { describe, expect, it } from "vitest";
import {
  buildDeepLink,
  encodeStateWithLiteralColon,
  LAB_STATE_PREFIX,
} from "./buildDeepLink";

// JM's exact smoke contract from the task brief:
//
//   state=tslab:abc123 → terminalsync-lab://oauth/callback?code=...&state=tslab:abc123
//   state=abc123       → terminalsync://oauth/callback?code=...&state=abc123 (unchanged from before)
//   Prod must NOT change behaviour.
//
// The Lab login was hanging 5 min and timing out because the helper used
// URLSearchParams and the resulting `state=tslab%3A...` failed the native
// app's byte-exact CSRF check. Tests pin both the scheme choice and the
// literal-colon serialization to lock that fix.

describe("buildDeepLink — scheme selection", () => {
  it("Lab: state with tslab: prefix routes to terminalsync-lab scheme", () => {
    const url = buildDeepLink({
      code: "4/0AANS-aaaaaa",
      state: "tslab:abc123",
    });
    expect(url).not.toBeNull();
    expect(url!).toMatch(/^terminalsync-lab:\/\/oauth\/callback\?/);
  });

  it("prod: state without tslab: prefix routes to terminalsync scheme", () => {
    const url = buildDeepLink({
      code: "4/0AANS-aaaaaa",
      state: "abc123",
    });
    expect(url).not.toBeNull();
    expect(url!).toMatch(/^terminalsync:\/\/oauth\/callback\?/);
    expect(url!).not.toMatch(/terminalsync-lab/);
  });

  it("Lab defensive: pre-encoded prefix (tslab%3A) still routes to Lab", () => {
    // Some upstream paths re-encode the state. We still need to recognise
    // it as Lab so the deep link doesn't accidentally open the prod app.
    const url = buildDeepLink({
      code: "code",
      state: "tslab%3Aabc123",
    });
    expect(url!).toMatch(/^terminalsync-lab:\/\/oauth\/callback\?/);
  });

  it("missing code returns null (caller renders malformed-params card)", () => {
    expect(buildDeepLink({ state: "tslab:abc" })).toBeNull();
  });

  it("missing state returns null", () => {
    expect(buildDeepLink({ code: "abc" })).toBeNull();
  });
});

describe("buildDeepLink — state byte-exact across the round trip", () => {
  it("state=tslab:abc123 keeps the literal colon (NOT %3A)", () => {
    const url = buildDeepLink({
      code: "4/0AANS-aaaaaa",
      state: "tslab:abc123",
    });
    expect(url!).toContain("state=tslab:abc123");
    expect(url!).not.toContain("state=tslab%3A");
  });

  it("prod state unchanged (no colon to begin with — just confirms no regression)", () => {
    const url = buildDeepLink({
      code: "4/0AANS-aaaaaa",
      state: "abc123",
    });
    expect(url!).toContain("state=abc123");
  });

  it("state with colons elsewhere keeps ALL colons literal too", () => {
    // The fix isn't conditional on the `tslab:` prefix — any colon in the
    // state survives. Future-proofs the helper if prod state adds delimiters.
    const url = buildDeepLink({
      code: "c",
      state: "prefix:scope:rand",
    });
    expect(url!).toContain("state=prefix:scope:rand");
  });

  it("state with space + ampersand: those DO get percent-encoded (transport safety)", () => {
    // Only `:` is special. Everything else gets the normal encodeURIComponent
    // treatment so URL parsing on the receiver doesn't split on raw delimiters.
    const url = buildDeepLink({
      code: "c",
      state: "tslab:a b&c",
    });
    expect(url!).toContain("state=tslab:a%20b%26c");
  });
});

describe("buildDeepLink — code and scope encoding", () => {
  it("code is percent-encoded (Google's codes contain `/`)", () => {
    const url = buildDeepLink({
      code: "4/0AANS_ab/cd",
      state: "abc",
    });
    expect(url!).toContain("code=4%2F0AANS_ab%2Fcd");
  });

  it("scope is included and percent-encoded when present", () => {
    const url = buildDeepLink({
      code: "c",
      state: "abc",
      scope: "openid email profile https://www.googleapis.com/auth/drive.file",
    });
    expect(url!).toContain(
      "scope=openid%20email%20profile%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.file",
    );
  });

  it("scope is omitted from the URL when not provided", () => {
    const url = buildDeepLink({ code: "c", state: "abc" });
    expect(url!).not.toContain("scope=");
  });
});

describe("encodeStateWithLiteralColon — direct contract", () => {
  it("converts %3A back to literal :", () => {
    expect(encodeStateWithLiteralColon("tslab:abc")).toBe("tslab:abc");
  });

  it("encodes other special chars normally", () => {
    expect(encodeStateWithLiteralColon("a b&c=d")).toBe("a%20b%26c%3Dd");
  });

  it("leaves alphanumeric strings untouched", () => {
    expect(encodeStateWithLiteralColon("abc123")).toBe("abc123");
  });
});

describe("LAB_STATE_PREFIX is exported for the app generator side", () => {
  // Pin the constant so the desktop app — which puts the prefix INTO
  // the state when starting the OAuth flow — can import it from a
  // single source of truth (cross-repo doc, not import).
  it("is exactly the string 'tslab:'", () => {
    expect(LAB_STATE_PREFIX).toBe("tslab:");
  });
});
