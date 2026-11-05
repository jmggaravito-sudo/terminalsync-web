"use client";

import { useState } from "react";

// Buy button for a Voice Studio SKU. POSTs to the checkout route and
// redirects to Stripe's hosted Checkout. On failure shows the error inline.
export function CheckoutButton({
  sku,
  label,
  primary,
}: {
  sku: string;
  label: string;
  primary?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function buy() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/voice-studio/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku }),
      });
      const data = (await res.json().catch(() => null)) as {
        url?: string;
        error?: string;
      } | null;
      if (!res.ok || !data?.url) {
        throw new Error(data?.error ?? "Checkout is unavailable right now.");
      }
      window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  const base =
    "mt-4 w-full rounded-full px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";
  const style = primary
    ? base + " bg-amber-400 text-zinc-950 hover:bg-amber-300"
    : base + " border border-zinc-300 text-zinc-800 hover:border-zinc-500";

  return (
    <div>
      <button type="button" onClick={buy} disabled={busy} className={style}>
        {busy ? "Redirecting…" : label}
      </button>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}
