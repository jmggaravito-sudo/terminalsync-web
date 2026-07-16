---
name: Deep Research
logo: /skills/deep-research.svg
category: research
vendors: ["claude", "codex"]
author: "TerminalSync"
status: soon
hidden: true
tagline: "Research with sources when tools exist"
description: "Plans and synthesizes multi-source research, while declaring search/fetch tool dependencies and citation limits before claiming sourced findings."
license: "proprietary"
marketplaceSource: "terminalsync"
compatibleWith: ["claude", "codex"]
---
## When to use

- You need a structured research brief across multiple sources, not a quick opinion.
- You have a question that benefits from decomposition, source gathering, comparison, synthesis, and uncertainty notes.
- You can provide a search/fetch backend, browser access, documents, URLs, PDFs, or pasted source material.
- You need source-aware output with claims tied to evidence when tooling is available.

Do not use it to pretend the assistant has searched when no search/fetch tool or source material is available. If the backend is missing, it must say so and either ask for sources or produce an unsourced research plan, not cited findings.

## What it does

Runs a research process:

- **Question framing**: clarifies scope, timeframe, geography, audience, and decision to support.
- **Search plan**: decomposes the topic into sub-questions and identifies the types of sources needed.
- **Source handling**: uses available search/fetch/browser/document tools or user-provided sources; deduplicates and compares evidence.
- **Synthesis**: produces key findings, disagreement between sources, confidence, gaps, and recommended next steps.
- **Citation discipline**: cites only sources actually inspected and distinguishes sourced findings from analysis or assumptions.
- **Limits**: flags stale, inaccessible, low-quality, paywalled, or missing sources.

It should avoid fake citations, invented URLs, and overconfident claims. For current facts, prices, laws, medical, financial, or legal topics, it should require up-to-date sources and stronger caveats.

## How to use

1. State the research question, decision context, date range, geography, and desired output format.
2. Provide or enable sources: search connector, browser, documents, URLs, PDFs, datasets, or pasted excerpts.
3. Ask for a research plan before the final brief when the topic is broad.
4. Require source table and claim-level citations only for sources actually inspected.
5. If no search/fetch backend exists, ask for a plan, keywords, and source checklist rather than a cited answer.

## Best for

Founders, analysts, marketers, product teams, operators, and researchers who need a careful brief from multiple sources. Strongest with browsing/search/document access; weak or limited when the assistant only has prior knowledge and no source material.
