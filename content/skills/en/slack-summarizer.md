---
name: Slack Summarizer
vendor: community
logo: /skills/slack-summarizer.svg
category: productivity
status: soon
hidden: true
simpleTitle: "Catch up on Slack in 30 seconds"
simpleSubtitle: "Coming back from PTO? Lunch? A long meeting? Claude reads the channels you care about and writes the TL;DR."
devTitle: "Slack Summarizer Skill"
devSubtitle: "Channel digest with thread resolution and decision extraction."
ctaUrl: "https://terminalsync.ai/skills/slack-summarizer"
affiliate: false
tagline: "TL;DR for the channels that matter"
tsInstallable: true
author: "TerminalSync"
license: "proprietary"
---
You don't need to read 200 messages to know what happened. Tell Claude *"summarize #engineering and #product since 9am"* and you get: decisions made, blockers raised, who needs you to weigh in.

Coming soon. Pairs with the Slack connector.

--- dev ---

The Slack Summarizer skill consumes the Slack connector's `conversations.history` + `conversations.replies` and produces a structured digest:

- Decisions ("we agreed to ship X")
- Open questions tagging the asker and the targeted role
- Action items with assignees
- Sentiment / blockers worth a manual read

Output is markdown, ready to drop into your Notion daily log.
