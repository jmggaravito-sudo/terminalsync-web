---
name: Gusto
logo: /connectors/gusto.svg
category: automation
status: available
simpleTitle: "Payroll and team info, answering out loud"
simpleSubtitle: "Official Gusto server: employees, contractors, pay schedules and payroll tax info, read straight from your account."
devTitle: "Gusto MCP Connector"
devSubtitle: "Official hosted Gusto MCP (mcp.api.gusto.com) — read-only company, employee, contractor and payroll data over OAuth 2.0 + PKCE."
ctaUrl: "https://gusto.com"
tokenHelpUrl: "https://docs.gusto.com/app-integrations/docs/mcp"
manifest:
  mcpServers:
    gusto:
      command: npx
      args: ["-y", "mcp-remote@latest", "https://mcp.api.gusto.com"]
affiliate: false
tagline: "Your payroll and team roster, within reach of the agent"
originalAuthor: "Gusto"
originalAuthorUrl: "https://docs.gusto.com/app-integrations/docs/mcp"
license: "proprietary"
licenseUrl: "https://gusto.com/legal/terms"
marketplaceSource: "official"
marketplaceCategory: "web"
---
**Gusto** is the payroll and HR platform many small businesses use to pay employees and contractors, track time off, and handle the paperwork payroll drags along with it. The official Gusto connector reads your account directly — who's on payroll, when the next pay run lands, what a contractor was paid, what payroll taxes and deductions look like — so your AI can answer in plain words instead of you logging in and clicking through tabs.

Ask *"How many employees do we have and which ones are in California?"* and it lists your roster by location. Ask *"When's our next payroll and roughly what's it going to cost?"* and it reads your pay schedule and upcoming pay period. Ask *"What did we pay our contractors last month?"* and it pulls contractor payment history. It's **read-only**: per Gusto's own documentation, every tool here "ensures your payroll and employee data remains secure" and none of them can run a payroll, move money, or change an employee's record.

### What you can ask

- *"List everyone on payroll in the Austin office and their job titles."*
- *"What's our next pay date and pay period?"*
- *"How much did we pay contractors in total last quarter?"*

### How you connect

This connector **doesn't ask you to paste any API key**. It uses your own Gusto account login:

1. When you enable it, a browser window opens for you to sign in to Gusto and authorize access (OAuth).
2. Gusto lets you choose exactly what categories of data to share — Company Information, Employee Data, Contractor Data, Payroll Data, Time Tracking. Only grant what you want the agent to see.
3. That's it: no token to copy or renew by hand. Gusto's own setup guide is at [docs.gusto.com](https://docs.gusto.com/app-integrations/docs/mcp).

**Honest note:** it's a server **hosted by Gusto** (it doesn't run on your computer), and it's read-only by design — it can look things up, not change them. If you need to actually run payroll or edit an employee's file, that still happens inside Gusto.

--- dev ---

Gusto publishes its **Gusto MCP Server** as a hosted server at `https://mcp.api.gusto.com` (Streamable HTTP), documented at `docs.gusto.com/app-integrations/docs/mcp`. There's no npm package or local install — same as Zoom/PostHog/Ideogram, it's reached with the `mcp-remote` bridge:

```
npx -y mcp-remote@latest https://mcp.api.gusto.com
```

36 tools across six categories (verbatim from Gusto's tools reference):

- **Company & Organization**: `list_gusto_companies`, `list_company_locations`, `list_company_departments`, `get_department`, `get_location`.
- **Employees**: `list_company_employees`, `get_gusto_employee`, `list_employee_jobs`, `get_job`, `list_job_compensations`, `get_compensation`, `list_employee_employment_history`, `list_employee_terminations`, `get_employee_rehire`, `list_employee_custom_fields`, `list_employee_home_addresses`, `get_employee_home_address`, `list_employee_work_addresses`, `get_employee_work_address`.
- **Contractors**: `list_company_contractors`, `get_contractor`, `list_company_contractor_payments`, `get_contractor_payment`, `list_company_contractor_payment_groups`, `get_contractor_payment_group`.
- **Payroll**: `list_company_payrolls`, `get_payroll`, `list_company_pay_schedules`, `get_pay_schedule`, `list_company_pay_periods`, `list_company_pay_schedule_assignments`, `list_company_earning_types`.
- **Time Tracking**: `list_company_time_sheets`, `get_time_sheet`, `list_time_records`, `get_employee_earnings_summary`.
- **Utility**: `get_token_info`, `list_company_custom_fields_schema`.

Access is scoped per connection by category — Company Information, Employee Data, Contractor Data, Payroll Data (Gusto's description: *"Payroll runs, pay schedules, tax information, and deductions"*), Time Tracking.

**Disclosure:** Gusto's own "About" section states every tool is read-only and explicitly lists what the server cannot do: execute payroll runs, transfer money, create/modify/delete employees, change compensation or benefits, or modify company settings. Gusto's changelog separately references newer `update_payroll` / `run_payroll` tool names (a "widgetized" variant tied to the `/anthropic` endpoint variant), but those aren't listed in Gusto's published tools reference and contradict the read-only statement — TerminalSync ships against the documented read-only surface only, and will add a confirmation-gate the moment Gusto's own reference documents a write-capable tool here.

Auth: OAuth 2.0 with PKCE — `mcp-remote` opens the browser, you sign in with your Gusto account and approve the category scopes above; no client secret to store. License: proprietary SaaS (no OSS repo to redistribute — same shape as Ideogram/Zapier in this catalog); terms at `gusto.com/legal/terms`.
