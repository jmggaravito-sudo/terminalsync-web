---
name: Bird
logo: /connectors/bird.svg
category: messaging
markets: ["GLOBAL"]
status: available
simpleTitle: "Email, SMS y WhatsApp de tu negocio, enviados conversando"
simpleSubtitle: "Server MCP oficial de Bird: envía y revisa mensajes por email, SMS y WhatsApp, y gestiona contactos y plantillas por OAuth."
devTitle: "Conector MCP de Bird"
devSubtitle: "MCP oficial hospedado de Bird (mcp.bird.com) — mensajería, plantillas, contactos, números y verificación."
ctaUrl: "https://www.bird.com"
tokenHelpUrl: "https://bird.com/docs/ai/mcp-server"
manifest:
  mcpServers:
    bird:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.bird.com"]
affiliate: false
tagline: "El canal de mensajes de tu negocio, al alcance del agente"
originalAuthor: "Bird"
originalAuthorUrl: "https://bird.com/docs/ai/mcp-server"
license: "proprietary"
licenseUrl: "https://bird.com/legal/terms"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-10-19T14:30:00.000Z"
verifiedPackageVersion: null
---
**Bird** (antes MessageBird) es la plataforma de comunicación con clientes con la que los negocios envían email, SMS, WhatsApp y voz sobre una sola API. Su server MCP oficial en el registro lo describe así: *"Send and receive across email, SMS, WhatsApp, and voice. One API, one contract"*. El conector es un **server MCP hospedado** (`https://mcp.bird.com`) con el catálogo completo de tools.

Qué significa en la práctica: tu agente puede enviar emails, SMS y WhatsApp (uno por uno o en lote), revisar lo enviado y sus eventos de entrega, administrar plantillas de email y de WhatsApp, gestionar contactos, propiedades y audiencias, configurar dominios de email y remitentes SMS, comprar y administrar números, verificar usuarios por canal y revisar webhooks y tu workspace. El toolset es curado: no expone toda la API de Bird, sino las operaciones que un cliente necesita.

### Qué le puedes pedir

- *"Envía un email de agradecimiento a los clientes que compraron este mes."*
- *"Manda por WhatsApp el recordatorio de la cita de mañana a cada contacto."*
- *"¿Cuántos SMS enviamos esta semana y cuántos se entregaron?"*
- *"Crea la plantilla de email de confirmación de pedido y guárdala en la cuenta."*

### Cómo te conectas

Este conector **no te pide pegar ninguna API key**. Usa el login OAuth de Bird:

1. Activa el conector en TerminalSync.
2. El puente `mcp-remote` abre el login de Bird en tu navegador — el cliente se registra solo, sin crear ninguna app a mano: *"Dynamic registration removes the need for a pre-shared client ID or manual configuration"*.
3. Inicias sesión y apruebas los permisos. Antes de eso, el server no entrega nada — *"A client that has only the URL receives a `401` until you sign in"*.

**Aclaración honesta:** es un **server hospedado por Bird** (`https://mcp.bird.com`), no algo que corre en tu computadora, y **envía mensajes reales a destinatarios reales** (cada envío consume el crédito o coste de tu cuenta de Bird). El alcance queda acotado tres veces: *"capped to the intersection of what the client requested, what you approved, and what you actually hold"* — y los permisos de dueño de organización o admin de plataforma nunca se delegan. Puedes revocar el acceso cuando quieras en Connected apps: *"revoking it there cuts the client off immediately"*.

--- dev ---

Bird (la empresa antes conocida como MessageBird; org oficial de GitHub `messagebird`) publica su server MCP como **server remoto/hospedado**, documentado en `bird.com/docs/ai/mcp-server` (repo oficial `github.com/messagebird/bird-ai`). Endpoints hospedados: `https://mcp.bird.com` (catálogo completo) y `https://mcp.bird.com/dynamic` — *"Only `search` and `execute`"*, para clientes con límites duros de tools (devuelve datos, sin widgets). Existe también un modo local vía el CLI (`bird mcp` sobre stdio tras `bird auth login`), que es lo que el manifest del catálogo NO usa. El puente del catálogo es el patrón genérico de cliente:

```
npx -y mcp-remote@latest https://mcp.bird.com
```

Ambos endpoints hospedados usan Streamable HTTP y el mismo login OAuth de Bird: *"Both hosted endpoints use Streamable HTTP and the same Bird OAuth sign-in"*; cada request lleva tu token OAuth bearer, que la API de Bird valida por request, y el server hospedado *"stores no secrets and validates nothing itself"*. El intercambio de token usa PKCE y refresca solo. Región: *"The API host follows your login's region automatically"*.

Tools verbatim del catálogo oficial (curado): mensajería `email_send`, `email_send_batch`, `email_list`, `email_get`, `sms_send`, `sms_send_batch`, `sms_get`, `sms_list`, `sms_list_events`, `sms_templates_list`/`sms_templates_get`, `whatsapp_send/get/list/list_events/media`, `whatsapp_templates_*`, `voice_legs_get`/`voice_legs_list`, `voice_stats_*`, `voice_session_credentials_create`, `verify_verifications_create/check/next_channel`, `voice_calls_create` (preview); setup de canal `email_domains_create/verify/list/get`, `sms_senders_create/requirements`, `sms_senders_registrations_create`, `sms_10dlc_*`, `numbers_available_list`, `numbers_orders_create`, `numbers_cancel`, `numbers_release`, `whatsapp_numbers_precheck`, `trust_*`; entregabilidad `email_templates_create/list/get/update/duplicate/preview`, `email_templates_versions_*`, `email_suppressions_list/check/add/remove`, `email_dedicated_ips_*`, `email_ip_pools_*`; audiencia y config `contacts_*`, `contact_properties_*`, `audiences_*`, `preferences_*`, `realtime_apps_*`, `realtime_apps_keys_*`, `lookup_phone_number`, `lookup_email`, `webhooks_list`, `workspace_get`, `whoami`. El endpoint hospedado omite las 4 tools solo-stdio (`auth_signup`, `auth_verify_email`, `auth_create_org`, `compliance_attachments_upload`). Las llamadas de voz en preview no marcan el número por sí solas: *"preparing it does not place the call"* — la ejecuta una persona en el navegador.

Licencia: SaaS propietario (Bird Terms, `bird.com/legal/terms`). Fuente: bird.com/docs/ai/mcp-server + registro MCP (`com.bird/mcp`).
