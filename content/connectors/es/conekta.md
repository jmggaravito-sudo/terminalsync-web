---
name: Conekta
logo: /connectors/conekta.svg
category: automation
markets: ["MX"]
status: soon
simpleTitle: "Pregunta por tus pagos de Conekta en lenguaje natural"
simpleSubtitle: "MCP oficial de Conekta: órdenes, clientes, cargos, reembolsos y suscripciones, con tu llave privada del API."
devTitle: "Conector MCP de Conekta"
devSubtitle: "MCP oficial hospedado de Conekta (mcp.conekta.com) — órdenes, clientes, cargos, reembolsos, checkouts y suscripciones sobre Streamable HTTP, autenticación Bearer con llave privada del API."
ctaUrl: "https://www.conekta.com"
tokenHelpUrl: "https://panel.conekta.com/developers"
manifest:
  mcpServers:
    conekta:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.conekta.com/mcp", "--header", "Authorization:${CONEKTA_AUTH_HEADER}"]
      env:
        CONEKTA_AUTH_HEADER: "Bearer ${SECRET:CONEKTA_API_KEY}"
affiliate: false
tagline: "Tus pagos con Conekta, al alcance del agente"
originalAuthor: "Conekta"
originalAuthorUrl: "https://github.com/conekta/mcp-server"
license: "proprietary"
licenseUrl: "https://www.conekta.com/legal/tos"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: false
installableForAiReason: "needs-oauth"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-10-15T09:10:05.000Z"
verifiedPackageVersion: null
---
**Conekta** es la pasarela de pagos de México: con una sola integración aceptas tarjetas, transferencias SPEI y pagos en efectivo en pesos mexicanos. Su sitio lo dice sin rodeos: *"14 años perfeccionando los pagos en México"*. El conector oficial es un **server MCP hospedado** (`https://mcp.conekta.com/mcp`), publicado por Conekta, que conecta a tu agente con la operación de pagos de tu cuenta — la documentación oficial lo presenta como el servidor que *"conecta cualquier agente de AI o LLM"* con el API de Conekta.

Le preguntas *"Muéstrame las órdenes de hoy"* — ejemplo directo de la documentación — y el agente consulta tus órdenes y te resume su estado. *"¿Cuál es mi balance disponible?"* sale del balance de tu cuenta, sin entrar al panel. También trabaja por ti: *"Crea un link de pago por $500 pesos"* genera el link de cobro, y *"Reembolsa el último cargo de la cliente Ana Gómez"* procesa el reembolso. La propia documentación lo resume: sirve para *"crear clientes, órdenes y links de pago sin salir de tu flujo de trabajo"*.

### Qué le puedes pedir

- *"Muéstrame las órdenes de hoy y dime cuáles ya fueron pagadas."*
- *"¿Cuál es mi balance disponible en Conekta?"*
- *"Crea un link de pago por $500 pesos y envíalo por correo al cliente."*
- *"Reembolsa el último cargo de la cliente Ana Gómez."*
- *"Pausa la suscripción de la cliente Ana Gómez."*
- *"¿Qué suscripciones tengo activas y con qué plan van?"*

Cuando lo que pides implica escribir en tu cuenta — crear una orden, reembolsar un cargo, pausar una suscripción — la IA te muestra qué va a hacer y espera tu confirmación antes de ejecutarlo.

### Qué token necesitas

Necesitas una **llave privada del API de Conekta** — la credencial que permite a un software operar sobre tu cuenta. No la confundas con la llave pública: esa solo tokeniza tarjetas en el navegador del cliente y no sirve aquí.

