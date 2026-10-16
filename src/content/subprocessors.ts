/**
 * Lista de subencargados y destinatarios de datos de TerminalSync.
 *
 * Fuente única para la página `/[lang]/legal/subprocessors` y para el futuro
 * anexo del DPA (handoff W4). BORRADOR para validar por abogado.
 *
 * Cómo se construyó (2026-10-16): auditoría del código de este repo
 * (dependencias, variables de entorno, llamadas `fetch`, scripts de la home
 * estática) + la sección 5 de la Política de Privacidad vigente + el
 * documento `docs/handoffs/espana/13-handoff-textos-legales-es-ES.md`.
 *
 *   evidence: "code"     -> lo usa este repo (verificable aquí).
 *   evidence: "policy"   -> lo declara la Política de Privacidad vigente.
 *   evidence: "app-docs" -> figura en la documentación de la app de escritorio;
 *                           NO verificable desde este repo.
 *
 * Todo mecanismo de transferencia o ubicación que no consta se deja como
 * `confirm` ([A CONFIRMAR POR ABOGADO]); nunca se afirma una garantía que no
 * esté documentada.
 */
import type { Bilingual } from "./legalEntity";

export type Subprocessor = {
  id: string;
  name: string;
  purpose: Bilingual;
  data: Bilingual;
  /** Ubicación del tratamiento, solo si consta. */
  location?: Bilingual;
  /** Mecanismo de transferencia fuera del EEE, solo si consta. */
  transfer?: Bilingual;
  /** Qué falta por confirmar (se muestra como [A CONFIRMAR POR ABOGADO]). */
  confirm: Bilingual;
  /** ¿Se activa solo con consentimiento de cookies? */
  consent?: "analytics" | "affiliates";
  /** ¿Solo se usa si la persona usuaria lo pide? */
  onRequest?: boolean;
  evidence: "code" | "policy" | "app-docs";
  url?: string;
};

