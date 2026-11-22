import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { CART_LIMIT, MAX_SPEAKERS_OPTION, SHORTS, isLanguageCode, isSpeakerPackage, type DubbingService, type LanguageCode, type ShortLength, type SpeakerPackage } from "@/components/voice-studio/cartPricing";

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

type RequestItem = {
  id: string;
  service?: DubbingService;
  shorts: ShortLength[];
  language?: LanguageCode;
  speakers?: number;
  package?: SpeakerPackage;
};

export function parseQuoteItems(input: unknown): RequestItem[] | null {
  if (!Array.isArray(input) || input.length < 1 || input.length > CART_LIMIT) return null;
  const ids = new Set<string>();
  const result: RequestItem[] = [];
  for (const item of input) {
    if (!item || typeof item.id !== "string" || !/^youtube-[A-Za-z0-9_-]{11}$/.test(item.id) || ids.has(item.id) ||
        !Array.isArray(item.shorts) ||
        item.shorts.length > SHORTS.length || item.shorts.some((length: unknown) => !SHORTS.some((short) => short.seconds === length)) ||
        new Set(item.shorts).size !== item.shorts.length ||
        // Language is optional only so pre-picker carts keep replaying; when
        // present it must be one of the offered codes.
        (item.language !== undefined && !isLanguageCode(item.language)) ||
        // Speaker model: 1 speaker → service; 2+ speakers → package. New
        // fields stay optional so pre-multi-speaker carts replay unchanged.
        (item.speakers !== undefined && (typeof item.speakers !== "number" ||
          !Number.isInteger(item.speakers) || item.speakers < 1 || item.speakers > MAX_SPEAKERS_OPTION)))
      return null;
    const speakers = item.speakers ?? 1;
    if (speakers <= 1) {
      if ((item.service !== "DUB" && item.service !== "LIP") || item.package !== undefined) return null;
    } else if (item.service !== undefined && item.service !== null) {
      return null;
    } else if (!isSpeakerPackage(item.package)) {
      return null;
    }
    ids.add(item.id);
    result.push({
      id: item.id,
      ...(item.service ? { service: item.service } : {}),
      shorts: [...item.shorts].sort((a, b) => a - b),
      ...(isLanguageCode(item.language) ? { language: item.language } : {}),
      ...(speakers > 1 ? { speakers } : {}),
      ...(speakers > 1 && isSpeakerPackage(item.package) ? { package: item.package } : {}),
    });
  }
  return result;
}
