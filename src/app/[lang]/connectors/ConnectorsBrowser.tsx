"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, X, Zap } from "lucide-react";
import type { ConnectorMeta } from "@/lib/connectors";
import { ConnectorLogo } from "./Logo";

type CategoryFilter = "all" | ConnectorMeta["category"];

interface Props {
  lang: string;
  connectors: ConnectorMeta[];
  categoryLabels: Record<string, string>;
  copy: {
    all: string;
    filterByCategory: string;
    oneClickInstall: string;
    empty: string;
    clearFilters: string;
    soon: string;
  };
}

export function ConnectorsBrowser({
  lang,
  connectors,
  categoryLabels,
  copy,
}: Props) {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [installable, setInstallable] = useState(false);

  const categories = useMemo(() => {
    const set = new Set<ConnectorMeta["category"]>();
    connectors.forEach((c) => set.add(c.category));
    return Array.from(set).sort();
  }, [connectors]);

  const filtered = useMemo(
    () =>
      connectors.filter((c) => {
        if (category !== "all" && c.category !== category) return false;
        if (installable && !c.manifest) return false;
        return true;
      }),
    [connectors, category, installable],
  );

  const hasFilters = category !== "all" || installable;

  return (
    <>
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)]/40 backdrop-blur-sm p-4 md:p-5">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-x-6 gap-y-3 items-start">
          <span className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-[var(--color-fg-dim)] md:pt-1">
            {copy.filterByCategory}
          </span>
          <div className="flex flex-wrap gap-1.5">
            <Pill active={category === "all"} onClick={() => setCategory("all")}>
              {copy.all}
            </Pill>
            {categories.map((c) => (
              <Pill key={c} active={category === c} onClick={() => setCategory(c)}>
                {categoryLabels[c] ?? c}
              </Pill>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setInstallable((x) => !x)}
            className={
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px] font-medium border transition-all " +
              (installable
                ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
                : "bg-[var(--color-panel)] text-[var(--color-fg-muted)] border-[var(--color-border)] hover:border-[var(--color-accent)]/40 hover:text-[var(--color-fg-strong)]")
            }
          >
            <Zap size={11} strokeWidth={2.4} />
            {copy.oneClickInstall}
          </button>

          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setCategory("all");
                setInstallable(false);
              }}
              className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] transition-colors"
            >
              <X size={12} strokeWidth={2.4} />
              {copy.clearFilters}
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-panel)]/40 px-6 py-16 text-center">
          <p className="text-[14px] text-[var(--color-fg-muted)]">{copy.empty}</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <ConnectorCard
              key={c.slug}
              lang={lang}
              connector={c}
              categoryLabel={categoryLabels[c.category] ?? c.category}
              soonLabel={copy.soon}
              oneClickLabel={copy.oneClickInstall}
            />
          ))}
        </div>
      )}
    </>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full px-3 py-1 text-[11.5px] font-medium transition-all border " +
        (active
          ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)] glow-accent"
          : "bg-[var(--color-panel)] text-[var(--color-fg-muted)] border-[var(--color-border)] hover:border-[var(--color-accent)]/40 hover:text-[var(--color-fg-strong)]")
      }
    >
      {children}
    </button>
  );
}

function ConnectorCard({
  lang,
  connector,
  categoryLabel,
  soonLabel,
  oneClickLabel,
}: {
  lang: string;
  connector: ConnectorMeta;
  categoryLabel: string;
  soonLabel: string;
  oneClickLabel: string;
}) {
  const soon = connector.status === "soon";
  return (
    <Link
      href={`/${lang}/connectors/${connector.slug}`}
      className={
        "group relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5 transition-all hover:border-[var(--color-accent)]/40 hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 " +
        (soon ? "opacity-70" : "")
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="h-11 w-11 rounded-xl bg-[var(--color-panel-2)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden">
          <ConnectorLogo src={connector.logo} size={28} className="h-7 w-7" />
        </div>
        <ArrowUpRight
          size={16}
          className="text-[var(--color-fg-dim)] group-hover:text-[var(--color-accent)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-1"
        />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <h3 className="text-[16px] font-semibold tracking-tight">{connector.name}</h3>
        {soon && (
          <span className="text-[10px] font-mono uppercase tracking-[0.12em] border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 text-[var(--color-accent)] rounded px-1.5 py-0.5">
            {soonLabel}
          </span>
        )}
      </div>
      <p className="mt-1 text-[13px] text-[var(--color-fg-muted)] leading-relaxed line-clamp-2">
        {connector.tagline}
      </p>

      <div className="mt-4 pt-3 border-t border-[var(--color-border)]/50 flex items-center justify-between text-[10.5px] font-mono uppercase tracking-[0.12em]">
        <span className="text-[var(--color-fg-dim)]">{categoryLabel}</span>
        {connector.manifest && (
          <span className="inline-flex items-center gap-1 text-[var(--color-accent)]">
            <Zap size={10} strokeWidth={2.4} />
            {oneClickLabel}
          </span>
        )}
      </div>
    </Link>
  );
}
