import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  LIVE_SEARCH_SOURCES,
  liveSearchSourceLabel,
  liveSearchSourcesFor,
} from "./liveSearchSources";

/**
 * El interruptor se lee una sola vez al importar el módulo (así Next lo
 * inyecta en el build), por eso cada caso resetea el registro de módulos y
 * vuelve a importar con la env que quiere probar. Mismo patrón que
 * `useGeoCurrency.test.ts` con NEXT_PUBLIC_MERCADOPAGO_ENABLED.
 */
async function loadWith(value: string | undefined) {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_LIVE_SEARCH_LOTE3", value);
  return import("./liveSearchSources");
}

afterEach(() => {
  vi.unstubAllEnvs();
});

const ROOT = path.resolve(__dirname, "../..");
const LIVE = LIVE_SEARCH_SOURCES.filter((s) => s.batch === "live");
const LOTE3 = LIVE_SEARCH_SOURCES.filter((s) => s.batch === "lote3");

/**
 * Decisión de JM del 2026-10-09 (ver docs/live-search-sources.md): todas las
 * fuentes van con logo, asumiendo el riesgo de marca que encontró la revisión
 * de pautas del 2026-10-08, y Walmart sale de la fila. La nota "no implica
 * afiliación" va siempre.
 */
const EXCLUDED = ["Walmart"];

describe("NEXT_PUBLIC_LIVE_SEARCH_LOTE3", () => {
  it("está apagado por defecto, sin la variable", async () => {
    expect((await loadWith(undefined)).liveSearchLote3Enabled).toBe(false);
  });

  it('solo se prende con el valor exacto "1"', async () => {
    expect((await loadWith("1")).liveSearchLote3Enabled).toBe(true);
    expect((await loadWith("true")).liveSearchLote3Enabled).toBe(false);
    expect((await loadWith("0")).liveSearchLote3Enabled).toBe(false);
    expect((await loadWith("")).liveSearchLote3Enabled).toBe(false);
  });

  it("apagado muestra solo lo que está en producción; prendido suma el lote 3", async () => {
    const off = await loadWith(undefined);
    expect(off.VISIBLE_LIVE_SEARCH_SOURCES.map((s) => s.name)).toEqual(
      LIVE.map((s) => s.name),
    );
    const on = await loadWith("1");
    expect(on.VISIBLE_LIVE_SEARCH_SOURCES.map((s) => s.name)).toEqual(
      LIVE_SEARCH_SOURCES.map((s) => s.name),
    );
  });
});

