---
name: Factorial
logo: /connectors/factorial.png
category: automation
markets: ["US", "MX", "CO", "AR", "CL", "BR", "ES", "FR", "GB"]
status: soon
simpleTitle: "Registra tu entrada, pide vacaciones y encuentra compañeros por chat"
simpleSubtitle: "MCP oficial de Factorial: asistencia, tareas, ausencias y búsqueda de compañeros por OAuth, sin pegar ninguna API key."
devTitle: "Factorial MCP Connector"
devSubtitle: "MCP oficial de Factorial, hospedado (mcp.factorialhr.com) — asistencia, tareas, ausencias y búsqueda de empleados por OAuth."
ctaUrl: "https://factorial.com"
tokenHelpUrl: "https://apidoc.factorialhr.com/docs/mcp-server"
manifest:
  mcpServers:
    factorial:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.factorialhr.com"]
affiliate: false
tagline: "Tu Factorial, al alcance del agente"
originalAuthor: "Factorial"
originalAuthorUrl: "https://apidoc.factorialhr.com/docs/mcp-server"
license: "proprietary"
licenseUrl: "https://factorial.com/terms-of-use"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: false
installableForAiReason: "needs-oauth"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-10-16T10:40:00.000Z"
verifiedPackageVersion: null
---
**Factorial** es la plataforma de RR. HH. que usan los negocios en crecimiento para manejar al equipo en un solo lugar: fichas de empleados, control de tiempo, asistencia, ausencias y nómina. El server MCP oficial de Factorial le da a tu agente acceso directo a tu propio día de RR. HH. — sin pegar ninguna API key en TerminalSync, solo con el login de tu cuenta de Factorial.

Le preguntas *"¿Tengo la jornada iniciada ahora mismo?"* y el agente revisa tu estado de asistencia. Le pides *"Registra mi entrada"* y queda marcado el inicio de tu jornada sin abrir la app. El server cubre asistencia (registrar entrada y salida, y tu estado actual), tus tareas (verlas y crear nuevas), ausencias (ver las tuyas y los tipos de tiempo libre que ofrece tu empresa, y pedir vacaciones) y la búsqueda de compañeros por nombre o email. La propia documentación de Factorial lo presenta así: *"Connect your AI assistant to Factorial and let it clock you in, manage tasks, request time off, and more…"*

### Qué le puedes pedir

- *"¿Tengo la jornada iniciada ahora mismo?"*
- *"Registra mi entrada."*
- *"¿Qué tipos de tiempo libre ofrece la empresa?"*
- *"Pídeme vacaciones del 22 de diciembre al 2 de enero."*
- *"Busca el email de María, del equipo de diseño."*
- *"Crea una tarea para preparar la inducción de la nueva persona del equipo antes del lunes."*

Las acciones que cambian tus datos — registrar la entrada, pedir vacaciones, crear una tarea — pasan por un paso de confirmación: la IA te muestra lo que está por hacer y espera tu aprobación antes de ejecutarlo.

### Cómo te conectas

Este conector **no te pide pegar ninguna API key**. Usa el login de tu propia cuenta de Factorial:

