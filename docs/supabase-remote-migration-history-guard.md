# Guard de historial remoto de migraciones de Supabase

`supabase/migration-history/production-history-manifest.json` conserva diez
filas de historial remoto observadas mediante preflight de metadatos. Es un
registro de versiones/nombres, **no** una copia de SQL, una prueba de
equivalencia ni una orden para mutar producción. Todas permanecen como
`status: "unverified"` y `sqlEquivalence: "not-established"`; una coincidencia
de nombre con una migración numérica local solo es un candidato, nunca prueba.

El chequeo es local y sin red:

```bash
node scripts/check-supabase-history-manifest.mjs
```

También se ejecuta como prueba Vitest en el gate de CI que ya corre `npm test`
en cada PR. Falla si una de esas versiones timestamp aparece en
`supabase/migrations`. La reconciliación está **fuera de alcance** de esta
guardia y cualquier cambio de estado falla cerrado, incluso si se agrega un
archivo con el timestamp exacto. Así evita que SQL no-op, SQL ajeno o evidencia
inventada conviertan una fila en reconciliada.

## Regla de reconciliación

No use este registro para hacer que el CLI “pase”. En particular, está
prohibido:

- ejecutar `supabase migration repair` para marcar filas como aplicadas o
  revertidas;
- ejecutar `supabase db push --include-all`;
- agregar una migración SQL vacía/no-op para ocupar una versión;
- renombrar una migración local por coincidencia de nombre o timestamp;
- asumir que una migración numérica local con nombre parecido es el mismo SQL.

Para resolver una fila, recupere SQL histórico autoritativo y su procedencia,
revise equivalencia independientemente, pruebe replay en una base efímera y
abra un **PR de reconciliación separado** con commit fuente, SHA-256 del SQL
original y evidencia de replay. Ese PR debe rediseñar/revisar explícitamente
esta guardia; no puede saltarla cambiando el manifiesto. Después repita el
preflight actual y obtenga aprobación explícita de cambio antes de cualquier
acción de producción. El manifiesto y este chequeo no ejecutan Supabase, no
leen credenciales y no autorizan migraciones. Team permanece bloqueado hasta
que el dry-run de la cadena aprobada esté limpio.
