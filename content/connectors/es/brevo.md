---
name: Brevo
logo: /connectors/brevo.svg
category: automation
markets: ["GLOBAL"]
status: available
simpleTitle: "Pregunta por tu marketing de email y tu CRM en lenguaje natural"
simpleSubtitle: "MCP oficial de Brevo: contactos, campañas de email, reportes, SMS, WhatsApp y negocios del CRM, directo desde tu cuenta."
devTitle: "Conector MCP de Brevo"
devSubtitle: "MCP oficial hospedado de Brevo (mcp.brevo.com) — 27 módulos sobre tu cuenta: contactos, campañas, analítica, SMS, WhatsApp y CRM, con un token MCP Bearer."
ctaUrl: "https://www.brevo.com"
tokenHelpUrl: "https://app.brevo.com"
manifest:
  mcpServers:
    brevo:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.brevo.com/v1/brevo/mcp", "--header", "Authorization:${BREVO_AUTH_HEADER}"]
      env:
        BREVO_AUTH_HEADER: "Bearer ${SECRET:BREVO_MCP_TOKEN}"
affiliate: false
tagline: "Tu email, tus SMS y tu CRM, al alcance del agente"
originalAuthor: "Brevo"
originalAuthorUrl: "https://developers.brevo.com"
license: "proprietary"
licenseUrl: "https://www.brevo.com/legal/termsofuse/"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-10-16T10:42:20.694Z"
verifiedPackageVersion: null
---
**Brevo** es la plataforma con la que muchos negocios pequeños administran su marketing: campañas de email, contactos y listas, mensajes por SMS y WhatsApp, y un CRM integrado con negocios, empresas y tareas. El conector oficial de Brevo es un **server MCP hospedado** (`https://mcp.brevo.com/v1/brevo/mcp`), publicado por Brevo en su portal de desarrolladores — en palabras de la documentación oficial, *"lets you use AI assistants to interact with your Brevo account using natural language"* (te permite usar asistentes de IA para interactuar con tu cuenta de Brevo en lenguaje natural).

Le preguntas *"¿Cuántos contactos tengo?"* y la respuesta sale directo de tu cuenta. *"Muéstrame los negocios en la etapa de Negociación"* los trae del CRM. También trabaja por ti: *"Crea una campaña de email para mi lanzamiento"* o *"Agrega un contacto a mi lista de newsletter"* — son ejemplos de la propia documentación de Brevo, y este conector puede ejecutarlos de verdad.

### Qué le puedes pedir

- *"¿Cuántos contactos tengo y cómo se reparten entre mis listas?"*
- *"¿Cómo le fue a mi última campaña de email?"*
- *"Muéstrame los negocios que están en la etapa de Negociación."*
- *"Agrega a María García (maria@ejemplo.com) a mi lista de newsletter."*
- *"Crea una campaña de email para mi promoción de Black Friday."*
- *"Crea una campaña de SMS para anunciar la venta flash de este fin de semana."*

Para todo lo que cambie tu cuenta — agregar un contacto, crear una campaña — la IA te muestra lo que va a hacer y te pide confirmación antes de ejecutarlo.

### Qué token necesitas

Necesitas un **token MCP de Brevo** — un tipo de API key que Brevo creó específicamente para su server MCP.

