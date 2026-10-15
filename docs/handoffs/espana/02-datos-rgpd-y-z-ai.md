No es asesoría legal; validar con un profesional. Fecha de investigación: 2026-10-15

# 02 · Protección de datos (RGPD/LOPDGDD) y el punto crítico: Z.ai (China)

## Objetivo
Que TerminalSync pueda tratar datos de clientes españoles cumpliendo el RGPD y la LOPDGDD, y decidir con criterio si GLM de Z.ai puede seguir siendo el motor de IA para España, con qué salvaguardas y con qué alternativas. Leyenda de fiabilidad en `00-resumen-y-orden.md`.

## Quién lo ejecuta
**Abogado de protección de datos** (RGPD, transferencias, contrato de encargado, EIPD). **JM** (contacto con Z.ai, decisiones). **Dev** (qué datos salen, filtros, modo sin IA externa, host).

## Primero, un hecho del propio repo
- La política de privacidad actual (`src/app/privacy/page.tsx` y `src/app/[lang]/legal/privacy/page.tsx`) dice que la IA incluida envía la petición y el contexto del espacio de trabajo **a través de Cloudflare a Z.ai (Zhipu AI)**, y que **cuerpos de Gmail y texto de adjuntos pueden formar parte** de ese contexto. Eso es dato personal de terceros (los clientes de tu cliente).
- Scripts del repo apuntan por defecto a `https://open.bigmodel.cn/api/anthropic` (endpoint de China continental). No sé cuál usa el proxy de producción (vive fuera de este repo). **Confirmar. Es la diferencia entre "Singapur" y "China continental".**

## 1. Roles: ¿responsable o encargado?
(RGPD art. 4, 24, 28. Criterios generales; [MEMORIA, validar con abogado])
- **Responsable (controller) de TerminalSync respecto a sus propios usuarios:** datos de cuenta, facturación, soporte, analítica, tickets. Aquí decides fines y medios.
- **Encargado (processor) cuando el cliente mete datos de SUS clientes** (p. ej. correos de clientes, contactos, facturas) y TerminalSync los procesa bajo sus instrucciones. El cliente es el responsable y tú su encargado.
- **Z.ai es subencargado** si TerminalSync lo contrata para procesar datos del cliente (art. 28.2 y 28.4: necesitas autorización del responsable y contrato equivalente).
- **Matiz arquitectónico a confirmar con dev:** si los datos viven en el Drive y el dispositivo del cliente y **no pasan por servidores de TerminalSync** (salvo la llamada a la IA a través del proxy), tu papel puede ser menor, pero el proxy a Z.ai ya es tratamiento. Cuando el usuario conecta su propia clave de otro proveedor, el flujo es del usuario. [Privacidad actual lo menciona.]
- Para B2C puro (particular que usa TerminalSync para sus cosas), puede ser que el usuario actúe fuera del ámbito doméstico/profesional; en la práctica, tú eres responsable.

## 2. Base legal
- **Ejecución del contrato** (art. 6.1.b): prestar el servicio solicitado (cuenta, sync, IA a petición).
- **Interés legítimo** (6.1.f): seguridad, antifraude, mejora básica, con ponderación.
- **Consentimiento** (6.1.a): analítica no esencial, marketing, y —si el abogado lo ve necesario— el envío a un proveedor fuera del EEE. Ojo: el consentimiento solo es válido si es libre, específico e informado; y en B2B el responsable es el cliente.
- Para datos de terceros dentro de documentos del cliente, **la base legal la pone el cliente** (tú eres encargado); tu contrato debe decirlo.
- **Datos especiales** (salud, etc.) pueden aparecer en correos o documentos: mejor diseñar para que el modo por defecto no envíe contenido a IA externa sin acción del usuario.

