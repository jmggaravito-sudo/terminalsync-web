import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  fetchOpsReports,
  type OpsReport,
  type OpsReportRun,
} from "@/lib/ops/reports";

// Live view — always fetch fresh snapshots + run status on request.
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === "es" ? "Admin · Reportes" : "Admin · Reports",
    robots: { index: false },
  };
}

export default async function OpsReportsPage({ params }: Props) {
  const { lang } = await params;
  const isEs = lang === "es";
  const { configured, reports } = await fetchOpsReports(lang);

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <section className="mx-auto max-w-4xl px-4 sm:px-6 pt-12 sm:pt-16 pb-16">
        <a
          href={`/${lang}/admin/ops`}
          className="text-[12px] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
        >
          ← {isEs ? "Dashboard de flujos" : "Flows dashboard"}
        </a>
        <h1 className="mt-3 text-[26px] sm:text-[32px] font-semibold tracking-tight">
          {isEs ? "Reportes de los flujos" : "Flow reports"}
        </h1>
        <p className="mt-2 text-[14px] text-[var(--color-fg-muted)]">
          {isEs
            ? "Los 4 pipelines de analytics corren solos (cron diario) y publican un resumen agregado. Acá ves el último resultado de cada uno y si la corrida salió bien."
            : "The 4 analytics pipelines run on a daily cron and publish an aggregate summary. Here's each one's latest result and whether the run succeeded."}
        </p>

        {!configured ? (
          <SetupNotice isEs={isEs} />
        ) : (
          <div className="mt-8 space-y-6">
            {reports.map((r) => (
              <ReportCard key={r.slug} report={r} isEs={isEs} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function SetupNotice({ isEs }: { isEs: boolean }) {
  return (
    <div className="mt-8 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 text-[13.5px] text-amber-900 dark:text-amber-200">
      <p className="font-semibold">
        {isEs ? "Falta configurar el acceso" : "Access not configured yet"}
      </p>
      <p className="mt-1.5 leading-relaxed">
        {isEs
          ? "Para leer los reportes hay que setear la variable de entorno "
          : "To read the reports, set the environment variable "}
        <code className="rounded bg-[var(--color-panel-2)]/70 px-1.5 py-0.5 font-mono text-[12px]">
          OPS_GITHUB_TOKEN
        </code>
        {isEs
          ? " en Vercel — un token de GitHub de alcance fino con permiso de lectura (Contents + Actions) sobre el repo terminal-sync. Sin eso, esta página no puede traer los snapshots."
          : " in Vercel — a fine-grained GitHub token with read access (Contents + Actions) to the terminal-sync repo. Without it, this page can't fetch the snapshots."}
      </p>
    </div>
  );
}

function ReportCard({ report, isEs }: { report: OpsReport; isEs: boolean }) {
  return (
    <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h2 className="text-[18px] font-semibold tracking-tight flex items-center gap-2">
            <span className="text-[22px]">{report.emoji}</span>
            {report.title}
          </h2>
          <p className="mt-1 text-[12.5px] text-[var(--color-fg-muted)] leading-relaxed">
            {report.blurb}
          </p>
        </div>
        <RunChip run={report.run} isEs={isEs} />
      </header>

      <div className="mt-4 border-t border-[var(--color-border)] pt-4">
        {report.markdown ? (
          <div className="text-[13px] leading-relaxed">
            {renderMarkdown(report.markdown)}
          </div>
        ) : (
          <p className="text-[12.5px] text-[var(--color-fg-dim)] italic">
            {report.error
              ? `${isEs ? "No se pudo leer el reporte" : "Couldn't read the report"}: ${report.error}`
              : isEs
                ? "Sin datos todavía."
                : "No data yet."}
          </p>
        )}
      </div>
    </article>
  );
}

function RunChip({ run, isEs }: { run: OpsReportRun | null; isEs: boolean }) {
  if (!run) {
    return (
      <span className="shrink-0 rounded-full border border-[var(--color-border)] bg-[var(--color-panel-2)]/60 px-2.5 py-1 text-[11px] font-mono text-[var(--color-fg-dim)]">
        {isEs ? "sin corridas" : "no runs"}
      </span>
    );
  }
  const completed = run.status === "completed";
  const ok = run.conclusion === "success";
  const tone = !completed
    ? "border-amber-500/40 bg-amber-500/12 text-amber-400"
    : ok
      ? "border-emerald-500/40 bg-emerald-500/12 text-emerald-400"
      : "border-red-500/40 bg-red-500/12 text-red-400";
  const label = !completed
    ? isEs
      ? "corriendo"
      : "running"
    : ok
      ? "OK"
      : (run.conclusion ?? (isEs ? "falló" : "failed"));
  return (
    <a
      href={run.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-mono ${tone} hover:opacity-80 transition-opacity`}
      title={new Date(run.createdAt).toLocaleString(isEs ? "es-CO" : "en-US")}
    >
      <span>{!completed ? "●" : ok ? "✓" : "✗"}</span>
      <span>
        {label} · {timeAgo(run.createdAt, isEs)}
      </span>
    </a>
  );
}

function timeAgo(iso: string, isEs: boolean): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.round(ms / 60_000);
  if (m < 1) return isEs ? "ahora" : "just now";
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${isEs ? "hace " : ""}${h}h`;
  const d = Math.round(h / 24);
  return `${isEs ? "hace " : ""}${d}d`;
}

/* ------------------------------------------------------------------ *
 * Minimal markdown renderer for OUR generated report files.
 * Handles exactly what the snapshots contain: HTML comment header,
 * `#`/`##`/`###` headings, GFM tables, `**bold**` / `_italic_` /
 * `[text](url)` inline, and plain paragraphs. Input is trusted
 * (our own workflow output), but all text still goes through React's
 * escaping — no dangerouslySetInnerHTML.
 * ------------------------------------------------------------------ */

function renderMarkdown(md: string): ReactNode {
  const lines = md.split("\n");
  const out: ReactNode[] = [];
  let key = 0;
  let inComment = false;
  let para: string[] = [];

  const flushPara = () => {
    if (para.length === 0) return;
    out.push(
      <p key={`p${key++}`} className="my-2 text-[var(--color-fg-muted)]">
        {inline(para.join(" "))}
      </p>,
    );
    para = [];
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();

    if (inComment) {
      if (line.includes("-->")) inComment = false;
      i++;
      continue;
    }
    if (line.startsWith("<!--")) {
      if (!line.includes("-->")) inComment = true;
      i++;
      continue;
    }
    if (line === "") {
      flushPara();
      i++;
      continue;
    }
    if (line.startsWith("|")) {
      flushPara();
      const rows: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(lines[i].trim());
        i++;
      }
      out.push(renderTable(rows, key++));
      continue;
    }
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      flushPara();
      out.push(renderHeading(heading[1].length, heading[2], key++));
      i++;
      continue;
    }
    para.push(line);
    i++;
  }
  flushPara();
  return <>{out}</>;
}

function renderHeading(level: number, text: string, key: number): ReactNode {
  // Page owns the h1; report headings start at h2.
  const cls =
    level <= 2
      ? "mt-5 mb-2 text-[15px] font-semibold text-[var(--color-fg-strong)]"
      : "mt-4 mb-1.5 text-[13.5px] font-semibold text-[var(--color-fg)]";
  const content = inline(text);
  if (level <= 2) return <h3 key={`h${key}`} className={cls}>{content}</h3>;
  return <h4 key={`h${key}`} className={cls}>{content}</h4>;
}

function splitCells(row: string): string[] {
  return row
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

function isSeparatorRow(row: string): boolean {
  const cells = splitCells(row);
  return cells.length > 0 && cells.every((c) => /^:?-+:?$/.test(c));
}

function isNumericCell(text: string): boolean {
  return /^[\d.,%+\-\s]+$/.test(text) && /\d/.test(text);
}

function renderTable(rows: string[], key: number): ReactNode {
  if (rows.length === 0) return null;
  const header = splitCells(rows[0]);
  const bodyRows = rows.slice(1).filter((r) => !isSeparatorRow(r));
  return (
    <div key={`t${key}`} className="my-3 overflow-x-auto">
      <table className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-[11px] font-mono uppercase tracking-[0.08em] text-[var(--color-fg-muted)]">
            {header.map((c, ci) => (
              <th
                key={ci}
                className={`px-2.5 py-1.5 font-medium ${isNumericCell(c) ? "text-right" : "text-left"}`}
              >
                {inline(c)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row, ri) => {
            const cells = splitCells(row);
            return (
              <tr
                key={ri}
                className="border-b border-[var(--color-border)]/60 last:border-0"
              >
                {cells.map((c, ci) => (
                  <td
                    key={ci}
                    className={`px-2.5 py-1.5 ${isNumericCell(c) ? "text-right font-mono text-[var(--color-fg-strong)]" : "text-[var(--color-fg)]"}`}
                  >
                    {inline(c)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Inline formatting: **bold**, _italic_, [text](url). React escapes text. */
function inline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)|_(.+?)_/g;
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      nodes.push(
        <strong key={`b${key++}`} className="text-[var(--color-fg-strong)] font-semibold">
          {m[1]}
        </strong>,
      );
    } else if (m[2] !== undefined && m[3] !== undefined) {
      const href = m[3];
      const safe = href.startsWith("http://") || href.startsWith("https://");
      nodes.push(
        safe ? (
          <a
            key={`a${key++}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-accent)] underline-offset-2 hover:underline"
          >
            {m[2]}
          </a>
        ) : (
          m[2]
        ),
      );
    } else if (m[4] !== undefined) {
      nodes.push(
        <em key={`i${key++}`} className="text-[var(--color-fg-muted)]">
          {m[4]}
        </em>,
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}
