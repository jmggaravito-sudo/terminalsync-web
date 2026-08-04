#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const repoRoot = process.cwd();
const appDir = argValue("--app-dir") || process.env.APP_DIR || "terminal-sync-app";
const changedFilesPath = argValue("--changed-files") || process.env.CHANGED_FILES_PATH || "";
const prBodyPath = argValue("--pr-body") || process.env.PR_BODY_PATH || "";
const eventName = process.env.EVENT_NAME || process.env.GITHUB_EVENT_NAME || "manual";

const categories = [
  { key: "connectors", label: "Conectores", dir: "content/connectors", route: "src/app/[lang]/connectors/[slug]/page.tsx", prefix: "cn", filter: visibleConnector },
  { key: "plugins", label: "Plugins", dir: "content/plugins", route: "src/app/[lang]/plugins/[slug]/page.tsx", prefix: "pl", filter: visiblePlugin },
  { key: "kits", label: "Kits/Bundles", dir: "content/kits", route: "src/app/[lang]/stacks/[slug]/page.tsx", prefix: "kit", filter: visibleKit },
  { key: "skills", label: "Skills", dir: "content/skills", route: "src/app/[lang]/skills/[slug]/page.tsx", prefix: "sk", filter: visibleSkill },
  { key: "cliTools", aliases: ["cli", "cliTools", "cli_tools"], label: "CLI tools", dir: "content/cli-tools", route: "src/app/[lang]/cli-tools/[slug]/page.tsx", prefix: "cli", filter: visibleCli },
];

const failures = [];
const warnings = [];
const report = [];

const changedFiles = readLines(changedFilesPath);
const prBody = prBodyPath && fs.existsSync(prBodyPath) ? fs.readFileSync(prBodyPath, "utf8") : (process.env.PR_BODY || "");
const contentChanged = changedFiles.some((file) => /^content\/(connectors|plugins|kits|skills|cli-tools)\//.test(file));
const marketplaceChanged = changedFiles.some((file) => /^(content\/(connectors|plugins|kits|skills|cli-tools)\/|public\/(connectors|plugins|skills|logos)\/|src\/app\/api\/marketplace\/catalog\/|src\/lib\/(marketplace|plugins|skills|cliTools|connectors))/.test(file));

const inventory = {};
for (const cat of categories) {
  inventory[cat.key] = inventoryForCategory(cat);
}
const counts = Object.fromEntries(categories.map((cat) => [cat.key, inventory[cat.key].es.length]));
counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);

report.push("# Supervision física: landing ↔ app");
report.push("");
report.push("## Conteo esperado desde el catálogo del landing");
report.push("| Categoría | Landing ES | Landing EN | Slugs ES |");
report.push("|---|---:|---:|---|");
for (const cat of categories) {
  const item = inventory[cat.key];
  report.push(`| ${cat.label} | ${item.es.length} | ${item.en.length} | ${item.es.map((entry) => entry.slug).join(", ")} |`);
  const missingTranslation = symmetricDifference(item.es.map((x) => x.slug), item.en.map((x) => x.slug));
  if (missingTranslation.length > 0) {
    failures.push(`${cat.label}: slugs ES/EN no están parejos: ${missingTranslation.join(", ")}`);
  }
}
report.push(`| **Total** | **${counts.total}** | **${categories.reduce((sum, cat) => sum + inventory[cat.key].en.length, 0)}** | |`);

checkLandingPhysicalRoutes();
checkAppPhysicalContract();
checkEvidenceGate();

if (failures.length > 0) {
  report.push("");
  report.push("## Resultado");
  report.push("❌ BLOQUEADO");
  report.push("");
  report.push("### Fallas");
  for (const failure of failures) report.push(`- ${failure}`);
} else {
  report.push("");
  report.push("## Resultado");
  report.push("✅ OK: landing y app tienen contrato de categorías completo; evidencia física requerida/validada cuando el PR toca catálogo público.");
}

const text = `${report.join("\n")}\n`;
console.log(text);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, text);
if (failures.length > 0) process.exit(1);

function argValue(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return "";
  return process.argv[index + 1] || "";
}

function readLines(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return [];
  return fs.readFileSync(filePath, "utf8").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function inventoryForCategory(cat) {
  return {
    es: readLang(cat, "es"),
    en: readLang(cat, "en"),
  };
}

function readLang(cat, lang) {
  const dir = path.join(repoRoot, cat.dir, lang);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .sort()
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const parsed = matter(raw);
      return { slug, data: parsed.data || {}, body: parsed.content || "" };
    })
    .filter((entry) => cat.filter(entry));
}

