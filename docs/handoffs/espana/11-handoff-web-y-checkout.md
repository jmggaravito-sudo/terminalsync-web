No es asesoría legal. Fecha: 2026-10-15

# Handoff para el repo web (`terminalsync-web`): España

Contexto y evidencia: `docs/handoffs/espana/10-auditoria-producto.md`. Los textos legales los redacta y valida el abogado (ver `13-handoff-textos-legales-es-ES.md`); aquí solo van las tareas de código y de configuración.

Reglas del repo que aplican a todas las tareas: rama desde `main`, PR contra `main`, un PR por tarea (o por grupo marcado), sin tocar el repo de la app. Cada PR que cambie lo que la app consume (catálogo, precios, textos legales enlazados) debe decirlo en el cuerpo; los que no, escriben `App PR: no aplica — la app consume el catálogo`.

Orden recomendado: W1 y W2 primero (son bloqueantes y no dependen del abogado), luego W3 a W6 en paralelo, después W7 a W12.

## W1. Consentimiento de cookies real en todo el sitio (Bloqueante)

Problema: la home se sirve desde HTML estático sin banner y con Vercel Insights; el resto del sitio carga Analytics y Speed Insights sin consentimiento.

Archivos a tocar:
- `src/app/layout.tsx`: quitar `<Analytics />` y `<SpeedInsights />` del render incondicional; envolverlos en un componente cliente `ConsentGate` que los monte solo si el consentimiento incluye analítica.
- `src/components/analytics/CtaTracker.tsx`: no registrar eventos (`track`) sin consentimiento de analítica.
- `public/landing-b/index.html` (líneas 895-896): quitar el script `/_vercel/insights/script.js` y la cola `window.va`; cargarlos solo desde un script de consentimiento.
- `public/landing-b/index.html` y `src/middleware.ts` (líneas 11-23): la home rewriteada necesita el banner. Opciones: (a) añadir en el HTML estático un `<script src="/consent.js">` que pinte el banner y gestione el estado; (b) dejar de reescribir y servir la landing con el layout de Next. Elegir (a) salvo que ya haya plan de eliminar `LANDING_B`.
- `src/components/CookieBanner.tsx`: mover el montaje al layout global (`src/app/[lang]/layout.tsx`), no a cada página; reescribir con tres botones del mismo peso visual ("Aceptar todas", "Rechazar todas", "Configurar"), panel de categorías (necesarias, analítica, afiliados), guardar `{ version, fecha, categorias }` y enlace permanente "Configurar cookies" en el pie de página (`src/components/landing/Footer.tsx`).
- `src/components/RewardfulLoader.tsx` y `src/components/StickyDownloadCTA.tsx`: leer el nuevo formato de consentimiento (hoy leen la clave `terminalsync:cookie-consent-v1` con valores `accepted`/`necessary`). Mantener compatibilidad con el valor antiguo durante una versión.
- Textos del banner: los redacta el abogado (documento 13, apartado cookies). El texto actual afirma "sin tracking" y deja de ser cierto.

Criterio de hecho:
- En una ventana privada, con las herramientas de red abiertas, `/es`, `/en`, `/es/connectors` y `/es/legal/privacy` no hacen ninguna petición a `/_vercel/insights`, `va.vercel-scripts.com` ni `r.wdfl.co` antes de pulsar "Aceptar".
- "Rechazar todas" está visible a la primera, con el mismo tamaño que "Aceptar todas".
- Tras aceptar y recargar no reaparece; tras "Configurar cookies" en el pie se puede cambiar.
- Test (Vitest) del `ConsentGate` y de la migración del valor antiguo.

## W2. Sentry, fuentes y scripts de terceros (Alta)

Archivos:
- `src/instrumentation-client.ts`: inicializar Sentry solo con consentimiento de "análisis/errores", o sin Replay: poner `maskAllText: true`, `blockAllMedia: true` y quitar `replaysOnErrorSampleRate` hasta que el abogado decida. Si Sentry se queda como "estrictamente necesario", documentarlo en la política.
- `instrumentation.ts` (servidor): confirmar que no envía IP ni cuerpo de peticiones (`sendDefaultPii` ausente = falso; verificar).
- `src/app/layout.tsx` (líneas 89-92) y `public/landing-b/index.html` (líneas 9-11): autoalojar Geist y Geist Mono (`next/font/local` o archivos en `public/fonts`) y quitar `fonts.googleapis.com` y `fonts.gstatic.com`.
- `public/landing-b/index.html` (línea 12): autoalojar `lucide` en lugar de `unpkg.com`.

