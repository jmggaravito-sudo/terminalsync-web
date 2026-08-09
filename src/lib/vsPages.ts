/**
 * Data for the /[lang]/vs/<tool> SEO comparison pages. One entry per
 * competing AI dev tool. Each entry produces a static page that:
 *
 *   - Has a title + meta crafted for the keyword "<tool> vs TerminalSync"
 *   - Renders an honest comparison table (subset of the main /es/#comparison)
 *   - Acknowledges the tool's strengths (good faith — search visitors
 *     respect honesty, not slander)
 *   - Pivots to TS's three pillars (persistencia / anywhere / privacidad)
 *   - Has a primary "Descargar" CTA and a secondary "Ver pricing"
 *
 * Why this pattern: long-tail SEO. Devs hunting "Cursor vs <X>",
 * "Cline alternative", "Aider self-hosted" land here, get a clear
 * differentiator, and convert. Two of the three (Cursor, Cline) are
 * IDE/CLI tools that overlap with our space; Aider is a CLI-only tool
 * directly in our category. Adding more (Continue, Roo) is a matter of
 * appending to TOOLS.
 */

export interface VsTool {
  /** URL slug under /[lang]/vs/<slug> */
  slug: string;
  /** Display name as it appears on competitor's site */
  name: string;
  /** One-line label of what the tool actually is */
  category: { es: string; en: string };
  /** Bulleted list of legitimate strengths — be fair */
  strengths: { es: string[]; en: string[] };
  /** Why TS wins for the user once they need persistencia + anywhere
   *  + privacy */
  whyTS: { es: string[]; en: string[] };
  /** Cell values for the side-by-side table — same row keys as the
   *  main comparison's plain-language labels */
  cells: Record<string, "yes" | "no" | "partial" | "soon">;
}

