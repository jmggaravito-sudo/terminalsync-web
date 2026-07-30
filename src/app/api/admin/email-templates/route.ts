import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const revalidate = 0;

const INFLUENCER_WORKFLOW_ID = "7ooGFm2XvT8SLdde";
const INFLUENCER_WORKFLOW_NAME = "TSync · Captura diaria Influencers YT+X";

type TemplateSeed = {
  workflow_id: string;
  workflow_name: string;
  slug: string;
  label: string;
  audience: string;
  locale: "es" | "en";
  subject: string;
  body: string;
};

const OUTREACH_TEMPLATE_SEEDS: TemplateSeed[] = [
  {
    workflow_id: INFLUENCER_WORKFLOW_ID,
    workflow_name: INFLUENCER_WORKFLOW_NAME,
    slug: "dm-affiliate-short",
    label: "DM corto — Afiliado agencias",
    audience: "creator",
    locale: "es",
    subject: "DM afiliado ES",
    body:
      "Hola {name} — {hook}idea rápida: tu audiencia ya vende servicios, consultorías o trabaja con clientes. Nosotros ayudamos a empresas/agencias a convertir seguimiento, contenido, CRM y tareas repetitivas en flujos con IA que sí se usan en el día a día. Si le sirve a tu audiencia, te abro una cuenta demo gratis y vemos un ángulo de afiliado para mostrar un caso real, no otra herramienta de IA.",
  },
  {
    workflow_id: INFLUENCER_WORKFLOW_ID,
    workflow_name: INFLUENCER_WORKFLOW_NAME,
    slug: "dm-affiliate-short",
    label: "Short DM — Agency affiliate",
    audience: "creator",
    locale: "en",
    subject: "Affiliate DM EN",
    body:
      "Hey {name} — {hook}quick idea: your audience already sells services, retainers, or consulting. We help businesses turn messy follow-up, content, CRM, and repetitive admin into AI-assisted workflows they can actually use every day. If this fits your audience, I can set you up with a free demo account and an affiliate angle so you can show a real business use case, not another generic AI tool.",
  },
  {
    workflow_id: INFLUENCER_WORKFLOW_ID,
    workflow_name: INFLUENCER_WORKFLOW_NAME,
    slug: "dm-user-short",
    label: "DM corto — Dueño/agencia",
    audience: "creator",
    locale: "es",
    subject: "DM negocio ES",
    body:
      "Hola {name} — {hook}creo que esto puede servir para tu negocio: TerminalSync ayuda a equipos a usar IA como una capa operativa para seguimiento, contenido, notas de CRM, trabajo con clientes y tareas repetitivas, sin depender de un dev para todo. Si querés, te muestro un flujo práctico que podrías usar esta semana.",
  },
  {
    workflow_id: INFLUENCER_WORKFLOW_ID,
    workflow_name: INFLUENCER_WORKFLOW_NAME,
    slug: "dm-user-short",
    label: "Short DM — Business/agency",
    audience: "creator",
    locale: "en",
    subject: "Business DM EN",
    body:
      "Hey {name} — {hook}I think this could be useful for your business: TerminalSync helps teams use AI as an operating layer for follow-up, content, CRM notes, client work, and repetitive tasks — without needing a developer in the middle. If you want, I can show you one practical workflow you could use this week.",
  },
];

async function ensureTemplateSeeds(
  sb: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  workflowId: string | null,
) {
  if (workflowId !== INFLUENCER_WORKFLOW_ID) return null;

  const { error } = await sb
    .from("email_templates")
    .upsert(OUTREACH_TEMPLATE_SEEDS, {
      onConflict: "workflow_id,slug,locale",
      ignoreDuplicates: true,
    });

  if (error) return error;

  const existing = await sb
    .from("email_templates")
    .select("id,slug,locale,body")
    .eq("workflow_id", INFLUENCER_WORKFLOW_ID);

  if (existing.error) return existing.error;

  const staleNeedles = [
    "Claude, Gemini",
    "Claude, Gemini & Codex",
    "most AI tools forget",
    "herramientas de IA olvidan",
    "cambias de app o de modelo",
  ];

  for (const row of existing.data ?? []) {
    const body = String(row.body ?? "");
    const isStale = staleNeedles.some((needle) => body.includes(needle));
    if (!isStale) continue;

    const seed = OUTREACH_TEMPLATE_SEEDS.find(
      (tpl) => tpl.slug === row.slug && tpl.locale === row.locale,
    );
    if (!seed) continue;

    const update = await sb
      .from("email_templates")
      .update({
        label: seed.label,
        subject: seed.subject,
        body: seed.body,
      })
      .eq("id", row.id);

    if (update.error) return update.error;
  }

  return null;
}

/**
 * GET /api/admin/email-templates?workflow_id=...
 *
 * Returns the registered outreach / lifecycle templates. Used by the
 * /admin/ops dashboard to render a "Plantillas de outreach" panel
 * under each workflow card. Without `workflow_id` returns the full
 * list grouped by workflow.
 *
 * The influencer workflow has a few short DM/social templates that
 * historically lived in code. On read, this admin endpoint seeds missing
 * rows and upgrades only stale dev-centric copy from the old strategy
 * (Claude/Gemini/Codex wording). JM edits are preserved afterward.
 *
 * No auth — same reasoning as /api/admin/ops. Server-only DB access,
 * page is robots-noindex, JM is the only audience.
 */
export async function GET(req: Request) {
  const sb = getSupabaseAdmin();
  if (!sb)
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const url = new URL(req.url);
  const workflowId = url.searchParams.get("workflow_id");

  const seedError = await ensureTemplateSeeds(sb, workflowId);
  if (seedError) {
    return NextResponse.json({ error: seedError.message }, { status: 500 });
  }

  let q = sb
    .from("email_templates")
    .select("*")
    .order("workflow_name", { ascending: true })
    .order("audience", { ascending: true })
    .order("locale", { ascending: true })
    .order("slug", { ascending: true });

  if (workflowId) q = q.eq("workflow_id", workflowId);

  const { data, error } = await q;
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ items: data ?? [] });
}

/**
 * PATCH /api/admin/email-templates
 * Body: { id, subject?, body?, notes? }
 *
 * In-place edit. JM types directly into the dashboard textarea and
 * saves. No version history yet — we'd add a templates_history table
 * if we ever needed audit trail.
 */
export async function PATCH(req: Request) {
  const sb = getSupabaseAdmin();
  if (!sb)
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const { id, subject, body: emailBody, notes } = body as {
    id?: string;
    subject?: string;
    body?: string;
    notes?: string;
  };
  if (!id || typeof id !== "string")
    return NextResponse.json({ error: "id required" }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (typeof subject === "string") update.subject = subject;
  if (typeof emailBody === "string") update.body = emailBody;
  if (typeof notes === "string") update.updated_notes = notes;

  if (Object.keys(update).length === 0)
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });

  const { error } = await sb.from("email_templates").update(update).eq("id", id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
