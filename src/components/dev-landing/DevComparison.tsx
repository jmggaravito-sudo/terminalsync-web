import { Check, Clock, MinusCircle, X } from "lucide-react";
import type { DevCopy } from "./copy";

/**
 * Technical comparison table for /[lang]/for-developers.
 *
 * Rows are dev-specific capabilities (Git-aware snapshots, .env
 * vault, semantic recall, MCP interop, ...) — different from the
 * consumer Comparison which leans on user-facing features. We
 * include Cursor as the 5th column because it's the closest
 * substitute story devs already know, even though it's a
 * different surface (IDE vs. memory layer).
 *
 * Render logic mirrors components/landing/Comparison.tsx so the
 * visual language stays consistent across the two surfaces.
 */

type Cell = "yes" | "no" | "partial" | "soon";

const COLUMN_KEYS = [
  "terminalSync",
  "claudeCode",
  "codex",
  "gemini",
  "cursor",
] as const;
type ColumnKey = (typeof COLUMN_KEYS)[number];

type Row = {
  key: keyof DevCopy["comparison"]["rows"];
  cells: Record<ColumnKey, Cell>;
};

const ROWS: Row[] = [
  {
    key: "sharedMemory",
    cells: { terminalSync: "yes", claudeCode: "no", codex: "no", gemini: "no", cursor: "no" },
  },
  {
    key: "gitAware",
    cells: { terminalSync: "yes", claudeCode: "no", codex: "no", gemini: "no", cursor: "no" },
  },
  {
    key: "envVault",
    cells: { terminalSync: "yes", claudeCode: "no", codex: "no", gemini: "no", cursor: "no" },
  },
  {
    key: "semanticRecall",
    cells: { terminalSync: "yes", claudeCode: "partial", codex: "no", gemini: "no", cursor: "partial" },
  },
  {
    key: "mcpInterop",
    cells: { terminalSync: "yes", claudeCode: "yes", codex: "partial", gemini: "partial", cursor: "yes" },
  },
  {
    key: "offlineLocal",
    cells: { terminalSync: "yes", claudeCode: "partial", codex: "partial", gemini: "partial", cursor: "no" },
  },
  {
    key: "e2eEncryption",
    cells: { terminalSync: "yes", claudeCode: "no", codex: "no", gemini: "no", cursor: "no" },
  },
  {
    key: "noLockIn",
    cells: { terminalSync: "yes", claudeCode: "yes", codex: "yes", gemini: "yes", cursor: "partial" },
  },
  {
    key: "headlessCli",
    cells: { terminalSync: "yes", claudeCode: "yes", codex: "yes", gemini: "yes", cursor: "no" },
  },
  {
    key: "multiMachine",
    cells: { terminalSync: "yes", claudeCode: "no", codex: "no", gemini: "no", cursor: "partial" },
  },
];

function CellIcon({
  value,
  legend,
}: {
  value: Cell;
  legend: DevCopy["comparison"]["legend"];
}) {
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

export function DevComparison({ copy }: { copy: DevCopy }) {
  const c = copy.comparison;

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

      <div className="mt-10 hidden md:block">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--color-panel-2)]/60">
                <th className="px-5 py-4 text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--color-fg-muted)]">
                  {c.columns.capability}
                </th>
                {COLUMN_KEYS.map((col) => (
                  <th
                    key={col}
                    className={`px-3 py-4 text-center text-[12.5px] font-semibold ${
                      col === "terminalSync"
                        ? "text-[var(--color-accent)]"
                        : "text-[var(--color-fg-muted)]"
                    }`}
                  >
                    {c.columns[col]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, ri) => (
                <tr
                  key={row.key}
                  className={ri % 2 === 0 ? "bg-transparent" : "bg-[var(--color-panel-2)]/30"}
                >
                  <td className="px-5 py-3.5 text-[13.5px] text-[var(--color-fg)]">
                    {c.rows[row.key]}
                  </td>
                  {COLUMN_KEYS.map((col) => (
                    <td
                      key={col}
                      className={`px-3 py-3.5 ${col === "terminalSync" ? "bg-[var(--color-accent)]/4" : ""}`}
                    >
                      <div className="flex justify-center">
                        <CellIcon value={row.cells[col]} legend={c.legend} />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile: stacked cards. Each row gets a 5-cell mini grid. */}
      <div className="mt-10 md:hidden space-y-3">
        {ROWS.map((row) => (
          <div
            key={row.key}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4"
          >
            <div className="text-[13.5px] font-semibold text-[var(--color-fg-strong)] mb-3">
              {c.rows[row.key]}
            </div>
            <div className="grid grid-cols-5 gap-1.5 text-center">
              {COLUMN_KEYS.map((col) => (
                <div
                  key={col}
                  className={`rounded-lg p-2 ${
                    col === "terminalSync"
                      ? "bg-[var(--color-accent)]/8"
                      : "bg-[var(--color-panel-2)]/40"
                  }`}
                >
                  <div
                    className={`text-[10px] uppercase tracking-[0.06em] font-medium mb-1 truncate ${
                      col === "terminalSync"
                        ? "text-[var(--color-accent)]"
                        : "text-[var(--color-fg-dim)]"
                    }`}
                    title={c.columns[col]}
                  >
                    {c.columns[col]}
                  </div>
                  <div className="flex justify-center">
                    <CellIcon value={row.cells[col]} legend={c.legend} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-[12px] text-[var(--color-fg-dim)] max-w-xl mx-auto leading-relaxed">
        {c.footnote}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-[11.5px] text-[var(--color-fg-muted)]">
        <LegendItem icon={<Check size={11} strokeWidth={3} />} color="ok" label={c.legend.yes} />
        <LegendItem
          icon={<MinusCircle size={11} strokeWidth={2.4} />}
          color="warn"
          label={c.legend.partial}
        />
        <LegendItem icon={<Clock size={11} strokeWidth={2.4} />} color="info" label={c.legend.soon} />
        <LegendItem icon={<X size={11} strokeWidth={2.4} />} color="dim" label={c.legend.no} />
      </div>
    </section>
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
