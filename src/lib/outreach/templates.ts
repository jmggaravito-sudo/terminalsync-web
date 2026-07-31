import type { Lead } from "./types";

export type TemplateLang = "es" | "en";
export type TemplateChannel = "dm" | "email";
export type TemplateIntent = "affiliate" | "demo" | "education" | "partnership" | "followup";
export type AudienceSegment = "marketing" | "saas" | "growth" | "consulting" | "education" | "general";

export type OutreachTemplate = {
  id: string;
  label: string;
  channel: TemplateChannel;
  intent: TemplateIntent;
  segment: AudienceSegment | "any";
  lang: TemplateLang;
  subject?: string;
  body: string;
};

export type LeadPersonalization = {
  lang: TemplateLang;
  segment: AudienceSegment;
  firstName: string;
  audienceLabel: string;
  platformLabel: string;
  proof: string;
  pain: string;
  offer: string;
  ask: string;
};

const segmentText: Record<
  AudienceSegment,
  {
    es: { audience: string; pain: string; offer: string; ask: string };
    en: { audience: string; pain: string; offer: string; ask: string };
  }
> = {
  marketing: {
    es: {
      audience: "dueños de agencias de marketing",
      pain: "seguimiento de leads, contenido y reportes que se quedan regados entre WhatsApp, CRM y notas",
      offer: "un flujo con IA para revisar leads, preparar mensajes, resumir respuestas y decidir el próximo paso",
      ask: "¿Te sirve que te mande un ejemplo concreto para una agencia de marketing?",
    },
    en: {
      audience: "marketing agency owners",
      pain: "lead follow-up, content, and reporting getting scattered across WhatsApp, CRM, and notes",
      offer: "an AI workflow to review leads, prepare outreach, summarize replies, and choose the next step",
      ask: "Want me to send a concrete example for a marketing agency?",
    },
  },
  saas: {
    es: {
      audience: "founders SaaS y equipos que venden servicios/producto",
      pain: "demos, follow-ups y señales de intención que se pierden después de la primera conversación",
      offer: "un flujo con IA para convertir conversaciones en tareas, respuestas y próximos pasos dentro del CRM",
      ask: "¿Te mando un ejemplo aplicado a un SaaS o agencia que vende demos?",
    },
    en: {
      audience: "SaaS founders and service/product teams",
      pain: "demos, follow-ups, and buying signals getting lost after the first conversation",
      offer: "an AI workflow that turns conversations into tasks, replies, and CRM next steps",
      ask: "Want me to send an example for a SaaS or agency selling demos?",
    },
  },
  growth: {
    es: {
      audience: "equipos de growth y agencias de performance",
      pain: "experimentos, leads y mensajes que se mueven rápido pero no quedan ordenados para cerrar",
      offer: "un flujo con IA para priorizar oportunidades, escribir follow-up y mantener visible qué hacer después",
      ask: "¿Te comparto un ejemplo para un equipo de growth/agencia performance?",
    },
    en: {
      audience: "growth teams and performance agencies",
      pain: "experiments, leads, and messages moving fast but not staying organized enough to close",
      offer: "an AI workflow to prioritize opportunities, write follow-up, and keep the next action visible",
      ask: "Want an example for a growth team or performance agency?",
    },
  },
  consulting: {
    es: {
      audience: "consultores y agencias que venden conocimiento",
      pain: "propuestas, notas de llamadas y seguimiento manual que consumen tiempo después de cada reunión",
      offer: "un flujo con IA para transformar notas/respuestas en propuestas, tareas y follow-ups listos para enviar",
      ask: "¿Te mando un caso práctico para consultores o agencias de servicios?",
    },
    en: {
      audience: "consultants and knowledge-led agencies",
      pain: "proposals, call notes, and manual follow-up eating time after every meeting",
      offer: "an AI workflow to turn notes/replies into proposals, tasks, and follow-ups ready to send",
      ask: "Want a practical example for consultants or service agencies?",
    },
  },
  education: {
    es: {
      audience: "comunidades que enseñan IA, marketing o automatización",
      pain: "mostrar IA de forma práctica sin quedarse en prompts sueltos o teoría",
      offer: "una demo de flujo completo: capturar leads, priorizar, preparar seguimiento y analizar respuestas con IA",
      ask: "¿A quién le mando una demo corta para evaluar si encaja con su comunidad?",
    },
    en: {
      audience: "communities teaching AI, marketing, or automation",
      pain: "showing AI practically instead of staying at loose prompts or theory",
      offer: "a full workflow demo: capture leads, prioritize, prepare follow-up, and analyze replies with AI",
      ask: "Who should I send a short demo to so you can see if it fits your community?",
    },
  },
  general: {
    es: {
      audience: "empresarios y agencias",
      pain: "seguimiento, contenido, CRM y tareas repetitivas que quedan a medias",
      offer: "un flujo con IA para ordenar oportunidades, preparar mensajes y saber qué hacer después",
      ask: "¿Te mando un ejemplo concreto para ver si hace fit?",
    },
    en: {
      audience: "business owners and agencies",
      pain: "follow-up, content, CRM, and repetitive tasks getting half-done",
      offer: "an AI workflow to organize opportunities, prepare messages, and know what to do next",
      ask: "Want me to send a concrete example to see if it fits?",
    },
  },
};

