"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import type { OpsOrder, OrderStatus } from "@/lib/voiceStudioProduction";
import { VsLoginButtons } from "@/components/voice-studio/VsLoginButtons";

const statusLabels: Record<OrderStatus, string> = {
  queued: "Queued", in_progress: "In production", delivered: "Delivered",
};
const planLabels: Record<OpsOrder["sku"], string> = {
  trial: "First video", single: "Single video", pack4: "4 + 4 monthly", pack8: "8 + 8 monthly",
};

export function ProductionQueue() {
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [status, setStatus] = useState<OrderStatus>("queued");
  const [page, setPage] = useState(0);
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OpsOrder[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const sb = getSupabaseBrowser();
    if (!sb) {
      setToken(null);
      return;
    }
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      setToken(session?.access_token ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetch(`/api/voice-studio/ops?status=${status}&page=${page}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store", signal: controller.signal,
    }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load the production queue.");
      if (!controller.signal.aborted) {
        setOrders(data.orders);
        setHasMore(data.hasMore);
      }
    }).catch((err) => {
      if (!controller.signal.aborted) {
        setOrders([]);
        setHasMore(false);
        setError(err instanceof Error ? err.message : "Could not load the production queue.");
      }
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [token, status, page, version]);

  const saved = useCallback(() => setVersion((v) => v + 1), []);
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 text-zinc-950">
      <p className="text-sm font-semibold text-zinc-600">Voice Studio · Team only</p>
      <h1 className="mt-2 text-3xl font-bold">Production queue</h1>
      <p className="mt-2 text-zinc-600">Review incoming orders, confirm video credits and add delivery links.</p>
      {token === undefined ? <p className="mt-6">Checking access…</p> : !token ? (
        <div className="mt-6"><VsLoginButtons destination="/admin/voice-studio/production" /></div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-2" aria-label="Filter by status">
            {Object.entries(statusLabels).map(([key, label]) => (
              <button key={key} type="button" aria-pressed={status === key}
                onClick={() => { setStatus(key as OrderStatus); setPage(0); }}
                className={`rounded-full border px-4 py-2 text-sm ${status === key ? "bg-zinc-950 text-white" : "bg-white text-zinc-900"}`}>
                {label}
              </button>
            ))}
            <button type="button" onClick={saved} className="rounded-full border px-4 py-2 text-sm">Refresh</button>
          </div>
          {loading ? <p className="mt-6" role="status">Loading orders…</p> :
            error ? <p className="mt-6 rounded-xl bg-red-50 p-4 text-red-800" role="alert">{error}</p> :
            orders.length === 0 ? <p className="mt-6 text-zinc-600">No orders in this view.</p> : (
              <ul className="mt-6 space-y-4">
                {orders.map((order) => (
                  <li key={order.id}><OrderCard order={order} token={token} onSaved={saved} /></li>
                ))}
              </ul>
            )}
          {!loading && !error && (page > 0 || hasMore) && (
            <nav className="mt-6 flex items-center gap-4" aria-label="Order pages">
              <button type="button" onClick={() => setPage(page - 1)} disabled={!page}
                className="rounded border px-3 py-1 disabled:opacity-40">Previous</button>
              <span>Page {page + 1}</span>
              <button type="button" onClick={() => setPage(page + 1)} disabled={!hasMore}
                className="rounded border px-3 py-1 disabled:opacity-40">Next</button>
            </nav>
          )}
        </>
      )}
    </main>
  );
}

function OrderCard({ order, token, onSaved }: { order: OpsOrder; token: string; onSaved: () => void }) {
  const [status, setStatus] = useState(order.status);
  const [units, setUnits] = useState(order.video_units);
  const [videoUrl, setVideoUrl] = useState(order.video_url ?? "");
  const [shortUrl, setShortUrl] = useState(order.short_url ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const field = "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm";

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/voice-studio/ops", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          id: order.id, status, video_units: units, video_url: videoUrl || null,
          short_url: order.short_mode === "none" ? null : shortUrl || null,
        }),
      });
      if (!response.ok) throw new Error((await response.json()).error || "Could not update this order.");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update this order.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="break-all font-semibold">{order.email} <span className="text-zinc-600">· {planLabels[order.sku]}</span></h2>
      <p className="mt-1 text-xs text-zinc-500">Submitted {order.created_at.slice(0, 10)} · {order.id}</p>
      <a href={order.source_url} target="_blank" rel="noreferrer" className="mt-2 block break-all text-sm underline">Open source video</a>
      {order.notes && <p className="mt-2 whitespace-pre-wrap break-words text-sm"><strong>Notes:</strong> {order.notes}</p>}
      <p className="mt-2 text-sm"><strong>Short/Reel:</strong>{" "}
        {order.short_mode === "none" ? "Not included" : order.short_mode === "timestamp"
          ? `Start near ${order.short_timestamp}` : "Choose the best moment"}</p>
      <form onSubmit={save} className="mt-4 space-y-3 border-t border-zinc-200 pt-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium">Status
            <select className={field} value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key} disabled={
                  (order.status === "in_progress" && key === "queued") ||
                  (order.status === "delivered" && key !== "delivered")
                }>{label}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">Verified video credits
            <select className={field} value={units} disabled={order.status === "delivered"}
              onChange={(e) => setUnits(Number(e.target.value))}>
              <option value={1}>1 · up to 20 min</option>
              <option value={2}>2 · over 20 up to 45 min</option>
              <option value={3}>3 · over 45 min</option>
            </select>
          </label>
        </div>
        <p className="text-xs text-zinc-600">Check the source duration before starting. Use file links shared privately with this customer.</p>
        <label className="block text-sm font-medium">Dubbed video link
          <input type="url" maxLength={2048} placeholder="https://" className={field} value={videoUrl}
            required={status === "delivered"} onChange={(e) => setVideoUrl(e.target.value)} />
        </label>
        {order.short_mode !== "none" && (
          <label className="block text-sm font-medium">Short/Reel link
            <input type="url" maxLength={2048} placeholder="https://" className={field} value={shortUrl}
              required={status === "delivered"} onChange={(e) => setShortUrl(e.target.value)} />
          </label>
        )}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={busy} className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {busy ? "Saving…" : "Save order"}
        </button>
      </form>
    </article>
  );
}
