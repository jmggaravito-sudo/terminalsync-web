import { describe, expect, it } from "vitest";
import { getSkill, listSkills } from "./skills";

const MOLDED_SKILLS = [
  { slug: "code-reviewer", source: "terminalsync" },
  { slug: "meta-ads-creator", source: "terminalsync" },
  { slug: "seo-auditor", source: "terminalsync" },
  { slug: "mcp-builder", source: "anthropic" },
  { slug: "doc-coauthoring", source: "anthropic" },
  { slug: "internal-comms", source: "anthropic" },
  { slug: "skill-creator", source: "anthropic" },
  { slug: "deep-research", source: "terminalsync" },
  { slug: "slack-summarizer", source: "terminalsync" },
] as const;

describe("skills content mold", () => {
  it("molded skills expose RULES.md-required frontmatter", async () => {
    const skills = await listSkills("es");

    for (const { slug, source } of MOLDED_SKILLS) {
      const skill = skills.find((item) => item.slug === slug);
      expect(skill, `${slug} should be listed`).toBeDefined();
      expect(skill).toMatchObject({
        marketplaceSource: source,
        compatibleWith: ["claude", "codex", "gemini"],
      });
    }
  });

  it("molded Spanish skill pages use localized RULES.md headings", async () => {
    for (const { slug } of MOLDED_SKILLS) {
      const doc = await getSkill("es", slug);
      expect(doc?.bodyHtml, `${slug} should render`).toContain("Cuándo usarlo");
      expect(doc?.bodyHtml, `${slug} should render`).toContain("Cómo usarlo");
      expect(doc?.bodyHtml, `${slug} should render`).toContain("Ideal para");
    }
  });

  it("keeps dependency-bound skills unpublished until their external tools are guaranteed", async () => {
    const skills = await listSkills("es");

    expect(skills.find((item) => item.slug === "deep-research")?.status).toBe(
      "soon",
    );
    expect(skills.find((item) => item.slug === "slack-summarizer")?.status).toBe(
      "soon",
    );

    for (const slug of [
      "code-reviewer",
      "meta-ads-creator",
      "seo-auditor",
      "mcp-builder",
      "doc-coauthoring",
      "internal-comms",
      "skill-creator",
    ] as const) {
      expect(skills.find((item) => item.slug === slug)?.status).toBe(
        "available",
      );
    }
  });

  it("borderline claims are caveated in the molded assistant content", async () => {
    const metaAds = await getSkill("es", "meta-ads-creator");
    expect(metaAds?.bodyHtml).toContain("prometer resultados");
    expect(metaAds?.bodyHtml).toContain("ROAS");

    const seoAuditor = await getSkill("es", "seo-auditor");
    expect(seoAuditor?.bodyHtml).toContain("URL");
    expect(seoAuditor?.bodyHtml).toContain("garantías de ranking");

    const mcpBuilder = await getSkill("es", "mcp-builder");
    expect(mcpBuilder?.bodyHtml).toContain("production-ready");
    expect(mcpBuilder?.bodyHtml).toContain("tests pasando");
  });

  it("sensitive or dependency-bound skills declare their limits", async () => {
    const docCoauthoring = await getSkill("es", "doc-coauthoring");
    expect(docCoauthoring?.bodyHtml).toContain("contratos legalmente vinculantes");
    expect(docCoauthoring?.bodyHtml).toContain("abogado");

    const internalComms = await getSkill("es", "internal-comms");
    expect(internalComms?.bodyHtml).toContain("layoffs");
    expect(internalComms?.bodyHtml).toContain("HR/legal/compliance");

    const skillCreator = await getSkill("es", "skill-creator");
    expect(skillCreator?.bodyHtml).toContain("RULES.md");
    expect(skillCreator?.bodyHtml).toContain("baseline");

    const deepResearch = await getSkill("es", "deep-research");
    expect(deepResearch?.bodyHtml).toContain("search/fetch");
    expect(deepResearch?.bodyHtml).toContain("citas falsas");

    const slackSummarizer = await getSkill("es", "slack-summarizer");
    expect(slackSummarizer?.bodyHtml).toContain("conector Slack");
    expect(slackSummarizer?.bodyHtml).toContain("inventar un resumen");
  });
});
</content>
