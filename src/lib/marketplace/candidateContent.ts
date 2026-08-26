/**
 * Panel B ("Agregar candidato") of /admin/integraciones — builds the
 * markdown file (frontmatter + body) for a new Skill or Connector
 * candidate, in the exact shape the real content loaders expect.
 *
 * Field shapes verified against real files before writing this, not from
 * memory:
 *   - Skill:     content/skills/es/1099-w9-organizer.md (+ src/lib/skills.ts)
 *   - Connector: content/connectors/es/airtable.md (installable, has
 *                manifest) and content/connectors/es/ahrefs.md (affiliate:
 *                false but no local package — still ships a manifest; there
 *                is no real `affiliate:true` example in the repo today, so
 *                that branch is built to the loader's documented contract
 *                in src/lib/connectors.ts, not copied from a sample).
 *
 * Deliberate deviation from a literal "catalogReady: true" default: this
 * repo has a hard-coded allow-list test
 * (`src/lib/skills.test.ts` → "keeps only the launch-ready skills in the
 * public catalog") that enumerates every public skill slug. Any new skill
 * file that is NOT `catalogReady: false` immediately joins `listSkills()`
 * and breaks that test in CI — and, worse, ships straight to the live
 * catalog the moment this PR merges, without anyone having reviewed it.
 * `catalogReady: false` is the codebase's own documented mechanism for
 * exactly this state ("pending evaluation... not retired, just not cleared
 * for launch yet" — see SkillMeta.catalogReady in src/lib/skills.ts). A
 * human flips it to `true` (and adds the slug to that allow-list) as part
 * of actually approving the candidate. Connectors have no `catalogReady`
 * field, so the equivalent here is `hidden: true` (fully suppressed from
 * `listConnectors`/`getConnector` until a reviewer clears it).
 */

export type CandidateType = "skill" | "connector";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug) && slug.length >= 2 && slug.length <= 60;
}

export const SKILL_CATEGORIES = [
  "marketing",
  "dev",
  "productivity",
  "research",
  "design",
  "finance",
] as const;
export type SkillCategoryInput = (typeof SKILL_CATEGORIES)[number];

export const CONNECTOR_CATEGORIES = [
  "productivity",
  "database",
  "automation",
  "storage",
  "messaging",
  "support",
  "dev",
] as const;
export type ConnectorCategoryInput = (typeof CONNECTOR_CATEGORIES)[number];

export interface SkillCandidateInput {
  type: "skill";
  slug: string;
  name: string;
  category: SkillCategoryInput;
  tagline: string;
  description: string;
  whenToUse: string;
  whatItDoes: string;
  howToUse: string;
  author?: string;
  status?: "available" | "soon";
  license?: string;
}

export interface ConnectorCandidateInput {
  type: "connector";
  slug: string;
  name: string;
  category: ConnectorCategoryInput;
  tagline: string;
  simpleSubtitle: string;
  simpleBody: string;
  devBody?: string;
  ctaUrl: string;
  affiliate: boolean;
  status?: "available" | "soon";
  /** npm package to run via `npx -y <pkg>`. Required when affiliate=false
   *  and no advanced args override is given. Ignored when affiliate=true. */
  npmPackage?: string;
  /** Names of `${SECRET:NAME}` env vars the manifest should declare. Empty
   *  → OAuth-style manifest with no `env` block (molde B in
   *  content/connectors/SOURCES.md). Ignored when affiliate=true. */
  envKeys?: string[];
  tokenHelpUrl?: string;
  originalAuthor?: string;
  license?: string;
}

export type CandidateInput = SkillCandidateInput | ConnectorCandidateInput;

