---
name: Canva
logo: /plugins/canva.svg
category: marketing
status: available
tagline: "Diseños que parecen de tu empresa, porque las reglas de marca se fijaron antes."
description: "Junta el conector de Canva (MCP oficial de Canva: genera, edita y exporta diseños con tu propia cuenta de Canva) con Guías de Marca (convierte el material de marca que tengas en una ficha de marca funcional y la aplica), para que lo que el agente diseñe salga de tus colores, tu tipografía y tu tono en vez de los genéricos de la IA."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: canva
skillSlugs: ["brand-guidelines"]
---
## Cuándo usarlo

- Haces tus propios posts, flyers y presentaciones en Canva y el resultado está "bien" pero es genérico: nadie nota que salió de tu empresa.
- Tu marca existe en algún lado (una guía en PDF, tu sitio, posts anteriores) pero nada la aplica de forma consistente cuando el diseño hay que sacarlo hoy.
- Quieres la marca decidida antes de que exista el diseño — colores exactos, una tipografía con respaldo, reglas de tono y una lista de qué sí y qué no — en lugar de corregir las invenciones del agente después.

## Qué hace

Junta dos piezas que se refuerzan, en una sola instalación:

- **Canva (el conector)** es el MCP oficial hospedado de Canva: con tu propia cuenta de Canva (sin pegar ninguna API key), el agente genera, edita, encuentra y exporta tus diseños — posts, flyers, presentaciones — y trabaja con los assets y carpetas de marca de tu cuenta. Lo que puede hacer con un diseño coincide con tu propio nivel de acceso en Canva.
- **Guías de Marca (la skill)** arma primero la ficha de marca: colores con sus valores exactos, tipografía con respaldo, reglas de tono en palabras simples y una lista explícita de qué sí y qué no — construida con el material que le des, nunca inventada. Los valores que falten quedan marcados como "sin definir" en vez de adivinados. Después aplica esos valores a la pieza y revisa borradores señalando el elemento exacto que se sale de la marca.

**Un ejemplo real:** *"Diseña un flyer para la promo del sábado usando mi ficha de marca — expórtalo en PNG."* La skill te entrega la ficha que armó con tu material (y la corrige cuando le enmiendas un valor); el conector hace el diseño en Canva con esos valores y te devuelve la exportación — sin copiar códigos hex a mano en una herramienta de diseño.

## Cómo usarlo

1. Instala el Plugin y conecta Canva — sin API key; se abre una ventana del navegador, entras con tu propia cuenta de Canva y apruebas el acceso.
2. Dale a la skill todo lo que muestre tu marca: el texto de la guía, tu sitio, posts anteriores. Corrige la ficha que te devuelve ("el gris es #6B7280, no ese") — esa corrección queda.
3. Pide el diseño: "un post para la promo de esta semana usando mi ficha de marca". Revísalo en Canva y expórtalo en el formato que necesites.
4. Reutiliza "usando mi ficha de marca" en las tareas siguientes para que cada diseño nuevo parta de las mismas convenciones.

## Por qué el combo funciona

La skill por sí sola produce una ficha de marca que después tienes que aplicar a mano dentro de Canva; el conector por sí solo diseña lo que le pidas — con los colores que el prompt implique. Juntos: los valores quedan decididos y corregidos antes de que el diseño exista, y el diseño se hace donde ya viven tus assets. Sin tener que explicar tu marca en cada encargo.

## Límites

- La ficha de marca sale del material que tú entregas. La skill nunca elige un color o una fuente y te lo presenta como tu marca, y no puede ver tus archivos de logo, verificar la licencia de una tipografía ni producir archivos de impresión — lo dice cuando el trabajo necesita un diseñador de verdad.
- Las funciones de Canva dependen del plan, según su propia documentación: redimensionar diseños requiere Canva Pro o superior, y los Brand Kits / plantillas con autofill requieren Enterprise. La ficha de la skill funciona con cualquier plan, pero no es lo mismo que el Brand Kit de Enterprise.
- Es un server hospedado por Canva, no algo que corre en tu computadora: lo que el agente puede ver y hacer está acotado por tu propio nivel de acceso en Canva, y cada usuario se autentica individualmente.
