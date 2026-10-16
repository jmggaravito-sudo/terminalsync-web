import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/content";
import { LegalShell } from "@/components/landing/LegalShell";
import { DraftNotice, ToConfirm, isDraft } from "@/components/legal/Pending";
import { legalMetadata } from "@/components/legal/legalMeta";
import { LEGAL_DOCS_VERSION } from "@/content/legalEntity";
import { SUBPROCESSORS } from "@/content/subprocessors";

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return legalMetadata(
    lang,
    "subprocessors",
    { es: "Subencargados del tratamiento — TerminalSync", en: "Subprocessors — TerminalSync" },
    {
      es: "Proveedores que tratan datos en nombre de TerminalSync: finalidad, ubicación y mecanismo de transferencia.",
      en: "Providers that process data on behalf of TerminalSync: purpose, location and transfer mechanism.",
    },
  );
}

export async function generateStaticParams() {
  return [{ lang: "es" }, { lang: "en" }];
}

export default async function SubprocessorsPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const es = lang === "es";

  const consentLabel = {
    analytics: es ? "Solo con tu consentimiento de analítica" : "Only with your analytics consent",
    affiliates: es ? "Solo con tu consentimiento de afiliados" : "Only with your affiliates consent",
  } as const;

  return (
    <LegalShell
      lang={lang}
      title={es ? "Subencargados del tratamiento" : "Subprocessors"}
      subtitle={
        es
          ? "Estos son los proveedores que reciben datos para que TerminalSync funcione, con la finalidad de cada uno, dónde se tratan los datos y con qué garantías cuando salen del Espacio Económico Europeo."
          : "These are the providers that receive data so TerminalSync can work, with each one's purpose, where data is processed and what safeguards apply when it leaves the European Economic Area."
      }
      lastUpdated={
        es ? `Versión de borrador: ${LEGAL_DOCS_VERSION}` : `Draft version: ${LEGAL_DOCS_VERSION}`
      }
    >
      <DraftNotice lang={lang} />

      <h2>{es ? "1. Lista de proveedores" : "1. List of providers"}</h2>
      <p>
        {es
          ? "TerminalSync usa un asistente de IA incluido que funciona con el modelo GLM de Z.ai (Zhipu AI), una empresa de origen chino. Lo nombramos aquí con total claridad porque, al usar esa IA, tu mensaje y el material de Contexto necesario salen del Espacio Económico Europeo."
          : "TerminalSync uses an included AI assistant powered by the GLM model from Z.ai (Zhipu AI), a company of Chinese origin. We name it plainly here because, when you use that AI, your message and the Context material needed leave the European Economic Area."}
      </p>

      <div className="not-prose space-y-4">
        {SUBPROCESSORS.map((s) => (
          <section
            key={s.id}
            id={s.id}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4"
          >
            <h3 className="!mt-0 text-[16px] font-semibold text-[var(--color-fg-strong)]">
              {s.url ? (
                <a href={s.url} rel="noopener noreferrer" target="_blank">
                  {s.name}
                </a>
              ) : (
                s.name
              )}
            </h3>
            <dl className="mt-2 grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-x-4 gap-y-1.5 text-[14px] leading-relaxed">
              <dt className="font-semibold text-[var(--color-fg-strong)]">{es ? "Finalidad" : "Purpose"}</dt>
              <dd className="text-[var(--color-fg-muted)]">{s.purpose[lang]}</dd>
              <dt className="font-semibold text-[var(--color-fg-strong)]">{es ? "Datos" : "Data"}</dt>
              <dd className="text-[var(--color-fg-muted)]">{s.data[lang]}</dd>
              <dt className="font-semibold text-[var(--color-fg-strong)]">{es ? "Ubicación" : "Location"}</dt>
              <dd className="text-[var(--color-fg-muted)]">
                {s.location ? s.location[lang] : es ? "No consta." : "Not on record."}
              </dd>
              <dt className="font-semibold text-[var(--color-fg-strong)]">
                {es ? "Transferencia fuera del EEE" : "Transfer outside the EEA"}
              </dt>
              <dd className="text-[var(--color-fg-muted)]">
                {s.transfer ? s.transfer[lang] : null}
                {isDraft() ? (
                  <ToConfirm>{s.confirm[lang]}</ToConfirm>
                ) : null}
              </dd>
              {(s.consent || s.onRequest) && (
                <>
                  <dt className="font-semibold text-[var(--color-fg-strong)]">{es ? "Cuándo" : "When"}</dt>
                  <dd className="text-[var(--color-fg-muted)]">
                    {s.consent
                      ? consentLabel[s.consent]
                      : es
                        ? "Solo cuando lo pides tú"
                        : "Only when you ask for it"}
                  </dd>
                </>
              )}
              {isDraft() && (
                <>
                  <dt className="font-semibold text-[var(--color-fg-strong)]">
                    {es ? "Origen del dato" : "Source"}
                  </dt>
                  <dd className="text-[var(--color-fg-muted)] font-mono text-[12.5px]">
                    {s.evidence === "code"
                      ? es
                        ? "verificado en el código de la web"
                        : "verified in the web code"
                      : s.evidence === "policy"
                        ? es
                          ? "según la Política de Privacidad vigente"
                          : "per the current Privacy Policy"
                        : es
                          ? "documentación de la app; no verificable desde la web"
                          : "app documentation; not verifiable from the web"}
                  </dd>
                </>
              )}
            </dl>
          </section>
        ))}
      </div>

      <h2>{es ? "2. Quién no figura aquí" : "2. Who is not listed here"}</h2>
      <p>
        {es
          ? "No figuran los servicios que tú conectas con tus propias credenciales (tu nube de Google Drive o iCloud, o las cuentas de terceros que enlaces como conectores): ahí decides tú qué se comparte y con quién."
          : "Services you connect with your own credentials (your Google Drive or iCloud, or third-party accounts you link as connectors) are not listed: there you decide what is shared and with whom."}
      </p>

      <h2>{es ? "3. Cambios en la lista" : "3. Changes to this list"}</h2>
      <p>
        {es
          ? "Actualizaremos esta página cuando se añada o sustituya un proveedor. "
          : "We will update this page when a provider is added or replaced. "}
        <ToConfirm>
          {es
            ? "plazo de aviso previo (días), forma de notificarlo a clientes empresa y derecho de oposición o de rescisión"
            : "prior-notice period (days), how to notify business customers and right to object or terminate"}
        </ToConfirm>
      </p>

      <h2>{es ? "4. Preguntas" : "4. Questions"}</h2>
      <p>
        {es ? "Escríbenos a " : "Write to us at "}
        <a href="mailto:privacy@terminalsync.ai">privacy@terminalsync.ai</a>.
      </p>
    </LegalShell>
  );
}
