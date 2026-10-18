# Team post-approval delivery protocol (design proposal)

**Status: proposal only — not implemented, not approved for production, and not an authorization to transfer data.**

This design addresses a future internal delivery channel for a Team request after its recipient explicitly approves it. It does not change current Team behavior, create a payload channel, or authorize a Supabase migration, feature activation, deployment, or payment work.

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
3. **Source owner selects the exact release.** After approval, the recipient/source owner explicitly selects individual supported artifacts from a visible picker or writes/pastes a bounded response. The AI must not crawl a workspace, infer nearby documents, expand folders, follow links, or select additional content. Selection is per item/version, not “all context.” If an AI-generated answer is requested, the owner reviews the bounded answer and explicitly presses **Send**; generation alone is not delivery consent.
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
- Delivery rows and audit events are append-only. Use a stable opaque ID, exact thread/turn/relationship IDs, sender/recipient IDs, manifest digest, item count/size/type summary, timestamps, state/event, expiry, and deletion marker. Do not place file contents, full filenames, paths, URLs, raw provider responses, prompt/AI output, tokens, or secrets in audit logs. Where display labels are needed in UI, keep them in the protected delivery manifest and redact them from operational logs.
- All APIs/streams use `Cache-Control: no-store`, `Pragma: no-cache`, no shared CDN/browser cache, bounded pagination, rate limits, request size caps, strict schemas, generic errors, and audit-safe correlation IDs. Do not log request/response bodies or authorization headers. Scrub error reporting and AI traces.
- Proposal lifecycle: `prepared → queued → delivered → viewed`; terminal alternatives `declined`, `failed`, `expired`, `revoked`, `deleted`. Persist transitions as immutable events; derive current status rather than rewriting the history. State transitions are idempotent and monotonic. A failure before object commit creates no visible delivery. A failure after object write but before commit deletes/quarantines the orphan; a retry uses the same idempotency key and cannot create duplicate visible records. Never expose partial/multipart content.
- Proposed retention pending privacy/legal approval: undelivered staging expires after 24 hours; delivered content expires after 7 days unless a clearly described, explicit retention choice is approved. Expiry/revocation hides content immediately; asynchronous deletion retries are observable without logging contents. Do not ship these durations until the product/privacy owner approves them.

## Received-space UX and initiation directions

A shared space remains in a dedicated **Received spaces** collection with owner attribution (“Espacio de Alex”). A delivered item appears as a clearly labeled received artifact/response under that relationship; it does not silently import into the recipient's owned workspace, connector, or default AI context. Any later “add to my context” action would need its own explicit user action, provenance label, and separately reviewed import flow.

Either member may initiate a request. The actual recipient/source owner approves or declines; only that source owner can select source items and send them. Reversing direction does not reverse ownership or bypass the same checks. Do not allow requester to impersonate the source owner or provide a source locator that the service fetches before consent.

## Proposed schema, API, and tests (not implemented)

After the current metadata-only chain is separately verified and the production change is approved, design a new forward-only migration (tentatively `0056_team_deliveries.sql`, subject to actual migration history). Do not edit/replay earlier migrations. Candidate private tables: `team_deliveries` (immutable intent + binding + manifest digest + state summary/expiry), `team_delivery_items` (opaque provider reference/version/digest/type/size, no bytes), and append-only `team_delivery_events`; payload bytes remain in private object storage. Add service-only functions that lock/revalidate exact invitation, entitlement, accepted turn and sender/recipient roles for each operation. Avoid broad user-readable RLS policies or direct client RPCs.

Candidate authenticated routes, subject to API review:

- `POST /api/team/conversations/{threadId}/turns/{turnId}/deliveries`: source-owner-only create after accepted turn; strict selected-reference manifest, server-resolved source check, idempotency key, final consent/version confirmation.
- `GET /api/team/deliveries/{deliveryId}`: participant-scoped metadata only, with relationship/entitlement/expiry recheck.
- `GET /api/team/deliveries/{deliveryId}/items/{itemId}`: authenticated server stream only; recheck before stream, no-store, no redirect to an external or public object URL; append view/download event after successful response semantics are defined.
- Internal worker operation for scanning/transferring only; never directly callable by browser. Every retry rechecks authorization and exact immutable manifest.

Before merging implementation, add unit + SQL integration + route tests for: unapproved/declined/expired turn cannot resolve a source; no source read before final consent; exact item/version only (no folder expansion); owner/counterparty role enforcement both directions; revoked/expired invitation and entitlement at create/read/stream; revoke-vs-send race; replay/idempotency and manifest tampering; cross-user/cross-space IDOR; oversize and MIME spoofing; malware/encrypted/unsupported file rejection; partial upload/orphan cleanup; expiry/deletion retries; no-store headers; payload/URL/secret redaction in logs/errors; received-space isolation; cache/CDN bypass; and unchanged current metadata-only projection. Tests must prove current approval endpoints remain metadata-only until a separately reviewed delivery implementation is deployed.

## Rollout gates and non-goals

1. Keep `TEAM_FEATURE_ENABLED` off. Current production history previously showed 0039–0055 missing; recheck live state only through approved read-only procedure. No production migrations were run for this proposal.
2. Separately approve privacy/retention, artifact allowlist/size caps, malware scanning, legal/user-facing consent copy, provider API scopes, and incident/deletion handling.
3. Implement migration/API/storage in a separate reviewed PR after schema baseline and backup/restore gates; apply forward-only migrations only under explicit production change approval and the existing runbook.
4. Unit/SQL/route tests and staged two-account smoke must pass for both initiation directions, decline, expiry, revocation, exact artifact visibility, and no pre-approval reads. Verify caches/logs do not expose payloads.
5. Only after schema, tests, security review, and authenticated smoke are evidenced may the operator consider the server-only `TEAM_FEATURE_ENABLED=1` gate, with separate deployment/smoke confirmation. Keep paid checkout disabled; this design creates no Stripe products/prices/customers/charges and does not change Pro/Max.

**Out of scope:** automatic context scraping, arbitrary URL fetches, broad shared-drive access, approval-as-access, email/file attachment delivery, public/permanent links, automatic import into owned spaces, external sharing, payments, production migration execution, and changing current Team runtime.
