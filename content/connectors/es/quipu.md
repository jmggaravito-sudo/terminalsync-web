---
name: Quipu
logo: /connectors/quipu.png
category: automation
markets: ["ES"]
status: available
simpleTitle: "Tu contabilidad de autónomo, por chat"
simpleSubtitle: "Tu AI consulta contactos, facturas y asientos de Quipu, y crea facturas cuando tú lo confirmas."
devTitle: "Quipu MCP Connector"
devSubtitle: "MCP comunitario de TerminalSync sobre la API v1 de Quipu (getquipu.com): contactos, facturas y asientos."
ctaUrl: "https://getquipu.com"
tokenHelpUrl: "https://help.getquipu.com/es/articles/7950432-conectar-con-la-api-de-quipu"
manifest:
  mcpServers:
    quipu:
      command: npx
      args: ["-y", "quipu-mcp"]
      env:
        QUIPU_APP_ID: "${SECRET:QUIPU_APP_ID}"
        QUIPU_APP_SECRET: "${SECRET:QUIPU_APP_SECRET}"
        QUIPU_OWNER_SLUG: "${SECRET:QUIPU_OWNER_SLUG}"
affiliate: false
tagline: "Tus números de Quipu, a mano"
originalAuthor: "Comunidad TerminalSync"
originalAuthorUrl: "https://github.com/jmggaravito-sudo/terminalsync-mcps/tree/main/packages/quipu"
license: "MIT"
licenseUrl: "https://github.com/jmggaravito-sudo/terminalsync-mcps/blob/main/packages/quipu/LICENSE"
marketplaceSource: "ts-curated"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "ok"
aiToolsCount: 7
aiReadOnlyTools: 5
verifiedAt: "2026-10-26T22:05:15.921Z"
verifiedPackageVersion: "0.1.0"
---
Si llevas tu facturación y tus gastos con **Quipu**, este conector le deja a tu AI las consultas que hoy te obligan a abrir el panel: cuánto facturaste, qué cliente es, si aquella factura está pagada.

Pregúntale *"¿cuánto facturé en marzo?"* y te lo suma. Pídele *"busca al cliente Fisioterapia Ana y dime si tiene facturas pendientes"* y te lo mira. También puede crear contactos y facturas de ingreso, pidiéndote confirmar siempre antes de registrar una factura, porque en España cada factura queda registrada bajo Veri*Factu.

### Qué le puedes pedir

- *"¿Cuánto facturé este mes frente al mes pasado?"*
- *"Busca al cliente Fisioterapia Ana y dime si tiene facturas pendientes de cobro."*
- *"Dame el desglose de mis gastos de marzo por categoría."*
- *"Crea un contacto nuevo: B12345674, Estudio Jurídico Ruiz, NIF, Madrid."*
- *"Crea la factura de ingreso a Estudio Jurídico Ruiz: consultoría de marzo, con fecha de hoy." (te pedirá confirmar)*

### Cómo se conecta

Con las **credenciales de la API v1 de Quipu** (Configuración → Integraciones → API v1 → Activar → Credenciales):

- El **App ID**, el **App secret** y el **slug de tu cuenta** (el que aparece en la dirección de Quipu, `getquipu.com/d/<slug>`).
- Se guardan cifrados en los Secretos de TerminalSync. El conector renueva su acceso solo (los tokens duran ~2 horas).

### Qué cubre y qué no

- **Lee** (sin pedirte permiso cada vez): contactos (con filtros por NIF, tipo o país), facturas (con búsqueda libre y por periodo) y asientos del libro.
- **Escribe con tu confirmación**: crea contactos y facturas de ingreso. Cada factura exige una confirmación aparte porque queda registrada en tu libro bajo Veri*Factu. El conector gestiona el ciclo de sesión y no reintenta escrituras.
- **No cubre**: facturas simplificadas, asientos de gastos, nóminas, conciliación bancaria ni impuestos (Modelos). Tampoco borra nada.
- Es un proyecto de la comunidad de TerminalSync: **no es de Quipu/TeamSystem ni está avalado por ellos**. Las escrituras se verificaron el 2026-10-27 contra una cuenta real: contacto y factura de ingreso creados y leídos de vuelta (registros de prueba que se pueden borrar desde el panel de Quipu).
