/**
 * Solicita conciliación; solo evidencia privada de fallo terminal del proveedor
 * habilita una devolución calculada por el servidor. La app no acredita antes. Ver
 * supabase/migrations/0057_ai_credit_refunds.sql.
 *
 * Contrato:
 *   - Autenticado: solo puede devolver gastos de su propia cuenta.
 *   - Una devolución siempre se refiere a un gasto ya registrado
 *     (`originalIdempotencyKey`). Si el gasto todavía no está, responde 409 y la
 *     app reintenta: la cola de la app envía el gasto antes que su devolución.
 *   - Idempotente: reenviar la misma devolución no devuelve dos veces.
 *   - Nunca devuelve más de lo que ese gasto descontó de verdad.
 */
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/marketplace/auth";
import { corsHeaders, preflight } from "@/lib/cors";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REFUND_MICROS = 1_000_000_000; // US$1,000, igual que el tope por gasto
const MAX_KEY_LENGTH = 200;
const MAX_METADATA_BYTES = 2048;

export async function OPTIONS(req: Request) {
  return preflight(req, "POST, OPTIONS");
}

interface RefundBody {
  originalIdempotencyKey: string;
  amountMicros: number;
  metadata?: Record<string, unknown>;
}

function parseBody(raw: unknown): RefundBody | string {
  if (!raw || typeof raw !== "object") return "body must be an object";
  const b = raw as Record<string, unknown>;
  if (!Number.isSafeInteger(b.amountMicros) || (b.amountMicros as number) <= 0) {
    return "amountMicros must be a positive integer";
  }
  if ((b.amountMicros as number) > MAX_REFUND_MICROS) {
    return "amountMicros exceeds the per-refund cap";
  }
  if (typeof b.originalIdempotencyKey !== "string" || !b.originalIdempotencyKey.trim()) {
    return "originalIdempotencyKey is required";
  }
  if (b.originalIdempotencyKey.length > MAX_KEY_LENGTH) {
    return "originalIdempotencyKey is too long";
  }
  if (b.metadata !== undefined) {
    if (!b.metadata || typeof b.metadata !== "object" || Array.isArray(b.metadata)) {
      return "metadata must be an object";
    }
    if (JSON.stringify(b.metadata).length > MAX_METADATA_BYTES) {
      return "metadata is too large";
    }
  }
  return {
    amountMicros: b.amountMicros as number,
    originalIdempotencyKey: b.originalIdempotencyKey.trim(),
    metadata: b.metadata as Record<string, unknown> | undefined,
  };
}

export async function POST(req: Request) {
  const cors = corsHeaders(req.headers.get("origin"), "POST, OPTIONS");
  const json = (data: unknown, status: number) =>
    NextResponse.json(data, { status, headers: cors });

  const user = await authenticate(req);
  if (!user) {
    return json(
      { error: "Sign in again to record this refund.", code: "sign_in_required" },
      401,
    );
  }

  const sb = getSupabaseAdmin();
  if (!sb) {
    return json(
      { error: "Credit ledger is temporarily unavailable.", code: "not_configured" },
      503,
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json({ error: "Body must be JSON.", code: "invalid_body" }, 400);
  }
  const body = parseBody(raw);
  if (typeof body === "string") {
    return json({ error: body, code: "invalid_body" }, 400);
  }

  const { data, error } = await sb.rpc("record_ai_credit_refund", {
    p_user_id: user.id,
    p_original_idempotency_key: body.originalIdempotencyKey,
    p_amount_micros: body.amountMicros,
    p_metadata: body.metadata ?? {},
  });
  if (error) {
    if (/verified video failure required|requires reconciliation/i.test(error.message ?? "")) {
      return json({ error: "Refund pending verified video evidence.", code: "refund_pending_reconciliation" }, 409);
    }
    // El gasto original todavía no llegó al servidor: la app reintenta después.
    if (/original debit not found/i.test(error.message ?? "")) {
      return json(
        { error: "The original charge is not recorded yet.", code: "debit_not_found" },
        409,
      );
    }
    return json(
      { error: "Could not record the refund. Try again.", code: "ledger_write_failed" },
      502,
    );
  }

  const row = Array.isArray(data) ? data[0] : data;
  return json(
    {
      ok: true,
      balanceMicros: Number(row?.out_balance_micros ?? 0),
      applied: Boolean(row?.out_applied),
      refundedMicros: Number(row?.out_refunded_micros ?? 0),
    },
    200,
  );
}
