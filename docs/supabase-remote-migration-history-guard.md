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
3. ejecutar el dry-run/replay local aprobado de la cadena Team;
4. obtener aprobación explícita para aplicar cada migración individual;
5. realizar el smoke autenticado de dos cuentas con el feature flag aún apagado;
6. activar el flag, otorgar los comps aditivos y repetir el smoke.

## Prohibiciones que siguen vigentes

No use la recuperación para hacer que el CLI “pase” mediante atajos. Sigue
prohibido:

- ejecutar `supabase migration repair` para marcar filas aplicadas o revertidas;
- ejecutar `supabase db push --include-all`;
- agregar una migración SQL vacía/no-op para ocupar una versión;
- renombrar una migración por coincidencia de nombre o timestamp;
- almacenar tokens, connection strings, `created_by` u otra identidad en el
  manifiesto, SQL, logs o PR.

El PR de recuperación aporta la procedencia y los hashes; la aplicación
controlada y el smoke siguen siendo pasos separados y evidenciables.
