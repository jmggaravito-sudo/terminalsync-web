---
name: Gmail
logo: /connectors/gmail.svg
category: messaging
status: available
simpleTitle: "Tu inbox, hablando con tu IA"
simpleSubtitle: "\"¿Algo urgente hoy?\" \"Resumime los correos de mi cliente X\" — sin pegar nada."
devTitle: "Conector MCP de Gmail"
devSubtitle: "OAuth sobre la Gmail API — leer/buscar mensajes e hilos, enviar y administrar (etiquetas, archivar)."
ctaUrl: "https://gmail.com"
tokenHelpUrl: "https://console.cloud.google.com/apis/credentials"
manifest:
  mcpServers:
    gmail:
      command: npx
      args: ["-y", "gmail-mcp"]
      env:
        GOOGLE_CLIENT_ID: "${SECRET:GOOGLE_CLIENT_ID}"
        GOOGLE_CLIENT_SECRET: "${SECRET:GOOGLE_CLIENT_SECRET}"
affiliate: false
tagline: "Triage inteligente en el inbox"
originalAuthor: "Adam Jones (@domdomegg)"
originalAuthorUrl: "https://github.com/domdomegg/gmail-mcp"
license: "MIT"
licenseUrl: "https://github.com/domdomegg/gmail-mcp/blob/master/LICENSE"
---
Llegás a la mañana con 80 correos sin leer. Le preguntás *"¿qué es urgente hoy?"* y tu IA lee tu inbox y te dice lo que de verdad importa. Le pedís *"resumime lo que mandó el cliente X esta semana"* y trae el hilo y te da la idea. Es el conector que convierte tu inbox de una pila que da miedo en algo que simplemente preguntás — y es del que dependen, sin hacer ruido, la mayoría de tus automatizaciones.

Decile *"redactame una respuesta para María con tono formal"* y la arma. Nunca envía solo — vos revisás, y recién ahí manda cuando le decís.

### Qué le podés pedir

- *"¿Qué entró durante la noche que necesite respuesta hoy?"*
- *"Buscá el correo con la cotización del proveedor de León y decime el precio."*
- *"Redactame una respuesta amable confirmando la reunión del jueves — no la mandes todavía."*

### Qué necesitás

Gmail usa el inicio de sesión de Google (OAuth), igual que nuestros conectores de Google Sheets y Calendar — así que si configuraste esos, este reutiliza el mismísimo proyecto de Google:

1. Entrá a [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials) y creá un proyecto (o reutilizá el de Sheets/Calendar).
2. Activá la **Gmail API** para ese proyecto.
3. Creá un **OAuth client ID** y copiá el **Client ID** y el **Client Secret**.
4. Pegalos cuando el Lab te pida `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`.
5. La primera vez se abre una ventana del navegador para aprobar el acceso a tu inbox. Después es silencioso.

Los dos valores quedan guardados cifrados en tu Keychain y sincronizados entre tus máquinas.

> Aviso: leer y buscar corren libremente; **enviar un correo le sale a una persona real**, así que la IA te muestra el borrador y solo envía cuando confirmás. Si ya configuraste Sheets o Calendar, usá el mismo proyecto de Google acá y te salteás casi toda la configuración.

--- dev ---

`gmail-mcp` (Adam Jones / @domdomegg — el mismo autor de nuestros conectores de Google Sheets y Airtable) habla la Gmail API por OAuth. Tools verificadas contra el README: lectura/búsqueda — `gmail_get_profile`, `gmail_messages_list` (search operators), `gmail_message_get`, `gmail_threads_list`; escritura/administración — `gmail_message_send`, `gmail_message_forward`, `gmail_message_modify` (etiquetas), `gmail_message_archive`, `gmail_message_trash`/`_untrash`, `gmail_message_delete`.

La auth es OAuth 2.0 con `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` (el server actúa como OAuth proxy hacia Google — mismo patrón que `google-sheets-mcp`, así un solo proyecto de Google respalda Sheets, Calendar y Gmail). La primera corrida abre el consent del navegador; los tokens persisten después.

Terminal Sync guarda el client id/secret + refresh token en tu Keychain, sincronizados cifrados entre máquinas con AES-256-GCM. Los envíos son públicos/irreversibles, así que el escritorio pasa `gmail_message_send`/`_forward`/`_delete` por un paso de confirmación; leer y buscar corren libremente.

Licencia: MIT. Fuente: github.com/domdomegg/gmail-mcp.
