// Thin wrapper around the Slack incoming-webhook for the #partnerships
// channel. Used by /api/internal/leads-replied and /leads-converted to ping
// the team in real time without polling the database.
//
// Setup is owner-side: create an Incoming Webhook in Slack
// (https://api.slack.com/apps → Incoming Webhooks → Add to Workspace), pick
// #partnerships, paste the URL into SLACK_PARTNERSHIPS_WEBHOOK_URL.
//
// All helpers no-op gracefully when the env is empty so dev sandboxes don't
// fail noisily — they just log what would have been sent.

interface SlackBlock {
  type: string;
  [key: string]: unknown;
}

interface SlackPayload {
  text: string;
  blocks?: SlackBlock[];
}

async function postPartnerships(payload: SlackPayload): Promise<boolean> {
  const url = process.env.SLACK_PARTNERSHIPS_WEBHOOK_URL;
  if (!url) {
    console.log("[slack] webhook not configured, skipping post:", payload.text);
    return false;
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "<unreadable>");
      console.error("[slack] post failed", { status: res.status, body });
      return false;
    }
    return true;
  } catch (err) {
    console.error("[slack] post error", err);
    return false;
  }
}

export interface LeadAlert {
  platform: string;
  handle: string;
  profile_url: string;
  tier: number | null;
  display_name?: string | null;
}

/** Ping #partnerships when an outreach lead replies to a DM. The text is
 *  short so the desktop notification reads cleanly without expanding; the
 *  blocks add the profile link + reply preview for in-channel triage. */
export async function alertLeadReplied(
  lead: LeadAlert,
  replyPreview?: string,
): Promise<boolean> {
  const tier = lead.tier ? `tier ${lead.tier}` : "tier ?";
  const name = lead.display_name || lead.handle;
  const text = `Reply from ${name} on ${lead.platform} (${tier})`;

  const blocks: SlackBlock[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `:speech_balloon: *${name}* replied on *${lead.platform}* — ${tier}\n<${lead.profile_url}|${lead.handle}>`,
      },
    },
  ];

  if (replyPreview) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `> ${truncate(replyPreview, 280)}`,
      },
    });
  }

  return postPartnerships({ text, blocks });
}

/** Ping #partnerships when an outreach lead converts (signs up as publisher,
 *  installs a paid skill/connector, etc). Slightly more celebratory tone — it's
 *  the metric we're optimizing for. */
export async function alertLeadConverted(
  lead: LeadAlert,
  context?: { event: string; publisherId?: string | null },
): Promise<boolean> {
  const tier = lead.tier ? `tier ${lead.tier}` : "tier ?";
  const name = lead.display_name || lead.handle;
  const text = `Converted: ${name} (${lead.platform}, ${tier})`;

  const lines = [
    `:tada: *${name}* converted on *${lead.platform}* — ${tier}`,
    `<${lead.profile_url}|${lead.handle}>`,
  ];
  if (context?.event) lines.push(`event: \`${context.event}\``);
  if (context?.publisherId) lines.push(`publisher: \`${context.publisherId}\``);

  return postPartnerships({
    text,
    blocks: [
      {
        type: "section",
        text: { type: "mrkdwn", text: lines.join("\n") },
      },
    ],
  });
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + "…";
}
