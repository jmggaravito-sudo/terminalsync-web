---
name: Filesystem
logo: /connectors/filesystem.svg
category: dev
status: available
simpleTitle: "Your AI reads and writes files on your computer"
simpleSubtitle: "You pick which folders it can touch — everything else is out of reach."
devTitle: "Filesystem MCP Server"
devSubtitle: "Expose allow-listed local directories over the official MCP filesystem server."
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
**Filesystem** is the simplest and most useful tool in the catalog: your AI gains the ability to read and write files directly on your disk. No copy-paste, no screenshots, no describing content by hand.

But it's not full access. You declare a list of allowed folders (an "allow-list") and anything outside that list is invisible to the agent. If you allow `~/Documents/projects`, it can't look at `~/Desktop`, `/etc`, or your photos. Sandboxed by design.

### What you can ask

- *"Read every `.md` in my notes folder and tell me which ones are travel notes vs meeting notes."*
- *"In `~/Documents/projects/client-X`, create a `proposal-may/` folder with a `README.md` explaining the structure."*
- *"Search my notes for where I mentioned 'pricing' last week and pull the context."*

### What you need to configure

Unlike the rest, this connector **doesn't ask for a token**, but it does ask that you pick **which folders it can access**. Without that, the server starts but has nothing to look at.

After installing, open `~/.claude.json`, find the `filesystem` block, and append each allowed folder to the end of the `args` array. Typical example:

```json
"filesystem": {
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/your-name/Desktop", "/Users/your-name/Documents/projects"]
}
```

You can add as many as you want. Think of it this way: each path you add is one more key on the agent's keyring. Start small (one specific projects folder) and grow it as you find you need to.

--- dev ---

`@modelcontextprotocol/server-filesystem` runs through `npx` and requires at least one allow-listed path as a positional argument. Exposed tools: `read_file`, `write_file`, `edit_file`, `create_directory`, `list_directory`, `move_file`, `search_files`. Operations on paths outside the allow-list return `permission denied` — no silent escapes.

The catalog manifest currently ships without paths by default. The Lab doesn't inject the session workspace into MCP args at runtime yet; known debt that closes when the `InstallModal` gains an `installPath` field analogous to `installEnv`.

License: MIT. Source: github.com/modelcontextprotocol/servers/tree/main/src/filesystem.
