---
name: SQLite
logo: /connectors/sqlite.svg
category: dev
status: available
simpleTitle: "Preguntale a tu base SQLite local en español"
simpleSubtitle: "\"Listame todas las tablas\", \"cuántas filas tiene customers\" — sin abrir ningún IDE."
devTitle: "SQLite MCP Connector"
devSubtitle: "Conector de DB SQLite local con ejecución SQL completa."
ctaUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite"
affiliate: false
tagline: "Queries rápidas SQLite local"
originalAuthor: "Anthropic"
originalAuthorUrl: "https://github.com/modelcontextprotocol/servers"
license: "MIT"
marketplaceSource: "anthropic"
marketplaceCategory: "desktop"
---
Ideal para DBs locales: prototipos, exports, archives. Apuntás al archivo y le pedís a tu IA que lo lea o modifique conversacionalmente.

Permite writes — útil para armar datos demo, fixear filas, exportar reportes.

--- dev ---

`@modelcontextprotocol/server-sqlite` toma un argumento `--db-path`. Operaciones: `read_query`, `write_query`, `create_table`, `list_tables`, `describe_table`, `append_insight`. Incluye una capa de "business insights" memo.

Licencia: MIT.
