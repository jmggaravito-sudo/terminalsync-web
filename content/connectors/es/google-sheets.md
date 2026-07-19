---
name: Google Sheets
logo: /connectors/google-sheets.svg
category: productivity
status: available
simpleTitle: "Tus planillas, respondiendo preguntas"
simpleSubtitle: "La planilla donde llevás ventas, clientes y stock — ahora tu IA la lee y la actualiza por vos."
devTitle: "Conector MCP de Google Sheets"
devSubtitle: "Lectura/escritura por OAuth sobre la Sheets API — get, batch-get, update, batch-update, manejo de planillas y hojas."
ctaUrl: "https://www.google.com/sheets/about/"
tokenHelpUrl: "https://console.cloud.google.com/apis/credentials"
manifest:
  mcpServers:
    google-sheets:
      command: npx
      args: ["-y", "google-sheets-mcp"]
      env:
        GOOGLE_CLIENT_ID: "${SECRET:GOOGLE_CLIENT_ID}"
        GOOGLE_CLIENT_SECRET: "${SECRET:GOOGLE_CLIENT_SECRET}"
affiliate: false
tagline: "Ventas, clientes y stock al alcance de la IA"
originalAuthor: "Adam Jones (@domdomegg)"
originalAuthorUrl: "https://github.com/domdomegg"
license: "MIT"
licenseUrl: "https://github.com/domdomegg/google-sheets-mcp/blob/master/LICENSE"
---
Casi todo negocio chico corre sobre una planilla. Las ventas del mes, la lista de clientes, el inventario, el control de caja — todo vive en un Google Sheet que alguien mantiene a mano. Este conector deja que tu IA abra esa planilla, la lea y la actualice igual que lo harías vos.

Preguntale *"¿cuánto vendimos esta semana?"* y lee la planilla y te responde con el número — sin fórmulas ni tablas dinámicas. Decile *"agregá a María García, $450, pendiente, en la pestaña Pedidos"* y escribe la fila. La planilla en la que ya confiás se vuelve algo con lo que simplemente hablás.

### Qué le podés pedir

- *"En mi hoja 'Ventas', sumá el total de este mes y decime si superamos el mes pasado."*
- *"Agregá una fila a 'Pedidos': cliente María García, monto 450, estado Pendiente."*
- *"Mirá la pestaña 'Inventario' y listame los productos que quedan con menos de 5 unidades."*

### Qué necesitás

Google Sheets usa el inicio de sesión de Google (OAuth), así que en vez de una clave simple lo conectás una vez a través de un **proyecto de Google Cloud**. Suena técnico, pero es una configuración de una sola vez y después funciona en todos tus dispositivos:

1. Entrá a [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials) y creá un proyecto (o elegí uno que ya tengas).
2. Activá la **Google Sheets API** para ese proyecto.
3. Creá un **OAuth client ID** (tipo: Desktop / Web app) y agregá `http://localhost:3000/callback` como URL de redirección autorizada.
4. Copiá el **Client ID** y el **Client Secret** que te da y pegalos cuando el Lab te pida `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`.
5. La primera vez que lo uses, se abre una ventana del navegador para que apruebes el acceso a tus planillas. Después es silencioso.

Los dos valores quedan guardados cifrados en tu Keychain y sincronizados entre tus máquinas — lo configurás en una computadora y ya está listo en el resto.

> Aviso: la configuración de Google Cloud es la única parte realmente engorrosa. Si te trabás, el chat de soporte dentro de la app te guía paso a paso.

--- dev ---

`google-sheets-mcp` (Adam Jones / @domdomegg — el mismo autor de nuestro conector de Airtable) habla la Sheets API por OAuth. Tools verificadas contra el README oficial:

- **Spreadsheet**: `sheets_spreadsheet_get` (metadata + datos de celdas opcional), `sheets_spreadsheet_create`.
- **Values**: `sheets_values_get` (un rango), `sheets_values_batch_get` (varios rangos), `sheets_values_update` (escribe un rango, sobrescribe), `sheets_values_batch_update` (escribe varios rangos).
- **Sheets**: `sheets_sheets_list` (lista las pestañas de una planilla).

La auth es OAuth 2.0 con el scope `spreadsheets` (lectura/escritura completa). Env de configuración: `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` de un OAuth client de Google Cloud, redirect `http://localhost:3000/callback`. El server expone un flujo `/authorize` que redirige a Google y codifica la callback URL del cliente en el state — la primera corrida abre el consent del navegador, los tokens persisten después.

Terminal Sync guarda el client id/secret + refresh token en tu Keychain, sincronizados cifrados entre máquinas con AES-256-GCM. Combina bien con el conector de Google Drive (mismo autor) para buscar, compartir y borrar archivos.

Licencia: MIT. Fuente: github.com/domdomegg/google-sheets-mcp.
