---
name: Intercom
logo: /connectors/intercom.svg
category: support
status: available
simpleTitle: "Tu bandeja de soporte, atendida con vos"
simpleSubtitle: "\"Mostrame las conversaciones sin leer\" \"Buscá al cliente juan@empresa.com\" — la IA revisa tu Intercom y prepara la respuesta."
devTitle: "Conector de Intercom (propio)"
devSubtitle: "Servidor MCP propio de TerminalSync sobre la Intercom API oficial — listar conversaciones, leerlas, buscar contactos y responder con confirmación."
ctaUrl: "https://www.intercom.com"
tokenHelpUrl: "https://developers.intercom.com/building-apps/docs/authentication-types"
affiliate: false
tagline: "Leer, entender y responder tu soporte"
originalAuthor: "Intercom (REST API) · conector de Terminal Sync"
originalAuthorUrl: "https://developers.intercom.com/docs/references/rest-api/api.intercom.io/"
license: "proprietary"
---
Cuando tus clientes te escriben por **Intercom** — dudas, reclamos, pedidos — mantenerte al día es un laburo aparte. Este conector pone a tu IA a ayudarte: pedile que revise tu bandeja en palabras simples y te dice qué conversaciones necesitan atención, encuentra al cliente que buscás y prepara la respuesta por vos.

Preguntale *"¿qué conversaciones tengo sin leer?"* y te lista lo que quedó pendiente. Decile *"buscá al cliente ana@empresa.com"* y te trae su ficha. Pedile *"respondele que ya lo solucionamos"* y redacta la respuesta — pero recién la manda después de mostrártela y que confirmes, porque una respuesta la ve el cliente.

### Qué le podés pedir

- *"Mostrame las conversaciones de soporte sin leer."*
- *"Leé la conversación de este cliente y resumime el problema."*
- *"Respondele a esta conversación que le mandamos el reemplazo hoy."*

### Cómo se conecta

Intercom es un **conector propio**: corre el servidor chico de Terminal Sync sobre la API oficial de Intercom — no hay paquete npm para instalar. Lo conectás desde la app (Ajustes → Integraciones → Intercom), y tu token de acceso queda guardado cifrado en tu Keychain y sincronizado entre tus máquinas.

Leer y buscar corren libremente; **responderle a un cliente sale hacia afuera**, así que la IA te muestra qué va a mandar y solo envía la respuesta cuando confirmás.

> Aviso: para conectar, generá un token de acceso desde el Developer Hub de Intercom — el chat de soporte dentro de la app te guía. (Un flujo de "Conectá con Intercom" por OAuth está en camino.)

--- dev ---

Sidecar MCP propio (`terminalsync-intercom-mcp`, en el repo `terminal-sync`) sobre la Intercom REST API oficial (base `api.intercom.io`, header `Intercom-Version: 2.11`). Endpoints sacados del SDK oficial `intercom-client` de npm (v7.x).

Tools:

- **Lectura**: `intercom_me` (GET /me — quién está conectado), `intercom_list_conversations` (GET /conversations — id, estado open/closed, leído/sin leer), `intercom_get_conversation` (GET /conversations/{id} — todos los mensajes), `intercom_find_contact` (POST /contacts/search por email).
- **Escritura (con confirmación)**: `intercom_reply` (POST /conversations/{id}/reply, `message_type: comment`, `type: admin`) — SAFE TWO-STEP WRITE. Sin `confirm=true` previsualiza y no manda nada; con `confirm=true` primero resuelve el `admin_id` con GET /me y después envía la respuesta.

Los bodies de Intercom vienen en HTML, así que el sidecar los limpia a texto plano antes de mostrarlos. La auth es un token de acceso de Intercom (Access Token de una app, o Personal Access Token), leído del keychain del OS (env `INTERCOM_ACCESS_TOKEN` para overrides). Terminal Sync guarda el token en tu Keychain, sincronizado cifrado entre máquinas con AES-256-GCM. Un flujo OAuth completo es el follow-up planeado para no re-pegar el token.

Licencia: el código del conector es de Terminal Sync; la API y los datos son de Intercom (propietario).
