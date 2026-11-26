import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://terminalsync.ai";
const LOCALES = {
  es: {
    title: "TS — tu suite empresarial con IA",
    description:
      "Una suite empresarial con IA, +800 conectores y memoria por proyecto para tu equipo, con aprobación humana.",
    ogLocale: "es_ES",
    alternateLocale: "en_US",
    image: "/landing-b/assets/ts-corporate-poster-es.jpg",
  },
  en: {
    title: "TS — your AI business suite",
    description:
      "An AI business suite with 800+ connectors and memory per project for your team, with human approval.",
    ogLocale: "en_US",
    alternateLocale: "es_ES",
    image: "/landing-b/assets/ts-corporate-poster-en.jpg",
  },
};

const FORBIDDEN_PUBLIC_COPY = /\b(?:activepieces|treg|ego(?:\s+lite)?)\b/i;

function slugify(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function connectorCategory(piece) {
  const text = [piece.name, piece.pkg, piece.description?.es, piece.description?.en]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (/\b(meta|facebook|instagram|tiktok|youtube|ads|marketing|mailchimp|campaign)\b/.test(text)) return "marketing";
  if (/\b(crm|sales|lead|hubspot|salesforce|pipedrive|apollo|close)\b/.test(text)) return "sales";
  if (/\b(quickbooks|alegra|plaid|stripe|invoice|payment|payroll|bank|accounting|finance)\b/.test(text)) return "finance";
  if (/\b(slack|discord|telegram|whatsapp|twilio|gmail|email|mail|messaging|intercom)\b/.test(text)) return "communication";
  if (/\b(shopify|woocommerce|amazon|ebay|ecommerce|inventory|store)\b/.test(text)) return "commerce";
  if (/\b(github|gitlab|postgres|postgresql|database|sql|api|webhook|aws|azure|developer|kafka|cloud)\b/.test(text)) return "development";
  if (/\b(notion|google|drive|sheets|calendar|asana|trello|clickup|monday|airtable|productivity|task)\b/.test(text)) return "productivity";
  return "other";
}

export function sanitizeConnectorCatalog(source) {
  const pieces = (Array.isArray(source?.pieces) ? source.pieces : [])
    .filter((piece) => {
      const name = String(piece?.name || "").trim();
      const description = `${piece?.description?.es || ""} ${piece?.description?.en || ""}`;
      return name && !FORBIDDEN_PUBLIC_COPY.test(name) && !FORBIDDEN_PUBLIC_COPY.test(description);
    })
    .map((piece) => {
      const rawPackage = String(piece.pkg || "");
      const packageSlug = rawPackage
        .replace(/^@[^/]+\//i, "")
        .replace(/^piece-/i, "")
        .replace(/^ts\//i, "");
      return {
        name: String(piece.name).trim(),
        pkg: packageSlug || slugify(piece.name),
        description: {
          es: String(piece.description?.es || ""),
          en: String(piece.description?.en || ""),
        },
        category: connectorCategory(piece),
        soon: piece.soon === true,
      };
    });
  return { total: pieces.length, pieces };
}

function setMeta(document, attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function setLink(document, predicate, attributes) {
  let element = [...document.head.querySelectorAll("link")].find(predicate);
  if (!element) {
    element = document.createElement("link");
    document.head.appendChild(element);
  }
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value);
  }
}

export function renderLandingLocale(sourceHtml, i18nSource, locale) {
  const copy = LOCALES[locale];
  if (!copy) throw new Error(`Unsupported landing locale: ${locale}`);

  const dom = new JSDOM(sourceHtml, {
    url: `${ORIGIN}/${locale}`,
    runScripts: "outside-only",
  });
  const { document } = dom.window;
  dom.window.HTMLMediaElement.prototype.load = function () {};
  dom.window.eval(i18nSource);
  if (typeof dom.window.TS_setLang !== "function") {
    dom.window.close();
    throw new Error("The landing i18n script did not expose TS_setLang");
  }

  dom.window.TS_setLang(locale);
  document.documentElement.lang = locale;
  document.title = copy.title;
  const description = document.querySelector('meta[name="description"]');
  if (!description) {
    dom.window.close();
    throw new Error("The landing source is missing its description metadata");
  }
  description.setAttribute("content", copy.description);

  const canonical = `${ORIGIN}/${locale}`;
  setLink(
    document,
    (link) => link.getAttribute("rel") === "canonical",
    { rel: "canonical", href: canonical },
  );
  for (const [language, href] of [
    ["es", `${ORIGIN}/es`],
    ["en", `${ORIGIN}/en`],
    ["x-default", `${ORIGIN}/es`],
  ]) {
    setLink(
      document,
      (link) =>
        link.getAttribute("rel") === "alternate" &&
        link.getAttribute("hreflang") === language,
      { rel: "alternate", hreflang: language, href },
    );
  }

  setMeta(document, "property", "og:type", "website");
  setMeta(document, "property", "og:site_name", "TS");
  setMeta(document, "property", "og:title", copy.title);
  setMeta(document, "property", "og:description", copy.description);
  setMeta(document, "property", "og:url", canonical);
  setMeta(document, "property", "og:locale", copy.ogLocale);
  setMeta(document, "property", "og:locale:alternate", copy.alternateLocale);
  setMeta(document, "property", "og:image", `${ORIGIN}${copy.image}`);
  setMeta(document, "name", "twitter:card", "summary_large_image");
  setMeta(document, "name", "twitter:title", copy.title);
  setMeta(document, "name", "twitter:description", copy.description);
  setMeta(document, "name", "twitter:image", `${ORIGIN}${copy.image}`);

  document.querySelectorAll('meta[name="robots"]').forEach((element) => element.remove());
  document.querySelectorAll("[data-lhref]").forEach((link) => {
    const target = link.getAttribute("data-lhref");
    if (target?.startsWith("/")) link.setAttribute("href", `/${locale}${target}`);
  });
  document.querySelectorAll(".lang a[data-lang]").forEach((link) => {
    const language = link.getAttribute("data-lang");
    link.setAttribute("href", `/${language}`);
    link.classList.toggle("on", language === locale);
  });
  document.querySelectorAll("[data-demo-module]").forEach((card) => {
    const moduleName = card.getAttribute("data-demo-module");
    const demoUrl = `/landing-b/demos/demo-module.html?module=${encodeURIComponent(moduleName)}&lang=${locale}`;
    if (card.tagName === "A") card.setAttribute("href", demoUrl);
    const frame = card.querySelector("iframe");
    if (frame) frame.setAttribute("src", demoUrl);
  });
  document.querySelectorAll("[data-live-search] .tile img").forEach((image) => {
    const alt =
      image.getAttribute(locale === "en" ? "data-alt-en" : "data-alt-es") ||
      image.getAttribute("alt") ||
      "";
    image.setAttribute("alt", alt);
    image.parentElement?.setAttribute("title", alt);
  });

  const output = dom.serialize();
  dom.window.close();
  return output;
}

async function generate() {
  const publicDir = path.join(ROOT, "public", "landing-b");
  const publicDataDir = path.join(ROOT, "public", "data");
  const [sourceHtml, i18nSource, catalogSource] = await Promise.all([
    readFile(path.join(publicDir, "index.html"), "utf8"),
    readFile(path.join(publicDir, "i18n.js"), "utf8"),
    readFile(path.join(ROOT, "data", "connector-catalog-source.json"), "utf8"),
  ]);

  const publicCatalog = sanitizeConnectorCatalog(JSON.parse(catalogSource));
  await mkdir(publicDataDir, { recursive: true });
  await writeFile(
    path.join(publicDataDir, "terminalsync-connectors.json"),
    JSON.stringify(publicCatalog),
    "utf8",
  );

  for (const locale of Object.keys(LOCALES)) {
    const output = renderLandingLocale(sourceHtml, i18nSource, locale);
    await writeFile(path.join(publicDir, `index-${locale}.html`), output, "utf8");
  }
  console.log(`Generated localized Landing B HTML and ${publicCatalog.total} sanitized connectors`);
}

const invokedPath = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : "";
if (invokedPath === import.meta.url) {
  generate().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
