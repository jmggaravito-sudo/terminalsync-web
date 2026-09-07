/**
 * "Investigar y pre-llenar con IA" — la mitad pura del botón de Panel B
 * (`/admin/integraciones` → Agregar candidato).
 *
 * Acá vive todo lo que se puede probar sin llamar al modelo: el prompt, la
 * extracción del JSON de la respuesta, y la normalización de ese JSON a la
 * forma que `CandidateInput` espera (categorías del enum real, slug válido,
 * URLs que parsean, arrays de strings). La ruta
 * `/api/admin/integraciones/candidate/suggest` es solo la plomería.
 *
 * Dos reglas que gobiernan la normalización:
 *
 * 1. **Nunca tira por campos faltantes.** El pedido es "si el modelo no sabe,
 *    devolvé el mejor intento con los huecos vacíos" — el formulario se
 *    pre-llena, el dueño revisa, y la validación de verdad la hace
 *    `/candidate` cuando se aprieta "Crear candidato". Un error acá sería
 *    perder la investigación entera por un campo opcional.
 * 2. **Nunca confía en el modelo para los enums.** `category` y `status`
 *    se cruzan contra las constantes reales de `candidateContent.ts`; lo que
 *    no matchea queda vacío y el dueño elige del select.
 *
 * Idioma del contenido: los candidatos se escriben en `content/<tipo>/es/`
 * (ver `LANG` en la ruta `/candidate`), y en los archivos reales de ese
 * directorio `tagline`, `simpleSubtitle` y `simpleBody` están en español
 * (`content/connectors/es/airtable.md` → `tagline: "CRM + inventario al
 * alcance de la IA"`; la versión inglesa vive en `content/connectors/en/`).
 * Por eso el prompt pide español y no inglés: un tagline en inglés dentro
 * del archivo `es` sale mal en el catálogo.
 */

import {
  CLI_TOOL_CATEGORIES,
  CONNECTOR_CATEGORIES,
  KIT_CATEGORIES,
  PLUGIN_CATEGORIES,
  SKILL_CATEGORIES,
  isValidSlug,
  type CandidateType,
  type CliToolCandidateInput,
  type ConnectorCandidateInput,
  type KitCandidateInput,
  type KitCandidateItemInput,
  type PluginCandidateInput,
  type SkillCandidateInput,
} from "./candidateContent";

export const CANDIDATE_TYPES: readonly CandidateType[] = [
  "skill",
  "connector",
  "plugin",
  "kit",
  "cli-tool",
] as const;

export function isCandidateType(value: unknown): value is CandidateType {
  return (
    typeof value === "string" &&
    (CANDIDATE_TYPES as readonly string[]).includes(value)
  );
}

const CATEGORIES_BY_TYPE: Record<CandidateType, readonly string[]> = {
  skill: SKILL_CATEGORIES,
  connector: CONNECTOR_CATEGORIES,
  plugin: PLUGIN_CATEGORIES,
  kit: KIT_CATEGORIES,
  "cli-tool": CLI_TOOL_CATEGORIES,
};

/** Igual que `CandidateInput`, pero con `category` opcionalmente vacía: una
 *  sugerencia incompleta es un resultado válido, un `CandidateInput`
 *  inválido no. */
export type ConnectorSuggestion = Omit<ConnectorCandidateInput, "category"> & {
  category: ConnectorCandidateInput["category"] | "";
};
export type SkillSuggestion = Omit<SkillCandidateInput, "category"> & {
  category: SkillCandidateInput["category"] | "";
};
export type PluginSuggestion = Omit<PluginCandidateInput, "category"> & {
  category: PluginCandidateInput["category"] | "";
};
export type KitSuggestion = Omit<KitCandidateInput, "category"> & {
  category: KitCandidateInput["category"] | "";
};
export type CliToolSuggestion = Omit<CliToolCandidateInput, "category"> & {
  category: CliToolCandidateInput["category"] | "";
};

export type CandidateSuggestion =
  | ConnectorSuggestion
  | SkillSuggestion
  | PluginSuggestion
  | KitSuggestion
  | CliToolSuggestion;

// ── slug ──────────────────────────────────────────────────────────────────

/** Mismo slugify que usa el formulario del panel, para que el slug sugerido
 *  y el que el panel genera al tipear el nombre coincidan. */
export function slugifyName(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// ── helpers de coerción ───────────────────────────────────────────────────

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function optStr(value: unknown): string | undefined {
  const s = str(value);
  return s ? s : undefined;
}

/** Devuelve la URL solo si parsea y es http(s). El modelo a veces contesta
 *  "N/A" o un dominio suelto; cualquiera de esos ensucia el formulario y
 *  hace fallar la validación de `/candidate` con un mensaje confuso. */
function optUrl(value: unknown): string | undefined {
  const s = str(value);
  if (!s) return undefined;
  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") return undefined;
    return u.toString();
  } catch {
    return undefined;
  }
}

function strArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => str(v)).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

function pickCategory(type: CandidateType, value: unknown): string {
  const s = str(value).toLowerCase();
  return CATEGORIES_BY_TYPE[type].includes(s) ? s : "";
}

function pickStatus(value: unknown): "available" | "soon" {
  return str(value) === "available" ? "available" : "soon";
}

function pickKitItems(value: unknown): KitCandidateItemInput[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((raw) => {
      if (!raw || typeof raw !== "object") return null;
      const row = raw as Record<string, unknown>;
      const kind = str(row.kind);
      const slug = str(row.slug);
      const reason = str(row.reason);
      if (kind !== "connector" && kind !== "skill" && kind !== "cli-tool")
        return null;
      if (!slug || !reason) return null;
      return { kind, slug, reason } satisfies KitCandidateItemInput;
    })
    .filter((item): item is KitCandidateItemInput => item !== null);
}

// ── extracción del JSON ───────────────────────────────────────────────────

/**
 * Saca el objeto JSON de la respuesta del modelo.
 *
 * Se recorta entre la primera `{` y la última `}` porque con `web_search`
 * activo el bloque de texto final suele traer una frase antes o después del
 * JSON, y una cerca ```json alrededor. Mismo criterio que usa
 * `src/lib/linkedinLeads/messageGenerator.ts`, que es el único otro lugar
 * del repo que parsea JSON de un modelo.
 *
 * Efecto secundario buscado de recortar así: si el modelo envuelve la ficha
 * en un array (`[{...}]`), se queda con el objeto de adentro en vez de
 * fallar. Es la lectura correcta de esa respuesta, no un accidente.
 */
export function extractJsonObject(text: string): Record<string, unknown> {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("La respuesta del modelo no contenía un objeto JSON.");
  }
  const parsed: unknown = JSON.parse(text.slice(start, end + 1));
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("La respuesta del modelo no era un objeto JSON.");
  }
  return parsed as Record<string, unknown>;
}

// ── normalización ─────────────────────────────────────────────────────────

/**
 * Convierte el JSON crudo del modelo en una sugerencia con la forma exacta
 * del `CandidateInput` de ese tipo. `fallbackName` es el nombre que escribió
 * el dueño: se usa cuando el modelo no devolvió `name` o `slug`, así el
 * formulario nunca queda peor que antes de apretar el botón.
 */
export function normalizeSuggestion(
  type: CandidateType,
  raw: Record<string, unknown>,
  fallbackName: string,
): CandidateSuggestion {
  const name = str(raw.name) || fallbackName.trim();
  const rawSlug = str(raw.slug).toLowerCase();
  const slug = isValidSlug(rawSlug) ? rawSlug : slugifyName(name);
  const category = pickCategory(type, raw.category);
  const tagline = str(raw.tagline);
  const license = optStr(raw.license);

  if (type === "connector") {
    const suggestion: ConnectorSuggestion = {
      type: "connector",
      slug,
      name,
      category: category as ConnectorSuggestion["category"],
      tagline,
      simpleSubtitle: str(raw.simpleSubtitle),
      simpleBody: str(raw.simpleBody),
      devBody: optStr(raw.devBody),
      ctaUrl: optUrl(raw.ctaUrl) ?? "",
      affiliate: raw.affiliate === true,
      status: pickStatus(raw.status),
      npmPackage: optStr(raw.npmPackage),
      envKeys: strArray(raw.envKeys).map((k) => k.toUpperCase()),
      tokenHelpUrl: optUrl(raw.tokenHelpUrl),
      originalAuthor: optStr(raw.originalAuthor),
      license,
    };
    return suggestion;
  }

  if (type === "plugin") {
    const suggestion: PluginSuggestion = {
      type: "plugin",
      slug,
      name,
      category: category as PluginSuggestion["category"],
      tagline,
      description: str(raw.description),
      connectorSlug: optStr(raw.connectorSlug),
      skillSlugs: strArray(raw.skillSlugs),
      whenToUse: str(raw.whenToUse),
      whatItDoes: str(raw.whatItDoes),
      howToUse: str(raw.howToUse),
      author: optStr(raw.author),
      status: pickStatus(raw.status),
      license,
    };
    return suggestion;
  }

  if (type === "kit") {
    const suggestion: KitSuggestion = {
      type: "kit",
      slug,
      name,
      category: category as KitSuggestion["category"],
      tagline,
      description: str(raw.description),
      items: pickKitItems(raw.items),
      audience: str(raw.audience),
      whatItDoes: str(raw.whatItDoes),
      howToUse: str(raw.howToUse),
      limits: str(raw.limits),
      status: "soon",
      license,
    };
    return suggestion;
  }

  if (type === "cli-tool") {
    const suggestion: CliToolSuggestion = {
      type: "cli-tool",
      slug,
      name,
      category: category as CliToolSuggestion["category"],
      tagline,
      description: str(raw.description),
      binary: str(raw.binary),
      installCommand: str(raw.installCommand),
      authCommand: optStr(raw.authCommand),
      vendor: str(raw.vendor),
      homepage: optUrl(raw.homepage) ?? "",
      repo: optUrl(raw.repo),
      whatItDoes: str(raw.whatItDoes),
      terminalSyncAdds: str(raw.terminalSyncAdds),
      commonCommands: str(raw.commonCommands),
      status: "soon",
      license,
    };
    return suggestion;
  }

  const suggestion: SkillSuggestion = {
    type: "skill",
    slug,
    name,
    category: category as SkillSuggestion["category"],
    tagline,
    description: str(raw.description),
    whenToUse: str(raw.whenToUse),
    whatItDoes: str(raw.whatItDoes),
    howToUse: str(raw.howToUse),
    author: optStr(raw.author),
    status: pickStatus(raw.status),
    license,
  };
  return suggestion;
}

