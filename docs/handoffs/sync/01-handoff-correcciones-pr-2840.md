Fecha: 2026-10-26. Base: revisión adversarial de solo lectura del PR #2840 de `jmggaravito-sudo/terminal-sync` (rama `fix/audit2-sync-findings`, cabeza `01ad4f880`), informe completo `revision-pr-2840.md` (adjunto aparte, con ref de diff/ruta). Marcas: **[C]** confirmado leyendo el código, **[R]** razonado desde el código/API sin ejecutar, **[NV]** no verificado. Nadie compiló ni corrió pruebas en esa revisión.

# Handoff: correcciones del PR #2840 antes de poder mergearlo

**Para:** el autor del PR (worker del repo de la app) y el coordinador.
**Veredicto de la revisión:** **no mergear tal cual.** Hay trabajo bueno (eliminación de los caminos que borraban el perfil remoto, escritura atómica de `master_key`, supresión del eco de subidas, guardas por fecha en secretos y notas), pero hay un hallazgo crítico sin test, riesgos de que la app no abra y un PR demasiado grande para hacer bisect o rollback.

**Alcance del producto:** solo GLM y solo build estable (Lab congelado desde 2026-09-18). `release/v0.2.18-lab` es solo el nombre del tronco.

---

## 0. Reglas que no cambian (del `CLAUDE.md` del repo app)

1. Ramifica de `origin/release/v0.2.18-lab`; PR **draft** hasta que esté listo; **ningún worker mergea**; el coordinador gatea el merge.
2. **Worktree propio** por PR. No pushees a una rama cuyo PR ya se mergeó: rama y PR nuevos.
3. Sin `npm run build:lab`, sin instalar el `.app`: eso es solo del coordinador. Tu entregable es "listo para build", no "verificado".
4. `git add -A` antes de **cada** commit; `cargo check --lib --tests`; `CARGO_TARGET_DIR=~/projects/.terminal-sync-cargo-target-lab`.
5. Migraciones de esquema: solo append.
6. Si tu diff toca datos persistidos o la llave: skills `ts-datos-cliente` y `ts-invariantes-sync` **antes**, y `## Impacto en datos del cliente` en el PR.
7. Textos de producto en **es y en** (`public/locales`), español neutro con "tú", sin jerga.
8. Commits terminan con `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`; el cuerpo del PR termina con `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
9. Hora de Colombia (UTC-5) en los reportes.

---

## 1. Antes de escribir código: corregir el reporte y las aprobaciones

Cada uno de estos puntos es una afirmación del PR que no resiste la revisión. Corrígelos en el body del PR **ya**, aunque el código aún no cambie.

| # | Lo que dice el PR | Realidad | Qué hacer |
|---|---|---|---|
| R1 | "10 commits, uno por paquete" | Son **11** (el último, `01ad4f880`, es de documentos del bot y no pertenece a la auditoría). La lista de commits de la API además no coincide con la rama (¿force-push?) | Corregir el número; que el coordinador confirme el SHA exacto antes de gatear |
| R2 | "Cada paquete trae tests que ejercitan el hallazgo, paginación vía `CloudProvider` simulado" | **Falso para W3**: no hay test de paginación, papelera, 404-como-éxito ni rename→Removed. Tampoco de `pull_one` (eco, conflicto, saltar Error/Pending). De 41 tests, los de sync son de funciones auxiliares | Quitar la afirmación; añadir los tests (ver cada PR) |
| R3 | "Fallan 2 tests de `ai_chat_sync` que ya fallaban en limpio" | Tu mensaje intermedio decía 4. Nadie puede verificar ninguno de los dos | Dar la **lista de nombres** de los tests que fallan en `origin/release/v0.2.18-lab` limpio, y que el coordinador compare con el CI |
| R4 | "Los conflictos conservan ambas versiones" (texto del bot) | Solo si el pull corre antes que el push (ver C2-1) | Corregir el texto del bot o arreglar el orden |
| R5 | "Los borrados van a la papelera de Drive por 30 días" (bot) | En `appDataFolder` (ledger, chat-sync, perfil) no hay papelera visible, y no está verificado que se purgue sola | Acotar el texto a los archivos de la carpeta visible |
| R6 | "Huella de llave en `account_keys` y en el perfil" | Se cumplió solo la mitad: el `key_id` vive en la cabecera del blob; ningún código toca `account_keys.key_id`. (El PR **no depende** de esa columna: si la app sale antes de la migración de Supabase, no hay error ni degradación) | Reflejarlo en el body |
| R7 | W5a "no cambia nada en disco" | Cambia el **formato del blob en la nube** (prefijo `TSYNCPK1|`) | Tratarlo como cambio de contrato de datos (regla 12) en `## Impacto en datos del cliente` |
| R8 | Aprobación de W5 | El handoff exigía que **el coordinador reclame W5 antes de que un worker lo tome**; el PR no muestra ese visto bueno | Enlace al visto bueno del coordinador, o detener W5a hasta tenerlo |
| R9 | Apagar Claude/Codex/Gemini | Solo aparece como cita en un commit ("Decisión JM 2026-10-26"); el handoff del 2026-10-25 lo trataba como tarea aparte "si JM decide" | Enlace al mensaje de JM en el body, o separar (PR-E) y esperar su confirmación escrita |
| R10 | Purga de portadas de lápidas ("sí textual") | Sin enlace | Enlace al mensaje de JM |
| R11 | Falta el pie `🤖 Generated with Claude Code` | — | Añadirlo |

