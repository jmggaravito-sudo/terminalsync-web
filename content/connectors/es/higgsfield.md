---
name: Higgsfield
logo: /connectors/higgsfield.svg
category: automation
status: available
simpleTitle: "Generá imágenes y videos desde tu agente"
simpleSubtitle: "MCP oficial de Higgsfield: 30+ modelos creativos para imagen, video, personajes e historial."
devTitle: "Higgsfield MCP Connector"
devSubtitle: "Official hosted Higgsfield MCP (mcp.higgsfield.ai) — creative generation over account OAuth."
ctaUrl: "https://higgsfield.ai/mcp"
tokenHelpUrl: "https://higgsfield.ai/mcp"
manifest:
  mcpServers:
    higgsfield:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.higgsfield.ai/mcp"]
affiliate: false
tagline: "Imágenes y videos, al alcance del agente"
originalAuthor: "Higgsfield"
originalAuthorUrl: "https://higgsfield.ai/mcp"
license: "proprietary"
licenseUrl: "https://higgsfield.ai/terms"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Higgsfield** es una plataforma creativa de IA para generar imágenes y videos. Su conector MCP oficial le da a tu agente acceso a los modelos creativos de Higgsfield desde tu flujo de trabajo: generar imágenes, crear videos cortos, entrenar o reutilizar personajes y consultar tu historial de generaciones.

Le pedís *"Armá un video UGC vertical de 15 segundos para este termo"* y el agente puede planear la pieza, llamar a Higgsfield y traer el resultado. Le pedís *"Creá tres fotos de producto desde esta imagen de referencia"* y puede iterar en distintas direcciones visuales. Higgsfield indica que el uso consume el mismo sistema de créditos de tu cuenta.

### Qué le podés pedir

- *"Generá un video UGC 9:16 para este producto, con captions y CTA claro."*
- *"Creá una foto de producto cinematográfica para esta nueva oferta."*
- *"Convertí esta imagen fija en una idea corta con movimiento para Reels."*
- *"Usá una generación anterior como referencia y hacé una versión localizada al español."*

### Cómo conectás

Este conector **no requiere API key**:

1. Activás Higgsfield en TerminalSync.
2. El conector abre el login de Higgsfield en el navegador.
3. Aprobás con tu cuenta de Higgsfield. Tu plan/créditos controlan la generación.

**Aclaración honesta:** es un **server MCP hospedado por Higgsfield** (`https://mcp.higgsfield.ai/mcp`). La generación corre en el servicio de Higgsfield, incluyendo trabajos de video asincrónicos que pueden tardar más que una imagen.

--- dev ---

Higgsfield publica un endpoint MCP oficial en `https://mcp.higgsfield.ai/mcp`. La página oficial dice que cualquier cliente compatible con MCP puede conectarse, que no hace falta API key y que la auth ocurre con la cuenta de Higgsfield del usuario. También documenta la ruta CLI (`npm i -g @higgsfield/cli`, `higgsfield auth login`, opcional `npx skills add higgsfield-ai/skills`) para flujos más de terminal.

TerminalSync puentea el endpoint hospedado localmente con:

```
npx -y mcp-remote@latest https://mcp.higgsfield.ai/mcp
```

Las capacidades documentadas por Higgsfield incluyen generación de imágenes, videos de hasta 15 segundos, más de 30 modelos, entrenamiento de personajes/Soul, navegación del historial de generaciones, workflows con imágenes de referencia y polling asincrónico de resultados.

Licencia: términos SaaS propietarios. Fuente: higgsfield.ai/mcp y higgsfield.ai/cli.
