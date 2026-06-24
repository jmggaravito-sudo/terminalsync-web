---
name: Sequential Thinking
logo: /connectors/sequential-thinking.svg
category: productivity
status: available
simpleTitle: "Tu IA ordena problemas complejos paso a paso"
simpleSubtitle: "Útil para planes, debugging y decisiones con varias variables antes de responder."
devTitle: "Sequential Thinking MCP Server"
devSubtitle: "Structured step-by-step reasoning tool with revision and branching support."
ctaUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking"
manifest:
  mcpServers:
    sequential-thinking:
      command: npx
      args: ["-y", "@modelcontextprotocol/server-sequential-thinking"]
affiliate: false
tagline: "Razonamiento estructurado para tareas difíciles"
originalAuthor: "modelcontextprotocol"
originalAuthorUrl: "https://github.com/modelcontextprotocol"
license: "MIT"
licenseUrl: "https://github.com/modelcontextprotocol/servers/blob/main/LICENSE"
marketplaceSource: "anthropic"
marketplaceCategory: "desktop"
---
Para problemas con muchas piezas — elegir una arquitectura, planear un refactor, investigar un bug raro — la IA puede saltar demasiado rápido a la conclusión.

Este conector le da una herramienta para desarmar el problema en pasos, revisar hipótesis y ajustar el camino antes de darte una respuesta final.

--- dev ---

`@modelcontextprotocol/server-sequential-thinking` expone la herramienta `sequentialthinking`, diseñada para razonamiento paso a paso con soporte de revisión y branching. No requiere secrets.

Licencia: MIT. Fuente: github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking.
