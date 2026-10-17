/**
 * Registra en el servidor un gasto de créditos que la app ya descontó
 * localmente. Ver supabase/migrations/0033_ai_credit_debits.sql para el
 * porqué: sin esto, un equipo nuevo recupera todas las recargas y ningún gasto.
 *
 * Contrato:
 *   - Autenticado: solo puede asentar gastos de su propia cuenta.
 *   - Idempotente por `idempotencyKey`: reenviar el mismo gasto no lo cobra dos veces.
 *   - Devuelve el saldo del servidor tras el asiento y si se aplicó (`applied`).
 *     `applied: false` significa que ese gasto ya estaba registrado.
 */
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/marketplace/auth";
import { corsHeaders, preflight } from "@/lib/cors";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Tope por asiento: un gasto mayor a esto no es un video, es un error o un abuso. */
const MAX_DEBIT_MICROS = 1_000_000_000; // US$1,000
const MAX_KEY_LENGTH = 200;
const MAX_METADATA_BYTES = 2048;

export async function OPTIONS(req: Request) {
  return preflight(req, "POST, OPTIONS");
}

interface DebitBody {
  amountMicros: number;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
}

function parseBody(raw: unknown): DebitBody | string {
  if (!raw || typeof raw !== "object") return "body must be an object";
  const b = raw as Record<string, unknown>;
  if (!Number.isSafeInteger(b.amountMicros) || (b.amountMicros as number) <= 0) {
    return "amountMicros must be a positive integer";
  }
  if ((b.amountMicros as number) > MAX_DEBIT_MICROS) {
    return "amountMicros exceeds the per-debit cap";
  }
  if (typeof b.idempotencyKey !== "string" || !b.idempotencyKey.trim()) {
    return "idempotencyKey is required";
  }
  if (b.idempotencyKey.length > MAX_KEY_LENGTH) {
    return "idempotencyKey is too long";
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
    idempotencyKey: b.idempotencyKey.trim(),
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
      { error: "Sign in again to record this charge.", code: "sign_in_required" },
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

  const { data, error } = await sb.rpc("record_ai_credit_debit", {
    p_user_id: user.id,
    p_amount_micros: body.amountMicros,
    p_idempotency_key: body.idempotencyKey,
    p_metadata: body.metadata ?? {},
  });
  if (error) {
    return json(
      { error: "Could not record the charge. Try again.", code: "ledger_write_failed" },
      502,
    );
  }

  const row = Array.isArray(data) ? data[0] : data;
  return json(
    {
      ok: true,
      balanceMicros: Number(row?.out_balance_micros ?? 0),
      applied: Boolean(row?.out_applied),
    },
    200,
  );
}
