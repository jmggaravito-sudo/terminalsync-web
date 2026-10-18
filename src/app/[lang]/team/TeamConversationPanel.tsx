"use client";

import { type FormEvent, useCallback, useEffect, useId, useRef, useState } from "react";
import { authedFetch } from "@/lib/supabase/browser";
import type { ReceivedInvitation } from "./receivedSpaces";
import {
  canCommitConversationThreadLoad,
  createConversationOperationId,
  parseConversationTargets,
  parseConversationThreads,
  parseConversationTurnConfirmation,
  parseConversationTurns,
  prepareConversationTurn,
  type ConversationDecision,
  type ConversationDraft,
  type PreparedConversationTurn,
  type ConversationTarget,
  type ConversationThread,
  type ConversationTurn,
} from "./teamConversationClient";
import type { OwnedTeamSpace } from "./teamSharedSpaces";
import { receivedSpaceLabel } from "./receivedSpaces";

type InitialTarget = {
  spaceId: string;
  relationshipId: string | null;
  label: string;
};

type Props = {
  lang: string;
  ownedSpaces: OwnedTeamSpace[];
  receivedSpaces: ReceivedInvitation[];
  onUnauthorized: () => void;
};

const emptyDraft = (): ConversationDraft => ({ kind: "context", itemCount: "" });

function text(es: boolean, spanish: string, english: string): string {
  return es ? spanish : english;
}

function metadataSummary(turn: ConversationTurn, es: boolean): string {
  const parts = [turn.kind === "document" ? text(es, "Documento", "Document") : text(es, "Contexto", "Context")];
  if (turn.metadata.itemCount !== undefined) parts.push(`${text(es, "Elementos", "Items")}: ${turn.metadata.itemCount}`);
  return parts.join(" · ");
}

