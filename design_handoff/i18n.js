/* ============================================================
   TerminalSync — i18n prototipo (ES ↔ EN)
   Walker de nodos de texto: traduce por contenido exacto (trim).
   No requiere tocar el HTML. Persiste en localStorage.
   En producción: usar el i18n real de Next.js ([lang] middleware).
   ============================================================ */
(function () {
  // Diccionario: clave = texto español EXACTO (trim) → inglés.
  const ES_EN = {
    // Nav
    "Cómo funciona": "How it works",
    "Tu equipo de IAs": "Your AI team",
    "Catálogo": "Catalog",
    "Precios": "Pricing",
    "Descargar": "Download",
    // Hero
    "Piensan, construyen y ejecutan. Tú diriges el equipo.": "They think, build and ship. You lead the team.",
    "Convierte tus ideas en": "Turn your ideas into",
    "herramientas reales": "real tools",
    "hablando con IA.": "just by talking to AI.",
    "Describe lo que necesitas. Tus IAs lo crean, lo mantienen y nunca olvidan tu negocio — aunque cierres todo o cambies de computadora.": "Describe what you need. Your AIs build it, maintain it and never forget your business — even if you close everything or switch computers.",
    "creados por tus IAs mientras trabajas.": "built by your AIs while you work.",
    "Seguimientos · Propuestas · Portales para clientes · Reportes · Automatizaciones —": "Follow-ups · Proposals · Client portals · Reports · Automations —",
    "Empieza gratis": "Start free",
    "Mira cómo funciona": "See how it works",
    "macOS · Linux · Windows": "macOS · Linux · Windows",
    "Claude · Codex · Gemini incluidas": "Claude · Codex · Gemini included",
    "Listo en minutos": "Ready in minutes",
    "Cifrado E2EE · ni nosotros lo leemos": "E2EE encryption · not even we can read it",
    "Tus espacios de trabajo de IA, sincronizados en todas partes.": "Your AI workspaces, synced everywhere.",
    "Desde acá se maneja tu empresa.": "This is where your business runs from.",
    "Más de 2,000 empresas ya confían en TerminalSync": "Over 2,000 companies already trust TerminalSync",
    // Video
    "Mira TerminalSync en acción": "See TerminalSync in action",
    "El video, en un minuto.": "The video, in one minute.",
    "Tu video corporativo va aquí": "Your company video goes here",
    "Sube el archivo como": "Upload the file as",
    // Demos
    "Por qué la gente cambia en 30 segundos": "Why people switch in 30 seconds",
    "Tres momentos en los que dices \"wow\"": "Three moments that make you say \u201cwow\u201d",
    "Los momentos en los que dices \"wow\"": "The moments that make you say \u201cwow\u201d",
    "Momentos en los que dices: \"¡Guau!\"": "Moments that make you say: \u201cWow!\u201d",
    "No es un video: es TerminalSync funcionando. Míralo en vivo y pruébalo tú mismo.": "It\u2019s not a video: it\u2019s TerminalSync running. Watch it live and try it yourself.",
    "Cambio de IA en un clic": "Switch AI in one click",
    "Cada tarea necesita un especialista distinto.": "Every task needs a different specialist.",
    "Cada tarea necesita un especialista.": "Every task needs a specialist.",
    "Trabajo terminado": "Finished work",
    "No es un chat. Es trabajo terminado.": "It\u2019s not a chat. It\u2019s finished work.",
    "Pides un trabajo y las 3 IAs lo hacen: Claude escribe, Codex arma, Gemini revisa — y queda ✅ entregado.": "Ask for a job and the 3 AIs do it: Claude writes, Codex builds, Gemini reviews — and it\u2019s ✅ delivered.",
    "Claude piensa, Codex construye, Gemini analiza. ¿Sin tokens? Sigue con otra IA, sin perder el contexto.": "Claude thinks, Codex builds, Gemini analyzes. Out of tokens? Continue on another AI, without losing context.",
    "AI Director": "AI Director",
    "Un director que elige por ti.": "A director that chooses for you.",
    "TerminalSync recomienda el modo correcto para cada tarea — y te dice cuánto ahorras antes de cambiar.": "TerminalSync recommends the right mode for each task — and tells you how much you save before switching.",
    "Continuidad entre dispositivos": "Continuity across devices",
    "Empieza en el portátil. Sigue en la oficina.": "Start on the laptop. Continue at the office.",
    "Cierras todo y cambias de computadora — tu sesión, tu contexto y tu memoria te siguen, intactos.": "Close everything and switch computers — your session, context and memory follow you, intact.",
    "Integraciones": "Integrations",
    "Dale nuevas habilidades a tu equipo de IAs.": "Give your AI team new skills.",
    "Arrastra Gmail, Drive, Notion y más a tu sesión. Sin claves, sin configurar nada. Listo para trabajar.": "Drag Gmail, Drive, Notion and more into your session. No keys, nothing to set up. Ready to work.",
    "Trabajo desde el celular": "Work from your phone",
    "Tu sesión, también en tu bolsillo.": "Your session, in your pocket too.",
    "Abres la misma conversación en el celular y sigues donde ibas, estés donde estés.": "Open the same conversation on your phone and continue where you left off, wherever you are.",
    "Asistente de prompts": "Prompt assistant",
    "Un asistente de IA para hablar con las IAs.": "An AI assistant to talk to the AIs.",
    "¿No sabes qué responder? La IA redacta o pule tu mensaje por ti — para que le saques más a cada IA.": "Not sure what to reply? The AI drafts or polishes your message for you — so you get more out of each AI.",
    "La IA te ayuda a pedir mejor.": "The AI helps you ask better.",
    "Te sugiere cómo escribir o arreglar tu prompt para sacarle más a cada IA — sin que seas experto.": "It suggests how to write or fix your prompt to get more out of each AI — no expertise needed.",
    "Demo en camino": "Demo on the way",
    "Tu trabajo te sigue hasta el chat": "Your work follows you into the chat",
    "Empieza en la terminal. Sigue en WhatsApp y Telegram.": "Start in the terminal. Continue on WhatsApp and Telegram.",
    "La misma conversación continúa en tu celular — respondes desde el chat y tus IAs siguen trabajando, sin abrir la laptop.": "The same conversation continues on your phone — you reply from the chat and your AIs keep working, without opening the laptop.",
    "Ver demo": "See demo",
    "Ampliar": "Expand",
    "Cerrar": "Close",
    "En cuanto tengas el demo del celular, lo montamos aquí.": "As soon as you have the mobile demo, we\u2019ll mount it here.",
    "Cuando definamos el flujo del asistente de prompts, lo construyo aquí.": "Once we define the prompt assistant flow, I\u2019ll build it here.",
    "Arrastra Gmail, Drive, Notion, Airtable y otras herramientas a tu sesión. Sin claves. Sin configuraciones. Lista para trabajar.": "Drag Gmail, Drive, Notion, Airtable and other tools into your session. No keys. No setup. Ready to work.",
    "Claude piensa. Codex construye. Gemini analiza. Usa la mejor IA para cada trabajo y cambia con un clic cuando necesites otro enfoque. ¿Se acabaron los tokens? Sigue con otra IA, sin perder contexto ni repetir instrucciones.": "Claude thinks. Codex builds. Gemini analyzes. Use the best AI for each job and switch in one click when you need another approach. Out of tokens? Continue on another AI, without losing context or repeating instructions.",
    "Continuidad entre dispositivos": "Continuity across devices",
    "Empieza en el portátil. Sigue en la oficina.": "Start on the laptop. Continue at the office.",
    "Cierras todo y cambias de computadora — tu sesión, tu contexto y tu memoria te siguen, intactos.": "Close everything and switch computers — your session, context and memory follow you, intact.",
    "Integraciones": "Integrations",
    "Dale nuevas habilidades a tu equipo de IAs.": "Give your AI team new skills.",
    "Arrastra Gmail, Drive, Notion, Airtable y otras herramientas a tu sesión. Sin claves. Sin configuraciones. Lista para trabajar.": "Drag Gmail, Drive, Notion, Airtable and other tools into your session. No keys. No setup. Ready to work.",
    // Cómo funciona
    "Tres pasos. Sin tecnicismos.": "Three steps. No jargon.",
    "Descríbelo": "Describe it",
    "Dices lo que necesitas, en tus palabras. Sin código, sin configurar nada.": "Say what you need, in your own words. No code, nothing to set up.",
    "Tu equipo de IAs lo construye": "Your AI team builds it",
    "Las IAs trabajan en paralelo, lo crean y te lo muestran ya hecho.": "The AIs work in parallel, build it and show it to you already done.",
    "Sigue funcionando y mejora": "It keeps running and improves",
    "Queda andando, se mantiene solo y mejora a medida que lo usas.": "It stays running, maintains itself and improves as you use it.",
    // Casos de uso
    "Casos de uso": "Use cases",
    "Hecho para tu negocio, sea cual sea.": "Built for your business, whatever it is.",
    "Esto es exactamente lo que alguien como tú construye.": "This is exactly what someone like you builds.",
    "Brokers": "Brokers",
    "Consultores": "Consultants",
    "Agencias": "Agencies",
    "Ecommerce": "Ecommerce",
    "Fundadores": "Founders",
    "Especialistas listos para cada función.": "Specialists ready for every role.",
    "Instálalos una vez y funcionan con cualquier IA — Claude, Codex o Gemini.": "Install once and they work with any AI — Claude, Codex or Gemini.",
    "Marketing": "Marketing",
    "Campañas, contenido y seguimiento que no se detiene.": "Campaigns, content and follow-up that never stops.",
    "Ventas": "Sales",
    "Responde, califica y da seguimiento a cada lead.": "Reply, qualify and follow up on every lead.",
    "Operaciones": "Operations",
    "Ordena procesos, tareas y reportes repetitivos.": "Organizes processes, tasks and repetitive reports.",
    "Soporte": "Support",
    "Atiende las preguntas de siempre, al instante.": "Handles the usual questions, instantly.",
    "Datos": "Data",
    "Convierte números sueltos en decisiones.": "Turns loose numbers into decisions.",
    "Contenido": "Content",
    "Escribe en tu voz y a tu ritmo.": "Writes in your voice and at your pace.",
    // Equipo de IAs
    "Tu primer equipo digital · tres IAs": "Your first digital team · three AIs",
    "¿Por qué conformarte con una sola IA?": "Why settle for a single AI?",
    "Ten a Claude, Codex y Gemini en todos tus proyectos. Cada una en lo que es mejor — y cambias de una a otra con un clic, sin perder el contexto.": "Have Claude, Codex and Gemini on every project. Each at what it does best — and switch between them in one click, without losing context.",
    "Piensa": "Thinks",
    "Análisis, estrategia y redacción. Conoce tu negocio y piensa contigo.": "Analysis, strategy and writing. It knows your business and thinks with you.",
    "Construye": "Builds",
    "Crea y automatiza el trabajo. Mismo contexto, otra especialista.": "Creates and automates the work. Same context, a different specialist.",
    "Analiza": "Analyzes",
    "Lee PDFs, imágenes y videos enteros. Gratis, sin configurar nada.": "Reads entire PDFs, images and videos. Free, with no setup.",
    "Cambio con un clic": "One-click switch",
    "¿Se te acabaron los tokens? Cambia de IA y conserva todo.": "Out of tokens? Switch AI and keep everything.",
    "Cuando una IA llega a su límite, pasas a otra con un solo clic y sigues exactamente donde ibas — mismo proyecto, mismas decisiones, mismo contexto. Tu trabajo nunca se detiene.": "When one AI hits its limit, you move to another in a single click and continue exactly where you were — same project, same decisions, same context. Your work never stops.",
    "tokens agotados": "out of tokens",
    "1 clic": "1 click",
    "continúa": "continues",
    "Proyecto": "Project",
    "Memoria": "Memory",
    "Decisiones": "Decisions",
    "Dónde ibas": "Where you were",
    "Detecta el bloqueo": "Detects the block",
    "Nota cuando una IA llega a su límite, se cae o deja de responder.": "Notices when an AI hits its limit, fails or stops responding.",
    "Cambia de IA por ti": "Switches AI for you",
    "Pasa el trabajo a otra IA disponible. Tú no haces nada.": "Hands the work to another available AI. You do nothing.",
    "Lleva tu contexto": "Carries your context",
    "Retoma con el proyecto, las decisiones y dónde ibas, intactos.": "Resumes with the project, decisions and where you were, intact.",
    "Sigue donde quedaste": "Continues where you left off",
    "No empieza de cero: continúa la tarea en el punto exacto del corte.": "It doesn\u2019t start over: it continues the task at the exact point of the cut.",
    // Calculadora
    "Lo que cuesta NO tenerlo": "What it costs NOT to have it",
    "sobre la mesa cada año.": "on the table every year.",
    "Estás dejando": "You\u2019re leaving",
    "No compras IA: ganas horas, ahorras dinero y haces más sin contratar a nadie. Mueve los sliders con tu realidad.": "You\u2019re not buying AI: you gain hours, save money and do more without hiring anyone. Move the sliders to match your reality.",
    "Tu hora vale": "Your hour is worth",
    "Horas/día con IA": "Hours/day with AI",
    "Días/mes trabajando": "Days/month working",
    "Mezcla de tareas pesadas": "Mix of heavy tasks",
    "Más reasoning pesado encarece usar solo Claude. El mix rutea cada tarea al modelo correcto.": "More heavy reasoning makes using only Claude pricier. The mix routes each task to the right model.",
    "Horas/semana re-explicando contexto": "Hours/week re-explaining context",
    "Con memoria persistente no repites quién eres ni dónde quedaste.": "With persistent memory you don\u2019t repeat who you are or where you left off.",
    "Ahorras al año": "You save per year",
    "Hoy, con 1 sola IA": "Today, with just 1 AI",
    "Con TerminalSync": "With TerminalSync",
    "Recuperado por memoria": "Recovered by memory",
    "Empieza a ahorrar gratis": "Start saving free",
    // Comparación
    "El cambio real": "The real difference",
    "Tu IA te conoce, te recuerda y nunca pierde el hilo.": "Your AI knows you, remembers you and never loses the thread.",
    "Antes: cada día explicas todo de cero y pierdes el contexto al cerrar. Después: tu IA aprende tu negocio y sigue donde la dejaste, hagas lo que hagas.": "Before: every day you explain everything from scratch and lose context when you close. After: your AI learns your business and continues where you left it, no matter what.",
    "Sin TerminalSync": "Without TerminalSync",
    "Una IA suelta, sin memoria, que tienes que vigilar.": "A loose AI, with no memory, that you have to babysit.",
    "Cada día le explicas tu negocio otra vez": "Every day you explain your business all over again",
    "Cierras la app y pierdes la conversación": "You close the app and lose the conversation",
    "Reinicias el equipo y tu IA empieza de cero": "You restart your computer and your AI starts from scratch",
    "Quieres seguir desde el celular y no puedes": "You want to continue from your phone and can\u2019t",
    "Tus claves quedan en archivos sueltos": "Your keys end up in loose files",
    "El contexto no viaja entre IAs: te repites": "Context doesn\u2019t travel between AIs: you repeat yourself",
    "Un equipo de IAs que te conoce y nunca pierde el hilo.": "A team of AIs that knows you and never loses the thread.",
    "Aprende tu negocio y te entiende más cada día": "Learns your business and understands you more each day",
    "Cierras todo, vuelves y tu IA sigue trabajando": "You close everything, come back and your AI is still working",
    "Reinicias el equipo y retoma justo donde ibas": "You restart your computer and it resumes right where you were",
    "Generas un enlace y abres la sesión en tu celular": "You generate a link and open the session on your phone",
    "Bóveda cifrada con tus claves y secretos": "Encrypted vault with your keys and secrets",
    "Contexto compartido entre todas tus IAs": "Shared context across all your AIs",
    // Tabla
    "El comparativo honesto": "The honest comparison",
    "Lo que ninguna otra IA hace por ti": "What no other AI does for you",
    "Capacidad": "Capability",
    "Claude solo": "Claude alone",
    "Codex solo": "Codex alone",
    "Gemini solo": "Gemini alone",
    "Sí": "Yes",
    "No": "No",
    "Parcial": "Partial",
    "Retoma donde quedaste": "Resumes where you left off",
    "Varias IAs juntas (Claude + Codex + Gemini)": "Several AIs together (Claude + Codex + Gemini)",
    "Sigue trabajando aunque cierres todo": "Keeps working even if you close everything",
    "La misma sesión en navegador o celular": "The same session in browser or phone",
    "Avisos por correo y Telegram": "Email and Telegram alerts",
    "Cifrado fuerte · ni nosotros lo leemos": "Strong encryption · not even we can read it",
    "Bóveda de claves integrada": "Built-in key vault",
    "Memoria entre sesiones": "Memory across sessions",
    "Tus archivos en tu propia nube (sin amarres)": "Your files in your own cloud (no lock-in)",
    "Comparativo basado en información pública de cada herramienta a 2026.": "Comparison based on public information about each tool as of 2026.",
    // Chrome
    "También en Chrome": "Also on Chrome",
    "Las 3 IAs lado a lado, también desde el navegador.": "All 3 AIs side by side, from the browser too.",
    "Sin instalar nada. Pegas tus 3 API keys (BYOK), abres el popup y preguntas lo mismo a Claude, Codex y Gemini en paralelo desde cualquier pestaña.": "Nothing to install. Paste your 3 API keys (BYOK), open the popup and ask the same thing to Claude, Codex and Gemini in parallel from any tab.",
    "BYOK · tú pagas directo": "BYOK · you pay directly",
    "Memoria por proveedor": "Memory per provider",
    "Cost meter en vivo": "Live cost meter",
    "Markdown + copy": "Markdown + copy",
    "Probar en early access": "Try in early access",
    "Comparar con la app": "Compare with the app",
    // Precios
    "Simple, como debe ser.": "Simple, as it should be.",
    "Empieza gratis. 7 días con todas las funciones de Max — cancelas antes del día 7 y no se cobra nada.": "Start free. 7 days with all Max features — cancel before day 7 and nothing is charged.",
    "/ para siempre": "/ forever",
    "3 terminales activas con persistencia real": "3 active terminals with real persistence",
    "Claude Code, Codex, Gemini CLI o sin IA": "Claude Code, Codex, Gemini CLI or no AI",
    "AES-256 · ni nosotros lo leemos": "AES-256 · not even we can read it",
    "Sync con Google Drive (tu cuenta)": "Sync with Google Drive (your account)",
    "2 dispositivos vinculados": "2 linked devices",
    "Descargar gratis": "Download free",
    "Más popular": "Most popular",
    "7 días gratis": "7 days free",
    "/ mes": "/ month",
    "10 terminales con persistencia + resurrección": "10 terminals with persistence + resurrection",
    "Claude + Codex + Gemini en un workspace": "Claude + Codex + Gemini in one workspace",
    "Memoria persistente entre IAs": "Persistent memory across AIs",
    "Vault de secretos por proyecto": "Per-project secrets vault",
    "Sesión en cualquier dispositivo (móvil + navegador)": "Session on any device (mobile + browser)",
    "Avisos por Email / Telegram": "Email / Telegram alerts",
    "Extensión Chrome Pro incluida": "Chrome Pro extension included",
    "Probar 7 días gratis": "Try 7 days free",
    "Todo lo de Pro, más:": "Everything in Pro, plus:",
    "Terminales ilimitadas": "Unlimited terminals",
    "Hasta 10 dispositivos": "Up to 10 devices",
    "Comandos, herramientas y MCPs por equipo": "Commands, tools and MCPs per team",
    "Pair programming read-only": "Read-only pair programming",
    "Soporte prioritario por email": "Priority email support",
    // Seguridad
    "Seguridad y privacidad": "Security and privacy",
    "No sincronizamos archivos. Sincronizamos continuidad.": "We don\u2019t sync files. We sync continuity.",
    "Tus secretos, ajustes y sesiones se cifran en tu computadora antes de salir. Van a TU nube, no a la nuestra. El sistema de cifrado será auditable públicamente.": "Your secrets, settings and sessions are encrypted on your computer before they leave. They go to YOUR cloud, not ours. The encryption system will be publicly auditable.",
    "Cifrado de grado bancario": "Bank-grade encryption",
    "Llaves solo en tu dispositivo": "Keys only on your device",
    "Sistema auditable": "Auditable system",
    "Sin amarres con proveedores": "No provider lock-in",
    // FAQ
    "Preguntas frecuentes": "FAQ",
    "Lo que la gente nos pregunta primero": "What people ask us first",
    "¿En qué se diferencia de guardar mi carpeta en Drive o iCloud?": "How is this different from saving my folder in Drive or iCloud?",
    "Drive e iCloud guardan tus archivos sin cifrar — el proveedor ve el contenido. TerminalSync cifra TODO en tu computadora antes de salir. Llegan a tu Drive, iCloud o Dropbox ilegibles para todos: ni Google, ni Apple, ni las IAs, ni nosotros podemos abrirlos. La llave vive solo en tu dispositivo.": "Drive and iCloud store your files unencrypted — the provider sees the content. TerminalSync encrypts EVERYTHING on your computer before it leaves. It reaches your Drive, iCloud or Dropbox unreadable to everyone: not Google, not Apple, not the AIs, not us. The key lives only on your device.",
    "¿Mis archivos quedan en su servidor?": "Do my files stay on your server?",
    "No. Corre en tu computadora y sincroniza con tu propia nube. Nosotros no almacenamos tus archivos ni podríamos leerlos: están cifrados de extremo a extremo.": "No. It runs on your computer and syncs with your own cloud. We don\u2019t store your files and couldn\u2019t read them: they\u2019re end-to-end encrypted.",
    "¿Funciona si solo tengo una computadora?": "Does it work if I only have one computer?",
    "Sí. La persistencia, la memoria y la bóveda de secretos funcionan en un solo equipo. La sincronización entre dispositivos es un extra cuando lo necesites.": "Yes. Persistence, memory and the secrets vault work on a single machine. Cross-device sync is an extra when you need it.",
    "¿Qué pasa si cancelo mi suscripción?": "What happens if I cancel my subscription?",
    "Tus archivos siguen siendo tuyos y en tu nube. Bajas al plan Free con 3 terminales; nada se borra ni se queda atrapado.": "Your files remain yours and in your cloud. You drop to the Free plan with 3 terminals; nothing is deleted or trapped.",
    "¿Funciona con cualquier IA o solo con Claude y Codex?": "Does it work with any AI or only Claude and Codex?",
    "Claude, Codex y Gemini de fábrica, en paralelo y con contexto compartido. También puedes trabajar sin IA, como una terminal persistente normal.": "Claude, Codex and Gemini out of the box, in parallel and with shared context. You can also work without AI, like a normal persistent terminal.",
    "¿Necesito configurar algo?": "Do I need to set anything up?",
    "No. Setup-on-arrival: abres el proyecto y tus terminales, herramientas y memoria ya están listas. La memoria persistente viene activa desde la primera sesión.": "No. Setup-on-arrival: you open the project and your terminals, tools and memory are already there. Persistent memory is active from the very first session.",
    // Afiliados
    "Programa de afiliados": "Affiliate program",
    "Recomienda privacidad y persistencia.": "Recommend privacy and persistence.",
    "Si produces contenido de IA, automatización o productividad, gana 30% recurrente de por vida. Mientras pague, tú cobras.": "If you create AI, automation or productivity content, earn 30% recurring for life. As long as they pay, you get paid.",
    "Registrarme como afiliado": "Sign up as an affiliate",
    "Leer términos": "Read terms",
    "30% recurrente": "30% recurring",
    "Pagos de por vida": "Lifetime payouts",
    "Assets listos para usar": "Ready-to-use assets",
    // Final CTA
    "Pruébalo gratis": "Try it free",
    "Deja de mirar la pantalla esperando a tu IA.": "Stop staring at the screen waiting for your AI.",
    "7 días de Pro gratis. Cancelas antes del día 7 y no te cobramos. Si te convence, te quedas.": "7 days of Pro free. Cancel before day 7 and we won\u2019t charge you. If you love it, you stay.",
    "Ver precios": "See pricing",
    // Footer
    "Separa tu trabajo de tu máquina.": "Separate your work from your machine.",
    "Producto": "Product",
    "Funciones": "Features",
    "Extensión Chrome": "Chrome extension",
    "Asistentes": "Assistants",
    "Conectores": "Connectors",
    "Kits": "Kits",
    "Herramientas CLI": "CLI tools",
    "Legal": "Legal",
    "Privacidad": "Privacy",
    "Términos": "Terms",
    "Seguridad": "Security",
    "© 2026 TerminalSync. Todos los derechos reservados.": "© 2026 TerminalSync. All rights reserved.",
    "Cifrado fuerte antes de salir de tu computadora.": "Strong encryption before it leaves your computer.",
    "Tu equipo de IAs": "Your AI team",
    // Theme switcher (control de prototipo)
    "Tema": "Theme",
    "Claro": "Light",
    "Oscuro": "Dark"
  };

  // Construye el índice inverso EN→ES para poder volver.
  const EN_ES = {};
  Object.keys(ES_EN).forEach(function (es) { EN_ES[ES_EN[es]] = es; });

  // Frases rotativas del hero (bilingüe), expuestas para app.js si las usa.
  window.TS_HERO_ROTATOR = {
    es: [
      'Convierte tus ideas en <span class="grad">herramientas reales</span> hablando con IA.',
      '¿Por qué conformarte con <span class="grad">una sola IA</span>?',
      '<span class="grad">Claude, Codex y Gemini.</span> Una sola memoria.',
      'Tu primer <span class="grad">equipo digital</span>. Sin contratar a nadie.',
      'Cambia de IA <span class="grad">sin perder el contexto</span>.'
    ],
    en: [
      'Turn your ideas into <span class="grad">real tools</span> just by talking to AI.',
      'Why settle for <span class="grad">a single AI</span>?',
      '<span class="grad">Claude, Codex and Gemini.</span> One shared memory.',
      'Your first <span class="grad">digital team</span>. Without hiring anyone.',
      'Switch AI <span class="grad">without losing context</span>.'
    ]
  };

  function walk(node, map) {
    if (node.nodeType === 3) { // text
      var raw = node.nodeValue;
      var key = raw.trim();
      if (key && map[key]) {
        node.nodeValue = raw.replace(key, map[key]);
      }
      return;
    }
    if (node.nodeType === 1) {
      var tag = node.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'IFRAME' || tag === 'CODE') return;
      for (var i = 0; i < node.childNodes.length; i++) walk(node.childNodes[i], map);
    }
  }

  var current = 'es';
  function apply(lang) {
    if (lang === current) return;
    var map = lang === 'en' ? ES_EN : EN_ES;
    walk(document.body, map);
    current = lang;
    document.documentElement.lang = lang;
    try { localStorage.setItem('ts_lang', lang); } catch (e) {}
    // toggle visual state
    document.querySelectorAll('.lang a[data-lang]').forEach(function (a) {
      a.classList.toggle('on', a.dataset.lang === lang);
    });
    // re-render hero rotator / dynamic bits
    window.dispatchEvent(new CustomEvent('ts-lang', { detail: { lang: lang } }));
  }

  window.TS_setLang = apply;
  window.TS_getLang = function () { return current; };

  document.addEventListener('DOMContentLoaded', function () {
    // wire toggles
    document.querySelectorAll('.lang a[data-lang]').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); apply(a.dataset.lang); });
    });
    var saved = null;
    try { saved = localStorage.getItem('ts_lang'); } catch (e) {}
    if (saved === 'en') apply('en');
  });
})();
