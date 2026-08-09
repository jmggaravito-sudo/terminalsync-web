"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { BUSINESS_LEAD_STATUSES, type BusinessLeadStatus, type BusinessLead } from "@/lib/businessLeads/types";
import { whatsappTemplate, emailSubjectTemplate, emailBodyTemplate } from "@/lib/businessLeads/templates";
import { authedFetch } from "@/lib/supabase/browser";

type AuthState = "checking" | "anon" | "forbidden" | "ready";

// ─────────────────────────────────────────────────────────────
// BUSINESS LEADS QUEUE — negocios locales (Google Maps) listos para
// contactar directo, sin pasar por un creador/influencer intermedio.
// Lee de Supabase (business_leads) vía /api/business-leads/queue.
// Pipeline: nuevo → contactado → agendado → cliente (o descartado).
// ─────────────────────────────────────────────────────────────

const STATUS_META: Record<BusinessLeadStatus, { label: string }> = {
  nuevo: { label: "Nuevo" },
  contactado: { label: "Contactado" },
  agendado: { label: "Agendado" },
  cliente: { label: "Cliente" },
  descartado: { label: "Descartado" },
};

const fmtRating = (lead: BusinessLead) => {
  if (!lead.rating) return "—";
  const reviews = lead.reviews_count ? ` (${lead.reviews_count})` : "";
  return `★ ${lead.rating.toFixed(1)}${reviews}`;
};

type Counts = Record<BusinessLeadStatus, number>;
const EMPTY_COUNTS: Counts = { nuevo: 0, contactado: 0, agendado: 0, cliente: 0, descartado: 0 };

