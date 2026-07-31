"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { OP_STATUSES, type OpStatus, type Lead, type ReviewStatus } from "@/lib/outreach/types";
import {
  OUTREACH_TEMPLATES,
  personalizeLead,
  recommendedTemplateId,
  renderOutreachTemplate,
  templateLang,
  templateTrack,
} from "@/lib/outreach/templates";
import { authedFetch } from "@/lib/supabase/browser";

type AuthState = "checking" | "anon" | "forbidden" | "ready";

// ─────────────────────────────────────────────────────────────
// OUTREACH QUEUE — cola de contacto manual para TerminalSync
// Lee de Supabase (agency_influencers) vía /api/outreach/queue.
// Estado operativo local: pendiente / enviado / respondió / descartado.
// "respondió" is only the local operating state until the GHL reply bridge is wired.
// ─────────────────────────────────────────────────────────────

const STATUS_META: Record<OpStatus, { label: string }> = {
  pendiente: { label: "Pendiente" },
  enviado: { label: "Enviado" },
  respondio: { label: "Respondió" },
  descartado: { label: "Descartado" },
};

const REVIEW_META: Record<ReviewStatus, { label: string; help: string }> = {
  pending: {
    label: "Falta aprobación",
    help: "Capturado por el radar, pero todavía no aprobado por JM para contactar.",
  },
  qualified: {
    label: "Aprobado",
    help: "Listo para copiar mensaje, contactar y marcar como enviado.",
  },
  rejected: {
    label: "Rechazado",
    help: "No es buen fit para este nicho/campaña.",
  },
};

const PLATFORM_LABEL: Record<string, string> = {
  YouTube: "YouTube",
  youtube: "YouTube",
  X: "X",
  x: "X",
  TikTok: "TikTok",
  tiktok: "TikTok",
  LinkedIn: "LinkedIn",
  linkedin: "LinkedIn",
  Instagram: "Instagram",
  instagram: "Instagram",
};

const fmtSubs = (n: number | null) => {
  if (!n) return "—";
  return n >= 1000
    ? (n / 1000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, "") + "k"
    : String(n);
};

type Counts = Record<OpStatus, number>;
const EMPTY_COUNTS: Counts = { pendiente: 0, enviado: 0, respondio: 0, descartado: 0 };