export const TOOLS: Record<string, VsTool> = {
  cursor: {
    slug: "cursor",
    name: "Cursor",
    category: {
      es: "IDE con agente IA integrado",
      en: "IDE with built-in AI agent",
    },
    strengths: {
      es: [
        "Excelente UX para edición con IA dentro de un IDE moderno (fork de VS Code).",
        "Tab autocompletion con contexto del proyecto entero — el modelo ve mucho más que solo la línea actual.",
        "Sync de configuración via Cursor Cloud (settings, prompts, atajos).",
      ],
      en: [
        "Excellent UX for AI-driven editing in a modern IDE (VS Code fork).",
        "Project-wide context for tab autocompletion — the model sees more than the current line.",
        "Configuration sync via Cursor Cloud (settings, prompts, keymaps).",
      ],
    },
    whyTS: {
      es: [
        "Tu agente sigue corriendo aunque cierres Cursor o se caiga internet — Cursor depende de su nube para la inferencia.",
        "Cifrado AES-256 zero-knowledge antes de salir de tu Mac. Cursor sube tu código a sus servidores para que el modelo lo procese.",
        "Tu sesión en cualquier dispositivo — abrila desde el celular sin instalar nada. Cursor solo en desktop.",
        "Notificaciones cuando el agente se queda esperando. Con Cursor te toca mirar la pantalla.",
      ],
      en: [
        "Your agent keeps running even if you close Cursor or the internet drops — Cursor depends on its cloud for inference.",
        "AES-256 zero-knowledge encryption before it leaves your Mac. Cursor uploads your code to its servers for the model to process.",
        "Anywhere Access — open your session from your phone with zero install. Cursor is desktop only.",
        "Notifications when the agent gets stuck waiting. With Cursor you stare at the screen.",
      ],
    },
    cells: {
      resurrection: "no",
      uninterruptedWork: "no",
      anywhereAccess: "no",
      aes256: "no",
      secretsVault: "no",
      multiCloudSync: "no",
      stuckNotifications: "no",
      noVendorLockIn: "no",
      parallelWindows: "partial",
      aiCouncil: "no",
    },
  },
  cline: {
    slug: "cline",
    name: "Cline",
    category: {
      es: "Extensión open-source de VS Code para agentes IA",
      en: "Open-source VS Code extension for AI agents",
    },
    strengths: {
      es: [
        "Open source — auditable y self-hosted si querés.",
        "Bring your own API key (Anthropic, OpenAI, Ollama, etc) — sin lock-in al modelo.",
        "Buen soporte para reasoning models y plan/act mode.",
      ],
      en: [
        "Open source — auditable and self-hostable if you want.",
        "Bring your own API key (Anthropic, OpenAI, Ollama, etc) — no model lock-in.",
        "Good support for reasoning models and plan/act mode.",
      ],
    },
    whyTS: {
      es: [
        "Persistencia real: tu sesión sigue corriendo aunque cierres VS Code o reinicies macOS. Cline se reinicia con cada apertura.",
        "Vault de secretos integrado — tus API keys cifradas con AES-256, no en archivos planos en el repo.",
        "Sync entre dispositivos: Cline no roamea su estado. TerminalSync mueve tu Cline (y tu Claude, y tu Codex) a cualquier Mac.",
        "Tu sesión en cualquier dispositivo desde el celular — Cline solo vive en el VS Code de tu Mac.",
      ],
      en: [
        "Real persistence: your session keeps running even if you close VS Code or restart macOS. Cline restarts on every open.",
        "Built-in secrets vault — your API keys encrypted with AES-256, not in plain files in the repo.",
        "Cross-device sync: Cline doesn't roam its state. TerminalSync moves your Cline (and Claude, and Codex) to any Mac.",
        "Anywhere Access from your phone — Cline only lives in your Mac's VS Code.",
      ],
    },
    cells: {
      resurrection: "no",
      uninterruptedWork: "partial",
      anywhereAccess: "no",
      aes256: "no",
      secretsVault: "no",
      multiCloudSync: "no",
      stuckNotifications: "no",
      noVendorLockIn: "yes",
      parallelWindows: "no",
      aiCouncil: "no",
    },
  },
  aider: {
    slug: "aider",
    name: "Aider",
    category: {
      es: "Agente IA en línea de comandos para editar código",
      en: "Command-line AI agent for editing code",
    },
    strengths: {
      es: [
        "100% terminal — sin extensión, sin IDE específico.",
        "Open source y bien mantenido. Comunidad activa.",
        "Soporte para git nativo: cada cambio se commitea automáticamente con mensaje del modelo.",
      ],
      en: [
        "100% terminal — no extension, no specific IDE required.",
        "Open source and well-maintained. Active community.",
        "Native git support: each change is auto-committed with a model-written message.",
      ],
    },
    whyTS: {
      es: [
        "Persistencia: cerrás la terminal y aider se muere. TerminalSync mantiene tu sesión + el contexto + el historial vivos.",
        "Tu API key de OpenAI/Anthropic en el llavero del sistema, no en variables de entorno expuestas.",
        "Tu archivo `.aider.conf.yml`, tu prompt history y tus modelos preferidos roamean cifrados entre Macs.",
        "Notificaciones cuando aider se queda esperando confirmación — no más vigilar la pantalla.",
      ],
      en: [
        "Persistence: close the terminal and aider dies. TerminalSync keeps your session + context + history alive.",
        "Your OpenAI/Anthropic API key in the OS keychain, not in exposed env vars.",
        "Your `.aider.conf.yml`, prompt history, and preferred models roam encrypted between Macs.",
        "Notifications when aider waits on confirmation — no more screen-watching.",
      ],
    },
    cells: {
      resurrection: "no",
      uninterruptedWork: "partial",
      anywhereAccess: "no",
      aes256: "no",
      secretsVault: "no",
      multiCloudSync: "no",
      stuckNotifications: "no",
      noVendorLockIn: "yes",
      parallelWindows: "no",
      aiCouncil: "no",
    },
  },
  chatgpt: {
    slug: "chatgpt",
    name: "ChatGPT",
    category: {
      es: "Asistente de chat con IA (web y móvil)",
      en: "AI chat assistant (web and mobile)",
    },
    strengths: {
      es: [
        "El modelo de propósito general más conocido, con un ecosistema enorme (GPTs, voz, imágenes).",
        "Apps móviles y web muy pulidas — lo abrís desde cualquier lado.",
        "Imbatible para preguntar, explorar ideas y redactar en lenguaje natural.",
      ],
      en: [
        "The best-known general-purpose model, with a huge ecosystem (GPTs, voice, images).",
        "Very polished mobile and web apps — open it from anywhere.",
        "Unbeatable for asking, exploring ideas, and drafting in natural language.",
      ],
    },
    whyTS: {
      es: [
        "Corre TU Claude, Codex o Gemini sobre TUS archivos locales — ChatGPT es cloud y solo trabaja sobre lo que le pegás.",
        "Tu data queda local y cifrada AES-256 antes de salir de tu Mac — ChatGPT procesa todo en los servidores de OpenAI.",
        "Las 3 IAs en una sola app y con tu propia cuenta (BYOK) — ChatGPT te ata a OpenAI.",
        "Tu sesión de trabajo (archivos + contexto) te sigue a cualquier equipo — ChatGPT sincroniza el historial de chat, no tu entorno de trabajo.",
      ],
      en: [
        "Runs YOUR Claude, Codex, or Gemini on YOUR local files — ChatGPT is cloud and only works on what you paste in.",
        "Your data stays local and AES-256 encrypted before it leaves your Mac — ChatGPT processes everything on OpenAI's servers.",
        "All three AIs in one app, with your own account (BYOK) — ChatGPT locks you to OpenAI.",
        "Your working session (files + context) follows you to any device — ChatGPT syncs chat history, not your working environment.",
      ],
    },
    cells: {
      resurrection: "no",
      uninterruptedWork: "no",
      anywhereAccess: "yes",
      aes256: "no",
      secretsVault: "no",
      multiCloudSync: "no",
      stuckNotifications: "no",
      noVendorLockIn: "no",
      parallelWindows: "no",
      aiCouncil: "no",
    },
  },
  copilot: {
    slug: "copilot",
    name: "Microsoft Copilot",
    category: {
      es: "IA integrada en Microsoft 365",
      en: "AI built into Microsoft 365",
    },
    strengths: {
      es: [
        "Integrado en Word, Excel, Outlook y Teams — donde ya trabajás.",
        "Grado empresarial, con los controles de IT y cumplimiento de Microsoft.",
        "Fuerte si tu negocio ya vive en el ecosistema Microsoft.",
      ],
      en: [
        "Built into Word, Excel, Outlook, and Teams — right where you already work.",
        "Enterprise-grade, with Microsoft's IT and compliance controls.",
        "Strong if your business already lives in the Microsoft ecosystem.",
      ],
    },
    whyTS: {
      es: [
        "Corre tu IA sobre tus archivos locales, no solo dentro de Office — no te ata a Microsoft 365.",
        "Las 3 IAs (Claude, Codex, Gemini) en una, con tu cuenta — Copilot es el modelo de Microsoft y nada más.",
        "Tu data queda local y cifrada antes de salir de tu Mac — Copilot procesa en la nube de Microsoft.",
        "Sin vendor lock-in: te llevás tu setup y tu sesión a cualquier lado.",
      ],
      en: [
        "Runs your AI on your local files, not just inside Office — it doesn't lock you to Microsoft 365.",
        "All three AIs (Claude, Codex, Gemini) in one, with your account — Copilot is Microsoft's model and nothing else.",
        "Your data stays local and encrypted before it leaves your Mac — Copilot processes in Microsoft's cloud.",
        "No vendor lock-in: take your setup and your session anywhere.",
      ],
    },
    cells: {
      resurrection: "no",
      uninterruptedWork: "no",
      anywhereAccess: "yes",
      aes256: "no",
      secretsVault: "no",
      multiCloudSync: "no",
      stuckNotifications: "no",
      noVendorLockIn: "no",
      parallelWindows: "no",
      aiCouncil: "no",
    },
  },
  gemini: {
    slug: "gemini",
    name: "Google Gemini",
    category: {
      es: "IA de Google (Workspace y app)",
      en: "Google's AI (Workspace and app)",
    },
    strengths: {
      es: [
        "Modelo multimodal fuerte, con un free tier generoso.",
        "Integrado en Gmail, Docs y Sheets — cómodo si usás Google Workspace.",
        "Muy bueno para búsqueda y tareas con contexto de Google.",
      ],
      en: [
        "Strong multimodal model, with a generous free tier.",
        "Built into Gmail, Docs, and Sheets — handy if you use Google Workspace.",
        "Great for search and tasks with Google context.",
      ],
    },
    whyTS: {
      es: [
        "TerminalSync también corre Gemini — pero local, sobre tus archivos, y junto a Claude y Codex en la misma app.",
        "Tu data queda local y cifrada — Gemini procesa todo en los servidores de Google.",
        "No te ata a Google: elegís la IA por tarea y traés tu propia cuenta.",
        "Tu sesión de trabajo te sigue a cualquier equipo, con aviso cuando la IA te necesita.",
      ],
      en: [
        "TerminalSync runs Gemini too — but local, on your files, and alongside Claude and Codex in the same app.",
        "Your data stays local and encrypted — Gemini processes everything on Google's servers.",
        "It doesn't lock you to Google: pick the AI per task and bring your own account.",
        "Your working session follows you to any device, with a ping when the AI needs you.",
      ],
    },
    cells: {
      resurrection: "no",
      uninterruptedWork: "no",
      anywhereAccess: "yes",
      aes256: "no",
      secretsVault: "no",
      multiCloudSync: "no",
      stuckNotifications: "no",
      noVendorLockIn: "no",
      parallelWindows: "no",
      aiCouncil: "no",
    },
  },
  "notion-ai": {
    slug: "notion-ai",
    name: "Notion AI",
    category: {
      es: "IA dentro de Notion",
      en: "AI inside Notion",
    },
    strengths: {
      es: [
        "Excelente para escribir y organizar dentro de Notion, con el contexto de tu workspace.",
        "Simple y bien integrado — cero setup si ya usás Notion.",
        "Ideal para notas, documentos y bases de conocimiento.",
      ],
      en: [
        "Excellent for writing and organizing inside Notion, with your workspace context.",
        "Simple and well-integrated — zero setup if you already use Notion.",
        "Great for notes, documents, and knowledge bases.",
      ],
    },
    whyTS: {
      es: [
        "Corre tu IA sobre tus archivos locales, no solo dentro de Notion — de hecho, TerminalSync tiene un Plugin de Notion para usar los dos juntos.",
        "Las 3 IAs en una, con tu propia cuenta — Notion AI usa su propio modelo y nada más.",
        "Tu data queda local y cifrada — Notion AI procesa en los servidores de Notion.",
        "Tu sesión y tu setup roamean cifrados entre equipos, sin lock-in a Notion.",
      ],
      en: [
        "Runs your AI on your local files, not just inside Notion — in fact, TerminalSync has a Notion Plugin to use both together.",
        "All three AIs in one, with your own account — Notion AI uses its own model and nothing else.",
        "Your data stays local and encrypted — Notion AI processes on Notion's servers.",
        "Your session and setup roam encrypted across devices, with no lock-in to Notion.",
      ],
    },
    cells: {
      resurrection: "no",
      uninterruptedWork: "no",
      anywhereAccess: "yes",
      aes256: "no",
      secretsVault: "no",
      multiCloudSync: "no",
      stuckNotifications: "no",
      noVendorLockIn: "no",
      parallelWindows: "no",
      aiCouncil: "no",
    },
  },
};

export const TOOL_SLUGS = Object.keys(TOOLS);
