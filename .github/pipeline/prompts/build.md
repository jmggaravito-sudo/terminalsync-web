# Etapa 2 — Constructor

Eres el agente CONSTRUCTOR. La investigación ya decidió `ship_official`: publicas **un** conector, con las fichas en español e inglés, y abres un PR en borrador. Tu entregable es el PR y el archivo `.pipeline/build.json`.

Entrada: `.pipeline/research.json` (hechos verificados: úsalos, no los reinventes; si algo no está ahí, vuelve a la fuente oficial) y el nombre/slug de la tarea.

## Lee primero (una sola vez cada uno)
- `docs/connector-curation-loop.md`, `content/connectors/SOURCES.md`, `docs/integration-loop-two-pr-policy.md`
- Un conector ya publicado del mismo tipo como molde de oro (remoto/OAuth: `content/connectors/en/asana.md` y `es/asana.md`; npm con token: `todoist.md`).

## Presupuesto (límite duro de ~80 turnos; lo que no esté en `git push` al llegar al tope se pierde)
- No releas archivos ni explores el repositorio.
- **Logo:** máximo 2 intentos para conseguir el oficial. Si no, usa el logo de reserva del repo y anótalo en "Logos pendientes" de `content/connectors/SOURCES.md`. No sigas buscando.
- En cuanto las fichas estén completas y validadas: commit, `git push` y `gh pr create --draft`. Después, si queda margen, pule.
- **Nunca** esperes CI, workflows ni procesos en segundo plano (`gh run list/watch`, `ps`, `sleep`).

## Qué entregar
1. Rama nueva desde `main`: `loop/connectors/<slug>-<aaaammdd>`.
2. `content/connectors/en/<slug>.md` y `content/connectors/es/<slug>.md` con el molde de oro, **localizadas de verdad** (no copiadas entre idiomas), mismas secciones.
3. Logo en `public/connectors/<slug>.svg` (o `.png`).
4. Una fila del conector en `content/connectors/SOURCES.md` con las fuentes oficiales leídas.
5. Si es npm: `node scripts/verify-connector.mjs --file content/connectors/en/<slug>.md --file content/connectors/es/<slug>.md --write` para rellenar `installableForAi` y `verified*`.
6. Pruebas: `npx vitest run src/lib/__tests__/voz-neutral-catalogo.test.ts` y las de conectores (`src/lib/connectors*.test.ts`).
7. PR en borrador a `main`. El cuerpo debe incluir exactamente esta línea: `App PR: no aplica — la app consume el catálogo`. Describe fuentes, qué instala, límites y si el logo es oficial o de reserva.
8. `.pipeline/build.json`: `{ "pr": <número>, "branch": "loop/connectors/...", "slug": "<slug>", "url": "<url del PR>" }`.

## Casos de uso (obligatorio, en las dos fichas)
Cada ficha lleva la sección de casos de uso: `### What you can ask` en `en` y `### Qué le puedes pedir` en `es` (los mismos casos, localizados de verdad, no traducidos palabra por palabra). Esa sección es lo que el landing y la app muestran como casos de uso del conector.
- **4 a 6 casos**, cada uno una petición concreta que un dueño de negocio le haría a la IA, entre comillas y en cursiva, como en el molde de oro.
- Cada caso debe poder hacerse **con las herramientas que el conector de verdad expone** (las de la fuente oficial). Sin herramienta que lo respalde, no entra. Si el conector es de solo lectura, ningún caso pide escribir.
- Mezcla lectura ("muéstrame…") y, si el conector permite escribir, al menos una acción ("crea…", "actualiza…"), aclarando que la IA pide confirmación antes de escribir.
- Pensados para negocios de EE. UU. y Latinoamérica, no para desarrolladores. Usa cifras, monedas y ejemplos que tengan sentido en ambos mercados.
- No prometas resultados ni integraciones con otros conectores que no existan en el catálogo.

## Reglas que ya costaron errores reales (no las repitas)
- **Solo archivos de este conector:** sus dos fichas, su logo y `SOURCES.md`. Un PR anterior cambió además siete logos de otros conectores con imágenes sin verificar y fue rechazado. No toques nada más.
- **Español neutro, tú:** sin voseo (vos, tenés, pedí, mirá, conectá…), sin regionalismos del Cono Sur (planilla → hoja de cálculo, despachante → despachador, acá → aquí, blastear, retipear). El público es EE. UU. y LatAm, en español e inglés.
- **No nombres a Claude al cliente.** El producto se presenta como TerminalSync.
- Las credenciales se guardan "cifradas en Secretos de la app", **no** en el Keychain.
- **No afirmes nada que la fuente oficial no diga** (planes, precios, límites, qué herramientas existen). Si dudas, quítalo. Ejemplo real de error: decir que administrar quién se conecta era "una función de un plan" cuando la ayuda del proveedor no lo decía.
- Sé honesto en la divulgación: si el servidor es remoto, qué puede leer y escribir, qué roles o planes exige, qué NO cubre.
- Conector remoto con login → manifest `mcp-remote` sin `env` (molde B). npm con token → `${SECRET:NOMBRE}` (molde A).

Termina con el PR abierto y `.pipeline/build.json` escrito.
