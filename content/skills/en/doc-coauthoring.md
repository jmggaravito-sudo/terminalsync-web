---
name: Doc Co-Authoring
logo: /skills/doc-coauthoring.svg
category: productivity
vendors: ["claude", "codex"]
author: "Anthropic"
status: available
tagline: "Structured co-author for long docs"
description: "Guides complex documents through brief, outline, section drafts, review passes, and final polish without losing the thread."
license: "MIT"
marketplaceSource: "anthropic"
compatibleWith: ["claude", "codex"]
---
## When to use

- You are writing a long document where structure matters: proposal, RFC, strategy memo, business plan, whitepaper, report, article series, or non-binding contract draft for discussion.
- You need collaboration over multiple rounds: brief → outline → section drafts → revision → final.
- You want the assistant to preserve decisions, open questions, audience, tone, and unresolved assumptions instead of rewriting from scratch every turn.
- You need a stronger process than a one-shot "write this document" prompt.

For legal documents, it can help organize a discussion draft, issues list, or plain-language summary. It does not create binding legal contracts and should recommend qualified lawyer review before use or signature.

## What it does

Runs a co-authoring workflow:

- **Brief capture**: goal, audience, desired length, source material, constraints, voice, deadline, and success criteria.
- **Outline first**: proposes structure and asks for approval before drafting full sections.
- **Section-by-section drafting**: writes in controlled chunks and pauses for feedback, avoiding one giant unreviewable draft.
- **Revision passes**: checks coherence, repeated points, missing evidence, hidden assumptions, tone drift, and unanswered reader questions.
- **Final package**: produces the polished document plus optional executive summary, open issues, and next-step checklist.

It should ask for missing source material when accuracy depends on it, and it should label assumptions instead of inventing facts, citations, approvals, legal terms, or stakeholder decisions.

## How to use

1. Describe the document type, audience, goal, length, deadline, tone, and source material.
2. Ask for an outline first, not a full draft: *"Use Doc Co-Authoring. Build the outline and list assumptions before writing."*
3. Approve or edit the outline.
4. Draft one section at a time and give feedback after each section.
5. Run final review passes for coherence, evidence, risks, and reader questions.
6. For contract-like or legally sensitive material, use the output as a working draft only and get legal review.

## Best for

Founders, operators, PMs, engineers, consultants, writers, and teams producing documents that need structure and iteration. Strongest when the user has source notes or decisions; weaker when asked to invent facts, legal commitments, or stakeholder approvals.
