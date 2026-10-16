No es asesoría legal; validar con un profesional. Fecha de investigación: 2026-10-15

# 01 · Impuestos, facturación, cobro y estructura

## Objetivo
Cobrar a clientes españoles sin deber IVA que nadie declara, sin crear un establecimiento permanente por accidente, y con la estructura más simple que sea defendible. Fecha de hoy: 2026-10-15. Leyenda de fiabilidad: ver `00-resumen-y-orden.md`.

## Quién lo ejecuta
JM decide; **gestor fiscal español** (con experiencia en no residentes y OSS) valida y presenta; **dev** configura Stripe; **abogado** revisa términos de venta.

## 1. IVA: qué pasa según a quién vendes

### 1.1 B2B (empresa o autónomo español que actúa como tal)
- Regla de localización: el servicio se entiende prestado en España cuando el destinatario es empresario o profesional que actúa como tal y tiene su sede, establecimiento o domicilio en España, "con independencia de dónde se encuentre establecido el prestador" (art. 69.Uno.1º LIVA). [OFICIAL, BOE consolidado Ley 37/1992, consultado 2026-10-15: https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740]
- Inversión del sujeto pasivo: el IVA lo autoliquida el cliente cuando el servicio lo hace una persona "no establecida" en el territorio de aplicación del impuesto (art. 84.Uno.2º.a LIVA). [OFICIAL, misma fuente]
- Consecuencia práctica: tú facturas **sin IVA español** con la mención de inversión del sujeto pasivo, y no necesitas alta en IVA en España. Mención exacta y requisitos de factura (RD 1619/2012): [MEMORIA, confirmar con gestor].
- **Prueba de que es B2B:** hay que recoger el NIF-IVA/NIF y validarlo. Para clientes de otros países UE se valida en VIES (https://ec.europa.eu/taxation_customs/vies/). Para NIF español, la AEAT tiene consulta propia. Presunciones del Reglamento de Ejecución 282/2011 (art. 18): [MEMORIA]. **Un autónomo sin NIF-IVA válido se trata como consumidor** (cobras IVA, ver 1.2).
- Stripe: Checkout puede recoger `tax_id` (NIF/CIF) y marcar el cobro como reverse charge. En el repo el checkout tiene `automatic_tax.enabled` pero **no vi `tax_id_collection`** (`src/app/api/checkout/route.ts`, revisado hoy). Pedirlo al dev. Comportamiento exacto de Stripe Tax con reverse charge a España: [MEMORIA, probar en modo test].

### 1.2 B2C (particulares, y autónomos sin NIF-IVA)
- Tu cliente está en España: el IVA español es **21 %** (tipo general) [MEMORIA, confirmar; el tipo no lo verifiqué hoy].
- Para un proveedor **no UE** existe el **régimen OSS "no Unión"**: te registras en **un** Estado miembro de identificación a tu elección y presentas **una declaración trimestral** donde declaras y pagas el IVA de todos los países UE. [OFICIAL, Comisión Europea: https://vat-one-stop-shop.ec.europa.eu/one-stop-shop_en y la guía de la Comisión https://taxation-customs.ec.europa.eu/document/download/ca213281-027c-4ade-9a07-0c60e8929242_en?filename=one-stop-shop-guidelines_en.pdf]
- **Sin umbral** para proveedores no UE: el umbral de 10.000 € no aplica al régimen no Unión. [OFICIAL, misma guía]
- **Cobertura:** desde 1-jul-2021 cubre todos los servicios B2C con lugar de realización en la UE, no solo los digitales. Si optas por OSS, debes declarar así todas esas ventas. [OFICIAL, misma guía]
- **Incompatibilidad crítica:** no puedes usarlo si ya estás registrado, o estás obligado a registrarte, a efectos de IVA en la UE. [OFICIAL, misma guía]. Es decir: si por algún motivo te das de alta de IVA en España (p. ej. por tener una sociedad española), el OSS no Unión desaparece.
- Cambios: la Comisión anuncia "pequeñas aclaraciones" para usuarios de OSS desde **1-ene-2027**. [OFICIAL parcial: https://vat-one-stop-shop.ec.europa.eu/index_en; no leí el detalle]
- **Si eliges España como Estado de identificación:** alta con el modelo 035 y declaración con el modelo 369; la norma española está en los arts. 163 septvicies y siguientes LIVA (obligación de tener NIF y declarar inicio/cese por vía electrónica). [OFICIAL, BOE, art. 163 septvicies]. Periodicidad y plazos concretos del modelo 369 en la sede de la AEAT: [NO VERIFICADO; la sede de la AEAT devolvió 404 y los blogs se contradicen (trimestral vs mensual). La Comisión dice trimestral para el no Unión]. Pedir al gestor.
- **Elegir Estado:** puede ser cualquiera. España tiene la ventaja de idioma y tu gestor; Irlanda, la de trabajar en inglés. Comparación de costes por país: [NO VERIFICADO, estimación mía abajo].
- **Evidencias:** hay que acreditar la ubicación del cliente con dos pruebas no contradictorias (país de la tarjeta, IP, dirección de facturación) y guardar registros (10 años según una fuente secundaria). [SECUNDARIA / MEMORIA]
- **Factura B2C:** [MEMORIA] en OSS rigen las reglas de factura del Estado de identificación para ciertos casos; confirmar con gestor qué número de serie y qué idioma.

### 1.3 Qué hace Stripe Tax y qué NO
- **Hace:** calcula el impuesto según ubicación y tipo de producto, lo añade al cobro, genera informes. [OFICIAL: https://docs.stripe.com/tax]
- **NO hace** (con Stripe Tax "solo"): registrarte, ni presentar tus declaraciones, ni pagar a Hacienda por ti; sigues siendo el vendedor y el responsable. [SECUNDARIA, coincide con la descripción de producto; confirmar en la web de Stripe qué servicios de registro/filing ofrece hoy (hay partners y planes aparte)]
- **Hallazgo:** el checkout actual ya cobra IVA automáticamente (`automatic_tax: { enabled: true }`). Si Stripe está recaudando IVA español sin que exista registro OSS, hay un impuesto recaudado sin ingresar. Verificar en el Dashboard de Stripe (Tax > Registrations) qué registros hay hoy. [Hallazgo mío del código]

## 2. Opciones de estructura (comparación honesta)

| Opción | Cómo funciona | Ventajas | Inconvenientes | Coste (indicativo) |
|---|---|---|---|---|
| **A. Seguir vendiendo desde la LLC + Stripe Tax + OSS no Unión** | La LLC es el vendedor. Te registras en OSS (para B2C) y facturas B2B sin IVA. | Comisión mínima (Stripe normal). Control total. | Tú eres el responsable fiscal: registro, 4 declaraciones al año, evidencias de ubicación, consultas de la AEAT, riesgo de error. Si luego vendes en otros países (UK, Noruega, Suiza…) esos IVA van aparte (OSS cubre solo UE). | Estimación mía: alta 300-800 € + 600-1.800 €/año de gestor por trimestral OSS. Comisión Stripe estándar. |
| **B. Stripe Managed Payments (MoR de Stripe)** | Stripe es el vendedor de registro: calcula, cobra, declara y paga el impuesto indirecto; gestiona disputas y fraude. | Cero registro/declaración de IVA para ti en 80+ países. Acepta empresas con sede en EE. UU. Códigos fiscales de IA como servicio existen. Una sola integración con lo que ya usas. | **3,5 % sobre el importe total (incluido el IVA)** además de las comisiones normales de Stripe y Stripe Billing; solo integraciones directas (sin Connect), Checkout/Payment Links; solo suscripciones nuevas desde sesión de Managed Payments; no sirve para servicios con intervención humana; Stripe puede reembolsar hasta 60 días en ciertos casos; hay revisión de elegibilidad. | 3,5 % + Stripe estándar (≈2,9 %+0,30 $ en EE. UU., [MEMORIA]). [OFICIAL: https://docs.stripe.com/payments/managed-payments/eligibility y https://support.stripe.com/questions/managed-payments-pricing] |
| **C. Otro MoR (Paddle, FastSpring, Lemon Squeezy, Polar…)** | El MoR compra la licencia y revende al cliente final. | Mismos beneficios de B; Paddle lleva años en el mercado. | Otra pasarela, migrar suscripciones y créditos (hay sistema de créditos con Stripe/Mercado Pago en este repo), el MoR es parte del contrato con el cliente y controla la relación. | Paddle y Lemon Squeezy: 5 % + 0,50 $ por transacción [SECUNDARIA: blogs de terceros, algunos de competidores]. FastSpring: sin tarifa pública. Polar: cifras contradictorias. Lemon Squeezy parece estar siendo absorbido por Stripe [SECUNDARIA, una sola fuente]. **Verificar en las webs de cada proveedor.** |
| **D. Sociedad en la UE (Irlanda, Estonia con e-Residency, o España SL)** | Una entidad UE vende. Para B2C usa el OSS de la Unión. | Resuelve la figura del representante UE del RGPD (art. 27) porque tendrías establecimiento. Imagen frente a clientes europeos. | Contabilidad, impuesto de sociedades, sustancia (dirección efectiva), cuentas, auditoría eventual. e-Residency **no equivale a establecimiento ni elimina obligaciones locales** [MEMORIA]. **No resuelve el problema de Z.ai.** Si la sociedad se registra en IVA, ya no puedes usar el OSS no Unión desde la LLC con el mismo negocio. | Estimación mía: 2.000-6.000 € de constitución y 3.000-12.000 €/año de gestión según país. Tipos de impuesto de sociedades (España general 25 %, Irlanda 12,5 %, Estonia 22 % sobre beneficios distribuidos): [MEMORIA, confirmar]. |

### Mi recomendación (honesta)
1. **Fase 1 (lanzamiento B2B):** vender desde la LLC con **B2B sin IVA** (inversión del sujeto pasivo) y **desactivar B2C en España** hasta tener registro o MoR. Es lo más barato y lo más seguro.
2. **Fase 2 (B2C):** probar **B (Stripe Managed Payments)** si el flujo de créditos y suscripciones cabe en Checkout. Para un SaaS pequeño, 3,5 % es menos que un gestor + OSS + riesgo de error. Si los volúmenes crecen (p. ej. >15-20 k €/mes de B2C europeo), recalcular A frente a B.
3. **Fase 3:** considerar **D** solo si hay motivo (clientes grandes que lo exigen, ayudas, reputación). No lo recomiendo "por si acaso".

### Ojo con mezclar B y A
Managed Payments y facturar tú como LLC en OSS para el mismo cliente son vendedores distintos. Para B2B, Stripe MoR **cambia el vendedor** (la factura sale de Stripe, no de ti): verificar con Stripe si admite B2B con NIF-IVA y qué factura recibe el cliente. [NO VERIFICADO]

## 3. Impuestos directos y establecimiento permanente (nivel general)
- El IVA no es el impuesto sobre la renta de la LLC. Una LLC de Florida tributa en EE. UU. según su elección fiscal (disregarded/partnership/corp). Si las ventas a España generan beneficio en España depende de si hay **establecimiento permanente (EP)**.
- Convenio España-EE. UU. y criterio OCDE: un EP suele requerir un lugar fijo de negocios o un agente dependiente que concluya contratos habitualmente. Vender un SaaS por internet **sin personas, oficina ni servidores propios en España normalmente no crea EP** [MEMORIA; criterio general, no verificado hoy].
- **Riesgos de crear EP sin querer:** contratar vendedores/agentes en España que cierren contratos, tener un empleado o autónomo dependiente allí, o que la dirección efectiva esté en España. Si JM o un socio vive y gestiona desde España, la LLC puede tener residencia fiscal española. [MEMORIA]
- Otras cuestiones: retenciones en origen sobre pagos desde España a la LLC (para servicios SaaS B2B, normalmente no hay retención, pero hay regímenes de cánones para software: confirmar [MEMORIA]); Impuesto sobre Determinados Servicios Digitales (3 %) solo para grupos con ingresos muy altos (750 M€) [MEMORIA], no aplica a TerminalSync.
- **Quién:** asesor fiscal internacional (EE. UU.-España), no solo el gestor de IVA.

## 4. Facturación en España

### 4.1 ¿Debo emitir factura?
- Sí, a empresarios y profesionales siempre; a consumidores, según el caso. Reglamento de facturación RD 1619/2012 [MEMORIA]. Una LLC no residente sin EP: se aplica la normativa del Estado del prestador salvo B2B con sujeto pasivo español [MEMORIA, confirmar]. **Pregunta para el gestor.**

### 4.2 Veri\*Factu y la Ley Antifraude
- **Calendario vigente:** el Real Decreto-ley 15/2025 (BOE 3-dic-2025, BOE-A-2025-24446) aplazó la obligación: **sociedades (Impuesto de Sociedades): 1-ene-2027; resto (autónomos IRPF, no residentes con EP): 1-jul-2027.** [SECUNDARIA: KPMG, LegalToday, Consejo General de Gestores; fecha de publicación en BOE, de KPMG]. **No pude confirmar el resultado de la votación de convalidación en el Congreso** (era el 11-dic-2025); fuentes posteriores (oct-2026) tratan julio 2027 como vigente.
- **¿Te obliga a ti?** La AEAT define los obligados: empresarios y profesionales sujetos a IRPF, Impuesto sobre Sociedades, o IRNR **con establecimiento permanente en España**. [OFICIAL parcial: https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/cuestiones-generales/quienes-estan-obligados-que-operaciones-incluyen.html]. Una LLC **sin EP** en España y sin domicilio fiscal aquí **no aparece como obligada**. No encontré texto que lo diga expresamente; **pregunta al gestor y, si el riesgo importa, consulta vinculante a la DGT**.
- **¿Te afecta como fabricante de software?** El reglamento (RD 1007/2023) impone obligaciones a los **productores de sistemas informáticos de facturación** (declaración responsable, etc.). Si TerminalSync **solo conecta** con el programa de contabilidad del cliente (lo lee, lo opera con permiso del usuario), probablemente **no es un SIF**; si **genera, modifica o borra registros de facturación**, hay que analizarlo. [MEMORIA / NO VERIFICADO]. **Recomendación de producto: que los conectores de contabilidad no emitan facturas por sí mismos; que le pidan al programa del cliente (ya compatible) que lo haga y que la IA solo redacte borradores.**
- **¿Afecta a los clientes españoles que usarán conectores de contabilidad?** Sí: ellos deben usar software conforme desde 2027. Un conector que **edita facturas ya emitidas** podría vulnerar la inalterabilidad que exige el reglamento. Evitarlo en el diseño y avisar en la documentación.
- La consulta vinculante V0100-2026 (DGT, ene-2026) dice que el reglamento aplica a contribuyentes de IRPF que emiten facturas con software, incluso a clientes no residentes. [SECUNDARIA: fiscal-impuestos.com] Esto es relevante para tus clientes autónomos españoles, no para ti.

### 4.3 TicketBAI
- Es el sistema equivalente en el País Vasco (Álava, Bizkaia, Gipuzkoa); Navarra tiene su regulación propia. Aplica a contribuyentes sujetos a normativa foral [MEMORIA, no verificado]. Para una LLC sin EP: probablemente no. Para clientes vascos con conectores de contabilidad: sí, mismo cuidado que Veri\*Factu. **Pregunta para el gestor.**

### 4.4 Factura electrónica B2B (Ley Crea y Crece)
- Hay una obligación legal de factura electrónica entre empresas pendiente de desarrollo reglamentario. **No verifiqué su estado hoy.** [NO VERIFICADO]. Pregunta para el gestor.

## 5. Cobro (SEPA, tarjetas, SCA, Bizum)
- **Moneda:** cobrar en **EUR** a clientes españoles evita sorpresas de conversión; Stripe ofrece precios locales (Adaptive Pricing). [MEMORIA; el contenido de la página de Managed Payments menciona Adaptive Pricing como forma de quitar la comisión de conversión].
- **Tarjetas y SCA (PSD2):** la autenticación reforzada se aplica a pagos de clientes con tarjeta emitida en el EEE; Stripe la gestiona con 3D Secure; las suscripciones recurrentes usan el primer cobro autenticado y exenciones posteriores. [MEMORIA, no verificado hoy en docs de Stripe]. Con Managed Payments, Stripe gestiona fraude y 3D Secure. [OFICIAL]
- **SEPA Direct Debit:** disponible vía Stripe para EUR; útil para B2B; riesgo de devoluciones de 8 semanas (cobros autorizados) y 13 meses (no autorizados) [MEMORIA]. Con Managed Payments, los métodos de pago locales **suman comisiones** a la tarifa del 3,5 %. [OFICIAL parcial: la página lista Klarna, Bancontact, etc.; no vi SEPA ni Bizum en el extracto].
- **Bizum / Redsys:** Bizum se contrata a través de Redsys o entidades; **no está disponible directamente con Stripe** [MEMORIA, verificar]. Solo tiene sentido si B2C particular es relevante; para B2B no.
- **Pregunta de producto:** si ya hay Mercado Pago apagado para el lanzamiento, mantener solo Stripe en EUR para España.

## Pasos numerados
1. (Dev, 1 día) Revisar en Dashboard Stripe: registros fiscales activos, productos con tax code, país de la cuenta. Confirmar si `automatic_tax` ya cobra IVA español. Si sí, **pausar** o registrar.
2. (JM + gestor, 1 semana) Reunión 1: decidir Fase 1 B2B-only vs B2B+B2C y A vs B. Usar `04-preguntas-para-gestor-y-abogado.md`.
3. (Dev, 2-3 días) Añadir `tax_id_collection` y tratar clientes sin NIF-IVA válido como consumidores; fijar precios en EUR para España; mostrar IVA incluido (ver `03-`).
4. (Gestor, 2-6 semanas) Si opción A: alta OSS no Unión en el Estado elegido, proceso de pago desde cuenta de EE. UU., calendario trimestral. Si opción B: solicitar elegibilidad y migrar a Managed Payments.
5. (Gestor, antes de facturar) Modelo de factura B2B con mención de inversión del sujeto pasivo y serie/numeración.
6. (Dev + gestor, fase 3) Plan de conectores de contabilidad frente a Veri\*Factu: solo lectura o delegado al programa del cliente.

## Entradas que necesitas
EIN y datos de la LLC; estatuto fiscal elegido (Form 8832 si existe); cuentas Stripe y países; volumen previsto en España por trimestre; dónde vive JM y dónde está la dirección efectiva; lista de productos (suscripción, créditos prepago de 10/20 USD).

## Costo y plazo (resumen, estimación mía salvo donde se cite)
- Reunión inicial con gestor: 150-400 € (estimación mía).
- Alta OSS no Unión + primer trimestre: 300-800 € alta y 150-450 € por declaración trimestral (estimación mía).
- Managed Payments: 3,5 % del importe total + comisiones normales [OFICIAL].
- Asesoría de EP/convenio: 500-1.500 € por informe (estimación mía).
- Plazo OSS desde solicitud hasta número: semanas (un proveedor tercero habla de "varias semanas" en Francia). [SECUNDARIA]

## Riesgos
- Cobrar IVA sin estar registrado: puede ser considerado ingreso indebido y problemas con consumidores y con Stripe.
- No cobrar IVA a un consumidor español: la deuda recae en ti con recargos.
- Cliente B2B falso (alguien que dice ser empresa para evitar IVA): conserva la validación del NIF.
- Crear un EP por contratar un vendedor en España.
- Mezclar Managed Payments y facturación propia.
- Cambios en OSS en 2027 [OFICIAL, sin detalle].

## Enlaces
- OSS Comisión: https://vat-one-stop-shop.ec.europa.eu/one-stop-shop_en (consultado 2026-10-15)
- Guía OSS Comisión: https://taxation-customs.ec.europa.eu/document/download/ca213281-027c-4ade-9a07-0c60e8929242_en?filename=one-stop-shop-guidelines_en.pdf (2026-10-15)
- LIVA (BOE): https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740 (2026-10-15)
- Stripe Managed Payments: https://docs.stripe.com/payments/managed-payments/eligibility y https://support.stripe.com/questions/managed-payments-pricing (2026-10-15)
- Stripe Tax: https://docs.stripe.com/tax
- AEAT, obligados Veri\*Factu: https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/cuestiones-generales/quienes-estan-obligados-que-operaciones-incluyen.html
- KPMG sobre RDL 15/2025: https://assets.kpmg.com/content/dam/kpmgsites/es/pdf/2025/12/tax-alert-el-real-decreto-ley-15-2025-amplia-plazos-adaptacion-reglamento-verifactu.pdf.coredownload.inline.pdf
- Comparativas MoR (SECUNDARIAS): https://dodopayments.com/blogs/cheapest-merchant-of-record, https://fungies.io/merchant-of-record-pricing-guide-2026.md
