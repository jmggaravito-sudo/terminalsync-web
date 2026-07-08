// TerminalSync — Use Cases data module
// Tab 1: 29 prompt cases (CASES). Tab 2: 12 automated jobs (JOBS).

export type AI = "Claude" | "Codex" | "Gemini";
export type Level = "basico" | "intermedio" | "avanzado";

export interface Area {
  id: string;
  icon: string;
  es: string;
  en: string;
}

export interface AIWhy {
  id: AI;
  color: string;
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
  used?: boolean;
  es: { t: string; d: string; p: string };
  en: { t: string; d: string; p: string };
}

export interface JobCategory {
  id: string;
  icon: string;
  es: string;
  en: string;
}

export interface Job {
  id: string;
  cat: string;
  ai: AI;
  es: { t: string; d: string; cad: string; rep: string; steps: string[] };
  en: { t: string; d: string; cad: string; rep: string; steps: string[] };
}

// ─── Tab 1 metadata ───────────────────────────────────────────────────────────

export const AREAS: Area[] = [
  { id: "usados",      icon: "⭐", es: "Más usados",                en: "Most used"              },
  { id: "todas",       icon: "",   es: "Todas las áreas",           en: "All areas"              },
  { id: "clientes",    icon: "🎯", es: "Conseguir más clientes",    en: "Win more clients"       },
  { id: "marketing",   icon: "📣", es: "Marketing",                 en: "Marketing"              },
  { id: "atencion",    icon: "💬", es: "Atención al cliente",       en: "Customer service"       },
  { id: "operaciones", icon: "⚙️", es: "Operaciones",               en: "Operations"             },
  { id: "rrhh",        icon: "👥", es: "Recursos Humanos",          en: "Human Resources"        },
  { id: "finanzas",    icon: "💰", es: "Finanzas",                  en: "Finance"                },
  { id: "legal",       icon: "⚖️", es: "Legal",                     en: "Legal"                  },
  { id: "ecommerce",   icon: "🛒", es: "E-commerce",                en: "E-commerce"             },
  { id: "software",    icon: "🛠️", es: "Automatización y Software", en: "Automation & Software"  },
  { id: "direccion",   icon: "🧭", es: "Dirección y estrategia",    en: "Strategy & leadership"  },
  { id: "continuidad", icon: "🔁", es: "Continuidad",               en: "Continuity"             },
];

export const AI_WHY: AIWhy[] = [
  { id: "Claude", color: "var(--color-accent)", es: "Mejor para redactar, organizar y pensar.",          en: "Best for writing, organizing and thinking."      },
  { id: "Codex",  color: "#10b981",             es: "Mejor para construir herramientas y automatizar.", en: "Best for building tools and automating."         },
  { id: "Gemini", color: "#3b82f6",             es: "Mejor para analizar documentos y datos.",          en: "Best for analyzing documents and data."          },
];

export const LEVEL_LABELS: LevelMeta[] = [
  { id: "basico",     es: "Básico",     en: "Basic"        },
  { id: "intermedio", es: "Intermedio", en: "Intermediate" },
  { id: "avanzado",   es: "Avanzado",   en: "Advanced"     },
];

// ─── Tab 2 metadata ───────────────────────────────────────────────────────────

export const JOB_CATS: JobCategory[] = [
  { id: "todos",        icon: "",   es: "Todos",        en: "All"        },
  { id: "ventas",       icon: "🎯", es: "Ventas",       en: "Sales"      },
  { id: "marketing",    icon: "📣", es: "Marketing",    en: "Marketing"  },
  { id: "operaciones",  icon: "⚙️", es: "Operaciones",  en: "Operations" },
  { id: "legal",        icon: "⚖️", es: "Legal",        en: "Legal"      },
  { id: "alojamientos", icon: "🏠", es: "Alojamientos", en: "Rentals"    },
  { id: "software",     icon: "🛠️", es: "Software",     en: "Software"   },
];

// ─── Tab 1: 29 prompt cases ───────────────────────────────────────────────────