export default function BusinessLeadsQueue({ lang }: { lang: string }) {
  const [auth, setAuth] = useState<AuthState>("checking");
  const [leads, setLeads] = useState<BusinessLead[]>([]);
  const [counts, setCounts] = useState<Counts>(EMPTY_COUNTS);
  const [filter, setFilter] = useState<BusinessLeadStatus>("nuevo");
  const [nicheFilter, setNicheFilter] = useState<string>("all");
  const [activeId, setActiveId] = useState<BusinessLead["id"] | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [waDraft, setWaDraft] = useState("");
  const [emailSubjectDraft, setEmailSubjectDraft] = useState("");
  const [emailBodyDraft, setEmailBodyDraft] = useState("");
  const [copiedWa, setCopiedWa] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const fetchLeads = useCallback(async (status: BusinessLeadStatus) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authedFetch(`/api/business-leads/queue?status=${status}&limit=50`, { cache: "no-store" } as RequestInit);
      if (res.status === 401) { setAuth("anon"); setLoading(false); return; }
      if (res.status === 403) { setAuth("forbidden"); setLoading(false); return; }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setLeads(Array.isArray(json.items) ? (json.items as BusinessLead[]) : []);
      setCounts({ ...EMPTY_COUNTS, ...(json.counts || {}) });
      setAuth("ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown error");
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const watchdog = window.setTimeout(() => {
      setAuth((current) => (current === "checking" ? "anon" : current));
      setLoading(false);
    }, 3_000);
    void fetchLeads(filter).finally(() => window.clearTimeout(watchdog));
    setActiveId(null);
    return () => window.clearTimeout(watchdog);
  }, [filter, fetchLeads]);

  const niches = useMemo(() => Array.from(new Set(leads.map((l) => l.niche).filter(Boolean))) as string[], [leads]);
  const visible = useMemo(
    () => leads.filter((l) => nicheFilter === "all" || l.niche === nicheFilter),
    [leads, nicheFilter],
  );

  const active = leads.find((l) => l.id === activeId) || null;
  useEffect(() => setNotes(active?.notes ?? ""), [activeId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!active) {
      setWaDraft("");
      setEmailSubjectDraft("");
      setEmailBodyDraft("");
      return;
    }
    setWaDraft(whatsappTemplate(active));
    setEmailSubjectDraft(emailSubjectTemplate(active));
    setEmailBodyDraft(emailBodyTemplate(active));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  const setStatus = useCallback(
    async (id: BusinessLead["id"], status: BusinessLeadStatus) => {
      if (saving) return;
      setSaving(true);
      const idx = visible.findIndex((l) => l.id === id);
      const next = visible[idx + 1] || visible[idx - 1] || null;
      try {
        const res = await authedFetch("/api/business-leads/update", {
          method: "POST",
          body: JSON.stringify({ id, status, notes }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
        await fetchLeads(filter);
        setActiveId(next ? next.id : null);
      } catch (e) {
        setError(`No se pudo guardar: ${e instanceof Error ? e.message : "unknown error"}`);
      } finally {
        setSaving(false);
      }
    },
    [saving, visible, notes, fetchLeads, filter],
  );

  const saveNotes = useCallback(async () => {
    if (!active || saving) return;
    setSaving(true);
    try {
      const res = await authedFetch("/api/business-leads/update", {
        method: "POST",
        body: JSON.stringify({ id: active.id, status: active.status, notes }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
    } catch (e) {
      setError(`No se pudo guardar la nota: ${e instanceof Error ? e.message : "unknown error"}`);
    } finally {
      setSaving(false);
    }
  }, [active, notes, saving]);

  const runSearch = useCallback(async () => {
    const query = searchQuery.trim();
    if (!query || searching) return;
    setSearching(true);
    setSearchResult(null);
    setError(null);
    try {
      const res = await authedFetch("/api/business-leads/search", {
        method: "POST",
        body: JSON.stringify({ query }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      const { parsed, ingest } = json as {
        parsed: { keyword: string; city: string; niche: string };
        ingest: { inserted?: number; skipped?: number; total?: number };
      };
      setSearchResult(
        `"${parsed.keyword}" en ${parsed.city} (${parsed.niche}) → ${ingest.inserted ?? 0} nuevos, ${ingest.skipped ?? 0} repetidos, ${ingest.total ?? 0} encontrados.`,
      );
      setSearchQuery("");
      setFilter("nuevo");
      await fetchLeads("nuevo");
    } catch (e) {
      setError(`No se pudo buscar: ${e instanceof Error ? e.message : "unknown error"}`);
    } finally {
      setSearching(false);
    }
  }, [searchQuery, searching, fetchLeads]);

  const totalLeads = useMemo(() => BUSINESS_LEAD_STATUSES.reduce((acc, s) => acc + (counts[s] || 0), 0), [counts]);
  const path = `/${lang}/admin/business-leads`;
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

  const waDigits = active?.phone_e164 ? active.phone_e164.replace(/[^0-9]/g, "") : null;
  const wa = waDigits ? `https://wa.me/${waDigits}?text=${encodeURIComponent(waDraft)}` : null;

  const copyText = async (text: string, setCopied: (v: boolean) => void) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="bl">
      <style>{`
        .bl{--bg:#0d1117;--panel:#161b22;--panel2:#1c232c;--line:#2a3340;--ink:#e6edf3;--ink2:#8b98a8;--ink3:#5d6b7a;
          --acc:#25d366;--acc-ink:#0d1117;
          --mono:'SF Mono',ui-monospace,'JetBrains Mono',Menlo,monospace;--sans:'Inter',system-ui,sans-serif;
          font-family:var(--sans);background:var(--bg);color:var(--ink);min-height:100vh;display:grid;
          grid-template-columns:1fr 420px;gap:0;}
        @media(max-width:820px){.bl{grid-template-columns:1fr;}}
        .bl *{box-sizing:border-box;}
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
        .searchbar{display:flex;gap:8px;padding:12px 22px;border-bottom:1px solid var(--line);}
        .searchbar input{flex:1;background:var(--bg);border:1px solid var(--line);color:var(--ink);
          font-family:var(--sans);font-size:13px;padding:9px 12px;border-radius:8px;}
        .searchbar input:focus{outline:2px solid var(--acc);outline-offset:1px;}
        .searchbar button{background:var(--acc);color:var(--acc-ink);border:none;font-family:var(--sans);
          font-size:13px;font-weight:600;padding:9px 16px;border-radius:8px;cursor:pointer;white-space:nowrap;}
        .searchbar button:disabled{opacity:.5;cursor:not-allowed;}
        .searchresult{padding:8px 22px;background:#0d2a16;color:#9ff0b2;font-family:var(--mono);font-size:11.5px;border-bottom:1px solid #1f7a34;}
        .list{flex:1;overflow:auto;}
        .row{display:grid;grid-template-columns:1fr auto;gap:8px;padding:13px 18px;border-bottom:1px solid var(--line);
          cursor:pointer;align-items:center;}
        .row:hover{background:var(--panel);}
        .row[data-on="1"]{background:var(--panel2);box-shadow:inset 3px 0 0 var(--acc);}
        .row .name{font-weight:600;font-size:14px;}
        .row .meta{color:var(--ink3);font-family:var(--mono);font-size:11.5px;margin-top:3px;display:flex;gap:8px;flex-wrap:wrap;}
        .pill{font-family:var(--mono);font-size:10.5px;padding:2px 7px;border-radius:5px;border:1px solid var(--line);color:var(--ink2);}
        .rating{font-family:var(--mono);font-size:12px;color:var(--ink2);text-align:right;white-space:nowrap;}
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
        .field{display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid var(--line);font-size:13px;}
        .field .k{color:var(--ink3);font-family:var(--mono);font-size:11.5px;}
        .field .v{color:var(--ink);text-align:right;}
        .field a{color:var(--acc);text-decoration:none;}
        .notes{width:100%;min-height:100px;background:var(--bg);border:1px solid var(--line);border-radius:8px;color:var(--ink);
          font-family:var(--sans);font-size:13.5px;line-height:1.5;padding:12px;resize:vertical;margin-top:14px;}
        .notes:focus{outline:2px solid var(--acc);outline-offset:1px;}
        .msgbox{margin-top:18px;border:1px solid var(--line);border-radius:10px;padding:13px 14px;background:var(--bg);}
        .msgbox-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
        .msgbox-hd .lbl{margin:0;}
        .copybtn{background:none;border:1px solid var(--line);color:var(--ink2);font-family:var(--mono);
          font-size:11px;padding:4px 9px;border-radius:6px;cursor:pointer;}
        .copybtn:hover{border-color:var(--ink3);color:var(--ink);}
        .subjectin{width:100%;background:var(--panel2);border:1px solid var(--line);border-radius:8px;color:var(--ink);
          font-family:var(--sans);font-size:13px;padding:9px 11px;margin-bottom:8px;}
        .subjectin:focus{outline:2px solid var(--acc);outline-offset:1px;}
        .msgta{width:100%;min-height:110px;background:var(--panel2);border:1px solid var(--line);border-radius:8px;color:var(--ink);
          font-family:var(--sans);font-size:13px;line-height:1.5;padding:11px;resize:vertical;}
        .msgta:focus{outline:2px solid var(--acc);outline-offset:1px;}
        .acts{padding:16px 24px;border-top:1px solid var(--line);display:flex;flex-direction:column;gap:10px;}
        .act-row{display:flex;gap:9px;flex-wrap:wrap;}
        .btn{flex:1;font-family:var(--sans);font-size:13px;font-weight:600;padding:11px;border-radius:8px;
          cursor:pointer;border:1px solid var(--line);background:var(--panel2);color:var(--ink);transition:.12s;min-width:120px;}
        .btn:hover:not(:disabled){border-color:var(--ink3);}
        .btn:disabled{opacity:.5;cursor:not-allowed;}
        .btn.primary{background:var(--acc);color:var(--acc-ink);border-color:var(--acc);}
        .btn.primary:hover:not(:disabled){filter:brightness(1.08);}
        .btn.ghost{background:none;}
        .btn.disc{background:none;border-color:var(--line);color:var(--ink3);flex:0 0 auto;padding:11px 16px;}
      `}</style>

      <div className="col-list">
        <div className="hd">
          <h1>Leads B2B</h1>
          <div className="sub">business_leads · {totalLeads} leads totales · mostrando máximo 50{loading ? " · cargando…" : ""}</div>
        </div>
        <div className="searchbar">
          <input
            type="text"
            placeholder='Ej: "clínicas dentales en Bogotá, Colombia"'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
            disabled={searching}
          />
          <button onClick={runSearch} disabled={searching || !searchQuery.trim()}>
            {searching ? "Buscando…" : "Buscar"}
          </button>
        </div>
        {searchResult && <div className="searchresult">✓ {searchResult}</div>}
        <div className="tabs">
          {BUSINESS_LEAD_STATUSES.map((k) => (
            <button key={k} className="tab" data-on={filter === k ? 1 : 0} onClick={() => setFilter(k)}>
              {STATUS_META[k].label}
              <span className="n">{counts[k] || 0}</span>
            </button>
          ))}
        </div>
        {niches.length > 0 && (
          <div className="subfilters">
            <select className="sf" value={nicheFilter} onChange={(e) => setNicheFilter(e.target.value)}>
              <option value="all">Nicho: todos</option>
              {niches.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        )}
        {error && <div className="errbar">⚠ {error}</div>}
        <div className="list">
          {!loading && visible.length === 0 && (
            <div className="empty">Nada en «{STATUS_META[filter].label}» con estos filtros.</div>
          )}
          {visible.map((l) => (
            <div key={l.id} className="row" data-on={activeId === l.id ? 1 : 0} onClick={() => setActiveId(l.id)}>
              <div>
                <div className="name">{l.name}</div>
                <div className="meta">
                  {l.category && <span className="pill">{l.category}</span>}
                  {l.city && <span className="pill">{l.city}</span>}
                  {l.niche && <span className="pill">{l.niche}</span>}
                </div>
              </div>
              <div className="rating">{fmtRating(l)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="col-detail">
        {!active ? (
          <div className="dt-empty">Elegí un lead de la cola para ver el detalle.</div>
        ) : (
          <>
            <div className="dt-hd">
              <div className="nm">{active.name}</div>
              <div className="hl">{active.category || "—"} · {active.city || "—"}{active.country ? `, ${active.country}` : ""}</div>
              <div className="tags">
                {active.niche && <span className="pill">{active.niche}</span>}
                {active.source_keyword && <span className="pill">kw: {active.source_keyword}</span>}
                <span className="pill">{fmtRating(active)}</span>
              </div>
            </div>
            <div className="dt-body">
              <div className="field"><span className="k">Dirección</span><span className="v">{active.address || "—"}</span></div>
              <div className="field"><span className="k">Teléfono</span><span className="v">{active.phone || "—"}</span></div>
              <div className="field"><span className="k">Email</span><span className="v">{active.email || "—"}</span></div>
              <div className="field">
                <span className="k">Web</span>
                <span className="v">{active.website_url ? <a href={active.website_url} target="_blank" rel="noreferrer">Abrir ↗</a> : "—"}</span>
              </div>
              <div className="field">
                <span className="k">Google Maps</span>
                <span className="v">{active.google_maps_url ? <a href={active.google_maps_url} target="_blank" rel="noreferrer">Abrir ↗</a> : "—"}</span>
              </div>
              <div className="msgbox">
                <div className="msgbox-hd">
                  <div className="lbl">Mensaje WhatsApp</div>
                  <button className="copybtn" onClick={() => copyText(waDraft, setCopiedWa)}>{copiedWa ? "✓ Copiado" : "Copiar"}</button>
                </div>
                <textarea className="msgta" value={waDraft} onChange={(e) => setWaDraft(e.target.value)} />
              </div>
              <div className="msgbox">
                <div className="msgbox-hd">
                  <div className="lbl">Email</div>
                  <button className="copybtn" onClick={() => copyText(`${emailSubjectDraft}\n\n${emailBodyDraft}`, setCopiedEmail)}>{copiedEmail ? "✓ Copiado" : "Copiar"}</button>
                </div>
                <input className="subjectin" value={emailSubjectDraft} onChange={(e) => setEmailSubjectDraft(e.target.value)} placeholder="Asunto…" />
                <textarea className="msgta" value={emailBodyDraft} onChange={(e) => setEmailBodyDraft(e.target.value)} />
              </div>
              <div className="lbl" style={{ marginTop: 16 }}>Notas</div>
              <textarea className="notes" value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={saveNotes} placeholder="Notas de seguimiento…" />
            </div>
            <div className="acts">
              <div className="act-row">
                <button className="btn primary" disabled={!wa} onClick={() => wa && window.open(wa, "_blank")}>
                  {wa ? "Abrir WhatsApp ↗" : "Sin teléfono"}
                </button>
                <button
                  className="btn ghost"
                  disabled={!active.email}
                  onClick={() => {
                    if (!active.email) return;
                    const subject = encodeURIComponent(emailSubjectDraft);
                    const bodyText = encodeURIComponent(emailBodyDraft);
                    window.location.href = `mailto:${active.email}?subject=${subject}&body=${bodyText}`;
                  }}
                >
                  {active.email ? "Enviar Email ↗" : "Sin email"}
                </button>
                <button className="btn ghost" disabled={!active.google_maps_url} onClick={() => active.google_maps_url && window.open(active.google_maps_url, "_blank")}>
                  Ver en Maps ↗
                </button>
              </div>
              <div className="act-row">
                <button className="btn" disabled={saving || active.status === "contactado"} onClick={() => setStatus(active.id, "contactado")}>Contactado</button>
                <button className="btn" disabled={saving || active.status === "agendado"} onClick={() => setStatus(active.id, "agendado")}>Agendado</button>
                <button className="btn" disabled={saving || active.status === "cliente"} onClick={() => setStatus(active.id, "cliente")}>Cliente</button>
                <button className="btn disc" disabled={saving} onClick={() => setStatus(active.id, "descartado")}>Descartar</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