Criterio de hecho: la pestaña Red no muestra ningún dominio de terceros en la carga inicial salvo los autorizados en la política de cookies; Sentry no envía replays con texto en claro.

## W3. Páginas legales nuevas y estructura en el sitio (Bloqueante)

Archivos (nuevas rutas bajo `src/app/[lang]/legal/`, con `LegalShell` como las existentes):
- `aviso-legal/page.tsx` (es-ES y es-equivalente en inglés "legal-notice")
- `cookies/page.tsx`
- `subprocessors/page.tsx` (lista de subencargados con finalidad, ubicación, mecanismo de transferencia y fecha de cambio; leer los datos de un archivo `src/content/subprocessors.ts` para que sea fácil de mantener)
- `dpa/page.tsx` (texto y descarga; ver W4)
- `ai/page.tsx` (página "Cómo funciona la IA de TerminalSync": proveedor, qué datos se envían, dónde, retención, cómo desactivar o minimizar; hoy `Términos` sección 6 enlaza a `/es/ai` que no existe)
- `src/app/sitemap.ts` (líneas 59-63): añadir las rutas nuevas.
- `src/components/landing/Footer.tsx` (líneas 102-115): enlaces a aviso legal, cookies, subencargados, DPA, "Configurar cookies". También añadirlos a `public/landing-b/index.html` línea 730 (pie estático).
- `src/content/es.ts`, `src/content/en.ts`, `src/content/types.ts`: etiquetas del pie.

Criterio de hecho: las cinco rutas devuelven 200 en `/es` y `/en`, enlazadas desde ambos pies, con fecha de versión visible y sin placeholders; el enlace `/es/ai` de Términos funciona.

Dependencia: textos del abogado (documento 13). Se puede mergear la estructura con texto "borrador, pendiente de validación" solo detrás de una variable de entorno que mantenga las rutas ocultas del sitemap y sin enlaces hasta tener texto final.

## W4. DPA descargable (Bloqueante para empresas)

Archivos:
- `legal/dpa.es-ES.md`, `legal/dpa.en.md` (fuente, como `legal/affiliates.*.md`).
- `src/app/[lang]/legal/dpa/page.tsx`: render del texto y botón "Descargar PDF".
- `src/app/api/legal/dpa/route.ts`: genera o sirve el PDF versionado (cabecera con versión y fecha).
- Formulario de solicitud de DPA firmado (email `privacy@terminalsync.ai`, sin recoger datos más allá de nombre de empresa y email).

Criterio de hecho: descarga un PDF con número de versión; el anexo de subencargados lee la misma fuente que W3 (`src/content/subprocessors.ts`).

## W5. Mercado España: moneda EUR y precios con IVA (Bloqueante)

Esta tarea mezcla código y panel de Stripe. Primero el panel (lo hace JM o quien administre la cuenta; el worker no toca claves):
1. En Stripe, añadir precios en EUR a los productos Pro con IA y Max con IA (`currency_options` en el mismo price o precios nuevos), `tax_behavior: "inclusive"` para EUR. Decidir el importe en EUR (no es conversión automática).
2. Registrar el IVA de la UE en Stripe Tax (OSS no-UE o registro en España; lo decide el asesor fiscal) y confirmar que `automatic_tax` calcula 21 % para España.
3. Activar SEPA Direct Debit y tarjetas en la configuración de métodos de pago.