function ConversationRequestForm({ lang, title, onSubmit, onCancel }: {
  lang: string;
  title: string;
  onSubmit: (prepared: PreparedConversationTurn) => Promise<void>;
  onCancel: () => void;
}) {
  const es = lang === "es";
  const kindId = useId();
  const countId = useId();
  const [draft, setDraft] = useState<ConversationDraft>(emptyDraft);
  const [prepared, setPrepared] = useState<PreparedConversationTurn | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(null);
    try {
      // Retain the exact operation ID and commitment only in component memory
      // if a request times out. Retrying unchanged metadata is idempotent;
      // editing any field below deliberately creates a new operation instead.
      const request = prepared ?? await prepareConversationTurn(draft);
      setPrepared(request);
      await onSubmit(request);
      setPrepared(null);
      setDraft(emptyDraft());
    } catch {
      setError(text(es, "No pudimos enviar la solicitud. Intenta de nuevo.", "We couldn't send the request. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  return <section aria-label={title} style={{ border: "1px solid #a8c5ed", borderRadius: 12, padding: "1rem", marginTop: ".75rem" }}>
    <h4>{title}</h4>
    <p>{text(es, "Esta solicitud solo envía el tipo y, opcionalmente, una cantidad. No incluye campos de texto, enlaces, rutas, documentos ni contenido.", "This request sends only the type and, optionally, a count. It has no text fields, links, paths, documents, or content.")}</p>
    <form onSubmit={(event) => void submit(event)}>
      <label htmlFor={kindId}>{text(es, "Tipo de solicitud", "Request type")}</label>
      <select id={kindId} value={draft.kind} onChange={(event) => { setPrepared(null); setDraft((current) => ({ ...current, kind: event.target.value === "document" ? "document" : "context" })); }}>
        <option value="context">{text(es, "Contexto", "Context")}</option>
        <option value="document">{text(es, "Documento", "Document")}</option>
      </select>
      <label htmlFor={countId} style={{ display: "block", marginTop: ".75rem" }}>{text(es, "Cantidad de elementos (opcional)", "Item count (optional)")}</label>
      <input id={countId} value={draft.itemCount} onChange={(event) => { setPrepared(null); setDraft((current) => ({ ...current, itemCount: event.target.value })); }} inputMode="numeric" pattern="[0-9]*" maxLength={7} autoComplete="off" />
      <div style={{ display: "flex", flexWrap: "wrap", gap: ".75rem", marginTop: ".85rem" }}>
        <button type="submit" disabled={busy}>{busy ? text(es, "Enviando…", "Sending…") : text(es, "Enviar solicitud para aprobación", "Send request for approval")}</button>
        <button type="button" disabled={busy} onClick={onCancel}>{text(es, "Cancelar", "Cancel")}</button>
      </div>
    </form>
    {error ? <p role="alert">{error}</p> : null}
  </section>;
}

/**
 * A deliberately small v3 client: all mutating calls are tied to an explicit
 * form/button. The backend still makes the authorization decision and does
 * not deliver a document or context when a turn is approved.
 */
export function TeamConversationPanel({ lang, ownedSpaces, receivedSpaces, onUnauthorized }: Props) {
  const es = lang === "es";
  const [available, setAvailable] = useState<boolean | null>(null);
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [targets, setTargets] = useState<Record<string, ConversationTarget[]>>({});
  const [targetBusySpaceId, setTargetBusySpaceId] = useState<string | null>(null);
  const [targetError, setTargetError] = useState<string | null>(null);
  const [initialTarget, setInitialTarget] = useState<InitialTarget | null>(null);
  const [openedThread, setOpenedThread] = useState<ConversationThread | null>(null);
  // A selected thread and its fetch must move together. A late response for
  // thread A must never populate approval cards under the header for B.
  const openedThreadRef = useRef<ConversationThread | null>(null);
  const threadLoadSequence = useRef(0);
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [turnsLoading, setTurnsLoading] = useState(false);
  const [turnsError, setTurnsError] = useState<string | null>(null);
  const [followUpThreadId, setFollowUpThreadId] = useState<string | null>(null);
  const [respondingTurnId, setRespondingTurnId] = useState<string | null>(null);
  const [responseOperations, setResponseOperations] = useState<Record<string, string>>({});

  const loadThreads = useCallback(async () => {
    setLoadError(null);
    try {
      const response = await authedFetch("/api/team/conversations?limit=50", {
        cache: "no-store",
        referrerPolicy: "no-referrer",
      });
      if (response.status === 401) {
        onUnauthorized();
        return;
      }
      // This UI is intentionally independently deployable from v3. An older
      // deployment may not have its API yet, and must keep legacy Team cards usable.
      if (response.status === 404) {
        setAvailable(false);
        return;
      }
      if (!response.ok) throw new Error("threads");
      setThreads(parseConversationThreads(await response.json().catch(() => null)));
      setAvailable(true);
    } catch {
      setAvailable(true);
      setLoadError(text(es, "No pudimos cargar las conversaciones. Intenta de nuevo.", "We couldn't load conversations. Please try again."));
    }
  }, [es, onUnauthorized]);

  useEffect(() => { void loadThreads(); }, [loadThreads]);

  async function loadTargets(space: OwnedTeamSpace) {
    setTargetBusySpaceId(space.id); setTargetError(null);
    try {
      // Required by the current read-only target endpoint. This opaque ID is
      // never rendered and referrerPolicy prevents URL leakage.
      const response = await authedFetch(`/api/team/conversations/targets?spaceId=${encodeURIComponent(space.id)}`, {
        cache: "no-store",
        referrerPolicy: "no-referrer",
      });
      if (response.status === 401) {
        onUnauthorized();
        return;
      }
      if (!response.ok) throw new Error("targets");
      const parsed = parseConversationTargets(await response.json().catch(() => null))
        .filter((target) => target.spaceId === space.id);
      setTargets((current) => ({ ...current, [space.id]: parsed }));
    } catch {
      setTargetError(text(es, "No pudimos cargar participantes aceptados. Intenta de nuevo.", "We couldn't load accepted participants. Please try again."));
    } finally {
      setTargetBusySpaceId(null);
    }
  }

  async function openThread(thread: ConversationThread, { onlyIfCurrent = false }: { onlyIfCurrent?: boolean } = {}) {
    if (onlyIfCurrent && openedThreadRef.current?.threadId !== thread.threadId) return;
    const loadSequence = ++threadLoadSequence.current;
    openedThreadRef.current = thread;
    setOpenedThread(thread); setFollowUpThreadId(null); setTurns([]); setTurnsError(null); setTurnsLoading(true);
    const mayCommit = () => canCommitConversationThreadLoad(
      threadLoadSequence.current,
      loadSequence,
      openedThreadRef.current?.threadId ?? null,
      thread.threadId,
    );
    try {
      const response = await authedFetch(`/api/team/conversations/${encodeURIComponent(thread.threadId)}/turns?limit=50`, {
        cache: "no-store",
        referrerPolicy: "no-referrer",
      });
      if (response.status === 401) {
        if (mayCommit()) onUnauthorized();
        return;
      }
      if (!response.ok) throw new Error("turns");
      const parsed = parseConversationTurns(await response.json().catch(() => null))
        .filter((turn) => turn.threadId === thread.threadId);
      if (!mayCommit()) return;
      setTurns(parsed);
    } catch {
      if (mayCommit()) setTurnsError(text(es, "No pudimos cargar las solicitudes de esta conversación. Intenta de nuevo.", "We couldn't load this conversation's requests. Please try again."));
    } finally {
      if (mayCommit()) setTurnsLoading(false);
    }
  }

  async function createInitialTurn(target: InitialTarget, prepared: PreparedConversationTurn) {
    const response = await authedFetch("/api/team/conversations", {
      method: "POST",
      body: JSON.stringify({
        spaceId: target.spaceId,
        relationshipId: target.relationshipId,
        kind: prepared.kind,
        manifestHash: prepared.manifestHash,
        metadata: prepared.metadata,
        operationId: prepared.operationId,
      }),
      cache: "no-store",
      referrerPolicy: "no-referrer",
    });
    if (response.status === 401) {
      onUnauthorized();
      throw new Error("unauthorized");
    }
    const confirmation = parseConversationTurnConfirmation(await response.json().catch(() => null));
    if (response.status === 409) {
      await loadThreads();
      throw new Error("initial-conflict");
    }
    if (!response.ok || !confirmation) throw new Error("initial");
    setInitialTarget(null);
    await loadThreads();
  }

  async function createFollowUpTurn(thread: ConversationThread, prepared: PreparedConversationTurn) {
    const response = await authedFetch(`/api/team/conversations/${encodeURIComponent(thread.threadId)}/turns`, {
      method: "POST",
      body: JSON.stringify({
        kind: prepared.kind,
        manifestHash: prepared.manifestHash,
        metadata: prepared.metadata,
        operationId: prepared.operationId,
      }),
      cache: "no-store",
      referrerPolicy: "no-referrer",
    });
    if (response.status === 401) {
      onUnauthorized();
      throw new Error("unauthorized");
    }
    const confirmation = parseConversationTurnConfirmation(await response.json().catch(() => null));
    if (response.status === 409) {
      await openThread(thread, { onlyIfCurrent: true });
      throw new Error("follow-up-conflict");
    }
    if (!response.ok || !confirmation || confirmation.threadId !== thread.threadId) throw new Error("follow-up");
    if (openedThreadRef.current?.threadId === thread.threadId) {
      setTurns((current) => [confirmation, ...current.filter((turn) => turn.id !== confirmation.id)]);
      setFollowUpThreadId(null);
    }
    await loadThreads();
  }

  async function respondToTurn(turn: ConversationTurn, decision: ConversationDecision) {
    const isCurrentThread = () => openedThreadRef.current?.threadId === turn.threadId;
    if (!isCurrentThread()) return;
    setRespondingTurnId(turn.id);
    const responseKey = `${turn.id}:${decision}`;
    let operationId: string;
    try {
      // A retry of the same terminal decision preserves its idempotency key in
      // React memory. Choosing the opposite decision is a distinct action and
      // the server will fail closed if the turn already became terminal.
      operationId = responseOperations[responseKey] ?? createConversationOperationId();
      setResponseOperations((current) => current[responseKey] ? current : { ...current, [responseKey]: operationId });
      const response = await authedFetch("/api/team/conversations/turns/respond", {
        method: "POST",
        body: JSON.stringify({ turnId: turn.id, decision, operationId }),
        cache: "no-store",
        referrerPolicy: "no-referrer",
      });
      if (response.status === 401) {
        onUnauthorized();
        return;
      }
      const confirmation = parseConversationTurnConfirmation(await response.json().catch(() => null));
      if (response.status === 409) {
        const currentThread = openedThreadRef.current;
        if (currentThread?.threadId === turn.threadId) await openThread(currentThread, { onlyIfCurrent: true });
        throw new Error("response-conflict");
      }
      if (!response.ok || !confirmation || confirmation.id !== turn.id) throw new Error("respond");
      if (isCurrentThread()) setTurns((current) => current.map((item) => item.id === confirmation.id ? confirmation : item));
      setResponseOperations((current) => {
        const { [responseKey]: _discarded, ...remaining } = current;
        return remaining;
      });
    } catch {
      if (isCurrentThread()) setTurnsError(text(es, "No pudimos registrar tu decisión. Intenta de nuevo.", "We couldn't record your decision. Please try again."));
    } finally {
      setRespondingTurnId(null);
    }
  }

  return <section aria-labelledby="team-conversations-heading" style={{ marginTop: "2rem" }}>
    <h2 id="team-conversations-heading">{text(es, "Conversaciones entre espacios", "Conversations between spaces")}</h2>
    <p>{text(es, "Cada solicitud requiere un clic explícito y una aprobación independiente. Aprobarla registra consentimiento de metadatos; no envía ni entrega contenido.", "Every request needs an explicit click and an independent approval. Approval records metadata consent; it does not send or deliver content.")}</p>
    {available === null ? <p role="status">{text(es, "Cargando conversaciones…", "Loading conversations…")}</p> : null}
    {available === false ? <p role="status">{text(es, "Las conversaciones Team aún se están actualizando. Tus invitaciones y aprobaciones existentes siguen disponibles.", "Team conversations are still being updated. Your existing invitations and approvals remain available.")}</p> : null}
    {loadError ? <div role="alert"><p>{loadError}</p><button onClick={() => void loadThreads()}>{text(es, "Reintentar", "Retry")}</button></div> : null}

    {available ? <>
      {ownedSpaces.length > 0 ? <section aria-labelledby="team-owner-conversation-heading" style={{ marginTop: "1.5rem" }}>
        <h3 id="team-owner-conversation-heading">{text(es, "Iniciar desde tus espacios", "Start from your spaces")}</h3>
        <p>{text(es, "Primero elige explícitamente una relación aceptada; no se busca ni expone a personas por correo o identificador.", "First explicitly choose an accepted relationship; people are not searched or exposed by email or identifier.")}</p>
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: ".75rem" }}>
          {ownedSpaces.map((space) => <li key={space.id} style={{ border: "1px solid #d5dbea", borderRadius: 12, padding: "1rem" }}>
            <strong>{space.name}</strong>
            <div style={{ marginTop: ".75rem" }}>
              <button disabled={targetBusySpaceId === space.id} onClick={() => void loadTargets(space)}>
                {targetBusySpaceId === space.id ? text(es, "Cargando…", "Loading…") : text(es, "Ver participantes aceptados", "View accepted participants")}
              </button>
            </div>
            {targets[space.id] ? (targets[space.id].length > 0 ? <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: ".5rem", marginTop: ".75rem" }}>
              {targets[space.id].map((target) => <li key={target.relationshipId}>
                <span>{target.counterpartyAlias ?? text(es, "Miembro aceptado", "Accepted member")}</span>{" "}
                <button onClick={() => setInitialTarget({ spaceId: target.spaceId, relationshipId: target.relationshipId, label: `${space.name} · ${target.counterpartyAlias ?? text(es, "miembro aceptado", "accepted member")}` })}>{text(es, "Preparar solicitud", "Prepare request")}</button>
              </li>)}
            </ul> : <p role="status">{text(es, "No hay participantes aceptados para este espacio todavía.", "There are no accepted participants for this space yet.")}</p>) : null}
          </li>)}
        </ul>
        {targetError ? <p role="alert">{targetError}</p> : null}
      </section> : null}

      {receivedSpaces.length > 0 ? <section aria-labelledby="team-received-conversation-heading" style={{ marginTop: "1.5rem" }}>
        <h3 id="team-received-conversation-heading">{text(es, "Iniciar desde espacios recibidos", "Start from received spaces")}</h3>
        <p>{text(es, "Tú también puedes iniciar una solicitud. El dueño debe aprobar cada turno antes de que se registre la decisión.", "You can initiate a request too. The owner must approve each turn before the decision is recorded.")}</p>
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: ".75rem" }}>
          {receivedSpaces.map((space) => <li key={space.id} style={{ border: "1px solid #d5dbea", borderRadius: 12, padding: "1rem" }}>
            <strong>{receivedSpaceLabel(space, lang)}</strong>
            <div style={{ marginTop: ".75rem" }}>
              <button onClick={() => setInitialTarget({ spaceId: space.space_id, relationshipId: null, label: receivedSpaceLabel(space, lang) })}>{text(es, "Preparar solicitud", "Prepare request")}</button>
            </div>
          </li>)}
        </ul>
      </section> : null}

      {initialTarget ? <ConversationRequestForm
        title={text(es, `Nueva solicitud: ${initialTarget.label}`, `New request: ${initialTarget.label}`)}
        lang={lang}
        onSubmit={(draft) => createInitialTurn(initialTarget, draft)}
        onCancel={() => setInitialTarget(null)}
      /> : null}

      <section aria-labelledby="team-thread-list-heading" style={{ marginTop: "1.5rem" }}>
        <h3 id="team-thread-list-heading">{text(es, "Solicitudes y aprobaciones", "Requests and approvals")}</h3>
        {threads.length === 0 ? <p role="status">{text(es, "Todavía no hay conversaciones. Inicia una solicitud desde un espacio aceptado.", "There are no conversations yet. Start a request from an accepted space.")}</p> : <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: ".75rem" }}>
          {threads.map((thread) => <li key={thread.threadId} style={{ border: "1px solid #d5dbea", borderRadius: 12, padding: "1rem" }}>
            <strong>{thread.spaceName}</strong>
            <div style={{ marginTop: ".75rem" }}>
              <button onClick={() => void openThread(thread)}>{openedThread?.threadId === thread.threadId ? text(es, "Actualizar solicitudes", "Refresh requests") : text(es, "Abrir solicitudes", "Open requests")}</button>
            </div>
          </li>)}
        </ul>}
      </section>

      {openedThread ? <section aria-labelledby="team-thread-heading" style={{ marginTop: "1.5rem" }}>
        <h3 id="team-thread-heading">{text(es, `Solicitudes: ${openedThread.spaceName}`, `Requests: ${openedThread.spaceName}`)}</h3>
        {turnsLoading ? <p role="status">{text(es, "Cargando solicitudes…", "Loading requests…")}</p> : null}
        {turnsError ? <div role="alert"><p>{turnsError}</p><button onClick={() => void openThread(openedThread)}>{text(es, "Reintentar", "Retry")}</button></div> : null}
        {!turnsLoading && !turnsError ? <>
          <button onClick={() => setFollowUpThreadId(openedThread.threadId)}>{text(es, "Preparar otra solicitud", "Prepare another request")}</button>
          {followUpThreadId === openedThread.threadId ? <ConversationRequestForm
            title={text(es, "Nueva solicitud para esta conversación", "New request for this conversation")}
            lang={lang}
            onSubmit={(draft) => createFollowUpTurn(openedThread, draft)}
            onCancel={() => setFollowUpThreadId(null)}
          /> : null}
          {turns.filter((turn) => turn.threadId === openedThread.threadId).length === 0 ? <p role="status">{text(es, "No hay solicitudes en esta conversación.", "There are no requests in this conversation.")}</p> : <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: ".75rem", marginTop: ".75rem" }}>
            {turns.filter((turn) => turn.threadId === openedThread.threadId).map((turn) => <li key={turn.id} style={{ border: "1px solid #d5dbea", borderRadius: 12, padding: "1rem" }}>
              <strong>{turn.direction === "inbound" ? text(es, "Solicitud recibida", "Received request") : text(es, "Solicitud enviada", "Sent request")}</strong>
              <p>{metadataSummary(turn, es)}</p>
              {turn.threadId === openedThread.threadId && turn.direction === "inbound" && turn.status === "pending" && turn.canRespond ? <section aria-label={text(es, "Esta solicitud requiere tu aprobación", "This request requires your approval")} style={{ marginTop: ".75rem" }}>
                <p>{text(es, "Requiere tu aprobación explícita. No se transferirá contenido al aprobar.", "It needs your explicit approval. No content will transfer when you approve.")}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: ".75rem" }}>
                  <button disabled={respondingTurnId === turn.id} onClick={() => void respondToTurn(turn, "accepted")}>{respondingTurnId === turn.id ? text(es, "Guardando…", "Saving…") : text(es, "Aprobar", "Approve")}</button>
                  <button disabled={respondingTurnId === turn.id} onClick={() => void respondToTurn(turn, "declined")}>{text(es, "Rechazar", "Decline")}</button>
                </div>
              </section> : <p role="status">{turn.status === "pending"
                ? text(es, "Esperando aprobación de la otra persona.", "Waiting for the other person to approve.")
                : turn.status === "accepted"
                  ? text(es, "Aprobada. Se registró la decisión; no se entregó contenido.", "Approved. The decision was recorded; no content was delivered.")
                  : text(es, "Rechazada. No se entregó contenido.", "Declined. No content was delivered.")}</p>}
            </li>)}
          </ul>}
        </> : null}
      </section> : null}
    </> : null}
  </section>;
}

