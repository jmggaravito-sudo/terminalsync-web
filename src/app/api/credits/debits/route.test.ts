import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authenticate: vi.fn(),
  getSupabaseAdmin: vi.fn(),
}));

vi.mock("@/lib/marketplace/auth", () => ({ authenticate: mocks.authenticate }));
vi.mock("@/lib/supabaseAdmin", () => ({ getSupabaseAdmin: mocks.getSupabaseAdmin }));

import { POST } from "./route";

const USER = { id: "126e79a7-a0d3-4c19-b9ce-f935bcc67c59", email: "jm@example.com" };

function req(body: unknown, headers: Record<string, string> = { authorization: "Bearer t" }) {
  return new Request("https://terminalsync.ai/api/credits/debits", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function sbWith(result: { data?: unknown; error?: { message: string } | null }) {
  const rpc = vi.fn().mockResolvedValue({ data: result.data ?? null, error: result.error ?? null });
  return { rpc } as unknown as { rpc: typeof rpc };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.authenticate.mockResolvedValue(USER);
});

describe("POST /api/credits/debits", () => {
  it("rechaza sin sesión y no toca la base", async () => {
    mocks.authenticate.mockResolvedValue(null);
    const sb = sbWith({});
    mocks.getSupabaseAdmin.mockReturnValue(sb);
    const res = await POST(req({ amountMicros: 300000, idempotencyKey: "k1" }));
    expect(res.status).toBe(401);
    expect(sb.rpc).not.toHaveBeenCalled();
  });

  it("registra el gasto para el usuario autenticado, nunca para otro", async () => {
    const sb = sbWith({ data: [{ out_balance_micros: 199_700_000, out_applied: true }] });
    mocks.getSupabaseAdmin.mockReturnValue(sb);
    const res = await POST(req({ amountMicros: 300000, idempotencyKey: "video-1" }));
    expect(res.status).toBe(200);
    expect(sb.rpc).toHaveBeenCalledWith("record_ai_credit_debit", {
      p_user_id: USER.id,
      p_amount_micros: 300000,
      p_idempotency_key: "video-1",
      p_metadata: {},
    });
    await expect(res.json()).resolves.toEqual({ ok: true, balanceMicros: 199_700_000, applied: true });
  });

  it("un gasto repetido responde applied:false y no vuelve a descontar", async () => {
    const sb = sbWith({ data: [{ out_balance_micros: 199_700_000, out_applied: false }] });
    mocks.getSupabaseAdmin.mockReturnValue(sb);
    const res = await POST(req({ amountMicros: 300000, idempotencyKey: "video-1" }));
    await expect(res.json()).resolves.toMatchObject({ applied: false, balanceMicros: 199_700_000 });
  });

  it.each([
    ["monto cero", { amountMicros: 0, idempotencyKey: "k" }],
    ["monto negativo", { amountMicros: -5, idempotencyKey: "k" }],
    ["monto decimal", { amountMicros: 0.3, idempotencyKey: "k" }],
    ["monto sobre el tope", { amountMicros: 2_000_000_000, idempotencyKey: "k" }],
    ["sin clave", { amountMicros: 300000 }],
    ["clave vacía", { amountMicros: 300000, idempotencyKey: "   " }],
    ["clave demasiado larga", { amountMicros: 300000, idempotencyKey: "x".repeat(201) }],
    ["metadata que no es objeto", { amountMicros: 300000, idempotencyKey: "k", metadata: [1] }],
  ])("rechaza %s sin llamar al ledger", async (_name, body) => {
    const sb = sbWith({});
    mocks.getSupabaseAdmin.mockReturnValue(sb);
    const res = await POST(req(body));
    expect(res.status).toBe(400);
    expect(sb.rpc).not.toHaveBeenCalled();
  });

  it("body que no es JSON responde 400", async () => {
    const sb = sbWith({});
    mocks.getSupabaseAdmin.mockReturnValue(sb);
    const res = await POST(req("{no es json"));
    expect(res.status).toBe(400);
    expect(sb.rpc).not.toHaveBeenCalled();
  });

  it("si el ledger falla, responde 502 sin filtrar el error interno", async () => {
    const sb = sbWith({ error: { message: "relation secret_table leaked" } });
    mocks.getSupabaseAdmin.mockReturnValue(sb);
    const res = await POST(req({ amountMicros: 300000, idempotencyKey: "k" }));
    expect(res.status).toBe(502);
    const text = await res.text();
    expect(text).not.toContain("secret_table");
  });

  it("sin Supabase configurado responde 503", async () => {
    mocks.getSupabaseAdmin.mockReturnValue(null);
    const res = await POST(req({ amountMicros: 300000, idempotencyKey: "k" }));
    expect(res.status).toBe(503);
  });
});
