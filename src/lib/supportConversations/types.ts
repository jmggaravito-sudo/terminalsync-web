// Shared shapes for the admin "Soporte" panel — reads
// `support_conversations` / `support_conversation_sessions`
// (supabase/migrations/0030_support_conversations.sql). The n8n "Sync-AI"
// workflow behind /api/agent writes rows here; nothing in terminalsync-web
// writes to this table (yet).
//
// Extension point for the S3 train (support_corrections / "fix a bad
// answer"): it reads `SupportConversationTurn.id` as the FK it needs
// (`support_corrections.conversation_id`). Add fields there, not here.

export const SUPPORT_CHANNELS = ["app", "web"] as const;
export type SupportChannel = (typeof SUPPORT_CHANNELS)[number];

export function isSupportChannel(v: unknown): v is SupportChannel {
  return typeof v === "string" && (SUPPORT_CHANNELS as readonly string[]).includes(v);
}

export const SUPPORT_REASONS = [
  "unknown",
  "billing",
  "requested",
  "frustration",
  "conflict",
] as const;
export type SupportReason = (typeof SUPPORT_REASONS)[number];

export function isSupportReason(v: unknown): v is SupportReason {
  return typeof v === "string" && (SUPPORT_REASONS as readonly string[]).includes(v);
}

/** Queue list filters. "escalated" / "unknown" mirror the two badge kinds
 *  the list shows: a hand-off to a human, or a "the bot didn't know"
 *  gap — independent signals, see the migration's comment on `reason`. */
export const SUPPORT_QUEUE_FILTERS = ["all", "escalated", "unknown"] as const;
export type SupportQueueFilter = (typeof SUPPORT_QUEUE_FILTERS)[number];

export function isSupportQueueFilter(v: unknown): v is SupportQueueFilter {
  return typeof v === "string" && (SUPPORT_QUEUE_FILTERS as readonly string[]).includes(v);
}

/** One row from `support_conversation_sessions` — a session_id's worth of
 *  turns, aggregated for the queue list. */
export type SupportConversationSession = {
  sessionId: string;
  firstTurnAt: string;
  lastTurnAt: string;
  turnCount: number;
  channel: SupportChannel;
  locale: string | null;
  plan: string | null;
  topic: string | null;
  hasEscalation: boolean;
  escalationReasons: SupportReason[];
  hasUnknownGap: boolean;
};

/** One row from `support_conversations` — a single turn, for the thread view. */
export type SupportConversationTurn = {
  id: string;
  createdAt: string;
  channel: SupportChannel;
  locale: string | null;
  plan: string | null;
  question: string;
  answer: string;
  escalated: boolean;
  reason: SupportReason | null;
  topic: string | null;
  promptVersion: string | null;
};

export const SUPPORT_QUEUE_PAGE_SIZE = 25;
