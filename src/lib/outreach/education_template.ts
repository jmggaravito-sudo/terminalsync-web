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
      "¿Les interesaría TerminalSync para {{institutionName}}?",
    body: `Hola {{contactFirstName}},

Soy {{senderFirstName}}, fundador de TerminalSync. Vi que en {{institutionName}} están enseñando contenido sobre Claude Code / IA ({{topicMention}}).

Estamos armando algo pensado para instituciones educativas que enseñan estas herramientas, y antes de seguir desarrollando quería medir el interés.

¿Les interesaría conocerlo cuando esté listo? Una sola palabra ("sí" / "no" / "cuéntame más") me sirve.

Si esto le toca a otra persona dentro de {{institutionName}}, te agradezco si me la podés referir.

Gracias,
{{senderFirstName}}
TerminalSync — terminalsync.ai
`,
  },
  en: {
    subject:
      "Would TerminalSync be interesting for {{institutionName}}?",
    body: `Hi {{contactFirstName}},

I'm {{senderFirstName}}, founder of TerminalSync. I noticed {{institutionName}} teaches content on Claude Code / AI tools ({{topicMention}}).

We're putting together something specifically for education institutions teaching these tools, and before going deeper I wanted to gauge interest.

Would this be interesting for {{institutionName}} when it's ready? A one-word reply ("yes" / "no" / "tell me more") is plenty.

If someone else at {{institutionName}} is the right person, I'd appreciate an intro.

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
