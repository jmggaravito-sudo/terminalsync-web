# Búsqueda en vivo: fila de fuentes en la landing

Revisión de pautas de marca: 2026-10-08. Decisión de JM sobre logos: 2026-10-09.

La landing muestra, debajo de las integraciones, una fila propia: **"La IA de TS
busca en vivo en…" / "TS AI searches live on…"**. Son las fuentes públicas que
la IA de TS consulta sola con la Búsqueda en vivo (gratis, incluida en el plan).

- **No son integraciones.** Las integraciones son cuentas que el cliente conecta
  (`public/connectors/`, `IntegrationsMarquee`). Estas fuentes no piden cuenta
  ni conexión, por eso van en una fila separada, con su rótulo y su carpeta de
  logos (`public/sources/`).
- **No se nombra al proveedor de búsqueda** que hay detrás.
- Debajo de la fila va la nota: "Las marcas pertenecen a sus respectivos
  dueños. TS consulta información pública; no implica afiliación."

## Dónde vive

| Pieza | Archivo |
|---|---|
| Lista única de fuentes + interruptor | `src/lib/liveSearchSources.ts` |
| Portada activa (HTML estático, `LANDING_B = true`) | `public/landing-b/index.html` (bloque `data-live-search`) + `public/landing-b/i18n.js` |
| Portada React (la que vuelve con `LANDING_B = false`) | `src/components/landing/IntegrationsMarquee.tsx` |
| Interruptor para el HTML estático | `GET /api/live-search-sources` → `{ lote3, sources }` |
| Test que mantiene todo sincronizado | `src/lib/liveSearchSources.test.ts` |

`/es` y `/en` hoy los sirve el middleware con el HTML estático de Landing B, que
no puede leer env vars. Por eso ese HTML trae las fuentes del lote 3 escritas
pero con `hidden`, y las muestra solo si `/api/live-search-sources` responde
`lote3: true`. Si la llamada falla, quedan ocultas. Si cambiás la lista en
`liveSearchSources.ts`, actualizá el bloque del HTML: el test falla si no
coinciden (nombres, orden, logos, `hidden` del lote 3, traducciones).

## Qué se muestra

**En producción (siempre visible):** Google (web, Noticias, Shopping, Trends,
anuncios de Google, Google AI), Google Maps (incluye reseñas de Google),
YouTube (subtítulos), Biblioteca de anuncios de Meta / Meta Ad Library
(Facebook e Instagram), ChatGPT, Perplexity, Yelp.

**Lote 3 (detrás del interruptor, apagado por defecto):** TikTok, Instagram,
Facebook (perfiles públicos), Tripadvisor, Amazon, eBay, Airbnb. La búsqueda de
videos de YouTube y Google Jobs no suman fila nueva: ya están cubiertos por
YouTube y Google. **Walmart no va** (decisión de JM del 2026-10-09).

## Cómo prender el lote 3

1. En Vercel → proyecto `terminalsync-web` → Settings → Environment Variables,
   agregar `NEXT_PUBLIC_LIVE_SEARCH_LOTE3` con valor exacto `1` (cualquier otro
   valor es apagado).
2. **Redeployar.** Las `NEXT_PUBLIC_*` se fijan en el build; cambiar la variable
   sin redeploy no hace nada (mismo caso que `NEXT_PUBLIC_MERCADOPAGO_ENABLED`).
3. Verificar: `https://<dominio>/api/live-search-sources` debe decir
   `"lote3": true`, y la fila de `/es` y `/en` debe mostrar las 7 fuentes nuevas.

Solo prenderlo cuando el lote 3 esté en producción en la app.

## Logos: decisión de JM del 2026-10-09

