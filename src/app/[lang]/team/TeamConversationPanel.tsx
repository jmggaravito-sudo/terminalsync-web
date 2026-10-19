"use client";

import { type FormEvent, useCallback, useEffect, useId, useRef, useState } from "react";
import { authedFetch } from "@/lib/supabase/browser";
import type { ReceivedInvitation } from "./receivedSpaces";
import {
  canClearResponseAttempt,
  canCommitConversationThreadLoad,
  canCommitPreparedTurn,
  createConversationOperationId,
  parseConversationTargets,
  parseConversationThreadPage,
  parseConversationTurnConfirmation,
  parseConversationTurnPage,
  prepareConversationTurn,
  type ConversationDecision,
  type ConversationDraft,
  type ConversationTarget,
  type ConversationThread,
  type ConversationThreadCursor,
  type ConversationTurn,
  type ConversationTurnCursor,
  type PreparedConversationTurn,
} from "./teamConversationClient";
import type { OwnedTeamSpace } from "./teamSharedSpaces";
import { receivedSpaceLabel } from "./receivedSpaces";
import { TeamTextDeliveryPanel } from "./TeamTextDeliveryPanel";

type InitialTarget = {
  spaceId: string;
  relationshipId: string | null;
  label: string;
  formEpoch: number;
};

type FollowUpTarget = {
  thread: ConversationThread;
  formEpoch: number;
};

