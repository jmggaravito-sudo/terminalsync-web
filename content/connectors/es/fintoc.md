---
name: Fintoc
logo: /connectors/fintoc.png
category: automation
markets: ["CL", "MX"]
status: available
simpleTitle: "Pregúntale a tu cuenta de Fintoc por tus cobros y tu plata"
simpleSubtitle: "MCP oficial de Fintoc: pagos, cobros recurrentes, movimientos bancarios y transferencias en Chile y México, por OAuth y sin pegar ninguna API key."
devTitle: "Conector MCP de Fintoc"
devSubtitle: "MCP oficial hospedado de Fintoc (mcp.fintoc.com) — Payments, Billing, Movements, Payouts, Business Accounts, Webhooks y Equipo sobre OAuth."
ctaUrl: "https://fintoc.com"
tokenHelpUrl: "https://docs.fintoc.com/es/guides/resources/building-with-ai/model-context-protocol-mcp"
manifest:
  mcpServers:
    fintoc:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.fintoc.com"]
affiliate: false
tagline: "Tus cobros y tu banco, al alcance del agente"
originalAuthor: "Fintoc"
originalAuthorUrl: "https://docs.fintoc.com/es/guides/resources/building-with-ai/model-context-protocol-mcp"
license: "proprietary"
licenseUrl: "https://www.fintoc.com/cl/legal/terminos"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-10-15T09:01:37.043Z"
verifiedPackageVersion: null
---
**Fintoc** es la plataforma de pagos y datos financieros que usan los negocios de Chile y México: conecta las cuentas bancarias de la empresa, cobra con links de pago y suscripciones, emite facturas y mueve plata por transferencias locales. El server MCP oficial de Fintoc le da a tu agente acceso directo a todo eso con el login de tu propia cuenta — sin pegar ninguna API key en TerminalSync.

Le preguntas *"Muéstrame los movimientos de la cuenta bancaria del negocio esta semana"* y los trae directo de tu cuenta vinculada. *"¿Entró el pago del link que le mandé a la constructora?"* y revisa los intentos de pago y las sesiones de cobro. También puede hacer la parte operativa: crear clientes, emitir facturas, armar suscripciones y reembolsar pagos. Para cada escritura el agente te muestra qué va a hacer y te pide confirmación antes de ejecutarla — Fintoc mismo recomienda habilitar la confirmación humana, porque algunas operaciones mueven plata.

### Qué le puedes pedir

- *"Muéstrame los movimientos de la cuenta bancaria del negocio de esta semana."*
- *"¿Entró el pago del link que le mandé a la constructora?"*
- *"Muéstrame las suscripciones activas y cuáles fallaron en el último cobro."*
- *"Crea un cliente para Distribuidora Andina y genera un link de pago por $250.000."*
- *"Crea una suscripción mensual de $1.500 para el cliente García."*
- *"Reembolsa el pago de ayer del cliente que canceló su compra."*

### Cómo te conectas

Este conector **no te pide pegar ninguna API key**. Usa el login de tu propia cuenta de Fintoc:

