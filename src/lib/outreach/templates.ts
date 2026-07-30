export const TEMPLATES = {
  affiliate: {
    en: `Hey {name} — {hook}quick idea: your audience already sells services, retainers, or consulting. We help businesses turn their messy follow-up, content, CRM, and repetitive admin into AI-assisted workflows they can actually use every day. If this fits your audience, I can set you up with a free demo account and an affiliate angle so you can show a real business use case, not another generic AI tool.`,
    es: `Hola {name} — {hook}idea rápida: tu audiencia ya vende servicios, consultorías o trabaja con clientes. Nosotros ayudamos a empresas/agencias a convertir seguimiento, contenido, CRM y tareas repetitivas en flujos con IA que sí se usan en el día a día. Si le sirve a tu audiencia, te abro una cuenta demo gratis y vemos un ángulo de afiliado para mostrar un caso real, no “otra herramienta de IA”.`,
  },
  user: {
    en: `Hey {name} — {hook}I think this could be useful for your business: TerminalSync helps teams use AI as an operating layer for follow-up, content, CRM notes, client work, and repetitive tasks — without needing a developer in the middle. If you want, I can show you one practical workflow you could use this week.`,
    es: `Hola {name} — {hook}creo que esto puede servir para tu negocio: TerminalSync ayuda a equipos a usar IA como una capa operativa para seguimiento, contenido, notas de CRM, trabajo con clientes y tareas repetitivas, sin depender de un dev para todo. Si querés, te muestro un flujo práctico que podrías usar esta semana.`,
  },
} as const;

export type TemplateTrack = keyof typeof TEMPLATES;
export type TemplateLang = keyof typeof TEMPLATES["affiliate"];

export const templateTrack = (track: string | null): TemplateTrack =>
  track === "affiliate" ? "affiliate" : "user";

export const templateLang = (language: string | null): TemplateLang =>
  language === "es" ? "es" : "en";
