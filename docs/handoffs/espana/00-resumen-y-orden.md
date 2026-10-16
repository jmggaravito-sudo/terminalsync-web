No es asesoría legal; validar con un profesional. Fecha de investigación: 2026-10-15

# 00 · Vender TerminalSync en España: resumen y orden de ejecución

## Objetivo
Poder vender TerminalSync (app de escritorio con IA, operada desde EE. UU., IA = GLM de Z.ai/Zhipu) a pymes y autónomos españoles (B2B) y también a particulares (B2C), cumpliendo IVA, RGPD, Reglamento de IA, consumo y facturación.

## Leyenda de fiabilidad (se usa en los 4 documentos)
- **[OFICIAL]** leído hoy en fuente oficial (BOE, Comisión Europea, Consejo, docs del propio proveedor).
- **[SECUNDARIA]** blog, despacho o prensa; hay que contrastarlo.
- **[MEMORIA]** lo sé de antes, no lo pude verificar hoy; tratar como hipótesis para el gestor/abogado.
- **[NO VERIFICADO]** lo busqué y no lo encontré.

## Lo más importante (10 hallazgos)
1. **B2B es lo fácil.** Si vendes a un autónomo o empresa española, el servicio se entiende prestado en España (art. 69.Uno.1º LIVA) y el IVA lo autoliquida el cliente por inversión del sujeto pasivo (art. 84.Uno.2º.a LIVA). No necesitas registrarte en España para IVA. [OFICIAL, BOE consolidado, consultado 2026-10-15]
2. **B2C sí exige IVA español.** Para particulares, un proveedor no UE puede usar el OSS "no Unión": un solo registro en un Estado miembro, una declaración trimestral, **sin umbral de 10.000 €** para proveedores no UE. No se puede usar si ya estás registrado (o obligado a registrarte) por IVA en la UE. [OFICIAL, Comisión Europea: https://vat-one-stop-shop.ec.europa.eu/one-stop-shop_en]
3. **Opción más barata de lanzar: Stripe Managed Payments** (Stripe como vendedor de registro, calcula, cobra, declara y paga el IVA). Acepta negocios con sede en EE. UU. y tiene códigos fiscales de "IA como servicio". Cuesta **3,5 % + comisiones normales de Stripe**. Tiene límites reales (solo Checkout/Payment Links, suscripciones nuevas, sin servicios con intervención humana). [OFICIAL, docs.stripe.com y support.stripe.com, 2026-10-15]
4. **Hoy el checkout ya usa `automatic_tax: enabled`** (`src/app/api/checkout/route.ts` de este repo). Eso **calcula y cobra** IVA, pero **no te registra ni declara**. Si cobras IVA español sin estar registrado, estás recaudando un impuesto que no puedes ingresar. Esto es lo primero que hay que cerrar.
5. **EL PUNTO CRÍTICO es Z.ai.** China no tiene decisión de adecuación. Z.ai internacional opera desde Singapur (entidad JINGSHENG HENGXING TECHNOLOGY PTE.LTD) y dice que procesa "generalmente en Singapur"; su addendum de API dice que **no almacena el contenido** y lo procesa en tiempo real. Pero no pude leer el DPA completo, no hay representante UE en su política y no vi SCC. [OFICIAL parcial: https://docs.z.ai/legal-agreement/privacy-policy]
6. **Hallazgo interno:** varios scripts del repo apuntan por defecto a `https://open.bigmodel.cn/api/anthropic` (endpoint de China continental, Zhipu Beijing), no a `api.z.ai` (Singapur). Si el producto usa ese host, el análisis de transferencias empeora mucho. **Confirmar con dev qué host usa el proxy de producción.**
7. **La política de privacidad actual dice que los cuerpos de Gmail y el texto de adjuntos pueden ir a Z.ai.** Eso es dato personal de terceros (los clientes de tu cliente). Es el riesgo n.º 1 de RGPD en España. Recomendación: modo "sin IA externa", minimización y alojamiento UE de GLM de pesos abiertos como opción por defecto para España.
8. **Precedentes reales:** la DPC irlandesa multó a TikTok con 530 M€ (2-may-2025) por transferencias a China sin evaluar el acceso de autoridades chinas (ejecución suspendida por recurso, según fuente secundaria de abril 2026). Italia bloqueó DeepSeek (ene-2025) y Berlín pidió retirarlo de las tiendas (jun-2025). **No encontré** decisión de la AEPD ni de la DPC sobre DeepSeek. [OFICIAL DPC; SECUNDARIA el resto]
9. **Reglamento de IA:** el "digital omnibus" **ya es ley** (Consejo 29-jun-2026; publicado en el DOUE 24-jul-2026; en vigor 27-jul-2026 según Comisión). Alto riesgo se aplaza a 2-dic-2027 (Anexo III) y 2-ago-2028 (Anexo I). Las obligaciones de transparencia del art. 50 aplican desde 2-ago-2026, salvo el marcado de contenido sintético (art. 50(2)) que se pasó a 2-dic-2026 según fuentes secundarias. TerminalSync probablemente es "riesgo mínimo/limitado". [OFICIAL parcial]
10. **Veri\*Factu no te obliga a ti como LLC sin establecimiento en España** (según el alcance que publica la AEAT), pero **sí obliga a tus clientes españoles** (sociedades desde 1-ene-2027; autónomos desde 1-jul-2027) y puede afectarte si TerminalSync **genera o modifica facturas** de ellos. [OFICIAL parcial + SECUNDARIA]

## Orden recomendado (de lo urgente a lo diferible)

| Fase | Qué | Quién | Plazo estimado (estimación mía) |
|---|---|---|---|
| **0 · Antes de abrir ventas** | Decidir estructura de cobro (Managed Payments vs Stripe Tax + OSS). Apagar cobro de IVA español si no hay registro. | JM + gestor | 1-2 semanas |
| **0** | Confirmar a dónde va realmente la IA (host, región, qué datos). Parar envío de adjuntos/Gmail a Z.ai hasta decidir. | dev + coordinador | 1 semana |
| **1 · Lanzamiento B2B** | Términos B2B en español, DPA de encargado, política de privacidad ES, banner de cookies conforme, aviso legal LSSI, cobro en EUR con factura sin IVA + leyenda de inversión del sujeto pasivo. | abogado + dev | 3-5 semanas |
| **1** | Contrato con Z.ai (DPA firmado con SCC o prueba de que no hay transferencia) + EIPD/TIA + opción "sin IA externa". | JM + abogado | 3-6 semanas |
| **2 · B2C** | Registro OSS no Unión (o MoR) + flujo de desistimiento con renuncia expresa + información precontractual. | gestor + abogado + dev | 4-8 semanas |
| **2** | Representante UE (art. 27 RGPD) si no se crea entidad en la UE. | JM | 1-2 semanas |
| **3 · Escala** | Alojar GLM en UE como proveedor por defecto; plan Veri\*Factu para conectores de contabilidad; decidir si crear sociedad UE. | dev + gestor | 2-4 meses |

**Mi recomendación honesta:** lanza primero **solo B2B** con IA en UE o "sin IA externa" por defecto, y deja B2C para la fase 2. B2C añade IVA con OSS, desistimiento, garantías y cláusulas abusivas, y el riesgo mayor con Z.ai (más datos personales de gente que no firmó nada).

## Mapa de quién hace qué
- **JM:** decisiones (estructura, B2B-first), firma de contratos, pago de gestor/abogado, alta del representante UE, contacto comercial con Z.ai.
- **Gestor/asesor fiscal español:** IVA (OSS vs MoR), impuestos directos/establecimiento permanente, facturación, Veri\*Factu, alta en AEAT o en el Estado elegido. Ver `01-impuestos-y-estructura.md`.
- **Abogado de protección de datos / digital:** RGPD, contrato de encargado, transferencias a China, EIPD, AI Act, consumo, LSSI. Ver `02-` y `03-`.
- **Dev:** configuración Stripe (tax IDs, EUR, Managed Payments), host de IA, filtros de datos, modo "sin IA externa", banner de cookies, páginas legales, flujo de desistimiento.
- **Coordinador:** gatear PRs de la app y de la web; nada de esto toca el `.app` de Lab.

## Índice
- `01-impuestos-y-estructura.md` — IVA, factura, estructura, MoR, impuestos directos, Veri\*Factu, cobro.
- `02-datos-rgpd-y-z-ai.md` — RGPD/LOPDGDD y el punto crítico de Z.ai (China).
- `03-ia-consumidores-y-web.md` — Reglamento de IA, LSSI, cookies, consumidores.
- `04-preguntas-para-gestor-y-abogado.md` — lista priorizada para enviar.

## Qué NO pude verificar (resumen)
DPA completo de Z.ai (cláusulas de subencargados, SCC, región); si el producto usa `api.z.ai` o `open.bigmodel.cn`; resultado de la convalidación de RDL 15/2025 en el Congreso; precios reales de proveedores UE de GLM; texto oficial del Reglamento (UE) 2026/1744 (EUR-Lex no cargó); tarifas actuales de Paddle/Polar/Lemon Squeezy en sus webs; ley española de IA (solo proyecto en Cortes); sanciones concretas; regulación de factura electrónica B2B (Ley Crea y Crece) vigente.

*Este documento es una investigación de apoyo para preparar la consulta con profesionales, no sustituye su criterio.*
