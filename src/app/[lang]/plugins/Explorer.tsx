"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Plug, Search, Sparkles, X } from "lucide-react";
import type { PluginMeta } from "@/lib/plugins";
import { PluginLogo } from "./Logo";

interface Props {
  lang: string;
  plugins: PluginMeta[];
  categoryLabels: Record<string, string>;
  uiText: { all: string; searchPlaceholder: string; noResults: string };
}

/** The inclusion line — mirrors the Kits (stacks) card: what the bundle
 *  contains. For a Plugin that's its connector + skill(s). */
function inclusion(plugin: PluginMeta): { connectors: number; skills: number } {
  return {
    connectors: plugin.connectorSlug ? 1 : 0,
    skills: plugin.skillSlugs.length,
  };
}

export function PluginsExplorer({ lang, plugins, categoryLabels, uiText }: Props) {
  const isEs = lang === "es";
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [query, setQuery] = useState("");

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of plugins) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).map(([id, count]) => ({ id, count }));
  }, [plugins]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return plugins.filter((p) => {
      if (activeCategory !== "all" && p.category !== activeCategory) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
      );
    });
  }, [plugins, activeCategory, query]);

  return (
    <>
      <section className="mx-auto max-w-5xl px-6 pb-6">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)]/60 p-3 sm:p-4 space-y-3">
          <div className="relative">
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

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <Chip active={activeCategory === "all"} count={plugins.length} onClick={() => setActiveCategory("all")}>{uiText.all}</Chip>
              {categories.map(({ id, count }) => (
                <Chip key={id} active={activeCategory === id} count={count} onClick={() => setActiveCategory(id)}>
                  {categoryLabels[id] || id}
                </Chip>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-12">
        {filtered.length === 0 ? (
          <p className="text-[13px] text-[var(--color-fg-muted)] py-12 text-center">{uiText.noResults}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <PluginCard key={p.slug} lang={lang} plugin={p} isEs={isEs} categoryLabel={categoryLabels[p.category] || p.category} />
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
        active ? "bg-[var(--color-accent)] text-white" : "bg-[var(--color-panel-2)]/60 text-[var(--color-fg-muted)] hover:bg-[var(--color-panel-2)] hover:text-[var(--color-fg)]"
      }`}
    >
      <span>{children}</span>
      <span className={`text-[10px] font-mono ${active ? "text-white/80" : "text-[var(--color-fg-dim)]"}`}>{count}</span>
    </button>
  );
}

function PluginCard({ lang, plugin, isEs, categoryLabel }: { lang: string; plugin: PluginMeta; isEs: boolean; categoryLabel: string }) {
  const inc = inclusion(plugin);
  return (
    <Link
      href={`/${lang}/plugins/${plugin.slug}`}
      className="group relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5 transition-all hover:border-[var(--color-accent)]/40 hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="h-11 w-11 rounded-xl bg-[var(--color-panel-2)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden">
          <PluginLogo src={plugin.logo} size={28} className="h-7 w-7" fallbackText={plugin.name} />
        </div>
        <ArrowUpRight size={16} className="text-[var(--color-fg-dim)] group-hover:text-[var(--color-accent)] transition-colors shrink-0 mt-1" />
      </div>
      <h3 className="mt-4 text-[16px] font-semibold tracking-tight">{plugin.name}</h3>
      <p className="mt-1 text-[13px] text-[var(--color-fg-muted)] leading-relaxed">{plugin.tagline}</p>

      {/* Inclusion line — what this Plugin bundles (mirrors the Kits card). */}
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono text-[var(--color-fg-muted)]">
        <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-dim)]">
          {isEs ? "Incluye" : "Includes"}
        </span>
        {inc.connectors > 0 && (
          <span className="inline-flex items-center gap-1">
            <Plug size={11} className="text-[var(--color-accent)]" />
            {inc.connectors} {isEs ? (inc.connectors === 1 ? "conector" : "conectores") : inc.connectors === 1 ? "connector" : "connectors"}
          </span>
        )}
        {inc.skills > 0 && (
          <span className="inline-flex items-center gap-1">
            <Sparkles size={11} className="text-[var(--color-accent)]" />
            {inc.skills} {inc.skills === 1 ? "skill" : "skills"}
          </span>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--color-border)]/50 flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.1em]">
        <span className="text-[var(--color-fg-dim)]">{categoryLabel}</span>
        {plugin.status === "soon" && (
          <span className="rounded bg-[var(--color-panel-2)] text-[var(--color-fg-dim)] px-1.5 py-0.5">{isEs ? "Pronto" : "Soon"}</span>
        )}
      </div>
    </Link>
  );
}