1. Entra al [panel de Conekta](https://panel.conekta.com/developers) con tu cuenta y abre la sección de desarrolladores (menú de la izquierda) → **Ver API Keys** → **Consultar API Keys de producción**.
2. Si es tu primera integración, haz clic en **Crear nueva llave privada** y ponle un alias. La llave se muestra **una sola vez**: cópiala en ese momento y guárdala en un lugar seguro. Conekta permite hasta 10 llaves privadas en producción y otras 10 en pruebas.
3. Pégala cuando TerminalSync te pida `CONEKTA_API_KEY`. Se guarda cifrada en los Secretos de la app y se envía al servidor como el header `Authorization: Bearer …` que Conekta espera.

Notas oficiales sobre la llave: solo los roles de Administrador y Desarrolladores pueden gestionar llaves del API, y si pierdes una llave o crees que se expuso, Conekta recomienda generar una nueva y reconfigurar la integración (las llaves eliminadas no se pueden recuperar).

**Aviso honesto:** es un **server hospedado por Conekta** (`https://mcp.conekta.com`), no algo que corre en tu computadora: tus pedidos viajan al servidor de Conekta, que responde con los datos de tu cuenta. Lee **y escribe**: puede crear órdenes, clientes, planes y links de cobro, reembolsar cargos, y pausar, cancelar o reanudar suscripciones. Lo que el agente puede hacer queda acotado por tu llave privada — el mismo acceso que tiene tu cuenta en el API — y la documentación del MCP no describe un mecanismo de confirmación previa del lado del servidor (esa confirmación la pide TerminalSync antes de cada escritura). Los datos salen de tu cuenta de Conekta y verificarlos es tu responsabilidad.

**Por qué aparece como Pronto:** al preparar esta ficha (2026-10-15), la dirección documentada del server (`mcp.conekta.com`) no estaba publicada en el DNS de Conekta, así que todavía no se puede conectar. Publicamos la ficha con la configuración oficial documentada y la activaremos cuando el endpoint responda y la re-verifiquemos.

--- dev ---

Conekta publica su **MCP oficial** en `https://mcp.conekta.com/mcp` — *"available remotely over Streamable HTTP"*, según el README del repo oficial (`github.com/conekta/mcp-server`). El repo también trae un server local stdio (Python vía `uv`, o Docker `ghcr.io/conekta/mcp-server:latest`, env `CONEKTA_API_KEY`); esta ficha sigue el endpoint hospedado, que se puentea con `mcp-remote`:

```
npx -y mcp-remote@latest https://mcp.conekta.com/mcp --header "Authorization:${CONEKTA_AUTH_HEADER}"
```

**Autenticación: Bearer con llave privada.** El header `Authorization` lleva la llave privada del API como Bearer token. El README es explícito: *"The header must be exactly `Authorization`"*, *"The value must include the `Bearer ` prefix"* y *"Replace `key_xxx` with your real Conekta private API key"*. El manifest de esta ficha inyecta la llave desde los Secretos de la app como `${SECRET:CONEKTA_API_KEY}` dentro de ese header — el argumento `--header` va sin espacios alrededor de los dos puntos, como recomienda el README de `mcp-remote` para esquivar el bug de escaping de algunos clientes.

**Llave:** panel.conekta.com → sección de desarrolladores → **Ver API Keys** → **Consultar API Keys de producción** → **Crear nueva llave privada**. La configuración de cliente que Conekta documenta para el endpoint hospedado:

```json
{
  "mcpServers": {
    "conekta": {
      "url": "https://mcp.conekta.com/mcp",
      "headers": { "Authorization": "Bearer key_xxx" }
    }
  }
}
```

**Tools documentadas por recurso** (nombres verbatim del README):

- **Balance:** `get_balance`
- **Clientes:** `create_customer`, `list_customers`, `get_customer`, `update_customer`
- **Órdenes:** `create_order`, `list_orders`, `get_order`, `update_order`, `cancel_order`, `capture_order`
- **Cargos:** `list_charges`
- **Reembolsos:** `create_refund`
- **Planes:** `create_plan`, `list_plans`, `get_plan`
- **Suscripciones:** `list_subscriptions`, `get_subscription`, `create_subscription`, `update_subscription`, `cancel_subscription`, `pause_subscription`, `resume_subscription`
- **Checkouts (links de pago):** `create_checkout`, `list_checkouts`, `get_checkout`, `cancel_checkout`, `send_checkout_email`, `send_checkout_sms`
- **Eventos:** `list_events`, `get_event`
- **Empresa:** `get_current_company`

**Estado del endpoint (2026-10-15):** `mcp.conekta.com` **no resuelve por DNS** (NXDOMAIN confirmado contra los nameservers autoritativos de Conekta en Route 53, consultados vía Google y Cloudflare DoH), mientras que los subdominios hermanos (`www`, `panel`, `developers`, `api`) sí resuelven. El endpoint está documentado verbatim en el README oficial y en developers.conekta.com, pero hoy no se puede conectar; por eso la ficha se publica como `soon` con `installableForAi: false`. Cuando el DNS responda, re-verificar con `node scripts/smoke-remote-login.mjs --slugs conekta` y pasar a `status: available` / `installableForAi: true`.

**Divulgación:** server hospedado (no local) que lee y escribe sobre tu cuenta de Conekta — el catálogo incluye tools que mueven dinero real (`create_refund`, `capture_order`) y tools que modifican suscripciones. La doc del MCP no documenta un gate de confirmación del lado del servidor: el control queda en el cliente que orquesta las tools y en los permisos de la llave. Alcance: Conekta es una pasarela de México — sus métodos de pago son rieles domésticos mexicanos (SPEI, Conekta Efectivo, Meses sin Intereses, entre otros).

Licencia: propietaria (SaaS de Conekta; el repo `conekta/mcp-server` no declara licencia). Fuente: developers.conekta.com — doc "Conekta MCP Server" + README del repo oficial github.com/conekta/mcp-server (tools y auth verbatim). Términos: conekta.com/legal/tos.
