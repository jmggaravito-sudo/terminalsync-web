---
name: Klaviyo
logo: /connectors/klaviyo.svg
category: automation
status: available
simpleTitle: "Maneja tu marketing por email y SMS preguntando"
simpleSubtitle: "MCP oficial de Klaviyo: campañas, flows, perfiles y reportes por OAuth."
devTitle: "Klaviyo MCP Connector"
devSubtitle: "Official hosted Klaviyo MCP (mcp.klaviyo.com) — campaigns, flows, profiles and reporting through OAuth."
ctaUrl: "https://klaviyo.com"
tokenHelpUrl: "https://developers.klaviyo.com/en/docs/klaviyo_mcp_server"
manifest:
  mcpServers:
    klaviyo:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.klaviyo.com/mcp"]
affiliate: false
tagline: "Tu marketing de email y SMS, al alcance del agente"
originalAuthor: "Klaviyo"
originalAuthorUrl: "https://developers.klaviyo.com/en/docs/klaviyo_mcp_server"
license: "proprietary"
licenseUrl: "https://www.klaviyo.com/legal/api-terms"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Klaviyo** es la plataforma de marketing por email y SMS que usan los negocios de ecommerce para manejar campañas, flows automáticos y segmentos de clientes. El server MCP oficial de Klaviyo deja que tu agente chequee el rendimiento y arme campañas directamente — sin pegar ninguna API key en TerminalSync, solo con el login de tu propia cuenta de Klaviyo.

Le preguntas *"Muéstrame el rendimiento de mis campañas de email de los últimos 30 días"* y el agente trae los números de tu cuenta. Le pides *"Crea una campaña de email promocionando nuestra oferta de fin de temporada"* y la arma sobre tus listas y templates reales. Sirve para revisar el rendimiento de campañas y flows, gestionar perfiles y segmentos, y redactar campañas nuevas.

### Qué le puedes pedir

- *"Muéstrame el rendimiento de mis campañas de email de los últimos 30 días."*
- *"¿Qué flows están rindiendo mejor en conversiones?"*
- *"Crea una campaña de email promocionando nuestra oferta de fin de temporada."*
- *"Busca el perfil de este cliente y agrégalo al segmento VIP."*

### Cómo conectas

Este conector **no te pide pegar ninguna API key**. Usa el login de tu propia cuenta de Klaviyo:

1. Activa el conector en TerminalSync.
2. El puente `mcp-remote` abre el login de Klaviyo en tu navegador y te pide autorizar el acceso (OAuth con registro dinámico de cliente).
3. Apruébalo con tu cuenta — el conector solo ve y hace lo que tu rol permita. La doc oficial de Klaviyo está en [developers.klaviyo.com](https://developers.klaviyo.com/en/docs/klaviyo_mcp_server).

**Aclaración honesta:** es un server **hospedado por Klaviyo** (`https://mcp.klaviyo.com/mcp`), no algo que corre en tu computadora. La doc de Klaviyo dice que este server **solo está disponible para usuarios con rol Owner, Admin o Manager** en la cuenta, y que puede crear y enviar campañas reales — revisa antes de enviar.

--- dev ---

Klaviyo publica un **server MCP remoto oficial** en `https://mcp.klaviyo.com/mcp`, documentado en `developers.klaviyo.com/en/docs/klaviyo_mcp_server`. La auth es **OAuth con registro dinámico de cliente** (también existe una variante local, autenticada con una API key privada por variable de entorno, pero este conector usa el path oficial hospedado por OAuth). TerminalSync hace de puente con el endpoint hospedado localmente:

```
npx -y mcp-remote@latest https://mcp.klaviyo.com/mcp
```

La doc enumera más de 40 tools en Accounts, Campaigns, Catalogs, Events, Flows, Groups (Lists & Segments), Images, Profiles, Reporting, Templates y Translations (beta) — por ejemplo `get_campaigns`, `create_campaign`, `get_flows`, `get_profiles`, `update_profile`, `get_campaign_report`, `create_email_template`. El server remoto soporta modos por query-param documentados por Klaviyo: `read-only`, `core-tools-only` (por defecto `true` para ChatGPT), `disable-tools-with-user-generated-content`, `include-output-schemas` y `beta`. La doc de Klaviyo restringe el acceso completo a roles Owner/Admin/Manager de la cuenta.

Licencia: términos propietarios de SaaS (`klaviyo.com/legal/api-terms`). Fuente: developers.klaviyo.com/en/docs/klaviyo_mcp_server.
