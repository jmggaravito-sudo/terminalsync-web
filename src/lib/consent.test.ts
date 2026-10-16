import { readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CONSENT_COPY } from "@/components/consent/copy";
import { ConsentGate } from "@/components/consent/ConsentGate";
import {
  ALL_CONSENT,
  CONSENT_KEY,
  CONSENT_VERSION,
  LEGACY_CONSENT_KEY,
  NO_CONSENT,
  analyticsAllowed,
  effectiveConsent,
  landingSourceFor,
  needsDecision,
  parseConsent,
  readConsentRecord,
  writeConsent,
  type StorageLike,
} from "./consent";

const root = path.resolve(__dirname, "..", "..");
const read = (rel: string) => readFileSync(path.join(root, rel), "utf8");

function memoryStorage(initial: Record<string, string> = {}): StorageLike & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = v;
    },
  };
}

describe("consentimiento: estado por defecto y decisiones", () => {
  it("sin decisión todo lo no esencial está apagado y hay que preguntar", () => {
    const s = memoryStorage();
    expect(effectiveConsent(s)).toEqual(NO_CONSENT);
    expect(needsDecision(s)).toBe(true);
    expect(analyticsAllowed(effectiveConsent(s))).toBe(false);
  });

  it("sin almacenamiento disponible (modo privado) también queda apagado", () => {
    expect(effectiveConsent(null)).toEqual(NO_CONSENT);
    expect(needsDecision(null)).toBe(true);
  });

  it("rechazar todas se guarda y no activa nada", () => {
    const s = memoryStorage();
    writeConsent(s, NO_CONSENT, new Date("2026-10-16T10:00:00Z"));
    expect(needsDecision(s)).toBe(false);
    expect(effectiveConsent(s)).toEqual(NO_CONSENT);
  });

  it("aceptar todas guarda versión, fecha y categorías", () => {
    const s = memoryStorage();
    const rec = writeConsent(s, ALL_CONSENT, new Date("2026-10-16T10:00:00Z"));
    expect(rec).toEqual({
      version: CONSENT_VERSION,
      date: "2026-10-16T10:00:00.000Z",
      categories: { analytics: true, affiliates: true },
    });
    expect(readConsentRecord(s)).toEqual(rec);
    expect(analyticsAllowed(effectiveConsent(s))).toBe(true);
  });

  it("la selección parcial respeta cada categoría", () => {
    const s = memoryStorage();
    writeConsent(s, { analytics: false, affiliates: true });
    expect(effectiveConsent(s)).toEqual({ analytics: false, affiliates: true });
  });

  it("un registro de otra versión se ignora y se vuelve a preguntar", () => {
    const s = memoryStorage({
      [CONSENT_KEY]: JSON.stringify({
        version: "1999-01-01",
        date: "x",
        categories: { analytics: true, affiliates: true },
      }),
    });
    expect(needsDecision(s)).toBe(true);
    expect(effectiveConsent(s)).toEqual(NO_CONSENT);
  });

  it("registros corruptos no activan nada", () => {
    for (const raw of ["", "null", "{", '"accepted"', '{"version":"' + CONSENT_VERSION + '"}']) {
      expect(parseConsent(raw)).toBeNull();
    }
  });
});

describe("migración del valor antiguo del banner", () => {
  it('"accepted" antiguo solo vale para afiliados, nunca para analítica', () => {
    const s = memoryStorage({ [LEGACY_CONSENT_KEY]: "accepted" });
    expect(effectiveConsent(s)).toEqual({ analytics: false, affiliates: true });
    // Y el banner vuelve a preguntar, porque no hay registro v2.
    expect(needsDecision(s)).toBe(true);
  });

  it('"necessary" antiguo no activa nada', () => {
    const s = memoryStorage({ [LEGACY_CONSENT_KEY]: "necessary" });
    expect(effectiveConsent(s)).toEqual(NO_CONSENT);
  });

  it("una decisión v2 manda sobre el valor antiguo", () => {
    const s = memoryStorage({ [LEGACY_CONSENT_KEY]: "accepted" });
    writeConsent(s, NO_CONSENT);
    expect(effectiveConsent(s)).toEqual(NO_CONSENT);
  });
});

describe("cookie de atribución", () => {
  it("solo hay origen en la home y en for-developers", () => {
    expect(landingSourceFor("/es")).toBe("consumer");
    expect(landingSourceFor("/en/")).toBe("consumer");
    expect(landingSourceFor("/es/for-developers")).toBe("dev");
    expect(landingSourceFor("/es/connectors")).toBeNull();
  });
});

