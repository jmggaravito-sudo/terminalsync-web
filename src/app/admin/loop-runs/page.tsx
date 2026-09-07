import { redirect } from "next/navigation";

// Loop runs moved into the Integraciones section. Keep this redirect so
// the old link still works.
export default function LegacyLoopRunsRedirect() {
  redirect("/es/admin/integraciones/loop-runs");
}