---

## 2. Cómo dividir el PR (para bisect y rollback)

Cierra el PR #2840 como "reemplazado por 6 PRs" (sin borrar la rama) y abre estos, **cada uno desde `origin/release/v0.2.18-lab` con solo sus commits** (`git cherry-pick` de los commits del paquete más las correcciones):

| PR | Contenido | Riesgo | Orden |
|---|---|---|---|
| **PR-A** | W6 (guardas vault/notas) + W8 (respaldo antes de migrar) + W7a + textos W4 | Bajo | 1º |
| **PR-B** | W1 + W2 (están acoplados) | Medio-alto | 2º |
| **PR-C** | W3 (papelera, paginación, 404, borrados del Finder) | **Alto** | 3º, tras tests |
| **PR-D** | W5a (llave) en **dos fases** | **Alto** | 4º, con visto bueno del coordinador |
| **PR-E** | W1b-legado (apagar sync de transcripts de las 3 IAs + circuito de rate limit) | Producto | 5º, con aprobación citada |
| **PR-F** | W1b-perfil, en dos mitades (ver abajo) | Medio | 6º |
| (aparte) | El commit de documentos del bot `01ad4f880` | — | Quien mantiene `ts-bot-soporte` |

---

## 3. Correcciones por PR

Regla común: **un test que falle sin el fix y pase con él** por cada punto. Para sync: `CloudProvider` simulado y dos "equipos" (dos conexiones de SQLite).

### PR-A (bajo riesgo)

**W7a-1 · fallo abierto [C] · ALTA.** `list_terminals_with_tombstones().map(...).unwrap_or(false)` (diff:1625): si la lectura de la base falla, `shared_with_live_card = false` y **se borra** la carpeta de nube que quizá comparte otra tarjeta viva. → `unwrap_or(true)` (ante la duda, no borrar). *Hecho cuando:* un test con una lectura de base que falla **no** borra la carpeta. Cambiar además el test que es un `grep` de texto del código (`w7a_terminal_delete_uses_cloud_id_and_shared_guard`) por uno de comportamiento.

**W8-1 · la app puede no abrir [C] · ALTA.** Si el respaldo `VACUUM INTO` falla (disco lleno, permisos, DB corrupta), `migrate` devuelve `Err` y `Database::open(...)?` dentro del `setup` de Tauri (`lib.rs:1157`) **aborta el arranque sin mensaje**. → comprobar espacio libre antes; si no hay espacio o falla el respaldo, **degradar a aviso y no migrar** (o mostrar una pantalla de error clara en español/inglés), nunca dejar la app sin abrir en silencio. *Hecho cuando:* test con disco simulado lleno: la app arranca en modo "sin migrar" con un aviso, o muestra el error con texto de cliente.

