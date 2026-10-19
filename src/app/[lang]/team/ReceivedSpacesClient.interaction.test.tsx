// @vitest-environment jsdom
import { createElement } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { authedFetch } = vi.hoisted(() => ({ authedFetch: vi.fn() }));
vi.mock("@/lib/supabase/browser", () => ({ authedFetch }));

import { ReceivedSpacesClient } from "./ReceivedSpacesClient";

function response(status: number, body: unknown): Response {
  return { status, ok: status >= 200 && status < 300, json: async () => body } as Response;
}

beforeEach(() => authedFetch.mockReset());

describe("Team trial entry interaction", () => {
  it("keeps the no-card trial claim available when an auxiliary list is temporarily unavailable", async () => {
    authedFetch
      .mockResolvedValueOnce(response(200, { eligible: false, seat_limit: 1, source: null, expires_at: null }))
      .mockResolvedValueOnce(response(503, { error: "private backend detail" }))
      .mockResolvedValueOnce(response(200, []))
      .mockResolvedValueOnce(response(404, {}))
      .mockResolvedValueOnce(response(404, {}))
      .mockResolvedValue(response(404, {}));

    render(createElement(ReceivedSpacesClient, { lang: "en" }));

    const claim = await screen.findByRole("button", { name: "Claim Team trial" });
    expect(claim).toBeTruthy();
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.queryByText("private backend detail")).toBeNull();
    expect(authedFetch).toHaveBeenCalledWith("/api/team/trial");
    expect(authedFetch).not.toHaveBeenCalledWith("/api/team/trial", { method: "POST" });
    expect(authedFetch.mock.calls.slice(0, 5).map(([input]) => input)).toEqual([
      "/api/team/trial",
      "/api/team/invitations",
      "/api/team/requests",
      "/api/team/paid-roster",
      "/api/team/spaces",
    ]);
  });
});
