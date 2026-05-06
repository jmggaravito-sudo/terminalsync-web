import type { Dict } from "./types";

const es: Dict = {
  locale: "es",
  meta: {
    title: "TerminalSync — Memoria, privacidad y movilidad para tu IA",
    description:
      "Tu agente IA (Claude/Codex) sigue corriendo aunque se caiga internet o cambies de Mac. Cifrado AES-256 zero-knowledge. Acceso desde cualquier dispositivo.",
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
    eyebrow: "AI Workflow OS · Claude + Codex",
    titlePre: "Tus IAs y tu entorno, ",
    titleHighlight: "sincronizados y seguros",
    titlePost: ".",
    subtitle:
      "Tu terminal, archivos y herramientas siempre listos en cualquier computadora. Abrí sesión y continuá donde lo dejaste.",
    ctaPrimary: "Probalo gratis",
    ctaSecondary: "Ver cómo funciona",
    trustLine: "Sin setup · Sin perder contexto · Funciona en cualquier equipo · Cifrado AES-256 zero-knowledge",
    nextUp: {
      eyebrow: "Lo último",
      body: "Anywhere Access vía Cloudflare Tunnel — abrí tu sesión desde el celular sin instalar nada. Multi-AI workflow unificado: Claude y Codex con el mismo contexto. Vault de secretos por terminal.",
    },
    mockup: {
      appName: "Terminal Sync",
      statusOk: "Todo está seguro y guardado",
      bannerTitle: "Tu IA lista en segundos",
      bannerBody: "Configuramos todo por ti — solo abrí y empezá a pedir.",
      bannerCta: "Instalar Claude Code",
      session1: "Investigación de mercado",
      session2: "Asistente de redacción",
      session3: "Análisis de ventas",
      live: "EN VIVO",
    },
  },
  demos: {
    title: "Tres momentos en los que decís ‘wow’",
    subtitle:
      "Por qué la gente que prueba TerminalSync deja sus herramientas viejas a los 30 segundos.",
    items: {
      context: {
        kicker: "Demo · Persistencia",
        title: "Cerrás todo. Tu agente sigue trabajando solo.",
        body: "El internet se cae, se reinicia tu Mac, cerrás la app sin querer — tu Claude o Codex no se detienen. Cuando volvés, la conversación está exactamente donde la dejaste.",
      },
      install: {
        kicker: "Demo · Cualquier dispositivo",
        title: "Generás un link y abrís tu sesión desde el celular.",
        body: "Botón 'Móvil' → link HTTPS único → tu mismo escritorio en el navegador del celular, la tablet o cualquier Mac prestada. Mismo contexto, mismas conversaciones.",
      },
      shield: {
        kicker: "Demo · Privacidad",
        title: "Cifrado AES-256 antes de salir de tu Mac.",
        body: "Tus archivos viajan ya cifrados a tu propio Drive (o iCloud o Dropbox). Ni Google, ni Anthropic, ni OpenAI, ni nosotros vemos lo que hay adentro. La llave maestra vive en tu Keychain.",
      },
    },
  },
  memory: {
    eyebrow: "Memoria persistente",
    badge: "Incluida",
    title: "Tu IA aprende de vos. Y no se olvida nunca.",
    subtitle:
      "Memoria local, cifrada y portable que crece con cada sesión. Tu agente recuerda tus preferencias, decisiones de arquitectura y convenciones — el día 30 te conoce mejor que un junior nuevo. Incluida en TerminalSync, sin configuración.",
    pillars: [
      {
        title: "100% local, 100% privado",
        body: "La base de conocimiento vive en SQLite en tu Mac. Sin servidores nuestros, sin claves API, sin vendor lock-in. Si querés sincronizarla entre tus equipos, lo hacemos cifrada con AES-256 a tu propia nube.",
      },
      {
        title: "Funciona con cualquier IA",
        body: "Compatible vía MCP con Claude Code, Codex, Cursor, Windsurf y cualquier agente que soporte el protocolo. Una sola memoria, todos tus agentes.",
      },
      {
        title: "Búsqueda semántica",
        body: "Tu agente encuentra el contexto relevante automáticamente. Preguntás 'cómo manejábamos auth' y trae las decisiones, los patrones y las razones — no solo palabras clave.",
      },
    ],
    timeline: {
      heading: "Sin memoria persistente vs. con memoria persistente",
      withoutLabel: "Sin TerminalSync Memory",
      withLabel: "Con TerminalSync Memory",
      withoutItems: [
        { when: "Día 1", line: "Le explicás que preferís TypeScript con strict mode." },
        { when: "Día 3", line: "“¿Qué lenguaje preferís?” — re-explicás todo." },
        { when: "Día 14", line: "Otra vez. Empezás de cero." },
        { when: "Día 30", line: "Dejás de explicar y aceptás respuestas genéricas." },
      ],
      withItems: [
        { when: "Día 1", line: "Le explicás que preferís TypeScript con strict mode." },
        { when: "Día 3", line: "“Como preferís TypeScript, voy a inicializar con strict.”" },
        { when: "Día 14", line: "“Siguiendo tu convención de error types explícitos…”" },
        { when: "Día 30", line: "Conoce tu stack mejor que un dev que recién arranca." },
      ],
    },
    cta: {
      heading: "Probá la memoria persistente hoy",
      body: "Viene activa por default desde la primera sesión. Sin instalación extra, sin claves de API, sin servidor nuestro en el medio.",
      button: "Descargar gratis",
    },
  },
  multiAI: {
    eyebrow: "AI Workflow Unificado",
    title: "Dejá de saltar entre herramientas de IA",
    subtitle:
      "Hoy tu flujo se ve así: Claude en una terminal, Codex en otra, contexto perdido entre las dos. TerminalSync es la capa que las conecta.",
    problem: {
      title: "Sin TerminalSync",
      items: [
        "Claude en una ventana",
        "Codex en otra",
        "El contexto no viaja entre ellas",
        "Te repetís a vos mismo todo el tiempo",
        "Cada cambio de IA = empezar de cero",
        "Tu flujo se rompe constantemente",
      ],
    },
    solution: {
      title: "Con TerminalSync",
      items: [
        "Un único entorno",
        "Contexto compartido",
        "Tus IAs trabajando juntas",
        "Memoria de proyecto que viaja con vos",
        "Sin repetir, sin saltar, sin fricción",
        "El flujo no se rompe nunca",
      ],
    },
    useCases: {
      title: "Usá la IA correcta para cada momento — sin cambiar de setup",
      cards: [
        {
          tool: "Claude",
          verb: "para razonar",
          body: "Análisis profundo, planificación, escritura. Claude ya conoce tu proyecto.",
        },
        {
          tool: "Codex",
          verb: "para ejecutar",
          body: "Edición de código, refactors, automatizaciones. Mismo contexto, otra herramienta.",
        },
      ],
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
          "Conversación viva al reabrir (vía resurrección de sesión)",
        ],
        upcoming: [],
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
          "Conversación viva al reabrir (vía resurrección de sesión)",
        ],
        upcoming: [],
      },
    },
  },
  beforeAfter: {
    eyebrow: "El cambio real",
    title: "Cómo se siente trabajar con tu agente IA",
    subtitle:
      "Antes: medias mañanas perdidas y conversaciones que arrancan de cero. Después: tu agente sigue donde lo dejaste, hagas lo que hagas.",
    before: {
      heading: "Sin Terminal Sync",
      items: [
        "Cerrás la app y perdés la conversación con tu IA",
        "Se cae el internet y tu agente se detiene",
        "Querés seguir desde el celular y no podés",
        "Tus claves API viven en archivos sueltos en tu Mac",
        "Cambiás de equipo y empezás todo de cero",
        "Te quedás mirando la pantalla esperando que la IA responda",
      ],
    },
    after: {
      heading: "Con Terminal Sync",
      items: [
        "Cerrás todo, abrís de nuevo y tu IA sigue corriendo",
        "Internet se cae — tu agente trabaja igual en local",
        "Generás un link y abrís la sesión en tu celular",
        "Vault cifrado AES-256 con tus secretos",
        "Tu cuenta y configuración te siguen a cualquier dispositivo",
        "Aviso por WhatsApp/Email/Telegram cuando termina o necesita algo",
      ],
    },
  },
  midCta: {
    eyebrow: "Probalo gratis",
    title: "Dejá de mirar la pantalla esperando a tu IA.",
    body: "7 días de Pro sin tarjeta. Si te convence, te quedás. Si no, dejás de usarlo y listo.",
    ctaPrimary: "Descargar gratis",
    ctaSecondary: "Ver precios",
  },
  faq: {
    eyebrow: "Preguntas frecuentes",
    title: "Lo que la gente nos pregunta primero",
    subtitle: "Si te queda alguna duda, escribinos a support@terminalsync.ai",
    items: [
      {
        q: "¿Cuál es la diferencia con sincronizar mi carpeta en Drive o iCloud?",
        a: "Drive e iCloud sincronizan archivos sin cifrar — el proveedor puede ver el contenido cuando quiera. Terminal Sync cifra TODO con AES-256 antes de salir de tu Mac. Tus archivos viajan a Drive/iCloud/Dropbox como blobs opacos: ni Google, ni Apple, ni Anthropic, ni nosotros podemos abrirlos. La llave maestra vive en el llavero de tu sistema operativo.",
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
        q: "¿Funciona con cualquier IA o solo con Claude y Codex?",
        a: "Hoy lo tenemos pulido para Claude (Code + Desktop) y Codex. El motor es agnóstico — agregamos otras herramientas (Cursor, Cline, Aider, etc.) según la demanda real. Si querés que soportemos algo específico, escribinos y lo subimos al roadmap público.",
      },
      {
        q: "¿En qué se diferencia de un IDE en la nube tipo Codespaces o Gitpod?",
        a: "No te mudás a un entorno nuevo — TU entorno te sigue a vos. Tu Mac, tus archivos, tus IAs configuradas como ya las tenías. Sin alquiler de cómputo, sin facturación por minuto, sin lock-in. Y todo cifrado AES-256 en tu propia nube.",
      },
      {
        q: "¿En qué se diferencia de usar Claude o Codex por separado?",
        a: "Claude y Codex por separado no se hablan: cada uno tiene su contexto, sus archivos, su memoria. TerminalSync los conecta en un único flujo. Le pedís a Claude que analice algo y a Codex que lo ejecute, sin re-explicar nada — comparten el mismo proyecto y la misma memoria.",
      },
      {
        q: "¿Necesito configurar algo?",
        a: "No. Ese es exactamente el punto. Instalás, iniciás sesión y ya tenés todo listo. La primera vez tomás 2 minutos para vincular tu Drive (o iCloud o Dropbox); de ahí en adelante, abrís cualquier Mac y todo está en su lugar.",
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
      "Tres perfiles que ya no entienden cómo trabajaban sin Terminal Sync.",
    items: {
      nomad: {
        title: "El que vive en su agente IA",
        body: "Pasás horas con Claude o Codex armando proyectos. Cuando se traba la app, internet se cae, o cerrás sin querer, perdés todo el contexto. Con TerminalSync tu agente sigue corriendo y volvés exactamente donde quedaste.",
        tag: "Power User IA",
      },
      beginner: {
        title: "El que cambia de equipo seguido",
        body: "MacBook + Mac mini, o oficina + casa, o sales de viaje. Hasta querés seguir desde el celular cuando tu agente está procesando algo. Tu cuenta y tu sesión te siguen a donde estés.",
        tag: "Multi-dispositivo",
      },
      agency: {
        title: "El que maneja datos sensibles",
        body: "Trabajás con claves API, credenciales de clientes, contratos, datos privados. No querés que vivan en la nube de un vendor que un día puede leerlos. Cifrado AES-256 antes de salir de tu Mac — ni nosotros podemos abrirlos.",
        tag: "Privacidad-first",
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
          "1 terminal activa con persistencia real",
          "Cifrado AES-256 zero-knowledge",
          "Sync con Google Drive (tu cuenta)",
          "Notificaciones de silencio en el agente",
          "1 dispositivo vinculado",
        ],
        cta: "Descargar gratis",
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
          "5 terminales con persistencia + resurrección",
          "Anywhere Access (móvil + cualquier navegador)",
          "Notificaciones por Email / WhatsApp / Telegram",
          "Sync completo de Claude y Codex entre dispositivos",
          "Historial 90 días",
          "Hasta 5 dispositivos",
        ],
        cta: "Probar 7 días gratis",
      },
      dev: {
        name: "Dev",
        badge: "Para devs",
        priceMonthly: "$39",
        priceYearly: "$390",
        priceNoteMonthly: "/mes",
        priceNoteYearly: "/año",
        yearlyEquivalent: "$32.50/mes · facturado anual",
        features: [
          "Todo lo de Pro, más:",
          "20 terminales activas",
          "Vault de secretos por carpeta",
          "Git-native sync (snapshots + .gitignore)",
          "Setup-on-arrival automático por proyecto",
          "Pair programming read-only",
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
    title: "Recomendá privacidad y persistencia",
    body: "Si producís contenido de IA, automatización o productividad, ganá 30% recurrente de por vida cada vez que alguien se suma con tu link. Mientras pague, vos cobrás.",
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
