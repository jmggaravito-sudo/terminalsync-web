"use client";

import { useState } from "react";
import {
  Sparkles,
  Terminal,
  Download,
  Copy,
  Check,
  ShieldAlert,
  ArrowUpRight,
} from "lucide-react";

export type InstallKind = "skill" | "connector";

export interface InstallOptionsProps {
  lang: string;
  kind: InstallKind;
  slug: string;
  /** Display name shown in the headline + toast wording. */
  name: string;
  /** Filesystem destination shown in the manual instructions:
   *   - skills:     `~/.claude/skills/<slug>/SKILL.md`
   *   - connectors: `~/Library/Application Support/Claude/claude_desktop_config.json`
   */
  installPath: string;
  /** Connectors only — the JSON snippet the user pastes under `mcpServers`.
   *  Pass the inner manifest object (command/args/env), the component wraps
   *  it as `{ "<slug>": <manifest> }` for display. */
  manifest?: Record<string, unknown>;
  /** True when the manifest contains plaintext-sensitive env vars. Surfaces
   *  the Keychain warning under the snippet. */
  hasSecrets?: boolean;
}

export function InstallOptions(props: InstallOptionsProps) {
  const { lang } = props;
  const isEs = lang === "es";

  const deepLink = `terminalsync://install-${props.kind}?id=${props.slug}`;

  return (
    <section
      aria-labelledby="install-heading"
      className="mt-12 rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel)]/40 p-1"
    >
      <div className="rounded-[calc(theme(borderRadius.3xl)-4px)] bg-[var(--color-bg)] p-6 md:p-8">
        <div className="flex items-baseline justify-between gap-4 mb-6">
          <h2
            id="install-heading"
            className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--color-fg-dim)]"
          >
            {isEs ? "Instalación" : "Install"}
          </h2>
          <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-fg-dim)]">
            {props.kind === "skill" ? "SKILL.md" : "MCP server"}
          </span>
        </div>

        {/* Recommended path — TerminalSync */}
        <RecommendedCard
          isEs={isEs}
          kind={props.kind}
          name={props.name}
          deepLink={deepLink}
          hasSecrets={props.hasSecrets ?? false}
        />

        {/* Divider */}
        <div className="my-8 flex items-center gap-3 text-[10.5px] font-mono uppercase tracking-[0.2em] text-[var(--color-fg-dim)]">
          <span className="h-px flex-1 bg-[var(--color-border)]" />
          <span>{isEs ? "o instalar manual" : "or install manually"}</span>
          <span className="h-px flex-1 bg-[var(--color-border)]" />
        </div>

        {/* Manual path */}
        {props.kind === "skill" ? (
          <ManualSkill
            isEs={isEs}
            slug={props.slug}
            name={props.name}
            installPath={props.installPath}
            lang={lang}
          />
        ) : (
          <ManualConnector
            isEs={isEs}
            slug={props.slug}
            name={props.name}
            installPath={props.installPath}
            manifest={props.manifest ?? {}}
            hasSecrets={props.hasSecrets ?? false}
          />
        )}
      </div>
    </section>
  );
}

/* ───────── Recommended (TerminalSync) ──────────────────────────────────── */

