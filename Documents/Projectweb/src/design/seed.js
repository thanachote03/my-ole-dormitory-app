// ─── Demo seed data (mirrors Supabase schema) ─────────
export const MONTHS_TH = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
export const MONTHS_FULL = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
export const AMENITY_OPTS = ["แอร์","ตู้เย็น","Wi-Fi","ระเบียง","ครัว","เครื่องซัก","เคเบิล TV","ตู้เสื้อผ้า"];

const NOW = new Date();
export const CUR_Y = NOW.getFullYear();
export const CUR_M = NOW.getMonth();

export const dl  = (y, m)       => `${MONTHS_TH[m]} ${y}`;
export const dld = (d, y, m)    => `${d || 1} ${MONTHS_TH[m]} ${y}`;
export const baht = (n) => "฿" + (Number(n) || 0).toLocaleString();

export const SEED_ROOMS = [
  { id: "A101", floor: 1, type: "เดี่ยว", price: 3500, amenities: ["แอร์","Wi-Fi","ตู้เสื้อผ้า"], status: "ไม่ว่าง" },
  { id: "A102", floor: 1, type: "เดี่ยว", price: 3500, amenities: ["แอร์","Wi-Fi"],               status: "ไม่ว่าง" },
  { id: "A103", floor: 1, type: "คู่",    price: 4800, amenities: ["แอร์","ตู้เย็น","Wi-Fi","ระเบียง"], status: "ว่าง" },
  { id: "B201", floor: 2, type: "เดี่ยว", price: 3800, amenities: ["แอร์","Wi-Fi","ตู้เสื้อผ้า"], status: "ไม่ว่าง" },
  { id: "B202", floor: 2, type: "คู่",    price: 5200, amenities: ["แอร์","ตู้เย็น","Wi-Fi","ระเบียง","ครัว"], status: "ไม่ว่าง" },
  { id: "B203", floor: 2, type: "เดี่ยว", price: 3800, amenities: ["แอร์","Wi-Fi"],               status: "ว่าง" },
  { id: "C301", floor: 3, type: "คู่",    price: 5500, amenities: ["แอร์","ตู้เย็น","Wi-Fi","ระเบียง","ครัว","เครื่องซัก"], status: "ไม่ว่าง" },
  { id: "C302", floor: 3, type: "เดี่ยว", price: 4000, amenities: ["แอร์","Wi-Fi","เคเบิล TV"],   status: "ไม่ว่าง" },
];

export const SEED_TENANTS = [
  { id: "T1", name: "นภัส วงศ์ภักดี",  phone: "081-234-5678", room: "A101", sinceY: 2024, sinceM: 5 },
  { id: "T2", name: "ปวีณ์กร เจริญสุข", phone: "089-567-1234", room: "A102", sinceY: 2025, sinceM: 0 },
  { id: "T3", name: "สิริวิมล ทองดี",   phone: "092-345-6789", room: "B201", sinceY: 2023, sinceM: 8 },
  { id: "T4", name: "กิตติพัฒน์ ใจดี",  phone: "086-789-0123", room: "B202", sinceY: 2025, sinceM: 2 },
  { id: "T5", name: "ชนิดา รักเรียน",   phone: "094-456-7890", room: "C301", sinceY: 2024, sinceM: 11 },
  { id: "T6", name: "ธนกร พิทักษ์ชน",   phone: "082-901-2345", room: "C302", sinceY: 2025, sinceM: 7 },
];

