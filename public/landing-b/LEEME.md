# Landing B — copiar tal cual

Esta carpeta **es** el landing. No se traduce a componentes, no se rediseña, no se "mejora".
Abre `index.html` desde la vista previa de Vercel y debe verse idéntico al diseño aprobado.

## 1 · Copiar

Copia la carpeta entera a `public/landing-b/` del repo `terminalsync-web`:

```
public/landing-b/
  index.html
  i18n.js
  app-cover-v2.html        ← lo usa el demo "Varios agentes"
  app-cover-v2-en.html
  assets/logo.png
  assets/app-home-cover-v3.png
  assets/app-home-cover-v3-en.png
  demos/  (8 demos)
```

**No edites ningún archivo de esta carpeta.** Si algo no funciona, avisa; no lo arregles cambiando el diseño.

## 2 · Mostrarla en /es y /en — `src/middleware.ts`

Al principio de `middleware()`, antes de todo lo demás:

```ts
import { LANDING_B } from "@/lib/launchFlags";

// Landing B: la portada sirve el HTML estático, tal cual.
if (LANDING_B && /^\/(es|en)\/?$/.test(pathname)) {
  const url = req.nextUrl.clone();
  url.pathname = "/landing-b/index.html";
  const res = NextResponse.rewrite(url);
  if (!req.cookies.get("tsync_landing")) {
    res.cookies.set("tsync_landing", "consumer", { maxAge: 60 * 60 * 24 * 30, sameSite: "lax", path: "/" });
  }
  return res;
}
```

Es un **rewrite**: la URL sigue siendo `/es` o `/en`. El idioma lo toma de esa URL.

## 3 · Lo que ya viene conectado (no hay que hacer nada)

- Todos los botones de descargar y "Probar 7 días gratis" → `/api/download`, cada uno con su `data-cta`.
- Windows → `POST /api/early-access` con `feature: "windows-app"`.
- Medición: `cta_click` y `scroll_75` a Vercel Analytics, con los mismos nombres que `CtaTracker`.
- ES/EN navega entre `/es` y `/en`.
- Pie: `/legal/privacy`, `/legal/terms`, `/casos-de-uso`, `/connectors`.

## 4 · Lo que NO se toca

- Login, admin, checkout, conectores, legales: no cambian. El rewrite solo agarra `/es` y `/en` exactos.
- El componente `LandingB.tsx` y la carpeta `src/components/landing-b/` que ya existen: **ya no se usan.** Pueden quedar o borrarse; con el rewrite no se renderizan.
- `page.tsx` se queda como está (la portada vieja vuelve sola con `LANDING_B = false`).

## 5 · Verificar en la vista previa

Antes de `LANDING_B = true` en `main`, manda capturas de:
- `/es` y `/en` a 1280px · `/es` a 390px
- un demo abierto (clic en cualquiera)
- `/es/login` y `/es/admin` (deben seguir igual)

Comparar con `TerminalSync - Landing B (standalone).html`. Si algo se ve distinto, es un error.