1. Entra en [app.brevo.com](https://app.brevo.com) con tu cuenta y abre **Account > SMTP & API > API Keys**.
2. Haz clic en **Generate a new API key** y activa la opción **Create MCP server API key**.
3. Copia el token en ese mismo momento. La advertencia de la guía oficial, textual: *"Copy your token immediately and store it securely. It grants full read/write access to your account."* (copia tu token de inmediato y guárdalo de forma segura; otorga acceso total de lectura y escritura a tu cuenta).
4. Pégalo cuando TerminalSync te pida `BREVO_MCP_TOKEN`. Se guarda cifrado en los Secretos de la app y se envía al server como el header `Authorization: Bearer …`.

**Aviso honesto:** es un **server hospedado por Brevo** (`mcp.brevo.com`), no algo que corre en tu computadora: tus pedidos viajan al servidor de Brevo, que responde con los datos de tu cuenta. El token **no tiene scopes**: la guía de Brevo dice que otorga acceso total de lectura y escritura, así que el agente puede leer y cambiar todo lo que tu cuenta puede — crear y enviar campañas, modificar contactos y listas, tocar tu CRM. La documentación no describe un mecanismo de confirmación del lado del servidor. Si quieres una superficie más acotada, Brevo publica 27 servers individuales por módulo (solo contactos, solo gestión de campañas de email, y así); este conector usa el server principal con todo combinado.

--- dev ---

Brevo publica su **MCP oficial** como server remoto/hospedado en `https://mcp.brevo.com/v1/brevo/mcp` — *"All features combined (27 modules)"* (todos los features combinados, 27 módulos) — documentado en `developers.brevo.com` (`docs/mcp-protocol` y `docs/integration-guide`). No hay paquete npm ni server stdio local; se puentea con `mcp-remote`:

```
npx -y mcp-remote@latest https://mcp.brevo.com/v1/brevo/mcp --header "Authorization:${BREVO_AUTH_HEADER}"
```

**Autenticación: token Bearer.** El header `Authorization` lleva un token MCP de Brevo, tal como lo muestra la guía de integración (`"Authorization: Bearer ${BREVO_MCP_TOKEN}"`). La guía es estricta con el formato: *"Ensure the `Authorization` header value is formatted as `Bearer <token>` with a space between Bearer and the token."* (el valor del header debe ir como `Bearer <token>`, con un espacio entre Bearer y el token). Según el changelog de Brevo, *"MCP tokens are no longer passed in the URL"* — los patrones antiguos con `/{token}` en la URL ya no valen, y el header es la única autenticación documentada. El manifest de esta ficha inyecta el token desde los Secretos de la app como `${SECRET:BREVO_MCP_TOKEN}` dentro de ese header. El token se crea en app.brevo.com → **Account > SMTP & API > API Keys** → **Generate a new API key** con el toggle **Create MCP server API key** activado.

**Tools.** Del changelog: *"The 193 MCP tools are now automatically generated from the Brevo OpenAPI specification"* — las 193 tools se generan automáticamente desde el OpenAPI del propio API, lo que según Brevo elimina las discrepancias *"between the API and MCP server"*. La doc no publica una lista plana de tools; documenta módulos y requests de ejemplo (*"How many contacts do I have?"*, *"Create an email campaign for my product launch"*, *"Show me deals in the Negotiation stage"*, *"Add a contact to my newsletter list"*).

**Los 27 módulos documentados**, cada uno servido también como server propio en `https://mcp.brevo.com/v1/<módulo>/mcp` (la doc señala que un set de tools más chico *"can improve response quality"* — puede mejorar la calidad de la respuesta; cambia la URL del puente para acotar la superficie del agente):

| Server de módulo | Qué cubre |
| ------------------------------- | ------------------------------------ |
| `brevo_contacts` | Administrar contactos y listas |
| `brevo_email_campaign_management` | Crear y administrar campañas de email |
| `brevo_campaign_analytics` | Ver el rendimiento de las campañas |
| `brevo_templates` | Administrar plantillas de email |
| `brevo_transac_templates` | Administrar plantillas de email transaccional |
| `brevo_deals` | Administrar negocios del CRM |
| `brevo_companies` | Administrar empresas del CRM |
| `brevo_tasks` | Administrar tareas del CRM |
| `brevo_pipelines` | Configurar pipelines del CRM |
| `brevo_notes` | Agregar notas a contactos y negocios |
| `brevo_sms_campaigns` | Crear y enviar campañas de SMS |
| `brevo_whatsapp_campaigns` | Crear y enviar campañas de WhatsApp |
| `brevo_whatsapp_management` | Configurar los ajustes de WhatsApp |
| `brevo_lists` | Administrar listas de contactos |
| `brevo_segments` | Administrar segmentos de contactos |
| `brevo_attributes` | Administrar atributos de contactos |
| `brevo_contact_import_export` | Importar y exportar contactos en bloque |
| `brevo_folders` | Organizar campañas en carpetas |
| `brevo_groups` | Administrar grupos de contactos |
| `brevo_senders` | Administrar identidades de remitente |
| `brevo_domains` | Administrar dominios de remitente |
| `brevo_ips` | Administrar IPs dedicadas |
| `brevo_accounts` | Administrar la cuenta y las subcuentas |
| `brevo_users` | Administrar usuarios y permisos |
| `brevo_webhooks_management` | Configurar webhooks |
| `brevo_external_feeds` | Administrar feeds RSS |
| `brevo_processes` | Monitorear procesos en segundo plano |

**Clientes y requisitos.** La doc lista Claude Desktop, Claude Code, Cursor, Windsurf, VS Code, Cline *"and more"* (y más); el puente requiere Node.js en tu máquina (*"npx is required for Claude Desktop and Claude Code, which use the mcp-remote bridge"*). Brevo también publica un **server MCP de documentación** aparte en `developers.brevo.com/_mcp/server` para buscar en su documentación de desarrolladores — es otro server, no parte de este conector.

**Límites.** El changelog anota *"Request limits have been added to protect services from abuse"* (se agregaron límites de solicitudes para proteger los servicios del abuso); no publica números concretos.

**Divulgación:** server hospedado (no local) al que se llega con un token que otorga acceso total de lectura y escritura, sin scopes y sin un gate de confirmación documentado del lado del servidor — el control queda en el cliente que orquesta las tools.

Licencia: SaaS propietario (Términos de uso de Brevo, `brevo.com/legal/termsofuse`). Fuente: developers.brevo.com — documentación MCP de Brevo (`mcp-protocol`, `integration-guide`) y changelog.