type RequestOperation = {
  formEpoch: number;
  attempt: number;
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

function mergeUnique<T>(current: T[], next: T[], key: (item: T) => string): T[] {
  const ids = new Set(current.map(key));
  return [...current, ...next.filter((item) => !ids.has(key(item)))];
}

function responseTurnKey(turn: ConversationTurn): string {
  // This opaque client-only key is deliberately never rendered or persisted.
  return `${turn.threadId}:${turn.id}`;
}

type ConversationRequestFormProps = {
  lang: string;
  title: string;
  formEpoch: number;
  interactionLocked: boolean;
  onSubmit: (prepared: PreparedConversationTurn) => Promise<void>;
  onSucceeded: () => void;
  onCancel: () => void;
  onOperationChange: (formEpoch: number, attempt: number, active: boolean) => boolean;
};

/**
 * A metadata-only form. Prepared idempotency payloads live only in this
 * component and are scoped to its form epoch plus an exact draft revision.
 */
function ConversationRequestForm({
  lang,
  title,
  formEpoch,
  interactionLocked,
  onSubmit,
  onSucceeded,
  onCancel,
  onOperationChange,
}: ConversationRequestFormProps) {
  const es = lang === "es";
  const kindId = useId();
  const countId = useId();
  const [draft, setDraft] = useState<ConversationDraft>(emptyDraft);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const draftRevisionRef = useRef(0);
  const preparedRef = useRef<{ draftRevision: number; request: PreparedConversationTurn } | null>(null);
  const submitAttemptRef = useRef(0);
  const activeAttemptRef = useRef<number | null>(null);
  const busyRef = useRef(false);
  const latestFormEpochRef = useRef(formEpoch);
  const mountedRef = useRef(true);
  latestFormEpochRef.current = formEpoch;

  useEffect(() => () => { mountedRef.current = false; }, []);

  function updateDraft(update: (current: ConversationDraft) => ConversationDraft) {
    if (busyRef.current || interactionLocked) return;
    // Synchronously invalidate the cached operation before React schedules a
    // render, so a click in the same event turn cannot reuse old metadata.
    draftRevisionRef.current += 1;
    preparedRef.current = null;
    setDraft((current) => update(current));
    setError(null);
  }

  function isCurrentAttempt(attempt: number, draftRevision: number): boolean {
    return activeAttemptRef.current === attempt && canCommitPreparedTurn(
      latestFormEpochRef.current,
      draftRevisionRef.current,
      formEpoch,
      draftRevision,
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busyRef.current || interactionLocked) return;

    const attempt = ++submitAttemptRef.current;
    const draftRevision = draftRevisionRef.current;
    const draftSnapshot = { ...draft };
    if (!onOperationChange(formEpoch, attempt, true)) return;

    activeAttemptRef.current = attempt;
    busyRef.current = true;
    setBusy(true);
    setError(null);
    let succeeded = false;
    try {
      // Retain the exact operation ID only for retrying the exact same form
      // epoch and revision. Any edit or target switch invalidates this cache.
      const cached = preparedRef.current;
      const request = cached?.draftRevision === draftRevision
        ? cached.request
        : await prepareConversationTurn(draftSnapshot);
      if (!isCurrentAttempt(attempt, draftRevision)) return;
      preparedRef.current = { draftRevision, request };

      await onSubmit(request);
      if (!isCurrentAttempt(attempt, draftRevision)) return;
      preparedRef.current = null;
      draftRevisionRef.current += 1;
      if (mountedRef.current) setDraft(emptyDraft());
      succeeded = true;
    } catch {
      if (isCurrentAttempt(attempt, draftRevision) && mountedRef.current) {
        setError(text(es, "No pudimos enviar la solicitud. Intenta de nuevo.", "We couldn't send the request. Please try again."));
      }
    } finally {
      // An old form/attempt cannot clear a newer form's lock or busy UI.
      if (activeAttemptRef.current === attempt) {
        activeAttemptRef.current = null;
        busyRef.current = false;
        if (mountedRef.current) setBusy(false);
        onOperationChange(formEpoch, attempt, false);
        // Let the parent unmount/reset this exact target only after this
        // attempt has released its own busy/operation state.
        if (succeeded && mountedRef.current) onSucceeded();
      }
    }
  }

  const controlsDisabled = busy || interactionLocked;
  return <section aria-label={title} style={{ border: "1px solid #a8c5ed", borderRadius: 12, padding: "1rem", marginTop: ".75rem" }}>
    <h4>{title}</h4>
    <p>{text(es, "Esta solicitud solo envía el tipo y, opcionalmente, una cantidad. No incluye campos de texto, enlaces, rutas, documentos ni contenido.", "This request sends only the type and, optionally, a count. It has no text fields, links, paths, documents, or content.")}</p>
    <form onSubmit={(event) => void submit(event)} aria-busy={controlsDisabled}>
      <label htmlFor={kindId}>{text(es, "Tipo de solicitud", "Request type")}</label>
      <select
        id={kindId}
        value={draft.kind}
        disabled={busy || interactionLocked}
        onChange={(event) => updateDraft((current) => ({ ...current, kind: event.target.value === "document" ? "document" : "context" }))}
      >
        <option value="context">{text(es, "Contexto", "Context")}</option>
        <option value="document">{text(es, "Documento", "Document")}</option>
      </select>
      <label htmlFor={countId} style={{ display: "block", marginTop: ".75rem" }}>{text(es, "Cantidad de elementos (opcional)", "Item count (optional)")}</label>
      <input
        id={countId}
        value={draft.itemCount}
        disabled={busy || interactionLocked}
        onChange={(event) => updateDraft((current) => ({ ...current, itemCount: event.target.value }))}
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={7}
        autoComplete="off"
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: ".75rem", marginTop: ".85rem" }}>
        <button type="submit" disabled={controlsDisabled}>{busy ? text(es, "Enviando…", "Sending…") : text(es, "Enviar solicitud para aprobación", "Send request for approval")}</button>
        <button type="button" disabled={controlsDisabled} onClick={onCancel}>{text(es, "Cancelar", "Cancel")}</button>
      </div>
    </form>
    {error ? <p role="alert">{error}</p> : null}
  </section>;
}

/**
 * A deliberately small conversation client: all mutating calls are tied to an explicit
 * form/button. The backend still makes the authorization decision and does
 * not deliver a document or context when a turn is approved.
 */
