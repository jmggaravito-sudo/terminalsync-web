---
name: Canva
logo: /plugins/canva.svg
category: marketing
status: available
tagline: "Diseños que salen con tu marca — el agente trabaja desde tu hoja de marca, en Canva."
description: "Junta el conector oficial de Canva (generación, edición y exportación de diseños por OAuth) con Brand Guidelines (convierte el material de marca que tengas en una hoja de marca y la aplica), para que el post, el volante o la presentación que produce el agente use tus colores y tu tono en lugar de los genéricos de una IA."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: canva
skillSlugs: ["brand-guidelines"]
---
## Cuándo usarlo

- Producís tú el material de cara al cliente — posts para redes, volantes, imágenes promocionales, una presentación simple — y cada diseño de Canva arranca de una plantilla que se parece a la de todos.
- Tu marca vive en un PDF que nadie abre, en tu sitio web o en tu cabeza: un par de colores, una tipografía, un tono. Nada la aplica de forma consistente a lo que hacés.
- Querés que el diseño salga hecho y exportado sin abrir Canva y hacer clic de un lado al otro — pero sin que salga fuera de marca.

## Qué hace

Junta dos piezas que se refuerzan, en una sola instalación:

- **Canva (el conector)** es el server MCP oficial hospedado de Canva: con el login de tu propia cuenta Canva (sin pegar ninguna API key), el agente genera diseños, los edita y los encuentra, trabaja con tus assets y tu material de marca, y exporta a PNG, PDF, JPG, PPTX o MP4. Lo que puede hacerle a un diseño coincide con tu propio nivel de acceso a él.
- **Brand Guidelines (la skill)** toma el material de marca que le des — una guía, tu sitio, emails pasados, un volante que te gusta — y primero arma una hoja de marca: colores con sus valores exactos, tipografía con un fallback, reglas de tono en palabras simples y una lista explícita de sí/no. Lo que no le diste queda marcado como "sin definir" — nunca inventa un color o una fuente y te lo presenta como tu marca.

**Un ejemplo real:** pegás lo que tengas sobre tu marca y pedís *"generá el post promocional de esta semana en Canva y exportalo como PNG para el newsletter."* La skill fija la hoja de marca (y te pide corregir lo que leyó mal); el conector genera el diseño en tu cuenta de Canva, lo aplica y te devuelve el archivo exportado. Un solo trabajo, una sola instalación — en vez de un brief de diseño que igual termina con vos haciendo clic en Canva.

## Cómo usarlo

1. Instala el Plugin y conecta Canva — sin API key; entrás con tu propia cuenta desde el navegador.
2. Dale a la skill el material de marca que tengas. Revisá primero la hoja de marca que devuelve y corregí los valores que leyó mal.
3. Pedí el resultado: *"un post promocional para el descuento de esta semana"*, *"exportá el volante del mes pasado como PDF"*. El diseño queda en tu cuenta de Canva, donde podés seguirlo editando.

## Por qué el combo funciona

La skill sola produce una hoja de marca y la aplica a texto — pero el diseño igual hay que hacerlo a mano, y su propia ficha dice que no ve tus archivos de logo. El conector solo puede generar diseños todo el día, pero cada uno sale de un prompt genérico, no de tu marca. Juntos: la hoja de marca es un input real sobre el que el agente diseña, y los assets y el material de marca de tu cuenta de Canva son donde viven tus archivos de marca — de "mi marca está en algún PDF" a "el PNG exportado se parece a nosotros".

## Límites

- Algunas funciones de Canva que el agente querría usar dependen del plan: redimensionar diseños necesita Canva Pro o superior, y las plantillas con autofill y los brand kits necesitan Enterprise. En el plan gratuito el agente trabaja con lo que tu cuenta permita.
- La skill nunca inventa valores de marca: lo que no le diste queda marcado como sin definir en vez de llenarse con un genérico. El diseño puede ser tan de marca como el material que le des.
- Una identidad de marca completa sigue siendo trabajo de diseñador — un logo, packaging o archivos de producción para imprenta están fuera de las dos piezas. La skill lo dice en vez de fingirlo, y no puede verificar que una fuente tenga licencia para tu uso.
- El conector es un server hospedado por Canva (`mcp.canva.com`), no algo que corre en tu computadora: cada usuario se autentica por su cuenta, y lo que el agente puede hacer está acotado a tu propio nivel de acceso en Canva.
