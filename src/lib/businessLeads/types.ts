export const BUSINESS_LEAD_STATUSES = [
  "nuevo",
  "contactado",
  "agendado",
  "cliente",
  "descartado",
] as const;
export type BusinessLeadStatus = (typeof BUSINESS_LEAD_STATUSES)[number];

export function isBusinessLeadStatus(v: unknown): v is BusinessLeadStatus {
  return typeof v === "string" && (BUSINESS_LEAD_STATUSES as readonly string[]).includes(v);
}

export type BusinessLead = {
  id: string;
  source: "google_maps" | "manual";
  source_keyword: string | null;
  niche: string | null;
  city: string | null;
  country: string | null;
  place_id: string | null;
  name: string;
  category: string | null;
  address: string | null;
  phone: string | null;
  phone_e164: string | null;
  website_url: string | null;
  google_maps_url: string | null;
  rating: number | null;
  reviews_count: number | null;
  email: string | null;
  status: BusinessLeadStatus;
  notes: string | null;
  contacted_at: string | null;
  discovered_at: string | null;
  updated_at: string | null;
};
