import type { Metadata } from "next";
import LinkedinLeadsQueue from "./LinkedinLeadsQueue";

export const metadata: Metadata = {
  title: "Leads LinkedIn · TerminalSync",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function Page({ params }: Props) {
  const { lang } = await params;
  return <LinkedinLeadsQueue lang={lang} />;
}
