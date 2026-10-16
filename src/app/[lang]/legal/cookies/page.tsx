import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/content";
import { LegalShell } from "@/components/landing/LegalShell";
import { DraftNotice, ToConfirm } from "@/components/legal/Pending";
import { legalMetadata } from "@/components/legal/legalMeta";
import { CookieSettingsLink } from "@/components/consent/CookieSettingsLink";
import { COOKIE_ROWS, PRELOAD_THIRD_PARTY, type CookieCategory } from "@/content/cookies";
import { LEGAL_DOCS_VERSION } from "@/content/legalEntity";
import { CONSENT_VERSION } from "@/lib/consent";

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return legalMetadata(
    lang,
    "cookies",
    { es: "Política de cookies — TerminalSync", en: "Cookie Policy — TerminalSync" },
    {
      es: "Qué cookies y almacenamiento usa terminalsync.ai, para qué sirven, cuánto duran y cómo aceptarlas, rechazarlas o cambiar tu decisión.",
      en: "Which cookies and storage terminalsync.ai uses, what they are for, how long they last and how to accept, reject or change your decision.",
    },
  );
}

export async function generateStaticParams() {
  return [{ lang: "es" }, { lang: "en" }];
}

const CATEGORY_LABEL: Record<CookieCategory, { es: string; en: string }> = {
  necessary: { es: "Necesaria", en: "Necessary" },
  analytics: { es: "Analítica y errores", en: "Analytics and errors" },
  affiliates: { es: "Afiliados", en: "Affiliates" },
};

const KIND_LABEL = {
  cookie: { es: "Cookie", en: "Cookie" },
  localStorage: { es: "Almacenamiento local", en: "Local storage" },
  request: { es: "Petición a tercero", en: "Third-party request" },
} as const;

