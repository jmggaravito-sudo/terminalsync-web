import { notFound } from "next/navigation";
import { getSkill, getSkillInstallPayload } from "@/lib/skills";
import { getConnector } from "@/lib/connectors";
import { InstallClient } from "./InstallClient";

interface Props {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ type?: string; slug?: string }>;
}

export default async function InstallPage({ params, searchParams }: Props) {
  const { lang } = await params;
  const sp = await searchParams;
  const type = sp.type;
  const slug = sp.slug;

  if (!type || !slug || (type !== "skill" && type !== "connector")) {
    notFound();
  }

  if (type === "skill") {
    const doc = await getSkill(lang, slug);
    const payload = await getSkillInstallPayload(slug);
    if (!doc || !payload) notFound();
    return (
      <InstallClient
        lang={lang}
        kind="skill"
        name={doc.name}
        tagline={doc.tagline}
        logo={doc.logo}
        skillPayload={payload}
      />
    );
  }

  const doc = await getConnector(lang, slug);
  if (!doc) notFound();
  return (
    <InstallClient
      lang={lang}
      kind="connector"
      name={doc.name}
      tagline={doc.tagline}
      logo={doc.logo}
      connectorSlug={slug}
    />
  );
}
