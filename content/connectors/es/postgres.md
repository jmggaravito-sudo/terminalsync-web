---
name: PostgreSQL
logo: /connectors/postgres.svg
category: database
status: available
simpleTitle: "Que tu IA consulte tu base Postgres en modo seguro"
simpleSubtitle: "Mirá cómo está armada la base y hacé preguntas — sin tocar nada, sin escribir SQL."
devTitle: "Postgres MCP Connector"
devSubtitle: "Servidor oficial @modelcontextprotocol: schema resources + tool query en transacción READ ONLY."
ctaUrl: "https://www.postgresql.org"
manifest:
  mcpServers:
    postgres:
      command: npx
      args: ["-y", "@modelcontextprotocol/server-postgres", "${SECRET:POSTGRES_URL}"]
affiliate: false
tagline: "Consultas Postgres en modo solo-lectura"
originalAuthor: "Anthropic, PBC"
originalAuthorUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-postgres"
license: "MIT"
licenseUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-postgres"
marketplaceSource: "anthropic"
marketplaceCategory: "desktop"
---
**PostgreSQL** es una de las bases de datos más usadas del mundo: muchas apps guardan ahí sus datos importantes (usuarios, pedidos, facturación). Tradicionalmente, para hacerle una pregunta a esa base hace falta saber SQL y una herramienta tipo TablePlus o pgAdmin.

Este conector deja que tu IA mire tus tablas y conteste preguntas sobre los datos — **pero solo leer, nunca modificar**. El server oficial de Anthropic lo garantiza por diseño: en sus palabras, *"All queries are executed within a READ ONLY transaction"*. Si la IA intenta cambiar algo, Postgres lo rechaza.

### Qué le podés pedir

- *"Mostrame qué tablas tiene esta base y cómo creés que están conectadas entre sí."*
- *"Contame cuántos clientes activos hay en cada plan en los últimos 30 días."*
- *"Mirá la tabla de pedidos y proponeme la forma más segura de sacar la facturación mes a mes."*

### Qué conexión necesitás

Necesitás una **URL de conexión a Postgres**, con este formato: `postgresql://usuario:password@host:5432/nombre-de-base`. La hace el equipo técnico que mantiene la base (o tu proveedor de hosting, si usás Supabase, Neon o Render).

1. **Pedile a quien administra la base que cree un usuario nuevo solo para Terminal Sync** — separado de los usuarios reales o de tu app.
2. **Dale a ese usuario permisos solo de lectura** sobre las tablas que querés que la IA vea.
3. Pegá la URL completa cuando el Lab te pida `POSTGRES_URL`. Terminal Sync la guarda cifrada en tu Keychain — nunca queda en texto plano.

El conector ya garantiza por su lado que solo lee. Crear además un usuario de Postgres con permisos solo de lectura es **cerrar dos puertas en vez de una** — recomendado para cualquier base con datos sensibles.

--- dev ---

`@modelcontextprotocol/server-postgres` es un paquete oficial publicado por `Anthropic, PBC` bajo el scope `@modelcontextprotocol`. Manifest verificado: `npx -y @modelcontextprotocol/server-postgres ${SECRET:POSTGRES_URL}`; el README oficial documenta la connection URL como argumento posicional del server.

Componentes verificados contra el README oficial: tool `query` con input `sql` para ejecutar consultas read-only; resources `postgres://<host>/<table>/schema` con JSON schema de cada tabla, nombres de columnas y tipos de datos, autodetectados desde metadata de la base.

Gotcha: `--help` no está implementado como flag de ayuda; el binario espera una URL válida como argumento. El gate de arranque se validó con una URL Postgres sintácticamente válida y sin credenciales reales.

Terminal Sync mantiene la URL en el Keychain via `apiKeyHelper`, sincronizada cifrada con AES-256-GCM entre máquinas.

Licencia: MIT. Fuente: README y package metadata de `@modelcontextprotocol/server-postgres` en npm.
