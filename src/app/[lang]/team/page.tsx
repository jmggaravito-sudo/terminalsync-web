import { ReceivedSpacesClient } from "./ReceivedSpacesClient";

export default async function TeamPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <ReceivedSpacesClient lang={lang} />;
}
