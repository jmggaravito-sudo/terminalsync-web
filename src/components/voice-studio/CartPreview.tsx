"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CART_LIMIT, DEFAULT_LANGUAGE, LANGUAGES, MAX_SPEAKERS_OPTION, SHORTS, SPEAKER_PACKAGES, USD, estimateCart, formatDuration, isLanguageCode, languageLabel, packageCents, speakerPackage, type CartVideo, type DubbingService, type ShortLength } from "./cartPricing";

import { QuoteIntake } from "./QuoteIntake";

function ShortsUpsell({ sourceSeconds, language, committed, onApply }: {
  sourceSeconds: number;
  language: string;
  committed: ShortLength[];
  onApply: (shorts: ShortLength[]) => void;
}) {
  const [selected, setSelected] = useState<ShortLength[]>(committed);
  const changed = selected.length !== committed.length || selected.some((length) => !committed.includes(length));

  return (
    <fieldset className="mt-5 border-t border-zinc-200 pt-4">
      <legend className="text-sm font-semibold">Add a Short in {languageLabel(language)}</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {SHORTS.map((short) => (
          <label key={short.seconds} className="flex items-start gap-2 rounded-lg border border-zinc-200 p-3 text-sm has-checked:border-amber-500 has-checked:bg-amber-50 has-disabled:text-zinc-500">
            <input type="checkbox" disabled={short.seconds > sourceSeconds} checked={selected.includes(short.seconds)}
              onChange={(event) => {
                const checked = event.target.checked;
                setSelected((previous) => checked
                  ? [...previous, short.seconds]
                  : previous.filter((seconds) => seconds !== short.seconds));
              }} />
            <span>
              <strong className="block">{short.seconds} seconds</strong>
              {USD.format(short.cents / 100)}
              {short.seconds > sourceSeconds && <span className="block text-xs">Longer than source</span>}
            </span>
          </label>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" disabled={!changed} onClick={() => onApply(selected)}
          className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {committed.length ? "Update cart" : "Add to cart"}
        </button>
        <span aria-live="polite" className="text-xs text-zinc-600">
          {committed.length > 0 ? `${committed.length} ${committed.length === 1 ? "short" : "shorts"} in cart` : ""}
        </span>
      </div>
    </fieldset>
  );
}

export function CartPreview({ intakeEnabled = false }: { intakeEnabled?: boolean }) {
  const [videos, setVideos] = useState<CartVideo[]>([]);
  const [link, setLink] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [addingLink, setAddingLink] = useState(false);
  const [restored, setRestored] = useState(false);
  const [channel, setChannel] = useState(false);
  useEffect(() => {
    if (intakeEnabled) {
      try {
        const data: unknown = JSON.parse(sessionStorage.getItem("voice-studio-quote-cart") ?? "null");
        if (Array.isArray(data)) setVideos(data.slice(0, CART_LIMIT).filter((item) =>
          item && typeof item.id === "string" && /^youtube-[A-Za-z0-9_-]{11}$/.test(item.id) &&
          Number.isSafeInteger(item.seconds) && item.seconds > 0 && typeof item.title === "string" &&
          (item.service === null || item.service === "DUB" || item.service === "LIP") &&
          Array.isArray(item.shorts) && item.shorts.every((seconds: unknown) => SHORTS.some((short) => short.seconds === seconds)))
          .map((item) => ({
            ...item,
            language: isLanguageCode(item.language) ? item.language : DEFAULT_LANGUAGE,
            speakers: Number.isInteger(item.speakers) && item.speakers >= 1 && item.speakers <= MAX_SPEAKERS_OPTION ? item.speakers : 1,
          })));
      } catch {}
    }
    setRestored(true);
  }, [intakeEnabled]);
  useEffect(() => {
    if (intakeEnabled && restored) {
      try { sessionStorage.setItem("voice-studio-quote-cart", JSON.stringify(videos)); } catch {}
    }
  }, [intakeEnabled, restored, videos]);
  const showLinkForm = videos.length === 0 || addingLink;
  const summary = estimateCart(videos);

  async function addVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || videos.length >= CART_LIMIT || !link.trim()) return;
    setMessage("");
    setPending(true);
    try {
      const response = await fetch("/voice-studio/cart-preview/resolve", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ link }),
      });
      const data = await response.json();
      if (!response.ok) { setMessage(data.error ?? "We couldn't check this link."); return; }
      if (videos.some((video) => video.id === data.id)) { setMessage("That video is already in your cart."); return; }
      setVideos((previous) => [...previous, { ...data, service: null, shorts: [], language: DEFAULT_LANGUAGE, speakers: 1 }]);
      setLink("");
      setAddingLink(false);
    } catch {
      setMessage("We couldn't check this link. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-5 py-12 text-zinc-950 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <a href="/voice-studio" className="text-sm font-semibold underline">← Voice Studio</a>
        <p className="mt-8 font-mono text-xs font-semibold tracking-wide text-zinc-500">VOICE STUDIO · {intakeEnabled ? "QUOTE" : "PREVIEW"}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">Let’s quote your videos</h1>
        <p className="mt-3 text-zinc-600">Paste a YouTube video link, pick the dubbing language for each video — Spanish is the default — and get your estimate.</p>
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-4">
            {videos.map((video) => (
              <article key={video.id} className="rounded-2xl border border-zinc-200 bg-white p-5">
                <div className="flex justify-between gap-4">
                  <div>
                    <h2 className="break-words font-semibold">{video.title}</h2>
                    <p className="mt-1 text-sm text-zinc-600">{formatDuration(video.seconds)} · Verified duration</p>
                  </div>
                  <button type="button" disabled={pending} aria-label={`Remove ${video.title}`} onClick={() => setVideos((previous) => previous.filter((item) => item.id !== video.id))} className="self-start text-sm underline">Remove</button>
                </div>
                <fieldset className="mt-5">
                  <legend className="text-sm font-semibold">Dubbing language</legend>
                  <p className="mt-1 text-xs text-zinc-600">Spanish is the default. Same pipeline, same review, same pricing in every language.</p>
                  <select
                    value={video.language ?? DEFAULT_LANGUAGE}
                    onChange={(event) => setVideos((previous) => previous.map((item) => item.id === video.id ? { ...item, language: event.target.value as typeof item.language } : item))}
                    className="mt-2 w-full max-w-xs rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                    aria-label={`Dubbing language for ${video.title}`}
                  >
                    {LANGUAGES.map((language) => (
                      <option key={language.code} value={language.code}>{language.label}</option>
                    ))}
                  </select>
                </fieldset>
                <fieldset className="mt-5">
                  <legend className="text-sm font-semibold">How many people speak in this video?</legend>
                  <p className="mt-1 text-xs text-zinc-600">Interview or podcast? Usually 2. Each extra voice is produced separately and changes the price.</p>
                  <select
                    value={video.speakers ?? 1}
                    onChange={(event) => setVideos((previous) => previous.map((item) => item.id === video.id
                      ? { ...item, speakers: Number(event.target.value), service: null, package: undefined }
                      : item))}
                    className="mt-2 w-full max-w-xs rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                    aria-label={`Speaker count for ${video.title}`}
                  >
                    {[1, 2, MAX_SPEAKERS_OPTION].map((count) => (
                      <option key={count} value={count}>{count === MAX_SPEAKERS_OPTION ? `${count}+` : count}</option>
                    ))}
                  </select>
                </fieldset>
                {(video.speakers ?? 1) <= 1 ? (
                  <fieldset className="mt-5">
                    <legend className="text-sm font-semibold">Choose your dubbing option</legend>
                    <p className="mt-1 text-xs text-zinc-600">Choose one. LIP already includes the dubbing in your chosen language.</p>
                    <div className="mt-2 grid gap-3 sm:grid-cols-2">
                      {(["DUB", "LIP"] as const).map((service: DubbingService) => (
                        <label key={service} className="flex items-start gap-2 rounded-lg border border-zinc-200 p-3 text-sm">
                          <input type="radio" name={`service-${video.id}`} value={service} checked={video.service === service}
                            onChange={() => setVideos((previous) => previous.map((item) => item.id === video.id ? { ...item, service, package: undefined } : item))} />
                          <span><strong>{service}</strong> · {service === "DUB" ? `${languageLabel(video.language)} dubbing` : `${languageLabel(video.language)} dubbing with lip-sync`}</span>
                        </label>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-zinc-600">
                      Full-length videos include a separate subtitle file (.srt). Shorts have on-screen captions.
                    </p>
                  </fieldset>
                ) : (
                  <fieldset className="mt-5">
                    <legend className="text-sm font-semibold">Choose your interview package</legend>
                    <p className="mt-1 text-xs text-zinc-600">Per-speaker treatment. Lip-sync is priced per speaker; guests keep original audio where noted.</p>
                    <div className="mt-2 grid gap-2">
                      {SPEAKER_PACKAGES.map((pkg) => {
                        const cents = USD.format(packageCents(pkg.id, video.speakers ?? 1, video.seconds) / 100);
                        return (
                          <label key={pkg.id} className="flex items-start gap-2 rounded-lg border border-zinc-200 p-3 text-sm">
                            <input type="radio" name={`package-${video.id}`} value={pkg.id} checked={video.package === pkg.id}
                              onChange={() => setVideos((previous) => previous.map((item) => item.id === video.id ? { ...item, package: pkg.id, service: null } : item))} />
                            <span>
                              <strong>{pkg.label}</strong> · {cents} for this video
                              <span className="block text-xs text-zinc-600">{pkg.description}</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-xs text-zinc-600">
                      3+ speakers: we quote the exact cast on review. Shorts have on-screen captions.
                    </p>
                  </fieldset>
                )}
                {video.service && (
                  <ShortsUpsell
                    sourceSeconds={video.seconds}
                    language={video.language ?? DEFAULT_LANGUAGE}
                    committed={video.shorts}
                    onApply={(shorts) => setVideos((previous) => previous.map((item) => item.id === video.id ? { ...item, shorts } : item))}
                  />
                )}
              </article>
            ))}
            {showLinkForm && <form onSubmit={addVideo} className="rounded-2xl border border-zinc-200 bg-white p-5">
              <label htmlFor="cart-video-link" className="font-semibold">Paste your video link</label>
              <div className="mt-2 flex flex-wrap gap-2">
                <input id="cart-video-link" type="url" required maxLength={2048} value={link} onChange={(event) => setLink(event.target.value)}
                  placeholder="https://www.youtube.com/watch?v=…" className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
                <button disabled={pending || !link.trim() || videos.length >= CART_LIMIT} className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                  {pending ? "Checking…" : "Check link"}
                </button>
              </div>
              {message && <p role="alert" className="mt-3 text-sm text-red-700">{message}</p>}
              {videos.length > 0 && (
                <button type="button" disabled={pending} onClick={() => { setAddingLink(false); setLink(""); setMessage(""); }}
                  className="mt-3 text-sm underline underline-offset-2">Cancel</button>
              )}
            </form>}
            {videos.length > 0 && !showLinkForm && videos.length < CART_LIMIT && (
              <button type="button" onClick={() => setAddingLink(true)}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-zinc-100">
                + Add another link
              </button>
            )}
            {videos.length >= CART_LIMIT && <p className="text-sm text-zinc-600">Preview limit: {CART_LIMIT} videos.</p>}
          </div>
          <aside aria-label="Cart summary" className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="text-lg font-semibold">Cart summary</h2>
            <div aria-live="polite" className="mt-4">
              {videos.filter((video) => video.service).map((video) => (
                <div key={video.id} className="mb-3 border-b border-zinc-100 pb-3 text-sm">
                  <p className="break-words font-medium">
                    {video.title} · {video.package ? speakerPackage(video.package)?.label : video.service}
                    {(video.speakers ?? 1) > 1 && ` · ${video.speakers} speakers`} · {languageLabel(video.language)}
                  </p>
                  <p className="text-zinc-600">{formatDuration(video.seconds)}</p>
                  {SHORTS.filter((short) => video.shorts.includes(short.seconds)).map((short) => (
                    <p key={short.seconds} className="text-zinc-600">↳ {short.seconds}s Short · {USD.format(short.cents / 100)}</p>
                  ))}
                </div>
              ))}
              <dl className="space-y-2 text-sm">
                {summary.dubSeconds > 0 && (
                  <div className="flex justify-between gap-3">
                    <dt>DUB · {formatDuration(summary.dubSeconds)}</dt>
                    <dd>{USD.format(summary.dubbing / 100)}</dd>
                  </div>
                )}
                {summary.lipSeconds > 0 && (
                  <div className="flex justify-between gap-3">
                    <dt>
                      LIP · {formatDuration(summary.lipSeconds)}
                      <span className="block text-xs text-zinc-600">{languageLabel(videos.find((video) => video.service === "LIP")?.language)} dubbing included</span>
                    </dt>
                    <dd>{USD.format(summary.lip / 100)}</dd>
                  </div>
                )}
                {summary.interviews.map((row, index) => (
                  <div key={index} className="flex justify-between gap-3">
                    <dt>
                      Interview · {row.speakers} speakers · {formatDuration(row.seconds)}
                      <span className="block text-xs text-zinc-600">{row.label}</span>
                    </dt>
                    <dd>{USD.format(row.cents / 100)}</dd>
                  </div>
                ))}
                <div className="flex justify-between"><dt>Shorts / Reels</dt><dd>{USD.format(summary.shorts / 100)}</dd></div>
                <div className="flex justify-between border-t border-zinc-200 pt-3 text-base font-semibold"><dt>Estimated total</dt><dd>{USD.format(summary.total / 100)}</dd></div>
              </dl>
            </div>
            {intakeEnabled
              ? videos.length > 0 && <>
                <label className="mt-4 flex items-start gap-2 border-t border-zinc-200 pt-4 text-sm">
                  <input type="checkbox" checked={channel} onChange={(event) => setChannel(event.target.checked)} />
                  <span>Create my Spanish channel too — we set it up and leave every video ready to publish with one click. Ops adds it to your final quote.</span>
                </label>
                <QuoteIntake key={JSON.stringify(videos.map(({ id, service, package: pkg, shorts }) => [id, service, pkg, shorts]))} videos={videos} total={summary.total} channel={channel} />
              </>
              : <p className="mt-4 text-xs text-zinc-600">Estimate only. Checkout is not enabled.</p>}
          </aside>
        </div>
      </div>
    </main>
  );
}
