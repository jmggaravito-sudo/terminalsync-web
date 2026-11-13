"use client";

import { useCallback, useEffect, useState } from "react";
import { authedFetch } from "@/lib/supabase/browser";
import { VsLoginButtons } from "./VsLoginButtons";
import { formatDuration, USD, type CartVideo } from "./cartPricing";

type Quote = { id: string; email: string; items: CartVideo[]; estimated_cents: number; agreement_version: string };
const statuses = ["submitted", "reviewed", "declined"] as const;

export function QuoteOps() {
  const [rows, setRows] = useState<Quote[]>([]);
  const [error, setError] = useState("");
  const [login, setLogin] = useState(false);
  const [status, setStatus] = useState<(typeof statuses)[number]>("submitted");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [working, setWorking] = useState(false);
  const load = useCallback(async (signal?: AbortSignal) => {
    setError(""); setRows([]); setWorking(true); setHasMore(false);
    try {
      const response = await authedFetch(`/api/voice-studio/quote-ops?status=${status}&page=${page}`, { signal, cache: "no-store" });
      if (signal?.aborted) return;
      if (response.status === 401) { setLogin(true); return; }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setRows(data.requests); setHasMore(data.hasMore);
    } catch (e) { if (!signal?.aborted) setError(e instanceof Error ? e.message : "Unable to load quotes."); }
    finally { if (!signal?.aborted) setWorking(false); }
  }, [status, page]);
  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);
  async function review(id: string, target: "reviewed" | "declined") {
    setWorking(true); setError("");
    try {
      const res = await authedFetch("/api/voice-studio/quote-ops", { method: "PATCH", body: JSON.stringify({ id, status: target }) });
      if (!res.ok) throw new Error((await res.json()).error);
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to save review."); setWorking(false); }
  }
  return <main className="mx-auto max-w-4xl px-6 py-12">
    <a href="/admin/voice-studio/production" className="text-sm underline">← Production queue</a>
    <h1 className="mt-3 text-3xl font-bold">Voice Studio quote requests</h1>
    <p className="my-3 text-sm">These are unpaid requests. Review the footage and follow up directly with the customer.</p>
    {login ? <VsLoginButtons destination="/admin/voice-studio/quotes" /> : <>
      <div className="flex gap-4">
        {statuses.map((item) => <button key={item} aria-pressed={status === item} disabled={working}
          className="capitalize underline" onClick={() => { setStatus(item); setPage(0); }}>{item}</button>)}
        <button className="underline" disabled={working} onClick={() => void load()}>Refresh</button>
      </div>
      {error && <p role="alert" className="mt-3 text-red-700">{error}</p>}
      {working && <p role="status" className="mt-3">Loading…</p>}
      {!working && !error && rows.length === 0 && <p className="mt-3">No requests in this view.</p>}
      {rows.map((row) => <article key={row.id} className="my-4 rounded-xl border p-4">
        <h2 className="font-semibold">{row.email} · {USD.format(row.estimated_cents / 100)}</h2>
        <p className="text-sm">Ref. {row.id} · Agreement {row.agreement_version}</p>
        <ul className="my-2 space-y-1 text-sm">
          {row.items.map((item) => <li key={item.id}>
            <a className="underline" href={`https://www.youtube.com/watch?v=${item.id.slice(8)}`} target="_blank" rel="noopener noreferrer">{item.title}</a>
            {" · "}{item.service} · {formatDuration(item.seconds)}{item.shorts.length > 0 && ` · Shorts: ${item.shorts.join(", ")}s`}
          </li>)}
        </ul>
        {status === "submitted" && <div className="flex gap-4 text-sm">
          <button className="underline" disabled={working} onClick={() => void review(row.id, "reviewed")}>Mark reviewed</button>
          <button className="underline" disabled={working} onClick={() => void review(row.id, "declined")}>Decline</button>
        </div>}
      </article>)}
      <div className="flex gap-4 text-sm">
        <button className="underline disabled:opacity-50" disabled={working || page === 0} onClick={() => setPage(page - 1)}>Previous</button>
        <button className="underline disabled:opacity-50" disabled={working || !hasMore} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </>}
  </main>;
}
