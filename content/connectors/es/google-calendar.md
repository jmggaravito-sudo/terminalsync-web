---
name: Google Calendar
logo: /connectors/google-calendar.svg
category: productivity
status: available
simpleTitle: "Tu calendario, manejado por conversación"
simpleSubtitle: "\"¿Qué tengo mañana?\" \"Agendá a María el jueves a las 3\" — tu IA lee y maneja tu calendario."
devTitle: "Conector MCP de Google Calendar"
devSubtitle: "OAuth sobre la Calendar API — listar calendarios, próximos eventos, crear/editar/borrar eventos, detalle de evento."
ctaUrl: "https://calendar.google.com"
tokenHelpUrl: "https://console.cloud.google.com/apis/credentials"
manifest:
  mcpServers:
    google-calendar:
      command: npx
      args: ["-y", "google-calendar-mcp"]
      env:
        GOOGLE_CLIENT_ID: "${SECRET:GOOGLE_CLIENT_ID}"
        GOOGLE_CLIENT_SECRET: "${SECRET:GOOGLE_CLIENT_SECRET}"
        GOOGLE_REDIRECT_URI: "http://localhost:3000/auth/callback"
affiliate: false
tagline: "Turnos y agenda, sin usar las manos"
originalAuthor: "Yevhen Romanov"
originalAuthorUrl: "https://www.npmjs.com/package/google-calendar-mcp"
license: "MIT"
---
Si tu día es una tira de turnos — clientes, entregas, llamadas, visitas — tu Google Calendar es el mapa real de tu semana. Este conector deja que tu IA lo lea y lo maneje por vos, para que dejes de pelearte con la app mientras estás al teléfono con alguien.

Preguntale *"¿qué tengo mañana?"* y te lee el día. Decile *"agendá a María el jueves a las 3, una hora"* y crea el evento. Preguntale *"¿estoy libre el viernes a la mañana?"* y chequea antes de que te comprometas. Es el asistente que te lleva la agenda — solo que le hablás.

### Qué le podés pedir

- *"¿Qué turnos tengo para lo que queda de la semana?"*
- *"Creá un evento: 'Entrega al depósito', jueves 10am, una hora."*
- *"¿Tengo algo el viernes entre 9 y 12? Si estoy libre, agendá una llamada con el contador."*

### Qué necesitás

Google Calendar inicia sesión con Google (OAuth), así que en vez de una clave simple lo conectás una vez a través de un **proyecto de Google Cloud**. Es una configuración de una sola vez y después funciona en todos tus dispositivos:

1. Entrá a [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials) y creá un proyecto (o reutilizá uno).
2. Activá la **Google Calendar API** para ese proyecto.
3. Creá un **OAuth client ID** y agregá `http://localhost:3000/auth/callback` como URL de redirección autorizada.
4. Copiá el **Client ID** y el **Client Secret** y pegalos cuando el Lab te pida `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`.
5. La primera vez se abre una ventana del navegador para aprobar el acceso a tu calendario. Después es silencioso.

Las credenciales quedan guardadas cifradas en tu Keychain y sincronizadas entre tus máquinas — lo configurás una vez y ya está en todas.

> Aviso: la configuración de Google Cloud es la única parte realmente engorrosa. Si te trabás, el chat de soporte dentro de la app te guía paso a paso. Crear y borrar eventos cambia tu calendario real, así que la IA confirma antes de agendar o cancelar.

--- dev ---

`google-calendar-mcp` (Yevhen Romanov) habla la Calendar API por OAuth. Capacidades verificadas contra el README oficial:

- Traer listas de calendarios y eventos.
- Obtener los próximos eventos de todos los calendarios.
- Crear, editar y borrar eventos; traer el detalle de un evento específico.
- Chequear disponibilidad de una franja horaria antes de agendar.

La auth es OAuth 2.0 (`AUTH_METHOD=google_cloud`). Env de configuración: `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` de un OAuth client de Google Cloud, más `GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback` (un literal fijo, no un secreto). La primera corrida abre el consent del navegador; los tokens persisten después.

Terminal Sync guarda el client id/secret + refresh token en tu Keychain, sincronizados cifrados entre máquinas con AES-256-GCM. Como crear/editar/borrar mutan un calendario real, el escritorio los pasa por un paso de confirmación.

Licencia: MIT. Fuente: npmjs.com/package/google-calendar-mcp.
