---
name: Deep Research
vendor: community
logo: /skills/deep-research.svg
category: research
status: soon
hidden: true
simpleTitle: "Multi-source research in one prompt"
simpleSubtitle: "Claude reads, cross-references and cites — like a junior analyst, but in 90 seconds."
devTitle: "Deep Research Skill"
devSubtitle: "Iterative search/fetch/synthesize loop with citation tracking."
ctaUrl: "https://terminalsync.ai/skills/deep-research"
affiliate: false
tagline: "Background-tab research with citations"
tsInstallable: true
author: "TerminalSync"
license: "proprietary"
---
Ask *"what are the 3 best practices for retention in Latin America fintechs in 2025, with sources"* — Claude searches, fetches, cross-references, and gives you a brief with footnotes. No more 40 open tabs.

Coming soon. Join the waitlist from your Terminal Sync dashboard.

--- dev ---

The Deep Research skill orchestrates a search → fetch → synthesize loop:

1. Decompose the query into 3-7 sub-queries
2. Run each via the configured search backend (Brave, Tavily, or your own)
3. Fetch top-K results, dedupe by URL canonicalization
4. Generate a structured brief with inline citations `[N]` referencing a sources table

Currently in private beta — early-access slots open to TS subscribers first.
