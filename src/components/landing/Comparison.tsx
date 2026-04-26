import { Check, X, Clock, MinusCircle } from "lucide-react";
import type { Dict } from "@/content";

type Cell = "yes" | "no" | "partial" | "soon";

// Cell -> visual. Kept as a const map so the table rows below stay readable
// without inline conditionals each time.
function CellIcon({ value, legend }: { value: Cell; legend: Dict["comparison"]["legend"] }) {
  if (value === "yes") {
    return (
      <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-[var(--color-ok)]/12 text-[var(--color-ok)]">
        <Check size={14} strokeWidth={3} aria-label={legend.yes} />
      </span>
    );
  }
  if (value === "partial") {
    return (
      <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-[var(--color-warn)]/12 text-[var(--color-warn)]">
        <MinusCircle size={14} strokeWidth={2.4} aria-label={legend.partial} />
      </span>
    );
  }
  if (value === "soon") {
    return (
      <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-[var(--color-info)]/12 text-[var(--color-info)]">
        <Clock size={14} strokeWidth={2.4} aria-label={legend.soon} />
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-[var(--color-panel-2)] text-[var(--color-fg-dim)]">
      <X size={14} strokeWidth={2.4} aria-label={legend.no} />
    </span>
  );
}

export function Comparison({ dict }: { dict: Dict }) {
  const c = dict.comparison;

  // Each row: [labelKey, claudeDesktop, codexDesktop, terminalSync].
  // Order matters — start with what users care most about, end with the
  // privacy clincher.
  const rows: [keyof typeof c.rows, Cell, Cell, Cell][] = [
    ["claudeConfig", "partial", "no", "yes"],
    ["coworkSessions", "soon", "no", "yes"],
    ["mcpServers", "partial", "no", "yes"],
    ["codexAuth", "no", "yes", "yes"],
    ["envFiles", "no", "no", "yes"],
    ["localFolders", "no", "no", "yes"],
    ["yourCloud", "no", "no", "yes"],
  ];

  return (
    <section
      id="comparison"
      className="mx-auto max-w-6xl px-5 md:px-6 py-20 md:py-24"
    >
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-accent)] border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 px-3 py-1 rounded-full">
          {c.eyebrow}
        </span>
        <h2
          className="mt-4 font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.08]"
          style={{ fontSize: "clamp(1.625rem, 4vw, 2.5rem)" }}
        >
          {c.title}
        </h2>
        <p className="mt-3 text-[15px] text-[var(--color-fg-muted)] leading-relaxed">
          {c.subtitle}
        </p>
      </div>

      {/* Desktop / tablet: real table. Mobile: stacked cards (below). */}
      <div className="mt-10 hidden md:block">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--color-panel-2)]/60">
                <th className="px-5 py-4 text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--color-fg-muted)]">
                  {c.columns.feature}
                </th>
                <th className="px-3 py-4 text-center text-[12.5px] font-semibold text-[var(--color-fg-muted)]">
                  {c.columns.claudeDesktop}
                </th>
                <th className="px-3 py-4 text-center text-[12.5px] font-semibold text-[var(--color-fg-muted)]">
                  {c.columns.codexDesktop}
                </th>
                <th className="px-3 py-4 text-center text-[12.5px] font-semibold text-[var(--color-accent)]">
                  {c.columns.terminalSync}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([key, claude, codex, ts], i) => (
                <tr
                  key={key}
                  className={
                    i % 2 === 0
                      ? "bg-transparent"
                      : "bg-[var(--color-panel-2)]/30"
                  }
                >
                  <td className="px-5 py-3.5 text-[13.5px] text-[var(--color-fg)]">
                    {c.rows[key]}
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex justify-center">
                      <CellIcon value={claude} legend={c.legend} />
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex justify-center">
                      <CellIcon value={codex} legend={c.legend} />
                    </div>
                  </td>
                  <td className="px-3 py-3.5 bg-[var(--color-accent)]/4">
                    <div className="flex justify-center">
                      <CellIcon value={ts} legend={c.legend} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile: one card per feature so the comparison stays readable on
          narrow screens without horizontal scroll. */}
      <div className="mt-10 md:hidden space-y-3">
        {rows.map(([key, claude, codex, ts]) => (
          <div
            key={key}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4"
          >
            <div className="text-[13.5px] font-semibold text-[var(--color-fg-strong)] mb-3">
              {c.rows[key]}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <MobileCell label={c.columns.claudeDesktop} value={claude} legend={c.legend} />
              <MobileCell label={c.columns.codexDesktop} value={codex} legend={c.legend} />
              <MobileCell
                label={c.columns.terminalSync}
                value={ts}
                legend={c.legend}
                highlight
              />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-[12px] text-[var(--color-fg-dim)] max-w-xl mx-auto leading-relaxed">
        {c.footnote}
      </p>

      {/* Inline legend so users decode the icons without scroll-hunting. */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-[11.5px] text-[var(--color-fg-muted)]">
        <LegendItem icon={<Check size={11} strokeWidth={3} />} color="ok" label={c.legend.yes} />
        <LegendItem icon={<MinusCircle size={11} strokeWidth={2.4} />} color="warn" label={c.legend.partial} />
        <LegendItem icon={<Clock size={11} strokeWidth={2.4} />} color="info" label={c.legend.soon} />
        <LegendItem icon={<X size={11} strokeWidth={2.4} />} color="dim" label={c.legend.no} />
      </div>
    </section>
  );
}

function MobileCell({
  label,
  value,
  legend,
  highlight,
}: {
  label: string;
  value: Cell;
  legend: Dict["comparison"]["legend"];
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg p-2 ${
        highlight ? "bg-[var(--color-accent)]/8" : "bg-[var(--color-panel-2)]/40"
      }`}
    >
      <div
        className={`text-[10px] uppercase tracking-[0.08em] font-medium mb-1 ${
          highlight ? "text-[var(--color-accent)]" : "text-[var(--color-fg-dim)]"
        }`}
      >
        {label}
      </div>
      <div className="flex justify-center">
        <CellIcon value={value} legend={legend} />
      </div>
    </div>
  );
}

function LegendItem({
  icon,
  color,
  label,
}: {
  icon: React.ReactNode;
  color: "ok" | "warn" | "info" | "dim";
  label: string;
}) {
  const colorMap = {
    ok: "bg-[var(--color-ok)]/12 text-[var(--color-ok)]",
    warn: "bg-[var(--color-warn)]/12 text-[var(--color-warn)]",
    info: "bg-[var(--color-info)]/12 text-[var(--color-info)]",
    dim: "bg-[var(--color-panel-2)] text-[var(--color-fg-dim)]",
  } as const;
  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex items-center justify-center h-5 w-5 rounded-full ${colorMap[color]}`}
      >
        {icon}
      </span>
      {label}
    </div>
  );
}
