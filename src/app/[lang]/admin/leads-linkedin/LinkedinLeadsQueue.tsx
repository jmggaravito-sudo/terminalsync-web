"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  LINKEDIN_LEAD_STATUSES,
  COST_PER_LEAD_APIFY,
  COST_PER_LEAD_ANTHROPIC,
  type LinkedinLeadStatus,
  type LinkedinLead,
  type LinkedinSearchJob,
  type LinkedinSettings,
} from "@/lib/linkedinLeads/types";
import { authedFetch } from "@/lib/supabase/browser";

type AuthState = "checking" | "anon" | "forbidden" | "ready";
type Tab = "search" | "board" | "settings";

// ─────────────────────────────────────────────────────────────
// LEADS LINKEDIN — búsqueda de perfiles públicos vía Apify, análisis +
// redacción de mensaje de outreach vía Anthropic, tablero Kanban.
// Reemplaza al prototipo standalone lead-hunter/. Lee/escribe Supabase
// (linkedin_leads, linkedin_search_jobs, linkedin_settings) vía
// /api/leads-linkedin/*. Pipeline: nuevo → contactado → respondio →
// reunion_agendada.
// ─────────────────────────────────────────────────────────────

const STATUS_META: Record<LinkedinLeadStatus, { label: string }> = {
  nuevo: { label: "Nuevos Leads" },
  contactado: { label: "Contactados" },
  respondio: { label: "Respondieron" },
  reunion_agendada: { label: "Reunión Agendada" },
};

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
  "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
  "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
  "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
];

type Counts = Record<LinkedinLeadStatus, number>;
const EMPTY_COUNTS: Counts = { nuevo: 0, contactado: 0, respondio: 0, reunion_agendada: 0 };

