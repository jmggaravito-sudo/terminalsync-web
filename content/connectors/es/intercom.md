---
name: Intercom
logo: /connectors/intercom.svg
category: support
markets: ["GLOBAL"]
status: available
simpleTitle: "Pregúntale a tu IA por tu bandeja de Intercom"
simpleSubtitle: "MCP oficial de Intercom: busca conversaciones, contactos, empresas y artículos de ayuda con OAuth, sin pegar ningún token."
devTitle: "Conector MCP de Intercom"
devSubtitle: "MCP oficial hospedado de Intercom (mcp.intercom.com) — conversaciones, contactos, empresas y artículos por OAuth."
ctaUrl: "https://www.intercom.com"
tokenHelpUrl: "https://developers.intercom.com/docs/guides/mcp"
manifest:
  mcpServers:
    intercom:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.intercom.com/mcp"]
affiliate: false
tagline: "Tu bandeja de Intercom, al alcance del agente"
originalAuthor: "Intercom"
originalAuthorUrl: "https://developers.intercom.com/docs/guides/mcp"
license: "proprietary"
licenseUrl: "https://www.intercom.com/legal/terms-and-policies"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-09-19T12:19:33.156Z"
verifiedPackageVersion: null
---
**Intercom** es la bandeja de mensajería y soporte que muchos negocios usan para hablar con sus clientes. El servidor MCP oficial de Intercom deja que tu agente revise ese espacio de trabajo — conversaciones, contactos, empresas y artículos del centro de ayuda — sin pegar ningún token en TerminalSync, solo con el login de tu propia cuenta de Intercom.

Le preguntas *"Busca las conversaciones de este cliente y resúmeme el problema"* y el agente busca en tu bandeja y las lee. Le preguntas *"¿Qué artículos de ayuda tenemos sobre reembolsos?"* y busca en tu centro de ayuda. Es sobre todo un conector de **lectura**: también puede dejar **notas internas** (solo las ve tu equipo) y crear o editar **artículos del centro de ayuda**, pero **no puede responderle a un cliente** — eso lo sigues haciendo tú en Intercom.

### Qué le puedes pedir

- *"Busca las conversaciones de ana@empresa.com y resúmeme qué necesita."*
- *"Lee esta conversación y dime qué está pidiendo el cliente."*
- *"Encuentra el contacto de este email y muéstrame a qué empresa pertenece."*
- *"Lista mis artículos del centro de ayuda y encuentra los de envíos."*
- *"Agrega una nota interna a esta conversación diciendo que lo llamamos mañana."*
- *"Redacta un artículo de ayuda sobre nuestra política de devoluciones."*

### Cómo conectas

Este conector **no te pide pegar ningún token**. Usa el login de tu propia cuenta de Intercom:

1. Activa el conector en TerminalSync.
2. El puente `mcp-remote` abre el login de Intercom en tu navegador y te pide autorizar el acceso.
3. Apruébalo con tu cuenta. La guía oficial de Intercom está en [developers.intercom.com](https://developers.intercom.com/docs/guides/mcp).

**Aclaración honesta:** es un servidor **hospedado por Intercom** (`https://mcp.intercom.com/mcp`), no algo que corre en tu computadora. Intercom lo documenta **solo para espacios alojados en EE. UU. o en la UE** (la UE usa otra dirección, `mcp.eu.intercom.com`, que este conector no usa) y **los espacios alojados en Australia no están soportados**. Las tres acciones de escritura son notas internas y crear o actualizar artículos; los artículos pueden verlos tus clientes, así que revisa antes de publicar. La página de Intercom no indica requisitos de plan ni de rol, así que si el login falla, consulta con el administrador de tu Intercom.

--- dev ---

Intercom publica un **servidor MCP remoto oficial** en `https://mcp.intercom.com/mcp` (espacios de EE. UU.; la UE en `https://mcp.eu.intercom.com/mcp`; AU no soportado), documentado en `developers.intercom.com/docs/guides/mcp`. El transporte es Streamable HTTP (los endpoints `/sse` están deprecados). La auth es **OAuth** (el servidor de autorización anuncia registro dinámico de cliente en `/register` con PKCE S256); también se documenta auth por bearer token, pero este conector usa OAuth. TerminalSync hace de puente con el endpoint hospedado localmente:

```
npx -y mcp-remote@latest https://mcp.intercom.com/mcp
```

Tools (14, según la página oficial): **solo lectura** `search`, `fetch`, `search_conversations`, `get_conversation`, `search_contacts`, `get_contact`, `list_companies`, `get_company`, `list_articles`, `search_articles`, `get_article`; **escritura** `create_article`, `update_article`, `add_internal_note` (atribuida al admin que autorizó la conexión). Un 401 en `add_internal_note` suele indicar que la conexión es anterior al permiso de escritura y hay que reconectar.

Licencia: términos SaaS propietarios (`intercom.com/legal/terms-and-policies`). Fuente: developers.intercom.com/docs/guides/mcp.
