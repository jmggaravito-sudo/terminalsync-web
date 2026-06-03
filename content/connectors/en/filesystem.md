---
name: Filesystem
logo: /connectors/filesystem.svg
category: dev
status: available
simpleTitle: "Your AI reads and writes files on your computer"
simpleSubtitle: "\"Review every README in this folder\", \"create the missing tests\" — directly on disk."
devTitle: "Local Filesystem MCP"
devSubtitle: "Sandboxed file read/write over allow-listed directories."
ctaUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem"
affiliate: false
tagline: "Read and write local files safely"
originalAuthor: "Anthropic"
originalAuthorUrl: "https://github.com/modelcontextprotocol/servers"
license: "MIT"
marketplaceSource: "anthropic"
marketplaceCategory: "desktop"
---
You tell your AI: "look at this folder and tell me what's in each subdirectory." It does. You say: "create file `notes.md` with this summary." It does — only in the folders you allowed.

Sandboxed by allow-list: paths outside the list are invisible to the AI.

--- dev ---

`@modelcontextprotocol/server-filesystem` accepts an allow-list of directories. Operations: `read_file`, `write_file`, `edit_file`, `create_directory`, `list_directory`, `move_file`, `search_files`. Paths outside the allow-list return permission denied — no silent escapes.

License: MIT. Source: github.com/modelcontextprotocol/servers/tree/main/src/filesystem.
