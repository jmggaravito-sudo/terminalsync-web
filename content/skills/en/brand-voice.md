---
name: Brand Voice
vendor: community
logo: /skills/brand-voice.svg
category: marketing
status: available
hidden: true
simpleTitle: "Make Claude write in YOUR voice"
simpleSubtitle: "Feed it 5 samples of your writing once. From then on, every email, post, ad copy sounds like you."
devTitle: "Brand Voice Skill"
devSubtitle: "Few-shot voice modeling: stores 3-7 prose samples + a tone manifest, then enforces them on every generation."
ctaUrl: "https://github.com/terminalsync/skills"
affiliate: false
tagline: "Your voice, not generic AI English"
tsInstallable: true
author: "TerminalSync"
license: "proprietary"
---
The fastest way to break the "GPT smell" off your content. Drop in 3-5 emails, posts, or articles you've written. Claude pattern-matches your sentence rhythm, vocabulary quirks, and tone — every output from then on sounds like you wrote it.

Tested with newsletter writers, founders posting on LinkedIn, and copywriters drafting client work. Works for English, Spanish, and Portuguese.

--- dev ---

Implementation is a `SKILL.md` plus a `samples/` directory. The skill prompt:

1. Loads each sample from `samples/*.md`
2. Extracts a tone manifest: avg sentence length, vocabulary diversity, common openers/closers, punctuation habits
3. Enforces the manifest as a hard constraint on every `Voice.write()` call

Once installed via Terminal Sync, your `samples/` follow you — write a new one on your laptop, it's available on every other Mac next time you open Claude Code.
