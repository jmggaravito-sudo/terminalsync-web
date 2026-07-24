import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/content";
import { LegalShell } from "@/components/landing/LegalShell";

interface Props {
  params: Promise<{ lang: string }>;
}

// URL solicitada por Meta / Facebook para el App Dashboard como
// "Data Deletion Instructions URL":
//   https://terminalsync.ai/es/legal/data-deletion
//   https://terminalsync.ai/en/legal/data-deletion
// Facebook acepta la URL de instrucciones (HTML) como alternativa al
// callback POST (`/api/webhooks/facebook/data-deletion`). Este archivo
// cubre la primera opción.

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const title =
    lang === "es"
      ? "Eliminación de datos — TerminalSync"
      : "Data Deletion — TerminalSync";
  const description =
    lang === "es"
      ? "Cómo eliminar tu cuenta y tus datos de TerminalSync. Proceso, tiempos, qué se borra y qué se retiene, y cómo contactarnos."
      : "How to delete your TerminalSync account and data. Process, timelines, what gets deleted and what is retained, and how to reach us.";
  return {
    title,
    description,
    alternates: {
      canonical: `https://terminalsync.ai/${lang}/legal/data-deletion`,
      languages: {
        es: "https://terminalsync.ai/es/legal/data-deletion",
        en: "https://terminalsync.ai/en/legal/data-deletion",
      },
    },
  };
}

export async function generateStaticParams() {
  return [{ lang: "es" }, { lang: "en" }];
}

