---
name: Klaviyo
logo: /connectors/klaviyo.svg
category: automation
status: available
simpleTitle: "Tu marketing de email/SMS, manejado desde el chat"
simpleSubtitle: "Server oficial de Klaviyo: campañas, flows, segmentos y reportes por OAuth."
devTitle: "Conector MCP de Klaviyo"
devSubtitle: "MCP oficial hospedado de Klaviyo (mcp.klaviyo.com) — campañas, flows, perfiles y reportes."
ctaUrl: "https://www.klaviyo.com"
tokenHelpUrl: "https://developers.klaviyo.com/en/docs/klaviyo_mcp_server"
manifest:
  mcpServers:
    klaviyo:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.klaviyo.com/mcp"]
affiliate: false
tagline: "Tus campañas y flows, al alcance del agente"
originalAuthor: "Klaviyo"
originalAuthorUrl: "https://developers.klaviyo.com/en/docs/klaviyo_mcp_server"
license: "proprietary"
licenseUrl: "https://www.klaviyo.com/legal"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Klaviyo** es la plataforma de email/SMS que usan las marcas de ecommerce para correr campañas, flows automatizados y listas segmentadas. El conector oficial de Klaviyo es un **server MCP hospedado** (`https://mcp.klaviyo.com/mcp`), publicado por Klaviyo, que le da a tu agente acceso a campañas, flows, perfiles, segmentos y reportes usando tu propia cuenta de Klaviyo.

Preguntale *"¿Cómo rindió el flow de carrito abandonado de la semana pasada?"* y trae el reporte de ese flow. Decile *"Armá una campaña para la promo del fin de semana dirigida a clientes que no compran hace 30 días"* y puede construir el borrador contra tus segmentos y plantillas reales. El uso corre contra tu cuenta y rol de Klaviyo.

### Qué le podés pedir

- *"¿Cómo rindió el flow de carrito abandonado de la semana pasada, y dónde se cae la gente?"*
- *"Armá una campaña para la promo del fin de semana, dirigida a clientes que no compran hace 30 días."*
- *"Listame mis segmentos activos y cuántos perfiles tiene cada uno."*
- *"Traeme las tasas de apertura y clics de nuestras últimas 3 campañas."*

### Cómo conectás

Este conector **no te pide pegar ninguna API key**. Usa tu propia cuenta de Klaviyo:

1. Activá el conector en TerminalSync.
2. El puente `mcp-remote` abre el flujo de OAuth de Klaviyo en tu navegador y registra el cliente automáticamente — sin configurar ninguna app a mano.
3. Iniciá sesión y autorizá el acceso. La propia doc de Klaviyo aclara que esta función solo está disponible para cuentas con rol **Owner, Admin o Manager**.

**Aclaración honesta:** es un **server hospedado por Klaviyo** (`https://mcp.klaviyo.com/mcp`). Lo que el agente puede leer o cambiar queda acotado por los permisos de tu rol de cuenta en Klaviyo.

--- dev ---

Klaviyo publica su server MCP como un **server remoto/hospedado** en `https://mcp.klaviyo.com/mcp`, documentado en `developers.klaviyo.com/en/docs/klaviyo_mcp_server`. No hay un paquete local instalable por `npx` para el camino recomendado: te conectás a la URL hospedada y localmente hacés de puente con `mcp-remote`:

```
npx -y mcp-remote@latest https://mcp.klaviyo.com/mcp
```

La auth es **OAuth con Dynamic Client Registration** (el cliente se registra solo contra el server remoto — no hay que crear una app OAuth a mano de antemano). La doc oficial también documenta un modo **server local** (vía `uv`, autenticado con una API key privada) para devs que prefieren un proceso stdio en vez del endpoint hospedado; TerminalSync usa el camino hospedado/OAuth porque coincide con el flujo "conectar con un botón" que el catálogo prioriza para dueños no técnicos.

Categorías de tools, verbatim de la doc oficial: **Accounts, Campaigns, Catalogs, Events, Flows, Groups, Images, Profiles, Reporting, Templates, Translations** — cubriendo creación de campañas, reportes de rendimiento, gestión de perfiles/segmentos y renderizado de plantillas. La doc también marca una limitación del lado cliente: *"Query parameters can't be controlled with the listed Claude connector or the listed ChatGPT app. To use them, set up a custom connector instead."*

**Requisito de acceso:** según la doc de Klaviyo, el server MCP *"is only available to Klaviyo users with an Owner, Admin, or Manager role"* — un asiento de Klaviyo con permisos menores no va a poder autorizar el conector.

Licencia: términos SaaS propietarios (Klaviyo Terms of Service). Fuente: developers.klaviyo.com/en/docs/klaviyo_mcp_server.
