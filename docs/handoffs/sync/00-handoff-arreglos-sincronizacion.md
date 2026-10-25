Fecha: 2026-10-25. Base: auditoría de solo lectura de `release/v0.2.18-lab` @ `061e391d8` (informe completo con ruta:línea: `auditoria-sync-contexto-espacios.md`, adjunto aparte). Marcas: **[C]** confirmado leyendo el código, **[P]** plausible, **[NV]** no verificado.

# Handoff: arreglos de sincronización de contexto y espacios entre equipos

**Alcance de este handoff (decisión de JM):**
- **Solo GLM.** La IA de TerminalSync es GLM (Z.ai). Los caminos de Claude, Codex y Gemini **no se tocan ni se invierte tiempo en ellos** (ver §2). Si un arreglo toca código compartido, se mantiene su comportamiento, pero no se amplía.
- **Solo la build estable.** Lab está congelado desde 2026-09-18. "`release/v0.2.18-lab`" es solo el **nombre de la rama tronco**: de ahí salen las builds estables. No se compila ni instala nada para Lab.
- **Clientes:** dueños de negocio no técnicos en EE. UU., Latinoamérica y España, en español e inglés.

**A quién va dirigido:** un worker del repo de la app (`jmggaravito-sudo/terminal-sync`) más el coordinador (que es el único que builda, instala y mergea).

---

## 0. Reglas duras (del `CLAUDE.md` del repo de la app; léelo completo antes de tocar nada)

1. El tronco es **`origin/release/v0.2.18-lab`**, no `main` (congelado). Ramifica de ahí y apunta el PR ahí.
2. **Ningún worker mergea.** Abre PR **draft** temprano, ponlo Ready cuando esté listo. El coordinador gatea el merge.
3. **Worktree propio** por tarea. `~/projects/terminal-sync` es zona muerta para workers.
4. **No borres datos del cliente:** `~/Library/Application Support/net.nexflowai.terminalsync*/`, `~/.claude/projects/`, `~/.codex/sessions/`, `~/.gemini/tmp/`, `TerminalSync_Data/` en Drive. Cualquier cambio de esquema o de interpretación de datos persistidos exige leer el skill **`ts-datos-cliente`** y llenar la sección `## Impacto en datos del cliente` del PR.
5. Tocas `sync/`, `profile/`, `cloud/`, `auth/` o `crypto/`: lee el skill **`ts-invariantes-sync`** (I1–I5, H1–H4, C1–C2) antes. **No re-diagnostiques lo ya resuelto.**
6. Antes de escribir un fix de bug, aplica **`ts-verificar-cambio`**: un `exit 0` no es evidencia; hay que ver el cambio en el binario o en pantalla. Solo el coordinador buildea e instala.
7. `git add -A` antes de **cada** commit; `cargo check --lib --tests` (no solo `--lib`); `CARGO_TARGET_DIR=~/projects/.terminal-sync-cargo-target-lab` (nunca symlink de `src-tauri/target`); no borres la caché persistente.
8. Migraciones de esquema: **solo append**, nunca editar una existente.
9. Identidad git `jmggaravito-sudo` / `jmggaravito@gmail.com`. Commits terminan con `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
10. PR body: sección `## Lo que el bot de soporte debe saber` (sin jerga) y, si toca datos, `## Impacto en datos del cliente`. Limpieza no destructiva del worktree al terminar (solo `node_modules`, `dist`, `src-tauri/target` propios y cachés del worktree).
11. **Jamás** `git stash drop` ni `git reset --hard` sobre trabajo que no es tuyo.
12. **JM no hace smokes.** El respaldo contra un build malo es el save-point y el rollback del coordinador, no la validación de JM.
13. Hora de Colombia (UTC-5) en todo lo que se reporte.

---

## 1. Por qué existe este handoff

La auditoría encontró que la app tiene **nueve mecanismos de sync independientes**. Los datos "pequeños y estructurados" (perfil, secretos, memoria, Contexto, recetas, voces y **las conversaciones de GLM**) están bien diseñados: ids estables, lápidas y merge que no pierde datos. Los archivos de la carpeta del espacio usan una regla primitiva (el último en escribir gana) con huecos de pérdida y duplicado, y la pantalla casi no le dice al cliente qué viaja. **El CRDT no es la solución** (ver §6).

