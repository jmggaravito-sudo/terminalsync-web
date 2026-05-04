import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/content";
import { LegalShell } from "@/components/landing/LegalShell";

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const title =
    lang === "es"
      ? "Blog — TerminalSync"
      : "Blog — TerminalSync";
  const description =
    lang === "es"
      ? "Notas técnicas, decisiones de arquitectura y estado del producto."
      : "Technical notes, architecture decisions, and product updates.";
  return {
    title,
    description,
    alternates: {
      canonical: `https://terminalsync.ai/${lang}/blog`,
      languages: {
        es: "https://terminalsync.ai/es/blog",
        en: "https://terminalsync.ai/en/blog",
      },
    },
  };
}

export async function generateStaticParams() {
  return [{ lang: "es" }, { lang: "en" }];
}

export default async function BlogIndex({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const isEs = lang === "es";

  return (
    <LegalShell
      lang={lang}
      title={isEs ? "Blog" : "Blog"}
      subtitle={
        isEs
          ? "Notas técnicas, decisiones de arquitectura y estado del producto."
          : "Technical notes, architecture decisions, and product updates."
      }
    >
      <p>
        {isEs
          ? "Estamos preparando el primer batch de posts. Mientras tanto, podés:"
          : "We're prepping the first batch of posts. In the meantime, you can:"}
      </p>
      <ul>
        <li>
          {isEs ? "Seguir el roadmap público en " : "Follow the public roadmap on "}
          <a href="https://github.com/jmggaravito-sudo/terminal-sync" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          .
        </li>
        <li>
          {isEs ? "Suscribirte por email a actualizaciones del producto en " : "Subscribe by email to product updates at "}
          <a href="mailto:hola@terminalsync.ai">hola@terminalsync.ai</a>
          .
        </li>
        <li>
          {isEs ? "Leer nuestra " : "Read our "}
          <a href={`/${lang}/legal/security`}>
            {isEs ? "página de seguridad" : "security page"}
          </a>
          {isEs
            ? " para entender la arquitectura zero-knowledge."
            : " to understand the zero-knowledge architecture."}
        </li>
      </ul>
    </LegalShell>
  );
}
