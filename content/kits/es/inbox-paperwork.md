---
name: Kit de papeleo del correo
logo: /logos/ts-kit.svg
category: operations
status: available
tagline: "Convertí las facturas, contratos y formularios que se acumulan en tu correo en registros ordenados y respuestas enviadas — sin cambiar de pestaña cada dos minutos."
description: "Un bundle de operaciones coherente para el dueño o responsable de operaciones que maneja el papeleo por correo: encontrar el mensaje, leer el PDF adjunto, producir el resultado estructurado (un registro corrido, un borrador completo, una nota de acompañamiento) y enviar la respuesta — un solo loop en vez de una tarde de copiar y pegar."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: gmail
    reason: "Sostiene la entrada y la salida — los mensajes y adjuntos sobre los que corre el trabajo. La búsqueda encuentra el hilo correcto entre el ruido, la lectura trae el mensaje con su contexto, y el envío/reenvío cierra el loop con cada acción saliente gated detrás de una confirmación: el agente redacta y vos aprobás."
  - kind: connector
    slug: pdf
    reason: "Lee lo que el correo realmente entrega: las facturas de proveedores, contratos, resúmenes y formularios llegan como adjuntos PDF, y esta es la pieza que los abre, busca dentro de las páginas y extrae el texto y las cifras — el paso que antes era abrir cada archivo a mano."
  - kind: skill
    slug: doc-coauthoring
    reason: "Convierte lo extraído en el artefacto que el papeleo necesita — un registro corrido de qué llegó y qué está pendiente, un borrador completo listo para enviar, o una nota de acompañamiento que viaja con el documento — mantenido consistente entre revisiones en vez de reescrito desde cero cada vez."
---
## Para quién es

Un dueño o responsable de operaciones de un negocio pequeño que maneja su papeleo por correo: facturas de proveedores, contratos de clientes, resúmenes bancarios, formularios de organismos y plataformas. El trabajo recurrente que cubre este kit es el loop del documento: algo cae en la bandeja, alguien tiene que saber qué dice, actuar, y responder.

Usalo cuando el patrón recurrente es *"llegó otro PDF y ahora tengo que leerlo, registrarlo y responder"* — y la respuesta honesta de hoy es descargar el archivo, revisar seis páginas con lupa y reescribir los mismos datos en tres lugares.

## Qué te ayuda a hacer

- **Encontrarlo**: buscar en el correo el hilo — la factura del proveedor, la revisión del contrato del cliente — en vez de hacer scroll.
- **Leerlo**: abrir el PDF adjunto y extraer los números, fechas, condiciones y espacios en blanco que de verdad importan.
- **Registrarlo**: mantener un registro corrido y estructurado — qué llegó, de quién, por cuánto, qué necesita después — para que *"¿ya llegó eso?"* tenga una respuesta que no dependa de la memoria.
- **Responderlo**: una respuesta, un reenvío o una nota de acompañamiento que lleve los datos extraídos — enviada desde tu propia cuenta, con confirmación antes de que algo salga.

El resultado esperado: el goteo diario de papeleo deja de ser una tarde de cambio de pestañas y se vuelve un loop repetible — **encontrar → leer → registrar → responder.**

## Qué incluye

### Conectores

- **Gmail** — la entrada y la salida. Lee y busca tus mensajes y hilos, y envía o reenvía la respuesta. Cada envío, reenvío, modificación y archivado pasa por una confirmación: el agente redacta y decide la letra contigo, pero nada sale de la bandeja hasta que vos lo aprobás.
- **PDF** — el lector de los adjuntos. Abre los documentos PDF que le apuntes, busca dentro de ellos, extrae texto y cifras, y anota o guarda con gates de guardado explícitos — así el total de la factura, el plazo del contrato y los espacios del formulario se vuelven texto con el que el agente puede trabajar.

### Skills

- **Doc Co-Authoring** — el resultado estructurado. Acompaña el registro corrido o la nota a través de brief → esquema → borrador → revisión, manteniendo nombres, números y pendientes consistentes entre rondas, para que mes a mes estés extendiendo un mismo registro vivo en vez de arrancar un archivo nuevo cada semana.

## Cómo usarlo

1. Instalá el kit y conectá Gmail con tu cuenta de Google (credenciales OAuth configuradas una vez, según los pasos de la página del conector). Los permisos de tu cuenta de Gmail acotan lo que el agente puede ver y hacer.
2. Primera pasada de la mañana: *"Buscá las facturas que llegaron esta semana de [proveedor] y decime qué es cada una."*
3. Trabajá un documento: *"Abrí el PDF de ese mensaje, sacá número de factura, total y vencimiento, y agregá una línea al registro."*
4. Cerrá el loop: *"Redactá la respuesta confirmando que lo recibimos, y marcá el único renglón que no coincide con el pedido."* Revisás el borrador, aprobás el envío, listo.
5. Mantené el registro como artefacto: un documento por mes con qué llegó, qué está pendiente y qué se respondió — lo que abrís la próxima vez que alguien pregunte *"¿el evergreen del alquiler mandó alguna vez el contrato actualizado?"*

## Por qué estas piezas van juntas

El kit sigue el loop real del papeleo por correo, no un montón de herramientas de oficina:

- Gmail sostiene **dónde arranca y dónde termina el trabajo** — el mensaje que llega y la respuesta que sale, con la confirmación en el medio.
- PDF es **lo que el trabajo realmente lee** — porque el papeleo llega como adjunto, no como texto del correo; sin él el loop se corta en "hay un adjunto".
- Doc Co-Authoring convierte lo extraído en **el registro y la respuesta** — un log que persiste y borradores que sostienen su estructura entre revisiones.

Instaladas por separado, la búsqueda vive en una pestaña, el PDF en otra, y la redacción se reescribe cada vez. Instaladas juntas, un solo camino cubre el loop: **encontrar el mensaje → leer el adjunto → registrarlo → enviar la respuesta.**

Comparte Doc Co-Authoring con los kits de finanzas y comunicación, pero el terreno es otro: Bookkeeping & Tax Handoff arma el paquete para el contador desde los libros, y Small Business Finance lee Xero y Stripe. Este kit corre sobre el correo mismo — los documentos que llegan *antes* de tocar cualquier sistema de registro, y a veces nunca llegan.

## Límites

- **Requiere Gmail.** Si tu correo del negocio corre en Outlook, Zoho o un helpdesk compartido, el conector ancla no aplica — este kit no tiene ancla equivalente para otra plataforma de correo.
- **La configuración es OAuth, no un clic**: el conector necesita credenciales de cliente OAuth de Google durante la configuración (la página del conector tiene los pasos exactos); es requisito del propio conector, dicho de entrada.
- **Guardá el adjunto primero.** El conector PDF lee documentos que le apuntes (archivos locales o rutas aprobadas); no descarga adjuntos de Gmail por sí solo — el flujo es "guardar el archivo y que lo lea".
- **Lee y redacta; no contabiliza ni paga.** Sin asientos, sin posiciones fiscales, sin pagos — los números extraídos van a tu registro o a tu respuesta, y los libros siguen en tu sistema contable.
- **No es una bandeja de soporte.** Sin tickets, sin cola de servicio al cliente, sin respuestas a escala — para soporte a clientes hace falta un conector de helpdesk, no este kit.
- **Los documentos sensibles merecen cuidado**: contratos, recibos de sueldo y resúmenes son privados. El agente ve lo que la cuenta conectada ve, así que conectá una cuenta cuyo alcance te parezca aceptable, y dejá las confirmaciones activadas para todo lo saliente.
