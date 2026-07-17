---
name: Kit para Publicar una App Supabase
logo: /logos/ts-kit.svg
category: dev
status: available
tagline: "Construí, revisá, migrá y desplegá una app Supabase + Vercel sin salir de la terminal."
description: "Un flujo de publicación coherente para desarrolladores solos y equipos chicos que construyen sobre Supabase y Vercel: leé y operá el backend, revisá el diff, corré migraciones y desplegá — de punta a punta, desde un solo lugar."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: supabase
    reason: "Lee el schema y los datos y opera el backend sobre el que corre la app, así la IA razona sobre la base real en vez de adivinar su forma."
  - kind: connector
    slug: github
    reason: "Trae el repositorio, el diff y los archivos donde vive el cambio, así la revisión y el despliegue apuntan al código real."
  - kind: skill
    slug: code-reviewer
    reason: "Corre una revisión estructurada del diff antes de publicar — correctitud, casos borde y riesgo — para que el deploy no sea la primera vez que alguien lee el cambio."
  - kind: cli
    slug: supabase-cli
    reason: "Vincula el proyecto y corre migraciones de base de datos y desarrollo local desde la terminal — el paso que realmente cambia el backend."
  - kind: cli
    slug: vercel-cli
    reason: "Despliega el frontend e inspecciona los despliegues desde la terminal, cerrando el ciclo build-a-vivo sin desviarse al navegador."
---
## Para quién es

Desarrolladores solos y equipos chicos que construyen una app web sobre Supabase y Vercel y quieren ir de un cambio a un deploy en vivo sin cablear las mismas herramientas en cada proyecto.

Usalo cuando la misma persona escribe el código, es dueña de la base de datos y publica — y quiere que el camino de revisar-y-desplegar quede en un solo lugar.

## Qué te ayuda a hacer

Este kit convierte "armé una feature" en "está revisada, migrada y en vivo":

- Leer el schema y los datos y operar el backend con Supabase.
- Traer el repo y el diff con GitHub.
- Revisar el cambio con una pasada estructurada antes de publicar, vía Code Reviewer.
- Correr migraciones de base de datos y desarrollo local con el CLI de Supabase.
- Desplegar el frontend y chequear el despliegue con el CLI de Vercel.

El resultado esperado es un cambio revisado que llega a producción con su migración aplicada — no un deploy que sea la primera vez que se leyó el diff.

## Qué incluye

### Conectores

- **Supabase** — lee schema y datos y opera el backend del que depende la app.
- **GitHub** — lee el repositorio, el diff y los archivos donde vive el cambio.

### Asistentes

- **Code Reviewer** — un flujo de revisión estructurado que marca correctitud, casos borde y riesgo antes de que el cambio se publique.

### CLI

- **CLI de Supabase** — vincula el proyecto y corre migraciones y desarrollo local desde la terminal.
- **CLI de Vercel** — despliega el frontend e inspecciona los despliegues desde la terminal.

## Cómo usarlo

1. Instalá el kit, conectá Supabase con su token de acceso, autenticá GitHub, y corré `supabase login` y `vercel login`.
2. Pedile a la IA que lea el schema actual desde Supabase y el diff desde GitHub del cambio que vas a publicar.
3. Que Code Reviewer revise el diff por correctitud, casos borde y cualquier riesgo de schema/datos.
4. Usá el CLI de Supabase para escribir y aplicar la migración que el cambio necesita (`supabase migration new`, `supabase db push`).
5. Desplegá con el CLI de Vercel (`vercel --prod`) y confirmá que el despliegue está en vivo.

## Por qué estas piezas van juntas

El kit es coherente porque cada pieza le pasa la posta a la siguiente:

- Supabase y GitHub le dan el sujeto al trabajo — el backend real y el diff real.
- Code Reviewer le da una compuerta — el cambio se lee con método antes de publicar.
- El CLI de Supabase aplica el cambio de backend; el CLI de Vercel publica el frontend.

Instaladas por separado, la migración y el deploy son dos pasos manuales desconectados con la revisión fácil de saltear. Instaladas juntas, el kit da un camino: **leer el cambio → revisarlo → migrar el backend → desplegar el frontend**.

## Límites

- No decide *qué* construir; te ayuda a publicar lo que ya tenés.
- No mergea, aprueba ni hace rollback por vos — una persona corre la migración y el deploy.
- Supabase, GitHub y Vercel requieren cada uno su cuenta, tokens y logins de CLI, y están sujetos a los límites de esos planes.
- Las migraciones tocan datos reales: revisá vos mismo los cambios destructivos antes de `db push`. El kit revisa el diff, no garantiza una migración segura.
- No reemplaza tests, CI ni un entorno de staging — usalo junto con ellos, no en su lugar.
