-- ═══════════════════════════════════════════════════════════════════════════
-- หอพักสุขใจ — Dormitory Management System Database Schema
-- ═══════════════════════════════════════════════════════════════════════════
-- Target: Supabase (PostgreSQL)
-- Usage:  Open Supabase Dashboard → SQL Editor → paste this file → Run
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1) ROOMS ─────────────────────────────────────────────────────────
-- Each physical room. Meter readings persist here so they survive tenant move-outs.
CREATE TABLE IF NOT EXISTS public.rooms (
  id              text         PRIMARY KEY,
  floor           int          NOT NULL DEFAULT 1,
  type            text         NOT NULL DEFAULT 'เดี่ยว',
  price           numeric(10,2) NOT NULL DEFAULT 0,
  status          text         NOT NULL DEFAULT 'ว่าง',  -- 'ว่าง' | 'ไม่ว่าง'
  amenities       text[]       NOT NULL DEFAULT '{}'::text[],
  -- Meter readings persisted on room (survive tenant change)
  "lastElecMeter"  numeric(10,2),
  "lastWaterMeter" numeric(10,2),
  "lastMeterYear"  int,
  "lastMeterMonth" int,
  created_at      timestamptz  NOT NULL DEFAULT now()
);

-- If table exists from older schema where amenities was jsonb, migrate to text[]
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema='public' AND table_name='rooms' AND column_name='amenities' AND data_type='jsonb'
  ) THEN
    ALTER TABLE public.rooms ALTER COLUMN amenities TYPE text[]
      USING ARRAY(SELECT jsonb_array_elements_text(amenities));
    ALTER TABLE public.rooms ALTER COLUMN amenities SET DEFAULT '{}'::text[];
  END IF;
END $$;

-- Backfill meter columns on older deployments missing them
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS "lastElecMeter"  numeric(10,2);
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS "lastWaterMeter" numeric(10,2);
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS "lastMeterYear"  int;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS "lastMeterMonth" int;

-- ─── 2) TENANTS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tenants (
  id              text         PRIMARY KEY,
  name            text         NOT NULL,
  room_id         text         REFERENCES public.rooms(id) ON DELETE SET NULL,
  phone           text         DEFAULT '',
  since_y         int,
  since_m         int,
  since_day       int          DEFAULT 1,
  username        text,
  password        text,
  -- Personal info & docs (optional)
  email           text         DEFAULT '',
  address         text         DEFAULT '',
  "idCardNumber"  text         DEFAULT '',
  "idCardImage"   text         DEFAULT '',
  "emergencyName" text         DEFAULT '',
  "emergencyPhone" text        DEFAULT '',
  -- Eviction tracking
  evicted         boolean      NOT NULL DEFAULT false,
  evicted_y       int,
  evicted_m       int,
  evicted_day     int,
  prev_room       text,
  created_at      timestamptz  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tenants_room ON public.tenants(room_id);

-- ─── 3) PAYMENTS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payments (
  id              bigserial    PRIMARY KEY,
  room_id         text         NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  year            int          NOT NULL,
  month           int          NOT NULL,    -- 0-based (0=Jan)
  amount          numeric(10,2) NOT NULL DEFAULT 0,
  status          text         NOT NULL DEFAULT 'รอชำระ',  -- 'ชำระแล้ว' | 'รอชำระ'
  paid_at         text,         -- store as Thai-formatted date string
  created_at      timestamptz  NOT NULL DEFAULT now(),
  UNIQUE (room_id, year, month)
);
CREATE INDEX IF NOT EXISTS idx_payments_room      ON public.payments(room_id);
CREATE INDEX IF NOT EXISTS idx_payments_yearmonth ON public.payments(year, month);

