// CORS helper for the Chrome extension endpoints.
//
// The extension's popup runs from a `chrome-extension://<id>` origin.
// The id is fixed for the published Web Store build but randomized for
// unpacked dev installs, so we accept any `chrome-extension://*` origin.
// That's safe because:
//   - Hosted mode enforces a UUID lookup + per-day cap in
//     /api/extension/chat — anonymous traffic is metered.
//   - BYOK mode forwards a key the caller already had on their machine.
//
// We also accept the marketing site origin (handy for /api/extension/*
// endpoints that the docs page might surface as a smoke test) and
// localhost during local dev.

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
