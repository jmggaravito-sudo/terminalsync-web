---
name: Slack Summarizer
vendor: community
logo: /skills/slack-summarizer.svg
category: productivity
status: soon
hidden: true
simpleTitle: "Ponete al día en Slack en 30 segundos"
simpleSubtitle: "¿Volvés de vacaciones? ¿Almuerzo? ¿Reunión larga? Claude lee los canales que te importan y arma el TL;DR."
devTitle: "Slack Summarizer Skill"
devSubtitle: "Digest de canales con resolución de threads y extracción de decisiones."
ctaUrl: "https://terminalsync.ai/skills/slack-summarizer"
affiliate: false
tagline: "TL;DR de los canales que importan"
tsInstallable: true
author: "TerminalSync"
license: "proprietary"
---
No necesitás leer 200 mensajes para saber qué pasó. Decile a Claude *"resumí #engineering y #product desde las 9am"* y obtenés: decisiones tomadas, blockers planteados, en qué necesitan que opines.

Próximamente. Va con el conector de Slack.

--- dev ---

La skill Slack Summarizer consume `conversations.history` + `conversations.replies` del conector de Slack y produce un digest estructurado:

- Decisiones ("acordamos shippear X")
- Preguntas abiertas etiquetando al que pregunta y el rol al que apunta
- Action items con responsables
- Sentiment / blockers que merecen lectura manual

Output en markdown, listo para pegar en tu daily log de Notion.
