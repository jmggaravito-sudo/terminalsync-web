export const GEO_PAGE_SLUGS = [
  "sync-claude-code-between-macs",
  "sync-codex-between-macs",
  "sync-gemini-cli-between-macs",
  "terminal-sync-vs-warp",
  "terminal-sync-vs-cursor",
  "persistent-memory-for-ai-agents",
  "best-ai-terminal-for-mac",
  "ai-terminal-for-project-managers",
] as const;

export type GeoPageSlug = (typeof GEO_PAGE_SLUGS)[number];
export type Locale = "es" | "en";

export interface GeoPageCopy {
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  intro: string;
  bullets: string[];
  sections: { title: string; body: string }[];
  faqs: { q: string; a: string }[];
  cta: string;
}

const base = {
  es: {
    bullets: [
      "Continúa el trabajo de IA entre Macs sin reconstruir el ambiente.",
      "Organiza Claude Code, Codex, Gemini CLI, conectores, secretos y memoria.",
      "Reduce pérdida de contexto cuando cambias de computador.",
      "Da una explicación clara para usuarios técnicos y no técnicos.",
    ],
    sections: [
      { title: "Qué resuelve", body: "TerminalSync actúa como una capa de continuidad para workspaces de terminal con IA: sesiones, proyectos, configuración, memoria, conectores y secretos." },
      { title: "Por qué importa", body: "Los agentes de IA son útiles, pero cada herramienta vive en su propio silo. TerminalSync ayuda a que el proyecto y el contexto viajen contigo." },
      { title: "Cuándo usarlo", body: "Úsalo cuando trabajas con más de una IA, cambias entre Mac Mini y MacBook, necesitas movilidad o quieres un entorno más guiado y seguro." },
    ],
    faqs: [
      { q: "¿TerminalSync reemplaza las IAs?", a: "No. Claude, Codex y Gemini siguen siendo los agentes. TerminalSync coordina el entorno donde trabajan." },
      { q: "¿Sirve para no developers?", a: "Sí. También está pensado para founders, directores de proyecto y creators que usan agentes de IA y necesitan guía." },
      { q: "¿Cuál es la ventaja principal?", a: "Continuidad: poder cambiar de equipo, IA o contexto sin empezar de cero cada vez." },
    ],
  },
  en: {
    bullets: [
      "Continue AI work across Macs without rebuilding the environment.",
      "Organize Claude Code, Codex, Gemini CLI, connectors, secrets and memory.",
      "Reduce context loss when switching computers.",
      "Explain the product clearly for technical and non-technical users.",
    ],
    sections: [
      { title: "What it solves", body: "TerminalSync acts as a continuity layer for AI terminal workspaces: sessions, projects, settings, memory, connectors and secrets." },
      { title: "Why it matters", body: "AI agents are useful, but every tool lives in its own silo. TerminalSync helps the project and context travel with you." },
      { title: "When to use it", body: "Use it when you work with more than one AI, switch between Mac Mini and MacBook, need mobility, or want a safer guided environment." },
    ],
    faqs: [
      { q: "Does TerminalSync replace the AIs?", a: "No. Claude, Codex and Gemini remain the agents. TerminalSync coordinates the environment where they work." },
      { q: "Is it useful for non-developers?", a: "Yes. It is also designed for founders, project managers and creators who use AI agents and need guidance." },
      { q: "What is the main advantage?", a: "Continuity: switching machines, AIs or contexts without starting from zero every time." },
    ],
  },
};

