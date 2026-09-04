"use client";

import { useCallback, useEffect, useState } from "react";
import { authedFetch } from "@/lib/supabase/browser";
import type { CorrectionRow } from "@/lib/soporte/types";

type AuthState = "checking" | "anon" | "forbidden" | "ready";

const STATUS_META: Record<CorrectionRow["status"], { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "#eab308" },
  pr_opened: { label: "PR abierto", color: "#25d366" },
  error: { label: "Error", color: "#ef4444" },
};

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("es-AR", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

/**
 * Ops/test surface for S3 (the "Corregir" loop) — lists rows from
 * `support_corrections` via GET /api/admin/soporte/corrections so JM (or
 * whoever's testing the flow) can see a correction actually turned into a
 * PR without going to GitHub. Not where corrections get CREATED — that's
 * `<CorreccionButton>`, mounted from wherever a conversation thread is
 * rendered (S2's `/admin/soporte`).
 */
export default function CorreccionesQueue({ lang }: { lang: string }) {
  const [auth, setAuth] = useState<AuthState>("checking");
  const [items, setItems] = useState<CorrectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [setupNeeded, setSetupNeeded] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authedFetch("/api/admin/soporte/corrections", { cache: "no-store" } as RequestInit);
      if (res.status === 401) { setAuth("anon"); setLoading(false); return; }
      if (res.status === 403) { setAuth("forbidden"); setLoading(false); return; }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setItems(Array.isArray(json.items) ? (json.items as CorrectionRow[]) : []);
      setSetupNeeded(Boolean(json.setupNeeded));
      setAuth("ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const watchdog = window.setTimeout(() => {
      setAuth((current) => (current === "checking" ? "anon" : current));
      setLoading(false);
    }, 3_000);
    void fetchItems().finally(() => window.clearTimeout(watchdog));
    return () => window.clearTimeout(watchdog);
  }, [fetchItems]);

  const path = `/${lang}/admin/soporte/correcciones`;
  const loginHref = `/${lang}/login?next=${encodeURIComponent(path)}`;

  if (auth === "checking") {
    return <StatusScreen text="Verificando sesión admin…" loginHref={loginHref} />;
  }
  if (auth === "anon") {
    return <StatusScreen text="Esta cola requiere sesión admin." loginHref={loginHref} />;
  }
  if (auth === "forbidden") {
    return (
      <div className="cq-wrap">
        <p className="cq-forbidden">Tu cuenta no tiene permisos de admin. Verificá que tu email esté en ADMIN_EMAILS.</p>
        <style>{cqStyles}</style>
      </div>
    );
  }

  return (
    <div className="cq-wrap">
      <div className="cq-hd">
        <h1>Correcciones del bot</h1>
        <div className="cq-sub">support_corrections · {items.length} en los últimos 50{loading ? " · cargando…" : ""}</div>
      </div>
      {setupNeeded && <div className="cq-warn">⚠ Supabase no está configurado en el servidor — no hay datos para mostrar.</div>}
      {error && <div className="cq-warn cq-error">⚠ {error}</div>}
      {!loading && items.length === 0 && !setupNeeded && (
        <div className="cq-empty">Todavía no se envió ninguna corrección desde el botón &quot;Corregir&quot;.</div>
      )}
      <div className="cq-list">
        {items.map((item) => {
          const meta = STATUS_META[item.status];
          return (
            <div key={item.id} className="cq-row">
              <div className="cq-row-hd">
                <span className="cq-pill" style={{ color: meta.color, borderColor: meta.color }}>{meta.label}</span>
                <span className="cq-date">{fmtDate(item.created_at)}</span>
              </div>
              <div className="cq-question">{item.question || "—"}</div>
              <div className="cq-corrected">{item.corrected_answer_es}</div>
              {item.status === "pr_opened" && item.pr_url && (
                <a href={item.pr_url} target="_blank" rel="noreferrer" className="cq-link">
                  Ver PR{item.pr_number ? ` #${item.pr_number}` : ""} ↗
                </a>
              )}
              {item.status === "error" && item.error_message && (
                <div className="cq-error-msg">{item.error_message}</div>
              )}
            </div>
          );
        })}
      </div>
      <style>{cqStyles}</style>
    </div>
  );
}

function StatusScreen({ text, loginHref }: { text: string; loginHref: string }) {
  return (
    <div style={{ padding: "48px 24px", fontFamily: "system-ui, sans-serif", color: "#000", background: "#fff", minHeight: "60vh" }}>
      <p style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{text}</p>
      <a href={loginHref} style={{ display: "inline-flex", marginTop: 14, background: "#fff", color: "#000", border: "1px solid #000", padding: "10px 14px", borderRadius: 10, fontWeight: 800, textDecoration: "none" }}>
        Iniciar sesión
      </a>
    </div>
  );
}

const cqStyles = `
  .cq-wrap{--bg:#0d1117;--panel:#161b22;--line:#2a3340;--ink:#e6edf3;--ink2:#8b98a8;--ink3:#5d6b7a;
    font-family:'Inter',system-ui,sans-serif;background:var(--bg);color:var(--ink);min-height:100vh;
    padding:24px 28px 60px;}
  .cq-wrap *{box-sizing:border-box;}
  .cq-hd{margin-bottom:18px;}
  .cq-hd h1{margin:0;font-size:20px;font-weight:700;}
  .cq-sub{color:var(--ink3);font-size:12px;font-family:'SF Mono',ui-monospace,monospace;margin-top:4px;}
  .cq-warn{background:#3a2f1c;color:#f0d9b3;border:1px solid #5a4a2a;border-radius:8px;padding:10px 14px;
    font-size:12.5px;margin-bottom:16px;}
  .cq-error{background:#3a1c1c;color:#f0b3b3;border-color:#5a2a2a;}
  .cq-empty{color:var(--ink3);font-family:'SF Mono',ui-monospace,monospace;font-size:13px;padding:40px 0;text-align:center;}
  .cq-forbidden{padding:48px 24px;font-family:monospace;color:#f0b3b3;}
  .cq-list{display:flex;flex-direction:column;gap:12px;max-width:760px;}
  .cq-row{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:14px 16px;}
  .cq-row-hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;}
  .cq-pill{font-family:'SF Mono',ui-monospace,monospace;font-size:10.5px;font-weight:700;padding:3px 9px;
    border:1px solid;border-radius:20px;text-transform:uppercase;letter-spacing:.04em;}
  .cq-date{color:var(--ink3);font-family:'SF Mono',ui-monospace,monospace;font-size:11px;}
  .cq-question{font-size:13px;color:var(--ink2);margin-bottom:6px;}
  .cq-corrected{font-size:13.5px;color:var(--ink);line-height:1.5;white-space:pre-wrap;}
  .cq-link{display:inline-block;margin-top:8px;color:#25d366;text-decoration:none;font-size:12.5px;font-weight:600;}
  .cq-link:hover{text-decoration:underline;}
  .cq-error-msg{margin-top:8px;color:#f0b3b3;font-family:'SF Mono',ui-monospace,monospace;font-size:11.5px;}
`;
