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
      ? "Términos del Servicio — TerminalSync"
      : "Terms of Service — TerminalSync";
  const description =
    lang === "es"
      ? "Términos que regulan el uso de TerminalSync: licencia, suscripciones, reembolsos, responsabilidades."
      : "Terms governing TerminalSync usage: license, subscriptions, refunds, responsibilities.";
  return {
    title,
    description,
    alternates: {
      canonical: `https://terminalsync.ai/${lang}/legal/terms`,
      languages: {
        es: "https://terminalsync.ai/es/legal/terms",
        en: "https://terminalsync.ai/en/legal/terms",
      },
    },
  };
}

export async function generateStaticParams() {
  return [{ lang: "es" }, { lang: "en" }];
}

export default async function TermsPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  if (lang === "es") {
    return (
      <LegalShell
        lang="es"
        title="Términos del Servicio"
        subtitle="Al usar TerminalSync aceptás estos términos. Léelos con calma — están escritos en lenguaje claro y son cortos a propósito."
        lastUpdated="Última actualización: 4 de mayo de 2026"
      >
        <h2>1. Aceptación</h2>
        <p>
          Al instalar, registrarte o usar TerminalSync (la "App") aceptás estos
          términos. Si no estás de acuerdo, no uses el servicio.
        </p>

        <h2>2. Licencia</h2>
        <p>
          Te otorgamos una licencia personal, no exclusiva, no transferible y
          revocable para usar la App según el plan que contrataste. La App
          permanece propiedad de TerminalSync; vos no adquirís derechos sobre
          el código.
        </p>

        <h2>3. Tu cuenta</h2>
        <p>
          Sos responsable de mantener la seguridad de tu cuenta (passphrase,
          dispositivos vinculados, llaves del sistema operativo). Notificanos
          inmediatamente si sospechás acceso no autorizado escribiendo a{" "}
          <a href="mailto:security@terminalsync.ai">security@terminalsync.ai</a>.
        </p>

        <h2>4. Suscripciones y pagos</h2>
        <ul>
          <li>Los planes pagos se renuevan automáticamente al final de cada ciclo.</li>
          <li>Podés cancelar cuando quieras desde tu panel — no hay permanencia.</li>
          <li>Procesamos pagos vía Stripe; nosotros no almacenamos los datos completos de tu tarjeta.</li>
          <li>
            <strong>Prueba gratuita de 7 días</strong>: ingresás tu medio de
            pago pero no se cobra nada los primeros 7 días. Si cancelás antes
            del día 7, no te cobramos.
          </li>
        </ul>

        <h2>5. Reembolsos</h2>
        <p>
          Si dentro de los primeros 30 días desde tu primer cobro no estás
          satisfecho, te devolvemos el 100% del monto pagado escribiendo a{" "}
          <a href="mailto:support@terminalsync.ai">support@terminalsync.ai</a>.
          Después de los 30 días no aplica reembolso, pero podés cancelar para
          que no se renueve.
        </p>

        <h2>6. Uso aceptable</h2>
        <p>
          No podés usar TerminalSync para: violar leyes; almacenar contenido
          ilegal; abusar de la API; revertir el cifrado de otros usuarios;
          spammear o atacar nuestra infraestructura. La violación implica
          terminación inmediata sin reembolso.
        </p>

        <h2>7. Datos de usuario</h2>
        <p>
          Vos sos dueño de los datos que sincronizás. Nosotros nunca tenemos
          acceso a esos datos — están cifrados con AES-256 y las llaves viven
          en tu Mac. Más detalles en nuestra{" "}
          <a href="/es/legal/privacy">Política de Privacidad</a>.
        </p>

        <h2>8. Disponibilidad y SLA</h2>
        <p>
          Hacemos todo lo razonable para mantener el servicio disponible 24/7,
          pero no garantizamos uptime al 100%. Si hay un downtime mayor a 8
          horas continuas, escribinos para considerar crédito en tu cuenta.
        </p>

        <h2>9. Limitación de responsabilidad</h2>
        <p>
          La App se provee "tal cual". En la medida permitida por la ley, no
          somos responsables por daños indirectos, lucro cesante, pérdida de
          datos derivada del uso del servicio. Nuestra responsabilidad
          máxima total se limita al monto que pagaste en los últimos 12 meses.
        </p>

        <h2>10. Terminación</h2>
        <p>
          Podemos suspender o terminar tu cuenta si violás estos términos.
          Vos podés cancelar tu cuenta en cualquier momento desde el panel.
          Tus datos se borran según lo descrito en la{" "}
          <a href="/es/legal/privacy">Política de Privacidad</a>.
        </p>

        <h2>11. Cambios a los términos</h2>
        <p>
          Si modificamos materialmente los términos, te avisamos por email al
          menos 30 días antes. Si no estás de acuerdo, podés cancelar; el uso
          continuado implica aceptación.
        </p>

        <h2>12. Ley aplicable</h2>
        <p>
          Estos términos se rigen por las leyes aplicables al lugar de
          constitución de TerminalSync. Cualquier disputa se intenta resolver
          primero por buena fe; si no se logra, jurisdicción exclusiva en los
          tribunales correspondientes.
        </p>

        <h2>13. Contacto</h2>
        <p>
          ¿Dudas? Escribinos a{" "}
          <a href="mailto:legal@terminalsync.ai">legal@terminalsync.ai</a>.
        </p>
      </LegalShell>
    );
  }

  return (
    <LegalShell
      lang="en"
      title="Terms of Service"
      subtitle="By using TerminalSync you agree to these terms. Read them carefully — they're written in plain language and short on purpose."
      lastUpdated="Last updated: May 4, 2026"
    >
      <h2>1. Acceptance</h2>
      <p>
        By installing, registering, or using TerminalSync (the "App") you
        agree to these terms. If you don't agree, don't use the service.
      </p>

      <h2>2. License</h2>
      <p>
        We grant you a personal, non-exclusive, non-transferable, revocable
        license to use the App according to the plan you subscribed to. The
        App remains property of TerminalSync; you do not acquire rights to
        the code.
      </p>

      <h2>3. Your account</h2>
      <p>
        You're responsible for keeping your account secure (passphrase, paired
        devices, OS keychain). Notify us immediately if you suspect
        unauthorized access at{" "}
        <a href="mailto:security@terminalsync.ai">security@terminalsync.ai</a>.
      </p>

      <h2>4. Subscriptions and payments</h2>
      <ul>
        <li>Paid plans renew automatically at the end of each cycle.</li>
        <li>You can cancel anytime from your dashboard — no contracts.</li>
        <li>Payments are processed via Stripe; we don't store full card data.</li>
        <li>
          <strong>7-day free trial</strong>: you enter a payment method but
          aren't charged for the first 7 days. Cancel before day 7 and we
          don't charge you.
        </li>
      </ul>

      <h2>5. Refunds</h2>
      <p>
        If within the first 30 days from your first charge you're not
        satisfied, we'll refund 100% of the amount paid — email{" "}
        <a href="mailto:support@terminalsync.ai">support@terminalsync.ai</a>.
        After 30 days no refunds apply, but you can cancel to prevent renewal.
      </p>

      <h2>6. Acceptable use</h2>
      <p>
        You may not use TerminalSync to: break laws; store illegal content;
        abuse our API; reverse other users' encryption; spam or attack our
        infrastructure. Violation results in immediate termination without
        refund.
      </p>

      <h2>7. User data</h2>
      <p>
        You own the data you sync. We never have access to that data — it's
        encrypted with AES-256 and the keys live on your Mac. More details
        in our <a href="/en/legal/privacy">Privacy Policy</a>.
      </p>

      <h2>8. Availability and SLA</h2>
      <p>
        We do everything reasonable to keep the service available 24/7, but
        we don't guarantee 100% uptime. If there's downtime greater than 8
        continuous hours, contact us to consider account credit.
      </p>

      <h2>9. Limitation of liability</h2>
      <p>
        The App is provided "as is." To the extent permitted by law, we are
        not liable for indirect damages, lost profits, or data loss arising
        from service use. Our maximum total liability is limited to the
        amount you paid in the last 12 months.
      </p>

      <h2>10. Termination</h2>
      <p>
        We may suspend or terminate your account if you violate these terms.
        You can cancel your account at any time from the dashboard. Your data
        is deleted as described in the{" "}
        <a href="/en/legal/privacy">Privacy Policy</a>.
      </p>

      <h2>11. Changes to terms</h2>
      <p>
        If we materially modify the terms, we notify you by email at least 30
        days in advance. If you disagree, you can cancel; continued use
        implies acceptance.
      </p>

      <h2>12. Governing law</h2>
      <p>
        These terms are governed by the laws applicable to TerminalSync's
        place of incorporation. Disputes are first attempted to be resolved
        in good faith; if unsuccessful, exclusive jurisdiction in the
        corresponding courts.
      </p>

      <h2>13. Contact</h2>
      <p>
        Questions? Email{" "}
        <a href="mailto:legal@terminalsync.ai">legal@terminalsync.ai</a>.
      </p>
    </LegalShell>
  );
}
