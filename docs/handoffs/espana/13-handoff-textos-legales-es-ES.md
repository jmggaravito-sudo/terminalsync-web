No es asesoría legal. Fecha: 2026-10-15

# Textos legales en español de España: qué hay que redactar

Este documento no contiene texto legal final. Son estructuras y listas de decisiones para que un abogado con ejercicio en España (protección de datos, consumo y comercio electrónico) redacte, valide o rechace cada pieza. Donde ponga "decisión del abogado" es una pregunta abierta, no una recomendación.

Datos de entrada que el equipo debe preparar antes de la reunión con el abogado:
- Datos registrales de la sociedad que presta el servicio. Hoy solo consta "Marca E-commerce LLC, Florida, sede en Miami" (Términos sección 1) y la dirección operativa de la LLC aparece en documentación interna, no en el sitio. Decidir si presta el servicio la LLC o se constituye una entidad en la UE, y si hace falta representante en la UE (RGPD art. 27).
- Mapa de subencargados con país, finalidad y contrato (ver apartado 3). Fuente: `docs/decision-ia-unica-terminalsync.md` línea 296 (Z.ai, Google imagen, WaveSpeed, Ideogram, Supabase, Cloudflare) más Stripe, Vercel, Resend, n8n, Rewardful, SearchApi, Sentry si sigue activo.
- Lista de datos que salen de la app (tarea A9 del documento 12).
- Estado fiscal: registro de IVA UE (OSS) y modelo de facturación (documento 11, W5 y W6).
- Textos actuales como punto de partida: `src/app/[lang]/legal/privacy/page.tsx`, `terms/page.tsx`, `data-deletion/page.tsx`, `security/page.tsx`, `src/app/privacy/page.tsx` (política de datos de Google, en inglés).

Estilo pedido: español de España, tuteo, frases cortas, sin voseo ("puedes", "escríbenos"), "ordenador" y no "computadora", sin LatAmismos.

## 1. Aviso legal (LSSI art. 10)

Estructura:
1. Identificación del prestador: denominación social, domicilio, correo, datos registrales, número de identificación fiscal (decisión del abogado: qué entidad y qué campos son obligatorios para un prestador no establecido en España).
2. Objeto y condiciones de acceso al sitio.
3. Propiedad intelectual e industrial (marcas, código, contenido de terceros y conectores).
4. Enlaces a terceros y responsabilidad.
5. Ley aplicable y jurisdicción para el sitio (distinguir de los Términos del servicio).
6. Contacto y canal de reclamaciones.

Preguntas: obligación de mostrar el NIF si la entidad no es española; texto para sociedad extranjera.

## 2. Política de privacidad (RGPD arts. 13 y 14)

Reestructurar la actual en este orden, una sección por punto:
1. Responsable del tratamiento: identidad, dirección, contacto, representante en la UE (si aplica), delegado de protección de datos (si aplica).
2. Tabla de tratamientos: categoría de datos, finalidad, base jurídica (ejecución del contrato, interés legítimo, consentimiento, obligación legal), plazo de conservación, destinatarios. Filas mínimas: cuenta y autenticación; facturación y cobro; uso de la IA incluida (prompts, archivos del panel de Contexto, conversación previa, memoria); Inbox (correos importados); soporte (bot y tickets, 90 días); analítica y cookies; afiliados; marketing por email.
3. Destinatarios y subencargados (enlace a la página de subencargados).
4. Transferencias internacionales: por cada subencargado fuera del EEE, el mecanismo (decisión de adecuación, cláusulas contractuales tipo, otras garantías), la evaluación de la transferencia, y copia o enlace a las garantías. Para Z.ai (China) hay que decidir si la transferencia es viable y bajo qué condiciones; la política actual solo informa del hecho (sección 5).
5. Decisiones automatizadas y elaboración de perfiles: explicar que la IA genera contenido pero no toma decisiones con efectos jurídicos sobre la persona (decisión del abogado si procede esta frase).
6. Derechos (acceso, rectificación, supresión, limitación, portabilidad, oposición, retirada del consentimiento), cómo ejercerlos, plazo de un mes, formulario o email, y derecho a reclamar ante la Agencia Española de Protección de Datos.
7. Conservación por categoría (sustituir "7 años fiscal" por el plazo español que indique el abogado) y qué ocurre al borrar la cuenta.
8. Edad mínima (decisión del abogado: 14 años como límite legal para consentimiento de datos, o 18 para contratar).
9. Cookies y tecnologías similares: remite a la política de cookies.
10. Seguridad (resumen y enlace).
11. Cambios de la política y modo de notificarlos.

