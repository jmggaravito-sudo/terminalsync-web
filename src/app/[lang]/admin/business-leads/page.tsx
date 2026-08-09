import type { Metadata } from "next";
import BusinessLeadsQueue from "./BusinessLeadsQueue";

export const metadata: Metadata = {
  title: "Leads B2B · TerminalSync",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function Page({ params }: Props) {
  const { lang } = await params;
  return <BusinessLeadsQueue lang={lang} />;
}
