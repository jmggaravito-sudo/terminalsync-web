import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 0;

/**
 * GET /api/admin/ops
 *
 * Single pane of glass over every n8n workflow JM runs. Pulls the full
 * workflow list + the last 24h of executions in parallel from the n8n
 * public API, then joins them with a curated description map so the
 * dashboard reads more like a status report than a raw API dump.
 *
 * No auth — same reasoning as /api/admin/trends. The page lives at
 * /admin/* (robots: noindex), the n8n API key never leaves the server,
 * and the response is read-only metadata about JM's own workflows.
 */

const N8N_URL = process.env.N8N_URL ?? "https://n8n.nexflowai.net";
const N8N_API_KEY = process.env.N8N_API_KEY ?? "";

/**
 * Curated metadata per workflow ID. Lives here (not in Supabase) because
 * (a) it's small and (b) when JM ships a new workflow the same PR can
 * register it. The dashboard falls back to project-from-prefix detection
 * for any ID not in this map, so adding entries is purely additive.
 */
const WORKFLOW_META: Record<
  string,
  { project: string; description: string; cadence?: string }
> = {
  // MueveTuCarro
  FMrDyieW4XjSnmpr: {
    project: "MTC",
    description:
      "Wendy — bot principal vía GHL WhatsApp + FB + IG. No muestra precios, vendedores cotizan manual.",
    cadence: "on-message",
  },
  NefGWoZfbQYPJWEn: {
    project: "MTC",
    description:
      "Simon v2 813 — WhatsApp directo, cotiza con precios + Stripe link, follow-ups automáticos.",
    cadence: "on-message",
  },
  ksuDSHamcVxZiCgn: {
    project: "MTC",
    description: "Simon Bot 954 (Flujo 5) — reenvía intl al Simon 813.",
    cadence: "on-message",
  },
  TBtZbweMtO3yulhz: {
    project: "MTC",
    description: "Stripe Payment Webhook — cobro confirmado mueve a 'Depósito Recibido'.",
    cadence: "on-payment",
  },
  YGAp0GKXjhFlDils: {
    project: "MTC",
    description: "Webhook Verify Meta para 813.",
    cadence: "on-meta-verify",
  },
  a6BPgp1MK7fuys18: {
    project: "MTC",
    description: "Follow-Up Sequence — recordatorios 10min/50min/23hr si no paga.",
    cadence: "on-trigger",
  },
  W5GM6itFiLmzPbot: {
    project: "MTC",
    description: "SMS Auto-Reply → WhatsApp.",
    cadence: "on-sms",
  },
  VQTgsxxH1EN3N9M0: {
    project: "MTC",
    description: "Sync Contact Fields → Opportunity en GHL.",
    cadence: "on-update",
  },
  oRHzjY5AAWSTixWj: {
    project: "MTC",
    description: "Error Alert — me avisa cuando un workflow MTC falla.",
    cadence: "on-error",
  },

  // NexFlowAI
  GdullBegOsgH0M9A: {
    project: "NexFlowAI",
    description:
      "Router Maestro — recibe IG/Messenger/WA y enruta a Alex (membresías) o Sofía (afiliados).",
    cadence: "on-message",
  },
  SCxBhDfCX3WxaLlM: {
    project: "NexFlowAI",
    description:
      "Alex Vendedor — bot de ventas IG/Messenger, califica y cierra venta de membresía.",
    cadence: "on-message",
  },
  j78U5Lz9LOqcHDCw: {
    project: "NexFlowAI",
    description:
      "Sofía Afiliados — recomienda productos del Sheet de afiliados según contexto.",
    cadence: "on-message",
  },
  OXT9Whp7FRUfQmuX: {
    project: "NexFlowAI",
    description: "WhatsApp Demo Bot — simula asistente del negocio para mostrar valor.",
    cadence: "on-message",
  },
  M2LeswTNWU6Pgp1X: {
    project: "NexFlowAI",
    description: "Demo Builder — crea sub-cuenta GHL con snapshot por nicho.",
    cadence: "on-trigger",
  },
  bQy7EhabXj3RWEFR: {
    project: "NexFlowAI",
    description: "Onboarding Manager — secuencia de 6 emails post-signup.",
    cadence: "on-trigger",
  },
  jQbkQRcHOJ5MV9U9: {
    project: "NexFlowAI",
    description: "Stripe Onboarding — pago USD → crea sub-cuenta + dispara onboarding.",
    cadence: "on-payment",
  },
  bFhXz0fNEIooTQUD: {
    project: "NexFlowAI",
    description: "MercadoPago Onboarding — pago COP → crea sub-cuenta + dispara onboarding.",
    cadence: "on-payment",
  },
  dF06ocpc6DCsUtx9: {
    project: "NexFlowAI",
    description: "Cron Inactividad Onboarding — recordatorios cada 6h si >48h sin avance.",
    cadence: "every 6h",
  },
  utdwJzF49yjYCZqS: {
    project: "NexFlowAI",
    description: "Follow-up Afiliados 24h — tutoriales + cross-sell para tag affiliate-tracking.",
    cadence: "every 12h",
  },
  fQUYYUcdaFUozYYO: {
    project: "NexFlowAI",
    description: "WA Demo Verify — handshake del webhook de WhatsApp Demo.",
    cadence: "on-meta-verify",
  },
  tcU97fs9a7wD3Iwz: {
    project: "NexFlowAI",
    description: "Alex Afiliados — sub-router por producto (no conectado al Router aún).",
    cadence: "on-message",
  },
  WqCAI10ijdFXS9jm: {
    project: "NexFlowAI",
    description: "Resend Darwin Lead — relay vía email.",
    cadence: "on-trigger",
  },

  // Kelaya
  N5kQic6k3G4MA8BZ: {
    project: "Kelaya",
    description: "Kelaya bot — WhatsApp + GHL + Square (booking + pagos).",
    cadence: "on-message",
  },
  "8LhCpkRWG6IDsuDd": {
    project: "Kelaya",
    description: "Kelaya follow-up — recordatorios 5min/30min/2h/24h si no paga.",
    cadence: "on-trigger",
  },

  // Selva
  KmUQRHZNizyEqYcN: {
    project: "Selva",
    description: "Cerebro Creativo Reels — n8n+Claude brief → MP4 → IG+FB Reels.",
    cadence: "every 6h",
  },
  SwF0rVFHUMP3hXUW: {
    project: "Selva",
    description: "Social Poster Daily — post automático IG+FB con Gemini caption.",
    cadence: "every 24h (10am COL)",
  },

  // TerminalSync
  "7ooGFm2XvT8SLdde": {
    project: "TerminalSync",
    description: "Creator Outreach — captura influencers, sin envío de email (paused hasta launch).",
    cadence: "every 24h",
  },
  "3ad53aIJo6QA1vI0": {
    project: "TerminalSync",
    description: "Marketplace Outreach — captura herramientas/marketplaces, sin envío.",
    cadence: "every 24h",
  },
  "5JJPordwuTwaPPPK": {
    project: "TerminalSync",
    description: "Re-enrich creators — refresca emails/contactos de outreach.",
    cadence: "every 6h",
  },
  "6LuNDI8Hs90WyiUO": {
    project: "TerminalSync",
    description:
      "Connectors & Skills Discovery — YT + X scraper → /admin/discovery para revisar.",
    cadence: "every 24h",
  },
  Gifqx1Fjbtp6z1Ud: {
    project: "TerminalSync",
    description: "Notifier TG+WA — listo, falta token de BotFather + WABA TerminalSync.",
    cadence: "on-trigger",
  },
  j1CWMGmncSyICQ6U: {
    project: "TerminalSync",
    description: "Sync-AI Agent — ventas+soporte+escalation a GHL (inactivo hasta agregar API key).",
    cadence: "on-message",
  },

  // Trends (esta sesión)
  "2gbpZFPPlYMo6k3f": {
    project: "Trends",
    description: "Trend Signals Daily — pulls GitHub + HN + Reddit a trend_signals.",
    cadence: "every 24h (6am COL)",
  },

  // Otros
  EHE4xDeFrvBAXIt5: {
    project: "MTC",
    description: "TEMP — Followup Lost Chats. Trigger manual.",
    cadence: "manual",
  },
  HlcheukdgF7x2vkz: {
    project: "NexFlowAI",
    description: "Trend Hunter (Exploding Topics) — abandonado tras blocker de cookies.",
    cadence: "deprecated",
  },
};

interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  isArchived?: boolean;
  updatedAt?: string;
  createdAt?: string;
  tags?: { id: string; name: string }[];
}

interface N8nExecution {
  id: string;
  workflowId: string;
  status: "success" | "error" | "running" | "waiting" | "canceled" | string;
  startedAt: string;
  stoppedAt?: string;
  finished?: boolean;
}

interface OpsWorkflow {
  id: string;
  name: string;
  active: boolean;
  archived: boolean;
  project: string;
  description: string | null;
  cadence: string | null;
  updatedAt: string | null;
  todayCount: number;
  todaySuccess: number;
  todayError: number;
  lastExec: {
    id: string;
    status: string;
    startedAt: string;
    durationMs: number | null;
  } | null;
  recent: { id: string; status: string; startedAt: string }[];
}

function projectFromName(name: string): string {
  if (/^MTC\b/i.test(name) || /muevetucarro/i.test(name)) return "MTC";
  if (/nexflowai/i.test(name)) return "NexFlowAI";
  if (/kelaya/i.test(name)) return "Kelaya";
  if (/selva/i.test(name)) return "Selva";
  if (/(terminalsync|tsync|sync.ai|outreach|discovery)/i.test(name)) return "TerminalSync";
  if (/trend/i.test(name)) return "Trends";
  return "Other";
}

