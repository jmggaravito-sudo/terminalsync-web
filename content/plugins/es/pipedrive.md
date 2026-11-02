---
name: Pipedrive
logo: /plugins/pipedrive.svg
category: sales
status: available
tagline: "Mira qué negocios se quedaron callados y manda el seguimiento, en un solo producto."
description: "Junta el conector oficial de Pipedrive (tus negocios, contactos, actividades y notas de tu pipeline, por OAuth) con Internal Comms (redacta el seguimiento con la estructura y el tono correctos), para que 'qué negocios no se mueven hace dos semanas' se convierta en un mensaje listo para enviar — con tu aprobación antes de que salga nada."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: pipedrive
skillSlugs: ["internal-comms"]
---
## Cuándo usarlo

- Quieres ver **qué negocios están trabados sin actividad** — los que tu pipeline pierde en silencio — sin abrir Pipedrive y filtrar a mano.
- Tú mismo llevas los seguimientos y quieres quitarte de encima la redacción repetitiva.
- La documentación del propio conector usa este trabajo como ejemplo: *"Show me all open deals that haven't been updated in two weeks."* y *"Move the [company name] deal to the [stage name] stage and schedule a follow-up for [date]."*

## Qué hace

Junta dos piezas que se refuerzan, en una sola instalación:

- **Pipedrive (el conector)** es el MCP oficial hospedado de Pipedrive: con el login de tu propia cuenta (sin pegar ninguna API key), el agente busca y actualiza tus negocios, contactos, organizaciones, leads, actividades y notas — dentro de los permisos que tu usuario de Pipedrive ya tiene, y cada acción queda registrada en el change log de Pipedrive.
- **Internal Comms (la skill)** redacta el seguimiento con un proceso, no con humo: mapea la audiencia, estructura el mensaje (qué cambió, qué pides, qué sigue), calibra el tono — un saludo, un empujón, una actualización — y pasa un filtro de riesgos que marca promesas vagas o pasos sin dueño. Pregunta lo que no está claro en lugar de inventar aprobaciones ni compromisos.

**Un ejemplo real:** es lunes y hay tres negocios que no se mueven hace dos semanas. Dices *"muéstrame los negocios abiertos sin actualizar hace dos semanas"*. Pipedrive te da la lista con la última actividad de cada uno. Dices *"redacta el seguimiento de cada uno"*. Internal Comms escribe un mensaje distinto por negocio — refiriéndose a dónde se trabó y cuál era el siguiente paso — y te los muestra. Los revisas, ajustas y envías tú; una vez enviados, el agente puede dejar el alcance registrado como nota en el negocio, con tu OK.

## Cómo usarlo

1. Instala el Plugin y conecta Pipedrive — el puente abre el login de Pipedrive en tu navegador; entras y pulsas *"Allow and install"*.
2. Pregunta: *"qué negocios abiertos no se actualizan hace dos semanas?"* o *"qué negocios están trabados en la etapa Propuesta?"*.
3. Pide: *"redacta el seguimiento de cada uno"* — revisa los borradores, ajústalos y envíalos desde tu propio correo; luego pídele al agente dejar una nota en cada negocio para que el pipeline refleje la realidad.

## Por qué el combo funciona

Pipedrive solo te muestra los negocios fríos, pero después te toca redactar cada seguimiento a mano — la parte que se posterga hasta que el negocio está muerto. Internal Comms sola redacta bien, pero no sabe qué negocio se trabó ni dónde. Juntos: el agente lee el estado real del pipeline, escribe el mensaje con el tono que corresponde a cada negocio y deja el CRM listo para registrarlo — de "quién se quedó callado" a "ya lo seguí", con tu OK en el medio.

## Límites

- **Nunca envía sin tu aprobación.** El MCP de Pipedrive no tiene herramienta de correo: los mensajes redactados son el entregable, y los envías desde tu bandeja. Lo que el agente sí puede hacer dentro de Pipedrive — una nota, una actividad, un cambio de etapa — ocurre después de que lo apruebes.
- Internal Comms es una skill de comunicación interna por diseño (autoría de Anthropic): este pack aplica su proceso de audiencia, estructura y tono a los seguimientos de negocios, y sigue marcando los temas delicados — un cliente perdido, una disputa de precios — para revisión humana en lugar de automatizarlos.
- El acceso queda limitado a lo que tu propio usuario de Pipedrive puede ver y editar; el server está hospedado por Pipedrive (`mcp.pipedrive.ai`), está en beta y el uso está sujeto a límites de tokens según tu plan.
- Este pack redacta seguimientos y los registra. Otras escrituras que el conector permite (convertir leads, crear negocios) no forman parte de este trabajo.
