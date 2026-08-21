"use client";

import { useEffect, useState } from "react";

/**
 * Picks which currency the pricing cards should show, based on the
 * visitor's geolocated country: Colombia sees COP (Mercado Pago), everyone
 * else sees USD (Stripe) — matching the payment rails actually offered
 * (JM: Mercado Pago/COP for Colombia, Stripe/international card for the
 * rest of the world).
 *
 * Reads `/api/geo`, which on Vercel resolves from the edge-populated
 * `x-vercel-ip-country` header — a visitor behind a Colombia-exit VPN
 * genuinely reads as "CO" here, same as the real thing.
 *
 * Defaults to USD (the safe/global branch) until the geo call resolves or
 * if it fails — this is NOT the old estimated-FX-conversion feature JM
 * killed on 2026-05-29 (that showed a computed "≈ $X COP" next to the USD
 * price and went stale between rate updates). This instead swaps between
 * two real, fixed price lists that are already set in Stripe and Mercado
 * Pago — no exchange-rate math involved.
 */
export type Currency = "USD" | "COP";

export function useGeoCurrency(): Currency {
  const [currency, setCurrency] = useState<Currency>("USD");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/geo")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { country?: string | null } | null) => {
        if (cancelled || !data) return;
        if (data.country === "CO") setCurrency("COP");
      })
      .catch(() => {
        // Network hiccup or off-Vercel dev — stay on the USD default.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return currency;
}