export const CASES: UseCase[] = [
  {
    id: "propuesta", area: "clientes", ai: "Claude", level: "basico", used: true,
    es: {
      t: "Crear propuesta comercial",
      d: "Genera una propuesta profesional lista para enviar a un cliente.",
      p: "Ayúdame a crear una propuesta comercial para mi empresa.\n\nMi empresa vende: [describir tu producto o servicio].\nMi cliente ideal es: [tipo de cliente].\nEl objetivo de la propuesta es: [cerrar venta / agendar reunión / firmar contrato].\n\nIncluye: resumen ejecutivo, propuesta de valor, alcance del servicio, beneficios, precio sugerido, condiciones y próximos pasos.",
    },
    en: {
      t: "Create a business proposal",
      d: "Generate a professional proposal ready to send to a client.",
      p: "Help me create a business proposal for my company.\n\nMy company sells: [describe your product or service].\nMy ideal client is: [type of client].\nThe goal of the proposal is: [close a sale / book a meeting / sign a contract].\n\nInclude: executive summary, value proposition, scope of service, benefits, suggested price, terms and next steps.",
    },
  },
  {
    id: "reunion-ventas", area: "clientes", ai: "Claude", level: "basico",
    es: {
      t: "Preparar una reunión de ventas",
      d: "Te llega un guion con preguntas clave y objeciones esperadas.",
      p: "Tengo una reunión de ventas con [nombre / tipo de cliente].\n\nLo que vendo: [producto o servicio].\nLo que sé del cliente: [contexto].\n\nPrepárame: guion de apertura, 5 preguntas clave, objeciones probables con respuestas y un cierre claro.",
    },
    en: {
      t: "Prepare a sales meeting",
      d: "Get a script with key questions and expected objections.",
      p: "I have a sales meeting with [name / type of client].\n\nWhat I sell: [product or service].\nWhat I know about the client: [context].\n\nPrepare: opening script, 5 key questions, likely objections with answers and a clear close.",
    },
  },
  {
    id: "seguimiento", area: "clientes", ai: "Claude", level: "basico", used: true,
    es: {
      t: "Hacer seguimiento a prospectos",
      d: "Mensajes de seguimiento que reactivan conversaciones sin sonar insistente.",
      p: "Necesito hacer seguimiento a un prospecto que no responde hace [días/semanas].\n\nContexto: [última conversación].\nMi tono: [cercano / formal].\n\nEscríbeme 3 mensajes distintos: uno breve, uno con valor agregado y uno de última llamada.",
    },
    en: {
      t: "Follow up with prospects",
      d: "Follow-up messages that revive conversations without sounding pushy.",
      p: "I need to follow up with a prospect who hasn’t replied in [days/weeks].\n\nContext: [last conversation].\nMy tone: [friendly / formal].\n\nWrite 3 different messages: one short, one adding value and one final call.",
    },
  },
  {
    id: "llamada-fria", area: "clientes", ai: "Claude", level: "intermedio",
    es: {
      t: "Crear guion de llamada en frío",
      d: "Guion claro de 60 segundos para abrir conversaciones nuevas.",
      p: "Crea un guion de llamada en frío de 60 segundos.\n\nVendo: [producto o servicio].\nLlamo a: [tipo de cliente].\nEl dolor que resuelvo: [problema].\n\nIncluye: apertura, pregunta gancho, propuesta breve y cierre para agendar.",
    },
    en: {
      t: "Create a cold-call script",
      d: "A clear 60-second script to open new conversations.",
      p: "Create a 60-second cold-call script.\n\nI sell: [product or service].\nI’m calling: [type of client].\nThe pain I solve: [problem].\n\nInclude: opener, hook question, short pitch and a scheduling close.",
    },
  },
  {
    id: "email-frio", area: "clientes", ai: "Claude", level: "basico",
    es: {
      t: "Escribir email de venta en frío",
      d: "Email corto que abre conversaciones sin parecer spam.",
      p: "Escribe un email de venta en frío.\n\nVendo: [producto o servicio].\nDestinatario: [cargo / industria].\nBeneficio principal: [resultado concreto].\n\nMáximo 120 palabras, asunto llamativo y un solo llamado a la acción.",
    },
    en: {
      t: "Write a cold sales email",
      d: "A short email that opens conversations without feeling like spam.",
      p: "Write a cold sales email.\n\nI sell: [product or service].\nRecipient: [role / industry].\nMain benefit: [concrete result].\n\nMax 120 words, catchy subject line and a single call to action.",
    },
  },
  {
    id: "venta-perdida", area: "clientes", ai: "Gemini", level: "intermedio",
    es: {
      t: "Analizar por qué perdí una venta",
      d: "Diagnóstico claro y acciones concretas para no perder ventas similares.",
      p: "Perdí una venta y quiero entender por qué.\n\nContexto: [resumen del proceso].\nObjeciones que surgieron: [lista].\nCompetencia: [si aplica].\n\nDame: diagnóstico probable, 3 señales que ignoré y qué cambiar en la próxima oportunidad.",
    },
    en: {
      t: "Analyze why I lost a sale",
      d: "A clear diagnosis and concrete actions to avoid losing similar deals.",
      p: "I lost a sale and want to understand why.\n\nContext: [process summary].\nObjections raised: [list].\nCompetition: [if any].\n\nGive me: likely diagnosis, 3 signals I missed and what to change next time.",
    },
  },
  {
    id: "calendario", area: "marketing", ai: "Claude", level: "basico", used: true,
    es: {
      t: "Armar calendario de contenido",
      d: "Un mes de contenido alineado a tus objetivos, listo para producir.",
      p: "Arma un calendario de contenido de 4 semanas.\n\nMi negocio: [descripción].\nCanales: [Instagram / LinkedIn / blog...].\nObjetivo del mes: [ventas / awareness / comunidad].\n\nPor pieza: fecha, canal, formato, tema y gancho.",
    },
    en: {
      t: "Build a content calendar",
      d: "A month of content aligned to your goals, ready to produce.",
      p: "Build a 4-week content calendar.\n\nMy business: [description].\nChannels: [Instagram / LinkedIn / blog...].\nGoal for the month: [sales / awareness / community].\n\nPer piece: date, channel, format, topic and hook.",
    },
  },
  {
    id: "campana", area: "marketing", ai: "Claude", level: "intermedio",
    es: {
      t: "Lanzar una campaña completa",
      d: "Copies, piezas y secuencia de correos de una sola vez.",
      p: "Quiero lanzar una campaña para [producto / oferta].\n\nAudiencia: [quién].\nPresupuesto: [monto o \"orgánico\"].\nDuración: [semanas].\n\nEntrega: mensaje central, 5 copies para anuncios, 3 correos de secuencia y el plan de publicación.",
    },
    en: {
      t: "Launch a full campaign",
      d: "Copy, assets and an email sequence in one pass.",
      p: "I want to launch a campaign for [product / offer].\n\nAudience: [who].\nBudget: [amount or \"organic\"].\nDuration: [weeks].\n\nDeliver: core message, 5 ad copies, a 3-email sequence and the publishing plan.",
    },
  },
  {
    id: "reporte-campanas", area: "marketing", ai: "Gemini", level: "intermedio",
    es: {
      t: "Analizar resultados de campañas",
      d: "Lee tus métricas y te dice qué escalar y qué apagar.",
      p: "Analiza los resultados de mis campañas.\n\nPego las métricas: [datos o CSV].\nMi objetivo era: [meta].\n\nDime: qué funcionó, qué apagar, qué escalar y 3 hipótesis para probar la próxima semana.",
    },
    en: {
      t: "Analyze campaign results",
      d: "Reads your metrics and tells you what to scale and what to kill.",
      p: "Analyze my campaign results.\n\nHere are the metrics: [data or CSV].\nMy goal was: [target].\n\nTell me: what worked, what to kill, what to scale and 3 hypotheses to test next week.",
    },
  },
  {
    id: "faq-clientes", area: "atencion", ai: "Claude", level: "basico", used: true,
    es: {
      t: "Responder preguntas frecuentes",
      d: "Respuestas listas en tu tono para las dudas de siempre.",
      p: "Estas son las 10 preguntas que más me hacen los clientes: [lista].\n\nMi tono: [cercano / formal].\nMi negocio: [descripción].\n\nEscribe una respuesta modelo para cada una, breve y en mi voz.",
    },
    en: {
      t: "Answer frequent questions",
      d: "Ready-made answers in your tone for the usual questions.",
      p: "These are the 10 questions clients ask me most: [list].\n\nMy tone: [friendly / formal].\nMy business: [description].\n\nWrite a model answer for each one, short and in my voice.",
    },
  },
  {
    id: "cliente-molesto", area: "atencion", ai: "Claude", level: "intermedio",
    es: {
      t: "Responder a un cliente molesto",
      d: "Baja la tensión, protege la relación y resuelve.",
      p: "Un cliente está molesto por: [motivo].\n\nSu mensaje: [pegar mensaje].\nLo que puedo ofrecer: [opciones reales].\n\nEscribe una respuesta que reconozca el problema, baje la tensión y proponga una solución concreta.",
    },
    en: {
      t: "Reply to an upset customer",
      d: "Lower the tension, protect the relationship and resolve it.",
      p: "A customer is upset about: [reason].\n\nTheir message: [paste message].\nWhat I can offer: [real options].\n\nWrite a reply that acknowledges the problem, lowers the tension and proposes a concrete solution.",
    },
  },
  {
    id: "tickets-resumen", area: "atencion", ai: "Gemini", level: "intermedio",
    es: {
      t: "Resumir los tickets del día",
      d: "Qué se repite, qué urge y qué mejorar de fondo.",
      p: "Aquí están los tickets/conversaciones de hoy: [pegar].\n\nDame: temas que se repiten, casos urgentes, tono general de los clientes y 2 mejoras de fondo para reducir estos tickets.",
    },
    en: {
      t: "Summarize today’s tickets",
      d: "What repeats, what’s urgent and what to fix at the root.",
      p: "Here are today’s tickets/conversations: [paste].\n\nGive me: recurring topics, urgent cases, overall customer tone and 2 root-cause fixes to reduce these tickets.",
    },
  },
  {
    id: "sop", area: "operaciones", ai: "Claude", level: "basico",
    es: {
      t: "Documentar un proceso (SOP)",
      d: "Convierte lo que haces de memoria en un manual paso a paso.",
      p: "Quiero documentar este proceso: [nombre].\n\nAsí lo hago hoy: [describir pasos como salgan].\n\nConviértelo en un SOP claro: objetivo, responsable, pasos numerados, herramientas y errores comunes.",
    },
    en: {
      t: "Document a process (SOP)",
      d: "Turn what you do from memory into a step-by-step manual.",
      p: "I want to document this process: [name].\n\nThis is how I do it today: [describe steps roughly].\n\nTurn it into a clear SOP: goal, owner, numbered steps, tools and common mistakes.",
    },
  },
  {
    id: "reporte-semanal", area: "operaciones", ai: "Codex", level: "intermedio", used: true,
    es: {
      t: "Automatizar el reporte semanal",
      d: "Un script que arma el reporte solo, cada semana.",
      p: "Quiero automatizar mi reporte semanal.\n\nDatos que uso: [fuentes: hojas de cálculo / sistema].\nLo que debe mostrar: [métricas].\nFormato: [correo / PDF / hoja].\n\nConstruye la herramienta y explícame cómo correrla cada lunes.",
    },
    en: {
      t: "Automate the weekly report",
      d: "A script that builds the report by itself, every week.",
      p: "I want to automate my weekly report.\n\nData sources: [spreadsheets / system].\nWhat it must show: [metrics].\nFormat: [email / PDF / sheet].\n\nBuild the tool and explain how to run it every Monday.",
    },
  },
  {
    id: "organizar-carpetas", area: "operaciones", ai: "Codex", level: "basico",
    es: {
      t: "Ordenar y clasificar archivos",
      d: "Limpia carpetas desordenadas y les pone reglas.",
      p: "Mi carpeta [ruta] es un desorden.\n\nContiene: [tipos de archivos].\nQuiero organizarla por: [cliente / fecha / tipo].\n\nPropón la estructura, muéveme los archivos y deja una regla clara para lo nuevo.",
    },
    en: {
      t: "Sort and organize files",
      d: "Cleans messy folders and gives them rules.",
      p: "My folder [path] is a mess.\n\nIt contains: [file types].\nI want it organized by: [client / date / type].\n\nPropose the structure, move the files and leave a clear rule for new ones.",
    },
  },
  {
    id: "job-post", area: "rrhh", ai: "Claude", level: "basico",
    es: {
      t: "Escribir una oferta de empleo",
      d: "Descripción del cargo que atrae al perfil correcto.",
      p: "Necesito publicar una vacante.\n\nCargo: [nombre].\nResponsabilidades: [lista].\nMi empresa: [descripción breve].\nRango salarial: [opcional].\n\nEscribe la oferta: título atractivo, misión del rol, responsabilidades, requisitos y beneficios.",
    },
    en: {
      t: "Write a job posting",
      d: "A role description that attracts the right profile.",
      p: "I need to post a job opening.\n\nRole: [name].\nResponsibilities: [list].\nMy company: [short description].\nSalary range: [optional].\n\nWrite the posting: attractive title, role mission, responsibilities, requirements and benefits.",
    },
  },
  {
    id: "onboarding", area: "rrhh", ai: "Claude", level: "intermedio",
    es: {
      t: "Crear plan de onboarding",
      d: "Los primeros 30 días de un empleado nuevo, organizados.",
      p: "Crea el plan de onboarding para: [cargo].\n\nMi empresa hace: [descripción].\nHerramientas que usamos: [lista].\n\nOrganiza los primeros 30 días: semana a semana, con objetivos, accesos y a quién conocer.",
    },
    en: {
      t: "Create an onboarding plan",
      d: "A new hire’s first 30 days, organized.",
      p: "Create the onboarding plan for: [role].\n\nMy company does: [description].\nTools we use: [list].\n\nOrganize the first 30 days: week by week, with goals, access and who to meet.",
    },
  },
  {
    id: "flujo-caja", area: "finanzas", ai: "Gemini", level: "intermedio",
    es: {
      t: "Analizar el flujo de caja",
      d: "Entiende a dónde se va la plata y qué viene.",
      p: "Analiza mi flujo de caja.\n\nPego los movimientos: [datos / CSV].\nPeriodo: [rango].\n\nDame: entradas vs salidas por categoría, gastos que crecen, meses de riesgo y 3 acciones para mejorar la caja.",
    },
    en: {
      t: "Analyze cash flow",
      d: "Understand where the money goes and what’s coming.",
      p: "Analyze my cash flow.\n\nHere are the transactions: [data / CSV].\nPeriod: [range].\n\nGive me: inflows vs outflows by category, growing expenses, risky months and 3 actions to improve cash.",
    },
  },
  {
    id: "cotizador", area: "finanzas", ai: "Codex", level: "avanzado",
    es: {
      t: "Construir un cotizador",
      d: "Una herramienta que arma cotizaciones con tus precios y reglas.",
      p: "Construye un cotizador para mi negocio.\n\nVendo: [productos/servicios con precios].\nReglas: [descuentos, mínimos, extras].\nSalida: [PDF / correo listo para enviar].\n\nHazlo simple de usar: yo pongo los datos del cliente y me devuelve la cotización lista.",
    },
    en: {
      t: "Build a quoting tool",
      d: "A tool that builds quotes with your prices and rules.",
      p: "Build a quoting tool for my business.\n\nI sell: [products/services with prices].\nRules: [discounts, minimums, extras].\nOutput: [PDF / ready-to-send email].\n\nMake it simple: I enter the client’s details and it returns a ready quote.",
    },
  },
  {
    id: "contrato", area: "legal", ai: "Claude", level: "intermedio",
    es: {
      t: "Redactar un contrato de servicios",
      d: "Borrador claro para revisar con tu abogado.",
      p: "Redacta un borrador de contrato de servicios.\n\nServicio: [qué haré].\nPartes: [mi empresa] y [cliente].\nCondiciones clave: [pago, plazos, entregables].\n\nIncluye: alcance, pagos, confidencialidad, propiedad del trabajo y terminación. Nota: es un borrador para revisión legal.",
    },
    en: {
      t: "Draft a services contract",
      d: "A clear draft to review with your lawyer.",
      p: "Draft a services contract.\n\nService: [what I’ll do].\nParties: [my company] and [client].\nKey terms: [payment, deadlines, deliverables].\n\nInclude: scope, payments, confidentiality, work ownership and termination. Note: this is a draft for legal review.",
    },
  },
  {
    id: "revisar-contrato", area: "legal", ai: "Gemini", level: "avanzado",
    es: {
      t: "Revisar un contrato antes de firmar",
      d: "Encuentra cláusulas riesgosas y te las explica en simple.",
      p: "Revisa este contrato antes de que lo firme: [pegar o adjuntar].\n\nYo soy: [parte que firma].\nMe preocupa: [pagos / exclusividad / responsabilidad].\n\nSeñala cláusulas riesgosas, explícalas en lenguaje simple y sugiere qué negociar.",
    },
    en: {
      t: "Review a contract before signing",
      d: "Finds risky clauses and explains them in plain language.",
      p: "Review this contract before I sign it: [paste or attach].\n\nI am: [signing party].\nMy concerns: [payments / exclusivity / liability].\n\nFlag risky clauses, explain them in plain language and suggest what to negotiate.",
    },
  },
  {
    id: "fichas-producto", area: "ecommerce", ai: "Claude", level: "basico",
    es: {
      t: "Escribir fichas de producto",
      d: "Descripciones que venden y posicionan en buscadores.",
      p: "Escribe las fichas de estos productos: [lista con datos básicos].\n\nMi tienda: [descripción y tono].\nCliente típico: [quién compra].\n\nPor producto: título SEO, descripción persuasiva, bullets de beneficios y meta description.",
    },
    en: {
      t: "Write product listings",
      d: "Descriptions that sell and rank in search.",
      p: "Write listings for these products: [list with basic data].\n\nMy store: [description and tone].\nTypical customer: [who buys].\n\nPer product: SEO title, persuasive description, benefit bullets and meta description.",
    },
  },
  {
    id: "inventario", area: "ecommerce", ai: "Codex", level: "avanzado",
    es: {
      t: "Montar control de inventario",
      d: "Una herramienta que avisa antes de que algo se agote.",
      p: "Construye un control de inventario simple.\n\nMis productos: [fuente: hoja de cálculo / plataforma].\nQuiero: stock actual, alertas de mínimos y reporte semanal de rotación.\n\nHazlo para alguien no técnico: explícame cómo usarlo día a día.",
    },
    en: {
      t: "Set up inventory control",
      d: "A tool that warns you before something runs out.",
      p: "Build a simple inventory control.\n\nMy products: [source: spreadsheet / platform].\nI want: current stock, low-stock alerts and a weekly rotation report.\n\nMake it non-technical: explain how to use it day to day.",
    },
  },
  {
    id: "dashboard", area: "software", ai: "Codex", level: "avanzado", used: true,
    es: {
      t: "Construir un dashboard del negocio",
      d: "Tus números clave en una sola pantalla, siempre al día.",
      p: "Construye un dashboard para mi negocio.\n\nFuentes de datos: [hojas / sistemas].\nMétricas clave: [ventas, caja, clientes...].\nQuién lo ve: [yo / equipo].\n\nHazlo claro y visual, y explícame cómo se actualiza.",
    },
    en: {
      t: "Build a business dashboard",
      d: "Your key numbers on one screen, always up to date.",
      p: "Build a dashboard for my business.\n\nData sources: [sheets / systems].\nKey metrics: [sales, cash, customers...].\nWho sees it: [me / team].\n\nMake it clear and visual, and explain how it updates.",
    },
  },
  {
    id: "portal-clientes", area: "software", ai: "Codex", level: "avanzado",
    es: {
      t: "Crear un portal para clientes",
      d: "Un lugar donde tus clientes ven avances, archivos y estados.",
      p: "Crea un portal simple para mis clientes.\n\nDeben poder ver: [avances / archivos / facturas].\nMis clientes son: [tipo].\nAcceso: [link privado / clave].\n\nConstrúyelo paso a paso y dime cómo darle acceso a cada cliente.",
    },
    en: {
      t: "Create a client portal",
      d: "A place where clients see progress, files and statuses.",
      p: "Create a simple portal for my clients.\n\nThey should see: [progress / files / invoices].\nMy clients are: [type].\nAccess: [private link / password].\n\nBuild it step by step and tell me how to grant each client access.",
    },
  },
  {
    id: "plan-trimestre", area: "direccion", ai: "Claude", level: "intermedio",
    es: {
      t: "Planear el próximo trimestre",
      d: "Convierte tus metas en un plan con dueños y fechas.",
      p: "Ayúdame a planear el próximo trimestre.\n\nMi negocio: [descripción].\nResultados del trimestre pasado: [resumen].\nMetas: [3 objetivos].\n\nEntrega: prioridades, iniciativas por meta, responsable sugerido y qué NO hacer este trimestre.",
    },
    en: {
      t: "Plan next quarter",
      d: "Turn your goals into a plan with owners and dates.",
      p: "Help me plan next quarter.\n\nMy business: [description].\nLast quarter’s results: [summary].\nGoals: [3 objectives].\n\nDeliver: priorities, initiatives per goal, suggested owner and what NOT to do this quarter.",
    },
  },
  {
    id: "decision", area: "direccion", ai: "Claude", level: "avanzado",
    es: {
      t: "Pensar una decisión difícil",
      d: "Un segundo cerebro que te muestra ángulos que no viste.",
      p: "Tengo que tomar una decisión difícil: [describirla].\n\nOpciones que veo: [A, B, C].\nLo que me preocupa: [riesgos].\n\nAyúdame: pros y contras reales, riesgos que no estoy viendo, qué haría falta para decidir con datos y tu recomendación con argumentos.",
    },
    en: {
      t: "Think through a hard decision",
      d: "A second brain that shows you angles you missed.",
      p: "I have a hard decision to make: [describe it].\n\nOptions I see: [A, B, C].\nWhat worries me: [risks].\n\nHelp me: real pros and cons, risks I’m not seeing, what data would settle it and your recommendation with reasoning.",
    },
  },
  {
    id: "cambiar-ia", area: "continuidad", ai: "Claude", level: "basico", used: true,
    es: {
      t: "Continuar cuando la IA llega a su límite",
      d: "Cambia de IA con un clic y sigue exactamente donde ibas.",
      p: "Estoy trabajando en: [tarea].\n\nSi llegas a tu límite de uso, quiero continuar con otra IA sin perder el contexto.\n\nMantén un resumen vivo del proyecto: qué estamos haciendo, decisiones tomadas y próximos pasos, para que cualquier IA pueda continuar.",
    },
    en: {
      t: "Continue when the AI hits its limit",
      d: "Switch AIs in one click and continue exactly where you were.",
      p: "I’m working on: [task].\n\nIf you hit your usage limit, I want to continue with another AI without losing context.\n\nKeep a living summary of the project: what we’re doing, decisions made and next steps, so any AI can pick it up.",
    },
  },
  {
    id: "memoria-empresa", area: "continuidad", ai: "Claude", level: "intermedio",
    es: {
      t: "Enseñarle tu empresa a la IA",
      d: "Una memoria que evita repetir el contexto en cada chat.",
      p: "Quiero que aprendas mi empresa de una vez.\n\nQué hacemos: [descripción].\nNuestro tono: [cómo escribimos].\nClientes: [tipos].\nReglas: [qué nunca hacer].\n\nGuarda esto como memoria del espacio y úsalo en todo lo que trabajemos aquí.",
    },
    en: {
      t: "Teach the AI your business",
      d: "A memory that avoids repeating context in every chat.",
      p: "I want you to learn my business once.\n\nWhat we do: [description].\nOur tone: [how we write].\nClients: [types].\nRules: [what never to do].\n\nSave this as the workspace memory and use it in everything we do here.",
    },
  },
];

