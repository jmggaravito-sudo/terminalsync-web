import {
  Mic,
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

// Standalone sales page for the dubbing service. No links to the TerminalSync
// app anywhere on purpose — this is a separate business until it isn't.
export default function VoiceStudioPage() {
  return (
    <main>
      {/* ---------- Hero ---------- */}
      <section className="bg-zinc-950 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pt-20 pb-24 lg:grid-cols-[1.05fr_1fr]">
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
              <a
                href="#sample"
                className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 font-semibold text-zinc-950 transition-colors hover:bg-amber-300"
              >
                Get a free 60-second sample
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#how"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-6 py-3 font-semibold text-zinc-200 transition-colors hover:border-zinc-500"
              >
                See how it works
              </a>
            </div>
            <p className="mt-6 flex items-center gap-2 text-sm text-zinc-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              DUB uses a Spanish catalog voice. No voice cloning required.
            </p>
            <p className="mt-3 text-sm text-zinc-500">
              Already a client?{" "}
              <a
                href="/voice-studio/login"
                className="text-zinc-300 underline hover:text-white"
              >
                Sign in to your dashboard
              </a>
            </p>
          </div>
          <HeroToggleVideo
            videoEn="/videos/voice-studio/hero-en.mp4"
            videoEs="/videos/voice-studio/hero-es.mp4"
          />
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
              { file: "presenter-dub", title: "DUB · Voice Studio", note: "Same English footage with a Spanish catalog voice." },
              { file: "presenter-lip-claw", title: "LIP · Claw", note: "Separate Spanish take generated in Claw, with captions. Not a re-sync of the original." },
            ].map(({ file, title, note }) => (
              <figure key={file} className="mx-auto w-full max-w-72">
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
                <figcaption className="mt-3 text-sm text-zinc-300">
                  <span className="block font-semibold text-white">{title}</span>
                  <span className="mt-1 block text-xs leading-relaxed">{note}</span>
                </figcaption>
              </figure>
            ))}
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
      <section className="border-y border-zinc-200 bg-zinc-50">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Frequently asked
          </h2>
          <div className="mt-8 divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white">
            {[
              [
                "Doesn't YouTube already dub videos for free?",
                "Voice Studio delivers a separate Spanish version you can review and use beyond YouTube. DUB keeps your footage, while LIP adds a lip-sync pass.",
              ],
              [
                "Will the Spanish voice sound like me?",
                "We use a catalog voice in Spanish. The initial offer does not include voice cloning.",
              ],
              [
                "Which Spanish do you use?",
                "Neutral Latin American Spanish, understood from Mexico to Argentina. Castilian (Spain) Spanish is available on request.",
              ],
              [
                "Do you need access to my Google account?",
                "No. You invite us as Manager or Editor to the new Spanish channel only. We never need your password, and we never touch your main channel.",
              ],
              [
                "Who owns the videos and the revenue?",
                "You do. Everything publishes to channels you own. We never touch AdSense, sponsorships or memberships.",
              ],
              [
                "What about sponsors and calls-to-action?",
                "They're adapted, not just translated — prices, links and offers get localized in the script. Send us the details and we'll handle them.",
              ],
              [
                "Does the calculator place an order?",
                "No. It only shows an estimate. Existing clients can sign in to manage their orders.",
              ],
              [
                "What about long videos or podcasts?",
                "Use the full duration of the video when estimating. Shorts are priced separately by finished clip length.",
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
