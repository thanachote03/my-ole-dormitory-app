# Production Auth & RLS Setup Guide

คู่มือนี้พา walk-through การเปิดใช้ Supabase Auth + RLS แบบ production สำหรับหอพักสุขใจ

---

## 📋 Overview

หลังทำตามคู่มือนี้ ระบบจะมี:
- ✅ **เจ้าของหอ** ล็อกอินผ่าน Supabase Auth (email/password)
- ✅ **ผู้เช่า** แต่ละคน มี auth account ของตัวเอง — เห็นข้อมูลห้องตัวเองเท่านั้น
- ✅ RLS ปกป้องทุกตาราง — anon user เห็นได้แต่ถ้าจะแก้ไขต้อง authenticated
- ✅ ระบบเดิม (PIN admin1234) ยังใช้ได้เป็น fallback สำหรับ dev/demo

---

## 🚀 ลำดับการ deploy (4 ขั้น)

### ขั้นที่ 1 — รัน setup.sql (ถ้ายังไม่ได้รัน)
```
Supabase Dashboard → SQL Editor → paste setup.sql → Run
```

### ขั้นที่ 2 — รัน auth-migration.sql
```
SQL Editor → New query → paste auth-migration.sql → Run
```
จะเพิ่ม `tenants.auth_id` column และ trigger sync metadata

### ขั้นที่ 3 — สร้าง Auth User สำหรับเจ้าของหอ

**3a.** Dashboard → Authentication → Users → คลิก **Add user** → **Create new user**
- Email: เช่น `owner@yourdorm.com` (ใช้จริง หรือ `admin@dorm.local`)
- Password: ตั้งใหม่ให้แข็งแรง (ยาว 12+ ตัวอักษร)
- ☑️ Auto Confirm User

**3b.** ตั้ง metadata = owner — รันคำสั่ง SQL นี้:
```sql
UPDATE auth.users
   SET raw_user_meta_data = coalesce(raw_user_meta_data,'{}'::jsonb) || '{"role":"owner"}'::jsonb
 WHERE email = 'owner@yourdorm.com';   -- เปลี่ยนเป็น email จริง
```

### ขั้นที่ 4 — สร้าง Auth User ให้ผู้เช่า (รัน script อัตโนมัติ)

**4a.** ขอ **Service Role Key** จาก Dashboard → Settings → API → service_role secret
> ⚠️ Service role key ห้ามใช้ใน frontend! ใช้แค่รัน script ครั้งเดียว

**4b.** รัน script:
```bash
cd Projectweb
export SUPABASE_URL=https://wsanmxkptjrckmpgayup.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
node database/provision-auth-users.mjs
```

ผลลัพธ์: tenants ทุกคนได้ auth account อัตโนมัติ
- Email: `<username>@dorm.local` (เช่น `101@dorm.local`)
- Password: ใช้รหัสจาก `tenants.password` (default = `tenant`)
- `tenants.auth_id` จะถูก link กับ auth user

### ขั้นที่ 5 — เปิดใช้ Production RLS
```
SQL Editor → New query → paste rls-production.sql → Run
```
จะลบ "open_all_*" policies และสร้าง policy ตาม role

---

## 🧪 ทดสอบ

### ในหน้าเว็บ
1. ไปที่ http://localhost:5173
2. คลิก **เข้าใช้งานเจ้าของ** หรือ **เข้าใช้งานผู้เช่า**
3. กรอก:
   - Owner: username = `owner@yourdorm.com` (email เต็ม) หรือ `admin` (fallback PIN), password = ที่ตั้ง
   - Tenant: username = `101` (เลขห้อง), password = `tenant`
4. ระบบจะลอง Supabase Auth ก่อน → ถ้าไม่ผ่าน ลอง local check

### ทดสอบ RLS ผ่าน SQL
```sql
-- ในขณะที่ยังไม่ได้ sign in (anon)
SELECT * FROM payments;     -- ✅ ได้ (anon มี SELECT policy)
INSERT INTO payments(...);  -- ❌ ถูกบล็อก
```

