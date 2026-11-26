import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import { renderLandingLocale, sanitizeConnectorCatalog } from "./generate-landing-b-locales.mjs";

const sourceHtml = readFileSync(new URL("../public/landing-b/index.html", import.meta.url), "utf8");
const i18nSource = readFileSync(new URL("../public/landing-b/i18n.js", import.meta.url), "utf8");
const demoHtml = readFileSync(new URL("../public/landing-b/demos/demo-module.html", import.meta.url), "utf8");

function documentFor(locale) {
  return new JSDOM(renderLandingLocale(sourceHtml, i18nSource, locale)).window.document;
}

function runtimeLocale(locale, savedLocale) {
  const dom = new JSDOM(sourceHtml, {
    url: `https://terminalsync.ai/${locale}`,
    runScripts: "outside-only",
  });
  dom.window.HTMLMediaElement.prototype.load = function () {};
  dom.window.localStorage.setItem("ts_lang", savedLocale);
  dom.window.eval(i18nSource);
  dom.window.document.dispatchEvent(new dom.window.Event("DOMContentLoaded", { bubbles: true }));
  const result = {
    lang: dom.window.document.documentElement.lang,
    savedLocale: dom.window.localStorage.getItem("ts_lang"),
    heroLead: dom.window.document.querySelector("#heroHeadlineLead")?.textContent,
    heroSubtitle: dom.window.document.querySelector("#heroSubtitle")?.textContent,
  };
  dom.window.close();
  return result;
}

