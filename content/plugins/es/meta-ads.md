---
name: Meta Ads
logo: /connectors/meta-ads.svg
category: marketing
status: available
tagline: "Mira qué campaña ya no rinde — y consigue ideas nuevas para probar, en un solo producto."
description: "Junta el conector de Meta Ads (gasto, resultados y rendimiento de campañas de Facebook e Instagram, de solo lectura) con Meta Ads Creator (convierte lo que vendés en varias ideas de aviso distintas y listas para probar), para que 'esta campaña ya cansó' se convierta en creatividades nuevas para testear — sin abrir Ads Manager ni contratar una agencia."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: meta-ads
skillSlugs: ["meta-ads-creator"]
---
## Cuándo usarlo

- Corrés avisos de Facebook o Instagram y querés ver qué campaña ya no rinde sin abrir Ads Manager.
- Cuando encontrás la que cansó, querés varias ideas de aviso nuevas —no una sola corazonada— listas para probar.
- Querés un plan de prueba simple sobre qué idea probar primero, sin agencia y sin resultados inventados.

## Qué hace

Junta dos piezas que se potencian, en un solo install:

- **Meta Ads (el conector)** lee tu gasto, resultados y rendimiento por campaña —CTR, costo por clic, alcance— de solo lectura, así que no puede tocar tus campañas activas.
- **Meta Ads Creator (la skill)** convierte lo que vendés en cinco ideas de aviso distintas, cada una con su texto, el botón, cómo se ve la imagen, y un plan sobre cuál probar primero.

**Un ejemplo real:** querés saber si tus avisos siguen funcionando antes de gastar más. Le decís *"¿cómo viene cada campaña activa esta semana?"*. Meta Ads lee los números y te muestra que el CTR de una campaña viene cayendo hace dos semanas. Le decís *"dame 5 ideas de aviso nuevas para reemplazarla —vendo velas artesanales, en Bogotá, precio medio"*. Meta Ads Creator escribe cinco conceptos distintos con texto y un plan de prueba. Elegís dos para lanzar en Ads Manager.

## Cómo usarlo

1. Instalá el Plugin y conectá Meta Ads con un token de acceso con permiso `ads_read`.
2. Preguntá: *"¿cuánto gasté esta semana y cómo viene cada campaña?"*.
3. Pedí: *"dame 5 ideas de aviso para probar de [lo que vendés], en [ciudad], para [audiencia]"* —elegí cuáles lanzar.

## Por qué el combo funciona

El conector de insights solo te dice que una campaña se está apagando, pero no qué probar después. La skill creadora sola escribe ideas de aviso, pero no sabe cuál de tus campañas realmente necesita reemplazo. Juntos: Meta Ads señala qué está cansado, y Meta Ads Creator te da las próximas ideas para probar —un loop completo de "¿esto funciona?" a "esto es lo que probamos en su lugar", sin cambiar de herramienta.

## Límites

- Meta Ads es **de solo lectura** —nunca pausa, edita o lanza una campaña; eso lo hacés vos en Ads Manager.
- Meta Ads Creator no promete resultados —te da ideas distintas y una forma de probarlas, no un ganador garantizado.
- No adivina tu audiencia ni tu precio: necesita que compartas qué vendés, dónde, a quién y a qué precio.
- Requiere un token de Meta con `ads_read`; solo ve las cuentas publicitarias que ese token alcanza.
