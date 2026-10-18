import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";

const migration42 = readFileSync(join(process.cwd(), "supabase/migrations/0042_team_metadata_invites.sql"), "utf8");
const migration43 = readFileSync(join(process.cwd(), "supabase/migrations/0043_team_metadata_requests.sql"), "utf8");
const migration48 = readFileSync(join(process.cwd(), "supabase/migrations/0048_team_request_participant_projection.sql"), "utf8");
const migration55 = readFileSync(join(process.cwd(), "supabase/migrations/0055_team_legacy_approval_hardening.sql"), "utf8");

const owner = "00000000-0000-0000-0000-000000000001";
const member = "00000000-0000-0000-0000-000000000002";
const outsider = "00000000-0000-0000-0000-000000000003";
const hash = "a".repeat(64);

type RequestProjection = {
  id: string;
  space_id: string;
  space_name: string;
  role: string;
  can_respond: boolean;
  status: string;
  request_kind: string;
  metadata: Record<string, unknown>;
  created_at: string;
  responded_at: string | null;
};

async function fixture() {
  const db = new PGlite();
  await db.exec(`
    CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
    CREATE SCHEMA auth;
    CREATE TABLE auth.users(id uuid PRIMARY KEY);
    INSERT INTO auth.users VALUES ('${owner}'), ('${member}'), ('${outsider}');
    CREATE TABLE public.elig(user_id uuid PRIMARY KEY, eligible boolean NOT NULL);
    INSERT INTO public.elig VALUES ('${owner}', true), ('${member}', true), ('${outsider}', true);
    CREATE FUNCTION public.get_team_entitlement(p_user_id uuid)
    RETURNS TABLE(eligible boolean)
    LANGUAGE sql STABLE AS $$
      SELECT eligible FROM public.elig WHERE user_id = p_user_id
    $$;
    CREATE TABLE public.team_aliases(
      user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      alias text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE public.team_shared_spaces(
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
      description text,
      external_ref text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE public.team_space_invitations(
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      space_id uuid NOT NULL REFERENCES public.team_shared_spaces(id) ON DELETE CASCADE,
      inviter_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      invitee_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      invitee_email_hash text,
      status text NOT NULL DEFAULT 'pending',
      created_at timestamptz NOT NULL DEFAULT now(),
      responded_at timestamptz
    );
    CREATE TABLE public.team_space_requests(
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      space_id uuid NOT NULL REFERENCES public.team_shared_spaces(id) ON DELETE CASCADE,
      requester_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      status text NOT NULL DEFAULT 'pending',
      manifest_hash text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE(space_id, requester_user_id)
    );
  `);
  await db.exec(migration42);
  await db.exec(migration43);
  await db.exec(migration48);
  return db;
}

