---
name: Holded
logo: /connectors/holded.png
category: automation
markets: ["ES"]
status: available
simpleTitle: "Pregúntale a tu Holded por facturas, stock y clientes"
simpleSubtitle: "MCP oficial de Holded: facturación, contabilidad, CRM e inventario por OAuth, sin pegar ninguna API key."
devTitle: "Conector MCP de Holded"
devSubtitle: "MCP oficial hospedado de Holded (mcp.holded.com) — facturas, contabilidad, CRM, inventario y proyectos sobre OAuth."
ctaUrl: "https://www.holded.com"
tokenHelpUrl: "https://help.holded.com/es/articles/15646468-connect-holded-with-ia"
manifest:
  mcpServers:
    holded:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.holded.com/mcp"]
affiliate: false
tagline: "La gestión de tu negocio en Holded, al alcance del agente"
originalAuthor: "Holded"
originalAuthorUrl: "https://help.holded.com/es/articles/15646468-connect-holded-with-ia"
license: "proprietary"
licenseUrl: "https://www.holded.com/tac"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "remote-needs-login"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-10-16T10:38:51.524Z"
verifiedPackageVersion: null
---
**Holded** es la plataforma de gestión con la que muchas pymes españolas manejan el día a día del negocio: facturación, contabilidad, CRM, inventario, proyectos y equipo, con el cumplimiento fiscal español (AEAT, SII, Veri*factu) integrado. El server MCP oficial de Holded le da a tu agente acceso directo a esos datos — sin pegar ninguna API key en TerminalSync, solo con el login de tu propia cuenta de Holded.

Le preguntas *"Muéstrame las facturas sin cobrar de este mes"* y el agente las trae directo de tu cuenta. Le pides que arme un presupuesto y queda listo como borrador para que tú lo conviertas en factura. Puedes consultar y resumir facturas, presupuestos, tickets, contactos, productos, stock, almacenes, gastos y compras; y en las áreas operativas también crear y actualizar: contactos, oportunidades del CRM, presupuestos y proformas en borrador, proyectos, inventario y documentos de la bandeja de entrada.

### Qué le puedes pedir

- *"Muéstrame las facturas sin cobrar de este mes y a cuánto sube el total."*
- *"¿Qué productos me quedan por debajo de 10 unidades en el almacén?"*
- *"Resúmeme las ventas del último trimestre y compáralas con las del anterior."*
- *"Crea un presupuesto en borrador para la cliente García S.L. por 1.500 €."*
- *"Actualiza el teléfono y el email de la cliente García S.L. en sus datos de contacto."*
- *"Sube esta factura de proveedor a la bandeja de entrada y etiquétala como 'gastos de oficina'."*

Las acciones que cambian datos — crear un presupuesto, actualizar un contacto, subir un documento — van con confirmación: la IA te muestra qué va a hacer y espera tu aprobación antes de ejecutar. Tal como lo plantea Holded: *"la IA redacta y organiza; tú emites y cobras."*

### Cómo te conectas

Este conector **no te pide pegar ninguna API key**. Usa el login de tu propia cuenta de Holded:

1. Activa el conector en TerminalSync.
2. El puente `mcp-remote` abre el login de Holded en tu navegador y te pide autorizar el acceso.
3. Apruébalo con tu cuenta — Holded crea automáticamente un token de acceso con exactamente los permisos que concediste, que puedes revisar en tu cuenta en **Desarrolladores → Credenciales**. La guía oficial está en [help.holded.com](https://help.holded.com/es/articles/15646468-connect-holded-with-ia).

**Requisito:** tu cuenta de Holded necesita tener el acceso a la API activado. La API de Holded está disponible en todos los planes de pago, no en el plan gratuito.

**Aviso honesto:** es un **server hospedado por Holded** (`https://mcp.holded.com/mcp`), no algo que corre en tu computadora. Al autorizar eliges un perfil de permisos: **Analítico** (solo lectura, el preseleccionado) o **Operativo** (añade escritura para tareas operativas). La contabilidad (asientos, remesas, impuestos, pagos, nóminas), las facturas y documentos fiscales, el equipo y RRHH, los ajustes y la firma digital son **siempre de solo lectura**: la IA puede consultarlos, no modificarlos. Y no puedes concederle a la IA un permiso que tú no tengas — el agente queda acotado a lo que tu usuario puede hacer en Holded.

--- dev ---

Holded publica un **server MCP remoto oficial** en `https://mcp.holded.com/mcp`, documentado en su centro de ayuda ([help.holded.com/es/articles/15646468-connect-holded-with-ia](https://help.holded.com/es/articles/15646468-connect-holded-with-ia)). La auth es OAuth con login en el navegador, sin archivos de configuración: al conectar, Holded crea automáticamente un token de acceso con exactamente los permisos concedidos durante la autorización (revisible en Desarrolladores → Credenciales).

TerminalSync hace de puente con el endpoint hospedado:

```
npx -y mcp-remote@latest https://mcp.holded.com/mcp
```

**Sonda (2026-10-16):** el endpoint responde 401 sin credenciales y publica `/.well-known/oauth-authorization-server` (issuer `app.holded.com`) con endpoint de registro dinámico de clientes (`/api/v2/mcp/oauth/register`) y PKCE `S256` — el puente `mcp-remote` puede registrar su cliente y llegar a la pantalla de autorización. Completar el login necesita una cuenta real de Holded.

**Perfiles de permisos (de la doc oficial):**

- **Analítico** — solo lectura, preseleccionado y recomendado. Excluye por defecto las áreas más sensibles: tokens de desarrollador, nóminas y remesas/mandatos bancarios (se pueden añadir a mano).
- **Operativo** — añade escritura, pero solo para tareas operativas y reversibles, con confirmación.
- También hay modos a medida: un permiso global (ninguno / solo lectura / lectura y escritura) o permisos por área.

Áreas con lectura y escritura (perfil Operativo): contactos; CRM y pipeline (oportunidades, eventos, embudos, reservas y actividades); presupuestos y proformas (como borradores que el usuario convierte en factura); proyectos; inventario operativo (productos, almacenes, pedidos de venta y compra, envíos, órdenes de producción); y subida de documentos a la bandeja de entrada con etiquetas.

Áreas **siempre en solo lectura**: contabilidad (asientos, remesas, impuestos/AEAT, pagos, nóminas); facturas y documentos fiscales (facturas, tickets, SII, factura electrónica, TPV); Equipo/RRHH; ajustes y administración del sistema; herramientas de desarrollador; firma digital y facturación.

La doc no publica una lista estática de tools: cita la especificación OpenAPI completa del API de Holded (`api.holded.com/openapi/es.json`) como fuente de las tools del MCP.

**Divulgación:** server hospedado que lee y, con el perfil Operativo, escribe en áreas operativas; todo lo que toca dinero, impuestos o personas queda en solo lectura. Requisito documentado: una cuenta de Holded con acceso a la API activado — disponible en todos los planes de pago, no en el gratuito; el uso del API tiene un tope mensual de llamadas según el plan (holded.com/es/desarrolladores/limite-de-tasa).

Licencia: SaaS propietario (términos y condiciones, `holded.com/tac`). Fuente: help.holded.com/es/articles/15646468-connect-holded-with-ia.
