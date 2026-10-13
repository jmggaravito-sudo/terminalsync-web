import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  LIVE_SEARCH_ROW_SIZE,
  LIVE_SEARCH_SOURCES,
  liveSearchRows,
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
      expect(s.logo, `${s.name} sin logo`).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("se reparten en filas de 7 sin cambiar el orden (hoy 7 + 7)", () => {
    expect(LIVE_SEARCH_ROW_SIZE).toBe(7);
    const rows = liveSearchRows(LIVE_SEARCH_SOURCES);
    expect(rows.map((r) => r.length)).toEqual([7, 7]);
    expect(rows.flat()).toEqual(LIVE_SEARCH_SOURCES);
    expect(liveSearchRows(LIVE).map((r) => r.length)).toEqual([7]);
    expect(liveSearchRows([1, 2, 3], 2)).toEqual([[1, 2], [3]]);
    expect(liveSearchRows([])).toEqual([]);
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
    /<div class="live-src" data-live-search>([\s\S]*?)<p class="live-src-note">/,
  );

  /**
   * Filas y cuadros del bloque. Los cuadros son los mismos de las integraciones
   * de arriba (`.tiles-rows` > `.tiles-row` > `.tile`): solo logo, sin texto
   * visible; el nombre va en `title` del cuadro y `alt` del logo.
   */
  function parseRows(markup: string) {
    const rows = [
      ...markup.matchAll(
        /<div class="tiles-row" role="none"([^>]*)>([\s\S]*?)<\/div>/g,
      ),
    ];
    return rows.map(([, rowAttrs, inner]) => {
      const tiles = [
        ...inner.matchAll(
          /<span class="(tile(?: dark-logo)?)" role="listitem" title="([^"]+)"([^>]*)>([\s\S]*?)<\/span>/g,
        ),
      ].map(([, classes, title, attrs, content]) => {
        const lote3 = /data-live-search-lote="3"/.test(attrs);
        expect(/\shidden(\s|$)/.test(attrs), `hidden ↔ lote 3 en ${title}`).toBe(lote3);
        const img = content.match(
          /^<img src="\/sources\/([a-z0-9-]+)\.svg" alt="([^"]+)"( data-alt-en="([^"]+)")? loading="lazy" onerror="this\.parentNode\.remove\(\)" \/>$/,
        );
        expect(img, `cuadro sin logo o con texto: ${content}`).not.toBeNull();
        expect(img![2], "alt = title").toBe(title);
        return {
          label: title,
          en: img![4] ?? title,
          logo: img![1],
          darkLogo: classes.includes("dark-logo"),
          batch: lote3 ? "lote3" : "live",
        };
      });
      const rowLote3 = /data-live-search-lote="3"/.test(rowAttrs);
      expect(/\shidden(\s|$)/.test(rowAttrs)).toBe(rowLote3);
      // Una fila se oculta entera solo si todos sus cuadros son del lote 3.
      expect(rowLote3, "fila oculta ↔ todo lote 3").toBe(
        tiles.length > 0 && tiles.every((t) => t.batch === "lote3"),
      );
      return tiles;
    });
  }

  it("tiene el bloque, el rótulo y la nota de marcas", () => {
    expect(block).not.toBeNull();
    expect(block![1]).toContain(
      '<h3 class="live-src-h" id="live-src-title">La IA de TS busca en vivo en…</h3>',
    );
    expect(block![1]).toContain(
      '<div class="tiles-rows" role="list" aria-labelledby="live-src-title">',
    );
    expect(html).toContain(
      "Las marcas pertenecen a sus respectivos dueños. TS consulta información pública; no implica afiliación.",
    );
  });

  it("mismas fuentes, mismo orden, mismos logos, filas de 7, lote 3 oculto", () => {
    const rows = parseRows(block![1]);
    expect(rows.map((r) => r.length)).toEqual(
      liveSearchRows(LIVE_SEARCH_SOURCES).map((r) => r.length),
    );
    expect(rows.flat()).toEqual(
      LIVE_SEARCH_SOURCES.map((s) => ({
        label: liveSearchSourceLabel(s, "es"),
        en: liveSearchSourceLabel(s, "en"),
        logo: s.logo,
        darkLogo: Boolean(s.darkLogo),
        batch: s.batch,
      })),
    );
  });

  it("reusa los estilos de los cuadros de integraciones, sin copiarlos", () => {
    // El cuadro sigue definido una sola vez, en la regla de las integraciones.
    expect(html.match(/^\.tile\{/gm)?.length).toBe(1);
    expect(html).not.toMatch(/\.live-src[^{]*\.tile\{[^}]*(width|height|border-radius)/);
    // Lo único propio: fondo claro del logo oscuro en tema oscuro, y el gate.
    expect(html).toContain(
      "html.var-dark .live-src .tile.dark-logo{background:#e8eaee;border-color:transparent}",
    );
    expect(html).toContain(".live-src [hidden]{display:none}");
    expect(html).not.toContain("src-chip");
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

  it("el alt y el title siguen al idioma", () => {
    expect(html).toContain("window.addEventListener('ts-lang',syncAlt)");
    expect(html).toContain("img.alt=name;img.parentNode.title=name;");
  });

  it("i18n.js traduce al inglés el rótulo y la nota", () => {
    const i18n = readFileSync(
      path.join(ROOT, "public/landing-b/i18n.js"),
      "utf8",
    );
    expect(i18n).toContain('"La IA de TS busca en vivo en…": "TS AI searches live on…"');
    expect(i18n).toContain(
      '"Las marcas pertenecen a sus respectivos dueños. TS consulta información pública; no implica afiliación.": "Brands belong to their respective owners. TS looks up public information; no affiliation implied."',
    );
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
  const liveBlock = (html: string) =>
    html.slice(html.indexOf('class="ts-live-sources"'));
  const tile = (s: (typeof LIVE_SEARCH_SOURCES)[number], lang: "es" | "en") => {
    const label = liveSearchSourceLabel(s, lang);
    const cls = s.darkLogo
      ? "ts-integration-tile ts-integration-tile--dark-logo"
      : "ts-integration-tile";
    return `<div class="${cls}" title="${label}" role="listitem"><img src="/sources/${s.logo}.svg" alt="${label}" loading="lazy" width="24" height="24"/></div>`;
  };

  it("mismo cuadro que las integraciones, solo producción por defecto (ES)", async () => {
    const html = await render(undefined, "es");
    const block = liveBlock(html);
    expect(block).toContain("La IA de TS busca en vivo en…");
    expect(block).toContain("no implica afiliación");
    for (const s of LIVE) expect(block, s.name).toContain(tile(s, "es"));
    for (const s of LOTE3) expect(block, s.name).not.toContain(`/sources/${s.logo}.svg`);
    expect(block.match(/class="ts-live-sources-row"/g)?.length).toBe(1);
    // Sin texto visible en los cuadros (solo alt/title).
    expect(block).not.toContain("<span");
  });

  it("con el lote 3 prendido: 14 cuadros en filas de 7 (EN)", async () => {
    const html = await render("1", "en");
    const block = liveBlock(html);
    expect(block).toContain("TS AI searches live on…");
    expect(block).toContain("no affiliation implied");
    for (const s of LIVE_SEARCH_SOURCES) expect(block, s.name).toContain(tile(s, "en"));
    const rows = block.split('class="ts-live-sources-row"').slice(1);
    expect(rows.map((r) => (r.match(/role="listitem"/g) ?? []).length)).toEqual([7, 7]);
    expect(block).not.toContain("Walmart");
  });

  it("las integraciones de arriba no cambian", async () => {
    const html = await render(undefined, "es");
    expect(html).toContain(
      '<div class="ts-integration-tile"><img src="/connectors/gmail.svg" alt="gmail" loading="lazy" width="24" height="24"/></div>',
    );
    expect(html).toContain(
      '<div class="ts-integration-tile ts-integration-tile--dark-logo"><img src="/connectors/notion.svg" alt="notion"',
    );
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
