/**
 * Business-vocabulary glossary for marketplace pages.
 *
 * Decision (JM, 2026-05-16): keep terms like "CRM", "lead", "deal",
 * "pipeline" in the visible copy because vendedores/founders/marketers
 * use them every day and seeing them is part of what makes the bundle
 * feel credible. But also surface a one-line plain-Spanish definition
 * via a small `?` icon (see `HelpTip`) so a totally non-business
 * reader can still understand without us dumbing down the prose.
 *
 * The key is the **canonical term** (lowercase, singular). The matcher
 * in `GlossaryText` finds the term case-insensitively, with optional
 * "s" suffix for English plurals.
 *
 * Keep entries SHORT (1-2 short sentences). The tooltip clamps at
 * ~280px wide, anything longer reads as a wall of text.
 */

export interface GlossaryEntry {
  /** What the user sees inside the tooltip. Should be a sentence
   *  ending in a period; it goes through no markdown processing. */
  definition: string;
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  crm: {
    definition:
      "Tu base de clientes — donde guardás cada contacto, qué te compraron y en qué estado está cada venta. Ej: Salesforce, HubSpot, Pipedrive.",
  },
  lead: {
    definition:
      "Una persona que mostró interés en tu producto pero todavía no compró. Llegó por un email, un anuncio o una reunión, y queda en tu CRM esperando seguimiento.",
  },
  deal: {
    definition:
      "Una venta en proceso. Arranca cuando un lead muestra intención de comprar y termina cuando firma o se cae.",
  },
  pipeline: {
    definition:
      "El embudo de ventas — todos tus deals juntos, ordenados por la etapa en la que están (ej: Demo, Propuesta, Cerrado).",
  },
  "follow-up": {
    definition:
      "El próximo contacto que tenés que hacer con un cliente: un email recordatorio, una llamada, un mensaje. Si no lo hacés a tiempo, el deal se enfría.",
  },
  followup: {
    definition:
      "El próximo contacto que tenés que hacer con un cliente: un email recordatorio, una llamada, un mensaje. Si no lo hacés a tiempo, el deal se enfría.",
  },
  status: {
    definition:
      "La etapa en la que está cada deal o tarea. Ej: 'En demo', 'Propuesta enviada', 'Cerrado ganado'.",
  },
  stage: {
    definition:
      "La etapa en la que está cada deal dentro de tu pipeline (ej: 'Demo', 'Propuesta', 'Cerrado').",
  },
  onboarding: {
    definition:
      "El proceso de arrancar con un cliente nuevo — setup inicial, primeros pasos, capacitación. Si lo hacés bien el cliente se queda; si no, se va a las semanas.",
  },
  churn: {
    definition:
      "Cliente que cancela su suscripción o deja de comprar. La métrica clave: % de clientes que se van por mes.",
  },
  upsell: {
    definition:
      "Venderle más al cliente que ya tenés (un plan mayor, un add-on). Cuesta menos que conseguir uno nuevo.",
  },
  brief: {
    definition:
      "Un documento corto que explica los objetivos, audiencia y contexto de un proyecto antes de arrancarlo (ej: brief de campaña).",
  },
  cartera: {
    definition:
      "El conjunto de clientes activos que un vendedor o agente maneja. Se mide por cantidad, por ingresos generados o por antigüedad.",
  },
};

/** Canonical lookup. Returns null for unknown terms. */
export function lookupTerm(token: string): GlossaryEntry | null {
  const key = token.toLowerCase().replace(/s$/, "");
  return GLOSSARY[key] ?? GLOSSARY[token.toLowerCase()] ?? null;
}

/** Build a regex that matches any glossary term, case-insensitive,
 *  with optional plural "s". Word-boundary anchored. */
export function buildGlossaryRegex(): RegExp {
  const keys = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);
  // Escape hyphens etc. — none of our keys have regex metas right now,
  // but be defensive in case we add e.g. "post-mortem".
  const escaped = keys.map((k) => k.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"));
  return new RegExp(`\\b(${escaped.join("|")})s?\\b`, "gi");
}