**Para el producto GLM-only y estable, lo que importa de verdad es:**
1. Archivos del espacio (conflictos, borrados, eco de subidas, paginación).
2. Llave maestra distinta entre equipos (el cliente cree que sincroniza y no llega nada).
3. Honestidad de la interfaz (conversaciones de GLM, "al día", reset).
4. Lo que **no** viaja y sorprende al cambiar de equipo (Cartelera, conectores instalados).

---

## 2. Fuera de alcance (no lo hagas; si lo ves, anótalo y sigue)

- Todo lo específico de **Claude/Codex/Gemini**: sincronización de sus `.jsonl` (`chat_sync_api.rs:595-895`, el `||` por tamaño de `:688-691`, el traspaso "Reanudar IA" que borra `.jsonl` locales, `MIN_PUSH_SIZE`), `project_memory_sync`, `codex_sync`, `skills_sync`/`plugins_sync`/`mcp_sync` de esas CLIs, `cowork_sync`, `auth_sync` (gh/CLIs). Siguen en el código como **legado**; no inviertas en ellos. Si JM decide después apagarlos o retirarlos, será una tarea aparte, no parte de esta.
- **Team** (`docs/team-*.md`, `src-tauri/src/team/`): espacios compartidos entre personas; sin transporte ni UI activos.
- **Transporte administrado de cuenta (Supabase)** (`account_sync_transport.rs`, `managed_sync_rollout.rs`): apagado en estable; Shadow/Mirror son solo Lab.
- **Engram/memoria de desarrollo.**
- Adoptar **Yjs/Automerge/Hocuspocus** (ver §6).
- Cualquier cosa que solo aplique a **Lab**.

> Nota para quien lea la auditoría: menciona Claude/Codex/Gemini **porque ese código existe**, no porque deba mantenerse. Las secciones 5.2 y la recomendación 8 del informe son para esos caminos y quedan **fuera** de este handoff.

---

## 3. Paquetes de trabajo, en orden

Cada uno: problema, evidencia, qué hacer, criterio de hecho, riesgos. El orden es de **prioridad para el lanzamiento estable**.

### W0 — Smoke físico de dos equipos (lo hace el coordinador/JM; sin esto W1 y W2 son hipótesis)
**Por qué:** F1 y los hallazgos [P] solo se confirman con dos equipos y Drive real. Nadie ha corrido eso.
**Protocolo (el coordinador lo ejecuta con la build estable; el worker no buildea):**
1. Dos Macs con la misma cuenta, **homes de largo distinto** (`/Users/jm` y `/Users/juangaravito`), un espacio con carpeta de Drive y 20 archivos.
2. Contar subidas y bajadas **por archivo durante 10 minutos** sin tocar nada (se espera 0 tras el primer sync). Registrar si algún archivo se sube repetidamente (F1).
3. Editar el mismo archivo en los dos equipos antes de sincronizar, y registrar qué queda (F2).
4. Borrar un archivo en un equipo; mirar el otro, la papelera de Drive y los snapshots (F3, F4).
5. Renombrar un espacio y una carpeta; mirar los dos equipos (sección 2 de la auditoría).
6. Con 1.100 archivos en una carpeta, ver si todos bajan (F7).
7. Cambiar la llave en un equipo (flujo "olvidé mi frase") y ver qué muestra el otro (F11). **Solo con una cuenta de prueba**, nunca la de un cliente.
**Entregable:** un reporte con hora de Colombia, qué ocurrió en cada paso, capturas y los logs.
**No se hace con datos de clientes.**

### W1 — Cortar el eco push↔pull de archivos (F1) · Severidad alta · S–M
**Problema [C por lectura; no ejecutado]:** tras subir un archivo, `push` deja `remote_modified_at=NULL` (`sync/push.rs:126-137`, `db/files.rs:217-229`). El siguiente pull (cada 30 s) lo vuelve a bajar (`sync/pull.rs:224-230`) y deja `local_hash=NULL` (`:307-317`). El watcher no filtra las escrituras propias, así que el archivo se re-sube. Ciclo cada ~30 s por archivo, y cada vuelta toma un snapshot (`pull.rs:286`). Coincide con el incidente del 2026-08-19 (14.203 subidas de 619 archivos, 1.124 de un mismo `.env`), hoy atribuido solo a Drive Desktop (I5).
**Qué hacer:**
- `pull` registra el `local_hash` del archivo que escribe y su `remote_modified_at`.
- `push` conserva `remote_modified_at` de Drive (o compara `md5Checksum`/`headRevisionId`).
- El watcher ignora las escrituras que hizo la propia app (supresión de eco).
- **Primero confirma con W0** (o con un test que reproduzca el ciclo con un `CloudProvider` simulado). No cambies lógica sin reproducir.
**Hecho cuando:** un test de integración demuestra 0 subidas repetidas tras sincronizar; el smoke W0 paso 2 da 0; el número de snapshots no crece sin ediciones.
**Riesgos:** tocar `sync/` exige releer I1–I5. No debilitar la exclusión de espejos de Drive Desktop (I5).

