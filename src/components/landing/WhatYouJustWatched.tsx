/**
 * §02 "Lo que acabas de ver" — el puente del film a la afirmación literal
 * que el film deja a propósito sin decir. Es un respiro (sin CTA). Aquí —y
 * recién aquí— se permite usar la palabra "software".
 *
 * Copy ES neutro inline (pre-i18n).
 */
export function WhatYouJustWatched() {
  return (
    <section id="what-you-just-watched" className="mx-auto max-w-2xl px-5 md:px-6 py-16 md:py-20 text-center">
      <h2
        className="font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.1]"
        style={{ fontSize: "clamp(1.625rem, 4.2vw, 2.5rem)" }}
      >
        Lo que acabas de ver no es un chatbot.
      </h2>
      <p className="mt-5 text-[17px] text-[var(--color-fg-muted)] leading-relaxed">
        No fue una IA respondiendo preguntas. Fue <span className="text-[var(--color-fg-strong)] font-medium">software real, funcionando</span> —
        construido describiendo un problema con tus propias palabras.
      </p>
    </section>
  );
}