**Todas las fuentes van con logo y nombre, y Walmart sale de la fila.** JM lo
decidió el 2026-10-09 ("Logos igual. Saca a Walmart"), asumiendo el riesgo de
marca: la revisión de pautas del 2026-10-08 (tabla de abajo) encontró que casi
todas estas marcas piden aprobación, licencia o pertenecer a un programa de
socios para que un tercero use su logo; solo Perplexity no lo restringe. La
nota "Las marcas pertenecen a sus respectivos dueños. TS consulta información
pública; no implica afiliación." va siempre debajo de la fila, y el copy evita
palabras que sugieran alianza ("con", "partner", "powered by").

`liveSearchSources.test.ts` verifica que cada fuente tenga logo, que Walmart no
aparezca (lista, HTML, `i18n.js`, `public/sources/`) y que el HTML estático
coincida con la lista.

### Origen de cada SVG

Todos locales en `public/sources/`, sin CDN. El trazo es el de Simple Icons sin
modificar (viewBox 24×24, un solo color); solo se agrega `fill` con el color de
la marca.

| Fuente | Archivo | Origen | Color |
|---|---|---|---|
| Google | `google.svg` | simple-icons@16.34.0 `google` | #4285F4 |
| Google Maps | `google-maps.svg` | simple-icons@16.34.0 `googlemaps` | #4285F4 |
| YouTube | `youtube.svg` | simple-icons@16.34.0 `youtube` | #FF0000 |
| Biblioteca de anuncios de Meta | `meta.svg` | simple-icons@16.34.0 `meta` | #0467DF |
| ChatGPT | `chatgpt.svg` | simple-icons@15.22.0 `openai` (último release que lo trae; fuente declarada: openai.com/brand) | #000000 (OpenAI usa el logo en negro o blanco), `darkLogo` |
| Perplexity | `perplexity.svg` | simple-icons@16.34.0 `perplexity` | #1FB8CD |
| Yelp | `yelp.svg` | simple-icons@16.34.0 `yelp` | #FF1A1A |
| TikTok | `tiktok.svg` | simple-icons@16.34.0 `tiktok` | #000000, `darkLogo` |
| Instagram | `instagram.svg` | simple-icons@16.34.0 `instagram` | #FF0069 |
| Facebook | `facebook.svg` | simple-icons@16.34.0 `facebook` | #0866FF |
| Tripadvisor | `tripadvisor.svg` | simple-icons@16.34.0 `tripadvisor` | #34E0A1 |
| Amazon | `amazon.svg` | simple-icons@14.15.0 `amazon` (último release que lo trae; fuente declarada: amazon.com) | #FF9900 |
| eBay | `ebay.svg` | simple-icons@16.34.0 `ebay` | #E53238 |
| Airbnb | `airbnb.svg` | simple-icons@16.34.0 `airbnb` | #FF5A5F |

