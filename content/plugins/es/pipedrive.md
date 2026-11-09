---
name: Pipedrive
logo: /plugins/pipedrive.svg
category: sales
status: available
tagline: "Mirá qué negocios se quedaron callados — y que te quede escrito el seguimiento, en un solo producto."
description: "Junta el conector oficial de Pipedrive (negocios, contactos, actividades y notas por OAuth) con Internal Comms (redacta el seguimiento con el tono correcto), para que 'qué negocios no se actualizan hace dos semanas' se convierta en un mensaje listo para enviar y un seguimiento registrado — con tu aprobación antes de que salga algo."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: pipedrive
skillSlugs: ["internal-comms"]
---
## Cuándo usarlo

- Tu pipeline se mueve solo mientras lo trabajás, y los negocios que quedaron callados hace dos semanas son justamente los que no podés nombrar de memoria.
- Vos mismo mantenés Pipedrive al día y lo que frena el negocio es redactar el seguimiento — la parte que siempre se posterga.
- Querés que la IA proponga el mensaje y registre el seguimiento, pero **apruebás vos antes de que salga**.

## Qué hace

Junta dos piezas que se refuerzan, en una sola instalación:

- **Pipedrive (el conector)** es el server MCP oficial hospedado de Pipedrive: con el login de tu propia cuenta ("Allow and install", sin API key), el agente busca y actualiza negocios, contactos, organizaciones, leads, actividades y notas con los permisos de tu propio usuario. Su propia guía de configuración usa este trabajo como ejemplo: *"Show me all open deals that haven't been updated in two weeks."*
- **Internal Comms (la skill)** redacta el seguimiento con estructura y tono — un saludo de contacto, un empujón, una actualización de estado — y marca lo que un mensaje real necesita: qué está confirmado y qué sigue pendiente, el próximo paso, y los temas delicados que deben pasar por revisión humana en vez de automatizarse.

**Un ejemplo real:** lunes a la mañana, pedís *"¿qué negocios no se movieron en dos semanas?"*. Pipedrive te da la lista con la etapa y la última actualización de cada uno. Decís *"redactá el seguimiento de cada uno — a los tibios un empujón, a los que están por cerrar una actualización de estado."* Internal Comms escribe un mensaje distinto por negocio, refiriendo lo que realmente está pendiente, vos revisás y aprobás, y el agente registra el contacto como nota y actividad de seguimiento en Pipedrive para que la próxima revisión arranque de lo que ya se hizo.

## Cómo usarlo

1. Instala el Plugin y conecta Pipedrive — sin API key; entrás con tu cuenta y hacés clic en *"Allow and install"*.
2. Preguntá: *"¿qué negocios no se actualizan hace dos semanas?"* o *"¿cuáles quedaron trabados antes de la etapa de cierre?"*.
3. Pedí los borradores — **aprobás vos** — y después enviá cada uno desde tu propio email, y dejá que el agente registre la nota y la actividad de seguimiento en Pipedrive.

## Por qué el combo funciona

Pipedrive solo te dice que el negocio quedó callado — y después igual tenés que escribir cada seguimiento a mano, que es la razón por la que no suceden. Internal Comms sola escribe bien pero trabaja a ciegas: no sabe qué negocio está trabado en qué etapa ni qué dijo el último contacto. Juntos: el estado viene del pipeline, el mensaje viene de la skill y el registro vuelve a Pipedrive — de "quién quedó callado" a "ya se le hizo el seguimiento", con tu OK en el medio.

## Límites

- **Nunca envía sin tu aprobación.** El conector redacta, registra y agenda; en este pack no hay un paso de envío de email — el mensaje lo enviás desde tu propio correo, así que la decisión de enviar sigue siendo tuya.
- Cada acción del conector queda registrada en el change log de Pipedrive, y solo puede ver y modificar lo que tu usuario de Pipedrive ya tiene permiso de ver y editar.
- Las situaciones delicadas — un negocio perdido, una disputa de precio, un cliente amenazando con irse — se marcan para revisión humana, no se automatizan.
- El server está hospedado por Pipedrive (`mcp.pipedrive.ai`), está en beta, y el uso está sujeto a límites de tokens según tu plan.
