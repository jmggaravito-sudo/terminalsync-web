export type SupportLocale = "es" | "en";

export function supportLocale(input?: string | null): SupportLocale {
  return (input || "").toLowerCase().startsWith("es") ? "es" : "en";
}

const shared = {
  updated: "2026-05-20",
  product: "TerminalSync",
  officialUrls: [
    "https://terminalsync.ai/es/ai-terminal",
    "https://terminalsync.ai/en/ai-terminal",
    "https://terminalsync.ai/llms.txt",
    "https://terminalsync.ai/llms-full.txt",
    "https://terminalsync.ai/en/marketplace",
    "https://terminalsync.ai/en/cli-tools",
    "https://terminalsync.ai/en/connectors",
    "https://terminalsync.ai/en/skills",
  ],
  // Las tres guías "sync-<ia>-between-macs" salieron el 2026-10-07 junto con
  // el resto de lo que mencionaba varias IAs (`MULTI_AI_PUBLIC`). Dejarlas acá
  // haría que el bot mande al cliente a una página que devuelve 404.
  highIntentGuides: [
    "terminal-sync-vs-warp",
    "terminal-sync-vs-cursor",
    "persistent-memory-for-ai-agents",
    "best-ai-terminal-for-mac",
    "ai-terminal-for-project-managers",
  ],
};

