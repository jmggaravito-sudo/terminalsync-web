import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const revalidate = 0;

/**
 * GET /api/admin/ops
 *
 * Single pane of glass over every n8n workflow JM runs. Pulls the full
 * workflow list + the last 24h of executions in parallel from the n8n
 * public API, then joins them with a curated description map so the
 * dashboard reads more like a status report than a raw API dump.
 *
 * No auth — same reasoning as /api/admin/trends. The page lives at
 * /admin/* (robots: noindex), the n8n API key never leaves the server,
 * and the response is read-only metadata about JM's own workflows.
 */

const N8N_URL = process.env.N8N_URL ?? "https://n8n.nexflowai.net";
const N8N_API_KEY = process.env.N8N_API_KEY ?? "";

/**
 * Curated metadata per workflow ID. Lives here (not in Supabase) because
 * (a) it's small and (b) when JM ships a new workflow the same PR can
 * register it. The dashboard falls back to project-from-prefix detection
 * for any ID not in this map, so adding entries is purely additive.
 */
/**
 * Per-workflow output destination. When a workflow accumulates rows
 * into a sheet/table/admin page over time, the dashboard surfaces a
 * "Ver resultados" button so JM can click straight to the artifact
 * (instead of scrolling individual exec drill-downs to reconstruct).
 *
 * - `resultUrl` can be an internal Next route (e.g. `/admin/trends`)
 *   or an absolute URL (Sheets, GHL pipeline, etc.). Internal routes
 *   get the current `[lang]` prefix applied client-side.
 * - `resultLabel` is the button label. Keep it 2-3 words.
 *
 * Workflows that don't produce a long-lived artifact (event-driven
 * bots whose "result" is a sent WhatsApp message and lives in the
 * customer's chat) are intentionally NOT entered here.
 */
const WORKFLOW_META: Record<
  string,
  {
    project: string;
    description: string;
    cadence?: string;
    resultUrl?: string;
    resultLabel?: string;
  }
