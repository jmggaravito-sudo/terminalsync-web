---
name: Dropbox
logo: /connectors/dropbox.svg
category: storage
status: available
simpleTitle: "Tu Dropbox, buscable por voz"
simpleSubtitle: "\"Buscá el contrato del cliente X\" \"Pasame la factura de marzo\" — la IA busca en tu Dropbox por vos."
devTitle: "Conector de Dropbox (propio)"
devSubtitle: "Servidor MCP propio de TerminalSync sobre la Dropbox API v2 oficial — listar, buscar, links temporales, links públicos con confirmación."
ctaUrl: "https://www.dropbox.com"
tokenHelpUrl: "https://www.dropbox.com/developers/apps"
affiliate: false
tagline: "Encontrar y compartir archivos, sin manos"
originalAuthor: "Dropbox (API v2) · conector de Terminal Sync"
originalAuthorUrl: "https://www.dropbox.com/developers/documentation"
license: "proprietary"
---
Cuando los archivos que hacen andar tu negocio viven en **Dropbox** — contratos, facturas, propuestas, fotos — encontrar el que buscás es la mitad del laburo. Este conector pone a tu IA a hacerlo: pedile un archivo en palabras simples y busca, lo encuentra y te pasa el link. Sin escarbar entre carpetas.

Preguntale *"buscá el contrato del cliente León"* y busca y te da el archivo. Preguntale *"pasame un link a la factura de marzo"* y arma un link de descarga temporal. Decile *"compartí la carpeta del catálogo con un link público"* y crea uno — pero recién después de mostrártelo y que confirmes, porque un link público lo ve cualquiera que lo tenga.

### Qué le podés pedir

- *"Buscá la propuesta firmada del proyecto García y dame el link."*
- *"¿Qué hay en mi carpeta 'Facturas' de este mes?"*
- *"Creá un link público para compartir el PDF de la lista de precios."*

### Cómo se conecta

Dropbox es un **conector propio**: corre el servidor chico de Terminal Sync sobre la API oficial de Dropbox — no hay paquete npm para instalar. Lo conectás desde la app (Ajustes → Integraciones → Dropbox), y tu token de acceso queda guardado cifrado en tu Keychain y sincronizado entre tus máquinas.

Leer y buscar corren libremente; **crear un link público sale hacia afuera**, así que la IA te muestra qué va a compartir y solo crea el link cuando confirmás.

> Aviso: para conectar, creá una app de Dropbox en la consola de desarrolladores y generá un token de acceso — el chat de soporte dentro de la app te guía. (Un flujo de "Conectá con Dropbox" por OAuth está en camino.)

--- dev ---

Sidecar MCP propio (`terminalsync-dropbox-mcp`, en el repo `terminal-sync`) sobre la Dropbox API v2 oficial. Endpoints sacados del SDK oficial `dropbox` de npm (v10.37.1).

Tools:

- **Lectura**: `dropbox_account` (get_current_account — quién está conectado), `dropbox_list_files` (files/list_folder), `dropbox_search` (files/search_v2), `dropbox_get_link` (files/get_temporary_link — link de descarga de ~4 h, no público).
- **Escritura (con confirmación)**: `dropbox_share_link` (sharing/create_shared_link_with_settings) — SAFE TWO-STEP WRITE. Sin `confirm=true` previsualiza y no crea nada; con `confirm=true` crea el link público.

La auth es un token OAuth2 de Dropbox, leído del keychain del OS (env `DROPBOX_ACCESS_TOKEN` para overrides). Terminal Sync guarda el token en tu Keychain, sincronizado cifrado entre máquinas con AES-256-GCM. Un flujo OAuth de refresh completo es el follow-up planeado para no re-pegar el token.

Licencia: el código del conector es de Terminal Sync; la API y los datos son de Dropbox (propietario).
