export const LINKEDIN_LEAD_STATUSES = [
  "nuevo",
  "contactado",
  "respondio",
  "reunion_agendada",
] as const;
export type LinkedinLeadStatus = (typeof LINKEDIN_LEAD_STATUSES)[number];

export function isLinkedinLeadStatus(v: unknown): v is LinkedinLeadStatus {
  return typeof v === "string" && (LINKEDIN_LEAD_STATUSES as readonly string[]).includes(v);
}

export type LinkedinJobStatus = "running" | "done" | "error";

export type LinkedinLead = {
  id: string;
  job_id: string | null;
  keyword: string | null;
  target_titles: string[] | null;
  country: string | null;
  state: string | null;
  city: string | null;
  full_name: string;
  headline: string | null;
  company: string | null;
  location: string | null;
  profile_url: string | null;
  photo_url: string | null;
  recent_posts: string[] | null;
  analysis_summary: string | null;
  drafted_message: string | null;
  status: LinkedinLeadStatus;
  notes: string | null;
  discovered_at: string | null;
  updated_at: string | null;
};

export type LinkedinSearchJob = {
  id: string;
  filters: LinkedinSearchFilters;
  status: LinkedinJobStatus;
  total: number;
  done: number;
  error: string | null;
  started_at: string | null;
  finished_at: string | null;
};

export type LinkedinSearchFilters = {
  keyword: string;
  targetTitles: string[];
  country: "Estados Unidos";
  state?: string;
  city?: string;
  count: number;
};

export type LinkedinSettings = {
  senderName: string;
  companyName: string;
  offerDescription: string;
  language: "es" | "en";
};

/** Cost-estimate constants shown live in the search form. Rough defaults —
 *  adjust here (or wire to env) once real Apify/Anthropic usage is measured. */
export const COST_PER_LEAD_APIFY = Number(process.env.LINKEDIN_COST_PER_LEAD_APIFY ?? "0.01");
export const COST_PER_LEAD_ANTHROPIC = Number(process.env.LINKEDIN_COST_PER_LEAD_ANTHROPIC ?? "0.02");
