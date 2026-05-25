// ─── Demo seed data (mirrors Supabase schema from src/App.jsx) ─────────
const MONTHS_TH = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
const MONTHS_FULL = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
const AMENITY_OPTS = ["แอร์","ตู้เย็น","Wi-Fi","ระเบียง","ครัว","เครื่องซัก","เคเบิล TV","ตู้เสื้อผ้า"];
const CUR_Y = 2026, CUR_M = 4; // พ.ค. 2026

const dl = (y, m) => `${MONTHS_TH[m]} ${y}`;
const baht = (n) => "฿" + (n || 0).toLocaleString();

const SEED_ROOMS = [
  { id: "A101", floor: 1, type: "เดี่ยว", price: 3500, amenities: ["แอร์","Wi-Fi","ตู้เสื้อผ้า"], status: "ไม่ว่าง" },
  { id: "A102", floor: 1, type: "เดี่ยว", price: 3500, amenities: ["แอร์","Wi-Fi"],               status: "ไม่ว่าง" },
  { id: "A103", floor: 1, type: "คู่",    price: 4800, amenities: ["แอร์","ตู้เย็น","Wi-Fi","ระเบียง"], status: "ว่าง" },
  { id: "B201", floor: 2, type: "เดี่ยว", price: 3800, amenities: ["แอร์","Wi-Fi","ตู้เสื้อผ้า"], status: "ไม่ว่าง" },
  { id: "B202", floor: 2, type: "คู่",    price: 5200, amenities: ["แอร์","ตู้เย็น","Wi-Fi","ระเบียง","ครัว"], status: "ไม่ว่าง" },
  { id: "B203", floor: 2, type: "เดี่ยว", price: 3800, amenities: ["แอร์","Wi-Fi"],               status: "ว่าง" },
  { id: "C301", floor: 3, type: "คู่",    price: 5500, amenities: ["แอร์","ตู้เย็น","Wi-Fi","ระเบียง","ครัว","เครื่องซัก"], status: "ไม่ว่าง" },
  { id: "C302", floor: 3, type: "เดี่ยว", price: 4000, amenities: ["แอร์","Wi-Fi","เคเบิล TV"],   status: "ไม่ว่าง" },
];

const SEED_TENANTS = [
  { id: "T1", name: "นภัส วงศ์ภักดี",  phone: "081-234-5678", room: "A101", sinceY: 2024, sinceM: 5 },
  { id: "T2", name: "ปวีณ์กร เจริญสุข", phone: "089-567-1234", room: "A102", sinceY: 2025, sinceM: 0 },
  { id: "T3", name: "สิริวิมล ทองดี",   phone: "092-345-6789", room: "B201", sinceY: 2023, sinceM: 8 },
  { id: "T4", name: "กิตติพัฒน์ ใจดี",  phone: "086-789-0123", room: "B202", sinceY: 2025, sinceM: 2 },
  { id: "T5", name: "ชนิดา รักเรียน",   phone: "094-456-7890", room: "C301", sinceY: 2024, sinceM: 11 },
  { id: "T6", name: "ธนกร พิทักษ์ชน",   phone: "082-901-2345", room: "C302", sinceY: 2025, sinceM: 7 },
];

// build payments — last 12 months, mostly paid, some pending
function buildPayments() {
  const out = [];
  let id = 1;
  for (const t of SEED_TENANTS) {
    const room = SEED_ROOMS.find(r => r.id === t.room);
    let y = t.sinceY, m = t.sinceM;
    while (y < CUR_Y || (y === CUR_Y && m <= CUR_M)) {
      const isCurrent = (y === CUR_Y && m === CUR_M);
      const isLast = (y === CUR_Y && m === CUR_M - 1);
      // patterns
      let status = "ชำระแล้ว";
      if (t.id === "T2" && y === CUR_Y && m >= CUR_M - 1) status = "รอชำระ";
      if (t.id === "T5" && isCurrent) status = "รอชำระ";
      if (t.id === "T3" && isCurrent) status = "รอชำระ";
      out.push({
        id: id++, room_id: t.room, year: y, month: m,
        amount: room.price,
        status,
        paid_at: status === "ชำระแล้ว" ? `3 ${MONTHS_TH[m]} ${y}` : null,
      });
      m++; if (m > 11) { m = 0; y++; }
    }
  }
  return out;
}

const SEED_PAYMENTS = buildPayments();

const SEED_REPAIRS = [
  { id: "R1", room_id: "B202", issue: "แอร์ไม่เย็น มีน้ำหยดจากท่อ", status: "กำลังดำเนินการ", priority: "สูง",   created_at: "2026-05-18", assigned: "ช่างเอก", eta: "2026-05-22", note: "เปลี่ยนคอมเพรสเซอร์ใหม่ รอชิ้นส่วน" },
  { id: "R2", room_id: "A101", issue: "ก๊อกน้ำในห้องน้ำรั่ว",        status: "รอดำเนินการ",   priority: "ปกติ", created_at: "2026-05-19", assigned: null,       eta: null,         note: null },
  { id: "R3", room_id: "C302", issue: "หลอดไฟห้องนอนขาด",            status: "เสร็จแล้ว",     priority: "ต่ำ",  created_at: "2026-05-12", assigned: "ช่างนิด",  eta: "2026-05-14", note: "เปลี่ยนหลอดใหม่เรียบร้อย", done_at: "2026-05-13" },
  { id: "R4", room_id: "B201", issue: "ลูกบิดประตูหลวม",              status: "รอดำเนินการ",   priority: "ปกติ", created_at: "2026-05-20", assigned: null,       eta: null,         note: null },
];

