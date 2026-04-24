import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Admin-level Supabase client for server-side routes that need to bypass
// RLS — mainly the Stripe webhook upserting into `subscriptions`. NEVER
// ship this to the browser; the service_role key can read/write anything.
//
// Pattern note: this is server-only. Route handlers import it; frontend
// components use the anon key via src/lib/supabase/*.ts (owned by the
// other terminal per the territory split).

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let _client: SupabaseClient | null = null;

/** Returns the admin client, or null when envs aren't set (dev sandbox).
 *  The webhook handler degrades gracefully — logs and skips the upsert — so
 *  local Next.js dev servers don't crash when Supabase creds are missing. */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!url || !serviceKey) return null;
  if (!_client) {
    _client = createClient(url, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: { "x-client-info": "terminalsync-web/webhook" },
      },
    });
  }
  return _client;
}
