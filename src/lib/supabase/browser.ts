"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

// A Supabase project URL is always a bare origin (https://<ref>.supabase.co)
// with no path. If NEXT_PUBLIC_SUPABASE_URL is set with a trailing path like
// `/rest/v1` (an easy mistake in the dashboard), supabase-js builds the auth
// endpoint as `<url>/auth/v1/authorize` → `.../rest/v1/auth/v1/authorize`,
// which hits PostgREST and returns "No API key found". Reducing to the origin
// makes both magic-link and Google OAuth work regardless of the suffix.
function normalizeSupabaseUrl(raw: string): string {
  try {
    return new URL(raw).origin;
  } catch {
    return raw.trim().replace(/\/+$/, "");
  }
}

function getSupabaseProjectRef(rawUrl: string | undefined): string | null {
  if (!rawUrl) return null;
  try {
    const host = new URL(normalizeSupabaseUrl(rawUrl)).hostname;
    const [ref] = host.split(".");
    return ref || null;
  } catch {
    return null;
  }
}

function readStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const projectRef = getSupabaseProjectRef(process.env.NEXT_PUBLIC_SUPABASE_URL);
    const preferredKey = projectRef ? `sb-${projectRef}-auth-token` : null;
    const keys = preferredKey
      ? [preferredKey]
      : Array.from({ length: window.localStorage.length }, (_, i) => window.localStorage.key(i)).filter(
          (key): key is string => Boolean(key?.startsWith("sb-") && key.endsWith("-auth-token")),
        );

    for (const key of keys) {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as {
        access_token?: unknown;
        currentSession?: { access_token?: unknown };
      };
      const token = parsed.access_token ?? parsed.currentSession?.access_token;
      if (typeof token === "string" && token.length > 0) return token;
    }
  } catch {
    return null;
  }
  return null;
}

export function getSupabaseBrowser(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!rawUrl || !anon) return null;
  const url = normalizeSupabaseUrl(rawUrl);
  if (!_client) {
    _client = createClient(url, anon, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return _client;
}

export async function getAccessToken(): Promise<string | null> {
  // Admin data fetches should never block on Supabase auth session recovery.
  // In long-lived Chrome profiles, sb.auth.getSession() can hang before the page
  // leaves "Verificando sesión…". Supabase persists the session in localStorage,
  // so read the token directly and let the API return 401 if it is absent/expired.
  return readStoredAccessToken();
}

export async function authedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const token = await getAccessToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(input, { ...init, headers });
}
