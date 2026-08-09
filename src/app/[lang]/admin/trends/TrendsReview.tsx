"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Archive,
  BriefcaseBusiness,
  CheckCircle2,
  ExternalLink,
  Github,
  Lightbulb,
  Megaphone,
  MessageSquare,
  Newspaper,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

type Status = "pending" | "kept" | "archived" | "promoted" | "all";
type Source = "all" | "github" | "hackernews" | "reddit" | "youtube" | "product_hunt";
type SignalType = "all" | "education" | "product" | "tool" | "topic" | "creator" | "unknown";

interface TrendItem {
  id: string;
  source: string;
  source_url: string;
  source_subtype: string | null;
  title: string;
  summary: string | null;
  score: number;
  signal_type: string | null;
  tags: string[] | null;
  review_status: Exclude<Status, "all">;
  review_notes: string | null;
  captured_at: string;
}

interface CrossSourceItem {
  title_normalized: string;
  sources: string[];
  source_count: number;
  total_score: number;
  last_seen_at: string;
  signal_ids: string[];
}

interface TrendsResponse {
  items: TrendItem[];
  crossSource: CrossSourceItem[];
  counts: Record<string, number>;
  window: { days: number; since: string };
}

interface BusinessInsight {
  priority: "Alta" | "Media" | "Baja";
  priorityTone: "high" | "medium" | "low";
  category: string;
  whatItMeans: string;
  audience: string;
  opportunity: string;
  actionToday: string;
  contentHook: string;
}

const SOURCES: { key: Source; label: string }[] = [
  { key: "all", label: "Todo" },
  { key: "youtube", label: "YouTube" },
  { key: "reddit", label: "Dolores" },
  { key: "hackernews", label: "Mercado" },
  { key: "github", label: "Tecnología" },
];

