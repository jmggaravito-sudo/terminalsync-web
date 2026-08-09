---
name: Meta Ads
logo: /connectors/meta-ads.svg
category: automation
status: available
simpleTitle: "Preguntale a tu IA cómo van tus anuncios de Facebook e Instagram"
simpleSubtitle: "Conector propio de Terminal Sync sobre la API oficial de Meta: gasto, resultados y campañas — solo lectura."
devTitle: "Meta Ads Insights Connector"
devSubtitle: "Servidor MCP first-party (solo lectura) sobre la Marketing (Graph) API oficial de Meta."
ctaUrl: "https://business.facebook.com"
tokenHelpUrl: "https://developers.facebook.com/docs/marketing-api/overview/authorization"
affiliate: false
tagline: "Tus campañas de Meta, vigiladas por el agente"
originalAuthor: "Terminal Sync"
originalAuthorUrl: "https://terminalsync.ai"
license: "proprietary"
licenseUrl: "https://terminalsync.ai"
---
**Meta Ads** son los anuncios de Facebook e Instagram. Este conector es **propio de Terminal Sync**: hablamos con la **Marketing API oficial** de Meta para que tu asistente **mire cómo van tus campañas** y te responda en lenguaje natural — sin que tengas que entrar al Administrador de anuncios.

Es la pieza que hace posible el trabajo automatizado **"Vigía de campañas"**: la IA revisa el gasto y los resultados y te avisa antes de que se te vaya el presupuesto.

Se conecta **desde adentro de la app**, en **Ajustes → Integraciones → Meta Ads**. Es **solo lectura**: la IA lee tus métricas, **no cambia ni pausa tus anuncios**, así que es seguro desde el día uno. Tu token se guarda **cifrado en tu computadora**.

### Qué le podés preguntar

- *"¿Cuánto gasté esta semana en anuncios y cuántos resultados tuve?"*
- *"¿Cómo viene cada campaña activa — CTR, costo por clic, alcance?"*
- *"¿Qué cuentas publicitarias tengo conectadas?"*

### Qué necesitás

Necesitás un **token de acceso de Meta** con permiso de lectura de anuncios (`ads_read`), que se genera en el ecosistema de desarrolladores de Meta. La guía oficial está en [developers.facebook.com](https://developers.facebook.com/docs/marketing-api/overview/authorization). Después lo pegás en **Ajustes → Integraciones → Meta Ads**, probás la conexión y listo.

> **Nota:** Meta pide más pasos que otras plataformas para dar acceso. Estamos trabajando en un botón **"Conectá con Facebook"** que simplifica todo esto — por ahora se usa un token.

--- dev ---

Conector **first-party**: Terminal Sync bundlea su propio servidor MCP (`terminalsync-meta-ads-mcp`, sidecar Tauri) que habla la **Marketing (Graph) API** de Meta. **Solo lectura (insights)** — no muta campañas. Meta no publica un MCP operador oficial para el dueño (los npm son de terceros); por eso el build propio.

**Config (inyectada por la app desde el almacén cifrado):** `META_ADS_ACCESS_TOKEN` (token con `ads_read`, guardado en el llavero del sistema, nunca en un archivo de config), y `META_ADS_API_VERSION` opcional.

**Tools:** `meta_ads_list_accounts`, `meta_ads_list_campaigns`, `meta_ads_insights` (gasto, impresiones, clics, CTR, CPC, CPM, alcance, por cuenta o campaña y `date_preset`).

La conexión se hace desde **Ajustes → Integraciones → Meta Ads** (verifica el token antes de guardar y cablea el servidor en Claude/Codex/Gemini). **Auth:** un token de larga duración sirve hoy; el camino para el dueño no técnico es un flujo OAuth "Conectá con Facebook" (app de Meta + review de `ads_read`). Fuente: Marketing API oficial de Meta (`developers.facebook.com`).
