---
name: Siigo
logo: /connectors/siigo.svg
category: automation
status: available
simpleTitle: "Your invoicing, answered in plain language"
simpleSubtitle: "Official Siigo MCP: sales invoices, customers and products over OAuth, no API key to paste."
devTitle: "Siigo MCP Connector"
devSubtitle: "Official hosted Siigo MCP (mcp.siigo.com) — sales invoices, customers/contacts and product catalog through OAuth."
ctaUrl: "https://www.siigo.com"
tokenHelpUrl: "https://developers.siigo.com/docs/siigoapi/MCP/1-documentation/"
manifest:
  mcpServers:
    siigo:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.siigo.com"]
affiliate: false
tagline: "Your invoices, your customers and your catalog, within reach of the agent"
originalAuthor: "Siigo"
originalAuthorUrl: "https://developers.siigo.com/docs/siigoapi/MCP/1-documentation/"
license: "proprietary"
licenseUrl: "https://seguridad.siigo.com/paises/colombia/legal/condiciones-de-uso-software-nube"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Siigo** is the accounting and administrative software many micro, small and mid-size businesses in Colombia run their books, their invoicing and their daily operation on. The official Siigo connector is a **hosted MCP server** (`https://mcp.siigo.com`), published by Siigo, that gives your agent access to your invoices, your customers and your product catalog using your own Siigo account login — no API key to paste and, as the official docs put it, "sin necesidad de un desarrollador, tener conocimientos de código" (no developer or coding knowledge needed).

Ask *"How much did I invoice this month, and to which customers?"* and the agent reads your invoices straight from your account. *"Show me the available stock of my products."* *"What was my best-selling product this week?"* — answers you'd otherwise hunt for across Siigo screens. It can also create for you: *"Create the invoice for Carlos Pérez: 2 executive chairs, cash payment"* — the assistant asks for your confirmation before registering anything. And if you manage several companies, you can switch between them right from the chat.

### What you can ask

- *"How much did I invoice this month, and to which customers?"*
- *"Show me the available stock of my products."*
- *"List my customers and tell me which ones are companies."*
- *"What taxes and payment methods do I have configured?"*
- *"What was my best-selling product this week?"*
- *"Create the invoice for Carlos Pérez: 2 executive chairs, cash payment."* — registered only after your confirmation.

### How you connect

This connector **doesn't ask you to paste an API key**. It uses the official Siigo login:

1. Before you start, your company needs Siigo API integration credentials enabled: in Siigo, **Configuración → Credenciales de integración a plataformas digitales** (Settings → Integration credentials for digital platforms). If you don't have them yet, the assistant itself walks you through activating them.
2. Enable the connector in TerminalSync.
3. The `mcp-remote` bridge opens the official Siigo login in your browser; sign in and authorize access. The AI never sees your password and operates with your own user's identity and permissions.

**Honest note:** this is a server **hosted by Siigo** (`https://mcp.siigo.com`), not something that runs on your computer. What the agent can see and do is bounded by your Siigo user's permissions. It can create invoices, and create or update customers, with your explicit approval, and consult your catalog — but it never deletes information: the official docs put it in two words, *"Borrar, nunca."* ("Delete: never.") Data comes straight from your account, and verifying it is your responsibility.

--- dev ---

Siigo publishes its **official MCP** as a remote/hosted server at `https://mcp.siigo.com` (the "URL MCP Siigo"), documented in its developer portal (`developers.siigo.com/docs/siigoapi/MCP/1-documentation/`). There's no npm package or local stdio server — it's bridged locally with `mcp-remote`:

```
npx -y mcp-remote@latest https://mcp.siigo.com
```

Authentication is **OAuth/B2C through Siigo's official login**, with no client secret to store: "Inicias sesión mediante el login oficial de Siigo (OAuth/B2C)", and "La IA nunca ve tu contraseña y opera utilizando la identidad y los permisos asociados a tu usuario" (the AI never sees your password and operates with your user's identity and permissions). Siigo's launch was done on Claude and ChatGPT. **Logging in to Siigo through the `mcp-remote` bridge has not been tested yet with a real account**: the documentation describes the OAuth/B2C flow but does not mention this bridge.

**Documented prerequisite:** "Tu empresa debe tener habilitadas las credenciales de integración de Siigo API" — your company must have Siigo API integration credentials enabled, under **Configuración → Credenciales de integración a plataformas digitales** in Siigo; if missing, the assistant walks you through activation.

Documented scope, from the official table ("Alcance del MCP oficial de Siigo"):

- **Sales invoices** — "Crear y consultar una o todas las facturas de venta": create invoices directly in Siigo and consult existing ones with their details.
- **Customers** — "Crear, consultar y actualizar clientes / terceros": create new customers and consult commercial and contact info for registered ones.
- **Products or services** — "Consultar productos": the catalog configured in Siigo, with "código, saldos, descripción, precio y demás atributos disponibles" (code, balances, description, price and other available attributes) — consult only; the table lists no create/update for products.
- **Multi-company** — documented tool `cambiar_empresa`: "Puedes cambiar de empresa cuando quieras usando la herramienta `cambiar_empresa` desde el propio chat" (switch between companies anytime from the chat itself).

**Disclosure:** this is a hosted server (not local) that reads and writes. Per the official docs, "las consultas de información se realizarán únicamente en respuesta a solicitudes realizadas por el usuario" (queries run only in response to your requests), and "las acciones que impliquen la creación, modificación o eliminación de información requerirán la aprobación explícita del usuario antes de ser ejecutadas" — with deletion ruled out outright ("Borrar, nunca."). The FAQ adds that creating (invoices, customers or products) "solo ocurre cuando tú lo solicitas explícitamente" (happens only when you explicitly request it), and that "antes de registrar cualquier información, el asistente te pedirá confirmación" (the assistant asks for confirmation before registering anything). The docs publish no full static tool list beyond that scope (tax and payment-method examples suggest read access to configuration data, with no tools named). The docs recommend paid AI-tool plans, since free ones "suelen tener límites de uso más reducidos".

License: proprietary SaaS (Siigo Nube terms of use, `seguridad.siigo.com/paises/colombia/legal/condiciones-de-uso-software-nube`). Source: developers.siigo.com — Siigo API MCP documentation.