---

## 🔄 ลำดับการรันใหม่ทั้งหมด (ถ้าจะ reset)

```sql
-- 1. ลบทุกอย่าง
DROP TABLE IF EXISTS public.config, public.notifs, public.banks, public.slips,
                     public.repairs, public.utilities, public.payments,
                     public.tenants, public.rooms CASCADE;

-- 2. แล้วรัน
--    setup.sql        → สร้างตาราง + seed
--    auth-migration.sql → เพิ่ม auth_id column
--    rls-production.sql → lock down access
```

---

## 🆘 Troubleshooting

### "Email or password is invalid"
- ตรวจว่าสร้าง auth user แล้วหรือยัง (Dashboard → Authentication → Users)
- ตรวจ email pattern: tenant ใช้ `<username>@dorm.local`
- ลอง reset password ใน Dashboard

### หน้าเว็บล็อกอินไม่ผ่านหลังเปิด RLS
- ลองล็อกอินด้วย PIN เดิม (`admin` / `admin1234`) — fallback path ยังใช้ได้
- เปิด DevTools → Network → ดู response จาก `/auth/v1/token` มี error อะไร

### Tenant เห็นห้องคนอื่น
- ตรวจ `auth.users.raw_user_meta_data.tenant_id` ตรงกับ tenants.id หรือไม่
- รัน: `SELECT id, name, room_id, auth_id FROM tenants WHERE auth_id IS NOT NULL;`
- รัน: `SELECT id, email, raw_user_meta_data FROM auth.users LIMIT 10;`

### อยากให้ tenant เปลี่ยนรหัสได้
- ต้องเพิ่มหน้า "เปลี่ยนรหัสผ่าน" ที่เรียก `supabase.auth.updateUser({ password })`
- ยังไม่มีในเวอร์ชันปัจจุบัน

---

## 📚 ไฟล์ที่เกี่ยวข้อง

| ไฟล์ | จุดประสงค์ |
|------|-----------|
| `database/setup.sql` | สร้างตาราง + seed (ใช้ก่อน) |
| `database/auth-migration.sql` | เพิ่ม auth_id column + trigger |
| `database/provision-auth-users.mjs` | สร้าง auth users ให้ tenants ที่มีอยู่ |
| `database/rls-production.sql` | RLS policies แบบ production |
| `src/design/mobile.jsx` | `LoginFormScreen` — เรียก supabase.auth.signInWithPassword |
| `src/App.jsx` | `handleLogout` — เรียก supabase.auth.signOut |
| `src/supabaseClient.js` | Supabase JS client |

---

## ⚙️ Architecture สั้น ๆ

```
┌─────────────────────┐
│  LoginFormScreen    │
└──────────┬──────────┘
           │ tryAuth(email, password)
           ▼
┌─────────────────────────────────────┐
│  supabase.auth.signInWithPassword() │
└──────────┬──────────────────────────┘
           │ success → JWT พร้อม metadata
           ▼
┌─────────────────────────────────────────────────────┐
│  JWT: { sub, role, email, user_metadata: {          │
│    role: 'owner' | 'tenant',                        │
│    tenant_id: 'T1',  ← เฉพาะ tenant                │
│  }}                                                  │
└──────────┬──────────────────────────────────────────┘
           │ ส่งไปกับทุก query
           ▼
┌─────────────────────────────────────────────────────┐
│  PostgreSQL RLS policies                            │
│  • is_owner()      → ตรวจ JWT.user_metadata.role    │
│  • current_tenant_id() → JWT.user_metadata.tenant_id│
│  → กรองแถวที่ตอบ                                    │
└─────────────────────────────────────────────────────┘
```

ระบบนี้แบบ "JWT-claims-based RLS" — Supabase สร้าง JWT ให้อัตโนมัติ, PostgreSQL อ่าน claim ผ่าน `auth.jwt()` function ใน policy
