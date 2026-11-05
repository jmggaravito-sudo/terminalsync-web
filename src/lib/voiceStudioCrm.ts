// ── Frappe CRM integration for Voice Studio ──────────────────────────────
// Per the frappe-crm-base handoff: the CRM is the system of record for
// leads/deals; the landing writes in one direction only (landing → Frappe)
// and never duplicates data. Upsert key is EMAIL — VS leads arrive without
// a phone and the base's whatsapp upsert key is MTC-specific (the doctype
// does not enforce it; verified 2026-11-05).
//
// All functions are fail-open by design: callers (lead capture, license
// acceptance, Stripe webhook) must keep working when the CRM is down —
// triage email / payment emails are the fallback, not the source of truth.

export const VS_LANDING_URL = "https://terminalsync.ai/voice-studio";
export const VS_CAMPANA = "voice-studio";

export type CrmResult = "created" | "existing" | "skipped" | "error";

interface FrappeEnv {
  site: string;
  auth: string;
}

function frappeEnv(): FrappeEnv | null {
  const site = process.env.FRAPPE_VOICE_SITE_URL?.trim().replace(/\/$/, "");
  const key = process.env.FRAPPE_VOICE_API_KEY?.trim();
  const secret = process.env.FRAPPE_VOICE_API_SECRET?.trim();
  if (!site || !key || !secret) return null;
  return { site, auth: `token ${key}:${secret}` };
}

