---
name: Database Insights Kit
logo: /logos/ts-kit.svg
category: operations
status: available
tagline: "Turn a question about your Postgres data into a structured, written answer."
description: "A coherent analysis workflow for data-literate operators and PMs: query a Postgres database read-only, reason through the question step by step, and hand back a written brief instead of a raw result set."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: postgres
    reason: "Gives read-only query access to the actual database, so the analysis runs on real rows instead of assumptions about the data."
  - kind: connector
    slug: sequential-thinking
    reason: "Provides a structured, step-by-step reasoning scaffold so a fuzzy business question is broken into ordered analysis steps rather than one guessed query."
  - kind: skill
    slug: doc-coauthoring
    reason: "Turns the findings into a clear, shareable written brief — the deliverable a stakeholder actually reads — instead of leaving a raw table."
---
## Who it is for

Data-literate operators, analysts, and product managers who have a Postgres database and keep answering the same shape of question — "how many, which segment, what changed" — and want a written answer they can share, not just a query result.

Use it when the person asking the question can read SQL output but wants the reasoning and the write-up handled consistently.

## What it helps you do

This kit turns a data question into a brief:

- Query the database read-only with the Postgres connector.
- Break the question into ordered steps with Sequential Thinking, so assumptions are explicit and each step builds on the last.
- Co-author a clear written brief of the findings with Doc Co-authoring.

The expected outcome is a short, sourced brief — what was asked, how it was computed, what the numbers say, and the caveats — not an unexplained table.

## What's included

### Connectors

- **Postgres** — read-only query access to the database the analysis reasons over.
- **Sequential Thinking** — a structured reasoning scaffold that turns one question into ordered, inspectable steps.

### Skills

- **Doc Co-authoring** — shapes the findings into a shareable written brief with structure and caveats.

## How to use it

1. Install the kit and connect Postgres with a read-only connection string.
2. Ask your question in plain language ("which plans drove last month's churn?").
3. Ask the AI to use Sequential Thinking to lay out the analysis steps and the queries each needs before running them.
4. Let it run the read-only queries through Postgres and check the intermediate results.
5. Ask Doc Co-authoring to write the brief: question, method, findings, and caveats — ready to paste into a doc or message.

## Why these pieces belong together

The kit is coherent because it separates the three things a good data answer needs:

- Postgres supplies the evidence — the real rows.
- Sequential Thinking supplies the method — ordered steps instead of one hopeful query.
- Doc Co-authoring supplies the deliverable — a brief a stakeholder can read.

Installed separately, you get a query tool and a writing assistant that don't talk to each other. Installed together, the kit gives one path: **frame the question → query the data → reason in steps → write the brief**.

## Limits

- It reads data; it does not change it. Use a read-only connection — the kit does not enforce one for you.
- It is only as correct as the data and the question: a wrong assumption produces a confident wrong brief. Check the method, not just the number.
- It is not a BI dashboard or a scheduled report — it answers a question on demand, it does not monitor metrics over time.
- Postgres requires its own connection string and is subject to that database's access controls.
- It does not connect to spreadsheets, warehouses, or non-Postgres databases; those need a different setup.
