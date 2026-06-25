---
name: Filesystem
logo: /connectors/filesystem.svg
category: dev
status: available
simpleTitle: "Your AI reads and writes files on your computer"
simpleSubtitle: "You pick which folders it can touch — everything else is out of reach."
devTitle: "Filesystem MCP Server"
devSubtitle: "Official MCP filesystem server: read/write, search, edit, allow-listed directories."
ctaUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem"
manifest:
  mcpServers:
    filesystem:
      command: npx
      args: ["-y", "@modelcontextprotocol/server-filesystem"]
affiliate: false
tagline: "Local files, with an allow-list"
originalAuthor: "modelcontextprotocol"
originalAuthorUrl: "https://github.com/modelcontextprotocol"
license: "MIT"
licenseUrl: "https://github.com/modelcontextprotocol/servers/blob/main/LICENSE"
marketplaceSource: "anthropic"
marketplaceCategory: "desktop"
---
**Filesystem** is the simplest and most useful tool in the catalog. In the words of its official README, it's a *"Node.js server implementing Model Context Protocol (MCP) for filesystem operations"* — your AI gains the ability to read, write, list, search, edit and move files directly on your disk.

But it's not full access. You declare a list of allowed folders (an "allow-list") and anything outside that list is invisible to the agent. If you allow `~/Documents/projects`, it can't look at `~/Desktop`, `/etc`, or your photos. Sandboxed by design.

### What you can ask

- *"Read every `.md` in my notes folder and tell me which ones are travel notes vs meeting notes."*
- *"In `~/Documents/projects/client-X`, create a `proposal-may/` folder with a `README.md` explaining the structure."*
- *"Search my notes for where I mentioned 'pricing' last week and pull the context."*

### What you need to configure

Unlike the rest, this connector **doesn't ask for a token**, but it does ask that you pick **which folders it can access**. There are two ways, both documented in the official README:

**Option 1 — CLI arguments** (the classic): open `~/.claude.json`, find the `filesystem` block, and append each allowed folder to the end of the `args` array:

```json
"filesystem": {
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/your-name/Desktop", "/Users/your-name/Documents/projects"]
}
```

**Option 2 — MCP Roots protocol** (recommended by the official docs): the client can declare folders dynamically without restarting the server. When the client sends `roots`, they *"completely replace any server-side Allowed directories when provided."* Useful for environments where the folder changes per session.

Each path you add is one more key on the agent's keyring. Start small (one specific projects folder) and grow it as you find you need to.

--- dev ---

`@modelcontextprotocol/server-filesystem` exposes 14 tools verified against the official README: read (`read_text_file`, `read_media_file`, `read_multiple_files`, `list_directory`, `directory_tree`, `search_files`, `get_file_info`, `list_allowed_directories`) and write (`write_file`, `edit_file`, `create_directory`, `move_file`). `read_text_file` supports `head`/`tail`; `edit_file` has pattern matching + dry-run; `search_files` uses glob.

Operations on paths outside the allow-list return `permission denied` — no silent escapes. The allow-list is defined via positional args OR via MCP Roots (the latter, when sent, completely replaces the startup allow-list).

The catalog manifest currently ships without paths by default. The Lab doesn't inject the session workspace into MCP args at runtime; known debt that closes when the `InstallModal` gains an `installPath` field analogous to `installEnv`, or when client-side `roots` wiring lands.

License: MIT. Source: github.com/modelcontextprotocol/servers/tree/main/src/filesystem.
