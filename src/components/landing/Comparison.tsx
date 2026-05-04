import { Check, X, Clock, MinusCircle } from "lucide-react";
import type { Dict } from "@/content";

type Cell = "yes" | "no" | "partial" | "soon";

// Column keys must match `dict.comparison.columns`. Order = visual order
// of the rendered table (left to right). Terminal Sync goes first after
// the feature label so the reader reads "what we do" before competitors.
const COLUMN_KEYS = ["terminalSync", "warp", "cursor", "vercel", "itermTmux"] as const;
type ColumnKey = (typeof COLUMN_KEYS)[number];

// Rows grouped by theme. Each group has a localized heading from
// `dict.comparison.groups` and a list of row keys + cell values per
// column (in COLUMN_KEYS order). Last entry per group MAY be marked
// `soon` to flag roadmap items inline rather than in a separate block.
type Row = {
  key: keyof Dict["comparison"]["rows"];
  cells: Record<ColumnKey, Cell>;
};
type Group = {
  key: keyof Dict["comparison"]["groups"];
  rows: Row[];
};

const GROUPS: Group[] = [
  {
    key: "persistence",
    rows: [
      {
        key: "resurrection",
        cells: { terminalSync: "yes", warp: "no", cursor: "no", vercel: "no", itermTmux: "partial" },
      },
      {
        key: "uninterruptedWork",
        cells: { terminalSync: "yes", warp: "no", cursor: "no", vercel: "no", itermTmux: "partial" },
      },
      {
        key: "backgroundDaemon",
        cells: { terminalSync: "yes", warp: "no", cursor: "no", vercel: "no", itermTmux: "partial" },
      },
    ],
  },
  {
    key: "mobility",
    rows: [
      {
        key: "multiDeviceProfile",
        cells: { terminalSync: "yes", warp: "partial", cursor: "partial", vercel: "no", itermTmux: "no" },
      },
      {
        key: "anywhereAccess",
        cells: { terminalSync: "soon", warp: "no", cursor: "no", vercel: "no", itermTmux: "no" },
      },
      {
        key: "pairProgramming",
        cells: { terminalSync: "soon", warp: "no", cursor: "no", vercel: "no", itermTmux: "partial" },
      },
    ],
  },
  {
    key: "security",
    rows: [
      {
        key: "aes256",
        cells: { terminalSync: "yes", warp: "no", cursor: "no", vercel: "no", itermTmux: "no" },
      },
      {
        key: "secretsVault",
        cells: { terminalSync: "yes", warp: "no", cursor: "no", vercel: "partial", itermTmux: "no" },
      },
      {
        key: "apiKeysKeychain",
        cells: { terminalSync: "yes", warp: "no", cursor: "no", vercel: "no", itermTmux: "no" },
      },
    ],
  },
  {
    key: "ai",
    rows: [
      {
        key: "aiContinuity",
        cells: { terminalSync: "yes", warp: "no", cursor: "partial", vercel: "no", itermTmux: "no" },
      },
      {
        key: "aiConfigSync",
        cells: { terminalSync: "yes", warp: "no", cursor: "no", vercel: "no", itermTmux: "no" },
      },
      {
        key: "oneClickInstall",
        cells: { terminalSync: "yes", warp: "no", cursor: "no", vercel: "no", itermTmux: "no" },
      },
    ],
  },
  {
    key: "productivity",
    rows: [
      {
        key: "multiCloudSync",
        cells: { terminalSync: "yes", warp: "no", cursor: "no", vercel: "no", itermTmux: "no" },
      },
      {
        key: "silenceNotifications",
        cells: { terminalSync: "yes", warp: "no", cursor: "no", vercel: "no", itermTmux: "no" },
      },
      {
        key: "setupOnArrival",
        cells: { terminalSync: "yes", warp: "no", cursor: "no", vercel: "no", itermTmux: "no" },
      },
      {
        key: "gitNativeSync",
        cells: { terminalSync: "yes", warp: "no", cursor: "no", vercel: "no", itermTmux: "partial" },
      },
    ],
  },
];

// Cell -> visual. Kept as a const map so the table rows below stay readable
// without inline conditionals each time.
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

      {/* Desktop / tablet: 6-column table. Mobile: stacked cards (below). */}
      <div className="mt-10 hidden md:block">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--color-panel-2)]/60">
                <th className="px-4 py-4 text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--color-fg-muted)]">
                  {c.columns.feature}
                </th>
                {COLUMN_KEYS.map((col) => (
                  <th
                    key={col}
                    className={`px-2 py-4 text-center text-[12.5px] font-semibold ${
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
              {GROUPS.map((group, gi) => (
                <GroupBody key={group.key} group={group} c={c} firstGroup={gi === 0} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile: one card per feature so the comparison stays readable on
          narrow screens without horizontal scroll. */}
      <div className="mt-10 md:hidden space-y-6">
        {GROUPS.map((group) => (
          <div key={group.key}>
            <h3 className="text-[11.5px] font-mono uppercase tracking-[0.16em] text-[var(--color-accent)] mb-3">
              {c.groups[group.key]}
            </h3>
            <div className="space-y-3">
              {group.rows.map((row) => (
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

// One group block: a heading row spanning all columns, then the data rows.
// Striped via row index for readability.
function GroupBody({
  group,
  c,
  firstGroup,
}: {
  group: Group;
  c: Dict["comparison"];
  firstGroup: boolean;
}) {
  return (
    <>
      <tr>
        <td
          colSpan={COLUMN_KEYS.length + 1}
          className={`px-4 ${firstGroup ? "pt-5" : "pt-7"} pb-2`}
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center text-[10.5px] font-mono uppercase tracking-[0.16em] text-[var(--color-accent)] border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 px-2.5 py-1 rounded-full">
              {c.groups[group.key]}
            </span>
            <div className="h-px flex-1 bg-[var(--color-border)]" />
          </div>
        </td>
      </tr>
      {group.rows.map((row, ri) => (
        <tr
          key={row.key}
          className={ri % 2 === 0 ? "bg-transparent" : "bg-[var(--color-panel-2)]/30"}
        >
          <td className="px-4 py-3.5 text-[13.5px] text-[var(--color-fg)]">
            {c.rows[row.key]}
          </td>
          {COLUMN_KEYS.map((col) => (
            <td
              key={col}
              className={`px-2 py-3.5 ${col === "terminalSync" ? "bg-[var(--color-accent)]/4" : ""}`}
            >
              <div className="flex justify-center">
                <CellIcon value={row.cells[col]} legend={c.legend} />
              </div>
            </td>
          ))}
        </tr>
      ))}
    </>
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
      className={`rounded-lg p-1.5 ${
        highlight ? "bg-[var(--color-accent)]/8" : "bg-[var(--color-panel-2)]/40"
      }`}
    >
      <div
        className={`text-[9px] uppercase tracking-[0.06em] font-medium mb-1 truncate ${
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