### W2 — Detección de conflicto en archivos y copia de conflicto (F2) · Severidad alta · M
**Problema [C]:** `update_file_content` no usa `If-Match` ni versión base (`push.rs:196-211`); `pull_one` sobrescribe sin comparar con el contenido local (`pull.rs:224-305`). Gana el último en escribir. Solo queda un snapshot silencioso (20 versiones/archivo).
**Qué hacer:**
- Guardar la **versión base sincronizada** (md5 y `headRevisionId`) por archivo.
- Antes de `update`, comparar con Drive; antes de sobrescribir en `pull`, comparar `local_hash` con la base.
- Si **ambos** cambiaron: crear **copia de conflicto** `archivo (conflicto <equipo> <fecha>).ext` y avisar en la tarjeta del espacio, en español e inglés, sin jerga.
- No tires la edición local nunca.
**Hecho cuando:** tests con dos "equipos" simulados editando el mismo archivo producen exactamente dos archivos y ningún dato perdido; la tarjeta lo muestra; hay textos es/en.
**Riesgos:** migración de esquema para guardar la base (append-only, ver `ts-datos-cliente`); archivos binarios grandes (Word/Excel): la copia de conflicto es lo correcto, no un merge.

### W3 — Higiene de Drive (F3, F4, F5, F7) · Severidad media-alta · S–M
- **F3 [C]:** borrar un archivo local hace `DELETE` permanente en Drive (`google_drive.rs:371-379`). → usar papelera (`trashed=true`).
- **F5 [C]:** si el `DELETE` falla (sin red), el siguiente pull **resucita** el archivo (`push.rs:289-309`, `pull.rs:224`). → registrar la intención de borrado y no volver a bajarlo.
- **F4 [C]:** `pull` solo agrega y actualiza, nunca borra ni renombra localmente; el otro equipo conserva el archivo, y si lo edita se **resube como nuevo** (`push.rs:196-228`). → propagar borrados y renombres con papelera local (snapshot) y lápida.
- **F7 [C]:** nunca se sigue `nextPageToken` (`google_drive.rs:93-118`, `cloud/google.rs:106-115`, `pull.rs:134`). → paginar.
**Hecho cuando:** pruebas con un `CloudProvider` simulado de 2.500 elementos bajan todos; un borrado se ve en la papelera de Drive y se propaga como lápida al otro equipo; un borrado sin red no resucita.
**Riesgos:** F4 puede borrar archivos del cliente en el otro equipo por error: usar siempre papelera/snapshot, nunca borrado duro, y hacer W2 antes o junto con esto.

### W4 — Honestidad de la interfaz sobre las conversaciones de GLM (sección 5.1 de la auditoría) · Severidad alta · S
**Problema [C]:** el ledger de GLM **sí sincroniza** (`chat_sync_api.rs:1139-1230`, import en `db/conversation.rs:461`, UI escucha `chat-ledger:imported` en `ChatView.tsx:5119`), pero `derive_conversation_state` devuelve siempre `Unknown` (`sessions/sync_status.rs:336-349`) y el frontend lo oculta (`src/lib/syncHealth.ts:230-251`, `SyncHealthIndicator.tsx:169-185`). El texto dice "Perfil, archivos y conversaciones se ven al día" (`public/locales/es/translation.json`, clave `syncHealthIndicator.body.ok`) sin haberlo verificado.
**Qué hacer:**
- Estado real de conversaciones para el ledger: última subida/bajada por espacio, error de llave, backoff.
- Mostrarlo al cliente en su idioma (es/en); no decir "al día" si no se verificó.
- Corregir los comentarios obsoletos (`chat_sync_api.rs:1871` "HOY NADIE ESCUCHA"; `memory/roam.rs:14` "no tombstones"; `memory/project_keys.rs:14-18` sobre la Cartelera).
- **Solo GLM.** No toques los estados de transcripts de Claude/Codex/Gemini.
**Hecho cuando:** un test cubre cada estado; la tarjeta/indicador cambia con un ledger atrasado; `npm run` de los tests del frontend en verde. **Textos nuevos en `public/locales/{es,en}`**.
**Impacto en el bot de soporte:** hay un FAQ (`docs/support-knowledge/catalog/sync.team_handoff.yaml`, "conversaciones viajan cifradas"); si cambias el texto del producto, revisa el catálogo del bot (skill `ts-bot-soporte`).

