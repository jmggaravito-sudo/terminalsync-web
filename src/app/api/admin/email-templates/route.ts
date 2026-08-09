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
  {
    workflow_id: INFLUENCER_WORKFLOW_ID,
    workflow_name: INFLUENCER_WORKFLOW_NAME,
    slug: "dm-growth-agency",
    label: "DM · Growth/performance",
    audience: "creator",
    locale: "es",
    subject: "DM growth ES",
    body:
      "Hola {name} — vi que tu contenido toca growth/performance. Tengo una idea para tu audiencia: mostrar cómo una agencia puede usar IA para priorizar leads, preparar follow-up y no perder respuestas entre CRM/WhatsApp/notas. ¿Te mando un ejemplo concreto?",
  },
  {
    workflow_id: INFLUENCER_WORKFLOW_ID,
    workflow_name: INFLUENCER_WORKFLOW_NAME,
    slug: "dm-growth-agency",
    label: "DM · Growth/performance",
    audience: "creator",
    locale: "en",
    subject: "Growth DM EN",
    body:
      "Hey {name} — I saw your content touches growth/performance. I have an idea for your audience: showing how an agency can use AI to prioritize leads, prepare follow-up, and avoid losing replies across CRM/WhatsApp/notes. Want me to send a concrete example?",
  },
  {
    workflow_id: INFLUENCER_WORKFLOW_ID,
    workflow_name: INFLUENCER_WORKFLOW_NAME,
    slug: "dm-consulting-agency",
    label: "DM · Consultores/agencias servicio",
    audience: "creator",
    locale: "es",
    subject: "DM consultoría ES",
    body:
      "Hola {name} — creo que a tu audiencia de consultores/agencias le puede servir un caso práctico: convertir notas de llamadas, propuestas y seguimiento en próximos pasos con IA. No es teoría; es flujo operativo. ¿Te lo mando?",
  },
  {
    workflow_id: INFLUENCER_WORKFLOW_ID,
    workflow_name: INFLUENCER_WORKFLOW_NAME,
    slug: "dm-consulting-agency",
    label: "DM · Consultants/service agencies",
    audience: "creator",
    locale: "en",
    subject: "Consulting DM EN",
    body:
      "Hey {name} — I think your consultants/agency audience may like a practical case: turning call notes, proposals, and follow-up into next steps with AI. Not theory; an operating workflow. Want me to send it?",
  },
  {
    workflow_id: INFLUENCER_WORKFLOW_ID,
    workflow_name: INFLUENCER_WORKFLOW_NAME,
    slug: "dm-saas-founders",
    label: "DM · SaaS/founders",
    audience: "creator",
    locale: "es",
    subject: "DM SaaS ES",
    body:
      "Hola {name} — vi ángulo SaaS/founders en tu contenido. TerminalSync puede mostrar un flujo simple: después de una demo o conversación, la IA resume señales, prepara respuesta y deja el próximo paso claro en CRM. ¿Te mando ejemplo?",
  },
  {
    workflow_id: INFLUENCER_WORKFLOW_ID,
    workflow_name: INFLUENCER_WORKFLOW_NAME,
    slug: "dm-saas-founders",
    label: "DM · SaaS/founders",
    audience: "creator",
    locale: "en",
    subject: "SaaS DM EN",
    body:
      "Hey {name} — I saw a SaaS/founder angle in your content. TerminalSync can show a simple workflow: after a demo or conversation, AI summarizes buying signals, prepares the reply, and keeps the CRM next step clear. Want an example?",
  },
  {
    workflow_id: INFLUENCER_WORKFLOW_ID,
    workflow_name: INFLUENCER_WORKFLOW_NAME,
    slug: "followup-after-demo-offer",
    label: "Follow-up · después de ofrecer demo",
    audience: "creator",
    locale: "es",
    subject: "Te dejo el ejemplo concreto",
    body:
      "Hola {name}, te dejo el ángulo más concreto: una agencia captura leads, la IA prioriza los que valen la pena, prepara el mensaje y cuando responden deja el próximo paso listo para CRM/GHL. Si hace fit con tu audiencia, te muestro la demo en 10 min. ¿Te sirve esta semana?",
  },
  {
    workflow_id: INFLUENCER_WORKFLOW_ID,
    workflow_name: INFLUENCER_WORKFLOW_NAME,
    slug: "followup-after-demo-offer",
    label: "Follow-up · after demo offer",
    audience: "creator",
    locale: "en",
    subject: "Concrete example for you",
    body:
      "Hey {name}, making the angle more concrete: an agency captures leads, AI prioritizes the ones worth pursuing, prepares the message, and when they reply it leaves the next step ready for CRM/GHL. If it fits your audience, I can show the demo in 10 min. Does this week work?",
  },
  {
    workflow_id: INFLUENCER_WORKFLOW_ID,
    workflow_name: INFLUENCER_WORKFLOW_NAME,
    slug: "first-touch",
    label: "Primer email — Audiencia agencias",
    audience: "creator",
    locale: "es",
    subject: "Idea útil para tu audiencia de agencias",
    body: `Hola {{name}},

Vi tu contenido sobre {{topicMention}} y creo que hay un ángulo que puede servirle a tu audiencia: cómo usar IA para ordenar seguimiento, CRM, contenido y tareas repetitivas sin depender de un equipo técnico.

TerminalSync ayuda a convertir ese trabajo diario en flujos prácticos para dueños de negocio y agencias: revisar leads, preparar mensajes, resumir respuestas y decidir el próximo paso.

Si te interesa, te puedo mostrar una demo corta con un caso real para agencias y, si hace fit, te abro una cuenta demo/afiliado.

¿Te sirve que te mande un ejemplo concreto?

— {{senderFirstName}}
TerminalSync`,
  },
  {
    workflow_id: INFLUENCER_WORKFLOW_ID,
    workflow_name: INFLUENCER_WORKFLOW_NAME,
    slug: "first-touch",
    label: "First email — Agency audience",
    audience: "creator",
    locale: "en",
    subject: "Useful idea for your agency audience",
    body: `Hi {{name}},

I saw your content on {{topicMention}} and thought there may be a useful angle for your audience: using AI to clean up follow-up, CRM notes, content ops, and repetitive client work without needing a developer in the middle.

TerminalSync turns that daily work into practical workflows for business owners and agencies: reviewing leads, preparing outreach, summarizing replies, and deciding the next step.

If it sounds relevant, I can show you a short demo built around an agency use case and set up a free demo/affiliate account if it fits.

Want me to send one concrete example?

— {{senderFirstName}}
TerminalSync`,
  },
  {
    workflow_id: INFLUENCER_WORKFLOW_ID,
    workflow_name: INFLUENCER_WORKFLOW_NAME,
    slug: "education-first-touch",
    label: "Primer email — Formación agencias",
    audience: "education",
    locale: "es",
    subject: "Caso práctico de IA para agencias",
    body: `Hola {{contactFirstName}},

Soy {{senderFirstName}}, de TerminalSync. Vi que en {{institutionName}} trabajan contenido sobre {{topicMention}} y creo que podríamos aportar un caso práctico para alumnos, founders o agencias.

La idea no es enseñar otra herramienta de IA, sino mostrar un flujo completo: capturar leads, priorizarlos, preparar seguimiento, registrar respuestas y decidir próximos pasos con ayuda de IA.

Si les interesa, puedo compartir una demo corta o una cuenta de prueba para evaluar si encaja con su comunidad.

¿A quién debería mandarle el ejemplo?

— {{senderFirstName}}
TerminalSync`,
  },
  {
    workflow_id: INFLUENCER_WORKFLOW_ID,
    workflow_name: INFLUENCER_WORKFLOW_NAME,
    slug: "education-first-touch",
    label: "First email — Agency training",
    audience: "education",
    locale: "en",
    subject: "Practical AI ops case for agencies",
    body: `Hi {{contactFirstName}},

I'm {{senderFirstName}} from TerminalSync. I noticed {{institutionName}} teaches content around {{topicMention}}, and I think we could contribute a practical case for students, founders, or agencies.

The point is not another generic AI tool. It is a full workflow: capture leads, prioritize them, prepare follow-up, log replies, and decide next steps with AI support.

If useful, I can share a short demo or a trial account so you can see whether it fits your community.

Who should I send the example to?

— {{senderFirstName}}
TerminalSync`,
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
    "Claude Code",
    "Codex",
    "Gemini",
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
