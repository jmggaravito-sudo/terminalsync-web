"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Shared admin-bypass auth helper.
 *
 * Each `/[lang]/admin-bypass/*` page used to require `?key=<token>` in the
 * URL on every visit — pasting the same long string into every browser tab
 * is annoying. This hook reads the key from either source and persists it:
 *
 *   1. If `?key=<token>` is in the URL, use it AND write it to a cookie
 *      so future visits to any /admin-bypass route work without the param.
 *   2. Otherwise, read the cookie. The hook returns "" until the cookie
 *      reads on mount, so the consumer should check `loaded` before
 *      rendering the "Missing key" state.
 *
 * The cookie is NOT httpOnly (we need to read it from the client) and is
 * scoped to `path=/` so it works for every admin-bypass page. It expires
 * after 30 days. This is a fine trade-off for a JM-only debug surface —
 * proper auth lives in /[lang]/admin/* with Supabase login.
 */

const COOKIE_NAME = "tsync_admin_key";
const COOKIE_MAX_AGE_S = 60 * 60 * 24 * 30; // 30 days

function readCookie(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(
    new RegExp("(?:^|;\\s*)" + COOKIE_NAME + "=([^;]+)"),
  );
  return match ? decodeURIComponent(match[1]) : "";
}

function writeCookie(value: string): void {
  if (typeof document === "undefined") return;
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(value)}`,
    "Path=/",
    `Max-Age=${COOKIE_MAX_AGE_S}`,
    "SameSite=Strict",
  ];
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    parts.push("Secure");
  }
  document.cookie = parts.join("; ");
}

export interface AdminKeyState {
  /** The resolved admin key (URL > cookie > empty). */
  key: string;
  /** Whether we've finished the initial read pass — render gates the
   *  "Missing key" UI on this so first-paint cookie reads aren't
   *  misinterpreted as missing. */
  loaded: boolean;
}

export function useAdminKey(): AdminKeyState {
  const search = useSearchParams();
  const urlKey = search.get("key") || "";
  const [state, setState] = useState<AdminKeyState>(() => ({
    key: urlKey,
    loaded: typeof urlKey === "string" && urlKey.length > 0,
  }));

  useEffect(() => {
    if (urlKey) {
      writeCookie(urlKey);
      setState({ key: urlKey, loaded: true });
      return;
    }
    const cookieKey = readCookie();
    setState({ key: cookieKey, loaded: true });
  }, [urlKey]);

  return state;
}
