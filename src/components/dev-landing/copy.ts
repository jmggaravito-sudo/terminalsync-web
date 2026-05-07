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
  comparison: {
    eyebrow: string;
    title: string;
    subtitle: string;
    columns: {
      capability: string;
      terminalSync: string;
      claudeCode: string;
      codex: string;
      gemini: string;
      cursor: string;
    };
    rows: {
      sharedMemory: string;
      gitAware: string;
      envVault: string;
      semanticRecall: string;
      mcpInterop: string;
      offlineLocal: string;
      e2eEncryption: string;
      noLockIn: string;
      headlessCli: string;
      multiMachine: string;
    };
    legend: { yes: string; partial: string; soon: string; no: string };
    footnote: string;
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
    ctaSecondary: "Browse the Marketplace",
    trustLine: "macOS · Linux · Windows (waitlist) · Encrypted client-side, your keys",
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
  comparison: {
    eyebrow: "deep technical comparison",
    title: "What the other tools don't ship.",
    subtitle:
      "Most AI coding tools optimize for one model in one IDE. TerminalSync is the layer underneath — vendor-neutral, encrypted, and Git-aware.",
    columns: {
      capability: "Capability",
      terminalSync: "TerminalSync",
      claudeCode: "Claude Code",
      codex: "Codex CLI",
      gemini: "Gemini CLI",
      cursor: "Cursor",
    },
    rows: {
      sharedMemory: "Shared memory across Claude + Codex + Gemini",
      gitAware: "Git-aware memory snapshots (per branch)",
      envVault: ".env vault encrypted across machines",
      semanticRecall: "Semantic recall across past sessions",
      mcpInterop: "MCP-native, works with any MCP client",
      offlineLocal: "Offline-first, local SQLite store",
      e2eEncryption: "Client-side AES-256, keys in OS keychain",
      noLockIn: "Cancel anytime, keep your data",
      headlessCli: "Headless CLI / scriptable",
      multiMachine: "Multi-machine sync (Drive, your bucket)",
    },
    legend: { yes: "Ships today", partial: "Partial", soon: "Coming", no: "Not available" },
    footnote:
      "Comparison reflects shipped capabilities as of May 2026. Cursor IDE column included because it's the closest substitute for the persistence + memory story, even though it's a different surface (IDE vs. layer-underneath).",
  },
  codeExample: {
    eyebrow: "drop-in CLI",
    title: "Already using Claude Code or Codex? You're 30 seconds away.",
    body:
      "TerminalSync wraps your existing CLI. No new tool to learn — just persistence and sync layered on top.",
  },
  affiliates: {
    eyebrow: "earn while you build",
    title: "30% recurring. For life.",
    body:
      "If your audience codes, they need this. Refer once, get paid every month they stay subscribed.",
    items: [
      {
        kicker: "$19 / mo",
        body: "Pro plan — $5.70/mo per active referral, every month they stay.",
      },
      {
        kicker: "$39 / mo",
        body: "Dev plan — $11.70/mo per active referral, every month they stay.",
      },
      {
        kicker: "Stripe direct",
        body: "Payouts via Stripe Connect. KYC handled, NET-15. No invoicing hell.",
      },
    ],
    cta: "Apply for affiliate",
    note: "Lifetime cookie attribution — they sign up months later, you still get credit.",
  },
  faq: {
    title: "Dev FAQ",
    items: [
      {
        q: "Where does my encrypted data live?",
        a: "In your Google Drive — your account, your bucket. The desktop app reads and writes directly to Drive over your OAuth grant; we don't proxy or copy your memory. AES-256 keys live in your OS keychain, never on our servers. Revoke our app access in Drive at any time and the sync stops while your historical data stays where it is.",
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
    secondary: "Browse Stack Packs",
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
    ctaSecondary: "Ver el Marketplace",
    trustLine: "macOS · Linux · Windows (waitlist) · Cifrado en tu cliente, tus llaves",
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
  comparison: {
    eyebrow: "comparación técnica a fondo",
    title: "Lo que las otras herramientas no traen.",
    subtitle:
      "Las herramientas de IA optimizan un modelo en un IDE. TerminalSync es la capa de abajo — vendor-neutral, cifrada y Git-aware.",
    columns: {
      capability: "Capacidad",
      terminalSync: "TerminalSync",
      claudeCode: "Claude Code",
      codex: "Codex CLI",
      gemini: "Gemini CLI",
      cursor: "Cursor",
    },
    rows: {
      sharedMemory: "Memoria compartida entre Claude + Codex + Gemini",
      gitAware: "Snapshots de memoria Git-aware (por branch)",
      envVault: ".env vault cifrado entre máquinas",
      semanticRecall: "Recall semántico sobre sesiones pasadas",
      mcpInterop: "MCP-native, funciona con cualquier cliente MCP",
      offlineLocal: "Offline-first, store local en SQLite",
      e2eEncryption: "AES-256 en tu cliente, llaves en keychain del SO",
      noLockIn: "Cancelás cuando quieras, te quedás con tu data",
      headlessCli: "CLI headless / scriptable",
      multiMachine: "Sync multi-máquina (Drive, tu bucket)",
    },
    legend: { yes: "Hoy", partial: "Parcial", soon: "Pronto", no: "No disponible" },
    footnote:
      "Comparación al estado de mayo 2026. Incluimos Cursor IDE como columna porque es el substituto más cercano en persistencia + memoria, aunque es otra surface (IDE vs. capa de abajo).",
  },
  codeExample: {
    eyebrow: "CLI drop-in",
    title: "¿Ya usás Claude Code o Codex? Estás a 30 segundos.",
    body:
      "TerminalSync envuelve tu CLI actual. No es una herramienta nueva — es persistencia + sync encima de lo que ya usás.",
  },
  affiliates: {
    eyebrow: "ganá mientras construís",
    title: "30% recurrente. De por vida.",
    body:
      "Si tu audiencia escribe código, esto les hace falta. Referís una vez, cobrás cada mes que estén suscriptos.",
    items: [
      {
        kicker: "$19 / mes",
        body: "Plan Pro — $5.70/mes por referido activo, cada mes que sigan pagando.",
      },
      {
        kicker: "$39 / mes",
        body: "Plan Dev — $11.70/mes por referido activo, cada mes que sigan pagando.",
      },
      {
        kicker: "Stripe directo",
        body: "Payouts vía Stripe Connect. KYC resuelto, NET-15. Sin facturación tediosa.",
      },
    ],
    cta: "Postularme como afiliado",
    note: "Atribución lifetime — si se suscriben meses después, igual te lo paga.",
  },
  faq: {
    title: "FAQ para devs",
    items: [
      {
        q: "¿Dónde vive mi data cifrada?",
        a: "En tu Google Drive — tu cuenta, tu bucket. La app lee y escribe directo en Drive con tu OAuth; nosotros no proxyeamos ni copiamos tu memoria. Las llaves AES-256 viven en tu keychain del SO, nunca en nuestros servidores. Revocás permisos en Drive y la sincronización para — tu memoria histórica se queda donde está.",
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
    secondary: "Ver Stack Packs",
  },
};

export function getDevCopy(lang: Locale): DevCopy {
  return lang === "es" ? es : en;
}
