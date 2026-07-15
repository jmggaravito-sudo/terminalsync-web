---
name: Kit de Code Review y Triage
logo: /logos/ts-kit.svg
category: dev
status: available
tagline: "Revisá pull requests con contexto del repo y señal de errores de producción, desde la terminal."
description: "Un bundle de workflow de ingeniería para desarrolladores y equipos chicos que revisan código, triagean issues y conectan los cambios con los errores de producción sin rearmar el stack en cada repo."
marketplaceSource: "terminalsync"
items:
  - kind: skill
    slug: code-reviewer
    reason: "Le da a Claude un workflow de review repetible y estructurado — correctitud, casos borde y hallazgos priorizados — en vez de un 'se ve bien' improvisado."
  - kind: connector
    slug: github
    reason: "Trae el diff del PR, los archivos, los issues y el contexto del repo sobre los que razona el review, para que los hallazgos citen código real, no suposiciones."
  - kind: connector
    slug: sentry
    reason: "Aporta contexto de errores y stack traces de producción para que el review priorice los cambios que tocan rutas de código que ya están fallando en prod."
  - kind: cli
    slug: github-cli
    reason: "Deja al desarrollador inspeccionar PRs, issues y corridas de Actions desde la terminal y actuar sobre el review sin ir al navegador."
---
## Para quién es

Desarrolladores y equipos de ingeniería chicos que dedican tiempo real a revisar pull requests, triagear issues y conectar los cambios propuestos con lo que efectivamente se rompe en producción.

Usalo cuando una persona o un equipo chico quiere una pasada de review consistente en varios repos sin cablear las mismas herramientas cada vez.

## Qué te ayuda a hacer

Este kit convierte el code review en un workflow repetible:

- Traer el diff de un pull request, los archivos cambiados y el contexto del repo con GitHub.
- Correr un review estructurado con hallazgos priorizados, casos borde y notas de riesgo vía Code Reviewer.
- Cruzar errores y stack traces de producción desde Sentry para enfocarse en las rutas de código riesgosas.
- Inspeccionar issues, PRs y corridas de CI desde la terminal con la CLI de GitHub.

El resultado esperado es un review que cita código real y fallas reales, con hallazgos priorizados y accionables — no un checklist genérico.

## Qué incluye

### Skills

- **Code Reviewer** — un workflow de review estructurado que produce hallazgos priorizados con su razonamiento. Es el corazón del kit: define *cómo* se hace el review.

### Conectores

- **GitHub** — lee diffs de PR, archivos, issues y contexto del repo para que el review razone sobre el cambio real.
- **Sentry** — lee errores y stack traces de producción para que el review priorice los cambios que tocan rutas que ya están fallando.

### CLI

- **GitHub CLI (`gh`)** — inspecciona PRs, issues y corridas de Actions y actúa sobre ellos desde la terminal. Incluido porque el usuario objetivo es un desarrollador que trabaja en la shell; el loop review-a-acción queda en un solo lugar.

## Cómo usarlo

1. Instalá el kit, autenticá GitHub, conectá Sentry con su token y corré `gh auth login`.
2. Apuntá Code Reviewer a un pull request: pedile que revise el diff por correctitud, casos borde y riesgo.
3. Pedile que cruce los archivos cambiados contra errores recientes de Sentry y marque cualquier cambio que toque una ruta que falla.
4. Pedí una lista de hallazgos priorizada (bloqueantes → menores) con referencias a archivos.
5. Usá `gh` para comentar, pedir cambios o revisar la corrida de CI sin salir de la terminal.

## Por qué estas piezas van juntas

El kit sirve porque los pasos se alimentan entre sí:

- GitHub le da al review su sujeto — el diff real y el contexto del repo.
- Code Reviewer le da un método — hallazgos estructurados y priorizados en vez de intuición.
- Sentry le da peso — cuál de estos cambios toca algo que ya se está rompiendo en producción.

Instalados por separado, quien revisa tiene que acordarse de correlacionar a mano los errores de producción con el diff. Instalados juntos, el kit da un camino coherente: **leer el cambio → revisarlo con método → ponderarlo por riesgo real de producción → actuar desde la terminal**.

## Límites

- No mergea, deploya ni aprueba pull requests por vos; la decisión la toma una persona.
- Revisa la evidencia que puede leer; submódulos privados, secretos y servicios no vinculados quedan fuera de alcance.
- GitHub y Sentry requieren sus propios tokens y están sujetos a los permisos y límites de plan de esas cuentas.
- El contexto de Sentry solo ayuda cuando el proyecto realmente reporta errores a Sentry; sin eso, el kit igual revisa pero pierde la ponderación por riesgo de producción.
- No es una auditoría de seguridad ni un reemplazo de los tests y el CI — usalo junto a ellos, no en su lugar.