### W5 — Llave maestra distinta entre equipos y "olvidé mi frase" (F11) · Severidad alta · M
**Problema [C diseño, P daño]:** "Olvidé mi frase" crea una llave nueva y lo cifrado antes queda ilegible (`crypto/commands.rs:324-347`). Un equipo con la llave vieja y otro con la nueva no se leen: el perfil falla con "decrypt profile"; ledger, Contexto y transcripts cifrados con la llave vieja se saltan **sin error visible** (`chat_sync_api.rs:1651`). Hay una vía que **borra el perfil remoto** y lo recrea si hay ≤1 espacio previo (`profile/commands.rs:3533-3550,3596`).
**Qué hacer:**
- Guardar una **huella de la llave** (no la llave) en el perfil y en `account_keys`.
- Si un equipo ve otra huella: **modo solo lectura + aviso claro** en vez de intentar sobrescribir.
- Antes de "olvidé mi frase": explicar qué quedará ilegible y en qué equipos; pedir confirmación.
- Sustituir la vía que borra el perfil remoto por una que **pregunte**.
**Riesgos:** **es el cambio más delicado.** Skill `ts-invariantes-sync` (cifrado, Keychain, `FILE_NAME = "refresh_token"`) y `ts-datos-cliente` obligatorios. No toques la derivación ni el envoltorio de la llave. Pruebas con llaves simuladas, **nunca con la de un cliente**. Este paquete lo reclama el coordinador antes de que un worker lo tome; no lo tomes sin su visto bueno.

### W6 — Ventanas de pisado del perfil y el reset (F10, F12) · Severidad media · S
- **F10 [P]:** el perfil se lee, se baja el remoto y recién después se aplica (`profile/commands.rs:3489-3520`); `apply` hace `upsert` incondicional de espacios (`:4154`) y de secretos sin `WHERE updated_at <` (`vault/mod.rs:693`; `db/memory.rs:321` sí lo tiene). Un secreto recién pegado puede volver al valor anterior en esa ventana de 1–3 s. → aplicar con `WHERE updated_at < ?` o re-leer antes de aplicar.
- **F12 [C]:** "Restablecer sincronización en la nube" borra el perfil de la nube y lo reemplaza por el de este equipo (`profile/commands.rs:2858-2874`); el diálogo usa jerga (`profile_config.json`, "tombstones", `src/App.tsx:5542-5551`). → texto de cliente (qué conserva y qué pierde) o sacarlo del menú del cliente.
**Hecho cuando:** test de carrera que reproduce la ventana y falla antes del fix; el diálogo usa lenguaje de cliente en es/en.

### W7 — Lo que no viaja y sorprende al cambiar de equipo (F13, F14, F19) · Severidad media · M–L (**después** del lanzamiento salvo F13/F14)
- **F13 [C]:** borrar un espacio **siempre** borra `chat-sync/<id>/` y `context-sync/<id>/` de la nube aunque el cliente conserve los archivos (`profile/commands.rs:3152-3198`). Un equipo que aún no bajó el ledger de GLM o el Contexto lo pierde. → antes de borrar, comprobar que ningún equipo tiene pendiente bajarlo, o conservar la copia unos días.
- **F14 [P]:** dos espacios con el mismo nombre → misma carpeta local (`profile/commands.rs:4311-4322`). → guarda de unicidad como la que ya existe para el clon de git (`:2252-2300`).
- **F19 [C]:** la **Cartelera** (Reglas y Notas por espacio; `board_items.rs`) y los **conectores instalados** (`connector_installs`; solo SQLite, `db/connector_installs.rs:1-12`) no viajan, pero los **secretos** de los conectores sí. En el equipo nuevo llega la llave y no el conector; los tokens de `~/.mcp-auth` tampoco. → llevarlos como datos de cuenta (Cartelera y lista de conectores) y, al abrir un espacio en equipo nuevo, ofrecer "volver a conectar" los conectores (la acción `<slug>__reconectar` ya existe).
- Registro de equipos (versión, huella de llave, último sync, estado por dominio) y sincronizar **todos** los espacios y no solo el activo (`sessions/commands.rs:135-158`): **después** del lanzamiento y solo con un diseño aprobado.

