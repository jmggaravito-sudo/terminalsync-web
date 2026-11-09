---
name: SumUp
logo: /connectors/sumup.svg
category: automation
markets: ["US", "MX", "CO", "CL", "PE", "BR", "ES", "FR", "GB", "IE", "AU"]
status: available
simpleTitle: "Tus cobros y pagos de SumUp, gestionados conversando"
simpleSubtitle: "Server MCP oficial de SumUp: consulta tus transacciones, crea checkouts y revisa tu cuenta con tu API key de SumUp."
devTitle: "Conector MCP de SumUp"
devSubtitle: "Server oficial @sumup/mcp (sumup/sumup-ai) — perfil de comercio, transacciones, checkouts, clientes y payouts."
ctaUrl: "https://sumup.com"
tokenHelpUrl: "https://developer.sumup.com/tools/authorization/api-keys/"
manifest:
  mcpServers:
    sumup:
      command: npx
      args: ["-y", "@sumup/mcp"]
      env:
        SUMUP_API_KEY: "${SECRET:SUMUP_API_KEY}"
affiliate: false
tagline: "Cobros y pagos de SumUp, al alcance del agente"
originalAuthor: "SumUp"
originalAuthorUrl: "https://github.com/sumup/sumup-ai"
license: "Apache-2.0"
licenseUrl: "https://github.com/sumup/sumup-ai/blob/main/LICENSE"
marketplaceSource: "official"
marketplaceCategory: "web"
installableForAi: true
installableForAiReason: "unverified-needs-key"
aiToolsCount: 0
aiReadOnlyTools: 0
verifiedAt: "2026-11-09T12:00:00.000Z"
verifiedPackageVersion: "0.14.0"
verifiedWithoutKey: false
---
**SumUp** es la plataforma de pagos que usan más de 4 millones de comercios para cobrar con tarjeta, generar links de pago y administrar su caja — en sus palabras: *"We keep payments simple and reliable, so your business can keep the neighborhood buzzing."* El MCP oficial de SumUp está descrito en el registro oficial así: *"Tools to explore SumUp accounts, payments, customers, and payouts."*

Qué significa en la práctica: tu agente puede consultar el perfil de tu comercio y tus transacciones, crear e inspeccionar checkouts (links de pago para tus clientes), armar flujos de cobro con la Cloud API de SumUp y leer la documentación y la especificación oficial de la API que el server expone como recursos. La superficie de tools evoluciona con el producto — la doc oficial no publica una lista plana de nombres, así que no se inventan.

### Qué le puedes pedir

- *"¿Cómo fueron mis cobros de esta semana y qué transacciones entraron?"*
- *"Crea un checkout de 50 USD para que el cliente pague y muéstrame el detalle."*
- *"Muéstrame el perfil de mi comercio: qué moneda maneja y cómo está configurado."*
- *"¿Cómo armo un cobro con la API de SumUp? Búscalo en su documentación oficial."*

### Qué token necesitas

Se conecta con una **API key de SumUp** — una sola vez:

1. Entra a [developer.sumup.com/tools/authorization/api-keys](https://developer.sumup.com/tools/authorization/api-keys/) (también desde el dashboard: `me.sumup.com/settings/developer`) y crea tu API key — empieza con `sup_sk_`.
2. Copia el valor y pégalo cuando el Lab te pida `SUMUP_API_KEY`.

La key queda guardada cifrada en tu Keychain y el server corre localmente en tu computadora leyéndola de ahí — no pasa por terceros. Como las operaciones de cobro tocan plata real, la guía de SumUp recomienda conectar primero una cuenta de comercio en sandbox para probar los flujos de pago (*"connect a sandbox merchant account before testing payment workflows"*).

**Aclaración honesta:** SumUp también ofrece una variante hospedada con OAuth (`https://mcp.sumup.com/mcp`, oficial en su documentación). En la verificación de esta corrida (2026-11-09) su metadata de autorización declara el issuer `https://auth.sumup.com/` con una barra final que hace fallar el login por `mcp-remote` (RFC 8414 §3.3) — es un ajuste del lado de SumUp. Por eso este conector usa el server local oficial por stdio, que es el setup primario de la doc oficial; cuando SumUp corrija la metadata, se puede migrar al login de un botón.

--- dev ---

`@sumup/mcp` (v0.14.0, publicado por **SumUp** — publisher `SumUp <support@sumup.com>`, repo oficial `github.com/sumup/sumup-ai`, Apache-2.0) es el server MCP local por stdio del toolkit oficial de SumUp para IA. Setup verbatim del README oficial:

```sh
SUMUP_API_KEY='sup_sk_...' npx -y @sumup/mcp
```

Requiere Node.js 22+. La key (`sup_sk_...`) se crea en `developer.sumup.com/tools/authorization/api-keys/` (dashboard: `me.sumup.com/settings/developer`); el README advierte guardarla en la configuración privada del cliente y fuera de archivos compartidos (*"Keep API keys in your client's private configuration and out of shared project files"*).

Capacidades oficiales (de la doc de desarrollador, sin nombres de tools publicados): consultar perfil del comercio y transacciones, crear e inspeccionar checkouts, flujos con la Cloud API, y leer documentación/OpenAPI vía recursos MCP; el registro MCP oficial lo describe como *"Tools to explore SumUp accounts, payments, customers, and payouts"*.

La variante **hospedada** con OAuth (`https://mcp.sumup.com/mcp`, Streamable HTTP; la doc indica usar `/mcp` para conexiones nuevas y marca `/sse` como legacy) está documentada en `developer.sumup.com/tools/llms/setup/`, pero su metadata de autorización declara issuer `https://auth.sumup.com/` (con barra final) y `mcp-remote 0.15.2` la rechaza: `IssuerMismatchError` (RFC 8414 §3.3), verificado por smoke en esta corrida (2026-11-09) — el mismo patrón de bug que tuvo Factorial y que se arregló del lado del vendor. Las API keys no sirven como Bearer en el hospedado (*"keys 'are not valid Bearer tokens for the hosted endpoint'"*).

Licencia: Apache-2.0 (LICENSE del repo `sumup/sumup-ai`); el servicio SumUp es SaaS propietario (`sumup.com/en-us/terms-and-conditions-overview/`). Fuente: npm `@sumup/mcp` (README del tarball) + `developer.sumup.com/tools/llms/setup/` + `developer.sumup.com/tools/llms/mcp-server/` + registro MCP (`io.github.sumup/mcp`) + sumup.com.
