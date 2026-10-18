import type { PaidRosterOwnerView } from "./paidRosterOwnerView";

export function PaidRosterOwnerPanel({ lang, roster }: { lang: string; roster: PaidRosterOwnerView }) {
  const es = lang === "es";
  return <section aria-labelledby="paid-roster-heading">
    <h2 id="paid-roster-heading">{es ? "Cupos Team pagados" : "Paid Team seats"}</h2>
    <p>{es
      ? `${roster.occupied_seats} de ${roster.seat_limit} cupos ocupados · ${roster.available_slots} disponibles.`
      : `${roster.occupied_seats} of ${roster.seat_limit} seats occupied · ${roster.available_slots} available.`}</p>
    <p>{es
      ? "Este panel es solo de lectura. La asignación de empleados se habilitará únicamente con una invitación segura y aceptación autenticada; nunca con identificadores de usuario pegados."
      : "This panel is read-only. Employee assignment will be enabled only through a secure invitation and authenticated acceptance, never with pasted user identifiers."}</p>
    {roster.roster.length > 0 ? <ul>
      {roster.roster.map((member) => <li key={member.member_number}>
        {es ? `Miembro ${member.member_number}` : `Member ${member.member_number}`} · {member.eligible
          ? (es ? "cupo activo" : "active seat")
          : (es ? "sin cupo activo" : "not in an active seat")}
      </li>)}
    </ul> : <p>{es ? "No hay empleados asignados todavía." : "No employees are assigned yet."}</p>}
  </section>;
}