function RecommendedCard({
  isEs,
  kind,
  name,
  deepLink,
  hasSecrets,
}: {
  isEs: boolean;
  kind: InstallKind;
  name: string;
  deepLink: string;
  hasSecrets: boolean;
}) {
  const perks =
    kind === "skill"
      ? [
          isEs ? "Sync entre todas tus máquinas" : "Synced across every machine",
          isEs ? "Updates automáticos cuando el author publica" : "Auto-updates when the author ships",
          isEs ? "Funciona en Claude Code y Codex" : "Works on Claude Code and Codex",
        ]
      : [
          hasSecrets
            ? isEs ? "API key cifrada en el Keychain del OS" : "API key encrypted in the OS Keychain"
            : isEs ? "Configuración cifrada en el Keychain del OS" : "Config encrypted in the OS Keychain",
          isEs ? "Sync entre todas tus máquinas" : "Synced across every machine",
          isEs ? "Updates automáticos del manifest" : "Auto-updates of the manifest",
        ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--color-accent)]/35 bg-gradient-to-br from-[var(--color-accent)]/10 via-[var(--color-info)]/6 to-transparent p-6 md:p-7">
      {/* Recommended badge */}
      <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--color-accent)] font-semibold">
        <Sparkles size={11} strokeWidth={2.4} />
        <span>{isEs ? "Recomendado" : "Recommended"}</span>
      </div>

      <h3 className="mt-3 text-[20px] md:text-[22px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
        {isEs ? "Instalar con TerminalSync" : "Install with TerminalSync"}
      </h3>
      <p className="mt-1.5 text-[13.5px] text-[var(--color-fg-muted)] leading-relaxed max-w-md">
        {isEs
          ? "Un click. Te lo instalamos donde corresponde y se sincroniza automáticamente."
          : "One click. We install it where it belongs and keep it synced automatically."}
      </p>

      <ul className="mt-5 space-y-2">
        {perks.map((p) => (
          <li
            key={p}
            className="flex items-start gap-2.5 text-[13px] text-[var(--color-fg-muted)]"
          >
            <span className="mt-[5px] h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] shrink-0" />
            <span>{p}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <a
          href={deepLink}
          className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white px-5 py-2.5 text-[13px] font-semibold glow-accent transition-all hover:-translate-y-px"
        >
          <Download size={14} strokeWidth={2.4} />
          {isEs ? `Instalar ${name}` : `Install ${name}`}
          <ArrowUpRight size={13} strokeWidth={2.4} className="opacity-80" />
        </a>
        <span className="text-[11.5px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-dim)]">
          {isEs ? "abre TerminalSync" : "opens TerminalSync"}
        </span>
      </div>
    </div>
  );
}

/* ───────── Manual install — skill ──────────────────────────────────────── */

function ManualSkill({
  isEs,
  slug,
  name,
  installPath,
  lang,
}: {
  isEs: boolean;
  slug: string;
  name: string;
  installPath: string;
  lang: string;
}) {
  const downloadUrl = `/api/marketplace/skills/${slug}/download?lang=${lang}`;
  return (
    <ManualWrapper isEs={isEs}>
      <Step number="01" title={isEs ? "Bajá el archivo SKILL.md" : "Download the SKILL.md file"}>
        <a
          href={downloadUrl}
          download={`${slug}.SKILL.md`}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] hover:bg-[var(--color-panel-2)] hover:border-[var(--color-accent)]/40 text-[var(--color-fg-strong)] px-4 py-2 text-[12.5px] font-medium transition-colors"
        >
          <Download size={13} strokeWidth={2.2} />
          {isEs ? "Descargar SKILL.md" : "Download SKILL.md"}
        </a>
      </Step>

      <Step number="02" title={isEs ? "Movelo a esta ruta:" : "Move it to this path:"}>
        <PathBlock path={installPath} />
      </Step>

      <Step
        number="03"
        title={isEs ? "Reiniciá tu cliente." : "Restart your client."}
        last
      >
        <p className="text-[12.5px] text-[var(--color-fg-muted)]">
          {isEs
            ? "Claude Code y Codex detectan el skill al próximo reload."
            : "Claude Code and Codex detect the skill on the next reload."}
        </p>
      </Step>

      <ManualFootnote>
        {isEs
          ? `Sin sync. Tenés que repetir estos pasos en cada máquina donde quieras "${name}".`
          : `No sync. You'll need to repeat these steps on every machine where you want "${name}".`}
      </ManualFootnote>
    </ManualWrapper>
  );
}

/* ───────── Manual install — connector ──────────────────────────────────── */

