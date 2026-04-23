import {
  Download,
  ShieldCheck,
  Sparkles,
  Clock3,
  Layout as LayoutIcon,
  Bot,
} from "lucide-react";
import type { Dict } from "@/content";

// Inline mockup of the TerminalSync desktop app. Session cards render as
// miniature terminal windows with Claude-style startup output so devs
// immediately recognize the product's domain — not emoji folders.
export function AppMockup({ dict }: { dict: Dict }) {
  const m = dict.hero.mockup;
  return (
    <div className="relative mx-auto max-w-[880px] w-full">
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

        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] md:min-h-[420px]">
          {/* Sidebar — hidden on mobile, visible md+ */}
          <aside className="hidden md:block border-r border-[var(--color-border)] bg-[var(--color-panel-2)]/40 p-3 space-y-1 text-[11px]">
            <div className="px-2 py-1.5 rounded-md bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-semibold">
              Inicio
            </div>
            <div className="px-2 py-1.5 text-[var(--color-fg-muted)]">
              Recientes
            </div>
            <div className="px-2 py-1.5 text-[var(--color-fg-muted)]">
              Favoritas
            </div>
            <div className="pt-3 pb-1 px-2 text-[9px] uppercase tracking-[0.14em] text-[var(--color-fg-dim)] font-semibold">
              Mis terminales
            </div>
            <div className="px-2 py-1.5 text-[var(--color-fg-muted)] flex items-center gap-1.5">
              <LayoutIcon
                size={11}
                className="text-emerald-500"
                strokeWidth={2}
              />
              <span className="truncate">Main Store</span>
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] pulse-dot" />
            </div>
            <div className="px-2 py-1.5 text-[var(--color-fg-muted)] flex items-center gap-1.5">
              <ShieldCheck
                size={11}
                className="text-sky-500"
                strokeWidth={2}
              />
              <span className="truncate">Auth-API</span>
            </div>
            <div className="px-2 py-1.5 text-[var(--color-fg-muted)] flex items-center gap-1.5">
              <Bot size={11} className="text-[var(--color-claude)]" strokeWidth={2} />
              <span className="truncate">Research-Bot</span>
            </div>
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
                  3 terminales · 2.3 GB en Drive
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

            {/* Terminal session grid — three distinct "themes" so the row
                feels varied like real iTerm tabs (dark classic, white clean
                for professional APIs, rosé warm for the AI agent). Stacks
                on mobile, 3 cols on sm+. */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <TerminalCard
                title={m.session1}
                filename="store-v3 ~/front-end"
                Icon={LayoutIcon}
                iconColor="text-emerald-500"
                accentRing="ring-emerald-400/30"
                glow="shadow-[0_8px_24px_-12px_rgba(52,211,153,0.35)]"
                live={m.live}
                meta="Session · main · Synced"
                metaDot="bg-emerald-500"
                chrome={THEMES.dark}
                lines={[
                  { text: "$ npm run deploy", c: "text-emerald-400" },
                  { text: "▸ building…", c: "text-zinc-400" },
                  { text: "✓ 248 files bundled", c: "text-emerald-400" },
                  { text: "✓ uploaded → vercel", c: "text-emerald-400" },
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
                meta="Terminal · :8080 · Encryption"
                metaDot="bg-sky-500"
                chrome={THEMES.light}
                lines={[
                  { text: "→ auth-gateway v3.1", c: "text-sky-700" },
                  { text: "→ listening on :8080", c: "text-sky-700" },
                  { text: "✓ AES-256-GCM ready", c: "text-emerald-600" },
                  { text: "✓ jwt secret loaded", c: "text-emerald-600" },
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
                meta="Agent · Claude-3.5 · Persistent"
                metaDot="bg-[var(--color-claude)]"
                chrome={THEMES.rose}
                lines={[
                  { text: "> /init", c: "text-rose-900/75" },
                  { text: "✓ Claude 3.5 Sonnet", c: "text-[var(--color-claude)]" },
                  { text: "✓ context: persistent", c: "text-emerald-700" },
                  { text: "✓ memory: loaded", c: "text-emerald-700" },
                  { text: "> _", c: "text-rose-950", blink: true },
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

// Terminal card "chrome" variants — 3 looks so the hero row feels like
// three different iTerm tabs (classic dark, clean light, warm rosé).
interface Chrome {
  body: string;       // terminal body background
  title: string;      // titlebar background
  titleBorder: string;
  filename: string;   // filename text color
  outerBorder: string;
}

const THEMES: Record<"dark" | "light" | "rose", Chrome> = {
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
};

// Each card is a miniature terminal window — themed chrome, colored mono
// output, small traffic-light dots in the titlebar. The app label and
// metadata sit OUTSIDE the window so the card reads as "my real project"
// at a glance.
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
        <div className="px-2.5 py-2 font-mono leading-[1.45] text-[9.5px] space-y-[1px]">
          {lines.map((l, i) => (
            <div key={i} className={l.c}>
              {l.text}
              {l.blink && (
                <span className="inline-block w-[5px] h-[10px] -mb-[1px] ml-[2px] bg-current pulse-dot" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Metadata row below the card */}
      <div className="mt-2 flex items-center gap-1.5">
        <Icon size={11} strokeWidth={2.2} className={`${iconColor} shrink-0`} />
        <div className="min-w-0">
          <div className="text-[10.5px] font-semibold text-[var(--color-fg-strong)] truncate">
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