describe("no hay analítica antes del consentimiento (React)", () => {
  it("ConsentGate no pinta nada en el render inicial (servidor y primer render del cliente)", () => {
    expect(renderToStaticMarkup(createElement(ConsentGate))).toBe("");
  });

  it("el layout raíz no monta Analytics, SpeedInsights ni CtaTracker por su cuenta", () => {
    const layout = read("src/app/layout.tsx");
    expect(layout).not.toMatch(/@vercel\/analytics/);
    expect(layout).not.toMatch(/@vercel\/speed-insights/);
    expect(layout).not.toMatch(/<CtaTracker/);
    expect(layout).toContain("<ConsentGate />");
    expect(layout).toContain("<CookieBanner />");
  });

  it("solo ConsentGate importa los paquetes de analítica de Vercel", () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const e of require("node:fs").readdirSync(path.join(root, dir), { withFileTypes: true })) {
        const rel = `${dir}/${e.name}`;
        if (e.isDirectory()) walk(rel);
        else if (/\.(ts|tsx)$/.test(e.name) && !/\.test\./.test(e.name)) {
          if (/@vercel\/(analytics|speed-insights)/.test(read(rel))) offenders.push(rel);
        }
      }
    };
    walk("src");
    // CtaTracker llama a `track` pero ConsentGate es quien lo monta (y él se vuelve a proteger).
    expect(offenders.sort()).toEqual([
      "src/app/[lang]/gracias/GraciasClient.tsx",
      "src/components/analytics/CtaTracker.tsx",
      "src/components/consent/ConsentGate.tsx",
    ]);
    // Los dos que llaman a `track` comprueban el consentimiento antes de emitir.
    expect(read("src/components/analytics/CtaTracker.tsx")).toContain("mayTrack()");
    expect(read("src/app/[lang]/gracias/GraciasClient.tsx")).toContain("analyticsAllowed(");
  });

  it("el middleware no crea la cookie de atribución (solo la de región, necesaria)", async () => {
    const { NextRequest } = await import("next/server");
    const { middleware } = await import("@/middleware");
    for (const country of ["ES", "US", undefined]) {
      const res = middleware(
        new NextRequest("https://terminalsync.ai/es", {
          headers: country ? { "x-vercel-ip-country": country } : {},
        }),
      );
      const names = res.cookies.getAll().map((c) => c.name);
      expect(names).toEqual(["ts_region"]);
    }
  });

  it("Sentry del navegador no se inicializa a nivel de módulo y se carga bajo demanda", () => {
    const src = read("src/instrumentation-client.ts");
    expect(src).not.toMatch(/^import \* as Sentry/m);
    expect(src).toMatch(/await import\("@sentry\/nextjs"\)/);
    expect(src).toMatch(/analyticsAllowed\(/);
    expect(src).not.toMatch(/replayIntegration/);
  });

  it("Rewardful solo se inyecta con consentimiento de afiliados", () => {
    const src = read("src/components/RewardfulLoader.tsx");
    expect(src).toMatch(/affiliatesAllowed\(/);
    expect(src).not.toMatch(/cookie-consent-v1/);
  });
});

