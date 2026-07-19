import { notFound } from "next/navigation";
import { isLocale } from "@/content";
import { MercadoPagoSetupClient } from "./MercadoPagoSetupClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ lang: string }>;
}

/**
 * /[lang]/admin/mercadopago — one-time bootstrap page to create the Mercado
 * Pago subscription plans (Pro + Max) in COP. The plans are created by the
 * server route using the MERCADOPAGO_ACCESS_TOKEN that lives on Vercel, so the
 * token never reaches the browser. Thin shell; the client fetches the
 * admin-gated API with the signed-in user's Bearer token.
 */
export default async function MercadoPagoSetupPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <MercadoPagoSetupClient lang={lang} />;
}
