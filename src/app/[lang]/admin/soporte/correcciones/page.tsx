import type { Metadata } from "next";
import CorreccionesQueue from "./CorreccionesQueue";

export const metadata: Metadata = {
  title: "Correcciones del bot · TerminalSync",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ lang: string }>;
}

/**
 * S3 test/ops page — lists submitted "Corregir" entries and their status
 * (pending → pr_opened / error). Deliberately separate from S2's
 * `/admin/soporte` thread list (that page owns the conversation view + the
 * `<CorreccionButton>` mount point; this one owns "did my corrections land
 * as PRs"). Two different files under the same parent dir, so both PRs
 * merge without touching each other.
 */
export default async function Page({ params }: Props) {
  const { lang } = await params;
  return <CorreccionesQueue lang={lang} />;
}
