// Fallback — middleware should redirect to /es or /en before reaching this.
import { redirect } from "next/navigation";
import { defaultLocale } from "@/content";

export default function RootPage() {
  redirect(`/${defaultLocale}`);
}
