---
name: Siigo
logo: /connectors/siigo.svg
category: automation
status: available
simpleTitle: "Tu facturación, respondida en lenguaje natural"
simpleSubtitle: "MCP oficial de Siigo: facturas de venta, clientes y productos por OAuth, sin pegar ninguna API key."
devTitle: "Conector MCP de Siigo"
devSubtitle: "MCP oficial hospedado de Siigo (mcp.siigo.com) — facturas de venta, clientes/terceros y catálogo de productos sobre OAuth."
ctaUrl: "https://www.siigo.com"
tokenHelpUrl: "https://developers.siigo.com/docs/siigoapi/MCP/1-documentation/"
manifest:
  mcpServers:
    siigo:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.siigo.com/mcp-adapter"]
affiliate: false
tagline: "Tus facturas, tus clientes y tu catálogo, al alcance del agente"
originalAuthor: "Siigo"
originalAuthorUrl: "https://developers.siigo.com/docs/siigoapi/MCP/1-documentation/"
license: "proprietary"
licenseUrl: "https://seguridad.siigo.com/paises/colombia/legal/condiciones-de-uso-software-nube"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Siigo** es el software contable y administrativo con el que muchas micro, pequeñas y medianas empresas de Colombia llevan su contabilidad, su facturación y su operación diaria. El conector oficial de Siigo es un **server MCP hospedado** (`https://mcp.siigo.com`), publicado por Siigo, que le da a tu agente acceso a tus facturas, tus clientes y tu catálogo de productos con el login oficial de tu cuenta de Siigo — sin pegar ninguna API key y, como dice la propia documentación, "sin necesidad de un desarrollador, tener conocimientos de código".

Pregúntale *"¿Cuánto facturé este mes y a qué clientes?"* y el agente lee tus facturas directo de tu cuenta. *"Muéstrame el stock disponible de mis productos."* *"¿Cuál fue mi producto más vendido esta semana?"* — respuestas que hoy te tocan buscar entre pantallas de Siigo. También puede crear por ti: *"Crea la factura para Carlos Pérez: 2 sillas ejecutivas, pago al contado"* — el asistente te pide confirmación antes de registrar cualquier cosa. Y si manejas varias empresas, puedes cambiar de una a otra desde el propio chat.

### Qué le puedes pedir

- *"¿Cuánto facturé este mes y a qué clientes?"*
- *"Muéstrame el stock disponible de mis productos."*
- *"Lista mis clientes y dime cuáles son empresas."*
- *"¿Qué impuestos y formas de pago tengo configurados?"*
- *"¿Cuál fue mi producto más vendido esta semana?"*
- *"Crea la factura para Carlos Pérez: 2 sillas ejecutivas, pago al contado."* — se registra solo después de tu confirmación.

### Cómo te conectas

Este conector **no te pide pegar ninguna API key**. Usa el login oficial de tu cuenta de Siigo:

1. Antes de empezar, tu empresa debe tener habilitadas las credenciales de integración de Siigo API: en Siigo, **Configuración → Credenciales de integración a plataformas digitales**. Si no las tienes, el propio asistente te guía para activarlas.
2. Activa el conector en TerminalSync.
3. El puente `mcp-remote` abre el login oficial de Siigo en tu navegador; inicia sesión y autoriza el acceso. La IA nunca ve tu contraseña y opera con los permisos de tu propio usuario.

**Aviso honesto:** es un **server hospedado por Siigo** (`https://mcp.siigo.com`), no algo que corre en tu computadora. Lo que el agente puede ver y hacer queda acotado por los permisos de tu usuario de Siigo. Puede crear facturas, y crear o actualizar clientes, con tu aprobación explícita, y consultar tu catálogo — pero no borrar información: la documentación oficial lo dice en dos palabras, *"Borrar, nunca."* Los datos salen directo de tu cuenta, y verificarlos es tu responsabilidad.

--- dev ---

Siigo publica su **MCP oficial** como server remoto/hospedado en `https://mcp.siigo.com` (la "URL MCP Siigo"), documentado en su portal de desarrolladores (`developers.siigo.com/docs/siigoapi/MCP/1-documentation/`). No hay paquete npm ni server stdio local — se puentea localmente con `mcp-remote`:

```
npx -y mcp-remote@latest https://mcp.siigo.com/mcp-adapter
```

La autenticación es **OAuth/B2C con el login oficial de Siigo**, sin client secret que guardar: "Inicias sesión mediante el login oficial de Siigo (OAuth/B2C)" y "La IA nunca ve tu contraseña y opera utilizando la identidad y los permisos asociados a tu usuario". Siigo realizó el lanzamiento sobre Claude y ChatGPT. **No se probó todavía el login de Siigo a través del puente `mcp-remote` con una cuenta real**: la documentación describe el flujo OAuth/B2C pero no menciona este puente.

**Prerrequisito documentado:** "Tu empresa debe tener habilitadas las credenciales de integración de Siigo API" — se habilitan en Siigo en **Configuración → Credenciales de integración a plataformas digitales**; si faltan, el propio asistente guía la activación.

Alcance documentado en la tabla oficial ("Alcance del MCP oficial de Siigo"):

- **Facturas de venta** — "Crear y consultar una o todas las facturas de venta": crear facturas directamente en Siigo y consultar las existentes con su detalle.
- **Clientes** — "Crear, consultar y actualizar clientes / terceros": crear clientes nuevos y consultar la información comercial y de contacto de los registrados.
- **Productos o servicios** — "Consultar productos": el catálogo configurado en Siigo, con "código, saldos, descripción, precio y demás atributos disponibles" (solo consulta; la tabla no lista creación ni actualización de productos).
- **Multi-empresa** — tool documentada `cambiar_empresa`: "Puedes cambiar de empresa cuando quieras usando la herramienta `cambiar_empresa` desde el propio chat".

**Divulgación:** es un server hospedado (no local) que lee y escribe. Según la doc oficial, "las consultas de información se realizarán únicamente en respuesta a solicitudes realizadas por el usuario", y "las acciones que impliquen la creación, modificación o eliminación de información requerirán la aprobación explícita del usuario antes de ser ejecutadas" — con el borrado descartado de plano ("Borrar, nunca."). La FAQ agrega que crear (facturas, clientes o productos) "solo ocurre cuando tú lo solicitas explícitamente" y que "antes de registrar cualquier información, el asistente te pedirá confirmación". La doc no publica una lista estática completa de tools más allá de ese alcance (los ejemplos de impuestos y formas de pago sugieren lectura de datos de configuración, sin tools nombradas). La doc recomienda usar planes de pago de la herramienta de IA, porque los gratuitos "suelen tener límites de uso más reducidos".

Licencia: SaaS propietario (condiciones de uso de Siigo Nube, `seguridad.siigo.com/paises/colombia/legal/condiciones-de-uso-software-nube`). Fuente: developers.siigo.com — documentación MCP de Siigo API.
