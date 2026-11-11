export type DubbingService = "DUB" | "LIP";

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

// Draft preview rates, not a payable quote. Volume discount applies to base dubbing only.
export function estimateCart(videos: CartVideo[]) {
  const selected = videos.filter((video) => video.service);
  const seconds = selected.reduce((total, video) => total + video.seconds, 0);
  const lipSeconds = selected.reduce((total, video) => total + (video.service === "LIP" ? video.seconds : 0), 0);
  const tierOne = Math.min(seconds, 20 * 60);
  const dubbing = Math.round((tierOne * 645 + (seconds - tierOne) * 580) / 60);
  const discount = Math.round(seconds * 645 / 60) - dubbing;
  const lip = Math.round(lipSeconds * 181 / 60);
  const shorts = selected.reduce((total, video) => {
    return total + eligibleShorts(video.seconds)
      .filter((short) => video.shorts.includes(short.seconds))
      .reduce((subtotal, short) => subtotal + short.cents, 0);
  }, 0);
  return { seconds, dubbing, discount, lip, shorts, total: dubbing + lip + shorts };
}

export function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
