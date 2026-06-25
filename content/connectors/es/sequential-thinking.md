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
**Sequential Thinking** habilita, en palabras del README oficial, *"a detailed, step-by-step thinking process for problem-solving and analysis"*. Está pensado para tareas *"where the full scope might not be clear initially"* y donde necesitás *"course correction"* — escenarios en los que la IA tiende a saltar a la conclusión antes de mirar bien.

Le da estructura al razonamiento: cada pensamiento se numera, se puede revisar uno anterior (`isRevision`/`revisesThought`), o abrir una rama paralela con una hipótesis alternativa (`branchFromThought`/`branchId`). Además permite *"adjust the total number of thoughts dynamically"* y *"generate and verify solution hypotheses"*. No agrega capacidades nuevas — agrega disciplina.

### Qué le podés pedir

Los tres ejemplos del README oficial muestran bien para qué sirve:

- *"Plan a database migration from PostgreSQL 14 to 16, list risks, and revise the plan if downtime exceeds 5 minutes."*
- *"Debug why this deployment only fails in production and show your reasoning step by step."*
- *"Compare three architecture options for a file sync engine and branch if one assumption turns out to be wrong."*

### Qué necesitás configurar

**Nada.** No pide token, no pide cuenta, no pide acceso a archivos ni servicios. Es una herramienta de razonamiento puro que vive adentro del agente — instalás y ya está disponible.

Pensalo como darle al agente una hoja en blanco mental donde puede pensar fuerte antes de hablar. Particularmente útil combinado con otros conectores: cuando el agente tiene que decidir qué consultar en Sentry, qué archivos leer del Filesystem, qué query hacer a Supabase, este conector le ayuda a planear esa secuencia.

--- dev ---

`@modelcontextprotocol/server-sequential-thinking` (oficial) expone la tool `sequentialthinking`. Cada step tiene `thought`, `thoughtNumber`, `totalThoughts`, `nextThoughtNeeded`. Soporta revisión (`isRevision`, `revisesThought`) y branching (`branchFromThought`, `branchId`). `totalThoughts` se ajusta dinámicamente.

El server no persiste nada — todo el state vive en la cadena de tool calls del turno. No requiere secrets ni configuración.

Licencia: MIT. Fuente: github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking.
