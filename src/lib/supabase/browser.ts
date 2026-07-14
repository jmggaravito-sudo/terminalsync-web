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
  const sb = getSupabaseBrowser();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session?.access_token ?? null;
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