// ── prompt ────────────────────────────────────────────────────────────────

/** Los campos que se le piden al modelo por tipo, en el orden en que se
 *  entienden mejor leídos de arriba a abajo. La descripción de cada uno es
 *  literal del contrato de `candidateContent.ts` — si un campo cambia allá,
 *  cambia acá. */
const FIELD_SPEC: Record<CandidateType, string> = {
  connector: `{
  "type": "connector",
  "slug": "kebab-case del nombre",
  "name": "nombre propio tal como lo escribe el fabricante",
  "category": "una de: ${CONNECTOR_CATEGORIES.join(" | ")}",
  "tagline": "gancho de menos de 60 caracteres, en español",
  "simpleSubtitle": "una frase para el dueño de negocio: qué guarda o hace esta herramienta y qué gana al conectarla",
  "simpleBody": "2 o 3 párrafos en español explicando el conector para alguien no técnico, con ejemplos concretos de qué le puede pedir a su IA",
  "devBody": "párrafo técnico opcional: qué expone el MCP, qué operaciones de lectura/escritura",
  "ctaUrl": "URL oficial del producto o del servidor MCP",
  "affiliate": "true SOLO si es un MCP hosteado o un producto sin paquete npm instalable; false si se corre con npx",
  "npmPackage": "paquete npm exacto que corre via 'npx -y <paquete>', si existe",
  "envKeys": ["NOMBRES_DE_VARIABLES_DE_ENTORNO_QUE_PIDE", "EN_MAYUSCULAS"],
  "tokenHelpUrl": "URL exacta de la página donde el usuario crea ese token",
  "originalAuthor": "autor del servidor MCP si es de la comunidad, ej: 'Adam Jones (@domdomegg)'",
  "license": "licencia del paquete, ej: MIT",
  "status": "available | soon"
}`,
  skill: `{
  "type": "skill",
  "slug": "kebab-case del nombre",
  "name": "nombre de la skill",
  "category": "una de: ${SKILL_CATEGORIES.join(" | ")}",
  "tagline": "gancho de menos de 60 caracteres, en español",
  "description": "una o dos frases: qué resuelve",
  "whenToUse": "sección 'Cuándo usarlo': situaciones concretas",
  "whatItDoes": "sección 'Qué hace': el trabajo real que hace, sin promesas de resultados",
  "howToUse": "sección 'Cómo usarlo': qué le pide el usuario y qué recibe",
  "author": "autor si es de un tercero",
  "license": "licencia si aplica",
  "status": "available | soon"
}`,
  plugin: `{
  "type": "plugin",
  "slug": "kebab-case del nombre",
  "name": "nombre del plugin",
  "category": "una de: ${PLUGIN_CATEGORIES.join(" | ")}",
  "tagline": "gancho de menos de 60 caracteres, en español",
  "description": "una o dos frases: qué resuelve el paquete completo",
  "connectorSlug": "slug del conector que empaqueta, si empaqueta uno",
  "skillSlugs": ["slugs de las skills que incluye"],
  "whenToUse": "sección 'Cuándo usarlo'",
  "whatItDoes": "sección 'Qué hace'",
  "howToUse": "sección 'Cómo usarlo'",
  "author": "autor si es de un tercero",
  "license": "licencia si aplica",
  "status": "available | soon"
}`,
  kit: `{
  "type": "kit",
  "slug": "kebab-case del nombre",
  "name": "nombre del kit",
  "category": "una de: ${KIT_CATEGORIES.join(" | ")}",
  "tagline": "gancho de menos de 60 caracteres, en español",
  "description": "una o dos frases: para qué sirve el kit completo",
  "items": [{ "kind": "connector | skill | cli-tool", "slug": "slug del item", "reason": "por qué está en el kit" }],
  "audience": "para quién es este kit",
  "whatItDoes": "sección 'Qué hace'",
  "howToUse": "sección 'Cómo usarlo'",
  "limits": "sección 'Límites': qué NO hace",
  "license": "licencia si aplica"
}`,
  "cli-tool": `{
  "type": "cli-tool",
  "slug": "kebab-case del nombre",
  "name": "nombre de la herramienta",
  "category": "una de: ${CLI_TOOL_CATEGORIES.join(" | ")}",
  "tagline": "gancho de menos de 60 caracteres, en español",
  "description": "una o dos frases: qué hace la herramienta",
  "binary": "nombre exacto del ejecutable, ej: 'gh'",
  "installCommand": "comando de instalación exacto, ej: 'brew install gh'",
  "authCommand": "comando de login si lo tiene, ej: 'gh auth login'",
  "vendor": "empresa u organización que la publica",
  "homepage": "URL del sitio oficial",
  "repo": "URL del repositorio si es open source",
  "whatItDoes": "sección 'Qué hace'",
  "terminalSyncAdds": "sección 'Qué le suma TerminalSync': qué gana el usuario usándola desde el agente",
  "commonCommands": "sección 'Comandos típicos', uno por línea",
  "license": "licencia si aplica"
}`,
};

