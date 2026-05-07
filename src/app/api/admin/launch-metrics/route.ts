import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { authenticate, isAdmin } from "@/lib/marketplace/auth";

/**
 * GET /api/admin/launch-metrics
 *
 * Aggregates the KPIs from the launch plan §6 into a single JSON payload
 * the dashboard renders. Reads from three sources and gracefully degrades
 * each one — missing env or upstream timeouts return `null` for that block
 * rather than 500-ing the whole page.
 *
 *   1. Supabase: signups (auth.users), MRR + active subs (subscriptions table)
 *   2. n8n executions: welcome emails fired (workflow 9sMs1ExYtue9ay1n),
 *      replies received (jINNqL72z9yNcKx6)
 *   3. Static: outreach target = 50 (from the curated tracker xlsx)
 *
 * Auth: Bearer access_token + email in ADMIN_EMAILS allowlist.
 */
export const dynamic = "force-dynamic";

const N8N_URL = "https://n8n.nexflowai.net";
const WELCOME_WF_ID = "9sMs1ExYtue9ay1n";
const REPLIES_WF_ID = "jINNqL72z9yNcKx6";
const OUTREACH_TARGET = 50;

interface MetricsPayload {
  generatedAt: string;
  outreach: {
    target: number;
    sent: number | null;
    replied: number | null;
    responseRate: number | null;
  };
  signups: {
    total: number | null;
    last7d: number | null;
    last30d: number | null;
    daily: { day: string; count: number }[] | null;
  };
  revenue: {
    activeSubscriptions: number | null;
    mrr: number | null;
    trialConversionPct: number | null;
  };
  welcomeFlow: {
    fired: number | null;
    failed: number | null;
  };
  warnings: string[];
}

export async function GET(req: Request) {
  const user = await authenticate(req);
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const warnings: string[] = [];
  const out: MetricsPayload = {
    generatedAt: new Date().toISOString(),
    outreach: { target: OUTREACH_TARGET, sent: null, replied: null, responseRate: null },
    signups: { total: null, last7d: null, last30d: null, daily: null },
    revenue: { activeSubscriptions: null, mrr: null, trialConversionPct: null },
    welcomeFlow: { fired: null, failed: null },
    warnings,
  };

  const [supa, n8n] = await Promise.all([fetchSupabase(warnings), fetchN8n(warnings)]);
  if (supa) Object.assign(out, supa);
  if (n8n) {
    out.outreach.replied = n8n.replies;
    out.welcomeFlow = n8n.welcome;
  }

  // Outreach sent — for now fold in the welcome-email-fired count as a
  // proxy until we instrument the actual outbound. The dashboard banner
  // makes this provenance explicit so it's not mistaken for real sends.
  out.outreach.sent = n8n?.welcome?.fired ?? 0;
  if (out.outreach.sent !== null && out.outreach.replied !== null && out.outreach.sent > 0) {
    out.outreach.responseRate = +(out.outreach.replied / out.outreach.sent).toFixed(3);
  }

  return NextResponse.json(out);
}

async function fetchSupabase(warnings: string[]) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    warnings.push("supabase admin not configured");
    return null;
  }
  try {
    const now = Date.now();
    const since30 = new Date(now - 30 * 86400_000).toISOString();
    const since7 = new Date(now - 7 * 86400_000).toISOString();

    // auth.users access through admin client — supabase-js exposes it under
    // .auth.admin.listUsers(). We pull all and bucket client-side; for
    // counts under ~10k this is fine and avoids an RPC.
    const { data: usersList, error: ue } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (ue) throw ue;
    const users = usersList.users || [];

    const total = users.length;
    const last7d = users.filter((u) => u.created_at && u.created_at > since7).length;
    const last30d = users.filter((u) => u.created_at && u.created_at > since30).length;

    // Daily series for last 30 days — sparse fill so the chart shows zeros.
    const dailyMap = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * 86400_000).toISOString().slice(0, 10);
      dailyMap.set(d, 0);
    }
    for (const u of users) {
      if (!u.created_at) continue;
      const d = u.created_at.slice(0, 10);
      if (dailyMap.has(d)) dailyMap.set(d, (dailyMap.get(d) || 0) + 1);
    }
    const daily = Array.from(dailyMap, ([day, count]) => ({ day, count }));

    // Subscriptions — table from the Stripe webhook (`subscriptions` per
    // .env.example notes). Schema we expect: { user_id, status, plan, price_cents, created_at }.
    let activeSubscriptions: number | null = null;
    let mrr: number | null = null;
    let trialConversionPct: number | null = null;
    try {
      const { data: subs, error: se } = await admin
        .from("subscriptions")
        .select("status,price_cents,plan,created_at")
        .in("status", ["active", "trialing", "past_due"]);
      if (se) throw se;
      const active = (subs || []).filter((s) => s.status === "active");
      activeSubscriptions = active.length;
      mrr = +(active.reduce((sum, s) => sum + (s.price_cents || 0), 0) / 100).toFixed(2);
      const trialing = (subs || []).filter((s) => s.status === "trialing").length;
      const totalTrialing = active.length + trialing;
      trialConversionPct = totalTrialing > 0
        ? +((active.length / totalTrialing) * 100).toFixed(1)
        : null;
    } catch (e) {
      warnings.push(
        `subscriptions table unavailable: ${e instanceof Error ? e.message : String(e)}`,
      );
    }

    return {
      signups: { total, last7d, last30d, daily },
      revenue: { activeSubscriptions, mrr, trialConversionPct },
    };
  } catch (e) {
    warnings.push(`supabase: ${e instanceof Error ? e.message : String(e)}`);
    return null;
  }
}

async function fetchN8n(warnings: string[]) {
  const apiKey = process.env.N8N_API_KEY;
  if (!apiKey) {
    warnings.push("N8N_API_KEY not set — welcome/replies counts unavailable");
    return null;
  }
  try {
    const since30 = new Date(Date.now() - 30 * 86400_000).toISOString();

    async function countExecutions(workflowId: string) {
      // n8n public API caps each page; fetch up to 250 then bail. For the
      // launch sprint volumes we never hit the cap, but the bail keeps the
      // dashboard latency bounded.
      const r = await fetch(
        `${N8N_URL}/api/v1/executions?workflowId=${workflowId}&limit=250`,
        { headers: { "X-N8N-API-KEY": apiKey! } },
      );
      if (!r.ok) throw new Error(`n8n ${workflowId} ${r.status}`);
      const json = await r.json();
      const items: Array<{ status?: string; startedAt?: string }> = json.data || [];
      const recent = items.filter((it) => (it.startedAt || "") > since30);
      const fired = recent.filter((it) => it.status === "success").length;
      const failed = recent.filter((it) => it.status === "error" || it.status === "failed").length;
      return { fired, failed };
    }

    const [welcome, replies] = await Promise.all([
      countExecutions(WELCOME_WF_ID).catch((e) => {
        warnings.push(`welcome flow: ${e.message}`);
        return { fired: 0, failed: 0 };
      }),
      countExecutions(REPLIES_WF_ID).catch((e) => {
        warnings.push(`replies flow: ${e.message}`);
        return { fired: 0, failed: 0 };
      }),
    ]);

    return { welcome, replies: replies.fired };
  } catch (e) {
    warnings.push(`n8n: ${e instanceof Error ? e.message : String(e)}`);
    return null;
  }
}
