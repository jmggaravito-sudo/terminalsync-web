import type { Dict } from "./types";

const es: Dict = {
  locale: "es",
  meta: {
    title: "TerminalSync — Lleva tu Claude Code a cualquier parte",
    description:
      "Sincroniza tus terminales, archivos y el contexto de tu IA entre computadoras al instante. Instalación de Claude Code en 1 clic.",
    keywords:
      "sincronizar claude code, instalar claude code fácil, terminal sync ai, claude nube, claude en cualquier computadora",
  },
  nav: {
    features: "Funciones",
    demos: "Demos",
    pricing: "Precios",
    affiliates: "Afiliados",
    download: "Descargar",
    signIn: "Iniciar sesión",
  },
  hero: {
    eyebrow: "Tu stack AI · En tu nube · Entre tus Macs",
    titlePre: "Tu entorno de IA, ",
    titleHighlight: "realmente nómada",
    titlePost: ".",
    subtitle:
      "Claude, Codex, MCP, .env y carpetas locales — sincronizados entre tus Macs en tu propio Drive. Ni Anthropic ni OpenAI ven tus archivos. La única llave la tenés vos.",
    ctaPrimary: "Sincronizar mi stack — 7 días gratis",
    ctaSecondary: "Ver cómo funciona",
    trustLine: "Sin tarjeta · Setup en 2 minutos · Privacidad zero-knowledge · Cancelable cuando quieras",
    nextUp: {
      eyebrow: "Próximamente",
      body: "Sync automático de Cowork sessions (manual hoy) · Memoria Universal cross-vendor (Claude ↔ Codex) · Auto-reinstall de plugins en Mac fresca. Roadmap público en GitHub.",
    },
    mockup: {
      appName: "Terminal Sync",
      statusOk: "Todo está seguro y guardado",
      bannerTitle: "Instala Claude Code en segundos",
      bannerBody: "Configuramos todo por ti para que solo tengas que empezar a preguntar.",
      bannerCta: "Instalar Claude Code",
      session1: "Front-end Main Store",
      session2: "Auth-API Service",
      session3: "LangChain-Agent-Local",
      live: "EN VIVO",
    },
  },
  demos: {
    title: "Tres momentos en los que decís ‘wow’",
    subtitle:
      "Por qué los devs serios dejan su flujo viejo a los 30 segundos de probarlo.",
    items: {
      context: {
        kicker: "Demo · Continuidad",
        title: "Cerrás en tu Mac, abrís en la otra. Todo exactamente igual.",
        body: "Tu Claude, tu Codex, tu Cowork — todos te estaban esperando con tus configs, MCPs, sesiones y memorias intactas. Cero re-indexing, cero re-login.",
      },
      install: {
        kicker: "Demo · Setup en 2 minutos",
        title: "Un clic. Y todo tu stack AI queda listo.",
        body: "Claude Code instalado, MCPs configurados, .env desde tu Drive, sesiones de Cowork descargadas. Sin NPM, sin Node, sin leer documentación de nada.",
      },
      shield: {
        kicker: "Demo · El Escudo",
        title: "AES-256-GCM antes de salir de tu Mac.",
        body: "Ni Google, ni Anthropic, ni OpenAI, ni nosotros vemos tus archivos. Tu nube, tus llaves, vos sos el dueño total.",
      },
    },
  },
  benefits: {
    title: "Tu agente nunca se queda solo",
    subtitle:
      "Tres garantías que ningún terminal — ni los AI vendors — te dan: persistencia real, acceso desde cualquier lugar, y un sistema que te avisa antes de que tengas que preguntar.",
    items: {
      uninterrupted: {
        title: "Trabajo Ininterrumpido",
        body: "Tu trabajo está blindado: si el internet falla, tu agente (Claude/Codex) NO se detendrá. La terminal sigue trabajando en segundo plano y te notificamos apenas recupere la conexión o termine la tarea.",
      },
      anywhere: {
        title: 'Movilidad "Anywhere Access"',
        body: "Botón 'Móvil' arriba → genera un link HTTPS para abrir esta sesión exacta desde tu celular o cualquier navegador. Mismo estado, mismo contexto, sin reconfigurar nada.",
      },
      notifications: {
        title: "Notificaciones Automáticas",
        body: "Aviso por Email, WhatsApp o Telegram cuando tu tarea finalice o el agente requiera tu intervención. No volvés a quedarte mirando una pantalla esperando un Y/n.",
      },
    },
  },
  toolBreakdown: {
    eyebrow: "Cobertura por herramienta",
    title: "Esto es lo que viaja con vos",
    subtitle:
      "Lo que ya está funcionando hoy y lo que sigue en el roadmap público. Sin promesas vagas — todo trackeable en GitHub.",
    upcomingLabel: "Próximamente",
    tools: {
      claudeCode: {
        name: "Claude Code",
        tagline: "Tu agente IA con todo lo que configuraste",
        live: [
          "Servidores MCP (Notion, GitHub, etc) viajan con tu cuenta",
          "Tu configuración personal de Claude",
          "Memoria por proyecto (CLAUDE.md y conversaciones)",
          "Skills personalizados",
          "Plugins se reinstalan automáticamente en cualquier Mac",
        ],
        upcoming: [
          "Auto-resume de la conversación al reabrir",
        ],
      },
      cowork: {
        name: "Claude Cowork",
        tagline: "Tus sesiones de agente entre Macs",
        live: [
          "Sync automático bidireccional",
          "Sesiones disponibles en cualquier dispositivo",
        ],
        upcoming: [
          "Lock por sesión (aviso si está abierta en otra Mac)",
          "Backup automático antes de mergear",
        ],
      },
      codex: {
        name: "Codex",
        tagline: "Tu agente OpenAI listo en cualquier dispositivo",
        live: [
          "Tokens y autenticación cifrados",
          "Configuración completa de Codex",
          "Estado global de tus sesiones",
          "Skills y plugins reinstalados automáticamente",
          "AI picker — elegís Claude o Codex por terminal",
        ],
        upcoming: [
          "Auto-resume de la conversación al reabrir",
        ],
      },
    },
  },
  beforeAfter: {
    eyebrow: "El cambio real",
    title: "Cómo se siente cambiar de Mac",
    subtitle:
      "Antes: media mañana perdida. Después: dos minutos y seguís donde dejaste.",
    before: {
      heading: "Sin Terminal Sync",
      items: [
        "Buscás dónde quedaron tus archivos .env",
        "Reconfigurás MCP servers uno por uno",
        "Re-instalás plugins de Claude Code de memoria",
        "Tu Cowork no tiene historial — empezás de cero",
        "Te falta el setup.sh, las skills custom, los aliases",
        "30-60 minutos antes de poder trabajar",
      ],
    },
    after: {
      heading: "Con Terminal Sync",
      items: [
        "Instalás la app en la Mac nueva",
        "Login con tu cuenta",
        "Tus carpetas, MCPs, .env y configs aparecen cifrados desde tu Drive",
        "Cowork muestra tus sesiones del otro Mac",
        "Claude reconoce tu memoria de cada proyecto",
        "2 minutos y seguís donde dejaste",
      ],
    },
  },
  midCta: {
    eyebrow: "Probalo gratis",
    title: "Tu próximo cambio de Mac no debería costarte 2 horas.",
    body: "7 días de Pro sin tarjeta. Si te convence, $19/mes. Si no, dejás de usarlo y listo.",
    ctaPrimary: "Empezar prueba gratis",
    ctaSecondary: "Ver precios",
  },
  faq: {
    eyebrow: "Preguntas frecuentes",
    title: "Lo que la gente nos pregunta primero",
    subtitle: "Si te queda alguna duda, escribinos a support@terminalsync.ai",
    items: [
      {
        q: "¿No me alcanza con Git para sincronizar mi código?",
        a: "Git sincroniza lo que vos trackeás (código fuente). Terminal Sync mueve lo que Git deliberadamente NO trackea: tus .env con secretos, configs de Claude/Codex/MCP, sesiones de Cowork, memorias de proyecto, skills custom. Son herramientas complementarias — Git para el repo, Terminal Sync para todo lo demás.",
      },
      {
        q: "¿Pero Claude Desktop ya no sincroniza entre Macs?",
        a: "Anthropic sincroniza features cloud (Projects, Memory web, Styles, Workflows, conversaciones). Lo que NO sincroniza es lo local: tus servidores MCP custom (Notion, GitHub), tus skills, tus plugins instalados, tus sesiones de Cowork. Eso es lo que cubrimos nosotros.",
      },
      {
        q: "¿Mis archivos quedan en su servidor?",
        a: "No. Cifrado AES-256-GCM en tu Mac antes de salir. Sube a TU Google Drive, no al nuestro. Ni Anthropic, ni OpenAI, ni nosotros podemos ver tus archivos. Sos vos quien tiene la única llave.",
      },
      {
        q: "¿Funciona si solo tengo una Mac?",
        a: "Sí, pero el valor es menor. Te sirve como backup cifrado y para cuando agregues una segunda máquina. La gracia real aparece desde la segunda Mac.",
      },
      {
        q: "¿Qué pasa si cancelo mi suscripción?",
        a: "La app sigue funcionando en modo Free (1 terminal). Tus archivos siguen en tu Drive — vos seguís siendo el dueño. Podés exportar todo cuando quieras.",
      },
      {
        q: "¿Está open source?",
        a: "El motor de cifrado y sincronización va a ser auditable. La app cliente es propietaria por ahora pero el core de seguridad lo publicamos para que cualquiera pueda revisarlo.",
      },
      {
        q: "¿Funciona con Cursor / Cline / Aider?",
        a: "Hoy nos enfocamos en Claude (Code + Desktop + Cowork) y Codex Desktop. Si hay demanda real de la comunidad, agregamos más herramientas — el motor es agnóstico, solo cambia qué paths sincroniza.",
      },
      {
        q: "¿Y si Anthropic eventualmente sincroniza todo lo que ustedes hacen?",
        a: "Bien por ellos, mal para nosotros en ese subset. Por eso nuestro roadmap (visible en GitHub) se mueve hacia primitives locales que NINGÚN vendor va a hacer porque les rompería su lock-in: memoria unificada cross-vendor, skills que compilan a múltiples AIs, project briefs en filesystem.",
      },
    ],
  },
  comparison: {
    eyebrow: "El comparativo honesto",
    title: "Lo que ninguna otra IA hace por vos",
    subtitle:
      "Comparado con las herramientas que ya usás todos los días. Si algo es parcial o todavía está en progreso, lo decimos en la tabla.",
    pitch:
      "Vercel te ata al cloud y te factura por minuto. Claude Code y Codex en su versión cruda son potentes pero amnésicos — cada vez que cerrás la terminal perdés el contexto, no roamean entre Macs, no tienen vault de secretos, no te avisan cuando se traban. Terminal Sync es la capa que les pone memoria, privacidad y movilidad a tus agentes IA — sin pagar cloud y sin entregar tu código a nadie.",
    columns: {
      feature: "Funcionalidad",
      terminalSync: "Terminal Sync",
      vercel: "Vercel",
      claudeCode: "Claude Code solo",
      codex: "Codex solo",
    },
    rows: {
      offlineLocal: "Funciona offline / local-first",
      aes256: "Cifrado AES-256 zero-knowledge",
      secretsVault: "Vault de secretos integrado",
      resurrection: "Resurrección de sesión (cerrás todo, vuelve donde quedaste)",
      internetImmunity: "Persistencia ante caída de internet",
      aiConversationSync: "Sync de conversaciones IA entre Macs",
      multiModel: "Multi-modelo (Claude + Codex + otros)",
      anywhereAccess: "Anywhere Access (móvil + cualquier navegador)",
      stuckNotifications: "Notificaciones cuando el agente se traba",
      replyInjection: "Reply-injection desde celular",
      noVendorLockIn: "Sin vendor lock-in (tus archivos en tu cloud)",
      zeroRuntime: "Costo de runtime $0 (corre en tu Mac)",
      zeroStorage: "Costo de almacenamiento $0 (usás tu Drive)",
      deviceRoaming: "Roaming entre dispositivos",
      multipleSessions: "Múltiples sesiones simultáneas",
    },
    legend: { yes: "Sí", no: "No", partial: "Parcial", soon: "Próximamente" },
    footnote:
      "Comparativo basado en docs públicas de cada herramienta al 2026-05-04. Cifrado AES-256-GCM antes de salir de tu Mac — ni Anthropic, ni OpenAI, ni Vercel, ni nosotros vemos tus archivos.",
  },
  personas: {
    title: "¿Esto es para vos?",
    subtitle:
      "Tres perfiles que ya no entienden cómo vivían sin Terminal Sync.",
    items: {
      nomad: {
        title: "El Dev Nómada",
        body: "Trabajás en MacBook + Mac mini, o oficina + casa. Cambiás de equipo y perdés media hora reconfigurando .env, MCPs, skills. Con Terminal Sync abrís y seguís donde dejaste.",
        tag: "Developer",
      },
      beginner: {
        title: "El Power User Multi-AI",
        body: "Pagás Claude Pro + ChatGPT Plus. Tenés Cowork sessions activas, Codex configurado, MCPs custom. Querés que TODO viaje, no solo Claude o solo Codex.",
        tag: "AI Power User",
      },
      agency: {
        title: "El Indie Hacker / Founder",
        body: "5+ proyectos paralelos, cada uno con su .env, sus credenciales, su contexto en Claude. Necesitás todo encriptado y portable, sin pegarte mil git push de cosas que no van al repo.",
        tag: "Founder",
      },
    },
  },
  pricing: {
    title: "Simple, como debe ser",
    subtitle: "Empieza gratis. Paga solo cuando tu flujo lo pida.",
    perMonth: "/mes",
    free: "Gratis",
    cycleLabel: {
      monthly: "Mensual",
      yearly: "Anual",
      savingsBadge: "Ahorra 17%",
      savingsDetail: "2 meses gratis",
    },
    trial: {
      eyebrow: "7 días gratis",
      explainer:
        "Ingresas tu tarjeta pero no se cobra nada los primeros 7 días. Cancela antes del día 7 y no te cobramos.",
    },
    quiz: {
      cta: "¿Cuál plan necesito?",
      title: "Te ayudamos a elegir",
      subtitle: "Tres preguntas rápidas y te decimos cuál plan se ajusta a tus necesidades.",
      back: "Atrás",
      next: "Siguiente",
      seePlan: "Ver mi plan",
      startOver: "Volver a empezar",
      resultTitle: "Te recomendamos {{plan}}",
      resultWhy: "Porque nos dijiste que:",
      resultCta: "Empezar con {{plan}}",
      questions: [
        {
          id: "role",
          text: "¿Qué haces más con tu computadora?",
          options: [
            { value: "creator", label: "Chatear con IA, escribir, investigar" },
            { value: "developer", label: "Programar o crear cosas con código" },
            { value: "team", label: "Dirigir un equipo de varias personas que programan" },
            { value: "idk", label: "No sé / un poco de todo" },
          ],
        },
        {
          id: "pain",
          text: "Si mañana perdieras tu computadora, ¿qué te dolería más?",
          options: [
            { value: "chats", label: "Mis chats con IA, notas y documentos" },
            { value: "projects", label: "Mis proyectos de código (carpetas enteras con todo adentro)" },
            { value: "shared", label: "Lo que comparto con mi equipo" },
            { value: "idk", label: "No sé" },
          ],
        },
        {
          id: "volume",
          text: "¿En cuántas computadoras trabajas normalmente?",
          options: [
            { value: "one", label: "Solo en una" },
            { value: "two", label: "Entre dos y tres" },
            { value: "many", label: "Más de tres, o cambio seguido" },
            { value: "idk", label: "No sé" },
          ],
        },
      ],
    },
    plans: {
      starter: {
        name: "Free",
        price: "$0",
        priceNote: "para siempre",
        features: [
          "1 terminal activa",
          "Sync con Google Drive",
          "Cifrado AES-256",
          "Connectors MCP (Claude Code + Desktop)",
          "1 computadora vinculada",
        ],
        cta: "Empezar gratis",
      },
      pro: {
        name: "Pro",
        badge: "Más popular",
        priceMonthly: "$19",
        priceYearly: "$190",
        priceNoteMonthly: "/mes",
        priceNoteYearly: "/año",
        yearlyEquivalent: "$15.83/mes · facturado anual",
        features: [
          "5 terminales activas",
          "AI Auto-Pilot (instalación 1-clic de Claude Code)",
          "Sync completo de Claude (chats, projects, Cowork)",
          "Historial 90 días",
          "Hasta 5 computadoras",
        ],
        cta: "Probar 7 días gratis",
      },
      dev: {
        name: "Dev",
        badge: "Para developers",
        priceMonthly: "$39",
        priceYearly: "$390",
        priceNoteMonthly: "/mes",
        priceNoteYearly: "/año",
        yearlyEquivalent: "$32.50/mes · facturado anual",
        features: [
          "Todo lo de Pro, más:",
          "20 terminales activas",
          "Git-Native Sync (respeta .gitignore)",
          ".env Vault cifrado entre máquinas",
          "Auto setup.sh al abrir en un equipo nuevo",
        ],
        cta: "Probar 7 días gratis",
      },
    },
  },
  trust: {
    title: "Tus archivos son tuyos. Punto.",
    body: "Tus secretos, tus configs, tus sesiones — todo se cifra en tu Mac antes de salir. Va a TU Drive, no al nuestro. El motor de cifrado va a ser auditable públicamente.",
    guarantee: "Probalo 7 días gratis. Sin tarjeta.",
    features: {
      e2ee: "Cifrado AES-256-GCM",
      keychain: "Llaves en tu Keychain",
      opensource: "Motor de cifrado auditable",
      noVendor: "Sin lock-in de vendor",
    },
  },
  affiliates: {
    kicker: "Programa de Afiliados",
    title: "¿Eres creador de contenido de IA?",
    body: "Únete a nuestro programa y gana el 30% recurrente ayudando a otros a simplificar su flujo de trabajo.",
    cta: "Registrarme como Afiliado",
    perks: {
      recurring: "30% recurrente",
      lifetime: "Pagos de por vida",
      assets: "Assets listos para usar",
    },
  },
  footer: {
    product: "Producto",
    company: "Compañía",
    legal: "Legal",
    links: {
      features: "Funciones",
      demos: "Demos",
      pricing: "Precios",
      download: "Descargar",
      marketplace: "Marketplace",
      connectors: "Connectors",
      skills: "Skills",
      about: "Nosotros",
      blog: "Blog",
      contact: "Contacto",
      affiliates: "Afiliados",
      publishers: "Publicá un conector",
      affiliateTerms: "Términos de afiliados",
      privacy: "Privacidad",
      terms: "Términos",
      security: "Seguridad",
    },
    tagline: "Separa tu trabajo de tu máquina.",
    copyright: "© {{year}} TerminalSync. Todos los derechos reservados.",
  },
  theme: {
    light: "Claro",
    dark: "Oscuro",
    system: "Sistema",
  },
  agent: {
    open: "Abrir asistente",
    name: "Asistente TerminalSync",
    tagline: "Ventas y soporte · En línea",
    close: "Cerrar",
    greeting:
      "¡Hola! Soy tu asistente de TerminalSync. ¿Te ayudo a configurar tu Claude Code o tienes alguna duda técnica?",
    placeholder: "Escribe tu mensaje…",
    send: "Enviar",
    you: "Tú",
    typing: "escribiendo…",
    quickReplies: [
      { id: "install", label: "¿Cómo instalo Claude Code?" },
      { id: "pricing", label: "Precios" },
      { id: "security", label: "¿Qué tan seguro es?" },
    ],
    replies: {
      install:
        "¡Súper fácil! Descarga TerminalSync, en el dashboard verás la tarjeta \"AI Power-Ups\" → clic en \"Instalar Claude Code\" → pegas tu API key de Anthropic y listo. Toma ~30 segundos y nosotros configuramos todo por ti.",
      pricing:
        "Tenemos 3 planes: Starter ($0 gratis, 1 terminal), Pro ($19/mes con Power-Ups de Claude Code + 5 terminales) y Dev ($39/mes con Git-Native Sync, .env Vault y 20 terminales). Podés probar Pro o Dev gratis 7 días, sin tarjeta. ¿Querés el link de descarga?",
      security:
        "Tu código y tu API key se cifran con AES-256 en tu computadora ANTES de subir a Drive. Usamos Zero-Knowledge: ni nosotros ni Google podemos leer tu contenido. La llave maestra la tienes tú en tu keychain local.",
      fallback:
        "Gracias por tu mensaje. Un humano del equipo te contactará pronto. Mientras tanto, ¿quieres ver nuestras preguntas frecuentes o descargar la app?",
    },
  },
  video: {
    title: "Cómo funciona en 60 segundos",
    close: "Cerrar video",
    comingSoon: "Video en producción",
    comingSoonBody:
      "Estamos terminando de grabar la demo. Mientras tanto, descarga la app y pruébala — toma solo 2 minutos.",
    ctaMeanwhile: "Descargar gratis",
  },
  legal: {
    affiliates: {
      pageTitle: "Acuerdo de Partners",
      title: "Acuerdo de Partners",
      subtitle:
        "Términos y condiciones para participar en el Programa de Afiliados de TerminalSync.",
      updated: "Última actualización: 22 de abril de 2026",
      intro:
        "Este acuerdo describe los términos y condiciones para participar en el Programa de Afiliados de TerminalSync. Al registrarte, aceptas los siguientes puntos:",
      readFullTerms: "Leer términos completos",
      back: "Volver a Afiliados",
      acceptance:
        "Al marcar la casilla \"He leído y acepto los términos\" en el formulario de registro, confirmas haber leído, entendido y aceptado este acuerdo en su totalidad.",
      sections: {
        commissions: {
          heading: "1. Comisiones y pagos",
          items: {
            percent: {
              label: "Porcentaje",
              body: "Recibirás una comisión del 30% recurrente sobre el valor neto de cada suscripción TerminalSync Pro que sea referida a través de tu enlace único.",
            },
            recurring: {
              label: "Recurrencia",
              body: "La comisión se pagará mensualmente mientras el usuario referido mantenga su suscripción activa y al día.",
            },
            threshold: {
              label: "Umbral de pago",
              body: "Los pagos se procesarán cuando el saldo acumulado en tu cuenta sea igual o superior a $50 USD.",
            },
            cycle: {
              label: "Ciclo de pago",
              body: "Los pagos se emiten dentro de los primeros 10 días de cada mes calendario.",
            },
            hold: {
              label: "Periodo de retención",
              body: "Existe un periodo de seguridad de 15 días tras el pago del cliente antes de que la comisión sea marcada como \"Disponible\", con el fin de gestionar posibles reembolsos o disputas.",
            },
          },
        },
        attribution: {
          heading: "2. Sistema de atribución (cookies)",
          items: {
            duration: {
              label: "Duración",
              body: "Utilizamos cookies de seguimiento con una duración de 30 días.",
            },
            lastClick: {
              label: "Último clic",
              body: "El sistema de atribución funciona bajo el modelo de \"Last Click\": el último enlace de afiliado en el que el usuario haga clic antes de comprar será el que reciba la comisión.",
            },
          },
        },
        material: {
          heading: "3. Material promocional y marca",
          items: {
            authorized: {
              label: "Uso autorizado",
              body: "TerminalSync otorga una licencia limitada para usar nuestros logotipos, capturas de pantalla y material de marketing disponibles en el Dashboard de Afiliados exclusivamente para la promoción del software.",
            },
            restriction: {
              label: "Restricción de marca",
              body: "No está permitido comprar dominios que incluyan la palabra \"TerminalSync\" ni realizar campañas de anuncios (Google Ads / Facebook Ads) utilizando el nombre de la marca directamente para competir con el sitio oficial.",
            },
          },
        },
        responsibilities: {
          heading: "4. Responsabilidades del Partner",
          items: {
            ethics: {
              label: "Ética",
              body: "Queda estrictamente prohibido el uso de spam, publicidad engañosa o cualquier práctica que pueda dañar la reputación de TerminalSync.",
            },
            transparency: {
              label: "Transparencia",
              body: "Debes declarar de forma honesta que eres un afiliado y que recibes una compensación por las ventas recomendadas.",
            },
            selfReferral: {
              label: "Auto-referidos",
              body: "No está permitido el uso del enlace de afiliado para obtener descuentos en suscripciones personales. Estas comisiones serán anuladas automáticamente.",
            },
          },
        },
        changes: {
          heading: "5. Modificaciones y terminación",
          items: {
            modifications: {
              label: "Cambios",
              body: "TerminalSync se reserva el derecho de ajustar los porcentajes de comisión o los términos del servicio notificando a los partners con 30 días de antelación.",
            },
            termination: {
              label: "Terminación",
              body: "Cualquiera de las partes puede dar por terminada la relación en cualquier momento. En caso de fraude demostrado, la cuenta será cerrada y las comisiones pendientes serán confiscadas.",
            },
          },
        },
      },
    },
  },
  checkout: {
    loading: "Abriendo pago seguro…",
    errorTitle: "No pudimos abrir el pago",
    success: {
      eyebrow: "¡Listo!",
      title: "Bienvenido a TerminalSync Pro",
      body: "Ya tienes acceso completo. Te enviamos un correo con el recibo y los pasos para instalar la app.",
      ctaDownload: "Descargar la app",
      ctaHome: "Volver al inicio",
      receipt: "ID de sesión: {{id}}",
    },
    cancel: {
      eyebrow: "Pago cancelado",
      title: "No te preocupes, tu plan sigue gratis",
      body: "Cancelaste el pago — no se cobró nada. Puedes intentar de nuevo cuando quieras, o escribirnos si necesitas ayuda.",
      ctaRetry: "Probar de nuevo",
      ctaContact: "Hablar con el equipo",
    },
  },
};

export default es;
