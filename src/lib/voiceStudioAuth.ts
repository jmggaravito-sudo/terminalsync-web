import { emailFromOrdersToken } from "@/lib/voiceStudioLicense";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// Voice Studio client identity. Two doors, one email:
//   1. The HMAC orders link (`?t=`) — minted after checkout, no login.
//   2. A Supabase session (Google or magic link) — the dashboard login.
// Either way the API only ever resolves ONE email, and a client can only
// ever see the orders for that email. The Supabase path verifies the JWT
// server-side (supabaseAdmin.auth.getUser) so a forged token can't rename
// the email the CRM is queried with.

export async function emailFromClientRequest(
  req: Request,
  token: string | null | undefined,
): Promise<string | null> {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    const admin = getSupabaseAdmin();
    if (!admin) return null; // fail closed: no admin client, no session trust
    const { data, error } = await admin.auth.getUser(auth.slice(7).trim());
    if (error || !data?.user?.email) return null;
    return data.user.email.toLowerCase();
  }
  return emailFromOrdersToken(token);
}
