import { describe, expect, it } from "vitest";
import { displayConversationThread, partitionConversationThreads } from "./teamConversationCollections";
import type { ConversationThread } from "./teamConversationClient";
import type { OwnedTeamSpace } from "./teamSharedSpaces";
import type { ReceivedInvitation } from "./receivedSpaces";

const OWNED_SPACE = "00000000-0000-0000-0000-000000000011";
const RECEIVED_SPACE = "00000000-0000-0000-0000-000000000012";
const UNKNOWN_SPACE = "00000000-0000-0000-0000-000000000013";
const INVITATION = "00000000-0000-0000-0000-000000000021";

const ownedSpaces: OwnedTeamSpace[] = [{
  id: OWNED_SPACE,
  name: "Planeación",
  createdAt: "2026-10-19T00:00:00.000Z",
}];
const receivedSpaces: ReceivedInvitation[] = [{
  id: INVITATION,
  space_id: RECEIVED_SPACE,
  space_name: "Planeación",
  owner_alias: "alex",
  role: "invitee",
  status: "accepted",
  created_at: "2026-10-19T00:00:00.000Z",
}];

function thread(threadId: string, spaceId: string, spaceName = "Planeación"): ConversationThread {
  return {
    threadId,
    spaceId,
    spaceName,
    lastActivityAt: "2026-10-19T00:00:00.000Z",
  };
}

describe("Team conversation thread collections", () => {
  it("keeps matching names separated and retains the received owner alias", () => {
    const owned = thread("00000000-0000-0000-0000-000000000031", OWNED_SPACE);
    const received = thread("00000000-0000-0000-0000-000000000032", RECEIVED_SPACE);
    const collections = partitionConversationThreads([owned, received], ownedSpaces, receivedSpaces, "es");

    expect(collections.owned.map((row) => row.label)).toEqual(["Planeación"]);
    expect(collections.received.map((row) => row.label)).toEqual(["Planeación de alex"]);
  });

  it("fails closed by keeping an unrecognised source out of primary spaces", () => {
    const unknown = thread("00000000-0000-0000-0000-000000000033", UNKNOWN_SPACE, "Finanzas");
    const display = displayConversationThread(unknown, ownedSpaces, receivedSpaces, "es");

    expect(display).toMatchObject({ source: "received", label: "Finanzas · espacio compartido" });
  });
});
