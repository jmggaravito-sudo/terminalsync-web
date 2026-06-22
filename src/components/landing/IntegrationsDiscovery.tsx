import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/content";

const COPY: Record<
  Locale,
  { eyebrow: string; title: string; body: string; cta: string }
> = {
  es: {
    eyebrow: "Integraciones",
    title: "Tus IAs ya tienen tus herramientas.",
    body: "Arrastra Gmail, Drive, Notion, Slack o lo que uses al día. Sin claves, sin configurar. Listas para trabajar.",
    cta: "Ver todas las integraciones",
  },
  en: {
    eyebrow: "Integrations",
    title: "Your AIs already have your tools.",
    body: "Drag in Gmail, Drive, Notion, Slack or whatever you use every day. No keys, no setup. Ready to work.",
    cta: "See all integrations",
  },
};

export function IntegrationsDiscovery({ lang }: { lang: Locale }) {
  const t = COPY[lang];
  return (
    <section className="mx-auto max-w-6xl px-5 md:px-6 py-20 md:py-24">
      <div className="grid gap-10 md:grid-cols-2 md:gap-12 items-center">
        <div className="text-center md:text-left">
          <span className="text-[12.5px] font-mono uppercase tracking-[0.12em] text-[var(--color-accent)]">
            {t.eyebrow}
          </span>
          <h2
            className="font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.05] mt-3"
            style={{ fontSize: "clamp(28px, 4.4vw, 48px)" }}
          >
            {t.title}
          </h2>
          <p className="mt-4 text-[15.5px] md:text-[16px] text-[var(--color-fg-muted)] leading-relaxed max-w-xl mx-auto md:mx-0">
            {t.body}
          </p>
          <div className="mt-7 flex justify-center md:justify-start">
            <Link
              href={`/${lang}/stacks`}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] text-white px-5 py-3 text-[14.5px] font-semibold hover:opacity-90 transition-opacity"
              style={{
                boxShadow:
                  "0 10px 30px -10px color-mix(in oklch, var(--color-accent) 60%, transparent)",
              }}
            >
              {t.cta}
              <ArrowRight size={16} strokeWidth={2.4} />
            </Link>
          </div>
        </div>

        <div
          className="rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-panel-2)]"
          style={{
            boxShadow:
              "0 20px 50px -20px color-mix(in oklch, var(--color-accent) 25%, transparent)",
          }}
        >
          <iframe
            src={`/demos/demo-conectores.html?lang=${lang}&embed=1`}
            title={t.title}
            className="w-full h-[320px] md:h-[380px] border-0 block"
          />
        </div>
      </div>
    </section>
  );
}