// ─── Tab 2: 12 automated jobs ─────────────────────────────────────────────────

export const JOBS: Job[] = [
  {
    id: "buscar-clientes", cat: "ventas", ai: "Gemini",
    es: {
      t: "Buscador de clientes potenciales",
      d: "Investiga tu mercado y te entrega una lista de prospectos calificados.",
      cad: "Cada lunes",
      rep: "Lista con contactos y por qué encajan, en tu carpeta de Ventas",
      steps: [
        "Investiga empresas que encajan con tu cliente ideal",
        "Filtra y califica según tus criterios",
        "Prepara el primer mensaje sugerido para cada uno",
      ],
    },
    en: {
      t: "Prospect finder",
      d: "Researches your market and delivers a list of qualified prospects.",
      cad: "Every Monday",
      rep: "A list with contacts and why they fit, in your Sales folder",
      steps: [
        "Researches companies matching your ideal client",
        "Filters and qualifies by your criteria",
        "Drafts a suggested first message for each",
      ],
    },
  },
  {
    id: "propuestas-auto", cat: "ventas", ai: "Claude",
    es: {
      t: "Preparador de propuestas",
      d: "Convierte los datos de un cliente en una propuesta lista para revisar.",
      cad: "Cuando se lo pidas",
      rep: "Propuesta en tu formato, avisa por WhatsApp al terminar",
      steps: [
        "Lee la carpeta del cliente y el histórico",
        "Arma la propuesta con tu plantilla y precios",
        "Te la deja lista para revisar y enviar",
      ],
    },
    en: {
      t: "Proposal builder",
      d: "Turns a client’s details into a proposal ready to review.",
      cad: "On demand",
      rep: "Proposal in your format, pings you on WhatsApp when done",
      steps: [
        "Reads the client folder and history",
        "Builds the proposal with your template and pricing",
        "Leaves it ready to review and send",
      ],
    },
  },
  {
    id: "crm-aldia", cat: "ventas", ai: "Codex",
    es: {
      t: "CRM siempre al día",
      d: "Registra cada interacción y te avisa qué seguimiento toca hoy.",
      cad: "Todos los días, 7:00 am",
      rep: "Resumen diario: qué se movió y a quién contactar",
      steps: [
        "Revisa correos y conversaciones nuevas",
        "Actualiza el estado de cada negocio",
        "Prepara la lista de seguimientos del día",
      ],
    },
    en: {
      t: "CRM always up to date",
      d: "Logs every interaction and tells you which follow-up is due today.",
      cad: "Daily, 7:00 am",
      rep: "Daily digest: what moved and who to contact",
      steps: [
        "Reviews new emails and conversations",
        "Updates each deal’s status",
        "Prepares today’s follow-up list",
      ],
    },
  },
  {
    id: "seo-mensual", cat: "marketing", ai: "Gemini",
    es: {
      t: "Analista SEO mensual",
      d: "Revisa tu sitio y el de tus competidores y te dice dónde ganar.",
      cad: "El 1° de cada mes",
      rep: "Informe con hallazgos y 5 acciones priorizadas",
      steps: [
        "Analiza posiciones, contenido y competidores",
        "Detecta oportunidades y caídas",
        "Prioriza qué publicar o corregir este mes",
      ],
    },
    en: {
      t: "Monthly SEO analyst",
      d: "Reviews your site and competitors and tells you where to win.",
      cad: "1st of every month",
      rep: "Report with findings and 5 prioritized actions",
      steps: [
        "Analyzes rankings, content and competitors",
        "Spots opportunities and drops",
        "Prioritizes what to publish or fix this month",
      ],
    },
  },
  {
    id: "contenido-semanal", cat: "marketing", ai: "Claude",
    es: {
      t: "Productor de contenido",
      d: "Produce los borradores de la semana en tu voz, listos para aprobar.",
      cad: "Cada viernes",
      rep: "Piezas en tu carpeta de Marketing + aviso por Telegram",
      steps: [
        "Lee tu calendario y temas del mes",
        "Escribe posts, correos y guiones en tu tono",
        "Deja todo en borradores para tu revisión",
      ],
    },
    en: {
      t: "Content producer",
      d: "Produces the week’s drafts in your voice, ready to approve.",
      cad: "Every Friday",
      rep: "Pieces in your Marketing folder + Telegram ping",
      steps: [
        "Reads your calendar and monthly topics",
        "Writes posts, emails and scripts in your tone",
        "Leaves everything as drafts for review",
      ],
    },
  },
  {
    id: "vigia-campanas", cat: "marketing", ai: "Gemini",
    es: {
      t: "Vigía de campañas",
      d: "Monitorea tus anuncios y te alerta antes de quemar presupuesto.",
      cad: "Todos los días",
      rep: "Alerta solo si algo se sale de rango; resumen semanal",
      steps: [
        "Revisa métricas de cada campaña activa",
        "Compara contra tus metas y costos máximos",
        "Sugiere pausar, escalar o ajustar",
      ],
    },
    en: {
      t: "Campaign watchdog",
      d: "Monitors your ads and alerts you before budget burns.",
      cad: "Daily",
      rep: "Alerts only if something drifts; weekly summary",
      steps: [
        "Checks metrics on every active campaign",
        "Compares against your targets and max costs",
        "Suggests pausing, scaling or adjusting",
      ],
    },
  },
  {
    id: "reporte-lunes", cat: "operaciones", ai: "Codex",
    es: {
      t: "Reportero de los lunes",
      d: "Arma el informe semanal del negocio sin que nadie lo persiga.",
      cad: "Cada lunes, 6:00 am",
      rep: "Informe en PDF + correo al equipo",
      steps: [
        "Junta los datos de tus fuentes",
        "Arma el informe con tu formato",
        "Lo envía al equipo y te avisa",
      ],
    },
    en: {
      t: "Monday reporter",
      d: "Builds the weekly business report without anyone chasing it.",
      cad: "Every Monday, 6:00 am",
      rep: "PDF report + email to the team",
      steps: [
        "Gathers data from your sources",
        "Builds the report in your format",
        "Sends it to the team and pings you",
      ],
    },
  },
  {
    id: "clasificador", cat: "operaciones", ai: "Codex",
    es: {
      t: "Clasificador de correos y documentos",
      d: "Ordena lo que llega: facturas, contratos, soporte, spam.",
      cad: "Cada hora",
      rep: "Todo archivado en su carpeta; urgentes a tu WhatsApp",
      steps: [
        "Lee lo nuevo en el correo y las carpetas",
        "Clasifica y archiva según tus reglas",
        "Escala solo lo que necesita tu decisión",
      ],
    },
    en: {
      t: "Email & document sorter",
      d: "Sorts what comes in: invoices, contracts, support, spam.",
      cad: "Hourly",
      rep: "Everything filed in its folder; urgent items to your WhatsApp",
      steps: [
        "Reads new mail and folder drops",
        "Classifies and files by your rules",
        "Escalates only what needs your decision",
      ],
    },
  },
  {
    id: "pendientes", cat: "operaciones", ai: "Claude",
    es: {
      t: "Monitor de pendientes",
      d: "Persigue las tareas vencidas para que nada se enfríe.",
      cad: "Todos los días, 5:00 pm",
      rep: "Lista de vencidos y quién los tiene, cada tarde",
      steps: [
        "Revisa tareas y compromisos de cada espacio",
        "Detecta lo vencido o a punto de vencer",
        "Redacta los recordatorios para enviar",
      ],
    },
    en: {
      t: "Overdue tracker",
      d: "Chases overdue tasks so nothing goes cold.",
      cad: "Daily, 5:00 pm",
      rep: "List of overdue items and owners, every afternoon",
      steps: [
        "Reviews tasks and commitments in each space",
        "Flags overdue and at-risk items",
        "Drafts the reminders to send",
      ],
    },
  },
  {
    id: "revisor-contratos", cat: "legal", ai: "Gemini",
    es: {
      t: "Revisor de contratos",
      d: "Cada contrato nuevo llega revisado, con riesgos señalados en simple.",
      cad: "Cuando llega un contrato",
      rep: "Resumen de riesgos y qué negociar, antes de tu firma",
      steps: [
        "Lee el contrato que llega a la carpeta",
        "Señala cláusulas riesgosas y las explica",
        "Prepara la lista de puntos a negociar",
      ],
    },
    en: {
      t: "Contract reviewer",
      d: "Every new contract arrives reviewed, risks flagged in plain language.",
      cad: "When a contract arrives",
      rep: "Risk summary and negotiation points, before you sign",
      steps: [
        "Reads contracts dropped in the folder",
        "Flags risky clauses and explains them",
        "Prepares the negotiation checklist",
      ],
    },
  },
  {
    id: "huespedes", cat: "alojamientos", ai: "Claude",
    es: {
      t: "Anfitrión digital",
      d: "Procesa cada reserva: bienvenida, portería e ingreso registrado.",
      cad: "Con cada reserva",
      rep: "Todo registrado; te avisa solo si algo requiere tu decisión",
      steps: [
        "Envía la bienvenida e instrucciones al huésped",
        "Notifica a portería con los datos del ingreso",
        "Registra la reserva y el pago en tu control",
      ],
    },
    en: {
      t: "Digital host",
      d: "Handles each booking: welcome, front desk and logged check-in.",
      cad: "With every booking",
      rep: "Everything logged; pings you only if something needs your call",
      steps: [
        "Sends the guest welcome and instructions",
        "Notifies the front desk with check-in details",
        "Logs the booking and payment in your tracker",
      ],
    },
  },
  {
    id: "guardian-bugs", cat: "software", ai: "Codex",
    es: {
      t: "Guardián del código",
      d: "Revisa bugs reportados, corre pruebas y propone correcciones.",
      cad: "Cada noche",
      rep: "Resumen matutino: qué se arregló y qué espera tu OK",
      steps: [
        "Revisa los bugs e issues nuevos",
        "Corre las pruebas y reproduce errores",
        "Propone la corrección y la deja lista para revisar",
      ],
    },
    en: {
      t: "Code guardian",
      d: "Reviews reported bugs, runs tests and proposes fixes.",
      cad: "Every night",
      rep: "Morning digest: what was fixed and what awaits your OK",
      steps: [
        "Reviews new bugs and issues",
        "Runs tests and reproduces errors",
        "Proposes the fix, ready for your review",
      ],
    },
  },
];
