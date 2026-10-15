No es asesoría legal; validar con un profesional. Fecha de investigación: 2026-10-15

# 04 · Preguntas para gestor fiscal y abogado (lista para enviar)

## Objetivo
Enviar a los profesionales una consulta concreta y priorizada. Cada pregunta indica qué decisión desbloquea. **P0 = bloquea el lanzamiento; P1 = antes de abrir B2C o escalar; P2 = fase 3.**

## Quién lo ejecuta
JM envía. Dev contesta preguntas técnicas del anexo. Coordinador registra respuestas en este directorio (PR aparte).

## Pasos
1. JM copia la sección "Contexto para pegar" en el email al gestor y al abogado.
2. Envía el bloque A (gestor fiscal) y el bloque B (abogado RGPD/digital). Pide presupuesto cerrado para P0 antes de empezar.
3. Dev completa el anexo técnico (5 respuestas) antes de la reunión.
4. Tras las respuestas, actualizar `00-resumen-y-orden.md` con decisiones.

## Entradas
Contexto, `01-`, `02-`, `03-` y el anexo técnico.

## Costo y plazo
Primera reunión con cada profesional: 150-400 € y 1-2 semanas para agendar (estimación mía). Presupuestos de P0: 3.500-10.000 € en total entre ambos (estimación mía).

## Riesgos
Enviar sin el anexo técnico produce respuestas genéricas; mezclar fiscal y datos en un solo profesional suele encarecer.

---

## Contexto para pegar (en español)
Somos Marca E-commerce LLC / AM Importaciones SAS LLC (Florida, EE. UU.), operando TerminalSync: app de escritorio (Tauri/React) que sincroniza espacios de trabajo y conversaciones de IA entre los equipos del usuario sobre su propia nube (Google Drive), con un asistente de IA incluido basado en el modelo GLM de Z.ai (Zhipu, China; entidad internacional en Singapur). Cobramos con Stripe (suscripción y créditos prepago de 10 y 20 USD). Queremos vender en España a pymes y autónomos (B2B) y a particulares (B2C). No tenemos empleados, oficina ni servidores en España. Contamos con documentación de apoyo (adjuntos) elaborada el 2026-10-15; no la hemos validado jurídicamente.

---

## BLOQUE A: Gestor fiscal (IVA, impuestos directos, facturación)

### P0
1. **B2B sin IVA.** Confirmad que, vendiendo desde la LLC a empresarios/profesionales con NIF español, no tenemos que registrarnos en España y el cliente autoliquida (art. 69.Uno.1º y 84.Uno.2º.a LIVA). ¿Qué mención exacta debe llevar la factura? ¿Qué evidencia mínima de condición de empresario debemos conservar (NIF, consulta AEAT)? ¿Cómo tratamos al autónomo sin NIF-IVA? *(Desbloquea: facturación B2B y checkout.)*
2. **Cobro de IVA actual.** Nuestro Stripe tiene `automatic_tax` activado. Si ya hemos cobrado IVA español a algún cliente sin registro, ¿qué hay que hacer (regularización, devolución, registro retroactivo)? *(Desbloquea: riesgo existente.)*
3. **Estructura B2C.** Dado volumen estimado [rellenar] €/mes en España: ¿OSS no Unión desde la LLC (qué Estado de identificación recomendáis y por qué) o Stripe Managed Payments (3,5 % más comisiones; Stripe como vendedor de registro) o un MoR como Paddle? Comparativa de coste total y de riesgo. *(Desbloquea: decisión de estructura.)*
4. **OSS no Unión:** ¿procedimiento, plazos y coste de alta (modelo 035/369 si España), idioma, forma de pago desde EE. UU., periodicidad y plazos de presentación, moneda, y la regla de que no se puede usar si estamos o debemos estar registrados en IVA en la UE? ¿Qué ocurre si más adelante creamos una sociedad en la UE?
5. **Prueba de ubicación del cliente B2C:** ¿qué dos pruebas no contradictorias recomendáis y cuánto tiempo guardarlas?
6. **Establecimiento permanente y residencia fiscal:** con vendedores o contratistas en España o con el propietario residiendo parte del año en España, ¿cuándo se crea un EP o la residencia de la LLC? ¿Convenio España-EE. UU. y trato de la LLC (disregarded/corporation)? ¿Retenciones sobre pagos B2B de clientes españoles a la LLC?

### P1
7. **Veri\*Factu / Ley Antifraude.** ¿Nos obliga como LLC sin EP? ¿Se confirma el calendario (sociedades 1-ene-2027; resto 1-jul-2027, RDL 15/2025) y la convalidación del RDL? ¿Necesitamos consulta vinculante a la DGT?
8. **Conectores de contabilidad.** Si TerminalSync lee y opera programas de contabilidad/facturación de nuestros clientes mediante IA, ¿nos convierte en "productor de sistema informático de facturación" (RD 1007/2023)? ¿Qué debemos evitar (emitir, modificar o borrar registros de facturación)? ¿Qué obligaciones traslada esto al cliente?
9. **TicketBAI** (País Vasco, y Navarra): ¿nos afecta o afecta a clientes vascos que usen conectores?
10. **Factura electrónica B2B (Ley Crea y Crece):** ¿estado actual y fecha de obligatoriedad; afecta a una LLC extranjera?
11. **Cobro:** SEPA Direct Debit para B2B, SCA/PSD2 en renovaciones, EUR como moneda, Bizum (¿merece la pena?).
12. **Facturas en EUR desde cuenta de EE. UU.:** tipo de cambio fiscal aplicable, conversión Stripe, diferencias.