## 3. Contrato de encargado (art. 28) y documentos mínimos
- DPA con cada cliente B2B: objeto, duración, tipo de datos, instrucciones, confidencialidad, medidas de seguridad, subencargados con lista y aviso de cambios, asistencia a derechos, borrado/devolución al terminar, auditorías.
- **Lista de subencargados publicada:** Stripe, Supabase, Cloudflare, Google (Drive/Gmail según conector), **Z.ai**, etc. Con país de tratamiento. [MEMORIA]
- **Registro de actividades de tratamiento** (art. 30) como responsable **y** como encargado. Hay una excepción para <250 empleados, pero no aplica si el tratamiento no es ocasional; en la práctica, hazlo. [MEMORIA]
- **Notificación de brechas** (art. 33, 72 h) y procedimiento interno.
- **Avisos de privacidad en español** (art. 13/14): quién eres, finalidades, bases, destinatarios, **transferencias internacionales con garantías**, plazos, derechos, derecho a reclamar ante la AEPD. La LOPDGDD (Ley Orgánica 3/2018) permite la "información por capas" (art. 11) [MEMORIA].
- **DPO / Delegado (art. 37 y art. 34 LOPDGDD):** obligatorio si el tratamiento a gran escala exige observación habitual sistemática o categorías especiales a gran escala; art. 34 LOPDGDD lista sectores. Para una app de escritorio sin monitorización masiva, **probablemente no obligatorio al inicio**, pero reevaluar si se procesan grandes volúmenes de correo. [MEMORIA, validar]
- **EIPD (art. 35):** probable que sí, porque hay IA, tratamiento de contenido de correo a escala y transferencia a tercer país. La AEPD publica una lista de tratamientos que exigen EIPD (consultar versión vigente) [NO VERIFICADO hoy].
- **Representante en la UE (art. 27):** obligatorio para responsables/encargados no establecidos en la UE que ofrecen bienes o servicios a personas en la UE (art. 3.2). [MEMORIA; el RGPD no lo exime por ser B2B]. Si **creas una entidad en la UE con establecimiento real**, no hace falta. Proveedores y precios publicados:
  - Prighter: 170 €/mes, 2.040 €/año (descuentos de hasta 40 % en paquete). [SECUNDARIA: https://prighter.com/product/gdprrep/services]
  - PrivacyEngine: 250 USD/mes o 2.500 USD/año. [SECUNDARIA: https://www.privacyengine.io/]
  - IT Governance Europe (Irlanda): 750 £ a 2.500 £ + IVA al año según tamaño. [SECUNDARIA: https://itgovernance.co.uk/shop/product/gdpr-eu-representative]
  - IT-Recht Kanzlei (Alemania): 19,90 €/mes, solo clientes de sus paquetes. [SECUNDARIA: https://www.it-recht-kanzlei.de/Service/eu-vertreter-dsgvo.php]
  - Una fuente (edpo.com) dice que la LOPDGDD podría hacer solidariamente responsable al representante: [NO VERIFICADO]. Elige proveedor con seguro y deja claro el reparto por contrato.
  - Rango estimado: **600-2.500 €/año** más tu tiempo (estimación mía basada en lo anterior).
  - El representante debe figurar en tu política de privacidad.

## 4. EL PUNTO CRÍTICO: transferencias a Z.ai (China/Singapur)

### 4.1 Marco (Capítulo V RGPD)
- Un envío de datos personales a un destinatario fuera del EEE necesita: (a) **decisión de adecuación** (art. 45) o (b) **garantías adecuadas** como las **cláusulas contractuales tipo (SCC)** (art. 46) más una **evaluación de transferencia (TIA)** y, si hace falta, medidas suplementarias (Recomendaciones EDPB 01/2020), o (c) **excepciones** del art. 49 (consentimiento explícito, necesidad contractual puntual…) que son **restrictivas y no para transferencias sistemáticas**. [MEMORIA sobre contenido de esos documentos; EDPB Guidelines 05/2021 sobre la interacción art. 3 / cap. V confirmadas como existentes: https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-052021-interplay-between-application-article-3_es ; versión final 24-feb-2023, SECUNDARIA del resultado de búsqueda]
- **China no tiene decisión de adecuación.** Singapur tampoco [MEMORIA, no verificado hoy contra la lista de la Comisión: https://commission.europa.eu/law/law-topic/data-protection/international-dimension-data-protection/adequacy-decisions_en]. **Un envío a Singapur ya es una transferencia a tercer país** que necesita SCC u otra garantía.
- **EE. UU. (DPF):** vigente para empresas certificadas. El Tribunal General confirmó el DPF el 3-sep-2025 (T-553/23); Latombe apeló el 31-oct-2025 (C-703/25 P), **pendiente** según una fuente de 28-jun-2026. [SECUNDARIA: WilmerHale, Captain Compliance] El DPF **no sirve para Z.ai**, pero sí para Stripe/Cloudflare/Supabase si están certificados (verificar en https://www.dataprivacyframework.gov/). Si el DPF cae, habría que apoyarse en SCC para ellos.
- **Qué pide la jurisprudencia/autoridades sobre China:** la DPC irlandesa multó a TikTok con **530 M€** (2-may-2025: 485 M€ por transferencias a China, 45 M€ por transparencia) porque **no verificó ni demostró que los datos accedidos remotamente desde China recibieran protección esencialmente equivalente, ni evaluó el posible acceso de autoridades chinas** según leyes de seguridad nacional; ordenó adaptar en 6 meses o suspender transferencias. TikTok recurrió; según una fuente secundaria de abril 2026, la High Court irlandesa suspendió la ejecución (14-nov-2025). [OFICIAL: https://www.dataprotection.ie/en/news-media/latest-news/irish-data-protection-commission-fines-tiktok-eu530-million-and-orders-corrective-measures-following ; SECUNDARIA: https://www.simmons-simmons.com/en/publications/cmocwmjy3015eus3gv4sa4fq8/international-data-transfers-implications-of-the-530m-fine-on-tiktok]
- **DeepSeek:** el Garante italiano bloqueó la app (ene-2025) [SECUNDARIA: Computerworld/TechRadar]; la comisionada de Berlín pidió a Apple y Google retirarla en junio de 2025 por transferencias ilegales a China, sin adecuación [SECUNDARIA: https://www.jurist.org/news/2025/06/germany-data-commissioner-orders-apple-and-google-to-remove-deepseek-over-data-concerns]. **No encontré resolución de la AEPD ni de la DPC sobre DeepSeek** [NO VERIFICADO]. Hay una investigación de Corea del Sur que halló transferencia sin consentimiento a empresas chinas (abril 2025) [SECUNDARIA].
- **Lectura práctica:** no existe una prohibición automática de usar un proveedor chino, pero **las autoridades esperan** una TIA documentada del acceso de autoridades chinas; y para un SaaS B2B que procesa correo de terceros, nadie quiere ser el caso de prueba.

### 4.2 Qué dice Z.ai (lo que sí pude leer)
Fuente: https://docs.z.ai/legal-agreement/privacy-policy (actualización 29-sep-2025) y https://docs.z.ai/legal-agreement/terms-of-use, consultados 2026-10-15 con un resumen automático de la página; **revisar los textos íntegros con el abogado**.
- **Quién opera el servicio:** JINGSHENG HENGXING TECHNOLOGY PTE.LTD, Singapur ("The Services are provided and controlled by…"). Zhipu Beijing opera aparte los servicios de China continental. [OFICIAL + SECUNDARIA para la relación con Zhipu: Silicon UK, 36Kr]
- **Ubicación:** "your personal data is generally processed in Singapore", pero puede tratarse fuera de tu jurisdicción por afiliadas y terceros "using safeguards and recognized transfer mechanisms". [OFICIAL] No dice si afiliadas chinas pueden acceder.
- **Retención API:** su **Data Processing Addendum for API Services** dice que la compañía **no almacena el contenido** que cliente y usuarios finales proporcionan y que se procesa en tiempo real; otros datos del cliente se borran tras la terminación. En el addendum, **el cliente es responsable (controller) y Z.ai encargado (processor)**. [OFICIAL parcial: lo leí en la página de política; **no pude abrir el DPA completo**]
- **Entrenamiento:** la política de privacidad para usuarios individuales **no deja claro** si prompts y contenidos se usan para entrenar y lo menciona como interés legítimo para "train and improve our models" con datos de cuenta, comunicaciones, logs y uso. Los **Términos** dicen que para empresas y desarrolladores API, "we will not use your User Content for developing or improving Services unless you explicitly agree", pero ese texto aparece **entre corchetes** en las Additional Terms, lo que sugiere plantilla: **pedir confirmación escrita**. [OFICIAL parcial]
- **Ley y foro:** ley de Singapur y arbitraje SIAC con sede en Singapur. [OFICIAL]
- **Derechos:** reconoce acceso, portabilidad, supresión, rectificación, oposición, limitación. [OFICIAL]
- **Representante UE:** no mencionado. [OFICIAL parcial]
- **GDPR:** los Términos no lo mencionan. [OFICIAL parcial]
- **SCC / subencargados / región UE:** **[NO VERIFICADO]**. No encontré evidencia pública de región UE ni de SCC.
- **Noticias:** en septiembre de 2026 prensa china habló de una opción "sin retención de datos" de Zhipu [SECUNDARIA]; un incidente de ZCode subió datos de desarrolladores por defecto sin opt-out y se disculparon [SECUNDARIA: Silicon UK]. **Estas dos señales empujan en direcciones opuestas.** Pedir a Z.ai por escrito la configuración "zero retention" para tu cuenta.
- **Mercado único:** Zhipu y Z.ai están sujetas a leyes chinas (Ley de Inteligencia Nacional, PIPL y de seguridad de datos) [MEMORIA]; la TIA debe razonar el riesgo de acceso por afiliadas chinas.

### 4.3 Alternativas realistas (ordenadas de menos a más cambio)

| # | Alternativa | Qué resuelve | Qué NO resuelve | Esfuerzo |
|---|---|---|---|---|
| 1 | **Modo "sin IA externa"** (toggle por defecto en España/B2B): la app sigue sincronizando y funcionando sin enviar contenido a Z.ai | Elimina la transferencia para quien no quiera IA | La IA es el valor del producto | Bajo |
| 2 | **Minimización/anonimización antes de enviar**: no enviar adjuntos ni cuerpos de Gmail por defecto; filtrar NIF, IBAN, emails, teléfonos, nombres con detector local; avisar de "datos personales detectados" | Reduce lo enviado; si el dato es realmente anónimo deja de ser dato personal (considerando 26), pero **la seudonimización no basta** | Redactar en contexto siempre deja residuos | Medio |
| 3 | **GLM de pesos abiertos alojado en la UE** por un proveedor europeo, contrato DPA y SCC no necesarios si no sale del EEE | Quita la transferencia y el acceso chino al dato | Calidad/coste distintos a la API oficial; el proveedor europeo es subencargado nuevo; algunas versiones de GLM tienen licencias distintas (una fuente dice MIT para GLM-5.x y "glm-4" para 4.6) | Medio-alto |
| 4 | **Consentimiento explícito** (art. 49.1.a) | Útil como complemento para individuos B2C | **No sirve para transferencias sistemáticas ni en B2B**, donde el responsable es el cliente | Bajo, pero frágil |
| 5 | **Z.ai con DPA + SCC + TIA + zero retention + confirmación por escrito** | Posible y defendible si Z.ai firma | Z.ai puede negarse a firmar SCC; el riesgo de acceso estatal persiste | Medio |

- **Proveedores UE de GLM:** una fuente (Eurouter) afirma GLM 4.6 con residencia UE; otra dice Scaleway lo ofrece para GLM-5.2 a unos 2,5 USD por millón de tokens; ninguna es del propio proveedor. **[NO VERIFICADO]** Comprobar en las webs de Scaleway, OVHcloud, IONOS, Nebius, Mistral/La Plateforme. Pedir: región UE, sin retención de prompts, DPA, sin entrenamiento, ficha del modelo y licencia en Hugging Face.
- **También:** el repo ya tiene una arquitectura que permite llevar la **propia clave del usuario** de otro proveedor. Si el cliente elige proveedor, la responsabilidad se desplaza al cliente (revisar con abogado cómo cuenta eso para tu contrato y avisos).

### 4.4 Recomendación (con riesgos)
1. **Para España, B2B y B2C: por defecto, GLM de pesos abiertos alojado en la UE (alternativa 3) o "sin IA externa" (1) hasta tenerlo.** Z.ai (5) solo si firma DPA + SCC y la TIA sale razonable.
2. **Hasta entonces, no enviar a Z.ai** cuerpos de Gmail, adjuntos ni documentos con datos de terceros de clientes españoles.
3. **Confirmar el host** (api.z.ai vs open.bigmodel.cn) y poner ese dato en la TIA. Si el tráfico llega a infraestructura en China continental, la situación es la del caso TikTok.
4. **Actualizar la política de privacidad** cuando el abogado cierre los puntos anteriores: hoy dice "Z.ai (Zhipu AI), empresa china" y es honesta, pero no cita garantías ni representante.
5. **Riesgos si no se hace:** multa de hasta 20 M€ o 4 % del volumen mundial por incumplir las normas de transferencias (art. 83.5 RGPD, [MEMORIA]); orden de suspensión de transferencias (art. 58.2.j); bloqueo comercial de clientes que revisen proveedores; reclamaciones de afectados ante la AEPD.
6. **Calidad percibida:** el producto se hizo para GLM; un cambio de host puede alterar costes y latencia. Medirlo antes.

## Pasos numerados
1. (Dev, 1-2 días) Documento técnico: qué datos salen al proxy, host real, qué se registra en Cloudflare/Supabase, qué datos de Gmail/adjuntos viajan, controles de usuario hoy.
2. (JM, 1-3 semanas) Escribir a Z.ai (sales/legal) pidiendo: DPA firmable con SCC (módulo 3 si tú eres encargado, módulo 2 si responsable), lista de subencargados, región de inferencia, confirmación de no retención y no entrenamiento para API, representante UE, respuesta sobre acceso de afiliadas chinas.
3. (Abogado, 1-3 semanas) TIA y EIPD; redactar DPA de encargado para clientes; lista de subencargados; política de privacidad y registro de actividades.
4. (Dev, 2-4 semanas) Opción "sin IA externa" + filtro de PII + desactivar adjuntos/Gmail a IA externa por defecto para ES; evaluar proveedor UE de GLM.
5. (JM, 1-2 semanas) Contratar representante UE (art. 27) o crear entidad UE.
6. (Abogado + JM, antes de lanzar) Revisión final y decisión Go/No-Go.

## Entradas que necesitas
Diagrama de flujo de datos; capturas de las pantallas de consentimiento; contratos/ToS de Stripe, Supabase, Cloudflare, Google; términos de Z.ai y respuesta escrita; lista de conectores que acceden a datos de terceros.

## Costo y plazo (estimaciones mías salvo citas)
- Abogado de protección de datos para EIPD + TIA + DPA + política: 3.000-8.000 € y 3-6 semanas (estimación mía).
- Representante UE: 600-2.500 €/año (rango deducido de las tarifas públicas citadas).
- Proveedor UE de GLM: coste por token similar al oficial según una fuente secundaria; sin cifras fiables. [NO VERIFICADO]
- Desarrollo del filtro y modo sin IA: 2-4 semanas de dev (estimación mía).

## Riesgos
- Z.ai no firma SCC o no responde: el camino queda cerrado; hay que ir a la alternativa 3.
- TIA concluye que el riesgo de acceso estatal es alto: sin medidas suplementarias (cifrado con claves solo en el cliente no es viable para inferencia en claro).
- Cambios en DPF (C-703/25 P) afectan a otros subencargados.
- Un cliente enterprise audita y pide excluir IA de proveedores chinos (ocurre).
- Duplicidad: mantener dos proveedores complica soporte y facturación.

## Enlaces
- Política de privacidad de Z.ai: https://docs.z.ai/legal-agreement/privacy-policy (2026-10-15)
- Términos de Z.ai: https://docs.z.ai/legal-agreement/terms-of-use (2026-10-15)
- DPC / TikTok: https://www.dataprotection.ie/en/news-media/latest-news/irish-data-protection-commission-fines-tiktok-eu530-million-and-orders-corrective-measures-following (2026-10-15)
- Berlín / DeepSeek: https://www.jurist.org/news/2025/06/germany-data-commissioner-orders-apple-and-google-to-remove-deepseek-over-data-concerns (2026-10-15)
- DPF / Latombe: https://www.wilmerhale.com/en/insights/blogs/wilmerhale-privacy-and-cybersecurity-law/20251201-european-court-of-justice-to-review-challenge-to-eu-us-data-privacy-framework (2026-10-15)
- EDPB Guidelines 05/2021: https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-052021-interplay-between-application-article-3_es
- Representantes UE: https://prighter.com/product/gdprrep/services ; https://www.privacyengine.io/ ; https://itgovernance.co.uk/shop/product/gdpr-eu-representative
- AEPD (autoridad): https://www.aepd.es
