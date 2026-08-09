# Meta/Facebook app — placement in TerminalSync integrations

## Decision

The existing Meta Developer app should surface as a **Meta Social** integration in the
public integrations catalog and desktop integrations UI, not as a generic
"Facebook app".

Why: the customer-facing job is not "connect a developer app". The job is:
**publish or prepare organic posts for Facebook Pages and linked Instagram
Business/Creator accounts, with explicit approval before anything goes public.**

## Current catalog fit

- Catalog item already exists:
  - `content/connectors/en/meta-social.md`
  - `content/connectors/es/meta-social.md`
  - `public/connectors/meta-social.svg`
- Current status is `available` for the organic publishing surface now that the
  app-side OAuth, token storage, target listing, publish flow, and approval gate
  are wired. Keep ads/inbox/insights out of this connector.
- Category is currently `messaging`. For the owner-facing UI this should be
  treated as **Marketing / Social** when that category exists. Until the catalog
  supports `marketing`, keep the connector in the closest existing bucket but
  label the card as social publishing in the copy.

## Product boundary

### V1: Meta Social — organic publishing

Include:

- Facebook Page post/photo publishing.
- Instagram content publishing for linked Instagram Business/Creator accounts.
- Account discovery: list Pages and the linked Instagram account so the user can
  choose the destination.
- Mandatory preview + approval gate before every publish.

Do not include in this connector:

- Paid ads creation/spend.
- Comment/DM inbox management.
- Insights/analytics dashboards.
- Scheduling queue.

Those are separate product surfaces because they request different permissions,
create different risk, and need different approval language.

### Separate future surfaces

- **Meta Ads**: paid media creation/launch, budget/spend, campaign/ad set/ad
  management. This should live behind its own connector or plugin and an even
  stronger spend approval gate. The existing `Meta Ads Creator` skill stays as a
  planning/copywriting assistant until actual ad-account actions are approved.
- **Meta Inbox**: comments/DMs and moderation. Separate because messaging scopes
  and customer-data expectations are different from publishing.
- **Meta Insights**: read-only reporting for Pages/Instagram/ad performance.
  Can be read-only and safer, but still should be explicit about what account
  data is read.

## How connection should work

1. User clicks **Connect Meta Social** from Integrations.
2. App opens Meta OAuth / Facebook Login for Business.
3. User grants only the scopes needed for organic Page + Instagram publishing.
4. Backend exchanges/stores tokens using the same secure-token pattern as other
   OAuth integrations.
5. App discovers available Pages and linked Instagram Business accounts.
6. UI shows a plain-language readiness check:
   - Facebook Page found / missing.
   - Instagram linked / missing.
   - Instagram account type compatible / incompatible.
   - User can publish / cannot publish.
7. When the agent wants to publish, TerminalSync shows a preview with:
   - destination account(s),
   - image/video,
   - caption/body,
   - irreversible-public-action warning,
   - explicit confirmation button.

## Permission posture

Ask only for the minimum needed for the surface being enabled. For V1 organic
publishing, the content file currently documents these intended scopes:

- `pages_show_list`
- `pages_read_engagement`
- `pages_manage_posts`
- `instagram_basic`
- `instagram_content_publish`
- `business_management`

Do not bundle ads, inbox, or insights permissions into V1 "just in case". Meta
review is easier to explain, and customers trust the connector more, when each
capability maps to one visible product promise.

## App-review and UX notes

- Keep the connector `available` only for organic publishing. If Meta app review
  or production credentials are missing in an environment, the app must show the
  setup/connection error rather than hiding the catalog item as `soon`.
- The UI should say "Facebook + Instagram" or "Meta Social", not just
  "Facebook App". The word "app" is internal/developer vocabulary.
- Personal Instagram accounts should fail early with a setup explanation, not an
  API error. The user needs Business/Creator + linked Facebook Page for the
  publishing path.
- Publishing is public and not safely reversible. It must always use the same
  explicit approval machinery used for other write/destructive actions.

## Sources to re-check before moving from `soon` to `available`

- Meta Permissions Reference: https://developers.facebook.com/docs/permissions/
- Meta Instagram Platform: https://developers.facebook.com/documentation/instagram-platform
- Meta Pages API: https://developers.facebook.com/documentation/pages-api
- Facebook Login for Business: https://developers.facebook.com/documentation/facebook-login/facebook-login-for-business
