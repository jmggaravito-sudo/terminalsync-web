"use client";

import { useEffect, useMemo, useState } from "react";
import { authedFetch } from "@/lib/supabase/browser";
import {
  CONNECTION_LABEL_EN,
  CONNECTION_LABEL_ES,
  STATUS_LABEL_EN,
  STATUS_LABEL_ES,
  countByCountry,
  filterRows,
  summaryLine,
  type IntegrationRow,
  type StatusView,
  type SupervisionStatus,
} from "@/lib/adminIntegrationsByCountry";
import { marketLabel, type MarketCode } from "@/lib/markets";

type AuthState = "checking" | "anon" | "ready" | "forbidden" | "error";

const STATUS_CLS: Record<SupervisionStatus, string> = {
  working: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  "login-pending": "border-amber-500/40 bg-amber-500/10 text-amber-400",
  blocked: "border-red-500/40 bg-red-500/10 text-red-400",
  unverified: "border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-fg-muted)]",
};

export function PorPaisClient({ lang }: { lang: string }) {
  const isEs = lang !== "en";
  const [auth, setAuth] = useState<AuthState>("checking");
  const [rows, setRows] = useState<IntegrationRow[]>([]);
  const [country, setCountry] = useState<MarketCode | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<StatusView>("installable");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authedFetch("/api/admin/integraciones/por-pais");
        if (cancelled) return;
        if (res.status === 401) return setAuth("anon");
        if (res.status === 403) return setAuth("forbidden");
        if (!res.ok) return setAuth("error");
        const json = (await res.json()) as { rows: IntegrationRow[] };
        setRows(json.rows);
        setAuth("ready");
      } catch {
        if (!cancelled) setAuth("anon");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(() => countByCountry(rows), [rows]);
  const visible = useMemo(
    () => filterRows(rows, { country, query, view }),
    [rows, country, query, view],
  );
  const statusLabel = isEs ? STATUS_LABEL_ES : STATUS_LABEL_EN;
  const connLabel = isEs ? CONNECTION_LABEL_ES : CONNECTION_LABEL_EN;

  const field =
    "rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[13px] text-[var(--color-fg)]";

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <h1 className="text-[22px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
        {isEs ? "Integraciones por país" : "Integrations by country"}
      </h1>
      <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-[var(--color-fg-muted)]">
        {isEs
          ? "Todo el catálogo de conectores, con los países donde sirve y su estado de supervisión. Los datos salen del frontmatter de cada ficha; esta página no corre ninguna prueba."
          : "The whole connector catalog, with the countries each one serves and its supervision status. Data comes from each ficha's frontmatter; this page runs no tests."}
      </p>

      {auth === "checking" && (
        <p className="mt-6 text-[13px] text-[var(--color-fg-muted)]">
          {isEs ? "Verificando sesión…" : "Checking session…"}
        </p>
      )}
      {auth === "anon" && (
        <p className="mt-6 text-[13px] text-[var(--color-fg)]">
          {isEs ? "Debes iniciar sesión como admin para ver este panel." : "You need to be signed in as admin."}{" "}
          <a
            className="underline"
            href={`/${lang}/login?next=${encodeURIComponent(`/${lang}/admin/integraciones/por-pais`)}`}
          >
            {isEs ? "Entrar →" : "Sign in →"}
          </a>
        </p>
      )}
      {auth === "forbidden" && (
        <p className="mt-6 text-[13px] text-[var(--color-fg)]">
          {isEs ? "Tu cuenta no está en ADMIN_EMAILS." : "Your account isn't in ADMIN_EMAILS."}
        </p>
      )}
      {auth === "error" && (
        <p className="mt-6 text-[13px] text-red-400">
          {isEs ? "No se pudo cargar el catálogo." : "Could not load the catalog."}
        </p>
      )}

      {auth === "ready" && (
        <>
          <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
            <select
              aria-label={isEs ? "País" : "Country"}
              className={field}
              value={country}
              onChange={(e) => setCountry(e.target.value as MarketCode | "ALL")}
            >
              <option value="ALL">
                {isEs ? `Todos los países (${rows.length})` : `All countries (${rows.length})`}
              </option>
              {counts.filter((c) => c.code === "GLOBAL" || c.specific > 0).map((c) => (
                <option key={c.code} value={c.code}>
                  {marketLabel(c.code, lang)} — {c.total}
                  {c.code === "GLOBAL" ? "" : isEs ? ` (${c.specific} propias)` : ` (${c.specific} own)`}
                </option>
              ))}
            </select>
            <input
              type="search"
              aria-label={isEs ? "Buscar" : "Search"}
              placeholder={isEs ? "Buscar integración…" : "Search integration…"}
              className={`${field} md:w-64`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              aria-label={isEs ? "Estado" : "Status"}
              className={field}
              value={view}
              onChange={(e) => setView(e.target.value as StatusView)}
            >
              <option value="installable">
                {isEs ? "Instalables (supervisadas + login por probar)" : "Installable (supervised + login to test)"}
              </option>
              <option value="working">
                {isEs ? "Solo funcionando y supervisado" : "Only working and supervised"}
              </option>
              <option value="all">
                {isEs ? "Todas (incluye bloqueadas y no verificadas)" : "All (incl. blocked and not verified)"}
              </option>
            </select>
          </div>

          <p className="mt-4 text-[14px] font-medium text-[var(--color-fg-strong)]">
            {summaryLine(rows, country, lang)}{" "}
            <span className="font-normal text-[var(--color-fg-muted)]">
              {isEs ? `Mostrando ${visible.length}.` : `Showing ${visible.length}.`}
            </span>
          </p>
          {country !== "ALL" && country !== "GLOBAL" && (
            <p className="mt-1 text-[12px] text-[var(--color-fg-muted)]">
              {isEs
                ? "El conteo de un país incluye las integraciones globales (funcionan en todos lados)."
                : "A country's count includes global integrations (they work everywhere)."}
            </p>
          )}

          <div className="mt-4 overflow-x-auto rounded-2xl border border-[var(--color-border)]">
            <table className="w-full min-w-[860px] text-left text-[13px]">
              <thead className="bg-[var(--color-panel)] text-[12px] text-[var(--color-fg-muted)]">
                <tr>
                  <th className="px-3 py-2 font-medium">{isEs ? "Integración" : "Integration"}</th>
                  <th className="px-3 py-2 font-medium">{isEs ? "Países" : "Countries"}</th>
                  <th className="px-3 py-2 font-medium">{isEs ? "Categoría" : "Category"}</th>
                  <th className="px-3 py-2 font-medium">{isEs ? "Cómo se conecta" : "How it connects"}</th>
                  <th className="px-3 py-2 font-medium">{isEs ? "Supervisión" : "Supervision"}</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r.slug} className="border-t border-[var(--color-border)] align-top">
                    <td className="px-3 py-2 font-medium text-[var(--color-fg-strong)]">
                      {r.name}
                      <div className="font-mono text-[11px] font-normal text-[var(--color-fg-muted)]">{r.slug}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {r.markets.map((m) => (
                          <span
                            key={m}
                            className="rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[11px] text-[var(--color-fg)]"
                          >
                            {marketLabel(m, lang)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-[var(--color-fg-muted)]">{r.category}</td>
                    <td className="px-3 py-2 text-[var(--color-fg-muted)]">{connLabel[r.connection]}</td>
                    <td className="px-3 py-2">
                      <span
                        title={r.explanation}
                        className={`inline-block rounded-full border px-2 py-0.5 text-[11.5px] ${STATUS_CLS[r.status]}`}
                      >
                        {statusLabel[r.status]}
                      </span>
                      <div className="mt-1 max-w-xs text-[11.5px] leading-snug text-[var(--color-fg-muted)]">
                        {r.explanation}
                      </div>
                      {r.verifiedAt && (
                        <div className="mt-1 text-[11px] text-[var(--color-fg-muted)]">
                          {isEs ? "Chequeo: " : "Checked: "}
                          {r.verifiedAt.slice(0, 10)}
                          {r.verifiedPackageVersion ? ` · v${r.verifiedPackageVersion}` : ""}
                          {r.aiToolsCount != null ? ` · ${r.aiToolsCount} ${isEs ? "herramientas" : "tools"}` : ""}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-[var(--color-fg-muted)]">
                      {isEs ? "Nada coincide con el filtro." : "Nothing matches the filter."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)]/60 p-4 text-[12.5px] leading-relaxed text-[var(--color-fg-muted)]">
            <p className="font-medium text-[var(--color-fg)]">{isEs ? "Cómo leer los estados" : "How to read the statuses"}</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <b>{statusLabel.working}</b>
                {isEs
                  ? ": la supervisión instaló el paquete, arrancó el servidor y respondió con herramientas utilizables. Es un chequeo técnico; no significa que un cliente lo haya usado."
                  : ": supervision installed the package, started the server and got usable tools. A technical check; it does not mean a customer has used it."}
              </li>
              <li>
                <b>{statusLabel["login-pending"]}</b>
                {isEs
                  ? ": servidor remoto (se llegó al paso de login) o paquete que pide una clave. Es instalable, pero nadie lo ha probado con una cuenta real. El smoke de login necesita red y no se corre aquí."
                  : ": remote server (the login step was reached) or a package that needs a key. Installable, but nobody has tried it with a real account. The login smoke needs network and is not run here."}
              </li>
              <li>
                <b>{statusLabel.blocked}</b>
                {isEs ? ": la supervisión lo marcó como no instalable; el motivo está debajo de cada fila." : ": supervision marked it not installable; the reason is under each row."}
              </li>
              <li>
                <b>{statusLabel.unverified}</b>
                {isEs ? ": sin resultado de supervisión (incluye los sidecars propios de TerminalSync)." : ": no supervision result (includes TerminalSync's own sidecars)."}
              </li>
            </ul>
          </div>
        </>
      )}
    </section>
  );
}
