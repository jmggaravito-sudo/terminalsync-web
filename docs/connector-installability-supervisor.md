# Supervisor de conectores instalables para la IA

`scripts/verify-connector.mjs` es el verificador que puede invocar el loop de
supervisión (n8n o CI). No usa una shell para ejecutar manifests: instala el
paquete npm en una carpeta temporal con scripts desactivados, resuelve su
`bin`/`main`, lo arranca como `node <entrypoint>`, y habla MCP por stdio.

## Uso

```bash
# Una ficha, sin modificarla
node scripts/verify-connector.mjs --file content/connectors/en/context7.md --json

# Catálogo completo, verificando una vez por slug y escribiendo EN + ES
node scripts/verify-connector.mjs --all --write --json --concurrency 2 > connector-verification.json
```

El modo completo actualiza en las dos fichas los campos
`installableForAi`, `installableForAiReason`, `aiToolsCount`,
`aiReadOnlyTools`, `verifiedAt` y `verifiedPackageVersion` (y agrega
`verifiedWithoutKey: true` cuando el servidor completa `initialize` pero no
puede listar herramientas sin una llave real). La salida JSON incluye el
conteo y la lista de falsos con su razón; el runner de n8n debe conservarla
como evidencia del run.

## Límites de seguridad

- Solo acepta `npx` con una receta explícita y un nombre de paquete npm válido;
  `mcp-remote`, Docker, uvx, Python, rutas locales, URLs y repositorios git
  quedan fuera del catálogo instalable.
- `npm install` siempre usa `--ignore-scripts --no-package-lock --omit=dev`.
  Un paquete que declara `postinstall` se marca `needs-postinstall`.
- Los placeholders `${SECRET:NOMBRE}` y `secrets[]` se reemplazan por
  `smoke`; nunca se leen llaves reales. Variables de proceso peligrosas se
  rechazan (`PATH`, `NODE_OPTIONS`, `NPM_CONFIG_*`, `LD_*`, `DYLD_*`).
- Cada proceso termina en `finally`, y el handshake completo tiene un límite
  de cinco segundos.
- Se conservan solo las primeras 40 herramientas ordenadas por nombre, luego
  de validar el nombre expuesto `<slug>__<tool>`. Las lecturas sin
  `annotations.readOnlyHint: true` se cuentan como no anotadas, pero no
  bloquean la publicación.

El supervisor debe abrir el PR generado por el loop con la salida JSON y no
editar manualmente una ficha para convertir un conector remoto en local.