**W8-2 · bajada de versión sin salida [C] · MEDIA.** El cliente que reinstala una versión anterior ve que la app no abre; el mensaje ("update Terminal Sync on this computer") va solo a stderr. → mostrarlo en pantalla (es/en) con una acción clara.

**W8-3 · orden de la poda [C] · MEDIA.** `prune_old_migration_backups` corre **antes** de crear el respaldo nuevo (diff:754): si luego falla, ya se borró uno antiguo. → crear, **verificar** (abrir la copia y contar una tabla), **después** podar. *Test:* que un fallo de `VACUUM INTO` deje intactos los respaldos viejos.

**W8-4 · tamaño [NV].** Conserva 2 copias (~2× la DB). Medir con una DB real **de prueba** (nunca de un cliente) y documentar el tamaño y el tiempo de arranque.

**W4-3 · paridad es/en y voseo [C] · MEDIA.** `PassphraseEntry.tsx:340-390` conserva texto fijo en español fuera de `public/locales`: "Resetear tu contraseña", **"leé qué pasa" (voseo)**, "acá" (regional) y alterna "equipos"/"computadoras". Un cliente en inglés ve un diálogo mezclado. → mover todo a `public/locales/{es,en}` en español neutro con "tú", un solo término para "equipo".

**W4-5 · BAJA.** `conversation_label(Unknown)` ("sin verificar") es texto fijo en español en Rust. → pasar por i18n o por el patrón ya existente.

**W6-2 · BAJA.** Un equipo con la hora adelantada fija `updated_at` en el futuro y gana comparaciones. → limitar `updated_at` entrante a `ahora + margen` (p. ej. 5 minutos) en `vault` y `synced_notes`. *Test:* una marca de tiempo del año siguiente no gana a una edición legítima posterior.

### PR-B (W1 + W2)

**C2-1 / W2-1 · "conserva ambas versiones" es falso sin conexión [R] · ALTA.** El push no compara con Drive (`update_file_content` sin `If-Match` ni versión base). A y B editan sin conexión; B sube; A abre la app: el escaneo de arranque (a los 5 s) sube la versión de A y **sobrescribe la de B**; el primer pull llega a los ~30 s y ve su propio archivo. La versión de B queda solo en el historial de Drive. → **pull antes de push** al arrancar y al barrer reintentos, **o** comparar `headRevisionId`/md5 remoto con la versión base guardada antes de `update`, y si ambos cambiaron, crear la copia de conflicto **antes** de subir. *Test de integración:* dos "equipos" simulados editan sin conexión, A abre primero; deben quedar **dos archivos** y ningún dato perdido.

**W2-3 · filtro demasiado amplio [C] · ALTA.** Cualquier archivo cuyo nombre contenga `" (conflicto "` se excluye del sync **para siempre y en silencio** (diff:2956-2960). "Cláusula (conflicto de intereses).docx" es un nombre plausible. → anclar al patrón exacto `" (conflicto AAAA-MM-DD HHMM)"` (y sufijos `-2`..`-99`). *Test:* "Cláusula (conflicto de intereses).docx" **sí** sincroniza; la copia generada **no**.

**W2-2 · la copia de conflicto no sube [C] · MEDIA.** Vive solo en ese equipo; si se pierde el disco, la otra versión queda solo en las revisiones de Drive (30 días/100 versiones, sin garantía). → o subirla a una carpeta de conflictos en Drive, o dejar claro en el aviso que hay que guardarla.

**W2-5 · limbo de filas `Error` [C] · MEDIA.** El pull salta filas `Error`/`PendingUpload` porque "el barrido las posee", pero el barrido solo reintenta filas cuyo archivo conserva **el mismo hash** y solo del terminal activo (`push_file` usa `active_terminal_id`; `sweep_candidates` no filtra por terminal). Una fila `Error` cuyo archivo cambió otra vez sin evento del watcher no sube ni baja; una `Error` permanente deja de recibir ediciones remotas **sin aviso**. → que el barrido recompute el hash y filtre por terminal; tras N fallos, mostrar la fila como fallo permanente al cliente.

