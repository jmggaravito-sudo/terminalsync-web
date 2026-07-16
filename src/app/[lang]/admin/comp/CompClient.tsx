"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

interface Comp {
  email: string;
  plan: string;
  status: string;
  currentPeriodEnd: string | null;
  updatedAt: string | null;
}

async function authedFetch(path: string, init?: RequestInit) {
  const sb = getSupabaseBrowser();
  const token = sb ? (await sb.auth.getSession()).data.session?.access_token : null;
  if (!token) throw new Error("not-signed-in");
  return fetch(path, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

export function CompClient({ lang }: { lang: string }) {
  const isEs = lang === "es";
  const t = (es: string, en: string) => (isEs ? es : en);

  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState<"max" | "pro">("max");
  const [months, setMonths] = useState(12);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [comps, setComps] = useState<Comp[] | null>(null);

  async function loadComps() {
    try {
      const r = await authedFetch("/api/admin/comp");
      if (r.status === 403) {
        setMsg({ kind: "err", text: t("No sos admin.", "Not authorized.") });
        return;
      }
      if (!r.ok) return;
      const j = await r.json();
      setComps(j.comps ?? []);
    } catch (e) {
      if (e instanceof Error && e.message === "not-signed-in") {
        setMsg({ kind: "err", text: t("No estás logueado.", "Not signed in.") });
      }
    }
  }

  useEffect(() => {
    void loadComps();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function grant() {
    setBusy(true);
    setMsg(null);
    try {
      const r = await authedFetch("/api/admin/comp", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), plan, months }),
      });
      const j = await r.json();
      if (!r.ok) {
        setMsg({ kind: "err", text: j.error ?? `API ${r.status}` });
      } else {
        setMsg({
          kind: "ok",
          text: t(
            `Listo — ${j.email} ahora tiene ${j.plan.toUpperCase()} por ${j.months} meses.`,
            `Done — ${j.email} now has ${j.plan.toUpperCase()} for ${j.months} months.`,
          ),
        });
        setEmail("");
        void loadComps();
      }
    } catch (e) {
      setMsg({
        kind: "err",
        text: e instanceof Error && e.message === "not-signed-in"
          ? t("No estás logueado.", "Not signed in.")
          : String(e),
      });
    }
    setBusy(false);
  }

  async function revoke(targetEmail: string) {
    if (!confirm(t(`¿Revocar el comp de ${targetEmail}? Vuelve a Free.`, `Revoke comp for ${targetEmail}? Back to Free.`))) {
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const r = await authedFetch("/api/admin/comp", {
        method: "DELETE",
        body: JSON.stringify({ email: targetEmail }),
      });
      const j = await r.json();
      if (!r.ok) {
        setMsg({ kind: "err", text: j.error ?? `API ${r.status}` });
      } else {
        setMsg({ kind: "ok", text: t(`${targetEmail} volvió a Free.`, `${targetEmail} back to Free.`) });
        void loadComps();
      }
    } catch (e) {
      setMsg({ kind: "err", text: String(e) });
    }
    setBusy(false);
  }

  const fmtDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString(isEs ? "es-AR" : "en-US") : "—";

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <section className="mx-auto max-w-3xl px-5 md:px-6 py-10">
        <header className="mb-8">
          <h1 className="text-[26px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
            {t("Cuentas gratis (comps)", "Comp accounts")}
          </h1>
          <p className="text-[13px] text-[var(--color-fg-muted)] mt-1">
            {t(
              "Otorgá Pro/Max gratis a influencers. La persona primero crea su cuenta en la app; después la buscás por email acá.",
              "Grant Pro/Max for free to influencers. The person signs up in the app first; then you grant it here by email.",
            )}
          </p>
        </header>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)]/60 p-5 mb-6">
          <label className="block text-[12px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-muted)] mb-1.5">
            {t("Email de la cuenta", "Account email")}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="influencer@ejemplo.com"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[14px] mb-4"
          />

          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-[12px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-muted)] mb-1.5">
                {t("Plan", "Plan")}
              </label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value as "max" | "pro")}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[14px]"
              >
                <option value="max">Max</option>
                <option value="pro">Pro</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-muted)] mb-1.5">
                {t("Meses", "Months")}
              </label>
              <input
                type="number"
                min={1}
                max={36}
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                className="w-24 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[14px]"
              />
            </div>
            <button
              onClick={grant}
              disabled={busy || !email.trim()}
              className="rounded-full bg-[var(--color-accent)] text-black px-5 py-2 text-[14px] font-medium disabled:opacity-50"
            >
              {busy ? t("Otorgando…", "Granting…") : t("Otorgar", "Grant")}
            </button>
          </div>
        </div>

        {msg ? (
          <div
            className={`rounded-2xl border p-4 text-[14px] mb-6 ${
              msg.kind === "ok"
                ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                : "border-red-500/30 bg-red-500/5 text-red-400"
            }`}
          >
            {msg.text}
          </div>
        ) : null}

        <h2 className="text-[14px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-muted)] mb-3">
          {t("Comps activos", "Active comps")}
        </h2>
        {comps === null ? (
          <p className="text-[13px] text-[var(--color-fg-muted)]">{t("Cargando…", "Loading…")}</p>
        ) : comps.length === 0 ? (
          <p className="text-[13px] text-[var(--color-fg-muted)]">{t("Todavía no hay comps.", "No comps yet.")}</p>
        ) : (
          <div className="rounded-2xl border border-[var(--color-border)] overflow-hidden">
            <table className="w-full text-[13px]">
              <thead className="bg-[var(--color-panel)]/60 text-[var(--color-fg-muted)]">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">{t("Email", "Email")}</th>
                  <th className="text-left px-4 py-2 font-medium">{t("Plan", "Plan")}</th>
                  <th className="text-left px-4 py-2 font-medium">{t("Estado", "Status")}</th>
                  <th className="text-left px-4 py-2 font-medium">{t("Vence", "Ends")}</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {comps.map((c) => (
                  <tr key={c.email} className="border-t border-[var(--color-border)]">
                    <td className="px-4 py-2">{c.email}</td>
                    <td className="px-4 py-2 uppercase">{c.plan}</td>
                    <td className="px-4 py-2">{c.status}</td>
                    <td className="px-4 py-2">{fmtDate(c.currentPeriodEnd)}</td>
                    <td className="px-4 py-2 text-right">
                      {c.status === "active" ? (
                        <button
                          onClick={() => revoke(c.email)}
                          disabled={busy}
                          className="text-[12px] text-red-400 hover:underline disabled:opacity-50"
                        >
                          {t("Revocar", "Revoke")}
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
