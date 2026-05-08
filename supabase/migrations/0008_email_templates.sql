-- Email templates registry — keeps every outreach / lifecycle email
-- in one place so JM can read and edit them from /admin/ops without
-- diving into n8n code nodes.
--
-- Each row is one (workflow_id, locale, slug) tuple. Slug lets us
-- store multiple templates per workflow (e.g. "first-touch" vs
-- "follow-up-7d" vs "broke-up"). Locale is es / en / both — we keep
-- them as separate rows because edits to one shouldn't touch the
-- other and the UI can render side-by-side.
--
-- The body is plain text. We preserve {{token}} placeholders verbatim;
-- the renderer at send-time does the substitution.

create table email_templates (
  id              uuid primary key default gen_random_uuid(),

  -- which n8n workflow uses this. Lets the ops dashboard map cards
  -- to templates without an extra join.
  workflow_id     text not null,
  workflow_name   text not null,

  -- what part of the lifecycle this template is for
  slug            text not null,
  -- human-friendly label shown in the dashboard
  label           text not null,
  -- audience bucket, mostly for color-coding in the UI
  audience        text not null check (audience in (
    'creator', 'marketplace', 'education', 'consumer', 'developer',
    'support', 'lifecycle', 'other'
  )),

  locale          text not null check (locale in ('es', 'en')),

  subject         text not null,
  body            text not null,

  -- track edits so the dashboard can show "edited 2h ago"
  updated_at      timestamptz not null default now(),
  updated_notes   text
);

create unique index email_templates_uk
  on email_templates (workflow_id, slug, locale);

create index email_templates_workflow_idx
  on email_templates (workflow_id);

-- updated_at trigger
create or replace function set_email_templates_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger email_templates_updated_at
  before update on email_templates
  for each row execute function set_email_templates_updated_at();

alter table email_templates enable row level security;

-- Seed: education (mirrors src/lib/outreach/education_template.ts)
insert into email_templates
  (workflow_id, workflow_name, slug, label, audience, locale, subject, body)