export default function LinkedinLeadsQueue({ lang }: { lang: string }) {
  const [auth, setAuth] = useState<AuthState>("checking");
  const [tab, setTab] = useState<Tab>("board");

  // ── Kanban state ──
  const [leadsByStatus, setLeadsByStatus] = useState<Record<LinkedinLeadStatus, LinkedinLead[]>>({
    nuevo: [], contactado: [], respondio: [], reunion_agendada: [],
  });
  const [counts, setCounts] = useState<Counts>(EMPTY_COUNTS);
  const [boardLoading, setBoardLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [dragLeadId, setDragLeadId] = useState<string | null>(null);

  // ── Search state ──
  const [keyword, setKeyword] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [targetTitles, setTargetTitles] = useState<string[]>([]);
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [count, setCount] = useState(10);
  const [searching, setSearching] = useState(false);
  const [job, setJob] = useState<LinkedinSearchJob | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const searchStartedAt = useRef<number | null>(null);
  const pollRef = useRef<number | null>(null);

  // ── Settings state ──
  const [settings, setSettings] = useState<LinkedinSettings>({
    senderName: "", companyName: "", offerDescription: "", language: "es",
  });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const fetchBoard = useCallback(async () => {
    setBoardLoading(true);
    setError(null);
    try {
      const results = await Promise.all(
        LINKEDIN_LEAD_STATUSES.map(async (s) => {
          const res = await authedFetch(`/api/leads-linkedin?status=${s}&limit=100`, { cache: "no-store" } as RequestInit);
          if (res.status === 401) { setAuth("anon"); return { status: s, items: [] as LinkedinLead[], counts: EMPTY_COUNTS }; }
          if (res.status === 403) { setAuth("forbidden"); return { status: s, items: [] as LinkedinLead[], counts: EMPTY_COUNTS }; }
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
          return { status: s, items: (json.items ?? []) as LinkedinLead[], counts: json.counts as Counts };
        }),
      );
      const next: Record<LinkedinLeadStatus, LinkedinLead[]> = { nuevo: [], contactado: [], respondio: [], reunion_agendada: [] };
      let lastCounts = EMPTY_COUNTS;
      for (const r of results) {
        next[r.status] = r.items;
        lastCounts = r.counts;
      }
      setLeadsByStatus(next);
      setCounts(lastCounts);
      setAuth((a) => (a === "checking" ? "ready" : a));
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown error");
    } finally {
      setBoardLoading(false);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const res = await authedFetch("/api/leads-linkedin/settings", { cache: "no-store" } as RequestInit);
      if (res.status === 401) { setAuth("anon"); return; }
      if (res.status === 403) { setAuth("forbidden"); return; }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setSettings(json.settings);
      setAuth((a) => (a === "checking" ? "ready" : a));
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown error");
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    const watchdog = window.setTimeout(() => {
      setAuth((current) => (current === "checking" ? "anon" : current));
    }, 3_000);
    void fetchBoard();
    void fetchSettings();
    return () => window.clearTimeout(watchdog);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const estimatedCost = useMemo(() => count * (COST_PER_LEAD_APIFY + COST_PER_LEAD_ANTHROPIC), [count]);

  const addTitle = useCallback(() => {
    const t = titleInput.trim();
    if (t && !targetTitles.includes(t)) setTargetTitles((prev) => [...prev, t]);
    setTitleInput("");
  }, [titleInput, targetTitles]);

  const removeTitle = useCallback((t: string) => {
    setTargetTitles((prev) => prev.filter((x) => x !== t));
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  const pollJob = useCallback((jobId: string) => {
    stopPolling();
    pollRef.current = window.setInterval(async () => {
      try {
        const res = await authedFetch(`/api/leads-linkedin/search/${jobId}/status`, { cache: "no-store" } as RequestInit);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
        setJob(json.job);
        if (searchStartedAt.current) setElapsed(Math.round((Date.now() - searchStartedAt.current) / 1000));
        if (json.job.status !== "running") {
          stopPolling();
          setSearching(false);
          if (json.job.status === "done") void fetchBoard();
          if (json.job.status === "error") setSearchError(json.job.error || "Error desconocido");
        }
      } catch (e) {
        setSearchError(e instanceof Error ? e.message : "unknown error");
        stopPolling();
        setSearching(false);
      }
    }, 2000);
  }, [stopPolling, fetchBoard]);

  const runSearch = useCallback(async () => {
    if (searching) return;
    if (!keyword.trim() && targetTitles.length === 0) {
      setSearchError("Ingresá una palabra clave o al menos un cargo objetivo.");
      return;
    }
    setSearching(true);
    setSearchError(null);
    setJob(null);
    searchStartedAt.current = Date.now();
    setElapsed(0);
    try {
      // Fire the search; it may still be running server-side when this
      // request eventually resolves (or times out client-side) — the
      // status poll below is the source of truth either way.
      const searchPromise = authedFetch("/api/leads-linkedin/search", {
        method: "POST",
        body: JSON.stringify({ keyword: keyword.trim(), targetTitles, state: state || undefined, city: city || undefined, count }),
      });
      searchPromise
        .then(async (res) => {
          const json = await res.json().catch(() => ({}));
          if (json.jobId) pollJob(json.jobId);
          if (!res.ok && !json.jobId) {
            setSearchError(json.error || `HTTP ${res.status}`);
            setSearching(false);
          }
        })
        .catch((e) => {
          setSearchError(e instanceof Error ? e.message : "unknown error");
          setSearching(false);
        });
    } catch (e) {
      setSearchError(e instanceof Error ? e.message : "unknown error");
      setSearching(false);
    }
  }, [searching, keyword, targetTitles, state, city, count, pollJob]);

  const moveLead = useCallback(
    async (lead: LinkedinLead, next: LinkedinLeadStatus) => {
      if (lead.status === next) return;
      try {
        const res = await authedFetch(`/api/leads-linkedin/${lead.id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: next }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
        await fetchBoard();
      } catch (e) {
        setError(`No se pudo mover el lead: ${e instanceof Error ? e.message : "unknown error"}`);
      }
    },
    [fetchBoard],
  );

  const saveNotes = useCallback(
    async (lead: LinkedinLead) => {
      const notes = notesDraft[lead.id] ?? lead.notes ?? "";
      try {
        const res = await authedFetch(`/api/leads-linkedin/${lead.id}`, {
          method: "PATCH",
          body: JSON.stringify({ notes }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      } catch (e) {
        setError(`No se pudo guardar la nota: ${e instanceof Error ? e.message : "unknown error"}`);
      }
    },
    [notesDraft],
  );

  const regenerate = useCallback(
    async (lead: LinkedinLead) => {
      setRegeneratingId(lead.id);
      try {
        const res = await authedFetch(`/api/leads-linkedin/${lead.id}/regenerate`, { method: "POST" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
        await fetchBoard();
      } catch (e) {
        setError(`No se pudo regenerar: ${e instanceof Error ? e.message : "unknown error"}`);
      } finally {
        setRegeneratingId(null);
      }
    },
    [fetchBoard],
  );

  const copyMessage = useCallback(async (lead: LinkedinLead) => {
    const text = lead.drafted_message ?? "";
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    }
    setCopiedId(lead.id);
    setTimeout(() => setCopiedId(null), 1400);
  }, []);

  const saveSettings = useCallback(async () => {
    setSettingsSaving(true);
    setSettingsSaved(false);
    try {
      const res = await authedFetch("/api/leads-linkedin/settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setSettings(json.settings);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 1800);
    } catch (e) {
      setError(`No se pudo guardar la config: ${e instanceof Error ? e.message : "unknown error"}`);
    } finally {
      setSettingsSaving(false);
    }
  }, [settings]);

  const totalLeads = useMemo(() => LINKEDIN_LEAD_STATUSES.reduce((acc, s) => acc + (counts[s] || 0), 0), [counts]);
  const path = `/${lang}/admin/leads-linkedin`;
  const loginHref = `/${lang}/login?next=${encodeURIComponent(path)}`;

  if (auth === "checking") {
    return (
      <div style={{ padding: "48px 24px", fontFamily: "system-ui, sans-serif", color: "#000", background: "#fff", minHeight: "60vh" }}>
        <p style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Verificando sesión admin…</p>
        <a href={loginHref} style={{ display: "inline-flex", marginTop: 14, background: "#fff", color: "#000", border: "1px solid #000", padding: "10px 14px", borderRadius: 10, fontWeight: 800, textDecoration: "none" }}>
          Iniciar sesión y abrir cola
        </a>
      </div>
    );
  }
  if (auth === "anon") {
    return (
      <div style={{ padding: "48px 24px", fontFamily: "system-ui, sans-serif", color: "#000", background: "#fff", minHeight: "60vh" }}>
        <p style={{ fontSize: 18, fontWeight: 800 }}>Esta cola requiere sesión admin.</p>
        <p style={{ marginTop: 16 }}>
          <a href={loginHref} style={{ display: "inline-flex", background: "#fff", color: "#000", border: "1px solid #000", padding: "10px 14px", borderRadius: 10, fontWeight: 800, textDecoration: "none" }}>
            Iniciar sesión y abrir cola
          </a>
        </p>
      </div>
    );
  }
  if (auth === "forbidden") {
    return (
      <div style={{ padding: "48px 24px", fontFamily: "monospace", color: "#f0b3b3" }}>
        Tu cuenta no tiene permisos de admin. Verificá que tu email esté en ADMIN_EMAILS.
      </div>
    );
  }

  return (
    <div className="ll">
      <style>{`
        .ll{--bg:#0d1117;--panel:#161b22;--panel2:#1c232c;--line:#2a3340;--ink:#e6edf3;--ink2:#8b98a8;--ink3:#5d6b7a;
          --acc:#0a66c2;--acc-ink:#ffffff;
          --mono:'SF Mono',ui-monospace,'JetBrains Mono',Menlo,monospace;--sans:'Inter',system-ui,sans-serif;
          font-family:var(--sans);background:var(--bg);color:var(--ink);min-height:100vh;}
        .ll *{box-sizing:border-box;}
        .ll-hd{padding:18px 22px 0;border-bottom:1px solid var(--line);}
        .ll-hd h1{margin:0 0 4px;font-size:15px;letter-spacing:.02em;font-weight:600;}
        .ll-hd .sub{color:var(--ink3);font-size:12px;font-family:var(--mono);margin-bottom:12px;}
        .ll-tabs{display:flex;gap:2px;}
        .ll-tab{background:none;border:none;color:var(--ink2);font-family:var(--mono);font-size:12.5px;
          padding:9px 14px;cursor:pointer;border-radius:6px 6px 0 0;}
        .ll-tab[data-on="1"]{color:var(--ink);background:var(--panel);box-shadow:inset 0 -2px 0 var(--acc);}
        .ll-body{padding:22px;max-width:1200px;margin:0 auto;}
        .errbar{margin:0 22px;padding:10px 18px;background:#3a1c1c;color:#f0b3b3;font-family:var(--mono);font-size:12px;border-radius:8px;}
        .card{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:18px 20px;}
        .lbl{font-family:var(--mono);font-size:11px;color:var(--ink3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;display:block;}
        .inp,.sel,.txt{width:100%;background:var(--bg);border:1px solid var(--line);color:var(--ink);
          font-family:var(--sans);font-size:13.5px;padding:9px 12px;border-radius:8px;}
        .inp:focus,.sel:focus,.txt:focus{outline:2px solid var(--acc);outline-offset:1px;}
        .txt{min-height:80px;resize:vertical;line-height:1.5;}
        .row2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
        .row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;}
        @media(max-width:700px){.row2,.row3{grid-template-columns:1fr;}}
        .fld{margin-bottom:16px;}
        .tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;}
        .tag{background:var(--panel2);border:1px solid var(--line);color:var(--ink);font-family:var(--mono);
          font-size:11.5px;padding:4px 8px;border-radius:6px;display:flex;align-items:center;gap:6px;}
        .tag button{background:none;border:none;color:var(--ink3);cursor:pointer;font-size:13px;line-height:1;padding:0;}
        .tag button:hover{color:var(--ink);}
        .cost{margin-top:6px;color:var(--ink2);font-family:var(--mono);font-size:12px;}
        .btn{font-family:var(--sans);font-size:13.5px;font-weight:600;padding:10px 18px;border-radius:8px;
          cursor:pointer;border:1px solid var(--line);background:var(--panel2);color:var(--ink);}
        .btn:hover:not(:disabled){border-color:var(--ink3);}
        .btn:disabled{opacity:.5;cursor:not-allowed;}
        .btn.primary{background:var(--acc);color:var(--acc-ink);border-color:var(--acc);}
        .btn.primary:hover:not(:disabled){filter:brightness(1.1);}
        .btn.sm{padding:6px 10px;font-size:12px;}
        .progress-wrap{margin-top:18px;}
        .progress-bar{height:8px;background:var(--panel2);border-radius:99px;overflow:hidden;border:1px solid var(--line);}
        .progress-fill{height:100%;background:var(--acc);transition:width .3s ease;}
        .progress-meta{display:flex;justify-content:space-between;color:var(--ink2);font-family:var(--mono);font-size:11.5px;margin-top:6px;}
        .board{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;align-items:start;}
        @media(max-width:1000px){.board{grid-template-columns:1fr;}}
        .col{background:var(--panel);border:1px solid var(--line);border-radius:12px;min-height:120px;}
        .col-hd{padding:12px 14px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;}
        .col-hd .t{font-size:12.5px;font-weight:600;}
        .col-hd .n{background:var(--panel2);color:var(--ink2);font-family:var(--mono);font-size:11px;padding:1px 7px;border-radius:20px;}
        .col-body{padding:10px;display:flex;flex-direction:column;gap:10px;min-height:60px;}
        .col-body[data-over="1"]{background:var(--panel2);}
        .empty-col{color:var(--ink3);font-family:var(--mono);font-size:11.5px;text-align:center;padding:14px 4px;}
        .lead-card{background:var(--panel2);border:1px solid var(--line);border-radius:10px;padding:12px 13px;cursor:grab;}
        .lead-card[data-dragging="1"]{opacity:.4;}
        .lead-hd{display:flex;gap:10px;align-items:flex-start;}
        .avatar{width:36px;height:36px;border-radius:50%;background:var(--bg);border:1px solid var(--line);
          flex-shrink:0;object-fit:cover;display:flex;align-items:center;justify-content:center;font-size:13px;color:var(--ink3);}
        .lead-name{font-size:13.5px;font-weight:600;line-height:1.3;}
        .lead-sub{color:var(--ink3);font-family:var(--mono);font-size:11px;margin-top:2px;line-height:1.4;}
        .lead-summary{margin-top:9px;font-size:12.5px;color:var(--ink2);line-height:1.5;}
        .lead-msg{margin-top:9px;background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:9px 10px;
          font-size:12.5px;line-height:1.55;white-space:pre-wrap;color:var(--ink);}
        .lead-notes{margin-top:9px;width:100%;min-height:52px;background:var(--bg);border:1px solid var(--line);
          border-radius:8px;color:var(--ink);font-family:var(--sans);font-size:12.5px;padding:8px 9px;resize:vertical;}
        .lead-acts{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;}
        .lead-acts a{text-decoration:none;}
        .lead-move{margin-top:8px;}
        .lead-move select{width:100%;}
        .toggle{background:none;border:none;color:var(--acc);font-family:var(--mono);font-size:11px;cursor:pointer;
          padding:0;margin-top:8px;}
        .settings-actions{display:flex;align-items:center;gap:12px;margin-top:6px;}
        .saved-ok{color:#4ade80;font-family:var(--mono);font-size:12px;}
      `}</style>

      <div className="ll-hd">
        <h1>Leads LinkedIn</h1>
        <div className="ll-sub sub">linkedin_leads · {totalLeads} leads totales{boardLoading ? " · cargando…" : ""}</div>
        <div className="ll-tabs">
          <button className="ll-tab" data-on={tab === "board" ? 1 : 0} onClick={() => setTab("board")}>Tablero</button>
          <button className="ll-tab" data-on={tab === "search" ? 1 : 0} onClick={() => setTab("search")}>Búsqueda</button>
          <button className="ll-tab" data-on={tab === "settings" ? 1 : 0} onClick={() => setTab("settings")}>Ajustes</button>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 14 }} className="errbar">⚠ {error}</div>
      )}

      <div className="ll-body">
        {tab === "search" && (
          <div className="card">
            <div className="fld">
              <span className="lbl">Palabra clave</span>
              <input className="inp" value={keyword} onChange={(e) => setKeyword(e.target.value)}
                placeholder="Ej: growth marketing, SaaS founder…" disabled={searching} />
            </div>
            <div className="fld">
              <span className="lbl">Cargos objetivo</span>
              <div style={{ display: "flex", gap: 8 }}>
                <input className="inp" value={titleInput} onChange={(e) => setTitleInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTitle(); } }}
                  placeholder="Ej: CEO, Head of Sales…" disabled={searching} />
                <button className="btn sm" onClick={addTitle} disabled={searching || !titleInput.trim()}>Agregar</button>
              </div>
              {targetTitles.length > 0 && (
                <div className="tags">
                  {targetTitles.map((t) => (
                    <span key={t} className="tag">{t}<button onClick={() => removeTitle(t)} disabled={searching}>×</button></span>
                  ))}
                </div>
              )}
            </div>
            <div className="row3">
              <div className="fld">
                <span className="lbl">País</span>
                <input className="inp" value="Estados Unidos" disabled readOnly />
              </div>
              <div className="fld">
                <span className="lbl">Estado (opcional)</span>
                <select className="sel" value={state} onChange={(e) => setState(e.target.value)} disabled={searching}>
                  <option value="">Todos</option>
                  {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="fld">
                <span className="lbl">Ciudad (opcional)</span>
                <input className="inp" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ej: Austin" disabled={searching} />
              </div>
            </div>
            <div className="row2">
              <div className="fld">
                <span className="lbl">Cantidad de leads</span>
                <input className="inp" type="number" min={1} max={100} value={count}
                  onChange={(e) => setCount(Math.min(100, Math.max(1, Number(e.target.value) || 1)))} disabled={searching} />
                <div className="cost">Costo estimado: ~${estimatedCost.toFixed(2)} USD (Apify + Anthropic)</div>
              </div>
              <div className="fld" style={{ display: "flex", alignItems: "flex-end" }}>
                <button className="btn primary" onClick={runSearch} disabled={searching} style={{ width: "100%" }}>
                  {searching ? "Buscando…" : "Buscar"}
                </button>
              </div>
            </div>

            {searchError && <div className="errbar" style={{ margin: "10px 0 0" }}>⚠ {searchError}</div>}

            {(searching || job) && (
              <div className="progress-wrap">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: job && job.total > 0 ? `${Math.min(100, (job.done / job.total) * 100)}%` : "8%" }} />
                </div>
                <div className="progress-meta">
                  <span>{job ? `${job.done} / ${job.total || "?"} leads` : "Iniciando…"} · estado: {job?.status ?? "running"}</span>
                  <span>{elapsed}s</span>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "board" && (
          <div className="board">
            {LINKEDIN_LEAD_STATUSES.map((status) => (
              <div key={status} className="col">
                <div className="col-hd">
                  <span className="t">{STATUS_META[status].label}</span>
                  <span className="n">{counts[status] || 0}</span>
                </div>
                <div
                  className="col-body"
                  data-over={dragLeadId ? 1 : 0}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const leadId = e.dataTransfer.getData("text/plain");
                    const lead = Object.values(leadsByStatus).flat().find((l) => l.id === leadId);
                    if (lead) void moveLead(lead, status);
                    setDragLeadId(null);
                  }}
                >
                  {leadsByStatus[status].length === 0 && !boardLoading && (
                    <div className="empty-col">Sin leads acá.</div>
                  )}
                  {leadsByStatus[status].map((lead) => {
                    const expanded = expandedId === lead.id;
                    return (
                      <div
                        key={lead.id}
                        className="lead-card"
                        data-dragging={dragLeadId === lead.id ? 1 : 0}
                        draggable
                        onDragStart={(e) => { e.dataTransfer.setData("text/plain", lead.id); setDragLeadId(lead.id); }}
                        onDragEnd={() => setDragLeadId(null)}
                      >
                        <div className="lead-hd">
                          {lead.photo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={lead.photo_url} alt={lead.full_name} className="avatar" />
                          ) : (
                            <div className="avatar">{lead.full_name.slice(0, 1).toUpperCase()}</div>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <div className="lead-name">{lead.full_name}</div>
                            <div className="lead-sub">{lead.headline || "—"}{lead.company ? ` · ${lead.company}` : ""}</div>
                          </div>
                        </div>
                        {lead.analysis_summary && <div className="lead-summary">{lead.analysis_summary}</div>}
                        {lead.drafted_message && (
                          <button className="toggle" onClick={() => setExpandedId(expanded ? null : lead.id)}>
                            {expanded ? "Ocultar mensaje ▲" : "Ver mensaje ▼"}
                          </button>
                        )}
                        {expanded && lead.drafted_message && <div className="lead-msg">{lead.drafted_message}</div>}
                        {expanded && (
                          <textarea
                            className="lead-notes"
                            placeholder="Notas…"
                            value={notesDraft[lead.id] ?? lead.notes ?? ""}
                            onChange={(e) => setNotesDraft((prev) => ({ ...prev, [lead.id]: e.target.value }))}
                            onBlur={() => saveNotes(lead)}
                          />
                        )}
                        <div className="lead-acts">
                          <button className="btn sm" onClick={() => copyMessage(lead)} disabled={!lead.drafted_message}>
                            {copiedId === lead.id ? "✓ Copiado" : "Copiar mensaje"}
                          </button>
                          <button className="btn sm" onClick={() => regenerate(lead)} disabled={regeneratingId === lead.id}>
                            {regeneratingId === lead.id ? "Regenerando…" : "Regenerar"}
                          </button>
                          {lead.profile_url && (
                            <a href={lead.profile_url} target="_blank" rel="noreferrer">
                              <button className="btn sm">Abrir perfil ↗</button>
                            </a>
                          )}
                        </div>
                        <div className="lead-move">
                          <select
                            className="sel"
                            value={lead.status}
                            onChange={(e) => moveLead(lead, e.target.value as LinkedinLeadStatus)}
                          >
                            {LINKEDIN_LEAD_STATUSES.map((s) => (
                              <option key={s} value={s}>{STATUS_META[s].label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "settings" && (
          <div className="card" style={{ maxWidth: 520 }}>
            <div className="fld">
              <span className="lbl">Nombre del remitente</span>
              <input className="inp" value={settings.senderName} disabled={settingsLoading}
                onChange={(e) => setSettings((s) => ({ ...s, senderName: e.target.value }))} />
            </div>
            <div className="fld">
              <span className="lbl">Empresa</span>
              <input className="inp" value={settings.companyName} disabled={settingsLoading}
                onChange={(e) => setSettings((s) => ({ ...s, companyName: e.target.value }))} />
            </div>
            <div className="fld">
              <span className="lbl">Descripción de la oferta</span>
              <textarea className="txt" value={settings.offerDescription} disabled={settingsLoading}
                onChange={(e) => setSettings((s) => ({ ...s, offerDescription: e.target.value }))} />
            </div>
            <div className="fld">
              <span className="lbl">Idioma de los mensajes</span>
              <select className="sel" value={settings.language} disabled={settingsLoading}
                onChange={(e) => setSettings((s) => ({ ...s, language: e.target.value === "en" ? "en" : "es" }))}>
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="settings-actions">
              <button className="btn primary" onClick={saveSettings} disabled={settingsSaving || settingsLoading}>
                {settingsSaving ? "Guardando…" : "Guardar"}
              </button>
              {settingsSaved && <span className="saved-ok">✓ Guardado</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