Contradicciones a resolver en el texto (hechos verificados en el código):
- La política dice que los correos importados se guardan en el equipo; la app dice que el Inbox los guarda en servidores de TS hasta N días (clave `inbox.privacyStorageRetention`). Alinear tras A5 del documento 12.
- La política dice "NUNCA toca nuestros servidores" para contenido de terminales; en la IA incluida el contenido pasa por el Worker de TS y llega al proveedor. La frase debe delimitarse.
- Sentry con Session Replay y Google Fonts no aparecen; decidir si se eliminan (documento 11, W2) o se declaran.

## 3. Página de subencargados

Estructura: tabla con proveedor, finalidad, categorías de datos, ubicación del tratamiento, mecanismo de transferencia, enlace al contrato, y fecha de alta. Sección sobre cómo se avisa de cambios y cómo oponerse (plazo y consecuencias). Decisión del abogado: aviso previo con X días y derecho a rescindir.

## 4. Contrato de encargado de tratamiento (DPA, RGPD art. 28)

Para clientes empresa que usan TS para tratar datos de terceros. Estructura:
1. Partes, objeto y duración; instrucciones documentadas.
2. Categorías de datos e interesados (dejar anexo para completar por cliente).
3. Obligaciones del encargado (confidencialidad, seguridad, subencargados con autorización general o específica, asistencia en derechos, brechas con plazo de notificación, borrado o devolución al terminar, auditorías).
4. Medidas de seguridad (anexo): cifrado AES-256-GCM de secretos, memoria y conversaciones en la nube del cliente (según `security/page.tsx`), control de acceso, copias, etc. Solo afirmar lo verificable.
5. Transferencias internacionales y cláusulas tipo (módulo 2 y 3 según el caso).
6. Anexo de subencargados (misma fuente que la página de subencargados).
7. Responsabilidad y ley aplicable.

Pregunta clave: ¿TS actúa como encargado cuando el cliente envía a la IA datos de sus propios clientes? ¿O como responsable independiente para sus propios fines (facturación, seguridad)? Y el DPA con Z.ai: no hay constancia en los repos de que exista; `docs/decision-ia-unica-terminalsync.md` línea 323 lo deja como pregunta abierta.

## 5. Términos del servicio para consumidores y empresas en la UE

Reordenar los actuales (`terms/page.tsx`) con estas secciones nuevas o reescritas:
1. Identificación del prestador y de la persona usuaria (consumidor/empresa).
2. Información precontractual: características del servicio, precio total con impuestos, duración, renovación automática, cómo cancelar.
3. Derecho de desistimiento de 14 días: texto, excepción del contenido digital si se aplica con consentimiento expreso, formulario modelo de desistimiento, efecto de la prueba gratuita de 7 días (`src/lib/stripe.ts`, `TRIAL_DAYS = 7`). Hoy los Términos ofrecen reembolso del 100 % durante 30 días tras el primer cobro (sección 5): decidir si se mantiene como garantía comercial adicional.
4. Garantía legal de conformidad de contenidos y servicios digitales.
5. Créditos prepago (vencimiento a 12 meses, `terms/page.tsx` sección 8): el abogado debe valorar si el vencimiento es válido frente a consumidores.
6. IA: qué hace, limitaciones, responsabilidad del usuario sobre el uso, contenido generado y su titularidad, aviso de proveedor y de tratamiento fuera de la UE (remite a la página de IA).
7. Uso aceptable, suspensión y terminación.
8. Limitación de responsabilidad (la actual limita a 12 meses de pago; validar frente a normas imperativas de consumo).
9. Ley aplicable y jurisdicción: sustituir Florida y Miami-Dade para consumidores UE por la ley del país de residencia habitual y los tribunales de su domicilio; solución de controversias en línea y datos de reclamaciones. Decisión del abogado: si los empresarios también quedan fuera de Florida.
10. Modificaciones (30 días de aviso ya existe).
11. Edad mínima.

## 6. Política de cookies (LSSI art. 22.2 y guía de la AEPD)