OpenAI y Amazon ya no están en la versión actual de Simple Icons: sus
mantenedores los retiraron porque esas marcas exigen permiso, no a pedido de los
dueños ([#13944](https://github.com/simple-icons/simple-icons/pull/13944),
[#13056](https://github.com/simple-icons/simple-icons/pull/13056)). Si se
prefiere el archivo del kit de prensa de la marca, se reemplaza el SVG con el
mismo nombre y no hay que tocar código.

`darkLogo: true` (ChatGPT, TikTok) pone un fondo claro detrás del logo en tema
oscuro para que se siga viendo; es el equivalente de `DARK_LOGOS` en
`IntegrationsMarquee`.

### Revisión de pautas del 2026-10-08 (antes de la decisión)

| Marca | Pautas | Qué dicen (resumen) | Simple Icons |
|---|---|---|---|
| Google (y Google AI, Jobs) | [How to show Google's brand](https://partnermarketinghub.withgoogle.com/brands/google/branding-guidelines/how-to-show-googles-brand/), [guidance](https://about.google/brand-resource-center/guidance/) | No usar el logo ni la "G" en materiales de marketing de otra empresa; los íconos de producto piden aprobación. | Presente |
| Google Maps | Mismas pautas | Íconos de producto con aprobación; las reglas de atribución de Maps solo cubren apps que usan la API oficial (no es el caso). | Presente |
| YouTube | [brand.youtube](https://brand.youtube/promoting-your-channel/), [API and device partners](https://brand.youtube/api-and-device-partners/) | El ícono es para promocionar tu canal o en socios de la API oficial; lo demás va por formulario de solicitud. | Presente |
| Meta | [Meta company brand](https://www.meta.com/brand/resources/meta/company-brand/) | Todo uso del logo de Meta requiere aprobación. | Presente |
| Facebook | [Facebook logo](https://www.meta.com/brand/resources/facebook/logo/) | Solo archivos oficiales, en su color, sin alterar; ver además la regla de Instagram. | Presente |
| Instagram | [Instagram brand](https://www.meta.com/brand/resources/instagram/instagram-brand/) | No mostrarlo junto a otras redes sociales salvo en un "Síguenos en…" genérico. | Presente |
| OpenAI / ChatGPT | [openai.com/brand](https://openai.com/brand/) | Logo solo con permiso y en relación directa con servicios de OpenAI; no sugerir alianza. | Retirado por los mantenedores en v16.0.0 ([#13944](https://github.com/simple-icons/simple-icons/pull/13944)); el de ChatGPT nunca entró ([#8759](https://github.com/simple-icons/simple-icons/pull/8759)) |
| Perplexity | [Brand guidelines](https://live.standards.site/perplexity/logo) | Guía de diseño con logos descargables y sin restricción para terceros. | Presente |
| Yelp | [yelp.com/brand](https://www.yelp.com/brand) | La licencia del logo cubre a negocios en Yelp, socios con acuerdo y prensa; no usarlo "en conexión con tu negocio". | Presente |
| TikTok | [TikTok Brand Hub, legal](https://www.tiktokbrandhub.com/legal) | Logo solo con permiso previo por escrito; la palabra "TikTok" se puede usar para referirse a la plataforma. | Presente |
| Tripadvisor | [Logo guidelines](https://tripadvisor.mediaroom.com/logo-guidelines), [términos](https://tripadvisor.mediaroom.com/us-terms-of-use) | El búho requiere permiso previo por escrito; la licencia de display es para clientes de su Content API. | Presente |
| Amazon | [Trademark Usage Guidelines](https://www.amazon.com/gp/help/customer/display.html?nodeId=GNYNL3A8HPATWCH8) | Solo licenciatarios y en materiales aprobados por escrito. | Retirado por los mantenedores en v15.0.0 ([#13056](https://github.com/simple-icons/simple-icons/pull/13056)) |
| eBay | [Política de propiedad intelectual](https://www.ebay.com/help/policies/member-behavior-policies/ebays-intellectual-property-policy?id=4261) | Logo solo con licencia expresa por escrito; nombrarlo en texto está permitido. | Presente |
| Airbnb | [Uso de marcas de Airbnb](https://www.airbnb.com/help/article/3233) | Sin permiso formal por escrito no se usa el logo; la mención factual en texto está permitida. | Presente |

El [DISCLAIMER de Simple Icons](https://github.com/simple-icons/simple-icons/blob/develop/DISCLAIMER.md)
aclara que la licencia CC0 no cubre las marcas y que cada usuario debe tener
los permisos que correspondan. Esta tabla es una lectura de las pautas
publicadas por cada marca, no asesoría legal.

### Agregar una fuente nueva

1. SVG local en `public/sources/<slug>.svg` (Simple Icons o el kit de prensa de
   la marca, sin deformar ni recolorear).
2. Entrada en `LIVE_SEARCH_SOURCES` (`liveSearchSources.ts`) con `logo:
   "<slug>"`, `batch` y `darkLogo: true` si el logo es negro/oscuro.
3. El mismo chip en el bloque `data-live-search` de
   `public/landing-b/index.html` (`<img alt="…">` + `<span
   aria-hidden="true">…</span>`, con `hidden` y `data-live-search-lote="3"` si
   va en el lote 3), y la traducción en `i18n.js` si el nombre cambia en inglés.
4. Sumar la marca a esta doc. El test falla si algo de lo anterior no coincide.
