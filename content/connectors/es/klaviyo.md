---
name: Klaviyo
logo: /connectors/klaviyo.svg
category: automation
status: available
simpleTitle: "Preguntale a tus datos de marketing de Klaviyo en lenguaje natural"
simpleSubtitle: "Server oficial de Klaviyo: campañas, flows, perfiles, segmentos y reportes de desempeño."
devTitle: "Klaviyo MCP Connector"
devSubtitle: "Official hosted Klaviyo MCP (mcp.klaviyo.com) — email/SMS marketing over OAuth."
ctaUrl: "https://www.klaviyo.com"
tokenHelpUrl: "https://developers.klaviyo.com/en/docs/klaviyo_mcp_server"
manifest:
  mcpServers:
    klaviyo:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.klaviyo.com/mcp"]
affiliate: false
tagline: "Tu marketing de email y SMS, al alcance del agente"
originalAuthor: "Klaviyo"
originalAuthorUrl: "https://developers.klaviyo.com/en/docs/klaviyo_mcp_server"
license: "proprietary"
licenseUrl: "https://www.klaviyo.com/legal"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Klaviyo** es la plataforma de marketing por email y SMS que usan negocios de ecommerce y retail para correr campañas, flows automatizados y segmentos de clientes. El conector oficial de Klaviyo es un **server MCP hospedado** que le permite a tu agente leer y actuar sobre tu cuenta de Klaviyo en lenguaje natural —desempeño de campañas, resultados de flows, perfiles de clientes y templates— sin que tengas que andar buscando en los dashboards.

Le preguntás *"Mostrame el desempeño de mis campañas de email de los últimos 30 días"* y trae los datos de reportes. Le pedís *"Creá una campaña de email promocionando nuestra oferta de fin de temporada"* y puede armarla directamente en tu cuenta. Sirve para chequear qué está funcionando, armar campañas y segmentos nuevos, y mantener al día templates y listas de clientes.

### Qué le podés pedir

- *"Mostrame el desempeño de mis campañas de email de los últimos 30 días."*
- *"¿Qué flows están rindiendo mejor en conversiones?"*
- *"Creá una campaña de email promocionando nuestra oferta de fin de temporada."*
- *"Listá mis segmentos de clientes y cuántos perfiles tiene cada uno."*

### Cómo conectás

Este conector **no te pide pegar ninguna API key**. Usa el login de tu propia cuenta de Klaviyo:

1. Cuando lo actives, se abre una ventana del navegador para que inicies sesión en Klaviyo y autorices el acceso (OAuth).
2. Aprobás los permisos con tu cuenta — el conector solo puede ver y hacer lo que esa cuenta tenga permitido.
3. Listo: no hay token que copiar ni que renovar a mano. La guía oficial de conexión de Klaviyo está en [developers.klaviyo.com](https://developers.klaviyo.com/en/docs/klaviyo_mcp_server).

**Aclaración honesta:** es un server **hospedado por Klaviyo** (no corre en tu computadora). Localmente se usa el puente `mcp-remote`, que abre el flujo de OAuth y mantiene la conexión con `https://mcp.klaviyo.com/mcp`. La propia documentación de Klaviyo dice que esta función solo está disponible para cuentas con rol **Owner, Admin o Manager** — un miembro del equipo con un rol más limitado no va a poder autorizarlo. Lo que el agente puede ver o cambiar más allá de eso queda acotado por los permisos de tu cuenta.

--- dev ---

Klaviyo publica un **server MCP remoto/hospedado** oficial en `https://mcp.klaviyo.com/mcp`, descrito en la documentación como el enfoque recomendado por sobre una opción local. La fuente oficial es `developers.klaviyo.com/en/docs/klaviyo_mcp_server`. Este conector no tiene comando stdio local estático: te conectás a la URL hospedada y localmente hacés de puente con `mcp-remote`:

```
npx -y mcp-remote@latest https://mcp.klaviyo.com/mcp
```

La auth del server remoto es **OAuth con dynamic client registration** — el flujo por navegador que abre `mcp-remote` tiene la misma forma que cualquier otro conector OAuth de este catálogo, así que el manifest no declara `env`/secret. Klaviyo también documenta una alternativa **local** (`uvx klaviyo-mcp-server@latest`) que en cambio toma una API key privada con permisos por scope (Accounts, Campaigns, Catalogs, Events, Flows, Images, List, Metrics, Profiles, Segments, Subscriptions, Tags, Templates, Translations) vía una variable de entorno `PRIVATE_API_KEY` — TerminalSync shipea el camino hospedado por OAuth, así que no hace falta pegar ni rotar ninguna API key a mano.

**Gate de rol, verbatim de la documentación:** *"This feature is only available to Klaviyo users with an Owner, Admin, or Manager role."*

**Tools (40+ en varias categorías, según la documentación):** Accounts (detalle de cuenta), Campaigns (listar/crear/detalle, asignar templates), Catalogs (listar items), Events (listar/crear eventos, consultar métricas), Flows (listar flows, detalle), gestión de Groups/Lists/Segments, Images (subir desde archivo o URL), Profiles (crear/actualizar/listar/suscribir/desuscribir), Reporting (reportes de desempeño de campañas y flows), Templates (crear/actualizar/borrar/clonar templates de email), Translations (crear/actualizar/borrar colecciones de traducción).

Klaviyo no publica un repo open-source ni un LICENSE para el server hospedado — se trata como términos de SaaS propietario, mismo patrón que Zapier/Ideogram/Asana en este catálogo. Fuente: developers.klaviyo.com.
