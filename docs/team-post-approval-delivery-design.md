# Team post-approval delivery protocol (design proposal)

**Status: the full artifact/picker protocol remains a proposal and is not production-ready.** A source-only, text-only implementation slice now exists in migration `0056_team_text_deliveries.sql` and authenticated APIs, but remains behind the default-off Team gate and has not been applied to production. This is not authorization to migrate, deploy, activate Team, or transfer live user data.

JM approved this slice's retention rule: an accepted request may be sent for 24 hours after approval; after explicit send, the recipient may read the reviewed text for 7 days, then the text and its SHA-256 digest are erased. Reads fail closed at expiry even if physical cleanup is delayed. The source PR contains a purge endpoint but no scheduled cron; schedule configuration is a later explicit rollout step after `CRON_SECRET` and Vercel hourly-cron capability are verified. This retention approval does not approve retention or transfer of files/artifacts.

This document describes the future full artifact/picker channel and its security invariants. The separate text-only source slice described below does not change production behavior while the migration is unapplied and the Team gate is off; it does not authorize a Supabase migration, feature activation, deployment, or payment work.

## Current behavior (implemented; preserve it)

- Team shared-space invitations, request metadata, and v3 conversation turns are metadata-only. The v3 turn is an approval prompt; approval records a decision and **does not grant content access or deliver a document/context response**.
- Current APIs expose bounded metadata only, derive the actor from a verified Supabase bearer identity, and return `Cache-Control: no-store`. Current turn projection drops unknown payload fields. Migrations 0039, 0042–0043, 0053–0055 explicitly avoid payload storage/delivery; 0054 narrows turn metadata.
- An accepted invitation binds the conversation to that exact relationship. Revocation/expiry or an ineligible entitlement must fail closed. Both members can initiate a turn; the counterparty is the approver for that turn.
- Received spaces stay in a separate collection (for example, “Espacio de Alex”), never in the receiving user's owned spaces or primary context by implication.
- `TEAM_FEATURE_ENABLED` remains the server-side kill switch and defaults off. Production schema readiness and authenticated smoke are separate gates (see [`team-production-rollout.md`](team-production-rollout.md)).

Do not interpret an approved turn as permission to read an entire space, connector account, folder, or changing document. **No payload is available to either user or the AI before the specific post-approval release flow below completes.**

## Proposed flow (requires separate product/security review)

1. **Request metadata only.** The requester can ask for a bounded response or document/context category. The request carries no content, filename, path, URL, provider object ID, or free-form metadata. It does not trigger a source scan. The current v3 manifest hash remains an opaque commitment, not a locator or access capability.
2. **Recipient decides.** The counterparty sees the request summary and explicitly accepts or declines it. Decline, timeout, or no response produces no delivery record and no source lookup. Acceptance alone still transfers nothing.
3. **Approved recipient selects the exact response.** After approval, whichever participant received the request may write/paste a bounded text response back to the initiator. For source artifacts, only the shared-space owner may select supported items from a visible picker and authorize their access; a member's reverse-direction request does not grant that member access to the owner's sources. The AI must not crawl a workspace, infer nearby documents, expand folders, follow links, or select additional content. Selection is per item/version, not “all context.” If an AI-generated answer is requested, the approving recipient reviews the bounded answer and explicitly presses **Send**; generation alone is not delivery consent.
4. **Review exact package and destination.** Show the sender the recipient identity, source item display labels, file types/sizes, and whether the package is a file or AI-written text. Require a final explicit confirmation. Bind that confirmation to an immutable manifest hash and the exact accepted request/relationship. Any changed item, version, answer, or destination invalidates the confirmation and requires review again.
5. **Create and deliver internally.** A server-side operation verifies authorization and relationship again, writes an immutable delivery intent, then transfers only the selected bytes or reviewed text into a private internal delivery store. The recipient gets an opaque in-app notification/reference; no email attachment, public URL, provider URL, or long-lived signed URL. The recipient reads/downloads through an authenticated, no-store API.
6. **Record receipt separately.** A successful write means “available in Team,” not “read.” Append a separate recipient-open/download receipt event. Never claim the recipient consumed or understood the contents based only on send success.

This is intentionally a **two-consent model**: the requester is approved to ask; the data owner separately selects the exact material and confirms sending. The first approval must never imply blanket access or automatically cause a transfer.

## Artifact and payload contract