function buildPayments(tenants, rooms, curY, curM) {
  const out = [];
  let id = 1;
  for (const t of tenants) {
    const room = rooms.find(r => r.id === t.room);
    if (!room) continue;
    let y = t.sinceY, m = t.sinceM;
    while (y < curY || (y === curY && m <= curM)) {
      const isCurrent = (y === curY && m === curM);
      let status = "ชำระแล้ว";
      if (t.id === "T2" && y === curY && m >= curM - 1) status = "รอชำระ";
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

export const SEED_PAYMENTS = buildPayments(SEED_TENANTS, SEED_ROOMS, CUR_Y, CUR_M);

export const SEED_REPAIRS = [
  { id: "R1", room_id: "B202", issue: "แอร์ไม่เย็น มีน้ำหยดจากท่อ", status: "กำลังดำเนินการ", priority: "สูง",   created_at: "2026-05-18", assigned: "ช่างเอก", eta: "2026-05-22", note: "เปลี่ยนคอมเพรสเซอร์ใหม่ รอชิ้นส่วน" },
  { id: "R2", room_id: "A101", issue: "ก๊อกน้ำในห้องน้ำรั่ว",        status: "รอดำเนินการ",   priority: "ปกติ", created_at: "2026-05-19", assigned: null,       eta: null,         note: null },
  { id: "R3", room_id: "C302", issue: "หลอดไฟห้องนอนขาด",            status: "เสร็จแล้ว",     priority: "ต่ำ",  created_at: "2026-05-12", assigned: "ช่างนิด",  eta: "2026-05-14", note: "เปลี่ยนหลอดใหม่เรียบร้อย", done_at: "2026-05-13" },
  { id: "R4", room_id: "B201", issue: "ลูกบิดประตูหลวม",              status: "รอดำเนินการ",   priority: "ปกติ", created_at: "2026-05-20", assigned: null,       eta: null,         note: null },
];

export const SEED_BANKS = [
  { id: "B1", bank: "ธนาคารกสิกรไทย", name: "นายสมพร เจริญสุข", number: "012-3-45678-9", color: "oklch(0.7 0.14 145)",  short: "KBANK", primary: true },
  { id: "B2", bank: "ธนาคารไทยพาณิชย์", name: "นายสมพร เจริญสุข", number: "456-789-0123",  color: "oklch(0.55 0.18 310)", short: "SCB" },
  { id: "B3", bank: "พร้อมเพย์ (PromptPay)", name: "หอพักสุขใจ", number: "081-234-5678",  color: "oklch(0.7 0.14 25)",   short: "PP" },
];

// Generate a realistic-looking SVG bank transfer slip image
export function makeSlipSvgDataUrl({ amount, bank, name, dateStr, ref }) {
  const fmt = "฿" + (amount || 0).toLocaleString();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 620" width="400" height="620">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#5da375"/><stop offset="1" stop-color="#2e7a4a"/>
    </linearGradient>
  </defs>
  <rect width="400" height="620" fill="#ffffff"/>
  <rect width="400" height="220" fill="url(#g)"/>
  <text x="32" y="48" font-family="Anuphan,Sarabun,sans-serif" font-size="13" fill="rgba(255,255,255,0.85)" font-weight="600" letter-spacing="2">${bank || "K PLUS"}</text>
  <text x="368" y="48" text-anchor="end" font-family="Anuphan,Sarabun,sans-serif" font-size="11" fill="rgba(255,255,255,0.75)">${dateStr || ""}</text>
  <circle cx="200" cy="120" r="32" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.5)" stroke-width="2"/>
  <path d="M 184 122 L 196 134 L 218 108" stroke="#ffffff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="200" y="180" text-anchor="middle" font-family="Anuphan,Sarabun,sans-serif" font-size="18" fill="#ffffff" font-weight="700">โอนเงินสำเร็จ</text>
  <text x="200" y="210" text-anchor="middle" font-family="Anuphan,Sarabun,sans-serif" font-size="30" fill="#ffffff" font-weight="800">${fmt}</text>
  <text x="32" y="270" font-family="Anuphan,sans-serif" font-size="11" fill="#888" font-weight="600">จาก</text>
  <text x="32" y="292" font-family="Anuphan,sans-serif" font-size="15" fill="#1a1a1a" font-weight="600">${name || "ผู้เช่า"}</text>
  <text x="32" y="312" font-family="Anuphan,sans-serif" font-size="12" fill="#888">089-xxx-xxxx</text>
  <line x1="32" y1="340" x2="368" y2="340" stroke="#ddd" stroke-width="1" stroke-dasharray="4 4"/>
  <text x="32" y="370" font-family="Anuphan,sans-serif" font-size="11" fill="#888" font-weight="600">ไปยัง · ${bank || "KBANK"}</text>
  <text x="32" y="392" font-family="Anuphan,sans-serif" font-size="15" fill="#1a1a1a" font-weight="600">หอพักสุขใจ</text>
  <text x="32" y="412" font-family="Anuphan,sans-serif" font-size="12" fill="#888">xxx-x-xxxx5-9</text>
  <rect x="32" y="440" width="336" height="80" rx="10" fill="#f4f4f4"/>
  <text x="200" y="468" text-anchor="middle" font-family="Anuphan,sans-serif" font-size="11" fill="#888">หมายเหตุ</text>
  <text x="200" y="494" text-anchor="middle" font-family="Anuphan,sans-serif" font-size="14" fill="#1a1a1a" font-weight="600">ค่าเช่าห้อง · ผ่าน Mobile Banking</text>
  <text x="200" y="568" text-anchor="middle" font-family="Anuphan,sans-serif" font-size="10" fill="#aaa" letter-spacing="2">REF: ${ref || "20260521000000"}</text>
</svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

export const SEED_SLIPS = [
  {
    id: "S1", tenant_id: "T5", room_id: "C301", year: CUR_Y, month: CUR_M,
    amount: 5500, uploaded_at: "2026-05-21 09:14", bank: "KBANK", status: "pending", thumb: "slip-a",
    imageUrl: makeSlipSvgDataUrl({ amount: 5500, bank: "K PLUS", name: "ชนิดา รักเรียน", dateStr: "2026-05-21 09:14", ref: "20260521091422" }),
    filename: "IMG_5523.jpg",
  },
  { id: "S2", tenant_id: "T3", room_id: "B201", year: CUR_Y, month: CUR_M,    amount: 3800, uploaded_at: "2026-05-20 18:42", bank: "SCB",    status: "pending", thumb: "slip-b" },
  { id: "S3", tenant_id: "T6", room_id: "C302", year: CUR_Y, month: CUR_M - 1, amount: 4000, uploaded_at: "2026-05-03 10:20", bank: "PromptPay", status: "approved", thumb: "slip-c" },
];

export const UTIL_RATE = { water: 18, electric: 8 };

function genUtilHistory(rooms, curY, curM) {
  const out = [];
  let id = 1;
  for (const room of rooms) {
    if (room.status !== "ไม่ว่าง") continue;
    const seedBase = room.id.charCodeAt(1) + room.id.charCodeAt(2);
    let elecPrev = 12450 + (seedBase * 7) % 250;
    let waterPrev = 380 + (seedBase * 3) % 40;
    for (let i = 5; i >= 0; i--) {
      let y = curY, m = curM - i;
      while (m < 0) { m += 12; y--; }
      const elecUse  = 45 + (seedBase + i * 3) % 35;
      const waterUse = 6  + (seedBase + i * 2) % 9;
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

export const SEED_UTILS = genUtilHistory(SEED_ROOMS, CUR_Y, CUR_M);

export const SEED_NOTIFS = [
  { id: "N1", type: "slip",   icon: "card",   title: "ผู้เช่าแนบสลิปใหม่", msg: "ชนิดา (C301) · ฿5,500", time: "5 นาทีที่แล้ว", unread: true, link: "slips" },
  { id: "N2", type: "slip",   icon: "card",   title: "ผู้เช่าแนบสลิปใหม่", msg: "สิริวิมล (B201) · ฿3,800", time: "เมื่อวาน · 18:42", unread: true, link: "slips" },
  { id: "N3", type: "repair", icon: "wrench", title: "แจ้งซ่อมใหม่",       msg: "ลูกบิดประตูหลวม · B201",  time: "เมื่อวาน",      unread: true, link: "repairs" },
  { id: "N4", type: "util",   icon: "bolt",   title: "มิเตอร์ครบกำหนดจด",   msg: "8 ห้อง รอจดเลขมิเตอร์",     time: "วันนี้",        unread: false, link: "utility" },
];

// ─── Billing modes (เหมา ↔ จดมิเตอร์) per-room per-month ──────────────────
// monthly[`${roomId}|${year}|${month}`] = { elecMode, waterMode, elecFlat?, waterFlat? }
export const SEED_BILLING = {
  defaultElecFlat: 400,
  defaultWaterFlat: 200,
  monthly: {
    [`C302|${CUR_Y}|${CUR_M}`]: { elecMode: "flat", waterMode: "flat",    elecFlat: 450, waterFlat: 250 },
    [`A101|${CUR_Y}|${CUR_M}`]: { elecMode: "metered", waterMode: "flat", waterFlat: 200 },
    [`B201|${CUR_Y}|${CUR_M}`]: { elecMode: "flat",  waterMode: "metered", elecFlat: 500 },
    [`A101|${CUR_Y}|${CUR_M - 1}`]: { elecMode: "metered", waterMode: "metered" },
  },
};

export const SEED = {
  MONTHS_TH, MONTHS_FULL, AMENITY_OPTS, CUR_Y, CUR_M, dl, baht,
  SEED_ROOMS, SEED_TENANTS, SEED_PAYMENTS, SEED_REPAIRS,
  SEED_BANKS, SEED_SLIPS, SEED_UTILS, SEED_NOTIFS, UTIL_RATE, SEED_BILLING,
};
