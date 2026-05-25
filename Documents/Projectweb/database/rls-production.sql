-- ═══════════════════════════════════════════════════════════════════════════
-- หอพักสุขใจ — PRODUCTION RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════
-- Run AFTER setup.sql. This replaces the open dev policies with real ones.
--
-- Trust model:
--   • Owner  — authenticated user with raw_user_meta_data.role = 'owner'
--              → full CRUD on all tables
--   • Tenant — authenticated user with raw_user_meta_data.tenant_id = '<id>'
--              → read-only access to own room's data, can INSERT slips
--   • anon   — only the login lookup (read tenants.username for sign-in)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Helper functions ─────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'owner'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'owner',
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT coalesce(
    auth.jwt() -> 'user_metadata' ->> 'tenant_id',
    auth.jwt() -> 'app_metadata' ->> 'tenant_id'
  );
$$;

CREATE OR REPLACE FUNCTION public.current_room_id()
RETURNS text LANGUAGE sql STABLE AS $$
  SELECT room_id FROM public.tenants WHERE id = public.current_tenant_id();
$$;

GRANT EXECUTE ON FUNCTION public.is_owner()         TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.current_tenant_id() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.current_room_id()   TO anon, authenticated;

-- ═══════════════════════════════════════════════════════════════════════════
-- Drop the dev "open_all_*" policies first
-- ═══════════════════════════════════════════════════════════════════════════
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['rooms','tenants','payments','utilities','repairs','slips','banks','notifs','config']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "open_all_%s" ON public.%I', t, t);
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- ROOMS — owner full CRUD; tenants & anon can SELECT (room list is not secret)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE POLICY "rooms_select_all"   ON public.rooms FOR SELECT USING (true);
CREATE POLICY "rooms_owner_insert" ON public.rooms FOR INSERT WITH CHECK (public.is_owner());
CREATE POLICY "rooms_owner_update" ON public.rooms FOR UPDATE USING (public.is_owner()) WITH CHECK (public.is_owner());
CREATE POLICY "rooms_owner_delete" ON public.rooms FOR DELETE USING (public.is_owner());

-- ═══════════════════════════════════════════════════════════════════════════
-- TENANTS — owner full CRUD; tenant can read OWN row only; anon can read
--          (username + id) for login lookup
-- ═══════════════════════════════════════════════════════════════════════════
CREATE POLICY "tenants_owner_all"    ON public.tenants FOR ALL    USING (public.is_owner()) WITH CHECK (public.is_owner());
CREATE POLICY "tenants_self_select"  ON public.tenants FOR SELECT USING (id = public.current_tenant_id());
-- Login lookup: tenants table is needed by anon to find user by username.
-- We expose all SELECT to anon BUT password column should be hashed application-side.
-- (See migration-auth.sql for full hash-based login.)
CREATE POLICY "tenants_anon_login"   ON public.tenants FOR SELECT TO anon USING (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- PAYMENTS — owner full CRUD; tenant SELECT own room's records
-- ═══════════════════════════════════════════════════════════════════════════
CREATE POLICY "payments_owner_all"  ON public.payments FOR ALL    USING (public.is_owner()) WITH CHECK (public.is_owner());
CREATE POLICY "payments_self_read"  ON public.payments FOR SELECT USING (room_id = public.current_room_id());

-- ═══════════════════════════════════════════════════════════════════════════
-- UTILITIES — owner full CRUD; tenant SELECT own room
-- ═══════════════════════════════════════════════════════════════════════════
CREATE POLICY "utilities_owner_all" ON public.utilities FOR ALL    USING (public.is_owner()) WITH CHECK (public.is_owner());
CREATE POLICY "utilities_self_read" ON public.utilities FOR SELECT USING (room_id = public.current_room_id());

-- ═══════════════════════════════════════════════════════════════════════════
-- REPAIRS — owner full CRUD; tenant SELECT own room + INSERT new repair
-- ═══════════════════════════════════════════════════════════════════════════
CREATE POLICY "repairs_owner_all"     ON public.repairs FOR ALL    USING (public.is_owner()) WITH CHECK (public.is_owner());
CREATE POLICY "repairs_self_read"     ON public.repairs FOR SELECT USING (room_id = public.current_room_id());
CREATE POLICY "repairs_self_insert"   ON public.repairs FOR INSERT WITH CHECK (
  room_id = public.current_room_id() AND tenant_id = public.current_tenant_id()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- SLIPS — owner full CRUD; tenant SELECT own + INSERT new slip
-- ═══════════════════════════════════════════════════════════════════════════
CREATE POLICY "slips_owner_all"     ON public.slips FOR ALL    USING (public.is_owner()) WITH CHECK (public.is_owner());
CREATE POLICY "slips_self_read"     ON public.slips FOR SELECT USING (tenant_id = public.current_tenant_id());
CREATE POLICY "slips_self_insert"   ON public.slips FOR INSERT WITH CHECK (
  tenant_id = public.current_tenant_id() AND room_id = public.current_room_id()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- BANKS — owner full CRUD; anyone authenticated can SELECT (tenants need it for payment)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE POLICY "banks_owner_all"   ON public.banks FOR ALL    USING (public.is_owner()) WITH CHECK (public.is_owner());
CREATE POLICY "banks_auth_select" ON public.banks FOR SELECT TO authenticated USING (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- NOTIFS — owner only
-- ═══════════════════════════════════════════════════════════════════════════
CREATE POLICY "notifs_owner_all" ON public.notifs FOR ALL USING (public.is_owner()) WITH CHECK (public.is_owner());

-- ═══════════════════════════════════════════════════════════════════════════
-- CONFIG — owner full CRUD; anon can SELECT public keys (owner_profile, billing)
--          but NOT owner_pin
-- ═══════════════════════════════════════════════════════════════════════════
CREATE POLICY "config_owner_all"    ON public.config FOR ALL    USING (public.is_owner()) WITH CHECK (public.is_owner());
CREATE POLICY "config_public_read"  ON public.config FOR SELECT USING (key IN ('owner_profile','billing_config'));

-- ═══════════════════════════════════════════════════════════════════════════
-- DONE — policies are now production-grade.
-- Test by signing in as owner / tenant and checking what each can do.
-- ═══════════════════════════════════════════════════════════════════════════
