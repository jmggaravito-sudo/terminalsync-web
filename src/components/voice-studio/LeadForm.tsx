"use client";

import { useState } from "react";

// Lead capture for the free 60-second dubbed sample. The basic questions
// (subscribers, niche, brand names) replace the old onboarding call —
// tone/sponsor details get refined per production, not upfront. Posts to
// /api/voice-studio/lead, which emails the team via Resend. Kept separate
// from the TerminalSync early-access flow so the two funnels stay unlinkable.
export function LeadForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [channel, setChannel] = useState("");
  const [subscribers, setSubscribers] = useState("");
  const [niche, setNiche] = useState("");
  const [names, setNames] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/voice-studio/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          channel,
          subscribers,
          niche,
          names,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? "Something went wrong. Try again.");
      }
      setStatus("ok");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "ok") {
    return (
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6">
        <p className="font-semibold text-emerald-300">
          Request received — check your inbox.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-300">
          We&apos;ll email you the one-page voice license to sign digitally.
          As soon as it&apos;s back, your 60-second sample goes into
          production. No call, no commitment — and no cost until you decide
          to produce full videos.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 outline-none transition-colors focus:border-amber-400";
  const selectClass =
    inputClass + " appearance-none " + (subscribers || niche ? "" : "text-zinc-500");

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          type="text"
          required
          maxLength={120}
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
        <input
          type="email"
          required
          maxLength={200}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>
      <input
        type="text"
        required
        maxLength={200}
        placeholder="YouTube channel URL (e.g. youtube.com/@yourchannel)"
        value={channel}
        onChange={(e) => setChannel(e.target.value)}
        className={inputClass}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <select
          required
          value={subscribers}
          onChange={(e) => setSubscribers(e.target.value)}
          className={selectClass}
        >
          <option value="" disabled>
            Subscribers
          </option>
          <option value="under-10k">Under 10,000</option>
          <option value="10k-50k">10,000 – 50,000</option>
          <option value="50k-100k">50,000 – 100,000</option>
          <option value="100k-250k">100,000 – 250,000</option>
          <option value="250k-plus">250,000+</option>
        </select>
        <select
          required
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          className={selectClass}
        >
          <option value="" disabled>
            Your niche
          </option>
          <option value="business">Business</option>
          <option value="finance">Finance</option>
          <option value="fitness">Fitness</option>
          <option value="other">Other</option>
        </select>
      </div>
      <input
        type="text"
        maxLength={300}
        placeholder="Any names we should pronounce carefully? (brand, your name — optional)"
        value={names}
        onChange={(e) => setNames(e.target.value)}
        className={inputClass}
      />
      {status === "error" && (
        <p className="text-sm text-red-400">{errorMsg}</p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-full bg-amber-400 px-6 py-3 font-semibold text-zinc-950 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {status === "sending" ? "Sending…" : "Request my free sample"}
      </button>
    </form>
  );
}
