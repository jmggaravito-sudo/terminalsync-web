"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authedFetch } from "@/lib/supabase/browser";
import { USD } from "./cartPricing";

export function CartTestResult({ sessionId }: { sessionId: string }) {
  const [message, setMessage] = useState("Verifying the test payment with Stripe…");

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const params = new URLSearchParams({ session_id: sessionId });
        const res = await authedFetch(`/api/voice-studio/cart-checkout?${params}`, { signal: controller.signal });
        const data = await res.json();
        if (controller.signal.aborted) return;
        if (!res.ok) { setMessage(data.error ?? "The test payment could not be verified."); return; }
        setMessage(data.paid ? `Stripe verified a test payment of ${USD.format(data.total / 100)}.` : "Stripe has not confirmed a test payment for this cart.");
      } catch { if (!controller.signal.aborted) setMessage("The test payment could not be verified."); }
    })();
    return () => controller.abort();
  }, [sessionId]);

  return <main className="mx-auto max-w-xl space-y-4 px-6 py-16">
    <h1 className="text-3xl font-semibold">Stripe test checkout</h1>
    <p role="status">{message}</p>
    <p>No money was collected and no production order was placed.</p>
    <Link href="/voice-studio/cart-preview" className="underline">Back to cart</Link>
  </main>;
}
