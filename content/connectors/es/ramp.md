---
name: Ramp
logo: /connectors/ramp.svg
category: automation
status: available
simpleTitle: "El gasto de tu empresa, respondido en lenguaje natural"
simpleSubtitle: "Server oficial de Ramp: tarjetas, gastos, reembolsos y aprobaciones por OAuth, sin API key que pegar."
devTitle: "Conector MCP de Ramp"
devSubtitle: "MCP oficial hospedado de Ramp (mcp.ramp.com/mcp) — transacciones, reembolsos, tarjetas, proveedores, aprobaciones y análisis de gasto sobre OAuth."
ctaUrl: "https://ramp.com"
tokenHelpUrl: "https://support.ramp.com/hc/en-us/articles/45516494479891-Ramp-MCP"
manifest:
  mcpServers:
    ramp:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.ramp.com/mcp"]
affiliate: false
tagline: "Tu gasto y tus tarjetas, al alcance del agente"
originalAuthor: "Ramp"
originalAuthorUrl: "https://docs.ramp.com/developer-api/v1/ramp-mcp"
license: "proprietary"
licenseUrl: "https://ramp.com/legal/terms"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Ramp** es la plataforma de gestión de gasto con la que muchas pymes manejan sus tarjetas corporativas, el pago de facturas, las políticas de gastos y los reembolsos. El conector oficial de Ramp es un **server MCP hospedado** (`https://mcp.ramp.com/mcp`), publicado por Ramp, que le da a tu agente acceso para responder preguntas sobre el gasto de tu empresa y hacer las acciones rutinarias con tu propio login de Ramp — sin pegar ninguna API key.

Pregúntale *"Muéstrame nuestros principales proveedores de software por gasto de este trimestre"* y lee tus datos de transacciones. Pregúntale *"Encuentra transacciones de los últimos 14 días a las que les falte recibo o memo"* y revisa el libro por ti. Los empleados tienen sus propias victorias: *"¿Qué tarjetas de Ramp tengo y con cuánto saldo?"*, *"¿Mi cena de $300 con un cliente cumple la política?"* — e incluso *"Bloquea mi tarjeta, no la encuentro."* En palabras del propio Ramp, los administradores pueden analizar datos para identificar tendencias de gasto e ideas de pronóstico, mientras que los empleados pueden consultar saldos, pedir reembolsos o resolver dudas de política directamente desde sus herramientas de siempre.

### Qué le puedes pedir

- *"Muéstrame nuestros principales proveedores de software por gasto de este trimestre."*
- *"Encuentra transacciones de los últimos 14 días con recibo o memo faltante."*
- *"Trae los reembolsos y solicitudes pendientes para el reporte semanal del CFO."*
- *"¿Qué tarjetas de Ramp tengo y con cuánto saldo?"*
- *"¿Mi cena de $300 con un cliente cumple la política?"*
- *"Bloquea mi tarjeta, no la encuentro."*

### Cómo te conectas

Este conector **no te pide pegar ninguna API key**. Usa el login de tu propia cuenta de Ramp:

1. Activa el conector en TerminalSync.
2. El puente `mcp-remote` abre el login OAuth de Ramp en tu navegador — entra con la cuenta de Ramp que ya usas.
3. Apruébalo, y tus permisos viajan contigo: "The Ramp connection respects each user's role and access. The AI tool can only see data and take actions that the signed-in user can already perform in Ramp."

