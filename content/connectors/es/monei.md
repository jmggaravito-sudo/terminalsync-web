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
**MONEI** es la plataforma de cobros que usan los negocios de España: es una entidad de pago regulada por el Banco de España (licencia #6911), con certificación PCI DSS Level 1 y Bizum Direct Acquirer — lo que le permite cobrar por los medios de pago locales que los consumidores españoles sí usan: Bizum, tarjeta y SEPA — y MB WAY para tus clientes en Portugal. MONEI presenta su server MCP como *"the first European payment platform with native AI agent support"* — la primera plataforma de pagos europea con soporte nativo para agentes de IA — y funciona con cualquier asistente compatible con MCP, incluido el de TerminalSync.

Una vez conectado, el agente responde las preguntas que hoy te hacen abrir el panel: si entró un pago concreto, qué pagos fallaron esta semana, cuánto cobraste en marzo y con qué tasa de éxito. También se encarga de la parte operativa: crear un enlace de pago y enviárselo a tu cliente por correo electrónico o SMS. Crear o enviar un enlace modifica tu cuenta real. Revisa la acción y la configuración de aprobaciones de tu cliente de IA antes de permitirla; el consentimiento OAuth no equivale a confirmar cada acción por separado.

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
3. Revisa los permisos reales que muestra MONEI antes de autorizar. Su repositorio público describe lectura de pagos y suscripciones, creación de enlaces de pago y lectura de cuenta, pero eso no certifica por sí solo los permisos del servicio hospedado. No apruebes más acceso del que necesitas. Hace falta una cuenta activa de MONEI. La fuente oficial es [MONEI/MONEI-MCP-Server](https://github.com/MONEI/MONEI-MCP-Server).

**Aclaración honesta:** este servidor está **hospedado por MONEI** (`https://mcp.monei.com`), no en tu computadora. El repositorio público describe consultas de pagos y creación/envío de enlaces, con restricciones sobre otras operaciones. TerminalSync no ha verificado esas restricciones con una cuenta autenticada en el servicio hospedado. Los metadatos de autorización del servicio anuncian un catálogo de permisos más amplio que los cuatro del repositorio; los permisos admitidos no demuestran qué permisos se otorgan a tu cuenta. Revisa el consentimiento y los controles de la cuenta antes de conectar. La licencia MIT del código no certifica el servicio hospedado.

--- dev ---

MONEI publica un **server MCP remoto oficial** (Streamable HTTP) hospedado en `https://mcp.monei.com`, documentado en su repo oficial `github.com/MONEI/MONEI-MCP-Server`. Una salvedad de endpoint, verificada por sonda directa (2026-10-16): el README documenta `https://mcp.monei.com/mcp`, pero el despliegue hospedado sirve MCP en la **raíz** — `POST /mcp` responde 404, mientras que la raíz responde 401 a un `initialize` sin credenciales y su propio `/.well-known/oauth-protected-resource` declara `https://mcp.monei.com` como recurso. El manifest apunta a la raíz.

TerminalSync hace de puente localmente con el endpoint hospedado:

```
npx -y mcp-remote@latest https://mcp.monei.com
```

La autenticación usa **OAuth con login en el navegador**. El repositorio público describe OAuth 2.0 + PKCE y cuatro permisos (`payments:read`, `payments:create`, `subscriptions:read`, `account:read`); es una descripción de ese código, no un límite verificado del servicio hospedado. El discovery de autorización en `oauth.monei.com/.well-known/oauth-authorization-server` anuncia registro dinámico y PKCE `S256`, pero también un catálogo de permisos más amplio. Revisa los permisos realmente solicitados y otorgados antes de consentir; esta revisión no inició sesión, obtuvo tokens de cuenta ni probó operaciones financieras.

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

**Divulgación de seguridad:** el repositorio público documenta restricciones en el servidor, auditoría y un límite de peticiones por cuenta. Son afirmaciones del proveedor/código, no garantías verificadas del servicio hospedado. Esta ficha no promete que toda autorización hospedada impida reembolsos, capturas, cancelaciones, desembolsos o cambios de configuración. No otorgues acceso basándote en esa suposición. Llegar a la pantalla de autorización sin credenciales prueba disponibilidad, no los permisos otorgados ni su aplicación. Esta revisión no conectó ninguna cuenta ni ejecutó operaciones financieras.

Licencia: MIT (LICENSE del repo, "© MONEI"). Fuente: github.com/MONEI/MONEI-MCP-Server — README oficial del MONEI MCP Server. Vendor: MONEI Digital Payments, S.L. (licencia del Banco de España #6911).
