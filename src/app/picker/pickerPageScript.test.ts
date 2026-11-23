import { describe, expect, it } from "vitest";
import vm from "node:vm";
import type { ReactElement } from "react";

import { GoogleDrivePickerShell } from "./page";
import { PICKER_HANDOFF_KEY } from "@/lib/pickerLaunch";

const TOKEN = "ya29.a0AfB_byC-token_value.123";
const STATE = "6f1c2c1e-1f7a-4b4f-9a39-3a5c2d1e0f00";

/** Finds the inline <Script id="terminal-sync-picker"> source in the shell. */
function pickerScriptSource(): string {
  const stack: unknown[] = [GoogleDrivePickerShell({ lang: "es" })];
  while (stack.length) {
    const node = stack.pop();
    if (!node || typeof node !== "object") continue;
    if (Array.isArray(node)) {
      stack.push(...node);
      continue;
    }
    const el = node as ReactElement<{ id?: string; children?: unknown }>;
    if (el.props?.id === "terminal-sync-picker" && typeof el.props.children === "string") {
      return el.props.children;
    }
    if (el.props?.children) stack.push(el.props.children);
  }
  throw new Error("picker script not found");
}

function runPickerPage({ search, hash, stored }: { search: string; hash: string; stored?: string }) {
  const storage = new Map<string, string>();
  if (stored !== undefined) storage.set(PICKER_HANDOFF_KEY, stored);
  const oauthTokens: string[] = [];
  const replacedUrls: string[] = [];
  const location = { search, hash, pathname: "/picker", hostname: "terminalsync.ai", origin: "https://terminalsync.ai", href: "" };

  class Builder {
    addView() { return this; }
    setOAuthToken(token: string) { oauthTokens.push(token); return this; }
    setDeveloperKey() { return this; }
    setAppId() { return this; }
    setOrigin() { return this; }
    setCallback() { return this; }
    enableFeature() { return this; }
    setSize() { return this; }
    setTitle() { return this; }
    build() { return { setVisible() {} }; }
  }
  class DocsView {
    setParent() { return this; }
    setIncludeFolders() { return this; }
    setSelectFolderEnabled() { return this; }
    setMimeTypes() { return this; }
  }
  const google = {
    picker: { PickerBuilder: Builder, DocsView, ViewId: {}, Action: {}, Feature: {} },
  };
  const window = {
    location,
    sessionStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      removeItem: (key: string) => void storage.delete(key),
    },
    history: {
      replaceState: (_s: unknown, _t: string, url: string) => {
        replacedUrls.push(url);
        location.hash = "";
      },
    },
    gapi: { load: (_name: string, opts: { callback: () => void }) => opts.callback() },
    setTimeout: () => 0,
  };
  const document = { getElementById: () => null };
  vm.runInNewContext(pickerScriptSource(), {
    window,
    document,
    google,
    URLSearchParams,
    JSON,
    Date,
    Object,
    String,
  });
  return { oauthTokens, replacedUrls, storage };
}

const SEARCH = `?redirect=${encodeURIComponent("http://127.0.0.1:5/picker-callback")}&state=${STATE}&mode=files&clientId=1-x.apps.googleusercontent.com&appId=1`;

describe("picker page token hand-off", () => {
  it("uses the token left by /picker/launch and deletes it", () => {
    const run = runPickerPage({
      search: SEARCH,
      hash: "",
      stored: JSON.stringify({ state: STATE, accessToken: TOKEN, at: Date.now() }),
    });
    expect(run.oauthTokens).toEqual([TOKEN]);
    expect(run.storage.has(PICKER_HANDOFF_KEY)).toBe(false);
    expect(run.replacedUrls).toEqual([]);
  });

  it("ignores a hand-off from another picker session", () => {
    const run = runPickerPage({
      search: SEARCH,
      hash: "",
      stored: JSON.stringify({ state: "other-state", accessToken: TOKEN, at: Date.now() }),
    });
    expect(run.oauthTokens).toEqual([]);
    expect(run.storage.has(PICKER_HANDOFF_KEY)).toBe(false);
  });

  it("ignores a stale hand-off", () => {
    const run = runPickerPage({
      search: SEARCH,
      hash: "",
      stored: JSON.stringify({ state: STATE, accessToken: TOKEN, at: Date.now() - 11 * 60 * 1000 }),
    });
    expect(run.oauthTokens).toEqual([]);
  });

  it("still accepts older desktop apps' fragment, then wipes it from the address bar", () => {
    const run = runPickerPage({ search: SEARCH, hash: `#access_token=${TOKEN}` });
    expect(run.oauthTokens).toEqual([TOKEN]);
    expect(run.replacedUrls).toEqual([`/picker${SEARCH}`]);
  });
});