---

## 4. Orden y dependencias

```
W0 (smoke, coordinador) ──► W1 ──► W2 ──► W3
                                   ▲
W4 (UI honesta) y W6 (ventanas)  ──┘   no dependen de W0, se pueden hacer ya
W5 (llave): solo con visto bueno del coordinador y tras leer ts-invariantes-sync
W7: después del lanzamiento (salvo F13 y F14, que son baratos)
```

**Antes del lanzamiento estable:** W0, W1, W2, W3, W4, W5, W6. **Después:** W7 y el diseño de "registro de equipos".

## 5. Criterio común de "hecho" (todos los paquetes)

1. Tests nuevos que **fallan antes** del cambio y pasan después. Para sync: `CloudProvider` simulado y dos "equipos" (dos conexiones de SQLite).
2. `cargo check --lib --tests`, tests Rust del módulo tocado, `tsc` y `vitest` de lo que toque el frontend.
3. PR draft a `release/v0.2.18-lab` con `## Lo que el bot de soporte debe saber` y, si toca datos, `## Impacto en datos del cliente`.
4. **Evidencia en el binario/pantalla** la da el coordinador al buildear la estable. El worker reporta "listo para build", **no** "verificado".
5. Si la solución es una migración de esquema: solo append, con prueba de que una base antigua migra sin pérdida.
6. Textos de producto en **es y en**, español neutro con "tú" (sin voseo) y sin jerga (`tombstones`, `profile_config.json`, `ledger`…).

## 6. Sobre Yjs / Automerge / Hocuspocus (decisión ya tomada)

**No se adoptan** para este trabajo. Los problemas dominantes no son de falta de CRDT: son identidad de espacios, borrados y papelera, versión base para detectar conflictos, relojes de pared, datos que no viajan y honestidad de la interfaz. Los archivos los edita el cliente con otros programas (Word, Excel), así que ni siquiera podría aplicarse un CRDT sobre ellos; lo que necesitan es **detección de conflicto y copia de conflicto** (W2). Un CRDT de texto solo tendría sentido si llega edición simultánea en vivo (Team, fuera de alcance). Hocuspocus es un servidor que guarda y mezcla el documento: choca con la postura de que el contenido no pase por los servidores de TerminalSync y con el cifrado de extremo a extremo.

## 7. Lo que no se pudo verificar

- Nada con dos equipos reales (todo es lectura estática de `061e391d8`). F1 y los [P] requieren W0.
- Si el segundo equipo puede leer una carpeta elegida con el Picker bajo `drive.file` sin repetir el Picker [NV].
- Si hay otra vía de sync de la Cartelera fuera de los módulos buscados (solo búsqueda por texto) [NV].
- Si las conversaciones de GLM con adjuntos o imágenes fuera de la carpeta del espacio viajan [NV].
- Volumen real de llamadas a la API de Drive (las cifras son estimaciones).
- Seguridad criptográfica (emparejamiento por código de 6 dígitos), servidor, web, Windows/Linux.

## 8. Qué reportar al terminar cada paquete

Un reporte corto en español, hora de Colombia: qué paquete, qué cambiaste (archivos), qué pruebas fallaban antes y pasan ahora, qué **no** verificaste, riesgos de datos, PR (draft) y qué necesita el coordinador (build/smoke). Si algo falla, di el fallo exacto.

## Archivos de referencia
`auditoria-sync-contexto-espacios.md` (informe completo), repo app: `CLAUDE.md`, `COORDINATOR.md`, `.claude/skills/{ts-invariantes-sync,ts-datos-cliente,ts-verificar-cambio,ts-arquitectura,ts-coordinacion,ts-bot-soporte}/SKILL.md`, `docs/decision-identidad-y-sincronizacion-unificadas.md`, `docs/managed-sync-rollout-gates.md`, `docs/historial/`.