describe("home estática: sin analítica antes del consentimiento", () => {
  const html = read("public/landing-b/index.html");

  it("el HTML no carga el script de Vercel Insights ni define la cola window.va", () => {
    expect(html).not.toMatch(/_vercel\/insights/);
    expect(html).not.toMatch(/window\.va\s*=/);
    expect(html).not.toMatch(/speed-insights/);
  });

  it("incluye el gestor de consentimiento y los enlaces de cookies en el pie", () => {
    expect(html).toContain('<script src="/consent.js"></script>');
    expect(html).toContain("data-cookie-settings");
    expect(html).toContain('data-lhref="/legal/cookies"');
  });

  /** Doble mínimo del DOM: suficiente para ejecutar consent.js tal cual. */
  function run(opts: { stored?: string; pathname?: string; cookie?: string }) {
    const appended: Array<{ parent: string; node: any }> = [];
    const store: Record<string, string> = opts.stored ? { [CONSENT_KEY]: opts.stored } : {};
    const makeNode = (tag: string): any => {
      const attrs: Record<string, string> = {};
      const listeners: Record<string, Array<(e: any) => void>> = {};
      const node: any = {
        tagName: tag,
        children: [] as any[],
        style: {},
        parentNode: null,
        setAttribute: (k: string, v: string) => (attrs[k] = v),
        getAttribute: (k: string) => attrs[k],
        appendChild(c: any) {
          c.parentNode = node;
          node.children.push(c);
          return c;
        },
        removeChild(c: any) {
          node.children = node.children.filter((x: any) => x !== c);
          c.parentNode = null;
          return c;
        },
        addEventListener: (t: string, f: (e: any) => void) => ((listeners[t] ||= []).push(f), undefined),
        click: () => (listeners.click || []).forEach((f) => f({ target: node, preventDefault() {} })),
        listeners,
        attrs,
        set textContent(v: string) {
          node._text = v;
        },
        get textContent() {
          return node._text ?? node.children.map((c: any) => c.textContent).join("");
        },
      };
      return node;
    };
    const head = makeNode("head");
    const body = makeNode("body");
    const origHeadAppend = head.appendChild;
    head.appendChild = (c: any) => (appended.push({ parent: "head", node: c }), origHeadAppend(c));
    const docListeners: Record<string, Array<(e: any) => void>> = {};
    const events: string[] = [];
    const win: any = {
      localStorage: {
        getItem: (k: string) => (k in store ? store[k] : null),
        setItem: (k: string, v: string) => void (store[k] = v),
      },
      addEventListener() {},
      dispatchEvent: (e: any) => (events.push(e.type), true),
    };
    const doc: any = {
      head,
      body,
      cookie: opts.cookie ?? "",
      createElement: makeNode,
      createTextNode: (t: string) => ({ textContent: t, parentNode: null }),
      getElementById: () => null,
      addEventListener: (t: string, f: (e: any) => void) => ((docListeners[t] ||= []).push(f), undefined),
    };
    const ctx: any = {
      window: win,
      document: doc,
      location: { pathname: opts.pathname ?? "/es" },
      CustomEvent: class {
        type: string;
        detail: unknown;
        constructor(t: string, i?: { detail?: unknown }) {
          this.type = t;
          this.detail = i?.detail;
        }
      },
      console,
    };
    ctx.window.document = doc;
    ctx.self = ctx.window;
    vm.createContext(ctx);
    vm.runInContext(read("public/consent.js"), ctx);
    const insights = () =>
      appended.filter((a) => a.node.tagName === "script" && /_vercel\/insights/.test(a.node.src ?? ""));
    const dialog = () => body.children.find((c: any) => c.attrs?.role === "dialog");
    const buttons = () => (dialog()?.children ?? []).flatMap(function flat(n: any): any[] {
      return n.tagName === "button" ? [n] : (n.children ?? []).flatMap(flat);
    });
    return { appended, store, insights, dialog, buttons, doc, win, events, ctx };
  }

  it("primera visita: pinta el banner y NO inyecta analítica ni crea cookie", () => {
    const r = run({});
    expect(r.dialog()).toBeTruthy();
    expect(r.insights()).toHaveLength(0);
    expect(r.doc.cookie).toBe("");
    expect(r.win.va).toBeUndefined();
    const labels = r.buttons().map((b: any) => b.textContent);
    expect(labels).toEqual([CONSENT_COPY.es.accept, CONSENT_COPY.es.reject, CONSENT_COPY.es.configure]);
  });

  it("los tres botones tienen la misma clase (misma prominencia)", () => {
    const r = run({});
    const classes = new Set(r.buttons().map((b: any) => b.attrs.class));
    expect(classes.size).toBe(1);
  });

  it("Rechazar todas guarda la decisión y sigue sin analítica", () => {
    const r = run({});
    r.buttons()[1].click();
    expect(r.insights()).toHaveLength(0);
    const rec = parseConsent(r.store[CONSENT_KEY]);
    expect(rec?.categories).toEqual({ analytics: false, affiliates: false });
    expect(r.dialog()).toBeFalsy();
  });

  it("Aceptar todas guarda la decisión e inyecta Vercel Insights una sola vez", () => {
    const r = run({});
    r.buttons()[0].click();
    expect(r.insights()).toHaveLength(1);
    expect(parseConsent(r.store[CONSENT_KEY])?.categories.analytics).toBe(true);
    expect(r.doc.cookie).toContain("tsync_landing=consumer");
    expect(r.events).toContain("ts:consent:changed");
  });

  it("al volver con una decisión de rechazo no pregunta ni carga nada", () => {
    const stored = JSON.stringify({
      version: CONSENT_VERSION,
      date: "2026-10-16T10:00:00.000Z",
      categories: { analytics: false, affiliates: false },
    });
    const r = run({ stored });
    expect(r.dialog()).toBeFalsy();
    expect(r.insights()).toHaveLength(0);
  });

  it("al volver con una aceptación vigente carga la analítica sin preguntar", () => {
    const stored = JSON.stringify({
      version: CONSENT_VERSION,
      date: "2026-10-16T10:00:00.000Z",
      categories: { analytics: true, affiliates: false },
    });
    const r = run({ stored });
    expect(r.dialog()).toBeFalsy();
    expect(r.insights()).toHaveLength(1);
  });

  it("una decisión de otra versión vuelve a preguntar y no carga nada", () => {
    const stored = JSON.stringify({
      version: "1999-01-01",
      date: "x",
      categories: { analytics: true, affiliates: true },
    });
    const r = run({ stored });
    expect(r.dialog()).toBeTruthy();
    expect(r.insights()).toHaveLength(0);
  });

  it("en /en el banner sale en inglés", () => {
    const r = run({ pathname: "/en" });
    expect(r.buttons().map((b: any) => b.textContent)).toEqual([
      CONSENT_COPY.en.accept,
      CONSENT_COPY.en.reject,
      CONSENT_COPY.en.configure,
    ]);
  });

  describe("según la región (cookie ts_region)", () => {
    it("ts_region=eu: banner y sin analítica (igual que antes)", () => {
      const r = run({ cookie: "ts_region=eu" });
      expect(r.dialog()).toBeTruthy();
      expect(r.insights()).toHaveLength(0);
    });

    it("sin cookie ts_region o con valor raro: Europa (fail-safe)", () => {
      for (const cookie of ["", "otra=1", "ts_region=", "ts_region=ROW", "ts_region=xx", "x_ts_region=row"]) {
        const r = run({ cookie });
        expect(r.dialog(), cookie).toBeTruthy();
        expect(r.insights(), cookie).toHaveLength(0);
      }
    });

    it("ts_region=row sin decisión: sin banner, analítica y tsync_landing como antes", () => {
      const r = run({ cookie: "a=1; ts_region=row" });
      expect(r.dialog()).toBeFalsy();
      expect(r.insights()).toHaveLength(1);
      expect(r.doc.cookie).toContain("tsync_landing=consumer");
    });

    it("ts_region=row con rechazo guardado: se respeta (sin analítica ni banner)", () => {
      const stored = JSON.stringify({
        version: CONSENT_VERSION,
        date: "2026-10-16T10:00:00.000Z",
        categories: { analytics: false, affiliates: false },
      });
      const r = run({ cookie: "ts_region=row", stored });
      expect(r.dialog()).toBeFalsy();
      expect(r.insights()).toHaveLength(0);
    });

    it("ts_region=row con aceptación guardada: carga la analítica una vez", () => {
      const stored = JSON.stringify({
        version: CONSENT_VERSION,
        date: "2026-10-16T10:00:00.000Z",
        categories: { analytics: true, affiliates: true },
      });
      const r = run({ cookie: "ts_region=row", stored });
      expect(r.dialog()).toBeFalsy();
      expect(r.insights()).toHaveLength(1);
    });
  });
});

