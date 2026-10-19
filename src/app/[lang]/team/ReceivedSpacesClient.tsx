"use client";

import { useCallback, useEffect, useState } from "react";
import { authedFetch } from "@/lib/supabase/browser";
import { parseReceivedInvitations, partitionReceivedInvitations, receivedSpaceLabel, type ReceivedInvitation } from "./receivedSpaces";
import { parseOwnerApprovals, type OwnerApproval } from "./ownerApprovals";
import { parsePaidRosterOwnerView, type PaidRosterOwnerView } from "./paidRosterOwnerView";
import { PaidRosterOwnerPanel } from "./PaidRosterOwnerPanel";
import { PaidRosterInvitationPanel } from "./PaidRosterInvitationPanel";
import { TeamSpaceSetupPanel } from "./TeamSpaceSetupPanel";
import { TeamConversationPanel } from "./TeamConversationPanel";
import { parseOwnedTeamSpaces, type OwnedTeamSpace } from "./teamSharedSpaces";

type Entitlement = { eligible?: boolean; seat_limit?: number; source?: string | null; expires_at?: string | null };

export function ReceivedSpacesClient({ lang }: { lang: string }) {
  const es = lang === "es";
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [trialMessage, setTrialMessage] = useState<string | null>(null);
  const [claimingTrial, setClaimingTrial] = useState(false);
  const [invitations, setInvitations] = useState<ReceivedInvitation[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [approvals, setApprovals] = useState<OwnerApproval[]>([]);
  const [paidRoster, setPaidRoster] = useState<PaidRosterOwnerView | null>(null);
  const [ownedSpaces, setOwnedSpaces] = useState<OwnedTeamSpace[]>([]);
  const collections = partitionReceivedInvitations(invitations);

  const markUnauthorized = useCallback(() => {
    setAuthenticated(false);
    setInvitations([]);
    setEntitlement(null);
    setApprovals([]);
    setPaidRoster(null);
    setOwnedSpaces([]);
  }, []);

  const load = useCallback(async () => {
    setLoading(true); setError(null); setAuthenticated(true);
    try {
      // GET only: never claim/start a trial as a side effect of opening this page.
      const [entitlementResponse, invitationsResponse, requestResponse, rosterResponse, spacesResponse] = await Promise.all([
        authedFetch("/api/team/trial"),
        authedFetch("/api/team/invitations"),
        authedFetch("/api/team/requests"),
        authedFetch("/api/team/paid-roster").catch(() => null),
        // Spaces are optional so a rolling deployment cannot hide legacy cards.
        authedFetch("/api/team/spaces", { cache: "no-store", referrerPolicy: "no-referrer" }).catch(() => null),
      ]);
      if (entitlementResponse.status === 401 || invitationsResponse.status === 401 || requestResponse.status === 401) {
        markUnauthorized(); return;
      }
      // A healthy entitlement response is enough to keep the no-card claim
      // visible. Invitation/request reads are auxiliary on first load and can
      // fail transiently during a rolling deployment; do not make that hide
      // the recovery path for an account whose Team trial is not active yet.
      if (!entitlementResponse.ok) throw new Error("load");
      const entitlementBody = await entitlementResponse.json();
      setEntitlement(entitlementBody && typeof entitlementBody === "object" ? entitlementBody : null);
      if (!invitationsResponse.ok || !requestResponse.ok) throw new Error("load");
      const [invitationBody, requestBody] = await Promise.all([invitationsResponse.json(), requestResponse.json()]);
      setInvitations(parseReceivedInvitations(invitationBody));
      setApprovals(parseOwnerApprovals(requestBody));
      // A 403/503/404 roster response must not make the shared-spaces page fail:
      // only paid owners can see it and source deployments can precede its SQL.
      if (rosterResponse?.ok) {
        const rosterBody = await rosterResponse.json().catch(() => null);
        setPaidRoster(parsePaidRosterOwnerView(rosterBody));
      } else setPaidRoster(null);
      if (spacesResponse?.ok) {
        setOwnedSpaces(parseOwnedTeamSpaces(await spacesResponse.json().catch(() => null)));
      } else setOwnedSpaces([]);
    } catch {
      setError(es ? "No pudimos cargar tus invitaciones. Intenta de nuevo." : "We couldn't load your invitations. Please try again.");
    } finally { setLoading(false); }
  }, [es, markUnauthorized]);

  useEffect(() => { void load(); }, [load]);

  async function respond(invitation: ReceivedInvitation, accept: boolean) {
    setBusyId(invitation.id); setError(null);
    try {
      const response = await authedFetch("/api/team/invitations/respond", { method: "POST", body: JSON.stringify({ invitationId: invitation.id, accept }) });
      if (response.status === 401) { markUnauthorized(); return; }
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
      if (response.status === 401) { markUnauthorized(); return; }
      if (!response.ok) throw new Error("respond");
      setApprovals((current) => accept ? current.map((item) => item.id === request.id ? { ...item, status: "accepted", canRespond: false } : item) : current.filter((item) => item.id !== request.id));
    } catch {
      setError(es ? "No pudimos actualizar la solicitud. Intenta de nuevo." : "We couldn't update the request. Please try again.");
    } finally { setBusyId(null); }
  }

  async function claimTrial() {
    setClaimingTrial(true); setTrialMessage(null); setError(null);
    try {
      const response = await authedFetch("/api/team/trial", { method: "POST" });
      if (response.status === 401) { markUnauthorized(); return; }
      const body = await response.json().catch(() => null);
      if (!response.ok || !body || !["started", "already_claimed"].includes(body.result)) throw new Error("claim");
      if (body.entitlement && typeof body.entitlement === "object") setEntitlement(body.entitlement);
      setTrialMessage(body.result === "started"
        ? (es ? "Prueba Team iniciada por 7 días. No se requiere tarjeta ni se hará un cobro automático." : "Your 7-day Team trial has started. No card is required and there is no automatic charge.")
        : (body.entitlement?.eligible
          ? (es ? "Ya tienes acceso Team activo; no se inició otra prueba." : "You already have active Team access; no additional trial was started.")
          : (es ? "La prueba única ya fue utilizada o venció. No se inició otra prueba." : "The one-time trial was already claimed or has expired. No new trial was started.")));
    } catch {
      setError(es ? "No pudimos iniciar la prueba Team. Intenta de nuevo." : "We couldn't start the Team trial. Please try again.");
    } finally { setClaimingTrial(false); }
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
        <p>{request.kind === "document" ? (es ? "Documento" : "Document") : (es ? "Contexto" : "Context")}</p>
        {request.itemCount !== null ? <p>{es ? "Elementos" : "Items"}: {request.itemCount}</p> : null}
        <div style={{ display: "flex", gap: ".75rem", marginTop: ".85rem" }}>
          <button disabled={busyId === request.id} onClick={() => void respondToRequest(request, true)}>{es ? "Aprobar" : "Approve"}</button>
          <button disabled={busyId === request.id} onClick={() => void respondToRequest(request, false)}>{es ? "Rechazar" : "Decline"}</button>
        </div>
      </li>)}
      </ul>
    </section> : null}
    {!loading && authenticated && entitlement && entitlement.eligible === false ? <p>{es ? "Tu cuenta no tiene acceso Team activo en este momento." : "Your account does not currently have active Team access."}</p> : null}
    {!loading && authenticated && entitlement && entitlement.eligible === false ? <section aria-labelledby="team-trial-heading">
      <h2 id="team-trial-heading">{es ? "Prueba Team sin tarjeta" : "Team trial, no card required"}</h2>
      <p>{es ? "Puedes solicitar una única prueba de 7 días (168 horas). No hay cobro automático. El checkout de Team todavía no está disponible; al terminar, no podrás contratar desde este sitio." : "You may claim one 7-day (168-hour) trial. There is no automatic charge. Team checkout is not available yet, so you cannot subscribe from this site when it ends."}</p>
      <button disabled={claimingTrial} onClick={() => void claimTrial()}>{claimingTrial ? (es ? "Iniciando…" : "Starting…") : (es ? "Iniciar prueba Team" : "Claim Team trial")}</button>
      {trialMessage ? <p role="status">{trialMessage}</p> : null}
    </section> : null}
    {!loading && authenticated && entitlement?.eligible ? <p role="status">{es ? `Acceso Team activo${entitlement.expires_at ? ` hasta ${new Date(entitlement.expires_at).toLocaleDateString("es")}` : ""}. El checkout de Team todavía no está disponible.` : `Team access is active${entitlement.expires_at ? ` until ${new Date(entitlement.expires_at).toLocaleDateString("en")}` : ""}. Team checkout is not available yet.`}</p> : null}
    {!loading && authenticated && paidRoster ? <PaidRosterOwnerPanel lang={lang} roster={paidRoster} /> : null}
    {!loading && authenticated ? <PaidRosterInvitationPanel lang={lang} roster={paidRoster} /> : null}
    {!loading && authenticated && entitlement?.eligible ? <TeamSpaceSetupPanel lang={lang} spaces={ownedSpaces} onChanged={load} onUnauthorized={markUnauthorized} /> : null}
    {!loading && authenticated && entitlement?.eligible ? <TeamConversationPanel lang={lang} ownedSpaces={ownedSpaces} receivedSpaces={collections.received} onUnauthorized={markUnauthorized} /> : null}
    {!loading && authenticated && !error && collections.pending.length === 0 && collections.received.length === 0 && ownedSpaces.length === 0 && !approvals.some((item) => item.status === "pending" && item.canRespond) ? <p>{es ? "No tienes invitaciones, solicitudes pendientes ni espacios recibidos." : "You have no invitations, pending requests, or received spaces."}</p> : null}
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
