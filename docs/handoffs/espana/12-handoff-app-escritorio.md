No es asesoría legal. Fecha: 2026-10-15

# Handoff para el repo de la app de escritorio (`terminal-sync`): España

Contexto y evidencia: `docs/handoffs/espana/10-auditoria-producto.md` (punto 5, 6 y 7). Este documento está redactado para un worker de `terminal-sync`. Las rutas son relativas a la raíz de ese repo en `origin/release/v0.2.18-lab` (commit `4f63e2276` al auditar).

## Reglas que el worker debe seguir (de `CLAUDE.md` del repo de la app)

- Ramificar de `origin/release/v0.2.18-lab`, no de `main`. Worktree propio (`git worktree add`), no usar `~/projects/terminal-sync`.
- Abrir PR en **draft** apuntando a `release/v0.2.18-lab`; ponerlo Ready cuando esté listo. **No mergear** (lo hace el coordinador).
- **No buildear ni instalar** para el Lab de JM (`npm run build:lab`, `scripts/ts-swap-install.sh` y copiar `.app` son del coordinador). Validar con tests unitarios, `cargo check --lib --tests`, `npm run typecheck`/vitest, y evidencia de pantalla de un dev server solo si el skill `ts-verificar-cambio` lo permite.
- Antes de commitear: `git config user.name` = `jmggaravito-sudo`, `user.email` = `jmggaravito@gmail.com`.
- Cargar los skills correspondientes antes de tocar: `ts-coordinacion` (ramas/PR), `ts-verificar-cambio` (evidencia), `ts-datos-cliente` (si el diff toca `sync_state`, `terminals`, `snapshots`, `vault`, `.jsonl`, `master_key` o esquema), `ts-invariantes-sync` (sync/crypto/auth), `ts-bot-soporte` (PR body y bot).
- El cuerpo del PR lleva la sección `## Lo que el bot de soporte debe saber` (sin jerga) y `## Impacto en datos del cliente` donde aplique. El check `bot-knowledge` bloquea sin ellas.
- Datos del cliente intocables: `~/Library/Application Support/net.nexflowai.terminalsync*/`, `~/.claude/projects/`, `~/.codex/sessions/`, `~/.gemini/tmp/`, `TerminalSync_Data/` en Drive. Nada de borrados.
- Al cerrar: limpieza no destructiva del worktree (`node_modules`, `src-tauri/target`, `dist`) e informar cuánto se liberó.
- Hay marcas de congelación de lanzamiento (`.github/launch-freeze-paths.txt`): si un archivo está en la lista, avisar al coordinador antes de tocarlo.
- Textos de interfaz: siempre en `public/locales/es/translation.json` y `public/locales/en/translation.json`, con paridad (`src/i18n/bundle-parity.test.ts`). Tuteo, sin voseo; el texto legal lo valida el abogado (documento 13), el worker deja las claves con el texto propuesto y las marca en el PR.

Orden recomendado: A1, A2 y A3 (bloqueantes, en este orden); A4 a A7 en paralelo; A8 después de que la web publique el catálogo.

## A1. Aviso y consentimiento antes de usar la IA incluida (Bloqueante)

Problema: el primer mensaje al chat envía el prompt, el material activo del panel de Contexto, la conversación previa y la memoria a Z.ai (China) sin aviso ni consentimiento (evidencia: `src/components/Onboarding.tsx` líneas 672-702 solo tiene casilla de Términos y Privacidad; `docs/design/glm-free-access-diagnosis.md` líneas 172-176, 198-199 y 420 recomendaron opt-in; `docs/decision-ia-unica-terminalsync.md` línea 180 admite que pasó a default).

Qué hacer:
1. Nuevo componente de consentimiento `src/components/AiDataTransferConsent.tsx` siguiendo el patrón de `src/components/MediaConsentCard.tsx` y `src/components/JevMessageAdvisorConsentCard.tsx` (se pueden reutilizar `useMediaRoutingConsent` y `useJevMessageAdvisorConsent` como molde). Debe decir con claridad: qué se envía (mensaje, archivos del panel de Contexto activos, conversación previa de ese espacio, memoria necesaria), quién lo trata (nombre del proveedor tal como lo apruebe el abogado, hoy Z.ai), dónde (país), para qué (generar la respuesta), enlace a la página `/ai` de la web (tarea W3) y a la política, y cómo retirarlo.
2. Backend: tabla o clave en `sync_state` para guardar la decisión con versión del texto y fecha (mirar cómo guarda `jev_consent` en `src-tauri/src/jev_consent.rs` y `jev_consent/core.rs`). Comando Tauri para leer, otorgar y retirar. **No** migrar datos existentes en bloque (skill `ts-datos-cliente`): para usuarios actuales, mostrar el aviso en el siguiente mensaje y no enviar nada hasta que lo acepten.
3. Puerta: en la ruta gestionada (`src-tauri/src/glm_api.rs`, `src-tauri/src/glm_api_config.rs`, y el punto de entrada del chat en `src/components/ChatView.tsx`) no enviar ninguna petición a la IA incluida si no hay consentimiento vigente para la versión actual del texto. Respuesta de la app: la tarjeta de consentimiento, no un error.
4. Ajustes: sección en `src/components/SettingsView.tsx` para ver, retirar y volver a otorgar el consentimiento (patrón de `jevMessageAdvisorConsent.settingsDescription`).
5. Corregir `connect.subtitle` ("Nada sale de tu computadora sin que lo aceptes") en ambos idiomas para que sea cierto o referirse solo a la nube.
6. Tests: unitarios del hook y del backend (consentimiento ausente = sin petición; versión cambiada = vuelve a pedir; retirar = detiene); prueba de componente. Añadir un test de integración Rust que falle si `deliver_api` se ejecuta sin consentimiento.