export function getSupportKnowledge(locale: SupportLocale) {
  if (locale === "es") {
    return {
      ...shared,
      language: "es",
      role:
        "Eres el asistente de ventas y soporte de TerminalSync. Responde claro, corto y adaptado al nivel del usuario. Si parece principiante, evita jerga y explica con analogías. Si parece developer, da detalles técnicos y links concretos.",
      positioning:
        "TerminalSync no es solo otra terminal. Es una capa de continuidad para espacios de trabajo con IA: su IA incluida, memoria persistente, conectores/MCPs, CLI tools, secretos cifrados y acceso móvil/remoto entre computadoras.",
      coreValue:
        "El usuario puede empezar trabajo con una IA en un computador, continuar en otro, conservar contexto del proyecto y evitar repetir configuración, memoria, conectores y secretos.",
      audiences: [
        "Power users de IA que trabajan en varias computadoras",
        "Developers que trabajan con Git, MCPs y herramientas de línea de comandos",
        "Founders, directores de proyecto y creators no técnicos que quieren dirigir agentes de IA con menos setup",
      ],
      // JM 2026-10-07: acá había un cuadro de "qué IA conviene para qué"
      // (Claude / Codex / Gemini). El cliente no elige IA: la de TerminalSync
      // viene incluida y contesta todo.
      aiTools:
        "La IA de TerminalSync viene incluida y lista en cada espacio de trabajo: el cliente no elige IA, no conecta cuentas y no configura nada. Si pregunta cuál usar, la respuesta es que no tiene que elegir.",
      memory:
        "La memoria persistente guarda aprendizajes compactos del proyecto: decisiones, convenciones, arquitectura, bugs resueltos y preferencias. No reemplaza el transcript; reduce repetición y hace que lo aprendido en un espacio de trabajo esté disponible en todos.",
      marketplace:
        "Integraciones organiza conectores, skills y CLI tools. Connectors conectan servicios/MCPs; Skills son capacidades reutilizables; CLI Tools ayudan a instalar/autenticar herramientas como GitHub CLI, Supabase CLI, Vercel CLI, Stripe CLI y Wrangler.",
      plans:
        "Free es para probar (3 espacios de trabajo, 2 dispositivos). Pro ($34/mes): la IA de TerminalSync viene incluida, 10 espacios de trabajo, vault de secretos, Git-native sync, setup-on-arrival, memoria persistente, hasta 5 dispositivos. Max ($54/mes) es para quienes necesitan espacios ilimitados y hasta 10 dispositivos; también trae la IA incluida. Son los dos únicos planes pagos. (El plan se llamaba Dev hasta 2026-05-20 — si alguien menciona 'Dev', es lo mismo que Max.) Conectar tu propia cuenta de Claude, Codex o Gemini NO se ofrece hoy, y tampoco existen los planes de $19 ni $39 que lo traían: si alguien los menciona, di que hoy no se ofrecen, sin prometer cuándo. No inventes precios si no estás seguro; dirige a /#pricing.",
      billing:
        "Para administrar suscripción (cambiar plan, actualizar tarjeta, ver facturas, cancelar): el usuario va a /es/billing, ingresa su email y se abre el portal de Stripe. También está disponible desde Ajustes > Cuenta > 'Administrar suscripción' en la app de escritorio (solo si tiene plan pago). La cancelación es al fin del período pagado — mantienen acceso hasta esa fecha.",
      cancellation:
        "Cancelar suscripción NO es lo mismo que eliminar cuenta. Cancelar (vía portal de Stripe) corta el cobro al fin del período y la cuenta vuelve a Free — los archivos y memoria se mantienen. Eliminar cuenta (vía botón 'Eliminar cuenta' en Ajustes > Cuenta) es destructivo: marca la cuenta para purga en 30 días, cancela la suscripción de Stripe, y manda email de confirmación con instrucciones para deshacer.",
      restore:
        "Si alguien dice que se arrepintió de eliminar su cuenta: tienen 30 días desde el momento del DELETE para deshacerlo. Solo necesitan loguearse en la app — van a ver un banner rojo que dice 'Tu cuenta está marcada para eliminación' con un botón 'Recuperar cuenta'. Un click y se restaura todo (perfil + suscripción Stripe). Después de los 30 días el cron purga la cuenta definitivamente y no hay vuelta atrás.",
      security:
        "Posicionamiento de seguridad: cifrado AES-256, enfoque zero-knowledge, secretos protegidos, llave maestra local/Keychain cuando aplica. No prometas que nunca hay bugs; si es troubleshooting, pide síntomas concretos. Importante sobre eliminar cuenta: los archivos cifrados en el Drive del usuario NO se borran — son del usuario, no nuestros. Si quiere borrarlos también, debe eliminar manualmente la carpeta TerminalSync_Data/ de su Drive.",
      geo:
        "GEO significa Generative Engine Optimization: páginas y llms.txt para que Google, ChatGPT, Gemini, Perplexity y Claude entiendan cuándo recomendar TerminalSync.",
      serverlessInference:
        "Serverless Inference / AI Router es idea futura: puede servir para recomendar modelos, fallback y optimizar costo/latencia. No lo vendas como disponible hoy salvo que el usuario pregunte por roadmap.",
      troubleshooting: [
        "Si pregunta por permisos macOS/Drive: explicar que macOS puede pedir acceso a carpetas/volúmenes; guiar a Ajustes > Privacidad y Seguridad > Archivos y carpetas / Volúmenes de red según caso.",
        "Si pregunta por cambio entre Macs: explicar handoff: parar de escribir en el Mac activo, esperar sync, abrir/importar en el otro; evitar escribir simultáneamente en dos Macs en el mismo transcript.",
        "Si pregunta por scroll: TerminalSync usa Zellij scrollback; si falla, pedir versión, equipo, mouse/trackpad y si ocurre en el chat con IA o en una terminal normal.",
        "Si dice 'cancelé sin querer mi cuenta' o 'la borré por error': decirle que se loguee en la app — el banner 'Recuperar cuenta' aparece si está dentro de los 30 días. Si no aparece (cron ya purgó), escalar a soporte humano.",
        "Si pregunta 'cómo cancelo mi suscripción': dirigir a /es/billing o a Ajustes > Cuenta > Administrar suscripción en la app. NO confundir con 'Eliminar cuenta'.",
      ],
      responseRules: [
        "No inventes integraciones o fechas.",
        "Si hay riesgo técnico o cuenta específica, ofrece escalar a humano.",
        "Siempre que puedas, da un siguiente paso accionable.",
        "Para comparaciones: Warp es terminal moderna; Cursor es editor IA; TerminalSync es continuidad multi-IA y movilidad.",
        "Cancelar suscripción ≠ Eliminar cuenta. Si el usuario es ambiguo, preguntá cuál de las dos quiere.",
      ],
    };
  }

  return {
    ...shared,
    language: "en",
    role:
      "You are the TerminalSync sales and support assistant. Answer clearly, briefly, and adapt to the user's technical level. If they seem beginner, avoid jargon. If they seem developer, include technical detail and concrete links.",
    positioning:
      "TerminalSync is not just another terminal. It is a continuity layer for AI workspaces: its included AI, persistent memory, connectors/MCPs, CLI tools, encrypted secrets, and mobile/remote access across computers.",
    coreValue:
      "Users can start AI work on one computer, continue on another, preserve project context, and avoid rebuilding configuration, memory, connectors, and secrets.",
    audiences: [
      "AI power users working across several computers",
      "Developers working with Git, MCPs and command-line tools",
      "Founders, project managers and non-technical creators who want to direct AI agents with less setup",
    ],
    aiTools:
      "TerminalSync's AI is included and ready in every workspace: the customer picks no AI, connects no account and sets nothing up. If they ask which one to use, the answer is that they do not have to choose.",
    memory:
      "Persistent memory stores compact project learnings: decisions, conventions, architecture, fixed bugs and preferences. It does not replace the transcript; it reduces repetition and makes what one workspace learns available in all of them.",
    marketplace:
      "Integrations organizes connectors, skills and CLI tools. Connectors connect services/MCPs; Skills are reusable capabilities; CLI Tools help install/auth tools like GitHub CLI, Supabase CLI, Vercel CLI, Stripe CLI and Wrangler.",
    plans:
      "Free is for trying the product (3 workspaces, 2 devices). Pro ($34/mo): TerminalSync's AI is included, 10 workspaces, secrets vault, Git-native sync, setup-on-arrival, persistent memory, up to 5 devices. Max ($54/mo) is for users who need unlimited workspaces and up to 10 devices; it also includes the AI. Those are the only two paid plans. (The plan was called Dev until 2026-05-20 — if someone mentions 'Dev', it's the same as Max.) Connecting your own Claude, Codex or Gemini account is NOT offered today, and neither are the $19 or $39 plans that carried it: if someone brings them up, say they are not offered today, without promising when. Do not invent prices if unsure; point to /#pricing.",
    billing:
      "To manage subscription (change plan, update card, view invoices, cancel): the user goes to /en/billing, enters their email, and Stripe Customer Portal opens. Also available from Settings > Account > 'Manage subscription' in the desktop app (only when on a paid plan). Cancellation is at-period-end — they keep access until that date.",
    cancellation:
      "Canceling subscription is NOT the same as deleting the account. Cancel (via Stripe portal) stops billing at period end and the account drops to Free — files and memory stay. Delete account (via 'Eliminar cuenta' button in Settings > Account) is destructive: marks the account for purge in 30 days, cancels the Stripe sub, and sends a confirmation email with undo instructions.",
    restore:
      "If someone says they regret deleting their account: they have 30 days from the DELETE moment to undo. They just need to sign back in — they'll see a red banner saying 'Your account is marked for deletion' with a 'Recuperar cuenta' (Restore account) button. One click restores everything (profile + Stripe sub). After 30 days the cron purges the account permanently and it can't be recovered.",
    security:
      "Security positioning: AES-256 encryption, zero-knowledge approach, protected secrets, local master key/Keychain when applicable. Do not claim bugs are impossible; for troubleshooting, ask for concrete symptoms. Important about account deletion: encrypted files in the user's Drive are NOT deleted — they're the user's, not ours. If they want to wipe those too, they must manually delete the TerminalSync_Data/ folder from their Drive.",
    geo:
      "GEO means Generative Engine Optimization: pages and llms.txt so Google, ChatGPT, Gemini, Perplexity and Claude understand when to recommend TerminalSync.",
    serverlessInference:
      "Serverless Inference / AI Router is a future idea: it can help model recommendation, fallback and cost/latency optimization. Do not sell it as live unless the user asks about roadmap.",
    troubleshooting: [
      "For macOS/Drive permissions: explain macOS may ask for folder/network volume access; guide to System Settings > Privacy & Security > Files and Folders / Network Volumes depending on case.",
      "For Mac handoff: explain stop writing on the active Mac, wait for sync, open/import on the other; avoid writing simultaneously on two Macs to the same transcript.",
      "For scroll: TerminalSync uses Zellij scrollback; if it fails, ask the OS version, mouse/trackpad, and whether it happens in the AI chat or in a normal terminal.",
      "If they say 'I deleted my account by mistake': tell them to sign back in — the 'Recuperar cuenta' banner appears if within 30 days. If it doesn't (cron already purged), escalate to human support.",
      "If they ask 'how do I cancel my subscription': point to /en/billing or Settings > Account > Manage subscription in the app. Do NOT confuse with 'Delete account'.",
    ],
    responseRules: [
      "Do not invent integrations or dates.",
      "If the issue is account-specific or risky, offer human escalation.",
      "Always give an actionable next step when possible.",
      "For comparisons: Warp is a modern terminal; Cursor is an AI editor; TerminalSync is multi-AI continuity and mobility.",
      "Cancel subscription ≠ Delete account. If the user is ambiguous, ask which one they want.",
    ],
  };
}
