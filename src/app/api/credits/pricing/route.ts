import { NextResponse } from "next/server";

import {
  copAmountForCreditPackage,
  copRateForCredits,
  creditPackageFor,
} from "@/lib/aiCredits";

/**
 * What a credit package costs in pesos, and at what rate.
 *
 * The desktop app used to multiply by its own copy of 4,100 — the same
 * constant this backend had, kept in step by luck. The day one side was
 * updated and the other was not, the app would show one price and the customer
 * would be charged another. So the price is served from the one place that
 * also charges it.
 *
 * `rate` is included because the app shows the wallet balance in pesos too,
 * and a balance is an arbitrary amount rather than one of the packages.
 *
 * Public on purpose: it is a price list. No identity, no account data.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const { rate, trm, source } = await copRateForCredits();
  const packages: Record<string, number> = {};
  for (const amountCents of [1000, 2000]) {
    const creditPackage = creditPackageFor(amountCents);
    if (creditPackage) {
      packages[String(amountCents)] = copAmountForCreditPackage(creditPackage, rate);
    }
  }

  return NextResponse.json(
    {
      currency: "COP",
      /** COP per USD, already including the margin. For the balance. */
      rate,
      /** The legal rate before the margin — shown for transparency, not billing. */
      trm,
      /** "live" | "cache" | "fallback": which lookup answered. */
      source,
      packages,
    },
    {
      // A price may be a few minutes stale; it must never be recomputed on
      // every keystroke of a form that polls it.
      headers: { "Cache-Control": "public, max-age=300, s-maxage=300" },
    },
  );
}
