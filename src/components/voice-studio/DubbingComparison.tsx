"use client";

import { useState } from "react";

import { DUB_CENTS_PER_MINUTE, LIP_CENTS_PER_MINUTE, USD as usd } from "./cartPricing";

const options = [
  {
    name: "DUB",
    title: "Your video dubbed into Spanish.",
    description: "A Spanish voice track on your original footage. No changes to the mouth movements.",
    centsPerMinute: DUB_CENTS_PER_MINUTE,
  },
  {
    name: "LIP",
    title: "Your video dubbed into Spanish with lip-sync.",
    description: "Premium Spanish dubbing with lip-sync processed in Claw. Subject to footage review and availability.",
    centsPerMinute: LIP_CENTS_PER_MINUTE,
  },
] as const;

export function DubbingComparison() {
  const [input, setInput] = useState("10");
  const minutes = Number(input);
  const valid = input.trim() !== "" && Number.isFinite(minutes) && minutes > 0;

  return (
    <section id="dub-and-lip" aria-labelledby="dub-lip-heading" className="bg-zinc-50">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <p className="mb-3 font-mono text-xs tracking-wide text-zinc-500">DUB VS. LIP</p>
        <h2 id="dub-lip-heading" className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Estimate your Spanish dubbing.
        </h2>
        <p className="mt-3 max-w-2xl text-zinc-600">
          Enter your video length to compare DUB and premium LIP. Shorts are priced separately.
        </p>
        <div className="mt-6">
          <label htmlFor="dub-estimate-minutes" className="block text-sm font-semibold text-zinc-800">
            How long is your video?
          </label>
          <div className="mt-2 flex items-center gap-3">
            <input
              id="dub-estimate-minutes"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="any"
              value={input}
              aria-describedby="dub-estimate-note"
              onChange={(event) => setInput(event.target.value)}
              className="w-28 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-950"
            />
            <span className="text-sm text-zinc-600">minutes</span>
          </div>
          <p id="dub-estimate-note" className="mt-2 text-sm text-zinc-600">
            Illustrative rates in USD. This calculator does not start an order.
          </p>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {options.map((option) => (
            <article key={option.name} className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
              <p className="font-mono text-xs font-semibold tracking-wide text-zinc-500">{option.name}{option.name === "LIP" ? " · PREMIUM" : ""}</p>
              <h3 className="mt-2 text-xl font-semibold">{option.title}</h3>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-zinc-600">{option.description}</p>
              <p className="mt-4 border-t border-zinc-200 pt-4 text-sm text-zinc-600">
                {usd.format(option.centsPerMinute / 100)} per minute · estimate only
              </p>
              <p className="mt-1 text-2xl font-semibold text-zinc-950">
                <output htmlFor="dub-estimate-minutes" aria-label={`${option.name} estimated total`}>
                  {valid ? usd.format(Math.round(minutes * option.centsPerMinute) / 100) : "—"}
                </output>
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
