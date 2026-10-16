Fecha de investigación: 2026-10-15. Datos de terceros: verificar antes de decidir

# Pruebas con cuenta real para las candidatas

Este documento dice, para cada candidata de `21-handoff-pipeline-integraciones.md`, cómo conseguir una cuenta de prueba o sandbox y qué probar. Los datos salen de `20-mapa-integraciones-espana.md`.

## Quién hace qué

| Paso | Quién | Por qué |
|---|---|---|
| Crear la cuenta del proveedor (alta, email, KYC, tarjeta si la pide) | **Una persona** (tú o quien designes) | Los agentes no crean cuentas ni escriben contraseñas o claves. |
| Pegar tokens o claves en la app | **La misma persona**, en la app | Mismo motivo. |
| Smoke automático sin cuenta (`node scripts/smoke-remote-login.mjs --slugs <slug>`) | Agente o CI | No completa el login: comprueba que `mcp-remote` llega a la pantalla de autorización. Es el filtro que ya detectó Asana `/v2` y Zoom sin registro dinámico. |
| Login completo y pruebas de herramientas | **Una persona** con la cuenta, con el build que instale el coordinador | Necesita un humano con sesión. Recuerda la regla del repositorio de la app: solo el coordinador buildea e instala. |
| Documentar el resultado en la ficha (herramientas verificadas, divulgación) | Agente, después del PR | Solo con lo que la persona reportó. |

**Regla de datos.** Usa cuentas de prueba o datos ficticios. No conectes la contabilidad, el banco o la nómina reales de un cliente para probar. Si la única opción es una cuenta real (Qonto), conéctala en modo solo lectura y sin mover dinero.

## Qué probar siempre (aplica a todas)

1. **Login:** instalar desde Explorar y desde el chat; la app abre el navegador; se completa; vuelve a la app.
2. **Lectura:** una pregunta que obligue a llamar una herramienta de lectura («lista mis últimos 5 clientes»). Comprueba que la respuesta coincide con lo que ves en el panel del proveedor.
3. **Escritura con confirmación:** una acción reversible y de bajo riesgo (crear un contacto de prueba). Comprueba que la IA pide confirmación y que el dato aparece en el proveedor.
4. **Límite de permisos:** pide algo que el proveedor dice que no se puede (por ejemplo, borrar una factura en Holded). Debe fallar con un mensaje claro, no en silencio.
5. **Token vencido:** revoca el acceso en el proveedor y comprueba que el chat ofrece «Reconectar».
6. **Idioma:** pide en español y en inglés; revisa que los nombres de campos (IVA, NIF, SEPA) no se traduzcan mal.

## Por candidata

### Tanda A

