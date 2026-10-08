"use client";

import { useEffect, useState } from "react";

export type Currency = "USD" | "COP";

/**
 * Interruptor de Mercado Pago en la página de precios.
 *
 * **Apagado desde el 2026-10-01 por decisión de JM:** el lanzamiento sale
 * solo con Stripe en USD para todos los países; Mercado Pago (precio en COP
 * para Colombia) se vuelve a prender después del launch. La app de
 * escritorio recibe el mismo interruptor (`VITE_TS_MERCADOPAGO`).
 *
 * Es un interruptor, no un borrado — mismo criterio que `launchFlags.ts`:
 * el hook, la geo-detección, `priceCop` en el copy y la nota "También en
 * Stripe" siguen enteros. Con el interruptor apagado el hook devuelve
 * siempre "USD" y ni siquiera llama a `/api/geo`.
 *
 * Cómo se prende: setear `NEXT_PUBLIC_MERCADOPAGO_ENABLED=1` (valor exacto
 * "1", cualquier otra cosa es apagado) en las env vars del proyecto en
 * Vercel y **redeployar** — las `NEXT_PUBLIC_*` se inyectan en el build, no
 * en runtime, así que cambiar la variable sin redeploy no hace nada. El
 * nombre es el que ya documentaban `src/lib/mercadopago.ts` y el admin de
 * Mercado Pago; este archivo es el único que lo lee.
 */
export const mercadoPagoEnabled =
  process.env.NEXT_PUBLIC_MERCADOPAGO_ENABLED === "1";

/**
 * Resuelve la moneda del visitante. Es la mitad sin React del hook, separada
 * para poder probarla en Node (el repo corre los tests sin navegador):
 *
 * - Interruptor apagado → "USD" sin tocar la red.
 * - Prendido → lee `/api/geo` y devuelve "COP" solo si el país es "CO".
 * - Cualquier error o respuesta rara → "USD", la rama segura.
 */
export async function loadGeoCurrency(
  fetchImpl: (input: string) => Promise<Response> = (input) => fetch(input),
): Promise<Currency> {
  if (!mercadoPagoEnabled) return "USD";
  try {
    const res = await fetchImpl("/api/geo");
    if (!res.ok) return "USD";
    const data = (await res.json()) as { country?: string | null } | null;
    return data?.country === "CO" ? "COP" : "USD";
  } catch {
    // Network hiccup or off-Vercel dev — stay on the USD default.
    return "USD";
  }
}

/**
 * Picks which currency the pricing cards should show, based on the
 * visitor's geolocated country: Colombia sees COP (Mercado Pago), everyone
 * else sees USD (Stripe) — matching the payment rails actually offered
 * (JM: Mercado Pago/COP for Colombia, Stripe/international card for the
 * rest of the world). Gated by `mercadoPagoEnabled` above: while the switch
 * is off, every visitor sees USD and no geo request is made.
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
export function useGeoCurrency(): Currency {
  const [currency, setCurrency] = useState<Currency>("USD");

  useEffect(() => {
    // Interruptor apagado: ni efecto ni llamada a /api/geo — queda en USD.
    if (!mercadoPagoEnabled) return;
    let cancelled = false;
    loadGeoCurrency().then((resolved) => {
      if (!cancelled) setCurrency(resolved);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return currency;
}
