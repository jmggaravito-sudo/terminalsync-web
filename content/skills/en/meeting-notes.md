---
name: Meeting Notes
logo: /skills/meeting-notes.svg
category: productivity
vendors: ["claude", "codex"]
author: "TerminalSync"
status: available
tagline: "Turn meeting notes into decisions and owned action items"
description: "Reads raw meeting notes or a transcript and returns the decisions made, action items with an owner and due date when stated, and the open questions — without inventing owners, dates, or commitments nobody made."
license: "proprietary"
marketplaceSource: "terminalsync"
compatibleWith: ["claude"]
catalogReady: false
---
## When to use

- You have raw meeting notes, a call transcript, or a messy paste and you want the decisions and next steps pulled out.
- You said "what did we actually decide?", "who owns what after this call?", or "turn these notes into action items".
- The meeting mixed real commitments with tangents and small talk, and you want the signal separated from the noise.
- You need a follow-up recap you can send without re-reading the whole transcript.

Do not use it to invent structure that isn't there. If the notes are too thin to recover decisions, the skill should say so rather than manufacture a tidy-looking list.

## What it does

Reads the notes and returns a structured recap:

- **Decisions**: what was actually agreed, quoted or closely paraphrased from the notes.
- **Action items**: each as *what — owner — due date*. Owner and due date are filled in **only when the notes state them**; otherwise they are marked `owner: unassigned` / `due: not stated`, never guessed.
- **Open questions**: unresolved points, disagreements, and things explicitly deferred.
- **One-line summary** (optional): the meeting's outcome in a sentence.

Its discipline is what makes it useful: it never attributes a commitment to a person who didn't make it, never invents a deadline, and never upgrades "we should maybe look into X" into a firm decision. Uncertainty is labeled, not smoothed over.

## How to use

1. Paste the meeting notes or transcript. Add the attendee names if the transcript uses initials or "Speaker 1".
2. Ask for the recap: decisions, action items (owner + due date when stated), and open questions.
3. If an owner or date is missing, ask the skill to leave it unassigned rather than assume — it does this by default.
4. Review the action items and fill in any owner/date the notes didn't capture before you send the recap.

## Best for

Managers, founders, and teams who run meetings and want a reliable recap without a notetaker app — especially non-technical users who just want "who owns what, by when" pulled cleanly from a paste, with nothing invented.
