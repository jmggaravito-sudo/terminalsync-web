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
        lastUpdated="Última actualización: 7 de octubre de 2026"
      >
        <h2>Gmail: acceso opcional de solo lectura</h2>
        <p>Terminal Sync (TerminalSync o TS) solicita <code>gmail.readonly</code>
          solo si conectás Gmail. Lee remitentes, destinatarios, asuntos, fechas,
          cuerpos y adjuntos para buscar, mostrar e importar los mensajes que
          elegís. No envía, borra, mueve, marca ni modifica correo. Ver Inbox no
          incorpora el correo a la IA: vos elegís enviarlo a un espacio.</p>
        <p>Los correos y adjuntos importados se guardan en tu computadora.
          Al pedir una respuesta, el contexto habilitado puede enviarse a los
          proveedores de IA descritos abajo. Podés pausar, excluir o quitar la
          copia del contexto. Desconectar Gmail no borra copias ya importadas ni
          recupera datos ya enviados al proveedor. Los originales quedan en Gmail.</p>
        <p>La información completa sobre los permisos de Google está en nuestra
          <a href="/privacy"> política de datos de Google</a>.</p>
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
          <strong>El contenido de tus terminales, tus archivos y tus secretos
          NUNCA toca nuestros servidores.</strong> Va directo de tu computadora
          al proveedor de nube que vos elegís, bajo tu propia cuenta. Tus
          secretos, credenciales, memoria y conversaciones se cifran además
          localmente con AES-256-GCM antes de subir —{" "}
          <em>aunque quisiéramos, no podríamos</em> leerlos. La llave maestra
          vive en tu equipo, protegida por los permisos del sistema y por tu
          frase secreta, y nunca sale de tus dispositivos sin cifrar.
        </p>
        <p>
          <strong>La excepción, y es importante: lo que le escribís a la IA.</strong>{" "}
          Para que la IA pueda contestarte, tu mensaje —junto con el material
          que tengas activo en el panel de Contexto y la conversación previa de
          ese espacio— sale de tu computadora hacia un proveedor de IA externo.
          Eso vale para la IA incluida en los planes Pro y Max, que pasa por un
          servidor nuestro camino al proveedor. Los detalles están en la
          sección 5.
        </p>
        <p>
          Si en cambio usás tu propia cuenta de IA con tu clave, esos mensajes{" "}
          <strong>no pasan por nuestros servidores</strong>: van directo de tu
          computadora al proveedor que elegiste vos.
        </p>
        <p>
          <strong>El dictado por voz es local.</strong> El audio de tu micrófono
          se transcribe dentro de tu computadora, con un modelo que viene en la
          aplicación. No se sube a ningún lado.
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
        </ul>
        <p>
          Y, si usás la <strong>IA de TerminalSync</strong>, lo que le
          escribís pasa además por estos proveedores:
        </p>
        <ul>
          <li><strong>Z.ai (Zhipu AI)</strong>, empresa china: recibe tu mensaje,
            el material activo de tu panel de Contexto y la conversación previa
            de ese espacio, y genera la respuesta. Nuestra política prohíbe que Terminal Sync
            o sus proveedores usen los datos de Google para desarrollar, mejorar
            o entrenar modelos de IA generales o no personalizados. Para recibir
            esos datos, el proveedor debe respaldar esa restricción con términos
            contractuales y controles de procesamiento aplicables.
            <a href="https://z.ai/terms/privacy-policy"> Política del proveedor</a>.</li>
          <li><strong>Cloudflare</strong>: el servidor intermedio por el que ese
            pedido viaja hacia Z.ai (y, si la IA busca negocios o reseñas, hacia
            SearchApi). Verifica que tu plan esté al día y cuenta
            cuánto usaste. <strong>No guarda el contenido</strong> de lo que
            pasa por ahí: del uso registramos un identificador de tu cuenta, qué
            modelo se usó, cuánto texto entró y salió, y cuánto costó — nunca el
            texto de tu mensaje, la respuesta, el contenido de tus documentos,
            las rutas de tus archivos ni tu correo.</li>
          <li><strong>SearchApi</strong> (EE. UU.): solo cuando le pedís a la IA
            que busque negocios o reseñas en Google Maps, o cuando un video de
            YouTube que agregaste al Contexto no se puede leer de otra forma.
            Recibe el texto de esa búsqueda (o el enlace del video), el país y el
            idioma, y devuelve resultados públicos. No recibe tu nombre, tu correo
            ni tus documentos. Contamos cuántas búsquedas hiciste en el mes, pero{" "}
            <strong>no guardamos qué buscaste</strong>.</li>
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
        <p>
          Las conversaciones que tienes con el asistente de soporte se
          almacenan hasta 90 días para control de calidad.
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
      lastUpdated="Last updated: October 7, 2026"
    >
      <h2>Gmail: optional read-only access</h2>
      <p>Terminal Sync (TerminalSync or TS) requests <code>gmail.readonly</code>
        only when you connect Gmail. It reads senders, recipients, subjects, dates,
        bodies and attachments to search, display and import messages you select.
        It cannot send, delete, move, mark or modify mail. Viewing Inbox does not
        add messages to AI: you choose to send them to a workspace.</p>
      <p>Imported emails and attachments are saved on your computer. When you
        request an answer, enabled context may be sent to the AI providers
        disclosed below. You can pause, exclude or remove imported context.
        Disconnecting Gmail does not erase imported copies or recall data already
        sent to a provider. Original messages remain in Gmail.</p>
      <p>See our <a href="/privacy">complete Google data policy</a> for details.</p>
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
        <strong>The content of your terminals, your files and your secrets
        NEVER touches our servers.</strong> It goes straight from your computer
        to the cloud provider you choose, under your own account. Your secrets,
        credentials, memory and conversations are additionally encrypted
        locally with AES-256-GCM before upload —{" "}
        <em>even if we wanted to, we couldn't</em> read them. The master key
        lives on your machine, protected by system permissions and by your
        secret phrase, and never leaves your devices unencrypted.
      </p>
      <p>
        <strong>One exception, and it matters: what you write to the AI.</strong>{" "}
        For the AI to answer you, your message — together with whatever is
        active in your Context panel and the earlier conversation in that
        workspace — leaves your computer and goes to an external AI provider.
        That applies to the AI included in the Pro and Max plans, which travels
        through a server of ours on its way to the provider. Details in
        section 5.
      </p>
      <p>
        If instead you use your own AI account with your own key, those
        messages <strong>do not pass through our servers</strong>: they go
        straight from your computer to the provider you picked.
      </p>
      <p>
        <strong>Voice dictation is local.</strong> Your microphone audio is
        transcribed inside your computer, with a model shipped in the
        application. It is not uploaded anywhere.
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
      </ul>
      <p>
        And, if you use <strong>TerminalSync's AI</strong>, what you
        write also passes through these providers:
      </p>
      <ul>
        <li><strong>Z.ai (Zhipu AI)</strong>, a Chinese company: receives your
          message, the active material in your Context panel and the earlier
          conversation in that workspace, and generates the answer. Our policy prohibits Terminal Sync and
          its providers from using Google user data to develop, improve or train
          generalized or non-personalized AI models. Before receiving that data,
          a provider must support this restriction through applicable contractual
          terms and processing controls.
          <a href="https://z.ai/terms/privacy-policy"> Provider policy</a>.</li>
        <li><strong>Cloudflare</strong>: the middle server that request travels
          through on its way to Z.ai (and, when the AI looks up businesses or
          reviews, to SearchApi). It checks that your plan is current and
          counts how much you used. <strong>It does not store the content</strong>{" "}
          that passes through it: of your usage we record an identifier for your
          account, which model was used, how much text went in and out, and what
          it cost — never the text of your message, the answer, the contents of
          your documents, your file paths or your email address.</li>
        <li><strong>SearchApi</strong> (US): only when you ask the AI to look up
          businesses or reviews on Google Maps, or when a YouTube video you added
          to Context can't be read any other way. It receives the text of that
          search (or the video link), the country and the language, and returns
          public results. It does not receive your name, your email or your
          documents. We count how many searches you made this month, but{" "}
          <strong>we don't store what you searched for</strong>.</li>
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
      <p>
        Conversations you have with the support assistant are stored for up
        to 90 days for quality control.
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
