"use client";

import { useState, type FormEvent } from "react";
import { CART_LIMIT, SHORTS, USD, estimateCart, formatDuration, type CartVideo, type DubbingService } from "./cartPricing";

const examples = [
  { label: "45-second example", link: "https://voice-studio.example/45-seconds" },
  { label: "90-second example", link: "https://voice-studio.example/90-seconds" },
  { label: "24-minute example", link: "https://voice-studio.example/24-minutes" },
];

export function CartPreview() {
  const [videos, setVideos] = useState<CartVideo[]>([]);
  const [link, setLink] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
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
      setVideos((previous) => [...previous, { ...data, service: null, shorts: [] }]);
      setLink("");
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
        <p className="mt-8 font-mono text-xs font-semibold tracking-wide text-zinc-500">VOICE STUDIO · PREVIEW</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">Let’s quote your videos</h1>
        <p className="mt-3 text-zinc-600">Paste a video link to check its length and see your estimated price.</p>
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-4">
            <form onSubmit={addVideo} className="rounded-2xl border border-zinc-200 bg-white p-5">
              <label htmlFor="cart-video-link" className="font-semibold">Paste your video link</label>
              <div className="mt-2 flex flex-wrap gap-2">
                <input id="cart-video-link" type="url" required maxLength={2048} value={link} onChange={(event) => setLink(event.target.value)}
                  placeholder="https://www.youtube.com/watch?v=…" className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
                <button disabled={pending || !link.trim() || videos.length >= CART_LIMIT} className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                  {pending ? "Checking…" : "Check link"}
                </button>
              </div>
              <details className="mt-3 text-xs text-zinc-600">
                <summary className="w-fit cursor-pointer underline underline-offset-2">Try a demo link</summary>
                <p className="mt-2">These sample links are only for testing the preview.</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {examples.map((example) => <button key={example.link} type="button" disabled={pending} onClick={() => { setLink(example.link); setMessage(""); }}
                    className="rounded-full border border-zinc-200 px-3 py-1 hover:bg-zinc-100">{example.label}</button>)}
                </div>
              </details>
              {message && <p role="alert" className="mt-3 text-sm text-red-700">{message}</p>}
              {videos.length >= CART_LIMIT && <p className="mt-2 text-sm text-zinc-600">Preview limit: {CART_LIMIT} videos.</p>}
            </form>
            {videos.map((video) => (
              <article key={video.id} className="rounded-2xl border border-zinc-200 bg-white p-5">
                <div className="flex justify-between gap-4">
                  <div>
                    <h2 className="break-words font-semibold">{video.title}</h2>
                    <p className="mt-1 text-sm text-zinc-600">{formatDuration(video.seconds)} · {video.demo ? "Example duration" : "Verified duration"}</p>
                  </div>
                  <button type="button" disabled={pending} aria-label={`Remove ${video.title}`} onClick={() => setVideos((previous) => previous.filter((item) => item.id !== video.id))} className="self-start text-sm underline">Remove</button>
                </div>
                <fieldset className="mt-5">
                  <legend className="text-sm font-semibold">Choose your dubbing option</legend>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {(["DUB", "LIP"] as const).map((service: DubbingService) => (
                      <label key={service} className="flex items-start gap-2 rounded-lg border border-zinc-200 p-3 text-sm">
                        <input type="radio" name={`service-${video.id}`} value={service} checked={video.service === service}
                          onChange={() => setVideos((previous) => previous.map((item) => item.id === video.id ? { ...item, service } : item))} />
                        <span><strong>{service}</strong> · {service === "DUB" ? "Spanish dubbing" : "Spanish dubbing with lip-sync"}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                {video.service && <fieldset className="mt-5 border-t border-zinc-100 pt-4">
                  <legend className="text-sm font-semibold">Add Shorts / Reels</legend>
                  <p className="mb-2 text-xs text-zinc-600">Optional · each checked box adds one clip from this video.</p>
                  {SHORTS.map((short) => (
                    <label key={short.seconds} className="flex items-center gap-2 py-1.5 text-sm has-disabled:text-zinc-500">
                      <input type="checkbox" disabled={short.seconds > video.seconds} checked={video.shorts.includes(short.seconds)}
                        onChange={(event) => {
                          const checked = event.target.checked;
                          setVideos((previous) => previous.map((item) => item.id === video.id
                            ? { ...item, shorts: checked ? [...item.shorts, short.seconds] : item.shorts.filter((seconds) => seconds !== short.seconds) }
                            : item));
                        }} />
                      <span>{short.seconds}s · {USD.format(short.cents / 100)}{short.seconds > video.seconds ? " · longer than source" : ""}</span>
                    </label>
                  ))}
                </fieldset>}
              </article>
            ))}
          </div>
          <aside aria-label="Cart summary" className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="text-lg font-semibold">Cart summary</h2>
            <div aria-live="polite" className="mt-4">
              {videos.filter((video) => video.service).map((video) => (
                <div key={video.id} className="mb-3 border-b border-zinc-100 pb-3 text-sm">
                  <p className="break-words font-medium">{video.title} · {video.service}</p>
                  <p className="text-zinc-600">{formatDuration(video.seconds)}</p>
                  {SHORTS.filter((short) => video.shorts.includes(short.seconds)).map((short) => (
                    <p key={short.seconds} className="text-zinc-600">↳ {short.seconds}s Short · {USD.format(short.cents / 100)}</p>
                  ))}
                </div>
              ))}
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt>Dubbing · {formatDuration(summary.seconds)}</dt><dd>{USD.format(summary.dubbing / 100)}</dd></div>
                {summary.discount > 0 && <div className="flex justify-between text-emerald-700"><dt>Volume discount included</dt><dd>−{USD.format(summary.discount / 100)}</dd></div>}
                <div className="flex justify-between"><dt>Lip-sync</dt><dd>{USD.format(summary.lip / 100)}</dd></div>
                <div className="flex justify-between"><dt>Shorts / Reels</dt><dd>{USD.format(summary.shorts / 100)}</dd></div>
                <div className="flex justify-between border-t border-zinc-200 pt-3 text-base font-semibold"><dt>Estimated total</dt><dd>{USD.format(summary.total / 100)}</dd></div>
              </dl>
            </div>
            <p className="mt-4 text-xs text-zinc-600">Dubbing rates and discount are examples. Checkout is not enabled.</p>
          </aside>
        </div>
      </div>
    </main>
  );
}
