Fecha de investigación: 2026-10-15. Datos de terceros: verificar antes de decidir

# Lista para lanzar en `integration-pipeline.yml`

Esta lista sale de `20-mapa-integraciones-espana.md` (ahí están las fuentes y las etiquetas de evidencia). **No lancé ningún workflow.** El orden es el que recomiendo.

## Antes de lanzar nada

1. **Decide si España entra como mercado.** El prompt del investigador (`.github/pipeline/prompts/research.md`, paso 5) dice que el público es «EE. UU. y LatAm». Con Holded, FacturaDirecta, Factuarea o MONEI puede devolver `persona_fit: false` y `skip`. `ES` sí es un código permitido en `markets`. Si decides ir por España, ajusta ese paso del prompt antes de la tanda; si no, lanza solo las que sirven también fuera de España (Factorial, Qonto, PayPal, Brevo, SumUp, GoCardless, Sendcloud).
2. **Los nombres** son los de la columna «Nombre exacto»: solo letras, números y espacios, máximo 60 caracteres. El workflow usa ese texto como `focus` y lo convierte en `slug`.
3. **Costo y modo.** Una corrida completa ronda USD 8–12 de GLM según `docs/integration-pipeline.md` (estimación del propio documento). Para las que esperas `needs_own_build` o `sin API`, usa `dry_run=true`: solo investiga y reporta, no construye y no abre PR.
4. **`INTEGRATION_AUTOMERGE`** déjalo apagado en estas primeras corridas (recomendación del propio documento del pipeline).
5. **Comando** (ejemplos; yo no los ejecuté):

```bash
gh workflow run integration-pipeline.yml -R jmggaravito-sudo/terminalsync-web -f focus="Holded" -f country=ES
gh workflow run integration-pipeline.yml -R jmggaravito-sudo/terminalsync-web -f focus="Quipu" -f country=ES -f dry_run=true
```

## Tanda A: se espera `ship_official` (corrida completa)

| # | Nombre exacto | Veredicto esperado | Tipo y auth esperados | `markets` que esperaría | Por qué este orden / riesgos |
|---|---|---|---|---|---|
| 1 | `Holded` | `ship_official` | Remoto, OAuth con registro dinámico. `https://mcp.holded.com/mcp` | `ES` (el pipeline debe buscar si Holded documenta otros países; yo solo tengo evidencia de España) | Fuente oficial clara (`help.holded.com`, `holded.com/developers/mcp`). Divulgar: solo lectura por defecto; contabilidad y facturas siempre solo lectura; requiere acceso API. Riesgo: `persona_fit`. |
| 2 | `Factorial` | `ship_official` | Remoto, OAuth con registro dinámico. `https://mcp.factorialhr.com` (la raíz; `/mcp` da 404) | `ES` y los que Factorial documente | Fuente oficial: `apidoc.factorialhr.com/changelog/introducing-the-factorial-mcp-server`. Divulgar: actúa como el usuario; Factorial One solo con plan que lo incluya. Cuidado: la URL no termina en `/mcp`; el constructor no debe «corregirla». |
| 3 | `Qonto` | `ship_official` | Remoto, OAuth con registro dinámico. `https://mcp.qonto.com/mcp` | `ES` y los que Qonto documente | Fuente: `qonto.com/en/ai/mcp` y repo `qonto/qonto-mcp-server`. Es un banco: la ficha debe nombrar los scopes que incluyen transferencias (`request_transfers.write`, `sepa_direct_debit.write`). Revisor `honesty` atento. |
| 4 | `MONEI` | `ship_official` | Remoto, OAuth (DCR y CIMD) | `ES` (MONEI también apunta a Portugal y Andorra, pero `PT` y `AD` no están en `markets.ts`; añadirlos sería un cambio de producto) | Fuente: README de `MONEI/MONEI-MCP-Server` (no hallé página en `docs.monei.com`). **Discrepancia a resolver:** el README dice `/mcp` y mi sonda da 404 ahí y 401 en la raíz. Proyecto joven. Para Bizum. |
| 5 | `PayPal` | `ship_official` (o `skip` si el investigador mantiene el SKIP de `SOURCES.md`) | Remoto, OAuth con registro dinámico. `https://mcp.paypal.com/mcp` | `GLOBAL` solo si lo documenta; si no, lista de países | En `SOURCES.md` está SKIP por el paquete npm (sin licencia/repo, token de ~8 h). El remoto es otra superficie. Dile al investigador que lea el GitBook de PayPal. Divulgar que mueve dinero. |
| 6 | `Brevo` | `ship_official` | Remoto. La doc dice token Bearer; la sonda además anuncia OAuth con registro dinámico | Países que Brevo documente | **Contradicción doc/sonda en la auth:** la ficha debe seguir la doc oficial. Si es token pegado, `installableForAi` pasa por clave. Divulgar: acceso total sin scopes y envío masivo. |
| 7 | `SumUp` | `ship_official` por **npm** (`@sumup/mcp`, clave API) | npm + `SUMUP_API_KEY` | Países que SumUp documente | El remoto no tiene registro dinámico (solo clientes pre-registrados), así que la ruta viable es el paquete npm. El investigador podría marcarlo `ship_official` con el remoto y fallar en el smoke; si pasa, cámbialo a npm. Verificar licencia y repo en npm. |
| 8 | `FacturaDirecta` | `ship_official` **o** `skip` | Remoto, OAuth 2.1 (CIMD o DCR). `https://mcp.facturadirecta.com` | `ES` | La única «fuente oficial» que hallé es la página del propio servidor. Si el investigador no encuentra documentación, saldrá `skip`/`needs_own_build`. Pide a FacturaDirecta una URL de docs antes de lanzar. |

