import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { isLocale, type Locale } from "@/content";
import { GraciasClient } from "./GraciasClient";

interface Props {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ from?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const copy = lang === "es"
    ? { title: "Gracias por descargar TerminalSync", description: "Tu descarga arrancó. Acá tenés los próximos pasos." }
    : { title: "Thanks for downloading TerminalSync", description: "Your download started. Here's what to do next." };
  return { title: copy.title, description: copy.description, robots: { index: false, follow: false } };
}

export default async function Gracias({ params, searchParams }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { from } = await searchParams;
  const variant = from === "dev" ? "dev" : "consumer";

  return <Page lang={lang} variant={variant} />;
}

function Page({ lang, variant }: { lang: Locale; variant: "dev" | "consumer" }) {
  const t = COPY[lang][variant];
  const tCommon = COPY[lang].common;

  // Discord/Slack invite is optional — set NEXT_PUBLIC_COMMUNITY_INVITE_URL
  // when it exists. Until then we hide the community CTA rather than ship a
  // broken link.
  const community = process.env.NEXT_PUBLIC_COMMUNITY_INVITE_URL || "";

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <section className="mx-auto max-w-3xl px-5 md:px-6 pt-16 md:pt-24 pb-20 text-center">
        <p className="text-[12px] font-mono uppercase tracking-[0.18em] text-[var(--color-accent)]">
          {t.eyebrow}
        </p>
        <h1
          className="mt-4 font-semibold tracking-tight leading-[1.08] text-[var(--color-fg-strong)]"
          style={{ fontSize: "clamp(1.875rem, 4.4vw, 2.75rem)" }}
        >
          {t.title}
        </h1>
        <p className="mt-5 text-[15px] md:text-[16px] text-[var(--color-fg-muted)] max-w-xl mx-auto leading-relaxed">
          {t.subtitle}
        </p>

        {/* Auto-trigger the download from the client. The user lands here
            after clicking a CTA that already points to /gracias — the page
            itself fires the DMG redirect so the user sees the post-download
            content without an extra click. */}
        <GraciasClient lang={lang} variant={variant} />

        {/* Video placeholder — JM grabs a 60s "next steps" Loom and we drop
            the URL into NEXT_PUBLIC_NEXT_STEPS_VIDEO_URL. Until then we
            show a styled placeholder so the layout doesn't shift later. */}
        <div className="mt-10">
          {process.env.NEXT_PUBLIC_NEXT_STEPS_VIDEO_URL ? (
            <div className="aspect-video w-full overflow-hidden rounded-2xl border border-[var(--color-border)] bg-black">
              <iframe
                src={process.env.NEXT_PUBLIC_NEXT_STEPS_VIDEO_URL}
                title={t.videoTitle}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          ) : (
            <div className="aspect-video w-full rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-panel)]/40 flex items-center justify-center">
              <span className="text-[13px] text-[var(--color-fg-muted)]">
                {t.videoPlaceholder}
              </span>
            </div>
          )}
        </div>

        {/* Next-step bullets — variant-specific. Devs see Claude Code first;
            consumer sees the general flow. */}
        <div className="mt-10 grid gap-4 text-left">
          {t.steps.map((step, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)]/60 p-5"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/15 text-[12px] font-semibold text-[var(--color-accent)]">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-[15px] font-semibold text-[var(--color-fg-strong)]">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-[13.5px] text-[var(--color-fg-muted)] leading-relaxed">
                    {step.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action row: community + support + secondary CTA back into the
            funnel (marketplace for devs, pricing for consumer). */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {community ? (
            <a
              href={community}
              target="_blank"
              rel="noopener noreferrer"
              data-cta="gracias-community"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white text-[13.5px] font-semibold px-5 py-2.5 transition-all"
            >
              {tCommon.community}
            </a>
          ) : null}
          <a
            href="mailto:hola@terminalsync.ai"
            data-cta="gracias-support"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-fg)] text-[13.5px] font-semibold px-5 py-2.5 lift"
          >
            {tCommon.support}
          </a>
          <Link
            href={`/${lang}/${variant === "dev" ? "marketplace" : "pricing"}`}
            data-cta="gracias-secondary"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-fg)] text-[13.5px] font-semibold px-5 py-2.5 lift"
          >
            {variant === "dev" ? tCommon.exploreMarketplace : tCommon.viewPricing}
          </Link>
        </div>

        <p className="mt-10 text-[12px] text-[var(--color-fg-muted)]">
          {t.footer}{" "}
          <a className="text-[var(--color-accent)] hover:underline" href="/api/download?direct=1">
            {tCommon.retryDownload}
          </a>
        </p>
      </section>
    </main>
  );
}

