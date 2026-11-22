export type DubbingService = "DUB" | "LIP";

export const DUB_CENTS_PER_MINUTE = 395;
export const LIP_CENTS_PER_MINUTE = 815;
// Guest add-on rates for multi-speaker (interview) videos. Full = human-
// reviewed subtitle track; standard = straight subtitle track on the
// original audio.
export const SUB_FULL_CENTS_PER_MINUTE = 150;
export const SUB_LITE_CENTS_PER_MINUTE = 75;

// Speaker counts: 3 means "3 or more" (ops confirms the exact cast on review).
export const MAX_SPEAKERS_OPTION = 3;

// Interview packages for 2+ speakers. Component counts per package feed the
// price formula; with speakers=1 every package is invalid (use DUB/LIP).
export const SPEAKER_PACKAGES = [
  {
    id: "all_lip",
    label: "All lip-sync",
    description: "Every speaker dubbed with matching lip movements.",
    lip: (speakers: number) => speakers, dub: () => 0, subFull: () => 0, subLite: () => 0,
  },
  {
    id: "host_lip_guest_subs",
    label: "Host lip-sync, guests subtitled (recommended)",
    description: "The host speaks Spanish with matching lips; each guest keeps their original audio with reviewed Spanish subtitles. The interview standard.",
    lip: () => 1, dub: () => 0, subFull: (speakers: number) => speakers - 1, subLite: () => 0,
  },
  {
    id: "all_dub",
    label: "All dubbed, no lip-sync",
    description: "Every speaker gets a Spanish catalog voice; no mouth adjustments.",
    lip: () => 0, dub: (speakers: number) => speakers, subFull: () => 0, subLite: () => 0,
  },
  {
    id: "host_lip_guest_orig",
    label: "Host lip-sync, guests subtitled (standard subs)",
    description: "The host is dubbed with lip-sync; guests keep their original audio with standard Spanish subtitles.",
    lip: () => 1, dub: () => 0, subFull: () => 0, subLite: (speakers: number) => speakers - 1,
  },
] as const;
export type SpeakerPackage = (typeof SPEAKER_PACKAGES)[number]["id"];

export function speakerPackage(id: string | undefined) {
  return SPEAKER_PACKAGES.find((pkg) => pkg.id === id);
}

export function isSpeakerPackage(value: unknown): value is SpeakerPackage {
  return typeof value === "string" && SPEAKER_PACKAGES.some((pkg) => pkg.id === value);
}

export function packageCents(pkgId: string, speakers: number, seconds: number): number {
  const pkg = speakerPackage(pkgId);
  if (!pkg) return 0;
  const perMinute = LIP_CENTS_PER_MINUTE * pkg.lip(speakers)
    + DUB_CENTS_PER_MINUTE * pkg.dub(speakers)
    + SUB_FULL_CENTS_PER_MINUTE * pkg.subFull(speakers)
    + SUB_LITE_CENTS_PER_MINUTE * pkg.subLite(speakers);
  return Math.round(seconds * perMinute / 60);
}

export const SHORTS = [
  { seconds: 30, cents: 1500 },
  { seconds: 60, cents: 2000 },
  { seconds: 90, cents: 3000 },
] as const;
export type ShortLength = (typeof SHORTS)[number]["seconds"];

// Target dubbing languages offered in the cart picker. All are verified in the
// OmniVoice catalog with 2,000+ training hours; Spanish stays the default.
export const LANGUAGES = [
  { code: "es", label: "Spanish (Latin America)" },
  { code: "pt-BR", label: "Portuguese (Brazil)" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "it", label: "Italian" },
  { code: "ja", label: "Japanese" },
  { code: "zh", label: "Mandarin Chinese" },
  { code: "ko", label: "Korean" },
] as const;
export type LanguageCode = (typeof LANGUAGES)[number]["code"];
export const DEFAULT_LANGUAGE: LanguageCode = "es";

export function languageLabel(code: string | undefined): string {
  return LANGUAGES.find((language) => language.code === code)?.label ?? LANGUAGES[0].label;
}

export function isLanguageCode(value: unknown): value is LanguageCode {
  return typeof value === "string" && LANGUAGES.some((language) => language.code === value);
}

export type CartVideo = {
  id: string;
  title: string;
  seconds: number;
  service: DubbingService | null;
  shorts: ShortLength[];
  language?: LanguageCode;
  /** 1 = solo speaker (service DUB/LIP); 2-3 = interview (package required). */
  speakers?: number;
  package?: SpeakerPackage;
};

export const CART_LIMIT = 10;
export const USD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function eligibleShorts(duration: number) {
  return SHORTS.filter((short) => short.seconds <= duration);
}

// Preview rates only. Volume tiers are not applied until their rates are set.
export function estimateCart(videos: CartVideo[]) {
  const selected = videos.filter((video) => video.service || video.package);
  const dubSeconds = selected.reduce((total, video) => total + (video.service === "DUB" ? video.seconds : 0), 0);
  const lipSeconds = selected.reduce((total, video) => total + (video.service === "LIP" ? video.seconds : 0), 0);
  const dubbing = Math.round(dubSeconds * DUB_CENTS_PER_MINUTE / 60);
  // LIP is a standalone price that already includes dubbing.
  const lip = Math.round(lipSeconds * LIP_CENTS_PER_MINUTE / 60);
  const interviews = selected
    .filter((video) => (video.speakers ?? 1) > 1 && video.package)
    .map((video) => ({
      seconds: video.seconds,
      speakers: video.speakers ?? 1,
      label: speakerPackage(video.package)?.label ?? "",
      cents: packageCents(video.package!, video.speakers ?? 1, video.seconds),
    }));
  const interviewCents = interviews.reduce((total, row) => total + row.cents, 0);
  const shorts = selected.reduce((total, video) => {
    return total + eligibleShorts(video.seconds)
      .filter((short) => video.shorts.includes(short.seconds))
      .reduce((subtotal, short) => subtotal + short.cents, 0);
  }, 0);
  return { dubSeconds, lipSeconds, dubbing, lip, interviews, shorts, total: dubbing + lip + interviewCents + shorts };
}

export function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
