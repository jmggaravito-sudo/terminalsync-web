"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, Copy, Download } from "lucide-react";
import type { Locale } from "@/content";
import { LIVE_SEARCH_CASES } from "@/content/liveSearchCases.generated";

type CopyStatus = { id: string; state: "copied" | "error" } | null;

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Try the legacy clipboard path below for browsers that block the API.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  return copied;
}

export function LiveSearchCasesPage({ lang }: { lang: Locale }) {
  const isEs = lang === "es";
  const category = LIVE_SEARCH_CASES.categories[0];
  const [openCaseId, setOpenCaseId] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>(null);

  async function handleCopy(id: string, prompt: string) {
    const copied = await copyText(prompt);
    setCopyStatus({ id, state: copied ? "copied" : "error" });
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#f5f6f8] text-[#16181d]">
      <div className="mx-auto max-w-6xl px-5 pb-20 pt-10 md:px-8 md:pt-14">
        <Link
          href={`/${lang}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#5a37d6] transition hover:text-[#3d17b8]"
        >
          <span aria-hidden="true">←</span>
          {isEs ? "Volver al inicio" : "Back to home"}
        </Link>

        <header className="mx-auto mb-9 mt-8 max-w-3xl text-center md:mb-12 md:mt-10">
          <span className="inline-flex rounded-full border border-[#ded7fb] bg-[#efeafd] px-3 py-1 text-xs font-semibold text-[#4c31b6]">
            {isEs ? "7 casos prácticos" : "7 practical use cases"}
          </span>
          <h1 className="mt-5 text-balance text-3xl font-semibold leading-tight tracking-[-0.035em] text-[#16181d] md:text-5xl">
            {isEs
              ? "Mercado y competencia, con Búsqueda en vivo"
              : "Market & competitors, with Live Search"}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-7 text-[#565b64] md:text-lg">
            {isEs
              ? "Explora siete casos prácticos para entender tu negocio, tus competidores y lo que ocurre en tu mercado."
              : "Explore seven practical use cases to understand your business, competitors, and what is happening in your market."}
          </p>
        </header>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e2e4e9] bg-white px-5 py-4 shadow-[0_8px_24px_-20px_rgba(22,24,29,.35)]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[#efeafd] px-3 py-1.5 text-sm font-semibold text-[#4c31b6]">
              {category[lang]}
            </span>
            <span className="text-sm text-[#565b64]">
              {LIVE_SEARCH_CASES.cases.length} {isEs ? "casos" : "use cases"}
            </span>
          </div>
          <p className="max-w-xl text-sm leading-6 text-[#6b7280]">
            {isEs
              ? "Algunos ejemplos requieren que las herramientas de búsqueda estén disponibles en el espacio."
              : "Some examples require search tools to be available in the workspace."}
          </p>
        </div>

        <section
          aria-label={isEs ? "Casos de mercado y competencia" : "Market and competitor use cases"}
          className="grid gap-4 md:grid-cols-2"
        >
          {LIVE_SEARCH_CASES.cases.map((useCase, index) => {
            const copy = useCase[lang];
            const isOpen = openCaseId === useCase.id;
            const status = copyStatus?.id === useCase.id ? copyStatus.state : null;
            const panelId = `live-search-case-${useCase.id}`;

            return (
              <article
                key={useCase.id}
                className="rounded-2xl border border-[#e2e4e9] bg-white p-5 shadow-[0_10px_28px_-24px_rgba(22,24,29,.42)] transition hover:border-[#c9bdf8] hover:shadow-[0_16px_36px_-26px_rgba(61,23,184,.32)] md:p-6"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#efeafd] font-mono text-sm font-semibold text-[#5a37d6]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold leading-snug tracking-[-0.02em] text-[#16181d]">
                      {copy.t}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[#565b64]">{copy.d}</p>
                  </div>
                </div>

                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => {
                    setOpenCaseId(isOpen ? null : useCase.id);
                    setCopyStatus(null);
                  }}
                  className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#ded7fb] px-4 py-2 text-sm font-semibold text-[#4c31b6] transition hover:bg-[#f6f3ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6a48e8]"
                >
                  {isOpen
                    ? (isEs ? "Ocultar ejemplo" : "Hide example")
                    : (isEs ? "Ver ejemplo" : "See example")}
                  <ChevronDown size={15} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                  <div id={panelId} className="mt-4 border-t border-[#ececf1] pt-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#6b7280]">
                      {isEs ? "Texto listo para usar" : "Ready-to-use text"}
                    </p>
                    <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-[#e7e7ee] bg-[#f8f7fc] p-4 text-[13px] leading-6 text-[#292a31]">
                      {copy.p}
                    </pre>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => void handleCopy(useCase.id, copy.p)}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#6a48e8] px-5 text-sm font-semibold text-white transition hover:bg-[#5a37d6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6a48e8]"
                      >
                        {status === "copied" ? <Check size={16} /> : <Copy size={15} />}
                        {status === "copied"
                          ? (isEs ? "Copiado" : "Copied")
                          : (isEs ? "Usar este caso" : "Use this case")}
                      </button>
                      <p aria-live="polite" className="text-sm text-[#565b64]">
                        {status === "error"
                          ? (isEs ? "No se pudo copiar; selecciona el texto." : "Could not copy; select the text instead.")
                          : status === "copied"
                            ? (isEs ? "Texto copiado al portapapeles." : "Text copied to clipboard.")
                            : ""}
                      </p>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </section>

        <footer className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#e2e4e9] bg-white p-6 text-center shadow-[0_8px_24px_-20px_rgba(22,24,29,.35)] sm:flex-row sm:text-left">
          <div>
            <p className="font-semibold text-[#16181d]">
              {isEs ? "Llévalo a tu espacio de trabajo" : "Use it in your workspace"}
            </p>
            <p className="mt-1 text-sm text-[#565b64]">
              {isEs ? "Descarga TS para organizar tus proyectos." : "Download TS to organize your projects."}
            </p>
          </div>
          <Link
            href="/api/download"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#6a48e8] px-5 text-sm font-semibold text-white transition hover:bg-[#5a37d6]"
          >
            <Download size={16} />
            {isEs ? "Descargar TS" : "Download TS"}
          </Link>
        </footer>
      </div>
    </div>
  );
}