**W2-6 · aviso de conflicto en español fijo [C] · MEDIA.** Es un `FileFailedEvent` (`SYNC_PULL_FAILED`) con texto en español dentro de Rust, y se cuenta como error. El handoff pedía aviso en la tarjeta, es/en. → evento propio de conflicto, texto en `public/locales`, y nombre de la copia neutral al idioma o con el idioma del cliente.

**W1-2 · regresión acotada [R] · MEDIA.** Filas `Synced` con `local_hash` NULL (todas las que creó un pull antiguo): la condición nueva (`&& local_hash.is_some()`) fuerza la re-descarga de todos ellos en la primera pasada. Si el archivo local difiere del remoto y el watcher no vio la edición (app cerrada), `local_dirty` es falso (no hay hash base) y cae al camino de sobrescribir (con snapshot). → al primer arranque, **calcular y registrar el hash local** de esas filas (sin descargar) y solo re-descargar si difieren; **nunca sobrescribir** un archivo local sin hash base sin crear la copia de conflicto.

**W1-3 · ráfaga de primer arranque [R] · MEDIA.** Para un cliente con varios GB, el `full_scan_push` de arranque sube todo lo que no tenía hash de una vez y puede abrir el circuito de rate limit. → limitar la tasa (p. ej. N archivos por ciclo) y priorizar.

**W1-4 · snapshot que aborta el sync [C] · MEDIA.** `latest_snapshot_identical` propaga errores con `?` aunque su doc dice "cualquier error = no idéntico, el snapshot procede". Un error de lectura aborta el snapshot, y por contrato el pull **no escribe** el archivo: sync detenido para ese archivo. Además lee ambos archivos completos a memoria. → capturar el error y seguir con el snapshot; comparar por tamaño y hash en streaming.

**W1-6 · BAJA.** `md5Checksum`/`version` se guardan y **no se usan**. La descripción "compara por contenido con md5" es más de lo que hace el código. → o usarlos (ayuda a W2-1) o corregir la descripción.

**Tests obligatorios de PR-B (hoy no existen):** `pull_one` con el eco (cero subidas repetidas tras sincronizar, con `CloudProvider` simulado), con conflicto, y saltando `Error`/`PendingUpload`; test de integración push+pull de dos "equipos".

### PR-C (W3 · HOLD hasta tener tests)

**W3-1 · CRÍTICO [R].** Tras `mark_deleted`, la fila queda `Deleted` **conservando `drive_file_id`**, y `get_file_by_terminal_and_local_path` no filtra `Deleted`. Si el cliente recrea un archivo en la misma ruta (borrar y recrear, restaurar de la Papelera del sistema, guardar tras borrar), `push_file` hace `update_file_content(<id en papelera>)`. Antes, con `DELETE` permanente, eso daba 404 y se resolvía subiendo uno nuevo. Con papelera, la actualización **tiene éxito**, el archivo sigue en la papelera, la fila queda `Synced` y **el archivo nuevo no aparece en Drive ni en los otros equipos**: pérdida silenciosa de sincronización. **Supuesto de la API no ejecutado contra Drive real.** → al marcar `Deleted`, **anular `drive_file_id`** (o tratar `Deleted` como sin id en `push_file`). *Test obligatorio:* borrar, recrear en la misma ruta y sincronizar deja el archivo visible en el `CloudProvider` simulado.

**W3-2 · paginación en sondas [C] · MEDIA.** La paginación se aplicó a todos los llamadores, incluidas sondas con `pageSize=1` (`folder_is_empty`, `find_folder`): una carpeta con 1.000 hijos son 1.000 llamadas secuenciales para responder "¿vacía?" (amplifica el rate limit). → dejar esas sondas en una sola página; paginar solo los listados completos. *Test de paginación* contra un cliente simulado de 2.500 elementos (hoy no hay).