1. Activa el conector en TerminalSync.
2. El puente `mcp-remote` abre el login de Factorial en tu navegador y te pide autorizar el acceso.
3. Apruébalo con tu cuenta — el server actúa como tú, el usuario autenticado, así que el conector solo puede ver y hacer lo que tu propio usuario de Factorial tiene permitido. La guía oficial está en [apidoc.factorialhr.com](https://apidoc.factorialhr.com/docs/mcp-server).

**Aclaración honesta:** es un **server hospedado por Factorial** (`https://mcp.factorialhr.com`), no algo que corre en tu computadora — la documentación de Factorial dice que "there is nothing to install or run". El agente opera con los permisos de tu usuario, nunca como administrador ni como cuenta de servicio, y los tiempos de asistencia se manejan en la zona horaria de tu usuario. La documentación no lista restricciones de país ni de plan para las tools directas. Las tools de Factorial One (políticas, contratos, reportes, base de conocimiento, performance) aplican solo si tu plan incluye Factorial One y consumen sus créditos — las tools directas de arriba no.

**Por qué figura como Próximamente:** el server está vivo y su login es OAuth, pero al preparar esta ficha (2026-10-16) verificamos que la ventana de login todavía no abre correctamente a través del puente de conexión de TerminalSync — Factorial publica la identidad de su login en una dirección distinta a la del conector, y el puente se detiene ante esa diferencia como medida de seguridad. La ficha se publica con la configuración oficial documentada de Factorial y se habilitará en cuanto ese handshake se complete.

--- dev ---

Factorial publica un **server MCP remoto oficial** en `https://mcp.factorialhr.com`, documentado en su portal de desarrolladores ([apidoc.factorialhr.com/docs/mcp-server](https://apidoc.factorialhr.com/docs/mcp-server)). El transporte es Streamable HTTP; el server está hospedado por el vendor (*"there is nothing to install or run"*). La auth es **OAuth 2.0 con Dynamic Client Registration**, con refresh tokens; el server actúa como el usuario autenticado (*"as the authenticated user, never as an admin or service account"*). La doc describe la instalación como conector custom con login OAuth en Claude (web y desktop), ChatGPT y *"any assistant that supports remote MCP connectors"*.

TerminalSync hace de puente con el endpoint hospedado localmente:

```
npx -y mcp-remote@latest https://mcp.factorialhr.com
```

**Smoke (2026-10-16):** el endpoint está vivo y exige auth — `initialize` sin credenciales devuelve `401` (`invalid_token`, falta el header Authorization). `/.well-known/oauth-authorization-server` publica dynamic client registration (`mcp.factorialhr.com/oauth/register`), PKCE `S256` y scopes que reflejan la superficie documentada: `one:read`, `one:write`, `company_holidays`, `company_legal_entities`, `company_locations`, `employees`, `shift_management`, `tasks`, `time_off`, `time_tracking`.

**Bloqueo del login (por qué se publica como `soon`):** el login no se puede completar hoy a través de `mcp-remote`. La metadata servida en `mcp.factorialhr.com/.well-known/oauth-authorization-server` declara como issuer `https://api.factorialhr.com/` (donde viven los endpoints de autorización y token), mientras que `api.factorialhr.com` no sirve ningún `.well-known` propio (404). `mcp-remote@latest` aplica el chequeo de issuer de RFC 8414 §3.3 — el issuer debe coincidir con el origen desde el que se obtuvo la metadata — y aborta con `IssuerMismatchError` antes de abrir el login del navegador. Verificado con el script de smoke y con una corrida directa del puente. Desbloqueo: volver a correr `node scripts/smoke-remote-login.mjs --slugs factorial`; si Factorial alinea su issuer con el origen del MCP, o un `mcp-remote` futuro acepta el issuer de otro dominio, pasar a `status: available` / `installableForAi: true`.

**Superficie de tools (de la doc oficial):**

- **Asistencia:** registrar entrada y salida, y consultar tu estado actual. Los tiempos se registran en la zona horaria del usuario.
- **Tareas:** ver tus tareas y crear nuevas.
- **Ausencias:** ver las ausencias y los tipos de tiempo libre disponibles en la empresa; pedir vacaciones.
- **Búsqueda de empleados:** encontrar a un compañero por nombre o email.
- **Factorial One:** delega en el propio asistente de IA de Factorial (políticas, contratos, reportes, base de conocimiento, performance) — solo si el plan incluye Factorial One, y consume créditos; las tools directas de arriba no.

**Divulgación:** server hospedado que lee y escribe datos reales de RR. HH. (registros de entrada, solicitudes de vacaciones, tareas) con la identidad del usuario que conecta. La doc no documenta límites de uso ni restricciones de país. Existen MCP de terceros para Factorial en npm y GitHub; este conector shipea únicamente el server remoto oficial del vendor.

Licencia: términos propietarios de SaaS (`factorial.com/terms-of-use`). Fuente: apidoc.factorialhr.com/docs/mcp-server.
