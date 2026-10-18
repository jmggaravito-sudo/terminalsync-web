import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const source = readFileSync(join(process.cwd(), "src/app/[lang]/team/TeamConversationPanel.tsx"), "utf8");

describe("Team conversation UI contract", () => {
  it("keeps v3 separate from legacy requests and uses explicit no-store API actions", () => {
    expect(source).toContain('authedFetch("/api/team/conversations?limit=50"');
    expect(source).toContain('authedFetch("/api/team/conversations"');
    expect(source).toContain('"/api/team/conversations/turns/respond"');
    expect(source).not.toContain('"/api/team/requests/respond"');
    expect(source).toContain('cache: "no-store"');
    expect(source).toContain('referrerPolicy: "no-referrer"');
    expect(source).toContain('onSubmit={(event) => void submit(event)}');
    expect(source).not.toContain("localStorage");
    expect(source).not.toContain("sessionStorage");
  });

  it("has no free-text turn metadata and offers retry for a transient list failure", () => {
    expect(source).toContain("Cantidad de elementos (opcional)");
    expect(source).toContain("This request sends only the type and, optionally, a count.");
    expect(source).not.toContain("Etiqueta breve");
    expect(source).not.toContain("Categoría (opcional)");
    expect(source).not.toContain("draft.label");
    expect(source).not.toContain("draft.category");
    expect(source).toContain('if (response.status === 404)');
    expect(source).not.toContain('response.status === 404 || response.status === 503');
    expect(source).toContain('loadError ? <div role="alert">');
  });

  it("binds prepared payloads to a keyed target/draft epoch and locks all mutable form controls", () => {
    expect(source).toContain("formEpoch");
    expect(source).toContain("draftRevisionRef");
    expect(source).toContain("canCommitPreparedTurn");
    expect(source).toContain("key={`initial:${initialTarget.formEpoch}`}");
    expect(source).toContain("key={`followup:${followUpTarget.formEpoch}`}");
    expect(source).toContain("disabled={busy || interactionLocked}");
    expect(source).toContain("requestOperationRef");
    expect(source).toContain("onOperationChange(formEpoch, attempt, false)");
  });

  it("keeps both start paths, scopes response cleanup to each turn, and confirms the matching thread", () => {
    expect(source).toContain("relationshipId: target.relationshipId");
    expect(source).toContain("relationshipId: null");
    expect(source).toContain('{turn.threadId === openedThread.threadId && turn.direction === "inbound" && turn.status === "pending" && turn.canRespond ? <section');
    expect(source).toContain('turn.direction === "inbound" && turn.status === "pending"');
    expect(source).toContain("respondingTurns");
    expect(source).toContain("inFlightResponseAttempts");
    expect(source).not.toContain("respondingTurnId");
    expect(source).not.toContain("responseOperations");
    expect(source).toContain("canClearResponseAttempt");
    expect(source).toContain("confirmation.threadId !== turn.threadId");
    expect(source).toContain("response.status === 409");
    expect(source).toContain("threadLoadSequence");
    expect(source).toContain("const mayCommit");
  });

  it("uses explicit safe load-more actions rather than silently truncating opaque cursors", () => {
    expect(source).toContain("parseConversationThreadPage");
    expect(source).toContain("parseConversationTurnPage");
    expect(source).toContain("beforeActivityAt");
    expect(source).toContain("beforeCreatedAt");
    expect(source).toContain("Cargar más conversaciones");
    expect(source).toContain("Cargar más solicitudes");
    expect(source).toContain("threadNextCursor");
    expect(source).toContain("turnNextCursor");
  });

  it("keeps delivery UI in a separate accepted-turn component and never offers uploads", () => {
    expect(source).not.toContain('type="file"');
    expect(source).not.toContain("Enviar documento");
    expect(source).toContain("TeamTextDeliveryPanel");
    expect(source).toContain("<TeamTextDeliveryPanel");
    expect(source).not.toContain("<code>{turn.id}");
    expect(source).not.toContain("<code>{turn.threadId}");
    expect(source).not.toContain("{prepared.manifestHash}");
  });
});
