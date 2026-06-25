---
name: PostgreSQL
logo: /connectors/postgres.svg
category: database
status: available
simpleTitle: "Que tu IA consulte Postgres en modo seguro"
simpleSubtitle: "Introspección de schema y queries read-only para análisis sin escribir SQL a mano."
devTitle: "Postgres MCP Connector"
devSubtitle: "Servidor oficial @modelcontextprotocol: schema resources + tool query en transacción READ ONLY."
ctaUrl: "https://www.postgresql.org"
manifest:
  mcpServers:
    postgres:
      command: npx
      args: ["-y", "@modelcontextprotocol/server-postgres", "${SECRET:POSTGRES_URL}"]
affiliate: false
tagline: "Consultas Postgres read-only desde tu IA"
originalAuthor: "Anthropic, PBC"
originalAuthorUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-postgres"
license: "MIT"
licenseUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-postgres"
marketplaceSource: "anthropic"
marketplaceCategory: "desktop"
---
**PostgreSQL** es la base de datos relacional open-source que usan miles de productos para datos críticos. El server MCP oficial provee *"read-only access to PostgreSQL databases"* para que Claude inspeccione schemas y ejecute consultas de lectura sin abrir una herramienta SQL aparte.

Qué hace: expone una tool `query` para ejecutar SQL read-only contra la base conectada y recursos de schema por tabla. El README oficial aclara que *"All queries are executed within a READ ONLY transaction"*, por eso es ideal para análisis, soporte, debugging y exploración de datos.

### Qué le podés pedir

- *"List the tables available in this database and explain the likely relationships."*
- *"Run a SELECT that counts active customers by plan for the last 30 days."*
- *"Inspect the schema for the `orders` table and suggest the safest query for revenue by month."*

### Qué conexión necesitás

Necesitás una **Postgres connection URL** para una base concreta, por ejemplo `postgresql://user:password@host:5432/db`. El README oficial muestra el argumento de conexión en `args` y dice: *"Replace `/mydb` with your database name."*

1. Creá un usuario Postgres dedicado para Terminal Sync.
2. Dale permisos mínimos de lectura sobre las tablas necesarias.
3. Pegá la connection URL cuando el Lab pida `POSTGRES_URL`. Terminal Sync la guarda cifrada en tu Keychain.

Aunque el server ejecuta queries en transacción READ ONLY, recomendamos usar además un rol de base de datos read-only para defensa en profundidad.

--- dev ---

`@modelcontextprotocol/server-postgres` es un paquete oficial publicado por `Anthropic, PBC` bajo el scope `@modelcontextprotocol`. Manifest verificado: `npx -y @modelcontextprotocol/server-postgres ${SECRET:POSTGRES_URL}`; el README oficial documenta la connection URL como argumento posicional del server.

Componentes verificados contra el README oficial: tool `query` con input `sql` para ejecutar consultas read-only; resources `postgres://<host>/<table>/schema` con JSON schema de cada tabla, nombres de columnas y tipos de datos, autodetectados desde metadata de la base.

Gotcha: `--help` no está implementado como flag de ayuda; el binario espera una URL válida como argumento. El gate de arranque se validó con una URL Postgres sintácticamente válida y sin credenciales reales.

Terminal Sync mantiene la URL en el Keychain via `apiKeyHelper`, sincronizada cifrada con AES-256-GCM entre máquinas.

Licencia: MIT. Fuente: README y package metadata de `@modelcontextprotocol/server-postgres` en npm.
