import { ProductionQueue } from "@/components/voice-studio/ProductionQueue";

export const metadata = {
  title: "Voice Studio — Production Queue",
  robots: { index: false, follow: false },
};

export default function VoiceStudioProductionPage() {
  return <ProductionQueue />;
}
