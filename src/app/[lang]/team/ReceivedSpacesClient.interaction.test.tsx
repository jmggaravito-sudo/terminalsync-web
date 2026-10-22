// @vitest-environment jsdom
import { createElement } from "react";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { authedFetch } = vi.hoisted(() => ({ authedFetch: vi.fn() }));
vi.mock("@/lib/supabase/browser", () => ({ authedFetch }));

import { ReceivedSpacesClient } from "./ReceivedSpacesClient";

function response(status: number, body: unknown): Response {
  return { status, ok: status >= 200 && status < 300, json: async () => body } as Response;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

function expectInitialTrialRead() {
  const call = authedFetch.mock.calls.find(([input, init]) => input === "/api/team/trial" && (init as RequestInit | undefined)?.method === undefined);
  expect(call).toBeTruthy();
  const signal = (call?.[1] as RequestInit | undefined)?.signal;
  expect(signal).toBeTruthy();
  return signal!;
}

function expectNoAutomaticTrialPost() {
  expect(authedFetch.mock.calls.some(([input, init]) => input === "/api/team/trial" && (init as RequestInit | undefined)?.method === "POST")).toBe(false);
}

afterEach(cleanup);
beforeEach(() => authedFetch.mockReset());

describe("Team trial entry interaction", () => {
  it("keeps the no-card trial claim available when an auxiliary list is temporarily unavailable", async () => {
    authedFetch
      .mockResolvedValueOnce(response(200, { eligible: false, seat_limit: 1, source: null, expires_at: null }))
      .mockResolvedValueOnce(response(503, { error: "private backend detail" }))
      .mockResolvedValueOnce(response(200, []))
      .mockResolvedValueOnce(response(404, {}))
      .mockResolvedValue(response(404, {}));

    render(createElement(ReceivedSpacesClient, { lang: "en" }));

    const claim = await screen.findByRole("button", { name: "Claim Team trial" });
    expect(claim).toBeTruthy();
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.queryByText("private backend detail")).toBeNull();
    expectInitialTrialRead();
    expectNoAutomaticTrialPost();
    expect(authedFetch.mock.calls.slice(0, 4).map(([input]) => input)).toEqual([
      "/api/team/trial",
      "/api/team/invitations",
      "/api/team/requests",
      "/api/team/spaces",
    ]);
    expect(authedFetch).not.toHaveBeenCalledWith("/api/team/paid-roster", expect.anything());
    expect(screen.queryByRole("heading", { name: "Private Team seat invitations" })).toBeNull();
  });

  it("reads and shows paid-roster controls only after the paid rollout is enabled and confirms an active roster", async () => {
    authedFetch
      .mockResolvedValueOnce(response(200, { eligible: false, seat_limit: 1, source: null, expires_at: null }))
      .mockResolvedValueOnce(response(200, []))
      .mockResolvedValueOnce(response(200, []))
      .mockResolvedValueOnce(response(200, {
        has_active_team: true,
        seat_limit: 2,
        assigned_count: 0,
        occupied_seats: 1,
        available_slots: 1,
        roster: [],
      }))
      .mockResolvedValueOnce(response(404, {}));

    render(createElement(ReceivedSpacesClient, { lang: "en", paidRosterEnabled: true }));

    expect(await screen.findByRole("heading", { name: "Paid Team seats" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Private Team seat invitations" })).toBeTruthy();
    expect(authedFetch.mock.calls.slice(0, 5).map(([input]) => input)).toEqual([
      "/api/team/trial",
      "/api/team/invitations",
      "/api/team/requests",
      "/api/team/paid-roster",
      "/api/team/spaces",
    ]);
  });

  it("keeps paid-roster controls hidden when the paid rollout has no active roster", async () => {
    authedFetch
      .mockResolvedValueOnce(response(200, { eligible: false, seat_limit: 1, source: null, expires_at: null }))
      .mockResolvedValueOnce(response(200, []))
      .mockResolvedValueOnce(response(200, []))
      .mockResolvedValueOnce(response(403, {}))
      .mockResolvedValueOnce(response(404, {}));

    render(createElement(ReceivedSpacesClient, { lang: "en", paidRosterEnabled: true }));

    expect(await screen.findByRole("button", { name: "Claim Team trial" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Paid Team seats" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Private Team seat invitations" })).toBeNull();
  });

  it("keeps the no-card trial claim available when an auxiliary list rejects at transport level", async () => {
    authedFetch
      .mockResolvedValueOnce(response(200, { eligible: false, seat_limit: 1, source: null, expires_at: null }))
      .mockRejectedValueOnce(new Error("temporary transport failure"))
      .mockResolvedValueOnce(response(200, []))
      .mockResolvedValueOnce(response(404, {}))
      .mockResolvedValue(response(404, {}));

    render(createElement(ReceivedSpacesClient, { lang: "en" }));

    const claim = await screen.findByRole("button", { name: "Claim Team trial" });
    expect(claim).toBeTruthy();
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.queryByText("temporary transport failure")).toBeNull();
    expectInitialTrialRead();
    expectNoAutomaticTrialPost();
    expect(authedFetch.mock.calls.slice(0, 4).map(([input]) => input)).toEqual([
      "/api/team/trial",
      "/api/team/invitations",
      "/api/team/requests",
      "/api/team/spaces",
    ]);
  });

  it("keeps the no-card trial claim available when the request list rejects at transport level", async () => {
    authedFetch
      .mockResolvedValueOnce(response(200, { eligible: false, seat_limit: 1, source: null, expires_at: null }))
      .mockResolvedValueOnce(response(200, []))
      .mockRejectedValueOnce(new Error("temporary request transport failure"))
      .mockResolvedValueOnce(response(404, {}))
      .mockResolvedValue(response(404, {}));

    render(createElement(ReceivedSpacesClient, { lang: "en" }));

    expect(await screen.findByRole("button", { name: "Claim Team trial" })).toBeTruthy();
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.queryByText("temporary request transport failure")).toBeNull();
    expectInitialTrialRead();
    expectNoAutomaticTrialPost();
  });

  it("still treats a resolved auxiliary 401 as unauthorized", async () => {
    authedFetch
      .mockResolvedValueOnce(response(200, { eligible: false, seat_limit: 1, source: null, expires_at: null }))
      .mockResolvedValueOnce(response(401, {}))
      .mockResolvedValueOnce(response(200, []))
      .mockResolvedValueOnce(response(404, {}))
      .mockResolvedValue(response(404, {}));

    render(createElement(ReceivedSpacesClient, { lang: "en" }));

    expect(await screen.findByText("Sign in to view your invitations.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Claim Team trial" })).toBeNull();
    expectNoAutomaticTrialPost();
  });

  it("aborts the initial GET and ignores a late response after unmount", async () => {
    const pendingEntitlement = deferred<Response>();
    const staleJson = vi.fn(async () => ({ eligible: false, seat_limit: 1, source: null, expires_at: null }));
    const staleResponse = { status: 200, ok: true, json: staleJson } as unknown as Response;
    authedFetch
      .mockImplementationOnce(() => pendingEntitlement.promise)
      .mockResolvedValueOnce(response(200, []))
      .mockResolvedValueOnce(response(200, []))
      .mockResolvedValueOnce(response(404, {}));

    const { unmount } = render(createElement(ReceivedSpacesClient, { lang: "en" }));
    // The entitlement endpoint is the server-verified admission gate. No
    // invitations, requests, spaces, or roster reads may start before it
    // completes successfully.
    await waitFor(() => expect(authedFetch).toHaveBeenCalledTimes(1));
    const signal = expectInitialTrialRead();
    expect(signal.aborted).toBe(false);

    unmount();
    expect(signal.aborted).toBe(true);
    await act(async () => {
      pendingEntitlement.resolve(staleResponse);
      await Promise.resolve();
    });

    expect(staleJson).not.toHaveBeenCalled();
    expectNoAutomaticTrialPost();
  });

  it("keeps a newer reload when an older request settles after it", async () => {
    const pendingEntitlement = deferred<Response>();
    const staleJson = vi.fn(async () => ({ eligible: true, seat_limit: 1, source: "stale", expires_at: null }));
    const staleResponse = { status: 200, ok: true, json: staleJson } as unknown as Response;
    authedFetch
      .mockImplementationOnce(() => pendingEntitlement.promise)
      .mockResolvedValueOnce(response(200, { eligible: false, seat_limit: 1, source: null, expires_at: null }))
      .mockResolvedValueOnce(response(200, []))
      .mockResolvedValueOnce(response(200, []))
      .mockResolvedValueOnce(response(404, {}));

    const { rerender } = render(createElement(ReceivedSpacesClient, { lang: "en" }));
    await waitFor(() => expect(authedFetch).toHaveBeenCalledTimes(1));
    const staleSignal = expectInitialTrialRead();

    rerender(createElement(ReceivedSpacesClient, { lang: "es" }));
    await waitFor(() => expect(authedFetch).toHaveBeenCalledTimes(5));
    expect(staleSignal.aborted).toBe(true);
    expect(await screen.findByRole("button", { name: "Iniciar prueba Team" })).toBeTruthy();

    await act(async () => {
      pendingEntitlement.resolve(staleResponse);
      await Promise.resolve();
    });

    expect(staleJson).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Iniciar prueba Team" })).toBeTruthy();
    expectNoAutomaticTrialPost();
  });

  it("does not probe auxiliary Team APIs or render controls when the server denies smoke access", async () => {
    authedFetch.mockResolvedValueOnce(response(503, { error: "unavailable" }));

    render(createElement(ReceivedSpacesClient, { lang: "en", paidRosterEnabled: true }));

    expect(await screen.findByText("Team is not available to this account during this controlled smoke.")).toBeTruthy();
    expect(authedFetch).toHaveBeenCalledTimes(1);
    expect(authedFetch).toHaveBeenCalledWith("/api/team/trial", expect.anything());
    expect(screen.queryByRole("button", { name: "Claim Team trial" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Paid Team seats" })).toBeNull();
    expectNoAutomaticTrialPost();
  });
});
