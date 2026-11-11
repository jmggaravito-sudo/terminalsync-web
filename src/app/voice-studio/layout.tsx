import type { Metadata } from "next";

// Standalone landing for the dubbing business ("Voice Studio"). It shares
// only the root layout (fonts + globals) — no nav, no footer, no links to
// or from the TerminalSync app site. Kept out of search until the brand
// launches publicly: flip robots.index to true when ready.
export const metadata: Metadata = {
  title: "Voice Studio — Dub your videos into Spanish",
  description:
    "Spanish dubbing for your existing videos, with a catalog voice, optional premium lip-sync, and captioned Shorts and Reels.",
  robots: { index: false, follow: false },
};

export default function VoiceStudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="bg-white text-zinc-900">{children}</div>;
}
