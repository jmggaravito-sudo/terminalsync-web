---
name: NotebookLM Source Architect
logo: /skills/notebooklm-source-architect.svg
category: research
vendors: ["claude", "codex"]
author: "TerminalSync"
status: available
catalogReady: false
tagline: "Un paquete de fuentes y prompts que NotebookLM puede usar de verdad"
description: "Prepara la lista de fuentes, el orden, y los prompts exactos de Studio (Audio Overview, Mind Map, Study Guide) antes de que pegues nada en NotebookLM — para que sus citas queden bien fundamentadas en vez de dispersas entre demasiados documentos."
license: "proprietary"
marketplaceSource: "terminalsync"
compatibleWith: ["claude", "codex"]
---
## Cuándo usarlo

- Tenés un montón de documentos, PDFs o links (planes de negocio, políticas, transcripciones de llamadas, material de capacitación) que estás por cargar en NotebookLM de Google y querés organizarlos antes de empezar, no después de un primer intento desordenado.
- Querés que los resultados de Studio en NotebookLM — Audio Overview, Mind Map, Study Guide, quiz/flashcards — se enfoquen en lo correcto en vez de un pase genérico de "resumime todo".
- Querés un set de preguntas guía precisas para hacer dentro del notebook, para que sus respuestas con cita sean específicas y no vagas.

No sirve si esperás que este skill se conecte a NotebookLM, suba archivos, o genere audio/video por sí mismo — no existe una API o conector oficial de NotebookLM, así que este skill solo prepara lo que vos vas a pegar. No inventa qué dicen tus documentos fuente, y si no describiste tus fuentes reales, va a preguntar en vez de inventar una estructura de notebook.

## Qué hace

- **Una lista de fuentes, ordenada**: qué documentos agregar primero (los que definen términos/contexto de los que dependen otros) versus el detalle de apoyo, y qué fuentes son lo bastante redundantes como para dejar afuera, para que el notebook no se diluya.
- **Un pase de nombres**: títulos cortos y distintos para cada fuente, para que las citas de NotebookLM sean fáciles de rastrear hasta el documento correcto en vez de cinco archivos que se llaman todos "versión final".
- **Prompts de Studio ya escritos**: el pedido exacto para un Audio Overview (y qué formato — Brief, Critique o Debate — le queda mejor al objetivo), una pregunta de encuadre para el Mind Map, y prompts de Study Guide/flashcards acotados al material que realmente importa.
- **Un set de preguntas guía**: 5–8 preguntas específicas para hacer dentro del notebook (no "de qué se trata esto") que saquen respuestas fundamentadas con cita, en vez de respuestas genéricas.
- **El límite honesto, dicho sin vueltas**: este skill no leyó tus documentos fuente reales salvo que hayas pegado su contenido o un resumen real — organiza estructura y prompts, no hechos que no le diste. Lo va a decir en vez de adivinar qué contiene una fuente.

Este skill nunca dice tener una conexión en vivo con NotebookLM ni con tu cuenta de Google; el plan es algo que vos llevás y usás dentro de NotebookLM.

## Cómo usarlo

1. Listá lo que pensás agregar: los documentos/links, más o menos qué cubre cada uno, y qué querés sacar realmente del notebook (un recurso de capacitación, una guía de onboarding, una síntesis de investigación).
2. Pedí el plan: *"Ayudame a armar un notebook de NotebookLM para [objetivo] con estas fuentes: [lista]."*
3. Recibí la lista de fuentes ordenada y con nombres, los prompts de Studio, y las preguntas guía.
4. Cargá las fuentes en NotebookLM en el orden sugerido, y después pegá los prompts y preguntas preparados.
5. Si una respuesta dentro de NotebookLM sale pobre, es señal de que falta una fuente o está mal nombrada — agregala y volvé a preguntar, en vez de asumir que el modelo inventó un hueco.

## Ideal para

Dueños de negocio y equipos chicos que convierten documentos dispersos (políticas, material de capacitación, grabaciones de reuniones, investigación) en un notebook de NotebookLM usable, sin un armado desordenado a prueba y error. Funciona sin ningún conector ni acceso a cuenta — es preparación pura — así que sirve incluso antes de haber decidido si vas a usar NotebookLM.
