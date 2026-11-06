"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Submit production orders (YouTube links) for a tokenized client. Posts
// to /api/voice-studio/orders and refreshes the server-rendered dashboard.
export function OrdersForm({ token }: { token: string }) {
  const router = useRouter();
  const [links, setLinks] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/voice-studio/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, links, notes }),
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
        created?: number;
      } | null;
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error ?? "Something went wrong. Try again.");
      }
      setStatus("ok");
      setLinks("");
      setNotes("");
      router.refresh();
      setTimeout(() => setStatus("idle"), 4000);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const inputClass =
    "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-amber-400";

  return (
    <form onSubmit={submit} className="space-y-4">
      <textarea
        required
        rows={5}
        maxLength={2000}
        placeholder={"Paste your YouTube video links — one per line\nhttps://youtube.com/watch?v=...\nhttps://youtu.be/..."}
        value={links}
        onChange={(e) => setLinks(e.target.value)}
        className={inputClass + " font-mono text-sm"}
      />
      <textarea
        rows={3}
        maxLength={2000}
        placeholder="Notes for the team (optional): how to pronounce your name/brand, sponsors to mention, tone preferences…"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className={inputClass + " text-sm"}
      />
      {status === "error" && <p className="text-sm text-red-500">{errorMsg}</p>}
      {status === "ok" && (
        <p className="text-sm font-medium text-emerald-700">
          Received ✓ — added to your queue below.
        </p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-full bg-zinc-950 px-6 py-3 font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {status === "sending" ? "Sending…" : "Submit videos for dubbing"}
      </button>
    </form>
  );
}