export function TrendsReview({ lang }: { lang: string }) {
  const isEs = lang === "es";
  const [source, setSource] = useState<Source>("all");
  const [status, setStatus] = useState<Status>("pending");
  const [signalType, setSignalType] = useState<SignalType>("all");
  const [days, setDays] = useState<number>(7);
  const [data, setData] = useState<TrendsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const t = useMemo(
    () => ({
      empty: isEs
        ? "No hay señales en este filtro. Prueba con Todo o 7 días."
        : "No signals match this filter. Try All or 7 days.",
      loading: isEs ? "Cargando radar de oportunidades…" : "Loading opportunity radar…",
      keep: isEs ? "Guardar para revisar" : "Keep",
      archive: isEs ? "No me sirve" : "Archive",
      promote: isEs ? "Usar esta oportunidad" : "Use this",
      filterPending: isEs ? "Por decidir" : "Pending",
      filterKept: isEs ? "Guardadas" : "Kept",
      filterArchived: isEs ? "Descartadas" : "Archived",
      filterPromoted: isEs ? "A usar" : "Promoted",
      filterAll: isEs ? "Todas" : "All",
      score: isEs ? "fuerza" : "score",
    }),
    [isEs],
  );

  const load = useCallback(async () => {
    try {
      setError(null);
      const params = new URLSearchParams({ status, days: String(days) });
      if (source !== "all") params.set("source", source);
      if (signalType !== "all") params.set("signal_type", signalType);
      const res = await fetch(`/api/admin/trends?${params}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Error");
      setData(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }, [source, status, signalType, days]);

  useEffect(() => {
    load();
  }, [load]);

  async function transition(item: TrendItem, action: "keep" | "archive" | "promote") {
    setBusyId(item.id);
    try {
      const res = await fetch(`/api/admin/trends`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, action }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed");
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setBusyId(null);
    }
  }

  const briefing = useMemo(() => {
    if (!data) return null;
    return buildBriefing(data.items);
  }, [data]);

  if (error) return <Banner tone="error">{error}</Banner>;
  if (!data) return <Banner tone="muted">{t.loading}</Banner>;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-emerald-500/25 bg-emerald-500/10 p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <BriefcaseBusiness size={16} className="text-emerald-300" />
          <h2 className="text-[13px] font-mono uppercase tracking-[0.14em] text-emerald-200">
            {isEs ? "Resumen para JM" : "Business brief"}
          </h2>
        </div>
        <p className="mt-2 text-[14px] leading-relaxed text-[var(--color-fg-strong)]">
          {isEs
            ? "Este radar no es para programar. Es para encontrar ideas de venta, contenido, demos y mensajes que puedes usar hoy para vender TerminalSync a empresarios y agencias."
            : "This radar is not for coding. It turns market signals into sales, content, demo, and positioning ideas."}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <MetricCard label={isEs ? "Oportunidades" : "Opportunities"} value={String(data.items.length)} />
          <MetricCard label={isEs ? "Prioridad alta" : "High priority"} value={String(briefing?.high ?? 0)} />
          <MetricCard label={isEs ? "Mejor fuente" : "Best source"} value={briefing?.topSource ?? "—"} />
        </div>
        {briefing && briefing.nextMoves.length > 0 && (
          <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-black/20 p-3">
            <p className="text-[12px] font-semibold text-emerald-100">
              {isEs ? "Qué haría hoy:" : "What I would do today:"}
            </p>
            <ul className="mt-2 space-y-1 text-[12.5px] leading-relaxed text-emerald-50/90">
              {briefing.nextMoves.map((move) => (
                <li key={move}>• {move}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {data.crossSource.length > 0 && (
        <section className="rounded-2xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[var(--color-accent)]" />
            <h2 className="text-[13px] font-mono uppercase tracking-[0.14em] text-[var(--color-accent)]">
              {isEs ? "Se repite en varias fuentes" : "Cross-source momentum"}
            </h2>
          </div>
          <p className="mt-1 text-[12px] text-[var(--color-fg-muted)]">
            {isEs
              ? "Si algo aparece en varias fuentes, puede ser una conversación real del mercado. Úsalo para posicionamiento o contenido."
              : "If something appears in multiple sources, it may be real market momentum."}
          </p>
          <ul className="mt-3 space-y-2">
            {data.crossSource.slice(0, 5).map((c) => (
              <li
                key={c.title_normalized}
                className="rounded-xl bg-[var(--color-panel)]/80 border border-[var(--color-border)] p-3"
              >
                <p className="text-[13px] font-medium text-[var(--color-fg-strong)]">
                  {c.title_normalized}
                </p>
                <p className="mt-1 text-[11px] font-mono text-[var(--color-fg-dim)]">
                  {c.sources.join(" · ")} · fuerza: {c.total_score}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-3 sm:p-4 space-y-3">
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[11px] font-mono text-[var(--color-fg-dim)] mr-1">
            {isEs ? "Ver:" : "View:"}
          </span>
          <FilterChip active={status === "pending"} onClick={() => setStatus("pending")}>
            {t.filterPending}
          </FilterChip>
          <FilterChip active={status === "promoted"} onClick={() => setStatus("promoted")}>
            {t.filterPromoted}
          </FilterChip>
          <FilterChip active={status === "kept"} onClick={() => setStatus("kept")}>
            {t.filterKept}
          </FilterChip>
          <FilterChip active={status === "archived"} onClick={() => setStatus("archived")}>
            {t.filterArchived}
          </FilterChip>
          <FilterChip active={status === "all"} onClick={() => setStatus("all")}>
            {t.filterAll}
          </FilterChip>
        </div>

        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[11px] font-mono text-[var(--color-fg-dim)] mr-1">
            {isEs ? "Fuente:" : "Source:"}
          </span>
          {SOURCES.map((s) => {
            const count =
              s.key === "all"
                ? Object.values(data.counts).reduce((a, b) => a + b, 0)
                : data.counts[s.key] ?? 0;
            return (
              <FilterChip key={s.key} active={source === s.key} onClick={() => setSource(s.key)}>
                {s.label}
                {count > 0 && (
                  <span className="ml-1.5 rounded-full bg-amber-500/20 text-amber-200 px-1.5 py-0 text-[10px] font-mono">
                    {count}
                  </span>
                )}
              </FilterChip>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <span className="text-[var(--color-fg-dim)]">{isEs ? "Periodo:" : "Window:"}</span>
          {[1, 3, 7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-md px-2 py-1 ${
                days === d
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-[var(--color-panel-2)]/60 text-[var(--color-fg-muted)] hover:bg-[var(--color-panel-2)]"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {data.items.length === 0 ? (
        <Banner tone="muted">{t.empty}</Banner>
      ) : (
        <ul className="space-y-4">
          {data.items.map((item) => (
            <TrendCard
              key={item.id}
              item={item}
              status={status}
              isEs={isEs}
              t={t}
              busy={busyId === item.id}
              onTransition={(a) => transition(item, a)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

interface UIText {
  keep: string;
  archive: string;
  promote: string;
  score: string;
}

function TrendCard({
  item,
  status,
  isEs,
  t,
  busy,
  onTransition,
}: {
  item: TrendItem;
  status: Status;
  isEs: boolean;
  t: UIText;
  busy: boolean;
  onTransition: (action: "keep" | "archive" | "promote") => void;
}) {
  const Icon =
    item.source === "github"
      ? Github
      : item.source === "hackernews"
        ? Newspaper
        : item.source === "reddit"
          ? MessageSquare
          : ExternalLink;

  const sourceColor =
    item.source === "github"
      ? "text-emerald-400 border-emerald-500/30"
      : item.source === "hackernews"
        ? "text-orange-400 border-orange-500/30"
        : item.source === "reddit"
          ? "text-rose-400 border-rose-500/30"
          : "text-sky-300 border-sky-500/30";

  const captured = new Date(item.captured_at);
  const hoursAgo = Math.max(0, Math.round((Date.now() - captured.getTime()) / 3_600_000));
  const ageLabel = hoursAgo < 24 ? `${hoursAgo}h` : `${Math.round(hoursAgo / 24)}d`;
  const insight = buildBusinessInsight(item, isEs);

  return (
    <li className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel)] overflow-hidden shadow-sm">
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-mono ${sourceColor} bg-[var(--color-panel-2)]/40`}>
            <Icon size={12} />
            {sourceLabel(item.source)}
          </span>
          <PriorityBadge tone={insight.priorityTone}>{isEs ? `Prioridad ${insight.priority}` : insight.priority}</PriorityBadge>
          <span className="rounded-full bg-[var(--color-panel-2)]/60 px-2.5 py-1 text-[11px] font-mono text-[var(--color-fg-dim)]">
            {t.score}: {item.score} · {ageLabel}
          </span>
        </div>

        <a
          href={item.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block text-[16px] sm:text-[18px] font-semibold leading-snug text-[var(--color-fg-strong)] hover:text-[var(--color-accent)] transition-colors break-words"
        >
          {cleanTitle(item.title)}
        </a>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <InsightBox icon={<Lightbulb size={14} />} label={isEs ? "Qué significa" : "Meaning"}>
            {insight.whatItMeans}
          </InsightBox>
          <InsightBox icon={<Target size={14} />} label={isEs ? "Para quién sirve" : "Audience"}>
            {insight.audience}
          </InsightBox>
          <InsightBox icon={<BriefcaseBusiness size={14} />} label={isEs ? "Oportunidad para TerminalSync" : "TerminalSync opportunity"}>
            {insight.opportunity}
          </InsightBox>
          <InsightBox icon={<Megaphone size={14} />} label={isEs ? "Qué hacer hoy" : "Action today"} strong>
            {insight.actionToday}
          </InsightBox>
        </div>

        <div className="mt-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-3">
          <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-amber-200">
            {isEs ? "Hook listo para contenido o ventas" : "Ready-to-use hook"}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-amber-50/90">“{insight.contentHook}”</p>
        </div>

        {(item.summary || item.tags?.length) && (
          <details className="mt-3 group">
            <summary className="cursor-pointer text-[12px] text-[var(--color-fg-dim)] hover:text-[var(--color-fg-muted)]">
              {isEs ? "Ver dato original" : "Show raw signal"}
            </summary>
            <div className="mt-2 rounded-xl bg-[var(--color-panel-2)]/40 p-3 text-[12px] text-[var(--color-fg-muted)]">
              {item.summary && <p className="leading-relaxed">{item.summary}</p>}
              {item.tags && item.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.tags.slice(0, 6).map((tag) => (
                    <span key={tag} className="rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-mono">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </details>
        )}
      </div>

      {status === "pending" && (
        <div className="grid gap-2 p-2 bg-[var(--color-panel-2)]/40 border-t border-[var(--color-border)] sm:grid-cols-3">
          <button
            onClick={() => onTransition("archive")}
            disabled={busy}
            className="h-10 rounded-xl border border-[var(--color-border)] text-[var(--color-fg-muted)] hover:bg-[var(--color-panel-2)] disabled:opacity-50 text-[12px] font-medium inline-flex items-center justify-center gap-1.5 transition-colors"
          >
            <Archive size={12} />
            {busy ? "…" : t.archive}
          </button>
          <button
            onClick={() => onTransition("keep")}
            disabled={busy}
            className="h-10 rounded-xl border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-50 text-[12px] font-medium inline-flex items-center justify-center gap-1.5 transition-colors"
          >
            <CheckCircle2 size={12} />
            {busy ? "…" : t.keep}
          </button>
          <button
            onClick={() => onTransition("promote")}
            disabled={busy}
            className="h-10 rounded-xl text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] disabled:opacity-50 text-[12px] font-medium inline-flex items-center justify-center gap-1.5 transition-colors"
          >
            <TrendingUp size={12} />
            {busy ? "…" : t.promote}
          </button>
        </div>
      )}
    </li>
  );
}

function buildBriefing(items: TrendItem[]) {
  const insights = items.map((item) => buildBusinessInsight(item, true));
  const high = insights.filter((i) => i.priority === "Alta").length;
  const sourceCounts = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.source] = (acc[item.source] ?? 0) + 1;
    return acc;
  }, {});
  const topSource = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const hasAgency = insights.some((i) => /agencia|agency/i.test(i.audience + i.actionToday));
  const hasPain = insights.some((i) => /dolor|pain|problema|ventas|clientes/i.test(i.whatItMeans + i.actionToday));
  const hasDemo = insights.some((i) => /demo|n8n|workflow|automatización/i.test(i.actionToday + i.contentHook));

  const nextMoves = [
    hasAgency && "Preparar un mensaje de venta para agencias: ‘entrega más rápido sin perder contexto entre clientes’. ",
    hasPain && "Convertir los dolores repetidos en 3 posts: ventas, soporte y automatización con IA para negocios.",
    hasDemo && "Grabar o escribir una mini demo: TerminalSync + automatizaciones + memoria del cliente.",
    high > 0 && "Abrir las señales de prioridad alta y marcar ‘Usar esta oportunidad’ en las que quieras perseguir.",
  ].filter(Boolean) as string[];

  return {
    high,
    topSource: topSource ? sourceLabel(topSource) : "—",
    nextMoves: nextMoves.slice(0, 3),
  };
}

function buildBusinessInsight(item: TrendItem, isEs: boolean): BusinessInsight {
  const text = `${item.title} ${item.summary ?? ""} ${(item.tags ?? []).join(" ")}`.toLowerCase();
  const title = cleanTitle(item.title);

  const hasAgency = /agency|agencia|marketing|client|cliente|freelance|consult/.test(text);
  const hasAutomation = /automat|automation|workflow|n8n|make|zapier|agent|multi-agent|ai/.test(text);
  const hasBusiness = /business|negocio|empres|small business|founder|startup|sales|ventas|lead|customer|support|soporte/.test(text);
  const hasCreator = /youtube|creator|content|contenido|hook|video/.test(text) || item.source === "youtube";
  const isDevHeavy = item.source === "github" && !hasAgency && !hasBusiness && !hasAutomation;

  if (isDevHeavy) {
    return {
      priority: "Baja",
      priorityTone: "low",
      category: "Ruido técnico",
      whatItMeans: isEs
        ? "Esto parece más técnico que comercial. Puede servir como señal de mercado, pero no requiere acción inmediata tuya."
        : "This is mostly technical noise. Useful as market context, not an immediate business action.",
      audience: isEs ? "Equipo técnico o futuros partners, no JM directamente." : "Technical team or partners.",
      opportunity: isEs
        ? "Usarlo solo para entender hacia dónde va la tecnología; no como campaña principal."
        : "Use it only for technical direction, not as a main campaign.",
      actionToday: isEs
        ? "Archivarlo salvo que conecte claramente con ventas, agencias o empresarios."
        : "Archive unless it clearly connects to sales, agencies, or business owners.",
      contentHook: isEs
        ? "La tecnología cambia todos los días; tu memoria y tu contexto no deberían depender de una sola herramienta."
        : "Tools change every day; your memory and context should not depend on one tool.",
    };
  }

  if (hasAgency && hasAutomation) {
    return {
      priority: "Alta",
      priorityTone: "high",
      category: "Venta a agencias",
      whatItMeans: isEs
        ? "Las agencias están buscando cómo vender y entregar automatizaciones con IA. Eso es una puerta comercial directa."
        : "Agencies are looking for ways to sell and deliver AI automation services.",
      audience: isEs
        ? "Agencias de automatización, marketing, consultores y freelancers que manejan varios clientes."
        : "Automation agencies, marketing agencies, consultants, and freelancers.",
      opportunity: isEs
        ? "Posicionar TerminalSync como el lugar donde la agencia guarda contexto, prompts, archivos y decisiones por cliente."
        : "Position TerminalSync as the workspace where agencies keep client context, prompts, files, and decisions.",
      actionToday: isEs
        ? "Crear una oferta o demo: ‘tu agencia IA con memoria por cliente’."
        : "Create an offer/demo: ‘your AI agency with client memory’. ",
      contentHook: isEs
        ? "Si tu agencia usa IA pero pierde contexto entre clientes, no tienes un sistema: tienes chats sueltos."
        : "If your agency uses AI but loses context between clients, you don’t have a system — you have scattered chats.",
    };
  }

  if (hasBusiness && hasAutomation) {
    return {
      priority: "Alta",
      priorityTone: "high",
      category: "Empresarios con dolor operativo",
      whatItMeans: isEs
        ? "Empresarios quieren automatizar ventas, soporte u operaciones, pero necesitan entenderlo en lenguaje simple."
        : "Business owners want to automate sales, support, or operations in simple language.",
      audience: isEs
        ? "Dueños de negocio, founders, operadores y equipos pequeños que no son devs."
        : "Business owners, founders, operators, and small teams.",
      opportunity: isEs
        ? "Vender TerminalSync como ‘tu equipo IA que recuerda tu negocio y trabaja desde tus archivos’."
        : "Sell TerminalSync as the AI team that remembers the business and works from its files.",
      actionToday: isEs
        ? "Convertir esta señal en una promesa clara de landing o post para empresarios."
        : "Turn this signal into a clear landing-page promise for business owners.",
      contentHook: isEs
        ? "No necesitas ser técnico para usar IA: necesitas que la IA entienda tu negocio, tus archivos y tus decisiones."
        : "You don’t need to be technical to use AI; you need AI to understand your business, files, and decisions.",
    };
  }

  if (hasCreator || item.source === "youtube") {
    return {
      priority: "Media",
      priorityTone: "medium",
      category: "Idea de contenido",
      whatItMeans: isEs
        ? "La conversación puede convertirse en contenido educativo o una pieza de autoridad para atraer clientes."
        : "This can become educational content or thought leadership.",
      audience: isEs ? "Prospectos que están aprendiendo IA para negocio." : "Prospects learning AI for business.",
      opportunity: isEs
        ? "Usar el tema para explicar TerminalSync con ejemplos simples y no técnicos."
        : "Use the topic to explain TerminalSync with simple, non-technical examples.",
      actionToday: isEs
        ? "Escribir un post corto o guion de video usando el hook de abajo."
        : "Write a short post or video script using the hook below.",
      contentHook: isEs
        ? `Lo importante de “${shorten(title)}” no es la herramienta: es cómo te ayuda a vender, operar o atender mejor.`
        : `The important part of “${shorten(title)}” is not the tool; it is how it helps you sell or operate better.`,
    };
  }

  return {
    priority: "Media",
    priorityTone: "medium",
    category: "Señal de mercado",
    whatItMeans: isEs
      ? "Hay movimiento alrededor de este tema. Puede servir para ajustar mensaje, contenido o propuesta."
      : "There is market movement around this topic.",
    audience: isEs ? "Empresarios, agencias o early adopters de IA." : "Business owners, agencies, or AI early adopters.",
    opportunity: isEs
      ? "Conectarlo con el mensaje central: IA útil cuando conserva memoria, contexto y archivos del negocio."
      : "Connect it to the core message: AI is useful when it keeps business memory, context, and files.",
    actionToday: isEs
      ? "Guardarlo si te inspira una campaña; descartarlo si no puedes convertirlo en venta o contenido."
      : "Keep it if it inspires a campaign; archive if it cannot become sales or content.",
    contentHook: isEs
      ? "La pregunta no es qué IA usar; la pregunta es cómo hacer que la IA trabaje con el contexto real de tu negocio."
      : "The question is not which AI to use; it is how to make AI work with your real business context.",
  };
}

function cleanTitle(title: string) {
  return title.replace(/\s+—\s*$/, "").replace(/&amp;/g, "&").trim();
}

function shorten(value: string, max = 72) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function sourceLabel(source: string) {
  if (source === "hackernews") return "HN";
  if (source === "youtube") return "YouTube";
  if (source === "reddit") return "Reddit";
  if (source === "github") return "GitHub";
  return source;
}

function PriorityBadge({ tone, children }: { tone: BusinessInsight["priorityTone"]; children: React.ReactNode }) {
  const cls =
    tone === "high"
      ? "border-emerald-400/30 bg-emerald-400/15 text-emerald-100"
      : tone === "medium"
        ? "border-amber-400/30 bg-amber-400/15 text-amber-100"
        : "border-zinc-400/20 bg-zinc-400/10 text-zinc-300";
  return <span className={`rounded-full border px-2.5 py-1 text-[11px] font-mono ${cls}`}>{children}</span>;
}

function InsightBox({
  icon,
  label,
  children,
  strong,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-3 ${strong ? "border-emerald-400/25 bg-emerald-400/10" : "border-[var(--color-border)] bg-[var(--color-panel-2)]/30"}`}>
      <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.12em] text-[var(--color-fg-dim)]">
        {icon}
        {label}
      </div>
      <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--color-fg-muted)]">{children}</p>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-emerald-100/70">{label}</p>
      <p className="mt-1 text-[20px] font-semibold text-white">{value}</p>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors inline-flex items-center ${
        active
          ? "bg-[var(--color-accent)] text-white"
          : "bg-[var(--color-panel-2)]/60 text-[var(--color-fg-muted)] hover:bg-[var(--color-panel-2)]"
      }`}
    >
      {children}
    </button>
  );
}

function Banner({
  tone,
  children,
}: {
  tone: "muted" | "warn" | "error" | "success";
  children: React.ReactNode;
}) {
  const cls =
    tone === "error"
      ? "border-red-500/40 bg-red-500/10 text-red-400"
      : tone === "warn"
        ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
        : tone === "success"
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
          : "border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-fg-muted)]";
  return <div className={`rounded-2xl border p-4 text-[13px] ${cls}`}>{children}</div>;
}
