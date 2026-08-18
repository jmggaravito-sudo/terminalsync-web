---
name: Meta Social
logo: /connectors/meta-social.svg
category: messaging
status: available
simpleTitle: "Postea en Instagram y Facebook sin abrir ninguna de las dos apps"
simpleSubtitle: "Escribe el texto, elige la foto — Claude lo publica en tus redes. Tú apruebas, él publica."
devTitle: "Publicación en Instagram + Facebook (via Meta Graph API)"
devSubtitle: "OAuth de página + tokens de IG, publicación IG en dos pasos, posteo directo al feed de la Página — detrás de un gate de aprobación obligatorio."
ctaUrl: "https://developers.facebook.com/docs/instagram-platform/content-publishing"
affiliate: false
tagline: "Una publicación, las dos redes — contigo al mando"
originalAuthor: "Meta Platforms"
originalAuthorUrl: "https://about.meta.com"
license: "proprietary"
---
Construido sobre la Graph API oficial de Meta — la misma familia que usa nuestro conector de WhatsApp. Te deja publicar un posteo (imagen + texto) en tu **Instagram** y en tu **Página de Facebook** sin abrir ninguna de las dos apps.

Claude redacta el texto con tu tono, adjunta la imagen y te muestra exactamente qué va a salir — y en qué cuenta. Nada se publica hasta que tú digas que sí. Postear es público y no se puede deshacer, así que el paso de aprobación no es opcional: **tú apruebas, él postea.**

### Qué le puedes pedir

- *"Postea esta foto en mi Instagram con un texto sobre la promo del finde."*
- *"Comparte este anuncio en mi Página de Facebook."*
- *"Ponlo en las dos — Instagram y Facebook."*
- *"¿En qué cuentas puedo postear?"* — te lista tus Páginas y las cuentas de Instagram vinculadas para que elijas dónde.

### Qué necesitas para conectar

Inicias sesión una vez con Facebook y le das permiso para postear — sin claves de API que copiar ni pegar. Dos requisitos honestos antes de que pueda postear en Instagram:

- Tu Instagram tiene que ser una cuenta **Business o Creator** (el cambio es gratis y está en la configuración de la app de Instagram), y tiene que estar **vinculada a una Página de Facebook**. Un Instagram personal no puede publicar por la API — el conector lo verifica de entrada y te lo dice con claridad si necesitas cambiar, en vez de fallar con un error incomprensible.
- Tienes que ser administrador de la Página de Facebook donde quieres postear.

La conexión pide los permisos **mínimos**: publicar en tu Página y en el Instagram vinculado, y listar tus cuentas. Nada de pauta, mensajes ni de leer tu audiencia.

*Disponible para publicación orgánica en Página de Facebook e Instagram, con aprobación obligatoria antes de cada posteo.*

--- dev ---

Bridges to Meta's **Graph API** for organic publishing. Two surfaces:

- **Facebook Page** — direct post. `POST /{page-id}/photos` (with `caption`) or `POST /{page-id}/feed`, using the Page access token.
- **Instagram** — two-step publish, required by the API: `POST /{ig-user-id}/media` to create a media container (image URL + caption), then `POST /{ig-user-id}/media_publish` with the returned `creation-id`.

**Auth**: Facebook Login for Business → long-lived **User token** → **Page tokens** (`GET /me/accounts`) → linked **IG Business account** (`GET /{page-id}?fields=instagram_business_account`). Refresh/long-lived token stored in the OS keychain (`net.nexflowai.terminalsync`), never on plain disk — same pattern as the Google OAuth flow in `auth/`.

**Scopes (minimum)**: `pages_show_list`, `pages_read_engagement`, `pages_manage_posts` (Facebook Page publish), `instagram_basic`, `instagram_content_publish` (IG publish), `business_management` (Login for Business). No ads, messaging, or insights scopes — organic posting only.

**Preconditions the connector detects**: IG account must be Business/Creator and linked to a Page; the user must be a Page admin. A personal IG returns no `instagram_business_account` on the Page — surfaced as a human-readable setup step, not a raw API error.

**Approval gate**: every publish is an irreversible action and routes through Terminal Sync's confirmation machinery (`safety/`) — the post is previewed and requires explicit user confirmation before any Graph API write. Typed events: `social://publishing`, `social://published` (`{ url }`), `social://needs_approval`, `social://failed`.

**Out of scope for v1**: scheduling, replying to comments, reading metrics, deleting posts, and anything that spends money (paid ads live behind their own gate).

**Status**: organic publishing flow available behind the required Meta connection and approval gate.
