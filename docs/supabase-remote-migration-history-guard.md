# Guard de historial remoto de migraciones de Supabase

La recuperación de fuente del 20-oct-2026 está registrada en
`supabase/migration-history/production-history-manifest.json`. Las diez filas
con timestamps que antes aparecían solo en producción se recuperaron mediante
la ruta autoritativa de solo lectura `GET
/v1/projects/{ref}/database/migrations/{version}` de la Management API. Cada
respuesta devolvió exactamente una sentencia no vacía; no se persiste
`created_by` ni ninguna identidad del operador.

Cada archivo en `supabase/migrations/<timestamp>_<nombre>.sql` contiene los
bytes de la sentencia recuperada. El manifiesto y el test fijan versión,
nombre, longitud, hash del arreglo de sentencias y SHA-256 del archivo. Así una
coincidencia de nombre, una SQL no-op o una sustitución posterior fallan de
forma cerrada. El chequeo local es enteramente sin red:

```bash
node scripts/check-supabase-history-manifest.mjs
```

También se ejecuta como prueba Vitest en CI. El chequeo local **no** enlaza un
proyecto, no lee credenciales, no aplica SQL y no autoriza cambios en
producción.

## Verificación remota independiente requerida

Los hashes locales previenen cambios accidentales posteriores, pero por sí
solos no prueban qué respondió Supabase: un cambio malicioso podría modificar
el SQL, el manifiesto y la prueba en el mismo PR. Por eso, antes de aprobar una
modificación de esta recuperación y otra vez inmediatamente antes de un
rollout, una sesión autorizada debe ejecutar la verificación remota de solo
lectura:

```bash
SUPABASE_PROJECT_REF='<project-ref>' \
SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" \
npm run verify:supabase-history-remote
```

`verify:supabase-history-remote` hace exclusivamente diez `GET` a
`https://api.supabase.com/v1/projects/{ref}/database/migrations/{version}`.
Compara versión, nombre, cantidad de sentencias, presencia de `created_by`,
longitud y fingerprints SHA-256 contra los bytes locales. No imprime ni guarda
las sentencias, el token, el cuerpo de respuesta ni la identidad
`created_by`; tampoco escribe archivos ni toca la base de datos. Use un PAT scoped para ese único proyecto con el permiso exacto
`database_migrations_read` (scope `database:read`), no un token amplio. Inyéctelo
solo de forma efímera desde una sesión/vault/broker autorizado: nunca por argv,
archivo `.env` ni CI. No active `set -x` ni registre las variables de entorno.

Ejecute el comando en un checkout limpio del SHA bajo revisión. La CI no lo
executa porque no debe recibir un PAT. El registro del cambio debe conservar
solo SHA, fecha y el resumen saneado `N/N` de éxito/fallo, nunca el token, SQL,
cuerpos HTTP ni identidad del creador.

## Límites de la recuperación

Esta recuperación soluciona el desfase entre la historia remota y el árbol de
fuentes. No demuestra por sí sola que las migraciones Team pendientes sean
compatibles con el esquema vivo ni permite activar Team. Antes de una acción
real se requiere, en este orden:

1. revisión y merge del PR de recuperación;
2. ejecutar `npm run verify:supabase-history-remote` con una sesión autorizada
   de solo lectura y reconsultar las precondiciones del esquema;
3. confirmar evidencia fresca de backup del proveedor (ID/hora/retención) y
   procedimiento/permisos de restore; no ejecutar un restore destructivo solo
   para este gate;
4. desde el SHA mergeado y limpio, generar y verificar un stage de un solo
   target y ejecutar un dry-run que liste exactamente ese target;
5. obtener aprobación de cambio para ese target, aplicarlo y postverificar
   ledger/esquema antes de generar el siguiente stage;
6. con `0058` verificado, hacer smoke de producto solo con
   `TEAM_FEATURE_ENABLED=1` y `TEAM_PAID_CHECKOUT_ENABLED=0`, y únicamente tras
   verificar un allowlist server-side o un deployment aislado para las dos
   cuentas de smoke. Con flag `0` solo se permite preflight/schema smoke.
   Apagar `TEAM_FEATURE_ENABLED` al terminar cada intento, pase o falle; los
   comps son una operación separada y no sustituyen la prueba de trial.

## Prohibiciones que siguen vigentes

No use la recuperación para hacer que el CLI “pase” mediante atajos. Sigue
prohibido:

- ejecutar `supabase migration repair` para marcar filas aplicadas o revertidas;
- ejecutar `supabase db push --include-all` desde el repositorio raíz o contra
  un directorio no curado. La única excepción revisada es un staging nuevo,
  local y de un solo target generado con
  `npm run prepare:team-migration-stage -- --target <version>`: debe contener
  exactamente una entrada de staging por versión remota revalidada, el prefijo
  Team ya aplicado y un único target pendiente; no puede introducir checkout o
  AI pendiente fuera del slice. Los hashes autoritativos de las fuentes
  timestamped recuperadas siguen siendo los del manifiesto separado.
  Inmediatamente antes del dry-run y de nuevo antes del apply, ejecutar
  `npm run verify:team-migration-stage -- --verify-stage <ruta-absoluta> --require-linked`
  desde el checkout limpio: debe fijar ref/proyecto, target/prefijo aprobado,
  hashes de SQL copiada y ausencia de SQL extra/faltante/symlinked. Invocar
  `supabase --workdir <ruta-absoluta> --profile supabase` para link/dry-run/apply,
  nunca depender del CWD del checkout ni de un perfil heredado. Antes de cada
  invocación limpiar `SUPABASE_DB_PASSWORD`, `SUPABASE_DB_POOLER_CONNECTION_STRING`,
  `SUPABASE_PROJECT_ID`, `PROJECT_ID`, `SUPABASE_PROFILE`, `SUPABASE_DEBUG`,
  `SUPABASE_ENV`, `SUPABASE_WORKDIR`, `SUPABASE_HOME` y `SUPABASE_YES`; para push, exigir que JM ingrese una
  contraseña nueva y no vacía dentro de un subshell zsh con `set +x`, y no usar
  `--debug`. Su dry-run debe listar solo ese archivo antes de un apply autorizado.
  Nunca usar esta
  excepción para replay amplio;
- agregar una migración SQL vacía/no-op para ocupar una versión;
- renombrar una migración por coincidencia de nombre o timestamp;
- almacenar tokens, connection strings, `created_by` u otra identidad en el
  manifiesto, SQL, logs o PR.

El PR de recuperación aporta la procedencia y los hashes; la aplicación
controlada y el smoke siguen siendo pasos separados y evidenciables.
