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
  const title = lang === "es" ? "Soporte — Terminal Sync" : "Support — Terminal Sync";
  const description =
    lang === "es"
      ? "Canales oficiales para obtener ayuda con Terminal Sync y reportar problemas de forma segura."
      : "Official channels for getting help with Terminal Sync and reporting issues safely.";
  return {
    title,
    description,
    alternates: {
      canonical: `https://terminalsync.ai/${lang}/support`,
      languages: {
        es: "https://terminalsync.ai/es/support",
        en: "https://terminalsync.ai/en/support",
      },
    },
  };
}

export async function generateStaticParams() {
  return [{ lang: "es" }, { lang: "en" }];
}

export default async function SupportPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  if (lang === "es") {
    return (
      <LegalShell
        lang="es"
        title="Soporte de Terminal Sync"
        subtitle="Ayuda para la aplicación de escritorio, tu cuenta y la sincronización de espacios."
      >
        <h2>Contacto</h2>
        <p>
          Escribinos a <a href="mailto:support@terminalsync.ai">support@terminalsync.ai</a>.
          Este es el canal oficial para problemas técnicos, acceso a la cuenta y consultas de facturación.
        </p>

        <h2>Qué incluir</h2>
        <ul>
          <li>La versión de Terminal Sync y tu versión de Windows o macOS.</li>
          <li>Qué estabas intentando hacer y qué ocurrió.</li>
          <li>El texto exacto del error, si apareció uno.</li>
          <li>Una captura recortada, solo si no muestra información privada.</li>
        </ul>

        <h2>No envíes información sensible</h2>
        <p>
          No envíes contraseñas, códigos de verificación, claves API, frases secretas,
          tokens, números completos de tarjeta ni archivos privados. Nunca te pediremos
          esos datos por correo.
        </p>

        <h2>Privacidad y seguridad</h2>
        <p>
          Para solicitudes sobre tus datos, escribí a{" "}
          <a href="mailto:privacy@terminalsync.ai">privacy@terminalsync.ai</a> o consultá la{" "}
          <a href="/es/legal/privacy">Política de Privacidad</a>. Para reportar una vulnerabilidad,
          escribí a <a href="mailto:security@terminalsync.ai">security@terminalsync.ai</a> y evitá
          publicar detalles antes de que podamos revisarlos.
        </p>
      </LegalShell>
    );
  }

  return (
    <LegalShell
      lang="en"
      title="Terminal Sync Support"
      subtitle="Help with the desktop app, your account, and workspace synchronization."
    >
      <h2>Contact</h2>
      <p>
        Email <a href="mailto:support@terminalsync.ai">support@terminalsync.ai</a>.
        This is the official channel for technical issues, account access, and billing questions.
      </p>

      <h2>What to include</h2>
      <ul>
        <li>Your Terminal Sync version and Windows or macOS version.</li>
        <li>What you were trying to do and what happened.</li>
        <li>The exact error text, if one appeared.</li>
        <li>A cropped screenshot, only if it contains no private information.</li>
      </ul>

      <h2>Do not send sensitive information</h2>
      <p>
        Do not send passwords, verification codes, API keys, secret phrases, tokens,
        full card numbers, or private files. We will never ask for those details by email.
      </p>

      <h2>Privacy and security</h2>
      <p>
        For data requests, email <a href="mailto:privacy@terminalsync.ai">privacy@terminalsync.ai</a>{" "}
        or read the <a href="/en/legal/privacy">Privacy Policy</a>. To report a vulnerability,
        email <a href="mailto:security@terminalsync.ai">security@terminalsync.ai</a> and avoid
        publishing details before we can review them.
      </p>
    </LegalShell>
  );
}
