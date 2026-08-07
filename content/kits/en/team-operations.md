---
name: Team Operations Kit
logo: /logos/ts-kit.svg
category: operations
status: available
tagline: "See what's due, pull the thread context, and tell the team what's moving and what's stuck — running day-to-day ops from one place."
description: "A coherent operations bundle for an operations lead or small team who tracks work in ClickUp and coordinates in Slack: see what's due or stalled, pull the relevant thread context, and turn it into a clear status update instead of chasing people for a verbal recap."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: clickup
    reason: "Reads and updates the actual task board: what's due, what's stuck with no updates, who it's assigned to, so status questions have a real answer instead of a guess."
  - kind: connector
    slug: slack
    reason: "Pulls the thread context behind a task or blocker and is where the resulting status update actually gets shared with the team."
  - kind: skill
    slug: internal-comms
    reason: "Turns task and project status into a clear internal update — what changed, what's blocked, who owns it, what's next — instead of a raw task-list dump."
---
## Who it is for

An operations lead, project coordinator, or small team who tracks the work itself in ClickUp and coordinates the team in Slack, and needs to turn "what's the status?" into an actual answer without pinging five people for a verbal recap.

Use it when the recurring job is "what's due, what's stuck, and does the team know?" for work that lives in a task board, not a wiki.

## What it helps you do

This kit covers the task-to-team-update loop of day-to-day operations:

- Check **what's due, what's stalled with no activity, and who owns it** by reading ClickUp directly.
- Pull the **Slack thread context** behind a task or a blocker, so the update reflects what was actually discussed.
- Turn the task status into a clear **internal status update** with Internal Comms — what changed, what's blocked, who's on it, what's next.
- Share that update back where the team already is, in Slack.

The expected outcome is a status update grounded in the real state of the work, written clearly, and delivered where the team actually looks — instead of a stale spreadsheet or a Slack message assembled from memory.

## What's included

### Connectors

- **ClickUp** — reads and updates workspaces, spaces, lists, tasks, and docs, so "what's due this week" or "what's stuck with no updates" has a real answer, and a new task or follow-up can be created directly.
- **Slack** — reads channel and thread history for the context behind a task or blocker, and posts the resulting update where the team is.

### Skills

- **Internal Comms** — turns raw task and thread context into a structured status update: what changed, what's blocked, who owns it, and what happens next, with the right tone for the audience.

## How to use it

1. Install the kit, connect ClickUp with a personal API token, and connect Slack with a bot token scoped to the relevant channels.
2. Ask *"what's due this week across my lists, and what's stuck with no updates?"* to check ClickUp.
3. For anything at risk, ask the assistant to pull the relevant Slack thread so the context is accurate, not assumed.
4. Ask Internal Comms to turn the task status and thread context into a short update: what changed, what's blocked, who owns it, what's next.
5. Post the update in the right Slack channel, or create a follow-up task in ClickUp for anything that needs an owner.

## Why these pieces belong together

The kit is coherent because it follows the real operations loop, not a pile of unrelated productivity tools:

- ClickUp holds **the actual state of the work** — what's due, what's stuck, who owns it.
- Slack holds **the conversation behind the work** — why it's stuck, what was already discussed.
- Internal Comms turns both into **the update the team can actually read**.

Installed separately, the operations lead checks a task board, scrolls through Slack for context, and writes the update from memory. Installed together, the kit gives one path: **check what's due and stuck → pull the real context → write the update → share it where the team is**.

It overlaps with Docs & Team Comms on Internal Comms and Slack, but the purpose is different: Docs & Team Comms is grounded in Notion's wiki for documentation and announcements; this kit is grounded in ClickUp's task board for day-to-day project execution status, not long-form docs.

## Limits

- It does not manage deadlines, reassign work, or make prioritization calls on its own — it surfaces status and drafts the update; a human still decides and acts.
- ClickUp and Slack each need their own token/app connection and are subject to those accounts' permissions and channel scope.
- Create/update actions in ClickUp mutate real tasks and are gated behind a confirmation step.
- It is not a full project-management platform — no Gantt charts, time tracking, or resourcing; use ClickUp's own views for that.
- For documentation and long-form internal announcements grounded in a team wiki, use the Docs & Team Comms Kit instead — this kit is scoped to task/project status, not knowledge-base writing.