describe("Team legacy approval hardening migration 0055", () => {
  it("sanitizes legacy request rows, constrains direct writes, and projects count-only metadata", async () => {
    const db = await fixture();
    try {
      const safeSpace = (await db.query<{ id: string }>(`
        INSERT INTO public.team_shared_spaces(owner_user_id,name,description,external_ref)
        VALUES ($1::uuid,'Proyecto de Álex','legacy private description','legacy-private-ref')
        RETURNING id
      `, [owner])).rows[0].id;
      const unsafeSpace = (await db.query<{ id: string }>(`
        INSERT INTO public.team_shared_spaces(owner_user_id,name,description,external_ref)
        VALUES ($1::uuid,'https://private.example/space','legacy unsafe description','C:\\private\\external')
        RETURNING id
      `, [owner])).rows[0].id;
      await db.query(`
        INSERT INTO public.team_space_invitations(space_id,inviter_user_id,invitee_user_id,status,responded_at)
        VALUES ($1::uuid,$2::uuid,$3::uuid,'accepted',now()),
               ($4::uuid,$2::uuid,$3::uuid,'accepted',now())
      `, [safeSpace, owner, member, unsafeSpace]);
      const requestWithCount = (await db.query<{ id: string }>(`
        INSERT INTO public.team_space_requests(space_id,requester_user_id,status,manifest_hash,request_kind,metadata)
        VALUES ($1::uuid,$2::uuid,'pending',$3::text,'document',$4::jsonb)
        RETURNING id
      `, [safeSpace, member, hash, JSON.stringify({ label: "https://private.example/report", itemCount: 3 })])).rows[0].id;
      const requestWithOnlyText = (await db.query<{ id: string }>(`
        INSERT INTO public.team_space_requests(space_id,requester_user_id,status,manifest_hash,request_kind,metadata)
        VALUES ($1::uuid,$2::uuid,'pending',$3::text,'context',$4::jsonb)
        RETURNING id
      `, [unsafeSpace, member, hash, JSON.stringify({ category: "/Users/private/context" })])).rows[0].id;

      await db.exec(migration55);

      expect((await db.query<{ id: string; metadata: Record<string, unknown> }>(`
        SELECT id,metadata FROM public.team_space_requests ORDER BY id
      `)).rows).toEqual(expect.arrayContaining([
        { id: requestWithCount, metadata: { itemCount: 3 } },
        { id: requestWithOnlyText, metadata: {} },
      ]));
      await expect(db.query(`
        INSERT INTO public.team_space_requests(space_id,requester_user_id,status,manifest_hash,request_kind,metadata)
        VALUES ($1::uuid,$2::uuid,'pending',$3::text,'document',$4::jsonb)
      `, [safeSpace, outsider, hash, JSON.stringify({ content: "direct content must fail" })])).rejects.toThrow(/team_space_requests_metadata_safe_v3/);
      await expect(db.query(`
        UPDATE public.team_space_requests
        SET metadata = $1::jsonb WHERE id = $2::uuid
      `, [JSON.stringify({ url: "https://private.example/direct-write" }), requestWithCount])).rejects.toThrow(/team_space_requests_metadata_safe_v3/);
      await expect(db.query(`
        SELECT * FROM public.create_team_space_request($1::uuid,$2::uuid,'document',$3::text,$4::jsonb)
      `, [member, safeSpace, hash, JSON.stringify({ label: "legacy text must fail" })])).rejects.toThrow(/invalid request metadata/);

      const ownerProjection = (await db.query<RequestProjection>(`
        SELECT * FROM public.list_team_space_requests_v2($1::uuid) ORDER BY id
      `, [owner])).rows;
      expect(ownerProjection).toHaveLength(2);
      expect(ownerProjection.find((row) => row.id === requestWithCount)).toMatchObject({
        role: "owner", can_respond: true, metadata: { itemCount: 3 },
      });
      expect(ownerProjection.find((row) => row.id === requestWithOnlyText)).toMatchObject({
        role: "owner", can_respond: true, metadata: {},
      });
      const serialized = JSON.stringify(ownerProjection);
      for (const privateValue of [
        "https://private.example/report", "/Users/private/context", "legacy unsafe description",
        "legacy-private-ref", "C:\\private\\external", hash, owner, member,
      ]) {
        expect(serialized).not.toContain(privateValue);
      }
      expect(Object.keys(ownerProjection[0]).sort()).toEqual([
        "can_respond", "created_at", "id", "metadata", "request_kind", "responded_at", "role", "space_id", "space_name", "status",
      ]);
      expect((await db.query<{ metadata: Record<string, unknown> }>(`
        SELECT metadata FROM public.list_team_space_requests($1::uuid) WHERE id = $2::uuid
      `, [owner, requestWithCount])).rows[0].metadata).toEqual({ itemCount: 3 });
      expect((await db.query<{ ok: boolean }>(`
        SELECT has_function_privilege('authenticated','public._team_is_safe_legacy_request_metadata_v3(jsonb)','EXECUTE') AS ok
      `)).rows[0].ok).toBe(false);
    } finally {
      await db.close();
    }
  }, 15_000);

  it("normalizes only safe Spanish display names and keeps legacy fields private", async () => {
    const db = await fixture();
    try {
      const unsafeSpace = (await db.query<{ id: string }>(`
        INSERT INTO public.team_shared_spaces(owner_user_id,name,description,external_ref)
        VALUES ($1::uuid,'https://private.example/space','private description','/private/external/ref')
        RETURNING id
      `, [owner])).rows[0].id;
      await db.query(`
        INSERT INTO public.team_space_invitations(space_id,inviter_user_id,invitee_user_id,status,responded_at)
        VALUES ($1::uuid,$2::uuid,$3::uuid,'accepted',now())
      `, [unsafeSpace, owner, member]);

      await db.exec(migration55);

      expect((await db.query<{
        name: string; legacy_name: string | null; description: string | null; external_ref: string | null;
      }>(`
        SELECT name,legacy_name,description,external_ref FROM public.team_shared_spaces WHERE id=$1::uuid
      `, [unsafeSpace])).rows[0]).toEqual({
        name: "Espacio compartido",
        legacy_name: "https://private.example/space",
        description: "private description",
        external_ref: "/private/external/ref",
      });
      await expect(db.query(`
        INSERT INTO public.team_shared_spaces(owner_user_id,name) VALUES ($1::uuid,$2)
      `, [owner, "Proyecto https://private.example"])).rejects.toThrow(/team_shared_spaces_display_name_safe_v3/);
      await expect(db.query(`
        SELECT * FROM public.register_team_space($1::uuid,$2,NULL,NULL)
      `, [owner, "Espacio Ágil 2 de Alex"])).resolves.toMatchObject({ rows: [expect.objectContaining({ name: "Espacio Ágil 2 de Alex" })] });
      for (const [name, description, externalRef] of [
        ["Ruta /privada", null, null],
        ["Nombre\nprivado", null, null],
        ["Equipo de Alex", "description is not accepted", null],
        ["Equipo de Alex", null, "external-ref is not accepted"],
      ] as const) {
        await expect(db.query(`
          SELECT * FROM public.register_team_space($1::uuid,$2,$3,$4)
        `, [owner, name, description, externalRef])).rejects.toThrow(/invalid metadata/);
      }

      const invitations = (await db.query<Record<string, unknown>>(`
        SELECT * FROM public.list_team_invitations_v2($1::uuid)
      `, [member])).rows;
      expect(invitations).toHaveLength(1);
      expect(invitations[0]).toMatchObject({ space_id: unsafeSpace, space_name: "Espacio compartido", role: "invitee" });
      expect(Object.keys(invitations[0]).sort()).toEqual([
        "created_at", "id", "owner_alias", "responded_at", "role", "space_id", "space_name", "status",
      ]);
      const serialized = JSON.stringify(invitations);
      for (const privateValue of [
        "https://private.example/space", "private description", "/private/external/ref", owner, member,
      ]) {
        expect(serialized).not.toContain(privateValue);
      }
      expect((await db.query<{ ok: boolean }>(`
        SELECT has_function_privilege('authenticated','public._team_is_safe_space_display_name_v3(text)','EXECUTE') AS ok
      `)).rows[0].ok).toBe(false);
    } finally {
      await db.close();
    }
  }, 15_000);
});
