---
name: Ideogram
logo: /connectors/ideogram.svg
category: automation
status: available
simpleTitle: "Creá imágenes de marca desde tu agente"
simpleSubtitle: "MCP oficial de Ideogram: generación, edición e iteración visual con OAuth."
devTitle: "Ideogram MCP Connector"
devSubtitle: "Official hosted Ideogram MCP (mcp.ideogram.ai) — generate, edit and train visuals through OAuth."
ctaUrl: "https://ideogram.ai/features/mcp/"
tokenHelpUrl: "https://ideogram.ai/features/mcp/"
manifest:
  mcpServers:
    ideogram:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.ideogram.ai/mcp"]
affiliate: false
tagline: "Tu estudio visual, al alcance del agente"
originalAuthor: "Ideogram"
originalAuthorUrl: "https://ideogram.ai/features/mcp/"
license: "proprietary"
licenseUrl: "https://ideogram.ai/terms"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Ideogram** es el estudio de generación de imágenes que sirve cuando el texto, la tipografía, los mockups, posters, logos y piezas de campaña tienen que verse prolijos y no improvisados. El MCP oficial de Ideogram deja que tu agente genere y revise visuales desde el flujo de trabajo — sin pegar API keys en TerminalSync, usando el login de tu cuenta de Ideogram.

Le pedís *"Creá tres ideas de anuncio para Instagram para la promo del fin de semana, con headline en español bien legible"* y el agente puede llamar a Ideogram para generar opciones. Le pedís *"Remixá esto en formato cuadrado y mantené el mismo estilo de marca"* y puede iterar sin sacarte del chat. El uso corre contra tu plan/créditos de Ideogram.

### Qué le podés pedir

- *"Generá cuatro opciones de poster para el lanzamiento, con texto de titular legible."*
- *"Creá un mockup de producto para este bundle de skincare con look premium."*
- *"Remixá esta imagen en formato historia vertical manteniendo el mismo estilo."*
- *"Armá un set visual chico para una campaña: dirección de logo, hero image y posts."*

### Cómo conectás

Este conector **no te pide pegar una API key**. Usa tu cuenta de Ideogram:

1. Activás el conector en TerminalSync.
2. El puente `mcp-remote` abre el flujo OAuth de Ideogram en el navegador.
3. Iniciás sesión y autorizás el acceso. Ideogram indica que el uso por MCP consume el mismo plan/créditos que la app web.

**Aclaración honesta:** es un **server hospedado por Ideogram** (`https://mcp.ideogram.ai/mcp`). La generación visual ocurre en el servicio de Ideogram, y tu cuenta/plan controla qué se puede generar.

--- dev ---

Ideogram publica un **server MCP remoto oficial** en `https://mcp.ideogram.ai/mcp` con transporte streamable HTTP. La documentación oficial muestra el mismo endpoint para Claude, Claude Code, ChatGPT, Cursor, Cline, OpenCode y clientes MCP custom. La auth es OAuth con la cuenta de Ideogram del usuario; el conector MCP no requiere API key.

TerminalSync puentea el endpoint hospedado localmente con:

```
npx -y mcp-remote@latest https://mcp.ideogram.ai/mcp
```

La documentación oficial describe capacidades de generación de imágenes, edición/remix, estilos, fondos, tipografía y modelos custom. Para pipelines server-to-server, Ideogram recomienda la REST API en `developer.ideogram.ai`; este conector es la ruta agente/usuario con OAuth.

Licencia: términos SaaS propietarios. Fuente: ideogram.ai/features/mcp y developer.ideogram.ai.
