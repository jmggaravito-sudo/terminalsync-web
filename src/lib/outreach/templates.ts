export const TEMPLATES = {
  affiliate: {
    en: `Hey {name} — {hook}most AI tools forget what you're doing the second you switch apps or models. TerminalSync keeps your work alive across Claude, Gemini & Codex. Other tools help you start; this one helps you continue. Open to a free account to try it? (Affiliate program too if it clicks.)`,
    es: `Hola {name} — {hook}la mayoría de las herramientas de IA olvidan lo que hacías apenas cambias de app o de modelo. TerminalSync mantiene tu trabajo vivo entre Claude, Gemini y Codex. Otras te ayudan a empezar; esta te ayuda a continuar. ¿Te abro una cuenta gratis para probar? (Hay programa de afiliados si te cuadra.)`,
  },
  user: {
    en: `Hey {name} — {hook}most AI tools forget what you're doing the second you switch apps or models. TerminalSync keeps your context, files & history alive across Claude, Gemini & Codex. Other tools help you start; this one helps you continue. Free to try → terminalsync.ai`,
    es: `Hola {name} — {hook}la mayoría de las herramientas de IA olvidan lo que hacías apenas cambias de app o de modelo. TerminalSync mantiene tu contexto, archivos e historial entre Claude, Gemini y Codex. Otras te ayudan a empezar; esta te ayuda a continuar. Gratis para probar → terminalsync.ai`,
  },
} as const;

export type TemplateTrack = keyof typeof TEMPLATES;
export type TemplateLang = keyof typeof TEMPLATES["affiliate"];

export const templateTrack = (track: string | null): TemplateTrack =>
  track === "affiliate" ? "affiliate" : "user";

export const templateLang = (language: string | null): TemplateLang =>
  language === "es" ? "es" : "en";
