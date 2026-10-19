"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { authedFetch } from "@/lib/supabase/browser";
import type { ConversationTurn } from "./teamConversationClient";
import {
  MAX_TEAM_DELIVERY_BYTES,
  parseTeamDeliveryContent,
  parseTeamDeliveryInbox,
  parseTeamDeliveryReceipt,
  prepareTeamDelivery,
  type TeamDeliveryContent,
  type TeamDeliveryMetadata,
  type TeamDeliveryCursor,
} from "./teamTextDeliveryClient";

type Props = {
  lang: string;
  threadId: string;
  turns: ConversationTurn[];
  onUnauthorized: () => void;
};

type ComposerProps = {
  lang: string;
  threadId: string;
  turn: ConversationTurn;
  onUnauthorized: () => void;
};

function text(es: boolean, spanish: string, english: string): string {
  return es ? spanish : english;
}

function deliveryPath(threadId: string, turnId: string): string {
  return `/api/team/conversations/${encodeURIComponent(threadId)}/turns/${encodeURIComponent(turnId)}/delivery`;
}

/** An explicit, reviewed text submission for the recipient of an accepted turn. */
function ApprovedTurnTextComposer({ lang, threadId, turn, onUnauthorized }: ComposerProps) {
  const es = lang === "es";
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const operationRef = useRef<{ content: string; id: string } | null>(null);
  const busyRef = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busyRef.current) return;
    const prepared = prepareTeamDelivery(content, operationRef.current?.content === content ? operationRef.current.id : null);
    if (!prepared) {
      setError(text(es, "Escribe un mensaje de texto válido (máximo 64 KiB).", "Enter valid text (maximum 64 KiB)."));
      setConfirmation(null);
      return;
    }
    operationRef.current = { content, id: prepared.operationId };
    busyRef.current = true;
    setBusy(true);
    setError(null);
    setConfirmation(null);
    try {
      const response = await authedFetch(deliveryPath(threadId, turn.id), {
        method: "POST",
        body: JSON.stringify(prepared),
        cache: "no-store",
        referrerPolicy: "no-referrer",
      });
      if (response.status === 401) {
        onUnauthorized();
        return;
      }
      const receipt = parseTeamDeliveryReceipt(await response.json().catch(() => null));
      if (response.status !== 201 || !receipt) throw new Error("delivery-rejected");
      operationRef.current = null;
      setContent("");
      setSent(true);
      setConfirmation(text(es, `El servidor confirmó el registro del mensaje. Disponible hasta ${receipt.expiresAt}; esto no confirma que la otra persona lo haya leído.`, `The server confirmed the message was recorded. Available until ${receipt.expiresAt}; this does not confirm the other person has read it.`));
    } catch {
      // Keep the same ephemeral operation ID for an exact retry after an
      // ambiguous network failure; edits invalidate it synchronously below.
      setError(text(es, "No pudimos confirmar el envío. Revisa la conversación e intenta de nuevo.", "We couldn't confirm the send. Check the conversation and try again."));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  const byteLength = new TextEncoder().encode(content).byteLength;
  return <section aria-label={text(es, "Enviar respuesta de texto aprobada", "Send approved text response")} style={{ marginTop: ".75rem", padding: ".75rem", border: "1px solid #d5dbea", borderRadius: 10 }}>
    <h4>{text(es, "Preparar respuesta de texto", "Prepare a text response")}</h4>
    <p>{text(es, "Este turno fue aprobado. Revisa y envía manualmente solo el texto que quieras compartir; no se genera ni se envía contenido automáticamente. Se permite una respuesta de texto por turno aprobado y se conserva 7 días.", "This turn was approved. Review and manually send only the text you choose to share; no content is generated or sent automatically. One text response is allowed per approved turn and is retained for 7 days.")}</p>
    {!sent ? <form onSubmit={(event) => void submit(event)} aria-busy={busy}>
      <label htmlFor={`team-delivery-${turn.id}`}>{text(es, "Texto para compartir", "Text to share")}</label>
      <textarea
        id={`team-delivery-${turn.id}`}
        value={content}
        onChange={(event) => {
          setContent(event.target.value);
          operationRef.current = null;
          setError(null);
          setConfirmation(null);
        }}
        disabled={busy}
        rows={5}
        maxLength={MAX_TEAM_DELIVERY_BYTES}
        autoComplete="off"
        style={{ display: "block", width: "100%", marginTop: ".4rem" }}
      />
      <p>{byteLength} / {MAX_TEAM_DELIVERY_BYTES} bytes</p>
      {byteLength > MAX_TEAM_DELIVERY_BYTES ? <p role="alert">{text(es, "El texto supera el límite de 64 KiB.", "The text exceeds the 64 KiB limit.")}</p> : null}
      <button type="submit" disabled={busy || content.trim().length === 0 || byteLength > MAX_TEAM_DELIVERY_BYTES}>
        {busy ? text(es, "Enviando…", "Sending…") : text(es, "Enviar texto revisado", "Send reviewed text")}
      </button>
    </form> : null}
    {error ? <p role="alert">{error}</p> : null}
    {confirmation ? <p role="status">{confirmation}</p> : null}
  </section>;
}

