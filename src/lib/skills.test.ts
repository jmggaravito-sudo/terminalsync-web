import { describe, expect, it } from "vitest";
import { getSkill, listSkills } from "./skills";

describe("skills content mold", () => {
  it("Code Reviewer has RULES.md-required frontmatter and Spanish headings", async () => {
    const skills = await listSkills("es");
    const codeReviewer = skills.find((skill) => skill.slug === "code-reviewer");

    expect(codeReviewer).toMatchObject({
      name: "Code Reviewer",
      marketplaceSource: "terminalsync",
      compatibleWith: ["claude", "codex", "gemini"],
    });

    const doc = await getSkill("es", "code-reviewer");
    expect(doc?.bodyHtml).toContain("Cuándo usarlo");
    expect(doc?.bodyHtml).toContain("Cómo usarlo");
    expect(doc?.bodyHtml).toContain("Ideal para");
  });
});
