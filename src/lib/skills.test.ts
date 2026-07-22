import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { getSkill, listSkillSlugs, listSkills } from "./skills";

// Molded skills that are live in the public catalog.
const MOLDED_PUBLIC_SKILLS = [
  { slug: "code-reviewer", source: "terminalsync" },
  { slug: "meta-ads-creator", source: "terminalsync" },
  { slug: "seo-auditor", source: "terminalsync" },
  { slug: "mcp-builder", source: "anthropic" },
  { slug: "doc-coauthoring", source: "anthropic" },
  { slug: "internal-comms", source: "anthropic" },
  { slug: "skill-creator", source: "anthropic" },
] as const;

// Molded content that is hidden from the catalog (dependency-bound) but must
// stay intact on disk for when the external tooling is guaranteed.
const MOLDED_HIDDEN_SKILLS = ["deep-research", "slack-summarizer"] as const;

const readRawSkill = (lang: string, slug: string): string =>
  fs.readFileSync(
    path.join(process.cwd(), "content", "skills", lang, `${slug}.md`),
    "utf8",
  );

describe("skills content mold", () => {
  it("molded skills expose RULES.md-required frontmatter", async () => {
    const skills = await listSkills("es");

    for (const { slug, source } of MOLDED_PUBLIC_SKILLS) {
      const skill = skills.find((item) => item.slug === slug);
      expect(skill, `${slug} should be listed`).toBeDefined();
      expect(skill).toMatchObject({
        marketplaceSource: source,
        // Only providers with a real delivery path + eval. Gemini has no
        // skills delivery yet, so it is NOT claimed (see RULES.md →
        // "Cross-provider coverage").
        compatibleWith: ["claude", "codex"],
      });
    }
  });

  it("keeps only the launch-ready skills in the public catalog", async () => {
    // 13 molded skills (7 general + 6 CRM/retention, published live with no
    // catalogReady:false) + the 4 native document skills (included: true)
    // which ship with Claude Code and are surfaced as "Included", not
    // installable.
    const publicSlugs = [
      "code-reviewer",
      "doc-coauthoring",
      "internal-comms",
      "mcp-builder",
      "meta-ads-creator",
      "seo-auditor",
      "skill-creator",
      // CRM / retention skills — live in the public catalog (referenced by the
      // role kits; see the CRM skills publish).
      "carrito-abandonado",
      "ltv-cohortes",
      "pedir-resenas",
      "promos-cupones",
      "rfm-segmentacion",
      "winback-dormidos",
      "docx",
      "pdf",
      "pptx",
      "xlsx",
    ] as const;
    const sorted = [...publicSlugs].sort();

    for (const lang of ["en", "es"] as const) {
      const skills = await listSkills(lang);
      // Set-based comparison — robust to display-name sort order.
      expect(skills.map((skill) => skill.slug).sort()).toEqual(sorted);
    }

    await expect(listSkillSlugs().then((s) => s.sort())).resolves.toEqual(sorted);
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
    ] as const;

    for (const lang of ["en", "es"] as const) {
      const skills = await listSkills(lang);

      for (const slug of hiddenSlugs) {
        expect(
          skills.find((skill) => skill.slug === slug),
          `${lang}/${slug} should be hidden from the public catalog`,
        ).toBeUndefined();

        await expect(getSkill(lang, slug)).resolves.toBeNull();

        expect(
          readRawSkill(lang, slug).length,
          `${lang}/${slug} content file must stay on disk (reversible)`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it("parks brand skills as catalogReady:false — pending evaluation, distinct from hidden", async () => {
    const pendingSlugs = ["brand-guidelines", "brand-voice"] as const;

    for (const lang of ["en", "es"] as const) {
      const skills = await listSkills(lang);

      for (const slug of pendingSlugs) {
        expect(
          skills.find((skill) => skill.slug === slug),
          `${lang}/${slug} should not be publicly listed while pending evaluation`,
        ).toBeUndefined();

        await expect(getSkill(lang, slug)).resolves.toBeNull();

        const raw = readRawSkill(lang, slug);
        expect(
          raw,
          `${lang}/${slug} should carry the catalogReady:false marker`,
        ).toContain("catalogReady: false");
        expect(
          raw,
          `${lang}/${slug} is pending evaluation, NOT retired — no hidden flag`,
        ).not.toContain("hidden: true");
      }
    }
  });

  it("molded Spanish skill pages use localized RULES.md headings", async () => {
    for (const { slug } of MOLDED_PUBLIC_SKILLS) {
      const doc = await getSkill("es", slug);
      expect(doc?.bodyHtml, `${slug} should render`).toContain("Cuándo usarlo");
      expect(doc?.bodyHtml, `${slug} should render`).toContain("Cómo usarlo");
      expect(doc?.bodyHtml, `${slug} should render`).toContain("Ideal para");
    }

    // Hidden molded content keeps the localized mold on disk even though the
    // public detail page is suppressed.
    for (const slug of MOLDED_HIDDEN_SKILLS) {
      const raw = readRawSkill("es", slug);
      expect(raw, `${slug} raw content keeps the mold`).toContain("Cuándo usarlo");
      expect(raw, `${slug} raw content keeps the mold`).toContain("Qué hace");
    }
  });

  it("keeps dependency-bound skills out of the catalog until their external tools are guaranteed", async () => {
    const skills = await listSkills("es");

    // Dependency-bound skills are fully hidden (see the retired-skills test);
    // they must not resurface as "soon" placeholders.
    for (const slug of MOLDED_HIDDEN_SKILLS) {
      expect(skills.find((item) => item.slug === slug)).toBeUndefined();
    }

    for (const { slug } of MOLDED_PUBLIC_SKILLS) {
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
    // skill-creator is self-contained (the mold is inlined, not referenced by
    // a repo path the installed user won't have). Its declared boundary is
    // that it does not self-approve: human review decides publication.
    expect(skillCreator?.bodyHtml).toContain("revisión humana");
    expect(skillCreator?.bodyHtml).toContain("baseline");

    // Hidden dependency-bound skills: limits live in the raw content since
    // their public detail pages are suppressed.
    const deepResearch = readRawSkill("es", "deep-research");
    expect(deepResearch).toContain("search/fetch");
    expect(deepResearch).toContain("citas falsas");

    const slackSummarizer = readRawSkill("es", "slack-summarizer");
    expect(slackSummarizer).toContain("conector Slack");
    expect(slackSummarizer).toContain("inventar un resumen");
  });
});
