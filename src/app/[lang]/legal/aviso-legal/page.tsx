import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/content";
import { LegalShell } from "@/components/landing/LegalShell";
import { DraftNotice, Pending, ToConfirm } from "@/components/legal/Pending";
import { legalMetadata } from "@/components/legal/legalMeta";
import { CONTACTS, LEGAL_DOCS_VERSION, PROVIDER_FIELDS } from "@/content/legalEntity";

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return legalMetadata(
    lang,
    "aviso-legal",
    { es: "Aviso legal — TerminalSync", en: "Legal notice — TerminalSync" },
    {
      es: "Datos del prestador del servicio, condiciones de acceso al sitio, propiedad intelectual y contacto.",
      en: "Service provider details, site access conditions, intellectual property and contact.",
    },
  );
}

export async function generateStaticParams() {
  return [{ lang: "es" }, { lang: "en" }];
}

export default async function AvisoLegalPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const es = lang === "es";

  const rows = PROVIDER_FIELDS.map((f) => {
    const value = typeof f.value === "string" ? f.value : f.value?.[lang];
    return (
      <tr key={f.key} className="align-top">
        <th scope="row" className="pr-4 py-2 text-left font-semibold text-[var(--color-fg-strong)] w-[38%]">
          {f.label[lang]}
        </th>
        <td className="py-2 text-[var(--color-fg-muted)]">
          {value}
          {f.pending && (
            <>
              {value ? " " : null}
              <Pending>{f.pending[lang]}</Pending>
            </>
          )}
        </td>
      </tr>
    );
  });

  return (
    <LegalShell
      lang={lang}
      title={es ? "Aviso legal" : "Legal notice"}
      subtitle={
        es
          ? "Información general del sitio web terminalsync.ai conforme a la Ley 34/2002 de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE), artículo 10."
          : "General information about the terminalsync.ai website under Spanish Law 34/2002 on information society services and e-commerce (LSSI-CE), article 10."
      }
      lastUpdated={
        es ? `Versión de borrador: ${LEGAL_DOCS_VERSION}` : `Draft version: ${LEGAL_DOCS_VERSION}`
      }
    >
      <DraftNotice lang={lang} />

      <h2>{es ? "1. Identificación del prestador" : "1. Identification of the provider"}</h2>
      <table className="w-full text-[14.5px] border-collapse mb-4">
        <tbody>{rows}</tbody>
      </table>

      <h2>{es ? "2. Objeto y condiciones de acceso" : "2. Purpose and access conditions"}</h2>
      {es ? (
        <>
          <p>
            Este sitio web presenta TerminalSync, una aplicación de escritorio con inteligencia artificial, y
            permite crear una cuenta, contratar un plan y consultar la documentación. El acceso y la navegación
            son gratuitos; contratar el servicio se rige por los{" "}
            <a href="/es/legal/terms">Términos del Servicio</a>.
          </p>
          <p>
            Te comprometes a usar el sitio conforme a la ley, a la buena fe y a este aviso, sin dañar su
            funcionamiento ni intentar acceder a zonas restringidas. El tratamiento de tus datos personales se
            explica en la <a href="/es/legal/privacy">Política de Privacidad</a> y el uso de cookies en la{" "}
            <a href="/es/legal/cookies">Política de cookies</a>.
          </p>
        </>
      ) : (
        <>
          <p>
            This website presents TerminalSync, a desktop application with artificial intelligence, and lets you
            create an account, subscribe to a plan and read the documentation. Access and browsing are free;
            subscribing to the service is governed by the <a href="/en/legal/terms">Terms of Service</a>.
          </p>
          <p>
            You agree to use the site lawfully, in good faith and in line with this notice, without harming its
            operation or trying to access restricted areas. How we process your personal data is explained in the{" "}
            <a href="/en/legal/privacy">Privacy Policy</a> and our use of cookies in the{" "}
            <a href="/en/legal/cookies">Cookie Policy</a>.
          </p>
        </>
      )}

      <h2>{es ? "3. Propiedad intelectual e industrial" : "3. Intellectual and industrial property"}</h2>
      {es ? (
        <p>
          Los textos, el diseño, el código, los logotipos y las marcas de TerminalSync pertenecen a su titular o
          se usan con licencia. No puedes reproducirlos, distribuirlos ni transformarlos sin autorización
          expresa, salvo los usos que la ley permita. Los nombres y logotipos de terceros (por ejemplo,
          conectores o herramientas compatibles) pertenecen a sus respectivos titulares y se mencionan solo para
          identificar la compatibilidad. El contenido que tú creas con la aplicación sigue siendo tuyo, según
          los Términos del Servicio.
        </p>
      ) : (
        <p>
          The texts, design, code, logos and trademarks of TerminalSync belong to their owner or are used under
          licence. You may not reproduce, distribute or transform them without express permission, except for
          uses the law allows. Third-party names and logos (for example connectors or compatible tools) belong
          to their respective owners and are mentioned only to identify compatibility. Content you create with
          the application remains yours, as set out in the Terms of Service.
        </p>
      )}

      <h2>{es ? "4. Enlaces a terceros y responsabilidad" : "4. Third-party links and liability"}</h2>
      {es ? (
        <p>
          El sitio puede enlazar a páginas de terceros (por ejemplo, el procesador de pagos o los proveedores de
          los conectores). No controlamos su contenido ni sus políticas y no respondemos de ellos. Hacemos lo
          posible por mantener la información actualizada y el sitio disponible, pero no garantizamos que esté
          libre de errores o interrupciones. Nada de este aviso limita los derechos que la ley te reconoce como
          consumidor.
        </p>
      ) : (
        <p>
          The site may link to third-party pages (for example the payment processor or connector providers). We
          do not control their content or policies and are not responsible for them. We do our best to keep the
          information up to date and the site available, but we do not guarantee it is free of errors or
          interruptions. Nothing in this notice limits the rights the law gives you as a consumer.
        </p>
      )}

      <h2>{es ? "5. Ley aplicable y jurisdicción del sitio" : "5. Governing law and jurisdiction for the site"}</h2>
      <p>
        {es
          ? "Para el uso de este sitio web, como distinto de la contratación del servicio, se aplicará la legislación española y, si eres consumidor, los juzgados y tribunales de tu domicilio."
          : "For the use of this website, as distinct from contracting the service, Spanish law applies and, if you are a consumer, the courts of your place of residence."}{" "}
        <ToConfirm>
          {es
            ? "ley y fuero aplicables al sitio para un prestador no establecido en España, y cómo se articula con la cláusula de Florida de los Términos"
            : "law and forum applicable to the site for a provider not established in Spain, and how it fits with the Florida clause in the Terms"}
        </ToConfirm>
      </p>

      <h2>{es ? "6. Contacto y reclamaciones" : "6. Contact and complaints"}</h2>
      {es ? (
        <>
          <p>
            Para cualquier cuestión legal sobre el sitio escribe a{" "}
            <a href={`mailto:${CONTACTS.legal}`}>{CONTACTS.legal}</a>. Para ejercer derechos de protección de
            datos, a <a href={`mailto:${CONTACTS.privacy}`}>{CONTACTS.privacy}</a>. Para consultas generales,
            a <a href={`mailto:${CONTACTS.general}`}>{CONTACTS.general}</a>.
          </p>
          <p>
            Si contratas como consumidor, también puedes acudir a los medios de solución de controversias que
            la normativa de consumo ponga a tu disposición.{" "}
            <Pending>canal de reclamaciones y, si procede, hoja de reclamaciones y referencia a la plataforma europea de resolución de litigios en línea</Pending>
          </p>
        </>
      ) : (
        <>
          <p>
            For any legal matter about the site write to <a href={`mailto:${CONTACTS.legal}`}>{CONTACTS.legal}</a>.
            To exercise data protection rights, write to{" "}
            <a href={`mailto:${CONTACTS.privacy}`}>{CONTACTS.privacy}</a>. For general enquiries, use{" "}
            <a href={`mailto:${CONTACTS.general}`}>{CONTACTS.general}</a>.
          </p>
          <p>
            If you contract as a consumer, you may also use the dispute-resolution channels that consumer law
            makes available to you.{" "}
            <Pending>complaints channel and, if applicable, complaint form and reference to the EU online dispute resolution platform</Pending>
          </p>
        </>
      )}
    </LegalShell>
  );
}
