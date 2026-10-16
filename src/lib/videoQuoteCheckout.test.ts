import {describe, expect, it, vi} from "vitest";
vi.mock("server-only", () => ({}));
import {readVideoCheckoutTerms} from "./videoQuoteCheckout";

const hash = "a".repeat(64);
const auth = "Bearer session";
const good = () => Response.json({ok:true,checkout:{quoteId:"quote-1",jobId:"job-1",requestHash:hash,workspaceId:"workspace-1",amountMicros:600000,currency:"USD",expiresAtMs:Date.now()+60_000}});

describe("readVideoCheckoutTerms", () => {
  it("uses the authenticated executor authority and returns only exact quote terms", async () => {
    const fetcher = vi.fn(async () => good());
    await expect(readVideoCheckoutTerms({authorization:auth, quoteId:"quote-1", requestHash:hash, gatewayUrl:"https://video.example", fetcher})).resolves.toMatchObject({amountCents:60,amountMicros:600000,quoteId:"quote-1"});
    expect(fetcher).toHaveBeenCalledWith("https://video.example/v1/video/checkout-intent", expect.objectContaining({method:"POST",headers:expect.objectContaining({authorization:auth})}));
  });

  it.each([
    {gatewayUrl:"http://video.example", response:good()},
    {gatewayUrl:"https://video.example/path", response:good()},
    {gatewayUrl:"https://video.example", response:Response.json({ok:true,checkout:{quoteId:"quote-1",jobId:"job-1",requestHash:hash,workspaceId:"workspace-1",amountMicros:599999,currency:"USD",expiresAtMs:Date.now()+60_000}})},
    {gatewayUrl:"https://video.example", response:Response.json({ok:true,checkout:{quoteId:"quote-1",jobId:"job-1",requestHash:hash,workspaceId:"workspace-1",amountMicros:600000,currency:"USD",expiresAtMs:Date.now()-1}})},
  ])("fails closed for an unsafe endpoint or ineligible quote", async ({gatewayUrl,response}) => {
    await expect(readVideoCheckoutTerms({authorization:auth,quoteId:"quote-1",requestHash:hash,gatewayUrl,fetcher:async()=>response})).rejects.toThrow("quote_authority_unavailable");
  });

  it("does not accept a response for another quote", async () => {
    const response = Response.json({ok:true,checkout:{quoteId:"quote-other",jobId:"job-1",requestHash:hash,workspaceId:"workspace-1",amountMicros:600000,currency:"USD",expiresAtMs:Date.now()+60_000}});
    await expect(readVideoCheckoutTerms({authorization:auth,quoteId:"quote-1",requestHash:hash,gatewayUrl:"https://video.example",fetcher:async()=>response})).rejects.toThrow("quote_authority_unavailable");
  });
});
