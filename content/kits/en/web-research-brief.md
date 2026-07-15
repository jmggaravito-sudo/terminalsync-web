---
name: Web Research & Briefs Kit
logo: /logos/ts-kit.svg
category: research
status: available
tagline: "Research a topic on the web, remember what you find across sessions, and turn it into a clear brief."
description: "A coherent research bundle for analysts, consultants, and founders who investigate topics on the web and need findings that persist across sessions and become a structured brief, not scattered tabs."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: brave-search
    reason: "Searches the web through an independent index so the research is grounded in current sources instead of the model's training memory."
  - kind: connector
    slug: memory
    reason: "Persists findings, entities, and relationships across sessions so a multi-day investigation accumulates instead of starting over each time."
  - kind: skill
    slug: doc-coauthoring
    reason: "Turns the accumulated findings into a clear, well-structured brief with the user instead of a raw dump of links."
---
## Who it is for

Analysts, consultants, researchers, and founders who investigate a market, competitor, technology, or question on the web and need the result to be a clear brief — with findings that carry over from one session to the next.

Use it when the recurring job is "look into this, keep track of what we learn, and write it up".

## What it helps you do

This kit connects web research to a durable output:

- Search the web with Brave Search to gather current sources on a topic.
- Persist the findings, entities, and relationships in Memory so a multi-session investigation builds up.
- Recall earlier findings in a later session instead of re-researching from zero.
- Turn the accumulated material into a structured brief with Doc Co-authoring.

The expected outcome is a sourced brief that reflects several research passes, not a one-shot answer that forgets everything by tomorrow.

## What's included

### Skills

- **Doc Co-authoring** — co-writes the brief from the accumulated findings, giving it structure and clarity. It is where the research becomes a deliverable.

### Connectors

- **Brave Search** — searches the web through an independent index so the research is grounded in current sources.
- **Memory** — stores findings, entities, and relationships across sessions so the investigation accumulates rather than restarting.

### CLI

No CLI tool is included. The target user is often non-technical, and the research-to-brief workflow does not require terminal execution.

## How to use it

1. Install the kit and connect Brave Search with a `BRAVE_API_KEY`.
2. Ask the assistant to research the topic with Brave Search and capture the key findings and sources into Memory.
3. Continue across sessions: ask it what it already knows before searching again, so new passes build on the old ones.
4. When the picture is complete, use Doc Co-authoring to draft a structured brief from the stored findings.
5. Review the brief, ask for a sources section, and refine the framing.

## Why these pieces belong together

The kit is useful because research is rarely one session:

- Brave Search grounds each pass in current, independent sources.
- Memory keeps what you learned so the next session adds instead of repeating.
- Doc Co-authoring turns the accumulated knowledge into a brief someone can actually read.

Installed separately, findings live in scrollback and disappear, and each session re-researches the same ground. Installed together, the kit gives a coherent path: **search → remember → keep building → write the brief**.

## Limits

- It does not guarantee completeness or accuracy of web sources; a human validates the findings before they are used for decisions.
- Brave Search requires a Brave Search API key and is subject to that account's plan limits.
- Memory persists what the assistant is told to store; it is not a full knowledge base or database, and you decide what is worth keeping.
- It does not access paywalled, private, or authenticated sources unless you supply that content directly.
- It is a research-and-drafting kit, not an analytics or data-pipeline tool — for structured datasets, use a database connector instead.
