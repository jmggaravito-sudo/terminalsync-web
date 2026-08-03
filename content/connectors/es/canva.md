---
name: Canva
logo: /connectors/canva.svg
category: automation
status: available
simpleTitle: "Creá y editá diseños de Canva desde tu agente"
simpleSubtitle: "Conector oficial de Canva: generá diseños, redimensioná, buscá en tu workspace y exportá."
devTitle: "Canva MCP Connector"
devSubtitle: "Official hosted Canva MCP (mcp.canva.com) — design generation and management over OAuth."
ctaUrl: "https://www.canva.com"
tokenHelpUrl: "https://www.canva.com/help/mcp-agent-setup/"
manifest:
  mcpServers:
    canva:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.canva.com/mcp"]
affiliate: false
tagline: "Tu workspace de diseño, al alcance del agente"
originalAuthor: "Canva"
originalAuthorUrl: "https://www.canva.dev/docs/mcp/"
license: "proprietary"
licenseUrl: "https://www.canva.com/policies/terms-of-use/"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Canva** es la herramienta de diseño que usan los equipos para armar posts para redes, presentaciones, flyers y otros documentos de marketing sin necesidad de saber diseño. El **Conector de IA de Canva** oficial es un **server MCP hospedado** que le permite a tu agente generar diseños con la IA de Canva, encontrar diseños existentes en tu workspace, redimensionarlos para otro canal, y exportarlos —todo a través de tu propia cuenta de Canva.

Le pedís *"Generá un set de posts para Instagram para nuestra oferta de verano usando nuestro brand kit"* y crea los diseños con la IA de Canva. Le pedís *"Redimensioná este flyer al formato de Instagram Story"* y reformatea un diseño existente en vez de que lo tengas que rearmar a mano. Devuelve los diseños editables a tus Proyectos de Canva, así que podés abrirlos y pulirlos después.

### Qué le podés pedir

- *"Generá una presentación completa con el resumen de ventas de esta semana."*
- *"Redimensioná este flyer al formato de Instagram Story."*
- *"Encontrá mi diseño de Canva editado más recientemente."*
- *"Exportá esta presentación como PDF."*

### Cómo conectás

Este conector **no te pide pegar ninguna API key**. Usa el login de tu propia cuenta de Canva:

1. Cuando lo actives, se abre una ventana del navegador para que inicies sesión en Canva y autorices el acceso (OAuth).
2. Aprobás los permisos con tu cuenta — el conector solo puede ver y hacer lo que esa cuenta tenga permitido.
3. Listo: no hay token que copiar ni que renovar a mano. La guía oficial de configuración de Canva está en [canva.com/help](https://www.canva.com/help/mcp-agent-setup/).

**Aclaración honesta:** es un server **hospedado por Canva** (no corre en tu computadora). Algunas capacidades dependen de tu plan de Canva: generación de diseños, edición, búsqueda, exportaciones, comentarios y subida de assets funcionan en cualquier plan; **redimensionar diseños a nuevas dimensiones requiere Canva Pro o superior**; **autocompletar templates con tu brand kit y brand templates requiere Canva Enterprise**. Lo que el agente puede ver o crear queda acotado por lo que tu cuenta ya puede acceder.

--- dev ---

Canva publica un **server MCP remoto/hospedado** oficial en `https://mcp.canva.com/mcp`, documentado en `www.canva.dev/docs/mcp/` (orientado a admins de IT y a quienes construyen integraciones) y en `www.canva.com/help/mcp-agent-setup/` (la guía de configuración para usuarios finales de Claude, ChatGPT, Cursor, etc.). No hay comando stdio local: te conectás a la URL hospedada y localmente hacés de puente con `mcp-remote`:

```
npx -y mcp-remote@latest https://mcp.canva.com/mcp
```

**Nota de sourcing:** Canva también documenta un MCP separado, solo para developers, en `www.canva.dev/docs/apps/mcp-server/` que da "asistencia de desarrollo con IA para apps e integraciones de Canva" —un asistente de docs/SDK para quienes *construyen* Canva Apps, no para gestionar diseños. Esa página explícitamente redirige a los usuarios finales a otro lado: *"Looking for the Canva AI Connector to help with your Canva designs? See our Help Center."* Este conector shipea ese AI Connector (`mcp.canva.com`), no el asistente de dev-docs — el de dev-docs hubiera fallado el filtro de persona empresario-first de este catálogo, igual que pasó con el MCP de Wix, que es solo para devs.

La auth usa **Client ID Metadata Documents (CIMD)** como método preferido de Canva, con **Dynamic Client Registration (DCR)** soportado por compatibilidad hacia atrás; según la documentación, *"individual user authentication is mandatory"*. `mcp-remote` maneja este flujo tipo OAuth en el navegador, así que el manifest no declara `env`/secret.

**Capacidades, verbatim de la documentación:** generación programática de diseños a partir de descripciones de texto, modificaciones puntuales de diseño en lenguaje natural, búsqueda en la librería y descubrimiento de diseños, gestión de assets y de marca, exportación en múltiples formatos (PDF, PNG, JPG, PPTX, MP4), y comentarios/flujos colaborativos sobre el diseño.

**Gate por plan, según la documentación:** todos los planes tienen generación, edición, búsqueda, exportaciones, comentarios y subida de assets; Canva Pro en adelante suma el redimensionado de diseños a nuevas dimensiones; Canva Enterprise suma el autocompletado de templates con brand kits y brand templates. Los rate limits están documentados por operación en la referencia de tools de Canva, no en la página de overview.

Canva no publica un repo open-source ni un LICENSE para el server hospedado — se trata como términos de SaaS propietario, mismo patrón que Zapier/Ideogram/Asana/Klaviyo en este catálogo. Fuente: canva.dev/docs/mcp, canva.com/help/mcp-agent-setup.
