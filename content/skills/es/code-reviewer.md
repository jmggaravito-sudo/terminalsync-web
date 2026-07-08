---
name: Code Reviewer
logo: /skills/code-reviewer.svg
category: dev
vendors: ["claude", "codex"]
author: "TerminalSync"
status: available
tagline: "Review honesto antes de mergear"
description: "Revisa diffs reales para detectar bugs, riesgos de seguridad, performance, tests faltantes y edge cases bloqueantes antes de publicar."
license: "proprietary"
marketplaceSource: "terminalsync"
compatibleWith: ["claude", "codex", "gemini"]
---
## Cuándo usarlo

- Pediste "revisá este PR", "qué le falta a este diff" u "ojos críticos antes de mergear".
- Tenés un diff, archivo o URL de PR real y querés encontrar riesgos antes de que los capture CI o un teammate.
- El cambio toca autenticación, pagos, escrituras de datos, concurrencia, migraciones, permisos u otro código donde una review superficial sale cara.

## Qué hace

Lee el diff y devuelve:

- **Bugs reales**: off-by-one, race conditions, error handling faltante, leaks, estado stale y contratos de datos rotos.
- **Riesgos de seguridad y privacidad**: checks de auth inseguros, exposición de secretos, autorización faltante, inyección o permisos demasiado amplios.
- **Riesgos arquitectónicos**: cambios en flujos críticos sin tests, migraciones, plan de rollback o notas de compatibilidad.
- **Edge cases olvidados**: estados vacíos, retries, fallas parciales, zonas horarias, eventos duplicados, idempotencia y compatibilidad hacia atrás.
- **Veredicto**: ship / fix-first / no-ship con razón concreta y el fix mínimo útil.

Evita feedback de lint, consejos vagos tipo "agregá comentarios" y reescrituras amplias salvo que el diff muestre un riesgo real de producto.

## Cómo usarlo

1. Pegá el diff (`git diff main...HEAD`), un fragmento de archivo o la URL del PR.
2. Agregá contexto de riesgo si importa: *"esto maneja pagos; mirá concurrencia e idempotencia"*.
3. Decí si querés solo bloqueantes o una revisión completa.
4. Leé el output; los puntos clave se marcan como 🔴 bloqueante, 🟡 revisar o 🟢 OK, con archivo/línea cuando el diff los trae.

## Ideal para

Devs solos sin equipo de review, juniors que quieren simular una revisión senior, equipos que ya tienen CI para formato y tests pero necesitan una pasada de riesgo más humana antes de mergear.
