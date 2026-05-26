import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../supabaseClient";
import {
  SEED_ROOMS, SEED_TENANTS, SEED_PAYMENTS, SEED_REPAIRS,
  SEED_BANKS, SEED_SLIPS, SEED_UTILS, SEED_NOTIFS, SEED_BILLING,
  CUR_Y, CUR_M, UTIL_RATE,
} from "./seed";

const DataContext = createContext(null);

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside <DataProvider>");
  return ctx;
}

// Supabase tenants store room_id / since_y / since_m; design components expect room/sinceY/sinceM.
const adaptTenant = (t) => ({
  ...t,
  room: t.room ?? t.room_id,
  sinceY:   t.sinceY   ?? t.since_y,
  sinceM:   t.sinceM   ?? t.since_m,
  sinceDay: t.sinceDay ?? t.since_day ?? 1,
});

// Supabase slips store image_url (snake_case); UI components read imageUrl (camelCase).
const adaptSlip = (s) => ({
  ...s,
  imageUrl: s.imageUrl ?? s.image_url ?? null,
  thumb:    s.thumb    ?? "slip-a",
});

const DEFAULT_OWNER = {
  name: "สมพร เจริญสุข",
  displayName: "คุณสมพร",
  dorm: "หอพักสุขใจ",
  address: "123 ถ.สุขใจ ต.บางใหญ่ อ.บางใหญ่ จ.นนทบุรี 11140",
  phone: "081-234-5678",
  email: "somporn@baan.co.th",
  dueDay: 5,
  billDay: 25,
  numFloors: 5,
  roomTypes:   ["เดี่ยว", "คู่", "สตูดิโอ"],
  amenityOpts: ["แอร์", "ตู้เย็น", "Wi-Fi", "ระเบียง", "ครัว", "เครื่องซัก", "เคเบิล TV", "ตู้เสื้อผ้า"],
  notifyEmail: true,
  notifySms: true,
};