Código:
- `src/lib/stripe.ts` (líneas 60-86): añadir lectura de ids EUR (`STRIPE_PRICE_PRO_WITH_AI_MONTHLY_EUR`, `STRIPE_PRICE_MAX_WITH_AI_MONTHLY_EUR`) o usar `currency_options`, y una función `priceIdFor(plan, currency)`.
- `src/app/api/checkout/route.ts`: aceptar `currency: "eur" | "usd"` (derivado de país del cliente, nunca de un parámetro no validado), pasar `currency` a `checkout.sessions.create`, `locale: "es"` para España, y los parámetros de W6.
- `src/app/api/credits/checkout/route.ts` (líneas 123-142): `currency` EUR, `tax_behavior: "inclusive"` en `price_data`, `automatic_tax: { enabled: true }`, `invoice_creation: { enabled: true }`, `billing_address_collection: "required"`.
- `src/lib/useGeoCurrency.ts`: ampliar `Currency` a `"USD" | "COP" | "EUR"` y mapear países de la zona euro (al menos `ES`) usando `/api/geo`; mantener el interruptor de Mercado Pago como está.
- `src/components/landing/Pricing.tsx` y `src/content/es.ts` (líneas 483-536) y `src/content/en.ts`: precio en EUR con "IVA incluido" para consumidores y nota de "IVA no incluido / con NIF intracomunitario" para empresas según decida el asesor.
- `public/landing-b/i18n.js`: si la landing estática muestra precios, igual.
- Tests: ampliar `src/app/api/checkout/route.test.ts`, `src/app/api/credits/checkout/route.test.ts`, `src/lib/useGeoCurrency.test.ts`.

Criterio de hecho: un visitante con IP de España ve el precio en EUR con IVA incluido; Checkout de prueba (modo test de Stripe) muestra EUR, desglose de IVA y ofrece SEPA además de tarjeta; los créditos muestran IVA y generan factura.

## W6. NIF/CIF y facturas con datos fiscales (Bloqueante para empresas)

Archivos:
- `src/app/api/checkout/route.ts`: añadir `tax_id_collection: { enabled: true }`, `customer_update: { name: "auto", address: "auto" }` y `billing_address_collection: "required"` cuando el mercado sea UE; mantener `automatic_tax`.
- `src/app/api/credits/checkout/route.ts`: mismo bloque.
- `src/app/api/billing/portal/route.ts`: confirmar en el panel que el portal permite editar NIF y dirección fiscal (`docs/stripe-portal-setup.md`: añadir ese requisito).
- `src/app/api/webhooks/stripe/route.ts`: persistir `customer.tax_ids` del cliente en `subscriptions` o tabla equivalente solo si el asesor lo pide; si no, no guardar.
- `docs/stripe-portal-setup.md`: documentar la configuración (campos fiscales, plantilla de factura con dirección y registro de la LLC y número de IVA).

Criterio de hecho: en Checkout de prueba aparece el campo "Soy una empresa / NIF" y la factura PDF lleva nombre fiscal, dirección y NIF del cliente.

## W7. Derecho de desistimiento y cancelación visibles (Alta)

Archivos:
- `src/components/landing/CheckoutButton.tsx` y `src/app/api/checkout/route.ts`: en Checkout añadir `consent_collection.terms_of_service: "required"` y `custom_text.terms_of_service_acceptance.message` con el texto del abogado (aceptación de términos y de que el servicio digital empieza al contratar, con la excepción de desistimiento que corresponda).
- `src/app/[lang]/billing/` (página de facturación existente): botón claro de cancelar y enlace a información de desistimiento.
- `src/app/[lang]/checkout/success/page.tsx`: confirmación con resumen del contrato y enlace al formulario de desistimiento.
- Email de confirmación: `emails/` (nuevo `contract-confirmation.tsx` siguiendo `emails/_layout.tsx`), con datos del prestador y plazo de desistimiento.

Criterio de hecho: sin marcar la casilla de términos no se puede pagar; el email llega con identificación del prestador y condiciones.

## W8. Variante de idioma es-ES (Alta)

Archivos:
- `src/content/index.ts` (líneas 5-6): añadir `es-ES` como tercer locale o, más barato, mantener `es` y crear un diccionario de sobrescritura `src/content/es-ES.ts` que solo cambie lo distinto.
- `src/middleware.ts` (líneas 78-91): detección por `Accept-Language` (`es-ES`) y por país (`x-vercel-ip-country = ES`); ofrecer sugerencia de cambio sin forzarla.
- `src/app/[lang]/layout.tsx` (línea 41): `locale: "es_ES"` solo para el locale español de España; el resto `es_419`/`es_LA` según se decida; añadir `hreflang es-ES`, `es-419` y `en`.
- `src/app/layout.tsx`: el `bootScript` fija `lang` en `es`/`en`; ajustar.
- `src/lib/userLang.ts` (líneas 4-15): ampliar `EmailLang` o añadir variante.
- Revisión de tuteo y léxico (ordenador, móvil, vosotros opcional, "tú" en este proyecto): `src/content/es.ts`, `public/landing-b/i18n.js`, `emails/*.tsx`, `src/app/[lang]/legal/*`.

