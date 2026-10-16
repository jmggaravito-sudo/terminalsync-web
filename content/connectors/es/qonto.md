---
name: Qonto
logo: /connectors/qonto.png
category: automation
markets: ["ES", "FR"]
status: available
simpleTitle: "Pregúntale a tu cuenta de Qonto por dónde se fue el dinero — y factura desde el chat"
simpleSubtitle: "MCP oficial de Qonto: transacciones, tarjetas, facturas de clientes y links de pago por OAuth, sin pegar ninguna API key."
devTitle: "Conector MCP de Qonto"
devSubtitle: "MCP oficial hospedado de Qonto (mcp.qonto.com/mcp) — banca de negocio, facturación y gestión de tarjetas sobre OAuth."
ctaUrl: "https://qonto.com"
tokenHelpUrl: "https://docs.qonto.com/mcp/overview"
manifest:
  mcpServers:
    qonto:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.qonto.com/mcp"]
affiliate: false
tagline: "Tu cuenta de negocio y tu facturación, al alcance del agente"
originalAuthor: "Qonto"
originalAuthorUrl: "https://docs.qonto.com/mcp/overview"
license: "proprietary"
licenseUrl: "https://docs.qonto.com/mcp/terms-and-disclosures"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-10-16T10:39:54.000Z"
verifiedPackageVersion: null
---
**Qonto** es la cuenta bancaria de negocio en la que se apoyan autónomos y pymes de España y Francia (y de otros países europeos): tarjetas, transferencias, facturación y la gestión del día a día en un solo lugar. El server MCP oficial de Qonto le da a tu agente acceso directo a esa cuenta — sin pegar ninguna API key en TerminalSync, solo con el login de tu propia cuenta de Qonto.

Le preguntas *"¿Cuánto gasté el mes pasado?"* y te trae las transacciones de la cuenta. Le pides *"Muéstrame lo que me deben"* y revisa tus facturas de clientes para encontrar lo que está vencido y necesita un seguimiento. También se ocupa de la parte operativa: armar y enviar facturas de clientes, crear links de pago, bloquear una tarjeta, invitar a alguien nuevo al equipo. Cada escritura te pide confirmación antes de ejecutarse, y las operaciones sensibles con dinero siguen necesitando tu aprobación en la app móvil de Qonto — igual que si las hicieras tú mismo.

### Qué le puedes pedir

- *"¿Cuánto gastó el negocio el mes pasado y en qué se fue?"*
- *"¿Qué facturas de clientes siguen sin pagar y cuánto está vencido?"*
- *"Muéstrame las facturas de proveedores pendientes de pagar."*
- *"Crea una factura de 1.200 € para Estudio Vega y envíala por email."*
- *"Crea un link de pago de 350 € para que el cliente pague online."*
- *"Bloquea la tarjeta de Ana, perdió la cartera."*

### Cómo te conectas

Este conector **no te pide pegar ninguna API key**. Usa el login de tu propia cuenta de Qonto:

