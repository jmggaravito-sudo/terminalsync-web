import { describe, expect, it } from "vitest";
import {
  buildSuggestPrompt,
  extractJsonObject,
  isCandidateType,
  normalizeSuggestion,
  resolveSuggestRuntime,
  slugifyName,
  ANTHROPIC_DEFAULT_MODEL,
  ZAI_DEFAULT_BASE_URL,
  type ConnectorSuggestion,
  type CliToolSuggestion,
  type KitSuggestion,
  type SkillSuggestion,
} from "./candidateSuggest";
import { CONNECTOR_CATEGORIES } from "./candidateContent";

describe("isCandidateType", () => {
  it("acepta los cinco tipos del panel y nada más", () => {
    for (const t of ["skill", "connector", "plugin", "kit", "cli-tool"]) {
      expect(isCandidateType(t)).toBe(true);
    }
    expect(isCandidateType("mcp")).toBe(false);
    expect(isCandidateType(undefined)).toBe(false);
    expect(isCandidateType(1)).toBe(false);
  });
});

describe("slugifyName", () => {
  it("produce kebab-case sin acentos", () => {
    expect(slugifyName("Dapta")).toBe("dapta");
    expect(slugifyName("Mercado Pago")).toBe("mercado-pago");
    expect(slugifyName("Añadir Más")).toBe("anadir-mas");
    expect(slugifyName("  Weird   name!! ")).toBe("weird-name");
  });
});

describe("extractJsonObject", () => {
  it("saca el JSON aunque venga con texto y cerca de código alrededor", () => {
    const text =
      'Busqué el sitio oficial y esto es lo que encontré:\n\n```json\n{"name":"Dapta","slug":"dapta"}\n```\n\nEspero que sirva.';
    expect(extractJsonObject(text)).toEqual({ name: "Dapta", slug: "dapta" });
  });

  it("tira cuando no hay objeto", () => {
    expect(() => extractJsonObject("No encontré nada sobre esa herramienta."))
      .toThrow(/no contenía un objeto JSON/);
  });

  it("desenvuelve la ficha cuando el modelo la mete en un array", () => {
    expect(extractJsonObject('[{"name":"Dapta"}]')).toEqual({ name: "Dapta" });
  });

  it("tira cuando el JSON está roto", () => {
    expect(() => extractJsonObject('Encontré esto: {"name": "Dapta",}}'))
      .toThrow();
  });
});

describe("normalizeSuggestion — reglas que no dependen del tipo", () => {
  it("usa el nombre que escribió el dueño cuando el modelo no devuelve name/slug", () => {
    const s = normalizeSuggestion("connector", {}, "Mercado Pago");
    expect(s.name).toBe("Mercado Pago");
    expect(s.slug).toBe("mercado-pago");
  });

  it("descarta un slug inválido y lo deriva del nombre", () => {
    const s = normalizeSuggestion(
      "connector",
      { name: "Dapta", slug: "Dapta MCP!" },
      "Dapta",
    );
    expect(s.slug).toBe("dapta");
  });

  it("deja category vacía cuando el modelo inventa una que no existe", () => {
    const s = normalizeSuggestion(
      "connector",
      { category: "inteligencia-artificial" },
      "X",
    );
    expect(s.category).toBe("");
  });

  it("acepta cualquier categoría real del enum del tipo", () => {
    for (const c of CONNECTOR_CATEGORIES) {
      expect(normalizeSuggestion("connector", { category: c }, "X").category)
        .toBe(c);
    }
  });

  it("no rompe con un objeto vacío: devuelve la ficha con huecos", () => {
    const s = normalizeSuggestion("connector", {}, "Dapta") as ConnectorSuggestion;
    expect(s.type).toBe("connector");
    expect(s.tagline).toBe("");
    expect(s.simpleBody).toBe("");
    expect(s.ctaUrl).toBe("");
    expect(s.envKeys).toEqual([]);
  });
});