Criterio de hecho: con un perfil nuevo, el primer mensaje a la IA incluida muestra la tarjeta y la petición al Worker no se emite hasta aceptar; con el consentimiento retirado, no sale nada; los tests nuevos y `bundle-parity` pasan.

## A2. Opción para no enviar datos a un proveedor fuera de la UE / modo sin IA incluida (Bloqueante)

Problema: no hay modo de uso sin enviar datos (el catálogo del bot dice que traer cuenta propia "hoy no se ofrece"). Un cliente que rechaza la transferencia no puede usar el producto salvo para sincronizar.

Qué hacer (decidir primero con JM y el abogado cuál de las dos opciones; la app debe soportar ambas detrás del mismo interruptor de consentimiento de A1):
- Opción 1, mínima: rechazar el consentimiento deja la app en "solo sincronización y memoria local", con la IA incluida desactivada y mensajes claros (reutilizar los estados de `chatView.providerConnectionOptions.*`). Verificar que la app no se rompe sin IA (pantallas de Home y chat).
- Opción 2: upstream UE para clientes de España. Requiere que el Worker (`services/glm-courtesy-proxy/src/upstreams.ts`, ya multi-upstream) ofrezca un upstream con tratamiento en la UE/EEE y que el cliente elija en el consentimiento. Esta parte depende de contratar ese proveedor; el worker solo prepara el selector y el atributo de ruta, no contrata nada.
- En ambos casos mostrar en el consentimiento un resumen de los controles finos que ya existen: excluir fuentes del contexto (`contextPanel.reason.*`) y "mensaje suelto" (`chatView.isolatedTurn.*`).

Criterio de hecho: se puede completar el onboarding y usar la app sin aceptar la transferencia; el estado queda reflejado en Ajustes y el bot lo describe correctamente (ver A7).

## A3. Transparencia del proveedor: alinear etiqueta, bot y catálogo (Bloqueante)

Archivos:
- `docs/support-knowledge/catalog/ai.included_what_it_is.yaml` (constraint 1) y `docs/support-knowledge/catalog/ai.provider_choice.yaml`: cambiar la regla "NUNCA nombrar un modelo, versión ni proveedor" por: si el cliente pregunta quién trata sus datos, el bot nombra al subencargado y envía a la página `/ai` y a la política. El nombre comercial del modelo sigue sin publicarse si así se decide, pero el encargado/destinatario de datos sí. Texto exacto lo aprueba el abogado.
- Regenerar `docs/support-knowledge/catalog.compiled.json` con el script del repo (`scripts/bot-knowledge`, ver skill `ts-bot-soporte`).
- `src-tauri/src/ai_providers.rs` (línea 120) y `src-tauri/src/ai_engine.rs` (línea 441): la etiqueta visible "TerminalSync / Z.ai" ya nombra al proveedor; verificar con el abogado que siga así y que sea consistente en `chatView`, Ajustes y el consentimiento (A1). Si se oculta, el consentimiento de A1 es el lugar donde sí debe aparecer.
- PR body: sección `## Lo que el bot de soporte debe saber`.

Criterio de hecho: el check `bot-knowledge` pasa; una pregunta de prueba "¿quién procesa mis datos?" recibe respuesta con el subencargado.

## A4. Derechos RGPD en la app: exportar y borrar (Alta)

Archivos:
- `src/components/SettingsView.tsx` (zona de peligro, líneas 1219-1367): mantener el borrado, corregir "subscripción" en `settings.deleteAccountModal.filesNote`, añadir texto sobre lo que no se borra (archivos en su Drive; ledger local).
- Nuevo comando de exportación local "Descargar mis datos": reúne lo que vive en el equipo (ledger de conversaciones `conversation_events` exportable, memoria, configuración no sensible) en un ZIP/JSON en una carpeta que elija el usuario. **Nunca incluir** secretos ni `master_key`. Revisar el skill `ts-datos-cliente` y `src-tauri/src/db/conversation.rs` (ledger exportable por terminal y mes).
- Nuevo botón en Ajustes que llame también a la exportación de cuenta de la web (`GET /api/account/export`, tarea W9 del documento 11) y enlace el resultado.
- Texto en `public/locales/{es,en}/translation.json` y paridad.

Criterio de hecho: desde Ajustes se obtiene un archivo con los datos locales y otro con los de cuenta; el borrado informa del plazo real y de lo que se conserva.

