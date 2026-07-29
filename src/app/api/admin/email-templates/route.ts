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
    label: "DM corto — Afiliado",
    audience: "creator",
    locale: "es",
    subject: "DM afiliado ES",
    body:
      "Hola {name} — {hook}la mayoría de las herramientas de IA olvidan lo que hacías apenas cambias de app o de modelo. TerminalSync mantiene tu trabajo vivo entre Claude, Gemini y Codex. Otras te ayudan a empezar; esta te ayuda a continuar. ¿Te abro una cuenta gratis para probar? Hay programa de afiliados si te cuadra.",
  },
  {
    workflow_id: INFLUENCER_WORKFLOW_ID,
    workflow_name: INFLUENCER_WORKFLOW_NAME,
    slug: "dm-affiliate-short",
    label: "Short DM — Affiliate",
    audience: "creator",
    locale: "en",
    subject: "Affiliate DM EN",
    body:
      "Hey {name} — {hook}most AI tools forget what you're doing the second you switch apps or models. TerminalSync keeps your work alive across Claude, Gemini & Codex. Other tools help you start; this one helps you continue. Open to a free account to try it? Affiliate program too if it clicks.",
  },
  {
    workflow_id: INFLUENCER_WORKFLOW_ID,
    workflow_name: INFLUENCER_WORKFLOW_NAME,
    slug: "dm-user-short",
    label: "DM corto — Usuario/Creator",
    audience: "creator",
    locale: "es",
    subject: "DM usuario ES",
    body:
      "Hola {name} — {hook}la mayoría de las herramientas de IA olvidan lo que hacías apenas cambias de app o de modelo. TerminalSync mantiene tu contexto, archivos e historial entre Claude, Gemini y Codex. Otras te ayudan a empezar; esta te ayuda a continuar. Gratis para probar → terminalsync.ai",
  },
  {
    workflow_id: INFLUENCER_WORKFLOW_ID,
    workflow_name: INFLUENCER_WORKFLOW_NAME,
    slug: "dm-user-short",
    label: "Short DM — User/Creator",
    audience: "creator",
    locale: "en",
    subject: "User DM EN",
    body:
      "Hey {name} — {hook}most AI tools forget what you're doing the second you switch apps or models. TerminalSync keeps your context, files & history alive across Claude, Gemini & Codex. Other tools help you start; this one helps you continue. Free to try → terminalsync.ai",
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

  return error;
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
 * historically lived in code. On read, this admin endpoint seeds any
 * missing rows into Supabase once so JM can edit them in the dashboard
 * like the email templates.
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