describe("normalizeSuggestion — connector", () => {
  const raw = {
    type: "connector",
    slug: "dapta",
    name: "Dapta",
    category: "automation",
    tagline: "Automatiza flujos sin escribir código",
    simpleSubtitle: "Dapta conecta tus apps.",
    simpleBody: "Cuerpo largo.",
    devBody: "Cuerpo dev.",
    ctaUrl: "https://dapta.ai",
    affiliate: true,
    npmPackage: "@dapta/mcp-server",
    envKeys: ["dapta_api_key", " token "],
    tokenHelpUrl: "https://dapta.ai/settings/tokens",
    originalAuthor: "Dapta",
    license: "MIT",
    status: "available",
  };

  it("mapea todos los campos y normaliza envKeys a mayúsculas", () => {
    const s = normalizeSuggestion("connector", raw, "Dapta") as ConnectorSuggestion;
    expect(s.envKeys).toEqual(["DAPTA_API_KEY", "TOKEN"]);
    expect(s.affiliate).toBe(true);
    expect(s.status).toBe("available");
    expect(s.tokenHelpUrl).toBe("https://dapta.ai/settings/tokens");
  });

  it("descarta URLs que no parsean en vez de pasarlas al formulario", () => {
    const s = normalizeSuggestion(
      "connector",
      { ...raw, ctaUrl: "N/A", tokenHelpUrl: "no encontrado" },
      "Dapta",
    ) as ConnectorSuggestion;
    expect(s.ctaUrl).toBe("");
    expect(s.tokenHelpUrl).toBeUndefined();
  });

  it("descarta esquemas que no son http(s)", () => {
    const s = normalizeSuggestion(
      "connector",
      { ...raw, ctaUrl: "javascript:alert(1)" },
      "Dapta",
    ) as ConnectorSuggestion;
    expect(s.ctaUrl).toBe("");
  });

  it("affiliate solo es true con el booleano, no con la cadena 'true'", () => {
    const s = normalizeSuggestion(
      "connector",
      { ...raw, affiliate: "true" },
      "Dapta",
    ) as ConnectorSuggestion;
    expect(s.affiliate).toBe(false);
  });

  it("status cae en 'soon' salvo que el modelo diga 'available'", () => {
    const s = normalizeSuggestion(
      "connector",
      { ...raw, status: "beta" },
      "Dapta",
    ) as ConnectorSuggestion;
    expect(s.status).toBe("soon");
  });
});

describe("normalizeSuggestion — resto de los tipos", () => {
  it("skill trae las tres secciones", () => {
    const s = normalizeSuggestion(
      "skill",
      {
        category: "marketing",
        whenToUse: "Cuando…",
        whatItDoes: "Hace…",
        howToUse: "Usás…",
      },
      "Mi Skill",
    ) as SkillSuggestion;
    expect(s.type).toBe("skill");
    expect(s.whenToUse).toBe("Cuando…");
    expect(s.howToUse).toBe("Usás…");
  });

  it("kit filtra items con kind inválido o sin razón, y queda en 'soon'", () => {
    const s = normalizeSuggestion(
      "kit",
      {
        category: "sales",
        items: [
          { kind: "connector", slug: "github", reason: "Repos" },
          { kind: "plugin", slug: "x", reason: "kind inválido" },
          { kind: "skill", slug: "y" },
          "no es objeto",
        ],
      },
      "Mi Kit",
    ) as KitSuggestion;
    expect(s.items).toEqual([
      { kind: "connector", slug: "github", reason: "Repos" },
    ]);
    expect(s.status).toBe("soon");
  });

  it("cli-tool valida homepage y repo como URLs", () => {
    const s = normalizeSuggestion(
      "cli-tool",
      {
        category: "dev",
        binary: "gh",
        installCommand: "brew install gh",
        vendor: "GitHub",
        homepage: "https://cli.github.com",
        repo: "todavía no lo encontré",
      },
      "GitHub CLI",
    ) as CliToolSuggestion;
    expect(s.homepage).toBe("https://cli.github.com/");
    expect(s.repo).toBeUndefined();
    expect(s.binary).toBe("gh");
  });
});

describe("buildSuggestPrompt", () => {
  it("le pasa al modelo las categorías reales del tipo, no una lista escrita a mano", () => {
    const { system } = buildSuggestPrompt("connector", "Dapta");
    for (const c of CONNECTOR_CATEGORIES) {
      expect(system).toContain(c);
    }
  });

  it("prohíbe inventar y pide español", () => {
    const { system } = buildSuggestPrompt("connector", "Dapta");
    expect(system).toMatch(/[Nn]unca inventes/);
    expect(system).toContain("español");
  });

  it("nombra la herramienta en el mensaje del usuario", () => {
    const { user } = buildSuggestPrompt("skill", "Dapta");
    expect(user).toContain("Dapta");
  });

  it("cada tipo pide su propia forma de JSON", () => {
    expect(buildSuggestPrompt("connector", "x").system).toContain("npmPackage");
    expect(buildSuggestPrompt("cli-tool", "x").system).toContain("installCommand");
    expect(buildSuggestPrompt("kit", "x").system).toContain('"items"');
    expect(buildSuggestPrompt("skill", "x").system).not.toContain("npmPackage");
  });
});

