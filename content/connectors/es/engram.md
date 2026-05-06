---
name: Engram
logo: /connectors/engram.svg
category: dev
status: available
simpleTitle: "Dale a tu IA una memoria que no se reinicia"
simpleSubtitle: "Para que Claude se acuerde de lo que decidiste la semana pasada — basta de re-explicar tu proyecto desde cero cada sesión."
devTitle: "Engram MCP Connector"
devSubtitle: "Capa de memoria persistente para agentes de código — binario Go, SQLite + FTS5, agnóstico vía MCP."
ctaUrl: "https://github.com/Gentleman-Programming/engram"
manifest:
  mcpServers:
    engram:
      command: engram
      args: ["mcp"]
affiliate: false
tagline: "Un solo cerebro para todos tus agentes — y ahora, para todas tus máquinas"
---

Cada sesión de Claude Code arranca igual: le re-explicás el stack, las convenciones, el bug que arreglaste el martes. El modelo es brillante, pero tiene amnesia.

Engram lo soluciona. Mientras trabajás, genera resúmenes estructurados de lo que se decidió, lo que se probó y lo que falló — y se los pasa al agente en la próxima sesión. Es como darle a tu IA una libreta que sí relee.

Configurado una vez con Terminal Sync, tu setup de Engram te sigue a cada máquina. Cambiás del laptop a la torre del estudio — mismo cerebro, sin reconfigurar.

--- dev ---

Engram es un binario Go (SQLite + FTS5) que expone un store de memoria como MCP server, HTTP API, CLI y TUI. Agnóstico al agente: Claude Code, OpenCode, Cursor, Codex, Gemini CLI, VS Code Copilot, Antigravity, Windsurf — cualquier cliente que hable MCP.

Instalación vía Homebrew (`brew install gentleman-programming/tap/engram`) o desde el marketplace de Claude Code (`claude plugin install engram`). La DB local vive en `~/.engram/engram.db`.

Terminal Sync se encarga de lo que Engram no: sincronizar tu `claude_desktop_config.json` y la entrada MCP de Engram entre máquinas. El binario maneja la DB de memoria localmente; Terminal Sync se asegura de que cada máquina conecte al agente con el mismo MCP server y la misma config — cifrado AES-256-GCM en tu Drive, nunca plaintext en disco.

**Ideal para**: proyectos largos donde el contexto se acumula (decisiones de arquitectura, convenciones del codebase, historial de debugging). Licencia MIT, open source, corre offline.
