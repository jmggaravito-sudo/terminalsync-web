// CORS helper for the Chrome extension endpoints.
//
// Origins we allow:
//   - chrome-extension://*    — the published popup, plus randomized
//                                unpacked dev installs.
//   - moz-extension://*       — the published popup on Firefox.
//   - tauri://*               — the TerminalSync desktop app (Tauri
//                                WebView on macOS — origin is
//                                tauri://localhost regardless of port).
//   - http://tauri.localhost  — Tauri WebView on Linux / Windows.
//   - https://terminalsync.ai + www variant — the marketing site (for
//                                docs page smoke tests / the landing's
//                                self-serve flows).
//   - http://localhost*       — local dev of either client.
//   - http://127.0.0.1*       — same.
//
// Safety: every endpoint that mutates state still enforces a per-call
// auth check (Bearer token, install UUID + per-day cap, etc.). CORS is
// just a browser gate.

const STATIC_ALLOWED = new Set<string>([
  "https://terminalsync.ai",
  "https://www.terminalsync.ai",
]);

export function extensionCorsHeaders(
  origin: string | null,
  methods = "POST, GET, OPTIONS",
): Record<string, string> {
  const allowed =
    origin !== null &&
    (origin.startsWith("chrome-extension://") ||
      origin.startsWith("moz-extension://") ||
      // Tauri WebView (macOS): tauri://localhost (no port, no path).
      origin.startsWith("tauri://") ||
      // Tauri WebView (Linux/Windows on Tauri 2): http://tauri.localhost.
      origin === "http://tauri.localhost" ||
      origin.startsWith("https://tauri.localhost") ||
      origin.startsWith("http://localhost") ||
      origin.startsWith("http://127.0.0.1") ||
      STATIC_ALLOWED.has(origin));
  return {
    "Access-Control-Allow-Origin": allowed
      ? (origin as string)
      : "https://terminalsync.ai",
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-User-Id, X-Extension-Version",
    "Access-Control-Expose-Headers":
      "X-Trial-Days-Left, X-Trial-Prompts-Left-Today, X-Trial-Mode, X-Trial-Cap",
    Vary: "Origin",
  };
}

export function extensionPreflight(req: Request, methods?: string): Response {
  return new Response(null, {
    status: 204,
    headers: extensionCorsHeaders(req.headers.get("origin"), methods),
  });
}