describe("resolveSuggestRuntime", () => {
  it("sin ninguna key, falla explicando cuáles sirven", () => {
    const r = resolveSuggestRuntime({});
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error).toContain("ZAI_API_KEY");
      expect(r.error).toContain("ANTHROPIC_API_KEY");
    }
  });

  it("con ANTHROPIC_API_KEY usa el endpoint de Anthropic, opus-5 y búsqueda web", () => {
    const r = resolveSuggestRuntime({ ANTHROPIC_API_KEY: "sk-ant-x" });
    expect(r).toMatchObject({
      ok: true,
      provider: "anthropic",
      apiKey: "sk-ant-x",
      baseURL: undefined,
      model: ANTHROPIC_DEFAULT_MODEL,
      webSearch: true,
    });
  });

  it("acepta los dos nombres de la key de Z.ai", () => {
    for (const env of [
      { ZAI_API_KEY: "z-1", CANDIDATE_SUGGEST_MODEL: "glm-x" },
      { Z_AI_API_KEY: "z-1", CANDIDATE_SUGGEST_MODEL: "glm-x" },
    ]) {
      const r = resolveSuggestRuntime(env);
      expect(r).toMatchObject({ ok: true, provider: "zai", apiKey: "z-1" });
    }
  });

  it("la key de Z.ai gana sobre la de Anthropic y trae su endpoint por defecto", () => {
    const r = resolveSuggestRuntime({
      ZAI_API_KEY: "z-1",
      ANTHROPIC_API_KEY: "sk-ant-x",
      CANDIDATE_SUGGEST_MODEL: "glm-x",
    });
    expect(r).toMatchObject({
      ok: true,
      provider: "zai",
      apiKey: "z-1",
      baseURL: ZAI_DEFAULT_BASE_URL,
      model: "glm-x",
    });
  });

  it("con key de Z.ai y sin modelo, falla nombrando la variable en vez de inventar un id", () => {
    const r = resolveSuggestRuntime({ ZAI_API_KEY: "z-1" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("CANDIDATE_SUGGEST_MODEL");
  });

  it("apaga la búsqueda web en Z.ai (server tool de Anthropic) y deja forzarla", () => {
    const base = { ZAI_API_KEY: "z-1", CANDIDATE_SUGGEST_MODEL: "glm-x" };
    expect(resolveSuggestRuntime(base)).toMatchObject({ webSearch: false });
    expect(
      resolveSuggestRuntime({ ...base, CANDIDATE_SUGGEST_WEB_SEARCH: "on" }),
    ).toMatchObject({ webSearch: true });
  });

  it("CANDIDATE_SUGGEST_WEB_SEARCH=off apaga la búsqueda en Anthropic", () => {
    expect(
      resolveSuggestRuntime({
        ANTHROPIC_API_KEY: "sk-ant-x",
        CANDIDATE_SUGGEST_WEB_SEARCH: "off",
      }),
    ).toMatchObject({ webSearch: false });
  });

  it("una base URL explícita pisa el default de cada proveedor", () => {
    expect(
      resolveSuggestRuntime({
        ZAI_API_KEY: "z-1",
        CANDIDATE_SUGGEST_MODEL: "glm-x",
        CANDIDATE_SUGGEST_BASE_URL: "https://api.z.ai/api/anthropic",
      }),
    ).toMatchObject({ baseURL: "https://api.z.ai/api/anthropic" });
  });

  it("ignora variables vacías o con solo espacios", () => {
    const r = resolveSuggestRuntime({
      ZAI_API_KEY: "   ",
      ANTHROPIC_API_KEY: "sk-ant-x",
      CANDIDATE_SUGGEST_BASE_URL: "  ",
    });
    expect(r).toMatchObject({ ok: true, provider: "anthropic", baseURL: undefined });
  });
});
