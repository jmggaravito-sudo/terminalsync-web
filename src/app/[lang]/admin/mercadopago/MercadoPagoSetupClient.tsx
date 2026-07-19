"use client";

import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

interface PlanResult {
  pro: { id: string; amount: number; currency: string };
  max: { id: string; amount: number; currency: string };
  envVars: { MERCADOPAGO_PLAN_PRO: string; MERCADOPAGO_PLAN_MAX: string };
}

interface ExistingPlan {
  id: string;
  reason?: string;
  status?: string;
  amount?: number;
  currency?: string;
}

const DEFAULT_PRO = 79000;
const DEFAULT_MAX = 159000;

export function MercadoPagoSetupClient({ lang }: { lang: string }) {
  const isEs = lang !== "en";
  const [pro, setPro] = useState(DEFAULT_PRO);
  const [max, setMax] = useState(DEFAULT_MAX);
  const [result, setResult] = useState<PlanResult | null>(null);
  const [existing, setExisting] = useState<ExistingPlan[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function authHeader(): Promise<Record<string, string> | null> {
    const sb = getSupabaseBrowser();
    const token = sb ? (await sb.auth.getSession()).data.session?.access_token : null;
    if (!token) {
      setError(isEs ? "No estás logueado como admin." : "Not signed in as admin.");
      return null;
    }
    return { Authorization: `Bearer ${token}` };
  }

  async function loadExisting() {
    setError(null);
    setBusy(true);
    try {
      const headers = await authHeader();
      if (!headers) return;
      const r = await fetch("/api/admin/mercadopago/create-plans", { headers });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error ?? `API ${r.status}`);
        return;
      }
      setExisting(d.plans ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function createPlans() {
    setError(null);
    setResult(null);
    setBusy(true);
    try {
      const headers = await authHeader();
      if (!headers) return;
      const r = await fetch("/api/admin/mercadopago/create-plans", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ proAmount: pro, maxAmount: max, currency: "COP" }),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error ?? `API ${r.status}`);
        return;
      }
      setResult(d as PlanResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <section className="mx-auto max-w-3xl px-5 md:px-6 py-10">
        <h1 className="text-[26px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
          Mercado Pago — {isEs ? "crear planes (COP)" : "create plans (COP)"}
        </h1>
        <p className="text-[13px] text-[var(--color-fg-muted)] mt-1">
          {isEs
            ? "Crea los planes de suscripción Pro y Max en pesos colombianos. Usa el token que está en Vercel — no pasa por acá."
            : "Creates the Pro and Max subscription plans in COP using the token stored on Vercel — it never touches the browser."}
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-[12px] font-mono uppercase tracking-[0.12em] text-[var(--color-fg-muted)]">
              Pro — COP/{isEs ? "mes" : "mo"}
            </span>
            <input
              type="number"
              value={pro}
              onChange={(e) => setPro(Number(e.target.value))}
              className="mt-1.5 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2 text-[15px]"
            />
          </label>
          <label className="block">
            <span className="text-[12px] font-mono uppercase tracking-[0.12em] text-[var(--color-fg-muted)]">
              Max — COP/{isEs ? "mes" : "mo"}
            </span>
            <input
              type="number"
              value={max}
              onChange={(e) => setMax(Number(e.target.value))}
              className="mt-1.5 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2 text-[15px]"
            />
          </label>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={createPlans}
            disabled={busy}
            className="rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-[14px] font-semibold text-white disabled:opacity-50"
          >
            {busy ? (isEs ? "Creando…" : "Creating…") : isEs ? "Crear planes" : "Create plans"}
          </button>
          <button
            onClick={loadExisting}
            disabled={busy}
            className="rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-[13px] disabled:opacity-50"
          >
            {isEs ? "Ver planes existentes" : "List existing plans"}
          </button>
        </div>

        {error ? (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-[13px] text-red-400">
            {error}
          </div>
        ) : null}

        {result ? (
          <div className="mt-6 rounded-2xl border border-[var(--color-ok)]/30 bg-[var(--color-ok)]/5 p-5">
            <p className="text-[13px] font-semibold text-[var(--color-ok)] mb-3">
              ✅ {isEs ? "Planes creados. Pegá estos valores como env vars en Vercel:" : "Plans created. Set these env vars on Vercel:"}
            </p>
            <pre className="overflow-x-auto rounded-lg bg-[var(--color-bg)] p-3 text-[12.5px] font-mono">
{`MERCADOPAGO_PLAN_PRO=${result.envVars.MERCADOPAGO_PLAN_PRO}
MERCADOPAGO_PLAN_MAX=${result.envVars.MERCADOPAGO_PLAN_MAX}
NEXT_PUBLIC_MERCADOPAGO_ENABLED=1`}
            </pre>
          </div>
        ) : null}

        {existing ? (
          <div className="mt-6 rounded-2xl border border-[var(--color-border)] p-5">
            <p className="text-[12px] font-mono uppercase tracking-[0.12em] text-[var(--color-fg-muted)] mb-3">
              {isEs ? "Planes existentes" : "Existing plans"} ({existing.length})
            </p>
            {existing.length === 0 ? (
              <p className="text-[13px] text-[var(--color-fg-muted)]">
                {isEs ? "Ninguno todavía." : "None yet."}
              </p>
            ) : (
              <ul className="space-y-2 text-[12.5px] font-mono">
                {existing.map((p) => (
                  <li key={p.id} className="flex flex-wrap gap-x-3">
                    <span className="text-[var(--color-fg-strong)]">{p.id}</span>
                    <span className="text-[var(--color-fg-muted)]">{p.reason}</span>
                    <span className="text-[var(--color-fg-muted)]">
                      {p.amount} {p.currency} · {p.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </section>
    </main>
  );
}
