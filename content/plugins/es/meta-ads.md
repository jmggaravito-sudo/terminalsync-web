---
name: Meta Ads
logo: /plugins/meta-ads.svg
category: marketing
status: available
tagline: "Escribí el lote de anuncios y después mirá cómo rinde — la IA hace las dos cosas."
description: "Junta el conector de Meta Ads (lee gasto, resultados y campañas, solo lectura) con Meta Ads Creator (redacta cinco ideas distintas de anuncios para Facebook/Instagram con copy y un plan de prueba), para que revises tu cuenta antes de redactar más y la vuelvas a revisar después de lanzar."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: meta-ads
skillSlugs: ["meta-ads-creator"]
---
## Cuándo usarlo

- Querés ideas nuevas de anuncios para Facebook/Instagram listas para probar, y también querés saber cómo van tus campañas actuales — sin saltar entre un doc de copy y Ads Manager.
- Manejás vos mismo tus anuncios para un negocio chico y querés el lote creativo y la revisión de rendimiento en un solo lugar.
- Querés que la IA te diga qué ya está funcionando antes de darte cinco ideas más para probar.

## Qué hace

Junta dos piezas que se potencian, en un solo install:

- **Meta Ads (el conector)** lee tus cuentas publicitarias, campañas y métricas —gasto, impresiones, clics, CTR, CPC, CPM, alcance— **solo lectura**, así que nunca toca tus campañas.
- **Meta Ads Creator (la skill)** convierte lo que vendés en cinco ideas distintas de anuncio con copy, dirección de imagen y formatos, más un plan de qué probar primero —y siempre cierra con un veredicto puntuado, nunca con números de venta inventados.

**Un ejemplo real:** querés ideas nuevas de anuncios, pero no estás seguro de que sea la semana indicada para sumar otra prueba —una campaña ya podría estar gastando rápido. Le decís *"revisá cómo van mis campañas activas esta semana, y si hay margen, dame 5 ideas nuevas de anuncios para mi oferta de primavera"*. El conector reporta gasto y CTR por campaña así ves que hay margen de presupuesto, y Meta Ads Creator redacta cinco ideas distintas con copy, dirección de imagen y un plan de prueba, cerrando con un veredicto 🟢/🟡/🔴 sobre cuál probar primero.

## Cómo usarlo

1. Instalá el Plugin y conectá tu cuenta de Meta Ads (pegá tu token de acceso con `ads_read` en Ajustes → Integraciones → Meta Ads).
2. Preguntá: *"¿cómo van mis campañas esta semana?"* —el conector lee gasto y resultados.
3. Pedí: *"dame 5 ideas de anuncios de Meta para [tu oferta]"* —la skill redacta el lote con veredicto.
4. Lanzá el ganador en Ads Manager vos mismo, y después volvé a preguntarle al conector cómo le fue.

## Por qué el combo funciona

La skill de creación sola no sabe qué ya está gastando o funcionando en tu cuenta, así que redacta a ciegas. El conector solo te muestra números pero no los convierte en un lote nuevo de anuncios para probar. Juntos: la IA revisa tu rendimiento real antes de recomendar más gasto, redacta ideas informadas por ese contexto, y después lee cómo le fue realmente a la prueba —un ciclo, no un evento aislado.

## Límites

- **Solo lectura**: nunca publica, edita ni pausa tus anuncios —vos lanzás y gestionás el creativo dentro de Ads Manager.
- No garantiza ventas, ROAS ni CPA —el veredicto de la skill es un puntaje de qué tan lista está la creatividad, no una promesa de mercado.
- Requiere conectar un token de acceso de Meta con `ads_read`; un flujo de un clic "Conectar con Facebook" está en camino, por ahora es pegar un token.
