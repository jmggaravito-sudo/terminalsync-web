import { CartPreview } from "@/components/voice-studio/CartPreview";

import { voiceStudioAgreement } from "@/lib/voiceStudioQuoteIntake";

export const dynamic = "force-dynamic";
export const metadata = { title: "Voice Studio · Cart preview", robots: { index: false, follow: false } };

export default function CartPreviewPage() {
  return <CartPreview intakeEnabled={!!voiceStudioAgreement()} />;
}