function ManualConnector({
  isEs,
  slug,
  name,
  installPath,
  manifest,
  hasSecrets,
}: {
  isEs: boolean;
  slug: string;
  name: string;
  installPath: string;
  manifest: Record<string, unknown>;
  hasSecrets: boolean;
}) {
  const snippet = JSON.stringify({ [slug]: manifest }, null, 2);

  return (
    <ManualWrapper isEs={isEs}>
      <Step number="01" title={isEs ? "Abrí el archivo de config:" : "Open the config file:"}>
        <PathBlock path={installPath} />
      </Step>

      <Step
        number="02"
        title={
          isEs
            ? 'Pegá este snippet dentro de "mcpServers":'
            : 'Paste this snippet inside "mcpServers":'
        }
      >
        <CodeBlock code={snippet} ariaLabel={`${name} MCP manifest`} />
      </Step>

      <Step
        number="03"
        title={isEs ? "Reiniciá Claude Desktop." : "Restart Claude Desktop."}
        last
      >
        <p className="text-[12.5px] text-[var(--color-fg-muted)]">
          {isEs
            ? "El connector aparece en la barra de tools de Claude apenas reinicia."
            : "The connector shows up in Claude's tools bar as soon as it restarts."}
        </p>
      </Step>

      {hasSecrets && (
        <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
          <div className="flex items-start gap-3">
            <ShieldAlert size={15} strokeWidth={2.2} className="text-amber-500 mt-0.5 shrink-0" />
            <div className="text-[12.5px] leading-relaxed">
              <p className="font-semibold text-[var(--color-fg-strong)]">
                {isEs
                  ? "Las API keys quedan en plaintext."
                  : "API keys live in plaintext."}
              </p>
              <p className="mt-0.5 text-[var(--color-fg-muted)]">
                {isEs
                  ? "Reemplazá los placeholders ${SECRET:...} con tus keys reales en el archivo. TerminalSync las guarda cifradas en el Keychain del sistema."
                  : "Replace the ${SECRET:...} placeholders with your real keys in the file. TerminalSync keeps them encrypted in the system Keychain."}
              </p>
            </div>
          </div>
        </div>
      )}

      <ManualFootnote>
        {isEs
          ? `Sin sync. Tenés que repetir estos pasos en cada máquina donde quieras "${name}".`
          : `No sync. You'll need to repeat these steps on every machine where you want "${name}".`}
      </ManualFootnote>
    </ManualWrapper>
  );
}

/* ───────── Shared building blocks ──────────────────────────────────────── */

function ManualWrapper({
  isEs,
  children,
}: {
  isEs: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)]/60 p-6 md:p-7">
      <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--color-fg-muted)] font-semibold">
        <Terminal size={11} strokeWidth={2.4} />
        <span>{isEs ? "Manual" : "Manual"}</span>
      </div>
      <h3 className="mt-3 text-[18px] md:text-[20px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
        {isEs ? "Tres pasos, sin la app" : "Three steps, without the app"}
      </h3>
      <ol className="mt-6 space-y-6">{children}</ol>
    </div>
  );
}

function Step({
  number,
  title,
  children,
  last,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <li className="relative flex gap-4">
      <div className="relative shrink-0">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-accent)]">
          {number}
        </span>
        {!last && (
          <span
            aria-hidden
            className="absolute left-[5px] top-5 bottom-[-26px] w-px bg-[var(--color-border)]"
          />
        )}
      </div>
      <div className="flex-1 min-w-0 pt-[-2px]">
        <p className="text-[13.5px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
          {title}
        </p>
        <div className="mt-2.5">{children}</div>
      </div>
    </li>
  );
}

function PathBlock({ path }: { path: string }) {
  return (
    <code className="block rounded-lg bg-[var(--color-panel-2)] border border-[var(--color-border)] px-3 py-2 text-[12px] font-mono text-[var(--color-fg-muted)] break-all">
      {path}
    </code>
  );
}

function CodeBlock({ code, ariaLabel }: { code: string; ariaLabel: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can fail in some sandboxed contexts; user falls back to manual select.
    }
  }

  return (
    <div className="relative group rounded-xl border border-[var(--color-border)] bg-[#0b0b0d] overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-[var(--color-border)]/60 bg-black/30">
        <span className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-[var(--color-fg-dim)]">
          json
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Copied" : `Copy ${ariaLabel}`}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] hover:bg-white/5 transition-colors"
        >
          {copied ? (
            <>
              <Check size={11} strokeWidth={2.4} className="text-[var(--color-ok)]" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy size={11} strokeWidth={2.2} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-[12.5px] leading-[1.55] font-mono text-[#d6d6d8]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function ManualFootnote({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-6 pt-4 border-t border-[var(--color-border)]/50 text-[11.5px] text-[var(--color-fg-dim)]">
      {children}
    </p>
  );
}
