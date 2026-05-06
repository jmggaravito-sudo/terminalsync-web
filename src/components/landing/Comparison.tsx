import { Check, X, Clock, MinusCircle } from "lucide-react";
import type { Dict } from "@/content";

type Cell = "yes" | "no" | "partial" | "soon";

// Column keys must match `dict.comparison.columns`. Order = visual order
// of the rendered table (left to right). Terminal Sync first, then the
// four tools the audience compares against: Vercel cloud workspace,
// and the three raw AI agent CLIs (Claude Code, Codex, Gemini CLI).
const COLUMN_KEYS = [
  "terminalSync",
  "vercel",
  "claudeCode",
  "codex",
  "gemini",
] as const;
type ColumnKey = (typeof COLUMN_KEYS)[number];

type Row = {
  key: keyof Dict["comparison"]["rows"];
  cells: Record<ColumnKey, Cell>;
};

// Order = order of importance per JM. Memoria persistente is the
// headline differentiator (engram-backed via MCP), then session
// resurrection (Zellij engine), then multi-model + interactive
// notifications + browser/mobile mirroring. Everything else after.
const ROWS: Row[] = [
  {
    key: "persistentMemory",
    cells: { terminalSync: "yes", vercel: "no", claudeCode: "no", codex: "no", gemini: "no" },
  },
  {
    key: "resurrection",
    cells: { terminalSync: "yes", vercel: "no", claudeCode: "no", codex: "no", gemini: "no" },
  },
  {
    key: "multiModel",
    cells: { terminalSync: "yes", vercel: "no", claudeCode: "no", codex: "no", gemini: "no" },
  },
  {
    key: "responsiveNotifications",
    cells: { terminalSync: "soon", vercel: "no", claudeCode: "no", codex: "no", gemini: "no" },
  },
  {
    key: "webMobileMirror",
    cells: { terminalSync: "yes", vercel: "yes", claudeCode: "no", codex: "no", gemini: "no" },
  },
  {
    key: "aiConversationSync",
    cells: { terminalSync: "yes", vercel: "no", claudeCode: "no", codex: "no", gemini: "no" },
  },
  {
    key: "internetImmunity",
    cells: { terminalSync: "yes", vercel: "no", claudeCode: "partial", codex: "partial", gemini: "partial" },
  },
  {
    key: "aes256",
    cells: { terminalSync: "yes", vercel: "no", claudeCode: "no", codex: "no", gemini: "no" },
  },
  {
    key: "secretsVault",
    cells: { terminalSync: "yes", vercel: "partial", claudeCode: "no", codex: "no", gemini: "no" },
  },
  {
    key: "offlineLocal",
    cells: { terminalSync: "yes", vercel: "no", claudeCode: "partial", codex: "partial", gemini: "partial" },
  },
  {
    key: "noVendorLockIn",
    cells: { terminalSync: "yes", vercel: "no", claudeCode: "yes", codex: "yes", gemini: "yes" },
  },
  {
    key: "zeroRuntime",
    cells: { terminalSync: "yes", vercel: "no", claudeCode: "yes", codex: "yes", gemini: "yes" },
  },
  {
    key: "zeroStorage",
    cells: { terminalSync: "yes", vercel: "no", claudeCode: "yes", codex: "yes", gemini: "yes" },
  },
  {
    key: "deviceRoaming",
    cells: { terminalSync: "yes", vercel: "partial", claudeCode: "no", codex: "no", gemini: "no" },
  },
  {
    key: "multipleSessions",
    cells: { terminalSync: "yes", vercel: "partial", claudeCode: "partial", codex: "partial", gemini: "partial" },
  },
  {
    key: "replyInjection",
    cells: { terminalSync: "soon", vercel: "no", claudeCode: "no", codex: "no", gemini: "no" },
  },
];

function CellIcon({
  value,
  legend,
}: {
  value: Cell;
  legend: Dict["comparison"]["legend"];
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

export function Comparison({ dict }: { dict: Dict }) {
  const c = dict.comparison;

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

      {/* Desktop / tablet: 5-column table. Mobile: stacked cards (below). */}
      <div className="mt-10 hidden md:block">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--color-panel-2)]/60">
                <th className="px-5 py-4 text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--color-fg-muted)]">
                  {c.columns.feature}
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

      {/* Mobile: one card per feature so the comparison stays readable on
          narrow screens without horizontal scroll. */}
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
                <MobileCell
                  key={col}
                  label={c.columns[col]}
                  value={row.cells[col]}
                  legend={c.legend}
                  highlight={col === "terminalSync"}
                />
              ))}
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

      {/* The pitch — one paragraph that summarizes WHY this comparison
          matters. Lifted verbatim from Funcionalidades.md so landing
          and internal doc stay in sync. */}
      <div className="mt-12 max-w-3xl mx-auto rounded-2xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 p-6 md:p-8">
        <p className="text-[14.5px] md:text-[15px] leading-relaxed text-[var(--color-fg)]">
          {c.pitch}
        </p>
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
        className={`text-[10px] uppercase tracking-[0.06em] font-medium mb-1 truncate ${
          highlight ? "text-[var(--color-accent)]" : "text-[var(--color-fg-dim)]"
        }`}
        title={label}
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
