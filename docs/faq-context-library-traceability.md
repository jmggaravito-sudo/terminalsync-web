# FAQ Context Library — traceability and launch matrix

Status: **editorial/code-backed draft; PR #2220 installation and physical smoke remain pending**.

App contract reviewed at merge commit `05f636ff8639cde6be337f2597ebc7b4559c01e3` (`feat(context): scalable source library modal (#2220)`). This document is internal traceability; it is not customer-facing copy.

## Public FAQ claims and evidence

| FAQ topic | Claim in `src/content/faq.ts` | Code-backed evidence | Boundary |
| --- | --- | --- | --- |
| Open library | `Choose sources` opens the source library; older builds may show `View all`; missing both means the version may not include it. | PR #2239 adds the `chooseSources` access label; `ContextPanel.tsx` opens `ContextLibraryModal`. | No claim that the installed build has PR #2220/#2236/#2239. |
| Search and pages | Search matches title/URI; type/status filters; 50 rows per page. | `ContextLibraryModal.tsx`: query/kind/status filters, `PAGE_SIZE = 50`. | Search/filter alone does not apply a selection. |
| Mark sources | Selectable rows use checkboxes; detected-only rows are not selectable; current enabled count and unapplied draft are shown. | PR #2236: `appliedCount`, `draft`, `notSelectable`; `ContextLibraryModal.tsx`: `source.selectable`, draft IDs. | A draft selection does not change the next turn until Apply. |
| Available/included/used/cited | Available is inventory/readiness; included is applied workspace scope; used is actual per-turn content; cited is an answer pointer. | PR #2234 copy: status shows available content, not what the AI used in a reply; citation UI supplies `View this source`. | Do not imply every available or included source is used or cited. |
| Apply versus share | Apply changes included sources in this workspace; Share opens a review and sends compatible sources as copies to another owned workspace. | PR #2236 review panel, `apply()` add/remove ordering, `onShare()` dispatch, `SHAREABLE_KINDS` limits sharing. | Do not say every source is shareable or that sharing moves the original. |
| Retention/change/isolation | Source state is shown; retry/remove/pause controls exist only when backend supplies them; selection is scoped to the workspace. | `ContextLibraryModal.tsx` receives `terminalId`, `workspacePath`, `retryable`, `removable`, `pausable`; `ContextPanel.tsx` owns snapshot per terminal. | No promise of automatic reread or cross-workspace inheritance. |
| Reading status | `Reading not confirmed` means detected without confirmed usable reading; for an image it is not an OCR claim. | `sourceStatusLabel()` maps `name_only` to `detectedOnly`; panel does not infer OCR. | Do not say image processed, OCR'd, or readable by default. |
| Citations | `View this source` locates the source row; exact fragment jump is not promised. | Existing citation reveal opens the library/group and scrolls to the row, not a guaranteed source fragment. | Do not promise exact-fragment navigation or all broken citations fixed. |
| Limits | FAQ retains verified extraction/download/read limits and estimated 24,000-token pack budget. | Existing release audit and FAQ regression tests. | These are read/extraction/pack budgets, not universal model or plan limits. |

## Tool and capability matrix

| Capability | What it does | How to access | Requirements | Read vs write / confirmation | Evidence now | Pending |
| --- | --- | --- | --- | --- | --- | --- |
| Native Context library | Review, filter, mark, apply, retry, pause, remove, or share eligible sources. | Context → `View all` / `Library`. | Build must include PR #2220; workspace context inventory must load. | Search/filter/read state are non-mutating; Apply, pause, remove, retry, and share change workspace state or trigger a share flow. No installed confirmation behavior claimed here. | Source code at PR #2220; existing unit tests. | Installed build, accessibility/visual flow, multi-page behavior, cross-workspace share smoke. |
| Native Context sources | Add/read documents, web, pasted text, books, generated material, folders, memory, recipes, and integrations according to each backend state. | Context → Add context and source rows. | Source-specific path, permissions, readiness, and limits. | Reading is source-specific; remove/pause/retry controls appear only when backend declares them. | Existing app code and FAQ limits audit. | Do not certify every source family, repo strict mode, or all citation navigation. |
| Connectors | Let the AI interact with an external service. | Integrations / connector catalog. | Account plus OAuth/API key/permissions as the service requires. | Read/write varies by connector; publishing, spending, or destructive actions require explicit product approval where implemented. | Existing FAQ/catalog source and prior audit matrix. | Per-connector physical smoke and current availability; no connector is universally certified by this FAQ PR. |
| Skills | Add a guided way of working or instructions for a task. | Integrations / Skills catalog. | Skill must be available and may have its own inputs or connected tools. | Instructions are not the same as external write access; any action follows the tool/connector contract. | Existing catalog source. | Per-skill execution and result smoke; do not imply every skill is installed. |
| CLI tools | Cover technical tasks that require installation and sign-in. | Integrations / CLI Tools catalog. | Installation and account/authentication as shown by the tool. | May read/write/run commands; confirmation and safe scope are tool-specific. | Existing public FAQ wording. | Installation, auth, and platform smoke; not part of the Context Library certification. |

## Practical evidence boundary

The supplied Context evidence packet associated with `315c63ed6` is recorded as bounded evidence, not as a blanket feature certification:

| Case | Status | FAQ consequence |
| --- | --- | --- |
| Editing a pasted source, clicking a citation, and workspace isolation | **PASS (supplied targeted evidence)** | It is safe to explain the tested path only; do not generalize to every source family or every citation target. |
| Applying a paused source | **FAIL / open** | The FAQ explicitly says not to assume Apply succeeded when the source is paused or an error is shown. No “paused Apply works” claim. |
| Long partial-content source in the UI | **PENDING** | Keep the partial-content limit in copy, but do not claim the full long-source UI flow is physically verified. |

## Vigente versus pendiente

- **Vigente in the public copy:** Context source states, verified limits, existing Context selection/reading concepts, and the distinction between applying and sharing.
- **Pending deploy/installation:** The scalable library UI and follow-ups from PR #2220, #2236, #2239, and #2234, including `Choose sources`, details/review before share, current-versus-draft counts, search, filters, pagination, page selection, and library-level Apply/Share controls.
- **Explicitly unsupported/not certified:** remote repository indexing, strict repos in Solo Contexto, automatic OCR claims, exact citation-fragment jumps, universal support for every Context type, and installed-build behavior before the physical smoke.

## Required evidence for future physical smoke

Record title/build/beacon and exact app SHA first. Then verify with an innocuous fixture:

1. Open the library and find a unique marker by search.
2. Page past 50 entries and verify page-local selection.
3. Apply one selection and confirm the next normal answer uses it.
4. Share one compatible source to a second owned workspace and confirm the original remains.
5. Trigger a source problem/change and verify Retry only when offered.
6. Verify `Reading not confirmed` does not produce a claim of OCR/processed image.
7. Open a citation and record source-row reveal only; do not call it fragment navigation.
8. Repeat with a second workspace to prove selection and content isolation.

No flags, credentials, purchases, real connector mutations, n8n changes, or remote repository access belong in this smoke.
