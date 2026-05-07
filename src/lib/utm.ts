/**
 * UTM helpers for creator outreach.
 *
 * Every link sent in an outbound DM/email goes through `creatorUtm` so we
 * get one row per creator in Vercel Analytics + Rewardful. The `ref` param
 * is what Rewardful's affiliate tracker reads (separate code path); the
 * `utm_*` params are what shows up in the analytics dashboard.
 *
 * Convention:
 *   utm_source   = the channel where the message landed ("youtube", "x", etc.)
 *   utm_medium   = always "creator" for this campaign
 *   utm_campaign = "launch-2026-q2" (single name across the whole sprint)
 *   utm_content  = optional creative variation tag (e.g. "subject-A", "loom-v2")
 *   ref          = the creator handle (also used by Rewardful)
 *
 * The default landing is `/for-developers` because the entire 50-creator list
 * is dev/AI-coding focused. Use `landing: "consumer"` only for the rare
 * non-dev creator. Locale defaults to "es" (more EN creators, but JM is
 * Spanish-native and the cold emails are bilingual — we keep ES as the
 * canonical landing and let the visitor language-switch in-page).
 */

export type CreatorChannel =
  | "youtube"
  | "x"
  | "linkedin"
  | "newsletter"
  | "podcast"
  | "discord"
  | "reddit"
  | "email";

export type LandingTarget = "dev" | "consumer";

export interface CreatorUtmInput {
  /** Creator handle, no leading @. Becomes `ref` + `utm_term`. */
  handle: string;
  /** Where the link is being sent. */
  channel: CreatorChannel;
  /** Default "dev" — the for-developers landing. */
  landing?: LandingTarget;
  /** Default "es". */
  lang?: "es" | "en";
  /** Optional creative variant tag. */
  variant?: string;
  /** Optional override for the campaign id. */
  campaign?: string;
  /** Override base; defaults to https://terminalsync.ai */
  origin?: string;
}

const DEFAULT_CAMPAIGN = "launch-2026-q2";
const DEFAULT_ORIGIN = "https://terminalsync.ai";

/**
 * Build a fully-qualified URL with UTM + ref params for one creator.
 * Idempotent: handle is lowercased + stripped of @ so links from the same
 * creator across two channels stay attributable to the same row.
 */
export function creatorUtm(input: CreatorUtmInput): string {
  const handle = input.handle.replace(/^@+/, "").toLowerCase().trim();
  const lang = input.lang ?? "es";
  const landing = input.landing ?? "dev";
  const path = landing === "dev" ? `/${lang}/for-developers` : `/${lang}`;
  const origin = (input.origin ?? DEFAULT_ORIGIN).replace(/\/+$/, "");

  const url = new URL(`${origin}${path}`);
  url.searchParams.set("utm_source", input.channel);
  url.searchParams.set("utm_medium", "creator");
  url.searchParams.set("utm_campaign", input.campaign ?? DEFAULT_CAMPAIGN);
  url.searchParams.set("utm_term", handle);
  if (input.variant) url.searchParams.set("utm_content", input.variant);
  url.searchParams.set("ref", handle);
  return url.toString();
}

/** Bulk variant — useful for generating links for the entire xlsx tracker. */
export function creatorUtmBatch(rows: CreatorUtmInput[]): { handle: string; url: string }[] {
  return rows.map((r) => ({ handle: r.handle, url: creatorUtm(r) }));
}
