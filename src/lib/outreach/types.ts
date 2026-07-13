export const OP_STATUSES = ["pendiente", "enviado", "respondio", "descartado"] as const;
export type OpStatus = (typeof OP_STATUSES)[number];

export function isOpStatus(v: unknown): v is OpStatus {
  return typeof v === "string" && (OP_STATUSES as readonly string[]).includes(v);
}

export type Lead = {
  id: number | string;
  handle: string | null;
  platform: string | null;
  name: string | null;
  subscribers: number | null;
  niche: string | null;
  track: string | null;
  language: string | null;
  source_keyword: string | null;
  profile_url: string | null;
  discovered_at: string | null;
  op_status: OpStatus;
  op_hook: string | null;
  op_notes: string | null;
  op_last_message: string | null;
  op_contacted_at: string | null;
};
