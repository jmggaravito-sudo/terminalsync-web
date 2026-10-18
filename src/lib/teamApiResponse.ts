import { NextResponse } from "next/server";

/**
 * Team endpoints return account- and workspace-specific metadata. Keep every
 * outcome (including auth and validation failures) out of browser and shared
 * CDN caches so a response can never be replayed for another user.
 */
export function teamJson(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");
  return NextResponse.json(body, { ...init, headers });
}