function visibleConnector(entry) {
  return entry.data.hidden !== true;
}

function visiblePlugin(entry) {
  if (entry.data.hidden === true || entry.data.catalogReady === false) return false;
  const skillSlugs = Array.isArray(entry.data.skillSlugs) ? entry.data.skillSlugs.filter(Boolean) : [];
  return Boolean(entry.data.connectorSlug) || skillSlugs.length > 0;
}

function visibleKit(entry) {
  return entry.data.hidden !== true && entry.data.catalogReady !== false && String(entry.data.status || "").trim() === "available";
}

function visibleSkill(entry) {
  return entry.data.hidden !== true && entry.data.catalogReady !== false;
}

function visibleCli(entry) {
  return entry.data.hidden !== true && entry.data.catalogReady !== false;
}

function symmetricDifference(left, right) {
  const a = new Set(left);
  const b = new Set(right);
  return [...new Set([...left, ...right])].filter((value) => !a.has(value) || !b.has(value)).sort();
}

function fileContains(filePath, tokens) {
  const abs = path.join(repoRoot, filePath);
  if (!fs.existsSync(abs)) return false;
  const source = fs.readFileSync(abs, "utf8");
  return tokens.every((token) => source.includes(token));
}

function checkLandingPhysicalRoutes() {
  report.push("");
  report.push("## Landing físico / rutas públicas");
  for (const cat of categories) {
    const routePath = path.join(repoRoot, cat.route);
    if (!fs.existsSync(routePath)) {
      failures.push(`${cat.label}: falta ruta pública ${cat.route}`);
      continue;
    }
    report.push(`- ${cat.label}: ruta pública existe (${cat.route}).`);
  }

  if (inventory.kits.es.length > 0) {
    const indexOk = fileContains("src/app/[lang]/stacks/page.tsx", ["loadFileKits"]);
    const detailOk = fileContains("src/app/[lang]/stacks/[slug]/page.tsx", ["loadFileKit"]);
    const apiOk = fileContains("src/app/api/marketplace/catalog/route.ts", ["loadFileKits"]);
    if (!indexOk) failures.push("Kits: /stacks no carga kits desde content/kits; el landing puede no mostrar kits físicos.");
    if (!detailOk) failures.push("Kits: /stacks/[slug] no carga kits desde content/kits; el detalle físico puede dar 404.");
    if (!apiOk) failures.push("Kits: /api/marketplace/catalog no carga kits desde content/kits; la app puede no verlos.");
    if (indexOk && detailOk && apiOk) report.push("- Kits/Bundles: index, detalle y API comparten loader de file-kits.");
  }
}

function checkAppPhysicalContract() {
  const absAppDir = path.isAbsolute(appDir) ? appDir : path.join(repoRoot, appDir);
  report.push("");
  report.push("## App física / contrato de Explorar");
  if (!fs.existsSync(absAppDir)) {
    warnings.push(`No encontré app dir ${absAppDir}; se omite contrato estático de app en corrida local.`);
    report.push(`- ⚠️ No encontré checkout de app: ${absAppDir}.`);
    return;
  }
  const explorerPath = path.join(absAppDir, "src/components/PowerUpsExplorerPanel.tsx");
  const marketplacePath = path.join(absAppDir, "src/lib/marketplaceCatalog.ts");
  const storePath = path.join(absAppDir, "src/data/catalogStore.ts");
  for (const file of [explorerPath, marketplacePath, storePath]) {
    if (!fs.existsSync(file)) failures.push(`App: falta archivo esperado ${file}`);
  }
  const explorer = fs.existsSync(explorerPath) ? fs.readFileSync(explorerPath, "utf8") : "";
  const marketplace = fs.existsSync(marketplacePath) ? fs.readFileSync(marketplacePath, "utf8") : "";
  const store = fs.existsSync(storePath) ? fs.readFileSync(storePath, "utf8") : "";

  const requiredSections = ["bundles", "plugins", "connectors", "skills", "cliTools"];
  for (const section of requiredSections) {
    if (!explorer.includes(section)) failures.push(`App Explorar: no encuentro sección ${section}.`);
  }
  for (const shape of ["connectors", "plugins", "skills", "cliTools", "bundles"]) {
    if (!marketplace.includes(`${shape}:`) && !marketplace.includes(`${shape}?`)) failures.push(`App marketplaceCatalog: no normaliza ${shape}.`);
  }
  for (const prefix of ["cn-", "sk-", "cli-", "kit-"]) {
    if (!store.includes(prefix)) failures.push(`App catalogStore: no hidrata prefijo ${prefix}.`);
  }
  if (!marketplace.includes("VITE_MARKETPLACE_URL")) {
    failures.push("App marketplaceCatalog: falta override VITE_MARKETPLACE_URL para smokear previews del landing.");
  }
  report.push("- Explorar debe renderizar bundles, plugins, connectors, skills y cliTools.");
  report.push("- marketplaceCatalog debe soportar VITE_MARKETPLACE_URL para apuntar la app al preview del landing durante smoke.");
  report.push("- catalogStore debe hidratar prefijos cn-/sk-/cli-/kit- para arrastrar/instalar.");
}

