---
name: Lead Capture & Follow-Up Kit
logo: /logos/ts-kit.svg
category: sales
status: available
tagline: "Turn the forms on your website into leads the whole team sees — and follow up with a real proposal instead of a forgotten reply."
description: "A coherent sales bundle for service-business owners who capture leads through online forms: build the intake form with the fields that qualify a lead, see which form actually converts, write the follow-up proposal for the best ones, and put the week's intake in front of the team."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: typeform
    reason: "Holds the whole intake layer — create and publish the form with the fields that qualify a lead, read responses as data (aggregates, rankings, time series), keep contacts and lists in sync with form-field mapping, and trigger the automation that alerts the team the moment a response lands — so leads stop living in an inbox nobody triages."
  - kind: skill
    slug: doc-coauthoring
    reason: "Turns a hot lead into the artifact that wins the job — a tailored proposal or quote built through brief → outline → draft → revision, reusing what the intake form already answered instead of asking the prospect the same questions twice."
  - kind: skill
    slug: internal-comms
    reason: "Puts the week's intake in front of the team — which leads came in, which form converts, who owns the follow-up — as a briefing people act on, not a forwarded notification."
---
## Who it is for

The owner of a service business — agency, consultancy, studio, clinic, contractor — or whoever wears the sales hat there. Leads arrive through forms on the website: a contact form, a quote request, a short survey before the first call. The recurring job this kit covers is the intake loop: every lead that fills a form gets seen, qualified, and answered while it's still warm.

Use it when the honest current state is: responses land in an inbox or a spreadsheet, follow-up depends on who remembers, and nobody can say which form actually brings in work.

## What it helps you do

The kit covers the loop from the form to the follow-up to the team:

- **Build the intake**: create, edit, and publish the form with the fields that qualify the lead — budget, timeline, project type — without touching a form builder by hand.
- **See what converts**: read responses as data — aggregates, top lists, time series — so "which form brings work and which brings noise" is a query, not a guess.
- **Follow up with an artifact**: for the leads worth pursuing, produce the tailored proposal or quote, reusing the intake answers as the brief.
- **Keep the team in the loop**: the week's leads — how many, from which form, who owns each follow-up — reach the team as a briefing, and the moment a new response lands, the automation ping goes out.

The expected outcome: intake stops being "check the inbox and hope" and becomes a repeatable loop — **capture → read → follow up → brief.**

## What's included

### Connectors

- **Typeform** — the intake layer. Creates and publishes forms, edits fields and logic, builds the automations (email, webhook, delay, integration steps) that react to new responses, manages contacts and lists with form-field mapping, and reads responses back as data — raw submissions, aggregates, rankings, and time series across its forms, themes, insights, automations, and contacts tool groups. Connects with your Typeform login in the browser; no API key to paste.

### Skills

- **Doc Co-Authoring** — the follow-up artifact. Takes the intake answers as the brief and walks the proposal through outline → draft → revision, keeping scope, numbers, and open questions consistent — so the document a prospect receives reads like it was written about their project, because it was.
- **Internal Comms** — the team-facing half. Drafts the weekly lead brief — what came in, which form converted, who owns what — and any intake change the team needs to hear about, with audience and tone calibrated instead of a forwarded ping.

## How to use it

1. Install the kit and connect Typeform with your account — a browser login, no API key. What the agent can see or do is bounded by your Typeform account and plan.
2. First session, build the intake: *"Create a contact form for my website with name, email and message fields, and publish it"* — then add the qualifying fields for your type of work.
3. Add the reaction: review the recipients and content, then explicitly approve enabling an automation with an email step so the team hears when a new response arrives. Connecting Typeform is not blanket approval to publish forms or send messages.
4. Weekly read: *"How many responses did my forms get this week, and which one converted best?"* Pick the leads worth pursuing from the top of that list.
5. For the best lead, ask Doc Co-Authoring for the proposal, feeding it the intake answers — scope, budget, timeline — as the brief.
6. Close the week with Internal Comms: the lead brief — what came in, what converted, who owns each follow-up — shared where the team actually reads.

## Why these pieces belong together

The kit follows the real loop of lead intake, not a pile of sales tools:

- Typeform holds **the intake and the signal** — the forms, the responses, the contacts, and the automation that reacts the moment a response lands.
- Doc Co-Authoring produces **the follow-up that wins the job** — a proposal built on the answers the lead already gave.
- Internal Comms makes the intake **visible to the team** — a brief people act on, not a notification that scrolls away.

Installed separately, you get a form builder with no follow-up discipline, proposals written from memory, and a team that learns about a lead when the prospect follows up asking if anyone got their message. Installed together, one path covers the loop: **publish the form → read what converted → draft the proposal for your review → brief the team.**

It is deliberately not the CRM kit: `b2b-sales-pipeline` runs deals inside HubSpot — stages, pipeline, deal-level follow-up — for sellers who already manage a pipeline. This kit covers the top of the funnel, before there is a deal: capturing the lead through a form and answering it well. And the two skills split the work Typeform's own automation can't do: the automation pings the team that a response arrived; Internal Comms writes the judgment message — what the week's intake means and who owns what.

## Limits

- **It requires Typeform.** If your intake doesn't run on Typeform, there is nothing to connect; this kit has no equivalent anchor for another forms platform.
- **Features are plan-dependent.** Typeform enforces access when a tool is called — a form, an automation, or an insight your plan doesn't include fails at call time, not at connect time.
- **EU-hosted accounts use different endpoints.** This connector points at Typeform's standard endpoint; if your account is on the EU data center, your account lives on Typeform's EU endpoints instead.
- **Deletes are irreversible.** Deleting a form or a contacts list through the connector cannot be undone — treat destructive asks with the same care as in the Typeform dashboard.
- **It drafts the follow-up; it doesn't send it.** The proposal is a document you review and send yourself — the kit does not send outreach email to prospects.
- **It is not a CRM and not email marketing.** Deal stages and pipeline management belong to `b2b-sales-pipeline`; recurring campaigns and newsletters need an email-marketing setup this kit doesn't include.
