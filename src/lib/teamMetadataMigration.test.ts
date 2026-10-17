import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const sql=readFileSync(new URL("../../supabase/migrations/0042_team_metadata_invites.sql",import.meta.url),"utf8").toLowerCase();
describe("Team metadata migration boundary",()=>{
 it("defines service-only, server-authorized metadata RPCs",()=>{ for(const fn of ["claim_team_alias","register_team_space","list_team_spaces","invite_team_alias","respond_team_invitation","list_team_invitations"]) expect(sql).toContain(`function public.${fn}`); expect(sql).toContain("get_team_entitlement"); expect(sql).toContain("revoke all on function"); expect(sql).toContain("from public, anon, authenticated"); expect(sql).toContain("to service_role"); });
 it("has no payload, ciphertext, decryption, or legacy subscription-plan path",()=>{ for(const forbidden of ["ciphertext","decrypt(","payload","subscriptions.plan","content_bytes","delivery"]) expect(sql).not.toContain(forbidden); });
 it("bounds aliases and metadata and checks invitation ownership and terminal state",()=>{ expect(sql).toContain("^[a-z0-9][a-z0-9._-]{1,28}[a-z0-9]$"); expect(sql).toContain("char_length(coalesce(p_description,''))>500"); expect(sql).toContain("s.owner_user_id=p_user_id"); expect(sql).toContain("where id=p_invitation_id and invitee_user_id=p_user_id for update"); expect(sql).toContain("if inv.status<>'pending'"); });
});
