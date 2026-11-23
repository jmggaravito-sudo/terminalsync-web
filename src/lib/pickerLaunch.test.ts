import { describe, expect, it } from "vitest";
import vm from "node:vm";

import {
  PICKER_HANDOFF_KEY,
  PICKER_LAUNCH_PROBE,
  isAllowedPickerCallback,
  isAllowedPickerLaunchOrigin,
  parsePickerLaunchForm,
  pickerPageTarget,
  renderPickerLaunchPage,
} from "./pickerLaunch";
import { GET, POST } from "@/app/picker/launch/route";

const TOKEN = "ya29.a0AfB_byC-token_value.123";

function form(overrides: Record<string, string | string[] | undefined> = {}) {
  const base: Record<string, string | string[] | undefined> = {
    redirect: "http://127.0.0.1:53111/picker-callback",
    cancel: "http://127.0.0.1:53111/picker-cancel",
    state: "6f1c2c1e-1f7a-4b4f-9a39-3a5c2d1e0f00",
    clientId: "12345-example.apps.googleusercontent.com",
    appId: "12345",
    mode: "files",
    access_token: TOKEN,
    ...overrides,
  };
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(base)) {
    if (value === undefined) continue;
    for (const v of Array.isArray(value) ? value : [value]) params.append(key, v);
  }
  return params;
}

function launchRequest(body: URLSearchParams | string, headers: Record<string, string> = {}) {
  return new Request("https://terminalsync.ai/picker/launch", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      origin: "http://127.0.0.1:53111",
      ...headers,
    },
    body: typeof body === "string" ? body : body.toString(),
  });
}

/** Runs the launch page's inline script against a fake browser. */
function runLaunchPage(html: string, storage: { throws?: boolean } = {}) {
  const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  if (!script) throw new Error("launch page has no inline script");
  const stored = new Map<string, string>();
  let replacedWith = "";
  const window = {
    sessionStorage: {
      setItem(key: string, value: string) {
        if (storage.throws) throw new Error("blocked");
        stored.set(key, value);
      },
    },
    location: {
      replace(url: string) {
        replacedWith = url;
      },
    },
  };
  vm.runInNewContext(script, { window, Date, JSON, encodeURIComponent });
  return { stored, replacedWith };
}

describe("picker callback and origin rules", () => {
  it("only sends results back to the customer's own machine", () => {
    expect(isAllowedPickerCallback("http://127.0.0.1:4000/picker-callback")).toBe(true);
    expect(isAllowedPickerCallback("http://localhost:4000/picker-callback")).toBe(true);
    expect(isAllowedPickerCallback("terminalsync-picker://result")).toBe(true);
    expect(isAllowedPickerCallback("https://evil.example/cb")).toBe(false);
    expect(isAllowedPickerCallback("http://127.0.0.1.evil.example/cb")).toBe(false);
    expect(isAllowedPickerCallback("http://user:pass@127.0.0.1/cb")).toBe(false);
    expect(isAllowedPickerCallback("javascript:alert(1)")).toBe(false);
    expect(isAllowedPickerCallback("")).toBe(false);
  });

  it("accepts the loopback page (or its null origin) and rejects other websites", () => {
    expect(isAllowedPickerLaunchOrigin(null)).toBe(true);
    expect(isAllowedPickerLaunchOrigin("null")).toBe(true);
    expect(isAllowedPickerLaunchOrigin("http://127.0.0.1:53111")).toBe(true);
    expect(isAllowedPickerLaunchOrigin("http://localhost:53111")).toBe(true);
    expect(isAllowedPickerLaunchOrigin("https://evil.example")).toBe(false);
    expect(isAllowedPickerLaunchOrigin("https://terminalsync.ai")).toBe(false);
  });
});

describe("parsePickerLaunchForm", () => {
  it("accepts the desktop's form", () => {
    const parsed = parsePickerLaunchForm(form());
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.accessToken).toBe(TOKEN);
      expect(parsed.value.mode).toBe("files");
    }
  });

  it.each([
    ["redirect", { redirect: "https://evil.example/cb" }],
    ["cancel", { cancel: "https://evil.example/cancel" }],
    ["state", { state: "<script>" }],
    ["missing state", { state: undefined }],
    ["token", { access_token: "short" }],
    ["token chars", { access_token: `${TOKEN}"</script>` }],
    ["duplicate token", { access_token: [TOKEN, TOKEN] }],
  ])("rejects a bad %s", (_label, overrides) => {
    expect(parsePickerLaunchForm(form(overrides)).ok).toBe(false);
  });
});

describe("launch page", () => {
  it("never puts the token in the URL it navigates to", () => {
    const parsed = parsePickerLaunchForm(form());
    if (!parsed.ok) throw new Error("form should parse");
    const target = pickerPageTarget(parsed.value);
    expect(target.startsWith("/picker?")).toBe(true);
    expect(target).not.toContain(TOKEN);
    expect(target).not.toContain("access_token");

    const { stored, replacedWith } = runLaunchPage(renderPickerLaunchPage(parsed.value));
    expect(replacedWith).toBe(target);
    const handoff = JSON.parse(stored.get(PICKER_HANDOFF_KEY) ?? "{}");
    expect(handoff.state).toBe(parsed.value.state);
    expect(handoff.accessToken).toBe(TOKEN);
    expect(typeof handoff.at).toBe("number");
    expect(handoff.at).toBeGreaterThan(0);
  });

  it("falls back to the legacy fragment only if storage is blocked", () => {
    const parsed = parsePickerLaunchForm(form());
    if (!parsed.ok) throw new Error("form should parse");
    const { replacedWith } = runLaunchPage(renderPickerLaunchPage(parsed.value), { throws: true });
    expect(replacedWith).toBe(
      `${pickerPageTarget(parsed.value)}#access_token=${encodeURIComponent(TOKEN)}`,
    );
  });
});

describe("/picker/launch route", () => {
  it("answers the desktop's capability probe", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.text()).toBe(PICKER_LAUNCH_PROBE);
    expect(res.headers.get("cache-control")).toContain("no-store");
  });

  it("renders the hand-off page without caching it", async () => {
    const res = await POST(launchRequest(form()));
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toContain("no-store");
    expect(res.headers.get("referrer-policy")).toBe("no-referrer");
    const html = await res.text();
    expect(runLaunchPage(html).stored.has(PICKER_HANDOFF_KEY)).toBe(true);
  });

  it("accepts the null origin a no-referrer loopback page sends", async () => {
    const res = await POST(launchRequest(form(), { origin: "null" }));
    expect(res.status).toBe(200);
  });

  it("refuses a token posted by another website", async () => {
    const res = await POST(launchRequest(form(), { origin: "https://evil.example" }));
    expect(res.status).toBe(403);
    expect(await res.text()).not.toContain(TOKEN);
  });

  it("refuses non-form bodies and bad fields without echoing the token", async () => {
    const json = await POST(
      launchRequest(JSON.stringify({ access_token: TOKEN }), { "content-type": "application/json" }),
    );
    expect(json.status).toBe(415);
    const bad = await POST(launchRequest(form({ redirect: "https://evil.example/cb" })));
    expect(bad.status).toBe(400);
    expect(await bad.text()).not.toContain(TOKEN);
  });

  it("refuses oversized bodies", async () => {
    const res = await POST(launchRequest(form({ appId: "1".repeat(20_000) })));
    expect(res.status).toBe(413);
  });
});
