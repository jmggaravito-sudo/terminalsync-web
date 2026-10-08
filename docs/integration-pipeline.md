# Integration Pipeline — del nombre a las tres superficies

Escribes el nombre de una integración en **Admin → Integraciones** ("Integración completa") y el pipeline la investiga, la construye, la hace revisar por agentes independientes, espera el CI y deja un reporte. Todos los agentes corren sobre **GLM (Z.ai)**.

Workflow: `.github/workflows/integration-pipeline.yml`. Prompts: `.github/pipeline/prompts/`. Lógica sin modelo (alcance, decisión, reporte): `scripts/pipeline/` con tests.

## Etapas

| # | Etapa | Quién | Qué hace |
|---|---|---|---|
| 1 | Investigador | agente (solo lectura) | ¿Hay MCP oficial del proveedor? Escribe `research.json` con el veredicto y las fuentes que leyó. |
| 2 | Constructor | agente | Solo si el veredicto es `ship_official`: fichas en/es, logo, fila en `SOURCES.md`, PR en borrador. |
| 3 | Revisores ×4 | 4 agentes en paralelo, solo lectura | `sources` (hechos contra la fuente oficial), `voice` (español neutro, vocabulario), `install` (manifest, instalabilidad, herramientas), `honesty` (divulgación, logo, alcance). |
| 4 | Decisión | script determinista | Alcance (el PR solo toca los archivos del conector) + veredictos → `merge` · `ready` · `fix` · `hold`. |
| 5 | Corrector | agente, una ronda | Solo si los revisores pidieron arreglos. |
| 6 | CI y merge | script | Espera todos los checks del PR (incluida la supervisión). Mergea solo con `INTEGRATION_AUTOMERGE=true`. |
| 7 | Reporte | script | Comentario en el PR, resumen del job, fila en el panel de corridas y correo opcional. |

**Por qué revisores separados:** el agente que escribe no se evalúa a sí mismo. En una revisión manual de cinco PRs de loops, cuatro tenían errores reales que los tests no vieron: voseo en el catálogo, logos sin verificar, una afirmación sobre un plan que la fuente no decía y un nombre de skill equivocado.

## Resultados posibles

| Veredicto de la investigación | Qué pasa |
|---|---|
| `ship_official` | Se construye y se revisa (etapas 2–7). |
| `needs_own_build` | **No se construye nada.** El reporte trae los hechos verificados de la API (autenticación, endpoints, límites) y las alternativas de terceros, y la decisión de construir un MCP propio es tuya. |
| `exists` | Ya está en el catálogo. |
| `skip` | Descartado, con el motivo. |

| Decisión | Significado |
|---|---|
| `merge` | Todo pasó y el merge automático está encendido; se mergea cuando el CI queda en verde. |
| `ready` | Todo pasó pero el merge automático está apagado: el PR queda listo para que lo mergees tú. |
| `fix` | Hubo hallazgos corregibles: una ronda del corrector y el PR queda en borrador (no se mergea solo sin una segunda revisión). |
| `hold` | Un revisor lo frenó, falta una revisión, o el PR toca archivos de otro conector: queda en borrador para una persona. |

## Qué queda en cada superficie

- **Landing y Explorador de la app:** salen del mismo catálogo (`/api/marketplace/catalog`). Al mergear, Vercel despliega y el explorador lo toma sin release de la app (caché de unos 10 minutos).
- **Conversación (GLM):** los conectores **npm** se instalan conversando. Los conectores **remotos con login** (`mcp-remote`) **no**: el catálogo los marca `installableForAi: false` y se instalan desde Explorar. El reporte lo dice por cada integración.

## Interruptores

| Dónde | Nombre | Efecto |
|---|---|---|
| Variable del repo | `INTEGRATION_AUTOMERGE` | `true` permite que la etapa 6 mergee. Sin definir (por defecto): el PR queda listo para ti. |
| Secret | `Z_AI_API_KEY` | Llave de Z.ai (GLM). |
| Variable | `ZAI_MODEL` | Id exacto del modelo GLM que sirve esa llave. |
| Secret | `LOOP_RUNS_WRITE_TOKEN` | Para registrar la corrida en el panel. |
| Opcional | `RESEND_API_KEY`, `REPORT_EMAIL_TO`, `REPORT_EMAIL_FROM` | Envían el reporte por correo. |

**Recomendación:** dejar `INTEGRATION_AUTOMERGE` apagado durante las primeras integraciones y comparar lo que los revisores encuentran con lo que encontrarías tú. Encenderlo cuando coincidan de forma consistente.

## Cómo correrlo

Panel: Admin → Integraciones → "Integración completa (solo el nombre)". Con "Dry run" solo investiga y reporta (no construye, no crea PR).

Línea de comandos:

```bash
gh workflow run integration-pipeline.yml -R jmggaravito-sudo/terminalsync-web -f focus="Ramp"
gh workflow run integration-pipeline.yml -R jmggaravito-sudo/terminalsync-web -f focus="Siigo" -f dry_run=true
```

## Límites actuales

- **Solo conectores.** Plugins, kits y skills siguen en sus loops semanales.
- **GLM como revisor no está medido** contra una revisión humana. Por eso el merge automático parte apagado.
- La supervisión de un PR descarga el catálogo **de producción**, no el del PR: si producción está en rojo, el check falla en todos los PRs hasta que se corrija.
- Costo estimado por integración: unos USD 8–12 de GLM (investigador, constructor de hasta 80 turnos, cuatro revisores de hasta 50). Es una estimación a partir de las trazas de los loops, no una medición.
- Siempre habrá casos (sin MCP oficial, decisiones de producto, publicar un paquete propio en npm) que requieren a una persona. El pipeline se detiene ahí y lo dice.
