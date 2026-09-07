import type { Metadata } from "next";
import { LoopRunsClient } from "./LoopRunsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin · Loop runs",
  robots: { index: false },
};

export default function LoopRunsPage() {
  return <LoopRunsClient />;
}