export function TeamConversationPanel({ lang, ownedSpaces, receivedSpaces, onUnauthorized }: Props) {
  const es = lang === "es";
  const [available, setAvailable] = useState<boolean | null>(null);
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [threadPageError, setThreadPageError] = useState<string | null>(null);
  const [threadNextCursor, setThreadNextCursor] = useState<ConversationThreadCursor | null>(null);
  const [threadsLoadingMore, setThreadsLoadingMore] = useState(false);
  const threadListSequence = useRef(0);
  const threadMoreAttemptSequence = useRef(0);
  const activeThreadMoreAttempt = useRef<number | null>(null);

  const [targets, setTargets] = useState<Record<string, ConversationTarget[]>>({});
  const [targetBusySpaceId, setTargetBusySpaceId] = useState<string | null>(null);
  const [targetError, setTargetError] = useState<string | null>(null);
  const targetLoadSequence = useRef(0);

  const formEpochSequence = useRef(0);
  const initialTargetRef = useRef<InitialTarget | null>(null);
  const [initialTarget, setInitialTarget] = useState<InitialTarget | null>(null);
  const followUpTargetRef = useRef<FollowUpTarget | null>(null);
  const [followUpTarget, setFollowUpTarget] = useState<FollowUpTarget | null>(null);
  const requestOperationRef = useRef<RequestOperation | null>(null);
  const [requestOperation, setRequestOperation] = useState<RequestOperation | null>(null);

  const [openedThread, setOpenedThread] = useState<ConversationThread | null>(null);
  // A selected thread and its fetch must move together. A late response for
  // thread A must never populate approval cards under the header for B.
  const openedThreadRef = useRef<ConversationThread | null>(null);
  const threadLoadSequence = useRef(0);
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [turnsLoading, setTurnsLoading] = useState(false);
  const [turnsError, setTurnsError] = useState<string | null>(null);
  const [turnPageError, setTurnPageError] = useState<string | null>(null);
  const [turnNextCursor, setTurnNextCursor] = useState<ConversationTurnCursor | null>(null);
  const [turnsLoadingMore, setTurnsLoadingMore] = useState(false);
  const turnMoreAttemptSequence = useRef(0);
  const activeTurnMoreAttempt = useRef<number | null>(null);

  const responseAttemptSequence = useRef(0);
  const inFlightResponseAttempts = useRef(new Map<string, number>());
  const responseOperationIds = useRef(new Map<string, string>());
  const [respondingTurns, setRespondingTurns] = useState<Record<string, number>>({});

  const loadThreads = useCallback(async () => {
    const listSequence = ++threadListSequence.current;
    activeThreadMoreAttempt.current = null;
    setThreadsLoadingMore(false);
    setThreadNextCursor(null);
    setLoadError(null);
    setThreadPageError(null);
    try {
      const response = await authedFetch("/api/team/conversations?limit=50", {
        cache: "no-store",
        referrerPolicy: "no-referrer",
      });
      if (response.status === 401) {
        if (threadListSequence.current === listSequence) onUnauthorized();
        return;
      }
      // This UI is intentionally independently deployable from v3. An older
      // deployment may not have its API yet, and must keep legacy Team cards usable.
      if (response.status === 404) {
        if (threadListSequence.current === listSequence) setAvailable(false);
        return;
      }
      const page = parseConversationThreadPage(await response.json().catch(() => null));
      if (!response.ok || !page) throw new Error("threads");
      if (threadListSequence.current !== listSequence) return;
      setThreads(page.threads);
      setThreadNextCursor(page.nextCursor);
      setAvailable(true);
    } catch {
      if (threadListSequence.current !== listSequence) return;
      setAvailable(true);
      setLoadError(text(es, "No pudimos cargar las conversaciones. Intenta de nuevo.", "We couldn't load conversations. Please try again."));
    }
  }, [es, onUnauthorized]);

  useEffect(() => { void loadThreads(); }, [loadThreads]);

  function changeRequestOperation(formEpoch: number, attempt: number, active: boolean): boolean {
    if (active) {
      if (requestOperationRef.current) return false;
      const next = { formEpoch, attempt };
      requestOperationRef.current = next;
      setRequestOperation(next);
      return true;
    }

    const current = requestOperationRef.current;
    if (current?.formEpoch !== formEpoch || current.attempt !== attempt) return false;
    requestOperationRef.current = null;
    setRequestOperation((visible) => visible?.formEpoch === formEpoch && visible.attempt === attempt ? null : visible);
    return true;
  }

  function selectInitialTarget(target: Omit<InitialTarget, "formEpoch">) {
    if (requestOperationRef.current) return;
    const next = { ...target, formEpoch: ++formEpochSequence.current };
    initialTargetRef.current = next;
    setInitialTarget(next);
  }

  function clearInitialTarget(expectedFormEpoch?: number) {
    const current = initialTargetRef.current;
    if (!current || (expectedFormEpoch !== undefined && current.formEpoch !== expectedFormEpoch)) return;
    initialTargetRef.current = null;
    setInitialTarget((visible) => visible?.formEpoch === current.formEpoch ? null : visible);
  }

  function selectFollowUpTarget(thread: ConversationThread) {
    if (requestOperationRef.current || openedThreadRef.current?.threadId !== thread.threadId) return;
    const next = { thread, formEpoch: ++formEpochSequence.current };
    followUpTargetRef.current = next;
    setFollowUpTarget(next);
  }

  function clearFollowUpTarget(expectedFormEpoch?: number) {
    const current = followUpTargetRef.current;
    if (!current || (expectedFormEpoch !== undefined && current.formEpoch !== expectedFormEpoch)) return;
    followUpTargetRef.current = null;
    setFollowUpTarget((visible) => visible?.formEpoch === current.formEpoch ? null : visible);
  }

  async function loadMoreThreads() {
    const cursor = threadNextCursor;
    if (!cursor || requestOperationRef.current || activeThreadMoreAttempt.current !== null) return;
    const listSequence = threadListSequence.current;
    const attempt = ++threadMoreAttemptSequence.current;
    activeThreadMoreAttempt.current = attempt;
    setThreadsLoadingMore(true);
    setThreadPageError(null);
    try {
      const query = new URLSearchParams({
        limit: "50",
        beforeActivityAt: cursor.beforeActivityAt,
        beforeThreadId: cursor.beforeThreadId,
      });
      const response = await authedFetch(`/api/team/conversations?${query.toString()}`, {
        cache: "no-store",
        referrerPolicy: "no-referrer",
      });
      if (response.status === 401) {
        if (threadListSequence.current === listSequence && activeThreadMoreAttempt.current === attempt) onUnauthorized();
        return;
      }
      const page = parseConversationThreadPage(await response.json().catch(() => null));
      if (!response.ok || !page) throw new Error("more-threads");
      if (threadListSequence.current !== listSequence || activeThreadMoreAttempt.current !== attempt) return;
      setThreads((current) => mergeUnique(current, page.threads, (thread) => thread.threadId));
      setThreadNextCursor(page.nextCursor);
    } catch {
      if (threadListSequence.current === listSequence && activeThreadMoreAttempt.current === attempt) {
        setThreadPageError(text(es, "No pudimos cargar más conversaciones. Intenta de nuevo.", "We couldn't load more conversations. Please try again."));
      }
    } finally {
      if (activeThreadMoreAttempt.current === attempt) {
        activeThreadMoreAttempt.current = null;
        setThreadsLoadingMore(false);
      }
    }
  }

  async function loadTargets(space: OwnedTeamSpace) {
    if (requestOperationRef.current || targetBusySpaceId !== null) return;
    const loadSequence = ++targetLoadSequence.current;
    setTargetBusySpaceId(space.id);
    setTargetError(null);
    try {
      // Required by the current read-only target endpoint. This opaque ID is
      // never rendered and referrerPolicy prevents URL leakage.
      const response = await authedFetch(`/api/team/conversations/targets?spaceId=${encodeURIComponent(space.id)}`, {
        cache: "no-store",
        referrerPolicy: "no-referrer",
      });
      if (response.status === 401) {
        if (targetLoadSequence.current === loadSequence) onUnauthorized();
        return;
      }
      if (!response.ok) throw new Error("targets");
      const parsed = parseConversationTargets(await response.json().catch(() => null))
        .filter((target) => target.spaceId === space.id);
      if (targetLoadSequence.current === loadSequence) {
        setTargets((current) => ({ ...current, [space.id]: parsed }));
      }
    } catch {
      if (targetLoadSequence.current === loadSequence) {
        setTargetError(text(es, "No pudimos cargar participantes aceptados. Intenta de nuevo.", "We couldn't load accepted participants. Please try again."));
      }
    } finally {
      if (targetLoadSequence.current === loadSequence) setTargetBusySpaceId(null);
    }
  }

  async function openThread(thread: ConversationThread, { onlyIfCurrent = false }: { onlyIfCurrent?: boolean } = {}) {
    if ((requestOperationRef.current && !onlyIfCurrent) || (onlyIfCurrent && openedThreadRef.current?.threadId !== thread.threadId)) return;
    const loadSequence = ++threadLoadSequence.current;
    activeTurnMoreAttempt.current = null;
    setTurnsLoadingMore(false);
    openedThreadRef.current = thread;
    setOpenedThread(thread);
    clearFollowUpTarget();
    setTurns([]);
    setTurnsError(null);
    setTurnPageError(null);
    setTurnNextCursor(null);
    setTurnsLoading(true);
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
      const page = parseConversationTurnPage(await response.json().catch(() => null));
      if (!response.ok || !page || page.turns.some((turn) => turn.threadId !== thread.threadId)) throw new Error("turns");
      if (!mayCommit()) return;
      setTurns(page.turns);
      setTurnNextCursor(page.nextCursor);
    } catch {
      if (mayCommit()) setTurnsError(text(es, "No pudimos cargar las solicitudes de esta conversación. Intenta de nuevo.", "We couldn't load this conversation's requests. Please try again."));
    } finally {
      if (mayCommit()) setTurnsLoading(false);
    }
  }

  async function loadMoreTurns() {
    const thread = openedThreadRef.current;
    const cursor = turnNextCursor;
    if (!thread || !cursor || requestOperationRef.current || activeTurnMoreAttempt.current !== null) return;
    const loadSequence = threadLoadSequence.current;
    const attempt = ++turnMoreAttemptSequence.current;
    activeTurnMoreAttempt.current = attempt;
    setTurnsLoadingMore(true);
    setTurnPageError(null);
    const mayCommit = () => canCommitConversationThreadLoad(
      threadLoadSequence.current,
      loadSequence,
      openedThreadRef.current?.threadId ?? null,
      thread.threadId,
    ) && activeTurnMoreAttempt.current === attempt;
    try {
      const query = new URLSearchParams({
        limit: "50",
        beforeCreatedAt: cursor.beforeCreatedAt,
        beforeTurnId: cursor.beforeTurnId,
      });
      const response = await authedFetch(`/api/team/conversations/${encodeURIComponent(thread.threadId)}/turns?${query.toString()}`, {
        cache: "no-store",
        referrerPolicy: "no-referrer",
      });
      if (response.status === 401) {
        if (mayCommit()) onUnauthorized();
        return;
      }
      const page = parseConversationTurnPage(await response.json().catch(() => null));
      if (!response.ok || !page || page.turns.some((turn) => turn.threadId !== thread.threadId)) throw new Error("more-turns");
      if (!mayCommit()) return;
      setTurns((current) => mergeUnique(current, page.turns, (turn) => turn.id));
      setTurnNextCursor(page.nextCursor);
    } catch {
      if (mayCommit()) setTurnPageError(text(es, "No pudimos cargar más solicitudes. Intenta de nuevo.", "We couldn't load more requests. Please try again."));
    } finally {
      if (activeTurnMoreAttempt.current === attempt) {
        activeTurnMoreAttempt.current = null;
        setTurnsLoadingMore(false);
      }
    }
  }

  async function createInitialTurn(target: InitialTarget, prepared: PreparedConversationTurn) {
    if (initialTargetRef.current?.formEpoch !== target.formEpoch) throw new Error("stale-initial-target");
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
    if (response.status === 409) {
      await loadThreads();
      throw new Error("initial-conflict");
    }
    const confirmation = parseConversationTurnConfirmation(await response.json().catch(() => null));
    if (!response.ok || !confirmation) throw new Error("initial");
    await loadThreads();
  }

  async function createFollowUpTurn(target: FollowUpTarget, prepared: PreparedConversationTurn) {
    const thread = target.thread;
    if (followUpTargetRef.current?.formEpoch !== target.formEpoch || openedThreadRef.current?.threadId !== thread.threadId) {
      throw new Error("stale-follow-up-target");
    }
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
    if (response.status === 409) {
      await openThread(thread, { onlyIfCurrent: true });
      throw new Error("follow-up-conflict");
    }
    const confirmation = parseConversationTurnConfirmation(await response.json().catch(() => null));
    if (!response.ok || !confirmation || confirmation.threadId !== thread.threadId) throw new Error("follow-up");
    if (openedThreadRef.current?.threadId === thread.threadId) {
      setTurns((current) => [confirmation, ...current.filter((turn) => turn.id !== confirmation.id)]);
    }
    await loadThreads();
  }

  async function respondToTurn(turn: ConversationTurn, decision: ConversationDecision) {
    const isCurrentThread = () => openedThreadRef.current?.threadId === turn.threadId;
    const turnKey = responseTurnKey(turn);
    if (!isCurrentThread() || inFlightResponseAttempts.current.has(turnKey)) return;

    const attempt = ++responseAttemptSequence.current;
    inFlightResponseAttempts.current.set(turnKey, attempt);
    setRespondingTurns((current) => ({ ...current, [turnKey]: attempt }));
    const operationKey = `${turnKey}:${decision}`;
    try {
      // A retry of the same terminal decision preserves its transient
      // idempotency key. The key remains local and never reaches rendered UI.
      let operationId = responseOperationIds.current.get(operationKey);
      if (!operationId) {
        operationId = createConversationOperationId();
        responseOperationIds.current.set(operationKey, operationId);
      }
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
      if (response.status === 409) {
        const currentThread = openedThreadRef.current;
        if (currentThread?.threadId === turn.threadId) await openThread(currentThread, { onlyIfCurrent: true });
        throw new Error("response-conflict");
      }
      const confirmation = parseConversationTurnConfirmation(await response.json().catch(() => null));
      if (!response.ok || !confirmation || confirmation.id !== turn.id || confirmation.threadId !== turn.threadId) throw new Error("respond");
      if (isCurrentThread()) setTurns((current) => current.map((item) => item.id === confirmation.id ? confirmation : item));
      responseOperationIds.current.delete(`${turnKey}:accepted`);
      responseOperationIds.current.delete(`${turnKey}:declined`);
    } catch {
      if (isCurrentThread()) setTurnsError(text(es, "No pudimos registrar tu decisión. Intenta de nuevo.", "We couldn't record your decision. Please try again."));
    } finally {
      // Stale completion cannot re-enable another operation for this turn.
      if (canClearResponseAttempt(inFlightResponseAttempts.current.get(turnKey), attempt)) {
        inFlightResponseAttempts.current.delete(turnKey);
        setRespondingTurns((current) => {
          if (!canClearResponseAttempt(current[turnKey], attempt)) return current;
          const { [turnKey]: _discarded, ...remaining } = current;
          return remaining;
        });
      }
    }
  }

  const requestBusy = requestOperation !== null;

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
              <button disabled={targetBusySpaceId !== null || requestBusy} onClick={() => void loadTargets(space)}>
                {targetBusySpaceId === space.id ? text(es, "Cargando…", "Loading…") : text(es, "Ver participantes aceptados", "View accepted participants")}
              </button>
            </div>
            {targets[space.id] ? (targets[space.id].length > 0 ? <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: ".5rem", marginTop: ".75rem" }}>
              {targets[space.id].map((target) => <li key={target.relationshipId}>
                <span>{target.counterpartyAlias ?? text(es, "Miembro aceptado", "Accepted member")}</span>{" "}
                <button
                  disabled={requestBusy}
                  onClick={() => selectInitialTarget({
                    spaceId: target.spaceId,
                    relationshipId: target.relationshipId,
                    label: `${space.name} · ${target.counterpartyAlias ?? text(es, "miembro aceptado", "accepted member")}`,
                  })}
                >{text(es, "Preparar solicitud", "Prepare request")}</button>
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
              <button
                disabled={requestBusy}
                onClick={() => selectInitialTarget({ spaceId: space.space_id, relationshipId: null, label: receivedSpaceLabel(space, lang) })}
              >{text(es, "Preparar solicitud", "Prepare request")}</button>
            </div>
          </li>)}
        </ul>
      </section> : null}

      {initialTarget ? <ConversationRequestForm
        key={`initial:${initialTarget.formEpoch}`}
        title={text(es, `Nueva solicitud: ${initialTarget.label}`, `New request: ${initialTarget.label}`)}
        lang={lang}
        formEpoch={initialTarget.formEpoch}
        interactionLocked={requestOperation !== null && requestOperation.formEpoch !== initialTarget.formEpoch}
        onOperationChange={changeRequestOperation}
        onSubmit={(prepared) => createInitialTurn(initialTarget, prepared)}
        onSucceeded={() => clearInitialTarget(initialTarget.formEpoch)}
        onCancel={() => clearInitialTarget(initialTarget.formEpoch)}
      /> : null}

      <section aria-labelledby="team-thread-list-heading" style={{ marginTop: "1.5rem" }}>
        <h3 id="team-thread-list-heading">{text(es, "Solicitudes y aprobaciones", "Requests and approvals")}</h3>
        {threads.length === 0 ? <p role="status">{text(es, "Todavía no hay conversaciones. Inicia una solicitud desde un espacio aceptado.", "There are no conversations yet. Start a request from an accepted space.")}</p> : <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: ".75rem" }}>
          {threads.map((thread) => <li key={thread.threadId} style={{ border: "1px solid #d5dbea", borderRadius: 12, padding: "1rem" }}>
            <strong>{thread.spaceName}</strong>
            <div style={{ marginTop: ".75rem" }}>
              <button disabled={requestBusy} onClick={() => void openThread(thread)}>{openedThread?.threadId === thread.threadId ? text(es, "Actualizar solicitudes", "Refresh requests") : text(es, "Abrir solicitudes", "Open requests")}</button>
            </div>
          </li>)}
        </ul>}
        {threadNextCursor ? <div style={{ marginTop: ".75rem" }}>
          <button disabled={threadsLoadingMore || requestBusy} onClick={() => void loadMoreThreads()}>{threadsLoadingMore ? text(es, "Cargando más conversaciones…", "Loading more conversations…") : text(es, "Cargar más conversaciones", "Load more conversations")}</button>
          {threadPageError ? <p role="alert">{threadPageError} <button onClick={() => void loadMoreThreads()}>{text(es, "Reintentar", "Retry")}</button></p> : null}
        </div> : null}
      </section>

      {openedThread ? <section aria-labelledby="team-thread-heading" style={{ marginTop: "1.5rem" }}>
        <h3 id="team-thread-heading">{text(es, `Solicitudes: ${openedThread.spaceName}`, `Requests: ${openedThread.spaceName}`)}</h3>
        {turnsLoading ? <p role="status">{text(es, "Cargando solicitudes…", "Loading requests…")}</p> : null}
        {turnsError ? <div role="alert"><p>{turnsError}</p><button disabled={requestBusy} onClick={() => void openThread(openedThread)}>{text(es, "Reintentar", "Retry")}</button></div> : null}
        {!turnsLoading && !turnsError ? <>
          <button disabled={requestBusy} onClick={() => selectFollowUpTarget(openedThread)}>{text(es, "Preparar otra solicitud", "Prepare another request")}</button>
          {followUpTarget?.thread.threadId === openedThread.threadId ? <ConversationRequestForm
            key={`followup:${followUpTarget.formEpoch}`}
            title={text(es, "Nueva solicitud para esta conversación", "New request for this conversation")}
            lang={lang}
            formEpoch={followUpTarget.formEpoch}
            interactionLocked={requestOperation !== null && requestOperation.formEpoch !== followUpTarget.formEpoch}
            onOperationChange={changeRequestOperation}
            onSubmit={(prepared) => createFollowUpTurn(followUpTarget, prepared)}
            onSucceeded={() => clearFollowUpTarget(followUpTarget.formEpoch)}
            onCancel={() => clearFollowUpTarget(followUpTarget.formEpoch)}
          /> : null}
          {turns.filter((turn) => turn.threadId === openedThread.threadId).length === 0 ? <p role="status">{text(es, "No hay solicitudes en esta conversación.", "There are no requests in this conversation.")}</p> : <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: ".75rem", marginTop: ".75rem" }}>
            {turns.filter((turn) => turn.threadId === openedThread.threadId).map((turn) => {
              const responding = respondingTurns[responseTurnKey(turn)] !== undefined;
              return <li key={turn.id} style={{ border: "1px solid #d5dbea", borderRadius: 12, padding: "1rem" }}>
                <strong>{turn.direction === "inbound" ? text(es, "Solicitud recibida", "Received request") : text(es, "Solicitud enviada", "Sent request")}</strong>
                <p>{metadataSummary(turn, es)}</p>
                {turn.threadId === openedThread.threadId && turn.direction === "inbound" && turn.status === "pending" && turn.canRespond ? <section aria-label={text(es, "Esta solicitud requiere tu aprobación", "This request requires your approval")} style={{ marginTop: ".75rem" }}>
                  <p>{text(es, "Requiere tu aprobación explícita. No se transferirá contenido al aprobar.", "It needs your explicit approval. No content will transfer when you approve.")}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: ".75rem" }}>
                    <button disabled={responding} onClick={() => void respondToTurn(turn, "accepted")}>{responding ? text(es, "Guardando…", "Saving…") : text(es, "Aprobar", "Approve")}</button>
                    <button disabled={responding} onClick={() => void respondToTurn(turn, "declined")}>{text(es, "Rechazar", "Decline")}</button>
                  </div>
                </section> : <p role="status">{turn.status === "pending"
                  ? text(es, "Esperando aprobación de la otra persona.", "Waiting for the other person to approve.")
                  : turn.status === "accepted"
                    ? text(es, "Aprobada. Se registró la decisión; no se entregó contenido.", "Approved. The decision was recorded; no content was delivered.")
                    : text(es, "Rechazada. No se entregó contenido.", "Declined. No content was delivered.")}</p>}
              </li>;
            })}
          </ul>}
          <TeamTextDeliveryPanel
            key={openedThread.threadId}
            lang={lang}
            threadId={openedThread.threadId}
            turns={turns.filter((turn) => turn.threadId === openedThread.threadId)}
            onUnauthorized={onUnauthorized}
          />
          {turnNextCursor ? <div style={{ marginTop: ".75rem" }}>
            <button disabled={turnsLoadingMore || requestBusy} onClick={() => void loadMoreTurns()}>{turnsLoadingMore ? text(es, "Cargando más solicitudes…", "Loading more requests…") : text(es, "Cargar más solicitudes", "Load more requests")}</button>
            {turnPageError ? <p role="alert">{turnPageError} <button onClick={() => void loadMoreTurns()}>{text(es, "Reintentar", "Retry")}</button></p> : null}
          </div> : null}
        </> : null}
      </section> : null}
    </> : null}
  </section>;
}
