/**
 * Datos del admin "Integraciones por país".
 *
 * Todo sale del frontmatter de las fichas (`content/connectors/es/*.md`):
 * `markets`, `installableForAi`, `installableForAiReason`, `verifiedAt`,
 * `verifiedPackageVersion`. Es una función pura sobre `ConnectorMeta[]` — no
 * hace red. En particular NO corre el smoke de login de los conectores
 * remotos: eso necesita red y una cuenta, y no se hace al renderizar.
 *
 * Honestidad de las etiquetas: "Funcionando y supervisado" significa que el
 * chequeo técnico de la supervisión pasó (el paquete arrancó y respondió con
 * herramientas). NO significa que un cliente lo haya usado.
 */

import type { ConnectorMeta, ConnectorInstallableForAiReason } from "./connectors";
import {
  GLOBAL_MARKET,
  MARKETS,
  marketLabel,
  type MarketCode,
} from "./markets";

export type SupervisionStatus =
  | "working" // Funcionando y supervisado
  | "login-pending" // Instalable, pero login/clave sin probar con una cuenta real
  | "blocked" // La supervisión lo marcó como no instalable
  | "unverified"; // Sin resultado de supervisión

export type ConnectionKind =
  | "remote-login" // servidor hospedado + login OAuth en el navegador
  | "remote-token" // servidor hospedado + token/encabezado propio
  | "token" // paquete local que pide una clave
  | "local" // paquete local sin credenciales
  | "none"; // sin conector MCP en el catálogo (se conecta en la app o aún no existe)

export interface IntegrationRow {
  slug: string;
  name: string;
  category: string;
  markets: MarketCode[];
  connection: ConnectionKind;
  status: SupervisionStatus;
  reason: ConnectorInstallableForAiReason | null;
  /** Explicación en español llano del estado (siempre presente). */
  explanation: string;
  verifiedAt: string | null;
  verifiedPackageVersion: string | null;
  aiToolsCount: number | null;
  firstParty: boolean;
}

export const STATUS_LABEL_ES: Record<SupervisionStatus, string> = {
  working: "Funcionando y supervisado",
  "login-pending": "Instalable, login sin probar con cuenta",
  blocked: "Bloqueado",
  unverified: "No verificado",
};
export const STATUS_LABEL_EN: Record<SupervisionStatus, string> = {
  working: "Working and supervised",
  "login-pending": "Installable, login not tested with an account",
  blocked: "Blocked",
  unverified: "Not verified",
};

export const CONNECTION_LABEL_ES: Record<ConnectionKind, string> = {
  "remote-login": "Remoto con login",
  "remote-token": "Remoto con token",
  token: "Local con clave",
  local: "Local",
  none: "Sin conector MCP",
};
export const CONNECTION_LABEL_EN: Record<ConnectionKind, string> = {
  "remote-login": "Remote, login",
  "remote-token": "Remote, token",
  token: "Local, key",
  local: "Local",
  none: "No MCP connector",
};

/** Motivo de la supervisión en español llano. */
const REASON_ES: Record<ConnectorInstallableForAiReason, string> = {
  ok: "El paquete se instaló, arrancó y respondió con herramientas utilizables. No significa que un cliente lo haya usado.",
  "remote-needs-login":
    "Es un servidor remoto: se llegó hasta el paso de login, pero nadie ha entrado con una cuenta real para probar las herramientas.",
  "unverified-needs-key":
    "El paquete existe y se instala, pero necesita una clave que la supervisión no tiene, así que no se probó con una cuenta real.",
  "no-manifest": "Todavía no tiene un conector instalable en el catálogo (no hay manifest).",
  "recipe-not-npx": "Su receta de instalación no es un paquete npx que la IA pueda arrancar sola.",
  "package-invalid": "El nombre o la versión del paquete no es válido.",
  "install-failed": "El paquete no se pudo instalar en la prueba.",
  "no-entrypoint": "El paquete se instala pero no tiene un archivo de arranque ejecutable.",
  "handshake-timeout": "El conector arrancó pero no respondió a tiempo al saludo del protocolo.",
  "no-jsonrpc-id": "El conector responde con un formato que la IA no puede usar (falta el identificador del mensaje).",
  "no-usable-tools": "El conector arrancó pero no expone herramientas que la IA pueda usar.",
  "needs-postinstall": "El paquete necesita un paso extra de instalación que la IA no puede hacer sola.",
  "env-denied": "El conector exige variables de entorno que la IA no tiene permitidas.",
  "needs-oauth": "Requiere autorizar con OAuth (un login en el navegador) antes de poder probarlo; esa autorización no está resuelta.",
};

export function connectionKind(c: ConnectorMeta): ConnectionKind {
  if (!c.hasManifest) return "none";
  const remote =
    typeof c.installSpec === "string" && c.installSpec.startsWith("mcp-remote");
  if (remote) return c.requiresEnvSecrets ? "remote-token" : "remote-login";
  return c.requiresEnvSecrets ? "token" : "local";
}

