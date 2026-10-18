/**
 * Read-only view of an account's AI credit ledger, for the desktop wallet.
 *
 * The desktop app keeps a *local* credits ledger (SQLite on the client) that
 * it can debit against instantly, offline, without a round-trip per prompt.
 * Real top-ups only ever land on the *server* ledger — Stripe/Mercado Pago
 * webhooks call `grant_ai_credits` (see supabase/migrations/0027_ai_credits.sql)
 * straight into `ai_credit_accounts` / `ai_credit_ledger` — and until this
 * endpoint existed, nothing ever told the app that had happened. A customer
 * could pay, the server would credit them correctly, and the app would just
 * never notice: no endpoint to ask "did I get topped up?".
 *
 * This route is that missing read path. It is intentionally narrow:
 *
 *   - Read-only. It never writes `ai_credit_accounts` or `ai_credit_ledger`,
 *     and never calls `grant_ai_credits`. Crediting stays exclusively the
 *     webhook's job so there is exactly one place balances can move.
 *   - Scoped to the authenticated caller. `authenticate()` resolves the
 *     Supabase user from the Bearer token; every query below is filtered by
 *     that `user_id`, so one account can never see another's ledger.
 *   - `kind = 'top_up'` only. `debit`/`refund`/`adjustment` rows exist in the
 *     same table for the server's own bookkeeping, but the app's local wallet
 *     only needs to learn about money that arrived — it does its own local
 *     debiting and has no use for the server replaying those back to it.
 *
 * `?since=<ISO 8601>` lets the app poll incrementally instead of re-fetching
 * up to 100 rows every time: pass back the `nextSince` from the previous
 * response to get only what's new. A `since` that fails to parse as a date is
 * treated as absent (not a 400) — this is a convenience filter, not a
 * contract the client must get exactly right, and failing the whole request
 * over a malformed cursor would just strand the app's polling loop.
 *
 * The `id` on each top-up row is returned verbatim because the app uses it
 * as an idempotency key for merging into its local ledger
 * (`server:<id>`) — the row that granted credits server-side must map to
 * exactly one local wallet entry no matter how many times it's re-fetched
 * across polls.
 */
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/marketplace/auth";
import { corsHeaders, preflight } from "@/lib/cors";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface TopUpRow {
  id: string;
  amountMicros: number;
  rail: string | null;
  createdAt: string;
}

interface DebitRow {
  id: string;
  idempotencyKey: string;
  amountMicros: number;
  createdAt: string;
}

interface RefundRow {
  id: string;
  originalIdempotencyKey: string;
  amountMicros: number;
  createdAt: string;
}

interface LedgerResponse {
  ok: true;
  balanceMicros: number;
  currency: string;
  topUps: TopUpRow[];
  debits: DebitRow[];
  refunds: RefundRow[];
  nextSince: string | null;
}

/** Default balance/currency for an account that has never received a
 *  top-up — `grant_ai_credits` only inserts the `ai_credit_accounts` row on
 *  the first grant, so "no row" is a normal, non-error state here. */
const DEFAULT_CURRENCY = "USD";

/** Parses `since` as a date; returns the original string when it parses,
 *  or null when it's absent/unparseable (treated the same — no filter). */
function parseSince(raw: string | null): string | null {
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : raw;
}

export async function OPTIONS(req: Request) {
  return preflight(req, "GET, OPTIONS");
}

export async function GET(req: Request) {
  const cors = corsHeaders(req.headers.get("origin"), "GET, OPTIONS");
  const json = (data: unknown, status: number) =>
    NextResponse.json(data, { status, headers: cors });

  const user = await authenticate(req);
  if (!user) {
    return json(
      { error: "Sign in again to see your credit balance.", code: "sign_in_required" },
      401,
    );
  }

  const sb = getSupabaseAdmin();
  if (!sb) {
    return json(
      { error: "Credit balance is temporarily unavailable.", code: "not_configured" },
      503,
    );
  }

  const url = new URL(req.url);
  const since = parseSince(url.searchParams.get("since"));

  try {
    let ledgerQuery = sb
      .from("ai_credit_ledger")
      .select("id, kind, idempotency_key, amount_micros, rail, created_at")
      .eq("user_id", user.id)
      .in("kind", ["top_up", "debit", "refund"])
      .order("created_at", { ascending: true })
      .limit(100);
    if (since) {
      ledgerQuery = ledgerQuery.gt("created_at", since);
    }

    const [accountRes, ledgerRes] = await Promise.all([
      sb
        .from("ai_credit_accounts")
        .select("balance_micros, currency, updated_at")
        .eq("user_id", user.id)
        .maybeSingle(),
      ledgerQuery,
    ]);

    if (accountRes.error || ledgerRes.error) {
      throw new Error(
        accountRes.error?.message ?? ledgerRes.error?.message ?? "query failed",
      );
    }

    const account = accountRes.data as
      | { balance_micros: number; currency: string; updated_at: string }
      | null;

    type LedgerRow = {
      id: string;
      kind?: string;
      idempotency_key?: string;
      amount_micros: number;
      rail: string | null;
      created_at: string;
    };
    const ledgerRows = (ledgerRes.data ?? []) as LedgerRow[];

    const topUps: TopUpRow[] = ledgerRows
      .filter((row) => row.kind !== "debit" && row.kind !== "refund")
      .map((row) => ({
        id: row.id,
        amountMicros: row.amount_micros,
        rail: row.rail,
        createdAt: row.created_at,
      }));

    // Gastos del servidor. Se devuelven con monto positivo y con la clave que
    // la app usó al descontar, así un equipo que ya aplicó ese gasto lo
    // reconoce y no lo descuenta dos veces.
    const debits: DebitRow[] = ledgerRows
      .filter((row) => row.kind === "debit" && row.idempotency_key)
      .map((row) => ({
        id: row.id,
        idempotencyKey: row.idempotency_key as string,
        amountMicros: -row.amount_micros,
        createdAt: row.created_at,
      }));

    // Devoluciones del servidor. La clave de una devolución es
    // 'refund:' + la clave del gasto original, así la app encuentra ese gasto
    // en su propio ledger, lo devuelva una o muchas veces.
    const refunds: RefundRow[] = ledgerRows
      .filter((row) => row.kind === "refund" && row.idempotency_key?.startsWith("refund:"))
      .map((row) => ({
        id: row.id,
        originalIdempotencyKey: (row.idempotency_key as string).slice("refund:".length),
        amountMicros: row.amount_micros,
        createdAt: row.created_at,
      }));

    // El cursor avanza con la última fila de cualquier tipo, en orden de tiempo.
    const lastRow = ledgerRows[ledgerRows.length - 1];
    const nextSince = lastRow ? lastRow.created_at : since;

    const body: LedgerResponse = {
      ok: true,
      balanceMicros: account?.balance_micros ?? 0,
      currency: account?.currency ?? DEFAULT_CURRENCY,
      topUps,
      debits,
      refunds,
      nextSince,
    };
    return json(body, 200);
  } catch (err) {
    console.error("[credits-ledger] read failed", {
      userId: user.id,
      error: err instanceof Error ? err.message : String(err),
    });
    return json(
      { error: "Could not read your credit balance.", code: "storage_failed" },
      500,
    );
  }
}
