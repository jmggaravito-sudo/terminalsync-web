import { NextResponse } from "next/server";

/**
 * CORS allow-list for endpoints called from the Tauri desktop app.
 *
 * Tauri v2 sends requests with a `tauri://` scheme origin on macOS/Linux;
 * the WebKit webview enforces CORS on cross-origin fetches. Browser
 * callers from the marketing site use the literal https origin.
 *
 * Used by /api/checkout (inline copy — predates this lib) and the
 * account-management endpoints (/api/billing/portal, /api/account,
 * /api/account/restore).
 */
export function corsHeaders(
  origin: string | null,
  methods: string = "POST, OPTIONS",
): Record<string, string> {
  const allowed =
    origin &&
    (origin.startsWith("tauri://") ||
      origin === "https://terminalsync.ai" ||
      origin === "https://www.terminalsync.ai" ||
      origin.startsWith("http://localhost") ||
      origin.startsWith("http://127.0.0.1"));
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "https://terminalsync.ai",
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
}

/** Standard OPTIONS preflight responder. Mount as `export const OPTIONS = preflight;` */
export function preflight(req: Request, methods?: string): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin"), methods),
  });
}