export function supervisionStatus(c: ConnectorMeta): {
  status: SupervisionStatus;
  explanation: string;
} {
  if (c.firstParty) {
    return {
      status: "unverified",
      explanation:
        "Sidecar propio de TerminalSync: no entra en la supervisión de conectores externos, así que no tiene resultado aquí.",
    };
  }
  if (typeof c.installableForAi !== "boolean") {
    return {
      status: "unverified",
      explanation: "La supervisión todavía no ha evaluado este conector.",
    };
  }
  const reason = c.installableForAiReason;
  const detail = reason ? REASON_ES[reason] : "";
  if (c.installableForAi === false) {
    return {
      status: "blocked",
      explanation: detail || "La supervisión lo marcó como no instalable.",
    };
  }
  if (reason === "ok") return { status: "working", explanation: detail };
  // installableForAi true con remote-needs-login / unverified-needs-key (o sin motivo)
  return {
    status: "login-pending",
    explanation:
      detail || "Es instalable, pero falta probarlo con una cuenta real.",
  };
}

export function buildIntegrationRows(connectors: ConnectorMeta[]): IntegrationRow[] {
  return connectors
    .filter((c) => !c.hidden && c.status === "available")
    .map((c) => {
      const { status, explanation } = supervisionStatus(c);
      return {
        slug: c.slug,
        name: c.name,
        category: c.category,
        markets: c.markets ?? [],
        connection: connectionKind(c),
        status,
        reason: c.installableForAiReason ?? null,
        explanation,
        verifiedAt: c.verifiedAt ?? null,
        verifiedPackageVersion: c.verifiedPackageVersion ?? null,
        aiToolsCount: c.aiToolsCount ?? null,
        firstParty: c.firstParty === true,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Vistas del admin. */
export type StatusView = "working" | "installable" | "all";

function inView(status: SupervisionStatus, view: StatusView): boolean {
  if (view === "all") return true;
  if (view === "working") return status === "working";
  return status === "working" || status === "login-pending";
}

export interface RowFilter {
  /** Código de mercado o "ALL". "GLOBAL" muestra solo las globales. */
  country: MarketCode | "ALL";
  query: string;
  view: StatusView;
}

function normalize(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/**
 * Una integración global aplica a todos los países: al filtrar por un país
 * concreto se incluyen también las globales (si no, "Colombia" mostraría solo
 * Siigo y Alegra). El filtro "GLOBAL" muestra solo las globales.
 */
export function rowMatchesCountry(row: IntegrationRow, country: MarketCode | "ALL"): boolean {
  if (country === "ALL") return true;
  if (country === GLOBAL_MARKET) return row.markets.includes(GLOBAL_MARKET);
  return row.markets.includes(country) || row.markets.includes(GLOBAL_MARKET);
}

export function filterRows(rows: IntegrationRow[], f: RowFilter): IntegrationRow[] {
  const q = normalize(f.query.trim());
  return rows.filter(
    (r) =>
      inView(r.status, f.view) &&
      rowMatchesCountry(r, f.country) &&
      (q === "" || normalize(r.name).includes(q) || normalize(r.slug).includes(q)),
  );
}

export interface CountryCount {
  code: MarketCode;
  /** Integraciones disponibles en ese país (incluye las globales salvo para GLOBAL). */
  total: number;
  /** De esas, las "Funcionando y supervisado". */
  supervised: number;
  /** Las de mercado propio (sin contar las globales). */
  specific: number;
}

/** Conteo por país sobre todas las filas (independiente del texto y de la vista). */
export function countByCountry(rows: IntegrationRow[]): CountryCount[] {
  const codes = Object.keys(MARKETS) as MarketCode[];
  const out: CountryCount[] = [];
  for (const code of codes) {
    const hit = rows.filter((r) => rowMatchesCountry(r, code));
    if (hit.length === 0) continue;
    out.push({
      code,
      total: hit.length,
      supervised: hit.filter((r) => r.status === "working").length,
      specific: hit.filter((r) => !r.markets.includes(GLOBAL_MARKET)).length,
    });
  }
  const region = (c: MarketCode) => ({ global: 0, us: 1, latam: 2, other: 3 })[MARKETS[c].region];
  return out.sort(
    (a, b) =>
      region(a.code) - region(b.code) ||
      b.total - a.total ||
      a.code.localeCompare(b.code),
  );
}

/** "12 integraciones para Colombia: 9 supervisadas" */
export function summaryLine(
  rows: IntegrationRow[],
  country: MarketCode | "ALL",
  lang: string,
): string {
  const hit = rows.filter((r) => rowMatchesCountry(r, country));
  const sup = hit.filter((r) => r.status === "working").length;
  const login = hit.filter((r) => r.status === "login-pending").length;
  const es = lang !== "en";
  const where =
    country === "ALL"
      ? es ? "todos los países" : "all countries"
      : marketLabel(country, lang);
  const n = hit.length;
  if (es) {
    return `${n} ${n === 1 ? "integración" : "integraciones"} para ${where}: ${sup} ${sup === 1 ? "supervisada" : "supervisadas"} (funcionando), ${login} con login por probar.`;
  }
  return `${n} ${n === 1 ? "integration" : "integrations"} for ${where}: ${sup} supervised (working), ${login} with login still to test.`;
}