**W3-3 · 404 como éxito demasiado laxo [C] · MEDIA.** Se decide con `s.contains("404") || lower.contains("not found")` sobre el texto. Un 404 por `drive.file` ("not_ours") o por un id cacheado erróneo marca `Deleted` localmente sin haber borrado nada en Drive; cualquier error con "not found" (p. ej. fallo de auth) cuenta como éxito. → usar el **código de estado** tipado, no el texto; si el id no es de la app (`not_ours`), no marcar como borrado.

**W3-4 · borrados del Finder [R] · MEDIA.** Un renombre o movimiento dentro del árbol sin emparejar se vuelve `Removed(ruta vieja)` (papelera en Drive) + `Modified(ruta nueva)` (archivo nuevo): equivalente a borrar y crear, y con W3-1 el nuevo puede quedar invisible. Los directorios no tienen fila, así que desmontar un disco **no** borra masivamente (comprobado), pero verifícalo con un test.

**W3-5 · papelera en `appDataFolder` [NV] · MEDIA.** El propio PR admite que no hay papelera visible ahí. Averiguar si esos elementos se purgan solos; si no, el borrado de carpetas de `chat-sync` deja de liberar cuota y se acumula sin que el cliente lo vea. Corregir R5.

**W3-7 · BAJA.** `GoogleDriveProvider::delete` ahora hace papelera: revisar todo código que usara `delete` para liberar espacio o por unicidad de nombre.

### PR-D (W5a · llave · solo con visto bueno del coordinador)

**W5a-1 / W5a-2 · compatibilidad hacia adelante rota [R] · ALTA.** El blob nuevo empieza por `TSYNCPK1|<id>|` y se cifra con ese texto como AAD. Un binario **viejo** hace `decrypt(blob completo)`, falla y cae en `is_profile_decrypt_error`, y **conserva el camino que borra y recrea el perfil remoto con ≤1 espacio** (`can_replace_unreadable_profile_for_first_workspace`, eliminado solo en el binario nuevo). Es el incidente del 2026-10-23 **re-armado** mientras convivan equipos con versiones distintas (dos Macs del mismo cliente casi nunca actualizan a la vez). → **dos fases**: **release N** = solo lector (acepta la cabecera, **escribe el formato legado**) + elimina los caminos de borrado; **release N+1** escribe la cabecera. Alternativa sin romper lectores viejos: guardar el `key_id` en `appProperties` del archivo de Drive (ya se usa `tsOwned`) en vez de prefijar el blob. *Test:* un lector con el código viejo simulado no borra ni reemplaza un perfil escrito por el nuevo.

**W5a-3 / W4-1 · el falla-cerrado no llega a la pantalla [C] · ALTA.** `SyncHealthStatus::KeyMismatch` se emite en Rust, pero el TS `SyncHealthStatus` (`src/lib/syncHealth.ts:9-15`) no incluye `"key_mismatch"` y `SyncHealthBanner.tsx` termina en `default: return null`; `CardProfileSyncState::KeyMismatch` está declarado y **nadie lo construye**. El fallo de 27 h que motivó el cambio **sigue invisible** para el cliente. → añadir el estado en TS, el texto es/en ("Este equipo usa otra llave de cifrado que tu cuenta…" con la acción de emparejar) y construir el estado de la tarjeta. *Test de frontend:* el banner aparece con `key_mismatch`.

**W5a-4 · error con jerga y fila huérfana [C] · MEDIA.** Con llave distinta, los 7 comandos de creación de espacio hacen `sync_profile_to_cloud_after_create(...)?` **después** de `db.upsert_terminal`: el cliente ve un error en inglés con jerga ("cloud profile belongs to a different master key … pairing", diff:2331) y queda una fila local huérfana por intento. → comprobar la huella **antes** de crear; si no coincide, no crear y mostrar el mensaje de W5a-3.

