import { redirect } from "next/navigation";

// Loop runs moved into the Ops section so it lives alongside the Outreach
// Queue under /admin/ops. Keep this redirect so the old link still works.
export default function LegacyLoopRunsRedirect() {
  redirect("/es/admin/ops/loop-runs");
}
