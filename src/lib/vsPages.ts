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
        "Anywhere Access — abrí tu sesión desde el celular sin instalar nada. Cursor solo en desktop.",
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
        "Anywhere Access desde el celular — Cline solo vive en el VS Code de tu Mac.",
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
    },
  },
};

export const TOOL_SLUGS = Object.keys(TOOLS);