1. Activa el conector en TerminalSync.
2. El puente `mcp-remote` abre el login de Fintoc en tu navegador: autorizas la conexión y eliges los permisos (scopes) que le otorgas a tu sesión.
3. Apruébalo con tu cuenta — el conector solo puede ver y hacer lo que esa cuenta y esos permisos permitan. Necesitas una cuenta de Fintoc activa con acceso al modo live. La guía oficial está en [docs.fintoc.com](https://docs.fintoc.com/es/guides/resources/building-with-ai/model-context-protocol-mcp).

**Aclaración honesta:** es un **server hospedado por Fintoc** (`https://mcp.fintoc.com`), no algo que corre en tu computadora. Opera sobre tu cuenta de Fintoc en Chile y México, y lo que el agente puede ver o hacer queda acotado por los permisos de tu cuenta y los scopes que apruebes. Hay operaciones que Fintoc dejó fuera a propósito: pagar las facturas que Fintoc le emite a tu organización, cancelar suscripciones, desvincular el medio de pago de una suscripción y cambiar o quitar roles de usuarios — esas siguen haciéndose desde el dashboard. Los reembolsos sí están disponibles, y siempre con confirmación previa.

--- dev ---

Fintoc publica un **server MCP remoto oficial** en `https://mcp.fintoc.com` (transporte HTTP), documentado en su guía oficial `docs.fintoc.com/es/guides/resources/building-with-ai/model-context-protocol-mcp` con configs de conexión para Claude Code, Cursor, VS Code y ChatGPT. La config oficial de Claude Code es `claude mcp add --transport http fintoc https://mcp.fintoc.com`. La auth es **OAuth con pantalla de consentimiento en el navegador**: al conectar eliges los scopes que otorgas, *"Un token opera solo en modo live"*, y los scopes nuevos (p. ej. Equipo) exigen reconectar y re-autorizar. Existe además un segundo server MCP de documentación en `https://docs.fintoc.com/mcp`.

TerminalSync hace de puente localmente con el endpoint hospedado:

```
npx -y mcp-remote@latest https://mcp.fintoc.com
```

Tools MCP, verbatim de la doc:

- `fintoc_tool_search` — *"Busca las operaciones disponibles en el MCP de Fintoc."*
- `fintoc_tool_details` — *"Obtiene los parámetros y permisos de una operación."*
- `fintoc_tool_read` — *"Lee datos de Fintoc."*
- `fintoc_tool_write` — *"Escribe datos en Fintoc. Algunas operaciones pueden mover plata."*
- `fetch_resource` — *"Obtiene un recurso de Fintoc por su ID."*
- `submit_feedback` — *"Reporta bloqueadores o comportamientos inesperados a Fintoc."*

Es un set chico a propósito, *"sin exponer una herramienta por cada acción"*: las operaciones concretas se descubren con `fintoc_tool_search`/`fintoc_tool_details` y se ejecutan con `fintoc_tool_read`/`fintoc_tool_write`. Operaciones documentadas: **Payments** (listar y crear customers; listar payment intents, checkout sessions y payment methods; listar, crear y cancelar refunds), **Billing** (crear, finalizar y anular invoices; listar, crear y actualizar subscriptions), **tus facturas de Fintoc**, **Movements** (links, cuentas bancarias y movimientos), **Payouts**, **Business Accounts** (cuentas, cartolas, entidades, números de cuenta, transferencias, creación de números de cuenta), **Webhooks** (listar, crear y actualizar endpoints), **restricciones de IP** y **Equipo** (usuarios, roles e invitaciones) — la disponibilidad varía según tus productos Fintoc y los scopes otorgados.

**Divulgación:** server hospedado (no local) que lee **y escribe** — la propia tool de escritura avisa que *"algunas operaciones pueden mover plata"*, y Fintoc recomienda habilitar la confirmación humana de las herramientas y cuidarse de ataques de inyección de prompts. Exclusiones deliberadas (sin tool): pagar las facturas que Fintoc emite a tu organización, cancelar una suscripción, desvincular el medio de pago de una suscripción y cambiar/quitar roles de usuarios — esas quedan solo en el dashboard. Los reembolsos son la excepción (devuelven plata y se pueden cancelar mientras están pendientes). Requiere cuenta de Fintoc activa con acceso al modo live. **Smoke de esta corrida:** `initialize` sin credenciales → 401; `https://mcp.fintoc.com/.well-known/oauth-authorization-server` publica los endpoints de authorization/token/registration en `api.fintoc.com`, PKCE `S256` y 26 scopes granulares (`payment:manage`, `refund:manage`, `transfer:manage`, `movement:view`, `invoicing_*`, `webhook_endpoint:*`, `organization_user:*`, …) — registro dinámico de cliente, exactamente lo que el puente `mcp-remote` necesita para llegar a la pantalla de consentimiento.

Licencia: términos SaaS propietarios (Fintoc, `fintoc.com/cl/legal/terminos`). Fuente: docs.fintoc.com — guía oficial del MCP de Fintoc. Soporte: mcp@fintoc.com.
