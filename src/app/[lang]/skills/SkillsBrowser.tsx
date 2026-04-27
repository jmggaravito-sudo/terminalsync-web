"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import type { SkillMeta, SkillVendor } from "@/lib/skills";
import { SkillLogo } from "./Logo";

type CategoryFilter = "all" | SkillMeta["category"];
type VendorFilter = "all" | SkillVendor;

interface Props {
  lang: string;
  skills: SkillMeta[];
  categoryLabels: Record<string, string>;
  copy: {
    all: string;
    filterByCategory: string;
    filterByVendor: string;
    empty: string;
    clearFilters: string;
  };
}

export function SkillsBrowser({ lang, skills, categoryLabels, copy }: Props) {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [vendor, setVendor] = useState<VendorFilter>("all");

  // Derive available categories + vendors from the actual data so the pills
  // never show options the catalog can't satisfy.
  const categories = useMemo(() => {
    const set = new Set<SkillMeta["category"]>();
    skills.forEach((s) => set.add(s.category));
    return Array.from(set).sort();
  }, [skills]);

  const vendors = useMemo(() => {
    const set = new Set<SkillVendor>();
    skills.forEach((s) => s.vendors.forEach((v) => set.add(v)));
    return Array.from(set).sort();
  }, [skills]);

  const filtered = useMemo(
    () =>
      skills.filter((s) => {
        if (category !== "all" && s.category !== category) return false;
        if (vendor !== "all" && !s.vendors.includes(vendor)) return false;
        return true;
      }),
    [skills, category, vendor],
  );

  const hasFilters = category !== "all" || vendor !== "all";

  return (
    <>
      {/* Filter bar */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)]/40 backdrop-blur-sm p-4 md:p-5">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-x-6 gap-y-3 items-center">
          <FilterRow label={copy.filterByCategory}>
            <Pill active={category === "all"} onClick={() => setCategory("all")}>
              {copy.all}
            </Pill>
            {categories.map((c) => (
              <Pill key={c} active={category === c} onClick={() => setCategory(c)}>
                {categoryLabels[c] ?? c}
              </Pill>
            ))}
          </FilterRow>

          <FilterRow label={copy.filterByVendor}>
            <Pill active={vendor === "all"} onClick={() => setVendor("all")}>
              {copy.all}
            </Pill>
            {vendors.map((v) => (
              <Pill key={v} active={vendor === v} onClick={() => setVendor(v)}>
                {v}
              </Pill>
            ))}
          </FilterRow>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setCategory("all");
              setVendor("all");
            }}
            className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] transition-colors"
          >
            <X size={12} strokeWidth={2.4} />
            {copy.clearFilters}
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-panel)]/40 px-6 py-16 text-center">
          <p className="text-[14px] text-[var(--color-fg-muted)]">{copy.empty}</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <SkillCard
              key={s.slug}
              lang={lang}
              skill={s}
              categoryLabel={categoryLabels[s.category] ?? s.category}
            />
          ))}
        </div>
      )}
    </>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <span className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-[var(--color-fg-dim)] md:pt-1">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
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

function SkillCard({
  lang,
  skill,
  categoryLabel,
}: {
  lang: string;
  skill: SkillMeta;
  categoryLabel: string;
}) {
  return (
    <Link
      href={`/${lang}/skills/${skill.slug}`}
      className="group relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5 transition-all hover:border-[var(--color-accent)]/40 hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.4)] hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="h-11 w-11 rounded-xl bg-[var(--color-panel-2)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden">
          <SkillLogo src={skill.logo} size={28} className="h-7 w-7" />
        </div>
        <ArrowUpRight
          size={16}
          className="text-[var(--color-fg-dim)] group-hover:text-[var(--color-accent)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-1"
        />
      </div>

      <h3 className="mt-4 text-[16px] font-semibold tracking-tight">{skill.name}</h3>
      <p className="mt-1 text-[13px] text-[var(--color-fg-muted)] leading-relaxed line-clamp-2">
        {skill.tagline}
      </p>

      <div className="mt-4 pt-3 border-t border-[var(--color-border)]/50 flex items-center justify-between text-[10.5px] font-mono uppercase tracking-[0.12em]">
        <span className="text-[var(--color-fg-dim)]">{categoryLabel}</span>
        <div className="flex gap-1">
          {skill.vendors.map((v) => (
            <span
              key={v}
              className="rounded bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20 px-1.5 py-0.5"
            >
              {v}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
