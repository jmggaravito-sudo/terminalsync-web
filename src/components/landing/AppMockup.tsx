import {
  Download,
  ShieldCheck,
  Sparkles,
  Clock3,
  Star,
} from "lucide-react";
import type { Dict } from "@/content";

// Inline mockup of the TerminalSync desktop app showing the Status banner
// and the highlighted AI Power-Ups card. Pure CSS + SVG, no image asset.
export function AppMockup({ dict }: { dict: Dict }) {
  const m = dict.hero.mockup;
  return (
    <div className="relative mx-auto max-w-[880px]">
      {/* Window chrome */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] shadow-floating overflow-hidden">
        {/* Titlebar */}
        <div className="flex items-center gap-2 px-3 h-9 bg-[var(--color-panel-2)] border-b border-[var(--color-border)]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <div className="flex-1 text-center text-[11px] font-medium text-[var(--color-fg-muted)]">
            {m.appName}
          </div>
        </div>

        <div className="grid grid-cols-[160px_1fr] min-h-[380px]">
          {/* Sidebar */}
          <aside className="border-r border-[var(--color-border)] bg-[var(--color-panel-2)]/40 p-3 space-y-1 text-[11px]">
            <div className="px-2 py-1.5 rounded-md bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-semibold">
              Inicio
            </div>
            <div className="px-2 py-1.5 text-[var(--color-fg-muted)]">Recientes</div>
            <div className="px-2 py-1.5 text-[var(--color-fg-muted)]">Favoritas</div>
            <div className="pt-3 pb-1 px-2 text-[9px] uppercase tracking-[0.14em] text-[var(--color-fg-dim)] font-semibold">
              Mis terminales
            </div>
            <div className="px-2 py-1.5 text-[var(--color-fg-muted)] flex items-center gap-1.5">
              <span>💼</span>
              <span className="truncate">Ventas Q2</span>
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] pulse-dot" />
            </div>
            <div className="px-2 py-1.5 text-[var(--color-fg-muted)] flex items-center gap-1.5">
              <span>👩‍🍳</span>
              <span className="truncate">Recetas</span>
            </div>
            <div className="px-2 py-1.5 text-[var(--color-fg-muted)] flex items-center gap-1.5">
              <span>⚡</span>
              <span className="truncate">Scripts</span>
            </div>
          </aside>

          {/* Main content */}
          <div className="p-4 space-y-3">
            {/* Status banner */}
            <div className="rounded-xl border border-[var(--color-ok)]/25 bg-[var(--color-ok)]/5 px-4 py-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[var(--color-ok)]/12 text-[var(--color-ok)] flex items-center justify-center">
                <ShieldCheck size={18} strokeWidth={2} />
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-[var(--color-fg-strong)]">
                  {m.statusOk}
                </div>
                <div className="text-[11px] text-[var(--color-fg-muted)]">
                  6 terminales · 2.3 GB en Drive
                </div>
              </div>
            </div>

            {/* AI Power-Ups — highlighted */}
            <div className="relative overflow-hidden rounded-xl border border-[var(--color-claude)]/40 bg-[var(--color-panel)] ring-2 ring-[var(--color-claude-glow)] shadow-[0_12px_32px_-12px_var(--color-claude-glow)]">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at 0% 0%, var(--color-claude-glow), transparent 55%)",
                }}
              />
              <div className="relative flex items-center gap-3 p-3">
                <div className="h-11 w-11 rounded-xl bg-[var(--color-claude)]/12 border border-[var(--color-claude)]/25 flex items-center justify-center">
                  <ClaudeMark />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <Sparkles size={9} className="text-[var(--color-claude)]" />
                    <span className="text-[9px] font-mono uppercase tracking-[0.14em] text-[var(--color-claude)] font-semibold">
                      AI Power-Ups
                    </span>
                  </div>
                  <div className="mt-0.5 text-[12.5px] font-semibold text-[var(--color-fg-strong)] leading-tight">
                    {m.bannerTitle}
                  </div>
                  <div className="text-[10.5px] text-[var(--color-fg-muted)] leading-snug">
                    {m.bannerBody}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 bg-[var(--color-claude)] text-white text-[11px] font-semibold shadow-[0_6px_18px_-6px_var(--color-claude-glow)]">
                    <Download size={10} strokeWidth={2.4} />
                    {m.bannerCta}
                  </button>
                  <span className="inline-flex items-center gap-0.5 text-[9px] text-[var(--color-fg-dim)]">
                    <Clock3 size={8} /> ~30s
                  </span>
                </div>
              </div>
            </div>

            {/* Session grid */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <MockSessionCard
                title={m.session1}
                tint="emerald"
                icon="💼"
                live={m.live}
              />
              <MockSessionCard title={m.session2} tint="amber" icon="👩‍🍳" />
              <MockSessionCard title={m.session3} tint="cyan" icon="⚡" fav />
            </div>
          </div>
        </div>
      </div>

      {/* Ambient glow behind the window */}
      <div
        className="pointer-events-none absolute -inset-10 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at center, var(--color-accent-glow), transparent 55%)",
        }}
      />
    </div>
  );
}

function MockSessionCard({
  title,
  tint,
  icon,
  live,
  fav,
}: {
  title: string;
  tint: "emerald" | "amber" | "cyan";
  icon: string;
  live?: string;
  fav?: boolean;
}) {
  const gradient = {
    emerald: "from-emerald-500/25 to-transparent",
    amber: "from-amber-400/25 to-transparent",
    cyan: "from-cyan-500/25 to-transparent",
  }[tint];
  const border = {
    emerald: "border-emerald-400/25",
    amber: "border-amber-400/25",
    cyan: "border-cyan-400/25",
  }[tint];
  return (
    <div
      className={`relative rounded-lg overflow-hidden border ${border} bg-[var(--color-panel-2)]`}
    >
      <div className="relative aspect-video">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradient} pointer-events-none`}
        />
        <div className="absolute inset-0 flex items-center justify-center text-[28px]">
          {icon}
        </div>
        {live && (
          <span className="absolute top-1 left-1 inline-flex items-center gap-0.5 bg-[var(--color-err)] text-white text-[7px] font-bold uppercase tracking-wider px-1 py-0.5 rounded">
            ● {live}
          </span>
        )}
        {fav && (
          <span className="absolute top-1 left-1 inline-flex bg-black/60 text-amber-300 p-0.5 rounded">
            <Star size={7} fill="currentColor" strokeWidth={0} />
          </span>
        )}
      </div>
      <div className="px-2 py-1.5">
        <div className="text-[10.5px] font-semibold text-[var(--color-fg)] truncate">
          {title}
        </div>
      </div>
    </div>
  );
}

function ClaudeMark() {
  return (
    <svg width={22} height={22} viewBox="0 0 32 32" aria-hidden>
      <defs>
        <linearGradient id="cm-mock" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--color-claude-soft)" />
          <stop offset="1" stopColor="var(--color-claude)" />
        </linearGradient>
      </defs>
      <path
        d="M16 2.5 C 17 11.5, 17 11.5, 29.5 16 C 17 20.5, 17 20.5, 16 29.5 C 15 20.5, 15 20.5, 2.5 16 C 15 11.5, 15 11.5, 16 2.5 Z"
        fill="url(#cm-mock)"
      />
    </svg>
  );
}
