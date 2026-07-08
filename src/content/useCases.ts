// TerminalSync — Use Cases data module
// Tab 1: 28 prompt cases (CASES). Tab 2: 12 automated jobs (JOBS).

export type AI = "claude" | "codex" | "gemini" | "multi";
export type Level = "starter" | "pro";
export type Cadence = "daily" | "weekly" | "monthly" | "event";

export interface Area {
  id: string;
  icon: string;
  es: string;
  en: string;
}

export interface AIWhy {
  id: AI;
  cssVar: string;
  es: string;
  en: string;
}

export interface LevelMeta {
  id: Level;
  es: string;
  en: string;
}

export interface UseCase {
  id: string;
  area: string;
  ai: AI;
  level: Level;
  used?: string;
  es: { t: string; d: string; p: string };
  en: { t: string; d: string; p: string };
}

export interface JobCategory {
  id: string;
  icon: string;
  es: string;
  en: string;
}

export interface CadenceMeta {
  id: Cadence;
  icon: string;
  es: string;
  en: string;
}

export interface Job {
  id: string;
  category: string;
  ai: AI;
  level: Level;
  cadence: Cadence;
  es: {
    t: string;
    d: string;
    steps: string[];
    report: string;
  };
  en: {
    t: string;
    d: string;
    steps: string[];
    report: string;
  };
}

// ─── Tab 1 metadata ───────────────────────────────────────────────────────────

export const AREAS: Area[] = [
  { id: "sync",         icon: "🔄", es: "Sync & Memoria",  en: "Sync & Memory"    },
  { id: "multi-ai",     icon: "🤖", es: "Multi-IA",        en: "Multi-AI"         },
  { id: "messaging",    icon: "💬", es: "Mensajería",      en: "Messaging"        },
  { id: "integrations", icon: "🔌", es: "Integraciones",   en: "Integrations"     },
  { id: "automation",   icon: "⚙️",  es: "Automatización",  en: "Automation"       },
  { id: "analysis",     icon: "📊", es: "Análisis",        en: "Analysis"         },
];

export const AI_WHY: AIWhy[] = [
  { id: "claude",  cssVar: "var(--color-claude)",  es: "Razonamiento profundo y escritura de largo aliento.",      en: "Deep reasoning and long-form writing."                    },
  { id: "codex",   cssVar: "var(--color-codex)",   es: "Generación de código, debugging y tareas técnicas.",       en: "Code generation, debugging, and technical tasks."         },
  { id: "gemini",  cssVar: "var(--color-gemini)",  es: "Análisis de datos, documentos y búsqueda en tiempo real.", en: "Data analysis, documents, and real-time search."          },
  { id: "multi",   cssVar: "var(--color-accent)",  es: "Tarea dividida entre modelos para máximos resultados.",    en: "Task split across models for maximum results."            },
];

export const LEVELS: LevelMeta[] = [
  { id: "starter", es: "Starter", en: "Starter" },
  { id: "pro",     es: "Pro",     en: "Pro"     },
];

// ─── Tab 2 metadata ───────────────────────────────────────────────────────────

export const JOB_CATEGORIES: JobCategory[] = [
  { id: "reportes",      icon: "📋", es: "Reportes",       en: "Reports"       },
  { id: "comunicacion",  icon: "✉️",  es: "Comunicación",   en: "Communication" },
  { id: "research",      icon: "🔍", es: "Investigación",  en: "Research"      },
  { id: "contenido",     icon: "✍️",  es: "Contenido",      en: "Content"       },
  { id: "mantenimiento", icon: "🛠️",  es: "Mantenimiento",  en: "Maintenance"   },
];

export const CADENCES: CadenceMeta[] = [
  { id: "daily",   icon: "☀️",  es: "Diario",    en: "Daily"         },
  { id: "weekly",  icon: "📅", es: "Semanal",   en: "Weekly"        },
  { id: "monthly", icon: "🗓️", es: "Mensual",   en: "Monthly"       },
  { id: "event",   icon: "⚡", es: "Por evento", en: "Event-driven"  },
];

// ─── Tab 1: 28 prompt cases ───────────────────────────────────────────────────