export const SUBPROCESSORS: Subprocessor[] = [
  {
    id: "zai",
    name: "Z.ai (Zhipu AI)",
    purpose: {
      es: "Genera las respuestas de la IA incluida de TerminalSync.",
      en: "Generates the answers of TerminalSync's included AI.",
    },
    data: {
      es: "Tu mensaje, el material activo del panel de Contexto, la conversación previa de ese espacio y la memoria necesaria para responder.",
      en: "Your message, the active material in the Context panel, the previous conversation in that workspace and the memory needed to answer.",
    },
    location: {
      es: "Proveedor de origen chino (Zhipu AI) con entidad internacional en Singapur. La región de procesamiento concreta no consta.",
      en: "Chinese-origin provider (Zhipu AI) with an international entity in Singapore. The exact processing region is not on record.",
    },
    confirm: {
      es: "mecanismo de transferencia internacional (decisión de adecuación, cláusulas contractuales tipo u otro), existencia de un contrato de encargado (art. 28 RGPD) y si la transferencia es viable; región de procesamiento; retención y uso para entrenamiento por parte del proveedor",
      en: "international transfer mechanism (adequacy decision, standard contractual clauses or other), existence of a processor agreement (GDPR art. 28) and whether the transfer is viable; processing region; provider retention and training use",
    },
    evidence: "policy",
    url: "https://z.ai/terms/privacy-policy",
  },
  {
    id: "cloudflare",
    name: "Cloudflare",
    purpose: {
      es: "Servidor intermedio (Worker) por el que viaja la petición de IA hasta Z.ai; comprueba que tu plan está al día y cuenta el uso. También DNS y red del sitio.",
      en: "Intermediate server (Worker) the AI request travels through to Z.ai; checks that your plan is current and counts usage. Also DNS and network for the site.",
    },
    data: {
      es: "Contenido de la petición en tránsito (no se guarda). Del uso se registran un identificador de cuenta, el modelo, el tamaño de entrada y salida y el coste, nunca el texto.",
      en: "Request content in transit (not stored). For usage we record an account identifier, the model, input and output size and cost, never the text.",
    },
    confirm: {
      es: "ubicación del tratamiento y mecanismo de transferencia (certificación del Marco de Privacidad de Datos UE-EE. UU. o cláusulas tipo)",
      en: "processing location and transfer mechanism (EU-US Data Privacy Framework certification or standard clauses)",
    },
    evidence: "policy",
    url: "https://www.cloudflare.com/gdpr/introduction/",
  },
  {
    id: "stripe",
    name: "Stripe",
    purpose: {
      es: "Cobro de suscripciones y créditos prepago; facturación.",
      en: "Payment of subscriptions and prepaid credits; invoicing.",
    },
    data: {
      es: "Correo, datos de facturación, estado del plan e importes. Los datos de la tarjeta los recoge Stripe directamente; TerminalSync solo ve los últimos cuatro dígitos.",
      en: "Email, billing details, plan status and amounts. Card data is collected directly by Stripe; TerminalSync only sees the last four digits.",
    },
    location: { es: "Estados Unidos (política vigente).", en: "United States (current policy)." },
    confirm: {
      es: "entidad de Stripe que contrata con clientes de la UE, ubicación y mecanismo de transferencia",
      en: "Stripe entity that contracts with EU customers, location and transfer mechanism",
    },
    evidence: "code",
    url: "https://stripe.com/privacy",
  },
  {
    id: "supabase",
    name: "Supabase",
    purpose: {
      es: "Base de datos y autenticación de cuentas.",
      en: "Account database and authentication.",
    },
    data: {
      es: "Correo, nombre y avatar (si los proporcionas), zona horaria, suscripción, registros de inicio de sesión, tickets y conversaciones de soporte.",
      en: "Email, name and avatar (if you provide them), time zone, subscription, sign-in logs, support tickets and conversations.",
    },
    location: { es: "UE o EE. UU. (política vigente).", en: "EU or US (current policy)." },
    confirm: {
      es: "región exacta del proyecto y mecanismo de transferencia si es fuera del EEE",
      en: "exact project region and transfer mechanism if outside the EEA",
    },
    evidence: "code",
    url: "https://supabase.com/privacy",
  },
  {
    id: "vercel",
    name: "Vercel",
    purpose: {
      es: "Alojamiento del sitio web y de la API. Con tu consentimiento de analítica, también Vercel Web Analytics y Speed Insights.",
      en: "Hosting of the website and API. With your analytics consent, also Vercel Web Analytics and Speed Insights.",
    },
    data: {
      es: "Datos técnicos de la conexión (por ejemplo IP y navegador) en los registros del servidor; con consentimiento, páginas visitadas, eventos de clic y métricas de rendimiento.",
      en: "Technical connection data (for example IP and browser) in server logs; with consent, pages visited, click events and performance metrics.",
    },
    location: { es: "Red global de borde; EE. UU.", en: "Global edge network; US." },
    confirm: {
      es: "mecanismo de transferencia y si la analítica de Vercel puede considerarse exenta de consentimiento",
      en: "transfer mechanism and whether Vercel analytics can be considered exempt from consent",
    },
    consent: "analytics",
    evidence: "code",
    url: "https://vercel.com/legal/privacy-policy",
  },
  {
    id: "sentry",
    name: "Sentry",
    purpose: {
      es: "Detección de errores del sitio. En el navegador solo se inicializa con tu consentimiento de analítica; en el servidor registra errores técnicos.",
      en: "Error detection for the site. In the browser it is initialised only with your analytics consent; on the server it records technical errors.",
    },
    data: {
      es: "Mensaje y traza del error, URL, navegador y sistema. Sin grabación de sesión.",
      en: "Error message and stack trace, URL, browser and system. No session replay.",
    },
    confirm: {
      es: "región de datos de Sentry (UE o EE. UU.), mecanismo de transferencia y si el registro de errores del servidor puede considerarse necesario",
      en: "Sentry data region (EU or US), transfer mechanism and whether server-side error logging can be considered necessary",
    },
    consent: "analytics",
    evidence: "code",
    url: "https://sentry.io/privacy/",
  },
  {
    id: "resend",
    name: "Resend",
    purpose: {
      es: "Envío de correos transaccionales.",
      en: "Sending of transactional emails.",
    },
    data: {
      es: "Dirección de correo y contenido del mensaje.",
      en: "Email address and message content.",
    },
    location: { es: "Estados Unidos (política vigente).", en: "United States (current policy)." },
    confirm: {
      es: "mecanismo de transferencia",
      en: "transfer mechanism",
    },
    evidence: "code",
    url: "https://resend.com/legal/privacy-policy",
  },
  {
    id: "rewardful",
    name: "Rewardful",
    purpose: {
      es: "Atribución del programa de afiliados. Solo se carga si aceptas la categoría «Afiliados».",
      en: "Affiliate programme attribution. Loaded only if you accept the “Affiliates” category.",
    },
    data: {
      es: "Identificador del afiliado que te recomendó (cookie de 60 días) y datos técnicos de la visita.",
      en: "Identifier of the referring affiliate (60-day cookie) and technical visit data.",
    },
    confirm: {
      es: "ubicación y mecanismo de transferencia",
      en: "location and transfer mechanism",
    },
    consent: "affiliates",
    evidence: "code",
    url: "https://www.rewardful.com/privacy",
  },
  {
    id: "n8n",
    name: "n8n (servidor gestionado por TerminalSync)",
    purpose: {
      es: "Automatización del chat de soporte, del correo de bienvenida y de las notificaciones que eliges recibir.",
      en: "Automation of the support chat, the welcome email and the notifications you choose to receive.",
    },
    data: {
      es: "Mensajes que escribes al chat de soporte, tu correo cuando pides que te contactemos y el contenido de las notificaciones elegidas.",
      en: "Messages you write to the support chat, your email when you ask us to contact you and the content of the notifications you choose.",
    },
    confirm: {
      es: "proveedor de alojamiento y país del servidor",
      en: "hosting provider and server country",
    },
    evidence: "policy",
  },
  {
    id: "searchapi",
    name: "SearchApi",
    purpose: {
      es: "Búsquedas públicas (negocios y reseñas en Google Maps, vídeos de YouTube) cuando se lo pides a la IA.",
      en: "Public searches (businesses and reviews on Google Maps, YouTube videos) when you ask the AI to do so.",
    },
    data: {
      es: "Texto de la búsqueda o enlace del vídeo, país e idioma. No recibe tu nombre, correo ni documentos.",
      en: "Search text or video link, country and language. It does not receive your name, email or documents.",
    },
    location: { es: "Estados Unidos (política vigente).", en: "United States (current policy)." },
    confirm: { es: "mecanismo de transferencia", en: "transfer mechanism" },
    onRequest: true,
    evidence: "policy",
  },
  {
    id: "google",
    name: "Google",
    purpose: {
      es: "Fuentes tipográficas del sitio (Google Fonts), inicio de sesión con Google si lo eliges y selector de archivos de Drive desde la app.",
      en: "Site typefaces (Google Fonts), sign-in with Google if you choose it and the Drive file picker from the app.",
    },
    data: {
      es: "Dirección IP y datos técnicos de la petición al cargar las fuentes; datos de tu cuenta de Google si inicias sesión con ella.",
      en: "IP address and technical request data when loading the fonts; your Google account data if you sign in with it.",
    },
    location: { es: "Estados Unidos y red global.", en: "United States and global network." },
    confirm: {
      es: "mecanismo de transferencia; las fuentes se cargan antes del consentimiento, hay que decidir si se autoalojan (tarea W2 del handoff)",
      en: "transfer mechanism; fonts load before consent, so decide whether to self-host them (handoff task W2)",
    },
    evidence: "code",
    url: "https://policies.google.com/privacy",
  },
  {
    id: "unpkg",
    name: "unpkg (CDN de librerías)",
    purpose: {
      es: "Entrega la librería de iconos de la página de inicio.",
      en: "Delivers the icon library on the home page.",
    },
    data: {
      es: "Dirección IP y datos técnicos de la petición.",
      en: "IP address and technical request data.",
    },
    confirm: {
      es: "se carga antes del consentimiento; recomendable autoalojar la librería (tarea W2 del handoff) y retirar esta fila",
      en: "loads before consent; the library should be self-hosted (handoff task W2) and this row removed",
    },
    evidence: "code",
  },
  {
    id: "image-providers",
    name: "Google (imágenes), WaveSpeed e Ideogram",
    purpose: {
      es: "Generación de imágenes desde la app de escritorio.",
      en: "Image generation from the desktop app.",
    },
    data: {
      es: "El texto de la petición de imagen y las imágenes de referencia que adjuntes.",
      en: "The image request text and any reference images you attach.",
    },
    confirm: {
      es: "esta fila procede de la documentación de la app de escritorio y no se puede verificar desde el código de la web; confirmar proveedores reales, ubicación, mecanismo de transferencia y consentimiento previo",
      en: "this row comes from the desktop app documentation and cannot be verified from the web code; confirm actual providers, location, transfer mechanism and prior consent",
    },
    onRequest: true,
    evidence: "app-docs",
  },
];
