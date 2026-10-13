---
name: Kit de Rutas de Servicio
logo: /logos/ts-kit.svg
category: operations
status: available
tagline: "Convierte la lista de trabajos del día en una ruta real — tiempos de manejo medidos, un orden de paradas que respeta tus ventanas de horario, y un brief para el equipo — en vez de planear a ojo."
description: "Un combo de operaciones para el dueño o despachador de un negocio de servicio local que funciona a visitas — limpieza, reparaciones, delivery, visitas a propiedades — y planea el día desde una hoja de cálculo de trabajos: leer la lista, medir el tiempo real de manejo entre paradas, proponer un orden que respete las ventanas de horario, y entregarle al equipo un brief que se puede manejar."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: google-sheets
    reason: "Guarda la lista de trabajos del día — direcciones, ventanas de horario, notas de cada trabajo — y es donde la ruta terminada (orden de paradas, tiempos de manejo, horas estimadas) se escribe de vuelta, así el plan vive junto a los trabajos y no se pierde en un mensaje de chat."
  - kind: connector
    slug: google-maps
    reason: "Convierte las direcciones en geografía real: geocodifica cada parada, calcula los tiempos de viaje entre todas, y trae indicaciones — la diferencia entre planear una ruta y adivinarla."
  - kind: skill
    slug: internal-comms
    reason: "Convierte la ruta ordenada en un brief de despacho que el equipo puede ejecutar: primera parada, tiempos de manejo, ventanas de horario, qué llevar, a quién llamar al llegar."
---
## Para quién es

Un dueño o despachador de un negocio de servicio local que funciona a visitas — limpieza, reparaciones y mantenimiento, delivery, servicios móviles, visitas a propiedades — que lleva los trabajos del día o de la semana en una hoja de cálculo y tiene que responder *"¿en qué orden los hacemos, y de verdad nos alcanza el tiempo para todos?"* todas las mañanas.

Úsalo si planeas rutas para ti o para un equipo pequeño, y hoy la planificación pasa en tu cabeza: miras una lista de direcciones y estimas.

## Qué te ayuda a hacer

Este kit cubre el loop de lista-a-ruta de un día de servicio:

- Leer **los trabajos del día directo desde tu hoja de cálculo** — una fila por trabajo, con dirección, ventana de horario si hay, y notas.
- **Medir la ruta en vez de estimarla**: geocodificar cada parada, sacar el tiempo real de manejo entre paradas, y ver qué orden tiene sentido.
- **Proponer un orden de paradas que respete las ventanas de horario** ("la panadería es de 8 a 10, la oficina desde las 2") y el tiempo total que suma el día.
- **Escribir la ruta de vuelta en la hoja de cálculo** — orden y hora estimada al lado de cada trabajo — así el plan vive donde viven los trabajos.
- Convertirla en un **brief para el equipo**: paradas en orden, tiempos de manejo, ventanas, qué llevar — listo para mandar antes de la primera parada.

El resultado esperado es un día planificado contra tiempos de viaje medidos, con una ruta escrita y un brief que el equipo puede seguir — en vez de un orden a ojo que se cae a la tercera parada.

## Qué incluye

### Conectores

- **Google Sheets** — lee la lista de trabajos (direcciones, ventanas de horario, notas) y escribe la ruta terminada al lado de cada trabajo, así el plan es una columna en tu hoja de cálculo, no un mensaje que se pierde en el chat.
- **Google Maps** — convierte cada dirección en coordenadas, calcula los tiempos de viaje entre paradas (matriz de distancias) y trae indicaciones paso a paso para quien maneja. El tiempo de viaje es el número que este kit existe para sacar bien.

### Skills

- **Internal Comms** — convierte la ruta ordenada en un brief de despacho estructurado: paradas en orden con tiempos de manejo, ventanas de horario a respetar, qué llevar, y a quién llamar al llegar — escrito para quienes ejecutan, no para el archivo del dueño.

## Cómo usarlo

1. Instala el kit, conecta Google Sheets con tu proyecto de Google Cloud (configuración OAuth de una sola vez) y conecta Google Maps con una API key de Google Maps Platform.
2. Ten una hoja de cálculo con una fila por trabajo: cliente, dirección, ventana de horario si hay, y una columna de notas. Puede ser tan simple como "Trabajos — 5 de octubre".
3. Pide: *"Lee los trabajos de hoy de mi hoja de cálculo Trabajos, saca el tiempo de manejo entre las paradas y propón un orden que respete las ventanas de horario. Dime el tiempo total de manejo y a qué hora terminaríamos."*
4. Revisa el orden y pídele que escriba el número de parada y la hora estimada de llegada de vuelta en la hoja de cálculo.
5. Pídele a Internal Comms el brief del equipo: *"Convierte esta ruta en un brief corto para el equipo — paradas en orden, tiempos de manejo, ventanas, qué llevar."*
6. Cuando el día cambia — una cancelación, un trabajo urgente — pide el mismo plan sin la parada cancelada, o con la nueva insertada donde entre.

## Por qué estas piezas van juntas

El kit es coherente porque sigue el loop real de un día de servicio, no un montón de herramientas de mapas y hojas de cálculo:

- Google Sheets guarda **qué hay que hacer** — los trabajos, en el lugar donde el negocio ya los lleva.
- Google Maps guarda **dónde están en el espacio** — qué tan lejos quedan las paradas de verdad, y cuánto tarda el manejo en realidad.
- Internal Comms convierte ambos en **la entrega** — el brief que el equipo ejecuta.

Instaladas por separado, el dueño lee la lista, adivina el orden por los nombres de las calles, y manda algo informal por chat. Instaladas juntas, el kit da un solo camino: **leer los trabajos → medir la ruta → ordenar las paradas → escribirla de vuelta → brief al equipo**.

Comparte Google Sheets con el Kit de Bookkeeping & Tax Handoff e Internal Comms con varios kits, pero el propósito es distinto: este es el único kit apoyado en *paradas físicas y tiempo de viaje*. Bookkeeping lee hojas de cálculo para armar el paquete del contador; Team Operations lee un tablero de tareas para el status del trabajo; Client Meetings corre el loop alrededor de una llamada. Este kit planea a dónde va la camioneta.

## Límites

- **No es un solver de rutas.** El asistente ordena las paradas con sentido usando los tiempos de viaje medidos, pero para rutas grandes (25+ paradas aprox.) con restricciones duras, un software de rutas dedicado lo hace mejor — este kit es para el día de servicio que una persona todavía puede revisar a ojo.
- **Los tiempos de viaje son estimaciones.** El tráfico a la hora de manejar puede cambiarlos; la ruta es un plan de arranque, no una promesa de llegada.
- Google Maps requiere una API key de Google Maps Platform con facturación activada — Google cobra por llamada, así que la cuota y el costo son tuyos de vigilar. Google Sheets necesita el setup OAuth de Google Cloud de una sola vez.
- No despacha al teléfono de los conductores, no rastrea vehículos en tiempo real, ni junta prueba de entrega — el plan queda escrito; la ejecución es del equipo.
- No le escribe a los clientes ("ya vamos llegando") — las notificaciones a clientes quedan en el canal que ya uses con ellos.
- La escritura de vuelta en la hoja de cálculo pisa las celdas que le indiques — revisa qué se va a escribir antes de confirmar.
