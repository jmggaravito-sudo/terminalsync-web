import type { Locale } from "@/content";

/**
 * §02 "Lo que acabas de ver" — puente del film a la afirmación literal que
 * el film deja sin decir. Respiro (sin CTA). Aquí —y recién aquí— se permite
 * la palabra "software". Bilingüe (ES neutro / EN).
 */
const T = {
  es: {
    title: "Lo que acabas de ver no es un chatbot.",
    pre: "No fue una IA respondiendo preguntas. Fue ",
    strong: "software real, funcionando",
    post: " — construido describiendo un problema con tus propias palabras.",
  },
  en: {
    title: "What you just saw isn't a chatbot.",
    pre: "It wasn't an AI answering questions. It was ",
    strong: "real, working software",
    post: " — built by describing a problem in your own words.",
  },
} as const;

export function WhatYouJustWatched({ lang }: { lang: Locale }) {
  const t = T[lang];
  return (
    <section id="what-you-just-watched" className="mx-auto max-w-2xl px-5 md:px-6 py-16 md:py-20 text-center">
      <h2
        className="font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.1]"
        style={{ fontSize: "clamp(1.625rem, 4.2vw, 2.5rem)" }}
      >
        {t.title}
      </h2>
      <p className="mt-5 text-[17px] text-[var(--color-fg-muted)] leading-relaxed">
        {t.pre}
        <span className="text-[var(--color-fg-strong)] font-medium">{t.strong}</span>
        {t.post}
      </p>
    </section>
  );
}
