"use client";

import { type FormEvent, useState } from "react";
import { authedFetch } from "@/lib/supabase/browser";
import type { PaidRosterOwnerView } from "./paidRosterOwnerView";

const OPAQUE_INVITATION = /^[A-Za-z0-9_-]{43}$/;

type CreatedInvitation = {
  token: string;
  expiresAt: string;
};

function parseCreatedInvitation(value: unknown): CreatedInvitation | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (typeof record.invitationToken !== "string" || !OPAQUE_INVITATION.test(record.invitationToken) ||
    typeof record.expiresAt !== "string" || !Number.isFinite(Date.parse(record.expiresAt))) return null;
  return { token: record.invitationToken, expiresAt: record.expiresAt };
}

function expiryLabel(expiresAt: string, lang: string): string {
  const date = new Date(expiresAt);
  return date.toLocaleString(lang === "es" ? "es" : "en");
}

/**
 * The owner capability is intentionally held only in React state. It is never
 * placed in a URL, storage, query string, referrer, log, or replayable list.
 * Copying is an explicit owner transfer to the system clipboard, after which
 * this component immediately removes its own in-memory copy.
 * The server remains authoritative for owner status, capacity, and acceptance.
 */
export function PaidRosterInvitationPanel({ lang, roster }: { lang: string; roster: PaidRosterOwnerView | null }) {
  const es = lang === "es";
  const [createdInvitation, setCreatedInvitation] = useState<CreatedInvitation | null>(null);
  const [createdOnce, setCreatedOnce] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copying, setCopying] = useState(false);
  const [ownerMessage, setOwnerMessage] = useState<string | null>(null);
  const [enteredToken, setEnteredToken] = useState("");
  const [accepting, setAccepting] = useState(false);
  const [recipientMessage, setRecipientMessage] = useState<string | null>(null);

  const canCreate = Boolean(roster?.has_active_team && roster.available_slots > 0 && !createdOnce && !createdInvitation && !creating);

  async function createInvitation() {
    if (!canCreate || creating) return;
    // Latch before the request. If the server committed but this browser lost
    // the response, retrying could silently reserve another pending seat.
    // Failing closed is safer than minting a second capability in this page.
    setCreatedOnce(true);
    setCreating(true); setOwnerMessage(null);
    try {
      const response = await authedFetch("/api/team/paid-roster/invitations", {
        method: "POST",
        cache: "no-store",
        referrerPolicy: "no-referrer",
      });
      if (response.status === 401) {
        setOwnerMessage(es ? "Tu sesión ya no está activa. Inicia sesión nuevamente." : "Your session is no longer active. Please sign in again.");
        return;
      }
      const invitation = parseCreatedInvitation(await response.json().catch(() => null));
      if (!response.ok || !invitation) throw new Error("create invitation");
      // Do not refetch or persist this bearer capability. It is shown only from
      // this in-memory response and is erased when copied or dismissed.
      setCreatedInvitation(invitation);
    } catch {
      setOwnerMessage(es ? "No pudimos confirmar la invitación. Por seguridad, no crearemos otra en esta página." : "We couldn't confirm the invitation. For safety, we will not create another one on this page.");
    } finally { setCreating(false); }
  }

  async function copyAndHideInvitation() {
    const invitation = createdInvitation;
    if (!invitation || copying) return;
    if (!navigator.clipboard) {
      setOwnerMessage(es ? "La copia no está disponible en este navegador. Puedes copiar el código manualmente y luego ocultarlo." : "Copy is unavailable in this browser. You can copy the code manually, then hide it.");
      return;
    }
    setCopying(true); setOwnerMessage(null);
    try {
      await navigator.clipboard.writeText(invitation.token);
      setCreatedInvitation(null);
      setOwnerMessage(es ? "Código copiado y ocultado. No volverá a mostrarse en esta página." : "Code copied and hidden. It will not be shown again on this page.");
    } catch {
      setOwnerMessage(es ? "No pudimos copiar el código. Intenta de nuevo o guárdalo manualmente." : "We couldn't copy the code. Try again or save it manually.");
    } finally { setCopying(false); }
  }

  async function acceptInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = enteredToken.trim();
    // Clear the entry on every path, including a network failure. A recipient
    // must deliberately paste again; the capability is never retained.
    setEnteredToken("");
    setRecipientMessage(null);
    if (!OPAQUE_INVITATION.test(token)) {
      setRecipientMessage(es ? "La invitación no tiene un formato válido." : "The invitation does not have a valid format.");
      return;
    }
    setAccepting(true);
    try {
      const response = await authedFetch("/api/team/paid-roster/invitations/accept", {
        method: "POST",
        body: JSON.stringify({ token }),
        cache: "no-store",
        referrerPolicy: "no-referrer",
      });
      if (response.status === 401) {
        setRecipientMessage(es ? "Tu sesión ya no está activa. Inicia sesión nuevamente." : "Your session is no longer active. Please sign in again.");
      } else if (response.ok) {
        setRecipientMessage(es ? "Cupo Team aceptado. Actualiza la página para ver el estado actual." : "Team seat accepted. Refresh the page to see the current status.");
      } else if (response.status === 404) {
        setRecipientMessage(es ? "La invitación no está disponible." : "The invitation is unavailable.");
      } else {
        setRecipientMessage(es ? "No pudimos aceptar la invitación. Intenta de nuevo." : "We couldn't accept the invitation. Please try again.");
      }
    } catch {
      setRecipientMessage(es ? "No pudimos aceptar la invitación. Intenta de nuevo." : "We couldn't accept the invitation. Please try again.");
    } finally { setAccepting(false); }
  }

  return <section aria-labelledby="paid-roster-invitations-heading">
    <h2 id="paid-roster-invitations-heading">{es ? "Invitaciones privadas de cupo Team" : "Private Team seat invitations"}</h2>

    {roster?.has_active_team ? <section aria-labelledby="paid-roster-owner-invitation-heading">
      <h3 id="paid-roster-owner-invitation-heading">{es ? "Invitar a un empleado" : "Invite an employee"}</h3>
      <p>{es
        ? "Crea un código privado solo si hay un cupo disponible. No se envía por URL, correo ni perfil; compártelo por un canal que controles."
        : "Create a private code only when a seat is available. It is not sent by URL, email, or profile; share it through a channel you control."}</p>
      {canCreate ? <button disabled={creating} onClick={() => void createInvitation()}>
        {creating ? (es ? "Creando…" : "Creating…") : (es ? "Crear código de invitación" : "Create invitation code")}
      </button> : null}
      {!canCreate && !createdInvitation && !createdOnce && roster.available_slots <= 0 ? <p role="status">{es ? "No hay cupos disponibles para otra invitación." : "There are no seats available for another invitation."}</p> : null}
      {createdInvitation ? <div role="group" aria-label={es ? "Código de invitación de un solo uso visual" : "Single-view invitation code"}>
        <p>{es ? `Este código vence ${expiryLabel(createdInvitation.expiresAt, lang)}. Se muestra una sola vez en la memoria de esta página; cópialo ahora o escóndelo cuando termines.` : `This code expires ${expiryLabel(createdInvitation.expiresAt, lang)}. It is shown once in this page memory; copy it now or hide it when you are done.`}</p>
        <code>{createdInvitation.token}</code>
        <div style={{ display: "flex", gap: ".75rem", marginTop: ".85rem" }}>
          <button disabled={copying} onClick={() => void copyAndHideInvitation()}>{copying ? (es ? "Copiando…" : "Copying…") : (es ? "Copiar y ocultar" : "Copy and hide")}</button>
          <button disabled={copying} onClick={() => setCreatedInvitation(null)}>{es ? "Ya lo guardé: ocultar" : "I saved it: hide"}</button>
        </div>
      </div> : null}
      {createdOnce && !createdInvitation ? <p role="status">{es ? "El código ya no se muestra en esta página." : "The code is no longer shown on this page."}</p> : null}
      {ownerMessage ? <p role="status">{ownerMessage}</p> : null}
    </section> : null}

    <section aria-labelledby="paid-roster-recipient-invitation-heading">
      <h3 id="paid-roster-recipient-invitation-heading">{es ? "Aceptar un cupo Team" : "Accept a Team seat"}</h3>
      <p>{es
        ? "Pega manualmente un código privado que recibiste. No se acepta automáticamente, no se guarda en este navegador y se borra al enviarlo."
        : "Manually paste a private code you received. It is never accepted automatically, stored in this browser, and is cleared when submitted."}</p>
      <form onSubmit={(event) => void acceptInvitation(event)}>
        <label htmlFor="team-seat-invitation-token">{es ? "Código privado de invitación" : "Private invitation code"}</label>
        <input
          id="team-seat-invitation-token"
          type="password"
          value={enteredToken}
          onChange={(event) => setEnteredToken(event.target.value)}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          inputMode="text"
          aria-describedby="team-seat-invitation-help"
        />
        <p id="team-seat-invitation-help">{es ? "Solo se envía cuando eliges aceptar." : "It is sent only when you choose accept."}</p>
        <button type="submit" disabled={accepting || enteredToken.trim().length === 0}>{accepting ? (es ? "Aceptando…" : "Accepting…") : (es ? "Aceptar cupo" : "Accept seat")}</button>
      </form>
      {recipientMessage ? <p role="status">{recipientMessage}</p> : null}
    </section>
  </section>;
}