describe("LIVE_SEARCH_SOURCES", () => {
  it("separa producción del lote 3", () => {
    expect(liveSearchSourcesFor(false)).toEqual(LIVE);
    expect(liveSearchSourcesFor(true)).toEqual(LIVE_SEARCH_SOURCES);
    expect(LIVE.length).toBeGreaterThan(0);
    expect(LOTE3.length).toBeGreaterThan(0);
  });

  it("no repite marcas", () => {
    const names = LIVE_SEARCH_SOURCES.map((s) => s.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("el nombre en español solo cambia donde hace falta", () => {
    const meta = LIVE_SEARCH_SOURCES.find((s) => s.name === "Meta Ad Library")!;
    expect(liveSearchSourceLabel(meta, "es")).toBe("Biblioteca de anuncios de Meta");
    expect(liveSearchSourceLabel(meta, "en")).toBe("Meta Ad Library");
    const yelp = LIVE_SEARCH_SOURCES.find((s) => s.name === "Yelp")!;
    expect(liveSearchSourceLabel(yelp, "es")).toBe("Yelp");
  });

  it("todas las fuentes llevan logo (decisión de JM, 2026-10-09)", () => {
    for (const s of LIVE_SEARCH_SOURCES) {
      expect(s.logo, `${s.name} sin logo`).not.toBeNull();
    }
  });

  it("Walmart quedó afuera (decisión de JM, 2026-10-09)", () => {
    const names = LIVE_SEARCH_SOURCES.map((s) => s.name.toLowerCase());
    for (const name of EXCLUDED) {
      expect(names).not.toContain(name.toLowerCase());
      expect(existsSync(path.join(ROOT, "public/sources", `${name.toLowerCase()}.svg`))).toBe(false);
    }
  });

  it("cada logo existe en public/sources/ y no sobra ningún archivo", () => {
    const used = new Set<string>();
    for (const s of LIVE_SEARCH_SOURCES) {
      if (!s.logo) continue;
      used.add(`${s.logo}.svg`);
      const file = path.join(ROOT, "public/sources", `${s.logo}.svg`);
      expect(existsSync(file), `${s.name}: falta ${file}`).toBe(true);
      expect(readFileSync(file, "utf8").startsWith("<svg")).toBe(true);
    }
    expect(readdirSync(path.join(ROOT, "public/sources")).sort()).toEqual(
      [...used].sort(),
    );
  });
});

/**
 * La portada activa (`public/landing-b/index.html`, servida por el middleware
 * con LANDING_B) es HTML estático: tiene la fila escrita a mano. Esto la
 * mantiene igual a la lista de TS.
 */
describe("landing-b: la fila estática coincide con la lista", () => {
  const html = readFileSync(
    path.join(ROOT, "public/landing-b/index.html"),
    "utf8",
  );
  const block = html.match(
    /<div class="live-src" data-live-search>([\s\S]*?)<\/div>\s*<\/div>/,
  );

  function parseChips(markup: string) {
    const chips = [
      ...markup.matchAll(
        /<span class="src-chip([^"]*)" role="listitem"([^>]*)>((?:(?!<span class="src-chip)[\s\S])*?)<\/span>\n/g,
      ),
    ];
    return chips.map(([, classes, attrs, inner]) => {
      const lote3 = /data-live-search-lote="3"/.test(attrs);
      expect(/\shidden(\s|$)/.test(attrs), `hidden ↔ lote 3 en ${inner}`).toBe(lote3);
      const img = inner.match(/<img src="\/sources\/([a-z0-9-]+)\.svg" alt="([^"]+)"/);
      const text = inner.replace(/<[^>]+>/g, "").trim();
      if (img) {
        expect(img[2], "alt = nombre").toBe(text);
        expect(inner, "nombre visible aria-hidden junto al logo").toContain(
          `<span aria-hidden="true">${text}</span>`,
        );
      }
      return {
        label: text,
        logo: img ? img[1] : null,
        darkLogo: /\bdark-logo\b/.test(classes),
        batch: lote3 ? "lote3" : "live",
      };
    });
  }

  it("tiene el bloque, el rótulo y la nota de marcas", () => {
    expect(block).not.toBeNull();
    expect(html).toContain("La IA de TS busca en vivo en…");
    expect(html).toContain(
      "Las marcas pertenecen a sus respectivos dueños. TS consulta información pública; no implica afiliación.",
    );
  });

  it("mismas fuentes, mismo orden, mismos logos, lote 3 oculto", () => {
    expect(parseChips(block![1])).toEqual(
      LIVE_SEARCH_SOURCES.map((s) => ({
        label: liveSearchSourceLabel(s, "es"),
        logo: s.logo,
        darkLogo: Boolean(s.darkLogo),
        batch: s.batch,
      })),
    );
  });

  it("pregunta el interruptor a /api/live-search-sources", () => {
    expect(html).toContain("fetch('/api/live-search-sources')");
  });

  it("no menciona marcas excluidas", () => {
    const i18n = readFileSync(path.join(ROOT, "public/landing-b/i18n.js"), "utf8");
    for (const name of EXCLUDED) {
      expect(block![1]).not.toContain(name);
      expect(i18n).not.toContain(name);
    }
  });

  it("si un logo no carga se oculta y queda el nombre; el alt sigue al idioma", () => {
    const imgs = block![1].match(/<img [^>]*>/g) ?? [];
    expect(imgs.length).toBe(LIVE_SEARCH_SOURCES.length);
    for (const img of imgs) {
      expect(img).toContain(
        `onerror="this.nextElementSibling.removeAttribute('aria-hidden');this.remove()"`,
      );
    }
    expect(html).toContain("window.addEventListener('ts-lang',syncAlt)");
  });

  it("i18n.js traduce al inglés el rótulo, la nota y los nombres que cambian", () => {
    const i18n = readFileSync(
      path.join(ROOT, "public/landing-b/i18n.js"),
      "utf8",
    );
    expect(i18n).toContain('"La IA de TS busca en vivo en…": "TS AI searches live on…"');
    expect(i18n).toContain(
      '"Las marcas pertenecen a sus respectivos dueños. TS consulta información pública; no implica afiliación.": "Brands belong to their respective owners. TS looks up public information; no affiliation implied."',
    );
    for (const s of LIVE_SEARCH_SOURCES) {
      if (s.es) expect(i18n).toContain(`"${s.es}": "${s.name}"`);
    }
  });
});

