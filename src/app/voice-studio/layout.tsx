import type { Metadata } from "next";

// Standalone landing for the dubbing business ("Voice Studio"). It shares
// only the root layout (fonts + globals) — no nav, no footer, no links to
// or from the TerminalSync app site. Kept out of search until the brand
// launches publicly: flip robots.index to true when ready.
export const metadata: Metadata = {
  title: "Voice Studio — Your YouTube channel in Spanish, in your own voice",
  description:
    "Done-for-you dubbing: we turn the videos you already have into a Spanish channel — dubbed with a clone of your own voice, subtitled, and published to a channel you own.",
  robots: { index: false, follow: false },
};

export default function VoiceStudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="bg-white text-zinc-900">{children}</div>;
}