function checkEvidenceGate() {
  report.push("");
  report.push("## Evidencia física exigida en PRs de catálogo");
  if (eventName !== "pull_request" || !marketplaceChanged) {
    report.push("- No es PR de catálogo público; evidencia manual no requerida en esta corrida.");
    return;
  }
  if (!/##\s*Physical smoke evidence|##\s*Evidencia física/i.test(prBody)) {
    failures.push("Falta sección `## Physical smoke evidence` / `## Evidencia física` en el PR.");
    return;
  }
  if (contentChanged && !/landing\s*(visible|físic[ao]|fisic[ao])\s*:\s*(yes|sí|si|ok|true)/i.test(prBody)) {
    failures.push("El PR no confirma `Landing visible: yes/sí`.");
  }
  if (contentChanged && !/app\s*(visible|físic[ao]|fisic[ao])\s*:\s*(yes|sí|si|ok|true)/i.test(prBody)) {
    failures.push("El PR no confirma `App visible: yes/sí`.");
  }

  const landingCounts = parseEvidenceCounts(prBody, "landing");
  const appCounts = parseEvidenceCounts(prBody, "app");
  if (!landingCounts) failures.push("Falta línea de conteos `Landing counts: connectors=N plugins=N kits=N skills=N cliTools=N total=N`.");
  if (!appCounts) failures.push("Falta línea de conteos `App counts: connectors=N plugins=N kits=N skills=N cliTools=N total=N`.");
  if (!landingCounts || !appCounts) return;

  for (const key of ["connectors", "plugins", "kits", "skills", "cliTools", "total"]) {
    if (landingCounts[key] !== appCounts[key]) failures.push(`Conteo landing/app no coincide para ${key}: landing=${landingCounts[key]} app=${appCounts[key]}.`);
  }
  for (const key of ["connectors", "plugins", "kits", "skills", "cliTools", "total"]) {
    if (landingCounts[key] !== counts[key]) {
      failures.push(`Conteo físico declarado de landing no coincide con catálogo ${key}: declarado=${landingCounts[key]} esperado=${counts[key]}.`);
    }
  }
  if (landingCounts && appCounts) {
    report.push(`- Landing físico declarado: ${formatCounts(landingCounts)}`);
    report.push(`- App físico declarado: ${formatCounts(appCounts)}`);
  }
}

function parseEvidenceCounts(body, side) {
  const line = body.split(/\r?\n/).find((raw) => {
    const pattern = `^\\s*(?:[-*]\\s*)?${side}\\s*(counts|conteos)\\s*:`;
    return new RegExp(pattern, "i").test(raw);
  });
  if (!line) return null;
  const out = {};
  const alias = {
    connectors: ["connectors", "conectores"],
    plugins: ["plugins"],
    kits: ["kits", "bundles"],
    skills: ["skills"],
    cliTools: ["cliTools", "cli_tools", "cli", "herramientas"],
    total: ["total"],
  };
  for (const [key, names] of Object.entries(alias)) {
    const found = names.map((name) => line.match(new RegExp(`${name}\\s*[=:]\\s*(\\d+)`, "i"))).find(Boolean);
    if (!found) return null;
    out[key] = Number(found[1]);
  }
  return out;
}

function formatCounts(value) {
  return `connectors=${value.connectors} plugins=${value.plugins} kits=${value.kits} skills=${value.skills} cliTools=${value.cliTools} total=${value.total}`;
}
