---
name: Filesystem
logo: /connectors/filesystem.svg
category: dev
status: available
simpleTitle: "Your AI reads and writes files on your computer"
simpleSubtitle: "Pick an allowed folder and the AI works only there: read, list, edit and create files."
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
You say: "look at this folder and tell me what's in each subdirectory." It does. You say: "create file `notes.md` with this summary." It does — only inside the path you allowed.

The key point: it is not full access to your disk. The server receives a list of allowed directories and everything else is out of reach.

**Before using:** this connector needs to know which folders your AI can access. After installing, open `~/.claude.json`, find the `filesystem` block, and append the allowed paths to its `args` array. Example:

```json
"filesystem": {
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/your-name/Desktop", "/Users/your-name/Documents"]
}
```

Without paths, the connector starts but can't read or write anything.

--- dev ---

`@modelcontextprotocol/server-filesystem` runs through `npx` and requires at least one allow-listed path as a positional argument. It exposes tools to read, write, edit, list, create directories, move files and search inside the allowed paths. No secrets required.

The catalog manifest ships without paths by default — the Lab doesn't inject the session workspace into MCP args yet. The user must edit `~/.claude.json` post-install. Known debt: once the Lab gains an `installPath` field analogous to `installEnv`, the `InstallModal` will prompt for it interactively.

License: MIT. Source: github.com/modelcontextprotocol/servers/tree/main/src/filesystem.
