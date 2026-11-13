"use client";

import { useEffect, useState } from "react";
import { authedFetch, getAccessToken } from "@/lib/supabase/browser";
import { VsLoginButtons } from "./VsLoginButtons";
import type { CartVideo } from "./cartPricing";

type Agreement = { url: string; version: string; accepted: boolean };

export function QuoteIntake({ videos, total }: { videos: CartVideo[]; total: number }) {
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [login, setLogin] = useState(false);
  const [terms, setTerms] = useState(false);
  const [rights, setRights] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const complete = videos.length > 0 && videos.every((video) => video.service);
  const items = videos.map(({ id, service, shorts }) => ({ id, service, shorts }));
  const cartKey = JSON.stringify({ items, total });

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      if (!await getAccessToken()) { if (!controller.signal.aborted) setLogin(true); return; }
      try {
        const res = await authedFetch("/api/voice-studio/quote-requests", { signal: controller.signal, cache: "no-store" });
        if (controller.signal.aborted) return;
        if (res.status === 401) setLogin(true);
        else if (res.ok) setAgreement(await res.json());
        else setMessage("The service agreement is temporarily unavailable.");
      } catch { if (!controller.signal.aborted) setMessage("The service agreement is temporarily unavailable."); }
    })();
    return () => controller.abort();
  }, []);

  async function submit() {
    if (!complete || !agreement || !rights || (!agreement.accepted && !terms) || busy) return;
    setBusy(true);
    setMessage("");
    try {
      const storageKey = "voice-studio-quote-request";
      let previous: { cartKey?: string; id?: string } | null = null;
      try { previous = JSON.parse(sessionStorage.getItem(storageKey) ?? "null"); } catch {}
      const requestId = previous?.cartKey === cartKey && typeof previous.id === "string" ? previous.id : crypto.randomUUID();
      sessionStorage.setItem(storageKey, JSON.stringify({ cartKey, id: requestId }));
      const response = await authedFetch("/api/voice-studio/quote-requests", {
        method: "POST",
        body: JSON.stringify({ items, expectedTotal: total, requestId, rightsConfirmed: rights,
          acceptedVersion: terms ? agreement.version : null }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) setLogin(true);
        setMessage(data.error ?? "The request could not be sent.");
        return;
      }
      setSubmitted(data.id);
    } catch {
      setMessage("The request could not be sent. Please try again.");
    } finally { setBusy(false); }
  }

  if (submitted) return <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900" role="status">
    <strong>Request received.</strong> Reference: {submitted}. We’ll review the footage and reply by email. You haven’t been charged.
  </div>;
  if (!complete) return <p className="mt-4 text-sm text-zinc-600">Choose DUB or LIP for each video to continue.</p>;
  return <div className="mt-4 space-y-3 border-t border-zinc-200 pt-4 text-sm">
    <p>No payment now. We review your footage and confirm the price before payment.</p>
    {login ? <VsLoginButtons destination="/voice-studio/cart-preview" /> : agreement && <>
      {!agreement.accepted && <label className="flex items-start gap-2">
        <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
        <span>I accept the <a href={agreement.url} className="underline" target="_blank" rel="noopener noreferrer">Voice Studio Service Agreement</a> ({agreement.version}).</span>
      </label>}
      <label className="flex items-start gap-2">
        <input type="checkbox" checked={rights} onChange={(e) => setRights(e.target.checked)} />
        <span>I have permission to submit and request processing of every video in this cart.</span>
      </label>
      <button type="button" disabled={busy || !rights || (!agreement.accepted && !terms)} onClick={submit}
        className="w-full rounded-lg bg-amber-400 px-3 py-2 font-semibold text-zinc-950 disabled:opacity-50">
        {busy ? "Sending…" : "Request production review"}
      </button>
    </>}
    {message && <p role="alert" className="text-red-700">{message}</p>}
  </div>;
}
