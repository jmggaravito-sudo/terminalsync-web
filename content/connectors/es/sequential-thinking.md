---
name: Sequential Thinking
logo: /connectors/sequential-thinking.svg
category: productivity
status: available
simpleTitle: "Tu IA piensa paso por paso en problemas complejos"
simpleSubtitle: "Para decisiones con muchas variables — desarma el razonamiento antes de responder."
devTitle: "Sequential Thinking MCP"
devSubtitle: "Tool que expone un scratchpad de razonamiento stepwise al modelo."
ctaUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/sequential-thinking"
manifest:
  mcpServers:
    sequential-thinking:
      command: npx
      args: ["-y", "@modelcontextprotocol/server-sequential-thinking"]
affiliate: false
tagline: "Razonamiento stepwise estructurado"
originalAuthor: "Anthropic"
originalAuthorUrl: "https://github.com/modelcontextprotocol/servers"
license: "MIT"
marketplaceSource: "anthropic"
marketplaceCategory: "desktop"
---
Para problemas con muchas variables — elegir entre arquitecturas, planear un refactor multi-step, pesar pros y contras — la IA tiende a saltar al final.

Este conector le da al modelo un "scratchpad" donde desarma el razonamiento paso por paso antes de responder.

--- dev ---

`@modelcontextprotocol/server-sequential-thinking` expone `sequentialthinking` con soporte de branching/revising. El modelo emite pensamientos estructurados, puede revisar pasos previos, y llega a una conclusión más justificada.

Licencia: MIT.