export async function GET() {
  if (!N8N_API_KEY) {
    return NextResponse.json(
      { error: "N8N_API_KEY env var not set on this deployment" },
      { status: 503 },
    );
  }

  const headers = { "X-N8N-API-KEY": N8N_API_KEY };

  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();

  // Pull workflows and recent executions in parallel. The executions
  // endpoint only takes `limit` (no time filter), so we pull a generous
  // page and filter client-side. 250 covers JM's busiest day so far.
  const [wfRes, execRes] = await Promise.all([
    fetch(`${N8N_URL}/api/v1/workflows?limit=200`, {
      headers,
      cache: "no-store",
    }),
    fetch(`${N8N_URL}/api/v1/executions?limit=250`, {
      headers,
      cache: "no-store",
    }),
  ]);

  if (!wfRes.ok) {
    return NextResponse.json(
      { error: `n8n workflows ${wfRes.status}` },
      { status: 502 },
    );
  }
  if (!execRes.ok) {
    return NextResponse.json(
      { error: `n8n executions ${execRes.status}` },
      { status: 502 },
    );
  }

  const wfJson = (await wfRes.json()) as { data: N8nWorkflow[] };
  const execJson = (await execRes.json()) as { data: N8nExecution[] };

  const workflows = wfJson.data ?? [];
  const allExecs = execJson.data ?? [];
  const recentExecs = allExecs.filter((e) => e.startedAt >= since);

  // Group executions by workflowId for fast lookup.
  const byWorkflow = new Map<string, N8nExecution[]>();
  for (const e of allExecs) {
    const arr = byWorkflow.get(e.workflowId) ?? [];
    arr.push(e);
    byWorkflow.set(e.workflowId, arr);
  }

  const items: OpsWorkflow[] = workflows.map((w) => {
    const meta = WORKFLOW_META[w.id];
    const project = meta?.project ?? projectFromName(w.name);
    const allFor = byWorkflow.get(w.id) ?? [];
    // Sort newest first so [0] is the most recent
    allFor.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
    const todayFor = allFor.filter((e) => e.startedAt >= since);
    const last = allFor[0] ?? null;

    return {
      id: w.id,
      name: w.name,
      active: !!w.active,
      archived: !!w.isArchived,
      project,
      description: meta?.description ?? null,
      cadence: meta?.cadence ?? null,
      updatedAt: w.updatedAt ?? null,
      todayCount: todayFor.length,
      todaySuccess: todayFor.filter((e) => e.status === "success").length,
      todayError: todayFor.filter((e) => e.status === "error").length,
      lastExec: last
        ? {
            id: last.id,
            status: last.status,
            startedAt: last.startedAt,
            durationMs:
              last.stoppedAt && last.startedAt
                ? new Date(last.stoppedAt).getTime() -
                  new Date(last.startedAt).getTime()
                : null,
          }
        : null,
      recent: allFor.slice(0, 5).map((e) => ({
        id: e.id,
        status: e.status,
        startedAt: e.startedAt,
      })),
    };
  });

  // Aggregate per-project totals so the page shows a quick top strip.
  const projects = new Map<string, { total: number; active: number; runs24h: number; errors24h: number }>();
  for (const it of items) {
    const cur = projects.get(it.project) ?? {
      total: 0,
      active: 0,
      runs24h: 0,
      errors24h: 0,
    };
    cur.total += 1;
    if (it.active) cur.active += 1;
    cur.runs24h += it.todayCount;
    cur.errors24h += it.todayError;
    projects.set(it.project, cur);
  }

  return NextResponse.json({
    items,
    projects: Array.from(projects.entries()).map(([name, stats]) => ({
      name,
      ...stats,
    })),
    totals: {
      workflows: items.length,
      active: items.filter((i) => i.active).length,
      runs24h: recentExecs.length,
      errors24h: recentExecs.filter((e) => e.status === "error").length,
    },
    n8nUrl: N8N_URL,
  });
}
