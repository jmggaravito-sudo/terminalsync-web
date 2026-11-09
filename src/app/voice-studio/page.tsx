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
import { CheckoutButton } from "@/components/voice-studio/CheckoutButton";
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
              VOICE STUDIO · DONE-FOR-YOU YOUTUBE DUBBING
            </p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Your channel. In Spanish.{" "}
              <span className="text-amber-400">Still your voice.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-zinc-300">
              We turn the videos you&apos;ve already made into a
              Spanish-language channel — dubbed with a clone of your own
              voice, subtitled, and published to a channel you own. A whole
              new audience, zero extra filming.
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
              Every voice clone requires your written permission. No
              exceptions.
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
                body: "Sign up (2 minutes) and we email you a one-page voice license to sign digitally. Once it's back, we dub 60 seconds of your best video with your own voice — free. Five sample slots open each week.",
              },
              {
                icon: ShieldCheck,
                title: "$300 voice setup",
                body: "We certify your voice clone and you approve a test clip before any production. We also set up your Spanish channel and map the search opportunities in your niche. If the test clip doesn't sound like you, the setup is refunded.",
              },
              {
                icon: Youtube,
                title: "Pick your pace",
                body: "Your first full video is $99. After that, pay per video ($129) or save with monthly packs — 4 videos for $399 or 8 for $699. Every video is subtitled, translated and published to your channel with AI disclosure.",
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
                [Video, "Full dubbing in your cloned voice (videos up to 20 min)"],
                [Languages, "Human-reviewed translation in neutral Latin American Spanish"],
                [FileText, "Subtitles (.srt) plus translated title, description and tags"],
                [Music, "Your original music and sound effects preserved in the mix"],
                [Youtube, "Published or scheduled to your own Spanish channel"],
                [BarChart3, "Monthly growth report on the Spanish audience"],
                [Video, "Founding-client bonus: 1 vertical Short in Spanish cut from every video"],
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

      {/* ---------- Pricing ---------- */}
      <section className="bg-zinc-50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Pricing
          </h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-zinc-600">
            Start free. Pay for production only when you&apos;ve heard your own
            voice in Spanish and liked it.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-600/40 bg-white p-8">
              <p className="font-mono text-xs tracking-wide text-emerald-600">
                STEP 1 · FREE
              </p>
              <p className="mt-3 text-4xl font-semibold">
                $0
                <span className="text-base font-normal text-zinc-400">
                  {" "}
                  60-second sample
                </span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-zinc-700">
                {[
                  "60 seconds of your best video, dubbed in your own voice",
                  "One-page voice license signed digitally first",
                  "5 sample slots open every week",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-zinc-950 bg-white p-8">
              <p className="font-mono text-xs tracking-wide text-zinc-400">
                STEP 2 · ONE-TIME SETUP
              </p>
              <p className="mt-3 text-4xl font-semibold">
                $300
                <span className="text-base font-normal text-zinc-400">
                  {" "}
                  voice setup
                </span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-zinc-700">
                {[
                  "Voice clone certification — you approve a test clip first",
                  "Spanish channel setup and SEO opportunity map",
                  "If the test clip doesn't sound like you, full refund",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    {t}
                  </li>
                ))}
              </ul>
              <CheckoutButton
                sku="setup"
                label="Get the voice setup — $300"
                primary
              />
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-8">
            <p className="font-mono text-xs tracking-wide text-zinc-400">
              STEP 3 · PRODUCTION — PAY PER VIDEO, OR SAVE WITH PACKS
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-4">
              {[
                ["First video", "$99", "your trial — one full video", "trial"],
                ["Single video", "$129", "no commitment", "single"],
                ["4-video pack", "$399", "$100 per video + 4 Spanish Shorts, monthly", "pack4"],
                ["8-video pack", "$699", "$87 per video + 8 Spanish Shorts, monthly", "pack8"],
              ].map(([name, price, note, sku]) => (
                <div key={name}>
                  <p className="text-sm font-semibold text-zinc-500">{name}</p>
                  <p className="mt-1 text-2xl font-semibold">{price}</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                    {note}
                  </p>
                  <CheckoutButton
                    sku={sku}
                    label={`Get ${name.toLowerCase()}`}
                  />
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm leading-relaxed text-zinc-500">
              Every video includes dubbing in your cloned voice, human-reviewed
              translation, subtitles, translated metadata and publication to
              your channel. Videos up to 20 minutes = 1 video from your pack.
              Longer content counts as multiple: 20–45 min = 2, 45+ min = 3 —
              no surprises. For comparison: dubbing agencies charge $70–150
              per finished minute — a single 15-minute video would run
              $1,050–2,250. All purchases are fully refundable until your
              first video enters production.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- Voice rights ---------- */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Your voice, your rules
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {[
              [
                "Written consent first",
                "We clone your voice only after you sign a one-page license. You can revoke it at any time.",
              ],
              [
                "Used only for your channels",
                "Your voice clone never appears anywhere except the Spanish channel you own.",
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
                "YouTube's auto-dubbing exists, but it gives you no control: a generic voice approximation instead of your actual voice, no human quality review, and no search strategy for the new audience. We clone your real voice, review every video by hand, and build the Spanish channel's titles, description and tags around what people actually search for.",
              ],
              [
                "Will it really sound like me?",
                "We clone from a clean sample of your voice, and you approve a test clip before any production starts. If it doesn't pass your ear, we don't publish — and the $300 setup is refunded.",
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
                "Can I pause or cancel?",
                "Packs are month-to-month — pause or cancel before the next cycle. There's no minimum term, and every video delivered so far stays on your channel, yours forever.",
              ],
              [
                "What about long videos or podcasts?",
                "Pack videos cover content up to 20 minutes. Longer videos count as multiple videos from your pack: 20–45 minutes = 2, 45–90 minutes = 3. Running a 2-hour podcast? We quote seasons separately — reply with your episode length and cadence and we'll build a flat monthly rate.",
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
            Hear your own voice in Spanish.
          </h2>
          <p className="mt-4 leading-relaxed text-zinc-300">
            Send us your channel. We&apos;ll pick your best-performing video
            and send back a 60-second dubbed sample — free, after you sign a
            one-page voice license. Five sample slots open each week.
          </p>
          <div className="mt-8">
            <LeadForm />
          </div>
          <p className="mt-6 text-sm text-zinc-400">
            We reply within 2 business days. Your sample arrives about 5 days
            after signing.
          </p>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="bg-zinc-950 text-zinc-500">
        <div className="mx-auto max-w-6xl px-6 pb-10 text-xs leading-relaxed">
          © 2026 Voice Studio. Voice cloning only with written consent. Dubbed
          content is disclosed as AI-generated per platform policy.
        </div>
      </footer>
    </main>
  );
}
