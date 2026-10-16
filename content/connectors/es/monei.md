---
name: MONEI
logo: /connectors/monei.png
category: automation
markets: ["ES"]
status: available
simpleTitle: "Pregúntale a tu cuenta de MONEI qué cobros entraron — y cobra con enlaces de pago"
simpleSubtitle: "MCP oficial de MONEI: pagos, KPIs de ingresos, suscripciones y enlaces de pago por OAuth, sin pegar ninguna API key."
devTitle: "Conector MCP de MONEI"
devSubtitle: "MCP oficial hospedado de MONEI (mcp.monei.com) — enlaces de pago, transacciones, KPIs de ingresos, suscripciones y datos de cuenta sobre OAuth."
ctaUrl: "https://monei.com"
tokenHelpUrl: "https://github.com/MONEI/MONEI-MCP-Server"
manifest:
  mcpServers:
    monei:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.monei.com"]
affiliate: false
tagline: "Tus cobros en MONEI, al alcance del agente"
originalAuthor: "MONEI Digital Payments, S.L."
originalAuthorUrl: "https://github.com/MONEI/MONEI-MCP-Server"
license: "MIT"
licenseUrl: "https://github.com/MONEI/MONEI-MCP-Server/blob/main/LICENSE"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-10-16T10:39:26.157Z"
verifiedPackageVersion: null
---
**MONEI** es la plataforma de cobros que usan los negocios de España: es una entidad de pago regulada por el Banco de España (licencia #6911), con certificación PCI DSS Level 1 y Bizum Direct Acquirer — lo que le permite cobrar por los rieles locales que los consumidores españoles sí usan: Bizum, tarjeta, SEPA y MB WAY. MONEI presenta su server MCP como *"the first European payment platform with native AI agent support"* — la primera plataforma de pagos europea con soporte nativo para agentes de IA — y funciona con cualquier asistente compatible con MCP, incluido el de TerminalSync.

Una vez conectado, el agente responde las preguntas que hoy te hacen abrir el panel: si entró un pago concreto, qué pagos fallaron esta semana, cuánto cobraste en marzo y con qué tasa de éxito. También se encarga de la parte operativa: crear un enlace de pago y enviárselo a tu cliente por correo electrónico o SMS. Cada escritura (crear o enviar un enlace) te muestra primero qué va a hacer, y el agente pide tu confirmación antes de ejecutarla.

### Qué le puedes pedir

- *"¿Entró el pago del enlace que le mandé a la clínica García?"*
- *"Muéstrame todos los pagos que fallaron esta semana."*
- *"¿De cuánto fueron mis cobros de marzo y cuál es mi tasa de éxito?"*
- *"Genera un enlace de pago de €50 para el pedido #42 y envíalo por correo electrónico al cliente."*
- *"Lista mis suscripciones activas y muéstrame el detalle de la del gimnasio."*
- *"¿Qué métodos de pago tengo activados en mi cuenta?"*

### Cómo te conectas

Este conector **no te pide pegar ninguna API key**. Usa el login de tu propia cuenta de MONEI:

1. Activa el conector en TerminalSync.
2. El puente `mcp-remote` abre el login de MONEI en tu navegador y te pide autorizar el acceso.
3. Apruébalo con tu cuenta — el conector solo puede ver y hacer lo que esa cuenta permita. MONEI limita los permisos otorgados a leer pagos y suscripciones, crear enlaces de pago y leer los datos de tu cuenta. Necesitas una cuenta de MONEI activa (MONEI atiende negocios de España y Andorra). La documentación oficial está en [github.com/MONEI/MONEI-MCP-Server](https://github.com/MONEI/MONEI-MCP-Server).

**Aclaración honesta:** es un **server hospedado por MONEI** (`https://mcp.monei.com`), no algo que corre en tu computadora. Lee tus pagos, suscripciones y datos de cuenta, y puede crear y enviar enlaces de pago — nada más. Las operaciones que mueven dinero están bloqueadas de raíz en el server, no solo ocultas: el agente no puede reembolsar pagos, capturarlos ni cancelarlos, cobrar directamente con tarjeta o Bizum, hacer payouts, cancelar suscripciones ni cambiar la configuración o las credenciales de tu cuenta. Eso sigue haciéndose desde el dashboard de MONEI. Cada llamada queda registrada en un log de auditoría y el límite es de 60 peticiones por minuto por cuenta. Es además un proyecto open source joven (MIT) con el roadmap todavía abierto — conviene saberlo antes de depender de él.

--- dev ---

MONEI publica un **server MCP remoto oficial** (Streamable HTTP) hospedado en `https://mcp.monei.com`, documentado en su repo oficial `github.com/MONEI/MONEI-MCP-Server`. Una salvedad de endpoint, verificada por sonda directa (2026-10-16): el README documenta `https://mcp.monei.com/mcp`, pero el despliegue hospedado sirve MCP en la **raíz** — `POST /mcp` responde 404, mientras que la raíz responde 401 a un `initialize` sin credenciales y su propio `/.well-known/oauth-protected-resource` declara `https://mcp.monei.com` como recurso. El manifest apunta a la raíz.

TerminalSync hace de puente localmente con el endpoint hospedado:

```
npx -y mcp-remote@latest https://mcp.monei.com
```

La auth es **OAuth 2.0 + PKCE** (RFC 7636) con state tokens de un solo uso, y los tokens quedan acotados a los scopes `payments:read`, `payments:create`, `subscriptions:read` y `account:read` — sin API key de por medio. El discovery OAuth del vendor (`oauth.monei.com/.well-known/oauth-authorization-server`) publica un `registration_endpoint` (registro dinámico de cliente, PKCE `S256` y `client_id_metadata_document_supported`), que es lo que le permite a `mcp-remote` registrar su cliente y llegar al login del navegador.

Tools MCP, verbatim del README oficial:

| Tool | Tipo | Qué hace | Ejemplo del README |
|---|---|---|---|
| `generate_payment_link` | Write | Crear una URL de pago compartible | *"Generate a €50 link for order #42"* |
| `send_payment_link` | Write | Enviar el enlace por email o SMS | *"Send that link to alex@example.com"* |
| `get_payment` | Read | Buscar un pago por ID | *"What's the status of payment ch_abc123?"* |
| `list_payments` | Read | Buscar y filtrar transacciones | *"Show me all failed payments this week"* |
| `get_payments_kpi` | Read | Analítica de ingresos por rango de fechas | *"What's my revenue for March?"* |
| `get_subscription` | Read | Ver el detalle de una suscripción | *"Get details of subscription sub_xyz"* |
| `list_subscriptions` | Read | Recorrer las suscripciones | *"List all active subscriptions"* |
| `get_account_info` | Read | Configuración de cuenta y métodos de pago | *"What payment methods do I have enabled?"* |

Los importes van en céntimos (la unidad mínima de la moneda): €10.50 = 1050.

**Divulgación de seguridad:** las operaciones restringidas están **bloqueadas de raíz a nivel de server**, no solo ocultas de la lista de tools — reembolsar pagos, capturar/cancelar pagos, cobrar directamente con tarjeta/Bizum, payouts de tarjeta/Bizum, cancelar suscripciones, modificar la configuración de la cuenta, crear/borrar API keys y borrar webhooks. Una llamada artesanal se rechaza con un mensaje que manda a `dashboard.monei.com`. El rate limit es una ventana móvil de 60 req/min por cuenta, y cada tool call queda en un log de auditoría con timestamp, ID de cuenta y parámetros saneados. El repo también se puede self-hostear (npm/Docker con una API key de MONEI) — TerminalSync shipea el endpoint hospedado. El proyecto es joven (12 commits, 0 stars al momento de escribir) con roadmap abierto (publicación en npm, notificaciones webhook, tools específicas de Bizum, reportes de settlement). **Smoke de esta corrida:** el puente `mcp-remote` completó el registro dinámico de cliente contra `oauth.monei.com` y llegó al paso de autorización en `https://mcp.monei.com` — completar el login requiere una persona con una cuenta de MONEI.

Licencia: MIT (LICENSE del repo, "© MONEI"). Fuente: github.com/MONEI/MONEI-MCP-Server — README oficial del MONEI MCP Server. Vendor: MONEI Digital Payments, S.L. (licencia del Banco de España #6911).