**W5a-5 · `resetForNewPassphrase` [C] · MEDIA.** Borra la llave local y la fila `account_keys` **y después** llama `reset_cloud_profile` en un `try/catch` que solo hace `console.warn`. Si la cuarentena falla (sin red, proveedor sin `rename`), continúa con llave nueva y perfil viejo en la nube. El comentario (`passphrase.ts:140-146`) aún habla de un camino de recuperación que este PR eliminó. → hacer la cuarentena **antes**; si falla, no borrar la llave local ni continuar; corregir el comentario.

**W5a-6 / W5a-7 · MEDIA.** (6) Un equipo con llave local bloqueada y **sin fila en `account_keys`** ahora pide una frase que el cliente nunca creó (cuenta distinta en un Mac con llave de otra persona); solo le queda el reseteo destructivo. (7) Con un `master_key` **vacío**, `crypto_init`/`crypto_status` devuelven error en vez de la pantalla de recuperación [NV cómo lo maneja el frontend]. → un camino claro y no destructivo para ambos casos, con test.

**W5a-10 · [NV].** Dos perfiles `.profile_config.json` donde la cuarentena renombra ambos y dos equipos recrean a la vez: aparecen duplicados y gana el de menor id; el perdedor queda en mismatch. Documentar el comportamiento y probarlo.

**Lo que está bien y no se toca:** no se modificó derivación ni envoltorio de la llave (`derive_kek`, wrap/unwrap, salt, Argon2 intactos); el `key_id` es HMAC-SHA256 truncado a 64 bits; la escritura atómica de `master_key` (tmp+fsync+rename+fsync del directorio); `reset_cloud_profile` solo **renombra**, nunca borra; un equipo con llave distinta **no puede** sobrescribir ni borrar el perfil (comprobado: el único `push_remote_profile` pasa por `pull_remote_profile(...)?` antes).

### PR-E (legado de las 3 IAs · decisión de producto)

**L-1 · MEDIA.** Para clientes que aún usen Claude, Codex o Gemini, la copia en la nube **deja de actualizarse sin ningún aviso en la UI ni migración**; la recuperación en otro equipo traerá versiones viejas. Solo es aceptable con la decisión de JM **documentada y enlazada** (R9). No rompe H3/I4 (los `.jsonl` locales no se tocan; el ledger de GLM corre antes del `continue`; se conservan `pull_terminal_from_cloud_with_manifest` y el estado remoto bajo demanda).

**L-2 · circuito sin tope [C] · MEDIA.** Cada golpe **suma** 60 s a la ventana (`base = max(until, now) + 60 s`), sin tope. `with_retry` reintenta 5 veces un 403/429, así que una operación puede abrir ~5 minutos. Solo el bucle de chat-sync y el reconcile de arranque consultan el circuito; push, pull y auto-pull siguen golpeando Drive y extienden la ventana. Mientras tanto, el bucle que sincroniza perfil y ledger de GLM (el núcleo del producto) queda saltado. → **tope máximo** (p. ej. 10 minutos), consulta del circuito en todos los bucles y backoff con jitter. *Test:* tras un golpe, la ventana nunca supera el tope; el bucle de GLM se reanuda.

**L-4 · MEDIA.** `shared_http()` usa `.expect(...)` en producción y un timeout total de 180 s: una subida grande por conexión lenta fallará siempre. → timeout por inactividad, no total, o aumentar para subidas reanudables; sin `expect` en el inicializador.

### PR-F (perfil, en dos mitades)

**Mitad 1 (bajo riesgo):** "no subir el perfil si no cambió" + "perfil canónico por menor id". Revisar P-4 (compara contra el remoto **después** de `decontaminate_remote_profile`: si esa limpieza quitó entradas, la nube conserva la entrada contaminada y nunca se reescribe; y un blob legado igual en contenido nunca se reescribe con cabecera, lo que afecta la promesa del body de W5a) y P-5 (el id de Drive es aleatorio: puede elegir la copia más nueva/vacía; documentar y limpiar duplicados huérfanos).

