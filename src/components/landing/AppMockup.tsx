import {
  Download,
  ShieldCheck,
  Sparkles,
  Clock3,
  Layout as LayoutIcon,
  Bot,
  Code2,
  Terminal as TerminalIcon,
  Briefcase,
  StickyNote,
  Github,
  AlertTriangle,
  Star,
} from "lucide-react";
import type { Dict } from "@/content";

// Terminal-window chrome themes. Declared BEFORE the component so it's
// referenced from a fully initialized binding — otherwise React's server
// rendering of AppMockup can hit the TDZ and throw "THEMES is not defined"
// (which silently breaks client-side interactivity on the whole page).
interface Chrome {
  body: string;
  title: string;
  titleBorder: string;
  filename: string;
  outerBorder: string;
}

const THEMES: Record<"dark" | "light" | "rose" | "amber" | "violet" | "emerald", Chrome> = {
  dark: {
    body: "bg-[#0b0f17]",
    title: "bg-[#141923]",
    titleBorder: "border-[#1f2736]",
    filename: "text-zinc-500",
    outerBorder: "border-[var(--color-border)]",
  },
  light: {
    body: "bg-[#fafbfc]",
    title: "bg-[#eef0f4]",
    titleBorder: "border-[#dce0e8]",
    filename: "text-zinc-500",
    outerBorder: "border-[#dce0e8]",
  },
  rose: {
    body: "bg-[#fdeef3]",
    title: "bg-[#fbe0ea]",
    titleBorder: "border-[#f3c9d6]",
    filename: "text-rose-700/70",
    outerBorder: "border-[#f3c9d6]",
  },
  amber: {
    body: "bg-[#1a1408]",
    title: "bg-[#241b0d]",
    titleBorder: "border-[#3a2e16]",
    filename: "text-amber-300/60",
    outerBorder: "border-[#3a2e16]",
  },
  violet: {
    body: "bg-[#10081a]",
    title: "bg-[#180c25]",
    titleBorder: "border-[#2b1840]",
    filename: "text-violet-300/60",
    outerBorder: "border-[#2b1840]",
  },
  emerald: {
    body: "bg-[#06140e]",
    title: "bg-[#0a1d14]",
    titleBorder: "border-[#173028]",
    filename: "text-emerald-300/60",
    outerBorder: "border-[#173028]",
  },
};