export const OUTREACH_TEMPLATES: OutreachTemplate[] = [
  {
    id: "dm-affiliate-agency",
    label: "DM afiliado · audiencia agencias",
    channel: "dm",
    intent: "affiliate",
    segment: "any",
    lang: "es",
    body:
      "Hola {firstName} — vi que tu contenido llega a {audienceLabel}. Idea rápida: {offer}. Creo que puede ser buen caso para tu audiencia porque ataca {pain}. Si te sirve, te abro una demo gratis y vemos ángulo de afiliado. {ask}",
  },
  {
    id: "dm-affiliate-agency-en",
    label: "DM affiliate · agency audience",
    channel: "dm",
    intent: "affiliate",
    segment: "any",
    lang: "en",
    body:
      "Hey {firstName} — I saw your content reaches {audienceLabel}. Quick idea: {offer}. It could be useful for your audience because it tackles {pain}. If relevant, I can set up a free demo account and an affiliate angle. {ask}",
  },
  {
    id: "dm-demo-owner",
    label: "DM demo · dueño/agencia",
    channel: "dm",
    intent: "demo",
    segment: "any",
    lang: "es",
    body:
      "Hola {firstName} — {proof}. Creo que TerminalSync puede servirte para {offer}. No es otra herramienta de IA genérica: es un flujo para que el negocio sepa a quién seguir, qué responder y qué hacer después. {ask}",
  },
  {
    id: "dm-demo-owner-en",
    label: "DM demo · owner/agency",
    channel: "dm",
    intent: "demo",
    segment: "any",
    lang: "en",
    body:
      "Hey {firstName} — {proof}. I think TerminalSync could help with {offer}. It is not another generic AI tool; it is a workflow so the business knows who to follow up with, what to reply, and what to do next. {ask}",
  },
  {
    id: "email-creator-personal",
    label: "Email creador · personalizado",
    channel: "email",
    intent: "partnership",
    segment: "any",
    lang: "es",
    subject: "Idea útil para tu audiencia",
    body: `Hola {firstName},

{proof}.

Creo que hay un ángulo útil para tu audiencia de {audienceLabel}: {offer}.

El problema que vemos en empresas/agencias es muy concreto: {pain}. TerminalSync ayuda a convertir eso en un flujo operativo, no en otra lista de prompts.

Si te interesa, te puedo mandar un ejemplo aterrizado para tu audiencia y vemos si tiene sentido una demo o colaboración.

{ask}

— JM
TerminalSync`,
  },
  {
    id: "email-creator-personal-en",
    label: "Email creator · personalized",
    channel: "email",
    intent: "partnership",
    segment: "any",
    lang: "en",
    subject: "Useful idea for your audience",
    body: `Hi {firstName},

{proof}.

I think there is a useful angle for your {audienceLabel} audience: {offer}.

The problem we see with businesses/agencies is specific: {pain}. TerminalSync helps turn that into an operating workflow, not another prompt list.

If relevant, I can send a grounded example for your audience and we can see whether a demo or collaboration makes sense.

{ask}

— JM
TerminalSync`,
  },
  {
    id: "email-education",
    label: "Email educación/comunidad",
    channel: "email",
    intent: "education",
    segment: "education",
    lang: "es",
    subject: "Caso práctico de IA para agencias",
    body: `Hola {firstName},

{proof}.

Quería proponerles un caso práctico para su comunidad: {offer}.

La idea no es enseñar otra herramienta; es mostrar cómo una empresa/agencia puede pasar de leads y respuestas sueltas a un proceso claro de seguimiento.

{ask}

— JM
TerminalSync`,
  },
  {
    id: "email-education-en",
    label: "Email education/community",
    channel: "email",
    intent: "education",
    segment: "education",
    lang: "en",
    subject: "Practical AI ops case for agencies",
    body: `Hi {firstName},

{proof}.

I wanted to suggest a practical case for your community: {offer}.

The idea is not to teach another tool; it is to show how a business/agency can turn scattered leads and replies into a clear follow-up process.

{ask}

— JM
TerminalSync`,
  },
  {
    id: "dm-followup-soft",
    label: "Follow-up suave",
    channel: "dm",
    intent: "followup",
    segment: "any",
    lang: "es",
    body:
      "Hola {firstName}, te lo dejo más concreto: el caso sería mostrarle a {audienceLabel} cómo convertir leads/respuestas en próximos pasos claros con IA. Si no es prioridad, cero problema. ¿Te mando el ejemplo y lo mirás cuando puedas?",
  },
  {
    id: "dm-followup-soft-en",
    label: "Soft follow-up",
    channel: "dm",
    intent: "followup",
    segment: "any",
    lang: "en",
    body:
      "Hey {firstName}, to make it more concrete: the case would show {audienceLabel} how to turn leads/replies into clear next steps with AI. If it is not a priority, no worries. Want me to send the example so you can skim it?",
  },
];

