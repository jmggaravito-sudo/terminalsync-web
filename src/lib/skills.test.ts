import { describe, expect, it } from "vitest";
import { getSkill, listSkillSlugs, listSkills } from "./skills";

const REQUIRED_SKILL_META = {
  marketplaceSource: "terminalsync",
  compatibleWith: ["claude", "codex", "gemini"],
};

const MOLDED_TERMINALSYNC_SKILLS = [
  "code-reviewer",
  "meta-ads-creator",
  "seo-auditor",
] as const;

describe("skills content mold", () => {
  it("TerminalSync-molded skills expose RULES.md-required frontmatter", async () => {
    const skills = await listSkills("es");

    for (const slug of MOLDED_TERMINALSYNC_SKILLS) {
      const skill = skills.find((item) => item.slug === slug);
      expect(skill, `${slug} should be listed`).toBeDefined();
      expect(skill).toMatchObject(REQUIRED_SKILL_META);
    }
  });

  it("Anthropic MCP Builder exposes RULES.md-required frontmatter", async () => {
    const skills = await listSkills("es");
    const mcpBuilder = skills.find((skill) => skill.slug === "mcp-builder");

    expect(mcpBuilder).toMatchObject({
      name: "MCP Builder",
      marketplaceSource: "anthropic",
      compatibleWith: ["claude", "codex", "gemini"],
    });
  });

  it("keeps only the seven launch-ready skills in the public catalog", async () => {
    const publicSlugs = [
      "brand-guidelines",
      "code-reviewer",
      "doc-coauthoring",
      "mcp-builder",
      "meta-ads-creator",
      "seo-auditor",
      "skill-creator",
    ] as const;

    for (const lang of ["en", "es"] as const) {
      const skills = await listSkills(lang);
      expect(skills.map((skill) => skill.slug)).toEqual([...publicSlugs]);
    }

    await expect(listSkillSlugs()).resolves.toEqual([...publicSlugs]);
  });

  it("hides retired skills from public catalog and detail pages without deleting content", async () => {
    const hiddenSlugs = [
      // Product decision: borderline/generic assistants stay reversible.
      "email-drafter",
      "copywriter",
      "learn",
      // Product decision: external dependencies are not guaranteed yet.
      "deep-research",
      "slack-summarizer",
      // Current launch catalog is intentionally capped to the seven ready skills.
      "brand-voice",
      "internal-comms",
    ] as const;

    for (const lang of ["en", "es"] as const) {
      const skills = await listSkills(lang);

      for (const slug of hiddenSlugs) {
        expect(
          skills.find((skill) => skill.slug === slug),
          `${lang}/${slug} should be hidden from the public catalog`,
        ).toBeUndefined();

        await expect(getSkill(lang, slug)).resolves.toBeNull();
      }
    }
  });

  it("molded Spanish skill pages use localized RULES.md headings", async () => {
    for (const slug of [
      ...MOLDED_TERMINALSYNC_SKILLS,
      "mcp-builder",
    ] as const) {
      const doc = await getSkill("es", slug);
      expect(doc?.bodyHtml, `${slug} should render`).toContain("Cuándo usarlo");
      expect(doc?.bodyHtml, `${slug} should render`).toContain("Cómo usarlo");
      expect(doc?.bodyHtml, `${slug} should render`).toContain("Ideal para");
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
});