describe("localized static Landing B artifacts", () => {
  it("pre-renders /en content, document language and SEO metadata in English", () => {
    const document = documentFor("en");
    expect(document.documentElement.lang).toBe("en");
    expect(document.title).toBe("TerminalSync — one AI workspace for your business");
    expect(document.querySelector('meta[name="description"]')?.content).toContain("One built-in AI, 800+ connectors");
    expect(document.querySelector("#heroHeadlineLead")?.textContent).toBe("Find leads across 100+ live sources");
    expect(document.querySelector("#heroHeadlineAccent")?.textContent).toBe("and reach them before your competition.");
    expect(document.querySelector("#heroSubtitle")?.textContent).toContain("nothing is published, sent, or spent without your approval.");
    expect(document.querySelector(".hero-copy .eyebrow")?.textContent).toBe("TerminalSync for Business · macOS");
    expect(document.querySelector("#windows h2")?.textContent).toBe("Windows is in active development.");
    expect(document.querySelector("#prospeccion h2")?.textContent).toBe("Find your next customer before your competition does.");
    expect(document.querySelector("#navegador .eyebrow")?.textContent).toBe("Built-in private browser");
    expect(document.querySelector("#contabilidad h2")?.textContent).toBe("Complete double-entry accounting in one place — without being an accountant.");
    expect(document.querySelector("#plan-team .price-note")?.textContent || document.querySelector("#team .price-note")?.textContent).toContain("Currently supports connecting teams");
    expect(document.querySelector("#plan-team .for")?.textContent).toContain("Team currently supports connecting teams and managing invitations");
    expect(document.querySelector(".final .plat")?.textContent).toContain("Windows is in active development");
    expect(document.querySelector("#archivos .win .t")?.textContent).toContain("/projects/Martínez");
    expect(document.body.textContent).not.toMatch(/Activepieces|\bTreg\b|\bEgo(?: Lite)?\b/i);
    expect(document.querySelector('link[rel="canonical"]')?.href).toBe("https://terminalsync.ai/en");
    expect(document.querySelector('link[rel="alternate"][hreflang="en"]')?.href).toBe("https://terminalsync.ai/en");
    expect(document.querySelector('link[rel="alternate"][hreflang="es"]')?.href).toBe("https://terminalsync.ai/es");
    expect(document.querySelector('link[rel="alternate"][hreflang="x-default"]')?.href).toBe("https://terminalsync.ai/es");
    expect(document.querySelector('meta[property="og:url"]')?.content).toBe("https://terminalsync.ai/en");
    expect(document.querySelector('meta[name="twitter:title"]')?.content).toBe(document.title);
    expect(document.querySelector('meta[name="robots"]')).toBeNull();
    expect(document.querySelector('.lang a[data-lang="en"]')?.getAttribute("href")).toBe("/en");
    expect(document.querySelector('[data-lhref="/casos-de-uso"]')?.getAttribute("href")).toBe("/en/casos-de-uso");
  });

  it("lets the explicit /en or /es URL override a contradictory saved preference at runtime", () => {
    expect(runtimeLocale("en", "es")).toEqual({
      lang: "en",
      savedLocale: "en",
      heroLead: "Find leads across 100+ live sources",
      heroSubtitle: "One built-in AI, 800+ app connectors, and dedicated memory per project. Run your entire business from one place — nothing is published, sent, or spent without your approval.",
    });
    expect(runtimeLocale("es", "en")).toEqual({
      lang: "es",
      savedLocale: "es",
      heroLead: "Encuentra clientes en +100 fuentes en vivo",
      heroSubtitle: "Una sola IA incluida, +800 conectores para tus apps y memoria por proyecto. Opera toda tu empresa desde un solo lugar — nada se publica, se envía ni se mueve sin tu aprobación.",
    });
  });

  it("pre-renders /es as Spanish with its localized metadata", () => {
    const document = documentFor("es");
    expect(document.documentElement.lang).toBe("es");
    expect(document.title).toBe("TerminalSync — una IA para operar toda tu empresa");
    expect(document.querySelector("#heroHeadlineLead")?.textContent).toBe("Encuentra clientes en +100 fuentes en vivo");
    expect(document.querySelector("#windows h2")?.textContent).toBe("Windows está en desarrollo activo.");
    expect(document.querySelector('link[rel="canonical"]')?.href).toBe("https://terminalsync.ai/es");
    expect(document.querySelector('.lang a[data-lang="es"]')?.classList.contains("on")).toBe(true);
    expect(document.querySelector('.lang a[data-lang="en"]')?.getAttribute("href")).toBe("/en");
  });

  it("renders and responds in both languages across all five interactive demos", () => {
    const modules = ["prospecting", "browser", "creative", "ads", "accounting"];
    for (const locale of ["es", "en"]) {
      for (const module of modules) {
        const dom = new JSDOM(demoHtml, {
          url: `https://terminalsync.ai/landing-b/demos/demo-module.html?module=${module}&lang=${locale}`,
          runScripts: "dangerously",
          pretendToBeVisual: true,
        });
        const document = dom.window.document;
        expect(document.documentElement.lang).toBe(locale);
        expect(document.querySelector("#title")?.textContent.trim()).not.toBe("");
        expect(document.querySelector(".workspace")?.getAttribute("aria-label")).toBe(
          locale === "en" ? "Product demo" : "Demostración de producto",
        );
        if (locale === "en" && module === "accounting") {
          expect(document.querySelector(".shell")?.textContent).toContain("Vendor invoice");
          expect(document.querySelector(".shell")?.textContent).not.toMatch(/Factura de proveedor|Inventario recibido|Asiento balanceado/);
        }
        document.querySelector(".button")?.click();
        expect(document.querySelector(".message")?.classList.contains("show")).toBe(true);
        dom.window.close();
      }
    }
  });

  it("publishes a categorized connector catalog without provider metadata or internal engine names", () => {
    const catalog = sanitizeConnectorCatalog({
      total: 3,
      pieces: [
        {
          name: "Slack",
          pkg: "@internal-provider/piece-slack",
          logo: "https://internal-provider.example/slack.png",
          description: { es: "Mensajería para equipos", en: "Team messaging" },
          source: "internal-provider",
        },
        {
          name: "Activepieces Platform",
          pkg: "@internal-provider/piece-platform",
          description: { es: "Automatización", en: "Automation" },
        },
        {
          name: "Private tool",
          pkg: "@internal-provider/piece-private",
          description: { es: "Motor Treg para el navegador Ego Lite", en: "Internal engine" },
        },
      ],
    });
    expect(catalog.total).toBe(1);
    expect(catalog.pieces[0]).toMatchObject({ name: "Slack", pkg: "slack", category: "communication" });
    expect(JSON.stringify(catalog)).not.toMatch(/internal-provider|Activepieces|Treg|Ego Lite/i);
  });
});