function yamlString(value: string): string {
  // Always double-quote + escape: simplest way to stay valid YAML for any
  // curator-typed text (colons, quotes, accents all survive).
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function yamlStringArray(values: readonly string[]): string {
  return `[${values.map((v) => yamlString(v)).join(", ")}]`;
}

export interface BuiltCandidateFile {
  /** Path relative to the repo root, e.g. content/skills/es/foo.md */
  path: string;
  /** Full file contents (frontmatter + body). */
  content: string;
}

export function buildSkillFile(input: SkillCandidateInput, lang = "es"): BuiltCandidateFile {
  const author = input.author?.trim() || "TerminalSync";
  const status = input.status ?? "available";
  const license = input.license?.trim() || "proprietary";
  // Paridad gate (decisión JM 2026-08-07): toda skill nueva declara las 3
  // IAs base. GLM hereda de Claude vía el proxy CLI, no se lista aparte
  // (ver src/lib/connectors.ts CONNECTOR_DELIVERY_TARGETS para el mismo
  // razonamiento del lado connectors).
  const vendors = ["claude", "codex", "gemini"] as const;

  const frontmatter = [
    "---",
    `name: ${yamlString(input.name)}`,
    `logo: /skills/${input.slug}.svg`,
    `category: ${input.category}`,
    `vendors: ${yamlStringArray(vendors)}`,
    `author: ${yamlString(author)}`,
    `status: ${status}`,
    // Safety default — see module doc comment. Reviewer flips this (and
    // adds the slug to the skills.test.ts allow-list) once cleared.
    `catalogReady: false`,
    `tagline: ${yamlString(input.tagline)}`,
    `description: ${yamlString(input.description)}`,
    `license: ${yamlString(license)}`,
    `marketplaceSource: "terminalsync"`,
    `compatibleWith: ${yamlStringArray(vendors)}`,
    "---",
  ].join("\n");

  const body = [
    "## Cuándo usarlo",
    "",
    input.whenToUse.trim(),
    "",
    "## Qué hace",
    "",
    input.whatItDoes.trim(),
    "",
    "## Cómo usarlo",
    "",
    input.howToUse.trim(),
    "",
  ].join("\n");

  return {
    path: `content/skills/${lang}/${input.slug}.md`,
    content: `${frontmatter}\n\n${body}`,
  };
}

export function buildConnectorFile(
  input: ConnectorCandidateInput,
  lang = "es",
): BuiltCandidateFile {
  const status = input.status ?? "soon";
  const license = input.license?.trim() || (input.affiliate ? "proprietary" : "MIT");
  const devTitle = `${input.name} — conector MCP`;

  const lines = [
    "---",
    `name: ${yamlString(input.name)}`,
    `logo: /connectors/${input.slug}.svg`,
    `category: ${input.category}`,
    // Safety default — see module doc comment. Reviewer clears this
    // (removes the line, or sets it to false) once vetted.
    `hidden: true`,
    `status: ${status}`,
    `simpleTitle: ${yamlString(input.name)}`,
    `simpleSubtitle: ${yamlString(input.simpleSubtitle)}`,
    `devTitle: ${yamlString(devTitle)}`,
    `devSubtitle: ${yamlString(input.simpleSubtitle)}`,
    `ctaUrl: ${yamlString(input.ctaUrl)}`,
  ];

  if (input.tokenHelpUrl?.trim()) {
    lines.push(`tokenHelpUrl: ${yamlString(input.tokenHelpUrl.trim())}`);
  }

  if (!input.affiliate) {
    const envKeys = (input.envKeys ?? []).map((k) => k.trim()).filter(Boolean);
    const pkg = input.npmPackage?.trim();
    lines.push("manifest:");
    lines.push("  mcpServers:");
    lines.push(`    ${input.slug}:`);
    lines.push(`      command: npx`);
    lines.push(`      args: ${yamlStringArray(["-y", pkg || `${input.slug}-mcp-server`])}`);
    if (envKeys.length > 0) {
      lines.push("      env:");
      for (const key of envKeys) {
        lines.push(`        ${key}: ${yamlString("${SECRET:" + key + "}")}`);
      }
    }
  }

  lines.push(`affiliate: ${input.affiliate ? "true" : "false"}`);
  lines.push(`tagline: ${yamlString(input.tagline)}`);
  if (input.originalAuthor?.trim()) {
    lines.push(`originalAuthor: ${yamlString(input.originalAuthor.trim())}`);
  }
  lines.push(`license: ${yamlString(license)}`);
  lines.push("---");

  const bodyParts = [input.simpleBody.trim()];
  if (input.devBody?.trim()) {
    bodyParts.push("\n--- dev ---\n");
    bodyParts.push(input.devBody.trim());
  }

  return {
    path: `content/connectors/${lang}/${input.slug}.md`,
    content: `${lines.join("\n")}\n\n${bodyParts.join("\n")}\n`,
  };
}

export function buildCandidateFile(input: CandidateInput, lang = "es"): BuiltCandidateFile {
  return input.type === "skill" ? buildSkillFile(input, lang) : buildConnectorFile(input, lang);
}
