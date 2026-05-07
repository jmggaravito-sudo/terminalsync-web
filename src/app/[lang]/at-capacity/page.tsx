import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { isLocale, type Locale } from "@/content";

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = COPY[lang];
  return { title: t.title, description: t.subtitle, robots: { index: false, follow: false } };
}

/**
 * Soft-error page shown when NEW_SIGNUPS_DISABLED is on. The middleware
 * routes first-time visitors here instead of /login. Existing users keep
 * working — their auth cookie bypasses the redirect.
 *
 * The intent is graceful degradation during a viral spike or infra incident:
 * the brand stays live, the early-access form keeps capturing emails, and
 * existing customers are unaffected. We never want to show a generic "503"
 * during the moment a video drops.
 */
export default async function AtCapacity({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = COPY[lang as Locale];
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <section className="mx-auto max-w-2xl px-5 md:px-6 pt-20 md:pt-28 pb-20 text-center">
        <p className="text-[12px] font-mono uppercase tracking-[0.18em] text-[var(--color-accent)]">
          {t.eyebrow}
        </p>
        <h1
          className="mt-4 font-semibold tracking-tight leading-[1.1] text-[var(--color-fg-strong)]"
          style={{ fontSize: "clamp(1.875rem, 4.4vw, 2.5rem)" }}
        >
          {t.title}
        </h1>
        <p className="mt-5 text-[15px] text-[var(--color-fg-muted)] leading-relaxed">
          {t.subtitle}
        </p>

        <form
          className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          action="/api/early-access"
          method="POST"
        >
          <input type="hidden" name="feature" value="at-capacity-waitlist" />
          <input
            type="email"
            name="email"
            required
            placeholder={t.emailPlaceholder}
            className="flex-1 rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-5 py-3 text-[14px] text-[var(--color-fg)] placeholder-[var(--color-fg-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40"
          />
          <button
            type="submit"
            data-cta="at-capacity-submit"
            className="rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white text-[14px] font-semibold px-6 py-3 transition-all"
          >
            {t.cta}
          </button>
        </form>

        <p className="mt-8 text-[13px] text-[var(--color-fg-muted)]">
          {t.existing}{" "}
          <Link href={`/${lang}/login`} className="text-[var(--color-accent)] hover:underline">
            {t.signInLink}
          </Link>
        </p>
      </section>
    </main>
  );
}

const COPY = {
  es: {
    eyebrow: "Estamos al límite",
    title: "Tomando aire por unos minutos.",
    subtitle:
      "Más signups de los que esperábamos. Pausamos nuevos registros para mantener la app rápida para los usuarios actuales. Dejá tu email y te avisamos cuando reabran las cuentas (suele ser en menos de 1 hora).",
    emailPlaceholder: "tu@email.com",
    cta: "Avisarme",
    existing: "¿Ya sos usuario?",
    signInLink: "iniciar sesión",
  },
  en: {
    eyebrow: "At capacity",
    title: "Catching our breath for a few minutes.",
    subtitle:
      "More signups than we expected. We've paused new registrations to keep things fast for current users. Drop your email and we'll ping you the moment we reopen (usually under an hour).",
    emailPlaceholder: "you@example.com",
    cta: "Notify me",
    existing: "Already a user?",
    signInLink: "sign in",
  },
} as const;
