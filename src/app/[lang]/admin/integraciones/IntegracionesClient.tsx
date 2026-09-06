"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Loader2,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
} from "lucide-react";
import { authedFetch, getSupabaseBrowser } from "@/lib/supabase/browser";

type AuthState = "checking" | "anon" | "ready" | "forbidden";

interface RunStatus {
  status: string;
  conclusion: string | null;
  html_url: string;
  created_at: string;
}

interface LastLoopRun {
  id: string;
  ran_at: string;
  kind: string | null;
  pr_url: string | null;
}

interface SetupError {
  code: "github_workflow_unavailable";
  message: string;
  tokenSource: string;
  workflow: string;
  repo: string;
  ref: string;
}

interface LoopStatus {
  id: string;
  kind: string;
  title: { es: string; en: string };
  description: { es: string; en: string };
  repo: string;
  workflow: string | null;
  ref: string;
  acceptsFocus?: boolean;
  acceptsDryRun?: boolean;
  disabledReason?: { es: string; en: string };
  run: RunStatus | null;
  lastLoopRun: LastLoopRun | null;
  workflowMissing?: boolean;
  setupError?: SetupError;
}

interface StatusResp {
  loops?: LoopStatus[];
  run?: RunStatus | null;
  lastLoopRun?: LastLoopRun | null;
  workflowMissing?: boolean;
  setupError?: SetupError;
}

const POLL_MS = 5000;