export default async function DataDeletionPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  if (lang === "es") {
    return (
      <LegalShell
        lang="es"
        title="Eliminación de datos"
        subtitle="Cómo eliminar tu cuenta y tus datos personales de TerminalSync. Proceso, tiempos, qué se borra, qué se retiene y cómo contactarnos."
        lastUpdated="Última actualización: 24 de julio de 2026"
      >
        <h2>1. Resumen</h2>
        <p>
          Puedes solicitar la eliminación completa de tu cuenta y tus datos personales de TerminalSync en cualquier momento y por cualquier motivo. Este documento explica cómo hacerlo, qué se elimina, qué (por obligación legal) se retiene, y cuánto demora el proceso.
        </p>

        <h2>2. Cómo solicitar la eliminación</h2>
        <p>Tienes tres formas de pedirlo:</p>
        <ul>
          <li>
            <strong>Desde la aplicación</strong>: abre TerminalSync → <em>Settings → Cuenta → Eliminar mi cuenta</em>. La solicitud queda registrada al instante.
          </li>
          <li>
            <strong>Por correo</strong>: envíanos un email desde la dirección asociada a tu cuenta a{" "}
            <a href="mailto:privacy@terminalsync.ai">privacy@terminalsync.ai</a> con el asunto <em>&ldquo;Eliminación de datos&rdquo;</em>. Incluye tu email de registro para que podamos identificarte.
          </li>
          <li>
            <strong>Vía Facebook / Meta</strong>: si iniciaste sesión con Facebook y quieres que solo eliminemos los datos vinculados a esa autenticación, quítanos como aplicación desde{" "}
            <a href="https://www.facebook.com/settings?tab=applications" target="_blank" rel="noopener noreferrer">
              Configuración de Facebook → Aplicaciones y sitios web
            </a>
            . Recibimos la notificación automática y procesamos la eliminación en un plazo máximo de 30 días.
          </li>
        </ul>

        <h2>3. Qué eliminamos</h2>
        <p>Al confirmar tu solicitud borramos, de nuestros sistemas:</p>
        <ul>
          <li>Tu cuenta de usuario, correo electrónico y perfil.</li>
          <li>Tu suscripción y estado de facturación (los cargos ya emitidos permanecen en Stripe por obligación fiscal — ver §5).</li>
          <li>Metadatos operativos: dispositivos vinculados, historial de sesión, últimos accesos y notificaciones enviadas.</li>
          <li>Cualquier dato que hayas enviado al soporte por correo o formulario, salvo que estemos obligados a retenerlo por una disputa activa.</li>
        </ul>

        <h2>4. Datos que tú ya controlas (no viven en nuestros servidores)</h2>
        <p>
          Por diseño de TerminalSync, la mayor parte de tu contenido nunca pasa por nuestros servidores: <strong>tus archivos, tus secretos y tus conversaciones con la IA viven cifrados con AES-256 en tu propia nube</strong> (Google Drive / iCloud / Dropbox), con la llave únicamente en tu Keychain. Nosotros no tenemos acceso a ese contenido y no podemos eliminarlo por ti — pero puedes borrarlo directamente de tu proveedor de nube en cualquier momento sin pedirnos permiso.
        </p>

        <h2>5. Qué retenemos (por qué y por cuánto)</h2>
        <ul>
          <li>
            <strong>Comprobantes de cargo</strong>: los recibos e invoices ya emitidos permanecen en Stripe durante el plazo que exige la ley fiscal aplicable (habitualmente 5-7 años). No podemos borrarlos aunque cierres tu cuenta.
          </li>
          <li>
            <strong>Registros mínimos de auditoría</strong>: conservamos el hecho de que existió una cuenta con tu email y que fue eliminada, junto con la fecha de eliminación. Esto nos permite responder auditorías y probar el cumplimiento de tu solicitud si algún día vuelves a preguntar.
          </li>
        </ul>

        <h2>6. Tiempos</h2>
        <p>
          Confirmamos la recepción de tu solicitud dentro de las 24 horas hábiles siguientes y completamos la eliminación en un plazo máximo de <strong>30 días</strong>. Si tu jurisdicción exige un plazo menor (por ejemplo, algunas interpretaciones del GDPR o de la CCPA), aplicamos ese plazo.
        </p>

        <h2>7. Cómo contactarnos</h2>
        <p>
          Escríbenos a{" "}
          <a href="mailto:privacy@terminalsync.ai">privacy@terminalsync.ai</a> con cualquier duda o solicitud sobre tus datos. Si prefieres empezar sin abrir la cuenta, también puedes escribir a{" "}
          <a href="mailto:hola@terminalsync.ai">hola@terminalsync.ai</a>.
        </p>
      </LegalShell>
    );
  }

  return (
    <LegalShell
      lang="en"
      title="Data Deletion"
      subtitle="How to delete your TerminalSync account and personal data. Process, timelines, what is deleted, what is retained, and how to reach us."
      lastUpdated="Last updated: July 24, 2026"
    >
      <h2>1. Overview</h2>
      <p>
        You can request full deletion of your TerminalSync account and personal data at any time and for any reason. This page explains how to do it, what gets deleted, what (by legal obligation) we must retain, and how long the process takes.
      </p>

      <h2>2. How to request deletion</h2>
      <p>Three ways to submit the request:</p>
      <ul>
        <li>
          <strong>From the app</strong>: open TerminalSync → <em>Settings → Account → Delete my account</em>. The request is recorded immediately.
        </li>
        <li>
          <strong>By email</strong>: send us an email from the address linked to your account to{" "}
          <a href="mailto:privacy@terminalsync.ai">privacy@terminalsync.ai</a> with the subject <em>&ldquo;Data deletion&rdquo;</em>. Include your registration email so we can identify you.
        </li>
        <li>
          <strong>Via Facebook / Meta</strong>: if you signed in with Facebook and want us to only delete the data linked to that authentication, remove TerminalSync as an app from your{" "}
          <a href="https://www.facebook.com/settings?tab=applications" target="_blank" rel="noopener noreferrer">
            Facebook Settings → Apps and Websites
          </a>
          . We receive the automated notification and process the deletion within a maximum of 30 days.
        </li>
      </ul>

      <h2>3. What we delete</h2>
      <p>Once your request is confirmed we delete, from our systems:</p>
      <ul>
        <li>Your user account, email address and profile.</li>
        <li>Your subscription and billing status (charges already processed remain in Stripe due to tax obligations — see §5).</li>
        <li>Operational metadata: linked devices, session history, last-seen timestamps and notifications sent.</li>
        <li>Any data you sent to support via email or forms, unless we&apos;re required to retain it due to an active dispute.</li>
      </ul>

      <h2>4. Data you already control (never sits on our servers)</h2>
      <p>
        By design of TerminalSync, most of your content never touches our servers: <strong>your files, secrets and AI conversations live AES-256 encrypted in your own cloud</strong> (Google Drive / iCloud / Dropbox), with the key only in your Keychain. We do not have access to that content and cannot delete it for you — but you can delete it directly from your cloud provider at any time without asking us.
      </p>

      <h2>5. What we retain (why and for how long)</h2>
      <ul>
        <li>
          <strong>Billing records</strong>: invoices and receipts already issued remain in Stripe for the period required by applicable tax law (typically 5-7 years). We cannot delete them even if you close your account.
        </li>
        <li>
          <strong>Minimum audit trail</strong>: we keep a record that an account existed with your email and that it was deleted, along with the deletion date. This lets us respond to audits and prove we honored your request if you ever ask again.
        </li>
      </ul>

      <h2>6. Timelines</h2>
      <p>
        We confirm receipt of your request within the next 24 business hours and complete the deletion within a maximum of <strong>30 days</strong>. If your jurisdiction requires a shorter timeline (e.g. certain interpretations of GDPR or CCPA), we honor that timeline.
      </p>

      <h2>7. Contact</h2>
      <p>
        Write to{" "}
        <a href="mailto:privacy@terminalsync.ai">privacy@terminalsync.ai</a> with any question or request about your data. If you prefer to start without opening the account, you can also reach{" "}
        <a href="mailto:hola@terminalsync.ai">hola@terminalsync.ai</a>.
      </p>
    </LegalShell>
  );
}