> = {
  // ─────────────── MueveTuCarro ───────────────
  FMrDyieW4XjSnmpr: {
    project: "MTC",
    description:
      "Wendy — bot principal vía GHL en WhatsApp + Facebook + Instagram. No muestra precios al cliente; los vendedores cotizan manual desde el resumen que Wendy les deja.",
    cadence: "cuando llega un mensaje",
  },
  NefGWoZfbQYPJWEn: {
    project: "MTC",
    description:
      "Simon 813 — WhatsApp directo. Pide datos, cotiza con precio incluido, manda link de Stripe y hace follow-ups si no paga (10min/50min/23h).",
    cadence: "cuando llega un mensaje",
  },
  ksuDSHamcVxZiCgn: {
    project: "MTC",
    description:
      "Simon 954 (Flujo 5) — atiende el número 954. Si la cotización es internacional, reenvía la conversación a Simon 813.",
    cadence: "cuando llega un mensaje",
  },
  TBtZbweMtO3yulhz: {
    project: "MTC",
    description:
      "Stripe Payment Webhook — escucha pagos exitosos en Stripe, mueve el contacto a 'Depósito Recibido' en GHL y crea la oportunidad de transporte.",
    cadence: "cuando entra un pago",
  },
  YGAp0GKXjhFlDils: {
    project: "MTC",
    description:
      "Webhook Verify del 813 — handshake con Meta para que acepte el webhook de WhatsApp.",
    cadence: "cuando Meta verifica",
  },
  a6BPgp1MK7fuys18: {
    project: "MTC",
    description:
      "Follow-Up Sequence 813 — los recordatorios automáticos a clientes que cotizaron pero no pagaron (10min, 50min, 23h).",
    cadence: "disparado por Simon",
  },
  W5GM6itFiLmzPbot: {
    project: "MTC",
    description:
      "SMS Auto-Reply — si el cliente manda SMS al 813, le contesta pidiéndole que escriba por WhatsApp.",
    cadence: "cuando llega un SMS",
  },
  VQTgsxxH1EN3N9M0: {
    project: "MTC",
    description:
      "Sync Contact Fields → Opportunity — copia los precios y datos del contacto a la oportunidad en GHL para que aparezcan en el pipeline.",
    cadence: "cuando se actualiza un contacto",
  },
  oRHzjY5AAWSTixWj: {
    project: "MTC",
    description:
      "Error Alert — si un workflow MTC se cae, te llega aviso. Es la red de seguridad.",
    cadence: "cuando algo falla",
  },
  EHE4xDeFrvBAXIt5: {
    project: "MTC",
    description:
      "TEMP — Followup Lost Chats. Workflow temporal, lo disparás a mano para reenviar mensajes a clientes que se enfriaron.",
    cadence: "manual",
  },
  hJjiYvQR2ZnFr5jG: {
    project: "MTC",
    description:
      "GHL Outbound Reply 813 — toma respuestas que Simon arma y las envía vía la API de GHL al WhatsApp del cliente.",
    cadence: "disparado por Simon",
  },
  Rxy7HA602dVnFk7P: {
    project: "MTC",
    description:
      "UTIL — Send WhatsApp 813. Helper genérico que el resto de workflows MTC usan para mandar un WA de un mensaje específico al 813.",
    cadence: "disparado por otros",
  },
  miRZf2nxK6hS1y7m: {
    project: "MTC",
    description:
      "Daily Reset Memory — limpia la memoria de buffer de Wendy cada día a la madrugada para arrancar fresco. Solo aplica a Wendy.",
    cadence: "diario 4am",
  },
  kMMvSK9w9VnJE0xD: {
    project: "MTC",
    description:
      "Website Lead → WA + Email — cuando alguien llena formulario en muevetucarroya.us, le manda WA + email instantáneo y crea contacto en GHL.",
    cadence: "cuando llega un lead web",
  },
  PiT17LYfS84BU5zd: {
    project: "MTC",
    description:
      "GHL Outbound Reply 813 (versión vieja, inactiva). El activo es hJjiYvQR…",
    cadence: "deprecated",
  },
  vP67hsmy6anpO7S9: {
    project: "MTC",
    description:
      "Vendor Summary Safety Net — backup que aseguraba que los resúmenes a vendedores no se perdieran. Inactivo desde que Wendy/Simon lo manejan en el flow principal.",
    cadence: "deprecated",
  },
  xmBOUQFZgJC0KyL7: {
    project: "MTC",
    description:
      "Wendy Bot v3 INTERACTIVE — versión de prueba con UI interactiva en GHL. No se usa en prod, sirve para experimentar.",
    cadence: "test",
  },
  "3ZslxDGhs8BZQWzb": {
    project: "MTC",
    description:
      "Muevetucarro con pago completo — versión vieja del flow MTC con cobro 100% adelantado. Reemplazado por Simon/Wendy.",
    cadence: "deprecated",
  },
  "6TV9qIrKM7UHgv9Z": {
    project: "MTC",
    description:
      "MTC Hybrid v2 — Wendy + CRM Webhooks (versión vieja). Archivado, dejó de usarse al simplificar el flujo.",
    cadence: "deprecated",
  },

  // ─────────────── NexFlowAI ───────────────
  GdullBegOsgH0M9A: {
    project: "NexFlowAI",
    description:
      "Router Maestro — el hub. Recibe mensajes de IG/Messenger/WA y decide si es venta de membresía (→ Alex) o consulta sobre afiliados (→ Sofía).",
    cadence: "cuando llega un mensaje",
  },
  SCxBhDfCX3WxaLlM: {
    project: "NexFlowAI",
    description:
      "Alex Vendedor — bot que vende membresías de NexFlowAI. Te califica el lead, manda WA Demo, pide email/teléfono y al final crea la cuenta + agenda onboarding.",
    cadence: "cuando llega un mensaje",
  },
  j78U5Lz9LOqcHDCw: {
    project: "NexFlowAI",
    description:
      "Sofía Afiliados — recomienda herramientas de tu Google Sheet (Sintra, Vista Social, Systeme, Thunderbit). Lee el catálogo en vivo y mete tu link de afiliado.",
    cadence: "cuando llega un mensaje",
  },
  tcU97fs9a7wD3Iwz: {
    project: "NexFlowAI",
    description:
      "Alex Afiliados (Productos) — sub-router pensado para llevar a la persona al producto correcto. Aún NO está conectado al Router Maestro.",
    cadence: "manual / pendiente",
  },
  OXT9Whp7FRUfQmuX: {
    project: "NexFlowAI",
    description:
      "WhatsApp Demo Bot — el cliente llega por wa.me/19542450447 y este bot simula ser el asistente del negocio (estilo Kelaya). Demuestra el valor antes del cierre.",
    cadence: "cuando llega un mensaje",
  },
  M2LeswTNWU6Pgp1X: {
    project: "NexFlowAI",
    description:
      "Demo Builder — cuando Alex cierra una venta, este crea la sub-cuenta GHL con el snapshot del nicho (spa/dentista/restaurante/gym/etc.) y la deja lista.",
    cadence: "disparado por Alex",
  },
  bQy7EhabXj3RWEFR: {
    project: "NexFlowAI",
    description:
      "Onboarding Manager — la secuencia de 6 emails que arranca después del pago. Day 1: conecta WA. Day 2: pipeline. Day 3: form. Day 4: contacto. Day 5: automatización. Day 6: ¡listo!",
    cadence: "disparado por pago",
  },
  jQbkQRcHOJ5MV9U9: {
    project: "NexFlowAI",
    description:
      "Stripe Onboarding — webhook de Stripe. Pago USD confirmado → crea sub-cuenta GHL → contacto + tags → email bienvenida → arranca Onboarding Manager.",
    cadence: "cuando entra un pago Stripe",
  },
  bFhXz0fNEIooTQUD: {
    project: "NexFlowAI",
    description:
      "MercadoPago Onboarding — equivalente al de Stripe pero para clientes Colombia. Pago COP confirmado → mismo flujo de creación de cuenta + emails.",
    cadence: "cuando entra un pago MP",
  },
  dF06ocpc6DCsUtx9: {
    project: "NexFlowAI",
    description:
      "Cron Inactividad Onboarding — cada 6h revisa quién tiene tag onboarding-pendiente y lleva más de 48h sin avanzar. Le manda recordatorio personalizado con barra de progreso.",
    cadence: "cada 6 horas",
  },
  utdwJzF49yjYCZqS: {
    project: "NexFlowAI",
    description:
      "Follow-up Afiliados 24h — cada 12h busca contactos con tag affiliate-tracking. A las 24h les manda tutorial+tip; a las 72h cross-sell + mención de NexFlowAI.",
    cadence: "cada 12 horas",
  },
  fQUYYUcdaFUozYYO: {
    project: "NexFlowAI",
    description:
      "WA Demo Verify — handshake con Meta para el webhook de WhatsApp Demo Bot.",
    cadence: "cuando Meta verifica",
  },
  WqCAI10ijdFXS9jm: {
    project: "NexFlowAI",
    description:
      "Resend Darwin Lead — relay de leads específicos vía Resend (email).",
    cadence: "cuando llega un lead",
  },
  ALofQlyJhgHCSmEZ: {
    project: "NexFlowAI",
    description:
      "Parse Pre-Onboarding Data — Gemini convierte la respuesta cruda del formulario pre-onboarding en JSON estructurado + nota de setup en GHL.",
    cadence: "cuando llega el form",
  },
  u0Q5HVNd3wBvkeZw: {
    project: "NexFlowAI",
    description:
      "Pre-Onboarding Form — el form que el cliente llena ANTES de la llamada de onboarding. Captura datos del negocio para que la llamada sea productiva.",
    cadence: "cuando se envía el form",
  },
  nBWWWMttLL4tDopO: {
    project: "NexFlowAI",
    description:
      "Pre-Onboarding Trigger — dispara el form pre-onboarding por email después del pago + 24h reminder si no lo llena.",
    cadence: "disparado por pago",
  },
  FRfXrbx2J37eLiKf: {
    project: "NexFlowAI",
    description:
      "Pre-Call Reminder 24h — manda recordatorio 24h antes de la llamada de onboarding agendada.",
    cadence: "24h antes de la cita",
  },
  lbgbfLZD3xJqopPr: {
    project: "NexFlowAI",
    description:
      "Post-Pay Checkpoint Día 7 — al día 7 del cliente nuevo le pregunta cómo va, dual-channel (email + WA) para detectar churn temprano.",
    cadence: "día 7 post-pago",
  },
  HlcheukdgF7x2vkz: {
    project: "NexFlowAI",
    description:
      "Trend Hunter (Exploding Topics) — abandonado. Bloqueado por API de $1k/mo + extracción de cookies. Reemplazado por Trend Signals Daily.",
    cadence: "deprecated",
  },
  Ht8Nym3P5L3w32hR: {
    project: "NexFlowAI",
    description:
      "Meta Webhook Verify — handshake genérico con Meta. Inactivo, los específicos por producto lo reemplazaron.",
    cadence: "deprecated",
  },
  rxxUY6RBxTH1VBDd: {
    project: "NexFlowAI",
    description:
      "Mercado Pago Onboarding (versión vieja). El activo es bFhXz0fNEIooTQUD.",
    cadence: "deprecated",
  },

  // ─────────────── Kelaya ───────────────
  N5kQic6k3G4MA8BZ: {
    project: "Kelaya",
    description:
      "Sara — bot WA del spa Kelaya. Ofrece servicios, consulta disponibilidad en Square (filtrada por terapeuta), agenda la cita y manda link de pago.",
    cadence: "cuando llega un mensaje",
  },
  "8LhCpkRWG6IDsuDd": {
    project: "Kelaya",
    description:
      "Follow-Up Pending Payments — si Sara mandó link de pago y el cliente no pagó, le recuerda a los 5min, 30min, 2-3h y 24h con mensajes que escalan urgencia.",
    cadence: "disparado por Sara",
  },

  // ─────────────── Selva ───────────────
  IlsbyYxLbJzDMZGO: {
    project: "Selva",
    description:
      "Design Generator — genera diseños nuevos con Imagen 4.0 según el prompt diario y los sube a la página de aprobación.",
    cadence: "diario 7am COL",
  },
  r7PK7pciPZkkSJxx: {
    project: "Selva",
    description:
      "Design Approval Pipeline — escucha aprobaciones desde la web. Cuando aceptás un diseño, dispara el procesamiento (upscale + remove BG + Printify + ML).",
    cadence: "cuando aprobás un diseño",
  },
  wM2b3q1GklsFGVHs: {
    project: "Selva",
    description:
      "Mockups Aprobados — toma los diseños aprobados y genera los mockups finales para Printify y ML.",
    cadence: "después de aprobar",
  },
  Ij163e4RCdyNsHIf: {
    project: "Selva",
    description:
      "Sync Printify → ML — cuando se crea o actualiza un producto en Printify, lo sincroniza automáticamente con la publicación de Mercado Libre.",
    cadence: "cuando cambia Printify",
  },
  i7UnxIlNdKXkw6GW: {
    project: "Selva",
    description:
      "Pedido → American Wolf — cuando entra una compra en selva.fit, manda la orden de fabricación a American Wolf (el manufacturer real, Printify solo da mockups).",
    cadence: "cuando entra un pedido",
  },
  jaYkOLUhtGg3XrmK: {
    project: "Selva",
    description:
      "Pago Confirmado (Wompi) — webhook de Wompi para pagos COL. Confirma el pago y dispara el flujo de fabricación.",
    cadence: "cuando entra un pago",
  },
  OMVZSJXlGKvVQGNS: {
    project: "Selva",
    description:
      "Servicio al Cliente — bot WA del +57 314 261 6280. Atiende consultas con Gemini, override phone-level para no chocar con NexFlowAI.",
    cadence: "cuando llega un mensaje",
  },
  H5wNb7siEU6IJj3Z: {
    project: "Selva",
    description:
      "WA Webhook Verify — handshake con Meta para el WhatsApp de Selva.",
    cadence: "cuando Meta verifica",
  },
  SwF0rVFHUMP3hXUW: {
    project: "Selva",
    description:
      "Social Poster Daily — todos los días a las 10am COL toma un diseño aprobado, le pone caption con Gemini y lo publica en IG + FB de Selva.",
    cadence: "diario 10am COL",
  },
  KmUQRHZNizyEqYcN: {
    project: "Selva",
    description:
      "Cerebro Creativo Reels — n8n + Claude arman el brief, luego un script local genera el MP4 y lo sube como Reel a IG + FB. Memoria en Google Sheet.",
    cadence: "cada 6 horas",
  },
  ZJH7AXbI3HTvsrMi: {
    project: "Selva",
    description:
      "Design Approval & Production (versión vieja, archivada). Reemplazado por r7PK7pciPZkkSJxx.",
    cadence: "deprecated",
  },
  bUy8xNH7xHflDwB2: {
    project: "Selva",
    description:
      "Design Generator (versión vieja, archivada). Reemplazado por IlsbyYxLbJzDMZGO.",
    cadence: "deprecated",
  },
  tCCbMdaTkhmFeNR0: {
    project: "Selva",
    description:
      "Mockups Aprobados (versión vieja). El activo es wM2b3q1GklsFGVHs.",
    cadence: "deprecated",
  },

  // ─────────────── TerminalSync ───────────────
  // resultUrl intentionally OMITTED for flows with inline ResultsPanel:
  // the dashboard already renders the 5 most recent items right on the
  // card with title + source + date, so a "Ver resultados" link would
  // just lead to a login-gated admin page (those pages exist because
  // they have approve/reject buttons that need auth, but the read-only
  // view is now inline on /admin/ops).
  "2gbpZFPPlYMo6k3f": {
    project: "TerminalSync",
    description:
      "Trends Radar — todas las mañanas a las 6am COL captura GitHub trending + HackerNews top + Reddit top de 7 subreddits + universidades enseñando IA en YouTube.",
    cadence: "diario 6am COL",
  },
  "7ooGFm2XvT8SLdde": {
    project: "TerminalSync",
    description:
      "Captura diaria Influencers (YT + X) — busca creators que hablan a dueños de agencias (marketing, SaaS, growth). Un Gemini classifier dentro del flow filtra y solo guarda los agency-targeted en la tabla agency_influencers. NO manda emails — pausado hasta 'launch'.",
    cadence: "diario 9am COL",
  },
  "3ad53aIJo6QA1vI0": {
    project: "TerminalSync",
    description:
      "Captura diaria Marketplace Publishers — busca herramientas/marketplaces que podrían ser publishers de TerminalSync. Cross-dedup con la DB de creators.",
    cadence: "diario",
  },
  "5JJPordwuTwaPPPK": {
    project: "TerminalSync",
    description:
      "Re-enrich Influencers DB — refresca emails y datos de contacto de los creators ya capturados. Mantiene la DB actualizada para cuando lances outreach.",
    cadence: "cada 6 horas",
  },
  "6LuNDI8Hs90WyiUO": {
    project: "TerminalSync",
    description:
      "Connectors & Skills Discovery — scrapea YouTube + X buscando productos nuevos para listar en el marketplace.",
    cadence: "diario",
  },
  kOrTycM21z6YxsmG: {
    project: "TerminalSync",
    description:
      "Thunderbit Discovery (multi-source) — scraper alterno con Thunderbit + fallback gracioso si falla la API.",
    cadence: "diario",
  },
  lmbQv6R17dqY8pvO: {
    project: "TerminalSync",
    description:
      "No-Dev Prospects — busca usuarios potenciales que NO son devs en Reddit, Indie Hackers y forums. Te ayuda a entender el mercado del lado consumidor.",
    cadence: "diario",
  },
  Gifqx1Fjbtp6z1Ud: {
    project: "TerminalSync",
    description:
      "Notifier · PTY idle — cuando una sesión Claude está idle te avisa por Telegram + WhatsApp. Falta token de BotFather + WABA TerminalSync para activar 100%.",
    cadence: "cuando hay un idle",
  },
  j1CWMGmncSyICQ6U: {
    project: "TerminalSync",
    description:
      "Sync-AI · Support & Sales Agent — agente de soporte+ventas para Terminal Sync. Inactivo hasta que agreguemos ANTHROPIC_API_KEY.",
    cadence: "cuando llega un mensaje",
  },
  hZ5UzReXzaW9iegF: {
    project: "TerminalSync",
    description:
      "Sync-AI · Support Form Submit — recibe envíos del form de soporte y los enrutas al agente de Sync-AI.",
    cadence: "cuando llega el form",
  },
  "9sMs1ExYtue9ay1n": {
    project: "TerminalSync",
    description:
      "Welcome Flow (consumer + dev) — email de bienvenida después del signup. Distinto copy según sea consumer o dev plan.",
    cadence: "cuando hay signup",
  },
  i5Miq18SAdvaTnbK: {
    project: "TerminalSync",
    description:
      "Feedback (Sugerencias) — recibe sugerencias de los usuarios y las guarda + te notifica.",
    cadence: "cuando hay feedback",
  },
  jINNqL72z9yNcKx6: {
    project: "TerminalSync",
    description:
      "Tracker · Replies — escucha respuestas a los emails de outreach (cuando lo lances) y las clasifica.",
    cadence: "cuando llega una respuesta",
  },
  FVj4SmRqgDwlAAZ8: {
    project: "TerminalSync",
    description:
      "Reset emailed flag — utility que resetea el flag 'emailed' en la DB para volver a contactar gente. Solo a mano.",
    cadence: "manual",
  },
  "21DqwyeruJlFNqgW": {
    project: "TerminalSync",
    description:
      "Sender · Influencer Emails (PAUSED) — el envío real de emails a creators. PAUSADO hasta el launch.",
    cadence: "deprecated (pausado)",
  },
  vN2iycD5AI2xRXqF: {
    project: "TerminalSync",
    description:
      "Sender · DM Marketplace Shell (INACTIVO) — esqueleto del DM a marketplaces. Inactivo.",
    cadence: "deprecated (inactivo)",
  },
  mD3N0RU7Gni6YDU2: {
    project: "TerminalSync",
    description:
      "Test · Email manual — workflow de prueba para mandar email a un destinatario manual. No prod.",
    cadence: "test",
  },
  KpqQvgr6H1C2O4Oa: {
    project: "TerminalSync",
    description:
      "Bundle Curator — Claude analiza el catálogo y propone nuevos Stack Packs (bundles) por persona/pain point. Resultado en bundle_proposals para aprobar.",
    cadence: "diario",
  },

  // ─────────────── Printify ───────────────
  "926n1RRI2pvifWHP": {
    project: "Selva",
    description:
      "Printify 2.0 — Crear con Aprobación. Pipeline mejorado: diseño aprobado → producto Printify con mockups + variantes + precios automáticos.",
    cadence: "cuando aprobás un diseño",
  },
  lNqg4OCfATxisuwa: {
    project: "Selva",
    description:
      "Printify 2.0 — Crear Producto con IA. Variante con generación de copy + tags vía Gemini.",
    cadence: "cuando aprobás un diseño",
  },
  zMpUdzWEOBf7oVvR: {
    project: "Selva",
    description:
      "Printify 1.0 — versión vieja del flow de creación. Reemplazado por Printify 2.0.",
    cadence: "deprecated",
  },

  // ─────────────── Otros ───────────────
  GMrxVDtvcWMPQ8Ze: {
    project: "Other",
    description:
      "🤖 On-Page SEO Audit — utility que corre auditoría SEO sobre una URL. Útil para reviews de landings.",
    cadence: "manual",
  },
  "6mhf5FJcVc0w7vay": {
    project: "Other",
    description:
      "GoHighLevel Client Onboarding (Drive + Gmail + Slack) — template viejo. Inactivo, no se usa.",
    cadence: "deprecated",
  },
  aPT0cUtb4v8ojoO9: {
    project: "Other",
    description: "My workflow — placeholder de prueba sin uso real.",
    cadence: "test",
  },
  uNRgw7l0zc6AJixR: {
    project: "Other",
    description: "TEST — Find Template Language. Workflow de prueba, no se usa.",
    cadence: "test",
  },
  "6RPOWwkEyu0EEmyU": {
    project: "Other",
    description: "TEST — HTTP Methods. Workflow de prueba para validar HTTP nodes.",
    cadence: "test",
  },
  XCapaxfIKLQUo9ut: {
    project: "Other",
    description: "TEST — HTTP Methods Available. Otro workflow de prueba.",
    cadence: "test",
  },
};

interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  isArchived?: boolean;
  updatedAt?: string;
  createdAt?: string;
  tags?: { id: string; name: string }[];
}

interface N8nExecution {
  id: string;
  workflowId: string;
  status: "success" | "error" | "running" | "waiting" | "canceled" | string;
  startedAt: string;
  stoppedAt?: string;
  finished?: boolean;
}

interface OpsWorkflow {
  id: string;
  name: string;
  active: boolean;
  archived: boolean;
  project: string;
  description: string | null;
  cadence: string | null;
  /**
   * Where the accumulated output of this workflow lives. `null` for
   * event-driven bots whose "result" is the conversation itself. The
   * dashboard renders it as a "Ver resultados" button next to the
   * "Open in n8n" link.
   */
  resultUrl: string | null;
  resultLabel: string | null;
  updatedAt: string | null;
  todayCount: number;
  todaySuccess: number;
  todayError: number;
  lastExec: {
    id: string;
    status: string;
    startedAt: string;
    durationMs: number | null;
  } | null;
  recent: { id: string; status: string; startedAt: string }[];
  /**
   * Live business-result snapshot for workflows that write into a known
   * Supabase table (trend signals, discovery items, prospects, bundle
   * proposals). Rendered inline on the dashboard so JM can see WHAT the
   * flow produced (titles, dates, sources) without clicking through to
   * the dedicated admin page.
   *
   * Null for flows we don't have a table mapping for (event-driven bots,
   * webhooks, utilities).
   */
  results: WorkflowResults | null;
  /**
   * The human-readable reason the last execution failed, surfaced
   * inline on the card. Pulled from n8n's resultData.error so JM sees
   * "Invalid Notion token" or "Module 'https' is disallowed" at a
   * glance, no n8n login needed. Null when the last execution
   * succeeded.
   */
  lastError: { node: string | null; message: string; description: string | null } | null;
}