/** Metadata-only inbox; the payload is fetched only after the user clicks Open. */
export function TeamTextDeliveryPanel({ lang, threadId, turns, onUnauthorized }: Props) {
  const es = lang === "es";
  const acceptedTurns = turns.filter((turn) => turn.threadId === threadId && turn.status === "accepted");
  const acceptedTurnIds = acceptedTurns.map((turn) => turn.id).sort();
  const acceptedTurnKey = acceptedTurnIds.join(":");
  const [deliveries, setDeliveries] = useState<TeamDeliveryMetadata[]>([]);
  const [nextCursor, setNextCursor] = useState<TeamDeliveryCursor | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [opened, setOpened] = useState<TeamDeliveryContent | null>(null);
  const [openError, setOpenError] = useState(false);
  const [refreshSequence, setRefreshSequence] = useState(0);
  const requestSequence = useRef(0);

  useEffect(() => {
    if (acceptedTurns.length === 0) return;
    const sequence = ++requestSequence.current;
    let cancelled = false;
    setDeliveries([]);
    setNextCursor(null);
    setOpened(null);
    setOpeningId(null);
    setLoadError(false);
    setLoadMoreError(false);
    setOpenError(false);
    setLoading(true);
    void (async () => {
      try {
        const response = await authedFetch(`/api/team/deliveries?threadId=${encodeURIComponent(threadId)}&limit=50`, {
          cache: "no-store",
          referrerPolicy: "no-referrer",
        });
        if (response.status === 401) {
          if (!cancelled && requestSequence.current === sequence) onUnauthorized();
          return;
        }
        const page = parseTeamDeliveryInbox(await response.json().catch(() => null));
        if (!response.ok || !page) throw new Error("delivery-inbox");
        if (!cancelled && requestSequence.current === sequence) {
          setDeliveries(page.deliveries);
          setNextCursor(page.nextCursor);
        }
      } catch {
        if (!cancelled && requestSequence.current === sequence) setLoadError(true);
      } finally {
        if (!cancelled && requestSequence.current === sequence) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      if (requestSequence.current === sequence) requestSequence.current += 1;
    };
  // acceptedTurnKey ensures the inbox is refreshed when a pending turn becomes accepted.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId, acceptedTurnKey, onUnauthorized, refreshSequence]);

  if (acceptedTurns.length === 0) return null;

  // This is a server-derived authorization affordance, not an ownership guess
  // from browser state.  A reverse response must use the sender's own shared-space relationship.
  const acceptedInboundTurns = acceptedTurns.filter((turn) => turn.direction === "inbound" && turn.canDeliver);
  const incomingTurnIds = new Set(acceptedTurns.filter((turn) => turn.direction === "outbound").map((turn) => turn.id));
  const visibleDeliveries = deliveries.filter((delivery) => incomingTurnIds.has(delivery.turnId));

  async function loadMoreMessages() {
    const cursor = nextCursor;
    if (!cursor || loadingMore || openingId !== null) return;
    const sequence = ++requestSequence.current;
    setLoadingMore(true);
    setLoadMoreError(false);
    try {
      const query = new URLSearchParams({
        threadId,
        limit: "50",
        beforeCreatedAt: cursor.beforeCreatedAt,
        beforeDeliveryId: cursor.beforeDeliveryId,
      });
      const response = await authedFetch(`/api/team/deliveries?${query.toString()}`, {
        cache: "no-store",
        referrerPolicy: "no-referrer",
      });
      if (response.status === 401) {
        if (requestSequence.current === sequence) onUnauthorized();
        return;
      }
      const page = parseTeamDeliveryInbox(await response.json().catch(() => null));
      if (!response.ok || !page) throw new Error("delivery-inbox-page");
      if (requestSequence.current === sequence) {
        const known = new Set(deliveries.map((delivery) => delivery.id));
        setDeliveries((current) => [...current, ...page.deliveries.filter((delivery) => !known.has(delivery.id))]);
        setNextCursor(page.nextCursor);
      }
    } catch {
      if (requestSequence.current === sequence) setLoadMoreError(true);
    } finally {
      if (requestSequence.current === sequence) setLoadingMore(false);
    }
  }

  async function openDelivery(delivery: TeamDeliveryMetadata) {
    if (openingId !== null || loadingMore || !incomingTurnIds.has(delivery.turnId)) return;
    const sequence = ++requestSequence.current;
    setOpeningId(delivery.id);
    setOpened(null);
    setOpenError(false);
    try {
      const response = await authedFetch(`/api/team/deliveries/${encodeURIComponent(delivery.id)}`, {
        cache: "no-store",
        referrerPolicy: "no-referrer",
      });
      if (response.status === 401) {
        if (requestSequence.current === sequence) onUnauthorized();
        return;
      }
      const result = parseTeamDeliveryContent(await response.json().catch(() => null));
      if (!response.ok || !result || result.id !== delivery.id) throw new Error("delivery-content");
      if (requestSequence.current === sequence) setOpened(result);
      // The server's successful response is the only point at which the UI
      // reports a message as opened/read.
    } catch {
      if (requestSequence.current === sequence) setOpenError(true);
    } finally {
      if (requestSequence.current === sequence) setOpeningId(null);
    }
  }

  return <section aria-label={text(es, "Mensajes de texto compartidos", "Shared text messages")} style={{ marginTop: "1rem", padding: "1rem", border: "1px solid #a8c5ed", borderRadius: 12 }}>
    <h4>{text(es, "Mensajes recibidos", "Received messages")}</h4>
    <p>{text(es, "La lista contiene solo metadatos. El contenido se solicita al servidor únicamente cuando eliges abrirlo; se conserva 7 días.", "The list contains metadata only. Content is requested from the server only when you choose to open it; it is retained for 7 days.")}</p>
    <button type="button" disabled={loading || loadingMore || openingId !== null} onClick={() => setRefreshSequence((current) => current + 1)}>{text(es, "Actualizar mensajes", "Refresh messages")}</button>
    {loading ? <p role="status">{text(es, "Cargando mensajes…", "Loading messages…")}</p> : null}
    {loadError ? <p role="alert">{text(es, "No pudimos cargar la lista de mensajes.", "We couldn't load the message list.")} <button type="button" onClick={() => setRefreshSequence((current) => current + 1)}>{text(es, "Reintentar", "Retry")}</button></p> : null}
    {!loading && !loadError && visibleDeliveries.length === 0 ? <p role="status">{text(es, "Todavía no hay mensajes recibidos.", "There are no received messages yet.")}</p> : null}
    {visibleDeliveries.length > 0 ? <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: ".5rem" }}>
      {visibleDeliveries.map((delivery) => <li key={delivery.id} style={{ borderTop: "1px solid #d5dbea", paddingTop: ".5rem" }}>
        <span>{text(es, "Respuesta de texto · recibida", "Text response · received")}</span>{" "}
        <time dateTime={delivery.createdAt}>{delivery.createdAt}</time>{" "}
        <button type="button" disabled={openingId !== null || loadingMore} onClick={() => void openDelivery(delivery)}>
          {openingId === delivery.id ? text(es, "Abriendo…", "Opening…") : text(es, "Abrir mensaje", "Open message")}
        </button>
      </li>)}
    </ul> : null}
    {nextCursor ? <div style={{ marginTop: ".75rem" }}>
      <button type="button" disabled={loadingMore || openingId !== null} onClick={() => void loadMoreMessages()}>
        {loadingMore ? text(es, "Cargando más mensajes…", "Loading more messages…") : text(es, "Cargar más mensajes", "Load more messages")}
      </button>
      {loadMoreError ? <p role="alert">{text(es, "No pudimos cargar más mensajes.", "We couldn't load more messages.")} <button type="button" onClick={() => void loadMoreMessages()}>{text(es, "Reintentar", "Retry")}</button></p> : null}
    </div> : null}
    {openError ? <p role="alert">{text(es, "No pudimos confirmar el contenido del mensaje. Puede haber vencido o haberse revocado el acceso.", "We couldn't confirm the message content. It may have expired or access may have been revoked.")}</p> : null}
    {opened ? <article aria-label={text(es, "Mensaje abierto", "Opened message")} style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", marginTop: ".75rem", padding: ".75rem", background: "#f5f8fc", borderRadius: 8 }}>
      <p role="status">{text(es, "Mensaje abierto según confirmación del servidor.", "Message opened as confirmed by the server.")}</p>
      <pre style={{ whiteSpace: "pre-wrap", font: "inherit", margin: 0 }}>{opened.content}</pre>
      <small>{text(es, "Disponible hasta", "Available until")} {opened.expiresAt}</small>
    </article> : null}
    {acceptedInboundTurns.map((turn) => <ApprovedTurnTextComposer
      key={turn.id}
      lang={lang}
      threadId={threadId}
      turn={turn}
      onUnauthorized={onUnauthorized}
    />)}
  </section>;
}
