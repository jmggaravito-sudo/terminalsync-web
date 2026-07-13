import { describe, expect, it } from "vitest";
import { buildSupabaseDeepLink } from "./buildSupabaseDeepLink";

describe("buildSupabaseDeepLink", () => {
  it("returns null when no code and no hash access_token", () => {
    expect(buildSupabaseDeepLink({}, "")).toBeNull();
    expect(buildSupabaseDeepLink({}, "type=magiclink")).toBeNull();
    expect(buildSupabaseDeepLink({ state: "abc" }, "")).toBeNull();
  });

  it("uses terminalsync-lab scheme when flavor=lab", () => {
    const link = buildSupabaseDeepLink({ code: "xyz", flavor: "lab" }, "");
    expect(link).toBe("terminalsync-lab://auth/callback?code=xyz");
  });

  it("defaults to terminalsync scheme when flavor missing", () => {
    const link = buildSupabaseDeepLink({ code: "xyz" }, "");
    expect(link).toBe("terminalsync://auth/callback?code=xyz");
  });

  it("preserves query state on the deep link", () => {
    const link = buildSupabaseDeepLink({ code: "abc", state: "s1" }, "");
    expect(link).toContain("code=abc");
    expect(link).toContain("state=s1");
  });

  it("percent-encodes untrusted param values", () => {
    const link = buildSupabaseDeepLink(
      { code: "a b&c", state: "s+1" },
      "",
    );
    expect(link).toContain("code=a%20b%26c");
    expect(link).toContain("state=s%2B1");
  });

  it("carries the URL fragment through for implicit-flow tokens", () => {
    const link = buildSupabaseDeepLink(
      { flavor: "lab" },
      "access_token=eyABC&refresh_token=eyDEF&expires_in=3600",
    );
    expect(link).toBe(
      "terminalsync-lab://auth/callback#access_token=eyABC&refresh_token=eyDEF&expires_in=3600",
    );
  });

  it("carries both query code and hash when both present (defensive)", () => {
    const link = buildSupabaseDeepLink(
      { code: "c1", flavor: "lab" },
      "access_token=eyABC",
    );
    expect(link).toBe(
      "terminalsync-lab://auth/callback?code=c1#access_token=eyABC",
    );
  });
});
