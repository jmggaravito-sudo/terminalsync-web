/**
 * §03 "Cómo funciona" — hace que el mecanismo se sienta trivialmente
 * alcanzable. 3 pasos, lenguaje llano, sin jerga. La barrera es una sola
 * frase: lo describes.
 *
 * Copy ES neutro inline (pre-i18n).
 */

const STEPS: { n: string; title: string; body: string }[] = [
  {
    n: "1",
    title: "Descríbelo",
    body: "Dices lo que necesitas, en tus palabras. Sin código, sin configurar nada.",
  },
  {
    n: "2",
    title: "Tu equipo de IAs lo construye",
    body: "Las IAs trabajan en paralelo y lo crean — y te lo muestran hecho.",
  },
  {
    n: "3",
    title: "Sigue funcionando y mejora",
    body: "Queda andando, se mantiene solo y mejora a medida que lo usas.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-5xl px-5 md:px-6 py-20 md:py-24">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">
          Cómo funciona
        </span>
        <h2
          className="mt-3 font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.08]"
          style={{ fontSize: "clamp(1.75rem, 4.5vw, 2.75rem)" }}
        >
          Tres pasos. Sin tecnicismos.
        </h2>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
        {STEPS.map((s) => (
          <div key={s.n} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--color-accent)] text-[15px] font-semibold text-white">
              {s.n}
            </span>
            <h3 className="mt-4 text-[16px] font-semibold text-[var(--color-fg-strong)]">{s.title}</h3>
            <p className="mt-1.5 text-[14px] text-[var(--color-fg-muted)] leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <a
          href="/api/download"
          data-cta="howitworks-primary"
          className="inline-flex items-center justify-center rounded-2xl bg-[var(--color-accent)] px-5 py-3 text-[14px] font-semibold text-white transition-all glow-accent hover:-translate-y-px hover:bg-[var(--color-accent-soft)]"
        >
          Empieza gratis
        </a>
      </div>
    </section>
  );
}
