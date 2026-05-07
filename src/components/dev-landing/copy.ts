/**
 * Copy bundle for /[lang]/for-developers.
 *
 * Kept inline here (not in src/content/{es,en}.ts) because the dev
 * landing has a tighter, more code-forward voice than the rest of
 * the site. Mixing it into the main dicts would force the same
 * copy review pass to deal with two very different audiences. When
 * a string here grows up enough to deserve a real translation
 * audit, we promote it to src/content.
 */

import type { Locale } from "@/content";

export interface DevCopy {
  meta: { title: string; description: string };
  hero: {
    eyebrow: string;
    title: string;
    titleHighlight: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    trustLine: string;
  };
  features: {
    eyebrow: string;
    title: string;
    items: { title: string; body: string }[];
  };
  codeExample: {
    eyebrow: string;
    title: string;
    body: string;
  };
  affiliates: {
    eyebrow: string;
    title: string;
    body: string;
    items: { kicker: string; body: string }[];
    cta: string;
    note: string;
  };
  faq: {
    title: string;
    items: { q: string; a: string }[];
  };
  cta: {
    title: string;
    body: string;
    primary: string;
    secondary: string;
  };
}

const en: DevCopy = {
  meta: {
    title: "TerminalSync for Developers — Shared memory for Claude, Codex, Gemini",
    description:
      "The only shared memory across Claude, Codex, and Gemini. Encrypted AES-256, runs on any machine. Built for solo founders and dev teams.",
  },
  hero: {
    eyebrow: "Claude · Codex · Gemini",
    title: "The only shared memory across ",
    titleHighlight: "Claude, Codex and Gemini.",
    subtitle:
      "Sync your three agents on the same project, on any machine, with AES-256 encryption that not even we can open.",
    ctaPrimary: "Try free · 7 days Pro",
    ctaSecondary: "View on GitHub",
    trustLine: "macOS · Linux · Windows (waitlist) · Open core, MIT-licensed CLI",
  },
  features: {
    eyebrow: "what you actually get",
    title: "Three things no other AI tool ships out of the box.",
    items: [
      {
        title: "Git-Native Sync",
        body:
          "Memory snapshots commit alongside your repo. Switch branches, your AI follows. Roll back a refactor, your AI's mental model rolls back too. No more 'wait, why is Claude still suggesting the old API shape?'",
      },
      {
        title: ".env Vault",
        body:
          "AES-256 encrypted env vars synced across your machines. Your AI sees them, the cloud doesn't. Pulls from Drive (your account, your keys) — we never touch your secrets.",
      },
      {
        title: "Encrypted Memory Engine",
        body:
          "Local SQLite + libsql with semantic search across every Claude/Codex/Gemini session you've ever run. Recall by intent, not just keyword. Zero-knowledge encryption — keys live in your OS keychain.",
      },
    ],
  },
  codeExample: {
    eyebrow: "drop-in CLI",
    title: "Already using Claude Code or Codex? You're 30 seconds away.",
    body:
      "TerminalSync wraps your existing CLI. No new tool to learn — just persistence and sync layered on top.",
  },
  affiliates: {
    eyebrow: "earn while you build",
    title: "40% recurring. Forever.",
    body:
      "If your audience codes, they need this. Refer once, get paid every month they stay subscribed.",
    items: [
      {
        kicker: "$19 / mo",
        body: "Pro plan — average $7.60/mo per active referral, every month.",
      },
      {
        kicker: "$39 / mo",
        body: "Dev plan — average $15.60/mo per active referral, every month.",
      },
      {
        kicker: "Stripe direct",
        body: "Payouts via Stripe Connect. KYC handled, NET-15. No invoicing hell.",
      },
    ],
    cta: "Apply for affiliate",
    note: "First 50 affiliates get 50% recurring + lifetime cookie attribution.",
  },
  faq: {
    title: "Dev FAQ",
    items: [
      {
        q: "Is the CLI open source?",
        a: "Yes — the CLI is MIT-licensed on GitHub. The desktop app, sync engine, and managed Drive layer are closed source (that's where the 'paid' part lives). You can run the CLI standalone against your own Drive without ever touching our servers.",
      },
      {
        q: "How is this different from a chat history export?",
        a: "Chat history is a transcript. TerminalSync indexes intent, code edits, file paths, and decisions across sessions, then surfaces them semantically when relevant. Your AI doesn't 'read' your old chats — it remembers them.",
      },
      {
        q: "Does it work with my self-hosted LLM?",
        a: "Yes — anything that supports the MCP protocol. We officially test against Claude (Anthropic), Codex (OpenAI), Gemini (Google), and any local model running through MCP-compatible clients (Cursor, Cline, Continue).",
      },
      {
        q: "What happens to my data if I cancel?",
        a: "Your encrypted memory stays in your Drive — you own the bucket. Cancel and the app drops to Free tier (2 devices, 1 active terminal); your historical memory is still local + encrypted. Export everything as JSON anytime.",
      },
      {
        q: "Why pay for Dev tier specifically?",
        a: "Dev unlocks Git-native sync (commits memory alongside your repo), the .env vault, 20 active terminals, and pre-built MCP connectors for GitHub, Postgres, Supabase, and Slack. If you're shipping prod code with AI assistance, Dev pays for itself the first time it saves you from re-explaining your stack.",
      },
    ],
  },
  cta: {
    title: "Stop re-explaining your codebase. Ship.",
    body: "Free tier covers 2 devices and forever-persistent memory. No card required.",
    primary: "Download free",
    secondary: "Read the docs",
  },
};