-- ─── 4) UTILITIES (water/electricity meter readings) ──────────────────
CREATE TABLE IF NOT EXISTS public.utilities (
  id              bigserial    PRIMARY KEY,
  room_id         text         NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  year            int          NOT NULL,
  month           int          NOT NULL,
  elec_prev       numeric(10,2) DEFAULT 0,
  elec_cur        numeric(10,2) DEFAULT 0,
  elec_use        numeric(10,2) DEFAULT 0,
  elec_amount     numeric(10,2) DEFAULT 0,
  water_prev      numeric(10,2) DEFAULT 0,
  water_cur       numeric(10,2) DEFAULT 0,
  water_use       numeric(10,2) DEFAULT 0,
  water_amount    numeric(10,2) DEFAULT 0,
  "isInitial"     boolean      NOT NULL DEFAULT false,  -- baseline reading, no usage charge
  read_at         text,
  created_at      timestamptz  NOT NULL DEFAULT now(),
  UNIQUE (room_id, year, month)
);
CREATE INDEX IF NOT EXISTS idx_utilities_room ON public.utilities(room_id);

-- ─── 5) REPAIRS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.repairs (
  id              text         PRIMARY KEY,
  room_id         text         REFERENCES public.rooms(id) ON DELETE CASCADE,
  tenant_id       text         REFERENCES public.tenants(id) ON DELETE SET NULL,
  title           text         NOT NULL,
  description     text         DEFAULT '',
  status          text         NOT NULL DEFAULT 'รอดำเนินการ',
  priority        text         DEFAULT 'medium',
  image_url       text,
  created_at      timestamptz  NOT NULL DEFAULT now(),
  done_at         text
);
CREATE INDEX IF NOT EXISTS idx_repairs_room   ON public.repairs(room_id);
CREATE INDEX IF NOT EXISTS idx_repairs_status ON public.repairs(status);

-- ─── 6) SLIPS (payment slip uploads) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.slips (
  id              text         PRIMARY KEY,
  tenant_id       text         REFERENCES public.tenants(id) ON DELETE SET NULL,
  room_id         text         REFERENCES public.rooms(id)   ON DELETE CASCADE,
  year            int,
  month           int,
  amount          numeric(10,2),
  bank            text,
  image_url       text,
  filename        text,
  status          text         NOT NULL DEFAULT 'pending',   -- pending|approved|rejected
  created_at      timestamptz  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_slips_status ON public.slips(status);
CREATE INDEX IF NOT EXISTS idx_slips_room   ON public.slips(room_id);

-- ─── 7) BANKS (owner's bank accounts) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.banks (
  id              text         PRIMARY KEY,
  bank_name       text         NOT NULL,
  account_no      text         NOT NULL,
  account_name    text         NOT NULL,
  "primary"       boolean      NOT NULL DEFAULT false,
  created_at      timestamptz  NOT NULL DEFAULT now()
);

-- ─── 8) NOTIFICATIONS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifs (
  id              text         PRIMARY KEY,
  type            text         NOT NULL,
  title           text         NOT NULL,
  msg             text,
  "time"          text,
  unread          boolean      NOT NULL DEFAULT true,
  link            text,
  created_at      timestamptz  NOT NULL DEFAULT now()
);

