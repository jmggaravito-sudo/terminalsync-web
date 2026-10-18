import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { ConversationTurn } from "./teamConversationClient";
import { TeamTextDeliveryPanel } from "./TeamTextDeliveryPanel";

const THREAD = "00000000-0000-4000-8000-000000000001";
const TURN = "00000000-0000-4000-8000-000000000002";
const common = {
  threadId: THREAD,
  id: TURN,
  kind: "context" as const,
  metadata: {},
  createdAt: "2026-10-18T12:00:00.000Z",
  respondedAt: "2026-10-18T12:01:00.000Z",
  canRespond: false,
};

const renderPanel = (turns: ConversationTurn[]) => renderToStaticMarkup(createElement(TeamTextDeliveryPanel, {
  lang: "es", threadId: THREAD, turns, onUnauthorized: vi.fn(),
}));

describe("Team text delivery controls", () => {
  it("renders no delivery controls until a matching turn is accepted", () => {
    const pending = renderPanel([{ ...common, status: "pending", respondedAt: null, direction: "inbound", canRespond: true }]);
    expect(pending).not.toContain("textarea");
    expect(pending).not.toContain("Abrir mensaje");
    expect(pending).not.toContain("Mensajes recibidos");
  });

  it("offers only the approver's explicit text composer for an accepted inbound turn", () => {
    const html = renderPanel([{ ...common, status: "accepted", direction: "inbound" }]);
    expect(html).toContain("Preparar respuesta de texto");
    expect(html).toContain("Enviar texto revisado");
    expect(html).toContain("no se genera ni se envía contenido automáticamente");
    expect(html).not.toContain("type=\"file\"");
  });

  it("shows an explicit-open metadata inbox for accepted outbound turns", () => {
    const html = renderPanel([{ ...common, status: "accepted", direction: "outbound" }]);
    expect(html).toContain("Mensajes recibidos");
    expect(html).toContain("La lista contiene solo metadatos");
    expect(html).not.toContain("<pre");
    expect(html).not.toContain("textarea");
  });
});
