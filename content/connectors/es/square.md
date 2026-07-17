---
name: Square
logo: /connectors/square.svg
category: automation
status: available
simpleTitle: "Preguntale a tu IA por tu negocio en Square — y dejá que actúe sobre él"
simpleSubtitle: "Server oficial de Square (por Block): pagos, catálogo, órdenes y clientes."
devTitle: "Square MCP Connector"
devSubtitle: "Official square-mcp-server, published by Block."
ctaUrl: "https://squareup.com"
tokenHelpUrl: "https://developer.squareup.com/docs/build-basics/access-tokens"
manifest:
  mcpServers:
    square:
      command: npx
      args: ["square-mcp-server", "start"]
      env:
        ACCESS_TOKEN: "${SECRET:SQUARE_ACCESS_TOKEN}"
        SANDBOX: "true"
affiliate: false
tagline: "Tu negocio en Square, al alcance del agente"
originalAuthor: "Square (Block, Inc.)"
originalAuthorUrl: "https://developer.squareup.com"
license: "Apache-2.0"
licenseUrl: "https://www.apache.org/licenses/LICENSE-2.0"
---
**Square** es la plataforma detrás de los pagos, el punto de venta y el catálogo de millones de negocios. El conector oficial, publicado por Block, deja que los asistentes de IA interactúen con la Connect API de Square — así el agente trabaja directo sobre tu cuenta: procesar pagos, administrar tu catálogo de ítems y categorías, manejar órdenes y buscar clientes. La lista completa y siempre actualizada de servicios está en la [documentación de la API de Square](https://developer.squareup.com/docs).

Le preguntás *"¿cuánto vendimos esta semana?"* y lee tus datos de Square y te responde. Le pedís *"agregá un ítem nuevo al catálogo llamado Espresso a $3.50"* y lo arma solo — sin tocar el panel. Habla con Square usando tu token de acceso, así que puede hacer todo lo que vos podés hacer desde tu propia cuenta. Por defecto el manifest corre en modo **sandbox**, así que no se mueve nada real mientras lo probás.

### Qué le podés pedir

- *"¿Cuántos pagos cobramos hoy, y cuál es el total?"*
- *"Buscá al cliente con el email ana@empresa.com y mostrame sus últimas órdenes."*
- *"Agregá un ítem llamado 'Consultoría 1h' a $80 al catálogo."*

### Qué token necesitás

Necesitás un **token de acceso** de Square — la credencial que permite que un software actúe sobre tu cuenta. Va en la env var que se llama literalmente `ACCESS_TOKEN`.

1. Andá a [developer.squareup.com/docs/build-basics/access-tokens](https://developer.squareup.com/docs/build-basics/access-tokens) y seguí la guía para obtener tu token.
2. Pegalo cuando el Lab te pida `SQUARE_ACCESS_TOKEN`. Se guarda cifrado en tu Keychain.
3. El manifest viene con `SANDBOX=true`, que apunta al entorno sandbox de Square — datos falsos, no se mueve nada real mientras probás.

Cuando estés listo para trabajar sobre tu negocio de verdad, pasá a producción: poné `PRODUCTION=true` en vez de `SANDBOX=true`. En producción el token actúa sobre tu cuenta real, así que tratalo como una contraseña.

--- dev ---

`square-mcp-server` (Square, oficial — publicado por Block, maintainer `oss-releases@block.xyz`) corre con `npx square-mcp-server start`. La auth es un token de acceso de Square pasado como la env var `ACCESS_TOKEN`; el manifest de acá lo mantiene en Keychain. Toggles de entorno según el README: `SANDBOX=true` (entorno sandbox) vs `PRODUCTION=true` (entorno de producción), más `DISALLOW_WRITES=true` para restringir a operaciones de solo lectura y `SQUARE_VERSION` para fijar una versión de la API de Square (por ejemplo `2025-04-16`).

El server expone tres tools — `get_service_info` (descubrir los métodos disponibles de un servicio), `get_type_info` (obtener los requisitos de parámetros de un método) y `make_api_request` (ejecutar la llamada) — siguiendo un patrón descubrir → entender → ejecutar. Esas tools alcanzan todo el ecosistema de APIs de Square: según el catálogo de servicios del README, `payments`, `catalog`, `orders`, `customers`, `inventory`, `invoices`, `refunds`, `subscriptions`, `loyalty`, `giftcards`, `bookings`, `locations`, `team`, `merchants`, `payouts`, `disputes`, `terminal`, `devices`, y más. La lista autoritativa está en developer.squareup.com/reference/square.

Terminal Sync mantiene el token de acceso en Keychain vía `apiKeyHelper`, sincronizado cifrado con AES-256-GCM entre máquinas.

Licencia: Apache-2.0. Fuente: Square MCP Server, publicado por Block.
