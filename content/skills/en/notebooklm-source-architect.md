---
name: NotebookLM Source Architect
logo: /skills/notebooklm-source-architect.svg
category: research
vendors: ["claude", "codex"]
author: "TerminalSync"
status: available
catalogReady: false
tagline: "A source pack and prompts NotebookLM can actually ground answers in"
description: "Prepares the source list, order, and exact Studio prompts (Audio Overview, Mind Map, Study Guide) before you paste anything into NotebookLM — so its citations stay grounded instead of thin or scattered across too many documents."
license: "proprietary"
marketplaceSource: "terminalsync"
compatibleWith: ["claude", "codex"]
---
## When to use

- You have a pile of documents, PDFs, or links (business plans, policies, call transcripts, training material) you're about to load into Google's NotebookLM and want it organized before you start, not after a messy first pass.
- You want NotebookLM's Studio outputs — Audio Overview, Mind Map, Study Guide, quiz/flashcards — to focus on the right thing instead of a generic "summarize everything" pass.
- You want a set of precise guide questions to ask inside the notebook so its citation-backed answers are specific, not vague.

Do not use it expecting this skill to connect to NotebookLM, upload files, or generate audio/video itself — there is no official NotebookLM API or connector, so this skill only prepares what you paste in yourself. It does not fabricate what your source documents say, and if you haven't described your actual sources it will ask instead of inventing a notebook structure.

## What it does

- **A source list, ordered**: which documents to add first (the ones that define terms/context others depend on) versus supporting detail, and which sources are redundant enough to skip so the notebook doesn't get diluted.
- **A naming pass**: short, distinct titles for each source so NotebookLM's citations are easy to trace back to the right document instead of five files all called "final version."
- **Studio prompts written for you**: the exact ask to type for an Audio Overview (and which format — Brief, Critique, or Debate — fits the goal), a Mind Map framing question, and Study Guide/flashcard prompts scoped to the material that actually matters.
- **A guide-question set**: 5–8 specific questions to ask inside the notebook (not "what is this about") that pull grounded, citation-backed answers instead of generic ones.
- **The honest limit, stated plainly**: this skill has not read your actual source documents unless you pasted their content or a real summary — it organizes structure and prompts, not facts it wasn't given. It will say so instead of guessing what a source contains.

This skill never claims a live connection to NotebookLM or your Google account; the plan is something you carry over and use inside NotebookLM yourself.

## How to use

1. List what you're planning to add: the documents/links, roughly what each one covers, and what you actually want out of the notebook (a training resource, an onboarding guide, research synthesis).
2. Ask for the plan: *"Help me set up a NotebookLM notebook for [goal] with these sources: [list]."*
3. Get back the ordered source list with names, the Studio prompts, and the guide questions.
4. Load the sources into NotebookLM in the suggested order, then paste in the prepared prompts and questions.
5. If an answer inside NotebookLM comes back thin, that's a signal a source is missing or mis-named — add it and re-ask, rather than assuming the model invented a gap.

## Best for

Business owners and small teams turning scattered documents (policies, training material, meeting recordings, research) into a usable NotebookLM notebook without a messy trial-and-error setup. Works without any connector or account access — it's pure prep — so it's useful even before you've decided whether to use NotebookLM at all.
