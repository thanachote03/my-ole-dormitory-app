-- ═══════════════════════════════════════════════════════════════════════════
-- AUTH MIGRATION — link existing tenants to Supabase Auth users
-- ═══════════════════════════════════════════════════════════════════════════
-- Run AFTER setup.sql. Run BEFORE rls-production.sql.
--
-- What this does:
--   1) Adds `auth_id` (uuid) to tenants so we can map auth users → tenant records
--   2) Adds an index for fast lookup
--   3) Provides a stored proc to create Supabase Auth users for existing tenants
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS auth_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tenants_auth ON public.tenants(auth_id);

-- ─── Owner identification ─────────────────────────────────────────────
-- The owner is identified by raw_user_meta_data->>'role' = 'owner'.
-- After creating the owner user in Supabase Dashboard, mark them:
--
--   UPDATE auth.users
--      SET raw_user_meta_data = raw_user_meta_data || '{"role":"owner"}'::jsonb
--    WHERE email = 'owner@yourdorm.com';
--
-- Or set it via Dashboard → Authentication → Users → click user → "User metadata" tab.

-- ─── Tenant linking ───────────────────────────────────────────────────
-- For each tenant, set their auth_id and tag the auth user with tenant_id:
--
--   1. Create the auth user via Dashboard or programmatically (see below)
--   2. UPDATE public.tenants SET auth_id = '<uuid>' WHERE id = 'T1';
--   3. UPDATE auth.users
--         SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('tenant_id','T1','role','tenant')
--       WHERE id = '<uuid>';
--
-- A helper function automates step 3 once auth_id is set:

CREATE OR REPLACE FUNCTION public.sync_tenant_auth_metadata()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.auth_id IS NOT NULL AND NEW.auth_id IS DISTINCT FROM OLD.auth_id THEN
    UPDATE auth.users
       SET raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
                              || jsonb_build_object('tenant_id', NEW.id, 'role', 'tenant')
     WHERE id = NEW.auth_id;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_sync_tenant_auth ON public.tenants;
CREATE TRIGGER trg_sync_tenant_auth
  AFTER UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.sync_tenant_auth_metadata();

-- ═══════════════════════════════════════════════════════════════════════════
-- DONE.
--
-- NEXT STEPS:
--   1. Create owner account:
--      Dashboard → Authentication → Add user → email/password
--      Then: UPDATE auth.users SET raw_user_meta_data = '{"role":"owner"}'::jsonb WHERE email='your@email';
--   2. Create tenant accounts (one per tenant) — see scripts/create-tenant-auth.mjs
--   3. Run rls-production.sql to lock down access
-- ═══════════════════════════════════════════════════════════════════════════
