import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { COOKIE_ROWS } from "@/content/cookies";
import { openItems, PROVIDER_FIELDS } from "@/content/legalEntity";
import { SUBPROCESSORS } from "@/content/subprocessors";
import es from "@/content/es";
import en from "@/content/en";
import { LEGAL_ES_PUBLIC } from "@/lib/launchFlags";

import AvisoLegalPage, { generateMetadata as avisoMeta } from "../../app/[lang]/legal/aviso-legal/page";
import CookiesPage, { generateMetadata as cookiesMeta } from "../../app/[lang]/legal/cookies/page";
import SubprocessorsPage, { generateMetadata as subMeta } from "../../app/[lang]/legal/subprocessors/page";

const root = path.resolve(__dirname, "..", "..", "..");
const read = (rel: string) => readFileSync(path.join(root, rel), "utf8");

type Page = (p: { params: Promise<{ lang: string }> }) => Promise<React.ReactElement>;
const PAGES: Array<{ slug: string; page: Page; meta: (p: any) => Promise<any>; h1: { es: string; en: string } }> = [
  { slug: "aviso-legal", page: AvisoLegalPage as Page, meta: avisoMeta, h1: { es: "Aviso legal", en: "Legal notice" } },
  { slug: "cookies", page: CookiesPage as Page, meta: cookiesMeta, h1: { es: "Política de cookies", en: "Cookie Policy" } },
  { slug: "subprocessors", page: SubprocessorsPage as Page, meta: subMeta, h1: { es: "Subencargados del tratamiento", en: "Subprocessors" } },
];

async function html(page: Page, lang: string) {
  return renderToStaticMarkup(await page({ params: Promise.resolve({ lang }) }));
}

describe("las páginas legales para España existen en es y en", () => {
  for (const { slug, page, meta, h1 } of PAGES) {
    for (const lang of ["es", "en"] as const) {
      it(`/${lang}/legal/${slug} se renderiza con su título`, async () => {
        const out = await html(page, lang);
        expect(out).toContain(`<h1`);
        expect(out).toContain(h1[lang]);
        const m = await meta({ params: Promise.resolve({ lang }) });
        expect(m.alternates.canonical).toBe(`https://terminalsync.ai/${lang}/legal/${slug}`);
        expect(m.alternates.languages.es).toContain(`/es/legal/${slug}`);
        expect(m.alternates.languages.en).toContain(`/en/legal/${slug}`);
      });
    }

    it(`/legal/${slug} responde 404 para un idioma desconocido`, async () => {
      await expect(page({ params: Promise.resolve({ lang: "fr" }) })).rejects.toThrow();
    });
  }

  it("el archivo de ruta existe para cada página", () => {
    for (const { slug } of PAGES) {
      expect(read(`src/app/[lang]/legal/${slug}/page.tsx`)).toContain("generateStaticParams");
    }
  });
});

describe("modo borrador", () => {
  it("el interruptor sigue apagado: las páginas esperan al abogado", () => {
    expect(LEGAL_ES_PUBLIC).toBe(false);
  });

  it("mientras es borrador, el aviso legal muestra el aviso y los campos [PENDIENTE]", async () => {
    const out = await html(AvisoLegalPage as Page, "es");
    expect(out).toContain("BORRADOR pendiente de validación por abogado");
    expect(out).toContain("[PENDIENTE:");
    expect(out).toContain("Marca E-commerce LLC");
    expect(out).toContain("8614 W State Rd 84, Davie, FL 33324");
    expect(out).toContain("legal@terminalsync.ai");
  });

  it("no se inventa ningún NIF, CIF ni número de registro", () => {
    const taxId = PROVIDER_FIELDS.find((f) => f.key === "taxId")!;
    const registry = PROVIDER_FIELDS.find((f) => f.key === "registry")!;
    const rep = PROVIDER_FIELDS.find((f) => f.key === "euRep")!;
    for (const f of [taxId, registry, rep]) {
      expect(f.value).toBeUndefined();
      expect(f.pending).toBeDefined();
    }
    const src = read("src/content/legalEntity.ts");
    expect(src).not.toMatch(/\b[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]\b/); // forma de CIF
    expect(src).not.toMatch(/\b\d{2}-\d{7}\b/); // forma de EIN
  });

  it("las páginas son noindex mientras sean borrador", async () => {
    for (const { meta } of PAGES) {
      const m = await meta({ params: Promise.resolve({ lang: "es" }) });
      expect(m.robots).toEqual({ index: false, follow: false });
    }
  });

  it("el subencargado Z.ai/Zhipu se nombra con transparencia", async () => {
    const out = await html(SubprocessorsPage as Page, "es");
    expect(out).toContain("Z.ai (Zhipu AI)");
    expect(out).toContain("origen chino");
    expect(out).toContain("[A CONFIRMAR POR ABOGADO:");
  });

  it("si LEGAL_ES_PUBLIC fuese true no podría quedar nada pendiente", () => {
    // Condición del interruptor: este test es el que obliga a completar los datos
    // antes de encenderlo. Con el interruptor en false solo documenta la regla.
    if (!LEGAL_ES_PUBLIC) return;
    expect(openItems()).toEqual([]);
    for (const s of SUBPROCESSORS) expect(s.transfer, s.id).toBeDefined();
  });
});

