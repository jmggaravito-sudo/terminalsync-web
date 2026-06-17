import type { Metadata } from "next";
import OutreachQueue from "./OutreachQueue";

export const metadata: Metadata = {
  title: "Outreach Queue · TerminalSync",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function Page() {
  return <OutreachQueue />;
}
