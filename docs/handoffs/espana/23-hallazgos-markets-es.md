Fecha de investigación: 2026-10-15. Datos de terceros: verificar antes de decidir

# Qué conectores del catálogo deberían declarar `ES` en `markets`

Revisé `content/connectors/en/*.md` (68 fichas en el commit `a6911ff` de `main`) contra la disponibilidad en España. Las etiquetas de evidencia son las de `20-mapa-integraciones-espana.md`.

## Resumen

**No hay ningún conector para añadir con `ES`.** Hay dos que ya lo declaran (Alegra y Square) y conviene confirmar la evidencia, y uno (Xero) que no debe añadirlo.

La razón del resultado vacío está en el código: el filtro por país (`src/lib/adminIntegrationsByCountry.ts`, líneas 192-193) devuelve las fichas con `markets` que incluye el país **o** `GLOBAL`. Las 59 fichas `["GLOBAL"]` ya salen en España. Solo importan las 9 fichas con países concretos.

## Las 9 fichas con países concretos

| Conector | `markets` hoy | ¿`ES`? | Evidencia | Acción |
|---|---|---|---|---|
| `alegra` | CO, MX, AR, PE, CR, PA, DO, VE, **ES** | Ya lo declara | Alegra opera en España: su blog en español publica guías de Veri\*Factu, dice ofrecer un plan gratis con facturación Veri\*Factu y «API abierta», y tiene un *Country Manager* para España [3p/propio: [blog.alegra.com](https://blog.alegra.com/es/verifactu-factura-electronica/)]. Alegra afirma ser colaborador social de la AEAT para Veri\*Factu; **no lo encontré en una fuente de la AEAT**. | Mantener. **Falta:** la ficha no cita en su texto por qué es `ES` (solo aparece en el frontmatter) y no hallé una página que diga que el **MCP** (`mcp.alegra.com`) funciona con cuentas de España. Pídele al investigador del pipeline que lea la doc del MCP de Alegra y anote el país. |
| `square` | US, CA, GB, AU, IE, FR, **ES**, JP | Ya lo declara | La tabla de soporte de tarjetas por país de la documentación para desarrolladores de Square incluye España [búsq: [developer.squareup.com](https://developer.squareup.com/docs/payment-card-support-by-country)]. Una respuesta del foro de desarrolladores confirma sandbox para vendedores de España [búsq]. Hilos antiguos de la comunidad decían que Square no procesaba tarjetas en España [3p, sin fecha]. | Mantener, pero contrasta con la página de disponibilidad internacional de Square (no pude leerla). Los datáfonos/hardware pueden no venderse allí [3p, antiguo]. |
| `xero` | US, CA, GB, AU, NZ | **No añadir** | Xero permite el alta desde España, pero no está localizado: un despacho español dice que Xero y QuickBooks no tienen versión conforme al PGC español, Xero cortó los enlaces con bancos españoles en 2019, y en el foro de Xero un representante dijo que no hay plan para Veri\*Factu [3p: [Strong Abogados](https://strongabogados.com/xero-quickbooks-spain), [Xero ideas](https://productideas.xero.com/forums/967115-invoices-quotes/suggestions/50487576-e-invoicing-verifactu-support-for-compliance-wit)]. | Dejar como está. Con Veri\*Factu en 2027, una pyme española no podría usar Xero para facturar. |
| `mercado-pago` | AR, BR, MX, CL, CO, PE, UY | No | La ficha cita 7 países del README oficial; España no está. | Ninguna. |
| `conekta` | MX | No | Pagos de México. | Ninguna. |
| `fintoc` | CL, MX | No | Open banking de Chile y México. | Ninguna. Para España el equivalente sería Tink, Enable Banking o similar; no hay MCP. |
| `siigo` | CO | No | Contabilidad de Colombia. | Ninguna. |
| `gusto` | US | No | Nómina de EE. UU. | Ninguna. |
| `ramp` | US, CA, GB | No | Gastos corporativos de EE. UU., Canadá y Reino Unido. | Ninguna. |

## Fichas `GLOBAL` con una nota para España

No cambian `markets`. Son sugerencias para la ficha en español si decides tratar a España como mercado de primer nivel.

| Conector | Nota | Evidencia |
|---|---|---|
| `stripe` | Stripe habilita **Bizum** desde el 27/05/2026, el segundo medio de pago online de España (cuota estimada del 20–30 %). Una línea en la ficha lo haría relevante para quien cobra en España. | [búsq: [changelog de Stripe](https://docs.stripe.com/changelog/dahlia/2026-05-27/bizum-payments)]; Bizum: [3p: [Infobae](https://www.infobae.com/espana/agencias/2026/01/19/el-volumen-de-operaciones-con-bizum-crecio-un-53-en-2025-y-se-situo-en-67751-millones/)] |
| `intercom` | La ficha usa solo `mcp.intercom.com` (EE. UU.). Intercom documenta también `mcp.eu.intercom.com` para espacios alojados en la UE, y no soporta los de Australia. Si un cliente español tiene el espacio en la UE, el conector actual falla. Esto también cuestiona que `GLOBAL` sea exacto (Australia queda fuera). | Ficha `content/connectors/en/intercom.md` (líneas 54 y 58) y `SOURCES.md`, fila `intercom`. |
| `whatsapp` | Ficha en estado `soon`. En España, WhatsApp Business es el canal de mensajería más usado por empresas según un estudio de HubSpot de 2022, pero no hay un MCP oficial de Meta. | [3p: [Puromarketing](https://www.puromarketing.com/14/37344/hasta-punto-puede-whatsapp-herramienta-util-para-negocios-estrategias-marketing-ventas)] |
| `shopify` | Shopify es tercera plataforma de ecommerce en España (~12 %) detrás de WooCommerce y PrestaShop. Si el público es España, `wordpress` (con WooCommerce) tiene más peso que `shopify`. | [3p: [factorial.es/blog](https://factorial.es/blog/plataforma-ecommerce), BuiltWith vía tercero] |
| `slack` | Slack no admite registro dinámico de clientes; en España Teams también es habitual, sin conector posible hoy (preview ligada a licencia). | [3p] y mapa, sección 7 |
| `mailchimp` (no está en el catálogo) | Sigue en SKIP en `SOURCES.md`: el MCP oficial cubre solo Mandrill. | `SOURCES.md` |

## Qué se echa de menos para España y no está en el catálogo

Ver `20-mapa-integraciones-espana.md` y `21-handoff-pipeline-integraciones.md`. En una frase: la fila más débil del catálogo para un autónomo español es **facturación y contabilidad local** (solo Alegra declara `ES`), y los MCP oficiales que acabo de verificar son Holded, FacturaDirecta, Factuarea, y para RR. HH. y banca, Factorial y Qonto.

## Si añades una ficha nueva con `ES`

El validador (`parseMarkets`, `src/lib/markets.ts`) y el pipeline (`scripts/pipeline/lib.mjs`, `MARKET_CODES`) aceptan `ES`, `FR`, `IE`, `GB`, etc., pero **no** `PT` ni `AD` (Portugal y Andorra). Varias candidatas españolas (MONEI, Holded, GoCardless) también sirven allí. Añadir `PT` es un cambio de producto: debe hacerse a la vez en `markets.ts` y en `scripts/pipeline/lib.mjs` (hay un test que falla si divergen).
