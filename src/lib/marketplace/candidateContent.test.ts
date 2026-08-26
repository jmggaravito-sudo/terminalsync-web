import { describe, expect, it } from "vitest";
import matter from "gray-matter";
import {
  buildSkillFile,
  buildConnectorFile,
  isValidSlug,
  type SkillCandidateInput,
  type ConnectorCandidateInput,
} from "./candidateContent";
import { manifestRequiresEnvSecrets } from "./secrets";

const baseSkill: SkillCandidateInput = {
  type: "skill",
  slug: "test-candidate-skill",
  name: "Test Candidate Skill",
  category: "productivity",
  tagline: "A short tagline",
  description: "A longer description of what it does.",
  whenToUse: "When you need to test this.",
  whatItDoes: "It does the thing.",
  howToUse: "1. Do the thing.",
};

const baseConnector: ConnectorCandidateInput = {
  type: "connector",
  slug: "test-candidate-connector",
  name: "Test Candidate Connector",
  category: "productivity",
  tagline: "A short tagline",
  simpleSubtitle: "Simple subtitle for the business",
  simpleBody: "This is the business-facing body.",
  ctaUrl: "https://example.com",
  affiliate: false,
  npmPackage: "example-mcp-server",
  envKeys: ["EXAMPLE_API_KEY"],
};

describe("isValidSlug", () => {
  it("accepts kebab-case slugs", () => {
    expect(isValidSlug("my-connector")).toBe(true);
    expect(isValidSlug("a1")).toBe(true);
  });
  it("rejects invalid slugs", () => {
    expect(isValidSlug("My Connector")).toBe(false);
    expect(isValidSlug("under_score")).toBe(false);
    expect(isValidSlug("-leading")).toBe(false);
    expect(isValidSlug("a")).toBe(false);
    expect(isValidSlug("")).toBe(false);
  });
});

describe("buildSkillFile", () => {
  it("produces frontmatter that parses to the shape src/lib/skills.ts expects", () => {
    const file = buildSkillFile(baseSkill, "es");
    expect(file.path).toBe("content/skills/es/test-candidate-skill.md");

    const { data, content } = matter(file.content);
    expect(data.name).toBe(baseSkill.name);
    expect(data.category).toBe("productivity");
    expect(data.vendors).toEqual(["claude", "codex", "gemini"]);
    expect(data.compatibleWith).toEqual(["claude", "codex", "gemini"]);
    expect(data.author).toBe("TerminalSync");
    expect(data.status).toBe("available");
    expect(data.license).toBe("proprietary");
    expect(data.marketplaceSource).toBe("terminalsync");
    // Safety default — see module doc comment: must stay out of the public
    // catalog (and the skills.test.ts allow-list) until a human reviews it.
    expect(data.catalogReady).toBe(false);

    expect(content).toContain("## Cuándo usarlo");
    expect(content).toContain("## Qué hace");
    expect(content).toContain("## Cómo usarlo");
    expect(content).toContain(baseSkill.whenToUse);
  });

  it("respects an explicit status/author/license override", () => {
    const file = buildSkillFile(
      { ...baseSkill, status: "soon", author: "Jane Doe", license: "MIT" },
      "es",
    );
    const { data } = matter(file.content);
    expect(data.status).toBe("soon");
    expect(data.author).toBe("Jane Doe");
    expect(data.license).toBe("MIT");
  });
});

describe("buildConnectorFile", () => {
  it("produces an installable manifest that parses to the shape src/lib/connectors.ts expects", () => {
    const file = buildConnectorFile(baseConnector, "es");
    expect(file.path).toBe("content/connectors/es/test-candidate-connector.md");

    const { data, content } = matter(file.content);
    expect(data.name).toBe(baseConnector.name);
    expect(data.category).toBe("productivity");
    expect(data.affiliate).toBe(false);
    // Safety default — hides the candidate from /connectors until reviewed.
    expect(data.hidden).toBe(true);
    expect(data.manifest?.mcpServers?.["test-candidate-connector"]).toMatchObject({
      command: "npx",
      args: ["-y", "example-mcp-server"],
      env: { EXAMPLE_API_KEY: "${SECRET:EXAMPLE_API_KEY}" },
    });
    expect(manifestRequiresEnvSecrets(data.manifest)).toBe(true);
    expect(content).toContain(baseConnector.simpleBody);
  });

  it("omits the manifest entirely for affiliate-only candidates", () => {
    const file = buildConnectorFile(
      { ...baseConnector, affiliate: true, npmPackage: undefined, envKeys: undefined },
      "es",
    );
    const { data } = matter(file.content);
    expect(data.affiliate).toBe(true);
    expect(data.manifest).toBeUndefined();
    expect(data.license).toBe("proprietary");
  });

  it("omits the env block for an OAuth-style manifest (no secrets)", () => {
    const file = buildConnectorFile({ ...baseConnector, envKeys: [] }, "es");
    const { data } = matter(file.content);
    expect(data.manifest.mcpServers["test-candidate-connector"].env).toBeUndefined();
    expect(manifestRequiresEnvSecrets(data.manifest)).toBe(false);
  });

  it("splits simple/dev body with the --- dev --- separator the loader expects", () => {
    const file = buildConnectorFile(
      { ...baseConnector, devBody: "Technical notes here." },
      "es",
    );
    expect(file.content).toContain("\n--- dev ---\n");
  });
});
