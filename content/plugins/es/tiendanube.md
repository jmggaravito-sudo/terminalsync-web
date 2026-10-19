---
name: Tiendanube
logo: /plugins/tiendanube.svg
category: ecommerce
status: available
tagline: "Diseña la promo que tu margen aguanta y el cupón queda vivo en tu tienda."
description: "Junta el conector de Tiendanube (MCP oficial de Tiendanube/Nuvemshop: los productos, el stock, los pedidos, los clientes, los cupones y las promociones de tu tienda por OAuth) con Promos y Cupones (diseña el descuento — objetivo, margen, límites duros — y cierra con un veredicto sobre si está listo para lanzar), para que el cupón que la skill puso a prueba sea el que realmente se crea en tu tienda — después de tu aprobación."
author: "TerminalSync"
marketplaceSource: "terminalsync"
connectorSlug: tiendanube
skillSlugs: ["promos-cupones"]
---
## Cuándo usarlo

- Tu tienda funciona sobre Tiendanube y las promos salen siempre igual: inventas un número de descuento de memoria, creas el cupón en el panel y esperas que el margen aguante.
- Quieres los seguros puestos antes de que el descuento salga vivo: un piso ("nunca por debajo del costo"), un límite ("solo primera compra"), un objetivo (liquidar stock, recuperar clientes, compradores nuevos) — en lugar de decidirlos dentro del formulario del cupón.
- También corres promociones sin código (envío gratis, descuentos automáticos) y quieres armarlas con la misma disciplina.

## Qué hace

Junta dos piezas que se refuerzan, en una sola instalación:

- **Tiendanube (el conector)** es el MCP oficial hospedado de Tiendanube/Nuvemshop: con el login de tu propia tienda (sin pegar ninguna API key), el agente lee tus productos, tu stock, tus pedidos y tus clientes, y trabaja con tus cupones y promociones — `create_coupon` (porcentaje, monto fijo o envío gratis, con restricción de primera compra), `update_coupon`, `create_promotion` (automática, sin código) y más. Antes de una escritura, revisa y aprueba expresamente el cambio exacto. No supongas que conectar la tienda autoriza todas las acciones posteriores.
- **Promos y Cupones (la skill)** diseña el descuento antes de que exista: el objetivo, el margen que tiene que aguantar, los límites duros y para quién es — y cierra con un veredicto 0–100 sobre si está listo para lanzar. Si la matemática no da, lo dice en vez de disfrazar una promo que pierde plata. Su último paso — "cargar el código en tu tienda" — es exactamente lo que hace el conector.

**Un ejemplo real:** *"Diseña un cupón del 15% para clientes que no compran hace 60 días, sin bajar del costo, válido hasta el viernes."* La skill lo revisa contra tu objetivo y tus límites y te entrega el diseño terminado; apruebas, y el cupón se crea en tu tienda a través del conector — sin vuelta por el panel.

## Cómo usarlo

1. Instala el Plugin y conecta tu tienda de Tiendanube — sin API key; entras con tu propia cuenta.
2. Dale a la skill el objetivo, tu margen o costo aproximado y los límites duros (ej. "nada por debajo del costo", "solo primera compra"). Pide lo que falta en vez de inventarlo.
3. Lee el veredicto: 🟢 lánzalo, 🟡 cierra primero los límites o el margen, 🔴 probablemente pierde plata. Un cambio por vez.
4. Revisa el cupón o la promoción exactos y aprueba expresamente esa acción antes de pedir al agente que los cree. No supongas que un aviso adicional del servidor detendrá una escritura no deseada.

## Por qué el combo funciona

La skill por sí sola diseña una promo que después tienes que cargar a mano; el conector por sí solo crea el cupón que le pidas — incluido uno que se come tu margen. Juntos: el diseño se pone a prueba antes de existir, y lo que apruebas es lo que sale vivo. Nada de pasar un descuento del chat al formulario.

## Límites

- El veredicto de la skill puntúa el diseño, no el resultado — no es una predicción de cuánto vas a vender.
- Tus números de margen y costo los das tú. El conector puede mostrar qué vende tu tienda y quién compra, pero no audita tus costos, y la skill nunca los inventa.
- Revisa y aprueba expresamente cada cupón o promoción antes de pedir una escritura. La [documentación oficial](https://nuvemshop.dev/en-US/ai-agents/mcps) describe indicaciones para que el agente decida cuándo preguntar; esto no acredita una pantalla de confirmación obligatoria del servidor. Borrar es irreversible: pide preferiblemente desactivar (`valid=false` / `published=false`). Este pack no añade un bloqueo de aprobación al servidor.
- Es un server hospedado (`admin-mcp.tiendanube.com`), una conexión por tienda: lo que el agente puede ver y hacer está acotado por los permisos de tu usuario de tienda. Las tiendas de Brasil usan el endpoint aparte de Nuvemshop, al que este conector no apunta.
