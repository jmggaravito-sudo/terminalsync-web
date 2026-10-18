import { teamJson } from "@/lib/teamApiResponse";
import { TeamMetadataError, teamMetadataFailure, teamMetadataRpc, verifiedTeamUser } from "@/lib/teamMetadata";
import { isSafeTeamSpaceDisplayName } from "@/lib/teamSpaceDisplayName";

export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const REQUEST_STATUSES = new Set(["pending", "accepted", "declined", "withdrawn"]);

type RequestCreationConfirmation = { id: string; status: string };
type SafeRequestMetadata = Partial<{ itemCount: number }>;
type SafeRequest = {
  id: string;
  space_id: string;
  space_name: string;
  role: "owner" | "requester";
  can_respond: boolean;
  status: "pending" | "accepted" | "declined" | "withdrawn";
  request_kind: "document" | "context";
  metadata: SafeRequestMetadata;
  created_at: string;
  responded_at: string | null;
};

function validDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function safeRequestMetadata(value: unknown): SafeRequestMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TeamMetadataError("Unexpected Team request metadata");
  }
  const record = value as Record<string, unknown>;
  if (Object.keys(record).some((key) => key !== "itemCount")) {
    throw new TeamMetadataError("Unexpected Team request metadata");
  }
  if (new TextEncoder().encode(JSON.stringify(record)).length > 64) {
    throw new TeamMetadataError("Unexpected Team request metadata");
  }
  const metadata: SafeRequestMetadata = {};
  if (record.itemCount !== undefined) {
    if (typeof record.itemCount !== "number" || !Number.isInteger(record.itemCount) || record.itemCount < 0 || record.itemCount > 1_000_000) {
      throw new TeamMetadataError("Unexpected Team request metadata");
    }
    metadata.itemCount = record.itemCount;
  }
  return metadata;
}

/**
 * The v2 SQL function avoids user IDs and manifest hashes, but JSON must still
 * be projected at the HTTP boundary. In particular, a legacy metadata object
 * must never become an arbitrary browser payload.
 */
function safeRequestList(value: unknown): SafeRequest[] {
  if (!Array.isArray(value)) throw new TeamMetadataError("Unexpected Team requests result");
  const ids = new Set<string>();
  return value.map((row) => {
    if (!row || typeof row !== "object" || Array.isArray(row)) {
      throw new TeamMetadataError("Unexpected Team request row");
    }
    const record = row as Record<string, unknown>;
    const { id, space_id, space_name, role, can_respond, status, request_kind, metadata, created_at, responded_at } = record;
    if (
      typeof id !== "string" || !UUID.test(id) || ids.has(id) ||
      typeof space_id !== "string" || !UUID.test(space_id) ||
      !isSafeTeamSpaceDisplayName(space_name) ||
      (role !== "owner" && role !== "requester") || typeof can_respond !== "boolean" ||
      typeof status !== "string" || !REQUEST_STATUSES.has(status) ||
      (request_kind !== "document" && request_kind !== "context") ||
      !validDate(created_at) || (responded_at !== null && !validDate(responded_at)) ||
      (status === "pending" ? responded_at !== null : responded_at === null) ||
      can_respond !== (role === "owner" && status === "pending")
    ) {
      throw new TeamMetadataError("Unexpected Team request row");
    }
    ids.add(id);
    return {
      id,
      space_id,
      space_name,
      role,
      can_respond,
      status: status as SafeRequest["status"],
      request_kind,
      metadata: safeRequestMetadata(metadata),
      created_at,
      responded_at,
    };
  });
}

/**
 * The legacy create RPC includes the manifest hash and request metadata in its
 * row. A browser only needs an opaque request handle and terminal/pending
 * state, so every other column is deliberately discarded.
 */
function requestCreationConfirmation(value: unknown): RequestCreationConfirmation | null {
  if (!Array.isArray(value) || value.length !== 1) return null;
  const row = value[0];
  if (!row || typeof row !== "object" || Array.isArray(row)) return null;
  const record = row as Record<string, unknown>;
  if (typeof record.id !== "string" || !UUID.test(record.id) || typeof record.status !== "string" || !REQUEST_STATUSES.has(record.status)) return null;
  return { id: record.id, status: record.status };
}

export async function GET(req: Request) {
  try {
    const user = await verifiedTeamUser(req);
    if (!user) return teamJson({ error: "Unauthorized" }, { status: 401 });
    const result = await teamMetadataRpc<unknown>("list_team_space_requests_v2", { p_user_id: user.id });
    return teamJson(safeRequestList(result));
  } catch (error) {
    const failure = teamMetadataFailure(error, "Could not list requests");
    return teamJson({ error: failure.status === 503 ? "Could not list requests" : failure.error }, { status: failure.status });
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifiedTeamUser(req);
    if (!user) return teamJson({ error: "Unauthorized" }, { status: 401 });
    const body: unknown = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return teamJson({ error: "Invalid request metadata" }, { status: 400 });
    }
    const record = body as Record<string, unknown>;
    // A legacy request remains a consent prompt, never a browser content
    // channel. Reject rather than silently discard arbitrary body fields.
    if (Object.keys(record).some((key) => !["spaceId", "kind", "manifestHash", "metadata"].includes(key))) {
      return teamJson({ error: "Invalid request metadata" }, { status: 400 });
    }
    const metadata = record.metadata === undefined ? {} : record.metadata;
    if (
      typeof record.spaceId !== "string" || !UUID.test(record.spaceId) ||
      !["document", "context"].includes(record.kind as string) || typeof record.manifestHash !== "string" || !/^[0-9a-f]{64}$/.test(record.manifestHash) ||
      !metadata || typeof metadata !== "object" || Array.isArray(metadata)
    ) {
      return teamJson({ error: "Invalid request metadata" }, { status: 400 });
    }
    const safeMetadata = metadata as Record<string, unknown>;
    if (
      new TextEncoder().encode(JSON.stringify(safeMetadata)).length > 64 ||
      Object.keys(safeMetadata).some((key) => key !== "itemCount") ||
      (safeMetadata.itemCount !== undefined && (typeof safeMetadata.itemCount !== "number" || !Number.isInteger(safeMetadata.itemCount) || safeMetadata.itemCount < 0 || safeMetadata.itemCount > 1_000_000))
    ) {
      return teamJson({ error: "Invalid request metadata" }, { status: 400 });
    }
    const result = await teamMetadataRpc<unknown>("create_team_space_request", {
      p_user_id: user.id,
      p_space_id: record.spaceId,
      p_request_kind: record.kind,
      p_manifest_hash: record.manifestHash,
      p_metadata: safeMetadata,
    });
    const confirmation = requestCreationConfirmation(result);
    if (!confirmation) return teamJson({ error: "Request was not created" }, { status: 409 });
    return teamJson(confirmation);
  } catch (error) {
    const failure = teamMetadataFailure(error, "Could not create request");
    return teamJson({ error: failure.status === 503 ? "Could not create request" : failure.error }, { status: failure.status });
  }
}