describe("subencargados y cookies: cobertura real del código", () => {
  const names = SUBPROCESSORS.map((s) => s.name.toLowerCase()).join(" | ");
  it.each(["z.ai", "stripe", "vercel", "supabase", "sentry", "google", "resend", "cloudflare", "rewardful", "n8n", "searchapi"])(
    "lista a %s",
    (n) => {
      expect(names).toContain(n);
    },
  );

  it("cada subencargado tiene finalidad y datos en los dos idiomas y algo que confirmar o el mecanismo", () => {
    for (const s of SUBPROCESSORS) {
      expect(s.purpose.es.length, s.id).toBeGreaterThan(10);
      expect(s.purpose.en.length, s.id).toBeGreaterThan(10);
      expect(s.data.es.length, s.id).toBeGreaterThan(10);
      expect(s.data.en.length, s.id).toBeGreaterThan(10);
      expect(Boolean(s.transfer) || s.confirm.es.length > 0, s.id).toBe(true);
    }
  });

  it("cada clave de localStorage con prefijo propio que usa el código figura en la tabla de cookies", () => {
    const documented = COOKIE_ROWS.map((r) => r.name).join(" ");
    const keys = new Set<string>();
    const walk = (dir: string) => {
      for (const e of readdirSync(path.join(root, dir), { withFileTypes: true })) {
        const rel = `${dir}/${e.name}`;
        if (e.isDirectory()) walk(rel);
        else if (/\.(ts|tsx)$/.test(e.name) && !/\.test\./.test(e.name) && !rel.includes("/admin")) {
          for (const m of read(rel).matchAll(/"((?:terminalsync:|sync-ai-session)[A-Za-z0-9:_-]*)"/g)) keys.add(m[1]);
        }
      }
    };
    walk("src");
    expect(keys.size).toBeGreaterThanOrEqual(3);
    for (const k of keys) expect(documented, k).toContain(k);
  });

  it("la tabla incluye las tres categorías y marca como necesario solo el almacenamiento técnico", () => {
    const cats = new Set(COOKIE_ROWS.map((r) => r.category));
    expect(cats).toEqual(new Set(["necessary", "analytics", "affiliates"]));
    const third = COOKIE_ROWS.filter((r) => r.party === "third" && r.category === "necessary");
    // Todo lo de terceros exige consentimiento: nada de terceros cuenta como necesario.
    expect(third).toEqual([]);
  });

  it("la tabla cubre Vercel Analytics, Speed Insights, Sentry y Rewardful", () => {
    const providers = COOKIE_ROWS.map((r) => r.provider).join(" | ");
    for (const p of ["Vercel Web Analytics", "Vercel Speed Insights", "Sentry", "Rewardful"]) {
      expect(providers).toContain(p);
    }
  });
});

describe("enlaces y rutas", () => {
  it("el pie enlaza a cookies y a Configurar cookies en es y en", () => {
    expect(es.footer.links.cookies).toBeTruthy();
    expect(es.footer.links.cookieSettings).toBeTruthy();
    expect(en.footer.links.cookies).toBeTruthy();
    expect(en.footer.links.cookieSettings).toBeTruthy();
    expect(es.footer.links.legalNotice).toBeTruthy();
    expect(en.footer.links.subprocessors).toBeTruthy();
    const footer = read("src/components/landing/Footer.tsx");
    expect(footer).toContain("/legal/cookies");
    expect(footer).toContain("/legal/aviso-legal");
    expect(footer).toContain("/legal/subprocessors");
    expect(footer).toContain("CookieSettingsLink");
    // Aviso legal y subencargados detrás del interruptor mientras sean borrador.
    expect(footer).toMatch(/LEGAL_ES_PUBLIC\s*\?\s*\[/);
  });

  it("el pie estático de la home enlaza a cookies y a Configurar cookies", () => {
    const html = read("public/landing-b/index.html");
    expect(html).toContain('data-lhref="/legal/cookies"');
    expect(html).toContain("data-cookie-settings");
  });

  it("el sitemap incluye cookies siempre y las otras dos solo con el interruptor", () => {
    const sm = read("src/app/sitemap.ts");
    expect(sm).toContain('"legal/cookies"');
    expect(sm).toMatch(/LEGAL_ES_PUBLIC\s*\?\s*\["legal\/aviso-legal",\s*"legal\/subprocessors"\]/);
  });
});

describe("español de España, sin voseo, en los textos nuevos", () => {
  const VOSEO =
    /\b(podés|tenés|querés|decís|escribinos|escribí|hacés|sabés|venís|elegís|aceptás|usás|creás|pasás|contanos|fijate|vos)\b/i;
  const LATAM = /\b(computadora|celular|plata|ahorita|carro)\b/i;

  const sources = [
    "src/content/legalEntity.ts",
    "src/content/subprocessors.ts",
    "src/content/cookies.ts",
    "src/components/consent/copy.ts",
    "src/components/legal/Pending.tsx",
    "public/consent.js",
  ];

  function spanishLines(src: string): string[] {
    // Solo las cadenas en español: las del bloque `es:` / `es: {` de cada archivo.
    return src.split("\n").filter((l) => /^\s*es:\s*["'`{]/.test(l) || /^\s*(title|body|accept|reject|configure|policy|panelTitle|necessaryTitle|necessaryBody|analyticsTitle|analyticsBody|affiliatesTitle|affiliatesBody|alwaysOn|save):/.test(l));
  }

  it("ningún archivo de datos o copy usa voseo ni léxico latinoamericano en las cadenas en español", () => {
    for (const f of sources) {
      for (const line of spanishLines(read(f))) {
        if (/^\s*en:/.test(line)) continue;
        expect(line, `${f}: ${line.trim()}`).not.toMatch(VOSEO);
        expect(line, `${f}: ${line.trim()}`).not.toMatch(LATAM);
      }
    }
  });

  it("las páginas renderizadas en español no tienen voseo", async () => {
    for (const { page } of PAGES) {
      const text = (await html(page, "es")).replace(/<[^>]+>/g, " ");
      expect(text).not.toMatch(VOSEO);
      expect(text).not.toMatch(LATAM);
    }
  });
});
