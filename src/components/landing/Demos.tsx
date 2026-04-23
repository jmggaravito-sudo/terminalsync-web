import {
  Laptop,
  Monitor,
  Download,
  ShieldCheck,
  FileText,
  Lock,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import type { Dict } from "@/content";

export function Demos({ dict }: { dict: Dict }) {
  return (
    <section
      id="demos"
      className="mx-auto max-w-6xl px-5 md:px-6 py-20 md:py-28"
    >
      <div className="text-center max-w-2xl mx-auto">
        <h2
          className="font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.08]"
          style={{ fontSize: "clamp(1.75rem, 4.4vw, 2.75rem)" }}
        >
          {dict.demos.title}
        </h2>
        <p className="mt-3 text-[15px] text-[var(--color-fg-muted)]">
          {dict.demos.subtitle}
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <DemoCard
          kicker={dict.demos.items.context.kicker}
          title={dict.demos.items.context.title}
          body={dict.demos.items.context.body}
          demo={<ContextDemo />}
        />
        <DemoCard
          kicker={dict.demos.items.install.kicker}
          title={dict.demos.items.install.title}
          body={dict.demos.items.install.body}
          demo={<InstallDemo />}
        />
        <DemoCard
          kicker={dict.demos.items.shield.kicker}
          title={dict.demos.items.shield.title}
          body={dict.demos.items.shield.body}
          demo={<ShieldDemo />}
        />
      </div>
    </section>
  );
}

function DemoCard({
  kicker,
  title,
  body,
  demo,
}: {
  kicker: string;
  title: string;
  body: string;
  demo: React.ReactNode;
}) {
  return (
    <article className="lift rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] overflow-hidden flex flex-col">
      <div className="aspect-[4/3] bg-gradient-to-br from-[var(--color-panel-2)] to-[var(--color-bg)] border-b border-[var(--color-border)] relative overflow-hidden">
        {demo}
      </div>
      <div className="p-5">
        <span className="text-[10.5px] font-mono uppercase tracking-[0.14em] text-[var(--color-accent)] font-semibold">
          {kicker}
        </span>
        <h3 className="mt-2 text-[17px] font-semibold tracking-tight text-[var(--color-fg-strong)] leading-tight">
          {title}
        </h3>
        <p className="mt-2 text-[13px] text-[var(--color-fg-muted)] leading-relaxed">
          {body}
        </p>
      </div>
    </article>
  );
}

// ── Demo 1: El Contexto — two laptops mirrored ─────────────────────────
function ContextDemo() {
  const ChatLines = () => (
    <div className="space-y-1 px-1.5 py-1.5">
      <div className="h-1 w-8 rounded-full bg-[var(--color-accent)]/70" />
      <div className="h-1 w-10 rounded-full bg-[var(--color-fg-muted)]/50" />
      <div className="h-1 w-6 rounded-full bg-[var(--color-accent)]/70" />
      <div className="h-1 w-9 rounded-full bg-[var(--color-fg-muted)]/50" />
    </div>
  );

  return (
    <div className="absolute inset-0 flex items-center justify-around px-4">
      <div className="flex flex-col items-center gap-1.5 demo-context-drift">
        <div className="w-28 h-20 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] overflow-hidden shadow-sm">
          <div className="h-2 bg-[var(--color-panel-2)] border-b border-[var(--color-border)]" />
          <ChatLines />
        </div>
        <div className="w-24 h-1.5 rounded-b bg-[var(--color-border)]" />
        <Laptop size={10} className="text-[var(--color-fg-dim)]" />
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <ArrowRight
          size={16}
          className="text-[var(--color-accent)]"
          strokeWidth={2}
        />
        <MessageSquare
          size={11}
          className="text-[var(--color-accent)]"
          strokeWidth={2.2}
        />
      </div>

      <div
        className="flex flex-col items-center gap-1.5 demo-context-drift"
        style={{ animationDelay: "2s" }}
      >
        <div className="w-28 h-20 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] overflow-hidden shadow-sm">
          <div className="h-2 bg-[var(--color-panel-2)] border-b border-[var(--color-border)]" />
          <ChatLines />
        </div>
        <div className="w-24 h-1.5 rounded-b bg-[var(--color-border)]" />
        <Monitor size={10} className="text-[var(--color-fg-dim)]" />
      </div>
    </div>
  );
}

// ── Demo 2: 1-Click Install — big orange button + install sequence ─────
function InstallDemo() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div
          className="relative rounded-xl px-5 py-3 bg-[var(--color-claude)] text-white font-semibold text-[12.5px] shadow-[0_10px_32px_-8px_var(--color-claude-glow)] inline-flex items-center gap-1.5 demo-install-click"
        >
          <Download size={12} strokeWidth={2.4} />
          Instalar Claude Code
        </div>

        <div className="space-y-1 w-44">
          <Step active label="Descargando" />
          <Step done label="Configurando" />
          <Step done label="Listo" />
        </div>
      </div>
    </div>
  );
}

function Step({
  active,
  done,
  label,
}: {
  active?: boolean;
  done?: boolean;
  label: string;
}) {
  const bg = done
    ? "bg-[var(--color-ok)]"
    : active
      ? "bg-[var(--color-claude)]"
      : "bg-[var(--color-border-strong)]";
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-1.5 flex-1 rounded-full ${bg}`}>
        {active && (
          <span className="block h-full w-1/2 rounded-full bg-[var(--color-claude-soft)] pulse-dot" />
        )}
      </span>
      <span className="text-[9px] text-[var(--color-fg-muted)] w-14">
        {label}
      </span>
    </div>
  );
}

// ── Demo 3: El Escudo — files flying into an AES-256 lock cloud ─────────
function ShieldDemo() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative h-full w-full flex items-center justify-center">
        {/* Shield in center */}
        <div className="relative h-16 w-16 rounded-2xl bg-[var(--color-ok)]/15 flex items-center justify-center demo-shield-pulse">
          <ShieldCheck
            size={28}
            className="text-[var(--color-ok)]"
            strokeWidth={2}
          />
          <Lock
            size={10}
            className="absolute bottom-1 right-1 text-[var(--color-ok)] bg-[var(--color-panel)] rounded-full p-[2px]"
          />
        </div>

        {/* Files flying up */}
        <div className="absolute bottom-6 left-[18%] demo-fly-up">
          <FilePip color="text-[var(--color-accent)]" />
        </div>
        <div
          className="absolute bottom-6 left-[38%] demo-fly-up"
          style={{ animationDelay: "0.6s" }}
        >
          <FilePip color="text-[var(--color-claude)]" />
        </div>
        <div
          className="absolute bottom-6 right-[22%] demo-fly-up"
          style={{ animationDelay: "1.2s" }}
        >
          <FilePip color="text-[var(--color-ok)]" />
        </div>

        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-mono uppercase tracking-[0.14em] text-[var(--color-ok)]">
          AES-256
        </span>
      </div>
    </div>
  );
}

function FilePip({ color }: { color: string }) {
  return (
    <div
      className={`h-7 w-5 rounded-sm border border-[var(--color-border)] bg-[var(--color-panel)] flex items-center justify-center shadow-sm`}
    >
      <FileText size={10} className={color} strokeWidth={2} />
    </div>
  );
}