**Mitad 2 (purga de portadas de lápidas, con respaldo):**
- **P-2 · espiral de disco [R] · ALTA.** `purge_tombstone_payloads_once` se llama en **cada ciclo** (~37 s) y la bandera solo se escribe al final. Si `VACUUM INTO` falla, reintenta cada ciclo con un nombre de archivo distinto (timestamp a segundos). → **bandera de "intento fallido" con backoff** y un solo respaldo por intento; comprobar que no quedan archivos parciales.
- **P-1 · MEDIA.** El respaldo "verificado" es solo que el comando devolvió `Ok`: no se abre la copia ni se cuenta nada, y `backup_bytes` usa `unwrap_or(0)`. Además **nunca se poda**. → abrir la copia y contar filas; podar según una política.
- **P-3 · MEDIA.** `VACUUM INTO` corre dentro de `db.with_conn` (el mutex de la DB) en un hilo de tokio: bloquea todos los comandos que usen la DB durante segundos con un ledger de GLM grande, una vez por instalación. → hilo dedicado fuera del mutex, o hacerlo al arrancar antes de abrir la ventana con una barra de progreso.
- **P-6 · BAJA.** Un equipo con versión vieja sigue exportando portadas de lápidas, lo que puede devolver el peso al perfil.
- *Test:* ya hay buenos tests de purga (conserva lápidas, respaldo, idempotente, espacios vivos); añade el de fallo de respaldo con disco lleno.

---

## 4. Cierre transversal

- **Formato:** `cargo fmt --check` fallaría en varios fragmentos (`.check_status().await?;` en una línea, línea en blanco doble en `schema.rs`) [NV]. Pásalo antes de empujar.
- **`unwrap()`/`expect()` nuevos en producción:** `shared_http()`; el de `key_id` es inocuo.
- **El commit de documentos `01ad4f880`** cambia reglas de tono y de precios anuales del bot en `docs/sync-bot-knowledge.md` y pasa por `bot-prompt-build`; incluye un ejemplo en voseo (`usá`). Sepáralo y que lo revise quien mantiene `ts-bot-soporte`.
- **La rama va 2 commits detrás de release** (#2841, #2843, que tocan los mismos JSON de locales): resolver conflictos al rebasar.
- **CI:** el PR estaba `BLOCKED` con `eval-live` en FAILURE (sin ver el log). Cada PR nuevo debe pasar los checks requeridos (Linux check, typecheck, vitest, Windows check).

## 5. Qué hace el coordinador (no el worker)

1. Confirmar el SHA y comparar la lista de tests fallidos preexistentes con el CI (R3).
2. Dar (o negar) el visto bueno de W5a (R8).
3. Gatear el orden: PR-A → PR-B → PR-C → PR-D → PR-E → PR-F.
4. **Build estable + smoke físico de dos equipos (W0 del handoff `00-handoff-arreglos-sincronizacion.md`)** tras PR-B y PR-C, antes de seguir: eco medido en 10 minutos, edición simultánea, borrar y **recrear en la misma ruta**, renombrar, una carpeta de 1.100 archivos, y llave distinta con **cuenta de prueba**.
5. Mantener un save-point y un rollback antes de cada instalación.

## 6. Qué no se pudo comprobar (se repite aquí para que nadie lo dé por hecho)

Compilación y resultado de cualquier test; el comportamiento real de Drive (actualizar contenido de un archivo en la papelera, purga de la papelera en `appDataFolder`, residuo parcial de un `VACUUM INTO` fallido, 404 vs `drive.file`); el tamaño real de las bases y el costo del primer arranque; cómo reacciona el frontend a un `master_key` vacío; las aprobaciones de JM (solo hay citas); y la procedencia del "4 fallos" del texto intermedio del autor.

## Archivos de referencia
`revision-pr-2840.md` (informe completo con ref de diff), `docs/handoffs/sync/00-handoff-arreglos-sincronizacion.md`, `auditoria-sync-contexto-espacios.md`. Repo app: `CLAUDE.md`, `COORDINATOR.md`, `.claude/skills/{ts-invariantes-sync,ts-datos-cliente,ts-verificar-cambio,ts-bot-soporte}/SKILL.md`.
