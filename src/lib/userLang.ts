import { getSupabaseAdmin } from "./supabaseAdmin";

// The two languages the product ships (app UI, landing, and now emails).
export type EmailLang = "es" | "en";

/**
 * Normalize any stored locale string (e.g. "en-US", "es-AR", "en", "es")
 * to the two languages we actually render. Anything English-ish → "en";
 * everything else (including unknown/empty) → "es", which preserves the
 * historical behavior for accounts created before we stored a locale.
 */
export function normalizeLang(locale: string | null | undefined): EmailLang {
  return locale && locale.toLowerCase().startsWith("en") ? "en" : "es";
}

/**
 * Resolve a user's preferred email language from `profiles.locale`.
 * Looks up by user id (preferred) or email. Best-effort: on any failure
 * or missing admin client, defaults to "es".
 *
 * The locale is set by the desktop app at signup (the language the user is
 * using), so this is the honest signal for which language to email them in.
 */
export async function resolveUserLang(opts: {
  email?: string | null;
  userId?: string | null;
}): Promise<EmailLang> {
  const sb = getSupabaseAdmin();
  if (!sb) return "es";
  try {
    let q = sb.from("profiles").select("locale").limit(1);
    if (opts.userId) {
      q = q.eq("id", opts.userId);
    } else if (opts.email) {
      q = q.ilike("email", opts.email);
    } else {
      return "es";
    }
    const { data } = await q.maybeSingle();
    return normalizeLang((data as { locale?: string } | null)?.locale);
  } catch {
    return "es";
  }
}
