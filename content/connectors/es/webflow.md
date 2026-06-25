---
name: Webflow
logo: /connectors/webflow.svg
category: productivity
status: available
simpleTitle: "Que tu IA trabaje con tu sitio Webflow"
simpleSubtitle: "Edita el canvas, gestiona el CMS y audita SEO desde el chat."
devTitle: "Webflow MCP Server"
devSubtitle: "Official Webflow MCP server over the Designer API and Data API."
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
**Webflow** es uno de los constructores de sitios web visuales más usados — páginas diseñadas a mano, colecciones de CMS, e-commerce, todo manejado sin código. Si tu sitio (o el de un cliente) corre en Webflow, este conector hace que tu IA pueda trabajar contra el sitio directamente, sin que vos abras el panel.

La documentación oficial separa dos APIs que el conector expone:

- **Designer API tools** — trabajo en el canvas en tiempo real: *"Create and modify elements, styles, and components"*, *"Manage responsive breakpoints and positioning"*, *"variables, classes, and component instances"*.
- **Data API tools** — operaciones de contenido: *"Create, read, update, and delete collection items"*, *"Upload, organize, and manage media files"*, *"Access site settings, domains, and configuration"*.

Cubre desde *"updateá el título de la home"* hasta cosas más jugosas como auditar SEO sobre todas las páginas o construir secciones de design system completas.

### Qué le podés pedir

Los tres ejemplos que la documentación oficial sugiere como prompts representativos:

- *"List all my collections and show me their field structures."*
- *"Audit my site for broken links, missing alt text, and incomplete meta descriptions."*
- *"Create a responsive hero section with a headline, description, and CTA button."*

### Qué token necesitás

La documentación oficial enfatiza **OAuth** como método recomendado: el agente se autentica con tu cuenta de Webflow sin que tengas que copiar/pegar API keys.

Para el modo local con `webflow-mcp-server` (lo que instala este conector), se usa un **API token** que generás en [webflow.com/dashboard/account/integrations](https://webflow.com/dashboard/account/integrations):

1. Andá a la sección "API Access" / "Integrations" de tu Workspace o cuenta.
2. Creá un token nuevo eligiendo entre Site Token (alcance: un sitio) o Workspace Token (alcance: toda la workspace).
3. Marcá los scopes que necesites: `sites:read`, `cms:read`, `cms:write`, `pages:read`, `pages:write`.
4. Copiá el token y pegalo cuando el Lab te pida `WEBFLOW_TOKEN`. Cifrado en tu Keychain, nunca plaintext en disco.

Para edición visual con bridge a Designer (no solo CMS) seguí la [guía oficial de AI tools](https://developers.webflow.com/data/v2.0.0/docs/ai-tools) — incluye instalar la MCP Bridge App de Webflow.

--- dev ---

`webflow-mcp-server` (oficial de Webflow) corre con `npx` y se autentica vía `WEBFLOW_TOKEN` contra la Data API. La documentación oficial separa dos surfaces: Designer API (canvas) y Data API (CMS + site config); el server local cubre principalmente la segunda.

Modo remoto OAuth también soportado vía `mcp-remote`, evitando manejo de tokens por usuario. El Site Token tiene alcance per-site; el Workspace Token, alcance global. Scopes individuales se eligen al generar el token.

Licencia: MIT. Fuente: npm `webflow-mcp-server` y `developers.webflow.com/data/v2.0.0/docs/ai-tools`.
