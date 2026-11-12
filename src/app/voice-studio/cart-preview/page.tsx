import { CartPreview } from "@/components/voice-studio/CartPreview";

import { testCartCheckoutConfig, testCartCheckoutRequested } from "@/lib/voiceStudioCartCheckout";
import { voiceStudioAgreement } from "@/lib/voiceStudioQuoteIntake";

export const dynamic = "force-dynamic";
export const metadata = { title: "Voice Studio · Cart preview", robots: { index: false, follow: false } };

export default function CartPreviewPage() {
  const testCheckout = !!testCartCheckoutConfig();
  return <CartPreview intakeEnabled={!!voiceStudioAgreement() && (!testCartCheckoutRequested() || testCheckout)} testCheckout={testCheckout} />;
}