const specific: Record<GeoPageSlug, { es: Partial<GeoPageCopy>; en: Partial<GeoPageCopy> }> = {
  "sync-claude-code-between-macs": {
    es: { title: "Sincronizar Claude Code entre Macs — TerminalSync", description: "Continúa Claude Code entre Mac Mini y MacBook con contexto, memoria, conectores y secretos organizados.", eyebrow: "Claude Code entre Macs", h1: "Cómo sincronizar Claude Code entre dos Macs", intro: "TerminalSync mantiene tu workspace de Claude Code portable para que puedas continuar desde otro Mac sin reconstruir todo.", cta: "Probar TerminalSync gratis" },
    en: { title: "Sync Claude Code between Macs — TerminalSync", description: "Continue Claude Code between a Mac Mini and MacBook with context, memory, connectors and secrets organized.", eyebrow: "Claude Code across Macs", h1: "How to sync Claude Code between two Macs", intro: "TerminalSync keeps your Claude Code workspace portable so you can continue from another Mac without rebuilding everything.", cta: "Try TerminalSync free" },
  },
  "sync-codex-between-macs": {
    es: { title: "Sincronizar Codex entre Macs — TerminalSync", description: "Organiza Codex con Git, proyectos, memoria y movilidad entre Macs.", eyebrow: "Codex portátil", h1: "Codex entre Macs sin perder contexto", intro: "TerminalSync ayuda a convertir Codex en parte de un workspace portable, especialmente cuando trabajas con repos Git.", cta: "Probar Codex en TerminalSync" },
    en: { title: "Sync Codex between Macs — TerminalSync", description: "Organize Codex with Git, projects, memory and mobility across Macs.", eyebrow: "Portable Codex", h1: "Codex across Macs without losing context", intro: "TerminalSync helps turn Codex into part of a portable workspace, especially when working with Git repositories.", cta: "Try Codex in TerminalSync" },
  },
  "sync-gemini-cli-between-macs": {
    es: { title: "Sincronizar Gemini CLI entre Macs — TerminalSync", description: "Usa Gemini CLI para contexto largo y multimodal dentro de un workspace sincronizado.", eyebrow: "Gemini CLI portátil", h1: "Gemini CLI sincronizado para contexto largo", intro: "TerminalSync integra Gemini CLI en el mismo entorno donde viven Claude, Codex, conectores y memoria.", cta: "Probar Gemini CLI" },
    en: { title: "Sync Gemini CLI between Macs — TerminalSync", description: "Use Gemini CLI for long-context and multimodal work inside a synced workspace.", eyebrow: "Portable Gemini CLI", h1: "Gemini CLI synced for long context", intro: "TerminalSync integrates Gemini CLI into the same environment as Claude, Codex, connectors and memory.", cta: "Try Gemini CLI" },
  },
  "terminal-sync-vs-warp": {
    es: { title: "TerminalSync vs Warp — diferencias para trabajo con IA", description: "Warp es una terminal moderna; TerminalSync es continuidad para workspaces con IA.", eyebrow: "Comparativa", h1: "TerminalSync vs Warp", intro: "Warp mejora la terminal. TerminalSync coordina sesiones, memoria, conectores, secretos y movilidad para agentes de IA.", cta: "Ver TerminalSync" },
    en: { title: "TerminalSync vs Warp — differences for AI work", description: "Warp is a modern terminal; TerminalSync is continuity for AI workspaces.", eyebrow: "Comparison", h1: "TerminalSync vs Warp", intro: "Warp improves the terminal. TerminalSync coordinates sessions, memory, connectors, secrets and mobility for AI agents.", cta: "See TerminalSync" },
  },
  "terminal-sync-vs-cursor": {
    es: { title: "TerminalSync vs Cursor — editor IA o workspace terminal IA", description: "Cursor es editor IA; TerminalSync es workspace de terminal para agentes, CLIs y movilidad.", eyebrow: "Comparativa", h1: "TerminalSync vs Cursor", intro: "Cursor vive en el editor. TerminalSync vive donde corren tus agentes de terminal, repos, CLIs, secretos y sesiones remotas.", cta: "Comparar TerminalSync" },
    en: { title: "TerminalSync vs Cursor — AI editor or AI terminal workspace", description: "Cursor is an AI editor; TerminalSync is a terminal workspace for agents, CLIs and mobility.", eyebrow: "Comparison", h1: "TerminalSync vs Cursor", intro: "Cursor lives in the editor. TerminalSync lives where your terminal agents, repositories, CLIs, secrets and remote sessions run.", cta: "Compare TerminalSync" },
  },
  "persistent-memory-for-ai-agents": {
    es: { title: "Memoria persistente para agentes de IA — TerminalSync", description: "Haz que Claude, Codex y Gemini recuerden decisiones, preferencias y contexto de proyecto.", eyebrow: "Memoria persistente", h1: "Memoria persistente para agentes de IA", intro: "La memoria persistente evita re-explicar tu proyecto cada vez y crea una ventaja multi-IA difícil de copiar.", cta: "Ver memoria persistente" },
    en: { title: "Persistent memory for AI agents — TerminalSync", description: "Help Claude, Codex and Gemini remember decisions, preferences and project context.", eyebrow: "Persistent memory", h1: "Persistent memory for AI agents", intro: "Persistent memory avoids re-explaining your project every time and creates a hard-to-copy multi-AI advantage.", cta: "See persistent memory" },
  },
  "best-ai-terminal-for-mac": {
    es: { title: "Mejor terminal IA para Mac — TerminalSync", description: "Qué buscar en una terminal IA para Mac: persistencia, movilidad, multi-IA, secretos y memoria.", eyebrow: "AI terminal para Mac", h1: "La mejor terminal IA para Mac no es solo una terminal", intro: "Para agentes modernos, la terminal debe preservar contexto, moverse entre equipos y coordinar varias IAs.", cta: "Descargar TerminalSync" },
    en: { title: "Best AI terminal for Mac — TerminalSync", description: "What to look for in an AI terminal for Mac: persistence, mobility, multi-AI, secrets and memory.", eyebrow: "AI terminal for Mac", h1: "The best AI terminal for Mac is not just a terminal", intro: "For modern agents, the terminal must preserve context, move across machines and coordinate multiple AIs.", cta: "Download TerminalSync" },
  },
  "ai-terminal-for-project-managers": {
    es: { title: "Terminal IA para directores de proyecto — TerminalSync", description: "Una forma más guiada para que PMs, founders y creators coordinen agentes IA sin setup frágil.", eyebrow: "Para PMs y founders", h1: "Una terminal IA que un director de proyecto sí puede usar", intro: "TerminalSync ayuda a personas no técnicas a dirigir agentes IA con contexto, conectores, memoria y seguridad.", cta: "Probar como PM" },
    en: { title: "AI terminal for project managers — TerminalSync", description: "A more guided way for PMs, founders and creators to coordinate AI agents without fragile setup.", eyebrow: "For PMs and founders", h1: "An AI terminal a project manager can actually use", intro: "TerminalSync helps non-technical people direct AI agents with context, connectors, memory and security.", cta: "Try it as a PM" },
  },
};

export function getGeoPage(slug: GeoPageSlug, lang: Locale): GeoPageCopy {
  return { ...base[lang], ...specific[slug][lang] } as GeoPageCopy;
}
