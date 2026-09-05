"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Loader2, PlayCircle, CheckCircle2, XCircle, Clock } from "lucide-react";
import { authedFetch, getSupabaseBrowser } from "@/lib/supabase/browser";

type AuthState = "checking" | "anon" | "ready" | "forbidden";

interface RunStatus {
  status: string; // queued | in_progress | completed | ...
  conclusion: string | null; // success | failure | cancelled | timed_out | null
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

interface StatusResp {
  run: RunStatus | null;
  lastLoopRun: LastLoopRun | null;
  workflowMissing?: boolean;
  setupError?: SetupError;
}

const POLL_MS = 5000;

export function IntegracionesClient({ lang }: { lang: string }) {
  const isEs = lang !== "en";

  const [auth, setAuth] = useState<AuthState>("checking");
  const [run, setRun] = useState<RunStatus | null>(null);
  const [lastLoopRun, setLastLoopRun] = useState<LastLoopRun | null>(null);
  const [workflowMissing, setWorkflowMissing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [setupError, setSetupError] = useState<SetupError | null>(null);
  const [dispatching, setDispatching] = useState(false);
  const [dispatchError, setDispatchError] = useState<string | null>(null);
  const [watching, setWatching] = useState(false);

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
      setRun(json.run ?? null);
      setLastLoopRun(json.lastLoopRun ?? null);
      setWorkflowMissing(Boolean(json.workflowMissing));
      setSetupError(json.setupError ?? null);
      setLoadError(null);
    } catch (e) {
      // Solo reportamos el error de status — NUNCA tocamos `auth` acá. La
      // sesión ya se resolvió (ver el useEffect de abajo); si este fetch
      // falla (ej. el workflow todavía no existe en release, o GitHub cae),
      // el panel se muestra igual con el error visible, en vez de quedarse
      // colgado en "Verificando sesión…".
      setLoadError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  // Login/session gate, same shape as LoopRunsClient — pero con una
  // diferencia clave: `auth` pasa a "ready" apenas confirmamos la sesión,
  // ANTES de esperar loadStatus(). Antes, loadStatus() solo ponía "ready"
  // en su propio try exitoso, así que un fallo (ej. 404 de GitHub porque
  // connector-loop.yml no existe todavía en release) dejaba `auth` colgado
  // en "checking" para siempre — y el loadError, que se renderiza adentro
  // del bloque auth==="ready", nunca llegaba a mostrarse. loadStatus sigue
  // pudiendo bajar a "anon"/"forbidden" según el status HTTP.
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
        setRun(null);
        setLastLoopRun(null);
        setSetupError(null);
      } else {
        setAuth("ready");
        void loadStatus();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [loadStatus]);

  // Poll while a run is in flight, or right after "Correr ahora" until the
  // new run shows up in the GitHub API (which can lag a few seconds behind
  // the dispatch call).
  useEffect(() => {
    const running = run?.status === "queued" || run?.status === "in_progress";
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
  }, [auth, run, watching, loadStatus]);

  // Stop "watching for the new run" once it actually completes.
  useEffect(() => {
    if (watching && run?.status === "completed") setWatching(false);
  }, [watching, run]);

  async function runNow() {
    setDispatching(true);
    setDispatchError(null);
    try {
      const res = await authedFetch("/api/admin/integraciones/run", {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `API ${res.status}`);
      setWatching(true);
      // GitHub Actions takes a beat to register a fresh dispatch as a run.
      setTimeout(() => void loadStatus(), 3000);
    } catch (e) {
      setDispatchError(e instanceof Error ? e.message : String(e));
    } finally {
      setDispatching(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <section className="mx-auto max-w-3xl px-5 md:px-6 py-10">
        <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-fg-muted)]">
          Admin
        </p>
        <h1 className="mt-2 text-[26px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
          {isEs ? "Integraciones" : "Integrations"}
        </h1>
        <p className="mt-1 text-[13px] text-[var(--color-fg-muted)]">
          {isEs
            ? "Supervisión de paridad de connectors entre las 4 IAs (Claude, Codex, Gemini, GLM)."
            : "Connector-parity supervision across the 4 AIs (Claude, Codex, Gemini, GLM)."}
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
            <h2 className="text-[16px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
              {isEs
                ? "Supervisión de integraciones (paridad 4 IAs)"
                : "Integration supervision (4-AI parity)"}
            </h2>
            <p className="mt-1.5 text-[13px] text-[var(--color-fg-muted)] leading-relaxed">
              {isEs
                ? "Corre el workflow connector-loop.yml en terminal-sync. Chequea que cada connector funcione igual en Claude, Codex, Gemini y GLM."
                : "Runs the connector-loop.yml workflow in terminal-sync. Checks that every connector works the same across Claude, Codex, Gemini and GLM."}
            </p>

            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={() => void runNow()}
                disabled={dispatching}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-[14px] font-semibold text-white disabled:opacity-50"
              >
                {dispatching ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <PlayCircle size={15} />
                )}
                {dispatching
                  ? isEs
                    ? "Disparando…"
                    : "Dispatching…"
                  : isEs
                    ? "Correr ahora"
                    : "Run now"}
              </button>
              <RunBadge run={run} isEs={isEs} />
            </div>

            {dispatchError ? (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-[13px] text-red-400">
                {dispatchError}
              </div>
            ) : null}

            {setupError ? (
              <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-[13px] text-amber-300">
                <p className="font-semibold">
                  {isEs ? "Configuración pendiente" : "Setup pending"}
                </p>
                <p className="mt-1 leading-relaxed">{setupError.message}</p>
              </div>
            ) : null}

            {loadError ? (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-[13px] text-red-400">
                {loadError}
              </div>
            ) : null}

            <div className="mt-6 border-t border-[var(--color-border)] pt-5">
              <p className="text-[12px] font-mono uppercase tracking-[0.12em] text-[var(--color-fg-muted)] mb-2">
                {isEs ? "Última corrida" : "Latest run"}
              </p>
              {run ? (
                <div className="text-[13px] text-[var(--color-fg)] space-y-1">
                  <p>
                    {isEs ? "Disparada:" : "Started:"}{" "}
                    {new Date(run.created_at).toLocaleString(isEs ? "es-CO" : "en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                  <a
                    href={run.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block text-[13px] font-medium text-[var(--color-accent)] underline-offset-4 hover:underline"
                  >
                    {isEs ? "Ver run →" : "View run →"}
                  </a>
                </div>
              ) : (
                <p className="text-[13px] text-[var(--color-fg-muted)]">
                  {workflowMissing
                    ? setupError
                      ? isEs
                        ? "No puedo leer la última corrida hasta corregir el token de GitHub del servidor."
                        : "Cannot read the latest run until the server GitHub token is fixed."
                      : isEs
                        ? "Todavía no se corrió — el workflow connector-loop.yml está pendiente de desplegar en release."
                        : "Not run yet — the connector-loop.yml workflow is pending deploy to release."
                    : isEs
                      ? "Todavía no hay corridas registradas."
                      : "No runs recorded yet."}
                </p>
              )}

              {lastLoopRun ? (
                <p className="mt-3 text-[11.5px] text-[var(--color-fg-dim)]">
                  {isEs
                    ? "Refuerzo del historial general (loop_runs): "
                    : "Reinforcement from the general run history (loop_runs): "}
                  {new Date(lastLoopRun.ran_at).toLocaleString(isEs ? "es-CO" : "en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                  {lastLoopRun.kind ? ` · ${lastLoopRun.kind}` : ""}
                  {lastLoopRun.pr_url ? (
                    <>
                      {" · "}
                      <a
                        href={lastLoopRun.pr_url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline-offset-4 hover:underline"
                      >
                        {isEs ? "ver" : "view"}
                      </a>
                    </>
                  ) : null}
                  {" — "}
                  <a
                    href={`/${lang}/admin/ops/loop-runs`}
                    className="underline-offset-4 hover:underline"
                  >
                    {isEs ? "ver historial completo" : "see full history"}
                  </a>
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function RunBadge({ run, isEs }: { run: RunStatus | null; isEs: boolean }) {
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
        {isEs ? "Falló" : "Failed"} {run.conclusion ? `(${run.conclusion})` : ""}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-[12.5px] text-[var(--color-fg-muted)]">
      {run.status}
    </span>
  );
}

function Banner({
  tone,
  children,
}: {
  tone: "muted" | "warn" | "error";
  children: ReactNode;
}) {
  const cls =
    tone === "error"
      ? "border-red-500/40 bg-red-500/10 text-red-800 dark:text-red-200"
      : tone === "warn"
        ? "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200"
        : "border-[var(--color-border)] bg-[var(--color-panel)]/60 text-[var(--color-fg-muted)]";
  return (
    <div className={`mt-6 rounded-2xl border p-5 text-[14px] ${cls}`}>
      {children}
    </div>
  );
}
