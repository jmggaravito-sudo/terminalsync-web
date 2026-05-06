---
name: Engram
logo: /connectors/engram.svg
category: dev
status: available
simpleTitle: "Give your AI a memory that doesn't reset"
simpleSubtitle: "So Claude remembers what you decided last week — no more re-explaining your project from scratch every session."
devTitle: "Engram MCP Connector"
devSubtitle: "Persistent memory layer for AI coding agents — Go binary, SQLite + FTS5, agent-agnostic via MCP."
ctaUrl: "https://github.com/Gentleman-Programming/engram"
manifest:
  mcpServers:
    engram:
      command: engram
      args: ["mcp"]
affiliate: false
tagline: "One brain across every agent — and now, across every machine"
---

Every Claude Code session today starts the same: you re-explain your stack, your conventions, the bug you fixed last Tuesday. The model is brilliant, but it has amnesia.

Engram fixes that. As you work, it generates structured summaries of what was decided, what was tried, what failed — and feeds them back to the agent next session. It's like giving your AI a notebook it actually re-reads.

Configured once with Terminal Sync, your Engram setup follows you to every machine. Switch from laptop to studio tower — same brain, no re-config.

--- dev ---

Engram is a single Go binary (SQLite + FTS5) that exposes a memory store as an MCP server, HTTP API, CLI, and TUI. Agent-agnostic: Claude Code, OpenCode, Cursor, Codex, Gemini CLI, VS Code Copilot, Antigravity, Windsurf — anything that speaks MCP.

Install via Homebrew (`brew install gentleman-programming/tap/engram`) or the Claude Code marketplace (`claude plugin install engram`). The local DB lives at `~/.engram/engram.db`.

Terminal Sync handles the part Engram doesn't: syncing your `claude_desktop_config.json` and the Engram MCP entry across machines. The binary itself manages the memory DB locally; Terminal Sync makes sure every machine wires the agent to the same MCP server with the same config — encrypted AES-256-GCM in your Drive, never plaintext on disk.

**Best for**: long-running projects where context accumulates (architecture decisions, codebase conventions, debugging history). MIT-licensed, open source, runs offline.