const TYPE_LABEL: Record<CandidateType, string> = {
  connector: "conector MCP",
  skill: "skill",
  plugin: "plugin",
  kit: "kit",
  "cli-tool": "herramienta de línea de comandos",
};

/**
 * Prompt de investigación. Dos cosas lo definen:
 *
 * - **Prohibido inventar.** Un campo vacío lo corrige el dueño en 10
 *   segundos; un `npmPackage` inventado se convierte en un manifest que
 *   falla recién cuando un cliente intenta instalarlo.
 * - **Español, no inglés.** El archivo que se genera vive en
 *   `content/<tipo>/es/`, y en los archivos reales de ahí el tagline y las
 *   descripciones están en español (ver el comentario de cabecera).
 */
export function buildSuggestPrompt(
  type: CandidateType,
  name: string,
): { system: string; user: string } {
  const system = `Eres el investigador de catálogo de TerminalSync. Te dan el nombre de una herramienta y devuelves la ficha completa para agregarla al catálogo, lista para que un humano la revise.

Cómo trabajas:

1. Investiga primero. Busca el sitio oficial, la documentación, el repositorio y el paquete npm del servidor MCP si existe. No contestes de memoria sobre versiones, nombres de paquetes, variables de entorno ni URLs: eso cambia y hay que verlo.
2. Prefiere la fuente del fabricante por encima de blogs, listas y agregadores.
3. Si un dato no lo pudiste verificar, deja ese campo como cadena vacía "" (o el array vacío []). Nunca inventes un paquete npm, una URL, un nombre de variable de entorno ni una licencia. Un hueco vacío es correcto; un dato inventado rompe la instalación del cliente y nadie lo detecta hasta que falla.

Cómo escribes:

- En español neutro para Latinoamérica y España. Usa tuteo neutro ("tienes", "puedes", "haces"), nunca voseo ("tenés", "podés", "hacés").
- Sin emojis y sin lenguaje de marketing vacío ("revolucionario", "potente", "líder del mercado"). Describe lo que la herramienta hace, en concreto.
- No prometas resultados de negocio que no puedas sostener.
- Las secciones largas van en Markdown simple (párrafos, listas con "-", cursivas para citas de ejemplo). Sin encabezados "#": el generador del archivo ya los pone.

Formato de la respuesta: responde EXCLUSIVAMENTE con un objeto JSON válido, sin texto antes ni después, sin cercas de código. Esta es la forma exacta para un ${TYPE_LABEL[type]}, y las descripciones entre comillas explican qué va en cada campo (no las copies como valor):

${FIELD_SPEC[type]}`;

  const user = `Investiga "${name}" y devuelve su ficha de catálogo como ${TYPE_LABEL[type]}, en el JSON pedido.`;

  return { system, user };
}
