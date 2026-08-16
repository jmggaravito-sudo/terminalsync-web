import Anthropic from "@anthropic-ai/sdk";
import type { LinkedinSettings } from "./types";

// Ported faithfully from the lead-hunter prototype's messageGenerator.ts —
// this prompt took real effort to get right (no emojis, human tone,
// references a specific recent post, signed by sender name, es/en aware,
// strict JSON output). Do not rewrite the prompt content, only the
// plumbing around it (this repo has no prior Anthropic-calling pattern to
// match, so the SDK is used directly here — see package.json).

export interface ProfileForAnalysis {
  name: string;
  title: string;
  company: string;
  location: string;
  recentPosts: string[];
}

export interface DraftResult {
  analysis: string;
  message: string;
}

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Falta ANTHROPIC_API_KEY. Configuralo en las variables de entorno de Vercel antes de redactar.");
  }
  return new Anthropic({ apiKey });
}

function buildSystemPrompt(settings: LinkedinSettings): string {
  const langInstruction =
    settings.language === "en"
      ? "Write the analysis and the outreach message in English."
      : `Escribe el análisis y el mensaje de contacto en español neutro para Latinoamérica y España. No uses voseo; usa tuteo neutro: "tienes", "haces", "puedes", "hablas", "conduces".`;

  return `Eres un asistente experto en prospección B2B en LinkedIn. Tu trabajo tiene dos partes, para UN solo perfil de LinkedIn a la vez:

1. ANÁLISIS: un resumen breve (2-3 frases) de quién es esta persona, qué rol cumple, y qué señal reciente (de sus posts) es relevante para un primer contacto comercial.
2. MENSAJE: un mensaje de outreach personalizado, listo para pegar en LinkedIn, en tono humano y conversacional — nunca corporativo ni genérico.

Reglas estrictas para el MENSAJE:
- Nunca uses emojis.
- Nunca uses frases genéricas de spam ("Espero que estés bien", "Me encantaría conectar", "Vi tu perfil y me pareció interesante").
- Menciona algo ESPECÍFICO y CONCRETO de los posts recientes de la persona (un tema, un logro, una opinión que compartió) — si no hay posts, menciona algo específico de su rol/empresa en vez de inventar un post.
- El mensaje debe conectar naturalmente esa mención específica con la oferta del remitente, sin sonar forzado.
- Extensión: 60-110 palabras. Párrafos cortos, saltos de línea donde ayude a la lectura.
- Termina firmado con el nombre del remitente (una línea aparte, sin "Atentamente" ni cierres formales rígidos).
- En español, no uses voseo argentino/rioplatense. Evita formas como "sos", "tenés", "hacés", "hablás", "podés", "conducís", "querés". Usa "eres", "tienes", "haces", "hablas", "puedes", "conduces", "quieres".
- Nunca inventes datos que no estén en el perfil o los posts entregados.
- ${langInstruction}

${settings.language === "en" ? "About the sender" : "Sobre el remitente"}:
- ${settings.language === "en" ? "Name" : "Nombre"}: ${settings.senderName || "(sin definir)"}
- ${settings.language === "en" ? "Company" : "Empresa"}: ${settings.companyName || "(sin definir)"}
- ${settings.language === "en" ? "Offer/services" : "Oferta/servicios"}: ${settings.offerDescription || "(sin definir)"}

Responde EXCLUSIVAMENTE con un objeto JSON válido, sin texto adicional, sin markdown, con esta forma exacta:
{"analysis": "...", "message": "..."}

En "message", los saltos de línea van como \\n literal dentro del string JSON.`;
}

function buildUserContent(profile: ProfileForAnalysis): string {
  const posts =
    profile.recentPosts.length > 0
      ? profile.recentPosts.map((p, i) => `${i + 1}. ${p}`).join("\n")
      : "(no se encontraron posts recientes públicos)";

  return `Perfil de LinkedIn a analizar:

Nombre: ${profile.name}
Cargo actual: ${profile.title}
Empresa: ${profile.company}
Ubicación: ${profile.location}

Posts recientes:
${posts}

Genera el análisis y el mensaje de outreach personalizado según las reglas del sistema.`;
}

function extractJson(text: string): DraftResult {
  const trimmed = text.trim();
  const jsonStart = trimmed.indexOf("{");
  const jsonEnd = trimmed.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("La respuesta del modelo no contenía JSON.");
  }
  const parsed = JSON.parse(trimmed.slice(jsonStart, jsonEnd + 1)) as Partial<DraftResult>;
  if (typeof parsed.analysis !== "string" || typeof parsed.message !== "string") {
    throw new Error("La respuesta del modelo no tenía la forma esperada { analysis, message }.");
  }
  return { analysis: parsed.analysis, message: parsed.message };
}

/**
 * Analiza un perfil y redacta un mensaje de outreach personalizado usando
 * Anthropic. Lanza si falta la API key o si la llamada falla — el caller
 * debe capturarlo y convertirlo en un estado de error legible (nunca debe
 * tumbar la ruta serverless).
 */
export async function generateLeadDraft(
  profile: ProfileForAnalysis,
  settings: LinkedinSettings,
): Promise<DraftResult> {
  const client = getClient();
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

  const response = await client.messages.create({
    model,
    max_tokens: 1024,
    system: buildSystemPrompt(settings),
    messages: [{ role: "user", content: buildUserContent(profile) }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("El modelo no devolvió contenido de texto.");
  }

  return extractJson(textBlock.text);
}