export function DataProvider({ children }) {
  const [rooms, setRooms] = useState(SEED_ROOMS);
  const [tenants, setTenants] = useState(SEED_TENANTS);
  const [payments, setPayments] = useState(SEED_PAYMENTS);
  const [repairs, setRepairs] = useState(SEED_REPAIRS);
  const [banks, setBanks] = useState(SEED_BANKS);
  const [slips, setSlips] = useState(SEED_SLIPS);
  const [utils, setUtils] = useState(SEED_UTILS);
  const [notifs, setNotifs] = useState(SEED_NOTIFS);
  const [billing, setBilling] = useState(SEED_BILLING);
  const [ownerPin, setOwnerPin] = useState("admin1234");
  const [owner, setOwnerState] = useState(DEFAULT_OWNER);
  const [staff, setStaff] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Hydrate from Supabase; tables that don't exist or fail simply keep the seed.
  // If Supabase has data, it REPLACES the seed (so the deployed app shows real data,
  // not stale seed). Empty Supabase tables also wipe the seed — this matches production
  // expectations where seed shouldn't leak through.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [r, t, p, rep, util, slip, bank, notif, cfg, st] = await Promise.all([
          supabase.from("rooms").select("*").order("id"),
          supabase.from("tenants").select("*").order("name"),
          supabase.from("payments").select("*"),
          supabase.from("repairs").select("*").order("created_at", { ascending: false }),
          supabase.from("utilities").select("*"),
          supabase.from("slips").select("*").order("created_at", { ascending: false }),
          supabase.from("banks").select("*"),
          supabase.from("notifs").select("*").order("created_at", { ascending: false }),
          supabase.from("config").select("*"),
          supabase.from("staff").select("*").order("username"),
        ]);
        if (cancelled) return;
        // Use server data when query succeeded (no error). Only keep seed if the table
        // call itself errored — that way reality stays in sync with DB.
        if (!r?.error    && r?.data)    setRooms(r.data);
        if (!t?.error    && t?.data)    setTenants(t.data.map(adaptTenant));
        if (!p?.error    && p?.data)    setPayments(p.data);
        if (!rep?.error  && rep?.data)  setRepairs(rep.data);
        if (!util?.error && util?.data) setUtils(util.data);
        if (!slip?.error && slip?.data) setSlips(slip.data.map(adaptSlip));
        if (!bank?.error && bank?.data) setBanks(bank.data);
        if (!notif?.error && notif?.data) setNotifs(notif.data);
        if (!st?.error && st?.data) setStaff(st.data);
        if (cfg?.data) {
          const pinRow = cfg.data.find(c => c.key === "owner_pin");
          if (pinRow?.value) setOwnerPin(pinRow.value);
          const ownerRow = cfg.data.find(c => c.key === "owner_profile");
          if (ownerRow?.value) {
            try { setOwnerState(prev => ({ ...prev, ...JSON.parse(ownerRow.value) })); } catch {}
          }
          const billingRow = cfg.data.find(c => c.key === "billing_config");
          if (billingRow?.value) {
            try { setBilling(prev => ({ ...prev, ...JSON.parse(billingRow.value) })); } catch {}
          }
        }
      } catch (e) {
        // Supabase not reachable — stay on seed
        console.warn("[DataProvider] Supabase load failed, using seed:", e?.message || e);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const updateOwner = useCallback(async (patch) => {
    setOwnerState(prev => {
      const next = { ...prev, ...patch };
      try { supabase.from("config").upsert({ key: "owner_profile", value: JSON.stringify(next) }); } catch {}
      return next;
    });
    if (patch.password) {
      setOwnerPin(patch.password);
      try { await supabase.from("config").upsert({ key: "owner_pin", value: patch.password }); } catch {}
    }
  }, []);

  const moveTenant = useCallback((tenantId, toRoom) => {
    setTenants(prev => {
      const cur = prev.find(t => t.id === tenantId);
      if (!cur || cur.room === toRoom) return prev;
      const fromRoom = cur.room;
      setRooms(rs => rs.map(r => {
        if (r.id === fromRoom) return { ...r, status: "ว่าง" };
        if (r.id === toRoom)   return { ...r, status: "ไม่ว่าง" };
        return r;
      }));
      return prev.map(t => t.id === tenantId ? { ...t, room: toRoom } : t);
    });
  }, []);

  const deleteTenant = useCallback(async (tenantId) => {
    const cur = tenants.find(t => t.id === tenantId);
    if (cur?.room) setRooms(rs => rs.map(r => r.id === cur.room ? { ...r, status: "ว่าง" } : r));
    setTenants(prev => prev.filter(t => t.id !== tenantId));
    try {
      await supabase.from("tenants").delete().eq("id", tenantId);
      if (cur?.room) await supabase.from("rooms").update({ status: "ว่าง" }).eq("id", cur.room);
    } catch {}
  }, [tenants]);

  // Evict = end tenancy but keep tenant record + payment history intact.
  // The tenant's room becomes vacant; payments remain linked to room_id but
  // are filtered by sinceY/M–evictedY/M in TenantDetail so they don't bleed
  // into the next tenant's view.
  // Tenancy period is saved to localStorage so "re-rent" can show the full history.
  // evictedDay / evictedM / evictedY default to today if omitted (supports advance scheduling).
  const evictTenant = useCallback(async (tenantId, evictedDay, evictedM, evictedY) => {
    const d = evictedDay ?? new Date().getDate();
    const m = evictedM  ?? CUR_M;
    const y = evictedY  ?? CUR_Y;
    const cur = tenants.find(t => t.id === tenantId);
    // Save current tenancy period to localStorage history
    if (cur?.room) {
      try {
        const key = `baan_history_${tenantId}`;
        const hist = JSON.parse(localStorage.getItem(key) || '[]');
        hist.push({
          roomId: cur.room,
          sinceDay: cur.sinceDay ?? 1, sinceY: cur.sinceY, sinceM: cur.sinceM,
          evictedDay: d, evictedY: y, evictedM: m,
        });
        localStorage.setItem(key, JSON.stringify(hist));
      } catch {}
    }
    setTenants(prev => prev.map(t => {
      if (t.id !== tenantId) return t;
      return { ...t, room: null, prevRoom: t.room, evicted: true, evictedDay: d, evictedY: y, evictedM: m };
    }));
    if (cur?.room) {
      setRooms(prev => prev.map(r => r.id === cur.room ? { ...r, status: "ว่าง" } : r));
      try {
        await supabase.from("tenants").update({ room_id: null }).eq("id", tenantId);
        await supabase.from("rooms").update({ status: "ว่าง" }).eq("id", cur.room);
      } catch {}
    }
  }, [tenants]);

  // Re-activate an evicted tenant with a new room + start date.
  // The previous tenancy is already saved in localStorage by evictTenant;
  // TenantDetail reads it to populate the "ประวัติก่อนหน้า" tab.
  const reactivateTenant = useCallback(async (tenantId, newRoomId, newSinceY, newSinceM) => {
    const room = rooms.find(r => r.id === newRoomId);
    const price = room?.price ?? 0;
    setTenants(prev => prev.map(t => t.id !== tenantId ? t : {
      ...t, room: newRoomId, sinceY: +newSinceY, sinceM: +newSinceM,
      evicted: false, prevRoom: undefined, evictedY: undefined, evictedM: undefined,
    }));
    setRooms(prev => prev.map(r => r.id === newRoomId ? { ...r, status: "ไม่ว่าง" } : r));
    setPayments(prev => {
      const exists = prev.find(p => p.room_id === newRoomId && p.year === CUR_Y && p.month === CUR_M);
      if (exists) return prev;
      const nextId = Math.max(0, ...prev.map(p => +p.id || 0)) + 1;
      return [...prev, { id: nextId, room_id: newRoomId, year: CUR_Y, month: CUR_M, amount: price, status: "รอชำระ", paid_at: null }];
    });
    try {
      await supabase.from("tenants").update({ room_id: newRoomId, since_y: +newSinceY, since_m: +newSinceM }).eq("id", tenantId);
      await supabase.from("rooms").update({ status: "ไม่ว่าง" }).eq("id", newRoomId);
    } catch {}
  }, [rooms]);

  // ─── Helper: persist the latest meter values directly on the room record ──
  // This ensures readings survive tenant move-out and remain visible on vacant rooms.
  // Defined here (before bulkSaveUtils) to avoid temporal dead zone.
  const syncRoomMeter = useCallback(async (room_id, year, month, elec_cur, water_cur) => {
    setRooms(prev => prev.map(r => {
      if (r.id !== room_id) return r;
      const ly = r.lastMeterYear ?? -1;
      const lm = r.lastMeterMonth ?? -1;
      if (year < ly || (year === ly && month < lm)) return r;
      return { ...r, lastElecMeter: elec_cur, lastWaterMeter: water_cur, lastMeterYear: year, lastMeterMonth: month };
    }));
    // Persist to Supabase so the change survives page refresh / shows on other devices
    try {
      await supabase.from("rooms").update({
        lastElecMeter: elec_cur, lastWaterMeter: water_cur,
        lastMeterYear: year, lastMeterMonth: month,
      }).eq("id", room_id);
    } catch {}
  }, []);

  const bulkSaveUtils = useCallback(async (readings) => {
    // readings: [{room_id, year, month, elec_cur, water_cur}, ...]
    const dbRows = [];
    setUtils(prev => {
      const next = [...prev];
      for (const rd of readings) {
        const lastForRoom = next
          .filter(u => u.room_id === rd.room_id && (
            (u.year < rd.year || (u.year === rd.year && u.month < rd.month)) ||
            (u.year === rd.year && u.month === rd.month && u.isInitial)
          ))
          .sort((a,b) => b.year !== a.year ? b.year - a.year : b.month - a.month)[0];
        const elec_prev = lastForRoom?.elec_cur ?? 0;
        const water_prev = lastForRoom?.water_cur ?? 0;
        const elec_use = Math.max(0, rd.elec_cur - elec_prev);
        const water_use = Math.max(0, rd.water_cur - water_prev);
        const row = {
          room_id: rd.room_id, year: rd.year, month: rd.month,
          elec_prev, elec_cur: rd.elec_cur, elec_use, elec_amount: elec_use * UTIL_RATE.electric,
          water_prev, water_cur: rd.water_cur, water_use, water_amount: water_use * UTIL_RATE.water,
          read_at: new Date().toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }),
        };
        dbRows.push(row);
        const idx = next.findIndex(u => u.room_id === rd.room_id && u.year === rd.year && u.month === rd.month);
        if (idx >= 0) next[idx] = { ...row, id: next[idx].id };
        else next.push({ ...row, id: Date.now() + Math.random() });
      }
      return next;
    });
    // Persist all rows in one batch upsert
    if (dbRows.length) {
      try { await supabase.from("utilities").upsert(dbRows, { onConflict: "room_id,year,month" }); } catch {}
    }
    // Sync latest meter to each room record (also persists to Supabase via syncRoomMeter)
    for (const rd of readings) {
      syncRoomMeter(rd.room_id, rd.year, rd.month, rd.elec_cur, rd.water_cur);
    }
  }, [syncRoomMeter]);

  // ─── Mutations ────────────────────────────────────────────
  const addTenant = useCallback(async ({
    id, name, room_id, phone, since_y, since_m, username, password,
    email, address, idCardNumber, idCardImage, emergencyName, emergencyPhone,
  }) => {
    const newId = id || ("T" + Date.now());
    const row = {
      id: newId, name, room_id, phone: phone || "",
      since_y: +since_y, since_m: +since_m,
      username: username || room_id || phone?.replace(/-/g, "") || newId,
      password: password || "tenant",
      // Optional personal info & docs (kept locally; Supabase insert may skip unknown columns)
      email: email || "",
      address: address || "",
      idCardNumber: idCardNumber || "",
      idCardImage: idCardImage || "",
      emergencyName: emergencyName || "",
      emergencyPhone: emergencyPhone || "",
    };
    // Normalise room_id — empty string means "no room yet"
    const effectiveRoomId = room_id || null;
    const rowWithRoom = { ...row, room_id: effectiveRoomId };
    const adapted = adaptTenant(rowWithRoom);
    setTenants(prev => [...prev, adapted]);

    if (effectiveRoomId) {
      setRooms(prev => prev.map(r => r.id === effectiveRoomId ? { ...r, status: "ไม่ว่าง" } : r));

      // ── ล้าง payment เก่าของห้องนี้จากวันเข้าพักเป็นต้นไป ──────────────
      // ป้องกัน payment ของผู้เช่าเก่า (ที่ถูก delete แบบไม่ผ่าน evict flow)
      const startY = +since_y;
      const startM = +since_m;
      setPayments(prev => prev.filter(p => {
        if (p.room_id !== effectiveRoomId) return true;
        const isFromNewPeriod = p.year > startY || (p.year === startY && p.month >= startM);
        return !isFromNewPeriod;
      }));

      // สร้าง payment เดือนปัจจุบันเป็น "รอชำระ"
      const room = rooms.find(r => r.id === effectiveRoomId);
      const price = room?.price ?? 0;
      setPayments(prev => {
        const exists = prev.find(p => p.room_id === effectiveRoomId && p.year === CUR_Y && p.month === CUR_M);
        if (exists) return prev;
        const nextId = Math.max(0, ...prev.map(p => +p.id || 0)) + 1;
        return [...prev, { id: nextId, room_id: effectiveRoomId, year: CUR_Y, month: CUR_M, amount: price, status: "รอชำระ", paid_at: null }];
      });
    }

    try {
      const dbRow = {
        id: rowWithRoom.id, name: rowWithRoom.name,
        room_id: effectiveRoomId,          // null ถ้ายังไม่กำหนดห้อง
        phone: rowWithRoom.phone,
        since_y: rowWithRoom.since_y, since_m: rowWithRoom.since_m,
        username: rowWithRoom.username, password: rowWithRoom.password,
      };
      await supabase.from("tenants").insert(dbRow);
      if (effectiveRoomId) {
        const startY = +since_y;
        const startM = +since_m;
        const room = rooms.find(r => r.id === effectiveRoomId);
        const price = room?.price ?? 0;
        await supabase.from("rooms").update({ status: "ไม่ว่าง" }).eq("id", effectiveRoomId);
        await supabase.from("payments")
          .delete()
          .eq("room_id", effectiveRoomId)
          .or(`year.gt.${startY},and(year.eq.${startY},month.gte.${startM})`);
        await supabase.from("payments").upsert(
          { room_id: effectiveRoomId, year: CUR_Y, month: CUR_M, amount: price, status: "รอชำระ", paid_at: null },
          { onConflict: "room_id,year,month" }
        );
      }
    } catch {}
    return adapted;
  }, [rooms]);

  const addRoom = useCallback(async (room) => {
    const row = { ...room, floor: +room.floor, price: +room.price, status: room.status || "ว่าง", amenities: room.amenities || [] };
    setRooms(prev => [...prev, row]);
    try { await supabase.from("rooms").insert(row); } catch {}
    return row;
  }, []);

  const deleteRoom = useCallback(async (id) => {
    // Cascade cleanup: remove dependent records so the UI doesn't dangle.
    setRooms(prev => prev.filter(r => r.id !== id));
    setTenants(prev => prev.map(t => t.room === id ? { ...t, room: null, status: "ออกแล้ว" } : t));
    setPayments(prev => prev.filter(p => p.room_id !== id));
    setUtils(prev => prev.filter(u => u.room_id !== id));
    setRepairs(prev => prev.filter(r => r.room_id !== id));
    setSlips(prev => prev.filter(s => s.room_id !== id));
    setBilling(prev => {
      const monthly = { ...prev.monthly };
      Object.keys(monthly).forEach(k => { if (k.startsWith(id + "|")) delete monthly[k]; });
      return { ...prev, monthly };
    });
    try {
      await supabase.from("rooms").delete().eq("id", id);
      await supabase.from("payments").delete().eq("room_id", id);
      await supabase.from("utilities").delete().eq("room_id", id);
      await supabase.from("repairs").delete().eq("room_id", id);
    } catch {}
  }, []);

  const updateOwnerPin = useCallback(async (pin) => {
    setOwnerPin(pin);
    try { await supabase.from("config").upsert({ key: "owner_pin", value: pin }); } catch {}
  }, []);

  const updateRepair = useCallback(async (id, patch) => {
    setRepairs(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
    try { await supabase.from("repairs").update(patch).eq("id", id); } catch {}
  }, []);

  const updateTenant = useCallback(async (id, patch) => {
    setTenants(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
    try {
      // Send only legacy columns to Supabase; in-memory state keeps all fields.
      const ALLOWED = ["name","room","room_id","phone","sinceY","sinceM","since_y","since_m","username","password","moveInDate"];
      const dbPatch = Object.fromEntries(Object.entries(patch).filter(([k]) => ALLOWED.includes(k)));
      // Map camelCase → snake_case for Supabase columns
      if ("sinceY" in dbPatch) { dbPatch.since_y = dbPatch.sinceY; delete dbPatch.sinceY; }
      if ("sinceM" in dbPatch) { dbPatch.since_m = dbPatch.sinceM; delete dbPatch.sinceM; }
      if ("room"   in dbPatch) { dbPatch.room_id = dbPatch.room;   delete dbPatch.room;   }
      if (Object.keys(dbPatch).length) await supabase.from("tenants").update(dbPatch).eq("id", id);
    } catch {}
  }, []);

  const updateRoom = useCallback(async (id, patch) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
    try { await supabase.from("rooms").update(patch).eq("id", id); } catch {}
  }, []);

  const addRepair = useCallback(async (rep) => {
    const id = "R" + Date.now();
    const row = { id, status: "รอดำเนินการ", priority: "ปกติ", created_at: new Date().toISOString().slice(0,10), assigned: null, eta: null, note: null, ...rep };
    setRepairs(prev => [row, ...prev]);
    try { await supabase.from("repairs").insert(row); } catch {}
    return row;
  }, []);

  const deleteRepair = useCallback(async (id) => {
    setRepairs(prev => prev.filter(r => r.id !== id));
    try { await supabase.from("repairs").delete().eq("id", id); } catch {}
  }, []);

  const recordPayment = useCallback(async ({ room_id, year, month, amount }) => {
    const paid_at = new Date().toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
    setPayments(prev => {
      const idx = prev.findIndex(p => p.room_id === room_id && p.year === year && p.month === month);
      const row = { id: idx >= 0 ? prev[idx].id : Date.now(), room_id, year, month, amount, status: "ชำระแล้ว", paid_at };
      if (idx >= 0) {
        const copy = [...prev]; copy[idx] = { ...copy[idx], ...row }; return copy;
      }
      return [...prev, row];
    });
    try {
      await supabase.from("payments").upsert(
        { room_id, year, month, amount, status: "ชำระแล้ว", paid_at },
        { onConflict: "room_id,year,month" }
      );
    } catch {}
  }, []);

  const approveSlip = useCallback(async (id) => {
    // Read slip data from current state before updating — do NOT call async funcs inside setState updater
    const s = slips.find(x => x.id === id);
    setSlips(prev => prev.map(x => x.id === id ? { ...x, status: "approved" } : x));
    setNotifs(prev => prev.filter(n => !(n.type === "slip" && n.link === "slips") || n.id.endsWith(id)));
    // Persist both the slip status AND the payment to Supabase (both must be awaited)
    if (s) await recordPayment({ room_id: s.room_id, year: s.year, month: s.month, amount: s.amount });
    try { await supabase.from("slips").update({ status: "approved" }).eq("id", id); } catch {}
  }, [slips, recordPayment]);

  const rejectSlip = useCallback(async (id) => {
    setSlips(prev => prev.map(x => x.id === id ? { ...x, status: "rejected" } : x));
    try { await supabase.from("slips").update({ status: "rejected" }).eq("id", id); } catch {}
  }, []);

  const deleteSlip = useCallback(async (id) => {
    setSlips(prev => prev.filter(s => s.id !== id));
    try { await supabase.from("slips").delete().eq("id", id); } catch {}
  }, []);

  const addSlip = useCallback(async ({ tenant_id, room_id, year, month, amount, bank, imageUrl, filename }) => {
    const id = "SL" + Date.now();
    const row = {
      id, tenant_id, room_id, year, month, amount, bank,
      uploaded_at: new Date().toLocaleString("th-TH"),
      status: "pending", thumb: "slip-a",
      ...(imageUrl ? { imageUrl, filename } : {}),
    };
    setSlips(prev => [row, ...prev]);
    const tenant = tenants.find(t => t.id === tenant_id);
    const notif = {
      id: "N" + Date.now(), type: "slip", icon: "card",
      title: "ผู้เช่าแนบสลิปใหม่",
      msg: `${tenant?.name?.split(" ")[0] || tenant_id} (${room_id}) · ฿${amount?.toLocaleString?.() || amount}`,
      time: "เมื่อสักครู่", unread: true, link: "slips",
    };
    setNotifs(prev => [notif, ...prev]);
    // Persist to Supabase — must await both; lazy builder never fires without it
    try {
      await supabase.from("slips").insert({
        id, tenant_id, room_id, year, month, amount, bank,
        image_url: imageUrl || null, filename: filename || null,
        status: "pending",
      });
      await supabase.from("notifs").insert({
        id: notif.id, type: notif.type, title: notif.title, msg: notif.msg,
        time: notif.time, unread: true, link: notif.link,
      });
    } catch {}
  }, [tenants]);

  // Re-fetch slips + notifs from Supabase (owner calls this to see a tenant's newly uploaded slip
  // without doing a full page reload — the cross-session state gap means the owner's in-memory
  // copy is stale until explicitly refreshed or the page reloads).
  const refreshSlips = useCallback(async () => {
    try {
      const [slipRes, notifRes] = await Promise.all([
        supabase.from("slips").select("*").order("created_at", { ascending: false }),
        supabase.from("notifs").select("*").order("created_at", { ascending: false }),
      ]);
      if (!slipRes?.error && slipRes?.data) setSlips(slipRes.data.map(adaptSlip));
      if (!notifRes?.error && notifRes?.data) setNotifs(notifRes.data);
    } catch {}
  }, []);

  // Save an initial "seed" meter reading (use=0, amount=0) for move-in day.
  // isInitial records are used as prev baseline when recording the first real billing month.
  const saveInitialReading = useCallback(async ({ room_id, year, month, elec_cur, water_cur }) => {
    let savedRow = null;
    setUtils(prev => {
      const row = {
        room_id, year, month,
        elec_prev: 0, elec_cur, elec_use: 0, elec_amount: 0,
        water_prev: 0, water_cur, water_use: 0, water_amount: 0,
        isInitial: true,
        read_at: new Date().toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }),
      };
      const idx = prev.findIndex(u => u.room_id === room_id && u.year === year && u.month === month);
      if (idx >= 0 && !prev[idx].isInitial) return prev; // real reading already exists — don't overwrite
      savedRow = row;
      if (idx >= 0) { const copy = [...prev]; copy[idx] = { ...row, id: prev[idx].id }; return copy; }
      return [...prev, { ...row, id: Date.now() }];
    });
    if (savedRow) {
      try { await supabase.from("utilities").upsert(savedRow, { onConflict: "room_id,year,month" }); } catch {}
    }
    syncRoomMeter(room_id, year, month, elec_cur, water_cur);
  }, [syncRoomMeter]);

  const saveUtilReading = useCallback(async ({ room_id, year, month, elec_cur, water_cur }) => {
    let savedRow = null;
    setUtils(prev => {
      // Include strictly-earlier records AND initial records for the same month as baseline
      const prevForRoom = prev
        .filter(u => u.room_id === room_id && (
          (u.year < year || (u.year === year && u.month < month)) ||
          (u.year === year && u.month === month && u.isInitial)
        ))
        .sort((a,b) => b.year !== a.year ? b.year - a.year : b.month - a.month);
      const last = prevForRoom[0];
      const elec_prev = last?.elec_cur ?? 0;
      const water_prev = last?.water_cur ?? 0;
      const elec_use = Math.max(0, elec_cur - elec_prev);
      const water_use = Math.max(0, water_cur - water_prev);
      const row = {
        room_id, year, month,
        elec_prev, elec_cur, elec_use, elec_amount: elec_use * UTIL_RATE.electric,
        water_prev, water_cur, water_use, water_amount: water_use * UTIL_RATE.water,
        isInitial: false, // explicit false so Supabase upsert overwrites any existing isInitial=true
        read_at: new Date().toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }),
      };
      savedRow = row;
      // Match any existing record for this room+month (initial or regular) and replace it
      const idx = prev.findIndex(u => u.room_id === room_id && u.year === year && u.month === month);
      if (idx >= 0) { const copy = [...prev]; copy[idx] = { ...row, id: prev[idx].id }; return copy; }
      return [...prev, { ...row, id: Date.now() }];
    });
    if (savedRow) {
      try { await supabase.from("utilities").upsert(savedRow, { onConflict: "room_id,year,month" }); } catch {}
    }
    syncRoomMeter(room_id, year, month, elec_cur, water_cur);
  }, [syncRoomMeter]);

  const markNotifsRead = useCallback(() => {
    setNotifs(prev => prev.map(n => ({ ...n, unread: false })));
  }, []);

  // ─── Billing (เหมา ↔ มิเตอร์) per-room per-month ─────────────────
  const resolveBilling = useCallback((roomId, year, month) => {
    const y = year ?? CUR_Y;
    const m = month ?? CUR_M;
    const key = `${roomId}|${y}|${m}`;
    const o = billing.monthly[key] || {};
    return {
      year: y, month: m,
      elecMode:  o.elecMode  || "metered",
      waterMode: o.waterMode || "metered",
      elecFlat:  o.elecFlat  ?? billing.defaultElecFlat,
      waterFlat: o.waterFlat ?? billing.defaultWaterFlat,
      isSet: !!billing.monthly[key],
    };
  }, [billing]);

  const setRoomBilling = useCallback((roomId, patch, year, month) => {
    const y = year ?? CUR_Y;
    const m = month ?? CUR_M;
    const key = `${roomId}|${y}|${m}`;
    setBilling(prev => {
      const next = {
        ...prev,
        monthly: { ...prev.monthly, [key]: { ...(prev.monthly[key] || {}), ...patch } },
      };
      try { supabase.from("config").upsert({ key: "billing_config", value: JSON.stringify({ monthly: next.monthly, defaultElecFlat: next.defaultElecFlat, defaultWaterFlat: next.defaultWaterFlat }) }); } catch {}
      return next;
    });
  }, []);

  const computePaymentTotal = useCallback((roomId, year, month) => {
    const room = rooms.find(r => r.id === roomId);
    const rent = room?.price || 0;
    const y = year ?? CUR_Y;
    const m = month ?? CUR_M;
    const b = resolveBilling(roomId, y, m);
    const util = utils.find(u => u.room_id === roomId && u.year === y && u.month === m);
    const elec = b.elecMode  === "flat" ? b.elecFlat  : (util?.elec_amount  || 0);
    const water = b.waterMode === "flat" ? b.waterFlat : (util?.water_amount || 0);
    return {
      rent, elec, water,
      utilTotal: elec + water,
      total: rent + elec + water,
      elecMode:  b.elecMode,
      waterMode: b.waterMode,
    };
  }, [rooms, utils, resolveBilling]);

  // ─── Bank account mutations ────────────────────────────────────────
  const addBank = useCallback((bank) => {
    const row = { id: "B" + Date.now(), ...bank };
    setBanks(prev => [...prev, row]);
    try { supabase.from("banks").insert(row); } catch {}
    return row;
  }, []);

  const updateBank = useCallback((id, patch) => {
    setBanks(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b));
    try { supabase.from("banks").update(patch).eq("id", id); } catch {}
  }, []);

  const deleteBank = useCallback((id) => {
    setBanks(prev => prev.filter(b => b.id !== id));
    try { supabase.from("banks").delete().eq("id", id); } catch {}
  }, []);

  const setPrimaryBank = useCallback((id) => {
    setBanks(prev => prev.map(b => ({ ...b, primary: b.id === id })));
    // Atomic-ish: clear all primary flags then set the chosen one
    try {
      supabase.from("banks").update({ primary: false }).neq("id", id)
        .then(() => supabase.from("banks").update({ primary: true }).eq("id", id));
    } catch {}
  }, []);

  // Derive room status from tenant assignments so it can never drift out of sync.
  // A room is "ไม่ว่าง" iff some tenant has room === r.id; otherwise "ว่าง".
  const derivedRooms = useMemo(() => {
    const occupied = new Set(tenants.filter(t => t.room).map(t => t.room));
    return rooms.map(r => {
      const isOccupied = occupied.has(r.id);
      const trueStatus = isOccupied ? "ไม่ว่าง" : "ว่าง";
      return r.status === trueStatus ? r : { ...r, status: trueStatus };
    });
  }, [rooms, tenants]);

  // Initialise room meter values from existing utils records on first load.
  // This ensures rooms that already have readings show the correct meter on their card.
  useEffect(() => {
    if (!loaded) return;
    setRooms(prev => prev.map(r => {
      if (r.lastMeterYear != null) return r; // already set (e.g. saved during this session)
      const latest = utils
        .filter(u => u.room_id === r.id && !u.isInitial)
        .sort((a, b) => b.year - a.year || b.month - a.month)[0];
      if (!latest) return r;
      return { ...r, lastElecMeter: latest.elec_cur, lastWaterMeter: latest.water_cur,
               lastMeterYear: latest.year, lastMeterMonth: latest.month };
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  // Self-heal: after initial hydration, push any drifted statuses back to Supabase
  // so the underlying rows match the derived (tenant-driven) truth. Runs once per load.
  useEffect(() => {
    if (!loaded) return;
    const occupied = new Set(tenants.filter(t => t.room).map(t => t.room));
    const drifted = rooms.filter(r => {
      const trueStatus = occupied.has(r.id) ? "ไม่ว่าง" : "ว่าง";
      return r.status !== trueStatus;
    });
    if (!drifted.length) return;
    setRooms(prev => prev.map(r => {
      const trueStatus = occupied.has(r.id) ? "ไม่ว่าง" : "ว่าง";
      return r.status === trueStatus ? r : { ...r, status: trueStatus };
    }));
    drifted.forEach(r => {
      const trueStatus = occupied.has(r.id) ? "ไม่ว่าง" : "ว่าง";
      try { supabase.from("rooms").update({ status: trueStatus }).eq("id", r.id); } catch {}
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  // ─── Staff (owner-side accounts) ───
  const addStaff = useCallback(async ({ username, password, role = "admin", name = "" }) => {
    const id = "S" + Date.now();
    const row = { id, username: username.trim(), password, role, name };
    setStaff(prev => [...prev, row]);
    try { await supabase.from("staff").insert(row); } catch {}
    return row;
  }, []);

  const updateStaff = useCallback(async (id, patch) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
    try { await supabase.from("staff").update(patch).eq("id", id); } catch {}
  }, []);

  const deleteStaff = useCallback(async (id) => {
    setStaff(prev => prev.filter(s => s.id !== id));
    try { await supabase.from("staff").delete().eq("id", id); } catch {}
  }, []);

  const value = useMemo(() => ({
    rooms: derivedRooms, tenants, payments, repairs, banks, slips, utils, notifs, billing, ownerPin, owner, staff,
    setRooms, setTenants, setPayments, setRepairs, setBanks, setSlips, setUtils, setNotifs, setBilling,
    addTenant, addRoom, deleteRoom, updateOwnerPin, updateOwner,
    updateRepair, addRepair, deleteRepair, updateTenant, updateRoom,
    moveTenant, deleteTenant, evictTenant, reactivateTenant, bulkSaveUtils,
    recordPayment, approveSlip, rejectSlip, deleteSlip, addSlip, refreshSlips, saveUtilReading, saveInitialReading, markNotifsRead,
    // billing
    resolveBilling, setRoomBilling, computePaymentTotal,
    // banks
    addBank, updateBank, deleteBank, setPrimaryBank,
    // staff
    addStaff, updateStaff, deleteStaff,
    loaded, curY: CUR_Y, curM: CUR_M, utilRate: UTIL_RATE,
  }), [derivedRooms, rooms, tenants, payments, repairs, banks, slips, utils, notifs, billing, ownerPin, owner, staff, loaded,
       addTenant, addRoom, deleteRoom, updateOwnerPin, updateOwner,
       updateRepair, addRepair, deleteRepair, updateTenant, updateRoom,
       moveTenant, deleteTenant, evictTenant, reactivateTenant, bulkSaveUtils,
       recordPayment, approveSlip, rejectSlip, deleteSlip, addSlip, refreshSlips, saveUtilReading, saveInitialReading, markNotifsRead,
       resolveBilling, setRoomBilling, computePaymentTotal,
       addBank, updateBank, deleteBank, setPrimaryBank,
       addStaff, updateStaff, deleteStaff]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
