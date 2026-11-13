import {
  Mic,
  LogIn,
  Languages,
  Youtube,
  ShieldCheck,
  FileText,
  Music,
  BarChart3,
  Check,
  ArrowRight,
  Video,
} from "lucide-react";
import { LeadForm } from "@/components/voice-studio/LeadForm";
import { DubbingComparison } from "@/components/voice-studio/DubbingComparison";
import { HeroToggleVideo } from "@/components/voice-studio/HeroToggleVideo";

function QuoteVideoLink({ compact = false }: { compact?: boolean }) {
  return (
    <a
      href="/voice-studio/cart-preview"
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 font-semibold text-zinc-950 transition-colors hover:bg-amber-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-500 ${compact ? "px-3 py-2 text-sm sm:px-4" : "px-6 py-3"}`}
    >
      Quote a video link
      <ArrowRight className={compact ? "hidden h-4 w-4 sm:block" : "h-4 w-4"} aria-hidden="true" />
    </a>
  );
}

// Standalone sales page for the dubbing service. No links to the TerminalSync
// app anywhere on purpose — this is a separate business until it isn't.
export default function VoiceStudioPage() {
  return (
    <main>
      <header className="border-b border-zinc-800 bg-zinc-950 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <a href="/voice-studio" className="font-semibold tracking-tight">Voice Studio</a>
          <nav aria-label="Voice Studio actions" className="flex flex-wrap items-center gap-2 sm:gap-3">
            <QuoteVideoLink compact />
            <a
              href="/voice-studio/login"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:border-amber-400 hover:text-amber-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400 sm:px-4"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Login
            </a>
          </nav>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="bg-zinc-950 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pt-14 pb-24 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-4 py-1.5 font-mono text-xs tracking-wide text-zinc-300">
              <Mic className="h-3.5 w-3.5 text-amber-400" />
              VOICE STUDIO · DONE-FOR-YOU SOCIAL MEDIA DUBBING
            </p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Your channel. In Spanish.{" "}
              <span className="text-amber-400">No extra filming.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-zinc-300">
              Reach Spanish-speaking viewers with the videos you already made.
              DUB adds a Spanish voice track and keeps your footage unchanged.
              LIP is the premium option for projects that need the mouth movements to match.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <QuoteVideoLink />
              <a
                href="#sample"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-6 py-3 font-semibold text-zinc-200 transition-colors hover:border-zinc-500"
              >
                Get a free 60-second sample
              </a>
            </div>
            <p className="mt-3 text-xs text-zinc-400">
              Link quote preview. No payment is taken.
            </p>
            <p className="mt-6 flex items-center gap-2 text-sm text-zinc-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              DUB uses a Spanish catalog voice. No voice cloning required.
            </p>
          </div>
          <figure>
            <HeroToggleVideo
              videoEn="/videos/voice-studio/hero-en.mp4"
              videoEs="/videos/voice-studio/hero-es.mp4"
            />
            <figcaption className="mt-2 text-center text-xs text-zinc-400">Illustrative presentation demo</figcaption>
          </figure>
        </div>
      </section>

      {/* ---------- Shorts & Reels ---------- */}
      <section
        id="shorts"
        aria-labelledby="shorts-heading"
        className="border-b border-zinc-800 bg-zinc-900 text-white"
      >
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div>
            <p className="mb-4 font-mono text-xs tracking-wide text-amber-400">
              SHORTS · SPANISH SHORTS &amp; REELS
            </p>
            <h2 id="shorts-heading" className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Turn your Spanish videos into Shorts &amp; Reels.
            </h2>
            <p className="mt-5 max-w-lg leading-relaxed text-zinc-300">
              We turn highlights from your Spanish video into vertical clips
              with on-screen captions, ready for Shorts and Reels.
            </p>
            <p className="mt-5 text-xl font-semibold text-white">From $15 USD per clip</p>
            <p className="mt-2 text-sm text-zinc-300">
              $20 per finished minute, with a $15 minimum per clip. Sold separately from dubbing.
            </p>
          </div>
          <div className="mt-8 grid w-full gap-6 sm:grid-cols-3">
            {[
              { file: "presenter-en", title: "Original · English", note: "Original English take." },
              { file: "presenter-dub", title: "DUB Sample", note: "Same English footage with a Spanish catalog voice from Voice Studio." },
              { file: "presenter-lip-claw", title: "Illustrative Spanish Short", note: "Separate Spanish take generated in Claw, not a lip-sync of the original. See the LIP sample below for a comparison on the same footage." },
            ].map(({ file, title, note }) => (
              <figure key={file} className="mx-auto w-full max-w-72">
                <figcaption className="mb-2 text-sm font-semibold text-white">{title}</figcaption>
                <video
                  src={`/videos/voice-studio/${file}.mp4`}
                  poster={`/images/voice-studio/${file}.jpg`}
                  aria-label={title}
                  controls
                  playsInline
                  preload="none"
                  width={1080}
                  height={1920}
                  className="aspect-[9/16] w-full rounded-2xl border border-zinc-700 bg-zinc-950 object-contain"
                />
                <p className="mt-2 text-xs leading-relaxed text-zinc-300">{note}</p>
              </figure>
            ))}
          </div>
          <div className="mt-8 text-center">
            <QuoteVideoLink />
          </div>
        </div>
      </section>

      <DubbingComparison />

      {/* ---------- Market stats ---------- */}
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-14 sm:grid-cols-3">
          {[
            ["~500M", "native Spanish speakers worldwide"],
            ["#2", "most-spoken language on Earth, by native speakers"],
            ["Top 3", "most-used languages on the internet"],
          ].map(([n, label]) => (
            <div key={label}>
              <p className="text-4xl font-semibold tracking-tight text-zinc-900">
                {n}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                {label}
              </p>
            </div>
          ))}
        </div>
        <div className="mx-auto max-w-6xl px-6 pb-14">
          <p className="max-w-3xl text-lg leading-relaxed text-zinc-600">
            Business, finance and fitness content in English is saturated.
            The same content in Spanish is not — Spanish-speaking audiences are
            searching for it every day and finding almost nothing. Your back
            catalog is the supply that market is missing.
          </p>
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section id="how" className="bg-zinc-50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Mic,
                title: "Free 60-second sample",
                body: "Request a free 60-second sample to hear how your video sounds with a Spanish catalog voice.",
              },
              {
                icon: ShieldCheck,
                title: "Choose DUB or LIP",
                body: "DUB keeps the original footage. LIP adds a separate lip-sync pass and is quoted subject to footage review.",
              },
              {
                icon: Youtube,
                title: "Estimate by video length",
                body: "Use the calculator to compare DUB and LIP. It is an estimate only and does not place an order.",
              },
            ].map((s, i) => (
              <div
                key={s.title}
                className="rounded-2xl border border-zinc-200 bg-white p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950">
                  <s.icon className="h-5 w-5 text-amber-400" />
                </div>
                <p className="mt-4 font-mono text-xs text-zinc-400">
                  STEP {i + 1}
                </p>
                <h3 className="mt-1 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- What's included ---------- */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            What you get with every video
          </h2>
          <div className="mt-10 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {(
              [
                [Video, "Full-video dubbing into Spanish"],
                [Languages, "Human-reviewed translation in neutral Latin American Spanish"],
                [FileText, "Subtitles (.srt) plus translated title, description and tags"],
                [Music, "Your original music and sound effects preserved in the mix"],
                [Youtube, "Published or scheduled to your own Spanish channel"],
                [BarChart3, "Monthly growth report on the Spanish audience"],
              ] as [typeof Video, string][]
            ).map(([Icon, text]) => (
              <div key={text} className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <p className="leading-relaxed text-zinc-700">{text}</p>
                <Icon className="ml-auto h-4 w-4 shrink-0 text-zinc-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Voice rights ---------- */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Your content stays yours
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {[
              [
                "A Spanish catalog voice",
                "We use a Spanish catalog voice for DUB. We do not promise to reproduce your original voice.",
              ],
              [
                "Use footage you have permission to share",
                "Send videos you own or have permission to dub.",
              ],
              [
                "Disclosed, not disguised",
                "Every video is tagged as AI-generated voice per YouTube's synthetic media policy.",
              ],
              [
                "Your revenue stays yours",
                "We never touch AdSense, sponsorships or memberships. We deliver videos; you keep the business.",
              ],
            ].map(([title, body]) => (
              <div key={title} className="flex items-start gap-4">
                <ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-emerald-600" />
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section id="faq" aria-labelledby="faq-heading" className="border-y border-zinc-200 bg-zinc-50">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <h2 id="faq-heading" className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Frequently asked
          </h2>
          <div className="mt-8 divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white">
            {[
              [
                "What’s the difference between DUB and LIP?",
                "DUB replaces the audio with a Spanish voice and keeps the original picture. LIP is the premium option that also adjusts mouth movements; availability depends on the footage.",
              ],
              [
                "Will the Spanish voice sound like me?",
                "We use a Spanish catalog voice. The initial offer does not include voice cloning.",
              ],
              [
                "Which Spanish do you use?",
                "We use Latin American Spanish.",
              ],
              [
                "How is the price estimated?",
                "DUB and LIP are estimated from the length of your video, not from a fixed pack. The calculator is separate from ordering and does not take payment.",
              ],
              [
                "How do I start an order?",
                "Use Quote a video link at the top of the page. It opens the cart preview, where you start by pasting your link. The calculator does not send anything to the cart, and the preview does not take payment. Existing clients can sign in through Login.",
              ],
              [
                "Are Shorts and Reels included?",
                "No. Shorts and Reels are optional, captioned vertical clips priced separately by finished length. A 30-second clip is $15, 60 seconds is $20, and 90 seconds is $30.",
              ],
              [
                "Do you need my Google password?",
                "No. Never send us your password. Start with a link to a video you own or have permission to dub.",
              ],
              [
                "Can I try DUB before ordering?",
                "Yes. Use the form below to request a free 60-second sample with a Spanish catalog voice.",
              ],
            ].map(([q, a]) => (
              <details key={q} className="group px-6 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                  {q}
                  <span
                    aria-hidden
                    className="text-zinc-400 transition-transform group-open:rotate-180"
                  >
                    ▾
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                  {a}
                </p>
              </details>
            ))}
          </div>
          <div className="mt-8 text-center">
            <QuoteVideoLink />
          </div>
        </div>
      </section>

      {/* ---------- Final CTA + form ---------- */}
      <section id="sample" className="bg-zinc-950 text-white">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Hear your video in Spanish.
          </h2>
          <p className="mt-4 leading-relaxed text-zinc-300">
            Send us your channel to request a free 60-second sample dubbed
            with a Spanish catalog voice.
          </p>
          <div className="mt-8">
            <LeadForm />
          </div>
          <p className="mt-6 text-sm text-zinc-400">
            We&apos;ll email you to confirm the next steps.
          </p>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="bg-zinc-950 text-zinc-500">
        <div className="mx-auto max-w-6xl px-6 pb-10 text-xs leading-relaxed">
          © 2026 Voice Studio. Dubbed content is disclosed as AI-generated
          where required by the platform.
        </div>
      </footer>
    </main>
  );
}
