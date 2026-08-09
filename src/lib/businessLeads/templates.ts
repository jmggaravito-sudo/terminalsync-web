import type { BusinessLead } from "./types";

/**
 * Outreach copy for business_leads (direct-to-business, Google Maps
 * prospecting) — mirrors src/lib/outreach/templates.ts's pain/offer/ask
 * shape, but per-niche instead of per-audience-segment, and pitched at
 * the business owner directly instead of at a creator's audience.
 *
 * The pitch is deliberately outcome-first ("stop losing customers who
 * don't come back", "stop chasing reviews by hand") rather than
 * feature-first ("terminal sync across machines") — that framing is for
 * developers, not a bakery or dental clinic owner.
 */

export type BusinessNiche = "salud" | "educacion" | "ongs" | "negocios_locales" | "gestion_empresarial";

type NicheCopy = {
  audience: string;
  pain: string;
  offer: string;
};

const NICHE_COPY: Record<BusinessNiche, NicheCopy> = {
  salud: {
    audience: "clínicas y consultorios",
    pain: "recordarle la cita a cada paciente, hacer seguimiento después, y pedir una reseña sin que alguien del consultorio tenga que acordarse de hacerlo a mano",
    offer: "un asistente de IA que arma esos mensajes por vos — recordatorios, seguimiento y pedido de reseñas — corriendo desde la computadora que ya tenés, sin contratar a nadie más",
  },
  educacion: {
    audience: "colegios y academias",
    pain: "responder las mismas preguntas de los padres una y otra vez por WhatsApp, y que se escapen recordatorios de pagos o eventos",
    offer: "un asistente de IA que prepara esas respuestas y recordatorios por vos, para que no dependan de que alguien esté siempre disponible",
  },
  ongs: {
    audience: "fundaciones y ONGs",
    pain: "contarle a cada donante en qué se usó su aporte y hacer seguimiento a voluntarios, con poco presupuesto para herramientas",
    offer: "un asistente de IA con plan accesible para armar esos mensajes de seguimiento y reportes de impacto",
  },
  negocios_locales: {
    audience: "negocios locales",
    pain: "clientes que compraron una vez y no volvieron, y pedir una reseña después de una buena atención sin que quede en el olvido",
    offer: "un asistente de IA que arma esos mensajes de seguimiento y promos por vos",
  },
  gestion_empresarial: {
    audience: "negocios de servicios",
    pain: "propuestas, seguimiento a prospectos y reportes a clientes que se van acumulando",
    offer: "un asistente de IA que te ayuda a armar todo eso más rápido, sin sumar otra herramienta complicada",
  },
};

const DEFAULT_NICHE: BusinessNiche = "negocios_locales";

function resolveNiche(niche: string | null): BusinessNiche {
  return niche && niche in NICHE_COPY ? (niche as BusinessNiche) : DEFAULT_NICHE;
}

export function whatsappTemplate(lead: Pick<BusinessLead, "name" | "niche">): string {
  const copy = NICHE_COPY[resolveNiche(lead.niche)];
  return `Hola${lead.name ? " " + lead.name : ""} 👋 Te escribo de TerminalSync. Ayudamos a ${copy.audience} a resolver algo bien concreto: ${copy.pain}. Armamos ${copy.offer}. ¿Tenés 10 minutos esta semana para mostrarte cómo se vería aplicado a tu negocio?`;
}

export function emailSubjectTemplate(lead: Pick<BusinessLead, "name" | "niche">): string {
  const copy = NICHE_COPY[resolveNiche(lead.niche)];
  return `Una mano con ${copy.pain.split(",")[0]}`;
}

export function emailBodyTemplate(lead: Pick<BusinessLead, "name" | "niche">): string {
  const copy = NICHE_COPY[resolveNiche(lead.niche)];
  const greeting = lead.name ? `Hola equipo de ${lead.name},` : "Hola,";
  return `${greeting}

Te escribo de TerminalSync. Trabajamos con ${copy.audience} ayudándolos con algo muy puntual: ${copy.pain}.

Armamos ${copy.offer}.

No es una herramienta más para aprender — corre en la computadora que ya usás, y lo configuramos nosotros.

¿Tenés 15 minutos esta semana para mostrarte cómo se vería aplicado a tu negocio? Sin compromiso.

Saludos,
JM
TerminalSync`;
}
