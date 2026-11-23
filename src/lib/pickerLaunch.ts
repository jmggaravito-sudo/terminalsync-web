// Google Picker hand-off for the desktop app, without the Google access token
// in any URL.
//
// Before: the desktop opened `https://terminalsync.ai/picker?…#access_token=…`
// in the customer's browser. A fragment never reaches a server, but the whole
// URL — token included — lands in the browser's history (and, with browser
// sync on, in the customer's synced history).
//
// Now: the desktop opens a one-time page on its own loopback server. That page
// POSTs the token here (`/picker/launch`), exactly like OAuth's `form_post`
// response mode. This handler never stores or logs it: it renders a tiny page
// that puts the token in this tab's sessionStorage, bound to the picker
// `state`, and replaces itself with `/picker?…` — a URL with no secret in it.
// The picker page reads the token once and deletes it.
//
// The desktop probes `GET /picker/launch` for PICKER_LAUNCH_PROBE before using
// this lane, so an app released before this deploy keeps the legacy fragment
// lane and nothing breaks while the two repos roll out.

export const PICKER_LAUNCH_PROBE = "terminalsync-picker-launch-v1";
export const PICKER_HANDOFF_KEY = "ts-picker-handoff";
export const PICKER_LAUNCH_MAX_BODY = 16 * 1024;

export type PickerLaunch = {
  redirect: string;
  cancel: string;
  state: string;
  clientId: string;
  appId: string;
  mode: "files" | "folder";
  accessToken: string;
};

const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost"]);

/** Same rule as the picker page's `safeRedirect`: results only go back to the
 * customer's own machine (loopback or the desktop's custom scheme). */
export function isAllowedPickerCallback(raw: string): boolean {
  if (!raw || raw.length > 512) return false;
  try {
    const url = new URL(raw);
    if (url.username || url.password) return false;
    if (url.protocol === "http:") return LOOPBACK_HOSTS.has(url.hostname);
    return url.protocol === "terminalsync-picker:";
  } catch {
    return false;
  }
}

/** The form is posted by the desktop's loopback page. Browsers send its origin,
 * or the literal `null` when that page uses `Referrer-Policy: no-referrer`.
 * Anything else is a web page trying to plant a token in someone's tab. */
export function isAllowedPickerLaunchOrigin(origin: string | null): boolean {
  if (origin === null || origin === "" || origin === "null") return true;
  try {
    const url = new URL(origin);
    return url.protocol === "http:" && LOOPBACK_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

const STATE_RE = /^[A-Za-z0-9-]{1,128}$/;
const CLIENT_ID_RE = /^[A-Za-z0-9._-]{0,256}$/;
const APP_ID_RE = /^[0-9]{0,64}$/;
// Google OAuth access tokens are opaque but URL-safe (`ya29.` + base64url-ish).
const TOKEN_RE = /^[A-Za-z0-9._~+/=-]{10,4096}$/;

export function parsePickerLaunchForm(
  form: URLSearchParams,
): { ok: true; value: PickerLaunch } | { ok: false; reason: string } {
  const get = (key: string) => {
    const values = form.getAll(key);
    return values.length === 1 ? values[0] : values.length === 0 ? "" : null;
  };
  const redirect = get("redirect");
  const cancel = get("cancel");
  const state = get("state");
  const clientId = get("clientId");
  const appId = get("appId");
  const mode = get("mode");
  const accessToken = get("access_token");
  if (
    redirect === null ||
    cancel === null ||
    state === null ||
    clientId === null ||
    appId === null ||
    mode === null ||
    accessToken === null
  ) {
    return { ok: false, reason: "duplicate field" };
  }
  if (!isAllowedPickerCallback(redirect)) return { ok: false, reason: "redirect" };
  if (cancel && !isAllowedPickerCallback(cancel)) return { ok: false, reason: "cancel" };
  if (!STATE_RE.test(state)) return { ok: false, reason: "state" };
  if (!CLIENT_ID_RE.test(clientId)) return { ok: false, reason: "clientId" };
  if (!APP_ID_RE.test(appId)) return { ok: false, reason: "appId" };
  if (!TOKEN_RE.test(accessToken)) return { ok: false, reason: "access_token" };
  return {
    ok: true,
    value: {
      redirect,
      cancel,
      state,
      clientId,
      appId,
      mode: mode === "files" ? "files" : "folder",
      accessToken,
    },
  };
}

/** The `/picker?…` URL the launch page replaces itself with. No token. */
export function pickerPageTarget(value: PickerLaunch): string {
  const query = new URLSearchParams();
  query.set("redirect", value.redirect);
  if (value.cancel) query.set("cancel", value.cancel);
  query.set("state", value.state);
  if (value.clientId) query.set("clientId", value.clientId);
  if (value.appId) query.set("appId", value.appId);
  query.set("mode", value.mode);
  return `/picker?${query.toString()}`;
}

/** JSON that is safe inside an inline <script>. */
function scriptJson(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(new RegExp("\\u2028", "g"), "\\u2028")
    .replace(new RegExp("\\u2029", "g"), "\\u2029");
}

export function renderPickerLaunchPage(value: PickerLaunch): string {
  const target = pickerPageTarget(value);
  const handoff = { state: value.state, accessToken: value.accessToken, at: 0 };
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="referrer" content="no-referrer" />
<meta name="robots" content="noindex, nofollow" />
<title>Terminal Sync</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#08090b;color:#aab2c5;font:14px Inter,ui-sans-serif,system-ui,-apple-system,sans-serif}</style>
</head>
<body>
<p>Opening Google Drive…</p>
<script>
(function () {
  var target = ${scriptJson(target)};
  var handoff = ${scriptJson(handoff)};
  handoff.at = Date.now();
  try {
    window.sessionStorage.setItem(${scriptJson(PICKER_HANDOFF_KEY)}, JSON.stringify(handoff));
  } catch (err) {
    // Storage blocked (rare for a top-level tab): fall back to the legacy
    // fragment so the customer can still pick files.
    target = target + "#access_token=" + encodeURIComponent(handoff.accessToken);
  }
  handoff = null;
  window.location.replace(target);
})();
</script>
</body>
</html>`;
}
