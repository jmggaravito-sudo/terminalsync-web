"use client";

import { useCallback, useEffect, useState } from "react";
import { authedFetch } from "@/lib/supabase/browser";
import { parseReceivedInvitations, partitionReceivedInvitations, receivedSpaceLabel, type ReceivedInvitation } from "./receivedSpaces";
import { parseOwnerApprovals, type OwnerApproval } from "./ownerApprovals";

type Entitlement = { eligible?: boolean; seat_limit?: number; source?: string | null; expires_at?: string | null };

export function ReceivedSpacesClient({ lang }: { lang: string }) {
  const es = lang === "es";
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [invitations, setInvitations] = useState<ReceivedInvitation[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [approvals, setApprovals] = useState<OwnerApproval[]>([]);
  const collections = partitionReceivedInvitations(invitations);

  const load = useCallback(async () => {
    setLoading(true); setError(null); setAuthenticated(true);
    try {
      // GET only: never claim/start a trial as a side effect of opening this page.
      const [entitlementResponse, invitationsResponse, requestResponse] = await Promise.all([
        authedFetch("/api/team/trial"),
        authedFetch("/api/team/invitations"),
        authedFetch("/api/team/requests"),
      ]);
      if (entitlementResponse.status === 401 || invitationsResponse.status === 401 || requestResponse.status === 401) {
        setAuthenticated(false); setInvitations([]); setEntitlement(null); setApprovals([]); return;
      }
      if (!entitlementResponse.ok || !invitationsResponse.ok || !requestResponse.ok) throw new Error("load");
      const [entitlementBody, invitationBody, requestBody] = await Promise.all([entitlementResponse.json(), invitationsResponse.json(), requestResponse.json()]);
      setEntitlement(entitlementBody && typeof entitlementBody === "object" ? entitlementBody : null);
      setInvitations(parseReceivedInvitations(invitationBody));
      setApprovals(parseOwnerApprovals(requestBody));
    } catch {
      setError(es ? "No pudimos cargar tus invitaciones. Intenta de nuevo." : "We couldn't load your invitations. Please try again.");
    } finally { setLoading(false); }
  }, [es]);

  useEffect(() => { void load(); }, [load]);

  async function respond(invitation: ReceivedInvitation, accept: boolean) {
    setBusyId(invitation.id); setError(null);
    try {
      const response = await authedFetch("/api/team/invitations/respond", { method: "POST", body: JSON.stringify({ invitationId: invitation.id, accept }) });
      if (response.status === 401) { setAuthenticated(false); return; }
      if (!response.ok) throw new Error("respond");
      setInvitations((current) => accept
        ? current.map((item) => item.id === invitation.id ? { ...item, status: "accepted" } : item)
        : current.filter((item) => item.id !== invitation.id));
    } catch {
      setError(es ? "No pudimos actualizar la invitación. Intenta de nuevo." : "We couldn't update the invitation. Please try again.");
    } finally { setBusyId(null); }
  }

  async function respondToRequest(request: OwnerApproval, accept: boolean) {
    setBusyId(request.id); setError(null);
    try {
      const response = await authedFetch("/api/team/requests/respond", { method: "POST", body: JSON.stringify({ requestId: request.id, accept }) });
      if (response.status === 401) { setAuthenticated(false); return; }
      if (!response.ok) throw new Error("respond");
      setApprovals((current) => accept ? current.map((item) => item.id === request.id ? { ...item, status: "accepted", canRespond: false } : item) : current.filter((item) => item.id !== request.id));
    } catch {
      setError(es ? "No pudimos actualizar la solicitud. Intenta de nuevo." : "We couldn't update the request. Please try again.");
    } finally { setBusyId(null); }
  }

  return <section aria-labelledby="team-heading" style={{ maxWidth: 760, margin: "3rem auto", padding: "0 1.25rem", color: "#172033" }}>
    <h1 id="team-heading">{es ? "Espacios compartidos" : "Shared spaces"}</h1>
    {loading ? <p role="status">{es ? "Cargando…" : "Loading…"}</p> : null}
    {!loading && !authenticated ? <p role="status">{es ? "Inicia sesión para ver tus invitaciones." : "Sign in to view your invitations."}</p> : null}
    {!loading && authenticated && error ? <div role="alert"><p>{error}</p><button onClick={() => void load()}>{es ? "Reintentar" : "Retry"}</button></div> : null}
    {!loading && authenticated ? <p>{es ? "La aprobación solo comparte metadatos de la solicitud; no envía, importa ni lee contenido o documentos." : "Approval is metadata consent only; it does not send, import, or read content or documents."}</p> : null}
    {!loading && authenticated && approvals.some((item) => item.status === "pending" && item.canRespond) ? <section aria-labelledby="owner-approval-heading">
      <h2 id="owner-approval-heading">{es ? "Solicitudes que requieren tu aprobación" : "Requests awaiting your approval"}</h2>
      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "1rem" }}>
      {approvals.filter((item) => item.status === "pending" && item.canRespond).map((request) => <li key={request.id} style={{ border: "1px solid #d5dbea", borderRadius: 12, padding: "1rem" }}>
        <strong>{request.spaceName}</strong>
        <p>{request.kind === "document" ? (es ? "Documento" : "Document") : (es ? "Contexto" : "Context")} · {request.label ?? (es ? "Solicitud" : "Request")}</p>
        {request.category ? <p>{es ? "Categoría" : "Category"}: {request.category}</p> : null}
        {request.itemCount !== null ? <p>{es ? "Elementos" : "Items"}: {request.itemCount}</p> : null}
        <div style={{ display: "flex", gap: ".75rem", marginTop: ".85rem" }}>
          <button disabled={busyId === request.id} onClick={() => void respondToRequest(request, true)}>{es ? "Aprobar" : "Approve"}</button>
          <button disabled={busyId === request.id} onClick={() => void respondToRequest(request, false)}>{es ? "Rechazar" : "Decline"}</button>
        </div>
      </li>)}
      </ul>
    </section> : null}
    {!loading && authenticated && entitlement && entitlement.eligible === false ? <p>{es ? "Tu cuenta no tiene acceso Team activo en este momento." : "Your account does not currently have active Team access."}</p> : null}
    {!loading && authenticated && !error && collections.pending.length === 0 && collections.received.length === 0 && !approvals.some((item) => item.status === "pending" && item.canRespond) ? <p>{es ? "No tienes invitaciones, solicitudes pendientes ni espacios recibidos." : "You have no invitations, pending requests, or received spaces."}</p> : null}
    {!loading && authenticated && collections.pending.length > 0 ? <section aria-labelledby="pending-heading">
      <h2 id="pending-heading">{es ? "Invitaciones pendientes" : "Pending invitations"}</h2>
      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "1rem" }}>
      {collections.pending.map((invitation) => <li key={invitation.id} style={{ border: "1px solid #d5dbea", borderRadius: 12, padding: "1rem" }}>
        <strong>{receivedSpaceLabel(invitation, lang)}</strong>
        <div style={{ display: "flex", gap: ".75rem", marginTop: ".85rem" }}>
          <button disabled={busyId === invitation.id} onClick={() => void respond(invitation, true)}>{es ? "Aceptar" : "Accept"}</button>
          <button disabled={busyId === invitation.id} onClick={() => void respond(invitation, false)}>{es ? "Rechazar" : "Decline"}</button>
        </div>
      </li>)}
      </ul>
    </section> : null}
    {!loading && authenticated && collections.received.length > 0 ? <section aria-labelledby="received-heading">
      <h2 id="received-heading">{es ? "Espacios recibidos" : "Received spaces"}</h2>
      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "1rem" }}>
      {collections.received.map((invitation) => <li key={invitation.id} style={{ border: "1px solid #d5dbea", borderRadius: 12, padding: "1rem" }}>
        <strong>{receivedSpaceLabel(invitation, lang)}</strong>
      </li>)}
      </ul>
    </section> : null}
  </section>;
}