### P2
13. ¿Compensa crear una sociedad en la UE (España, Irlanda, Estonia con e-Residency)? Coste de constitución y anual, impuesto de sociedades, sustancia, y efecto en IVA y en el representante RGPD.
14. Impuesto sobre Determinados Servicios Digitales: confirmar que no aplica.
15. Otras jurisdicciones UE (Francia, Alemania, Italia): ¿algún requisito local de IVA o factura distinto al OSS?

---

## BLOQUE B: Abogado RGPD / digital / consumo

### P0
1. **Z.ai y transferencias (el punto crítico).** Hoy el producto envía la petición y el contexto del espacio de trabajo, potencialmente cuerpos de Gmail y texto de adjuntos, a Z.ai a través de Cloudflare. Z.ai internacional dice procesar "generalmente en Singapur" y que su addendum API no almacena contenido. ¿Es viable seguir con Z.ai para clientes españoles? ¿Qué condiciones mínimas (DPA firmado con SCC, TIA, cero retención, no entrenamiento, subencargados, región)? ¿Qué pasa si Z.ai no firma SCC? ¿Cómo lo evaluaría la AEPD a la luz de la decisión de la DPC sobre TikTok (2-may-2025)? *(Desbloquea: poder vender con IA en España.)*
2. **Alternativa UE:** si alojamos GLM de pesos abiertos en un proveedor europeo, ¿qué contratos y revisiones necesitamos (DPA, subencargado, licencia del modelo)? ¿Esto elimina la transferencia?
3. **Roles RGPD:** ¿somos responsables, encargados o ambos? Con datos de terceros en Gmail/Drive del cliente, ¿cómo estructuramos el DPA de encargado y la lista de subencargados? ¿Quién es responsable por el contenido que el cliente elige enviar a la IA?
4. **Representante UE (art. 27)** o entidad UE: ¿cuál es la opción recomendada para nuestro caso y qué proveedor? ¿Responsabilidad del representante en la LOPDGDD?
5. **EIPD:** ¿es obligatoria? ¿Alcance? ¿Quién la hace y cuándo?
6. **Textos legales ES:** términos B2B, términos B2C, política de privacidad, política de cookies, aviso legal, uso aceptable. ¿Pueden usarse ley y foro de Florida con clientes B2B españoles? ¿Y con consumidores?
7. **Consumo B2C:** redacción del flujo de renuncia al desistimiento (art. 103.m TRLGDCU) en checkout y email de confirmación; renovación automática; reembolsos; créditos prepago no consumidos.

### P1
8. **Reglamento de IA:** confirmad la clasificación (proveedor de sistema de IA + implementador de GPAI de tercero, riesgo mínimo/limitado); obligaciones de transparencia (art. 50) y fechas aplicables hoy (omnibus: 2-ago-2026 y 2-dic-2026); cláusulas para evitar usos de alto riesgo (empleo, crédito); documentación que debemos exigir a Z.ai como proveedor GPAI.
9. **LSSI:** ¿se aplica a una LLC de Florida que dirige servicios a España? Datos del prestador en aviso legal. Comunicaciones comerciales: ¿qué se permite en outreach a pymes y qué requiere consentimiento?
10. **Cookies:** revisión de nuestro banner frente a la guía AEPD (rechazo en primera capa, sin cookies previas).
11. **DPO:** ¿obligatorio ahora o en qué umbral?
12. **Garantías de contenidos y servicios digitales:** qué debemos prometer, plazos y remedios; actualizaciones.
13. **ADR / ODR / hojas de reclamaciones:** qué información debemos incluir hoy.

### P2
14. Cumplimiento de la futura ley española de IA y AESIA; sanciones; registro.
15. Seguro de responsabilidad civil/ciber para España.
16. Certificaciones que ayuden en B2B (ISO 27001, SOC 2) y su relevancia.

---

## ANEXO TÉCNICO (responde el dev antes de enviar)
1. ¿Qué host de Z.ai usa el proxy de producción: `api.z.ai`, `open.bigmodel.cn` u otro? ¿Qué región de Cloudflare procesa?
2. ¿Qué campos exactos se envían al modelo (mensaje, contexto de workspace, cuerpos de Gmail, texto de adjuntos, nombres de archivo)? ¿Hay opt-in por cuerpo/adjunto?
3. ¿Qué logs conserva Cloudflare/Supabase de esas peticiones y por cuánto tiempo?
4. ¿Qué datos de terceros llegan a servidores de TerminalSync (no solo a Z.ai)? ¿Algo se almacena fuera del Drive del usuario?
5. ¿El checkout recoge `tax_id`, país de facturación y consentimiento de desistimiento? ¿Qué productos tienen tax code asignado en Stripe y cuál (p. ej. `txcd_10105002`, IA como servicio de uso empresarial)? ¿Hay registros fiscales activos en Stripe Tax?

*Hallazgos de los que parten las preguntas: ver `00-resumen-y-orden.md`.*
