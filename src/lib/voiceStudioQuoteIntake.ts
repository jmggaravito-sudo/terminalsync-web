import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { CART_LIMIT, SHORTS, type DubbingService, type ShortLength } from "@/components/voice-studio/cartPricing";

export function voiceStudioAgreement() {
  if (process.env.VOICE_STUDIO_QUOTE_INTAKE_ENABLED !== "true") return null;
  const version = process.env.VOICE_STUDIO_SERVICE_AGREEMENT_VERSION?.trim();
  if (!version || !/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}$/.test(version)) return null;
  try {
    const url = new URL(process.env.VOICE_STUDIO_SERVICE_AGREEMENT_URL ?? "");
    if (url.protocol !== "https:" || url.username || url.password || url.href.length > 2048) return null;
    return { version, url: url.href };
  } catch { return null; }
}

export async function quoteAccount(req: Request) {
  const token = req.headers.get("authorization")?.match(/^Bearer (\S+)$/)?.[1];
  const db = getSupabaseAdmin();
  if (!db || !token) return null;
  const { data, error } = await db.auth.getUser(token);
  const user = data.user;
  if (error || !user?.email_confirmed_at || !user.email || user.is_anonymous) return null;
  return { db, id: user.id, email: user.email.trim().toLowerCase() };
}

export function quoteOpsAllowed(email: string) {
  return (process.env.VOICE_STUDIO_OPS_EMAILS ?? process.env.ADMIN_EMAILS ?? "")
    .split(",").map((value) => value.trim().toLowerCase()).includes(email);
}

type RequestItem = { id: string; service: DubbingService; shorts: ShortLength[] };

export function parseQuoteItems(input: unknown): RequestItem[] | null {
  if (!Array.isArray(input) || input.length < 1 || input.length > CART_LIMIT) return null;
  const ids = new Set<string>();
  const result: RequestItem[] = [];
  for (const item of input) {
    if (!item || typeof item.id !== "string" || !/^youtube-[A-Za-z0-9_-]{11}$/.test(item.id) || ids.has(item.id) ||
        (item.service !== "DUB" && item.service !== "LIP") || !Array.isArray(item.shorts) ||
        item.shorts.length > SHORTS.length || item.shorts.some((length: unknown) => !SHORTS.some((short) => short.seconds === length)) ||
        new Set(item.shorts).size !== item.shorts.length) return null;
    ids.add(item.id);
    result.push({ id: item.id, service: item.service, shorts: [...item.shorts].sort((a, b) => a - b) });
  }
  return result;
}
