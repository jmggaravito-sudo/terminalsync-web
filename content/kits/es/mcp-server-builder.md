---
name: Kit Constructor de Servidores MCP
logo: /logos/ts-kit.svg
category: dev
status: available
tagline: "Diseñá, construí y entregá el conector que a tu stack le falta — con documentación actual del SDK a mano y el trabajo aterrizando en un repo."
description: "Un bundle dev coherente para el desarrollador que extiende TerminalSync con un servidor MCP propio: acotar la superficie de tools con MCP Builder, traer documentación actual y versionada del SDK desde Context7 mientras codificás, y correr el loop del repo (scaffold, test, commit, PR) desde la terminal con GitHub CLI."
marketplaceSource: "terminalsync"
items:
  - kind: skill
    slug: mcp-builder
    reason: "El proceso del trabajo: diseño del alcance (set mínimo de tools, schemas, paginación, límites lectura/escritura), estructura de implementación, una revisión de seguridad (modelo de auth, mínimo privilegio, confirmación de acciones destructivas) y un plan de tests — para que el server quede endurecido y no apenas generado."
  - kind: connector
    slug: context7
    reason: "Mantiene la construcción sobre terreno actual: resuelve el ID de la librería y trae documentación versionada y ejemplos reales de los SDKs de MCP y las librerías cliente en juego, para que el server apunte a la API que existe hoy y no a la del snapshot de entrenamiento del modelo."
  - kind: cli
    slug: github-cli
    reason: "Donde el trabajo aterriza: scaffold y corrida local del server, y después gh para crear el repo, commitear, abrir el PR y leer el resultado de CI desde la misma terminal donde se está probando el server — sin cambio de contexto al navegador en plena construcción."
---
## Para quién es

Un desarrollador que extiende este stack en vez de solo consumirlo: alguien que envuelve una herramienta interna, una API de un vendor o una base de datos en un servidor MCP para que un cliente agente la use — y que quiere un camino de construcción que termine en un PR revisable, no en un archivo generado a lo vibecoding.

Es el kit para el hueco del catálogo: el producto que necesitás conectado y que ningún conector publicado cubre todavía.

## Qué te ayuda a hacer

- **Acotarlo**: decidir el set mínimo de tools — qué trabajos sirve el server, qué schemas, qué queda read-only, qué escrituras necesitan confirmación — antes de que exista código.
- **Construirlo sobre la API real**: traer documentación actual y versionada con ejemplos del SDK que estás usando mientras escribís el código, en vez de shipear contra una función alucinada.
- **Endurecerlo**: correr la pasada de seguridad — límites de auth, validación de inputs, rate limits, reintentos, idempotencia, gates para acciones destructivas — y el plan de tests para caminos felices, argumentos inválidos, fallos de auth y paginación.
- **Entregarlo**: scaffold, corrida y test local, commit, apertura del PR y seguimiento de CI desde la misma terminal — el server aterriza donde pasa la revisión.

El resultado esperado: un servidor MCP funcionando y probado en un repo con un PR que alguien puede revisar — y un reporte de tests honesto adjunto.

## Qué incluye

### Skills

- **MCP Builder** — el proceso. Acompaña la construcción completa: diseño del alcance, estructura de implementación en TypeScript o Python, revisión de seguridad y plan de tests, con una negativa explícita a llamar "production-ready" a algo antes de que existan tests, revisión de seguridad y evidencia de runbook.

### Conectores

- **Context7** — documentación actual, directo al prompt. Resuelve la librería y devuelve documentación al día, versionada y con ejemplos reales de código. Sin key por defecto (una API key opcional compra rate limits y repos privados).

### CLI tools

- **GitHub CLI** — el camino de entrega. Crea y administra el repo, commitea, abre el PR, mira el estado de CI y responde la revisión — ejecución a nivel terminal, porque la construcción en sí (npm init, correr el server, el inspector) ya vive ahí.

## Cómo usarlo

1. Instalá el kit y autenticate una vez: `gh auth login` para el trabajo del repo. Context7 no necesita key.
2. Primero el alcance, con MCP Builder: *"Quiero exponer nuestra API de facturación como servidor MCP — ayúdame a elegir el set mínimo de tools y qué queda read-only."*
3. Construí con la documentación en el loop: *"Resolvé el SDK de TypeScript de MCP en Context7 y traeme su documentación de definición de tools"* — y escribí el server contra lo que vuelva.
4. Endurecé y probá: corré las pasadas de revisión de seguridad y plan de tests de MCP Builder — incluida la confirmación de acciones destructivas y los casos de fallo de auth.
5. Entregalo: scaffold del repo, commit, `gh pr create`, y mirá CI sin salir de la terminal. El PR es donde otro par de ojos se gana la etiqueta "production-ready".

## Por qué estas piezas van juntas

El kit sigue el loop real de construir una integración, no un montón de herramientas dev:

- MCP Builder es **el proceso** — sin él obtenés un archivo plausible, no un server endurecido; la skill existe justo para mantener alcance, seguridad y tests dentro del loop.
- Context7 es **la verdad del terreno** — los SDKs de MCP se mueven rápido y los modelos responden desde snapshots viejos; el código del kit es tan bueno como la documentación contra la que se escribió.
- GitHub CLI es **donde el trabajo se vuelve revisable** — un server que vive solo en una ventana de chat no se puede probar, revisar ni mergear; el repo y el PR son el entregable.

Instaladas por separado, la documentación está vieja, el proceso es vibes y el artefacto se evapora con el chat. Instaladas juntas: **alcance → construcción con docs actuales → endurecimiento → PR revisable.**

Comparte la categoría dev con Dev Code Review y Ship Supabase App, pero el trabajo es otro: esos revisan código existente y shipean una app sobre Supabase. Este kit crea el conector que falta — es el kit para extender el catálogo, y su salida es el server que los loops de conectores evaluarían después.

## Límites

- **Construye; no bendice.** MCP Builder se niega a llamar "production-ready" a un server sin tests, revisión de seguridad y evidencia de runbook — ese juicio queda en revisión humana. Publicar un conector en el catálogo de TerminalSync pasa por los gates y la revisión del loop de conectores, no por este kit.
- **La API del vendor es tema tuyo**: el kit te ayuda a escribir el server que envuelve una API; credenciales, cuotas y términos de servicio son tuyos de arreglar, y la pasada de seguridad revisa cómo manejás secretos, no los consigue.
- **Context7 cubre librerías públicas y documentadas** — las APIs internas o privadas no están; para esas, tu propia documentación es la fuente y Context7 no tiene nada que traer.
- **Asume terminal.** Este es un kit de construcción para developers; si querés un conector instalado y no construido, instalá uno del catálogo — que es para eso.
- **gh requiere auth y acceso al repo**; el resultado de CI se ve tan bien como tus permisos sobre el repo.
