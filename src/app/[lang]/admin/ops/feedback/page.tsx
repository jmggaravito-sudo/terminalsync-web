import type { Metadata } from "next";
import Link from "next/link";

interface Props {
  params: Promise<{ lang: string }>;
}

interface FeedbackItem {
  id: string;
  table: string;
  title: string;
  body: string | null;
  email: string | null;
  name: string | null;
  status: string;
  priority: string | null;
  source: string | null;
  createdAt: string | null;
}

interface FeedbackResp {
  items: FeedbackItem[];
  table: string | null;
  checkedTables: string[];
  setupNeeded?: boolean;
  message?: string;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === "es" ? "Admin · Feedback" : "Admin · Feedback",
    robots: { index: false },
  };
}

async function loadFeedback(): Promise<FeedbackResp> {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  try {
    const res = await fetch(`${base}/api/admin/ops/feedback`, { cache: "no-store" });
    return (await res.json()) as FeedbackResp;
  } catch {
    return {
      items: [],
      table: null,
      checkedTables: [],
      setupNeeded: true,
      message: "No pude cargar el inbox de feedback.",
    };
  }
}

export default async function FeedbackInboxPage({ params }: Props) {
  const { lang } = await params;
  const isEs = lang === "es";
  const data = await loadFeedback();

  return (
    <main className="admin-ops-readable-buttons min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-12 sm:pt-16 pb-16">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[12px] font-mono uppercase tracking-[0.12em] text-[var(--color-fg-muted)]">
              TerminalSync Ops
            </p>
            <h1 className="mt-1 text-[26px] sm:text-[32px] font-semibold tracking-tight">
              {isEs ? "Inbox de feedback" : "Feedback inbox"}
            </h1>
            <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-[var(--color-fg-muted)]">
              {isEs
                ? "Aquí deberían caer sugerencias, bugs e ideas de usuarios para decidir si se convierten en tarea, mejora o venta."
                : "User suggestions, bugs and ideas should land here so you can decide whether they become tasks, improvements or sales angles."}
            </p>
          </div>
          <Link
            href={`/${lang}/admin/ops`}
            className="admin-ops-nav-button inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors"
          >
            ← {isEs ? "Volver a flujos" : "Back to flows"}
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Stat label={isEs ? "Feedbacks" : "Feedback"} value={data.items.length} />
          <Stat label={isEs ? "Tabla" : "Table"} value={data.table ?? "pendiente"} />
          <Stat label={isEs ? "Revisión" : "Review"} value={data.setupNeeded ? "falta setup" : "lista"} />
        </div>

        {data.setupNeeded ? (
          <section className="mt-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5">
            <h2 className="text-[16px] font-semibold text-amber-200">
              {isEs ? "Pendiente importante" : "Important pending item"}
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-amber-100/85">
              {data.message ??
                (isEs
                  ? "Todavía falta conectar el flujo de Feedback a una tabla legible por la landing."
                  : "The Feedback flow still needs to be connected to a landing-readable table.")}
            </p>
            <p className="mt-3 text-[12px] text-amber-100/70">
              {isEs ? "Tablas revisadas:" : "Checked tables:"} {data.checkedTables.join(", ") || "—"}
            </p>
          </section>
        ) : data.items.length === 0 ? (
          <section className="mt-6 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-panel)] p-8 text-center text-[var(--color-fg-muted)]">
            {isEs
              ? "Inbox conectado, pero todavía no hay sugerencias recientes."
              : "Inbox connected, but there are no recent suggestions yet."}
          </section>
        ) : (
          <ul className="mt-6 space-y-3">
            {data.items.map((item) => (
              <li key={item.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="text-[15px] font-semibold text-[var(--color-fg-strong)]">{item.title}</h2>
                    <p className="mt-1 text-[12px] text-[var(--color-fg-muted)]">
                      {[item.name, item.email, item.source].filter(Boolean).join(" · ") || (isEs ? "sin contacto" : "no contact")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-[10.5px] font-mono uppercase tracking-[0.08em]">
                    <span className="rounded-full bg-black px-2 py-0.5 text-white">{item.status}</span>
                    {item.priority && <span className="rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[var(--color-fg-muted)]">{item.priority}</span>}
                  </div>
                </div>
                {item.body && <p className="mt-3 text-[13px] leading-relaxed text-[var(--color-fg)]">{item.body}</p>}
                <p className="mt-3 text-[11px] text-[var(--color-fg-dim)]">
                  {item.createdAt ? new Date(item.createdAt).toLocaleString(isEs ? "es-CO" : "en-US") : "sin fecha"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
      <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-[var(--color-fg-muted)]">{label}</p>
      <p className="mt-1 text-[22px] font-semibold text-[var(--color-fg-strong)]">{value}</p>
    </div>
  );
}