const COPY = {
  es: {
    common: {
      community: "Unirme a la comunidad",
      support: "Hablar con soporte",
      viewPricing: "Ver planes",
      exploreMarketplace: "Explorar el marketplace",
      retryDownload: "reintentar descarga",
    },
    consumer: {
      eyebrow: "Descarga iniciada",
      title: "Tu Mac está descargando TerminalSync.",
      subtitle:
        "En unos segundos vas a ver el .dmg en Finder. Mientras tanto, mirá el video y los próximos pasos.",
      videoTitle: "Próximos pasos en TerminalSync",
      videoPlaceholder: "Video de 60s — próximos pasos",
      steps: [
        {
          title: "Abrí el .dmg y arrastrá Terminal Sync a Aplicaciones",
          body: "macOS Sonoma o más nuevo. La primera vez te pide permiso para abrir una app de internet — es normal.",
        },
        {
          title: "Conectá Google Drive o iCloud",
          body: "Tu memoria cifrada vive en tu propia nube — nosotros no la vemos. La llave AES-256 vive en tu Keychain.",
        },
        {
          title: "Lanzá tu primera terminal sincronizada",
          body: "Click en + Nueva terminal, elegí una carpeta de proyecto, y listo. Tu IA y tus archivos viajan con vos.",
        },
      ],
      footer: "¿La descarga no arrancó?",
    },
    dev: {
      eyebrow: "Descarga iniciada · for devs",
      title: "Memoria compartida entre tus 3 agentes — descargando.",
      subtitle:
        "El .dmg está bajando. Mientras se instala, dejá lista tu primera sesión Claude Code / Codex / Gemini.",
      videoTitle: "TerminalSync para devs — quickstart",
      videoPlaceholder: "Quickstart 60s — Claude Code + Codex + Gemini",
      steps: [
        {
          title: "Instalá Terminal Sync (drag & drop al folder de Aplicaciones)",
          body: "Apple Silicon. La primera vez Gatekeeper pide aprobar — Settings → Privacy → Open Anyway.",
        },
        {
          title: "Auth con Google Drive (zero-knowledge)",
          body: "Tu sesión Claude/Codex/Gemini se cifra AES-256 antes de salir de tu Mac. La llave queda en tu Keychain del SO. Cancelás OAuth y cae todo.",
        },
        {
          title: "Drop-in en tu terminal favorita",
          body: "Wrap tu CLI actual con tsync run -- claude o tsync run -- codex. Tus snapshots se commitean al lado del repo (Git-aware). Cambias de branch, tu IA te sigue.",
        },
      ],
      footer: "¿La descarga no arrancó?",
    },
  },
  en: {
    common: {
      community: "Join the community",
      support: "Talk to support",
      viewPricing: "See pricing",
      exploreMarketplace: "Explore marketplace",
      retryDownload: "retry download",
    },
    consumer: {
      eyebrow: "Download started",
      title: "Your Mac is grabbing TerminalSync.",
      subtitle:
        "The .dmg should land in your Downloads folder in a few seconds. Meanwhile, here's what comes next.",
      videoTitle: "TerminalSync — next steps",
      videoPlaceholder: "60-sec next steps video",
      steps: [
        {
          title: "Open the .dmg and drag Terminal Sync to Applications",
          body: "macOS Sonoma or newer. First launch asks permission for an internet-downloaded app — that's expected.",
        },
        {
          title: "Connect Google Drive or iCloud",
          body: "Your encrypted memory lives in your own cloud — we never see it. AES-256 key stays in your Keychain.",
        },
        {
          title: "Spin up your first synced terminal",
          body: "Click + New terminal, pick a project folder, done. Your AI + files travel with you.",
        },
      ],
      footer: "Download didn't start?",
    },
    dev: {
      eyebrow: "Download started · for devs",
      title: "Shared memory across all 3 agents — downloading.",
      subtitle:
        "The .dmg is on its way. While it installs, get your first Claude Code / Codex / Gemini session ready to wire up.",
      videoTitle: "TerminalSync for devs — quickstart",
      videoPlaceholder: "60-sec quickstart — Claude Code + Codex + Gemini",
      steps: [
        {
          title: "Install Terminal Sync (drag & drop to Applications)",
          body: "Apple Silicon. Gatekeeper will ask once — Settings → Privacy → Open Anyway.",
        },
        {
          title: "Auth with Google Drive (zero-knowledge)",
          body: "Your Claude/Codex/Gemini sessions are AES-256 encrypted before they leave your Mac. Key stays in your OS Keychain. Revoke OAuth and the whole sync stops.",
        },
        {
          title: "Drop-in to your terminal of choice",
          body: "Wrap your current CLI with tsync run -- claude or tsync run -- codex. Snapshots commit alongside your repo (Git-aware). Switch branches, your AI follows.",
        },
      ],
      footer: "Download didn't start?",
    },
  },
} as const;
