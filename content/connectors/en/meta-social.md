---
name: Meta Social
logo: /connectors/meta-social.svg
category: messaging
status: soon
simpleTitle: "Post to Instagram and Facebook without opening either app"
simpleSubtitle: "Write the caption, pick the picture — Claude posts it to your feeds. You approve, it posts."
devTitle: "Instagram + Facebook publishing (via Meta Graph API)"
devSubtitle: "OAuth page + IG tokens, two-step IG media publish, direct Page feed posts — behind a mandatory approval gate."
ctaUrl: "https://developers.facebook.com/docs/instagram-platform/content-publishing"
affiliate: false
tagline: "One post, both feeds — with you in charge"
originalAuthor: "Meta Platforms"
originalAuthorUrl: "https://about.meta.com"
license: "proprietary"
---
Built on Meta's official Graph API — the same family that powers our WhatsApp connector. It lets you publish a post (image + caption) to your **Instagram** and your **Facebook Page** without opening either app.

Claude drafts the caption in your tone, attaches the image, and shows you exactly what will go out — to which account. Nothing publishes until you say yes. Posting is public and can't be undone, so the approval step is not optional: **you approve, it posts.**

### What you can ask

- *"Post this photo to my Instagram with a caption about the weekend sale."*
- *"Share this announcement on my Facebook Page."*
- *"Put this on both — Instagram and Facebook."*
- *"Which accounts can I post to?"* — it lists your Pages and linked Instagram accounts so you pick where.

### What you need to connect

You sign in once with Facebook and grant permission to post — no API keys to copy or paste. Two honest requirements before it can post to Instagram:

- Your Instagram has to be a **Business or Creator** account (the free switch is in the Instagram app settings), and it must be **linked to a Facebook Page**. A personal Instagram can't publish through the API — the connector checks this up front and tells you in plain words if you need to switch, instead of failing with a cryptic error.
- You need to be an admin of the Facebook Page you want to post to.

The connection asks for the **minimum** permissions: publish to your Page and to the linked Instagram, and list your accounts. Nothing about ads, messages, or reading your audience.

*Private beta coming — the account linking and approval gate are being wired now.*

--- dev ---

Bridges to Meta's **Graph API** for organic publishing. Two surfaces:

- **Facebook Page** — direct post. `POST /{page-id}/photos` (with `caption`) or `POST /{page-id}/feed`, using the Page access token.
- **Instagram** — two-step publish, required by the API: `POST /{ig-user-id}/media` to create a media container (image URL + caption), then `POST /{ig-user-id}/media_publish` with the returned `creation-id`.

**Auth**: Facebook Login for Business → long-lived **User token** → **Page tokens** (`GET /me/accounts`) → linked **IG Business account** (`GET /{page-id}?fields=instagram_business_account`). Refresh/long-lived token stored in the OS keychain (`net.nexflowai.terminalsync`), never on plain disk — same pattern as the Google OAuth flow in `auth/`.

**Scopes (minimum)**: `pages_show_list`, `pages_read_engagement`, `pages_manage_posts` (Facebook Page publish), `instagram_basic`, `instagram_content_publish` (IG publish), `business_management` (Login for Business). No ads, messaging, or insights scopes — organic posting only.

**Preconditions the connector detects**: IG account must be Business/Creator and linked to a Page; the user must be a Page admin. A personal IG returns no `instagram_business_account` on the Page — surfaced as a human-readable setup step, not a raw API error.

**Approval gate**: every publish is an irreversible action and routes through Terminal Sync's confirmation machinery (`safety/`) — the post is previewed and requires explicit user confirmation before any Graph API write. Typed events: `social://publishing`, `social://published` (`{ url }`), `social://needs_approval`, `social://failed`.

**Out of scope for v1**: scheduling, replying to comments, reading metrics, deleting posts, and anything that spends money (paid ads live behind their own gate).

**Status**: schema locked, OAuth + publish flow in private beta.
