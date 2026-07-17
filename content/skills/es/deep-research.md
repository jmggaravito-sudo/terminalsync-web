---
name: Deep Research
logo: /skills/deep-research.svg
category: research
vendors: ["claude", "codex"]
author: "TerminalSync"
status: soon
hidden: true
tagline: "Investigación con fuentes si hay herramientas"
description: "Planifica y sintetiza investigación multi-fuente, declarando dependencias de search/fetch y límites de citación antes de afirmar hallazgos con fuentes."
license: "proprietary"
marketplaceSource: "terminalsync"
compatibleWith: ["claude", "codex"]
---
## Cuándo usarlo

- Necesitás un brief de investigación estructurado con múltiples fuentes, no una opinión rápida.
- Tenés una pregunta que se beneficia de descomposición, búsqueda de fuentes, comparación, síntesis y notas de incertidumbre.
- Podés aportar un backend de search/fetch, acceso browser, documentos, URLs, PDFs o material fuente pegado.
- Necesitás output consciente de fuentes, con claims atados a evidencia cuando hay tooling disponible.

No lo uses para fingir que el asistente buscó si no tiene herramienta de search/fetch ni material fuente. Si falta el backend, debe decirlo y pedir fuentes o producir un plan de investigación sin fuentes, no hallazgos citados.

## Qué hace

Ejecuta un proceso de research:

- **Encuadre de pregunta**: aclara scope, timeframe, geografía, audiencia y decisión que debe soportar.
- **Plan de búsqueda**: descompone el tema en subpreguntas e identifica tipos de fuentes necesarias.
- **Manejo de fuentes**: usa herramientas disponibles de search/fetch/browser/documentos o fuentes provistas por el usuario; deduplica y compara evidencia.
- **Síntesis**: produce hallazgos clave, desacuerdos entre fuentes, confianza, gaps y próximos pasos recomendados.
- **Disciplina de citas**: cita sólo fuentes realmente inspeccionadas y separa hallazgos con fuente de análisis o supuestos.
- **Límites**: marca fuentes desactualizadas, inaccesibles, de baja calidad, paywalled o faltantes.

Debe evitar citas falsas, URLs inventadas y claims demasiado seguros. Para datos actuales, precios, leyes, medicina, finanzas o temas legales, debe exigir fuentes actualizadas y caveats más fuertes.

## Cómo usarlo

1. Planteá la pregunta de investigación, contexto de decisión, rango de fechas, geografía y formato de salida.
2. Aportá o habilitá fuentes: conector de búsqueda, browser, documentos, URLs, PDFs, datasets o extractos pegados.
3. Pedí plan de investigación antes del brief final cuando el tema sea amplio.
4. Exigí tabla de fuentes y citas por claim sólo para fuentes realmente inspeccionadas.
5. Si no hay backend de search/fetch, pedí plan, keywords y checklist de fuentes en vez de una respuesta citada.

## Ideal para

Founders, analistas, marketers, equipos de producto, operators e investigadores que necesitan un brief cuidadoso desde múltiples fuentes. Es más fuerte con acceso a browsing/search/documentos; es débil o limitado cuando el asistente sólo tiene conocimiento previo y no hay material fuente.
