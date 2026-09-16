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
      ? "Términos que regulan el uso de TerminalSync: planes, IA incluida, acciones con tu aprobación, créditos, datos y responsabilidades."
      : "Terms governing TerminalSync: plans, included AI, actions with your approval, credits, data and responsibilities.";
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

// Versión 2026-09-16. Al publicar, subir TERMS_VERSION en la app
// (src/lib/legal.ts del repo terminal-sync) a la misma fecha para que el
// consentimiento del inicio de sesión se vuelva a pedir una vez.
export default async function TermsPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  if (lang === "es") {
    return (
      <LegalShell
        lang="es"
        title="Términos del Servicio"
        subtitle="Al usar TerminalSync aceptás estos términos. Están escritos en lenguaje claro a propósito: qué incluye tu plan, qué hace la IA, qué aprobás vos y qué pasa con tus datos."
        lastUpdated="Última actualización: 16 de septiembre de 2026"
      >
        <h2>1. Quiénes somos y qué aceptás</h2>
        <p>TerminalSync es una aplicación de escritorio para Mac, operada por <strong>Marca E-commerce LLC</strong>, sociedad constituida en el estado de Florida, Estados Unidos, con sede en Miami, Florida ("TerminalSync", "nosotros"), con contacto legal en <a href="mailto:legal@terminalsync.ai">legal@terminalsync.ai</a>. Al crear una cuenta, instalar o usar la App aceptás estos Términos y nuestra <a href="/es/legal/privacy">Política de Privacidad</a>. Si no estás de acuerdo, no uses el servicio.</p>
        <p>Estos Términos están escritos en lenguaje claro a propósito. Donde decimos "vos" hablamos con la persona o empresa que abre la cuenta.</p>
        <h2>2. Qué es TerminalSync</h2>
        <p>TerminalSync es tu oficina digital con inteligencia artificial: creás espacios de trabajo (uno por cliente, área o proyecto), la IA de TerminalSync trabaja ahí con tus archivos y tu memoria de negocio, y todo te sigue entre computadoras a través de tu propia nube (Google Drive o iCloud). La IA puede redactar, analizar, crear planillas, documentos e imágenes, y ejecutar acciones en tus archivos y tus cuentas conectadas, siempre con tu aprobación previa (ver sección 7).</p>
        <p>TerminalSync no es un servicio de almacenamiento: tus archivos viven en tu nube, bajo tu cuenta. Tampoco es un asesor profesional: lo que produce la IA es una ayuda, no un consejo legal, contable, médico ni financiero.</p>
        <h2>3. Tu cuenta y tu frase secreta</h2>
        <ul>
          <li>Podés crear la cuenta con Google o con Apple. Sos responsable de lo que se haga desde tu cuenta y tus dispositivos vinculados.</li>
          <li>Al configurar la App elegís una <strong>frase secreta</strong> que protege la llave con la que se cifran tus secretos, tu memoria y tus conversaciones. <strong>No la guardamos y no podemos recuperarla.</strong> Si la perdés, podés restablecerla, pero lo cifrado con la llave anterior deja de poder leerse.</li>
          <li>Cada plan permite una cantidad de computadoras vinculadas. Podés desvincular una desde Ajustes.</li>
          <li>Si sospechás un acceso no autorizado, escribinos de inmediato a <a href="mailto:legal@terminalsync.ai">legal@terminalsync.ai</a>.</li>
        </ul>
        <h2>4. Planes, prueba gratis, pagos y cancelación</h2>
        <ul>
          <li><strong>Free</strong>: gratis, con un límite de espacios y de computadoras, y con una IA de cortesía limitada (sección 6).</li>
          <li><strong>Pro + IA</strong> y <strong>Max + IA</strong>: planes mensuales que incluyen la IA de TerminalSync. Los precios vigentes están en <a href="/es#pricing">terminalsync.ai/#pricing</a>. En Colombia el precio se muestra y se cobra en pesos a través de Mercado Pago; en el resto del mundo, en dólares a través de Stripe. Los impuestos aplicables se agregan según tu país.</li>
          <li><strong>Prueba gratis</strong>: al contratar un plan pago desde el sitio por primera vez, los primeros 7 días no se cobran. Si cancelás antes del día 7, no pagás nada. La prueba es una sola por cuenta.</li>
          <li><strong>Renovación</strong>: el plan se renueva cada mes de forma automática hasta que lo cancelés.</li>
          <li><strong>Cancelación</strong>: cancelás cuando quieras desde Ajustes → Cuenta → Administrar suscripción o desde <a href="/es/billing">terminalsync.ai/billing</a>. El acceso al plan sigue hasta el fin del período ya pagado, y después la cuenta pasa a Free sin perder tus archivos.</li>
          <li>Podemos cambiar los precios avisando por correo con al menos 30 días de anticipación; el cambio aplica desde la siguiente renovación.</li>
        </ul>
        <h2>5. Reembolsos</h2>
        <ul>
          <li>Si dentro de los 30 días siguientes a tu <strong>primer cobro</strong> no estás conforme, te devolvemos el 100 % escribiendo a <a href="mailto:legal@terminalsync.ai">legal@terminalsync.ai</a>. Después de esos 30 días no hay reembolso de mensualidades ya cobradas, pero podés cancelar para que no se renueve.</li>
          <li>Los <strong>créditos</strong> (sección 8) que ya se usaron no se reembolsan. Los créditos comprados y no usados se reembolsan si lo pedís dentro de los 30 días siguientes a la compra.</li>
          <li>Si te cobramos por error, lo corregimos y devolvemos la diferencia.</li>
        </ul>
        <h2>6. La IA de TerminalSync</h2>
        <ul>
          <li><strong>Está incluida en los planes pagos.</strong> No necesitás una cuenta ni una llave de ningún proveedor de inteligencia artificial.</li>
          <li><strong>Funciona con modelos de terceros.</strong> TerminalSync elige y combina modelos de distintos proveedores según la tarea, y puede cambiarlos sin previo aviso para mejorar calidad, costo o disponibilidad. La lista de proveedores que procesan tus mensajes está en la sección "Proveedores" de la <a href="/es/legal/privacy">Política de Privacidad</a> y en <a href="/es/ai">terminalsync.ai/ai</a>.</li>
          <li><strong>Qué se envía al proveedor.</strong> Cuando le escribís a la IA, tu mensaje, los archivos que adjuntás o que le pedís leer, y la parte de tu memoria de negocio que hace falta para responder se envían, a través de nuestros servidores, al proveedor del modelo, solo para generar la respuesta. No envíes por este medio datos que no querés que procese un tercero (por ejemplo, historias clínicas o datos de tarjetas). Tus secretos y credenciales guardados en TerminalSync no se envían al modelo; solo se usan cuando aprobás una acción que los necesita.</li>
          <li><strong>Uso razonable.</strong> Los planes incluyen un uso razonable de la IA, pensado para una persona o un equipo chico trabajando a diario. Si un uso excede con mucho ese promedio, o detectamos automatización para agotar el servicio, podemos bajar temporalmente la velocidad o la calidad de las respuestas, avisándote en la App, en vez de cortarlas. En el plan Free la IA es de cortesía y tiene un tope diario y total.</li>
          <li><strong>Sin garantía sobre las respuestas.</strong> La IA puede equivocarse, inventar datos o malinterpretar un pedido. Revisá siempre lo que produce antes de usarlo, firmarlo, publicarlo o tomar decisiones con plata. Sos responsable del uso que hagas de lo generado.</li>
          <li><strong>Disponibilidad.</strong> La IA depende de proveedores externos y puede estar lenta o no disponible por momentos. Hacemos lo razonable para mantenerla funcionando, sin garantía de disponibilidad continua.</li>
        </ul>
        <h2>7. Acciones que la IA ejecuta con tu aprobación</h2>
        <p>La IA de TerminalSync puede hacer más que conversar: crear, editar o borrar archivos de tu espacio, ejecutar comandos en tu computadora, usar tus cuentas conectadas (por ejemplo, Meta Ads, Facebook, Instagram, WhatsApp o Telegram) y crear imágenes o videos que consumen créditos.</p>
        <ul>
          <li><strong>Nada de eso ocurre sin tu aprobación.</strong> Antes de cada acción que cambia algo, gasta plata, publica o envía, la App te muestra qué va a hacer y esperá tu "sí". Si no aprobás, no se hace.</li>
          <li><strong>Lo que aprobás es tu decisión.</strong> Somos responsables de mostrarte con claridad qué va a pasar; vos sos responsable de las acciones que aprobás y de sus consecuencias en tus cuentas y ante terceros.</li>
          <li><strong>Copias y deshacer.</strong> Antes de que la IA cambie archivos, la App guarda una copia para que puedas deshacer. Aun así, mantené tus propias copias de seguridad de lo importante.</li>
          <li><strong>Acciones en cuentas de terceros</strong> (por ejemplo, publicar en Instagram o cambiar el presupuesto de una campaña) quedan sujetas a las reglas de ese tercero. Podés desconectar cualquier cuenta desde Ajustes.</li>
        </ul>
        <h2>8. Créditos</h2>
        <ul>
          <li>Los créditos son un saldo prepago que se usa solo para crear <strong>imágenes y videos</strong> desde la App. Las planillas, los documentos y las respuestas de la IA no consumen créditos.</li>
          <li>Se compran en paquetes fijos (hoy, 10 y 20 dólares, o su valor en pesos) desde Ajustes → Cuenta → Créditos. Antes de crear una imagen o un video, la App te muestra cuánto cuesta.</li>
          <li>Los créditos pertenecen a tu cuenta, no se transfieren, no se cambian por dinero salvo lo previsto en la sección 5, y <strong>vencen a los 12 meses de la compra</strong>. Tu saldo se ve en Ajustes → Cuenta → Créditos.</li>
          <li>Si una creación falla, no se descuentan créditos. Si un pago se cancela o no se completa, no se agregan créditos ni cambia tu saldo.</li>
        </ul>
        <h2>9. Conexiones con servicios de terceros</h2>
        <p>TerminalSync se conecta a servicios que vos elegís: tu nube (Google Drive o iCloud), Meta (Facebook, Instagram, WhatsApp, Meta Ads), Telegram y otros conectores. Esas conexiones usan tus propias cuentas y permisos, se rigen por los términos de cada servicio, y podés revocarlas cuando quieras desde Ajustes o desde el servicio en cuestión. No somos responsables por cambios, cortes o decisiones de esos terceros.</p>
        <h2>10. Tus datos y tus archivos</h2>
        <ul>
          <li><strong>Tus archivos son tuyos</strong> y viven en tu propia nube, bajo tu cuenta. No los almacenamos en nuestros servidores.</li>
          <li><strong>Lo sensible viaja cifrado.</strong> Tus secretos, credenciales, memoria de negocio y conversaciones se cifran en tu computadora antes de subir a tu nube, con una llave que solo vos tenés. Nosotros no podemos leer lo que está guardado.</li>
          <li><strong>Lo que sí procesamos</strong>: los datos de tu cuenta y facturación, y los mensajes que le escribís a la IA mientras se genera la respuesta (sección 6). El detalle completo, con la lista de proveedores, está en la <a href="/es/legal/privacy">Política de Privacidad</a>.</li>
          <li>Podés exportar o borrar tus datos en cualquier momento (sección 15).</li>
        </ul>
        <h2>11. Uso aceptable</h2>
        <p>No podés usar TerminalSync para infringir leyes o derechos de terceros; para crear o difundir contenido ilegal, engañoso o que suplante a otra persona; para enviar spam o mensajes no solicitados a través de las cuentas conectadas; para intentar acceder a datos de otros usuarios; ni para revender, automatizar o explotar la IA incluida más allá del uso razonable. La violación de esta sección puede terminar tu cuenta sin reembolso.</p>
        <h2>12. Propiedad intelectual</h2>
        <p>La App, su marca y su código son de TerminalSync; te damos una licencia personal, no exclusiva y revocable para usarlos según tu plan. Lo que vos creás con la App (textos, planillas, documentos, imágenes, videos) es tuyo, en la medida en que la ley lo permita, y vos respondés por el material que le entregás a la IA para trabajar.</p>
        <h2>13. Funciones nuevas, cambios y disponibilidad</h2>
        <p>Algunas funciones se marcan como <strong>Beta</strong>: pueden cambiar, fallar o retirarse sin aviso. Podemos agregar, modificar o retirar funciones del servicio; si un cambio reduce de forma importante lo que contrataste, te avisamos con anticipación y podés cancelar sin penalidad. No garantizamos disponibilidad continua del servicio ni de la IA.</p>
        <h2>14. Limitación de responsabilidad</h2>
        <p>En la medida que la ley lo permita, TerminalSync no responde por daños indirectos, lucro cesante, pérdida de datos o de negocio derivados del uso del servicio, de las respuestas de la IA o de acciones que vos aprobaste. Nuestra responsabilidad total frente a vos se limita a lo que pagaste por el servicio en los 12 meses anteriores al reclamo. Nada en estos Términos limita derechos que la ley de protección al consumidor de tu país te reconozca y que no puedan renunciarse.</p>
        <h2>15. Terminación y eliminación de la cuenta</h2>
        <ul>
          <li>Podés cancelar tu suscripción cuando quieras (sección 4). Cancelar no borra tu cuenta ni tus archivos.</li>
          <li>Podés <strong>eliminar tu cuenta</strong> desde Ajustes → Cuenta. La cuenta queda marcada para borrado, se cancela la suscripción y tenés 30 días para arrepentirte iniciando sesión de nuevo. Pasados los 30 días, borramos tus datos de nuestros servidores de forma definitiva. Lo guardado en tu nube (la carpeta TerminalSync_Data) es tuyo y queda ahí hasta que vos lo borres.</li>
          <li>Podemos suspender o terminar tu cuenta si violás estos Términos, avisándote por correo salvo casos de abuso evidente.</li>
        </ul>
        <h2>16. Cambios a estos Términos</h2>
        <p>Si cambiamos estos Términos de forma importante, te avisamos por correo y en la App con al menos 30 días de anticipación, y te pedimos aceptarlos de nuevo al iniciar sesión. Si no estás de acuerdo, podés cancelar; seguir usando el servicio después de la fecha de vigencia implica aceptación. La versión vigente siempre está en esta página, con su fecha.</p>
        <h2>17. Ley aplicable y disputas</h2>
        <p>Estos Términos se rigen por las leyes del estado de <strong>Florida, Estados Unidos</strong>, sin aplicar sus reglas de conflicto de leyes. Ante cualquier diferencia, primero intentamos resolverla de buena fe escribiéndonos; si no lo logramos en 30 días, la disputa se somete a los tribunales estatales o federales con sede en el <strong>condado de Miami-Dade, Florida</strong>, y vos y nosotros aceptamos esa jurisdicción. Nada de esto te quita los derechos que te correspondan como consumidor según la ley de tu lugar de residencia y que no puedan renunciarse.</p>
        <h2>18. Contacto</h2>
        <p>Escribinos a <a href="mailto:legal@terminalsync.ai">legal@terminalsync.ai</a> o a <a href="mailto:support@terminalsync.ai">support@terminalsync.ai</a>.</p>
      </LegalShell>
    );
  }

  return (
    <LegalShell
      lang="en"
      title="Terms of Service"
      subtitle="By using TerminalSync you agree to these terms. They are written in plain language on purpose: what your plan includes, what the AI does, what you approve and what happens with your data."
      lastUpdated="Last updated: September 16, 2026"
    >
      <h2>1. Who we are and what you accept</h2>
      <p>TerminalSync is a desktop application for Mac operated by <strong>Marca E-commerce LLC</strong>, a limited liability company organised in the State of Florida, United States, based in Miami, Florida ("TerminalSync", "we"), legal contact <a href="mailto:legal@terminalsync.ai">legal@terminalsync.ai</a>. By creating an account, installing or using the App you accept these Terms and our <a href="/en/legal/privacy">Privacy Policy</a>. If you do not agree, do not use the service.</p>
      <p>These Terms are written in plain language on purpose. "You" means the person or company that opens the account.</p>
      <h2>2. What TerminalSync is</h2>
      <p>TerminalSync is your digital office with artificial intelligence: you create workspaces (one per client, area or project), the TerminalSync AI works there with your files and your business memory, and everything follows you between computers through your own cloud (Google Drive or iCloud). The AI can write, analyse, create spreadsheets, documents and images, and carry out actions on your files and your connected accounts, always with your prior approval (see section 7).</p>
      <p>TerminalSync is not a storage service: your files live in your cloud, under your account. It is not a professional adviser either: what the AI produces is assistance, not legal, accounting, medical or financial advice.</p>
      <h2>3. Your account and your secret phrase</h2>
      <ul>
        <li>You can create the account with Google or Apple. You are responsible for what is done from your account and your linked devices.</li>
        <li>When you set up the App you choose a <strong>secret phrase</strong> that protects the key used to encrypt your secrets, memory and conversations. <strong>We do not store it and cannot recover it.</strong> If you lose it you can reset it, but anything encrypted with the previous key can no longer be read.</li>
        <li>Each plan allows a number of linked computers. You can unlink one from Settings.</li>
        <li>If you suspect unauthorised access, write to us immediately at <a href="mailto:legal@terminalsync.ai">legal@terminalsync.ai</a>.</li>
      </ul>
      <h2>4. Plans, free trial, payments and cancellation</h2>
      <ul>
        <li><strong>Free</strong>: no charge, with a limit on workspaces and computers, and a limited courtesy AI (section 6).</li>
        <li><strong>Pro + AI</strong> and <strong>Max + AI</strong>: monthly plans that include the TerminalSync AI. Current prices are at <a href="/en#pricing">terminalsync.ai/#pricing</a>. In Colombia the price is shown and charged in pesos through Mercado Pago; elsewhere, in US dollars through Stripe. Applicable taxes are added according to your country.</li>
        <li><strong>Free trial</strong>: when you take a paid plan from the website for the first time, the first 7 days are not charged. If you cancel before day 7 you pay nothing. One trial per account.</li>
        <li><strong>Renewal</strong>: the plan renews automatically every month until you cancel.</li>
        <li><strong>Cancellation</strong>: cancel any time from Settings → Account → Manage subscription or at <a href="/en/billing">terminalsync.ai/billing</a>. Access to the plan continues until the end of the period already paid, then the account moves to Free without losing your files.</li>
        <li>We may change prices with at least 30 days' notice by email; the change applies from the next renewal.</li>
      </ul>
      <h2>5. Refunds</h2>
      <ul>
        <li>If you are not satisfied within 30 days of your <strong>first charge</strong>, we refund 100 % when you write to <a href="mailto:legal@terminalsync.ai">legal@terminalsync.ai</a>. After those 30 days there is no refund of monthly fees already charged, but you can cancel so it does not renew.</li>
        <li><strong>Credits</strong> (section 8) that have been used are not refunded. Purchased credits that are unused are refunded if you ask within 30 days of the purchase.</li>
        <li>If we charge you by mistake, we correct it and refund the difference.</li>
      </ul>
      <h2>6. The TerminalSync AI</h2>
      <ul>
        <li><strong>It is included in paid plans.</strong> You do not need an account or a key from any artificial-intelligence provider.</li>
        <li><strong>It runs on third-party models.</strong> TerminalSync selects and combines models from different providers depending on the task, and may change them without notice to improve quality, cost or availability. The list of providers that process your messages is in the "Providers" section of the <a href="/en/legal/privacy">Privacy Policy</a> and at <a href="/en/ai">terminalsync.ai/ai</a>.</li>
        <li><strong>What is sent to the provider.</strong> When you write to the AI, your message, the files you attach or ask it to read, and the part of your business memory needed to answer are sent, through our servers, to the model provider, only to generate the reply. Do not send data through this channel that you do not want a third party to process (for example medical records or card numbers). Secrets and credentials stored in TerminalSync are not sent to the model; they are only used when you approve an action that needs them.</li>
        <li><strong>Fair use.</strong> Plans include reasonable use of the AI, meant for one person or a small team working daily. If usage far exceeds that average, or we detect automation meant to exhaust the service, we may temporarily reduce the speed or quality of replies, telling you in the App, rather than cutting them off. On the Free plan the AI is a courtesy with a daily and a total cap.</li>
        <li><strong>No warranty on answers.</strong> The AI can be wrong, make up data or misread a request. Always review what it produces before using, signing, publishing or making money decisions with it. You are responsible for how you use what is generated.</li>
        <li><strong>Availability.</strong> The AI depends on external providers and may be slow or unavailable at times. We do what is reasonable to keep it running, with no guarantee of continuous availability.</li>
      </ul>
      <h2>7. Actions the AI carries out with your approval</h2>
      <p>The TerminalSync AI can do more than talk: create, edit or delete files in your workspace, run commands on your computer, use your connected accounts (for example Meta Ads, Facebook, Instagram, WhatsApp or Telegram), and create images or videos that use credits.</p>
      <ul>
        <li><strong>None of that happens without your approval.</strong> Before every action that changes something, spends money, publishes or sends, the App shows you what it is about to do and waits for your "yes". If you do not approve, it is not done.</li>
        <li><strong>What you approve is your decision.</strong> We are responsible for showing you clearly what will happen; you are responsible for the actions you approve and their consequences on your accounts and towards third parties.</li>
        <li><strong>Backups and undo.</strong> Before the AI changes files, the App keeps a copy so you can undo. Even so, keep your own backups of what matters.</li>
        <li><strong>Actions in third-party accounts</strong> (for example posting on Instagram or changing a campaign budget) are subject to that third party's rules. You can disconnect any account from Settings.</li>
      </ul>
      <h2>8. Credits</h2>
      <ul>
        <li>Credits are a prepaid balance used only to create <strong>images and videos</strong> from the App. Spreadsheets, documents and AI replies do not use credits.</li>
        <li>They are bought in fixed packages (today, 10 and 20 US dollars, or their value in pesos) from Settings → Account → Credits. Before creating an image or video, the App shows you its cost.</li>
        <li>Credits belong to your account, cannot be transferred, are not exchanged for money except as set out in section 5, and <strong>expire 12 months after purchase</strong>. Your balance is shown under Settings → Account → Credits.</li>
        <li>If a creation fails, no credits are deducted. If a payment is cancelled or not completed, no credits are added and your balance does not change.</li>
      </ul>
      <h2>9. Connections to third-party services</h2>
      <p>TerminalSync connects to services you choose: your cloud (Google Drive or iCloud), Meta (Facebook, Instagram, WhatsApp, Meta Ads), Telegram and other connectors. Those connections use your own accounts and permissions, are governed by each service's terms, and can be revoked at any time from Settings or from the service itself. We are not responsible for changes, outages or decisions of those third parties.</p>
      <h2>10. Your data and your files</h2>
      <ul>
        <li><strong>Your files are yours</strong> and live in your own cloud, under your account. We do not store them on our servers.</li>
        <li><strong>Sensitive data travels encrypted.</strong> Your secrets, credentials, business memory and conversations are encrypted on your computer before being uploaded to your cloud, with a key only you hold. We cannot read what is stored.</li>
        <li><strong>What we do process</strong>: your account and billing data, and the messages you write to the AI while the reply is generated (section 6). The full detail, with the list of providers, is in the <a href="/en/legal/privacy">Privacy Policy</a>.</li>
        <li>You can export or delete your data at any time (section 15).</li>
      </ul>
      <h2>11. Acceptable use</h2>
      <p>You may not use TerminalSync to break the law or infringe third-party rights; to create or spread illegal, deceptive or impersonating content; to send spam or unsolicited messages through connected accounts; to try to access other users' data; or to resell, automate or exploit the included AI beyond fair use. Breaching this section may end your account without refund.</p>
      <h2>12. Intellectual property</h2>
      <p>The App, its brand and its code belong to TerminalSync; we grant you a personal, non-exclusive, revocable licence to use them according to your plan. What you create with the App (texts, spreadsheets, documents, images, videos) is yours to the extent the law allows, and you are responsible for the material you give the AI to work with.</p>
      <h2>13. New features, changes and availability</h2>
      <p>Some features are marked <strong>Beta</strong>: they may change, fail or be withdrawn without notice. We may add, modify or withdraw features; if a change materially reduces what you contracted, we notify you in advance and you can cancel without penalty. We do not guarantee continuous availability of the service or of the AI.</p>
      <h2>14. Limitation of liability</h2>
      <p>To the extent the law allows, TerminalSync is not liable for indirect damages, lost profits, loss of data or business arising from use of the service, from AI replies or from actions you approved. Our total liability towards you is limited to what you paid for the service in the 12 months before the claim. Nothing in these Terms limits rights that the consumer-protection law of your country grants you and that cannot be waived.</p>
      <h2>15. Termination and account deletion</h2>
      <ul>
        <li>You can cancel your subscription at any time (section 4). Cancelling does not delete your account or your files.</li>
        <li>You can <strong>delete your account</strong> from Settings → Account. The account is marked for deletion, the subscription is cancelled, and you have 30 days to change your mind by signing in again. After 30 days we permanently delete your data from our servers. What is stored in your cloud (the TerminalSync_Data folder) is yours and stays there until you delete it.</li>
        <li>We may suspend or end your account if you breach these Terms, with notice by email except in cases of evident abuse.</li>
      </ul>
      <h2>16. Changes to these Terms</h2>
      <p>If we change these Terms materially, we notify you by email and in the App at least 30 days in advance, and ask you to accept them again when you sign in. If you do not agree you can cancel; continuing to use the service after the effective date means acceptance. The current version is always on this page, with its date.</p>
      <h2>17. Governing law and disputes</h2>
      <p>These Terms are governed by the laws of the <strong>State of Florida, United States</strong>, without regard to its conflict-of-laws rules. In case of any dispute we first try to resolve it in good faith by writing to each other; if that fails within 30 days, the dispute is submitted to the state or federal courts located in <strong>Miami-Dade County, Florida</strong>, and you and we accept that jurisdiction. Nothing here removes rights you hold as a consumer under the law of the place where you live that cannot be waived.</p>
      <h2>18. Contact</h2>
      <p>Write to <a href="mailto:legal@terminalsync.ai">legal@terminalsync.ai</a> or <a href="mailto:support@terminalsync.ai">support@terminalsync.ai</a>.</p>
    </LegalShell>
  );
}
