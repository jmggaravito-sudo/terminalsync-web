/**
 * Datos del prestador del servicio para el Aviso legal (LSSI-CE art. 10).
 *
 * BORRADOR: lo que consta en el repo y en la documentación de JM va como
 * `value`; lo que NO consta va como `pending` con la pregunta concreta. No se
 * inventa ningún NIF, número de registro ni representante. Mientras haya
 * `pending`, `LEGAL_ES_PUBLIC` debe seguir en `false` (lo vigila
 * `legalEs.test.ts`).
 */

export type Bilingual = { es: string; en: string };

export type LegalField = {
  key: string;
  label: Bilingual;
  /** Dato que consta. */
  value?: Bilingual | string;
  /** Qué falta y quién lo decide. Solo se muestra en modo borrador. */
  pending?: Bilingual;
};

export const LEGAL_DOCS_VERSION = "2026-10-16";

export const PROVIDER_FIELDS: LegalField[] = [
  {
    key: "name",
    label: { es: "Denominación social", en: "Company name" },
    value: "Marca E-Commerce LLC",
    pending: {
      es: "JM confirmó la denominación («Marca E-Commerce LLC», 24-nov-2026); queda por confirmar si además interviene «AM Importaciones SAS LLC» y su relación con la anterior",
      en: "JM confirmed the company name (“Marca E-Commerce LLC”, Nov 24 2026); still to confirm whether “AM Importaciones SAS LLC” is also involved and how it relates to the former",
    },
  },
  {
    key: "form",
    label: { es: "Forma jurídica y país", en: "Legal form and country" },
    value: {
      es: "Sociedad de responsabilidad limitada (LLC) constituida en el estado de Florida, Estados Unidos",
      en: "Limited liability company (LLC) organised in the State of Florida, United States",
    },
  },
  {
    key: "address",
    label: { es: "Domicilio", en: "Address" },
    value: "8614 W State Rd 84, Davie, FL 33324, Estados Unidos",
    pending: {
      es: "confirmar con JM que este es el domicilio a publicar (los Términos actuales dicen solo «sede en Miami, Florida»)",
      en: "confirm with JM that this is the address to publish (the current Terms only say “based in Miami, Florida”)",
    },
  },
  {
    key: "email",
    label: { es: "Correo electrónico de contacto", en: "Contact email" },
    value: "legal@terminalsync.ai",
  },
  {
    key: "registry",
    label: {
      es: "Datos registrales",
      en: "Registration details",
    },
    pending: {
      es: "número de documento en la Division of Corporations de Florida (Sunbiz) y fecha de constitución; decide el abogado qué dato registral es exigible a un prestador no establecido en España",
      en: "Florida Division of Corporations (Sunbiz) document number and incorporation date; the lawyer decides which registration data is required for a provider not established in Spain",
    },
  },
  {
    key: "taxId",
    label: {
      es: "Número de identificación fiscal",
      en: "Tax identification number",
    },
    pending: {
      es: "EIN u otro identificador fiscal que deba publicarse; no consta NIF/CIF español. Decide el abogado y el asesor fiscal (ver documento 13, apartado 1)",
      en: "EIN or other tax identifier to publish; no Spanish NIF/CIF on record. Lawyer and tax adviser to decide (see document 13, section 1)",
    },
  },
  {
    key: "euRep",
    label: {
      es: "Representante en la Unión Europea (RGPD art. 27)",
      en: "EU representative (GDPR art. 27)",
    },
    pending: {
      es: "decidir si hace falta representante en la UE y, si la respuesta es sí, nombre y datos de contacto",
      en: "decide whether an EU representative is needed and, if so, name and contact details",
    },
  },
];

/** Contactos ya publicados en el sitio (Términos, Privacidad, pie). */
export const CONTACTS = {
  legal: "legal@terminalsync.ai",
  privacy: "privacy@terminalsync.ai",
  general: "hola@terminalsync.ai",
} as const;

/** Campos con algo por completar o confirmar (con o sin valor provisional). */
export function openItems(): LegalField[] {
  return PROVIDER_FIELDS.filter((f) => f.pending);
}