export const CASES: UseCase[] = [
  // — SYNC & MEMORIA (4) —
  {
    id: "sync-1", area: "sync", ai: "claude", level: "starter", used: "Consultores, Fundadores",
    es: { t: "Retomá donde lo dejaste", d: "Abrís TerminalSync en tu segunda computadora y el contexto completo de tu sesión anterior ya está cargado. Sin explicarle nada a la IA.", p: "Ideal para quien trabaja entre laptop y escritorio. Eliminá el ritual de «resumime el proyecto» cada mañana." },
    en: { t: "Pick up where you left off", d: "Open TerminalSync on your second computer and your full previous session context is already loaded. No need to explain anything to the AI.", p: "Ideal for anyone working between a laptop and desktop. Eliminate the 'summarize the project for me' ritual every morning." },
  },
  {
    id: "sync-2", area: "sync", ai: "multi", level: "starter", used: "Agencias, Fundadores",
    es: { t: "Contexto que sobrevive el cambio de modelo", d: "Pasás de Claude a Gemini sin perder el hilo. Tu proyecto, tus instrucciones y tu historial viajan con vos.", p: "Cuando Claude llega a su límite de tokens, el contexto pasa a Gemini intacto. Continuás la misma conversación, no empezás de cero." },
    en: { t: "Context that survives model switches", d: "Switch from Claude to Gemini without losing the thread. Your project, instructions and history travel with you.", p: "When Claude hits its token limit, the context passes to Gemini intact. You continue the same conversation, not start over from scratch." },
  },
  {
    id: "sync-3", area: "sync", ai: "claude", level: "pro", used: "Brokers, Consultores",
    es: { t: "Vault de secretos cifrado", d: "Tus API keys, tokens y credenciales guardados con cifrado AES-256 local. Ni nosotros podemos verlos.", p: "Cada secreto viaja cifrado a tu propio Drive o iCloud. Sin vendor lock-in — si dejás TerminalSync mañana, las llaves son tuyas." },
    en: { t: "Encrypted secrets vault", d: "Your API keys, tokens and credentials stored with local AES-256 encryption. Not even we can see them.", p: "Each secret travels encrypted to your own Drive or iCloud. No vendor lock-in — if you leave TerminalSync tomorrow, the keys are yours." },
  },
  {
    id: "sync-4", area: "sync", ai: "claude", level: "starter", used: "Ecommerce, Agencias",
    es: { t: "Memoria persistente entre sesiones", d: "La IA recuerda las decisiones que tomaste ayer, el sprint de la semana pasada y el contexto de cada cliente.", p: "Sin memoria, cada sesión empieza de cero. Con TerminalSync, tu agente construye sobre lo que ya aprendió de tu negocio." },
    en: { t: "Persistent memory across sessions", d: "The AI remembers the decisions you made yesterday, last week's sprint, and each client's context.", p: "Without memory, every session starts from scratch. With TerminalSync, your agent builds on what it already learned about your business." },
  },
  // — MULTI-IA (4) —
  {
    id: "multi-1", area: "multi-ai", ai: "multi", level: "starter", used: "Fundadores, Agencias",
    es: { t: "Claude escribe, Codex construye, Gemini revisa", d: "Pedís un trabajo complejo y tres IAs lo ejecutan en secuencia: estrategia → código → revisión.", p: "No es elegir una IA. Es tener un equipo. Cada modelo hace lo que mejor hace, en el orden correcto." },
    en: { t: "Claude writes, Codex builds, Gemini reviews", d: "You request a complex job and three AIs execute it in sequence: strategy → code → review.", p: "It's not about picking one AI. It's having a team. Each model does what it does best, in the right order." },
  },
  {
    id: "multi-2", area: "multi-ai", ai: "claude", level: "starter", used: "Consultores, Brokers",
    es: { t: "AI Director que elige por vos", d: "TerminalSync analiza tu tarea y recomienda qué modelo usar — y cuánto te ahorrás vs hacerlo manualmente.", p: "Cuando llegás con «necesito redactar una propuesta comercial», el Director ya sabe que Claude es la herramienta correcta." },
    en: { t: "AI Director that chooses for you", d: "TerminalSync analyzes your task and recommends which model to use — and how much you save vs doing it manually.", p: "When you come in with 'I need to draft a sales proposal', the Director already knows Claude is the right tool." },
  },
  {
    id: "multi-3", area: "multi-ai", ai: "multi", level: "pro", used: "Agencias, Ecommerce",
    es: { t: "Sin tokens, sin parar", d: "Una IA llega a su límite en el medio del trabajo. TerminalSync cambia al siguiente modelo y continúa exactamente donde se quedó.", p: "El límite de contexto de una IA no es tu límite. Tu proyecto continúa sin interrupciones, sin reexplicar nada." },
    en: { t: "No tokens, no stopping", d: "An AI hits its limit mid-work. TerminalSync switches to the next model and continues exactly where it left off.", p: "One AI's context limit is not your limit. Your project continues without interruption, without re-explaining anything." },
  },
  {
    id: "multi-4", area: "multi-ai", ai: "claude", level: "starter", used: "Fundadores, Agencias",
    es: { t: "Asistente que mejora tu prompt", d: "No sabés cómo pedirle algo a la IA. El asistente redacta o mejora el mensaje por vos para que salga mejor.", p: "Para los que recién empiezan con IAs y quieren resultados profesionales desde el primer día." },
    en: { t: "Assistant that improves your prompt", d: "Not sure how to ask the AI something. The assistant drafts or improves the message for you to get better results.", p: "For those just starting with AIs who want professional results from day one." },
  },
  // — MENSAJERÍA (4) —
  {
    id: "msg-1", area: "messaging", ai: "claude", level: "starter", used: "Consultores, Brokers",
    es: { t: "Respondé desde WhatsApp", d: "Tu conversación de TerminalSync te sigue al celular. Respondés desde WhatsApp y tus agentes siguen trabajando.", p: "Sin abrir la laptop. La misma sesión, el mismo contexto, desde cualquier chat." },
    en: { t: "Reply from WhatsApp", d: "Your TerminalSync conversation follows you to your phone. You reply from WhatsApp and your agents keep working.", p: "Without opening the laptop. The same session, the same context, from any chat." },
  },
  {
    id: "msg-2", area: "messaging", ai: "claude", level: "starter", used: "Ecommerce, Fundadores",
    es: { t: "Notificaciones inteligentes en Telegram", d: "Tu agente te avisa por Telegram cuando termina una tarea, necesita una decisión o detecta algo urgente.", p: "El agente trabaja solo. Vos intervenís solo cuando importa. No estás pegado a la terminal para saber qué pasó." },
    en: { t: "Smart notifications in Telegram", d: "Your agent notifies you via Telegram when it finishes a task, needs a decision, or detects something urgent.", p: "The agent works on its own. You step in only when it matters. You're not stuck at the terminal to know what happened." },
  },
  {
    id: "msg-3", area: "messaging", ai: "multi", level: "pro", used: "Agencias, Consultores",
    es: { t: "Aprobación de equipo desde el chat", d: "Tu agente prepara un entregable y lo manda al canal de Telegram del equipo para aprobación. Un emoji y ya.", p: "Flujos de aprobación sin emails, sin Slack separado, sin perder el hilo del trabajo en curso." },
    en: { t: "Team approval from chat", d: "Your agent prepares a deliverable and sends it to the team's Telegram channel for approval. One emoji and done.", p: "Approval flows without emails, without separate Slack, without losing track of the work in progress." },
  },
  {
    id: "msg-4", area: "messaging", ai: "multi", level: "pro", used: "Ecommerce, Brokers",
    es: { t: "Alertas de clientes en riesgo", d: "Tu agente monitorea señales de abandono y te avisa en WhatsApp antes de que el cliente se vaya.", p: "Para ecommerce con suscripciones o brokers con deals que se enfrían. La alerta llega antes de que sea tarde." },
    en: { t: "At-risk client alerts", d: "Your agent monitors abandonment signals and notifies you on WhatsApp before the client leaves.", p: "For subscription ecommerce or brokers with cooling deals. The alert arrives before it's too late." },
  },
  // — INTEGRACIONES (4) —
  {
    id: "int-1", area: "integrations", ai: "claude", level: "starter", used: "Consultores, Agencias",
    es: { t: "Gmail directo en tu sesión de IA", d: "Arrastrás Gmail a tu sesión. El agente lee, redacta y organiza sin que vos abras el inbox.", p: "Sin claves, sin configurar. La integración se activa en un clic y el agente ya tiene acceso al contexto de tus correos." },
    en: { t: "Gmail directly in your AI session", d: "You drag Gmail into your session. The agent reads, drafts, and organizes without you opening the inbox.", p: "No keys, no setup. The integration activates in one click and the agent already has access to your email context." },
  },
  {
    id: "int-2", area: "integrations", ai: "gemini", level: "starter", used: "Brokers, Ecommerce",
    es: { t: "Notion como base de conocimiento viva", d: "Gemini lee tus páginas de Notion en tiempo real y trabaja con la info actualizada de tu empresa.", p: "Sin copiar-pegar documentos. El agente accede a las wikis, SOPs y bases de datos de Notion directamente." },
    en: { t: "Notion as a living knowledge base", d: "Gemini reads your Notion pages in real time and works with up-to-date company info.", p: "No copy-pasting documents. The agent accesses your Notion wikis, SOPs, and databases directly." },
  },
  {
    id: "int-3", area: "integrations", ai: "gemini", level: "pro", used: "Agencias, Fundadores",
    es: { t: "Google Drive como fuente de contexto", d: "El agente lee contratos, briefs y decks de tu Drive para entender el contexto real del proyecto.", p: "Sin reenviar archivos, sin resumir documentos a mano. El agente toma el contexto directamente de donde ya vivís." },
    en: { t: "Google Drive as context source", d: "The agent reads contracts, briefs, and decks from your Drive to understand the real project context.", p: "Without forwarding files, without summarizing documents by hand. The agent takes context directly from where you already live." },
  },
  {
    id: "int-4", area: "integrations", ai: "codex", level: "pro", used: "Fundadores, Agencias",
    es: { t: "GitHub integrado para devs", d: "Codex lee tu repo, propone cambios y abre PRs — todo desde la terminal de TerminalSync.", p: "Sin cambiar de contexto entre editor y agente. El agente trabaja sobre el código real, no en un sandbox." },
    en: { t: "GitHub integrated for devs", d: "Codex reads your repo, proposes changes, and opens PRs — all from the TerminalSync terminal.", p: "No context switching between editor and agent. The agent works on the real code, not in a sandbox." },
  },
  // — AUTOMATIZACIÓN (5) —
  {
    id: "auto-1", area: "automation", ai: "claude", level: "starter", used: "Consultores, Brokers",
    es: { t: "Seguimientos que no se olvidan", d: "Le decís al agente «seguí con esto en 3 días» y lo hace. Sin recordatorios manuales, sin leads fríos.", p: "Para brokers y consultores que pierden negocios por seguimientos olvidados. El agente agenda y ejecuta." },
    en: { t: "Follow-ups that don't slip through", d: "You tell the agent 'follow up on this in 3 days' and it does. No manual reminders, no cold leads.", p: "For brokers and consultants who lose deals to forgotten follow-ups. The agent schedules and executes." },
  },
  {
    id: "auto-2", area: "automation", ai: "multi", level: "pro", used: "Agencias, Ecommerce",
    es: { t: "Reporte semanal en automático", d: "Todos los lunes tu reporte de cliente está listo: métricas, avances, próximos pasos — sin que lo hagas vos.", p: "El agente toma los datos de las integraciones, los procesa con Gemini y redacta el reporte con Claude. Listo para enviar." },
    en: { t: "Weekly report on autopilot", d: "Every Monday your client report is ready: metrics, progress, next steps — without you doing it.", p: "The agent pulls data from integrations, processes it with Gemini, and drafts the report with Claude. Ready to send." },
  },
  {
    id: "auto-3", area: "automation", ai: "codex", level: "pro", used: "Fundadores, Agencias",
    es: { t: "Pipeline de datos sin código", d: "Describís lo que querés procesar y Codex arma el script. Lo ejecuta, testea y te entrega el resultado.", p: "Sin contratar a un data engineer para tareas recurrentes. El agente arma el pipeline, lo documenta y lo mantiene." },
    en: { t: "Data pipeline without code", d: "You describe what you want to process and Codex builds the script. Runs it, tests it, delivers the result.", p: "No need to hire a data engineer for recurring tasks. The agent builds the pipeline, documents it, and maintains it." },
  },
  {
    id: "auto-4", area: "automation", ai: "claude", level: "starter", used: "Ecommerce, Consultores",
    es: { t: "Respuestas repetitivas en piloto automático", d: "El agente identifica las preguntas que te llegan siempre y propone respuestas. Vos aprobás una vez, él responde siempre.", p: "Para ecommerce y negocios de servicios donde el 80% de los mensajes son las mismas 10 preguntas." },
    en: { t: "Repetitive replies on autopilot", d: "The agent identifies questions you always get and drafts answers. You approve once, it replies always.", p: "For ecommerce and service businesses where 80% of messages are the same 10 questions." },
  },
  {
    id: "auto-5", area: "automation", ai: "claude", level: "pro", used: "Brokers, Consultores",
    es: { t: "Portal para que cada cliente entre", d: "Claude arma un portal personalizado donde tu cliente sube documentos, aprueba avances y ve el estado de su proyecto.", p: "Para consultores con múltiples clientes activos. Sin mails de «adjunto el archivo v2 final»." },
    en: { t: "Portal each client can log into", d: "Claude builds a personalized portal where your client uploads documents, approves progress, and sees their project status.", p: "For consultants with multiple active clients. No more 'see attached Tuesday file v2 final' emails." },
  },
  // — ANÁLISIS (7) —
  {
    id: "analysis-1", area: "analysis", ai: "gemini", level: "starter", used: "Brokers, Consultores",
    es: { t: "Estado de cada negocio en un vistazo", d: "Gemini procesa tus deals abiertos y te da una vista de semáforo: qué avanza, qué está estancado, qué se enfría.", p: "Para brokers con muchos leads activos. Sin abrir el CRM — el resumen llega como un briefing de 30 segundos." },
    en: { t: "Every deal's status at a glance", d: "Gemini processes your open deals and gives you a traffic light view: what's moving, what's stalled, what's going cold.", p: "For brokers with many active leads. Without opening the CRM — the summary arrives as a 30-second briefing." },
  },
  {
    id: "analysis-2", area: "analysis", ai: "gemini", level: "starter", used: "Ecommerce, Agencias",
    es: { t: "Dashboard de lo que realmente se vende", d: "Gemini cruza tus datos de ventas, devuelve lo que está funcionando y señala lo que conviene reactivar.", p: "Sin horas en spreadsheets. En minutos tenés una lectura clara de qué productos impulsar y a quién recuperar." },
    en: { t: "Dashboard of what's actually selling", d: "Gemini cross-references your sales data, returns what's working, and flags what's worth reactivating.", p: "No hours in spreadsheets. In minutes you have a clear read on which products to push and who to win back." },
  },
  {
    id: "analysis-3", area: "analysis", ai: "gemini", level: "pro", used: "Fundadores, Consultores",
    es: { t: "Investigación de mercado sin contratar a nadie", d: "Gemini busca en tiempo real, cruza fuentes y te entrega un análisis de competidores, tendencias o precios.", p: "Investigación que antes tomaba días, ahora toma minutos. Con fuentes citadas, no solo resúmenes genéricos." },
    en: { t: "Market research without hiring anyone", d: "Gemini searches in real time, cross-references sources, and delivers a competitor, trend, or pricing analysis.", p: "Research that used to take days now takes minutes. With cited sources, not just generic summaries." },
  },
  {
    id: "analysis-4", area: "analysis", ai: "multi", level: "pro", used: "Consultores, Agencias",
    es: { t: "Propuesta de venta desde una llamada", d: "Cargás la transcripción de tu reunión. Claude extrae los pain points, Gemini los cruza con tu oferta, y sale la propuesta lista.", p: "El proceso que tomaba 3 horas de trabajo se convierte en 10 minutos. Propuesta personalizada al dolor real del cliente." },
    en: { t: "Sales proposal from a call", d: "You upload the transcript of your meeting. Claude extracts the pain points, Gemini cross-references with your offer, and the proposal comes out ready.", p: "The process that used to take 3 hours of work becomes 10 minutes. Proposal personalized to the client's real pain." },
  },
  {
    id: "analysis-5", area: "analysis", ai: "claude", level: "starter", used: "Brokers, Consultores",
    es: { t: "Briefing diario en 60 segundos", d: "Cada mañana tu agente procesa emails, pendientes y agenda y te da un briefing para empezar el día con claridad.", p: "Sin revisar 5 apps al despertarte. Un solo resumen con prioridades, follow-ups y lo que no puede esperar." },
    en: { t: "Daily briefing in 60 seconds", d: "Every morning your agent processes emails, tasks, and calendar and gives you a briefing to start the day with clarity.", p: "Without checking 5 apps when you wake up. One summary with priorities, follow-ups, and what can't wait." },
  },
  {
    id: "analysis-6", area: "analysis", ai: "codex", level: "pro", used: "Ecommerce, Fundadores",
    es: { t: "Sistema de operaciones simple para tu equipo", d: "Codex construye el panel interno que necesita tu equipo para trabajar sin depender de vos para cada decisión.", p: "Un sistema que se usa desde el navegador, sin instalar nada, que tu equipo entiende en 10 minutos." },
    en: { t: "Simple ops system for your team", d: "Codex builds the internal panel your team needs to work without depending on you for every decision.", p: "A system accessed from the browser, nothing to install, that your team understands in 10 minutes." },
  },
  {
    id: "analysis-7", area: "analysis", ai: "gemini", level: "starter", used: "Agencias, Fundadores",
    es: { t: "Auditoría de contenidos en minutos", d: "Gemini revisa lo que publicaste en el último mes, detecta qué funcionó y propone qué replicar la semana que viene.", p: "Para agencias y fundadores que publican en múltiples canales y necesitan tomar decisiones con datos, no con intuición." },
    en: { t: "Content audit in minutes", d: "Gemini reviews what you published in the last month, detects what worked, and proposes what to replicate next week.", p: "For agencies and founders publishing on multiple channels who need to make decisions with data, not intuition." },
  },
];

