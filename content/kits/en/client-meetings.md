---
name: Client Meetings Kit
logo: /logos/ts-kit.svg
category: operations
status: available
tagline: "See the week's client calls coming, pull what was actually said, and turn it into tracked follow-up — the whole meeting loop in one place."
description: "A coherent operations bundle for a consultant, agency owner, coach, or freelancer whose business runs on client meetings: see the week's meetings before they happen, pull the summary and decisions afterwards, turn the agreements into tracked tasks, and keep the team aligned — instead of letting what was agreed evaporate when the call ends."
marketplaceSource: "terminalsync"
items:
  - kind: connector
    slug: google-calendar
    reason: "Shows the client week before it happens — what's coming, what each meeting is about, where you're free — so you prep instead of discovering the agenda when the call starts, and it's where the follow-up gets booked while it's still fresh."
  - kind: connector
    slug: zoom
    reason: "Holds what was actually said — AI summaries, transcripts, recordings with next steps — so 'what did we agree?' has a real answer instead of two people remembering it differently, and it turns the notes into a follow-up doc."
  - kind: connector
    slug: todoist
    reason: "Turns what was agreed into real tasks with due dates, priority, and a project, so promises made on the call become tracked work instead of good intentions that resurface a month later."
  - kind: skill
    slug: internal-comms
    reason: "Drafts the team-facing recap of what was decided and what changes — audience, tone, who owns what, what's next — instead of forwarding a raw transcript nobody reads."
---
## Who it is for

A consultant, agency owner, coach, or any service-business owner whose week is a string of client calls. The meetings you already have — the recurring job this kit covers is everything around them: preparing, remembering what was said and agreed, and making sure the follow-up actually happens.

Use it when the recurring questions are *"what did we agree?"*, *"who was supposed to do that?"*, and *"when am I seeing this client again?"* — and nobody can answer them without re-watching a recording.

## What it helps you do

This kit covers the loop around a client meeting — before, during, and after:

- **Before**: see the week's client meetings and what each one is about, so you walk in prepared instead of discovering the agenda when the call starts.
- **After**: pull the summary, transcript, or recording of what was actually said — decisions, objections, numbers — without re-watching the whole call.
- **Follow-through**: turn what was agreed into tasks with due dates and priority, and book the next meeting while the calendar is open in front of you.
- **Alignment**: give the team a clear recap of what was decided and what changes, so decisions don't stay trapped in the recording.

The expected outcome: nothing agreed in a client meeting gets lost between the call and the work.

## What's included

### Connectors

- **Google Calendar** — the map of the client week: what's coming, what each event is, whether you're free before you commit, and where the follow-up call gets booked.
- **Zoom** — the record of what was said: AI-generated meeting summaries, transcripts, recordings with playback links and next steps, Team Chat, and follow-up Zoom Docs created from your notes and action items.
- **Todoist** — the follow-through: tasks created with a due date, priority, and project, and read back when you ask *"what did I not finish this week?"*.

### Skills

- **Internal Comms** — turns meeting outcomes into a team-facing recap: what was decided, what changes, who owns what, and what's next, with the right tone for the audience — not a raw transcript dump.

## How to use it

1. Install the kit, connect Zoom with your own Zoom account (a browser login — no API key), connect Google Calendar through its one-time Google Cloud setup, and paste your Todoist API token.
2. On Monday, ask *"what client meetings do I have this week, and what's each one about?"* — and prep the ones that need it.
3. After a meeting, ask *"pull the summary and the action items from today's call with [client]"* — Zoom brings back what was said and agreed, and can draft the follow-up doc.
4. Turn the agreements into work: *"create a Todoist task for each action item, due this week"*, and *"book the follow-up with [client] two weeks out if I'm free."*
5. When a decision affects the team, ask Internal Comms for a short recap — what was decided, what changes, who owns it — and share it where your team reads.

## Why these pieces belong together

The kit follows the real loop of a client-meeting business, not a pile of productivity tools:

- Google Calendar tells you **what's coming** — the prep and the booking.
- Zoom holds **what was said** — the summary, transcript, and recording that make *"what did we agree?"* answerable.
- Todoist tracks **what happens next** — agreements turned into dated, prioritized work.
- Internal Comms closes the loop **with the team** — decisions become a message people actually read.

Installed separately, you check a calendar, re-watch a recording, keep the promises in your head, and the team hears about decisions second-hand. Installed together, one path covers the whole loop: **see the meeting → capture what was said → task the follow-up → brief the team.**

It shares Internal Comms with the Team Operations Kit, but the ground is different: that kit runs on ClickUp's task board for day-to-day team status; this one runs on the client meeting itself — the calendar, the call, and the promises made on it.

## Limits

- It reads what Zoom kept: if a meeting wasn't recorded or summarized by Zoom — which depends on your Zoom plan and settings — there's nothing to pull, and the kit can't reconstruct a meeting that left no record. Meetings held outside Zoom (a phone call, Google Meet, Teams) don't leave one here.
- It doesn't run the meeting for you: no agenda enforcement, no live note-taking, no CRM logging — for deal and pipeline tracking, use the B2B Sales Pipeline Kit instead.
- Zoom and Google Calendar connect through your own accounts (OAuth); Google Calendar's one-time Google Cloud project setup is the fiddliest step of the install. Todoist needs its API token. Each piece is bounded by that account's permissions.
- Creating events, tasks, and follow-up docs changes real things — those actions are gated behind a confirmation step before anything is written.
- Zoom Workspace is a server hosted by Zoom, reached through the `mcp-remote` bridge; what the agent can see or create is bounded by your Zoom account.