// Inline mockup of the TerminalSync desktop app. Mirrors the actual app's
// home grid: 6 session cards in a 2×3 (sm+) or 3×2 (mobile) layout. Each
// card is a miniature terminal window themed by session category, with
// AI-tool chip + portable badge + storage chip mimicking the real cards.
export function AppMockup({ dict }: { dict: Dict }) {
  const m = dict.hero.mockup;
  return (
    <div className="relative mx-auto max-w-[960px] w-full">
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

        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] md:min-h-[520px]">
          {/* Sidebar — mirrors actual app structure (Inicio + cloud links +
              navigation + collapsible Terminales/Conectores). */}
          <aside className="hidden md:flex flex-col border-r border-[var(--color-border)] bg-[var(--color-panel-2)]/40 p-3 space-y-0.5 text-[11px]">
            <SideItem label="Inicio" active />
            <SideItem
              label="Claude AI"
              icon={<Sparkles size={11} className="text-[var(--color-claude)]" strokeWidth={2} />}
            />
            <SideItem
              label="Claude Cowork"
              icon={<Bot size={11} className="text-[var(--color-claude)]" strokeWidth={2} />}
            />
            <div className="h-px bg-[var(--color-border)] my-2" />
            <SideItem label="Recientes" />
            <SideItem label="Favoritas" />
            <SideItem label="Biblioteca" />
            <SideItem label="Historial" />
            <SideItem label="Comandos" />
            <div className="pt-3 pb-1 px-2 text-[9px] uppercase tracking-[0.14em] text-[var(--color-fg-dim)] font-semibold flex items-center justify-between">
              <span>Terminales</span>
              <span className="text-[var(--color-fg-muted)] font-mono">6</span>
            </div>
            <SideItem
              label="Main Store"
              icon={<Code2 size={11} className="text-cyan-400" strokeWidth={2} />}
              dot
            />
            <SideItem
              label="Auth-API"
              icon={<ShieldCheck size={11} className="text-sky-400" strokeWidth={2} />}
            />
            <SideItem
              label="Research-Bot"
              icon={<Bot size={11} className="text-[var(--color-claude)]" strokeWidth={2} />}
            />
            <SideItem
              label="Marketing-Site"
              icon={<StickyNote size={11} className="text-amber-300" strokeWidth={2} />}
            />
            <SideItem
              label="Data-Pipeline"
              icon={<TerminalIcon size={11} className="text-violet-300" strokeWidth={2} />}
            />
            <SideItem
              label="Mobile-App"
              icon={<Briefcase size={11} className="text-emerald-300" strokeWidth={2} />}
            />
          </aside>

          {/* Main content */}
          <div className="p-3 sm:p-4 space-y-3 min-w-0">
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
                  6 terminales · 4.7 GB en Drive · cifrado E2EE
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
                <div className="h-11 w-11 rounded-xl bg-[var(--color-claude)]/12 border border-[var(--color-claude)]/25 flex items-center justify-center shrink-0">
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
                  <div className="hidden sm:block text-[10.5px] text-[var(--color-fg-muted)] leading-snug">
                    {m.bannerBody}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <button className="inline-flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 bg-[var(--color-claude)] text-white text-[10.5px] sm:text-[11px] font-semibold shadow-[0_6px_18px_-6px_var(--color-claude-glow)] whitespace-nowrap">
                    <Download size={10} strokeWidth={2.4} />
                    <span className="hidden xs:inline sm:inline">
                      {m.bannerCta}
                    </span>
                    <span className="xs:hidden sm:hidden">Instalar</span>
                  </button>
                  <span className="inline-flex items-center gap-0.5 text-[9px] text-[var(--color-fg-dim)]">
                    <Clock3 size={8} /> ~30s
                  </span>
                </div>
              </div>
            </div>

            {/* Terminal grid — 6 cards in 2×3 (sm+) / 3×2 (mobile). Each
                card is themed by session category and shows real-app
                signals: AI tool chip, GitHub portable badge, storage
                warning. Order alternates colors so the row reads varied. */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              <TerminalCard
                title={m.session1}
                filename="store-v3 ~/front-end"
                Icon={Code2}
                iconColor="text-cyan-400"
                accentRing="ring-cyan-400/30"
                glow="shadow-[0_8px_24px_-12px_rgba(34,211,238,0.35)]"
                live={m.live}
                meta="claude · main"
                metaDot="bg-cyan-400"
                aiBadge="claude"
                portable
                chrome={THEMES.dark}
                lines={[
                  { text: "$ npm run deploy", c: "text-cyan-300" },
                  { text: "✓ 248 files bundled", c: "text-emerald-400" },
                  { text: "→ live in 4.2s", c: "text-sky-300" },
                ]}
              />
              <TerminalCard
                title={m.session2}
                filename="auth-api ~/services"
                Icon={ShieldCheck}
                iconColor="text-sky-600"
                accentRing="ring-sky-400/40"
                glow="shadow-[0_8px_24px_-12px_rgba(14,165,233,0.22)]"
                meta="codex · :8080"
                metaDot="bg-sky-500"
                aiBadge="codex"
                chrome={THEMES.light}
                lines={[
                  { text: "→ auth-gateway v3.1", c: "text-sky-700" },
                  { text: "✓ AES-256-GCM ready", c: "text-emerald-600" },
                  { text: "→ 1,247 req/s", c: "text-amber-700" },
                ]}
              />
              <TerminalCard
                title={m.session3}
                filename="agent ~/lang-chain"
                Icon={Bot}
                iconColor="text-[var(--color-claude)]"
                accentRing="ring-rose-400/40"
                glow="shadow-[0_8px_24px_-12px_rgba(236,107,124,0.35)]"
                meta="claude · persistent"
                metaDot="bg-[var(--color-claude)]"
                aiBadge="claude"
                favorite
                chrome={THEMES.rose}
                lines={[
                  { text: "> /init", c: "text-rose-900/75" },
                  { text: "✓ context: persistent", c: "text-emerald-700" },
                  { text: "> _", c: "text-rose-950", blink: true },
                ]}
              />
              <TerminalCard
                title="Marketing-Site"
                filename="docs ~/marketing"
                Icon={StickyNote}
                iconColor="text-amber-400"
                accentRing="ring-amber-400/30"
                glow="shadow-[0_8px_24px_-12px_rgba(251,191,36,0.30)]"
                meta="claude · synced"
                metaDot="bg-amber-400"
                aiBadge="claude"
                portable
                chrome={THEMES.amber}
                lines={[
                  { text: "$ astro build", c: "text-amber-300" },
                  { text: "✓ 47 pages OK", c: "text-emerald-400" },
                  { text: "→ uploaded", c: "text-sky-300" },
                ]}
              />
              <TerminalCard
                title="Data-Pipeline"
                filename="etl ~/data-jobs"
                Icon={TerminalIcon}
                iconColor="text-violet-400"
                accentRing="ring-violet-400/30"
                glow="shadow-[0_8px_24px_-12px_rgba(167,139,250,0.30)]"
                meta="codex · ETL"
                metaDot="bg-violet-400"
                aiBadge="codex"
                storageWarn
                chrome={THEMES.violet}
                lines={[
                  { text: "$ python etl.py", c: "text-violet-300" },
                  { text: "→ 1.2M rows", c: "text-zinc-400" },
                  { text: "✓ saved", c: "text-emerald-400" },
                ]}
              />
              <TerminalCard
                title="Mobile-App"
                filename="ios ~/mobile"
                Icon={Briefcase}
                iconColor="text-emerald-400"
                accentRing="ring-emerald-400/30"
                glow="shadow-[0_8px_24px_-12px_rgba(52,211,153,0.30)]"
                meta="claude · expo"
                metaDot="bg-emerald-400"
                aiBadge="claude"
                portable
                chrome={THEMES.emerald}
                lines={[
                  { text: "$ npx expo start", c: "text-emerald-300" },
                  { text: "→ Metro :8081", c: "text-zinc-400" },
                  { text: "✓ QR ready", c: "text-emerald-400" },
                ]}
              />
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

// ── Sidebar item — mirrors the real app's nav. Active state uses the
//    accent fill, idle is muted-fg; the small pulse dot indicates a live
//    sync on the linked terminal.
function SideItem({
  label,
  icon,
  active,
  dot,
}: {
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  dot?: boolean;
}) {
  return (
    <div
      className={`px-2 py-1.5 rounded-md flex items-center gap-1.5 ${
        active
          ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-semibold"
          : "text-[var(--color-fg-muted)]"
      }`}
    >
      {icon}
      <span className="truncate">{label}</span>
      {dot && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] pulse-dot" />
      )}
    </div>
  );
}

