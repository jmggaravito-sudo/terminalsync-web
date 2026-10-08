// Pure logic of the Integration Pipeline (name -> research -> build -> review ->
// decide -> merge -> report). Kept free of I/O so it is unit-tested; the
// workflow only calls it through scripts/pipeline/cli.mjs.

export const SLUG_RE = /^[a-z0-9-]{1,40}$/;
export const VERDICTS = ["ship_official", "needs_own_build", "exists", "skip"];
export const REVIEW_ROLES = ["sources", "voice", "install", "honesty"];
export const REVIEW_VERDICTS = ["pass", "fix", "hold"];
export const CONVERSATIONAL = ["yes", "no_remote", "unknown"];

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const isStr = (v) => typeof v === "string" && v.trim().length > 0;

export function slugify(name) {
  return String(name ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
}

export function validateResearch(r) {
  const errors = [];
  if (!isObj(r)) return { ok: false, errors: ["research.json is not an object"] };
  if (!isStr(r.name)) errors.push("name is required");
  if (!isStr(r.slug) || !SLUG_RE.test(r.slug)) errors.push("slug must match ^[a-z0-9-]{1,40}$");
  if (!VERDICTS.includes(r.verdict)) errors.push(`verdict must be one of ${VERDICTS.join(", ")}`);
  if (!isStr(r.reason)) errors.push("reason is required");
  if (!CONVERSATIONAL.includes(r.conversational_install)) {
    errors.push(`conversational_install must be one of ${CONVERSATIONAL.join(", ")}`);
  }
  if (r.verdict === "ship_official") {
    const o = r.official;
    if (!isObj(o) || o.exists !== true) errors.push("ship_official needs official.exists === true");
    else {
      if (!["remote", "npm"].includes(o.kind)) errors.push("official.kind must be remote or npm");
      if (!isStr(o.endpoint_or_package)) errors.push("official.endpoint_or_package is required");
      if (!isStr(o.publisher)) errors.push("official.publisher is required");
      if (!Array.isArray(o.sources) || o.sources.length === 0 || !o.sources.every(isStr)) {
        errors.push("official.sources must list the official pages that were read");
      }
    }
    if (r.persona_fit !== true) errors.push("ship_official requires persona_fit === true");
    if (r.already_in_catalog === true) errors.push("ship_official contradicts already_in_catalog");
  }
  if (r.verdict === "needs_own_build" && !isStr(r.own_build_notes)) {
    errors.push("needs_own_build requires own_build_notes (verified API facts)");
  }
  return { ok: errors.length === 0, errors };
}

// The PR must contain only this connector's files. A loop PR once also swapped
// seven unrelated logos for unverified GitHub avatars; this makes that a hold.
export function checkScope(slug, files) {
  const exact = new Set([
    `content/connectors/en/${slug}.md`,
    `content/connectors/es/${slug}.md`,
    "content/connectors/SOURCES.md",
  ]);
  const logoPrefix = `public/connectors/${slug}.`;
  const list = [...new Set(files.map((f) => f.trim()).filter(Boolean))];
  const violations = list.filter((f) => !exact.has(f) && !f.startsWith(logoPrefix));
  const missing = [];
  if (!list.includes(`content/connectors/en/${slug}.md`)) missing.push(`content/connectors/en/${slug}.md`);
  if (!list.includes(`content/connectors/es/${slug}.md`)) missing.push(`content/connectors/es/${slug}.md`);
  return { ok: violations.length === 0 && missing.length === 0, violations, missing };
}

export function normalizeReview(raw, role) {
  if (!isObj(raw)) return { role, verdict: "hold", findings: [{ issue: "review file missing or not an object" }] };
  const verdict = REVIEW_VERDICTS.includes(raw.verdict) ? raw.verdict : "hold";
  const findings = Array.isArray(raw.findings) ? raw.findings.filter(isObj) : [];
  if (verdict !== "pass" && findings.length === 0) {
    findings.push({ issue: `${role}: verdict ${verdict} without findings` });
  }
  return { role: raw.role ?? role, verdict, findings };
}

export function summarizeReviews(byRole) {
  const reviews = REVIEW_ROLES.map((role) => normalizeReview(byRole[role], role));
  const findings = reviews.flatMap((r) =>
    r.verdict === "pass" ? [] : r.findings.map((f) => ({ role: r.role, ...f })),
  );
  return {
    reviews,
    anyHold: reviews.some((r) => r.verdict === "hold"),
    anyFix: reviews.some((r) => r.verdict === "fix"),
    allPass: reviews.every((r) => r.verdict === "pass"),
    findings,
  };
}

// action: stop | hold | fix | ready | merge
//  - stop:  research did not say ship_official (nothing was built)
//  - hold:  a human has to look (a reviewer held, scope broke, review missing)
//  - fix:   only fixable findings; one automatic fix round is allowed
//  - ready: everything passed but auto-merge is switched off
//  - merge: everything passed and auto-merge is on (CI is still checked later)
export function decide({ research, scope, reviewsByRole, automerge, dryRun }) {
  const reasons = [];
  if (!research || research.verdict !== "ship_official") {
    reasons.push(`research verdict: ${research?.verdict ?? "missing"}`);
    return { action: "stop", reasons, findings: [], reviews: [] };
  }
  const summary = summarizeReviews(reviewsByRole ?? {});
  if (scope && !scope.ok) {
    if (scope.violations?.length) reasons.push(`files outside this connector: ${scope.violations.join(", ")}`);
    if (scope.missing?.length) reasons.push(`missing files: ${scope.missing.join(", ")}`);
  }
  if (summary.anyHold) reasons.push("a reviewer put the PR on hold");
  if (scope && !scope.ok) return { action: "hold", reasons, findings: summary.findings, reviews: summary.reviews };
  if (summary.anyHold) return { action: "hold", reasons, findings: summary.findings, reviews: summary.reviews };
  if (summary.anyFix) {
    reasons.push("reviewers asked for fixes");
    return { action: "fix", reasons, findings: summary.findings, reviews: summary.reviews };
  }
  if (dryRun) {
    reasons.push("dry run: not merging");
    return { action: "ready", reasons, findings: [], reviews: summary.reviews };
  }
  if (automerge !== true) {
    reasons.push("auto-merge is off (INTEGRATION_AUTOMERGE != true)");
    return { action: "ready", reasons, findings: [], reviews: summary.reviews };
  }
  reasons.push("all reviewers passed and the PR only touches this connector");
  return { action: "merge", reasons, findings: [], reviews: summary.reviews };
}

export function surfaces({ research, merged }) {
  const when = merged ? "listo" : "al mergear";
  const conv =
    research?.conversational_install === "yes"
      ? `sí (${when})`
      : research?.conversational_install === "no_remote"
        ? "no: es un conector remoto con login; se instala desde Explorar, no por chat"
        : "sin confirmar";
  return {
    landing: merged ? "publicado" : "pendiente de merge",
    explorer: merged ? "publicado" : "pendiente de merge",
    conversation: conv,
  };
}

const ROLE_LABEL = { sources: "Fuentes oficiales", voice: "Voz y vocabulario", install: "Instalación", honesty: "Honestidad" };

export function buildReport({ research, build, decision, merged, mergeNote, checks, nameFallback }) {
  const name = research?.name ?? nameFallback ?? "(sin nombre)";
  const L = [];
  L.push(`# Integración: ${name}`);
  L.push("");
  if (!research) {
    L.push("No se pudo leer el resultado de la investigación. Revisa la corrida del workflow.");
    return L.join("\n");
  }
  L.push(`**Veredicto de la investigación:** \`${research.verdict}\` — ${research.reason}`);
  if (research.official?.exists) {
    L.push(`**MCP oficial:** ${research.official.kind} · \`${research.official.endpoint_or_package}\` · publicado por ${research.official.publisher}`);
  }
  L.push("");
  if (research.verdict !== "ship_official") {
    L.push("## Qué hacer ahora");
    if (research.verdict === "needs_own_build") {
      L.push("El proveedor no publica un MCP oficial. No se construyó nada. Hechos verificados de su API:");
      L.push("");
      L.push(research.own_build_notes ?? "(sin notas)");
      if (Array.isArray(research.third_party) && research.third_party.length) {
        L.push("", "Alternativas de terceros encontradas (no se publican: fallan la regla de publisher oficial):");
        for (const t of research.third_party) L.push(`- \`${t.package ?? t.name ?? "?"}\` — ${t.publisher ?? "?"}${t.note ? `: ${t.note}` : ""}`);
      }
      L.push("", "Decisión tuya: construir un MCP propio sobre esa API, o dejarlo en cola.");
    } else if (research.verdict === "exists") {
      L.push("Ya está en el catálogo; no se hizo nada.");
    } else {
      L.push("Se descartó. El motivo está arriba.");
    }
    return L.join("\n");
  }
  const s = surfaces({ research, merged: merged === true });
  L.push("## Dónde queda");
  L.push("");
  L.push("| Superficie | Estado |");
  L.push("|---|---|");
  L.push(`| Landing | ${s.landing} |`);
  L.push(`| Explorador de la app | ${s.explorer} |`);
  L.push(`| Conversación (GLM) | ${s.conversation} |`);
  L.push("");
  if (build?.pr) L.push(`**PR:** #${build.pr}${build.url ? ` — ${build.url}` : ""}`);
  L.push("");
  L.push("## Revisión por agentes");
  L.push("");
  L.push("| Revisor | Veredicto |");
  L.push("|---|---|");
  for (const r of decision?.reviews ?? []) L.push(`| ${ROLE_LABEL[r.role] ?? r.role} | ${r.verdict} |`);
  if (decision?.findings?.length) {
    L.push("", "### Hallazgos");
    for (const f of decision.findings) {
      L.push(`- **${ROLE_LABEL[f.role] ?? f.role}**${f.file ? ` (\`${f.file}\`)` : ""}: ${f.issue ?? ""}${f.fix ? ` → ${f.fix}` : ""}`);
    }
  }
  L.push("");
  L.push("## Resultado");
  L.push("");
  L.push(`**Decisión:** \`${decision?.action ?? "?"}\` — ${(decision?.reasons ?? []).join("; ")}`);
  if (checks) L.push(`**Checks de CI:** ${checks}`);
  if (mergeNote) L.push(`**Merge:** ${mergeNote}`);
  return L.join("\n");
}
