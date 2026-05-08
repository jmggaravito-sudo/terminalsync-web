/**
 * Education-institution outreach templates.
 *
 * Different audience, different ask: instead of an affiliate code or a
 * "feature this in your next video" pitch (the creator playbook), the
 * education side needs to read like a partnership inquiry — bulk
 * licensing for students, curriculum support, an academic discount.
 *
 * Stored as a typed constant so the eventual sender workflow can
 * import it directly. Two locales because most of the institutions
 * captured so far are split between Spanish-speaking LATAM/ES and
 * English-speaking US/UK channels. Subject + body, plain text — the
 * Resend HTML wrapper that the influencer flow uses isn't a fit for
 * institutional inboxes (most institutional gateways flag heavy HTML).
 *
 * Variables interpolated at send time:
 *   {{institutionName}}  — channel name, e.g. "Universidad Ean"
 *   {{contactFirstName}} — picked from the about page or "team" if blank
 *   {{topicMention}}     — the video title that triggered the match
 *   {{senderFirstName}}  — JM
 */

export interface OutreachTemplate {
  subject: string;
  body: string;
}

export interface EducationOutreachTemplates {
  es: OutreachTemplate;
  en: OutreachTemplate;
}

export const EDUCATION_OUTREACH: EducationOutreachTemplates = {
  es: {
    subject:
      "Programa académico para {{institutionName}} — TerminalSync",
    body: `Hola {{contactFirstName}},

Soy {{senderFirstName}}, fundador de TerminalSync. Vi que en {{institutionName}} están enseñando contenido sobre Claude Code y herramientas de IA ({{topicMention}}) — felicitaciones por estar a la vanguardia.

Les escribo para proponerles un programa académico:

  • Licencias gratuitas de TerminalSync (plan Dev) para profesores y estudiantes que tomen cursos de IA / desarrollo con AI agents.
  • Material de apoyo para integrar TerminalSync en su curriculum (memoria persistente entre Claude / Codex / Gemini, MCP servers, .env vault).
  • Sesión de 30 minutos con su equipo académico para mostrarles cómo otras instituciones están usándolo.

¿Tendrían 15 minutos esta semana o la próxima para conversar? Les puedo mandar el deck del programa antes de la llamada.

Si esto le toca a otra persona dentro de {{institutionName}} (coordinador de IA, decano de tecnología), te agradezco si me la podés referir.

Gracias,
{{senderFirstName}}
TerminalSync — terminalsync.ai
`,
  },
  en: {
    subject:
      "Academic partnership for {{institutionName}} — TerminalSync",
    body: `Hi {{contactFirstName}},

I'm {{senderFirstName}}, founder of TerminalSync. I noticed {{institutionName}} is teaching content on Claude Code / AI development tools ({{topicMention}}) — great to see institutions leading on this.

I'd like to propose an academic program:

  • Free TerminalSync licenses (Dev tier) for faculty and students taking AI / agent-development courses.
  • Curriculum-ready material covering shared memory across Claude / Codex / Gemini, MCP servers, and the encrypted .env vault.
  • A 30-minute session with your academic team showing how other institutions are integrating it.

Would you have 15 minutes this or next week? Happy to send the program deck ahead of the call.

If this is owned by someone else at {{institutionName}} (AI program lead, dean of technology), I'd appreciate an intro.

Thanks,
{{senderFirstName}}
TerminalSync — terminalsync.ai
`,
  },
};

/** Resolves a template + locale into a ready-to-send email by replacing
 *  every `{{variable}}` token. Unmatched tokens are left in place so a
 *  bad payload fails loudly instead of silently sending blanks. */
export function renderEducationOutreach(
  locale: "es" | "en",
  vars: {
    institutionName: string;
    contactFirstName?: string;
    topicMention: string;
    senderFirstName: string;
  },
): OutreachTemplate {
  const tpl = EDUCATION_OUTREACH[locale];
  const fill = (s: string) =>
    s
      .replace(/{{institutionName}}/g, vars.institutionName)
      .replace(
        /{{contactFirstName}}/g,
        vars.contactFirstName?.trim() ||
          (locale === "es" ? "equipo de" : "team at"),
      )
      .replace(/{{topicMention}}/g, vars.topicMention)
      .replace(/{{senderFirstName}}/g, vars.senderFirstName);
  return { subject: fill(tpl.subject), body: fill(tpl.body) };
}
