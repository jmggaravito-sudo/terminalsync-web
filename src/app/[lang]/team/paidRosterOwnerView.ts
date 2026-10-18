export type PaidRosterOwnerView = {
  has_active_team: boolean;
  seat_limit: number;
  assigned_count: number;
  occupied_seats: number;
  available_slots: number;
  roster: Array<{ member_number: number; assigned_at: string; eligible: boolean }>;
};

function nonNegativeSafeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

/** Parse only the identifier-free owner projection returned by the API. */
export function parsePaidRosterOwnerView(value: unknown): PaidRosterOwnerView | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (typeof record.has_active_team !== "boolean" || !nonNegativeSafeInteger(record.seat_limit) ||
    !nonNegativeSafeInteger(record.assigned_count) || !nonNegativeSafeInteger(record.occupied_seats) ||
    !nonNegativeSafeInteger(record.available_slots) || !Array.isArray(record.roster)) return null;
  const roster = record.roster.map((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null;
    const member = entry as Record<string, unknown>;
    if (typeof member.member_number !== "number" || !Number.isSafeInteger(member.member_number) || member.member_number < 1 ||
      typeof member.assigned_at !== "string" || typeof member.eligible !== "boolean") return null;
    return { member_number: member.member_number, assigned_at: member.assigned_at, eligible: member.eligible };
  });
  if (roster.some((member) => member === null)) return null;
  return {
    has_active_team: record.has_active_team,
    seat_limit: record.seat_limit,
    assigned_count: record.assigned_count,
    occupied_seats: record.occupied_seats,
    available_slots: record.available_slots,
    roster: roster as PaidRosterOwnerView["roster"],
  };
}
