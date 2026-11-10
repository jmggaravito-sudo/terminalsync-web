import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const entitlementFields = "id,sku,starts_at,ends_at,video_total,video_used,short_total,short_used";
export const orderFields = "id,entitlement_id,source_url,notes,short_mode,short_timestamp,status,video_url,short_url,created_at,video_units";
export const uuidPattern = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
export const timestampPattern = /^(?:[0-9]{1,2}:[0-5][0-9]:[0-5][0-9]|[0-5]?[0-9]:[0-5][0-9])$/;

export type Entitlement = {
  id: string;
  sku: "trial" | "single" | "pack4" | "pack8";
  starts_at: string;
  ends_at: string | null;
  video_total: number;
  video_used: number;
  short_total: number;
  short_used: number;
};
export type ShortMode = "none" | "best_moment" | "timestamp";
export type OrderStatus = "queued" | "in_progress" | "delivered";
export type OrderInput = {
  source_url: string;
  notes: string;
  short_mode: ShortMode;
  short_timestamp: string | null;
};
export type ProductionOrder = OrderInput & {
  id: string;
  entitlement_id: string;
  status: OrderStatus;
  video_url: string | null;
  short_url: string | null;
  created_at: string;
  video_units: number;
};
type StoredOrder = ProductionOrder & { email: string };
export type OpsOrder = StoredOrder & { sku: Entitlement["sku"] };

export function publicOrder(order: ProductionOrder, includeDraftLinks = false): ProductionOrder {
  const { id, entitlement_id, source_url, notes, short_mode, short_timestamp,
    status, video_url, short_url, created_at, video_units } = order;
  return { id, entitlement_id, source_url, notes, short_mode, short_timestamp,
    status,
    video_url: includeDraftLinks || status === "delivered" ? video_url : null,
    short_url: includeDraftLinks || status === "delivered" ? short_url : null,
    created_at, video_units };
}

export function database() {
  const db = getSupabaseAdmin();
  if (!db) throw new Error("Voice Studio production storage not configured");
  return db;
}

export async function readProduction(email: string) {
  const db = database();
  const [plans, orders] = await Promise.all([
    db.from("voice_studio_entitlements").select(entitlementFields)
      .eq("email", email).order("starts_at", { ascending: false }),
    db.from("voice_studio_production_orders").select(orderFields)
      .eq("email", email).order("created_at", { ascending: false }).limit(250),
  ]);
  if (plans.error || orders.error) throw plans.error ?? orders.error;
  return { entitlements: (plans.data ?? []) as Entitlement[],
    orders: ((orders.data ?? []) as ProductionOrder[]).map((order) => publicOrder(order)) };
}

export async function submitProduction(email: string, entitlementId: string, requestId: string, orders: OrderInput[]) {
  const result = await database().rpc("voice_studio_submit_orders", {
    p_email: email, p_entitlement_id: entitlementId, p_request_id: requestId, p_orders: orders,
  });
  if (result.error) throw result.error;
  return ((result.data ?? []) as ProductionOrder[]).map((order) => publicOrder(order));
}

export async function readOpsOrders(status: OrderStatus, page: number) {
  const db = database();
  const size = 30;
  const result = await db.from("voice_studio_production_orders")
    .select(`${orderFields},email,voice_studio_entitlements!inner(sku)`)
    .eq("status", status)
    .order("created_at", { ascending: status === "queued" })
    .order("id")
    .range(page * size, page * size + size);
  if (result.error) throw result.error;
  const rows = (result.data ?? []) as unknown as Array<StoredOrder & {
    voice_studio_entitlements: { sku: Entitlement["sku"] };
  }>;
  return { orders: rows.slice(0, size).map((r) => ({
    ...publicOrder(r, true), email: r.email, sku: r.voice_studio_entitlements.sku,
  })), hasMore: rows.length > size };
}

export async function updateProduction(id: string, status: OrderStatus, videoUrl: string | null, shortUrl: string | null, videoUnits: number) {
  const result = await database().rpc("voice_studio_update_order", {
    p_order_id: id, p_status: status, p_video_url: videoUrl, p_short_url: shortUrl,
    p_video_units: videoUnits,
  });
  if (result.error) throw result.error;
}

export function productionError(error: unknown): { status: number; message: string } {
  const message = error && typeof error === "object" && "message" in error
    ? String(error.message) : "";
  switch (message) {
    case "VOICE_STUDIO_NO_ACTIVE_PLAN":
      return { status: 409, message: "This plan is not active for your account." };
    case "VOICE_STUDIO_INSUFFICIENT_CREDITS":
      return { status: 409, message: "Not enough credits remain in this plan." };
    case "VOICE_STUDIO_IDEMPOTENCY_CONFLICT":
      return { status: 409, message: "This request was already used for a different submission." };
    case "VOICE_STUDIO_SHORT_NOT_INCLUDED":
      return { status: 400, message: "This plan does not include Shorts or Reels." };
    case "VOICE_STUDIO_INVALID_ORDER":
      return { status: 400, message: "Please check the order details and try again." };
    case "VOICE_STUDIO_ORDER_NOT_FOUND":
      return { status: 404, message: "Order not found." };
    case "VOICE_STUDIO_INVALID_TRANSITION":
      return { status: 409, message: "That change is not allowed for this order." };
    case "VOICE_STUDIO_MISSING_DELIVERABLE":
      return { status: 400, message: "Add the dubbed video and the Short/Reel if included before delivering." };
    default:
      return { status: 503, message: "Voice Studio is temporarily unavailable. Please try again." };
  }
}

export function normalizeYouTube(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 2048) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.port || url.username || url.password) return null;
    const host = url.hostname;
    const parts = url.pathname.split("/").filter(Boolean);
    let id: string | null = null;
    if (host === "youtu.be" && parts.length === 1) id = parts[0];
    if (["www.youtube.com", "youtube.com", "m.youtube.com"].includes(host)) {
      if (parts.length === 1 && parts[0] === "watch") id = url.searchParams.get("v");
      if (parts.length === 2 && ["shorts", "live", "embed"].includes(parts[0])) id = parts[1];
    }
    return id && /^[a-zA-Z0-9_-]{11}$/.test(id)
      ? `https://www.youtube.com/watch?v=${id}` : null;
  } catch { return null; }
}

export function parseOrder(value: unknown): OrderInput | null {
  if (!value || typeof value !== "object") return null;
  const order = value as Record<string, unknown>;
  const source_url = normalizeYouTube(order.source_url);
  const notes = order.notes == null ? "" : typeof order.notes === "string" ? order.notes.trim() : null;
  const short_mode = order.short_mode;
  const short_timestamp = typeof order.short_timestamp === "string" ? order.short_timestamp.trim() : null;
  if (!source_url || notes === null || notes.length > 2000 ||
      (short_mode !== "none" && short_mode !== "best_moment" && short_mode !== "timestamp") ||
      (short_mode === "timestamp" ? !short_timestamp || !timestampPattern.test(short_timestamp) : short_timestamp)) {
    return null;
  }
  return { source_url, notes, short_mode, short_timestamp };
}
