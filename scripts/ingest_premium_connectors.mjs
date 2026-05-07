/**
 * Ingest 8 high-priority MCP servers (Salesforce, HubSpot, Notion, Gmail,
 * Workspace, Trello, Stripe, Linear) into connector_listings under the
 * "TerminalSync Curated" publisher and approve them, so we can bundle
 * them into Sales Stack + Marketing Stack.
 *
 * Pattern mirrors the 458 auto-published ones: status='approved',
 * pricing_type='free', linked to the curated publisher.
 */
import { createClient } from "@supabase/supabase-js";


const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing supabase env vars");
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });

// Resolve curated publisher id
const { data: pub, error: pubErr } = await sb
  .from("publishers")
  .select("id, slug, display_name")
  .eq("slug", "terminalsync-curated")
  .maybeSingle();
if (pubErr || !pub) {
  console.error("Curated publisher not found:", pubErr);
  process.exit(1);
}
console.log("Publisher:", pub.id, pub.display_name);

const CONNECTORS = [
  {
    slug: "salesforcecli-mcp",
    name: "salesforcecli/mcp",
    tagline: "Official Salesforce MCP — query records, run reports, manage objects from your AI.",
    category: "database",
    logo_url: "https://avatars.githubusercontent.com/u/453694?s=200&v=4",
    description_md:
      "**Official Salesforce MCP server** maintained by the Salesforce CLI team.\n\nGives your AI access to your Salesforce org so it can read records, run SOQL queries, summarize pipelines, and update objects on your behalf.\n\n**Use cases:**\n- 'Pull every open opportunity over $50k closing this month.'\n- 'Summarize the last 10 calls in this account.'\n- 'Update stage to Closed Won on this opp.'",
    setup_md:
      "## Install\n\n```bash\nnpx -y @salesforce/mcp\n```\n\n## Authenticate\n\nFollow Salesforce CLI authentication: `sf org login web`. The MCP server inherits the active org.",
    repo_url: "https://github.com/salesforcecli/mcp",
  },
  {
    slug: "makenotion-notion-mcp",
    name: "makenotion/notion-mcp-server",
    tagline: "Official Notion MCP — read, create and update pages and databases from any AI.",
    category: "productivity",
    logo_url:
      "https://www.notion.so/images/logo-ios.png",
    description_md:
      "**Official Notion MCP server** built by the Notion team. 4,000+ stars on GitHub.\n\nLets your AI read your wiki, create meeting notes, query databases by filter, and update properties without leaving the conversation.\n\n**Use cases:**\n- 'Find every doc tagged Q2 OKRs and summarize blockers.'\n- 'Create a new task in the Engineering DB with assignee = me.'\n- 'Append today's standup notes to the team page.'",
    setup_md:
      "## Install\n\n```bash\nnpx -y @notionhq/notion-mcp-server\n```\n\n## Authenticate\n\nCreate an internal integration at notion.so/my-integrations, copy the secret, and add it to your client config as `NOTION_API_KEY`.",
    repo_url: "https://github.com/makenotion/notion-mcp-server",
  },
  {
    slug: "lkm1developer-hubspot-mcp",
    name: "lkm1developer/hubspot-mcp-server",
    tagline: "HubSpot CRM MCP — contacts, deals and companies live in your AI session.",
    category: "database",
    logo_url:
      "https://www.hubspot.com/hubfs/HubSpot_Logos/HubSpot-Inversed-Favicon.png",
    description_md:
      "MCP server for HubSpot CRM. Read and write contacts, companies, deals and tickets, run lists, and trigger workflows.\n\n**Use cases:**\n- 'Find the 20 contacts who haven't been touched in 90 days.'\n- 'Create a deal for ACME Corp at $25k.'\n- 'Move every deal in Demo stage > 14 days to Stalled.'",
    setup_md:
      "## Install\n\n```bash\nnpx -y hubspot-mcp-server\n```\n\n## Authenticate\n\nGenerate a Private App token in HubSpot (Settings → Integrations → Private Apps) and set it as `HUBSPOT_ACCESS_TOKEN` in your client config.",
    repo_url: "https://github.com/lkm1developer/hubspot-mcp-server",
  },
  {
    slug: "gongrzhe-gmail-mcp",
    name: "GongRzhe/Gmail-MCP-Server",
    tagline: "Gmail MCP — read, draft, send and label messages from your AI.",
    category: "messaging",
    logo_url:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Gmail_icon_%282020%29.svg/240px-Gmail_icon_%282020%29.svg.png",
    description_md:
      "Most popular Gmail MCP server (1,100+ stars). Auto-OAuth, full inbox access for reading, drafting, sending, and label management.\n\n**Use cases:**\n- 'Draft a reply to the last email from Sara.'\n- 'Find every email with subject containing invoice from October.'\n- 'Send the proposal to the people I CCed last week.'",
    setup_md:
      "## Install\n\n```bash\nnpx -y @gongrzhe/server-gmail-autoauth-mcp\n```\n\n## Authenticate\n\nFirst run opens a Google OAuth flow. Tokens are cached locally; no env vars needed after the first launch.",
    repo_url: "https://github.com/GongRzhe/Gmail-MCP-Server",
  },
  {
    slug: "taylorwilsdon-google-workspace-mcp",
    name: "taylorwilsdon/google_workspace_mcp",
    tagline: "Google Workspace all-in-one — Gmail, Calendar, Drive, Docs, Sheets, Slides, Tasks.",
    category: "productivity",
    logo_url:
      "https://lh3.googleusercontent.com/proxy/Kw6X8ZhKgC4vQ8NjHJK2_8HxYcxMx4kgKw",
    description_md:
      "Single MCP server that wraps the entire Google Workspace suite (2,300+ stars). One auth, one install, full surface coverage.\n\n**Use cases:**\n- 'Block 9-10am tomorrow for deep work.'\n- 'Pull the spreadsheet of Q2 leads and sort by close date.'\n- 'Create a doc with the meeting notes and share with the team.'",
    setup_md:
      "## Install\n\n```bash\nuvx workspace-mcp\n```\n\n## Authenticate\n\nFirst run opens a Google OAuth flow covering Gmail + Calendar + Drive + Docs + Sheets + Slides + Tasks scopes. Tokens cached locally.",
    repo_url: "https://github.com/taylorwilsdon/google_workspace_mcp",
  },
  {
    slug: "delorenj-mcp-trello",
    name: "delorenj/mcp-server-trello",
    tagline: "Trello MCP — boards, lists, cards and checklists live in your AI flow.",
    category: "productivity",
    logo_url:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Trello-logo-blue.svg/240px-Trello-logo-blue.svg.png",
    description_md:
      "Trello MCP server (327+ stars). Read your boards, create cards from chat, move them across lists, attach files, manage checklists.\n\n**Use cases:**\n- 'Add a card to the Sprint board: Fix the login bug, due Friday.'\n- 'Move every card in In Review with no comments in 7 days back to To Do.'\n- 'Show me what's on Sara's plate this week.'",
    setup_md:
      "## Install\n\n```bash\nnpx -y @delorenj/mcp-server-trello\n```\n\n## Authenticate\n\nGenerate an API key + token at trello.com/app-key and set them as `TRELLO_API_KEY` and `TRELLO_TOKEN`.",
    repo_url: "https://github.com/delorenj/mcp-server-trello",
  },
  {
    slug: "atharvagupta2003-mcp-stripe",
    name: "atharvagupta2003/mcp-stripe",
    tagline: "Stripe MCP — read customers, charges, subscriptions and refund from your AI.",
    category: "database",
    logo_url:
      "https://stripe.com/img/v3/home/social.png",
    description_md:
      "Stripe MCP server. Read your customers, payments, subscriptions, and run refunds or invoice lookups directly from your AI session.\n\n**Use cases:**\n- 'How much MRR did we add last week?'\n- 'Find the customer with email foo@bar.com and refund their last charge.'\n- 'List every subscription pending cancellation.'",
    setup_md:
      "## Install\n\n```bash\nnpx -y mcp-stripe\n```\n\n## Authenticate\n\nUse a restricted Stripe key (read-only by default) and set it as `STRIPE_API_KEY` in your client config.",
    repo_url: "https://github.com/atharvagupta2003/mcp-stripe",
  },
  {
    slug: "jerhadf-linear-mcp",
    name: "jerhadf/linear-mcp-server",
    tagline: "Linear MCP — issues, projects, sprints and triage from your AI.",
    category: "productivity",
    logo_url:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Linear_app_logo.svg/240px-Linear_app_logo.svg.png",
    description_md:
      "Linear MCP server (340+ stars). Search issues, create them from chat, update status, manage cycles. Best-in-class for solo founders running their roadmap through Linear.\n\n**Use cases:**\n- 'Show me every issue in Cycle 12 still in Todo.'\n- 'Create a bug: checkout fails on Safari, priority high, assign to me.'\n- 'List blockers tagged urgent that haven't moved in 3 days.'",
    setup_md:
      "## Install\n\n```bash\nnpx -y linear-mcp-server\n```\n\n## Authenticate\n\nCreate a Linear API key (Settings → API → Personal API Keys) and set it as `LINEAR_API_KEY`.",
    repo_url: "https://github.com/jerhadf/linear-mcp-server",
  },
];

const ids = {};
for (const c of CONNECTORS) {
  // Idempotent: upsert on slug
  const { data: existing } = await sb
    .from("connector_listings")
    .select("id, slug")
    .eq("slug", c.slug)
    .maybeSingle();

  if (existing) {
    console.log(`SKIP [${c.slug}] already exists id=${existing.id}`);
    ids[c.slug] = existing.id;
    continue;
  }

  const { data, error } = await sb
    .from("connector_listings")
    .insert({
      publisher_id: pub.id,
      slug: c.slug,
      name: c.name,
      tagline: c.tagline,
      category: c.category,
      logo_url: c.logo_url,
      description_md: c.description_md,
      setup_md: c.setup_md,
      pricing_type: "free",
      status: "approved",
      approved_at: new Date().toISOString(),
    })
    .select("id, slug")
    .single();

  if (error) {
    console.error(`ERR [${c.slug}]`, error.message);
    continue;
  }
  console.log(`OK   [${c.slug}] -> ${data.id}`);
  ids[c.slug] = data.id;
}

console.log("\nAll listings:");
console.log(JSON.stringify(ids, null, 2));
