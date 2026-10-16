"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Download, Search } from "lucide-react";
import type { Locale } from "@/content";

export interface LandingCase {
  id: string;
  categoryId: string;
  title: string;
  outcome: string;
  prompt: string;
}

export interface LandingCasesData {
  categories: { id: string; title: string }[];
  cases: LandingCase[];
  jobCategories: { id: string; label: string }[];
  jobs: { id: string; cat: string; t: string; d: string; cad: string; rep: string; steps: string[] }[];
}

type Tab = "cases" | "workflows";

export function LiveSearchCasesPage({ lang, data }: { lang: Locale; data: LandingCasesData }) {
  const isEs = lang === "es";
  const [tab, setTab] = useState<Tab>("cases");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const search = query.trim().toLocaleLowerCase(lang);

  const cases = useMemo(() => data.cases.filter((item) => {
    return (category === "all" || item.categoryId === category) &&
      (!search || `${item.title} ${item.outcome} ${item.prompt}`.toLocaleLowerCase(lang).includes(search));
  }), [category, data.cases, lang, search]);
  const jobs = useMemo(() => data.jobs.filter((item) => {
    return (category === "all" || item.cat === category) &&
      (!search || `${item.t} ${item.d} ${item.steps.join(" ")} ${item.rep}`.toLocaleLowerCase(lang).includes(search));
  }), [category, data.jobs, lang, search]);
  const filters = tab === "cases"
    ? data.categories.map((entry) => ({ id: entry.id, label: entry.title }))
    : data.jobCategories;
  const count = tab === "cases" ? cases.length : jobs.length;

  function setTabAndClear(next: Tab) {
    setTab(next);
    setCategory("all");
    setOpenId(null);
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-white text-[#16181d]">
      <div className="mx-auto max-w-6xl px-5 pb-20 pt-10 md:px-8 md:pt-14">
        <Link href={`/${lang}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[#5a37d6] hover:text-[#3d17b8]">
          <span aria-hidden="true">←</span>{isEs ? "Volver al inicio" : "Back to home"}
        </Link>

        <header className="mx-auto mb-8 mt-8 max-w-3xl text-center md:mb-10 md:mt-10">
          <span className="inline-flex rounded-full border border-[#ded7fb] bg-[#efeafd] px-3 py-1 text-xs font-semibold text-[#4c31b6]">
            {data.cases.length} {isEs ? "casos" : "use cases"} · {data.categories.length} {isEs ? "categorías" : "categories"}
          </span>
          <h1 className="mt-5 text-balance text-3xl font-semibold leading-tight tracking-[-0.035em] md:text-5xl">
            {isEs ? "Ideas prácticas para hacer crecer tu negocio" : "Practical ideas to move your business forward"}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-7 text-[#565b64] md:text-lg">
            {isEs
              ? `Explora los ${data.cases.length} casos del catálogo de TerminalSync en ${data.categories.length} categorías de negocio. Abre un ejemplo y descarga TS para ponerlo en práctica.`
              : `Explore ${data.cases.length} TerminalSync use cases across ${data.categories.length} business categories. Open an example and download TS to put it to work.`}
          </p>
        </header>

        <div className="mb-6 flex justify-center" role="tablist" aria-label={isEs ? "Tipo de contenido" : "Content type"}>
          <button type="button" role="tab" aria-selected={tab === "cases"} onClick={() => setTabAndClear("cases")}
            className={`min-h-11 rounded-l-full border px-5 text-sm font-semibold ${tab === "cases" ? "border-[#6a48e8] bg-[#6a48e8] text-white" : "border-[#ded7fb] bg-white text-[#4c31b6] hover:bg-[#f6f3ff]"}`}>
            {isEs ? "Casos de uso" : "Use cases"} ({data.cases.length})
          </button>
          <button type="button" role="tab" aria-selected={tab === "workflows"} onClick={() => setTabAndClear("workflows")}
            className={`min-h-11 rounded-r-full border border-l-0 px-5 text-sm font-semibold ${tab === "workflows" ? "border-[#6a48e8] bg-[#6a48e8] text-white" : "border-[#ded7fb] bg-white text-[#4c31b6] hover:bg-[#f6f3ff]"}`}>
            {isEs ? "Flujos de trabajo" : "Workflows"} ({data.jobs.length})
          </button>
        </div>

        <section className="mb-6 rounded-2xl border border-[#e2e4e9] bg-white p-5 shadow-[0_8px_24px_-20px_rgba(22,24,29,.35)]" aria-label={isEs ? "Filtros" : "Filters"}>
          <label className="relative block">
            <span className="sr-only">{isEs ? "Buscar por palabra" : "Search by keyword"}</span>
            <Search size={17} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777d87]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={isEs ? "Busca un caso o resultado…" : "Search use cases or outcomes…"}
              className="min-h-11 w-full rounded-xl border border-[#e2e4e9] bg-white pl-10 pr-4 text-sm outline-none placeholder:text-[#8b909a] focus:border-[#8e76ec] focus:ring-2 focus:ring-[#6a48e8]/15" />
          </label>
          <div className="mt-4 flex flex-wrap gap-2" aria-label={isEs ? "Categorías de negocio" : "Business categories"}>
            {filters.map((item) => <button key={item.id} type="button" aria-pressed={category === item.id} onClick={() => setCategory((current) => current === item.id ? "all" : item.id)}
              className={`rounded-full px-3.5 py-2 text-sm font-semibold ${category === item.id ? "bg-[#efeafd] text-[#4c31b6]" : "border border-[#e2e4e9] text-[#565b64] hover:border-[#c9bdf8]"}`}>
              {item.label}
            </button>)}
          </div>
        </section>

        <div className="mb-4 flex items-center justify-between gap-3 px-1">
          <p aria-live="polite" className="text-sm text-[#565b64]">{count} {tab === "cases" ? (isEs ? "casos" : "cases") : (isEs ? "flujos" : "workflows")}</p>
          {tab === "cases" && <p className="text-right text-xs text-[#6b7280]">{isEs ? "Los casos de Búsqueda en vivo dependen de las herramientas activas en tu espacio de TS." : "Live Search cases depend on the tools enabled in your TS workspace."}</p>}
        </div>

        {tab === "cases" ? (
          cases.length ? <section className="grid gap-4 md:grid-cols-2" aria-label={isEs ? "Casos de uso para tu negocio" : "Business use cases"}>
            {cases.map((item, index) => {
              const group = data.categories.find((entry) => entry.id === item.categoryId);
              const open = openId === item.id;
              const panelId = `case-${item.id}`;
              return <article key={item.id} className="rounded-2xl border border-[#e2e4e9] bg-white p-5 shadow-[0_10px_28px_-24px_rgba(22,24,29,.42)] transition hover:border-[#c9bdf8] md:p-6">
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#efeafd] font-mono text-sm font-semibold text-[#5a37d6]">{String(index + 1).padStart(2, "0")}</span>
                  <div className="min-w-0">
                    <span className="inline-flex rounded-full bg-[#f5f3fc] px-2.5 py-1 text-[11px] font-semibold text-[#5a37d6]">{group?.title}</span>
                    <h2 className="mt-2 text-lg font-semibold leading-snug tracking-[-0.02em]">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-[#565b64]">{item.outcome}</p>
                  </div>
                </div>
                <button type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpenId(open ? null : item.id)}
                  className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full border border-[#ded7fb] px-4 text-sm font-semibold text-[#4c31b6] hover:bg-[#f6f3ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6a48e8]">
                  {open ? (isEs ? "Ocultar ejemplo" : "Hide example") : (isEs ? "Ver ejemplo" : "See example")}<ChevronDown size={15} className={`transition-transform ${open ? "rotate-180" : ""}`} />
                </button>
                {open && <div id={panelId} className="mt-4 border-t border-[#ececf1] pt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#6b7280]">{isEs ? "Texto listo para usar" : "Ready-to-use text"}</p>
                  <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-[#e7e7ee] bg-[#f8f7fc] p-4 text-[13px] leading-6 text-[#292a31]">{item.prompt}</pre>
                  <Link href="/api/download" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#6a48e8] px-5 text-sm font-semibold text-white hover:bg-[#5a37d6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6a48e8]">
                    <Download size={16} />{isEs ? "Usar este caso · Descargar TS" : "Use this case · Download TS"}
                  </Link>
                </div>}
              </article>;
            })}
          </section> : <EmptyState lang={lang} />
        ) : (
          jobs.length ? <section className="grid gap-4 md:grid-cols-2" aria-label={isEs ? "Flujos de trabajo" : "Workflows"}>
            {jobs.map((item) => {
              const copy = item;
              const group = data.jobCategories.find((entry) => entry.id === item.cat);
              const open = openId === item.id;
              const panelId = `workflow-${item.id}`;
              return <article key={item.id} className="rounded-2xl border border-[#e2e4e9] bg-white p-5 shadow-[0_10px_28px_-24px_rgba(22,24,29,.42)] transition hover:border-[#c9bdf8] md:p-6">
                <div className="flex items-start gap-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#efeafd] font-mono text-sm font-semibold text-[#5a37d6]" aria-hidden="true">↻</span><div className="min-w-0"><span className="inline-flex rounded-full bg-[#f5f3fc] px-2.5 py-1 text-[11px] font-semibold text-[#5a37d6]">{group?.label}</span><h2 className="mt-2 text-lg font-semibold leading-snug">{copy.t}</h2><p className="mt-2 text-sm leading-6 text-[#565b64]">{copy.d}</p></div></div>
                <button type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpenId(open ? null : item.id)} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full border border-[#ded7fb] px-4 text-sm font-semibold text-[#4c31b6] hover:bg-[#f6f3ff]">{open ? (isEs ? "Ocultar detalles" : "Hide details") : (isEs ? "Ver detalles" : "See details")}<ChevronDown size={15} className={`transition-transform ${open ? "rotate-180" : ""}`} /></button>
                {open && <div id={panelId} className="mt-4 border-t border-[#ececf1] pt-4"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#6b7280]">{isEs ? "Qué hace" : "What it does"}</p><ol className="space-y-2 rounded-xl border border-[#e7e7ee] bg-[#f8f7fc] p-4">{copy.steps.map((step, i) => <li key={i} className="flex gap-3 text-sm leading-6 text-[#424650]"><span className="font-mono text-xs font-semibold text-[#6a48e8]">{i + 1}.</span>{step}</li>)}</ol><div className="mt-3 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-[#e7e7ee] p-3"><p className="text-xs font-semibold uppercase tracking-wide text-[#777d87]">{isEs ? "Frecuencia" : "Schedule"}</p><p className="mt-1 text-sm font-medium">{copy.cad}</p></div><div className="rounded-xl border border-[#e7e7ee] p-3"><p className="text-xs font-semibold uppercase tracking-wide text-[#777d87]">{isEs ? "Resultado" : "Outcome"}</p><p className="mt-1 text-sm leading-5 text-[#424650]">{copy.rep}</p></div></div></div>}
              </article>;
            })}
          </section> : <EmptyState lang={lang} />
        )}

        <footer className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#e2e4e9] bg-white p-6 text-center shadow-[0_8px_24px_-20px_rgba(22,24,29,.35)] sm:flex-row sm:text-left">
          <div><p className="font-semibold">{isEs ? "Llévalo a tu espacio de trabajo" : "Use it in your workspace"}</p><p className="mt-1 text-sm text-[#565b64]">{isEs ? "Descarga TS para organizar tus proyectos." : "Download TS to organize your projects."}</p></div>
          <Link href="/api/download" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#6a48e8] px-5 text-sm font-semibold text-white hover:bg-[#5a37d6]"><Download size={16} />{isEs ? "Descargar TS" : "Download TS"}</Link>
        </footer>
      </div>
    </div>
  );
}

function EmptyState({ lang }: { lang: Locale }) {
  return <p className="rounded-2xl border border-[#e2e4e9] bg-white p-10 text-center text-[#565b64]">{lang === "es" ? "No encontramos resultados con esos filtros." : "No results match those filters."}</p>;
}
