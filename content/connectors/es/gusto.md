---
name: Gusto
logo: /connectors/gusto.svg
category: automation
status: available
simpleTitle: "Tu nómina y tu equipo, respondiendo en voz alta"
simpleSubtitle: "Server oficial de Gusto: empleados, contratistas, calendarios de pago e info de impuestos de nómina, leídos directo de tu cuenta."
devTitle: "Conector MCP de Gusto"
devSubtitle: "MCP hospedado oficial de Gusto (mcp.api.gusto.com) — datos de solo lectura de empresa, empleados, contratistas y nómina sobre OAuth 2.0 + PKCE."
ctaUrl: "https://gusto.com"
tokenHelpUrl: "https://docs.gusto.com/app-integrations/docs/mcp"
manifest:
  mcpServers:
    gusto:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.api.gusto.com"]
affiliate: false
tagline: "Tu nómina y tu planilla, al alcance de la IA"
originalAuthor: "Gusto"
originalAuthorUrl: "https://docs.gusto.com/app-integrations/docs/mcp"
license: "proprietary"
licenseUrl: "https://gusto.com/legal/terms"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Gusto** es la plataforma de nómina y RR.HH. que muchas pequeñas empresas usan para pagarle a empleados y contratistas, llevar el control de tiempo libre, y manejar el papeleo que arrastra la nómina. El conector oficial de Gusto lee tu cuenta directamente — quién está en nómina, cuándo cae el próximo pago, cuánto se le pagó a un contratista, cómo se ven los impuestos de nómina y las deducciones — así tu IA responde en palabras simples en vez de que tú entres y busques entre pestañas.

Pregúntale *"¿Cuántos empleados tenemos y cuáles están en California?"* y te lista la planilla por ubicación. Pregúntale *"¿Cuándo es nuestra próxima nómina y más o menos cuánto va a costar?"* y lee tu calendario de pago y el próximo período. Pregúntale *"¿Cuánto les pagamos a los contratistas el mes pasado?"* y trae el historial de pagos a contratistas. Es de **solo lectura**: según la propia documentación de Gusto, cada tool "asegura que tus datos de nómina y empleados se mantengan seguros" y ninguna puede correr una nómina, mover plata, ni cambiar el registro de un empleado.

### Qué le puedes pedir

- *"Lístame a todos los que están en nómina en la oficina de Austin y sus puestos."*
- *"¿Cuál es nuestra próxima fecha de pago y período?"*
- *"¿Cuánto les pagamos a los contratistas en total el trimestre pasado?"*

### Cómo te conectas

Este conector **no te pide pegar ninguna API key**. Usa el login de tu propia cuenta de Gusto:

1. Cuando lo activas, se abre una ventana del navegador para que entres a Gusto y autorices el acceso (OAuth).
2. Gusto te deja elegir exactamente qué categorías de datos compartes — Información de la empresa, Datos de empleados, Datos de contratistas, Datos de nómina, Control de tiempo. Solo dale acceso a lo que quieras que la IA vea.
3. Ya está: no hay token que copiar ni renovar a mano. La guía oficial de Gusto está en [docs.gusto.com](https://docs.gusto.com/app-integrations/docs/mcp).

**Aviso honesto:** es un server **hospedado por Gusto** (no corre en tu computadora), y es de solo lectura por diseño — puede consultar cosas, no cambiarlas. Si necesitas correr la nómina de verdad o editar el archivo de un empleado, eso sigue pasando adentro de Gusto.

--- dev ---

Gusto publica su **Gusto MCP Server** como un server hospedado en `https://mcp.api.gusto.com` (Streamable HTTP), documentado en `docs.gusto.com/app-integrations/docs/mcp`. No hay paquete npm ni instalación local — igual que Zoom/PostHog/Ideogram, se alcanza con el bridge `mcp-remote`:

```
npx -y mcp-remote@latest https://mcp.api.gusto.com
```

36 tools en seis categorías (verbatim de la referencia de tools de Gusto):

- **Empresa y organización**: `list_gusto_companies`, `list_company_locations`, `list_company_departments`, `get_department`, `get_location`.
- **Empleados**: `list_company_employees`, `get_gusto_employee`, `list_employee_jobs`, `get_job`, `list_job_compensations`, `get_compensation`, `list_employee_employment_history`, `list_employee_terminations`, `get_employee_rehire`, `list_employee_custom_fields`, `list_employee_home_addresses`, `get_employee_home_address`, `list_employee_work_addresses`, `get_employee_work_address`.
- **Contratistas**: `list_company_contractors`, `get_contractor`, `list_company_contractor_payments`, `get_contractor_payment`, `list_company_contractor_payment_groups`, `get_contractor_payment_group`.
- **Nómina**: `list_company_payrolls`, `get_payroll`, `list_company_pay_schedules`, `get_pay_schedule`, `list_company_pay_periods`, `list_company_pay_schedule_assignments`, `list_company_earning_types`.
- **Control de tiempo**: `list_company_time_sheets`, `get_time_sheet`, `list_time_records`, `get_employee_earnings_summary`.
- **Utilidad**: `get_token_info`, `list_company_custom_fields_schema`.

El acceso se define por conexión según la categoría — Información de la empresa, Datos de empleados, Datos de contratistas, Datos de nómina (descripción de Gusto: *"Payroll runs, pay schedules, tax information, and deductions"*), Control de tiempo.

**Divulgación:** la sección "About" del propio Gusto dice que cada tool es de solo lectura y lista explícitamente lo que el server NO puede hacer: ejecutar corridas de nómina, transferir plata, crear/modificar/borrar empleados, cambiar compensación o beneficios, o modificar la configuración de la empresa. El changelog de Gusto menciona por separado nombres de tools más nuevos `update_payroll` / `run_payroll` (una variante "widgetizada" atada al endpoint `/anthropic`), pero esos no están en la referencia publicada de tools de Gusto y contradicen la declaración de solo-lectura — TerminalSync shipea contra la superficie documentada de solo lectura únicamente, y va a agregar un paso de confirmación en cuanto la referencia oficial de Gusto documente un tool de escritura acá.

Auth: OAuth 2.0 con PKCE — `mcp-remote` abre el navegador, entras con tu cuenta de Gusto y apruebas los scopes de categoría de arriba; no hay client secret que guardar. Licencia: SaaS propietario (sin repo OSS que redistribuir — misma forma que Ideogram/Zapier en este catálogo); términos en `gusto.com/legal/terms`.
