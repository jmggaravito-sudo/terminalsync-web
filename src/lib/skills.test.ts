import { describe, expect, it } from "vitest";
import { getSkill, listSkills } from "./skills";

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

  it("parks borderline generic assistants as soon without deleting their files", async () => {
    const parkedSlugs = ["email-drafter", "copywriter", "learn"] as const;

    for (const lang of ["en", "es"] as const) {
      const skills = await listSkills(lang);

      for (const slug of parkedSlugs) {
        const listed = skills.find((skill) => skill.slug === slug);
        expect(
          listed,
          `${lang}/${slug} should remain reversible in the catalog data`,
        ).toBeDefined();
        expect(
          listed?.status,
          `${lang}/${slug} should not be publicly available`,
        ).toBe("soon");

        const doc = await getSkill(lang, slug);
        expect(
          doc?.status,
          `${lang}/${slug} detail file should remain readable`,
        ).toBe("soon");
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
