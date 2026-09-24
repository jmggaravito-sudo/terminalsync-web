import { NextResponse } from "next/server";

import { includedAiPriceId, priceIdFor } from "@/lib/stripe";

/**
 * ¿Cada plan que la aplicación ofrece tiene precio cargado en ESTE ambiente?
 *
 * Existe por un agujero real, encontrado el 2026-09-23 leyendo las variables
 * del proyecto: `STRIPE_PRICE_PRO_MONTHLY` estaba cargada solo en "preview",
 * mientras la de Max sí estaba en producción. Max tiene un nombre viejo de
 * respaldo por el rename Dev→Max; Pro no tiene ninguno. O sea que en
 * producción el plan de entrada devolvía 503 y nadie podía comprarlo.
 *
 * Nada lo avisaba: el error solo aparece cuando un cliente ya eligió su plan
 * y apretó pagar, que es el peor lugar posible para enterarse. Y no se puede
 * descubrir con una prueba física desde Colombia, porque ahí el cobro va por
 * Mercado Pago y ni siquiera toca este camino.
 *
 * Devuelve **solo booleanos**: si cada precio está configurado, nunca su
 * valor. Saber que un plan es vendible no es un secreto; el identificador de
 * precio tampoco lo es, pero no hay razón para publicarlo.
 *
 * `ok` es false si falta cualquiera de los precios que el menú de la
 * aplicación puede pedir, así que alcanza con mirar ese campo.
 */
export const dynamic = "force-dynamic";

export function GET() {
  const precios = {
    pro: Boolean(priceIdFor("pro")),
    max: Boolean(priceIdFor("max")),
    agency: Boolean(priceIdFor("agency")),
    includedAi: Boolean(includedAiPriceId()),
  };

  // Agency se vende por correo, no por este camino, así que su ausencia no
  // rompe a nadie y no cuenta para `ok`. Los otros tres SÍ: son los tres
  // botones que la aplicación le puede mostrar a un cliente.
  const ok = precios.pro && precios.max && precios.includedAi;

  return NextResponse.json(
    {
      ok,
      precios,
      faltan: Object.entries(precios)
        .filter(([clave, cargado]) => !cargado && clave !== "agency")
        .map(([clave]) => clave),
    },
    { status: ok ? 200 : 503 },
  );
}
