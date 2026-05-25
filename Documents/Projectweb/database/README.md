# Database Setup — หอพักสุขใจ

## วิธีตั้งค่าฐานข้อมูล Supabase

### ขั้นที่ 1 — เข้า Supabase Dashboard
- ไปที่ https://supabase.com/dashboard
- เลือกโปรเจ็กต์ `wsanmxkptjrckmpgayup` (ตาม URL ใน `.env`)

### ขั้นที่ 2 — รัน SQL
1. คลิกเมนู **SQL Editor** (ไอคอนซ้ายล่าง)
2. คลิก **New query**
3. เปิดไฟล์ `database/setup.sql` แล้ว copy เนื้อหาทั้งหมด
4. Paste ลงใน editor → กดปุ่ม **Run** (มุมขวาล่าง) หรือกด `Ctrl+Enter`

### ขั้นที่ 3 — ตรวจสอบ
- เปิดเมนู **Table Editor** → ควรเห็นตารางทั้ง 9 ตาราง:
  - `rooms`, `tenants`, `payments`, `utilities`, `repairs`
  - `slips`, `banks`, `notifs`, `config`
- เปิดตาราง `rooms` ควรมีข้อมูลห้อง 101-306 (รวม 17 ห้อง)
- เปิดตาราง `tenants` ควรมีผู้เช่าตัวอย่าง 4 คน

### ขั้นที่ 4 — รีเฟรชหน้าเว็บ
- กด `Ctrl+Shift+R` ที่หน้าเว็บ
- ข้อมูลจากฐานข้อมูลจะถูกโหลดมาแทน seed data

---

## โครงสร้างตาราง

| ตาราง | จุดประสงค์ |
|-------|-----------|
| `rooms` | ข้อมูลห้องพัก + เลขมิเตอร์ล่าสุด |
| `tenants` | ผู้เช่า (รวม evicted history) |
| `payments` | บันทึกการชำระค่าเช่า รายเดือน/รายห้อง |
| `utilities` | มิเตอร์น้ำ-ไฟ รายเดือน/รายห้อง (มีรองรับ `isInitial`) |
| `repairs` | งานซ่อมบำรุง |
| `slips` | สลิปโอนเงินจากผู้เช่า + สถานะอนุมัติ |
| `banks` | บัญชีธนาคารของเจ้าของหอ |
| `notifs` | การแจ้งเตือน |
| `config` | key-value (owner_pin, owner_profile, billing_config) |

---

## บัญชีล็อกอินเริ่มต้น

**เจ้าของหอ:**
- PIN: `admin1234`

**ผู้เช่าตัวอย่าง:**
- ห้อง 101: username=`101`, password=`tenant`
- ห้อง 102: username=`102`, password=`tenant`
- ห้อง 103: username=`103`, password=`tenant`
- ห้อง 104: username=`104`, password=`tenant`

---

## หมายเหตุเรื่อง Security

ปัจจุบัน RLS (Row-Level Security) เปิด **public read/write** สำหรับทุกตาราง — เหมาะกับ development/demo เท่านั้น

ก่อน production ควรเพิ่ม Supabase Auth + policies ที่:
- เจ้าของหอเท่านั้นที่ INSERT/UPDATE/DELETE ได้
- ผู้เช่าอ่านได้เฉพาะข้อมูลของตัวเอง (room_id ตรงกับห้องตัวเอง)

---

## รัน SQL อีกครั้งได้ไหม?

ได้ — script ใช้ `IF NOT EXISTS` และ `ON CONFLICT ... DO NOTHING` ทั้งหมด รันซ้ำจะไม่ทำลายข้อมูลเดิม ใช้สำหรับเพิ่มตารางที่ขาด หรือ reset seed config ได้
