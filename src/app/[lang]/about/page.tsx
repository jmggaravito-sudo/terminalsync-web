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
      ? "Sobre nosotros — TerminalSync"
      : "About — TerminalSync";
  const description =
    lang === "es"
      ? "Por qué construimos TerminalSync, en qué creemos sobre privacidad y autonomía digital, y cómo trabajamos."
      : "Why we built TerminalSync, what we believe about privacy and digital autonomy, and how we work.";
  return {
    title,
    description,
    alternates: {
      canonical: `https://terminalsync.ai/${lang}/about`,
      languages: {
        es: "https://terminalsync.ai/es/about",
        en: "https://terminalsync.ai/en/about",
      },
    },
  };
}

export async function generateStaticParams() {
  return [{ lang: "es" }, { lang: "en" }];
}

export default async function AboutPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  if (lang === "es") {
    return (
      <LegalShell
        lang="es"
        title="Sobre TerminalSync"
        subtitle="Construimos la capa de memoria, privacidad y movilidad para los agentes IA modernos."
      >
        <h2>Por qué existimos</h2>
        <p>
          Claude Code, Codex y herramientas similares cambiaron cómo trabajan
          los devs. Pero todas comparten un problema: cada vez que cerrás la
          terminal perdés el contexto, no roamean entre tus computadoras, no
          tienen vault de secretos, y no te avisan cuando se traban.
        </p>
        <p>
          La alternativa de la industria es alquilar nube — pagás por minuto,
          tu código vive en servidores de un vendor, y aceptás un nivel de
          dependencia que para muchos profesionales no es aceptable.
        </p>
        <p>
          <strong>TerminalSync es la tercera opción</strong>: una capa local
          que le da memoria, privacidad y movilidad a tus agentes — corriendo
          en tu propia Mac, guardando en tu propia nube, con cifrado
          AES-256 zero-knowledge que ni nosotros podemos romper.
        </p>

        <h2>En qué creemos</h2>
        <ul>
          <li>
            <strong>Tu código y tus secretos son tuyos.</strong> No pueden
            vivir en la base de datos de un vendor. Punto.
          </li>
          <li>
            <strong>Cifrado por default, no como upgrade.</strong> Zero-knowledge
            no es un feature premium, es la base.
          </li>
          <li>
            <strong>Sin vendor lock-in.</strong> Tu sync se hace contra tu
            Drive/iCloud/Dropbox. Si dejás de pagarnos mañana, los archivos
            cifrados siguen ahí — vos tenés las llaves.
          </li>
          <li>
            <strong>Honestidad técnica.</strong> El motor de cifrado va a ser
            auditable públicamente. Lo que decimos en la landing tiene que
            sostenerse cuando un security researcher abre el código.
          </li>
        </ul>

        <h2>Cómo trabajamos</h2>
        <p>
          Equipo pequeño y enfocado. Construimos lento y bien — preferimos
          enviar 1 feature sólida por mes que 10 features mediocres. El
          roadmap público se mantiene en GitHub, y los cambios materiales
          pasan por revisión de la comunidad de early-adopters antes de
          shippear.
        </p>

        <h2>Contacto</h2>
        <p>
          ¿Querés colaborar, dar feedback, o simplemente charlar?{" "}
          <a href="mailto:hola@terminalsync.ai">hola@terminalsync.ai</a>.
          Respondemos personalmente.
        </p>
      </LegalShell>
    );
  }

  return (
    <LegalShell
      lang="en"
      title="About TerminalSync"
      subtitle="We build the memory, privacy, and mobility layer for modern AI agents."
    >
      <h2>Why we exist</h2>
      <p>
        Claude Code, Codex, and similar tools changed how developers work.
        But they all share a problem: every time you close the terminal you
        lose the context, they don't roam between your computers, they don't
        have a secrets vault, and they don't ping you when they get stuck.
      </p>
      <p>
        The industry's alternative is renting cloud — pay by the minute, your
        code lives on a vendor's servers, and you accept a level of
        dependency that for many professionals isn't acceptable.
      </p>
      <p>
        <strong>TerminalSync is the third option</strong>: a local layer
        that gives memory, privacy, and mobility to your agents — running on
        your own Mac, storing on your own cloud, with AES-256 zero-knowledge
        encryption that even we can't break.
      </p>

      <h2>What we believe</h2>
      <ul>
        <li>
          <strong>Your code and your secrets are yours.</strong> They can't
          live in a vendor's database. Period.
        </li>
        <li>
          <strong>Encryption by default, not as an upgrade.</strong> Zero-knowledge
          isn't a premium feature — it's the foundation.
        </li>
        <li>
          <strong>No vendor lock-in.</strong> Your sync runs against your
          Drive/iCloud/Dropbox. If you stop paying us tomorrow, the encrypted
          files are still there — you hold the keys.
        </li>
        <li>
          <strong>Technical honesty.</strong> The encryption engine will be
          publicly auditable. What we say on the landing has to hold when a
          security researcher opens the code.
        </li>
      </ul>

      <h2>How we work</h2>
      <p>
        Small focused team. We build slowly and well — we'd rather ship one
        solid feature per month than ten mediocre ones. The public roadmap
        lives on GitHub, and material changes go through review by our
        early-adopter community before shipping.
      </p>

      <h2>Contact</h2>
      <p>
        Want to collaborate, share feedback, or just chat?{" "}
        <a href="mailto:hola@terminalsync.ai">hola@terminalsync.ai</a>.
        We reply personally.
      </p>
    </LegalShell>
  );
}