// Each card is a miniature terminal window — themed chrome, colored mono
// output, small traffic-light dots in the titlebar. The label, AI chip,
// portable indicator, and storage warning sit OUTSIDE the window so the
// card reads as "my real project" at a glance.
function TerminalCard({
  title,
  filename,
  Icon,
  iconColor,
  accentRing,
  glow,
  live,
  meta,
  metaDot,
  lines,
  chrome,
  aiBadge,
  portable,
  favorite,
  storageWarn,
}: {
  title: string;
  filename: string;
  Icon: typeof ShieldCheck;
  iconColor: string;
  accentRing: string;
  glow: string;
  live?: string;
  meta: string;
  metaDot: string;
  lines: { text: string; c: string; blink?: boolean }[];
  chrome: Chrome;
  aiBadge?: "claude" | "codex" | "idx";
  portable?: boolean;
  favorite?: boolean;
  storageWarn?: boolean;
}) {
  return (
    <div className="group">
      {/* Terminal window */}
      <div
        className={`relative rounded-lg overflow-hidden border ${chrome.outerBorder} ring-1 ${accentRing} ${glow} ${chrome.body}`}
      >
        {/* Titlebar */}
        <div
          className={`relative flex items-center gap-1 px-2 h-5 ${chrome.title} border-b ${chrome.titleBorder}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#ff5f57]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#febc2e]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#28c840]" />
          <div
            className={`flex-1 text-center text-[8px] font-mono ${chrome.filename} truncate`}
          >
            {filename}
          </div>
          {live && (
            <span className="absolute top-0.5 right-1 inline-flex items-center gap-0.5 bg-[var(--color-err)] text-white text-[7.5px] font-bold uppercase tracking-wider px-1 py-0.5 rounded">
              ● {live}
            </span>
          )}
        </div>

        {/* Code body */}
        <div className="px-2 py-1.5 font-mono leading-[1.4] text-[8.5px] space-y-[1px]">
          {lines.map((l, i) => (
            <div key={i} className={l.c}>
              {l.text}
              {l.blink && (
                <span className="inline-block w-[4px] h-[8px] -mb-[1px] ml-[2px] bg-current pulse-dot" />
              )}
            </div>
          ))}
        </div>

        {/* Top-right badges row — AI tool chip + portable + storage warn.
            Absolutely positioned so they don't shrink the code area. */}
        {(aiBadge || portable || favorite || storageWarn) && (
          <div className="absolute top-[22px] right-1 flex items-center gap-0.5">
            {favorite && (
              <span className="inline-flex items-center justify-center h-3.5 w-3.5 rounded bg-amber-400/90 text-amber-950">
                <Star size={7} strokeWidth={2.6} fill="currentColor" />
              </span>
            )}
            {portable && (
              <span
                className="inline-flex items-center justify-center h-3.5 w-3.5 rounded bg-zinc-900/80 text-zinc-100"
                title="Portable (GitHub)"
              >
                <Github size={7} strokeWidth={2.6} />
              </span>
            )}
            {storageWarn && (
              <span
                className="inline-flex items-center justify-center h-3.5 w-3.5 rounded bg-amber-500/85 text-amber-950"
                title="Storage warning"
              >
                <AlertTriangle size={7} strokeWidth={2.8} />
              </span>
            )}
            {aiBadge === "claude" && (
              <span className="inline-flex items-center gap-0.5 h-3.5 px-1 rounded bg-[var(--color-claude)]/90 text-white text-[7.5px] font-bold uppercase tracking-wider">
                claude
              </span>
            )}
            {aiBadge === "codex" && (
              <span className="inline-flex items-center gap-0.5 h-3.5 px-1 rounded bg-[#10a37f]/90 text-white text-[7.5px] font-bold uppercase tracking-wider">
                codex
              </span>
            )}
          </div>
        )}
      </div>

      {/* Metadata row below the card */}
      <div className="mt-1.5 flex items-center gap-1.5">
        <Icon size={11} strokeWidth={2.2} className={`${iconColor} shrink-0`} />
        <div className="min-w-0">
          <div className="text-[10px] font-semibold text-[var(--color-fg-strong)] truncate">
            {title}
          </div>
          <div className="flex items-center gap-1 text-[9px] font-mono text-[var(--color-fg-muted)] truncate">
            <span className={`h-1 w-1 rounded-full ${metaDot}`} />
            {meta}
          </div>
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