const es: DevCopy = {
  meta: {
    title: "TerminalSync para Devs — Memoria compartida entre Claude, Codex y Gemini",
    description:
      "La única memoria compartida entre Claude, Codex y Gemini. Cifrada AES-256, en cualquier máquina. Para founders y equipos dev.",
  },
  hero: {
    eyebrow: "Claude · Codex · Gemini",
    title: "La única memoria compartida entre ",
    titleHighlight: "Claude, Codex y Gemini.",
    subtitle:
      "Sincronizá tus tres agentes en el mismo proyecto, en cualquier máquina, con cifrado AES-256 que ni nosotros podemos abrir.",
    ctaPrimary: "Probalo gratis · 7 días Pro",
    ctaSecondary: "Ver en GitHub",
    trustLine: "macOS · Linux · Windows (waitlist) · Core abierto, CLI con licencia MIT",
  },
  features: {
    eyebrow: "lo que realmente recibís",
    title: "Tres cosas que ninguna otra herramienta de IA trae de fábrica.",
    items: [
      {
        title: "Git-Native Sync",
        body:
          "Snapshots de memoria que se commitean al lado de tu repo. Cambiás de branch y tu IA te sigue. Revertís un refactor, su modelo mental también. Se acabó el 'pero por qué Claude me sigue sugiriendo la API vieja?'",
      },
      {
        title: ".env Vault",
        body:
          "Variables de entorno cifradas con AES-256, sincronizadas entre máquinas. Las ve tu IA, no la nube. Se cargan desde tu Drive (tu cuenta, tus llaves) — nosotros nunca tocamos tus secrets.",
      },
      {
        title: "Memory Engine cifrado",
        body:
          "SQLite + libsql local con búsqueda semántica sobre cada sesión Claude/Codex/Gemini. Recall por intención, no por keyword. Zero-knowledge: la llave vive en tu keychain del SO.",
      },
    ],
  },
  codeExample: {
    eyebrow: "CLI drop-in",
    title: "¿Ya usás Claude Code o Codex? Estás a 30 segundos.",
    body:
      "TerminalSync envuelve tu CLI actual. No es una herramienta nueva — es persistencia + sync encima de lo que ya usás.",
  },
  affiliates: {
    eyebrow: "ganá mientras construís",
    title: "40% recurrente. Para siempre.",
    body:
      "Si tu audiencia escribe código, esto les hace falta. Referís una vez, cobrás cada mes que estén suscriptos.",
    items: [
      {
        kicker: "$19 / mes",
        body: "Plan Pro — promedio $7.60/mes por referido activo, cada mes.",
      },
      {
        kicker: "$39 / mes",
        body: "Plan Dev — promedio $15.60/mes por referido activo, cada mes.",
      },
      {
        kicker: "Stripe directo",
        body: "Payouts vía Stripe Connect. KYC resuelto, NET-15. Sin facturación tediosa.",
      },
    ],
    cta: "Postularme como afiliado",
    note: "Los primeros 50 afiliados reciben 50% recurrente + atribución lifetime.",
  },
  faq: {
    title: "FAQ para devs",
    items: [
      {
        q: "¿El CLI es open source?",
        a: "Sí — el CLI es MIT en GitHub. El desktop app, el sync engine y la capa managed de Drive son closed source (ahí vive la parte paga). Podés correr el CLI standalone contra tu propio Drive sin tocar nuestros servidores.",
      },
      {
        q: "¿Esto en qué se diferencia de un export del historial?",
        a: "El historial es un transcript. TerminalSync indexa intención, ediciones, paths de archivos y decisiones a través de las sesiones, y las trae semánticamente cuando hace falta. Tu IA no 'lee' chats viejos — los recuerda.",
      },
      {
        q: "¿Funciona con mi LLM self-hosted?",
        a: "Sí — cualquiera que soporte el protocolo MCP. Testeamos oficialmente contra Claude (Anthropic), Codex (OpenAI), Gemini (Google) y cualquier modelo local corriendo en clientes MCP-compatibles (Cursor, Cline, Continue).",
      },
      {
        q: "¿Qué pasa con mi data si cancelo?",
        a: "Tu memoria cifrada sigue en tu Drive — vos sos el dueño del bucket. Si cancelás, la app cae a Free (2 dispositivos, 1 terminal activa); tu memoria histórica sigue local + cifrada. Exportás todo en JSON cuando quieras.",
      },
      {
        q: "¿Por qué pagar específicamente por el plan Dev?",
        a: "Dev habilita Git-native sync (commit de memoria al lado del repo), el .env vault, 20 terminales activas y connectors MCP pre-armados para GitHub, Postgres, Supabase y Slack. Si shippeás código a producción con IA, Dev se paga solo la primera vez que te evita re-explicar tu stack.",
      },
    ],
  },
  cta: {
    title: "Dejá de re-explicar tu codebase. Shippealo.",
    body: "El tier Free cubre 2 dispositivos y memoria persistente para siempre. Sin tarjeta.",
    primary: "Descargar gratis",
    secondary: "Leer los docs",
  },
};

export function getDevCopy(lang: Locale): DevCopy {
  return lang === "es" ? es : en;
}
