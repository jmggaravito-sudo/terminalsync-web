---
name: TopView MCP
logo: /connectors/topview.svg
category: automation
status: available
simpleTitle: "Convierte briefs de campaña en investigación, estrategia y creatividades"
simpleSubtitle: "TopView MCP oficial: flujos de workspace de campañas para research, planificación, imágenes, videos, conceptos estilo UGC y storyboards."
devTitle: "TopView MCP Connector"
devSubtitle: "Official TopView MCP remote server — campaign workspace workflows from topview.ai and mcp.topview.ai."
ctaUrl: "https://www.topview.ai/mcp"
affiliate: false
tagline: "Convierte briefs de campaña en investigación, estrategia y creatividades."
originalAuthor: "TopView"
originalAuthorUrl: "https://www.topview.ai/mcp"
license: "proprietary"
licenseUrl: "https://www.topview.ai/terms"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**TopView MCP** conecta tu cliente de IA con el workspace de campañas de TopView. Ayuda a convertir un brief de campaña en investigación de mercado, estrategia, planificación de contenido y producción creativa para anuncios, imágenes, videos, conceptos estilo UGC y storyboards.

TopView lo presenta como un agente de marketing de punta a punta: un solo brief puede pasar de señales de mercado e investigación competitiva a planes de campaña, content briefs, dirección creativa y assets generados dentro del mismo Campaign Workspace.

### Qué le puedes pedir

- *"Investiga un mercado o ángulo competitivo para esta campaña."*
- *"Convierte este brief en un plan de campaña y una estrategia de contenido."*
- *"Prepara direcciones creativas, guiones, storyboards o conceptos de ads estilo UGC."*
- *"Genera assets de campaña y déjalos en el mismo workspace para revisarlos."*

### Cómo se conecta

TopView MCP se configura desde **la configuración remota de TopView**, no como un sidecar local empaquetado dentro de TerminalSync:

1. Agrega la URL del servidor MCP de TopView en tu cliente compatible: `https://mcp.topview.ai/mcp`.
2. Inicia sesión con tu cuenta de TopView cuando se abra el flujo de login.
3. Trabaja desde el Campaign Workspace de TopView para gestionar planes, boards, imágenes, videos y el flujo creativo.

**Aclaración honesta:** TerminalSync **no** empaqueta un sidecar local de TopView ni inventa un OAuth aparte acá. La configuración oficial de TopView indica conectar la URL MCP remota, iniciar sesión con tu cuenta de TopView y continuar el flujo en Campaign Workspace.

--- dev ---

Fuente oficial: `https://www.topview.ai/mcp`.

TopView documenta MCP como un **servidor MCP remoto** en `https://mcp.topview.ai/mcp`. Su Quick Start indica conectar la URL MCP, abrir el link de login que devuelve el cliente, iniciar sesión con una cuenta TopView y luego usar las tools desde TopView Campaign Workspace. La misma página lo posiciona como un workflow que junta insights de mercado, entregables de estrategia y producción creativa en un solo workspace.

Para el contrato del catálogo de TerminalSync, este item se trata como **remoto / gestionado por el usuario**, parecido a otras ofertas MCP configuradas por cuenta. Acá **no** distribuimos un manifest `mcpServers` estático ni un binario sidecar local porque el setup oficial depende del endpoint MCP remoto de TopView y de su flujo de login con cuenta propia.

Licencia: términos SaaS propietarios. Fuente: topview.ai/mcp.
