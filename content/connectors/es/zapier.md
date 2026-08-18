---
name: Zapier
logo: /connectors/zapier.svg
category: automation
status: available
simpleTitle: "Dale acciones a tu agente en miles de apps"
simpleSubtitle: "MCP oficial de Zapier: Gmail, Slack, Sheets, CRMs y 9.000+ apps con tu cuenta de Zapier."
devTitle: "Zapier MCP Connector"
devSubtitle: "Official Zapier MCP server — user-managed tools and app connections from mcp.zapier.com."
ctaUrl: "https://mcp.zapier.com"
tokenHelpUrl: "https://mcp.zapier.com"
affiliate: false
tagline: "Miles de acciones de apps, al alcance del agente"
originalAuthor: "Zapier"
originalAuthorUrl: "https://github.com/zapier/zapier-mcp"
license: "proprietary"
licenseUrl: "https://zapier.com/terms"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Zapier MCP** es el puente entre tu agente y las apps que ya usas: Gmail, Google Sheets, Slack, Salesforce, HubSpot, Asana y miles más. A diferencia de un conector de un solo producto, Zapier te deja elegir exactamente qué acciones le expones a la IA: enviar un email, agregar una fila a una planilla, crear una tarea, actualizar un negocio del CRM o disparar una de las herramientas que habilitaste en tu servidor MCP de Zapier.

Le pedís *"Crea una tarea en Asana para este seguimiento y agrega el lead a mi Google Sheet"* y el agente puede llamar las tools de Zapier que tú permitiste. Funciona mejor cuando mantienes el server enfocado: habilitá solo las acciones que realmente quieres que el agente use.

### Qué le puedes pedir

- *"Agrega este lead nuevo a Google Sheets y crea una tarea de seguimiento."*
- *"Envía este mensaje aprobado por Gmail."*
- *"Crea un canal de Slack para este proyecto e invita al equipo."*
- *"Busca este contacto en HubSpot y actualiza la etapa del negocio."*

### Cómo conectas

La configuración de Zapier se maneja en **tu dashboard de Zapier MCP**, no con un manifest público fijo:

1. Entra a [mcp.zapier.com](https://mcp.zapier.com) y crea o abrí tu servidor MCP.
2. Agrega las acciones de apps que quieres que tenga el agente.
3. Conecta en tu cliente de IA la URL/credenciales MCP que te da Zapier.

**Aclaración honesta:** las acciones de Zapier pueden cambiar sistemas reales. Mantén la lista de tools acotada, usá lectura/búsqueda cuando puedas y pedí aprobación antes de enviar mensajes, editar registros o disparar workflows del negocio. Zapier documenta que el uso por MCP consume tareas de tu plan existente de Zapier.

--- dev ---

Zapier publica documentación oficial de MCP en `mcp.zapier.com` y en el repo `zapier/zapier-mcp`. El servidor MCP es gestionado por el usuario/cuenta: el usuario genera credenciales o URL de servidor en Zapier, agrega tools/actions y el cliente se conecta a ese servidor. Por eso TerminalSync **no** incluye acá un manifest `mcpServers` estático único para todos — la URL correcta y las tools habilitadas dependen del servidor MCP de Zapier del usuario.

Zapier posiciona el producto como acceso a miles de conexiones de apps y decenas de miles de acciones. Sus docs también indican que cada tool call exitoso por MCP consume tareas del plan existente de Zapier, y que el acceso a servers/tools se controla desde el dashboard de Zapier MCP.

Licencia: términos SaaS propietarios. Fuente: zapier.com/mcp, docs MCP de help.zapier.com y github.com/zapier/zapier-mcp.