export function IntegracionesClient({ lang }: { lang: string }) {
  const isEs = lang !== "en";

  const [auth, setAuth] = useState<AuthState>("checking");
  const [loops, setLoops] = useState<LoopStatus[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dispatching, setDispatching] = useState<string | null>(null);
  const [dispatchError, setDispatchError] = useState<Record<string, string>>(
    {},
  );
  const [watching, setWatching] = useState(false);
  const [focusByLoop, setFocusByLoop] = useState<Record<string, string>>({});
  const [dryRunByLoop, setDryRunByLoop] = useState<Record<string, boolean>>({});

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      const res = await authedFetch("/api/admin/integraciones/run");
      if (res.status === 401) {
        setAuth("anon");
        return;
      }
      if (res.status === 403) {
        setAuth("forbidden");
        return;
      }
      const json = (await res.json()) as StatusResp & { error?: string };
      if (!res.ok) throw new Error(json.error ?? `API ${res.status}`);
      if (Array.isArray(json.loops)) {
        setLoops(json.loops);
      } else if (json.run !== undefined) {
        // Backward-compatible fallback for older API shape.
        setLoops([
          {
            id: "app-connector-parity",
            kind: "supervision",
            title: {
              es: "Supervisión app: Conectores 4 IAs",
              en: "App supervision: 4-AI connectors",
            },
            description: {
              es: "Corre connector-loop.yml en terminal-sync.",
              en: "Runs connector-loop.yml in terminal-sync.",
            },
            repo: "terminal-sync",
            workflow: "connector-loop.yml",
            ref: "release/v0.2.18-lab",
            run: json.run ?? null,
            lastLoopRun: json.lastLoopRun ?? null,
            workflowMissing: json.workflowMissing,
            setupError: json.setupError,
          },
        ]);
      }
      setLoadError(null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    const sb = getSupabaseBrowser();
    if (!sb) {
      setAuth("anon");
      return;
    }
    sb.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setAuth("anon");
      } else {
        setAuth("ready");
        void loadStatus();
      }
    });
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setAuth("anon");
        setLoops([]);
      } else {
        setAuth("ready");
        void loadStatus();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [loadStatus]);

  useEffect(() => {
    const running = loops.some(
      (loop) =>
        loop.run?.status === "queued" || loop.run?.status === "in_progress",
    );
    if (auth !== "ready" || (!running && !watching)) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }
    pollRef.current = setInterval(() => void loadStatus(), POLL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [auth, loops, watching, loadStatus]);

  useEffect(() => {
    if (watching && loops.some((loop) => loop.run?.status === "completed"))
      setWatching(false);
  }, [watching, loops]);

  async function runNow(loop: LoopStatus) {
    setDispatching(loop.id);
    setDispatchError((prev) => ({ ...prev, [loop.id]: "" }));
    try {
      const res = await authedFetch("/api/admin/integraciones/run", {
        method: "POST",
        body: JSON.stringify({
          loopId: loop.id,
          focus: focusByLoop[loop.id] ?? "",
          dryRun: dryRunByLoop[loop.id] === true,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `API ${res.status}`);
      setWatching(true);
      setTimeout(() => void loadStatus(), 3000);
    } catch (e) {
      setDispatchError((prev) => ({
        ...prev,
        [loop.id]: e instanceof Error ? e.message : String(e),
      }));
    } finally {
      setDispatching(null);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <section className="mx-auto max-w-5xl px-5 py-10 md:px-6">
        <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-fg-muted)]">
          Admin
        </p>
        <h1 className="mt-2 text-[26px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
          {isEs ? "Integraciones" : "Integrations"}
        </h1>
        <p className="mt-1 text-[13px] text-[var(--color-fg-muted)]">
          {isEs
            ? "Centro para correr loops de Conectores, Plugins, Skills, Kits y Herramientas CLI, y supervisar que lleguen bien a la app."
            : "Control center for Connector, Plugin, Skill, Kit and CLI tool loops, and for supervising app delivery."}
        </p>

        {auth === "checking" ? (
          <Banner tone="muted">
            {isEs ? "Verificando sesión…" : "Checking session…"}
          </Banner>
        ) : null}

        {auth === "anon" ? (
          <Banner tone="warn">
            {isEs
              ? "Tenés que estar logueado como admin para ver este panel."
              : "You need to be signed in as admin to see this panel."}{" "}
            <a
              className="underline"
              href={`/${lang}/login?next=${encodeURIComponent(`/${lang}/admin/integraciones`)}`}
            >
              {isEs ? "Entrar →" : "Sign in →"}
            </a>
          </Banner>
        ) : null}

        {auth === "forbidden" ? (
          <Banner tone="warn">
            {isEs
              ? "Tu cuenta está logueada, pero no está en ADMIN_EMAILS."
              : "You're signed in, but your account isn't in ADMIN_EMAILS."}
          </Banner>
        ) : null}

        {auth === "ready" ? (
          <div className="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)]/60 p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-[16px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
                  {isEs ? "Loops de integraciones" : "Integration loops"}
                </h2>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--color-fg-muted)]">
                  {isEs
                    ? "Corré cada loop desde acá. Los loops de curación abren PRs draft; nada se publica solo."
                    : "Run each loop from here. Curation loops open draft PRs; nothing publishes itself."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void loadStatus()}
                className="rounded-xl border border-[var(--color-border)] px-4 py-2 text-[12.5px] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
              >
                {isEs ? "Refrescar" : "Refresh"}
              </button>
            </div>

            {loadError ? (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-[13px] text-red-400">
                {loadError}
              </div>
            ) : null}

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {loops.map((loop) => (
                <LoopCard
                  key={loop.id}
                  loop={loop}
                  isEs={isEs}
                  focus={focusByLoop[loop.id] ?? ""}
                  dryRun={dryRunByLoop[loop.id] === true}
                  dispatching={dispatching === loop.id}
                  dispatchError={dispatchError[loop.id] || null}
                  onFocus={(value) =>
                    setFocusByLoop((prev) => ({ ...prev, [loop.id]: value }))
                  }
                  onDryRun={(value) =>
                    setDryRunByLoop((prev) => ({ ...prev, [loop.id]: value }))
                  }
                  onRun={() => void runNow(loop)}
                />
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function LoopCard({
  loop,
  isEs,
  focus,
  dryRun,
  dispatching,
  dispatchError,
  onFocus,
  onDryRun,
  onRun,
}: {
  loop: LoopStatus;
  isEs: boolean;
  focus: string;
  dryRun: boolean;
  dispatching: boolean;
  dispatchError: string | null;
  onFocus: (value: string) => void;
  onDryRun: (value: boolean) => void;
  onRun: () => void;
}) {
  const lang = isEs ? "es" : "en";
  const disabled = Boolean(loop.disabledReason) || !loop.workflow;
  return (
    <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]/35 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[14px] font-semibold text-[var(--color-fg-strong)]">
            {loop.title[lang]}
          </h3>
          <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--color-fg-muted)]">
            {loop.description[lang]}
          </p>
        </div>
        <RunBadge run={loop.run} disabled={disabled} isEs={isEs} />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2 text-[11.5px] text-[var(--color-fg-dim)]">
        <div>
          <dt className="font-mono uppercase">Repo</dt>
          <dd>{loop.repo}</dd>
        </div>
        <div>
          <dt className="font-mono uppercase">Workflow</dt>
          <dd>{loop.workflow ?? (isEs ? "pendiente" : "pending")}</dd>
        </div>
      </dl>

      {loop.acceptsFocus ? (
        <label className="mt-3 block text-[12px] text-[var(--color-fg-muted)]">
          {isEs ? "Foco opcional" : "Optional focus"}
          <input
            value={focus}
            onChange={(e) => onFocus(e.target.value)}
            placeholder={
              isEs ? "ej: asana, docx, ventas" : "e.g. asana, docx, sales"
            }
            className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-transparent px-3 py-2 text-[13px] text-[var(--color-fg)] outline-none"
          />
        </label>
      ) : null}

      {loop.acceptsDryRun ? (
        <label className="mt-3 flex items-center gap-2 text-[12px] text-[var(--color-fg-muted)]">
          <input
            type="checkbox"
            checked={dryRun}
            onChange={(e) => onDryRun(e.target.checked)}
          />
          {isEs
            ? "Dry run: investigar sin abrir PR ni registrar run"
            : "Dry run: investigate without opening PR or recording run"}
        </label>
      ) : null}

      {loop.disabledReason ? (
        <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-[12.5px] text-amber-300">
          {loop.disabledReason[lang]}
        </div>
      ) : null}

      {loop.setupError ? (
        <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-[12.5px] text-amber-300">
          {loop.setupError.message}
        </div>
      ) : null}

      {dispatchError ? (
        <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-[12.5px] text-red-400">
          {dispatchError}
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-3">
        <div className="text-[12px] text-[var(--color-fg-muted)]">
          {loop.run ? (
            <>
              {new Date(loop.run.created_at).toLocaleString(
                isEs ? "es-CO" : "en-US",
                { dateStyle: "medium", timeStyle: "short" },
              )}
              {" · "}
              <a
                href={loop.run.html_url}
                target="_blank"
                rel="noreferrer"
                className="text-[var(--color-accent)] underline-offset-4 hover:underline"
              >
                {isEs ? "Ver run" : "View run"}
              </a>
            </>
          ) : isEs ? (
            "Sin corridas registradas"
          ) : (
            "No runs recorded"
          )}
        </div>
        <button
          type="button"
          onClick={onRun}
          disabled={dispatching || disabled}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-45"
        >
          {dispatching ? (
            <Loader2 size={14} className="animate-spin" />
          ) : disabled ? (
            <Ban size={14} />
          ) : (
            <PlayCircle size={14} />
          )}
          {dispatching
            ? isEs
              ? "Disparando…"
              : "Dispatching…"
            : isEs
              ? "Correr"
              : "Run"}
        </button>
      </div>
    </article>
  );
}

function RunBadge({
  run,
  disabled,
  isEs,
}: {
  run: RunStatus | null;
  disabled?: boolean;
  isEs: boolean;
}) {
  if (disabled) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/5 px-3 py-1.5 text-[12.5px] text-amber-300">
        <Ban size={13} />
        {isEs ? "Pendiente" : "Pending"}
      </span>
    );
  }
  if (!run) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-[12.5px] text-[var(--color-fg-muted)]">
        <Clock size={13} />
        {isEs ? "Sin corridas" : "No runs"}
      </span>
    );
  }
  if (run.status === "queued" || run.status === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-[12.5px] font-medium text-amber-400">
        <Loader2 size={13} className="animate-spin" />
        {isEs ? "Corriendo…" : "Running…"}
      </span>
    );
  }
  if (run.status === "completed" && run.conclusion === "success") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-[12.5px] font-medium text-emerald-400">
        <CheckCircle2 size={13} />
        {isEs ? "Pasó" : "Passed"}
      </span>
    );
  }
  if (run.status === "completed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-[12.5px] font-medium text-red-400">
        <XCircle size={13} />
        {isEs ? "Falló" : "Failed"}{" "}
        {run.conclusion ? `(${run.conclusion})` : ""}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--color-border)] px-3 py-1.5 text-[12.5px] text-[var(--color-fg-muted)]">
      {run.status}
    </span>
  );
}

function Banner({
  tone,
  children,
}: {
  tone: "muted" | "warn";
  children: ReactNode;
}) {
  const cls =
    tone === "warn"
      ? "border-amber-500/30 bg-amber-500/5 text-amber-300"
      : "border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-fg-muted)]";
  return (
    <div className={`mt-6 rounded-xl border px-4 py-3 text-[13px] ${cls}`}>
      {children}
    </div>
  );
}
