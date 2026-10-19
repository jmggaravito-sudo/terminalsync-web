// @vitest-environment jsdom
import { createElement } from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ConversationTurn } from "./teamConversationClient";
import { TeamTextDeliveryPanel } from "./TeamTextDeliveryPanel";

const { authedFetch } = vi.hoisted(() => ({ authedFetch: vi.fn() }));
vi.mock("@/lib/supabase/browser", () => ({ authedFetch }));

const THREAD = "00000000-0000-4000-8000-000000000001";
const IN_TURN = "00000000-0000-4000-8000-000000000002";
const OUT_TURN = "00000000-0000-4000-8000-000000000003";
const DELIVERY = "00000000-0000-4000-8000-000000000004";
const createdAt = "2026-10-18T12:00:00.000Z";
const expiresAt = "2026-10-25T12:00:00.000Z";

function turn(id: string, direction: "inbound" | "outbound"): ConversationTurn {
  return { threadId: THREAD, id, kind: "context", status: "accepted", direction, metadata: {}, createdAt, respondedAt: createdAt, canRespond: false, canDeliver: direction === "inbound" };
}
const turns = [turn(IN_TURN, "inbound"), turn(OUT_TURN, "outbound")];
const inbox = () => ({ deliveries: [{ id: DELIVERY, turnId: OUT_TURN, createdAt, expiresAt }], nextCursor: null });
const response = (status: number, body: unknown) => ({ status, ok: status >= 200 && status < 300, json: async () => body });
const renderPanel = (onUnauthorized = vi.fn()) => ({
  onUnauthorized,
  ...render(createElement(TeamTextDeliveryPanel, { lang: "en", threadId: THREAD, turns, onUnauthorized })),
});

beforeEach(() => authedFetch.mockReset());
afterEach(() => cleanup());

describe("Team delivery panel interactions", () => {
  it("fetches metadata but never requests content until Open is explicitly clicked", async () => {
    authedFetch.mockResolvedValueOnce(response(200, inbox()));
    renderPanel();
    await screen.findByRole("button", { name: "Open message" });
    expect(authedFetch).toHaveBeenCalledTimes(1);
    expect(authedFetch.mock.calls[0][0]).toBe(`/api/team/deliveries?threadId=${THREAD}&limit=50`);
    expect(authedFetch.mock.calls[0][0]).not.toBe(`/api/team/deliveries/${DELIVERY}`);
  });

  it("fetches the selected delivery only on click and renders its returned text", async () => {
    authedFetch.mockResolvedValueOnce(response(200, inbox())).mockResolvedValueOnce(response(200, {
      delivery: { id: DELIVERY, content: "Selected approved text", createdAt, expiresAt },
    }));
    renderPanel();
    await userEvent.click(await screen.findByRole("button", { name: "Open message" }));
    expect(await screen.findByText("Selected approved text")).toBeTruthy();
    expect(authedFetch.mock.calls[1][0]).toBe(`/api/team/deliveries/${DELIVERY}`);
  });

  it("uses the unauthorized callback for a 401 and never exposes server error text", async () => {
    const onUnauthorized = vi.fn();
    authedFetch.mockResolvedValueOnce(response(200, inbox())).mockResolvedValueOnce(response(401, { error: "secret database detail" }));
    renderPanel(onUnauthorized);
    await userEvent.click(await screen.findByRole("button", { name: "Open message" }));
    await waitFor(() => expect(onUnauthorized).toHaveBeenCalledTimes(1));
    expect(screen.queryByText("secret database detail")).toBeNull();
  });

  it("shows a generic open error for server failures without leaking raw response content", async () => {
    authedFetch.mockResolvedValueOnce(response(200, inbox())).mockResolvedValueOnce(response(500, { error: "private backend trace" }));
    renderPanel();
    await userEvent.click(await screen.findByRole("button", { name: "Open message" }));
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.queryByText("private backend trace")).toBeNull();
  });

  it("retries an ambiguous send with the same operation id when the text is unchanged", async () => {
    authedFetch.mockResolvedValueOnce(response(200, inbox())).mockRejectedValueOnce(new Error("network unavailable")).mockResolvedValueOnce(response(201, {
      delivery: { id: DELIVERY, createdAt, expiresAt },
    }));
    renderPanel();
    const field = await screen.findByLabelText("Text to share");
    await userEvent.type(field, "Reviewed response");
    await userEvent.click(screen.getByRole("button", { name: "Send reviewed text" }));
    await screen.findByRole("alert");
    await userEvent.click(screen.getByRole("button", { name: "Send reviewed text" }));
    await screen.findByRole("status");
    const firstBody = JSON.parse(authedFetch.mock.calls[1][1].body);
    const retryBody = JSON.parse(authedFetch.mock.calls[2][1].body);
    expect(retryBody).toEqual(firstBody);
    expect(retryBody).toMatchObject({ content: "Reviewed response", operationId: expect.any(String) });
  });
});