- Accept only provider-owned item references obtained from an authenticated picker, or bounded text explicitly entered/reviewed by the data owner. A reference is an opaque, server-resolved provider object ID plus stable version/revision and content digest; never accept an arbitrary URL/path, caller-supplied storage key, connector credential, or browser-provided bytes as proof of source ownership.
- Do not persist provider access tokens or external source URLs in Team delivery records. Resolve the exact selected item server-side only after approval and final send confirmation; verify its owner/account and version again. If the source changed, disappeared, or the actor lost access, abort and require reselection/review.
- Initial allowlist proposal: PDF, DOCX, XLSX, CSV, TXT, and common raster images (PNG/JPEG); reject archives, executables, scripts, HTML/SVG, macro-enabled office formats, encrypted/password-protected files, and files whose sniffed type disagrees with extension/MIME. Malware scanning and content-disarm policy are prerequisites for file delivery, not optional “best effort.”
- Initial hard caps proposal: at most 10 artifacts, 10 MiB each, 25 MiB aggregate, and 64 KiB UTF-8 for a reviewed AI/text response. Enforce byte counts after server-side retrieval and again at storage; cap AI context to the selected items and a separately reviewed token budget. Reject rather than silently truncate or expand.
- These limits and allowlist are a security baseline proposal. Product/security owners must approve the final list before implementation.

## Authorization and revocation invariants

Every create, list, metadata read, content read/stream, and delivery/acknowledgement operation must authenticate the caller and recheck on the server/database:

1. current Team entitlement for both participants;
2. caller is an actual participant in the thread and is the authorized actor for this specific action;
3. exact `relationship_id` remains accepted, unrevoked, and is still the relationship bound to the thread and space;
4. the turn is accepted, unexpired, and belongs to that thread/relationship;
5. the immutable delivery manifest references only items explicitly selected by the source owner and consented to for this request/recipient;
6. record is not expired, deleted, revoked, superseded, or already terminal for this operation.

Perform authorization and state transition under a database transaction/lock that serializes with invitation revocation, or another reviewed mechanism with equivalent race guarantees. Recheck immediately before streaming each content response; do not mint reusable public URLs. If authorization or source access becomes invalid, return the same non-disclosing not-found/denied shape for unrelated IDs. Idempotency keys bind to actor + operation + manifest digest; replay with different content/destination is a conflict. Never trust a prior API decision cached in the browser.

A revoke/expiry stops new reads and sends. Delete private objects and encryption keys on the approved retention schedule, but be honest that already downloaded/copied files cannot be remotely recalled. A deletion request must append a tombstone/audit event without preserving payload bytes.

## Storage, audit, privacy, and failure behavior

- Store bytes only in a private, encrypted, non-public object store with server-only access. Store metadata/manifests in a private schema/table with RLS and no grants to `anon`/`authenticated`; expose only narrow service-role RPCs after identity verification. Never put bytes or provider locators in `public` tables, logs, telemetry, notification text, or conversation metadata.
- **Text-slice persistence:** until expiry, the private delivery row contains bounded plaintext and its digest. Expiry/purge clears both plaintext and digest; the row then retains opaque delivery/thread/turn/relationship/user IDs, timestamps, and a deletion marker. Payload-free audit rows retain opaque delivery ID, event (`created`, `viewed`, `expired`), actor user ID (null for expiry), and timestamp; this migration does not schedule audit-row deletion, so that metadata retention requires separate privacy review. Neither payload nor digest is copied into audit events.
- **Future file-delivery design:** delivery manifests and audit events must remain payload-free and avoid filenames, paths, URLs, raw provider responses, prompt/AI output, tokens, and secrets. Keep exact item/version summaries protected and redact operational logs.
- All APIs/streams use `Cache-Control: no-store`, `Pragma: no-cache`, no shared CDN/browser cache, bounded pagination, rate limits, request size caps, strict schemas, generic errors, and audit-safe correlation IDs. Do not log request/response bodies or authorization headers. Scrub error reporting and AI traces.
- Proposal lifecycle: `prepared → queued → delivered → viewed`; terminal alternatives `declined`, `failed`, `expired`, `revoked`, `deleted`. Persist transitions as immutable events; derive current status rather than rewriting the history. State transitions are idempotent and monotonic. A failure before object commit creates no visible delivery. A failure after object write but before commit deletes/quarantines the orphan; a retry uses the same idempotency key and cannot create duplicate visible records. Never expose partial/multipart content.
- For the approved text slice, unsent approval is unusable after 24 hours and delivered text/digest are erased at 7 days by an explicit purge call or when an expired recipient read triggers erasure; reads deny at the expiry boundary. The future file path still needs its own retention/privacy approval. Audit metadata retention is distinct from content retention and is disclosed above.

## Received-space UX and initiation directions

