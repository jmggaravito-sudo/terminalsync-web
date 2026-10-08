import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * El interruptor se lee una sola vez al importar el módulo (así Next puede
 * inyectarlo en el build), por eso cada caso resetea el registro de módulos y
 * vuelve a importar `useGeoCurrency` con la env que quiere probar.
 *
 * El hook en sí no se puede renderizar con efectos acá: el proyecto corre los
 * tests en Node, sin navegador. Lo que sí se prueba de verdad es la mitad sin
 * React (`loadGeoCurrency`), que es la que decide si se llama a `/api/geo` y
 * qué moneda sale; y que el hook arranca en USD en el render de servidor.
 */
async function loadWith(value: string | undefined) {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_MERCADOPAGO_ENABLED", value);
  return import("./useGeoCurrency");
}

const geo = (country: string | null) =>
  vi.fn(async (_input: string) => Response.json({ country }));

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("mercadoPagoEnabled", () => {
  it("está apagado por defecto, sin la variable", async () => {
    expect((await loadWith(undefined)).mercadoPagoEnabled).toBe(false);
  });

  it('solo se prende con el valor exacto "1"', async () => {
    expect((await loadWith("1")).mercadoPagoEnabled).toBe(true);
    expect((await loadWith("true")).mercadoPagoEnabled).toBe(false);
    expect((await loadWith("0")).mercadoPagoEnabled).toBe(false);
    expect((await loadWith("")).mercadoPagoEnabled).toBe(false);
  });
});

describe("loadGeoCurrency con el interruptor apagado", () => {
  it("devuelve USD sin llamar a /api/geo, aunque el visitante sea de Colombia", async () => {
    const { loadGeoCurrency } = await loadWith(undefined);
    const fetchImpl = geo("CO");
    await expect(loadGeoCurrency(fetchImpl)).resolves.toBe("USD");
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe("loadGeoCurrency con NEXT_PUBLIC_MERCADOPAGO_ENABLED=1", () => {
  it("devuelve COP cuando /api/geo dice CO", async () => {
    const { loadGeoCurrency } = await loadWith("1");
    const fetchImpl = geo("CO");
    await expect(loadGeoCurrency(fetchImpl)).resolves.toBe("COP");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl).toHaveBeenCalledWith("/api/geo");
  });

  it("devuelve USD para otro país o país desconocido", async () => {
    const { loadGeoCurrency } = await loadWith("1");
    await expect(loadGeoCurrency(geo("US"))).resolves.toBe("USD");
    await expect(loadGeoCurrency(geo(null))).resolves.toBe("USD");
  });

  it("devuelve USD si /api/geo falla o no responde ok", async () => {
    const { loadGeoCurrency } = await loadWith("1");
    const notOk = vi.fn(async (_input: string) => new Response("", { status: 500 }));
    await expect(loadGeoCurrency(notOk)).resolves.toBe("USD");
    const rejects = vi.fn(async (_input: string): Promise<Response> => {
      throw new Error("network down");
    });
    await expect(loadGeoCurrency(rejects)).resolves.toBe("USD");
  });
});

describe("useGeoCurrency", () => {
  it("arranca en USD en el render de servidor, con el interruptor prendido o apagado", async () => {
    for (const value of ["1", undefined]) {
      const { useGeoCurrency } = await loadWith(value);
      const Probe = () => createElement("span", null, useGeoCurrency());
      expect(renderToStaticMarkup(createElement(Probe))).toBe("<span>USD</span>");
    }
  });
});
