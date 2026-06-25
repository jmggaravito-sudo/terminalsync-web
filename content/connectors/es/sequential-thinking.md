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
**Sequential Thinking** es una herramienta para tareas donde la IA tiende a saltar a la respuesta antes de pensar bien. Le da estructura para desarmar el problema, escribir hipótesis, revisar pasos y corregir el rumbo si se equivoca, en vez de tirar la primera idea que se le ocurre.

No agrega capacidades nuevas, agrega disciplina. Es la diferencia entre "te respondo de una" y "te respondo después de mirarlo desde 3 ángulos". Especialmente útil cuando hay incertidumbre, varias variables en juego, o cuando un error temprano arrastraría todo el resultado.

### Qué le podés pedir

- *"Estoy decidiendo entre 3 estructuras societarias para mi empresa nueva — pensalo paso a paso, considerando impuestos, complejidad y mi situación personal."*
- *"Tengo un bug raro: la app se cuelga solo los martes a las 3pm. Razoná las causas posibles antes de proponer un fix."*
- *"Planeá la migración de mi base de datos a Postgres, considerando que tengo 200 GB de datos en producción y no puedo tener downtime."*

### Qué necesitás configurar

**Nada.** No pide token, no pide cuenta, no pide acceso a archivos ni servicios. Es una herramienta de razonamiento puro que vive adentro del agente — instalás y ya está disponible.

Pensalo como darle al agente una hoja en blanco mental donde puede pensar fuerte antes de hablar. Particularmente útil combinado con otros conectores: cuando el agente tiene que decidir qué consultar en Sentry, qué archivos leer del Filesystem, qué query hacer a Supabase, este conector le ayuda a planear esa secuencia.

--- dev ---

`@modelcontextprotocol/server-sequential-thinking` expone la herramienta `sequentialthinking`. Cada step tiene `thought`, `thoughtNumber`, `totalThoughts`, `nextThoughtNeeded`. Soporta revisión (`isRevision`, `revisesThought`) y branching (`branchFromThought`, `branchId`). El server no persiste nada — todo el state vive en la cadena de tool calls del turno.

No requiere secrets ni configuración. Buen complemento para tareas multi-paso donde el agente combina varios MCPs.

Licencia: MIT. Fuente: github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking.
