---
name: PostgreSQL
logo: /connectors/postgres.svg
category: dev
status: available
simpleTitle: "Hablále a tu base Postgres en español"
simpleSubtitle: "\"¿Cuántos clientes activos en octubre?\", \"top 10 pedidos por monto\" — sin escribir SQL."
devTitle: "Postgres MCP Connector"
devSubtitle: "Conexión read-only vía PG_URL. Introspección de schema + ejecución de queries."
ctaUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/postgres"
affiliate: false
tagline: "Queries Postgres desde tu IA"
originalAuthor: "Anthropic"
originalAuthorUrl: "https://github.com/modelcontextprotocol/servers"
license: "MIT"
marketplaceSource: "anthropic"
marketplaceCategory: "desktop"
---
Le das la URL de conexión. Hace introspección del schema, lista tablas, ejecuta queries `SELECT` que vos le pedís en lenguaje natural. Por default es read-only — tranquilidad.

Útil para análisis ad-hoc, soporte, y explorar datos sin abrir una UI.

--- dev ---

`@modelcontextprotocol/server-postgres` requiere `PG_URL` (o args). Operaciones: `query` (solo SQL SELECT). Introspección de schema vía resource URI `postgres://schema/<table>`. Para writes usá un connector dedicado o una API controlada — éste es intencionalmente read-only.

Licencia: MIT.