## A5. Inbox: coherencia de lo que se guarda en servidores de TS (Alta)

Problema: las claves `inbox.privacyStorage` e `inbox.privacyStorageRetention` dicen que los correos se guardan en servidores de TS hasta N días, mientras la política web dice que se guardan en el equipo y que el contenido no toca los servidores.

Qué hacer: (a) confirmar con el código del backend del Inbox dónde y cuánto se guarda; (b) si es correcto, mantener el texto de la app y pedir a la web que corrija la política (documento 13); (c) incluir el Inbox en el consentimiento de A1 y en la exportación de A4; (d) dejar de reenviar correos importados a la IA sin que el usuario los haya elegido (ya es el diseño; añadir test).

Criterio de hecho: un solo relato coherente entre app, política y bot; PR con evidencia de dónde se guardan.

## A6. Edad mínima y registro de aceptación (Media)

Archivos: `src/components/Onboarding.tsx` (líneas 672-702), `public/locales/{es,en}/translation.json` (`auth.consent.*`), `src/lib/legal.ts` (`termsUrl`, `privacyUrl`).
- Añadir a la casilla el texto de edad mínima que decida el abogado (en España, para consentimiento de datos, 14 años; el producto puede exigir 18).
- Guardar versión y fecha de lo aceptado (hoy solo `alreadyAcceptedRef`); usar las URLs versionadas de la web.
- `termsUrl(language)` y `privacyUrl(language)`: añadir la variante es-ES cuando la web la publique (tarea W8).

Criterio de hecho: el usuario no puede continuar sin la casilla; el valor guardado incluye la versión.

## A7. Textos en español de España y precios (Media)

Archivos: `public/locales/es/translation.json`, `src-tauri/src/i18n/locales/es.json`, `public/locales/languages.json`.
- Crear `public/locales/es-ES/translation.json` como sobrescritura (no copia completa) y registrar `es-ES` en `languages.json`; detectar con `i18next-browser-languagedetector` (`src/i18n/index.ts`). Sustituir voseo y léxico (`computadora` por `ordenador`, etc.) en esa variante.
- Revisar precios codificados en texto: `plans.pro.priceIncludedAi => $34/mes`, `aiChoiceModal.buyIncludedAi => US$15/mes`, `upgradePanel.cta.addAiUsd`; sustituir por valores formateados con `Intl.NumberFormat` y la moneda del catálogo cuando la web publique EUR (W5).
- `src/lib/billing.ts` (línea 85): ampliar `currency` a `"USD" | "COP" | "EUR"`.
- `agent/web/widget.js`: añadir la variante de España al diccionario (líneas 257-278) y un aviso corto de privacidad al abrir el chat ("Asistente automatizado; guardamos la conversación 90 días"), con texto del abogado.

Criterio de hecho: con el sistema en `es-ES` no aparece voseo ni "computadora"; los precios se formatean según la moneda recibida.

## A8. Consumo del campo `markets` del catálogo (Media)

Archivos: donde la app consume `/api/marketplace/catalog` (`src/lib/`, buscar `connectors` en el cliente del catálogo y los tipos de conector), y las pantallas de conectores.
- Añadir `markets` al tipo del conector (la web ya lo envía; la app hoy no lo lee).
- Opcional según decisión de producto: ordenar o marcar "No disponible en tu país" para los conectores cuya lista de `markets` no incluya el país del usuario ni `GLOBAL`. Requiere guardar el país del perfil (nuevo campo en el perfil; ver skill `ts-datos-cliente` antes de tocar esquema).
- Tests: un conector con `markets: ["CO"]` se marca como no disponible para un usuario en `ES`.

Criterio de hecho: el catálogo se parsea sin error con y sin `markets`; el comportamiento es el decidido y cubierto con test.

## A9. Telemetría y métricas: documentar y limitar (Media)

La app no incluye SDK de telemetría (verificado en `package.json`, `src-tauri/Cargo.toml`, `src`, `src-tauri/src`). Pero el Worker registra uso por usuario (`services/glm-courtesy-proxy/src/ai_usage.ts`, `sql/003_ai_usage.sql`) y hay workflows de analítica (`.github/workflows/ai-selection-analytics.yml`).
- Escribir `docs/privacidad-datos-que-salen-de-la-app.md` con la lista exacta de qué sale de la app (tabla: dato, destino, finalidad, retención, base) para alimentar la política y el DPA. Es un documento de hechos verificados en código, sin interpretación legal.
- Añadir un test que falle si se agrega un SDK de telemetría conocido (Sentry, PostHog, Mixpanel, Amplitude, Segment) a `package.json` o `Cargo.toml` sin actualizar ese documento.

Criterio de hecho: el documento existe, cada fila tiene ruta de código como evidencia, y el test corre en CI.

## Cierre del worker

En el reporte final: PRs abiertos, qué tests se corrieron y su salida, qué quedó pendiente de decisión (A2 opción 1 o 2, edad mínima), y la limpieza hecha del worktree con el espacio liberado.
