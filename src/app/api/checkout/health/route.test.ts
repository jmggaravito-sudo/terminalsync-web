import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL = { ...process.env };

async function pedirSalud() {
  vi.resetModules();
  const { GET } = await import("./route");
  const res = GET();
  return { res, body: (await res.json()) as {
    ok: boolean;
    precios: Record<string, boolean>;
    faltan: string[];
  } };
}

beforeEach(() => {
  process.env.STRIPE_PRICE_PRO_MONTHLY = "price_pro";
  process.env.STRIPE_PRICE_MAX_MONTHLY = "price_max";
  process.env.STRIPE_INCLUDED_AI_PRICE_ID = "price_ai";
  delete process.env.STRIPE_PRICE_DEV_MONTHLY;
  delete process.env.STRIPE_PRICE_AGENCY;
});

afterEach(() => {
  process.env = { ...ORIGINAL };
});

describe("/api/checkout/health", () => {
  it("dice que sí cuando los tres precios que la app puede pedir están cargados", async () => {
    const { res, body } = await pedirSalud();
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.faltan).toEqual([]);
  });

  // El agujero real del 2026-09-23: Pro cargado solo en "preview". Max tiene
  // nombre viejo de respaldo, Pro no tiene ninguno, así que en producción el
  // plan de entrada devolvía 503 y nadie podía comprarlo.
  it("nombra a Pro cuando su precio no está en este ambiente", async () => {
    delete process.env.STRIPE_PRICE_PRO_MONTHLY;
    const { res, body } = await pedirSalud();
    expect(res.status).toBe(503);
    expect(body.ok).toBe(false);
    expect(body.faltan).toContain("pro");
    expect(body.precios.max).toBe(true);
  });

  it("también avisa si falta el precio de la IA incluida, que es el del lanzamiento", async () => {
    delete process.env.STRIPE_INCLUDED_AI_PRICE_ID;
    const { body } = await pedirSalud();
    expect(body.faltan).toContain("includedAi");
  });

  // Agency se vende por correo, no por este camino: que falte no rompe a
  // ningún cliente y no puede poner la salud en rojo.
  it("no se pone en rojo por Agency, que no se vende por acá", async () => {
    const { body } = await pedirSalud();
    expect(body.precios.agency).toBe(false);
    expect(body.ok).toBe(true);
  });

  it("no publica ningún identificador de precio, solo si está o no", async () => {
    const { body } = await pedirSalud();
    expect(JSON.stringify(body)).not.toContain("price_pro");
    expect(JSON.stringify(body)).not.toContain("price_ai");
  });
});