export const TEMPLATES = {
  affiliate: {
    en: OUTREACH_TEMPLATES.find((t) => t.id === "dm-affiliate-agency-en")!.body,
    es: OUTREACH_TEMPLATES.find((t) => t.id === "dm-affiliate-agency")!.body,
  },
  user: {
    en: OUTREACH_TEMPLATES.find((t) => t.id === "dm-demo-owner-en")!.body,
    es: OUTREACH_TEMPLATES.find((t) => t.id === "dm-demo-owner")!.body,
  },
} as const;

export type TemplateTrack = keyof typeof TEMPLATES;

export const templateTrack = (track: string | null): TemplateTrack =>
  track === "affiliate" ? "affiliate" : "user";

export const templateLang = (language: string | null): TemplateLang =>
  language === "es" ? "es" : "en";

export function inferSegment(lead: Partial<Lead>): AudienceSegment {
  const haystack = [
    lead.target_audience,
    lead.niche,
    lead.source_keyword,
    lead.classification_reason,
    lead.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/educat|course|academy|school|univers|bootcamp|curso|escuela|academ/i.test(haystack)) return "education";
  if (/saas|software|b2b|startup|founder|product/i.test(haystack)) return "saas";
  if (/growth|performance|paid|ads|media buying|acquisition|cro|funnels?/i.test(haystack)) return "growth";
  if (/consult|coach|advisor|fractional|agency operations|operaciones/i.test(haystack)) return "consulting";
  if (/market|brand|content|social|seo|copy|creator|agenc/i.test(haystack)) return "marketing";
  return "general";
}

export function personalizeLead(lead: Partial<Lead>): LeadPersonalization {
  const lang = templateLang(lead.language ?? null);
  const segment = inferSegment(lead);
  const copy = segmentText[segment][lang];
  const fallbackName = lang === "es" ? "equipo" : "there";
  const rawName = (lead.name || lead.handle || fallbackName).trim();
  const firstName = rawName.split(/\s+/)[0] || fallbackName;
  const platformLabel = lead.platform || (lang === "es" ? "tu canal" : "your channel");
  const proofBase = lead.classification_reason || lead.description || lead.source_keyword || lead.target_audience;
  const proof = proofBase
    ? lang === "es"
      ? `Vi ${platformLabel} y el ángulo que aparece es: ${truncateSentence(String(proofBase), 150)}`
      : `I checked ${platformLabel} and the angle I saw is: ${truncateSentence(String(proofBase), 150)}`
    : lang === "es"
      ? `Vi tu contenido en ${platformLabel} y parece conectado con ${copy.audience}`
      : `I saw your content on ${platformLabel} and it seems connected to ${copy.audience}`;

  return {
    lang,
    segment,
    firstName,
    audienceLabel: copy.audience,
    platformLabel,
    proof,
    pain: copy.pain,
    offer: copy.offer,
    ask: copy.ask,
  };
}

export function renderOutreachTemplate(template: OutreachTemplate, lead: Partial<Lead>): string {
  const p = personalizeLead(lead);
  return template.body
    .replaceAll("{firstName}", p.firstName)
    .replaceAll("{audienceLabel}", p.audienceLabel)
    .replaceAll("{platformLabel}", p.platformLabel)
    .replaceAll("{proof}", p.proof)
    .replaceAll("{pain}", p.pain)
    .replaceAll("{offer}", p.offer)
    .replaceAll("{ask}", p.ask)
    .replaceAll("{name}", p.firstName)
    .replaceAll("{hook}", "");
}

export function recommendedTemplateId(lead: Partial<Lead>): string {
  const p = personalizeLead(lead);
  const hasEmail = Boolean(lead.email);
  if (p.segment === "education") return p.lang === "es" ? "email-education" : "email-education-en";
  if (hasEmail) return p.lang === "es" ? "email-creator-personal" : "email-creator-personal-en";
  if (lead.track === "affiliate") return p.lang === "es" ? "dm-affiliate-agency" : "dm-affiliate-agency-en";
  return p.lang === "es" ? "dm-demo-owner" : "dm-demo-owner-en";
}

function truncateSentence(value: string, max: number): string {
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1).trim()}…`;
}
