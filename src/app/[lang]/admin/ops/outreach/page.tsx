import type { Metadata } from "next";
import OutreachQueue from "./OutreachQueue";

export const metadata: Metadata = {
  title: "Outreach Queue · TerminalSync",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function Page({ params }: Props) {
  const { lang } = await params;
  return <OutreachQueue lang={lang} />;
}