**Aviso honesto:** es un server **hospedado por Ramp** (`https://mcp.ramp.com/mcp`), no algo que corre en tu computadora. A diferencia de los conectores de solo lectura, Ramp MCP también puede **actuar**: aprobar o rechazar transacciones y reembolsos, bloquear o desbloquear tarjetas y aplicar codificación contable — siempre acotado por lo que tu propio rol en Ramp ya permite. Dos cosas que no puede hacer, según la documentación de Ramp: aprobar facturas (eso se hace directo en Ramp) y subir archivos de recibos (adjúntalos en Ramp). La guía oficial de configuración está en [support.ramp.com](https://support.ramp.com/hc/en-us/articles/45516494479891-Ramp-MCP).

--- dev ---

Ramp publica su **Ramp MCP** como server remoto/hospedado, endpoint de producción `https://mcp.ramp.com/mcp` (Streamable HTTP), documentado en los docs de desarrollador de Ramp (`docs.ramp.com/developer-api/v1/ramp-mcp`) y en la guía de configuración del centro de ayuda. No hay paquete npm ni server stdio local — se puentea localmente con `mcp-remote`:

```
npx -y mcp-remote@latest https://mcp.ramp.com/mcp
```

La autenticación es **OAuth** en el navegador (sin client secret que guardar). Los docs de Ramp indican que los clientes MCP custom y los gateways de terceros deben tener su redirect URI exacto aprobado por Ramp primero (`https://`, `localhost`/`127.0.0.1` o esquemas aprobados; sin wildcards de subdominio); los clientes estándar como el que puentea `mcp-remote` funcionan sin configuración extra. Existe un endpoint demo con datos de muestra en `https://demo-mcp.ramp.com/mcp`, y quien maneja varias entidades de Ramp puede mantener una conexión por negocio con la forma de alias `https://mcp.ramp.com/<identificador-de-negocio>/mcp`.

Ramp documenta sus tools **agrupadas por intención y no por nombre** — "the underlying surface evolves continuously. Disconnect and reconnect your client to pick up new tools" — así que este conector describe la superficie de capacidades publicada en vez de una lista congelada de tools:

- **Leer y analizar el gasto** — buscar transacciones, bajar exportaciones de gasto, consultar proveedores y categorías contables, cargar departamentos y entidades, ver saldos de tesorería y el organigrama.
- **Procesar aprobaciones** — aprobar o rechazar transacciones, reembolsos y solicitudes unificadas (POs, pedidos de fondos). Las aprobaciones de facturas todavía no están disponibles por MCP.
- **Enviar y completar gastos** — los empleados envían gastos y reembolsos, completan los datos requeridos y hacen avanzar sus propias solicitudes de reembolso.
- **Editar, enviar y actuar sobre flujos** — editar transacciones (memo, codificación, viaje), enviar reembolsos, publicar comentarios, gestionar tarjetas (bloquear, desbloquear, activar), aplicar codificación GL.
- **Responder preguntas** — dudas de política, búsqueda en el centro de ayuda, explicaciones de rechazos.
- **Hacer compras** — generar credenciales de Agent Card para pagos de un solo uso.
- **Gestionar viajes** — crear viajes, ver viajes, conectar transacciones a viajes, consultar reservas de vuelo y hotel.

La referencia completa de capacidades del centro de ayuda cubre además facturas (búsqueda, detalle, adjuntos de factura, aprobaciones pendientes), límites de gasto y Spend Programs, cuentas y saldos de Ramp Banking, datos de organización y personas, y codificación contable. En permisos: "most company-wide data tools (spend exports, vendor management, GL coding) require admin or business-owner permissions. Employees see only their own data; admins see company-wide data", y los administradores controlan quién puede conectarse desde **Company → Integrations → Ramp MCP → Manage access** (una feature de Ramp Plus). Ramp atribuye las llamadas MCP al usuario autenticado.

**Divulgación:** es un server hospedado (no local) que puede leer y escribir (aprobaciones, bloqueos de tarjetas, codificación); no soporta subir recibos/PDF por MCP; las consultas que devolverían más de 100 filas llegan vacías hasta acotar la solicitud; y Ramp advierte que "Ramp MCP is subject to change", con tools nuevas agregándose regularmente. El repo open-source archivado `ramp-public/ramp_mcp` (MIT) es anterior al server hospedado y no es lo que este conector instala.

Licencia: SaaS propietario (Ramp Terms of Service, `ramp.com/legal/terms`). Fuente: docs de desarrollador de Ramp (`docs.ramp.com/developer-api/v1/ramp-mcp`) + centro de ayuda de Ramp (`support.ramp.com/hc/en-us/articles/45516494479891-Ramp-MCP`).
