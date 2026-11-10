"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

const MAX_ROWS = 8;
const SHORT_TIMESTAMP = /^(?:\d{1,2}:[0-5]\d:[0-5]\d|[0-5]?\d:[0-5]\d)$/;

type Draft = {
  key: number;
  sourceUrl: string;
  notes: string;
  shortMode: "best_moment" | "timestamp";
  timestamp: string;
};

function newDraft(key: number): Draft {
  return { key, sourceUrl: "", notes: "", shortMode: "best_moment", timestamp: "" };
}

export interface OrderPlanOption {
  id: string;
  label: string;
  includesShort: boolean;
  availableVideos: number;
  availableShorts: number;
}

const inputClass =
  "mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-zinc-900 outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:bg-zinc-100";

export function OrdersForm({
  token,
  plans,
  onSubmitted,
}: {
  token?: string;
  plans: OrderPlanOption[];
  onSubmitted: () => void;
}) {
  const formId = useId();
  const [selected, setSelected] = useState("");
  const [drafts, setDrafts] = useState<Draft[]>(() => [newDraft(1)]);
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");
  const nextKey = useRef(2);
  const inFlight = useRef(false);
  const retry = useRef<{ fingerprint: string; requestId: string } | null>(null);

  const plan = plans.find((option) => option.id === selected) ?? plans[0];
  const limit = plan
    ? Math.min(MAX_ROWS, plan.availableVideos, plan.includesShort ? plan.availableShorts : MAX_ROWS)
    : 0;

  function edit(key: number, patch: Partial<Omit<Draft, "key">>) {
    setDrafts((current) => current.map((row) => row.key === key ? { ...row, ...patch } : row));
    if (status !== "idle") setStatus("idle");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    if (!plan || drafts.length > limit) {
      setStatus("error");
      setMessage("This plan does not have enough available credits for these videos.");
      return;
    }
    const orders = drafts.map((row) => ({
      source_url: row.sourceUrl.trim(),
      notes: row.notes.trim(),
      short_mode: plan.includesShort ? row.shortMode : "none",
      short_timestamp:
        plan.includesShort && row.shortMode === "timestamp" ? row.timestamp.trim() : null,
    }));
    if (orders.some((order) => !order.source_url ||
        (order.short_mode === "timestamp" && !SHORT_TIMESTAMP.test(order.short_timestamp ?? "")))) {
      setStatus("error");
      setMessage("Enter a video link on each row and use MM:SS or H:MM:SS for any short timestamp.");
      return;
    }

    inFlight.current = true;
    setStatus("sending");
    setMessage("");
    try {
      const fingerprint = JSON.stringify({ entitlementId: plan.id, orders });
      if (retry.current?.fingerprint !== fingerprint) {
        retry.current = { fingerprint, requestId: crypto.randomUUID() };
      }
      const requestId = retry.current.requestId;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (!token) {
        const sb = getSupabaseBrowser();
        const { data } = (await sb?.auth.getSession()) ?? {};
        const jwt = data?.session?.access_token;
        if (!jwt) throw new Error("Your session expired — sign in again.");
        headers.Authorization = `Bearer ${jwt}`;
      }
      const response = await fetch("/api/voice-studio/orders", {
        method: "POST",
        headers,
        body: JSON.stringify({
          token,
          entitlementId: plan.id,
          requestId,
          orders,
        }),
      });
      const body = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;
      if (!response.ok || !body?.ok) {
        throw new Error(body?.error ?? "Could not confirm the request. Try again without changing your entries.");
      }

      setDrafts([newDraft(nextKey.current++)]);
      retry.current = null;
      setStatus("ok");
      setMessage(orders.length === 1 ? "Video added to your queue." : `${orders.length} videos added to your queue.`);
      onSubmitted();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      inFlight.current = false;
    }
  }

  if (!plan && status !== "ok") {
    return (
      <p className="mt-4 rounded-lg bg-zinc-100 px-4 py-3 text-sm text-zinc-600">
        You don&apos;t have a plan with available production credits. If you recently paid,
        check back shortly or reply to your Voice Studio email for help.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-4">
      {plan && (
        <fieldset disabled={status === "sending"} className="min-w-0 space-y-4">
          {plans.length > 1 && (
            <label className="block text-sm font-medium text-zinc-800">
              Use credits from
              <select
                className={inputClass}
                value={plan.id}
                onChange={(event) => { setSelected(event.target.value); setStatus("idle"); }}
              >
                {plans.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label} · {option.availableVideos} video credits left
                  </option>
                ))}
              </select>
            </label>
          )}

          {drafts.map((row, index) => {
            const id = `${formId}-video-${row.key}`;
            return (
              <fieldset key={row.key} className="min-w-0 space-y-3 rounded-xl border border-zinc-200 p-4">
                <legend className="px-1 text-sm font-semibold text-zinc-800">Video {index + 1}</legend>
                <div>
                  <label htmlFor={`${id}-url`} className="block text-sm font-medium text-zinc-800">YouTube link</label>
                  <input
                    id={`${id}-url`}
                    required
                    inputMode="url"
                    maxLength={2000}
                    className={inputClass}
                    value={row.sourceUrl}
                    onChange={(event) => edit(row.key, { sourceUrl: event.target.value })}
                    placeholder="https://www.youtube.com/watch?v=…"
                  />
                </div>
                <div>
                  <label htmlFor={`${id}-notes`} className="block text-sm font-medium text-zinc-800">Production notes (optional)</label>
                  <textarea
                    id={`${id}-notes`}
                    rows={2}
                    maxLength={2000}
                    className={inputClass}
                    value={row.notes}
                    onChange={(event) => edit(row.key, { notes: event.target.value })}
                    placeholder="Pronunciation, tone, or anything to keep in the edit"
                  />
                </div>
                {plan.includesShort && (
                  <div className="rounded-lg bg-amber-50 p-3">
                    <label htmlFor={`${id}-short`} className="block text-sm font-medium text-zinc-800">Spanish Short/Reel included</label>
                    <select
                      id={`${id}-short`}
                      className={inputClass}
                      value={row.shortMode}
                      onChange={(event) => edit(row.key, {
                        shortMode: event.target.value === "timestamp" ? "timestamp" : "best_moment",
                      })}
                    >
                      <option value="best_moment">Choose the best moment for me</option>
                      <option value="timestamp">Use my starting timestamp</option>
                    </select>
                    {row.shortMode === "timestamp" && (
                      <div className="mt-3">
                        <label htmlFor={`${id}-timestamp`} className="block text-sm font-medium text-zinc-800">
                          Starting timestamp (MM:SS or H:MM:SS)
                        </label>
                        <input
                          id={`${id}-timestamp`}
                          required
                          maxLength={8}
                          placeholder="03:45"
                          className={inputClass}
                          value={row.timestamp}
                          onChange={(event) => edit(row.key, { timestamp: event.target.value })}
                        />
                      </div>
                    )}
                  </div>
                )}
                {drafts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => { setDrafts((current) => current.filter((other) => other.key !== row.key)); setStatus("idle"); }}
                    className="text-sm font-medium text-zinc-600 underline underline-offset-4 hover:text-zinc-950"
                    aria-label={`Remove video ${index + 1}`}
                  >
                    Remove video
                  </button>
                )}
              </fieldset>
            );
          })}

          <p className="text-xs leading-relaxed text-zinc-600">
            We reserve one video credit per submission. For videos over 20 minutes, the team
            checks whether additional video credits are needed before production.
          </p>
          {drafts.length > limit && (
            <p role="alert" className="text-sm text-red-700">
              Remove videos or select another plan. You have room for {limit} with this plan.
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={drafts.length >= limit}
              onClick={() => { const row = newDraft(nextKey.current++); setDrafts((current) => [...current, row]); setStatus("idle"); }}
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 disabled:opacity-40"
            >
              + Add another video
            </button>
            <button
              type="submit"
              disabled={drafts.length > limit}
              className="rounded-full bg-zinc-950 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : "Submit videos for dubbing"}
            </button>
          </div>
        </fieldset>
      )}
      {status === "error" && <p role="alert" className="text-sm text-red-700">{message}</p>}
      {status === "ok" && <p role="status" className="text-sm font-medium text-emerald-800">{message}</p>}
    </form>
  );
}
