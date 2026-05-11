import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const revalidate = 0;

/**
 * GET /api/admin/email-templates?workflow_id=...
 *
 * Returns the registered outreach / lifecycle email templates. Used by
 * the /admin/ops dashboard to render an "Emails" panel under each
 * workflow card. Without `workflow_id` returns the full list grouped
 * by workflow.
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

  let q = sb
    .from("email_templates")
    .select("*")
    .order("workflow_name", { ascending: true })
    .order("audience", { ascending: true })
    .order("locale", { ascending: true });

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
