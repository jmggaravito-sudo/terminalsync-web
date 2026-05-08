# Cloudflare Workers for TerminalSync

## tsync-inbound-relay

Email Worker that receives creator replies via Cloudflare Email Routing and:

1. POSTs the parsed email (metadata + raw RFC822) to the n8n webhook
   `https://n8n.nexflowai.net/webhook/tsync-inbound-reply` for tracking.
2. Forwards the original email to the fallback inbox so JM still sees it
   in Gmail.

### Bindings (env vars)

| Name              | Value                                                     |
| ----------------- | --------------------------------------------------------- |
| `N8N_WEBHOOK_URL` | `https://n8n.nexflowai.net/webhook/tsync-inbound-reply`   |
| `FORWARD_TO`      | `jgaravito@terminalsync.ai`                               |
| `WEBHOOK_SECRET`  | rotated; see CF dashboard or `tsync-worker-secret`        |

### Deploy via API

```bash
CF_TOKEN=...   # needs Workers Scripts:Edit
ACCOUNT_ID=4c3c132cf889bc1d86af2c629771b08e
curl -X PUT \
  -H "Authorization: Bearer $CF_TOKEN" \
  -F "metadata=@metadata.json;type=application/json" \
  -F "worker.js=@tsync-inbound-relay.js;type=application/javascript+module" \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/workers/scripts/tsync-inbound-relay"
```

`metadata.json`:
```json
{ "main_module": "worker.js", "compatibility_date": "2026-01-01" }
```

### Wire up Email Routing rule (manual one-time)

The CF token used to deploy this Worker did not have `Email Routing Rules:Edit`,
so the routing rule was created in the dashboard:

1. Cloudflare → Websites → `terminalsync.ai` → Email → Email Routing → Routes
2. **Custom addresses** → Create address → `replies@terminalsync.ai`
3. Action → **Send to a Worker** → `tsync-inbound-relay`
4. Save.

Outreach emails are sent with `reply_to: replies@terminalsync.ai`
(see `scripts/send-outreach.py`).
