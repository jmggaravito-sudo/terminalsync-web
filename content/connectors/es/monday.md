---
name: monday.com
logo: /connectors/monday.svg
category: productivity
status: available
simpleTitle: "Tu tablero de trabajo, manejado por la IA"
simpleSubtitle: "\"¿Qué está trabado?\" \"Agregá el lead nuevo al tablero de ventas\" — tu IA lee y actualiza monday.com."
devTitle: "Conector MCP de monday.com"
devSubtitle: "MCP oficial de monday.com sobre la API — boards, items, columnas, updates."
ctaUrl: "https://monday.com"
tokenHelpUrl: "https://developer.monday.com/api-reference/docs/authentication"
manifest:
  mcpServers:
    monday:
      command: npx
      args: ["-y", "@mondaydotcomorg/monday-api-mcp", "-m", "atp"]
      env:
        monday_token: "${SECRET:MONDAY_TOKEN}"
        NODE_OPTIONS: "--no-node-snapshot"
affiliate: false
tagline: "Boards e items al alcance de la IA"
originalAuthor: "monday.com"
originalAuthorUrl: "https://github.com/mondaycom/monday-ai"
license: "MIT"
licenseUrl: "https://github.com/mondaycom/monday-ai/blob/master/LICENSE"
---
Si tu negocio corre sobre tableros de **monday.com** — pipeline de ventas, proyectos, pedidos, lo que sea que lleves en esas columnas de colores — este conector deja que tu IA los lea y los actualice, así el tablero queda al día sin que andés arrastrando tarjetas todo el día.

Preguntale *"¿qué está trabado en el tablero de proyectos?"* y lee los items y su estado. Decile *"agregá un lead al tablero de Ventas: María García, origen Instagram, estado Nuevo"* y crea el item. Preguntale *"¿qué está vencido?"* y lo encuentra. Tu tablero se vuelve algo que simplemente preguntás.

### Qué le podés pedir

- *"En el tablero de Ventas, ¿qué negocios están trabados en 'Negociación'?"*
- *"Agregá un item a 'Pedidos': cliente León, monto 450, estado Pendiente."*
- *"¿Qué items están asignados a mí y vencen esta semana?"*

### Qué necesitás

monday.com se conecta con un **API token** de tu propia cuenta:

1. En monday.com, abrí tu **avatar → Administration → Connections → API** (o **Developers**) y copiá tu token personal — mirá la [guía oficial](https://developer.monday.com/api-reference/docs/authentication).
2. Pegalo cuando el Lab te pida `MONDAY_TOKEN`.

El token queda guardado cifrado en tu Keychain y sincronizado entre tus máquinas.

--- dev ---

`@mondaydotcomorg/monday-api-mcp` (publicado por **monday.com**, oficial) habla la monday.com API. Expone la superficie central de work-management — boards, items, columnas, groups, updates y users — lectura y escritura. El conector corre en modo `atp` (API-tools).

La auth es la env var `monday_token` (un token personal de la API de monday.com). El server setea `NODE_OPTIONS=--no-node-snapshot` según la config oficial. Terminal Sync mapea el token desde el secreto `MONDAY_TOKEN` en tu Keychain.

Terminal Sync guarda el token en tu Keychain, sincronizado cifrado entre máquinas con AES-256-GCM. Como los tools de create/update mutan datos reales del tablero, el escritorio los pasa por un paso de confirmación.

Licencia: MIT. Fuente: github.com/mondaycom/monday-ai (packages/monday-api-mcp).
