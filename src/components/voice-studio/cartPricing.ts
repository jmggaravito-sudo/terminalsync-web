export type DubbingService = "DUB" | "LIP";

export const DUB_CENTS_PER_MINUTE = 395;
export const LIP_CENTS_PER_MINUTE = 815;

export const SHORTS = [
  { seconds: 30, cents: 1500 },
  { seconds: 60, cents: 2000 },
  { seconds: 90, cents: 3000 },
] as const;
export type ShortLength = (typeof SHORTS)[number]["seconds"];

export type CartVideo = {
  id: string;
  title: string;
  seconds: number;
  service: DubbingService | null;
  shorts: ShortLength[];
};

export const CART_LIMIT = 10;
export const USD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function eligibleShorts(duration: number) {
  return SHORTS.filter((short) => short.seconds <= duration);
}

// Preview rates only. Volume tiers are not applied until their rates are set.
export function estimateCart(videos: CartVideo[]) {
  const selected = videos.filter((video) => video.service);
  const dubSeconds = selected.reduce((total, video) => total + (video.service === "DUB" ? video.seconds : 0), 0);
  const lipSeconds = selected.reduce((total, video) => total + (video.service === "LIP" ? video.seconds : 0), 0);
  const dubbing = Math.round(dubSeconds * DUB_CENTS_PER_MINUTE / 60);
  // LIP is a standalone price that already includes Spanish dubbing.
  const lip = Math.round(lipSeconds * LIP_CENTS_PER_MINUTE / 60);
  const shorts = selected.reduce((total, video) => {
    return total + eligibleShorts(video.seconds)
      .filter((short) => video.shorts.includes(short.seconds))
      .reduce((subtotal, short) => subtotal + short.cents, 0);
  }, 0);
  return { dubSeconds, lipSeconds, dubbing, lip, shorts, total: dubbing + lip + shorts };
}

export function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
