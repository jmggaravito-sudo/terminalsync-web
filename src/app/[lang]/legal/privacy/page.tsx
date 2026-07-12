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
      ? "Política de Privacidad — TerminalSync"
      : "Privacy Policy — TerminalSync";
  const description =
    lang === "es"
      ? "Cómo TerminalSync trata tus datos: secretos y conversaciones cifrados con AES-256, archivos en tu propia nube, sin pasar por nuestros servidores."
      : "How TerminalSync handles your data: secrets and conversations encrypted with AES-256, files in your own cloud, never passing through our servers.";
  return {
    title,
    description,
    alternates: {
      canonical: `https://terminalsync.ai/${lang}/legal/privacy`,
      languages: {
        es: "https://terminalsync.ai/es/legal/privacy",
        en: "https://terminalsync.ai/en/legal/privacy",
      },
    },
  };
}

export async function generateStaticParams() {
  return [{ lang: "es" }, { lang: "en" }];
}

export default async function PrivacyPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  if (lang === "es") {
    return (
      <LegalShell
        lang="es"
        title="Política de Privacidad"
        subtitle="Esta política describe qué datos recolectamos, por qué, cómo los protegemos y cómo podés ejercer tus derechos sobre ellos."
        lastUpdated="Última actualización: 4 de mayo de 2026"
      >
        <h2>1. Quiénes somos</h2>
        <p>
          TerminalSync es una aplicación de escritorio que sincroniza el estado
          de tus terminales, archivos de configuración de IA y secretos entre
          tus computadoras a través del proveedor de almacenamiento que elijas
          (Google Drive, iCloud, Dropbox).
        </p>
        <p>
          Operada por <strong>TerminalSync</strong>, con dirección de contacto
          legal en <a href="mailto:legal@terminalsync.ai">legal@terminalsync.ai</a>.
        </p>

        <h2>2. Datos que recolectamos</h2>
        <p>Recolectamos únicamente los datos mínimos necesarios para operar el servicio:</p>
        <ul>
          <li>
            <strong>Cuenta de usuario</strong>: email, nombre completo (si lo
            proveés), avatar (si lo proveés vía OAuth con Google o Apple),
            zona horaria. Hospedados en Supabase.
          </li>
          <li>
            <strong>Datos de suscripción</strong>: estado de facturación, plan,
            últimos 4 dígitos del medio de pago. Procesados por Stripe.
          </li>
          <li>
            <strong>Logs operativos mínimos</strong>: timestamps de inicio de
            sesión, IP de inicio de sesión (anonimizada después de 30 días),
            errores no fatales (Vercel Speed Insights / Vercel Analytics).
          </li>
          <li>
            <strong>Datos de afiliados</strong>: si llegaste vía un link de
            afiliado, una cookie de Rewardful registra el referrer.
          </li>
        </ul>

        <h2>3. Datos que NO recolectamos</h2>
        <p>
          <strong>El contenido de tus terminales, archivos, secretos y
          conversaciones de IA NUNCA toca nuestros servidores.</strong> Va
          directo de tu Mac al proveedor de nube que vos elegís, bajo tu
          propia cuenta. Tus secretos, credenciales, memoria y conversaciones
          de IA se cifran además localmente con AES-256-GCM antes de subir —
          <em>aunque quisiéramos, no podríamos</em> leerlos. La llave maestra
          vive en tu Mac, protegida por los permisos del sistema y por tu
          frase secreta, y nunca sale de tus dispositivos sin cifrar.
        </p>
        <p>
          Tus archivos de proyecto se guardan en tu propia nube en su formato
          original — así podés abrirlos directamente desde Drive cuando
          quieras. Quedan bajo el control de tu cuenta de Google, no de la
          nuestra: nosotros no podemos acceder a ellos.
        </p>

        <h2>4. Para qué usamos tus datos</h2>
        <ul>
          <li>Autenticarte y mantener tu sesión activa.</li>
          <li>Procesar pagos y emitir facturas (vía Stripe).</li>
          <li>Avisarte sobre actualizaciones del producto y avisos de seguridad.</li>
          <li>Mejorar el rendimiento del sitio (datos de Speed Insights agregados, no rastrean usuarios individuales).</li>
        </ul>

        <h2>5. Con quién compartimos tus datos</h2>
        <p>Compartimos datos con los siguientes proveedores estrictamente para operar el servicio:</p>
        <ul>
          <li><strong>Supabase</strong>: hosting de la base de datos de cuentas (UE/US).</li>
          <li><strong>Stripe</strong>: procesamiento de pagos (US).</li>
          <li><strong>Vercel</strong>: hosting del sitio web y de la API (Edge Network global).</li>
          <li><strong>Resend</strong>: envío de emails transaccionales (US).</li>
          <li><strong>Rewardful</strong>: tracking de afiliados (cookie first-party).</li>
          <li><strong>n8n (automatización, servidor gestionado por nosotros)</strong>: procesa
            los mensajes que escribís al chat de soporte, tu email cuando pedís que te
            contactemos, y el contenido de las notificaciones que elegís recibir.</li>
          <li><strong>Groq</strong>: transcripción de voz — solo si usás el dictado por voz,
            el audio del micrófono se envía para transcribirse (US).</li>
        </ul>
        <p>
          No vendemos tus datos a terceros. Nunca hemos. Nunca vamos a hacerlo.
        </p>

        <h2>6. Tus derechos</h2>
        <p>
          Bajo GDPR (UE), CCPA (California) y leyes equivalentes, tenés derecho a:
        </p>
        <ul>
          <li><strong>Acceso</strong>: pedir una copia de tus datos personales.</li>
          <li><strong>Rectificación</strong>: corregir datos inexactos.</li>
          <li><strong>Supresión</strong>: pedir que borremos tu cuenta y datos asociados.</li>
          <li><strong>Portabilidad</strong>: exportar tus datos en formato JSON.</li>
          <li><strong>Oposición</strong>: cancelar emails de marketing en cualquier momento.</li>
        </ul>
        <p>
          Para ejercer cualquiera de estos derechos escribinos a{" "}
          <a href="mailto:privacy@terminalsync.ai">privacy@terminalsync.ai</a>.
          Respondemos dentro de 30 días calendario.
        </p>

        <h2>7. Retención</h2>
        <p>
          Mantenemos tus datos de cuenta mientras tu cuenta esté activa. Si
          cancelás, borramos tus datos personales dentro de 30 días, salvo
          aquellos que estamos obligados a retener por ley (registros
          fiscales: 7 años).
        </p>

        <h2>8. Cookies</h2>
        <p>
          Usamos cookies estrictamente necesarias para autenticación y
          preferencias (idioma, tema). Si llegaste vía un link de afiliado,
          una cookie de Rewardful registra el referrer durante 60 días. No
          usamos cookies de publicidad ni de tracking cross-site.
        </p>

        <h2>9. Cambios a esta política</h2>
        <p>
          Si modificamos materialmente esta política, te avisamos por email al
          menos 30 días antes de que aplique el cambio. Para cambios menores
          (correcciones tipográficas, clarificaciones), actualizamos la fecha
          de "última actualización" arriba.
        </p>

        <h2>10. Contacto</h2>
        <p>
          ¿Preguntas, dudas o solicitudes? Escribinos a{" "}
          <a href="mailto:privacy@terminalsync.ai">privacy@terminalsync.ai</a>.
        </p>
      </LegalShell>
    );
  }

  return (
    <LegalShell
      lang="en"
      title="Privacy Policy"
      subtitle="This policy describes what data we collect, why, how we protect it, and how you can exercise your rights over it."
      lastUpdated="Last updated: May 4, 2026"
    >
      <h2>1. Who we are</h2>
      <p>
        TerminalSync is a desktop application that syncs the state of your
        terminals, AI configuration files, and secrets across your computers
        through the storage provider of your choice (Google Drive, iCloud,
        Dropbox).
      </p>
      <p>
        Operated by <strong>TerminalSync</strong>. Legal contact:{" "}
        <a href="mailto:legal@terminalsync.ai">legal@terminalsync.ai</a>.
      </p>

      <h2>2. Data we collect</h2>
      <p>We collect only the minimum data necessary to operate the service:</p>
      <ul>
        <li>
          <strong>User account</strong>: email, full name (if provided), avatar
          (if provided via Google or Apple OAuth), time zone. Hosted on
          Supabase.
        </li>
        <li>
          <strong>Subscription data</strong>: billing status, plan, last 4
          digits of payment method. Processed by Stripe.
        </li>
        <li>
          <strong>Minimal operational logs</strong>: sign-in timestamps,
          sign-in IP (anonymized after 30 days), non-fatal errors (Vercel
          Speed Insights / Vercel Analytics).
        </li>
        <li>
          <strong>Affiliate data</strong>: if you arrived via an affiliate
          link, a Rewardful cookie records the referrer.
        </li>
      </ul>

      <h2>3. Data we DO NOT collect</h2>
      <p>
        <strong>The content of your terminals, files, secrets, and AI
        conversations NEVER touches our servers.</strong> It goes straight
        from your Mac to the cloud provider you choose, under your own
        account. Your secrets, credentials, memory and AI conversations are
        additionally encrypted locally with AES-256-GCM before upload —
        <em>even if we wanted to, we couldn't</em> read them. The master key
        lives on your Mac, protected by system permissions and by your secret
        phrase, and never leaves your devices unencrypted.
      </p>
      <p>
        Your project files are stored in your own cloud in their original
        format — so you can open them directly from Drive whenever you want.
        They stay under your Google account's control, not ours: we cannot
        access them.
      </p>

      <h2>4. What we use your data for</h2>
      <ul>
        <li>Authenticating you and keeping your session active.</li>
        <li>Processing payments and issuing invoices (via Stripe).</li>
        <li>Notifying you about product updates and security alerts.</li>
        <li>Improving site performance (aggregated Speed Insights data, not individual user tracking).</li>
      </ul>

      <h2>5. Who we share your data with</h2>
      <p>We share data with the following providers strictly to operate the service:</p>
      <ul>
        <li><strong>Supabase</strong>: account database hosting (EU/US).</li>
        <li><strong>Stripe</strong>: payment processing (US).</li>
        <li><strong>Vercel</strong>: website + API hosting (global Edge Network).</li>
        <li><strong>Resend</strong>: transactional email delivery (US).</li>
        <li><strong>Rewardful</strong>: affiliate tracking (first-party cookie).</li>
        <li><strong>n8n (automation, on a server we manage)</strong>: processes the
          messages you type into the support chat, your email when you ask to be
          contacted, and the content of notifications you opt into.</li>
        <li><strong>Groq</strong>: voice transcription — only if you use voice dictation,
          your microphone audio is sent for transcription (US).</li>
      </ul>
      <p>We don't sell your data. We never have. We never will.</p>

      <h2>6. Your rights</h2>
      <p>Under GDPR (EU), CCPA (California), and equivalent laws, you have the right to:</p>
      <ul>
        <li><strong>Access</strong>: request a copy of your personal data.</li>
        <li><strong>Rectification</strong>: correct inaccurate data.</li>
        <li><strong>Erasure</strong>: ask us to delete your account and associated data.</li>
        <li><strong>Portability</strong>: export your data in JSON format.</li>
        <li><strong>Objection</strong>: opt out of marketing emails at any time.</li>
      </ul>
      <p>
        To exercise any of these rights, email{" "}
        <a href="mailto:privacy@terminalsync.ai">privacy@terminalsync.ai</a>.
        We respond within 30 calendar days.
      </p>

      <h2>7. Retention</h2>
      <p>
        We keep your account data while your account is active. If you cancel,
        we delete your personal data within 30 days, except for data we are
        legally required to retain (tax records: 7 years).
      </p>

      <h2>8. Cookies</h2>
      <p>
        We use cookies strictly necessary for authentication and preferences
        (language, theme). If you arrived via an affiliate link, a Rewardful
        cookie records the referrer for 60 days. We don't use ad cookies or
        cross-site tracking.
      </p>

      <h2>9. Changes to this policy</h2>
      <p>
        If we materially modify this policy, we notify you by email at least
        30 days before the change takes effect. For minor changes
        (typographical corrections, clarifications), we update the "last
        updated" date above.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions, concerns, or requests? Email{" "}
        <a href="mailto:privacy@terminalsync.ai">privacy@terminalsync.ai</a>.
      </p>
    </LegalShell>
  );
}
