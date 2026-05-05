"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search, X } from "lucide-react";
import type { ConnectorMeta } from "@/lib/connectors";
import { ConnectorLogo } from "./Logo";

interface Props {
  lang: string;
  connectors: ConnectorMeta[];
  categoryLabels: Record<string, string>;
  uiText: { all: string; searchPlaceholder: string; noResults: string; soon: string };
}

export function ConnectorsExplorer({ lang, connectors, categoryLabels, uiText }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [query, setQuery] = useState("");

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of connectors) counts.set(c.category, (counts.get(c.category) ?? 0) + 1);
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([id, count]) => ({ id, count }));
  }, [connectors]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return connectors.filter((c) => {
      if (activeCategory !== "all" && c.category !== activeCategory) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q)
      );
    });
  }, [connectors, activeCategory, query]);

  return (
    <>
      <section className="mx-auto max-w-5xl px-6 pb-6">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)]/60 p-3 sm:p-4">
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-fg-dim)]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={uiText.searchPlaceholder}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-9 py-2 text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
            />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-fg-dim)] hover:text-[var(--color-fg)]">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Chip active={activeCategory === "all"} count={connectors.length} onClick={() => setActiveCategory("all")}>{uiText.all}</Chip>
            {categories.map(({ id, count }) => (
              <Chip key={id} active={activeCategory === id} count={count} onClick={() => setActiveCategory(id)}>
                {categoryLabels[id] || id}
              </Chip>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-12">
        {filtered.length === 0 ? (
          <p className="text-[13px] text-[var(--color-fg-muted)] py-12 text-center">{uiText.noResults}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c) => (
              <ConnectorCard key={c.slug} lang={lang} connector={c} categoryLabel={categoryLabels[c.category] || c.category} soonLabel={uiText.soon} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function Chip({ active, count, onClick, children }: { active: boolean; count: number; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
        active
          ? "bg-[var(--color-accent)] text-white"
          : "bg-[var(--color-panel-2)]/60 text-[var(--color-fg-muted)] hover:bg-[var(--color-panel-2)] hover:text-[var(--color-fg)]"
      }`}
    >
      <span>{children}</span>
      <span className={`text-[10px] font-mono ${active ? "text-white/80" : "text-[var(--color-fg-dim)]"}`}>{count}</span>
    </button>
  );
}

function ConnectorCard({ lang, connector, categoryLabel, soonLabel }: { lang: string; connector: ConnectorMeta; categoryLabel: string; soonLabel: string }) {
  const soon = connector.status === "soon";
  return (
    <Link
      href={`/${lang}/connectors/${connector.slug}`}
      className={`group relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5 transition-all hover:border-[var(--color-accent)]/40 hover:shadow-lg hover:-translate-y-0.5 ${soon ? "opacity-70" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="h-11 w-11 rounded-xl bg-[var(--color-panel-2)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden">
          <ConnectorLogo src={connector.logo} size={28} className="h-7 w-7" />
        </div>
        <ArrowUpRight size={16} className="text-[var(--color-fg-dim)] group-hover:text-[var(--color-accent)] transition-colors shrink-0 mt-1" />
      </div>
      <div className="mt-4 flex items-center gap-2">
        <h3 className="text-[16px] font-semibold tracking-tight">{connector.name}</h3>
        {soon && (
          <span className="text-[10px] font-mono uppercase tracking-[0.12em] border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 text-[var(--color-accent)] rounded px-1.5 py-0.5">
            {soonLabel}
          </span>
        )}
      </div>
      <p className="mt-1 text-[13px] text-[var(--color-fg-muted)] leading-relaxed">{connector.tagline}</p>
      <div className="mt-4 pt-3 border-t border-[var(--color-border)]/50 text-[11px] text-[var(--color-fg-dim)] font-mono uppercase tracking-[0.1em]">{categoryLabel}</div>
    </Link>
  );
}