A shared space remains in a dedicated **Received spaces** collection with owner attribution (“Espacio de Alex”). A delivered item appears as a clearly labeled received artifact/response under that relationship; it does not silently import into the recipient's owned workspace, connector, or default AI context. Any later “add to my context” action would need its own explicit user action, provenance label, and separately reviewed import flow.

Either member may initiate a request. The actual recipient approves or declines and may explicitly send reviewed text back to the initiator in either direction. The shared-space owner remains the only person who can authorize access to source items; reversing request direction never reverses ownership or bypasses relationship/entitlement checks. Do not allow the requester to impersonate the recipient or provide a source locator that the service fetches before consent.

## Proposed schema, API, and tests (partly implemented for text only)

The text-only reviewed-response slice uses forward-only `0056_team_text_deliveries.sql`: private `team_delivery_private` tables hold text and payload-free audit events; no role, including `service_role`, receives direct table grants. Service-only public RPC wrappers recheck exact accepted relationship, turn, entitlement, sender/recipient roles and bounds. The accepted turn's recipient/approver explicitly sends to its initiator in either conversation direction; send/read are not production-ready until the schema baseline is separately verified and the migration is approved and applied. A purge endpoint erases expired text and digest when invoked; no cron schedule is included. Reads deny access at the exact expiry boundary. No file storage, picker, AI generation, or notification/UI is included.

Do not edit/replay earlier migrations. Any future file path still needs separate private object storage and its own schema/API/security review; the text migration is not a substitute.

Candidate authenticated routes, subject to API review:

- Implemented source-only text slice: `POST /api/team/conversations/{threadId}/turns/{turnId}/delivery` accepts only bounded text explicitly sent by the accepted turn's recipient/approver to its initiator, in either conversation direction; `GET /api/team/deliveries?threadId=...` lists recipient-only opaque metadata; `GET /api/team/deliveries/{deliveryId}` reads content after database reauthorization. No UI or automatic notification is included.

- Future file-delivery `POST /api/team/conversations/{threadId}/turns/{turnId}/deliveries`: source-owner-only create after accepted turn; strict selected-reference manifest, server-resolved source check, idempotency key, final consent/version confirmation.
- `GET /api/team/deliveries/{deliveryId}`: participant-scoped metadata only, with relationship/entitlement/expiry recheck.
- `GET /api/team/deliveries/{deliveryId}/items/{itemId}`: authenticated server stream only; recheck before stream, no-store, no redirect to an external or public object URL; append view/download event after successful response semantics are defined.
- Internal worker operation for scanning/transferring only; never directly callable by browser. Every retry rechecks authorization and exact immutable manifest.

For the text slice, unit + PGlite + route tests cover accepted/old/pending/revoked/ineligible turns, exact idempotent retries, 64 KiB bounds, both conversation directions, role checks, expiry deletion, private grants, no-store, and response-field redaction. Before production, separately add staged two-account smoke; configure the hourly schedule only after migration, `CRON_SECRET`, and Vercel cron capability are verified. The still-proposed file path requires the broader checks listed here: no source read before final consent; exact item/version only; owner/counterparty role enforcement; revocation races; cross-user/cross-space IDOR; MIME spoofing/malware/encrypted formats; partial upload/orphan cleanup; expiry/deletion retries; and received-space isolation. Current approval endpoints remain metadata-only; the new text endpoint is the only separate payload path.

## Rollout gates and non-goals

1. Keep `TEAM_FEATURE_ENABLED` off. Current production history previously showed 0039–0055 missing; recheck live state only through approved read-only procedure. No production migrations were run for this proposal.
2. Separately approve privacy/retention, artifact allowlist/size caps, malware scanning, legal/user-facing consent copy, provider API scopes, and incident/deletion handling.
3. Implement migration/API/storage in a separate reviewed PR after schema baseline and backup/restore gates; apply forward-only migrations only under explicit production change approval and the existing runbook.
4. Unit/SQL/route tests and staged two-account smoke must pass for both initiation directions, decline, expiry, revocation, exact artifact visibility, and no pre-approval reads. Verify caches/logs do not expose payloads.
5. Only after schema, tests, security review, and authenticated smoke are evidenced may the operator consider the server-only `TEAM_FEATURE_ENABLED=1` gate, with separate deployment/smoke confirmation. Keep paid checkout disabled; this design creates no Stripe products/prices/customers/charges and does not change Pro/Max.

**Out of scope:** automatic context scraping, arbitrary URL fetches, broad shared-drive access, approval-as-access, email/file attachment delivery, public/permanent links, automatic import into owned spaces, external sharing, payments, production migration execution, and changing current Team runtime.
