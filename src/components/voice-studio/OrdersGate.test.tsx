// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OrdersGate } from "./OrdersGate";

const { getSupabaseBrowser } = vi.hoisted(() => ({ getSupabaseBrowser: vi.fn() }));

vi.mock("@/lib/supabase/browser", () => ({ getSupabaseBrowser }));
vi.mock("./VsLoginButtons", () => ({ VsLoginButtons: () => <span>Sign-in options</span> }));

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

const pack = {
  id: "78c69255-27be-485a-90af-e6092a207d80",
  sku: "pack4",
  starts_at: "2020-01-01T00:00:00Z",
  ends_at: "2099-01-01T00:00:00Z",
  video_total: 4,
  video_used: 1,
  short_total: 4,
  short_used: 1,
};

const single = {
  ...pack,
  id: "92850361-5fa7-4afd-93a8-9e1cad9e1c7b",
  sku: "single",
  ends_at: null,
  video_total: 1,
  video_used: 0,
  short_total: 0,
  short_used: 0,
};

const dashboard = {
  ok: true,
  email: "client@example.test",
  licenseStatus: "signed",
  licenseUrl: null,
  entitlements: [pack, single],
  orders: [],
  legacyOrders: [],
};

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
  vi.unstubAllGlobals();
});

describe("Voice Studio customer dashboard", () => {
  it("puts the license at the top and hides the submission form when pending", async () => {
    const fetch = vi.fn().mockResolvedValue(response({
      ...dashboard, licenseStatus: "pending", licenseUrl: "/voice-studio/license?t=test",
    }));
    vi.stubGlobal("fetch", fetch);
    render(<OrdersGate token="signed+link" />);
    expect(await screen.findByRole("link", { name: "Review and sign voice license" })).toBeTruthy();
    expect(screen.queryByRole("textbox", { name: "YouTube link" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Submit videos for dubbing" })).toBeNull();
    expect(screen.getByRole("heading", { name: "Deliveries (0)" })).toBeTruthy();
  });

  it("loads a signed-link customer's balances, queue, legacy orders and delivered files", async () => {
    const baseOrder = {
      notes: "",
      created_at: "2025-03-01T10:00:00Z",
      short_mode: "best_moment",
      short_timestamp: null,
    };
    const fetch = vi.fn().mockResolvedValueOnce(response({
      ...dashboard,
      orders: [
        {
          ...baseOrder,
          id: "queued",
          source_url: "https://youtu.be/queued12345",
          status: "in_progress",
          video_url: null,
          short_url: null,
        },
        {
          ...baseOrder,
          id: "delivered",
          source_url: "https://youtu.be/deliv123456",
          status: "delivered",
          video_url: "https://files.example.test/spanish.mp4",
          short_url: "https://files.example.test/short.mp4",
        },
      ],
      legacyOrders: [{ name: "old", url: "https://youtu.be/legacy12345", status: "Closed" }],
    }));
    vi.stubGlobal("fetch", fetch);
    render(<OrdersGate token="signed+link" />);

    expect(await screen.findByText("3 Shorts/Reels left")).toBeTruthy();
    expect(screen.getByText("3 video credits left")).toBeTruthy();
    expect(screen.getByText("In production")).toBeTruthy();
    expect(screen.getByText("https://youtu.be/legacy12345")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Download dubbed video" }).getAttribute("href"))
      .toBe("https://files.example.test/spanish.mp4");
    expect(screen.getByRole("link", { name: "Download Short/Reel" }).getAttribute("href"))
      .toBe("https://files.example.test/short.mp4");
    expect(fetch.mock.calls[0][0]).toBe("/api/voice-studio/orders?t=signed%2Blink");
  });

  it("posts the timestamp preference per video and reuses the request ID after an unchanged retry", async () => {
    const attempts: Array<Record<string, unknown>> = [];
    const fetch = vi.fn(async (_url: string, init?: RequestInit) => {
      if (init?.method !== "POST") return response(dashboard);
      attempts.push(JSON.parse(String(init.body)) as Record<string, unknown>);
      if (attempts.length < 3) throw new Error("Network interrupted");
      return response({ ok: true, orders: [] });
    });
    vi.stubGlobal("fetch", fetch);
    render(<OrdersGate token="signed" />);
    const url = await screen.findByRole("textbox", { name: "YouTube link" });
    fireEvent.change(url, { target: { value: "https://youtu.be/abcdefghijk" } });
    fireEvent.change(screen.getByRole("combobox", { name: "Spanish Short/Reel included" }), {
      target: { value: "timestamp" },
    });
    const timestamp = screen.getByRole("textbox", { name: /starting timestamp/i });
    fireEvent.change(timestamp, { target: { value: "03:45" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Production notes (optional)" }), {
      target: { value: "Keep the original intro." },
    });
    fireEvent.click(screen.getByRole("button", { name: "+ Add another video" }));
    fireEvent.change(screen.getAllByRole("textbox", { name: "YouTube link" })[1], {
      target: { value: "https://youtu.be/lmnopqrstuv" },
    });
    const submit = () => fireEvent.click(screen.getByRole("button", { name: "Submit videos for dubbing" }));
    submit();
    await screen.findByRole("alert");
    submit();
    await waitFor(() => expect(attempts).toHaveLength(2));
    await screen.findByRole("alert");
    fireEvent.change(timestamp, { target: { value: "04:00" } });
    submit();

    expect(await screen.findByText("2 videos added to your queue.")).toBeTruthy();
    expect(attempts).toHaveLength(3);
    expect(attempts[0]).toMatchObject({
      token: "signed",
      entitlementId: pack.id,
      orders: [
        {
          source_url: "https://youtu.be/abcdefghijk",
          notes: "Keep the original intro.",
          short_mode: "timestamp",
          short_timestamp: "03:45",
        },
        {
          source_url: "https://youtu.be/lmnopqrstuv",
          notes: "",
          short_mode: "best_moment",
          short_timestamp: null,
        },
      ],
    });
    expect(attempts[1].requestId).toBe(attempts[0].requestId);
    expect(attempts[2].requestId).not.toBe(attempts[0].requestId);
    expect(attempts[2].orders).toMatchObject([{ short_timestamp: "04:00" }, { short_timestamp: null }]);
  });

  it("disables submissions without an eligible plan and warns about unavailable legacy orders", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(response({
      ...dashboard,
      entitlements: [{ ...pack, short_used: 4 }],
      legacyOrdersAvailable: false,
    })));
    render(<OrdersGate token="signed" />);

    expect(await screen.findByText("0 Shorts/Reels left")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Submit videos for dubbing" })).toBeNull();
    expect(screen.getByText(/previous orders are temporarily unavailable/i)).toBeTruthy();
  });

  it("authenticates by Bearer and submits without a short for a single-video plan", async () => {
    const session = { access_token: "test-jwt", user: { id: "customer" } };
    const unsubscribe = vi.fn();
    getSupabaseBrowser.mockReturnValue({
      auth: {
        onAuthStateChange(callback: (_event: string, value: typeof session) => void) {
          queueMicrotask(() => callback("INITIAL_SESSION", session));
          return { data: { subscription: { unsubscribe } } };
        },
        getSession: async () => ({ data: { session } }),
      },
    });
    const fetch = vi.fn(async (_url: string, init?: RequestInit) => response(
      init?.method === "POST" ? { ok: true, orders: [] } : { ...dashboard, entitlements: [single] },
    ));
    vi.stubGlobal("fetch", fetch);
    render(<OrdersGate />);

    const url = await screen.findByRole("textbox", { name: "YouTube link" });
    expect(screen.queryByLabelText("Spanish Short/Reel included")).toBeNull();
    fireEvent.change(url, { target: { value: "https://youtu.be/abcdefghijk" } });
    fireEvent.click(screen.getByRole("button", { name: "Submit videos for dubbing" }));
    await screen.findByText("Video added to your queue.");
    const post = fetch.mock.calls.find(([, init]) => init?.method === "POST")?.[1];
    expect(post?.headers).toMatchObject({ Authorization: "Bearer test-jwt" });
    expect(JSON.parse(String(post?.body))).toMatchObject({
      entitlementId: single.id,
      orders: [{ short_mode: "none", short_timestamp: null }],
    });
    expect(fetch.mock.calls[0][1]?.headers).toMatchObject({ Authorization: "Bearer test-jwt" });
  });
});
