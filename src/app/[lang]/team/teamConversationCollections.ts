import { receivedSpaceLabel, type ReceivedInvitation } from "./receivedSpaces";
import type { OwnedTeamSpace } from "./teamSharedSpaces";
import type { ConversationThread } from "./teamConversationClient";

export type ConversationThreadDisplay = {
  thread: ConversationThread;
  /** `received` is deliberately the fail-closed default for an unknown source. */
  source: "owned" | "received";
  label: string;
};

function anonymousReceivedLabel(spaceName: string, lang: string): string {
  return lang === "es"
    ? `${spaceName} · espacio compartido`
    : `${spaceName} · shared space`;
}

/**
 * A thread list must not make an external/shared source look like one of the
 * recipient's own workspaces.  Only the separately loaded owner-space list
 * may classify a source as owned.  Every other source stays in the received
 * collection, and, when the accepted invitation is still available, keeps its
 * safe `"<space> de <owner alias>"` label.
 */
export function displayConversationThread(
  thread: ConversationThread,
  ownedSpaces: OwnedTeamSpace[],
  receivedSpaces: ReceivedInvitation[],
  lang: string,
): ConversationThreadDisplay {
  if (ownedSpaces.some((space) => space.id === thread.spaceId)) {
    return { thread, source: "owned", label: thread.spaceName };
  }

  const invitation = receivedSpaces.find((space) => space.space_id === thread.spaceId && space.status === "accepted");
  return {
    thread,
    source: "received",
    label: invitation ? receivedSpaceLabel(invitation, lang) : anonymousReceivedLabel(thread.spaceName, lang),
  };
}

/** Partition the conversation index without ever folding an unknown source into primary spaces. */
export function partitionConversationThreads(
  threads: ConversationThread[],
  ownedSpaces: OwnedTeamSpace[],
  receivedSpaces: ReceivedInvitation[],
  lang: string,
): { owned: ConversationThreadDisplay[]; received: ConversationThreadDisplay[] } {
  const owned: ConversationThreadDisplay[] = [];
  const received: ConversationThreadDisplay[] = [];
  for (const thread of threads) {
    const display = displayConversationThread(thread, ownedSpaces, receivedSpaces, lang);
    (display.source === "owned" ? owned : received).push(display);
  }
  return { owned, received };
}