// ─── Tab 2: 12 automated jobs ─────────────────────────────────────────────────

export const JOBS: Job[] = [
  // — REPORTES (3) —
  {
    id: "job-1", category: "reportes", ai: "claude", level: "starter", cadence: "daily",
    es: {
      t: "Briefing diario personalizado",
      d: "Cada mañana a las 8am tu agente lee emails, calendario y tareas pendientes y te manda un briefing de 5 puntos en WhatsApp.",
      steps: ["Lee emails nuevos y calendario del día", "Clasifica por urgencia y contexto", "Cruza con tareas pendientes y deadlines", "Redacta briefing ejecutivo de 5 puntos", "Envía por WhatsApp o Telegram antes de las 8:30am"],
      report: "Mensaje de WhatsApp con prioridades del día, 3 follow-ups urgentes y un recordatorio de agenda.",
    },
    en: {
      t: "Personalized daily briefing",
      d: "Every morning at 8am your agent reads emails, calendar and pending tasks and sends you a 5-point briefing on WhatsApp.",
      steps: ["Reads new emails and daily calendar", "Classifies by urgency and context", "Cross-references with pending tasks and deadlines", "Drafts a 5-point executive briefing", "Sends via WhatsApp or Telegram before 8:30am"],
      report: "WhatsApp message with day priorities, 3 urgent follow-ups, and one calendar reminder.",
    },
  },
  {
    id: "job-2", category: "reportes", ai: "multi", level: "pro", cadence: "weekly",
    es: {
      t: "Reporte semanal de cliente listo el lunes",
      d: "Todos los lunes a las 9am el reporte de cada cliente está en tu inbox: métricas, avances y próximos pasos redactados por Claude.",
      steps: ["Gemini extrae métricas de las integraciones conectadas", "Gemini compara con la semana anterior y detecta variaciones", "Claude redacta la narrativa con el tono de tu agencia", "El borrador llega a tu inbox para revisión en 1 clic", "Podés editar y enviar directo al cliente desde TerminalSync"],
      report: "Email listo para enviar al cliente con secciones de resultados, análisis y próximos pasos. Sin que lo hagas vos.",
    },
    en: {
      t: "Client weekly report ready on Monday",
      d: "Every Monday at 9am the report for each client is in your inbox: metrics, progress and next steps drafted by Claude.",
      steps: ["Gemini pulls metrics from connected integrations", "Gemini compares against the prior week and flags variations", "Claude drafts the narrative in your agency's tone", "The draft lands in your inbox for 1-click review", "Edit and send to the client directly from TerminalSync"],
      report: "Email ready to send to the client with results, analysis, and next steps sections. Without you doing it.",
    },
  },
  {
    id: "job-3", category: "reportes", ai: "gemini", level: "starter", cadence: "monthly",
    es: {
      t: "Resumen mensual de negocio",
      d: "El primer día del mes Gemini analiza tus números y te manda un resumen: qué funcionó, qué no y qué ajustar.",
      steps: ["Gemini lee datos de ventas, clientes y operaciones del mes", "Identifica los 3 logros más importantes", "Detecta las 2 caídas o alertas principales", "Propone 3 ajustes para el mes siguiente", "Envía el resumen formateado a tu email"],
      report: "Informe de una página con métricas clave, análisis de tendencias y recomendaciones para el próximo mes.",
    },
    en: {
      t: "Monthly business summary",
      d: "On the first day of each month Gemini analyzes your numbers and sends you a summary: what worked, what didn't, and what to adjust.",
      steps: ["Gemini reads sales, client, and operations data for the month", "Identifies the 3 most important achievements", "Detects the 2 main drops or alerts", "Proposes 3 adjustments for next month", "Sends the formatted summary to your email"],
      report: "One-page report with key metrics, trend analysis, and recommendations for next month.",
    },
  },
  // — COMUNICACIÓN (3) —
  {
    id: "job-4", category: "comunicacion", ai: "claude", level: "starter", cadence: "daily",
    es: {
      t: "Inbox procesado y respuestas listas",
      d: "Claude lee tus emails cada mañana, extrae los action items y prepara borradores de respuesta que vos aprobás con un clic.",
      steps: ["Claude lee todos los emails nuevos del día", "Extrae action items y clasifica por urgencia", "Redacta borradores de respuesta en tu tono", "Te manda la lista de borradores para aprobar", "Vos aprobás y Claude envía — o editás en 30 segundos"],
      report: "Lista de emails procesados con borradores de respuesta listos para aprobar. Tu inbox vacío en 10 minutos.",
    },
    en: {
      t: "Processed inbox with ready replies",
      d: "Claude reads your emails every morning, extracts action items and prepares draft responses that you approve with one click.",
      steps: ["Claude reads all new emails for the day", "Extracts action items and classifies by urgency", "Drafts responses in your tone", "Sends you the list of drafts to approve", "You approve and Claude sends — or edit in 30 seconds"],
      report: "List of processed emails with ready-to-approve reply drafts. Empty inbox in 10 minutes.",
    },
  },
  {
    id: "job-5", category: "comunicacion", ai: "claude", level: "starter", cadence: "event",
    es: {
      t: "Follow-up automático de leads",
      d: "Cuando un lead no responde en X días, Claude redacta un follow-up personalizado y te lo manda para aprobar antes de enviarlo.",
      steps: ["Detecta leads sin respuesta después de N días configurados", "Recupera el contexto de la conversación anterior", "Claude redacta un follow-up cálido y personalizado", "Te manda el borrador por WhatsApp para aprobación", "Vos aprobás con 'sí' y Claude lo envía"],
      report: "Borrador de follow-up listo para aprobar con un clic. Nunca más un lead frío por olvido.",
    },
    en: {
      t: "Automated lead follow-up",
      d: "When a lead hasn't replied in X days, Claude drafts a personalized follow-up and sends it to you to approve before sending.",
      steps: ["Detects leads without a reply after N configured days", "Recovers context from the previous conversation", "Claude drafts a warm, personalized follow-up", "Sends you the draft on WhatsApp for approval", "You approve with 'yes' and Claude sends it"],
      report: "Follow-up draft ready to approve with one click. No more cold leads due to forgetting.",
    },
  },
  {
    id: "job-6", category: "comunicacion", ai: "claude", level: "pro", cadence: "weekly",
    es: {
      t: "Newsletter semanal lista en 5 minutos",
      d: "Claude recopila lo más importante de la semana y redacta tu newsletter. Vos la revisás, ajustás y enviás — sin escribir desde cero.",
      steps: ["Recopila el contenido más relevante de la semana (posts, noticias, hitos)", "Claude estructura la newsletter con tu formato habitual", "Redacta con tu tono de voz y estilo", "Te manda el borrador para revisión y ajustes finales", "Enviás desde TerminalSync o copiás a tu plataforma de email"],
      report: "Newsletter completa, formateada y lista para enviar. De cero a listo en menos de 5 minutos.",
    },
    en: {
      t: "Weekly newsletter ready in 5 minutes",
      d: "Claude collects the week's highlights and drafts your newsletter. You review, tweak, and send — without writing from scratch.",
      steps: ["Collects the most relevant content of the week (posts, news, milestones)", "Claude structures the newsletter in your usual format", "Writes in your voice and style", "Sends you the draft for final review and tweaks", "Send from TerminalSync or copy to your email platform"],
      report: "Complete newsletter, formatted and ready to send. Zero to ready in under 5 minutes.",
    },
  },
  // — INVESTIGACIÓN (2) —
  {
    id: "job-7", category: "research", ai: "gemini", level: "pro", cadence: "weekly",
    es: {
      t: "Radar de competidores actualizado",
      d: "Cada semana Gemini rastrea novedades de tus competidores y te manda un mapa actualizado con oportunidades detectadas.",
      steps: ["Gemini busca en tiempo real novedades de competidores configurados", "Analiza cambios de precios, features, comunicación y casos de éxito", "Cruza con tu posicionamiento actual", "Identifica las 2-3 oportunidades más relevantes", "Manda el informe el viernes a las 5pm"],
      report: "Mapa de competidores con actualizaciones de la semana y 2-3 oportunidades accionables para explotar.",
    },
    en: {
      t: "Updated competitor radar",
      d: "Every week Gemini tracks your competitors' news and sends you an updated map with detected opportunities.",
      steps: ["Gemini searches in real time for configured competitor news", "Analyzes price changes, features, messaging and case studies", "Cross-references with your current positioning", "Identifies the 2-3 most relevant opportunities", "Sends the report Friday at 5pm"],
      report: "Competitor map with weekly updates and 2-3 actionable opportunities to exploit.",
    },
  },
  {
    id: "job-8", category: "research", ai: "gemini", level: "starter", cadence: "event",
    es: {
      t: "Alerta de mención de marca",
      d: "En cuanto alguien menciona tu marca online, Gemini te avisa con contexto y sentimiento — antes de que se vuelva un problema.",
      steps: ["Gemini monitorea menciones de la marca en tiempo real", "Clasifica el sentimiento (positivo / neutro / negativo)", "Para menciones negativas, alerta inmediata por WhatsApp", "Para menciones positivas, las agrupa en el resumen diario", "Sugiere cómo responder si la mención requiere acción"],
      report: "Alerta inmediata para menciones negativas + resumen diario de todas las menciones con análisis de sentimiento.",
    },
    en: {
      t: "Brand mention alert",
      d: "As soon as someone mentions your brand online, Gemini notifies you with context and sentiment — before it becomes a problem.",
      steps: ["Gemini monitors brand mentions in real time", "Classifies sentiment (positive / neutral / negative)", "For negative mentions, immediate WhatsApp alert", "For positive mentions, groups them in the daily summary", "Suggests how to respond if the mention requires action"],
      report: "Immediate alert for negative mentions + daily summary of all mentions with sentiment analysis.",
    },
  },
  // — CONTENIDO (2) —
  {
    id: "job-9", category: "contenido", ai: "multi", level: "pro", cadence: "weekly",
    es: {
      t: "Calendario de contenido del mes siguiente",
      d: "Cada viernes Claude y Gemini preparan el calendario de la semana siguiente: temas, formatos y copies listos para aprobar.",
      steps: ["Gemini analiza qué publicaste y qué funcionó mejor", "Gemini identifica trending topics de tu industria", "Claude propone 5-7 ideas de publicaciones con ángulo original", "Claude redacta el copy de cada una en tu tono", "Te llega el calendario completo para aprobar o ajustar"],
      report: "Calendario semanal con 5-7 publicaciones: tema, formato, copy completo y propuesta de visual. Listo para aprobar.",
    },
    en: {
      t: "Next week's content calendar",
      d: "Every Friday Claude and Gemini prepare next week's calendar: topics, formats and copy ready to approve.",
      steps: ["Gemini analyzes what you published and what performed best", "Gemini identifies trending topics in your industry", "Claude proposes 5-7 post ideas with original angles", "Claude drafts the copy for each in your tone", "The full calendar arrives for you to approve or adjust"],
      report: "Weekly calendar with 5-7 posts: topic, format, full copy, and visual suggestion. Ready to approve.",
    },
  },
  {
    id: "job-10", category: "contenido", ai: "claude", level: "starter", cadence: "event",
    es: {
      t: "Publicación lista al instante",
      d: "Le mandás una idea, nota de voz o foto a TerminalSync y Claude la convierte en una publicación pulida lista para subir.",
      steps: ["Recibe el input (texto, nota de voz, imagen o URL)", "Claude extrae la idea central y el ángulo más fuerte", "Redacta el copy en tu tono de voz", "Propone hashtags y hora óptima de publicación", "Te manda el resultado en menos de 2 minutos"],
      report: "Publicación completa con copy, hashtags y timing óptimo. Lista para subir en 2 minutos desde que compartiste la idea.",
    },
    en: {
      t: "Post ready in an instant",
      d: "Send an idea, voice note or photo to TerminalSync and Claude turns it into a polished post ready to publish.",
      steps: ["Receives the input (text, voice note, image or URL)", "Claude extracts the core idea and strongest angle", "Drafts the copy in your voice", "Proposes hashtags and optimal posting time", "Sends you the result in under 2 minutes"],
      report: "Complete post with copy, hashtags, and optimal timing. Ready to publish in 2 minutes from when you shared the idea.",
    },
  },
  // — MANTENIMIENTO (2) —
  {
    id: "job-11", category: "mantenimiento", ai: "codex", level: "pro", cadence: "event",
    es: {
      t: "Alerta de error en producción",
      d: "Cuando algo falla en producción, Codex analiza los logs, identifica la causa raíz y te manda el diagnóstico en 5 minutos.",
      steps: ["Detecta el error vía webhook o log watch", "Codex analiza los logs relevantes del período afectado", "Identifica la causa raíz con probabilidad de ocurrencia", "Propone el fix con el código específico a cambiar", "Abre un issue en GitHub con todo el diagnóstico"],
      report: "Issue en GitHub con causa raíz, severidad, fix propuesto con código exacto y tiempo estimado de resolución.",
    },
    en: {
      t: "Production error alert",
      d: "When something fails in production, Codex analyzes the logs, identifies the root cause, and sends you the diagnosis in 5 minutes.",
      steps: ["Detects the error via webhook or log watch", "Codex analyzes relevant logs from the affected period", "Identifies root cause with probability of occurrence", "Proposes the fix with the specific code to change", "Opens a GitHub issue with the full diagnosis"],
      report: "GitHub issue with root cause, severity, proposed fix with exact code, and estimated resolution time.",
    },
  },
  {
    id: "job-12", category: "mantenimiento", ai: "codex", level: "pro", cadence: "weekly",
    es: {
      t: "Limpieza automática de base de datos",
      d: "Cada semana Codex revisa tu base de datos, detecta duplicados e inactivos y te propone la limpieza para que la apruebes.",
      steps: ["Codex analiza la base de datos en busca de duplicados y registros inactivos", "Clasifica lo que es seguro borrar vs. lo que necesita revisión manual", "Genera el script de limpieza con preview de qué se elimina", "Te manda el plan para aprobación antes de ejecutar", "Ejecuta solo después de tu aprobación explícita"],
      report: "Script de limpieza listo para aprobar con preview exacto: X duplicados, Y inactivos, Z registros huérfanos. Nada se borra sin tu ok.",
    },
    en: {
      t: "Automated database cleanup",
      d: "Every week Codex checks your database, detects duplicates and inactives, and proposes the cleanup for you to approve.",
      steps: ["Codex analyzes the database for duplicates and inactive records", "Classifies what's safe to delete vs. needs manual review", "Generates the cleanup script with a preview of what gets removed", "Sends you the plan for approval before executing", "Executes only after your explicit approval"],
      report: "Cleanup script ready to approve with exact preview: X duplicates, Y inactives, Z orphan records. Nothing deleted without your ok.",
    },
  },
];