describe("IntegrationsMarquee: tercera fila", () => {
  async function render(flag: string | undefined, lang: "es" | "en") {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_LIVE_SEARCH_LOTE3", flag);
    const { IntegrationsMarquee } = await import(
      "@/components/landing/IntegrationsMarquee"
    );
    return renderToStaticMarkup(createElement(IntegrationsMarquee, { lang }));
  }
  const shown = (html: string, label: string) =>
    html.includes(`<span>${label}</span>`) ||
    html.includes(`<span aria-hidden="true">${label}</span>`);

  it("muestra rótulo, nota y solo producción por defecto (ES)", async () => {
    const html = await render(undefined, "es");
    expect(html).toContain("La IA de TS busca en vivo en…");
    expect(html).toContain("no implica afiliación");
    for (const s of LIVE) expect(shown(html, liveSearchSourceLabel(s, "es")), s.name).toBe(true);
    for (const s of LOTE3) expect(shown(html, liveSearchSourceLabel(s, "es")), s.name).toBe(false);
    // Cada logo con alt = nombre en el idioma, y el nombre visible aria-hidden.
    for (const s of LIVE) {
      const label = liveSearchSourceLabel(s, "es");
      expect(html).toContain(`src="/sources/${s.logo}.svg" alt="${label}"`);
      expect(html).toContain(`<span aria-hidden="true">${label}</span>`);
    }
    // Logo oscuro (ChatGPT): clase para el fondo claro en tema oscuro.
    expect(html).toContain("ts-source-chip ts-source-chip--dark-logo");
  });

  it("con el lote 3 prendido suma esas marcas (EN)", async () => {
    const html = await render("1", "en");
    expect(html).toContain("TS AI searches live on…");
    expect(html).toContain("no affiliation implied");
    for (const s of LIVE_SEARCH_SOURCES) {
      const label = liveSearchSourceLabel(s, "en");
      expect(shown(html, label), s.name).toBe(true);
      expect(html).toContain(`src="/sources/${s.logo}.svg" alt="${label}"`);
    }
    expect(html).not.toContain("Walmart");
  });
});

describe("GET /api/live-search-sources", () => {
  async function get(flag: string | undefined) {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_LIVE_SEARCH_LOTE3", flag);
    const { GET } = await import("@/app/api/live-search-sources/route");
    return GET().json();
  }

  it("apagado por defecto", async () => {
    expect(await get(undefined)).toEqual({
      lote3: false,
      sources: LIVE.map((s) => s.name),
    });
  });

  it('prendido con "1"', async () => {
    expect(await get("1")).toEqual({
      lote3: true,
      sources: LIVE_SEARCH_SOURCES.map((s) => s.name),
    });
  });
});
