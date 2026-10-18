import { NextResponse } from "next/server";
import { teamMetadataFailure, teamMetadataRpc, verifiedTeamUser } from "@/lib/teamMetadata";

export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const REQUEST_STATUS = new Set(["pending", "accepted", "declined", "withdrawn"]);

type RequestCreationConfirmation = { id: string; status: string };

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
  if (typeof record.id !== "string" || !UUID.test(record.id) || typeof record.status !== "string" || !REQUEST_STATUS.has(record.status)) return null;
  return { id: record.id, status: record.status };
}

export async function GET(req: Request) {
  try {
    const user = await verifiedTeamUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json(await teamMetadataRpc("list_team_space_requests_v2", { p_user_id: user.id }));
  } catch (error) {
    const failure = teamMetadataFailure(error, "Could not list requests");
    return NextResponse.json({ error: failure.status === 503 ? "Could not list requests" : failure.error }, { status: failure.status });
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifiedTeamUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const metadata = body?.metadata ?? {};
    if (
      !body || typeof body.spaceId !== "string" || !UUID.test(body.spaceId) ||
      !["document", "context"].includes(body.kind) || typeof body.manifestHash !== "string" || !/^[0-9a-f]{64}$/.test(body.manifestHash) ||
      !metadata || typeof metadata !== "object" || Array.isArray(metadata) || new TextEncoder().encode(JSON.stringify(metadata)).length > 2048 ||
      Object.keys(metadata).some((key) => !["label", "category", "itemCount"].includes(key)) ||
      ["label", "category"].some((key) => metadata[key] !== undefined && (typeof metadata[key] !== "string" || metadata[key].length > 120)) ||
      (metadata.itemCount !== undefined && (typeof metadata.itemCount !== "number" || !Number.isInteger(metadata.itemCount) || metadata.itemCount < 0 || metadata.itemCount > 1_000_000))
    ) {
      return NextResponse.json({ error: "Invalid request metadata" }, { status: 400 });
    }
    const result = await teamMetadataRpc<unknown>("create_team_space_request", {
      p_user_id: user.id,
      p_space_id: body.spaceId,
      p_request_kind: body.kind,
      p_manifest_hash: body.manifestHash,
      p_metadata: metadata,
    });
    const confirmation = requestCreationConfirmation(result);
    if (!confirmation) return NextResponse.json({ error: "Request was not created" }, { status: 409 });
    return NextResponse.json(confirmation);
  } catch (error) {
    const failure = teamMetadataFailure(error, "Could not create request");
    return NextResponse.json({ error: failure.status === 503 ? "Could not create request" : failure.error }, { status: failure.status });
  }
}