Estructura:
1. Qué son y para qué sirven.
2. Tabla: nombre, proveedor, finalidad, duración, categoría (técnica / analítica / afiliados), si es propia o de tercero. Filas mínimas hoy: preferencia de idioma y tema (`localStorage` `terminalsync:theme`), consentimiento (`terminalsync:cookie-consent-v1`), cookie de origen de la landing `tsync_landing` (30 días, la fija `src/middleware.ts`), Rewardful (60 días), Vercel Web Analytics y Speed Insights, Sentry (si se mantiene), cookies de sesión de Supabase (`sb-*`).
3. Cómo dar, rechazar y retirar el consentimiento; enlace a "Configurar cookies" en el pie.
4. Plazo de renovación del consentimiento (decisión del abogado).
5. Cómo borrar cookies en navegadores.

Texto del banner (breve, con tres botones del mismo peso: Aceptar, Rechazar, Configurar) y del panel de configuración. Decisión del abogado: si Vercel Web Analytics puede considerarse exento de consentimiento o requiere banner.

## 7. Aviso de consentimiento de transferencia a la IA (en la app y en la web)

Texto corto, para mostrar antes del primer mensaje (documento 12, A1) y como página `/ai` en la web. Contenido obligatorio:
1. Qué se envía: mensaje, archivos del panel de Contexto activos, conversación previa del espacio, memoria necesaria, adjuntos.
2. Quién lo procesa y dónde (nombre del subencargado, país).
3. Para qué (generar la respuesta) y qué no se hace (no se vende, no se usa para entrenar modelos propios; el abogado valida qué se puede afirmar según el contrato real del proveedor).
4. Cuánto tiempo lo conserva el proveedor y TS (el Worker no guarda contenido: `services/glm-courtesy-proxy/src/ai_usage.ts`; el proveedor: dato a obtener).
5. Riesgo de la transferencia fuera del EEE y garantías aplicadas.
6. Cómo retirar el consentimiento y qué pasa después.
7. Recomendación de no enviar categorías especiales de datos (salud, etc.) ni datos de terceros sin base.

Pregunta: ¿consentimiento explícito (art. 49.1.a RGPD) para la transferencia o basta con garantías adecuadas? Depende del mecanismo que se elija para el proveedor.

## 8. Aviso de transparencia sobre IA (Reglamento de IA, art. 50)

Textos cortos para: (a) cabecera del chat de soporte ("Estás hablando con un asistente automatizado; puedes pedir hablar con una persona"); (b) etiqueta de contenido generado (imágenes y vídeo); (c) respuesta del bot sobre quién procesa los datos. Decisión del abogado: qué obligaciones aplican a TS como proveedor y cuáles al cliente como desplegador, y plazos de aplicación.

## 9. Cláusulas de comunicaciones comerciales y correos

Pie de correo con identificación del remitente, motivo del envío, y baja (LSSI art. 21). Texto de consentimiento para marketing por email (formulario de la landing: `src/content/es.ts` `privacyNote`: "Sin spam, sin cesión a terceros"; revisarlo).

## 10. Información fiscal y de facturación

Texto de la página de precios (IVA incluido para consumidores; IVA excluido o inversión del sujeto pasivo para empresas con NIF intracomunitario válido) y texto de la casilla en Checkout (W7 del documento 11). Decisión del asesor fiscal, no solo del abogado.

## 11. Textos para el bot y la FAQ

Respuestas aprobadas sobre: quién procesa mis datos, dónde, cómo ejercer mis derechos, cómo desistir, cómo cancelar, factura con NIF, SEPA. Se cargan en `docs/support-knowledge/catalog/*.yaml` del repo de la app (documento 12, A3) y en `src/content/faq.ts` de la web.

## Lista de decisiones abiertas para la reunión

1. Qué entidad presta el servicio en la UE y si hace falta representante.
2. Mecanismo de transferencia a Z.ai y a cada subencargado no UE; si se ofrece un upstream en la UE.
3. Base jurídica del tratamiento de contenido de chats y de archivos de terceros.
4. Plazos de conservación aplicables en España.
5. Edad mínima.
6. Régimen del desistimiento en servicios digitales con prueba gratuita.
7. Validez del vencimiento de créditos frente a consumidores.
8. Qué analítica queda exenta de consentimiento.
9. Papel de TS (encargado o responsable) según el caso.
10. Si Sentry y Vercel Analytics se mantienen y bajo qué categoría.
