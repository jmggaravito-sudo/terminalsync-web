import { describe, expect, it } from "vitest";
import { normalizeCallbackLang, resolveCallbackLang } from "./callbackLang";

describe("normalizeCallbackLang", () => {
  it("uses English when OAuth callback carries lang=en", () => {
    expect(normalizeCallbackLang("en")).toBe("en");
    expect(normalizeCallbackLang("en-US")).toBe("en");
  });

  it("keeps Spanish as the default for legacy callbacks without lang", () => {
    expect(normalizeCallbackLang()).toBe("es");
    expect(normalizeCallbackLang("es")).toBe("es");
    expect(normalizeCallbackLang("fr")).toBe("es");
  });
});


describe("resolveCallbackLang", () => {
  it("prefers explicit lang query over state and browser language", () => {
    expect(resolveCallbackLang({ explicitLang: "en", state: "tslang:es:abc", acceptLanguage: "es" })).toBe("en");
  });

  it("reads the Terminal Sync app language from the OAuth state marker", () => {
    expect(resolveCallbackLang({ state: "tslang:en:abc", acceptLanguage: "es" })).toBe("en");
    expect(resolveCallbackLang({ state: "tslang:es:abc", acceptLanguage: "en-US" })).toBe("es");
  });

  it("falls back to browser language for legacy states", () => {
    expect(resolveCallbackLang({ state: "legacy", acceptLanguage: "en-US,en;q=0.9" })).toBe("en");
  });
});
