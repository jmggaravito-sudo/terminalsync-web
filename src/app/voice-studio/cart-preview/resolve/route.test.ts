import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const request = (link: string) => new Request("https://test.invalid", {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ link }),
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("Voice Studio cart preview links", () => {
  it("rejects old demo links", async () => {
    const response = await POST(request("https://voice-studio.example/45-seconds"));
    expect(response.status).toBe(400);
  });

  it("does not fetch a user-supplied host or invent a duration", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    vi.stubEnv("VOICE_STUDIO_PREVIEW_YOUTUBE_API_KEY", "");
    expect((await POST(request("https://youtube.com.example/watch?v=dQw4w9WgXcQ"))).status).toBe(400);
    expect((await POST(request("https://www.youtube.com/watch?v=dQw4w9WgXcQ"))).status).toBe(503);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("reads full duration from the fixed API endpoint, ignoring a playback timestamp", async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ items: [{
      contentDetails: { duration: "PT15M" },
      snippet: { title: "Example video", liveBroadcastContent: "none" },
    }] }));
    vi.stubGlobal("fetch", fetcher);
    vi.stubEnv("VOICE_STUDIO_PREVIEW_YOUTUBE_API_KEY", "test-key");
    const response = await POST(request("https://www.youtube.com/watch?v=MGaM162-OH8&t=822s"));
    expect(await response.json()).toMatchObject({ id: "youtube-MGaM162-OH8", seconds: 900 });
    const endpoint = fetcher.mock.calls[0][0] as URL;
    expect(endpoint.origin).toBe("https://www.googleapis.com");
    expect(endpoint.searchParams.get("id")).toBe("MGaM162-OH8");
    expect(endpoint.searchParams.has("t")).toBe(false);
  });
});
