import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL = { ...process.env };

async function pedirSalud() {
  vi.resetModules();
  const { GET } = await import("./route");
  const res = GET();
  return { res, body: (await res.json()) as {
    ok: boolean;
    cobro: string;
    webhook: boolean;
    precios: Record<string, boolean>;
    faltan: string[];
  } };
}

beforeEach(() => {
  process.env.STRIPE_PRICE_PRO_MONTHLY = "price_pro";
  process.env.STRIPE_PRICE_MAX_MONTHLY = "price_max";
  process.env.STRIPE_INCLUDED_AI_PRICE_ID = "price_ai";
  process.env.STRIPE_SECRET_KEY = "sk_live_nunca_se_publica";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_nunca_se_publica";
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

  it("no publica ningún identificador de precio ni ninguna llave", async () => {
    const { body } = await pedirSalud();
    const crudo = JSON.stringify(body);
    expect(crudo).not.toContain("price_pro");
    expect(crudo).not.toContain("price_ai");
    expect(crudo).not.toContain("nunca_se_publica");
  });

  // La diferencia entre cobrar de verdad y no cobrar nada es invisible desde
  // afuera, y desde Colombia ni siquiera se llega a esta pasarela: el cobro va
  // por Mercado Pago. Un lanzamiento entero podía salir en modo prueba sin que
  // ninguna prueba física lo notara.
  describe("modo de cobro", () => {
    it("con la llave real dice que cobra de verdad", async () => {
      const { body } = await pedirSalud();
      expect(body.cobro).toBe("real");
      expect(body.ok).toBe(true);
    });

    it("con la llave de prueba lo dice y se pone en rojo", async () => {
      process.env.STRIPE_SECRET_KEY = "sk_test_nunca_se_publica";
      const { res, body } = await pedirSalud();
      expect(body.cobro).toBe("prueba");
      expect(body.ok).toBe(false);
      expect(res.status).toBe(503);
      expect(body.faltan).toContain("cobro:prueba");
    });

    it("sin llave tampoco pasa por verde", async () => {
      delete process.env.STRIPE_SECRET_KEY;
      const { body } = await pedirSalud();
      expect(body.cobro).toBe("sin-llave");
      expect(body.ok).toBe(false);
    });

    it("sin el webhook, un pago no se convertiría en plan: rojo", async () => {
      delete process.env.STRIPE_WEBHOOK_SECRET;
      const { body } = await pedirSalud();
      expect(body.webhook).toBe(false);
      expect(body.ok).toBe(false);
      expect(body.faltan).toContain("webhook");
    });
  });
});
