---
name: Brevo
logo: /plugins/brevo.svg
category: marketing
status: available
tagline: "Tu próxima campaña se lee como si la hubieras escrito tú — porque antes aprendió tu voz."
description: "Junta el conector de Brevo (MCP oficial de Brevo: contactos, campañas y CRM sobre tu propia cuenta de Brevo) con Voz de Marca (extrae tu perfil de voz a partir de 3–5 muestras reales y redacta con él), para que la campaña que el agente crea en Brevo salga con tu voz en vez de un texto genérico de IA."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: brevo
skillSlugs: ["brand-voice"]
---
## Cuándo usarlo

- Tus newsletters y promos salen por Brevo y cada borrador suena a IA genérica: terminas reescribiéndolo a mano antes de poder enviarlo.
- Delegas la redacción y necesitas que la campaña sea indistinguible de lo que habrías escrito tú.
- Ya escribes correos y posts que suenan a ti, y quieres que la próxima campaña parta de esa voz en vez de una página en blanco que produce los mismos párrafos de siempre.

## Qué hace

Junta dos piezas que se refuerzan, en una sola instalación:

- **Brevo (el conector)** es el MCP oficial hospedado de Brevo: con un token MCP de Brevo de tu propia cuenta, el agente lee tus contactos y listas, el rendimiento de tus campañas y los negocios de tu CRM, y crea campañas — email, SMS o WhatsApp. Crear o enviar una campaña es un cambio real en tu cuenta: revisa y aprueba expresamente la campaña exacta antes de que salga.
- **Voz de Marca (la skill)** pide 3–5 cosas que hayas escrito de verdad antes de redactar nada en tu nombre, arma un perfil de voz (ritmo de las frases, vocabulario, cómo abres y cierras, lo que nunca dices), redacta la campaña con esa voz, y señala las líneas donde el texto todavía suena a la IA de todos. Nunca inventa datos, cifras ni compromisos: la oferta, el precio y las fechas los pones tú.

**Un ejemplo real:** *"Redacta el email del Black Friday con mi voz — 20% de descuento en todo, solo el viernes."* La skill lo redacta con tus muestras más los datos que le diste; tú lo lees, corriges lo que falle, apruebas, y la campaña se crea en Brevo a través del conector.

## Cómo usarlo

1. Instala el Plugin y conecta Brevo — pega el token MCP de Brevo de tu propia cuenta (Cuenta > SMTP y API > Claves API, con la opción "Crear clave API de servidor MCP" activada).
2. Pega 3–5 muestras reales en la skill — correos, posts, una newsletter. Reales, no las que te gustan. Corrige el perfil de voz que te devuelve ("yo nunca usaría un signo de exclamación") — esa corrección queda.
3. Pide la campaña con los datos: oferta, precio, fechas, público. La skill redacta; tú lees el borrador antes de que nada se mueva.
4. Aprueba la campaña exacta y deja que el conector la cree en Brevo. El envío sigue siendo tu decisión, campaña por campaña.

## Por qué el combo funciona

La skill por sí sola redacta con tu voz, pero el texto todavía hay que reconstruirlo a mano dentro de Brevo; el conector por sí solo crea campañas con la voz que el prompt implique — normalmente IA genérica. Juntos: el texto es tuyo antes de existir como campaña, y cae en la herramienta que de verdad la envía.

## Límites

- Tu token MCP de Brevo no tiene scopes y da acceso completo de lectura y escritura a tu cuenta, y la documentación de Brevo no describe ninguna confirmación del lado del servidor — trata cada creación o envío como una decisión que apruebas expresamente. Este pack no añade un bloqueo de aprobación al servidor.
- El perfil de voz es una aproximación sólida a partir de tus muestras, no una copia de tu cabeza. La skill nunca inventa datos, cifras ni compromisos para que el texto suene más a ti, y se niega a imitar a una persona real concreta a partir de material que esa persona no te entregó.
- El perfil se construye con las muestras que pegues — la skill no lee por sí sola el historial de campañas de tu Brevo. Si quieres que aprenda de campañas anteriores, pégalas como muestras.
- Las campañas de SMS y WhatsApp son de formato corto: el perfil de voz sigue aplicando, pero el ritmo y el vocabulario pesan menos en 160 caracteres que en un email. Juzga esos borradores en consecuencia.
