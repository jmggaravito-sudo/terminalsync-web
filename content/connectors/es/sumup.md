---
name: SumUp
logo: /connectors/sumup.svg
category: automation
markets: ["GLOBAL"]
status: soon
simpleTitle: "Tus cobros de SumUp, revisados y creados conversando"
simpleSubtitle: "Server MCP oficial de SumUp: revisa transacciones, crea checkouts y consulta el perfil de tu comercio por OAuth."
devTitle: "Conector MCP de SumUp"
devSubtitle: "MCP oficial hospedado de SumUp (mcp.sumup.com) — comercio, transacciones, checkouts y flujos de pago."
ctaUrl: "https://www.sumup.com"
tokenHelpUrl: "https://developer.sumup.com/tools/llms/mcp-server/"
manifest:
  mcpServers:
    sumup:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.sumup.com/mcp"]
affiliate: false
tagline: "El dinero de tu comercio, al alcance del agente"
originalAuthor: "SumUp"
originalAuthorUrl: "https://developer.sumup.com/tools/llms/mcp-server/"
license: "Apache-2.0"
licenseUrl: "https://github.com/sumup/sumup-mcp/blob/main/LICENSE"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: false
installableForAiReason: "needs-oauth"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-11-16T14:28:17.460Z"
verifiedPackageVersion: null
---
**SumUp** es la plataforma de pagos con la que los negocios cobran con tarjeta, online y en persona. Publicó su server MCP oficial para *"interactions between large language models (LLMs) and SumUp APIs"*, con el objetivo de que *"you can connect to SumUp's services from an MCP client (e.g. Cursor, Claude) and use natural language to work with your SumUp account"*. La tarjeta oficial del server lo describe así: *"SumUp payment APIs and developer documentation. Connect through your client's OAuth sign-in"*. El conector es un **server MCP hospedado** (`https://mcp.sumup.com/mcp`).

Qué significa en la práctica — según la sección oficial *"What You Can Do"*: tu agente puede consultar el perfil de tu comercio y revisar transacciones, crear checkouts y ver su estado, armar flujos de pago con la Cloud API de SumUp (cobros online y en persona), y leer la documentación para desarrolladores y la especificación OpenAPI de la API de SumUp como recursos de MCP.

### Qué le puedes pedir

- *"Muéstrame el perfil de mi comercio."*
- *"Revisa las transacciones de mi comercio y resume cómo viene el día."*
- *"Usando mi comercio sandbox, crea un checkout de 12,34 EUR con una referencia única y devuélveme su ID. No proceses el pago."*
- *"¿Qué es la Cloud API de SumUp y cómo se arma un flujo de pago en persona?"*

### Cómo te conectas

Este conector **no te pide pegar ninguna API key**. Usa el login de SumUp:

1. Activa el conector en TerminalSync.
2. El puente `mcp-remote` descubre el servidor de autorización de SumUp desde la metadata del endpoint y abre la página de autorización en tu navegador: inicias sesión con tu cuenta de SumUp y apruebas el acceso.
3. Listo — la conexión queda asociada a tu cuenta de SumUp y a lo que apruebes en el login.

**Aclaración honesta:** es un **server hospedado por SumUp** (`https://mcp.sumup.com/mcp`), no algo que corre en tu computadora. Las API keys de SumUp (`sup_sk_...`) **no sirven** para el server hospedado — la conexión es OAuth con tu cuenta de SumUp, y el acceso queda acotado por lo que apruebes en esa autorización. La doc oficial recomienda probar primero contra un **comercio sandbox**: *"Before testing payment workflows, connect a sandbox merchant account"* — y su ejemplo de verificación es read-only: *"Use the SumUp MCP tools to show my merchant profile"*. Crear checkouts es una acción real sobre tu cuenta SumUp.

**Por qué figura como Próximamente:** el server está vivo y su login es OAuth, pero al preparar esta ficha (2026-11-16) el humo de conexión de TerminalSync se detiene **antes del login**: las dos piezas de metadata OAuth de SumUp (la del recurso protegido y la del servidor de autorización) declaran la misma identidad de forma distinta — `https://auth.sumup.com` vs `https://auth.sumup.com/` — y el puente de conexión compara esas identidades de forma exacta (RFC 8414 §3.3), abortando con `IssuerMismatchError`. La ficha se publica con la configuración oficial documentada de SumUp y se habilita en cuanto el vendor alinee la metadata — se re-verifica con `node scripts/smoke-remote-login.mjs --slugs sumup`.