// ─── Bank accounts (เจ้าของหอใช้รับโอน) ─────────────────────────────
const SEED_BANKS = [
  { id: "B1", bank: "ธนาคารกสิกรไทย", name: "นายสมพร เจริญสุข", number: "012-3-45678-9", color: "oklch(0.7 0.14 145)",  short: "KBANK", primary: true },
  { id: "B2", bank: "ธนาคารไทยพาณิชย์", name: "นายสมพร เจริญสุข", number: "456-789-0123",  color: "oklch(0.55 0.18 310)", short: "SCB" },
  { id: "B3", bank: "พร้อมเพย์ (PromptPay)", name: "หอพักสุขใจ", number: "081-234-5678",  color: "oklch(0.7 0.14 25)",   short: "PP" },
];

// ─── Slip uploads (สถานะ pending → owner อนุมัติ) ───────────────────
const SEED_SLIPS = [
  { id: "S1", tenant_id: "T5", room_id: "C301", year: CUR_Y, month: CUR_M,    amount: 5500, uploaded_at: "2026-05-21 09:14", bank: "KBANK",  status: "pending", thumb: "slip-a" },
  { id: "S2", tenant_id: "T3", room_id: "B201", year: CUR_Y, month: CUR_M,    amount: 3800, uploaded_at: "2026-05-20 18:42", bank: "SCB",    status: "pending", thumb: "slip-b" },
  { id: "S3", tenant_id: "T6", room_id: "C302", year: CUR_Y, month: CUR_M-1,  amount: 4000, uploaded_at: "2026-05-03 10:20", bank: "PromptPay", status: "approved", thumb: "slip-c" },
];

// ─── Utility readings (มิเตอร์น้ำ-ไฟ) ──────────────────────────────
// rate: น้ำ ฿18/หน่วย · ไฟ ฿8/หน่วย
const UTIL_RATE = { water: 18, electric: 8 };

function genUtilHistory() {
  const out = [];
  let id = 1;
  for (const room of SEED_ROOMS) {
    if (room.status !== "ไม่ว่าง") continue;
    // build 6 months of readings
    let elecPrev = 12450 + Math.floor(Math.random() * 200);
    let waterPrev = 380 + Math.floor(Math.random() * 50);
    const seedBase = room.id.charCodeAt(1) + room.id.charCodeAt(2);
    elecPrev = 12450 + (seedBase * 7) % 250;
    waterPrev = 380 + (seedBase * 3) % 40;
    for (let i = 5; i >= 0; i--) {
      let y = CUR_Y, m = CUR_M - i;
      while (m < 0) { m += 12; y--; }
      const elecUse  = 45 + (seedBase + i*3) % 35;   // 45-80 units
      const waterUse = 6  + (seedBase + i*2) % 9;    // 6-15 units
      const elecCur  = elecPrev + elecUse;
      const waterCur = waterPrev + waterUse;
      out.push({
        id: id++, room_id: room.id, year: y, month: m,
        elec_prev: elecPrev, elec_cur: elecCur, elec_use: elecUse, elec_amount: elecUse * UTIL_RATE.electric,
        water_prev: waterPrev, water_cur: waterCur, water_use: waterUse, water_amount: waterUse * UTIL_RATE.water,
        read_at: `${i === 0 ? "เมื่อวาน" : (5 - i) + "/" + MONTHS_TH[m] + "/" + y}`,
      });
      elecPrev = elecCur; waterPrev = waterCur;
    }
  }
  return out;
}

const SEED_UTILS = genUtilHistory();

// ─── Notifications สำหรับเจ้าของหอ ────────────────────────────────
const SEED_NOTIFS = [
  { id: "N1", type: "slip",   icon: "card",   title: "ผู้เช่าแนบสลิปใหม่", msg: "ชนิดา (C301) · ฿5,500", time: "5 นาทีที่แล้ว", unread: true, link: "slips" },
  { id: "N2", type: "slip",   icon: "card",   title: "ผู้เช่าแนบสลิปใหม่", msg: "สิริวิมล (B201) · ฿3,800", time: "เมื่อวาน · 18:42", unread: true, link: "slips" },
  { id: "N3", type: "repair", icon: "wrench", title: "แจ้งซ่อมใหม่",       msg: "ลูกบิดประตูหลวม · B201",  time: "เมื่อวาน",      unread: true, link: "repairs" },
  { id: "N4", type: "util",   icon: "bolt",   title: "มิเตอร์ครบกำหนดจด",   msg: "8 ห้อง รอจดเลขมิเตอร์",     time: "วันนี้",        unread: false, link: "utility" },
];

window.SEED = {
  MONTHS_TH, MONTHS_FULL, AMENITY_OPTS, CUR_Y, CUR_M, dl, baht,
  SEED_ROOMS, SEED_TENANTS, SEED_PAYMENTS, SEED_REPAIRS,
  SEED_BANKS, SEED_SLIPS, SEED_UTILS, SEED_NOTIFS, UTIL_RATE,
};
