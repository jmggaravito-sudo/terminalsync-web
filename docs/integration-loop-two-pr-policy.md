# Integration Loop — política de sincronización landing ↔ app

> **El nombre del archivo quedó histórico.** Se llama `two-pr-policy` porque
> antes exigía dos PRs siempre. Ya no: el segundo PR ahora se pide solo cuando
> hay código de la app que escribir. El path se mantiene para no romper las 13
> referencias que apuntan acá.

## La regla en una línea

**El landing va primero, siempre. El PR de la app se abre solo si hay código
de la app que cambiar.**

## Por qué cambió (2026-08-07)

La versión anterior exigía un PR de la app *"incluso cuando la app consume el
catálogo remoto automáticamente"*. Como en esos casos no había nada que
programar, los loops cumplieron el trámite con **tests de fixtures escritas a
mano**: de 7 PRs de loops mergeados, **5 no tocaron una línea de código de
producto**. El de Xero decía espejar `content/plugins/{en,es}/xero.md` — un
archivo que no existe. Pasó verde igual, porque el test nunca consulta el
catálogo.

O sea: el segundo PR no evitaba la desincronización, **la disfrazaba**. Daba
una señal de "espejado ✅" sobre algo que nadie había verificado.

Auditoría completa: `terminal-sync` → `docs/loops-integracion-auditoria.md`.

## La asimetría que importa

No es lo mismo equivocarse en un orden que en el otro:

- **Landing primero** → la app lo consume sola en cuanto está publicado. No
  hace falta actualizar la app. No pasa nada malo.
- **App primero** → la app promete algo que el catálogo todavía no sirve. El
  cliente lo instala y falla, o el rol pide una skill que no existe y arranca
  sin ella, en silencio.

Por eso la regla no es "sincronizados", es **"landing primero"**.

Caso real: `cotizaciones` y `contenido-social` entraron a la app en
terminal-sync#1139 con su PR de landing (#260) todavía abierto. Los roles de
El Departamento quedaron pidiendo dos skills que el catálogo no servía.

## Qué se exige hoy

### 1. PR del landing — siempre

Es la fuente de verdad de `/api/marketplace/catalog`. Contenido, metadata,
páginas públicas, bookkeeping del loop.

El body debe incluir:

- loop kind (`connectors`, `plugins`, `kits` o `skills`)
- found/skipped counts
- slugs shipeados/promovidos (`--items`), para que el reporte de ops linkee a
  `/es/connectors`, `/es/plugins`, `/es/stacks` o `/es/skills`
- dónde aparece la corrida: `/admin/ops/loop-runs`
- `App PR: <url>` **o** `App PR: no aplica — la app consume el catálogo`

### 2. PR de la app — solo si hay código

Abrilo cuando el ítem necesite algo que la app no hace hoy:

- una superficie nueva o un flujo de instalación distinto
- un caso especial que hoy renderiza como tarjeta genérica rota
- un connector sin manifest estático (por ejemplo un MCP administrado por el
  usuario, tipo Zapier) que **no debe** parecer instalable en un clic
- una integración de primera parte que abre su flujo nativo

**No** lo abras para "dejar constancia". Si la app ya consume el catálogo y el
ítem se ve bien, no hay PR que hacer: escribilo en el body del landing y listo.

### 3. El guard reemplaza la declaración

Lo que antes se declaraba en un PR, ahora se verifica solo:

- `terminal-sync` → `src/data/departamento.test.ts` cruza los slugs que la app
  referencia contra `catalogSlugs.snapshot.json` (lo que el catálogo **sirve**).
  Si la app pide algo que no existe, **CI en rojo con el nombre del slug**.
- `terminal-sync` → `node scripts/verify-integration-loop.mjs` corre el
  contrato entero: slugs fantasma, promesas de IA sin entrega real, y plugins
  que referencian piezas inexistentes. Corrélo al final de cada corrida, antes
  de reportar listo.

La diferencia de fondo: antes la sincronización dependía de que alguien **la
declarara**; ahora depende de que **sea cierta**.

## Si la automatización no puede abrir el PR del landing

1. Registrá el bloqueo en el log del loop y en `/admin/ops/loop-runs`.
2. **No reportes el ítem como listo.** Sin contenido publicado no hay ítem —
   lo que existe es un borrador.
3. Nunca compenses con un PR de la app que "espeje" contenido inexistente. Eso
   es exactamente lo que producía los tests falsos.

## Loop report

`/admin/ops/loop-runs` sigue siendo el menú compartido de los cuatro loops:
Connectors, Plugins, Kits y Skills. Cada corrida registra `--kind` y `--items`.