--- dev ---

SumUp (org oficial de GitHub `sumup`) publica su server MCP como **server remoto/hospedado**: repo oficial `github.com/sumup/sumup-mcp` (LICENSE Apache-2.0), server card oficial `com.sumup/mcp` en `developer.sumup.com/.well-known/mcp/server-card.json` y guía MCP en `developer.sumup.com/tools/llms/mcp-server/`. El worker hospedado *"runs as a Cloudflare Worker and serves the MCP transport for SumUp"*. Endpoint: `https://mcp.sumup.com/mcp` (**Streamable HTTP**; también expone el transporte legacy `/sse` — *"Use `/mcp` for new connections"*). El puente del catálogo es el patrón genérico de cliente:

```
npx -y mcp-remote@latest https://mcp.sumup.com/mcp
```

Auth: **OAuth resource-server flow** — *"The worker publishes protected resource metadata that points clients to the SumUp authorization server"*, y *"The client discovers the SumUp authorization server through the endpoint's protected resource metadata and asks you to authorize access in your browser"*. El server acepta *"OAuth access tokens issued for the MCP resource"* — *"Bearer tokens must be JWT access tokens issued by `SUMUP_AUTH_HOST` and valid for the worker resource URL"* — y las API keys *"such as `sup_sk_...` are not valid Bearer tokens for the hosted server"* (el troubleshooting oficial lo repite: si configuraste un Bearer `sup_sk_...`, *"remove it and reconnect through OAuth"*). **Smoke 2026-11-16:** `mcp-remote` vs `https://mcp.sumup.com/mcp` → `IssuerMismatchError: Issuer mismatch in authorization server metadata (RFC 8414 §3.3): expected "https://auth.sumup.com", received "https://auth.sumup.com/"` — por eso la ficha queda con `installableForAi: false` (reason `needs-oauth`) y `sumup` en `REMOTE_WITHOUT_DCR` en `scripts/verify-connector.mjs` hasta que el vendor alinee la metadata.

Superficie (verbatim de la guía oficial, "What You Can Do"): *"Query your merchant profile and review transactions"*, *"Create checkouts and inspect their status"*, *"Build payment workflows with [Cloud API]"*, *"Read SumUp developer documentation and the OpenAPI specification through MCP resources"* — los clientes con soporte de recursos MCP pueden leer `https://developer.sumup.com/llms.txt` (índice de docs) y `https://developer.sumup.com/openapi.json` (especificación completa de la API de SumUp). La doc no publica una lista plana de tools del server de pagos. El **server de documentación** aparte en `https://developer.sumup.com/mcp` (dos tools, `list_pages` y `get_page`) no es el conector de pagos y no se shipea. El ejemplo oficial de verificación: *"Using my sandbox merchant, create a checkout for 12.34 EUR with a unique reference and return its ID. Do not process a payment."* — para probar flujos de pago, la doc manda a conectar primero una cuenta de comercio sandbox (`developer.sumup.com/online-payments/#getting-a-sandbox-merchant-account`).

Variante local documentada y **no shipeada**: existe un CLI MCP local (`npx -y @sumup/mcp`, repo `sumup/sumup-ai/tree/main/mcp`, Node ≥ 22, auth `SUMUP_API_KEY` con API key `sup_sk_...`) para clientes stdio — la propia doc lo posiciona para ese caso y recomienda el hospedado para conexiones nuevas. Skills oficiales complementarias en `github.com/sumup/sumup-skills`.

Licencia: Apache-2.0 (LICENSE del repo oficial `sumup/sumup-mcp`); el server hospedado se consume como SaaS de SumUp. Fuente: developer.sumup.com/tools/llms/mcp-server/ + developer.sumup.com/tools/llms/setup/ + README del repo + server card oficial + registro MCP (`io.github.sumup/mcp`).
