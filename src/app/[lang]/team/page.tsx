import { ReceivedSpacesClient } from "./ReceivedSpacesClient";
import { isTeamFeatureEnabled } from "@/lib/teamFeature";

export default async function TeamPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isTeamFeatureEnabled()) {
    const es = lang === "es";
    return <section style={{ maxWidth: 760, margin: "3rem auto", padding: "0 1.25rem", color: "#172033" }}>
      <h1>{es ? "Espacios compartidos" : "Shared spaces"}</h1>
      <p role="status">{es
        ? "Team se está preparando. Tus planes Pro y Max no cambian."
        : "Team is being prepared. Your Pro and Max plans are unchanged."}</p>
    </section>;
  }
  return <ReceivedSpacesClient lang={lang} />;
}