values
  ('7ooGFm2XvT8SLdde', 'TSync · Captura diaria Influencers YT+X',
   'first-touch', 'Primer email — Creator',
   'creator', 'es',
   '¿{{name}}, te interesaría TerminalSync para tu audiencia?',
$$Hola {{name}},

Vi tu contenido sobre {{topicMention}} y quería contactarte directamente.

Qué es TerminalSync (terminalsync.ai):
La única plataforma que sincroniza la memoria entre Claude Code, Codex y Gemini — para que cada agente IA sepa lo que el otro ya hizo, en cualquier máquina.

Tres problemas que resuelve para tus seguidores:
  • Cada agente arranca de cero: lo que le pediste a Claude, Codex no lo sabe.
  • Cambiar de máquina = perder todo el contexto.
  • Claves de API y .env se pierden o terminan subidos a Git por accidente.

Estamos por lanzar y antes de salir quería medir interés con creators que ya enseñan estas herramientas.

¿Te interesaría revisarlo cuando esté listo? Una sola palabra ("sí" / "no" / "cuéntame más") me sirve.

Gracias,
{{senderFirstName}}
TerminalSync — terminalsync.ai
$$),
  ('7ooGFm2XvT8SLdde', 'TSync · Captura diaria Influencers YT+X',
   'first-touch', 'First email — Creator',
   'creator', 'en',
   'Would TerminalSync interest your audience, {{name}}?',
$$Hi {{name}},

I came across your content on {{topicMention}} and wanted to reach out directly.

What TerminalSync is (terminalsync.ai):
The only platform that syncs memory across Claude Code, Codex, and Gemini — so each AI agent knows what the others have already done, on any machine.

Three problems it solves for your audience:
  • Every agent starts from zero: what you told Claude, Codex doesn't know.
  • Switching machines = losing all the context.
  • API keys and .env files get lost or pushed to Git by accident.

We're about to launch and before going wide I wanted to gauge interest with creators already teaching these tools.

Would this interest you when it's ready? A one-word reply ("yes" / "no" / "tell me more") is plenty.

Thanks,
{{senderFirstName}}
TerminalSync — terminalsync.ai
$$),

  -- Marketplace publisher outreach
  ('3ad53aIJo6QA1vI0', 'TSync · Captura diaria Marketplace Publishers',
   'first-touch', 'Primer email — Marketplace',
   'marketplace', 'es',
   '¿Listarían {{productName}} en el marketplace de TerminalSync?',
$$Hola equipo de {{productName}},

Soy {{senderFirstName}}, fundador de TerminalSync.

Qué es TerminalSync (terminalsync.ai):
La única plataforma que sincroniza la memoria entre Claude Code, Codex y Gemini — para que cada agente IA sepa lo que el otro ya hizo. Es como Vercel para AI agents: una capa única que coordina todo.

Tres problemas que resuelve:
  • Cada agente arranca sin contexto: lo que le pediste a uno, los otros no lo saben.
  • Cambiar de máquina = perder el trabajo.
  • Claves API y .env se filtran a Git por accidente.

Estamos curando un marketplace de connectors / skills compatibles con todos los AI agents principales. Vi {{productName}} y creo que encaja.

¿Les interesaría que los listemos? Si es relevante, te puedo mandar los detalles del programa.

Gracias,
{{senderFirstName}}
TerminalSync — terminalsync.ai
$$),
  ('3ad53aIJo6QA1vI0', 'TSync · Captura diaria Marketplace Publishers',
   'first-touch', 'First email — Marketplace',
   'marketplace', 'en',
   'Would you list {{productName}} on the TerminalSync marketplace?',
$$Hi team at {{productName}},

I'm {{senderFirstName}}, founder of TerminalSync.

What TerminalSync is (terminalsync.ai):
The only platform that syncs memory across Claude Code, Codex, and Gemini — so each AI agent knows what the others have already done. Think Vercel for AI agents: a single coordination layer.

Three problems it solves:
  • Every agent starts with zero context: what you told one, the others don't know.
  • Switching machines = losing the work.
  • API keys and .env files leak to Git by accident.

We're curating a marketplace of connectors / skills compatible with all major AI agents. {{productName}} caught my eye — looks like a fit.

Would you be interested in being listed? Happy to send program details if it's relevant.

Thanks,
{{senderFirstName}}
TerminalSync — terminalsync.ai
$$),

  -- Education (mirrors education_template.ts so JM can edit either)
  ('7ooGFm2XvT8SLdde', 'TSync · Captura diaria Influencers YT+X',
   'education-first-touch', 'Primer email — Educación',
   'education', 'es',
   '¿Les interesaría TerminalSync para {{institutionName}}?',
$$Hola {{contactFirstName}},

Soy {{senderFirstName}}, fundador de TerminalSync. Vi que en {{institutionName}} están enseñando contenido sobre Claude Code / IA ({{topicMention}}).

Qué es TerminalSync (terminalsync.ai):
La única plataforma que sincroniza la memoria entre Claude Code, Codex y Gemini — para que cada agente IA sepa lo que el otro ya hizo, en cualquier máquina del estudiante.

Tres problemas que resuelve cuando enseñás estas herramientas:
  • Cada agente arranca de cero: lo que el estudiante le explicó a Claude, Codex no lo sabe.
  • Cambiar de computadora = perder todo el contexto del proyecto.
  • Claves de API y archivos .env se pierden, se exponen, o terminan subidos a Git por accidente.

Estamos armando algo pensado para instituciones educativas que enseñan estas herramientas, y antes de seguir desarrollando quería medir el interés.

¿Les interesaría conocerlo cuando esté listo? Una sola palabra ("sí" / "no" / "cuéntame más") me sirve.

Si esto le toca a otra persona dentro de {{institutionName}}, te agradezco si me la podés referir.

Gracias,
{{senderFirstName}}
TerminalSync — terminalsync.ai
$$),
  ('7ooGFm2XvT8SLdde', 'TSync · Captura diaria Influencers YT+X',
   'education-first-touch', 'First email — Education',
   'education', 'en',
   'Would TerminalSync be interesting for {{institutionName}}?',
$$Hi {{contactFirstName}},

I'm {{senderFirstName}}, founder of TerminalSync. I noticed {{institutionName}} teaches content on Claude Code / AI tools ({{topicMention}}).

What TerminalSync is (terminalsync.ai):
The only platform that syncs memory across Claude Code, Codex, and Gemini — so each AI agent knows what the others have already done, on any machine the student uses.

Three problems it solves when you teach these tools:
  • Every agent starts from zero: what the student told Claude, Codex doesn't know.
  • Switching machines = losing all the project context.
  • API keys and .env files get lost, leaked, or pushed to Git by accident.

We're putting together something specifically for education institutions teaching these tools, and before going deeper I wanted to gauge interest.

Would this be interesting for {{institutionName}} when it's ready? A one-word reply ("yes" / "no" / "tell me more") is plenty.

If someone else at {{institutionName}} is the right person, I'd appreciate an intro.

Thanks,
{{senderFirstName}}
TerminalSync — terminalsync.ai
$$);