| Candidata | Cómo conseguir cuenta | Qué probar además de lo general | Notas y riesgos |
|---|---|---|---|
| **Holded** | Prueba gratis de 14 días, sin tarjeta según [Capterra](https://www.capterra.com/p/153384/Holded/pricing/) (tercero). La API y el MCP piden **plan de pago** y acceso a «Desarrolladores» [doc: [ayuda](https://help.holded.com/en/articles/6896051)]; no pude confirmar si la prueba lo incluye. | Conectar con permiso **solo lectura** (preseleccionado) y listar contactos y facturas. Luego habilitar escritura **solo en CRM o contactos** y crear un contacto. Intentar crear una factura y comprobar que no se puede. Revisar el token en Desarrolladores → Credenciales. | Si la prueba no da API, hace falta un mes de plan básico (desde unos 14,5 €/mes según Capterra). |
| **Factorial** | Pedir demo/prueba en `factorial.es/get-started` (demo guiada; no hallé sandbox). El MCP se autoriza con un usuario de la empresa. | Estado de fichaje, listar ausencias, buscar un empleado por email. Una acción de escritura: crear una tarea. Comprobar que actúa con los permisos del usuario (probar con un usuario sin permisos de RR. HH.). | «Factorial One» exige un plan con ese módulo: pruébalo y anota el mensaje de error si no lo tienes. |
| **Qonto** | Hace falta una empresa real (apertura de cuenta con verificación). No hallé sandbox del MCP. | Solo lectura: saldo, últimos movimientos, tarjetas. **No** pedir transferencias ni bloquear tarjetas en una cuenta real. Verificar que cualquier escritura pide aprobación. | Alto riesgo: banco real. Quien pruebe debe ser el titular. Decide si basta con la verificación del login más una lectura. |
| **MONEI** | Registro de comerciante con modo de pruebas desde la propia cuenta [3p: [soporte MONEI](https://support.monei.com/hc/en-us/articles/4463699147025-How-can-I-test-integrations-and-payments)]. No confirmé si el alta es gratuita. | `get_account_info`, `list_payments`, `get_payments_kpi`. Generar un enlace de pago de 1 € y abrirlo. Comprobar que el reembolso, el cobro directo y borrar claves quedan bloqueados (según el README). | Primero resolver cuál es el endpoint real (`/mcp` o la raíz). Probar si el MCP funciona con el modo de pruebas o solo en producción. |
| **PayPal** | **Sandbox gratuito** con cuentas de prueba (vendedor y comprador) en developer.paypal.com [3p]. Endpoint sandbox del MCP: `https://mcp.sandbox.paypal.com/mcp` [3p/búsq; verificar]. | Listar transacciones de prueba; crear una factura en sandbox y marcarla como pagada con la cuenta compradora de prueba. | Verificar si el login por `mcp-remote` funciona en sandbox. Divulgar reembolsos. |
| **Brevo** | Cuenta gratuita (no verifiqué condiciones actuales). La clave MCP se genera en Cuenta → SMTP y API → Claves API [búsq: [guía](https://developers.brevo.com/docs/integration-guide)]. | Primero comprobar **cuál** de los dos accesos funciona: login OAuth (la sonda lo anuncia) o clave Bearer (la doc). Luego: listar contactos, crear un contacto, crear una lista. **No enviar ninguna campaña.** | La clave MCP da acceso total sin scopes: usar una cuenta solo de pruebas y sin contactos reales. |
| **SumUp** | **Sandbox** con cuenta comercial de prueba: se crea en Ajustes de desarrollador → Sandboxes; claves `sk_test_`; tarjetas de prueba; un importe de 11 falla a propósito [búsq: [testing](https://developer.sumup.com/online-payments/testing/)]. | Con el paquete npm `@sumup/mcp` y una clave `sk_test_`: leer perfil del comercio, crear un checkout, consultar su estado. | El remoto no tiene registro dinámico: solo probarlo para confirmar que no sirve. |
| **FacturaDirecta** | No encontré prueba gratuita ni sandbox. Pregunta al proveedor. | Listar facturas y contactos; crear un contacto. Revisar que la lista de scopes pedidos en el login (facturas, nóminas, bancos) es razonable. | Si el pipeline la descarta por falta de documentación, no inviertas en la cuenta. |

### Tanda B

| Candidata | Cómo conseguir cuenta | Qué probar |
|---|---|---|
| **Sesame HR** | Prueba de 14 días sin tarjeta [3p: Softabase]. La API es un add-on o va en el plan alto (fuentes contradictorias). | Primero preguntar a Sesame por el MCP. Si responde: login OAuth, consultar empleados y fichajes. |
| **Factuarea** | Entorno **Test** al autorizar el consentimiento (claves `fact_test_`) y prueba con MCP incluido [doc]. | Crear un cliente y un borrador de factura **en Test**; consultar `get_invoice_verifactu`. No emitir ni enviar. |
| **GoCardless** | Alta de Sandbox (se elige Sandbox o Live al conectar) [doc]. | Leer clientes, mandatos y pagos de prueba; crear un pago de prueba y comprobar que pide confirmación. |
| **Sendcloud** | Cuenta de Sendcloud (plan gratuito: no verificado). | Si `mcp-remote` completa el login (CIMD): listar envíos y consultar el estado de uno; **no** crear etiquetas de pago. |
| **Mollie** | Cuenta con claves de prueba (no verificado). | Pagos de prueba, métodos habilitados (comprobar si aparece Bizum). |

### Tanda C (las que quizá construyas tú)

Para estas el paso previo es conseguir la cuenta y las credenciales de API. Sirve para validar el informe `needs_own_build` del pipeline.

| Candidata | Cómo conseguir cuenta y credenciales |
|---|---|
| **Quipu** | Prueba de 15 días sin tarjeta [doc comercial: getquipu.com]. Pide credenciales de API (client id y secret) en el área de desarrolladores; la guía oficial está en [quipuapp.github.io/api-v1-docs](https://quipuapp.github.io/api-v1-docs/). Confirma con Quipu en qué plan se incluye la API. |
| **Billin / TS Facturas** | 30 días de prueba con todas las funciones de la API, sin tarjeta [doc: billin.net]. Credenciales en Integraciones. |
| **Woffu** | Sin prueba confirmada; clave API desde la guía de [woffu.com/en/api](https://woffu.com/en/api/). |
| **Revolut Business** | Cuenta de Revolut Business y certificado de cliente; el sandbox exige registro en el portal de desarrolladores. |
| **PayFit, Sage Active, Contasol** | Acceso de partner o contrato; probablemente hay que escribir al proveedor. |

## Qué NO se puede probar sin trato comercial

- **Correos, SEUR, GLS, MRW:** credenciales por contrato con el transportista.
- **Treatwell, Doctoralia:** API solo para partners.
- **AEAT / FACe / Veri\*Factu:** exigen certificado electrónico cualificado; no hay cuenta de prueba que un agente pueda usar.

## Criterio de salida por candidata

Una integración está lista para declararse «probada con cuenta» cuando una persona reporta que cumplió los seis puntos generales, adjunta capturas o el resultado de una lectura real, y anota las diferencias con lo que dice la documentación (por ejemplo, un permiso distinto, un plan necesario, un error de login). Eso se pega en la ficha como divulgación.