async function frappeFetch<T>(
  crm: FrappeEnv,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${crm.site}${path}`, {
    ...init,
    headers: {
      Authorization: crm.auth,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    throw new Error(
      `Frappe ${path} → ${res.status}: ${(await res.text()).slice(0, 200)}`,
    );
  }
  return res.json() as Promise<T>;
}

async function findLeadByEmail(
  crm: FrappeEnv,
  email: string,
): Promise<{ name: string; status: string } | null> {
  const filters = encodeURIComponent(
    JSON.stringify([["email", "=", email]]),
  );
  const search = await frappeFetch<{ data: { name: string; status: string }[] }>(
    crm,
    `/api/resource/CRM%20Lead?filters=${filters}&limit_page_length=1&fields=${encodeURIComponent(JSON.stringify(["name", "status"]))}`,
  );
  return search.data?.[0] ?? null;
}

/** Create the lead + ensure one deal. Never touches existing docs. */
export async function upsertVoiceStudioLead(lead: {
  name: string;
  email: string;
}): Promise<CrmResult> {
  const crm = frappeEnv();
  if (!crm) return "skipped";
  try {
    const existing = await findLeadByEmail(crm, lead.email);
    if (existing) return "existing";

    const created = await frappeFetch<{ data: { name: string } }>(
      crm,
      "/api/resource/CRM%20Lead",
      {
        method: "POST",
        body: JSON.stringify({
          first_name: lead.name,
          email: lead.email,
          source: "Landing",
          campana: VS_CAMPANA,
          landing_url: VS_LANDING_URL,
        }),
      },
    );
    await ensureDeal(crm, created.data.name);
    return "created";
  } catch (err) {
    console.error("[voice-studio-crm] upsert failed", err);
    return "error";
  }
}

async function ensureDeal(crm: FrappeEnv, leadName: string): Promise<void> {
  const filters = encodeURIComponent(
    JSON.stringify([["lead", "=", leadName]]),
  );
  const deals = await frappeFetch<{ data: unknown[] }>(
    crm,
    `/api/resource/CRM%20Deal?filters=${filters}&limit_page_length=1`,
  );
  if (!deals.data?.length) {
    await frappeFetch(crm, "/api/resource/CRM%20Deal", {
      method: "POST",
      body: JSON.stringify({ lead: leadName }),
    });
  }
}

/**
 * Move the lead forward on license acceptance: Calificado means "license
 * signed, sample approved to produce". Only upgrades — never downgrades
 * or overwrites the seller's later-stage work.
 */
export async function markLeadLicensed(
  email: string,
  licenseVersion: string,
): Promise<CrmResult> {
  const crm = frappeEnv();
  if (!crm) return "skipped";
  try {
    const lead = await findLeadByEmail(crm, email);
    if (!lead) return "error";
    if (lead.status === "Nuevo" || lead.status === "Contactado") {
      await frappeFetch(crm, `/api/resource/CRM%20Lead/${encodeURIComponent(lead.name)}`, {
        method: "PUT",
        body: JSON.stringify({ status: "Calificado" }),
      });
    }
    // Best-effort audit trail on the lead (permission may not include
    // Comment — the acceptance email to hola@ is the durable record).
    try {
      await frappeFetch(crm, "/api/resource/Comment", {
        method: "POST",
        body: JSON.stringify({
          comment_type: "Comment",
          reference_doctype: "CRM Lead",
          reference_name: lead.name,
          content: `Voice license ${licenseVersion} accepted (digital signature).`,
        }),
      });
    } catch (err) {
      console.error("[voice-studio-crm] comment failed", err);
    }
    return "existing";
  } catch (err) {
    console.error("[voice-studio-crm] markLeadLicensed failed", err);
    return "error";
  }
}

/**
 * Payment landed (Stripe checkout completed): the deal is Won — this
 * creator is now a paying client. Called from the Stripe webhook; matched
 * by the checkout email. Fail-open.
 */
export async function markDealWonByEmail(email: string): Promise<CrmResult> {
  const crm = frappeEnv();
  if (!crm) return "skipped";
  try {
    const lead = await findLeadByEmail(crm, email);
    if (!lead) return "error";
    const filters = encodeURIComponent(JSON.stringify([["lead", "=", lead.name]]));
    const deals = await frappeFetch<{ data: { name: string; status: string }[] }>(
      crm,
      `/api/resource/CRM%20Deal?filters=${filters}&limit_page_length=1&fields=${encodeURIComponent(JSON.stringify(["name", "status"]))}`,
    );
    const deal = deals.data?.[0];
    if (!deal) return "error";
    if (deal.status !== "Ganado") {
      await frappeFetch(crm, `/api/resource/CRM%20Deal/${encodeURIComponent(deal.name)}`, {
        method: "PUT",
        body: JSON.stringify({ status: "Ganado" }),
      });
    }
    return "existing";
  } catch (err) {
    console.error("[voice-studio-crm] markDealWonByEmail failed", err);
    return "error";
  }
}

/** Lead + deal snapshot for the ops view (read-only, no duplication). */
export async function fetchVoiceStudioLeads(): Promise<{
  leads: {
    name: string;
    first_name: string;
    email: string;
    status: string;
    source: string;
    creation: string;
  }[];
  deals: { name: string; lead: string; status: string }[];
} | null> {
  const crm = frappeEnv();
  if (!crm) return null;
  try {
    const leadFilters = encodeURIComponent(
      JSON.stringify([["campana", "=", VS_CAMPANA]]),
    );
    const leads = await frappeFetch<{
      data: {
        name: string;
        first_name: string;
        email: string;
        status: string;
        source: string;
        creation: string;
      }[];
    }>(
      crm,
      `/api/resource/CRM%20Lead?filters=${leadFilters}&limit_page_length=0&fields=${encodeURIComponent(JSON.stringify(["name", "first_name", "email", "status", "source", "creation"]))}`,
    );
    const deals = await frappeFetch<{
      data: { name: string; lead: string; status: string }[];
    }>(
      crm,
      `/api/resource/CRM%20Deal?limit_page_length=0&fields=${encodeURIComponent(JSON.stringify(["name", "lead", "status"]))}`,
    );
    return { leads: leads.data ?? [], deals: deals.data ?? [] };
  } catch (err) {
    console.error("[voice-studio-crm] fetch for ops view failed", err);
    return null;
  }
}
