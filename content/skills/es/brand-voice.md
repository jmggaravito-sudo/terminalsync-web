---
name: Brand Voice
vendor: community
logo: /skills/brand-voice.svg
category: marketing
status: available
simpleTitle: "Hacé que Claude escriba en TU voz"
simpleSubtitle: "Dale 5 muestras de tu escritura una sola vez. De ahí en más cada mail, post, copy de anuncio suena a vos."
devTitle: "Brand Voice Skill"
devSubtitle: "Modelado de voz few-shot: guarda 3-7 muestras + un manifest de tono, y lo aplica en cada generación."
ctaUrl: "https://github.com/terminalsync/skills"
affiliate: false
tagline: "Tu voz, no inglés genérico de IA"
tsInstallable: true
---

La forma más rápida de quitarle el "olor a GPT" a tu contenido. Pasale 3-5 mails, posts o artículos que hayas escrito. Claude detecta tu ritmo de oración, tus tics de vocabulario y tu tono — todo lo que produzca después suena como si lo hubieras escrito vos.

Probada con redactores de newsletter, founders que postean en LinkedIn y copywriters trabajando para clientes. Funciona en español, inglés y portugués.

--- dev ---

La implementación es un `SKILL.md` + directorio `samples/`. El prompt:

1. Carga cada muestra desde `samples/*.md`
2. Extrae un manifest de tono: largo promedio de oración, diversidad léxica, openers/closers comunes, hábitos de puntuación
3. Aplica el manifest como restricción fuerte en cada llamada `Voice.write()`

Una vez instalada vía Terminal Sync, tu `samples/` te sigue — escribís una nueva en tu laptop y queda disponible en cada Mac la próxima vez que abrís Claude Code.
