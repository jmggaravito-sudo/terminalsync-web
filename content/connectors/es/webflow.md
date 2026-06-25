---
name: Webflow
logo: /connectors/webflow.svg
category: productivity
status: available
simpleTitle: "Que tu IA trabaje con tu sitio Webflow"
simpleSubtitle: "Consultá sitios, colecciones y CMS items usando un token guardado como secreto."
devTitle: "Webflow MCP Server"
devSubtitle: "Official Webflow MCP server over the Webflow Data API and Designer bridge."
ctaUrl: "https://developers.webflow.com/data/v2.0.0/docs/ai-tools"
tokenHelpUrl: "https://webflow.com/dashboard/account/integrations"
manifest:
  mcpServers:
    webflow:
      command: npx
      args: ["-y", "webflow-mcp-server"]
      env:
        WEBFLOW_TOKEN: "${SECRET:WEBFLOW_TOKEN}"
affiliate: false
tagline: "Webflow y CMS desde el chat"
originalAuthor: "Webflow"
originalAuthorUrl: "https://webflow.com"
license: "MIT"
licenseUrl: "https://unpkg.com/webflow-mcp-server@1.0.0/LICENSE.md"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Webflow** es uno de los constructores de sitios web visuales más usados — páginas diseñadas a mano, colecciones de CMS, e-commerce, todo manejado sin código. Si tu sitio (o el de un cliente) corre en Webflow, este conector hace que tu IA pueda leer y editar el contenido directamente, sin que vos abras el panel.

El alcance va desde lo más simple — *"actualizá el título de la home"* — hasta cosas más jugosas como manejar colecciones del CMS (artículos del blog, propiedades de un realtor, productos), responder con datos del sitio en tiempo real, o auditar SEO sobre todas las páginas a la vez.

### Qué le podés pedir

- *"Listame todos los artículos del blog publicados en los últimos 30 días y decime cuáles tienen menos de 500 palabras."*
- *"Actualizá el meta description de la página de pricing a este texto: [...]"*
- *"Creá un item nuevo en la colección 'Casos de Estudio' con estos datos: título X, cliente Y, resumen Z."*

### Qué token necesitás

Necesitás un **Webflow API token** (Site Token o Workspace Token, según querés alcance de un sitio puntual o de toda tu cuenta).

1. Andá a [webflow.com/dashboard/account/integrations](https://webflow.com/dashboard/account/integrations) (o `Workspace Settings → Integrations → API Access` desde tu sitio).
2. Generá un nuevo token — Webflow te deja elegir scopes (CMS read, CMS write, Sites read, etc.). Para empezar, dale CMS read + Sites read; agregás write cuando lo necesites.
3. Copialo y pegalo cuando el Lab te pida `WEBFLOW_TOKEN`. El token nunca se guarda en disco plano — viaja cifrado en tu Keychain.

Importante: si querés edición visual con bridge a Designer (editar elementos de página, no solo CMS), Webflow tiene un componente extra documentado en su [guía oficial de AI tools](https://developers.webflow.com/data/v2.0.0/docs/ai-tools). Este conector cubre el modo Data API estándar.

--- dev ---

`webflow-mcp-server` es el paquete publicado por Webflow para correr el MCP server local con `npx`. En instalación local usa `WEBFLOW_TOKEN` para autenticarse contra Webflow Data API; la documentación oficial también describe un modo remoto OAuth vía `mcp-remote`.

El token puede ser un Site Token (scope: un sitio específico) o un Workspace Token (scope: toda la workspace). Los scopes individuales — `sites:read`, `cms:read`, `cms:write`, `pages:read`, `pages:write` — se configuran al generarlo.

Licencia: MIT. Fuente: npm `webflow-mcp-server` y documentación oficial de Webflow AI tools.
