# Búsqueda en vivo: fila de fuentes en la landing

Última revisión de marcas: 2026-10-08.

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
Facebook (perfiles públicos), Tripadvisor, Amazon, Walmart, eBay, Airbnb. La
búsqueda de videos de YouTube y Google Jobs no suman fila nueva: ya están
cubiertos por YouTube y Google.

## Cómo prender el lote 3

1. En Vercel → proyecto `terminalsync-web` → Settings → Environment Variables,
   agregar `NEXT_PUBLIC_LIVE_SEARCH_LOTE3` con valor exacto `1` (cualquier otro
   valor es apagado).
2. **Redeployar.** Las `NEXT_PUBLIC_*` se fijan en el build; cambiar la variable
   sin redeploy no hace nada (mismo caso que `NEXT_PUBLIC_MERCADOPAGO_ENABLED`).
3. Verificar: `https://<dominio>/api/live-search-sources` debe decir
   `"lote3": true`, y la fila de `/es` y `/en` debe mostrar las 8 fuentes nuevas.

Solo prenderlo cuando el lote 3 esté en producción en la app.

## Logos: por qué casi todo va como texto

Regla: cada fuente se muestra con su nombre. El logo se agrega **solo** si las
pautas de la marca permiten que un tercero lo use para este tipo de mención sin
pedir permiso. Nombrar la marca en texto para decir que se consulta su
información pública sí está permitido (uso nominativo), siempre sin palabras
que sugieran alianza ("con", "partner", "powered by").

| Marca | Pautas | Qué dicen (resumen) | Simple Icons | Decisión |
|---|---|---|---|---|
| Google (y Google AI, Jobs) | [How to show Google's brand](https://partnermarketinghub.withgoogle.com/brands/google/branding-guidelines/how-to-show-googles-brand/), [guidance](https://about.google/brand-resource-center/guidance/) | No usar el logo ni la "G" en materiales de marketing de otra empresa; los íconos de producto piden aprobación. | Presente | Texto |
| Google Maps | Mismas pautas | Íconos de producto con aprobación; las reglas de atribución de Maps solo cubren apps que usan la API oficial (no es el caso). | Presente | Texto |
| YouTube | [brand.youtube](https://brand.youtube/promoting-your-channel/), [API and device partners](https://brand.youtube/api-and-device-partners/) | El ícono es para promocionar tu canal o en socios de la API oficial; lo demás va por formulario de solicitud. | Presente | Texto |
| Meta | [Meta company brand](https://www.meta.com/brand/resources/meta/company-brand/) | Todo uso del logo de Meta requiere aprobación. | Presente | Texto |
| Facebook | [Facebook logo](https://www.meta.com/brand/resources/facebook/logo/) | Solo archivos oficiales, en su color, sin alterar; ver además la regla de Instagram. | Presente | Texto |
| Instagram | [Instagram brand](https://www.meta.com/brand/resources/instagram/instagram-brand/) | No mostrarlo junto a otras redes sociales salvo en un "Síguenos en…" genérico. Esta fila tiene TikTok y YouTube. | Presente | Texto |
| OpenAI / ChatGPT | [openai.com/brand](https://openai.com/brand/) | Logo solo con permiso y en relación directa con servicios de OpenAI; no sugerir alianza. | Retirado por los mantenedores en v16.0.0 ([#13944](https://github.com/simple-icons/simple-icons/pull/13944)); el de ChatGPT nunca entró ([#8759](https://github.com/simple-icons/simple-icons/pull/8759)) | Texto |
| Perplexity | [Brand guidelines](https://live.standards.site/perplexity/logo) | Guía de diseño con logos descargables y sin restricción para terceros. | Presente | **Logo** (`public/sources/perplexity.svg`, sin alterar, color de marca) |
| Yelp | [yelp.com/brand](https://www.yelp.com/brand) | La licencia del logo cubre a negocios en Yelp, socios con acuerdo y prensa; no usarlo "en conexión con tu negocio". | Presente | Texto |
| TikTok | [TikTok Brand Hub, legal](https://www.tiktokbrandhub.com/legal) | Logo solo con permiso previo por escrito; la palabra "TikTok" se puede usar para referirse a la plataforma. | Presente | Texto |
| Tripadvisor | [Logo guidelines](https://tripadvisor.mediaroom.com/logo-guidelines), [términos](https://tripadvisor.mediaroom.com/us-terms-of-use) | El búho requiere permiso previo por escrito; la licencia de display es para clientes de su Content API. | Presente | Texto |
| Amazon | [Trademark Usage Guidelines](https://www.amazon.com/gp/help/customer/display.html?nodeId=GNYNL3A8HPATWCH8) | Solo licenciatarios y en materiales aprobados por escrito. | Retirado por los mantenedores en v15.0.0 ([#13056](https://github.com/simple-icons/simple-icons/pull/13056)) | Texto |
| Walmart | [Walmart trademarks](https://brandcenter.walmart.com/brand/trademarks) | Logos con consentimiento previo por escrito; pide consentimiento incluso para usar el nombre. | Retirado por los mantenedores en v16.0.0 ([#13927](https://github.com/simple-icons/simple-icons/pull/13927)) | Texto (revisar antes de prender el lote 3; la alternativa conservadora es sacarla) |
| eBay | [Política de propiedad intelectual](https://www.ebay.com/help/policies/member-behavior-policies/ebays-intellectual-property-policy?id=4261) | Logo solo con licencia expresa por escrito; nombrarlo en texto está permitido. | Presente | Texto |
| Airbnb | [Uso de marcas de Airbnb](https://www.airbnb.com/help/article/3233) | Sin permiso formal por escrito no se usa el logo; la mención factual en texto está permitida. | Presente | Texto |

Ninguno de los tres íconos que faltan en Simple Icons (OpenAI, Amazon, Walmart)
fue retirado a pedido del dueño: los sacaron los mantenedores porque las pautas
de esas marcas exigen permiso. El [DISCLAIMER de Simple Icons](https://github.com/simple-icons/simple-icons/blob/develop/DISCLAIMER.md)
aclara que la licencia CC0 no cubre las marcas y que cada usuario debe tener
los permisos que correspondan.

Esto es una lectura de las pautas publicadas por cada marca, no asesoría legal.

### Agregar el logo de una marca

1. Revisar sus pautas actuales y anotar el link y la conclusión en la tabla.
2. Si lo permiten: SVG oficial o de Simple Icons, sin deformar ni recolorear, en
   `public/sources/<slug>.svg`; poner `logo: "<slug>"` en
   `liveSearchSources.ts` (y `darkLogo: true` si es negro/oscuro).
3. Agregar la marca a `LOGO_ALLOWED` en `liveSearchSources.test.ts` y el `<img>`
   al bloque de `public/landing-b/index.html` (mismo formato que Perplexity:
   `alt` con el nombre y el nombre visible con `aria-hidden="true"`).
