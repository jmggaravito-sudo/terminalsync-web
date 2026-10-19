# Video refund authority — PR #523 / desktop #2689

## Trust boundary

A client requests reconciliation, never attests failure or chooses the amount.
`POST /api/credits/video-evidence` is private to n8n. Every call requires the
independent `x-ts-video-evidence` Header Auth credential. `reserve` additionally
validates the initiating user's Supabase Bearer JWT against the exact quote owner.
The orchestration code fixes `design-video:<quoteId>` and a deterministic job ID.
A single reservation permits one provider submission; repeated submissions fail closed.
The returned provider prediction becomes immutable. Only raw provider `failed` or
`completed`, fetched by n8n from that prediction's result URL, can finalize it.
Unknown jobs, client metadata, local deadlines, missing downloads, or import errors
cannot attest failure. Submission errors without an accepted prediction remain pending.

`record_ai_credit_refund` locks the account and evidence and requires a failed job
bound to the requesting user and original debit. It credits actual debit minus the
original debit RPC's server-computed overdraft. Client amount is only a validated
compatibility hint. Duplicate/concurrent requests cannot credit twice. Verified
refunds have a foreign key to evidence; historical refunds are not reclassified.
The app does not mint local refunds: it requests reconciliation and consumes only
server-confirmed entries through ordinary ledger synchronization.

## Operator gates — NOT performed by this PR

1. Verify that 0057 has not already been applied; apply the reviewed exact migration
   through the normal migration process. If a different 0057 exists, stop: do not
   rerun, overwrite history, or backfill historical evidence/balances.
2. Provision a new private high-entropy value as Vercel
   `VIDEO_REFUND_EVIDENCE_SECRET` (minimum 32 characters) and n8n Header Auth
   `TerminalSync Video Refund Evidence`, name `x-ts-video-evidence`.
   Values must stay only in the authorized secret stores, never source or logs.
3. Deploy web only after schema prerequisites. Existing ledger route now selects
   `verified_video_job_id`: deploying against an unmigrated schema fails closed.
4. Snapshot, clone and import desktop PR #2689's workflow source; select the new
   credential on all three Evidence HTTP nodes. Do not replace provider credentials.
   Verify reserve fails closed before WaveSpeed when private auth or user auth fails.
5. Coordinate app release (JWT on `/jobs`) and workflow cutover. Old clients lack
   that JWT and must not be allowed to submit through the new gate. Keep workflow
   execution storage/access restricted: incoming authorization is sensitive; do not
   pin or share execution request headers. Confirm CORS accepts Authorization.
6. Physical/live smoke needs separate authorization. These local tests do not
   certify a deployed workflow or provider behavior. No merge/deploy is authorized
   by test completion. For missing/uncertain/historical evidence, reconcile manually;
   never credit, migrate, or delete by inference.

## Isolated reproducible tests

`python3 scripts/test-credit-refunds-sql.py` requires native PostgreSQL binaries
(`REFUND_TEST_PG_BIN` override). It creates a fresh disposable cluster with TCP off,
synthetic accounts, and explicit Unix socket connection flags. It executes exact
0027, 0033, **0057**, and uses eight separate connections for concurrency. It accepts
no production DSN and removes its own cluster after stopping it.

`npx vitest run src/app/api/credits` covers private writer authentication, user
binding, validation, reconciliation responses and filtering legacy ledger entries.
No provider request or paid generation is needed.

## Results on 2026-10-18 (local, not deployment certification)

- Exact SQL0057 SHA256 `e541d8e4848f1db146d2110cfa10b6cd72f05d2be56847e76532ceee65dfb3b4`.
- Native PostgreSQL18.4: **26/26** checks, including eight separate concurrent
  connections, owner/state/legacy rejection, amount/overdraft limits and privileges.
- API credits: **83/83** Vitest tests; TypeScript noEmit passes.
- Existing video-funding SQL and quote-checkout SQL suites pass.
- No production connections, credentials configured, migrations applied, provider
  submissions, funds moved, merge or deployment in this verification.