export default async function CookiesPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const es = lang === "es";

  const th = "text-left font-semibold text-[var(--color-fg-strong)] px-3 py-2 border-b border-[var(--color-border)]";
  const td = "px-3 py-2 align-top border-b border-[var(--color-border)] text-[var(--color-fg-muted)]";

  return (
    <LegalShell
      lang={lang}
      title={es ? "Política de cookies" : "Cookie Policy"}
      subtitle={
        es
          ? "Qué guardamos en tu navegador, para qué, durante cuánto tiempo, y cómo aceptarlo, rechazarlo o cambiar de opinión cuando quieras."
          : "What we store in your browser, what for, for how long, and how to accept, reject or change your mind whenever you want."
      }
      lastUpdated={
        es
          ? `Versión de borrador: ${LEGAL_DOCS_VERSION} · versión del aviso de consentimiento: ${CONSENT_VERSION}`
          : `Draft version: ${LEGAL_DOCS_VERSION} · consent notice version: ${CONSENT_VERSION}`
      }
    >
      <DraftNotice lang={lang} />

      <h2>{es ? "1. Qué son y para qué sirven" : "1. What they are and what they are for"}</h2>
      <p>
        {es
          ? "Las cookies y tecnologías similares (como el almacenamiento local del navegador) guardan pequeños datos en tu dispositivo. Unas son imprescindibles para que el sitio funcione y otras sirven para medir su uso. Esta política sigue la Ley 34/2002 (LSSI-CE, art. 22.2) y la Guía sobre el uso de las cookies de la Agencia Española de Protección de Datos."
          : "Cookies and similar technologies (such as the browser's local storage) save small pieces of data on your device. Some are essential for the site to work and others are used to measure its use. This policy follows Spanish Law 34/2002 (LSSI-CE, art. 22.2) and the Spanish Data Protection Agency's cookie guide."}
      </p>

      <h2>{es ? "2. Qué usa este sitio" : "2. What this site uses"}</h2>
      <p>
        {es
          ? "Esta tabla recoge todo lo que el sitio guarda o carga hoy. Solo las filas «Necesaria» se usan sin preguntarte. El resto no se carga hasta que lo aceptas."
          : "This table lists everything the site stores or loads today. Only the “Necessary” rows are used without asking you. Everything else does not load until you accept it."}
      </p>
      <div className="not-prose overflow-x-auto mb-6">
        <table className="w-full text-[13px] border-collapse min-w-[720px]">
          <thead>
            <tr>
              <th className={th}>{es ? "Nombre" : "Name"}</th>
              <th className={th}>{es ? "Proveedor" : "Provider"}</th>
              <th className={th}>{es ? "Tipo" : "Type"}</th>
              <th className={th}>{es ? "Categoría" : "Category"}</th>
              <th className={th}>{es ? "Finalidad" : "Purpose"}</th>
              <th className={th}>{es ? "Duración" : "Duration"}</th>
            </tr>
          </thead>
          <tbody>
            {COOKIE_ROWS.map((r) => (
              <tr key={r.name}>
                <td className={`${td} font-mono text-[12px] break-all`}>{r.name}</td>
                <td className={td}>
                  {r.provider}
                  <br />
                  <span className="text-[11.5px] text-[var(--color-fg-dim)]">
                    {r.party === "own" ? (es ? "propia" : "first party") : es ? "de tercero" : "third party"}
                  </span>
                </td>
                <td className={td}>{KIND_LABEL[r.kind][lang]}</td>
                <td className={td}>{CATEGORY_LABEL[r.category][lang]}</td>
                <td className={td}>
                  {r.purpose[lang]}
                  {r.confirm ? <ToConfirm>{r.confirm[lang]}</ToConfirm> : null}
                </td>
                <td className={td}>{r.duration[lang]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        {es
          ? "Cuando pagas, la página de pago la aloja Stripe y se rige por la política de cookies de Stripe, no por esta."
          : "When you pay, the checkout page is hosted by Stripe and is governed by Stripe's cookie policy, not this one."}
      </p>

      <h3>{es ? "Recursos de terceros que se descargan al abrir el sitio" : "Third-party resources downloaded when the site opens"}</h3>
      <p>
        {es
          ? "Estas peticiones no usan cookies, pero el servidor del tercero recibe tu dirección IP. Hoy ocurren antes de que decidas nada porque son necesarias para mostrar el sitio tal y como está diseñado."
          : "These requests use no cookies, but the third party's server receives your IP address. Today they happen before you decide anything because they are needed to show the site as designed."}{" "}
        <ToConfirm>
          {es
            ? "autoalojar fuentes e iconos (tarea W2 del handoff) para eliminar estas peticiones; hasta entonces el abogado debe valorar si exigen consentimiento"
            : "self-host fonts and icons (handoff task W2) to remove these requests; until then the lawyer must assess whether they require consent"}
        </ToConfirm>
      </p>
      <ul>
        {PRELOAD_THIRD_PARTY.map((t) => (
          <li key={t.host}>
            <strong>{t.provider}</strong> (<code>{t.host}</code>): {t.purpose[lang]} {t.where[lang]}.
          </li>
        ))}
      </ul>

      <h2>{es ? "3. Cómo aceptar, rechazar o cambiar tu decisión" : "3. How to accept, reject or change your decision"}</h2>
      <p>
        {es
          ? "La primera vez que entras ves un aviso con tres botones del mismo tamaño: «Aceptar todas», «Rechazar todas» y «Configurar». Rechazar es tan fácil como aceptar y no te impide usar el sitio. Si no eliges nada, no se carga ninguna analítica ni herramienta de afiliados."
          : "The first time you visit you see a notice with three equally sized buttons: “Accept all”, “Reject all” and “Configure”. Rejecting is as easy as accepting and does not stop you from using the site. If you choose nothing, no analytics or affiliate tools are loaded."}
      </p>
      <p>
        {es
          ? "Guardamos tu decisión (con la fecha y la versión del aviso) en tu navegador, para no volver a preguntarte y poder demostrar que la diste. Puedes cambiarla o retirarla en cualquier momento:"
          : "We save your decision (with the date and notice version) in your browser, so we do not ask again and can show that you gave it. You can change or withdraw it at any time:"}
      </p>
      <p>
        <CookieSettingsLink
          label={es ? "Configurar cookies" : "Configure cookies"}
          className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-4 h-9 text-[13px] font-semibold text-[var(--color-fg-strong)] hover:bg-[var(--color-panel-2)]"
        />
      </p>
      <p>
        {es ? "Renovación de la decisión: " : "Renewal of your decision: "}
        {es
          ? "te volveremos a preguntar si cambia la versión de este aviso o si borras los datos del navegador."
          : "we will ask again if the version of this notice changes or if you clear your browser data."}{" "}
        <ToConfirm>
          {es
            ? "plazo máximo de renovación del consentimiento (por ejemplo 24 meses)"
            : "maximum consent renewal period (for example 24 months)"}
        </ToConfirm>
      </p>

      <h2>{es ? "4. Cómo borrar cookies en tu navegador" : "4. How to delete cookies in your browser"}</h2>
      <p>
        {es
          ? "También puedes borrar o bloquear las cookies y el almacenamiento local desde los ajustes de privacidad de Chrome, Safari, Firefox o Edge. Si lo haces, el sitio volverá a preguntarte y cerrará tu sesión."
          : "You can also delete or block cookies and local storage from the privacy settings of Chrome, Safari, Firefox or Edge. If you do, the site will ask you again and sign you out."}
      </p>

      <h2>{es ? "5. Más información" : "5. More information"}</h2>
      <p>
        {es ? "El tratamiento de tus datos personales se explica en la " : "How we process your personal data is explained in the "}
        <a href={`/${lang}/legal/privacy`}>{es ? "Política de Privacidad" : "Privacy Policy"}</a>
        {es ? " y los proveedores en la página de " : " and the providers on the "}
        <a href={`/${lang}/legal/subprocessors`}>{es ? "subencargados" : "subprocessors page"}</a>
        {es ? ". Dudas: " : ". Questions: "}
        <a href="mailto:privacy@terminalsync.ai">privacy@terminalsync.ai</a>.
      </p>
    </LegalShell>
  );
}
