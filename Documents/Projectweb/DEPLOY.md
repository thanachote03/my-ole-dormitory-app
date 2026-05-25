# Deployment Guide — Vercel + GitHub

ตอนนี้โค้ดได้ push ขึ้น GitHub แล้วที่:
**https://github.com/thanachote03/my-ole-dormitory-app**

---

## ⚠️ หมายเหตุสำคัญเรื่องโครงสร้างโฟลเดอร์

repo ของคุณมี **Projectweb** อยู่ในซับโฟลเดอร์ `Documents/Projectweb/` (ไม่ได้อยู่ที่ root)

```
my-ole-dormitory-app/                ← repo root
└── Documents/
    └── Projectweb/                  ← React app อยู่ตรงนี้
        ├── package.json
        ├── vite.config.js
        ├── vercel.json
        ├── database/
        ├── src/
        │   ├── App.jsx
        │   └── design/
        └── public/
```

ตอน config Vercel ต้องบอก **Root Directory = `Documents/Projectweb`**

---

## 🚀 ขั้นตอน Deploy บน Vercel

### ขั้นที่ 1 — Login Vercel
ไปที่ https://vercel.com → คลิก **Login** → เลือก **Continue with GitHub** → อนุญาตให้ Vercel เข้าถึง GitHub

### ขั้นที่ 2 — Import Project
1. คลิกปุ่ม **Add New...** (มุมขวาบน) → **Project**
2. ดูในรายชื่อ repo จะเจอ `my-ole-dormitory-app` → คลิก **Import**

### ขั้นที่ 3 — Configure Project

**Framework Preset:**
- เลือก **Vite** (auto-detect ได้)

**Root Directory:** ⚠️ **สำคัญที่สุด**
- คลิก **Edit** ข้างฟิลด์ Root Directory
- กรอก: `Documents/Projectweb`
- คลิก **Continue**

**Build & Output Settings:**
- Build Command: `npm run build` (default จาก vercel.json)
- Output Directory: `dist` (default จาก vercel.json)
- Install Command: `npm install`

**Environment Variables:** ⚠️ **ต้องตั้งก่อน Deploy**
คลิก **Environment Variables** แล้วเพิ่ม:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | `https://wsanmxkptjrckmpgayup.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_BVOIVDVuHqkgwqPfZnGi9w_mmM9XvBY` |

(ค่าตามไฟล์ `.env` ปัจจุบัน — copy มาวางได้)

### ขั้นที่ 4 — Deploy
- คลิกปุ่ม **Deploy** (สีดำใหญ่)
- รอ build ~1-2 นาที
- เมื่อเสร็จจะได้ URL เช่น `https://my-ole-dormitory-app.vercel.app`

---

## 🔄 Workflow หลัง Deploy

หลังจากตั้งค่าเสร็จ ทุกครั้งที่คุณ:
```bash
git push origin main
```
Vercel จะ **auto-deploy ใหม่** ภายในไม่กี่นาที — ไม่ต้องทำอะไรเพิ่ม

---

## ✅ Checklist ก่อน Deploy

- [x] Push โค้ดขึ้น GitHub แล้ว
- [x] มี `vercel.json` ใน Projectweb (SPA rewrites)
- [x] `.env` ถูกย้ายออกจาก git tracking
- [x] มี `.env.example` ให้คนอื่นทำตาม
- [ ] **ตั้ง Root Directory = `Documents/Projectweb` ใน Vercel** ← อย่าลืม!
- [ ] **เพิ่ม Environment Variables ใน Vercel** ← อย่าลืม!

---

## 🆘 ถ้า Build ล้มเหลว

### "Could not find package.json"
- คุณลืมตั้ง Root Directory เป็น `Documents/Projectweb`
- ไป Vercel Project → Settings → General → Root Directory → ใส่ `Documents/Projectweb` → Save → Redeploy

### "VITE_SUPABASE_URL is undefined"
- ลืมเพิ่ม Environment Variables
- ไป Vercel Project → Settings → Environment Variables → เพิ่มทั้ง 2 ค่า → Redeploy

### Hot reload ไม่ทำงานบน mobile
- ปกติ — Vercel deploy เป็น production build ทำให้ไม่มี hot reload (ดีแล้ว สำหรับ end user)

### หน้าเว็บโหลดแล้วแต่ login ไม่ได้
- Supabase database ยังไม่ได้ setup → รัน `database/setup.sql` ก่อน (อ่าน `database/README.md`)

---

## 🔧 ทางเลือก: ย้าย Projectweb ไปอยู่ที่ root ของ repo (optional)

ถ้าอยากให้ repo สะอาดขึ้น (Projectweb อยู่ที่ root โดยตรง) — ทำได้ด้วย `git filter-repo` หรือสร้าง repo ใหม่ แต่จะเสีย commit history เก่า — แนะนำให้ทำตอนตั้งทีมหรือสร้าง v2

ตอนนี้ Root Directory ใน Vercel = `Documents/Projectweb` ก็ใช้งานได้ปกติ ไม่ต่างจากตอนอยู่ที่ root