1. Activa el conector en TerminalSync.
2. El puente `mcp-remote` abre el login de Qonto en tu navegador: inicias sesión, eliges la organización a conectar y revisas los permisos que pide la app.
3. Apruébalo con tu cuenta — cada llamada se autentica como tú, y el conector nunca puede ver ni hacer más de lo que permiten tu rol en Qonto y el plan de tu organización. La guía oficial está en [docs.qonto.com](https://docs.qonto.com/mcp/overview).

**Aclaración honesta:** es un **server hospedado por Qonto** (`https://mcp.qonto.com/mcp`), no algo que corre en tu computadora. No guarda estado — Qonto dice que no guarda contenido de conversaciones ni datos del negocio, solo reenvía las llamadas, y la conversación queda en tu cliente de IA. Los propietarios, administradores y contables se conectan de entrada; los managers y empleados necesitan que un propietario o administrador habilite Qonto MCP para la organización primero. Algunas acciones (como crear ciertas tarjetas) disparan una aprobación en la app móvil de Qonto, y el conector no puede saltársela. Los términos del propio Qonto advierten que conectar comparte datos de tu cuenta con una herramienta de IA de terceros — conecta solo con herramientas en las que confíes.

--- dev ---

Qonto publica un **server MCP remoto oficial** en `https://mcp.qonto.com/mcp` (producción), documentado en `docs.qonto.com/mcp/overview`. El transporte es Streamable HTTP, y Qonto documenta verbatim la config para clientes genéricos:

```json
{
  "mcpServers": {
    "qonto": {
      "type": "http",
      "url": "https://mcp.qonto.com/mcp"
    }
  }
}
```

La auth es **OAuth con login en el navegador** — *"there is no API key or organization ID to copy by hand"* (no hay API key ni ID de organización que copiar a mano); el server reutiliza el mismo proveedor de identidad y pantalla de consentimiento que `developers.qonto.com`, con el mismo catálogo de permisos que la Business API. Los scopes quedan fijados al autorizar; ampliarlos exige re-autorizar. Este conector conecta **una organización por autorización**; existe además un endpoint multi-organización de solo lectura en `https://mcp.qonto.com/multi-organization/mcp` (ahí no se exponen tools de escritura).

TerminalSync hace de puente localmente con el endpoint hospedado:

```
npx -y mcp-remote@latest https://mcp.qonto.com/mcp
```

Las tools se agrupan por dominio de negocio (referencia: `docs.qonto.com/mcp/tools/overview`). Superficie documentada, verbatim por dominio:

- **Lectura** — transacciones y estados de cuenta (*"list, filter, retrieve transactions; pull monthly statements with presigned download URLs"*); tarjetas y sus metadatos; clientes; facturas de clientes, facturas de proveedores, presupuestos (quotes) y notas de crédito; links de pago (*"read one together with the payments collected against it"*); solicitudes pendientes de tarjetas y multi-transferencias; membresías, equipos y etiquetas; metadatos de la organización (*"legal name, IBANs, slug"*); el plan de la propia organización más la lista pública de precios de Qonto; adjuntos.
- **Escritura** — tarjetas (`create_card`, `update_card`, `change_card_status` — *"Set exactly one of `lock` (reversible), `unlock` (owners and admins only), `lost`, `stolen`, `discard` (all irreversible)"*); solicitudes de tarjetas y multi-transferencias; facturas de clientes (*"create, update, finalize, mark as paid or unpaid, send by email or over the e-invoicing network, delete drafts"*); presupuestos; notas de crédito; facturas de proveedores (*"change status (mark paid, unmark paid, reject)"*); links de pago (*"create a shareable checkout page from a basket of items or an existing client invoice"*); productos; clientes; membresías y equipos (*"invite new members (employee or reporting), create teams"*); subida de adjuntos; categorías de flujo de caja (*"grow it, and tag transactions"*).

**Divulgación:** *"Write tools exist only on the standard endpoint"*, y las escrituras *"always go through Qonto's standard approval logic"* — aprobar una solicitud se hace en la web de Qonto, no a través del asistente. SCA: las operaciones sensibles (acciones clasificadas como PSD2, como crear ciertas tarjetas) siguen requiriendo autenticación reforzada en la app móvil de Qonto — *"The MCP server cannot bypass SCA."* Cada llamada está *"authenticated as you"* y no puede exceder el rol del usuario ni el plan de la organización. Roles: *"Owners, admins, and accountants can connect by default"*; managers y empleados, una vez que un propietario o administrador habilita Qonto MCP para la organización. Explícitamente **fuera** del MCP: transferencias SEPA salientes a un beneficiario, transferencias internacionales, mandatos/suscripciones/cobros por débito directo SEPA, webhooks, terminales, desactivación de links de pago y conexiones de proveedores, y el onboarding — para eso está la Business API. El server es sin estado — Qonto dice que no guarda contenido de conversaciones, transcripciones ni datos del negocio; la conversación la retiene el cliente MCP. Los Terms and Disclosures de Qonto advierten que conectar comparte datos de la cuenta con una herramienta de IA de terceros, que Qonto *"cannot retrieve or delete information once it has been shared"* y que *"certain sensitive actions — such as initiating payments — are not available through this connection"*. El acceso se puede revocar en cualquier momento desde la sección de apps conectadas de la cuenta de Qonto. **Smoke de esta corrida:** `initialize` sin credenciales → 401; `https://mcp.qonto.com/.well-known/oauth-authorization-server` → 200 — el endpoint está vivo y protegido por OAuth, exactamente lo que el puente `mcp-remote` necesita para llegar a la pantalla de consentimiento.

Licencia: SaaS propietario (Qonto; Terms and Disclosures del MCP en `docs.qonto.com/mcp/terms-and-disclosures`, política de privacidad en `legal.qonto.com`). Fuente: docs.qonto.com — documentación oficial del MCP de Qonto.
