// Server-side auth helper for marketplace API routes.
//
// The existing app passes `supabaseUserId` in request bodies (see the
// /api/checkout pattern) because the client owns its own Supabase auth
// state and the server doesn't need to validate it for low-trust ops like
// "create a checkout session for myself".
//
// For marketplace writes (publisher onboarding, listing CRUD, install
// records) we DO need a verified identity. This helper reads a Bearer JWT
// from the Authorization header and validates it against Supabase. Falls
// back to the body's `supabaseUserId` only in dev (when SUPABASE_URL is
// unset) so local scaffolding still works without auth wired up.

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export interface AuthedUser {
  id: string;
  email: string | null;
}

export async function authenticate(req: Request): Promise<AuthedUser | null> {
  const auth = req.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;

  // Dev fallback: no Supabase configured → trust the body. Never enable
  // this in production; the admin client check below is the gate.
  const sb = getSupabaseAdmin();
  if (!sb) {
    return null;
  }

  if (!token) return null;

  const { data, error } = await sb.auth.getUser(token);
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email ?? null };
}

/** True when the authenticated user's email matches the comma-separated
 *  ADMIN_EMAILS env. Cheap allowlist used by the manual-review admin
 *  endpoints until we have a proper roles table. */
export function isAdmin(user: AuthedUser): boolean {
  const allow = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return user.email !== null && allow.includes(user.email.toLowerCase());
}
