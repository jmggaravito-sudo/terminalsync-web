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
    eyebrow: "AI Power-Ups · Oficial con Anthropic",
    titlePre: "Lleva tu ",
    titleHighlight: "Claude Code",
    titlePost: " a cualquier parte.",
    subtitle:
      "Sincroniza tus terminales, archivos y el contexto de tu IA entre computadoras al instante. Instalación de Claude Code en 1 clic.",
    ctaPrimary: "Descargar Gratis para Desktop",
    ctaSecondary: "Ver cómo funciona",
    trustLine: "Gratis para siempre · Sin tarjeta de crédito",
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
    title: "Tres momentos en los que dices ‘wow’",
    subtitle:
      "Mira por qué la gente deja su flujo antiguo después de 30 segundos con TerminalSync.",
    items: {
      context: {
        kicker: "Demo · El Contexto",
        title: "Cierras en tu Mac, abres en tu PC. Todo exactamente igual.",
        body: "No vuelves a indexar, ni a copiar-pegar historial, ni a configurar nada. Tu Claude te estaba esperando.",
      },
      install: {
        kicker: "Demo · 1-Click Install",
        title: "Un clic. Y Claude Code queda listo.",
        body: "Sin NPM, sin Node, sin leer la documentación. Un botón naranja y listo para preguntar.",
      },
      shield: {
        kicker: "Demo · El Escudo",
        title: "AES-256 antes de salir de tu computadora.",
        body: "Ni Google ni nosotros podemos ver tu código. Tú tienes la única llave.",
      },
    },
  },
  benefits: {
    title: "Por qué TerminalSync",
    subtitle: "Lo que ningún otro sync de archivos puede hacer por tu IA.",
    items: {
      context: {
        title: "Sincronización de Contexto",
        body: "No solo mueves código, mueves la memoria de tu IA. Cero re-indexación, cero contexto perdido.",
      },
      privacy: {
        title: "Privacidad Zero-Knowledge",
        body: "Tus archivos se cifran en tu PC antes de subir a Drive. Ni nosotros ni Google podemos ver tu código.",
      },
      autoInstall: {
        title: "Instalación Automática",
        body: "Olvídate de NPM, Node.js y configuraciones de terminal. Preparamos tu entorno por ti.",
      },
    },
  },
  personas: {
    title: "¿Esto es para ti?",
    subtitle: "Tres tipos de personas que ya no pueden vivir sin TerminalSync.",
    items: {
      nomad: {
        title: "El Programador Nómada",
        body: "Cambias entre Mac de la oficina y PC de la casa. Tu trabajo debe seguirte a donde vayas — sin USBs, sin pushes de emergencia a GitHub.",
        tag: "Developer",
      },
      beginner: {
        title: "El Principiante en IA",
        body: "Quieres usar Claude Code pero la terminal te intimida. Instalamos todo por ti: un clic y ya estás preguntando.",
        tag: "Explorador",
      },
      agency: {
        title: "El Dueño de Agencia",
        body: "Tu equipo debe tener el mismo entorno siempre. Distribuye terminales compartidas y asegúrate que todos trabajen igual.",
        tag: "Líder",
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
      team: {
        name: "Team",
        price: "$49",
        priceNote: "/persona/mes",
        features: [
          "Todo lo de Dev, para cada miembro",
          "20 terminales activas por persona",
          "Facturación unificada del equipo",
          "Soporte prioritario por email",
        ],
        cta: "Contactar ventas",
      },
    },
  },
  trust: {
    title: "Tu código es tuyo. Punto.",
    body: "Tu API Key nunca toca nuestros servidores. Se guarda cifrada en tu nube personal. Puedes auditar el código: TerminalSync es open-source.",
    guarantee: "Pruébalo gratis. Sin tarjeta de crédito.",
    features: {
      e2ee: "Cifrado E2EE",
      keychain: "API Key en tu keychain",
      opensource: "Código abierto",
      noVendor: "Sin lock-in de proveedor",
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
      about: "Nosotros",
      blog: "Blog",
      contact: "Contacto",
      affiliates: "Afiliados",
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
        "Tenemos 3 planes: Starter ($0 gratis), Pro ($19/mes con IA Auto-Pilot + terminales ilimitadas) y Agency ($49/mes para equipos). Puedes probar Pro gratis sin tarjeta de crédito. ¿Quieres el link de descarga?",
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
