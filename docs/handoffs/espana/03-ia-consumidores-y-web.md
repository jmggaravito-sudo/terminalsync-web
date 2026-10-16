No es asesoría legal; validar con un profesional. Fecha de investigación: 2026-10-15

# 03 · Reglamento de IA, LSSI, cookies y consumidores

## Objetivo
Dejar la web, los términos y el flujo de compra listos para España: obligaciones del Reglamento de IA (AI Act), LSSI-CE, cookies, y derecho de consumo. Leyenda de fiabilidad en `00-resumen-y-orden.md`.

## Quién lo ejecuta
**Abogado digital/consumo** redacta o revisa textos. **Dev** implementa banner, páginas, flujo de compra y avisos de IA. **JM** decide política de reembolsos y B2B/B2C. **Coordinador** gatea los PRs.

## 1. Reglamento de IA (AI Act)

### 1.1 Calendario real a 15-oct-2026
- El **"digital omnibus" de IA** (que retrasa partes del AI Act) **está adoptado**: el Consejo dio luz verde final el **29-jun-2026**; la ficha del procedimiento del Parlamento lista el acto final publicado en el DOUE el **24-jul-2026** (firmado 8-jul-2026); la Comisión indica entrada en vigor el **27-jul-2026**. [OFICIAL: https://www.consilium.europa.eu/en/press/press-releases/2026/06/29/artificial-intelligence-council-gives-final-green-light-to-simplify-and-streamline-rules/ (la página devolvió 403 al fetch; el contenido lo vi en el resultado de búsqueda); ficha: https://oeil.europarl.europa.eu/oeil/en/procedure-file?reference=2025%2F0359%28COD%29 ; Comisión: https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai]. El texto en EUR-Lex (L 2026/1744) **no cargó**: no pude comprobar artículo por artículo. [NO VERIFICADO el articulado]
- **Alto riesgo:** sistemas independientes (Anexo III: biometría, infraestructuras críticas, educación, empleo, migración, asilo y fronteras) pasan al **2-dic-2027**; los incorporados en productos (Anexo I) al **2-ago-2028**. [OFICIAL parcial, Comisión + Consejo]
- **Transparencia (art. 50):** según fuentes secundarias, las obligaciones de transparencia se mantienen desde el **2-ago-2026** y el **marcado legible por máquina de contenido sintético (art. 50(2))** se aplazó al **2-dic-2026**. Una fuente discrepa. [SECUNDARIA: Simmons & Simmons https://www.simmons-simmons.com/en/publications/cmoveo6ke00icuxskpgueb0od/ai-omnibus-update ; Taylor Wessing, JD Supra]. Por prudencia: **asumir que 50(1), 50(3) y 50(4) ya aplican y que 50(2) aplica el 2-dic-2026**.
- **Prohibiciones:** aplican desde feb-2025 [MEMORIA]; el omnibus añade prohibición de sistemas "nudifier" desde 2-dic-2026 [SECUNDARIA]. Irrelevantes para TerminalSync.
- **GPAI (modelos de uso general, como GLM):** obligaciones del proveedor del modelo desde 2-ago-2025 [MEMORIA]; la supervisión/ejecución por la Oficina de IA con poderes desde 2-ago-2026 [SECUNDARIA: Simmons]. No sé si Zhipu firmó el Código de Buenas Prácticas. [NO VERIFICADO]
- **Alfabetización en IA (art. 4):** aplica desde feb-2025 [MEMORIA]; una fuente secundaria no ve cambios por el omnibus pero no está confirmado. [NO VERIFICADO]
- **España:** proyecto de Ley Orgánica de gobernanza de la IA aprobado por el Consejo de Ministros el 26-may-2026, publicado en el BOCG el 12-jun-2026 (plazo de enmiendas hasta 30-jun-2026), con la **AESIA** como autoridad principal sancionadora y punto único de contacto. [SECUNDARIA: https://www.hsfkramer.com/es/notes/madrid/2026-posts/alerta-espana-avanza-implementacion-reglamento-europeo-ia-junio-2026 ; finreg360]. Importes de sanciones: [NO VERIFICADO].

### 1.2 Clasificación probable de TerminalSync
(Análisis mío; **validar con abogado**.)
- **Eres "proveedor" de un sistema de IA** (lo pones en el mercado con tu nombre) y **"implementador/deployer"** de un modelo GPAI de tercero (GLM). No eres proveedor GPAI, salvo que modifiques el modelo de forma sustancial o lo alojes y lo ofrezcas como modelo propio. [MEMORIA]
- **Riesgo probable:** mínimo o limitado (asistente de productividad). **Se vuelve alto riesgo** si el cliente lo usa o tú lo promocionas para decisiones sobre empleo (selección de candidatos), crédito/solvencia, educación o acceso a servicios esenciales (Anexo III). Medidas: **restricción de uso aceptable** en los términos y no ofrecer plantillas para esos casos.
- **Chatbot:** si la IA interactúa con personas, hay que informar de que es IA (art. 50(1)) salvo que sea evidente. En TerminalSync el usuario sabe que habla con IA; aun así, añadir etiqueta visible.
- **Contenido generado:** si la IA genera texto que el cliente publica, la obligación de marcar (50(2)) es del proveedor del sistema (tú), con aplicación desde 2-dic-2026 según lo anterior; para texto "de interés público" sin revisión editorial, los deployers deben divulgarlo (50(4)). Qué técnicas bastan para texto: [NO VERIFICADO; se esperan códigos de buenas prácticas de la Comisión].
- **Si usas un GPAI de terceros:** debes pedir al proveedor la documentación técnica que permite cumplir (art. 53(1)(b) AI Act, [MEMORIA]). Con Z.ai: pedir ficha del modelo, resumen de datos de entrenamiento y política de derechos de autor. Si no la facilita, es un riesgo adicional frente a la alternativa de pesos abiertos con ficha pública.
- **Resumen:** para el lanzamiento, tareas ligeras (etiquetas, términos de uso, documentación) más seguimiento del calendario.

## 2. LSSI-CE (Ley 34/2002) y web

Todo esto es [MEMORIA] salvo lo marcado; el BOE consolidado de la LSSI no lo consulté hoy.
- **Información general (art. 10):** denominación o nombre, domicilio, correo electrónico y datos de contacto rápidos, inscripción registral (para tu caso: registro de Florida / número de la LLC), NIF o equivalente; precios con impuestos y gastos de envío cuando proceda; códigos de conducta si hay. Poner en el **pie de la web y en la app** un "Aviso legal" en español.
- **Ámbito:** aplica a prestadores establecidos en España y, en parte, a prestadores de fuera de la UE que dirigen servicios a España. La extensión exacta a una LLC de Florida: **pregunta al abogado**.
- **Contratación electrónica (art. 27):** antes de contratar, información clara sobre trámites, idioma, archivo del contrato, medios de corregir errores; confirmación de la contratación por email o equivalente en 24 h.
- **Comunicaciones comerciales (arts. 19-22):** identificarlas como publicidad; **prohibido enviar comunicaciones comerciales por email o similar sin consentimiento previo**, salvo cliente actual y productos similares con posibilidad de oposición fácil y gratuita en cada envío. Cuidado con campañas de outreach masivas a pymes españolas (el repo tiene un workflow de "creators outreach"; revisar si toca España). Sanciones: leves a graves, hasta cientos de miles de euros [MEMORIA, importes sin verificar].
- **Cookies y dispositivos de almacenamiento (art. 22.2 LSSI):** consentimiento informado para cookies no esenciales; la AEPD es la autoridad competente. 

### Cookies: guía vigente
- La AEPD actualizó su **Guía sobre el uso de las cookies** en julio de 2023 para alinearla con las Directrices 03/2022 del CEPD sobre patrones engañosos, con **plazo de adaptación hasta el 11-ene-2024**. [OFICIAL: https://www.aepd.es/prensa-y-comunicacion/notas-de-prensa/aepd-actualiza-guia-cookies-para-adaptarla-a-nuevas-directrices-cepd ; resumen vía Cuatrecasas/Écija]
- **Botón "Rechazar" en la primera capa, en el mismo lugar, formato y nivel que "Aceptar"**; mismo color, tamaño y visibilidad. [OFICIAL parcial, mismo origen]
- **Cookie wall** admisible solo con alternativa de acceso (no tiene que ser gratuita). [OFICIAL parcial]
- No tengo constancia de una versión posterior a 2023 de la guía; verificar en https://www.aepd.es/guias-y-herramientas/guias si hay una más reciente. [NO VERIFICADO]
- **Tarea dev:** gestor de consentimiento (CMP) con rechazo equivalente, registro de consentimiento, sin cookies analíticas antes del consentimiento, política de cookies en español con tabla de cookies. Aplica también al sitio `terminalsync-web`.

## 3. Consumidores (TRLGDCU, Real Decreto Legislativo 1/2007)
Aplica a **B2C**. Un autónomo que contrata para su actividad **no es consumidor** (aunque hay que ver el uso mixto) [MEMORIA]; en B2B se rige por condiciones generales de contratación (Ley 7/1998) y el Código Civil/Comercio. Eso es otra razón para B2B primero.

### 3.1 Desistimiento 14 días y renuncia expresa en contenido digital
- Regla general: 14 días naturales sin justificar [MEMORIA, art. 71 y 102 TRLGDCU].
- **Excepción para contenido digital no en soporte material** (art. 103.m): el derecho no aplica si la ejecución ha comenzado y, cuando hay pago, se dan tres condiciones: **(1)** consentimiento previo del consumidor para iniciar la ejecución durante el plazo de desistimiento, **(2)** el consumidor reconoce que por ello pierde el derecho de desistimiento, **(3)** el empresario da la **confirmación** del art. 98.7 o 99.2. [OFICIAL, BOE consolidado TRLGDCU, consultado 2026-10-15: https://www.boe.es/buscar/act.php?id=BOE-A-2007-20555]
- **Servicios:** el art. 103.a exceptúa cuando el servicio se ha ejecutado totalmente con consentimiento expreso y conocimiento de la pérdida del derecho. [OFICIAL, mismo texto]
- **Para TerminalSync** (descarga de app + servicio SaaS + créditos prepago): lo prudente es **casilla expresa no premarcada** en el checkout ("Solicito acceso inmediato y entiendo que pierdo el derecho de desistimiento") **y email de confirmación** con esa información. Si no se hace bien, el consumidor tiene el desistimiento (en España, hasta 12 meses si no se informó: [MEMORIA, art. 105]). Stripe Checkout admite casillas de consentimiento personalizadas (`consent_collection` / texto personalizado) [MEMORIA, verificar con dev]. **Con Stripe Managed Payments**, Stripe "aplica requisitos de protección al consumidor, como plazos de reflexión regionales donde hace falta" [OFICIAL], lo que implica que puede imponer su propia gestión de desistimiento: leer https://docs.stripe.com/payments/managed-payments/how-it-works antes de elegirlo.
- **Prueba gratuita + conversión a pago:** cada cobro nuevo puede reabrir derechos; consulta con abogado.

### 3.2 Precios con IVA, información precontractual
- **Precio final completo, incluidos los impuestos**, con descuentos y cargos desglosados. [OFICIAL, art. 20.1.c TRLGDCU; el sitio del BOE indica que una modificación por el RDL 4/2026 "se ha dejado sin efecto" y deja dudas de redacción; **leer el texto vigente en el BOE antes de redactar**]
- Para B2C en España: mostrar precio con IVA. Para B2B: mostrar "+ IVA, no aplicable por inversión del sujeto pasivo" según proceda. Esto conecta con `01-`.
- Información precontractual del art. 97-98 (identidad, características, duración, renovación automática, medios de pago, derecho de desistimiento, etc.). [MEMORIA]
- **Renovación automática de suscripciones:** informar claramente y ofrecer baja tan fácil como el alta. Hay iniciativas de "botón de baja" (Ley 3/2018 sobre servicios de atención al cliente, y la nueva ley de servicios de atención a la clientela) [MEMORIA; estado actual no verificado].

### 3.3 Cláusulas abusivas, idioma, garantías
- **Cláusulas abusivas** (arts. 80 y 82 y siguientes TRLGDCU): las no negociadas individualmente que causen desequilibrio. Limitaciones de responsabilidad, modificación unilateral del precio sin causa válida, jurisdicción fuera de España, renuncia a derechos de consumidor son típicas. **Los términos actuales** pueden llevar ley de Florida y arbitraje; **para consumidores españoles eso no vale** (el consumidor puede demandar en su domicilio). [MEMORIA]
- **Idioma:** la información al consumidor debe ser accesible en castellano [MEMORIA]. Términos, privacidad, avisos y checkout en español.
- **Garantías de contenidos y servicios digitales:** el TRLGDCU regula requisitos de conformidad de bienes y contenidos o servicios digitales (art. 115 bis y siguientes, Libro Segundo, Título IV), incluido el suministro continuo con actualizaciones durante el periodo del contrato. [OFICIAL parcial: art. 115 bis existe en el texto consolidado; el resto del régimen de remedios y plazos: MEMORIA]. Consecuencias para ti: documentar actualizaciones y compatibilidad; ofrecer reparación (corrección), reducción de precio o resolución cuando el servicio no cumpla.
- **Resolución de litigios en línea (ODR):** la plataforma ODR de la UE estaba prevista para cierre en julio de 2025 [MEMORIA, no verificado hoy]; no la enlaces sin comprobar. Sí debes informar de tu adhesión o no a un sistema de **resolución alternativa (ADR)** (Ley 7/2017) [MEMORIA].
- **Hojas de reclamaciones:** depende de la comunidad autónoma y de si tienes establecimiento; online suele bastar un canal de reclamaciones. [MEMORIA, validar]
- **Sanciones:** el régimen sancionador de consumo (hasta decenas o cientos de miles de euros) lo aplican las CCAA y el Ministerio. [MEMORIA]

## Pasos numerados
1. (Abogado, 1-2 semanas) Redactar: términos B2B y términos B2C en español, política de privacidad ES, política de cookies, aviso legal, uso aceptable (prohibiciones de IA de alto riesgo), texto de desistimiento.
2. (Dev, 1-2 semanas) CMP con "rechazar" equivalente; páginas legales en `/es/legal/*`; casillas de renuncia en checkout; mostrar precios con IVA para B2C; marcar "contenido generado por IA".
3. (Dev, 1 semana) Email de confirmación con mensaje de desistimiento (art. 98.7) y recibo.
4. (JM, 1 día) Definir política de reembolsos y baja.
5. (Abogado, 1 semana) Revisar el marcado de contenido sintético (50(2)) y la documentación pedida a Z.ai.
6. (JM/Coordinador, continuo) Revisar calendario AI Act (2-dic-2026 y 2-dic-2027) y la ley española de IA.

## Entradas que necesitas
Textos actuales de términos y privacidad; flujo exacto de checkout (trial, créditos prepago, suscripciones); lista de cookies y herramientas de analítica; textos de emails automáticos; qué prometes de IA en marketing.

## Costo y plazo (estimaciones mías)
- Paquete de textos legales ES (términos B2B/B2C, privacidad, cookies, aviso legal): 1.500-4.000 € con abogado; 2-4 semanas.
- CMP gratuito/de pago: 0-30 €/mes.
- Dev: 2-3 semanas.
- AI Act (revisión inicial): 500-1.500 €.

## Riesgos
- Términos en inglés con ley de Florida para consumidores españoles: cláusulas nulas.
- Banner que no cumple la guía AEPD: sanciones y reclamaciones.
- Perder el desistimiento si la renuncia no está bien documentada: reembolsos hasta 12 meses.
- Un cliente usa TerminalSync para decisiones de RR. HH. o crédito: caería en alto riesgo desde 2-dic-2027 y se convierte en tu responsabilidad.
- Cambios de calendario del AI Act o de la ley española.

## Enlaces
- Consejo (omnibus IA): https://www.consilium.europa.eu/en/press/press-releases/2026/06/29/artificial-intelligence-council-gives-final-green-light-to-simplify-and-streamline-rules/
- Comisión (AI Act): https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai
- EUR-Lex omnibus: https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=OJ%3AL_202601744 (no cargó)
- Simmons & Simmons: https://www.simmons-simmons.com/en/publications/cmoveo6ke00icuxskpgueb0od/ai-omnibus-update
- AEPD cookies: https://www.aepd.es/prensa-y-comunicacion/notas-de-prensa/aepd-actualiza-guia-cookies-para-adaptarla-a-nuevas-directrices-cepd
- TRLGDCU (BOE): https://www.boe.es/buscar/act.php?id=BOE-A-2007-20555
- Proyecto de ley IA España: https://www.hsfkramer.com/es/notes/madrid/2026-posts/alerta-espana-avanza-implementacion-reglamento-europeo-ia-junio-2026
