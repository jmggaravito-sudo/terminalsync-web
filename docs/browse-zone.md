# Modo Explorar del cajón de Power-Ups — notas de diseño

Este documento captura decisiones acordadas que **el código todavía no impone** porque el modo Explorar no existe en el desktop al momento de escribir esto. Sirven como contrato para quien construya esa UI, principalmente para evitar bugs que ya se identificaron en la fase de diseño.

Vive acá (en `terminalsync-web`) y no en el repo del desktop a propósito: el endpoint y los Meta de catálogo (que viven acá) son los que **producen** las señales que la UI **consume**. Documentar las dos puntas en el mismo repo donde se decide la wire shape evita drift.

## Origen del documento

PR de origen: `feat(marketplace): GET /api/marketplace/catalog`. Durante esa revisión se detectó que el flag `requiresSecrets` (renombrado a `requiresEnvSecrets` antes del merge) mide **solo** la presencia de `${SECRET:NAME}` en el manifest, no "necesita setup" en general. La diferencia abre dos huecos que el modo Explorar tiene que cubrir explícitamente.

## Decisiones

### 1. El indicador "necesita clave" se renderiza a partir de `requiresEnvSecrets` únicamente

Hoy. No agregar `|| requiresOAuth` al condicional — esa propiedad **no existe** en el Meta. Si alguien la pone en la UI, el codigo no compila. Eso es deseable: fuerza a quien quiera ampliar la cobertura a agregar primero el flag al Meta + al endpoint + a los tests, en lugar de quedarse pensando que el indicador ya cubría OAuth.

`requiresOAuth` (o un nombre equivalente) entraría al `||` el día que aparezca el primer connector que efectivamente lo necesite. Al momento de escribir esto **no hay ninguno** en el catálogo:

- Connectors con manifest + secrets → `requiresEnvSecrets: true`. Cubiertos.
- Connectors con manifest pero sin secrets → no existen en el catálogo actual.
- Connectors sin manifest (gmail, vercel, webflow, etc.) → affiliate-only. Ver decisión #2.

### 2. Un item con `!hasManifest` NO es "draggable-instalable"

Esto es un requisito de la UI, no un nice-to-have. Hoy, sin esta lógica, arrastrar Gmail desde el modo Explorar al panel termina así:

1. Backend `install_powerup_for_session("cn-gmail")` hace `fetch_manifest("gmail")`.
2. Marketplace devuelve 404 porque Gmail es affiliate-only, no MCP server.
3. Backend reporta `Failed: fetch manifest: 404`.
4. UI muestra un toast rojo con "fetch manifest: 404".

El toast es honesto pero opaco — el usuario no entiende por qué algo que aparece en el catálogo "no se instala". La UI tiene que prevenir el drag en origen.

**Contrato para la UI del modo Explorar:**

- Items con `hasManifest === false` se renderizan con un CTA tipo "Abrir en \<vendor\>" o "Ir al sitio", **no draggable**. El click dispara `openExternalUrl(item.ctaUrl)`. Nunca caen al flujo `install_powerup_for_session`.
- Items con `hasManifest === true && requiresEnvSecrets === false` son los candidatos a drag&drop one-click. Hoy no hay ninguno en el catálogo, pero el código de la UI debe soportarlo cuando aparezca.
- Items con `hasManifest === true && requiresEnvSecrets === true` son draggables pero la UI muestra el chip "necesita clave" y el drop abre el `InstallModal` para pedir las keys antes de instalar.

### 3. Bundles (kits)

`BundleSummary` no carga un flag agregado de "el bundle requiere claves". Sus items resueltos (`bundle.items[]`) traen cada uno su propio `requiresEnvSecrets`. Si la UI quiere un chip agregado, hace `bundle.items.some((it) => it.requiresEnvSecrets)` en el cliente. Esta decisión se mantiene porque la regla per-item ya cubre todos los casos sin agregar un campo redundante que pueda quedar desincronizado.

## Resumen para implementación

| Flag/propiedad | Qué mide hoy | Qué NO mide |
|---|---|---|
| `requiresEnvSecrets` | Hay `${SECRET:NAME}` en el manifest del connector / `authCommand` no-vacío en CLI tool | "Necesita setup" en general. OAuth out-of-band no está cubierto |
| `hasManifest` | El connector tiene un manifest MCP instalable | Nada — directo |
| `requiresOAuth` | **No existe.** Agregar al Meta + endpoint + tests primero, después al `||` de la UI | — |

| Condición UI | Resultado |
|---|---|
| `!hasManifest` | CTA "Abrir en X", NO draggable como instalable |
| `hasManifest && !requiresEnvSecrets` | Draggable one-click (sin items hoy) |
| `hasManifest && requiresEnvSecrets` | Draggable + chip "necesita clave" + drop abre `InstallModal` |
