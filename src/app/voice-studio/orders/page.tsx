import { emailFromOrdersToken } from "@/lib/voiceStudioLicense";
import { OrdersGate } from "@/components/voice-studio/OrdersGate";

export const metadata = { title: "Voice Studio — Your dashboard" };

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  // Older emailed links still work for their original lifetime. Invalid or
  // expired links go to the same Google / magic-link sign-in as a direct visit.
  return <OrdersGate token={emailFromOrdersToken(t) ? t : undefined} />;
}