interface ResultItem {
  title: string;
  subtitle?: string;
  url?: string;
  timestamp: string;
  badge?: string;
  /** Outbound contact channels (DM-first for the agency outreach flow).
   *  Each entry renders as a clickable chip on the dashboard. */
  contacts?: Array<{ kind: ContactKind; value: string; href: string }>;
}

type ContactKind = "email" | "instagram" | "twitter" | "linkedin" | "tiktok";

function buildContacts(row: {
  email?: unknown;
  instagram_handle?: unknown;
  twitter_handle?: unknown;
  linkedin_url?: unknown;
  tiktok_handle?: unknown;
}): ResultItem["contacts"] {
  const out: NonNullable<ResultItem["contacts"]> = [];
  const push = (kind: ContactKind, value: string, href: string) =>
    out.push({ kind, value, href });

  const ig = row.instagram_handle ? String(row.instagram_handle) : "";
  if (ig) {
    const handle = ig.replace(/^@/, "");
    push("instagram", `@${handle}`, `https://instagram.com/${handle}`);
  }
  const tw = row.twitter_handle ? String(row.twitter_handle) : "";
  if (tw) {
    const handle = tw.replace(/^@/, "");
    push("twitter", `@${handle}`, `https://twitter.com/${handle}`);
  }
  const li = row.linkedin_url ? String(row.linkedin_url) : "";
  if (li) push("linkedin", li.replace(/^https?:\/\//, ""), li.startsWith("http") ? li : `https://${li}`);
  const tt = row.tiktok_handle ? String(row.tiktok_handle) : "";
  if (tt) {
    const handle = tt.replace(/^@/, "");
    push("tiktok", `@${handle}`, `https://tiktok.com/@${handle}`);
  }
  const em = row.email ? String(row.email) : "";
  if (em) push("email", em, `mailto:${em}`);

  return out.length > 0 ? out : undefined;
}

interface WorkflowResults {
  label: string;
  unit: string;
  total: number;
  last24h: number;
  last7d: number;
  items: ResultItem[];
}

/**
 * Maps workflow ID → Supabase table to read its accumulated output from.
 *
 * Each entry declares:
 * - `table`: the underlying table (or view) name
 * - `timeField`: timestamp to use for "last 24h / 7d" counts + ordering
 * - `select`: comma-separated columns to fetch for the recent-items list
 * - `mapItem`: shapes a raw row into the dashboard's `ResultItem`
 * - `label`/`unit`: how the count is described to the user ("47 trends")
 *
 * Keep this in sync with WORKFLOW_META — if a TerminalSync workflow
 * starts writing to a new table, both maps want an entry.
 */
const WORKFLOW_RESULTS_SOURCE: Record<
  string,
  {
    table: string;
    timeField: string;
    select: string;
    label: string;
    unit: string;
    mapItem: (row: Record<string, unknown>) => ResultItem;
    /** How many recent items to surface inline. Default 5 — the agency
     *  flow bumps this so the DM chips have enough surface area to be
     *  useful at a glance. */
    itemsLimit?: number;
  }
> = {
  // Trend Signals Daily → trend_signals
  "2gbpZFPPlYMo6k3f": {
    table: "trend_signals",
    timeField: "captured_at",
    select:
      "title,source,source_url,source_subtype,signal_type,review_status,captured_at",
    label: "Señales capturadas",
    unit: "señales",
    mapItem: (r) => ({
      title: String(r.title ?? "(sin título)"),
      subtitle: [r.source, r.source_subtype].filter(Boolean).join(" · ") || undefined,
      url: r.source_url ? String(r.source_url) : undefined,
      timestamp: String(r.captured_at ?? ""),
      badge: r.review_status ? String(r.review_status) : undefined,
    }),
  },
  // Connectors & Skills Discovery → discovery_connectors
  "6LuNDI8Hs90WyiUO": {
    table: "discovery_connectors",
    timeField: "discovered_at",
    select:
      "product_name,product_slug,source_platform,source_url,pricing,review_status,discovered_at",
    label: "Productos descubiertos",
    unit: "productos",
    mapItem: (r) => ({
      title: String(r.product_name ?? r.product_slug ?? "(sin nombre)"),
      subtitle: [r.source_platform, r.pricing].filter(Boolean).join(" · ") || undefined,
      url: r.source_url ? String(r.source_url) : undefined,
      timestamp: String(r.discovered_at ?? ""),
      badge: r.review_status ? String(r.review_status) : undefined,
    }),
  },
  // Thunderbit Discovery → same table
  kOrTycM21z6YxsmG: {
    table: "discovery_connectors",
    timeField: "discovered_at",
    select:
      "product_name,product_slug,source_platform,source_url,pricing,review_status,discovered_at",
    label: "Productos descubiertos",
    unit: "productos",
    mapItem: (r) => ({
      title: String(r.product_name ?? r.product_slug ?? "(sin nombre)"),
      subtitle: [r.source_platform, r.pricing].filter(Boolean).join(" · ") || undefined,
      url: r.source_url ? String(r.source_url) : undefined,
      timestamp: String(r.discovered_at ?? ""),
      badge: r.review_status ? String(r.review_status) : undefined,
    }),
  },
  // Captura Influencers YT+X → agency_influencers
  // (re-focused 2026-05-25: Gemini classifier inside the workflow now
  //  filters to creators whose audience are agency owners, and writes
  //  only those into agency_influencers. discovery_connectors no longer
  //  gets new rows from this flow.)
  // Outreach pivot 2026-05-26: DM-first via captured social handles
  //  (email coverage is too low without paid enrichment). Card surfaces
  //  contacts inline so JM can DM directly from the dashboard.
  "7ooGFm2XvT8SLdde": {
    table: "agency_influencers",
    timeField: "discovered_at",
    select:
      "name,handle,platform,source_url,email,instagram_handle,twitter_handle,linkedin_url,tiktok_handle,subscribers,target_audience,classification_score,classification_reason,status,discovered_at",
    label: "Influencers agency-targeted",
    unit: "influencers",
    itemsLimit: 10,
    mapItem: (r) => {
      const score =
        typeof r.classification_score === "number"
          ? `${Math.round((r.classification_score as number) * 100)}%`
          : null;
      const sub = [
        r.target_audience,
        score ? `score ${score}` : null,
        r.subscribers ? `${(r.subscribers as number).toLocaleString()} subs` : null,
        r.platform,
      ]
        .filter(Boolean)
        .join(" · ");
      return {
        title: String(r.name ?? r.handle ?? "(sin nombre)"),
        subtitle: sub || (r.classification_reason ? String(r.classification_reason).slice(0, 140) : undefined),
        url: r.source_url ? String(r.source_url) : undefined,
        timestamp: String(r.discovered_at ?? ""),
        badge: r.status ? String(r.status) : undefined,
        contacts: buildContacts(r),
      };
    },
  },
  // Captura Marketplace Publishers → discovery_connectors
  "3ad53aIJo6QA1vI0": {
    table: "discovery_connectors",
    timeField: "discovered_at",
    select:
      "product_name,product_slug,source_platform,source_url,pricing,review_status,discovered_at",
    label: "Marketplaces capturados",
    unit: "marketplaces",
    mapItem: (r) => ({
      title: String(r.product_name ?? r.product_slug ?? "(sin nombre)"),
      subtitle: [r.source_platform, r.pricing].filter(Boolean).join(" · ") || undefined,
      url: r.source_url ? String(r.source_url) : undefined,
      timestamp: String(r.discovered_at ?? ""),
      badge: r.review_status ? String(r.review_status) : undefined,
    }),
  },
  // Re-enrich Influencers DB → uses updated_at to surface fresh enrichments
  "5JJPordwuTwaPPPK": {
    table: "discovery_connectors",
    timeField: "updated_at",
    select:
      "product_name,creator_name,creator_handle,creator_email,source_platform,source_url,review_status,updated_at",
    label: "Filas re-enriquecidas",
    unit: "filas",
    mapItem: (r) => ({
      title: String(r.creator_name ?? r.creator_handle ?? r.product_name ?? "(sin nombre)"),
      subtitle: [r.creator_email, r.source_platform].filter(Boolean).join(" · ") || undefined,
      url: r.source_url ? String(r.source_url) : undefined,
      timestamp: String(r.updated_at ?? ""),
      badge: r.review_status ? String(r.review_status) : undefined,
    }),
  },
  // No-Dev Prospects → prospects_no_dev
  lmbQv6R17dqY8pvO: {
    table: "prospects_no_dev",
    timeField: "discovered_at",
    select:
      "name,handle,company,title,source_platform,source_url,pain_point,status,discovered_at",
    label: "Prospects capturados",
    unit: "prospects",
    mapItem: (r) => ({
      title: String(r.name ?? r.handle ?? "(sin nombre)"),
      subtitle:
        [r.title, r.company, r.source_platform].filter(Boolean).join(" · ") ||
        (r.pain_point ? String(r.pain_point).slice(0, 100) : undefined),
      url: r.source_url ? String(r.source_url) : undefined,
      timestamp: String(r.discovered_at ?? ""),
      badge: r.status ? String(r.status) : undefined,
    }),
  },
  // Bundle Curator → bundle_proposals
  KpqQvgr6H1C2O4Oa: {
    table: "bundle_proposals",
    timeField: "created_at",
    select: "name,slug,persona_label,pain_point,status,created_at",
    label: "Stack Packs propuestos",
    unit: "propuestas",
    mapItem: (r) => ({
      title: String(r.name ?? r.slug ?? "(sin nombre)"),
      subtitle:
        [r.persona_label, r.pain_point].filter(Boolean).join(" · ") || undefined,
      timestamp: String(r.created_at ?? ""),
      badge: r.status ? String(r.status) : undefined,
    }),
  },
};

interface SupabaseLikeClient {
  from(t: string): {
    select(s: string, opts?: { count?: "exact"; head?: boolean }): {
      gte(c: string, v: string): {
        order(c: string, opts?: { ascending?: boolean }): { limit(n: number): unknown };
      };
      order(c: string, opts?: { ascending?: boolean }): { limit(n: number): unknown };
    };
  };
}

/**
 * Pulls counts + recent items for a single workflow's underlying table.
 * Each call hits Supabase 4 times (total + 24h + 7d + items) in parallel.
 * Returns null on any failure so the dashboard renders gracefully even
 * when Supabase is misconfigured locally.
 */
async function fetchWorkflowResults(
  workflowId: string,
  supabase: SupabaseLikeClient,
): Promise<WorkflowResults | null> {
  const cfg = WORKFLOW_RESULTS_SOURCE[workflowId];
  if (!cfg) return null;

  const now = Date.now();
  const since24h = new Date(now - 24 * 3600 * 1000).toISOString();
  const since7d = new Date(now - 7 * 24 * 3600 * 1000).toISOString();

  type CountResult = { count: number | null; error: unknown };
  type ItemsResult = { data: Record<string, unknown>[] | null; error: unknown };

  try {
    const [totalRes, day24Res, day7Res, itemsRes] = (await Promise.all([
      supabase.from(cfg.table).select("id", { count: "exact", head: true }),
      supabase
        .from(cfg.table)
        .select("id", { count: "exact", head: true })
        .gte(cfg.timeField, since24h),
      supabase
        .from(cfg.table)
        .select("id", { count: "exact", head: true })
        .gte(cfg.timeField, since7d),
      supabase
        .from(cfg.table)
        .select(cfg.select)
        // Pull a wide window so the contactable-first sort has enough
        // candidates. agency_influencers has ~150 total rows and only
        // ~10 currently have contacts; pulling 250 covers the lot.
        // Tables that don't need re-sorting (sort = identity) only ever
        // read the first `itemsLimit` so this is also wasted-effort-safe.
        .order(cfg.timeField, { ascending: false })
        .limit(250),
    ])) as unknown as [CountResult, CountResult, CountResult, ItemsResult];

    const rows = (itemsRes.data ?? []).map(cfg.mapItem);
    // Surface rows with at least one contact channel first, then take
    // the requested page size. Time order is preserved within each
    // group (stable sort).
    const limit = cfg.itemsLimit ?? 5;
    const items = [...rows]
      .sort((a, b) => {
        const aHas = (a.contacts?.length ?? 0) > 0 ? 1 : 0;
        const bHas = (b.contacts?.length ?? 0) > 0 ? 1 : 0;
        return bHas - aHas;
      })
      .slice(0, limit);

    return {
      label: cfg.label,
      unit: cfg.unit,
      total: totalRes.count ?? 0,
      last24h: day24Res.count ?? 0,
      last7d: day7Res.count ?? 0,
      items,
    };
  } catch {
    return null;
  }
}

function projectFromName(name: string): string {
  if (/^MTC\b/i.test(name) || /muevetucarro/i.test(name)) return "MTC";
  if (/nexflowai/i.test(name)) return "NexFlowAI";
  if (/kelaya/i.test(name)) return "Kelaya";
  if (/selva/i.test(name)) return "Selva";
  if (/(terminalsync|tsync|sync.ai|outreach|discovery)/i.test(name)) return "TerminalSync";
  if (/trend/i.test(name)) return "Trends";
  return "Other";
}

export async function GET() {
  if (!N8N_API_KEY) {
    return NextResponse.json(
      { error: "N8N_API_KEY env var not set on this deployment" },
      { status: 503 },
    );
  }

  const headers = { "X-N8N-API-KEY": N8N_API_KEY };

  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();

  // Pull workflows and recent executions in parallel. The executions
  // endpoint only takes `limit` (no time filter), so we pull a generous
  // page and filter client-side. 250 covers JM's busiest day so far.
  const [wfRes, execRes] = await Promise.all([
    fetch(`${N8N_URL}/api/v1/workflows?limit=200`, {
      headers,
      cache: "no-store",
    }),
    fetch(`${N8N_URL}/api/v1/executions?limit=250`, {
      headers,
      cache: "no-store",
    }),
  ]);

  if (!wfRes.ok) {
    return NextResponse.json(
      { error: `n8n workflows ${wfRes.status}` },
      { status: 502 },
    );
  }
  if (!execRes.ok) {
    return NextResponse.json(
      { error: `n8n executions ${execRes.status}` },
      { status: 502 },
    );
  }

  const wfJson = (await wfRes.json()) as { data: N8nWorkflow[] };
  const execJson = (await execRes.json()) as { data: N8nExecution[] };

  const workflows = wfJson.data ?? [];
  const allExecs = execJson.data ?? [];
  const recentExecs = allExecs.filter((e) => e.startedAt >= since);

  // Group executions by workflowId for fast lookup.
  const byWorkflow = new Map<string, N8nExecution[]>();
  for (const e of allExecs) {
    const arr = byWorkflow.get(e.workflowId) ?? [];
    arr.push(e);
    byWorkflow.set(e.workflowId, arr);
  }

  // The 250-row global pull is dominated by high-volume bots (Wendy,
  // Simon, Kelaya). Low-frequency workflows (daily crons, manual ones)
  // get pushed out, so the dashboard would show "last activity: never"
  // when in reality they ran 6 hours ago. For every workflow missing
  // from the global pull, fetch its last 5 executions in parallel.
  const missing = workflows.filter(
    (w) => !w.isArchived && !byWorkflow.has(w.id),
  );
  if (missing.length > 0) {
    const fills = await Promise.all(
      missing.map((w) =>
        fetch(
          `${N8N_URL}/api/v1/executions?workflowId=${w.id}&limit=5`,
          { headers, cache: "no-store" },
        )
          .then((r) => (r.ok ? r.json() : { data: [] }))
          .then((j) => ({ id: w.id, execs: (j.data ?? []) as N8nExecution[] }))
          .catch(() => ({ id: w.id, execs: [] as N8nExecution[] })),
      ),
    );
    for (const { id, execs } of fills) {
      if (execs.length > 0) byWorkflow.set(id, execs);
    }
  }

  // Fan-out per-workflow Supabase reads for every flow that has a known
  // results table. Done in parallel up front so the items.map() below
  // can attach the snapshot synchronously.
  const supabase = getSupabaseAdmin() as SupabaseLikeClient | null;
  const resultsById = new Map<string, WorkflowResults>();
  if (supabase) {
    const wfIds = workflows
      .filter((w) => !w.isArchived && WORKFLOW_RESULTS_SOURCE[w.id])
      .map((w) => w.id);
    const settled = await Promise.all(
      wfIds.map((id) =>
        fetchWorkflowResults(id, supabase).then((r) => ({ id, r })),
      ),
    );
    for (const { id, r } of settled) {
      if (r) resultsById.set(id, r);
    }
  }

  // For every workflow whose most-recent execution failed, fetch the
  // detailed run so we can surface the actual error reason on the card.
  // n8n's executions list doesn't include error text; we need
  // ?includeData=true per failing exec. Capped to the latest-per-flow
  // so this stays under ~50 parallel requests in the worst case.
  const lastErrorByWf = new Map<
    string,
    { node: string | null; message: string; description: string | null }
  >();
  const failedExecs: { wfId: string; execId: string }[] = [];
  for (const w of workflows) {
    if (w.isArchived) continue;
    const allFor = byWorkflow.get(w.id) ?? [];
    allFor.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
    const last = allFor[0];
    if (last && last.status === "error") {
      failedExecs.push({ wfId: w.id, execId: last.id });
    }
  }
  if (failedExecs.length > 0) {
    interface N8nErr {
      message?: string;
      node?: { name?: string };
      description?: string;
    }
    interface N8nDetail {
      data?: { resultData?: { error?: N8nErr } };
    }
    const errResults = await Promise.all(
      failedExecs.map(({ wfId, execId }) =>
        fetch(
          `${N8N_URL}/api/v1/executions/${execId}?includeData=true`,
          { headers, cache: "no-store" },
        )
          .then((r) => (r.ok ? (r.json() as Promise<N8nDetail>) : null))
          .then((j) => ({ wfId, err: j?.data?.resultData?.error ?? null }))
          .catch(() => ({ wfId, err: null as N8nErr | null })),
      ),
    );
    for (const { wfId, err } of errResults) {
      if (err?.message) {
        lastErrorByWf.set(wfId, {
          node: err.node?.name ?? null,
          message: err.message,
          description: err.description ?? null,
        });
      }
    }
  }

  const items: OpsWorkflow[] = workflows.map((w) => {
    const meta = WORKFLOW_META[w.id];
    const project = meta?.project ?? projectFromName(w.name);
    const allFor = byWorkflow.get(w.id) ?? [];
    // Sort newest first so [0] is the most recent
    allFor.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
    const todayFor = allFor.filter((e) => e.startedAt >= since);
    const last = allFor[0] ?? null;

    return {
      id: w.id,
      name: w.name,
      active: !!w.active,
      archived: !!w.isArchived,
      project,
      description: meta?.description ?? null,
      cadence: meta?.cadence ?? null,
      resultUrl: meta?.resultUrl ?? null,
      resultLabel: meta?.resultLabel ?? null,
      updatedAt: w.updatedAt ?? null,
      todayCount: todayFor.length,
      todaySuccess: todayFor.filter((e) => e.status === "success").length,
      todayError: todayFor.filter((e) => e.status === "error").length,
      lastExec: last
        ? {
            id: last.id,
            status: last.status,
            startedAt: last.startedAt,
            durationMs:
              last.stoppedAt && last.startedAt
                ? new Date(last.stoppedAt).getTime() -
                  new Date(last.startedAt).getTime()
                : null,
          }
        : null,
      recent: allFor.slice(0, 5).map((e) => ({
        id: e.id,
        status: e.status,
        startedAt: e.startedAt,
      })),
      results: resultsById.get(w.id) ?? null,
      lastError: lastErrorByWf.get(w.id) ?? null,
    };
  });

  // Aggregate per-project totals so the page shows a quick top strip.
  const projects = new Map<string, { total: number; active: number; runs24h: number; errors24h: number }>();
  for (const it of items) {
    const cur = projects.get(it.project) ?? {
      total: 0,
      active: 0,
      runs24h: 0,
      errors24h: 0,
    };
    cur.total += 1;
    if (it.active) cur.active += 1;
    cur.runs24h += it.todayCount;
    cur.errors24h += it.todayError;
    projects.set(it.project, cur);
  }

  // Totals must agree with the per-workflow counts the dashboard renders.
  // recentExecs only contains the global 250-row pull; low-frequency
  // workflows whose executions were back-filled per-workflow (the
  // `missing` branch above) are NOT in there, so summing recentExecs
  // under-counted both runs and errors — the dashboard reported
  // "errors24h: 0" while several daily crons had been red all morning.
  // Reduce over `items` instead so the totals are exactly the sum of
  // the cards.
  const runs24h = items.reduce((s, i) => s + i.todayCount, 0);
  const errors24h = items.reduce((s, i) => s + i.todayError, 0);

  return NextResponse.json({
    items,
    projects: Array.from(projects.entries()).map(([name, stats]) => ({
      name,
      ...stats,
    })),
    totals: {
      workflows: items.length,
      active: items.filter((i) => i.active).length,
      runs24h,
      errors24h,
    },
    n8nUrl: N8N_URL,
  });
}