-- ─── 9) CONFIG (key-value store for owner_pin, owner_profile, billing) ─
CREATE TABLE IF NOT EXISTS public.config (
  key             text         PRIMARY KEY,
  value           text         NOT NULL,
  updated_at      timestamptz  NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW-LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════
-- For now we open all tables to public read/write (anon role). Tighten this
-- once you add proper auth (e.g. only owner can write, tenants can read own).
ALTER TABLE public.rooms      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utilities  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repairs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slips      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config     ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['rooms','tenants','payments','utilities','repairs','slips','banks','notifs','config']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "open_all_%s" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "open_all_%s" ON public.%I FOR ALL USING (true) WITH CHECK (true)', t, t);
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- SEED DATA — initial demo content (idempotent)
-- ═══════════════════════════════════════════════════════════════════════════

-- Rooms (amenities uses text[] — PostgreSQL native array syntax)
INSERT INTO public.rooms (id, floor, type, price, status, amenities) VALUES
  ('101', 1, 'เดี่ยว', 1200, 'ไม่ว่าง', ARRAY['แอร์','Wi-Fi']),
  ('102', 1, 'เดี่ยว', 1200, 'ไม่ว่าง', ARRAY['แอร์','Wi-Fi']),
  ('103', 1, 'เดี่ยว', 1200, 'ไม่ว่าง', ARRAY['แอร์','Wi-Fi','ตู้เย็น']),
  ('104', 1, 'เดี่ยว', 1200, 'ไม่ว่าง', ARRAY['แอร์','Wi-Fi','ตู้เย็น']),
  ('105', 1, 'เดี่ยว', 1200, 'ว่าง',    ARRAY['แอร์','Wi-Fi']),
  ('106', 1, 'เดี่ยว', 3500, 'ว่าง',    ARRAY['แอร์','Wi-Fi']),
  ('201', 2, 'คู่',    1500, 'ว่าง',    ARRAY['แอร์','Wi-Fi','ระเบียง']),
  ('202', 2, 'คู่',    1500, 'ว่าง',    ARRAY['แอร์','Wi-Fi','ระเบียง']),
  ('203', 2, 'คู่',    1500, 'ว่าง',    ARRAY['แอร์','Wi-Fi']),
  ('204', 2, 'คู่',    1500, 'ว่าง',    ARRAY['แอร์','Wi-Fi']),
  ('205', 2, 'คู่',    1500, 'ว่าง',    ARRAY['แอร์','Wi-Fi']),
  ('206', 2, 'คู่',    1500, 'ว่าง',    ARRAY['แอร์','Wi-Fi']),
  ('301', 3, 'สตูดิโอ', 2000, 'ว่าง',   ARRAY['แอร์','Wi-Fi','ตู้เย็น','ครัว']),
  ('302', 3, 'สตูดิโอ', 2000, 'ว่าง',   ARRAY['แอร์','Wi-Fi','ตู้เย็น']),
  ('303', 3, 'สตูดิโอ', 2000, 'ว่าง',   ARRAY['แอร์','Wi-Fi','ตู้เย็น']),
  ('305', 3, 'สตูดิโอ', 2000, 'ว่าง',   ARRAY['แอร์','Wi-Fi','ตู้เย็น']),
  ('306', 3, 'สตูดิโอ', 3500, 'ว่าง',   ARRAY['แอร์','Wi-Fi','ตู้เย็น','ครัว'])
ON CONFLICT (id) DO NOTHING;

-- Tenants (sample)
INSERT INTO public.tenants (id, name, room_id, phone, since_y, since_m, since_day, username, password) VALUES
  ('T1', 'คุณ ใจดี มากมาย',  '101', '0804444444', 2026, 4, 1, '101', 'tenant'),
  ('T2', 'คุณใจบุญ ดีมาก',   '102', '0805555555', 2026, 4, 1, '102', 'tenant'),
  ('T3', 'นาง เมย์สวยมาก',   '103', '0806666666', 2026, 4, 1, '103', 'tenant'),
  ('T4', 'นาย โอเล่ ลูกอม',  '104', '0804461323', 2026, 4, 1, '104', 'tenant')
ON CONFLICT (id) DO NOTHING;

-- Payments (current month — pending)
INSERT INTO public.payments (room_id, year, month, amount, status) VALUES
  ('101', 2026, 4, 1200, 'รอชำระ'),
  ('102', 2026, 4, 1200, 'รอชำระ'),
  ('103', 2026, 4, 1200, 'รอชำระ'),
  ('104', 2026, 4, 1200, 'ชำระแล้ว')
ON CONFLICT (room_id, year, month) DO NOTHING;

-- Default config
INSERT INTO public.config (key, value) VALUES
  ('owner_pin', 'admin1234'),
  ('owner_profile', '{"name":"สมพร เจริญสุข","displayName":"คุณสมพร","dorm":"หอพักสุขใจ","address":"123 ถ.สุขใจ ต.บางใหญ่ อ.บางใหญ่ จ.นนทบุรี 11140","phone":"081-234-5678","email":"somporn@baan.co.th","dueDay":5,"billDay":25,"numFloors":3,"roomTypes":["เดี่ยว","คู่","สตูดิโอ"],"amenityOpts":["แอร์","ตู้เย็น","Wi-Fi","ระเบียง","ครัว","เครื่องซัก","เคเบิล TV","ตู้เสื้อผ้า"],"notifyEmail":true,"notifySms":true}'),
  ('billing_config', '{"monthly":{},"defaultElecFlat":350,"defaultWaterFlat":150}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- ═══════════════════════════════════════════════════════════════════════════
-- DONE — Verify tables in Supabase Dashboard → Table Editor
-- ═══════════════════════════════════════════════════════════════════════════
