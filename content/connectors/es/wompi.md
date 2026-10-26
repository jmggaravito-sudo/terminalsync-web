---
name: Wompi
logo: /connectors/wompi.svg
category: automation
markets: ["CO"]
status: available
simpleTitle: "Cobra con PSE, Nequi o Bancolombia sin abrir la app del banco"
simpleSubtitle: "Tu AI consulta tus transacciones de Wompi y te arma links de pago por chat."
devTitle: "Wompi MCP Connector"
devSubtitle: "MCP comunitario de TerminalSync sobre la API de Wompi: transacciones, comercio y links de pago."
ctaUrl: "https://wompi.co"
tokenHelpUrl: "https://docs.wompi.co/docs/colombia/ambientes-y-llaves/"
manifest:
  mcpServers:
    wompi:
      command: npx
      args: ["-y", "wompi-mcp"]
      env:
        WOMPI_PUBLIC_KEY: "${SECRET:WOMPI_PUBLIC_KEY}"
        WOMPI_PRIVATE_KEY: "${SECRET:WOMPI_PRIVATE_KEY}"
affiliate: false
tagline: "Tus cobros de Wompi, a mano"
originalAuthor: "Comunidad TerminalSync"
originalAuthorUrl: "https://github.com/jmggaravito-sudo/terminalsync-mcps/tree/main/packages/wompi"
license: "MIT"
licenseUrl: "https://github.com/jmggaravito-sudo/terminalsync-mcps/blob/main/packages/wompi/LICENSE"
marketplaceSource: "ts-curated"
marketplaceCategory: "web"
---
Si cobras por **Wompi** (la pasarela de Bancolombia), este conector le deja a tu AI las dos cosas que más tiempo te quitan: mirar si un pago entró y armarte el link para cobrarle a un cliente.

Pregúntale *"¿entró el pago de la referencia 12345?"* y te dice si está aprobado, pendiente o rechazado. Pídele *"crea un link de pago de $80.000 para la/cliente María, que se pueda usar una sola vez"* y te devuelve el link listo para enviar por WhatsApp. Soporta PSE, Nequi, Botón Bancolombia, tarjetas y más, según lo que tu comercio tenga activado.

### Qué le puedes pedir

- *"¿Entró el pago de la referencia 12345? ¿Por cuánto y con qué método?"*
- *"Crea un link de pago de $80.000 para la/cliente María, de un solo uso."*
- *"Crea un link abierto para donaciones, sin monto fijo, con vencimiento el 30."*
- *"Muéstrame las últimas transacciones de hoy y dime cuáles quedaron pendientes."*
- *"¿Qué métodos de pago tiene activados mi comercio en Wompi?"*

### Cómo se conecta

Con las **llaves de tu comercio de Wompi** (panel comercios.wompi.co → Desarrollo → Programadores):

- La **llave pública** (`pub_test_...` o `pub_prod_...`) y la **llave privada** (`prv_test_...` / `prv_prod_...`).
- Se guardan cifradas en los Secretos de TerminalSync, no en el chat ni en el conector.
- El conector detecta solo si tus llaves son de **pruebas** (sandbox) o de **producción** por el prefijo: nada de dinero real mientras uses llaves `test`.
- Para probar sin riesgo: activa el **Modo de pruebas** en el panel de Wompi y usa las llaves `test` con los datos de prueba de su documentación.

### Qué cubre y qué no

- **Lee** (sin pedirte permiso cada vez): datos de tu comercio (nombre, NIT, métodos aceptados) y tus transacciones con su estado y método de pago.
- **Escribe con tu confirmación**: crea links de pago (`name`, monto en centavos, `single_use`, vencimiento y más, según la documentación de Wompi). Tu AI te pide confirmar antes de crear cualquiera.
- **No cubre**: reembolsos, dispersión de dinero, datáfonos ni la creación directa de cobros (transacciones). Tampoco modifica tu configuración de Wompi.
- Es un proyecto de la comunidad de TerminalSync: **no es de Wompi ni está avalado por ellos**. La creación de links no se pudo probar contra una cuenta real todavía (requiere la llave privada de pruebas); las consultas sí.
