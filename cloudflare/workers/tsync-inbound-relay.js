// tsync-inbound-relay
// Receives emails (creator replies) via Cloudflare Email Routing,
// posts metadata + raw RFC822 to n8n for tracking, then forwards to fallback inbox.

export default {
  async email(message, env, ctx) {
    const subject = message.headers.get("subject") || "";
    const messageId = message.headers.get("message-id") || "";
    const inReplyTo = message.headers.get("in-reply-to") || "";
    const references = message.headers.get("references") || "";

    // Read the full raw RFC822 message (capped at 1MB to be safe)
    let raw = "";
    try {
      const reader = message.raw.getReader();
      const decoder = new TextDecoder();
      let total = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.byteLength;
        if (total > 1_000_000) break;
        raw += decoder.decode(value, { stream: true });
      }
      raw += decoder.decode();
    } catch (_e) {
      // best-effort; fall through with whatever we have
    }

    const payload = {
      source: "cf-email-worker",
      type: "email.received",
      from: message.from,
      to: message.to,
      subject,
      message_id: messageId,
      in_reply_to: inReplyTo,
      references,
      raw,
    };

    // Fire-and-track POST to n8n. We don't fail the email if the webhook fails.
    if (env.N8N_WEBHOOK_URL) {
      ctx.waitUntil(
        fetch(env.N8N_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            ...(env.WEBHOOK_SECRET ? { "x-tsync-secret": env.WEBHOOK_SECRET } : {}),
          },
          body: JSON.stringify(payload),
        }).catch(() => {})
      );
    }

    // Always forward to the fallback inbox so JM sees it in Gmail.
    if (env.FORWARD_TO) {
      try {
        await message.forward(env.FORWARD_TO);
      } catch (e) {
        // Forward fails if the address isn't verified — log via sendError.
        message.setReject("forward failed: " + (e && e.message ? e.message : "unknown"));
      }
    }
  },
};
