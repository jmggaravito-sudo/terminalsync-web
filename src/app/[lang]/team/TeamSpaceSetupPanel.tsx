"use client";

import { type FormEvent, useId, useState } from "react";
import { authedFetch } from "@/lib/supabase/browser";
import type { OwnedTeamSpace } from "./teamSharedSpaces";
import type { OwnedSpaceInvitation } from "./ownedSpaceInvitations";
import { normalizeTeamSpaceDisplayName as normalizeTeamDisplayName } from "@/lib/teamSpaceDisplayName";

const TEAM_ALIAS = /^[a-z0-9][a-z0-9._-]{1,28}[a-z0-9]$/;

type Props = {
  lang: string;
  spaces: OwnedTeamSpace[];
  ownedInvitations?: OwnedSpaceInvitation[];
  onChanged: () => Promise<void>;
  onUnauthorized: () => void;
};

function validAlias(value: string): boolean {
  return TEAM_ALIAS.test(value) && !value.includes("..");
}

function SpaceInvitationForm({ lang, space, onUnauthorized }: {
  lang: string;
  space: OwnedTeamSpace;
  onUnauthorized: () => void;
}) {
  const es = lang === "es";
  const inputId = useId();
  const [alias, setAlias] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const targetAlias = alias.trim().toLowerCase();
    setMessage(null);
    if (!validAlias(targetAlias)) {
      setMessage(es ? "Escribe un alias válido para invitar." : "Enter a valid alias to invite.");
      return;
    }
    setSubmitting(true);
    try {
      // The space ID stays in the component closure. It is used only in this
      // explicit request and is never shown in the form or URL.
      const response = await authedFetch("/api/team/invitations", {
        method: "POST",
        body: JSON.stringify({ spaceId: space.id, alias: targetAlias }),
        cache: "no-store",
        referrerPolicy: "no-referrer",
      });
      if (response.status === 401) {
        onUnauthorized();
        return;
      }
      const body = await response.json().catch(() => null);
      if (!response.ok || !Array.isArray(body) || body.length !== 1 || body[0]?.result !== "submitted") {
        throw new Error("invite");
      }
      setAlias("");
      setMessage(es ? "Invitación enviada. La otra persona debe aceptarla explícitamente." : "Invitation sent. The other person must explicitly accept it.");
    } catch {
      setMessage(es ? "No pudimos enviar la invitación. Intenta de nuevo." : "We couldn't send the invitation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return <form onSubmit={(event) => void submit(event)} style={{ marginTop: ".75rem" }}>
    <label htmlFor={inputId}>{es ? "Alias de la persona" : "Person's alias"}</label>
    <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem", marginTop: ".35rem" }}>
      <input
        id={inputId}
        value={alias}
        onChange={(event) => setAlias(event.target.value)}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        maxLength={30}
        aria-describedby={`${inputId}-help`}
      />
      <button type="submit" disabled={submitting || alias.trim().length === 0}>
        {submitting ? (es ? "Enviando…" : "Sending…") : (es ? "Enviar invitación" : "Send invitation")}
      </button>
    </div>
    <p id={`${inputId}-help`}>
      {es ? "Se envía solo cuando eliges este botón; no concede acceso hasta que la persona acepte." : "It sends only when you choose this button; it grants no access until the person accepts."}
    </p>
    {message ? <p role="status">{message}</p> : null}
  </form>;
}

/**
 * Owner setup is intentionally independent from the received-space collection:
 * it handles only an alias, owner-created space metadata, and explicit invite
 * actions. It never accepts a document, external reference, or context body.
 */
export function TeamSpaceSetupPanel({ lang, spaces, ownedInvitations = [], onChanged, onUnauthorized }: Props) {
  const es = lang === "es";
  const aliasId = useId();
  const spaceNameId = useId();
  const [alias, setAlias] = useState("");
  const [aliasBusy, setAliasBusy] = useState(false);
  const [aliasMessage, setAliasMessage] = useState<string | null>(null);
  const [spaceName, setSpaceName] = useState("");
  const [spaceBusy, setSpaceBusy] = useState(false);
  const [spaceMessage, setSpaceMessage] = useState<string | null>(null);
  const [revokingInvitationId, setRevokingInvitationId] = useState<string | null>(null);
  const [revocationMessage, setRevocationMessage] = useState<string | null>(null);

  async function revokeInvitation(invitation: OwnedSpaceInvitation) {
    setRevocationMessage(null);
    setRevokingInvitationId(invitation.id);
    try {
      const response = await authedFetch("/api/team/invitations/owned", {
        method: "DELETE",
        body: JSON.stringify({ invitationId: invitation.id }),
        cache: "no-store",
        referrerPolicy: "no-referrer",
      });
      if (response.status === 401) {
        onUnauthorized();
        return;
      }
      const body = await response.json().catch(() => null);
      if (!response.ok || !Array.isArray(body) || body.length !== 1 || body[0]?.result !== "revoked") throw new Error("revoke");
      setRevocationMessage(es ? "Acceso revocado. No se envió ni eliminó contenido." : "Access revoked. No content was sent or deleted.");
      await onChanged();
    } catch {
      setRevocationMessage(es ? "No pudimos revocar el acceso. Intenta de nuevo." : "We couldn't revoke access. Please try again.");
    } finally {
      setRevokingInvitationId(null);
    }
  }

  async function claimAlias(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextAlias = alias.trim().toLowerCase();
    setAliasMessage(null);
    if (!validAlias(nextAlias)) {
      setAliasMessage(es ? "Usa 3 a 30 caracteres: letras minúsculas, números, punto, guion o guion bajo." : "Use 3 to 30 characters: lowercase letters, numbers, periods, dashes, or underscores.");
      return;
    }
    setAliasBusy(true);
    try {
      const response = await authedFetch("/api/team/alias", {
        method: "PUT",
        body: JSON.stringify({ alias: nextAlias }),
        cache: "no-store",
        referrerPolicy: "no-referrer",
      });
      if (response.status === 401) {
        onUnauthorized();
        return;
      }
      const body = await response.json().catch(() => null);
      if (!response.ok || !Array.isArray(body) || body.length !== 1 || typeof body[0]?.alias !== "string") {
        throw new Error("alias");
      }
      setAlias("");
      setAliasMessage(es ? "Alias actualizado." : "Alias updated.");
    } catch {
      setAliasMessage(es ? "No pudimos actualizar el alias. Intenta de nuevo." : "We couldn't update the alias. Please try again.");
    } finally {
      setAliasBusy(false);
    }
  }

  async function registerSpace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = normalizeTeamDisplayName(spaceName);
    setSpaceMessage(null);
    if (!name) {
      setSpaceMessage(es ? "Usa un nombre seguro de 1 a 120 caracteres: letras, números, espacios o guiones." : "Use a safe 1–120 character name: letters, numbers, spaces, or hyphens.");
      return;
    }
    setSpaceBusy(true);
    try {
      // The intentional safe display name is the only new recipient-visible
      // metadata. Do not submit descriptions, external refs, document IDs,
      // paths, URLs, or any context/document content.
      const response = await authedFetch("/api/team/spaces", {
        method: "POST",
        body: JSON.stringify({ name }),
        cache: "no-store",
        referrerPolicy: "no-referrer",
      });
      if (response.status === 401) {
        onUnauthorized();
        return;
      }
      if (!response.ok) throw new Error("space");
      setSpaceName("");
      setSpaceMessage(es ? "Espacio registrado. Puedes invitar a alguien por su alias." : "Space registered. You can invite someone by their alias.");
      // The server already confirmed creation. A refresh is best-effort so a
      // later transient GET failure must not turn a confirmed write into a
      // misleading "not registered" message.
      try { await onChanged(); } catch { /* keep the confirmed status */ }
    } catch {
      setSpaceMessage(es ? "No pudimos registrar el espacio. Intenta de nuevo." : "We couldn't register the space. Please try again.");
    } finally {
      setSpaceBusy(false);
    }
  }

  return <section aria-labelledby="team-owner-spaces-heading">
    <h2 id="team-owner-spaces-heading">{es ? "Espacios que compartes" : "Spaces you share"}</h2>
    <p>{es
      ? "Configura solo un nombre visible seguro. Esta página no sube documentos, contextos, descripciones ni enlaces externos."
      : "Configure only a safe visible name. This page does not upload documents, context, descriptions, or external links."}</p>

    <section aria-labelledby="team-alias-heading">
      <h3 id="team-alias-heading">{es ? "Tu alias Team" : "Your Team alias"}</h3>
      <p>{es ? "El alias permite que otra persona te invite sin buscar por correo o identificadores." : "An alias lets another person invite you without looking up email addresses or identifiers."}</p>
      <form onSubmit={(event) => void claimAlias(event)}>
        <label htmlFor={aliasId}>{es ? "Alias" : "Alias"}</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem", marginTop: ".35rem" }}>
          <input id={aliasId} value={alias} onChange={(event) => setAlias(event.target.value)} autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} maxLength={30} />
          <button type="submit" disabled={aliasBusy || alias.trim().length === 0}>{aliasBusy ? (es ? "Guardando…" : "Saving…") : (es ? "Guardar alias" : "Save alias")}</button>
        </div>
      </form>
      {aliasMessage ? <p role="status">{aliasMessage}</p> : null}
    </section>

    <section aria-labelledby="team-register-space-heading" style={{ marginTop: "1.5rem" }}>
      <h3 id="team-register-space-heading">{es ? "Registrar un espacio para compartir" : "Register a space to share"}</h3>
      <p>{es ? "Usa letras, números, espacios o guiones; no agregues URL, rutas, descripción, contenido ni referencias de documentos." : "Use letters, numbers, spaces, or hyphens; do not add URLs, paths, descriptions, content, or document references."}</p>
      <form onSubmit={(event) => void registerSpace(event)}>
        <label htmlFor={spaceNameId}>{es ? "Nombre del espacio" : "Space name"}</label>
        <input id={spaceNameId} value={spaceName} onChange={(event) => setSpaceName(event.target.value)} maxLength={120} autoComplete="off" />
        <div style={{ marginTop: ".75rem" }}>
          <button type="submit" disabled={spaceBusy || spaceName.trim().length === 0}>{spaceBusy ? (es ? "Registrando…" : "Registering…") : (es ? "Registrar espacio" : "Register space")}</button>
        </div>
      </form>
      {spaceMessage ? <p role="status">{spaceMessage}</p> : null}
    </section>

    {spaces.length > 0 ? <ul aria-label={es ? "Tus espacios compartidos" : "Your shared spaces"} style={{ listStyle: "none", padding: 0, display: "grid", gap: "1rem", marginTop: "1.5rem" }}>
      {spaces.map((space) => <li key={space.id} style={{ border: "1px solid #d5dbea", borderRadius: 12, padding: "1rem" }}>
        <strong>{space.name}</strong>
        <SpaceInvitationForm lang={lang} space={space} onUnauthorized={onUnauthorized} />
        {ownedInvitations.filter((invitation) => invitation.spaceId === space.id).length > 0 ? <section aria-label={es ? `Accesos de ${space.name}` : `Access for ${space.name}`} style={{ marginTop: "1rem" }}>
          <h3>{es ? "Accesos activos" : "Active access"}</h3>
          <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: ".5rem" }}>
            {ownedInvitations.filter((invitation) => invitation.spaceId === space.id).map((invitation) => <li key={invitation.id}>
              <span>{invitation.inviteeAlias ?? (es ? "Invitado sin alias" : "Invitee without an alias")} · {invitation.status === "accepted" ? (es ? "aceptado" : "accepted") : (es ? "pendiente" : "pending")}</span>
              <button type="button" disabled={revokingInvitationId === invitation.id} onClick={() => void revokeInvitation(invitation)} style={{ marginLeft: ".75rem" }}>
                {revokingInvitationId === invitation.id ? (es ? "Revocando…" : "Revoking…") : (es ? "Revocar acceso" : "Revoke access")}
              </button>
            </li>)}
          </ul>
        </section> : null}
      </li>)}
    </ul> : <p role="status">{es ? "Aún no has registrado espacios para compartir." : "You have not registered any spaces to share yet."}</p>}
    {revocationMessage ? <p role="status">{revocationMessage}</p> : null}
  </section>;
}