## Tanda B: servidor existe pero falta algo (lanza con `dry_run=true` primero)

| # | Nombre exacto | Veredicto esperado | Qué falta |
|---|---|---|---|
| 9 | `Sesame HR` | `needs_own_build` (o `ship_official` si aparece documentación) | `mcp.sesametime.com/mcp` existe y pide OAuth con registro dinámico, pero no hay documentación oficial. Pregúntale a Sesame. |
| 10 | `Factuarea` | `ship_official` | Fuente oficial buena y entorno Test. Alcance de público pequeño. Útil como primera prueba de punta a punta. |
| 11 | `GoCardless` | `ship_official` | Falta la lista de países de la doc para decidir `markets` (aplica a SEPA). Es la API de cobros, no la de datos bancarios. |
| 12 | `Sendcloud` | `ship_official` | Auth solo CIMD (sin registro dinámico). Hay que comprobar con el smoke si `mcp-remote` completa el login. Si no, queda en cola como en el caso de Asana `/v2`. |
| 13 | `Mollie` | `ship_official` | Beta; la doc pide token y la sonda muestra OAuth. Bizum también en beta. |

## Tanda C: API pública sin MCP oficial. Se espera `needs_own_build` (siempre `dry_run=true`)

Sirven para tener los hechos de la API (auth, endpoints, límites, cómo conseguir credenciales de prueba) y decidir tú qué construir. Son las de mayor valor para autónomos y pymes españolas.

| # | Nombre exacto | Veredicto esperado | Lo que ya sé |
|---|---|---|---|
| 14 | `Quipu` | `needs_own_build` | REST, OAuth2 *client credentials*, 5 peticiones cada 5 s. Referencia de autónomos. Primera candidata a construir. |
| 15 | `Billin` | `needs_own_build` | API en el **Plan Ilimitado**; 30 días de prueba con API. La marca ahora es TS Facturas (TeamSystem); el nombre `Billin` puede traer el slug `billin`. |
| 16 | `Woffu` | `needs_own_build` | REST con Swagger, claves desde la guía de inicio. |
| 17 | `Revolut Business` | `needs_own_build` | API con certificado de cliente y sandbox; no hay MCP oficial. |
| 18 | `PayFit` | `needs_own_build` | API de cliente (clave) y de partner (OAuth2). Detalle de España sin confirmar. |
| 19 | `Sage Active` | `needs_own_build` | API GraphQL con OAuth y `x-api-key`; acceso a confirmar. |
| 20 | `Contasol` | `needs_own_build` | API que se activa con cuenta de desarrollador de Software DELSOL. |
| 21 | `WooCommerce` | `needs_own_build` o `skip` | MCP oficial en vista previa con URL distinta por tienda. |
| 22 | `PrestaShop` | `needs_own_build` o `skip` | Módulo oficial por tienda; licencia sin confirmar. |
| 23 | `ActiveCampaign` | `needs_own_build` o `ship_official` | MCP oficial con URL por cuenta; auth sin confirmar. |

## Tanda D: sin API utilizable o sin MCP. No gastar corridas

| Nombre | Resultado esperado | Motivo |
|---|---|---|
| `A3 Software`, `Bizneo` | sin API | No encontré API pública ni MCP (ver el mapa). |
| `Bizum` | sin API | Se activa por banco/TPV o por un PSP; no hay API directa. Se cubre con Stripe, MONEI o Mollie. |
| `Redsys`, `Facturae FACe`, `Verifactu AEAT`, `Clave` | `skip` | Requieren certificado o son identidad, no API de datos para un cliente no técnico. |
| `Treatwell`, `Doctoralia` | `skip` | API solo para partners con contrato. |
| `Correos`, `SEUR`, `GLS`, `MRW` | `skip` | Credenciales por contrato con el transportista y sin MCP. Mejor por Sendcloud. |
| `Wallapop Pro` | `skip` | Sin documentación oficial accesible. |
| `Microsoft Teams` | `skip` | Vista previa ligada a licencia de Copilot. |
| `Mailchimp` | `skip` | `SOURCES.md` ya lo descarta (el MCP oficial es solo Mandrill). |

## Lo que haría yo

Lanza la tanda A en orden (1 a 8), de una en una o de dos en dos para comparar con tu revisión. Las que no devuelvan `ship_official`, pásalas a la tanda B o C según el reporte. Después de cada `ship_official`, corre el smoke de login remoto y haz la prueba con cuenta (ver `22-handoff-pruebas-con-cuenta.md`).
