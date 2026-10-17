import { beforeEach, describe, expect, it, vi } from "vitest";
const { getSupabaseAdmin, teamMetadataRpc }=vi.hoisted(()=>({getSupabaseAdmin:vi.fn(),teamMetadataRpc:vi.fn()}));
vi.mock("@/lib/supabaseAdmin",()=>({getSupabaseAdmin})); vi.mock("@/lib/teamMetadata",()=>({teamMetadataRpc}));
import { GET, POST } from "./route";
describe("Team invitations API",()=>{
 beforeEach(()=>{vi.clearAllMocks();getSupabaseAdmin.mockReturnValue({auth:{getUser:vi.fn(async(t:string)=>t==="good"?{data:{user:{id:"verified"}},error:null}:{data:{user:null},error:new Error()})}});teamMetadataRpc.mockResolvedValue([{result:"unavailable"}]);});
 it("rejects unauthenticated callers before calling the RPC",async()=>{expect((await GET(new Request("https://x.test"))).status).toBe(401);expect(teamMetadataRpc).not.toHaveBeenCalled();});
 it("uses verified identity and does not pass body-supplied user identifiers",async()=>{const response=await POST(new Request("https://x.test",{method:"POST",headers:{authorization:"Bearer good","content-type":"application/json"},body:JSON.stringify({userId:"attacker",ownerId:"attacker",spaceId:"space",alias:"hidden"})}));expect(response.status).toBe(200);expect(teamMetadataRpc).toHaveBeenCalledWith("invite_team_alias",{p_user_id:"verified",p_space_id:"space",p_alias:"hidden"});});
 it("returns an identity-free non-enumerating unavailable result",async()=>{const response=await POST(new Request("https://x.test",{method:"POST",headers:{authorization:"Bearer good","content-type":"application/json"},body:JSON.stringify({spaceId:"space",alias:"does-not-exist"})}));const body=await response.text();expect(body).toContain("unavailable");expect(body).not.toContain("does-not-exist");});
});
