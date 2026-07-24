---
name: Google Business · Reseñas
logo: /connectors/google-business.svg
category: automation
status: available
simpleTitle: "Tus reseñas, vigiladas y respondidas"
simpleSubtitle: "\"¿Tengo reseñas nuevas?\" \"¿Bajó mi puntaje?\" — la IA lee tus reseñas de Google y te arma las respuestas para que apruebes."
devTitle: "Conector de Google Business Profile (propio)"
devSubtitle: "Servidor MCP propio de TerminalSync sobre la Business Profile API oficial — cuentas, locales, reseñas y respuestas con confirmación."
ctaUrl: "https://business.google.com"
tokenHelpUrl: "https://developers.google.com/my-business/content/basic-setup"
affiliate: false
tagline: "Reseñas vigiladas, respuestas listas"
originalAuthor: "Google (Business Profile API) · conector de Terminal Sync"
originalAuthorUrl: "https://developers.google.com/my-business"
license: "proprietary"
---
Para un negocio local, tus reseñas de Google *son* tu reputación — lo primero que ve un cliente nuevo. Pero aparecen en cualquier momento, y una reseña sin responder por una semana se lee como "acá no les importa". Este conector pone a tu IA a vigilar: lee tus reseñas, te dice cuáles son nuevas, te marca si baja el puntaje, y te arma una respuesta para cada una — que solo publica cuando vos decís que sí.

Preguntale *"¿tengo reseñas nuevas?"* y te las lista, las más nuevas primero, marcando cuáles no respondiste. Preguntale *"¿bajó mi puntaje este mes?"* y lee tu promedio y total. Decile *"armá una respuesta amable a la de 2 estrellas de Beto"* y la escribe — después te la muestra y espera tu OK antes de que salga a la vista de todos.

### Qué le podés pedir

- *"¿Qué reseñas de esta semana todavía no respondí?"*
- *"¿Cuál es mi puntaje promedio y cuántas reseñas tengo?"*
- *"Armá una respuesta cordial a la última de 1 estrella, reconociendo el problema — no la publiques todavía."*

### Cómo se conecta

Google Business es un **conector propio**: corre el servidor chico de Terminal Sync sobre la API oficial de Business Profile de Google — no hay paquete npm para instalar. Lo conectás desde la app (Ajustes → Integraciones → Google Business), y las respuestas de la IA quedan guardadas cifradas en tu Keychain y sincronizadas entre tus máquinas.

Publicar una respuesta es público y no se puede deshacer en silencio, así que las respuestas van **con confirmación**: la IA siempre te muestra el borrador y solo lo publica cuando confirmás.

> Aviso: la API de reseñas de Google requiere un proyecto de Google Cloud con acceso a la Business Profile API aprobado por Google — el único paso de configuración realmente engorroso. El chat de soporte dentro de la app te guía. (Un flujo de "Conectá con Google" de un clic está en camino.)

--- dev ---

Sidecar MCP propio (`terminalsync-google-business-mcp`, en el repo `terminal-sync`) sobre las REST APIs oficiales de Google Business Profile — Account Management (`mybusinessaccountmanagement` v1), Business Information (`mybusinessbusinessinformation` v1), y la superficie legacy `mybusiness` v4 donde viven las reseñas.

Tools:

- **Lectura**: `gbp_list_accounts`, `gbp_list_locations`, `gbp_list_reviews` (autor, estrellas, comentario, respondida/sin responder, más el promedio y el total del local), `gbp_review_summary` (solo el agregado — rápido para "¿bajó mi puntaje?").
- **Escritura (con confirmación)**: `gbp_reply_review` — SAFE TWO-STEP WRITE. Sin `confirm=true` previsualiza la respuesta y no publica nada; con `confirm=true` hace el PUT de la respuesta pública.

La auth es un token OAuth2 con el scope `business.manage`, leído del keychain del OS (env `GOOGLE_BUSINESS_ACCESS_TOKEN` para overrides). Los endpoints de reseñas requieren que el proyecto de Google Cloud tenga el acceso a la Business Profile API otorgado. El modelo de token hoy es un access token guardado; un flujo OAuth de refresh completo (como el auth de Drive de la app) es el follow-up planeado para que la conexión siga viva sin re-pegar.

Licencia: el código del conector es de Terminal Sync; la API y los datos son de Google (propietario).
