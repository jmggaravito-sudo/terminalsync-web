import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LEGAL_ES_PUBLIC } from "@/lib/launchFlags";

import PrivacyPage, { generateMetadata as privacyMeta } from "./page";

type Page = (p: { params: Promise<{ lang: string }> }) => Promise<React.ReactElement>;
const page = PrivacyPage as Page;

async function html(lang: string) {
  return renderToStaticMarkup(await page({ params: Promise.resolve({ lang }) }));
}

/**
 * Reclamos verificables de open banking que la política debe declarar en los
 * dos idiomas (cuestionario de compliance de Plaid / Prometeo-Cobre):
 * proveedores por país, credenciales nunca guardadas, cifrado en reposo y en
 * tránsito, aislamiento por organización y revocación al desconectar.
 */
const BANKING_CLAIMS: Record<"es" | "en", string[]> = {
  es: [
    "open banking",
    "Plaid",
    "Prometeo",
    "Cobre",
    "nunca guarda tus credenciales bancarias",
    "cifrado en reposo con AES-256-GCM",
    "TLS 1.2 o superior",
    "aislados por organización",
    "se revoca el acceso del lado",
  ],
  en: [
    "open banking",
    "Plaid",
    "Prometeo",
    "Cobre",
    "never stores your bank credentials",
    "encrypted at rest with AES-256-GCM",
    "TLS 1.2 or higher",
    "isolated per organization",
    "revoked on their side",
  ],
};

describe("la política de privacidad pública", () => {
  for (const lang of ["es", "en"] as const) {
    it(`/${lang}/legal/privacy se renderiza con su título y su canonical`, async () => {
      const out = await html(lang);
      expect(out).toContain("<h1");
      expect(out).toContain(lang === "es" ? "Política de Privacidad" : "Privacy Policy");
      const m = await privacyMeta({ params: Promise.resolve({ lang }) });
      expect(m.alternates?.canonical).toBe(`https://terminalsync.ai/${lang}/legal/privacy`);
      expect(m.alternates?.languages?.es).toContain("/es/legal/privacy");
      expect(m.alternates?.languages?.en).toContain("/en/legal/privacy");
    });
  }

  it("/legal/privacy responde 404 para un idioma desconocido", async () => {
    await expect(page({ params: Promise.resolve({ lang: "fr" }) })).rejects.toThrow();
  });

  for (const lang of ["es", "en"] as const) {
    it(`declara el flujo de open banking en ${lang}: proveedores, cifrado, aislamiento y revocación`, async () => {
      const out = await html(lang);
      for (const claim of BANKING_CLAIMS[lang]) {
        expect(out, claim).toContain(claim);
      }
    });
  }

  it("mantiene la sección de Gmail exigida por la verificación de Google", async () => {
    const out = await html("es");
    expect(out).toContain("Gmail: acceso opcional de solo lectura");
  });

  it("mientras el modo borrador está activo, muestra los [PENDIENTE] para el dueño", async () => {
    if (LEGAL_ES_PUBLIC) return; // publicado: no debe quedar ningún pendiente
    const out = await html("es");
    expect(out).toContain("[PENDIENTE:");
    expect(out).toContain("razón social y domicilio");
  });

  it("el bloque nuevo en español no usa voseo", async () => {
    const text = (await html("es")).replace(/<[^>]+>/g, " ");
    const nuevo = text.split("Los datos de tu negocio")[1]?.split("Datos que recolectamos")[0] ?? "";
    expect(nuevo.length).toBeGreaterThan(400);
    expect(nuevo).not.toMatch(
      /\b(podés|tenés|querés|decís|escribinos|escribí|hacés|sabés|venís|elegís|aceptás|usás|creás|pasás|contanos|fijate|vos)\b/i,
    );
  });
});