Criterio de hecho: `/es-ES` (o variante equivalente) sin voseo ni "computadora/celular/plata"; `hreflang` correctos verificados con el validador de Search Console; test que falle si aparece voseo en el diccionario es-ES.

## W9. Borrado completo y exportación de datos (Alta)

Archivos:
- `src/app/api/cron/purge-deleted-accounts/route.ts` (líneas 68-85): al purgar, además de `auth.admin.deleteUser`: eliminar o anonimizar el cliente en Stripe (`stripe.customers.del` solo si no hay obligación de conservar facturas; si la hay, desasociar datos de contacto no necesarios), borrar `support_conversations` del usuario, y dejar de guardar el email en `audit_log.metadata` (guardar un hash).
- `src/app/api/account/export/route.ts` (nuevo): `GET` autenticado que devuelve un JSON o ZIP con perfil, suscripciones, `audit_log` propio, tickets y conversaciones de soporte del usuario; límite de uso y registro de la petición.
- `src/app/[lang]/billing/` o página de cuenta: botón "Descargar mis datos".
- `src/app/[lang]/legal/data-deletion/page.tsx`: ajustar el texto a lo que realmente se borra, una vez implementado.
- `supabase/migrations/00NN_*.sql`: migración para las columnas o tablas nuevas.

Criterio de hecho: prueba en entorno de staging: crear usuario, comprar con tarjeta de prueba, abrir ticket, solicitar borrado, avanzar el reloj 30 días, ejecutar el cron y comprobar que no queda el email en claro en ninguna tabla propia; la exportación entrega los mismos datos que muestra la política.

## W10. Conectores: España en `markets` (Media)

Archivos: `content/connectors/{es,en}/*.md` (campo `markets`), `src/lib/markets.ts` (ya incluye `ES`), `src/app/[lang]/admin/integraciones/por-pais/`.
- Revisar con evidencia (documentación pública del proveedor) cuáles de los 59 `GLOBAL` funcionan en España y si exigen elegir región UE (Intercom y PostHog), y añadirlo a la ficha como nota de residencia de datos.
- Añadir fichas de conectores españoles en este orden: Holded, Quipu, Billin, Factorial, Sage/Contasol, Redsys o Bizum si hay MCP o API pública, siguiendo `docs/connector-curation-loop.md` y `docs/integration-pipeline.md`, con `markets: ["ES"]` o la lista correcta. No inventar disponibilidad.
- Si hace falta filtrar por país en la app, añadir `country` al catálogo (`src/app/api/marketplace/catalog/route.ts`) y avisar en el PR que la app debe consumirlo (la app hoy ignora `markets`).

Criterio de hecho: el admin "por país" muestra ES con al menos 5 conectores con evidencia enlazada; `src/lib/markets.test.ts` y `src/lib/connectors.test.ts` en verde.

## W11. Soporte y contacto para España (Media)

Archivos: `agent/web/widget.js` se mantiene en el repo de la app (ver documento 12); en web: `src/app/[lang]/faq/page.tsx`, `src/content/faq.ts`, `src/components/landing/Footer.tsx`.
- FAQ específica de España (IVA, factura con NIF, SEPA, desistimiento, dónde se tratan los datos).
- Horario y zona horaria de atención en el pie y en la FAQ, y un correo de reclamaciones.
- Cambiar `Escribinos por WhatsApp` y el saludo de `src/components/landing/WhatsAppFloatingButton.tsx` a tuteo.

Criterio de hecho: FAQ con las cinco entradas; sin voseo.

## W12. Correos: identificación y base legal (Media)

Archivos: `emails/_layout.tsx` (pie con datos del prestador, motivo del envío y enlace de baja conforme a la LSSI, no solo CAN-SPAM), `src/lib/email.ts`.

Criterio de hecho: todos los correos transaccionales y de marketing llevan identificación del remitente y baja en un clic.
