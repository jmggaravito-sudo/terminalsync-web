import { notFound } from "next/navigation";
import { CartTestResult } from "@/components/voice-studio/CartTestResult";
import { testCartCheckoutConfig } from "@/lib/voiceStudioCartCheckout";
import { voiceStudioAgreement } from "@/lib/voiceStudioQuoteIntake";

export const dynamic = "force-dynamic";
export const metadata = { title: "Voice Studio · Stripe test checkout", robots: { index: false, follow: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ session_id?: string | string[] }> }) {
  if (!testCartCheckoutConfig() || !voiceStudioAgreement()) notFound();
  const { session_id: id } = await searchParams;
  if (typeof id !== "string" || !/^cs_test_[a-zA-Z0-9]{1,200}$/.test(id)) notFound();
  return <CartTestResult sessionId={id} />;
}
