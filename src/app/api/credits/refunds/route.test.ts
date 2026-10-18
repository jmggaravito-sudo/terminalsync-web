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
  return new Request("https://terminalsync.ai/api/credits/refunds", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function sbWith(result: { data?: unknown; error?: { message: string } | null }) {
  const rpc = vi.fn().mockResolvedValue({ data: result.data ?? null, error: result.error ?? null });
  return { rpc } as unknown as { rpc: typeof rpc };
}

const OK = { originalIdempotencyKey: "design-video:quote-1", amountMicros: 300_000 };

beforeEach(() => {
  vi.clearAllMocks();
  mocks.authenticate.mockResolvedValue(USER);
});

describe("POST /api/credits/refunds", () => {
  it("rechaza sin sesión y no toca la base", async () => {
    mocks.authenticate.mockResolvedValue(null);
    const sb = sbWith({});
    mocks.getSupabaseAdmin.mockReturnValue(sb);
    const res = await POST(req(OK));
    expect(res.status).toBe(401);
    expect(sb.rpc).not.toHaveBeenCalled();
  });

  it("registra la devolución para el usuario autenticado, nunca para otro", async () => {
    const sb = sbWith({ data: [{ out_balance_micros: 200_000_000, out_applied: true, out_refunded_micros: 300_000 }] });
    mocks.getSupabaseAdmin.mockReturnValue(sb);
    const res = await POST(req(OK));
    expect(res.status).toBe(200);
    expect(sb.rpc).toHaveBeenCalledWith("record_ai_credit_refund", {
      p_user_id: USER.id,
      p_original_idempotency_key: "design-video:quote-1",
      p_amount_micros: 300_000,
      p_metadata: {},
    });
    await expect(res.json()).resolves.toEqual({
      ok: true, balanceMicros: 200_000_000, applied: true, refundedMicros: 300_000,
    });
  });

  it("una devolución repetida responde applied:false", async () => {
    const sb = sbWith({ data: [{ out_balance_micros: 200_000_000, out_applied: false, out_refunded_micros: 300_000 }] });
    mocks.getSupabaseAdmin.mockReturnValue(sb);
    const res = await POST(req(OK));
    await expect(res.json()).resolves.toMatchObject({ applied: false });
  });

  it("si el gasto original todavía no está, responde 409 para que la app reintente", async () => {
    const sb = sbWith({ error: { message: "original debit not found" } });
    mocks.getSupabaseAdmin.mockReturnValue(sb);
    const res = await POST(req(OK));
    expect(res.status).toBe(409);
    await expect(res.json()).resolves.toMatchObject({ code: "debit_not_found" });
  });

  it.each([
    ["monto cero", { ...OK, amountMicros: 0 }],
    ["monto negativo", { ...OK, amountMicros: -5 }],
    ["monto decimal", { ...OK, amountMicros: 0.3 }],
    ["monto sobre el tope", { ...OK, amountMicros: 2_000_000_000 }],
    ["sin clave original", { amountMicros: 300_000 }],
    ["clave original vacía", { ...OK, originalIdempotencyKey: "   " }],
    ["clave original demasiado larga", { ...OK, originalIdempotencyKey: "x".repeat(201) }],
    ["metadata que no es objeto", { ...OK, metadata: [1] }],
  ])("rechaza %s sin llamar al ledger", async (_name, body) => {
    const sb = sbWith({});
    mocks.getSupabaseAdmin.mockReturnValue(sb);
    const res = await POST(req(body));
    expect(res.status).toBe(400);
    expect(sb.rpc).not.toHaveBeenCalled();
  });

  it("si el ledger falla por otra causa, responde 502 sin filtrar el error interno", async () => {
    const sb = sbWith({ error: { message: "relation secret_table leaked" } });
    mocks.getSupabaseAdmin.mockReturnValue(sb);
    const res = await POST(req(OK));
    expect(res.status).toBe(502);
    expect(await res.text()).not.toContain("secret_table");
  });

  it("sin Supabase configurado responde 503", async () => {
    mocks.getSupabaseAdmin.mockReturnValue(null);
    expect((await POST(req(OK))).status).toBe(503);
  });
});

it("unproven failure stays pending, never turns into a successful response",async()=>{
  mocks.getSupabaseAdmin.mockReturnValue(sbWith({error:{message:"verified video failure required"}}));
  const r=await POST(req({...OK,metadata:{failed:true,jobStatus:"failed"}}));
  expect(r.status).toBe(409);expect(await r.json()).toMatchObject({code:"refund_pending_reconciliation"});
});