export default function OutreachQueue({ lang }: { lang: string }) {
  const search = useSearchParams();
  const requestedLeadId = search.get("lead");
  const [auth, setAuth] = useState<AuthState>("checking");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [counts, setCounts] = useState<Counts>(EMPTY_COUNTS);
  const [filter, setFilter] = useState<OpStatus>("pendiente");
  const [trackFilter, setTrackFilter] = useState<"all" | "affiliate" | "user">("all");
  const [langFilter, setLangFilter] = useState<"all" | "en" | "es">("all");
  const [activeId, setActiveId] = useState<Lead["id"] | null>(null);
  const [draft, setDraft] = useState("");
  const [hook, setHook] = useState("");
  const [templateId, setTemplateId] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  // ── Fetch leads for current filter ──
  const fetchLeads = useCallback(async (status: OpStatus) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authedFetch(`/api/outreach/queue?status=${status}&limit=50`, { cache: "no-store" } as RequestInit);
      if (res.status === 401) { setAuth("anon"); setLoading(false); return; }
      if (res.status === 403) { setAuth("forbidden"); setLoading(false); return; }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      const nextLeads = Array.isArray(json.items) ? (json.items as Lead[]) : [];
      setLeads(nextLeads);
      if (requestedLeadId && nextLeads.some((lead) => lead.id === requestedLeadId)) {
        setActiveId(requestedLeadId);
      }
      setCounts({ ...EMPTY_COUNTS, ...(json.counts || {}) });
      setAuth("ready");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "unknown error";
      setError(msg);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [requestedLeadId]);

  useEffect(() => {
    const watchdog = window.setTimeout(() => {
      setAuth((current) => (current === "checking" ? "anon" : current));
      setLoading(false);
    }, 10_000);

    void fetchLeads(filter).finally(() => window.clearTimeout(watchdog));
    if (!requestedLeadId) setActiveId(null);

    return () => window.clearTimeout(watchdog);
  }, [filter, fetchLeads, requestedLeadId]);

  // ── Derived: filtered list (client-side track/lang filter on top of server-fetched status) ──
  const visible = useMemo(
    () =>
      leads.filter(
        (l) =>
          (trackFilter === "all" || templateTrack(l.track) === trackFilter) &&
          (langFilter === "all" || templateLang(l.language) === langFilter)
      ),
    [leads, trackFilter, langFilter]
  );

  const active = leads.find((l) => l.id === activeId) || null;
  const activePersonalization = active ? personalizeLead(active) : null;
  const activeTemplates = active
    ? OUTREACH_TEMPLATES.filter(
        (tpl) =>
          tpl.lang === templateLang(active.language) &&
          (tpl.segment === "any" || tpl.segment === activePersonalization?.segment),
      )
    : [];

  // ── Build personalized draft when a lead is opened ──
  useEffect(() => {
    if (!active) {
      setHook("");
      setDraft("");
      setTemplateId("");
      return;
    }
    const nextTemplateId = recommendedTemplateId(active);
    const tpl = OUTREACH_TEMPLATES.find((t) => t.id === nextTemplateId) || activeTemplates[0];
    const h = active.op_hook ?? "";
    setHook(h);
    setTemplateId(tpl?.id ?? "");
    setDraft(tpl ? renderOutreachTemplate(tpl, { ...active, op_hook: h }) : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // ── Recompute draft as hook/template changes ──
  useEffect(() => {
    if (!active || !templateId) return;
    const tpl = OUTREACH_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    const base = renderOutreachTemplate(tpl, active);
    setDraft(hook.trim() ? `${hook.trim()}\n\n${base}` : base);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hook, templateId]);

  // ── Persist human review decision ──
  const setReviewStatus = useCallback(
    async (id: Lead["id"], reviewStatus: ReviewStatus) => {
      if (saving) return;
      setSaving(true);
      setError(null);

      try {
        const res = await authedFetch("/api/outreach/review", {
          method: "POST",
          body: JSON.stringify({ id, status: reviewStatus }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);

        setLeads((current) =>
          current.map((lead) =>
            lead.id === id
              ? {
                  ...lead,
                  status: reviewStatus,
                  reviewed_at: reviewStatus === "pending" ? null : new Date().toISOString(),
                }
              : lead,
          ),
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : "unknown error";
        setError(`No se pudo guardar aprobación: ${msg}`);
      } finally {
        setSaving(false);
      }
    },
    [saving],
  );

  // ── Persist status change ──
  const setStatus = useCallback(
    async (id: Lead["id"], status: OpStatus) => {
      if (saving) return;
      setSaving(true);

      // Pick "next" before mutation, so we can advance focus.
      const idx = visible.findIndex((l) => l.id === id);
      const next = visible[idx + 1] || visible[idx - 1] || null;

      try {
        const body: Record<string, unknown> = { id, op_status: status };
        if (status === "enviado") {
          body.op_hook = hook;
          body.op_last_message = draft;
        }
        const res = await authedFetch("/api/outreach/update", {
          method: "POST",
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || json.replyBridge?.error || `HTTP ${res.status}`);

        // Refetch the current filter to reflect new counts and remove the moved item.
        await fetchLeads(filter);
        if (status === "respondio" && json.replyBridge?.status !== "sent") {
          setError(
            json.replyBridge?.status === "not_configured"
              ? "Marcado como respondió en Supabase. GHL/Telegram sigue pendiente: falta configurar OUTREACH_REPLY_WEBHOOK_URL."
              : "Marcado como respondió, pero no pude confirmar el puente GHL/Telegram.",
          );
        }
        setActiveId(next ? next.id : null);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "unknown error";
        setError(`No se pudo guardar: ${msg}`);
      } finally {
        setSaving(false);
      }
    },
    [saving, visible, hook, draft, fetchLeads, filter]
  );

  const copy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(draft);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const totalLeads = useMemo(
    () => OP_STATUSES.reduce((acc, s) => acc + (counts[s] || 0), 0),
    [counts]
  );

  const loginHref = `/${lang}/login?next=${encodeURIComponent(`/${lang}/admin/ops/outreach`)}`;

  if (auth === "checking") {
    return (
      <div style={{ padding: "48px 24px", fontFamily: "monospace", color: "#8b98a8" }}>
        Verificando sesión admin…
        <div style={{ marginTop: 10, fontSize: 12 }}>
          Si no avanza, <a href={loginHref} style={{ color: "#3fb950" }}>iniciá sesión acá</a>.
        </div>
      </div>
    );
  }
  if (auth === "anon") {
    return (
      <div style={{ padding: "48px 24px", fontFamily: "monospace", color: "#e6edf3" }}>
        <p style={{ fontSize: 16, fontWeight: 700 }}>Esta cola requiere sesión admin.</p>
        <p style={{ marginTop: 8, color: "#8b98a8", fontSize: 13, maxWidth: 620, lineHeight: 1.5 }}>
          Existe para aprobar influencers, editar mensajes personalizados y marcar seguimiento.
          Entrá con Google y volvés automáticamente a esta misma cola.
        </p>
        <p style={{ marginTop: 16 }}>
          <a href={loginHref} style={{ display: "inline-flex", background: "#fff", color: "#000", padding: "10px 14px", borderRadius: 10, fontWeight: 700, textDecoration: "none" }}>
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
    <div className="oq">
      <style>{`
        .oq{--bg:#0d1117;--panel:#161b22;--panel2:#1c232c;--line:#2a3340;--ink:#e6edf3;--ink2:#8b98a8;--ink3:#5d6b7a;
          --acc:#3fb950;--acc-ink:#0d1117;--s-pend:#d29922;--s-sent:#388bfd;--s-resp:#3fb950;--s-disc:#5d6b7a;
          --mono:'SF Mono',ui-monospace,'JetBrains Mono',Menlo,monospace;--sans:'Inter',system-ui,sans-serif;
          font-family:var(--sans);background:var(--bg);color:var(--ink);min-height:100vh;display:grid;
          grid-template-columns:1fr 460px;gap:0;}
        @media(max-width:820px){.oq{grid-template-columns:1fr;}}
        .oq *{box-sizing:border-box;}
        .col-list{border-right:1px solid var(--line);min-height:100vh;display:flex;flex-direction:column;}
        .hd{padding:18px 22px 14px;border-bottom:1px solid var(--line);}
        .hd h1{margin:0;font-size:15px;letter-spacing:.02em;font-weight:600;}
        .hd .sub{color:var(--ink3);font-size:12px;font-family:var(--mono);margin-top:3px;}
        .tabs{display:flex;gap:2px;padding:10px 14px 0;flex-wrap:wrap;}
        .tab{background:none;border:none;color:var(--ink2);font-family:var(--mono);font-size:12px;
          padding:7px 11px;cursor:pointer;border-radius:6px 6px 0 0;display:flex;gap:7px;align-items:center;}
        .tab[data-on="1"]{color:var(--ink);background:var(--panel);box-shadow:inset 0 -2px 0 var(--acc);}
        .tab .n{background:var(--panel2);color:var(--ink2);font-size:11px;padding:1px 7px;border-radius:20px;}
        .tab[data-on="1"] .n{color:var(--ink);}
        .subfilters{display:flex;gap:8px;padding:11px 16px;border-bottom:1px solid var(--line);background:var(--panel);}
        .sf{background:var(--bg);border:1px solid var(--line);color:var(--ink2);font-family:var(--mono);font-size:11px;
          padding:5px 9px;border-radius:6px;cursor:pointer;}
        .sf:focus{outline:2px solid var(--acc);outline-offset:1px;}
        .list{flex:1;overflow:auto;}
        .row{display:grid;grid-template-columns:1fr auto;gap:8px;padding:13px 18px;border-bottom:1px solid var(--line);
          cursor:pointer;align-items:center;}
        .row:hover{background:var(--panel);}
        .row[data-on="1"]{background:var(--panel2);box-shadow:inset 3px 0 0 var(--acc);}
        .row .name{font-weight:600;font-size:14px;}
        .row .meta{color:var(--ink3);font-family:var(--mono);font-size:11.5px;margin-top:3px;display:flex;gap:8px;flex-wrap:wrap;}
        .pill{font-family:var(--mono);font-size:10.5px;padding:2px 7px;border-radius:5px;border:1px solid var(--line);color:var(--ink2);}
        .pill.aff{color:var(--acc);border-color:#1f5e2e;}
        .pill.review{color:#ffd166;border-color:#7a5d17;background:#271f0b;}
        .pill.review.ok{color:#9ff0b2;border-color:#1f7a34;background:#0d2a16;}
        .pill.review.no{color:#ffb4b4;border-color:#7a2b2b;background:#2b1212;}
        .subs{font-family:var(--mono);font-size:12px;color:var(--ink2);text-align:right;}
        .empty{padding:60px 24px;text-align:center;color:var(--ink3);font-family:var(--mono);font-size:13px;}
        .errbar{padding:10px 18px;background:#3a1c1c;color:#f0b3b3;font-family:var(--mono);font-size:12px;border-bottom:1px solid #5a2a2a;}
        .col-detail{background:var(--panel);min-height:100vh;display:flex;flex-direction:column;}
        .dt-empty{flex:1;display:flex;align-items:center;justify-content:center;color:var(--ink3);
          font-family:var(--mono);font-size:13px;padding:40px;text-align:center;}
        .dt-hd{padding:22px 24px 16px;border-bottom:1px solid var(--line);}
        .dt-hd .nm{font-size:20px;font-weight:700;}
        .dt-hd .hl{font-family:var(--mono);color:var(--ink2);font-size:13px;margin-top:2px;}
        .dt-hd .tags{display:flex;gap:7px;margin-top:13px;flex-wrap:wrap;}
        .dt-body{flex:1;overflow:auto;padding:20px 24px;}
        .lbl{font-family:var(--mono);font-size:11px;color:var(--ink3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:7px;}
        .hookin{width:100%;background:var(--bg);border:1px solid var(--line);border-radius:8px;color:var(--ink);
          font-family:var(--sans);font-size:13px;padding:10px 12px;margin-bottom:18px;}
        .hookin:focus{outline:2px solid var(--acc);outline-offset:1px;border-color:var(--acc);}
        .msg{width:100%;min-height:150px;background:var(--bg);border:1px solid var(--line);border-radius:8px;color:var(--ink);
          font-family:var(--sans);font-size:13.5px;line-height:1.55;padding:14px;resize:vertical;}
        .msg:focus{outline:2px solid var(--acc);outline-offset:1px;}
        .review-box{background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:13px 14px;margin-bottom:18px;}
        .review-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:7px;}
        .review-title{font-weight:700;font-size:13px;}
        .review-help{color:var(--ink2);font-size:12.5px;line-height:1.45;}
        .review-actions{display:flex;gap:9px;margin-top:12px;}
        .intel{background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:13px 14px;margin-bottom:18px;}
        .intel-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:10px;}
        .intel-card{border:1px solid var(--line);border-radius:8px;background:var(--panel2);padding:9px;}
        .intel-k{font-family:var(--mono);font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--ink3);}
        .intel-v{margin-top:4px;font-size:12.5px;line-height:1.35;color:var(--ink);}
        .tplsel{width:100%;background:var(--bg);border:1px solid var(--line);border-radius:8px;color:var(--ink);font-size:13px;padding:10px 12px;margin-bottom:18px;}
        .contact-row{display:flex;gap:6px;flex-wrap:wrap;margin-top:9px;}
        .acts{padding:16px 24px;border-top:1px solid var(--line);display:flex;flex-direction:column;gap:10px;}
        .act-row{display:flex;gap:9px;}
        .btn{flex:1;font-family:var(--sans);font-size:13px;font-weight:600;padding:11px;border-radius:8px;
          cursor:pointer;border:1px solid var(--line);background:var(--panel2);color:var(--ink);transition:.12s;}
        .btn:hover:not(:disabled){border-color:var(--ink3);}
        .btn:focus-visible{outline:2px solid var(--acc);outline-offset:2px;}
        .btn:disabled{opacity:.5;cursor:not-allowed;}
        .btn.primary{background:var(--acc);color:var(--acc-ink);border-color:var(--acc);}
        .btn.primary:hover:not(:disabled){filter:brightness(1.08);}
        .btn.approve{background:#fff;color:#000;border-color:#fff;}
        .btn.reject{background:#000;color:#fff;border-color:#6b7280;}
        .btn.ghost{background:none;}
        .btn.sent{background:var(--s-sent);border-color:var(--s-sent);color:#fff;}
        .btn.resp{background:none;border-color:var(--s-resp);color:var(--s-resp);}
        .btn.disc{background:none;border-color:var(--line);color:var(--ink3);flex:0 0 auto;padding:11px 16px;}
      `}</style>

      {/* LIST */}
      <div className="col-list">
        <div className="hd">
          <h1>Cola de contacto</h1>
          <div className="sub">
            agency_influencers · {totalLeads} leads totales · mostrando máximo 50{loading ? " · cargando…" : ""}
          </div>
        </div>
        <div className="tabs">
          {OP_STATUSES.map((k) => (
            <button
              key={k}
              className="tab"
              data-on={filter === k ? 1 : 0}
              onClick={() => setFilter(k)}
            >
              {STATUS_META[k].label}
              <span className="n">{counts[k] || 0}</span>
            </button>
          ))}
        </div>
        <div className="subfilters">
          <select
            className="sf"
            value={trackFilter}
            onChange={(e) =>
              setTrackFilter(e.target.value as "all" | "affiliate" | "user")
            }
          >
            <option value="all">Track: todos</option>
            <option value="affiliate">Affiliate</option>
            <option value="user">User</option>
          </select>
          <select
            className="sf"
            value={langFilter}
            onChange={(e) => setLangFilter(e.target.value as "all" | "en" | "es")}
          >
            <option value="all">Idioma: todos</option>
            <option value="en">EN</option>
            <option value="es">ES</option>
          </select>
        </div>
        {error && <div className="errbar">⚠ {error}</div>}
        <div className="list">
          {!loading && visible.length === 0 && (
            <div className="empty">Nada en «{STATUS_META[filter].label}» con estos filtros.</div>
          )}
          {visible.map((l) => (
            <div
              key={l.id}
              className="row"
              data-on={activeId === l.id ? 1 : 0}
              onClick={() => setActiveId(l.id)}
            >
              <div>
                <div className="name">{l.name || l.handle}</div>
                <div className="meta">
                  <span>@{l.handle}</span>
                  <span
                    className={
                      "pill" + (templateTrack(l.track) === "affiliate" ? " aff" : "")
                    }
                  >
                    {templateTrack(l.track)}
                  </span>
                  {l.niche && <span className="pill">{l.niche}</span>}
                  {l.language && <span className="pill">{l.language}</span>}
                  <span
                    className={`pill review ${l.status === "qualified" ? "ok" : l.status === "rejected" ? "no" : ""}`}
                  >
                    {REVIEW_META[l.status || "pending"].label}
                  </span>
                </div>
              </div>
              <div className="subs">
                {PLATFORM_LABEL[l.platform ?? ""] || l.platform || "—"}
                <br />
                {fmtSubs(l.subscribers)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DETAIL */}
      <div className="col-detail">
        {!active ? (
          <div className="dt-empty">Elegí un lead de la cola para preparar el mensaje.</div>
        ) : (
          <>
            <div className="dt-hd">
              <div className="nm">{active.name || active.handle}</div>
              <div className="hl">
                @{active.handle} · {PLATFORM_LABEL[active.platform ?? ""] || active.platform || "—"} ·{" "}
                {fmtSubs(active.subscribers)}
              </div>
              <div className="tags">
                <span
                  className={
                    "pill" + (templateTrack(active.track) === "affiliate" ? " aff" : "")
                  }
                >
                  {templateTrack(active.track)}
                </span>
                {active.niche && <span className="pill">{active.niche}</span>}
                {active.language && <span className="pill">{active.language.toUpperCase()}</span>}
                {active.source_keyword && (
                  <span className="pill">kw: {active.source_keyword}</span>
                )}
              </div>
            </div>
            <div className="dt-body">
              <div className="review-box">
                <div className="review-top">
                  <div className="review-title">Revisión humana</div>
                  <span
                    className={`pill review ${active.status === "qualified" ? "ok" : active.status === "rejected" ? "no" : ""}`}
                  >
                    {REVIEW_META[active.status || "pending"].label}
                  </span>
                </div>
                <div className="review-help">
                  {REVIEW_META[active.status || "pending"].help}
                  {active.status !== "qualified" && " Primero aprobalo; después sí lo contactás."}
                </div>
                <div className="review-actions">
                  <button
                    className="btn approve"
                    disabled={saving || active.status === "qualified"}
                    onClick={() => setReviewStatus(active.id, "qualified")}
                  >
                    Aprobar para outreach
                  </button>
                  <button
                    className="btn reject"
                    disabled={saving || active.status === "rejected"}
                    onClick={() => setReviewStatus(active.id, "rejected")}
                  >
                    Rechazar fit
                  </button>
                </div>
              </div>
              {activePersonalization && (
                <div className="intel">
                  <div className="review-top">
                    <div className="review-title">Análisis para personalizar</div>
                    <span className="pill">{activePersonalization.segment}</span>
                  </div>
                  <div className="intel-grid">
                    <div className="intel-card">
                      <div className="intel-k">Audiencia probable</div>
                      <div className="intel-v">{activePersonalization.audienceLabel}</div>
                    </div>
                    <div className="intel-card">
                      <div className="intel-k">Dolor a tocar</div>
                      <div className="intel-v">{activePersonalization.pain}</div>
                    </div>
                    <div className="intel-card">
                      <div className="intel-k">Oferta concreta</div>
                      <div className="intel-v">{activePersonalization.offer}</div>
                    </div>
                    <div className="intel-card">
                      <div className="intel-k">Por qué entró</div>
                      <div className="intel-v">{active.classification_reason || active.source_keyword || "Sin razón guardada"}</div>
                    </div>
                  </div>
                  <div className="contact-row">
                    {active.email && <span className="pill">Email</span>}
                    {active.instagram_handle && <span className="pill">IG</span>}
                    {active.twitter_handle && <span className="pill">X</span>}
                    {active.linkedin_url && <span className="pill">LinkedIn</span>}
                    {active.tiktok_handle && <span className="pill">TikTok</span>}
                    {active.bio_link_url && <span className="pill">Bio link</span>}
                  </div>
                </div>
              )}
              <div className="lbl">Template personalizado</div>
              <select
                className="tplsel"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
              >
                {activeTemplates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.channel.toUpperCase()} · {tpl.label}
                  </option>
                ))}
              </select>
              <div className="lbl">Gancho extra manual (opcional)</div>
              <input
                className="hookin"
                placeholder="ej: vi tu último video sobre seguimiento de leads…"
                value={hook}
                onChange={(e) => setHook(e.target.value)}
              />
              <div className="lbl">
                Mensaje sugerido · {activePersonalization?.segment || templateTrack(active.track)} ·{" "}
                {templateLang(active.language).toUpperCase()}
              </div>
              <textarea
                ref={taRef}
                className="msg"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
            </div>
            <div className="acts">
              <div className="act-row">
                <button className="btn primary" onClick={copy}>
                  {copied ? "✓ Copiado" : "Copiar mensaje"}
                </button>
                <button
                  className="btn ghost"
                  onClick={() => active.profile_url && window.open(active.profile_url, "_blank")}
                  disabled={!active.profile_url}
                >
                  Abrir perfil ↗
                </button>
              </div>
              <div className="act-row">
                <button
                  className="btn sent"
                  disabled={saving || active.status !== "qualified"}
                  title={active.status === "qualified" ? "" : "Primero aprobá el lead para outreach"}
                  onClick={() => setStatus(active.id, "enviado")}
                >
                  Marcar enviado
                </button>
                <button
                  className="btn resp"
                  disabled={saving}
                  onClick={() => setStatus(active.id, "respondio")}
                >
                  Respondió (GHL pendiente)
                </button>
                <button
                  className="btn disc"
                  disabled={saving}
                  onClick={() => setStatus(active.id, "descartado")}
                >
                  Descartar
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