describe("región: Europa (estricto) vs resto del mundo (como antes)", () => {
  describe("consent.ts", () => {
    it("Europa y duda: sin decisión todo apagado y hay que preguntar", () => {
      for (const region of ["eu"] as const) {
        const s = memoryStorage();
        expect(effectiveConsent(s, region)).toEqual(NO_CONSENT);
        expect(needsDecision(s, region)).toBe(true);
        expect(needsDecision(null, region)).toBe(true);
      }
    });

    it("resto del mundo: sin decisión todo activo y nunca hay banner", () => {
      const s = memoryStorage();
      expect(effectiveConsent(s, "row")).toEqual(ALL_CONSENT);
      expect(analyticsAllowed(effectiveConsent(s, "row"))).toBe(true);
      expect(needsDecision(s, "row")).toBe(false);
      expect(needsDecision(null, "row")).toBe(false);
    });

    it("resto del mundo: una decisión guardada se respeta", () => {
      const s = memoryStorage();
      writeConsent(s, NO_CONSENT);
      expect(effectiveConsent(s, "row")).toEqual(NO_CONSENT);
      writeConsent(s, { analytics: false, affiliates: true });
      expect(effectiveConsent(s, "row")).toEqual({ analytics: false, affiliates: true });
    });

    it("sin DOM (servidor) la región por defecto es Europa: fail-safe", () => {
      expect(effectiveConsent(memoryStorage())).toEqual(NO_CONSENT);
      expect(needsDecision(memoryStorage())).toBe(true);
    });
  });
});

describe("consent.js y consent.ts no se desincronizan", () => {
  const js = read("public/consent.js");

  it("misma clave, versión y eventos", () => {
    expect(js).toContain(`var CONSENT_KEY = '${CONSENT_KEY}'`);
    expect(js).toContain(`var CONSENT_VERSION = '${CONSENT_VERSION}'`);
    expect(js).toContain("'ts:consent:changed'");
    expect(js).toContain("'ts:consent:open'");
  });

  it("mismos textos en es y en", () => {
    for (const lang of ["es", "en"] as const) {
      for (const [k, v] of Object.entries(CONSENT_COPY[lang])) {
        expect(js, `${lang}.${k}`).toContain(v);
      }
    }
  });
});
