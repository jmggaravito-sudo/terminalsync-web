---
name: Filesystem
logo: /connectors/filesystem.svg
category: dev
status: available
simpleTitle: "Tu IA lee y escribe archivos en tu computadora"
simpleSubtitle: "\"Revisame todos los README de esta carpeta\", \"creame los tests que faltan\" — directo en disco."
devTitle: "Filesystem MCP local"
devSubtitle: "Lectura/escritura sandboxed sobre directorios allow-listed."
ctaUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem"
affiliate: false
tagline: "Lee y escribe archivos locales con seguridad"
originalAuthor: "Anthropic"
originalAuthorUrl: "https://github.com/modelcontextprotocol/servers"
license: "MIT"
marketplaceSource: "anthropic"
marketplaceCategory: "desktop"
---
Le decís: "miráme esta carpeta y contame qué hay en cada subdirectorio." Lo hace. Le decís: "creá el archivo `notas.md` con este resumen." Lo hace — solo en las carpetas que vos permitiste.

Sandboxed por allow-list: las rutas fuera de la lista son invisibles para la IA.

--- dev ---

`@modelcontextprotocol/server-filesystem` toma un allow-list de directorios. Operaciones: `read_file`, `write_file`, `edit_file`, `create_directory`, `list_directory`, `move_file`, `search_files`. Rutas fuera del allow-list devuelven permission denied — no hay escapes silenciosos.

Licencia: MIT. Fuente: github.com/modelcontextprotocol/servers/tree/main/src/filesystem.
