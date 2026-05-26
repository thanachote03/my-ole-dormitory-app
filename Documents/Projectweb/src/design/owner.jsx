// Desktop · Owner Dashboard
import { useState, useEffect, Fragment } from "react";
import { DI, amenityIcon } from "./icons";
import { MONTHS_TH, MONTHS_FULL, dl, dld, baht } from "./seed";
import { useData } from "./DataContext";
import {
  AddTenantModal as NewAddTenantModal,
  EditTenantModal as NewEditTenantModal,
  SettingsModal as NewSettingsModal,
  BulkMeterModal,
  MonthDetailModal,
  RoomDetailModal,
  AddRoomModal as NewAddRoomModal,
  AddRepairModal,
  Avatar as ModalAvatar,
  downloadCsv,
  ReceiptModal,
  FlatRateModal,
} from "./modals";

const {
  IconChart, IconUsers, IconBuilding, IconCard, IconWrench,
  IconSparkle, IconTrend, IconBell, IconSearch, IconPlus,
  IconCheck, IconX, IconArrowRight, IconChevR, IconCal,
  IconPhone, IconSettings, IconLogout, IconDownload, IconFilter,
  IconClock, IconEdit, IconWifi, IconTrash,
} = DI;

export function OwnerDesktop({ initialTab = "overview", staffRole = "admin", staffName, onLogout }) {
  const [tab, setTab] = useState(initialTab);
  const [tenantSel, setTenantSel] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);

  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  // Meter-only staff: only the bulk meter screen is exposed.
  if (staffRole === "meter") {
    return (
      <div style={{ width: "100%", minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
        <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)",
          padding: "12px 24px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <DI.IconBee size={22}/>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Bee<span style={{ color: "var(--brand)" }}>.</span></div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--brand)", background: "var(--brand-soft)",
            padding: "3px 10px", borderRadius: 100 }}>โหมดจดมิเตอร์</div>
          <div style={{ flex: 1, fontSize: 13, color: "var(--ink-3)" }}>
            {staffName || "ผู้จดมิเตอร์"}
          </div>
          <button onClick={onLogout} style={{ padding: "7px 14px", borderRadius: 10,
            border: "1px solid var(--line)", background: "var(--bg)", cursor: "pointer",
            fontSize: 12.5, color: "var(--ink-2)" }}>ออกจากระบบ</button>
        </div>
        <BulkMeterModal onClose={onLogout}/>
      </div>
    );
  }

  const contentArea = (
    <div style={{ flex: 1, overflow: "auto", padding: mobile ? "16px" : "20px 32px 32px", background: "var(--bg)" }} className="screen-in" key={tab}>
      {tab === "overview" && <Overview onOpenTenant={(t) => { setTenantSel(t); setTab("tenants"); }} setTab={setTab} />}
      {tab === "tenants"  && <TenantsPage initial={tenantSel} onClear={() => setTenantSel(null)}/>}
      {tab === "rooms"    && <RoomsPage onOpenTenant={(t) => { setTenantSel(t); setTab("tenants"); }}/>}
      {tab === "slips"    && <SlipsPage/>}
      {tab === "utility"  && <UtilityPage/>}
      {tab === "repairs"  && <RepairsPage/>}
      {tab === "history"  && <HistoryPage/>}
    </div>
  );

  if (mobile) {
    return (
      <div style={{ width: "100%", minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
        <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)", padding: "12px 16px",
          display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <button onClick={onLogout} style={{ width: 34, height: 34, borderRadius: 9, background: "var(--bg)",
            border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "var(--ink-2)", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div style={{ flex: 1, fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", gap: 6 }}>
            <DI.IconBee size={20}/> Bee<span style={{ color: "var(--brand)" }}>.</span>
          </div>
          <button onClick={() => setShowSettings(true)} style={{ width: 34, height: 34, borderRadius: 9, background: "var(--bg)",
            border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "var(--ink-2)" }}>
            <IconSettings size={16}/>
          </button>
        </div>
        <div style={{ overflowX: "auto", background: "var(--surface)", borderBottom: "1px solid var(--line)",
          display: "flex", padding: "8px 12px", gap: 6, flexShrink: 0, scrollbarWidth: "none" }}>
          {[
            { id: "overview", label: "ภาพรวม" }, { id: "tenants", label: "ผู้เช่า" },
            { id: "rooms", label: "ห้องพัก" }, { id: "slips", label: "อนุมัติสลิป" },
            { id: "utility", label: "ค่าน้ำไฟ" }, { id: "repairs", label: "ซ่อมบำรุง" },
            { id: "history", label: "รายงาน" },
          ].map(it => (
            <button key={it.id} onClick={() => setTab(it.id)} style={{
              padding: "6px 14px", borderRadius: 100, border: "none", cursor: "pointer", whiteSpace: "nowrap",
              fontSize: 12.5, fontWeight: tab === it.id ? 700 : 500,
              background: tab === it.id ? "var(--brand)" : "var(--bg)",
              color: tab === it.id ? "white" : "var(--ink-2)", transition: "all .15s",
            }}>{it.label}</button>
          ))}
        </div>
        {contentArea}
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      </div>
    );
  }

  return (
    <div style={{
      width: "100%", maxWidth: 1320, margin: "20px auto", height: "calc(100vh - 40px)",
      background: "var(--bg)", display: "flex",
      borderRadius: 18, overflow: "hidden", border: "1px solid var(--line-2)", boxShadow: "var(--sh-3)"
    }}>
      <Sidebar tab={tab} setTab={setTab} onLogout={onLogout} onSettings={() => setShowSettings(true)}/>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar setTab={setTab} onAddTenant={() => setShowAddTenant(true)}/>
        {contentArea}
      </div>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)}/>}
      {showAddTenant && <AddTenantModal onClose={() => setShowAddTenant(false)}/>}
    </div>
  );
}

function Sidebar({ tab, setTab, onLogout, onSettings }) {
  const { tenants, rooms, slips, repairs, owner } = useData();
  const pendingSlips = slips.filter(s => s.status === "pending").length;
  const pendingRepairs = repairs.filter(r => r.status !== "เสร็จแล้ว").length;

  const items = [
    { id: "overview", label: "ภาพรวม",  icon: IconChart },
    { id: "tenants",  label: "ผู้เช่า",  icon: IconUsers, badge: tenants.length },
    { id: "rooms",    label: "ห้องพัก",  icon: IconBuilding, badge: rooms.length },
    { id: "slips",    label: "อนุมัติสลิป", icon: IconCard, badge: pendingSlips, highlight: true },
    { id: "utility",  label: "ค่าน้ำค่าไฟ", icon: IconSparkle },
    { id: "repairs",  label: "ซ่อมบำรุง", icon: IconWrench, dot: pendingRepairs > 0 },
    { id: "history",  label: "รายงาน",  icon: IconTrend },
  ];
  return (
    <div style={{ width: 248, background: "var(--surface)", borderRight: "1px solid var(--line)",
      display: "flex", flexDirection: "column", padding: "22px 16px 16px", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 6px 22px" }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--brand-soft)",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <DI.IconBee size={28}/>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: -0.2 }}>{owner.dorm || "Bee"}<span style={{color:"var(--brand)"}}>.</span></div>
          <div style={{ fontSize: 11, color: "var(--ink-3)" }}>เจ้าของหอพัก</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--ink-4)", textTransform: "uppercase",
          letterSpacing: 1.2, padding: "6px 12px 8px" }}>เมนูหลัก</div>
        {items.map(it => {
          const Ic = it.icon;
          const active = tab === it.id;
          return (
            <button key={it.id} onClick={() => setTab(it.id)} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
              borderRadius: 11, border: "none", cursor: "pointer", textAlign: "left",
              background: active ? "var(--brand-soft)" : "transparent",
              color: active ? "var(--brand-ink)" : "var(--ink-2)",
              fontWeight: active ? 700 : 500, fontSize: 13.5, position: "relative",
            }}>
              <Ic size={18} stroke={active ? "var(--brand)" : "var(--ink-3)"} strokeWidth={active ? 2 : 1.75}/>
              <span style={{ flex: 1 }}>{it.label}</span>
              {it.badge ? <span style={{
                fontSize: 11, fontWeight: 700, padding: "1px 8px", borderRadius: 100,
                background: it.highlight ? "var(--brand)" : active ? "var(--brand)" : "var(--surface-2)",
                color: (it.highlight || active) ? "white" : "var(--ink-3)",
              }} className="num">{it.badge}</span> : null}
              {it.dot && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--brand)" }}/>}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1 }}/>

      <div style={{ background: "linear-gradient(150deg, var(--brand-soft), var(--sage-soft))",
        borderRadius: 14, padding: 14, position: "relative", overflow: "hidden" }}>
        <IconSparkle size={18} stroke="var(--brand)" style={{ marginBottom: 6 }}/>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", lineHeight: 1.3 }}>
          อัพเกรดเป็น Pro<br/>เพื่อรายงานละเอียดขึ้น
        </div>
        <button style={{ marginTop: 10, fontSize: 12, fontWeight: 700, padding: "6px 12px",
          borderRadius: 100, background: "var(--ink)", color: "white", border: "none", cursor: "pointer" }}>
          ดูแพ็คเกจ →
        </button>
      </div>

      <div style={{ marginTop: 12, padding: "10px 8px", display: "flex", alignItems: "center", gap: 10,
        borderTop: "1px solid var(--line)", paddingTop: 14 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--ink)",
          color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>
          {(owner.displayName || "ส").charAt(owner.displayName?.startsWith("คุณ") ? 3 : 0)}
        </div>
        <button onClick={onSettings} style={{ flex: 1, background: "transparent", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600 }}>{owner.displayName}</div>
          <div style={{ fontSize: 10.5, color: "var(--ink-3)" }}>เจ้าของหอพัก</div>
        </button>
        <button onClick={onSettings} title="ตั้งค่า" style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--ink-3)", padding: 4 }}>
          <IconSettings size={16}/>
        </button>
        <button onClick={onLogout} title="ออกจากระบบ" style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--ink-3)", padding: 4 }}>
          <IconLogout size={16}/>
        </button>
      </div>
    </div>
  );
}

function Topbar({ setTab, onAddTenant }) {
  const { notifs, markNotifsRead } = useData();
  const [open, setOpen] = useState(false);
  const unread = notifs.filter(n => n.unread).length;

  return (
    <div style={{ padding: "16px 32px", borderBottom: "1px solid var(--line)", background: "var(--surface)",
      display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--surface-2)",
        borderRadius: 12, padding: "9px 14px", flex: 1, maxWidth: 420, border: "1px solid var(--line)" }}>
        <IconSearch size={16} stroke="var(--ink-3)"/>
        <input placeholder="ค้นหาผู้เช่า, ห้อง, รายการ..." style={{
          flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 13, color: "var(--ink)",
        }}/>
        <span style={{ fontSize: 10, color: "var(--ink-4)", background: "var(--surface)",
          padding: "2px 6px", borderRadius: 4, border: "1px solid var(--line)" }} className="num">⌘K</span>
      </div>

      <div style={{ flex: 1 }}/>

      <div style={{ position: "relative" }}>
        <button onClick={() => setOpen(!open)} style={{ width: 38, height: 38, borderRadius: 11,
          background: open ? "var(--brand-soft)" : "var(--surface)",
          border: `1px solid ${open ? "var(--brand)" : "var(--line)"}`, cursor: "pointer",
          color: "var(--ink-2)", position: "relative",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconBell size={17} stroke={open ? "var(--brand)" : "var(--ink-2)"}/>
          {unread > 0 && (
            <span className="num" style={{ position: "absolute", top: -4, right: -4,
              minWidth: 18, height: 18, padding: "0 5px", borderRadius: 100, background: "var(--brand)",
              color: "white", fontSize: 10, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "2px solid var(--surface)",
            }}>{unread}</span>
          )}
        </button>

        {open && <NotifDropdown notifs={notifs} onPick={(n) => { setOpen(false); markNotifsRead(); n.link && setTab?.(n.link); }} onClose={() => setOpen(false)} onReadAll={markNotifsRead}/>}
      </div>

      <button onClick={onAddTenant} style={{ background: "var(--ink)", color: "white", border: "none", borderRadius: 11,
        padding: "9px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
        <IconPlus size={16} stroke="white"/> เพิ่มผู้เช่าใหม่
      </button>
    </div>
  );
}

function NotifDropdown({ notifs, onPick, onClose, onReadAll }) {
  const iconMap = { card: IconCard, wrench: IconWrench, bolt: IconSparkle };
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 50 }}/>
      <div style={{
        position: "absolute", right: 0, top: 48, width: 360, background: "var(--surface)",
        borderRadius: 16, border: "1px solid var(--line)", boxShadow: "var(--sh-3)", zIndex: 100,
        overflow: "hidden",
      }} className="screen-in">
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)",
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>การแจ้งเตือน</div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
              {notifs.filter(n=>n.unread).length} รายการใหม่
            </div>
          </div>
          <button onClick={onReadAll} style={{ background: "transparent", border: "none", color: "var(--brand)",
            fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>อ่านทั้งหมด</button>
        </div>
        <div style={{ maxHeight: 380, overflow: "auto" }}>
          {notifs.map(n => {
            const Ic = iconMap[n.icon] || IconBell;
            const tone = n.type === "slip" ? ["var(--brand-soft)","var(--brand)"]
                      : n.type === "repair" ? ["var(--warn-soft)","var(--warn)"]
                      : ["var(--info-soft)","var(--info)"];
            return (
              <button key={n.id} onClick={() => onPick(n)} className="lift" style={{
                width: "100%", padding: "12px 16px", border: "none", background: n.unread ? "var(--brand-soft)" : "transparent",
                borderTop: "1px solid var(--line)", cursor: "pointer", textAlign: "left",
                display: "flex", alignItems: "flex-start", gap: 12, position: "relative",
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: tone[0],
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Ic size={17} stroke={tone[1]}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{n.title}</div>
                    {n.unread && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--brand)" }}/>}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{n.msg}</div>
                  <div style={{ fontSize: 10.5, color: "var(--ink-4)", marginTop: 4 }}>{n.time}</div>
                </div>
                <IconChevR size={14} stroke="var(--ink-4)" style={{ marginTop: 6 }}/>
              </button>
            );
          })}
        </div>
        <div style={{ padding: "10px 16px", borderTop: "1px solid var(--line)", textAlign: "center" }}>
          <button style={{ background: "transparent", border: "none", color: "var(--ink-2)",
            fontSize: 12, fontWeight: 600, cursor: "pointer" }}>ดูประวัติทั้งหมด →</button>
        </div>
      </div>
    </>
  );
}

// ─── OVERVIEW ──────────────────────────────────────────────────────────
function Overview({ onOpenTenant, setTab ,onEditRoom }) {
  const { tenants, rooms, payments, repairs, slips, curY, curM, computePaymentTotal } = useData();
  const [viewY, setViewY] = useState(curY);
  const [viewM, setViewM] = useState(curM);
  const [showPicker, setShowPicker] = useState(false);
  const [pickY, setPickY] = useState(curY); // year shown in the picker

  const isCurrentMonth = viewY === curY && viewM === curM;
  const goPrev = () => {
    if (viewM === 0) { setViewY(y => y - 1); setViewM(11); }
    else setViewM(m => m - 1);
  };
  const goNext = () => {
    if (isCurrentMonth) return;
    if (viewM === 11) { setViewY(y => y + 1); setViewM(0); }
    else setViewM(m => m + 1);
  };
  const pickMonth = (m) => {
    const isFuture = pickY > curY || (pickY === curY && m > curM);
    if (isFuture) return;
    setViewY(pickY); setViewM(m); setShowPicker(false);
  };

  const pendingSlips = slips.filter(s => s.status === "pending");
  const occupied = rooms.filter(r => r.status === "ไม่ว่าง").length;
  const occRate = rooms.length ? Math.round(occupied / rooms.length * 100) : 0;
  // Synthesise virtual "รอชำระ" rows for months in a tenant's tenancy that
  // have no real record. Required so KPIs match the tenant-detail view for
  // tenants created before all-months-on-create was added.
  const effectivePayments = (() => {
    const realKey = new Set(payments.map(p => `${p.room_id}|${p.year}|${p.month}`));
    const virtual = [];
    tenants.forEach(t => {
      const roomId = t.room || t.prevRoom;
      if (!roomId || t.sinceY == null || t.sinceM == null) return;
      const endY = t.evicted ? +t.evictedY : curY;
      const endM = t.evicted ? +t.evictedM : curM;
      const price = rooms.find(r => r.id === roomId)?.price || 0;
      let y = +t.sinceY, m = +t.sinceM, guard = 0;
      while ((y < endY || (y === endY && m <= endM)) && guard < 120) {
        const k = `${roomId}|${y}|${m}`;
        if (!realKey.has(k)) {
          virtual.push({ id: `virt-${k}`, room_id: roomId, year: y, month: m,
            amount: price, status: "รอชำระ", paid_at: null, _virtual: true });
        }
        m++; if (m > 11) { m = 0; y++; }
        guard++;
      }
    });
    return [...payments, ...virtual];
  })();
  // Revenue uses stored amount (already includes util at payment time).
  // Due is recalculated via computePaymentTotal so rent + util matches tenant detail.
  const monthRev = effectivePayments.filter(p => p.year === viewY && p.month === viewM && p.status === "ชำระแล้ว").reduce((s,p)=>s+p.amount, 0);
  const monthDue = effectivePayments.filter(p => p.year === viewY && p.month === viewM && p.status === "รอชำระ")
    .reduce((s,p) => s + (computePaymentTotal ? computePaymentTotal(p.room_id, p.year, p.month).total : p.amount), 0);
  const pendingCount = effectivePayments.filter(p => p.year === viewY && p.month === viewM && p.status === "รอชำระ").length;

  const series = [];
  for (let i = 5; i >= 0; i--) {
    let y = viewY, m = viewM - i;
    while (m < 0) { m += 12; y--; }
    const rev = effectivePayments.filter(p => p.year === y && p.month === m && p.status === "ชำระแล้ว").reduce((s,p)=>s+p.amount,0);
    const due = effectivePayments.filter(p => p.year === y && p.month === m && p.status === "รอชำระ")
      .reduce((s,p) => s + (computePaymentTotal ? computePaymentTotal(p.room_id, p.year, p.month).total : p.amount), 0);
    series.push({ y, m, rev, due });
  }
  const maxRev = Math.max(1, ...series.map(s => s.rev + s.due)) * 1.1;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 500 }}>
            ภาพรวม{isCurrentMonth ? "เดือนนี้" : "ย้อนหลัง"} · {dl(viewY, viewM)}
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4, letterSpacing: -0.6 }}>สวัสดีตอนเช้า, คุณสมพร <span style={{ fontSize: 26 }}>☀️</span></div>
          <div style={{ fontSize: 14, color: "var(--ink-3)", marginTop: 6 }}>
            มี <span style={{ color: "var(--brand)", fontWeight: 700 }}>{pendingCount} ห้อง</span> ยังไม่ชำระและงานซ่อม <span style={{ color: "var(--warn)", fontWeight: 700 }}>{repairs.filter(r=>r.status!=="เสร็จแล้ว").length} รายการ</span> รอดูแล
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button style={detailBtn("ghost")}>
            <IconDownload size={15} stroke="var(--ink-2)"/> ส่งออก
          </button>

          {/* Month nav arrows */}
          <button onClick={goPrev} title="เดือนก่อนหน้า" style={{
            ...detailBtn("ghost"), padding: "9px 10px", minWidth: 0,
          }}>‹</button>
          <button onClick={goNext} disabled={isCurrentMonth} title="เดือนถัดไป" style={{
            ...detailBtn("ghost"), padding: "9px 10px", minWidth: 0,
            opacity: isCurrentMonth ? 0.35 : 1, cursor: isCurrentMonth ? "not-allowed" : "pointer",
          }}>›</button>

          {/* Month picker button + popover */}
          <div style={{ position: "relative" }}>
            <button onClick={() => { setShowPicker(o => !o); setPickY(viewY); }} style={{
              ...detailBtn("ghost"),
              background: isCurrentMonth ? undefined : "var(--brand-soft)",
              border: isCurrentMonth ? undefined : "1px solid var(--brand)",
              color: isCurrentMonth ? undefined : "var(--brand-ink)",
            }}>
              <IconCal size={15} stroke={isCurrentMonth ? "var(--ink-2)" : "var(--brand)"}/>
              {MONTHS_FULL[viewM]} {viewY + 543}
              {!isCurrentMonth && (
                <span style={{ fontSize: 9, background: "var(--brand)", color: "white",
                  borderRadius: 100, padding: "2px 6px", fontWeight: 700 }}>ย้อนหลัง</span>
              )}
            </button>

            {showPicker && (
              <>
                {/* Backdrop to close picker */}
                <div onClick={() => setShowPicker(false)} style={{ position: "fixed", inset: 0, zIndex: 98 }}/>
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: 99,
                  background: "var(--surface)", borderRadius: 16, border: "1px solid var(--line)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.13)", padding: 18, width: 260 }}>

                  {/* Year navigation */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <button onClick={() => setPickY(y => y - 1)} style={{
                      width: 30, height: 30, borderRadius: 8, border: "1px solid var(--line)",
                      background: "var(--surface-2)", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>‹</button>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{pickY + 543}</span>
                    <button onClick={() => setPickY(y => Math.min(y + 1, curY))} disabled={pickY >= curY} style={{
                      width: 30, height: 30, borderRadius: 8, border: "1px solid var(--line)",
                      background: pickY >= curY ? "var(--surface-2)" : "var(--surface-2)",
                      cursor: pickY >= curY ? "not-allowed" : "pointer",
                      fontWeight: 700, fontSize: 14, opacity: pickY >= curY ? 0.35 : 1 }}>›</button>
                  </div>

                  {/* Month grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
                    {MONTHS_TH.map((mn, i) => {
                      const isFuture = pickY > curY || (pickY === curY && i > curM);
                      const isSel = pickY === viewY && i === viewM;
                      const isCur = pickY === curY && i === curM;
                      return (
                        <button key={i} onClick={() => pickMonth(i)} disabled={isFuture} style={{
                          padding: "8px 4px", borderRadius: 9, fontSize: 12.5, fontWeight: isSel ? 700 : 500,
                          border: isSel ? "1.5px solid var(--brand)" : isCur ? "1px solid var(--ink-4)" : "1px solid transparent",
                          background: isSel ? "var(--brand)" : isCur ? "var(--surface-2)" : "transparent",
                          color: isSel ? "white" : isFuture ? "var(--ink-4)" : "var(--ink)",
                          cursor: isFuture ? "not-allowed" : "pointer",
                          opacity: isFuture ? 0.35 : 1,
                        }}>{mn}</button>
                      );
                    })}
                  </div>

                  {/* Reset to current month */}
                  {!isCurrentMonth && (
                    <button onClick={() => { setViewY(curY); setViewM(curM); setShowPicker(false); }}
                      style={{ marginTop: 12, width: "100%", padding: "8px 0", borderRadius: 9,
                        background: "var(--brand-soft)", border: "none", color: "var(--brand-ink)",
                        fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>
                      ↩ กลับเดือนปัจจุบัน
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {pendingSlips.length > 0 && (
        <button onClick={() => setTab?.("slips")} className="lift" style={{
          width: "100%", textAlign: "left", cursor: "pointer",
          background: "linear-gradient(105deg, var(--brand) 0%, var(--brand-2) 100%)",
          color: "white", borderRadius: 16, padding: "14px 20px", border: "none", marginBottom: 18,
          display: "flex", alignItems: "center", gap: 16, boxShadow: "0 14px 32px -16px var(--brand)",
          position: "relative", overflow: "hidden",
        }}>
          <svg viewBox="0 0 100 100" style={{ position: "absolute", right: 24, top: -10, width: 120, opacity: 0.16 }}>
            <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="10"/>
            <circle cx="50" cy="50" r="22" fill="none" stroke="white" strokeWidth="7"/>
          </svg>
          <div style={{ width: 46, height: 46, borderRadius: 13, background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
            <IconCard size={22} stroke="white"/>
            <span style={{ position: "absolute", top: -3, right: -3, minWidth: 18, height: 18, padding: "0 5px",
              borderRadius: 100, background: "white", color: "var(--brand-2)", fontSize: 10, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--brand)" }} className="num">
              {pendingSlips.length}
            </span>
          </div>
          <div style={{ flex: 1, position: "relative" }}>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.1 }}>มีสลิปการชำระรอการอนุมัติ</div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>
              {pendingSlips.length} รายการ · มูลค่ารวม {baht(pendingSlips.reduce((s,x)=>s+x.amount,0))} · กดเพื่อตรวจสอบ
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12.5, fontWeight: 700, position: "relative" }}>
            ตรวจสอบเลย <IconArrowRight size={15} stroke="white"/>
          </div>
        </button>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        <KPI label="รายได้เดือนนี้"  value={baht(monthRev)} sub="+12.4% vs เดือนก่อน" trend="up" tone="brand"/>
        <KPI label="ค้างชำระ"         value={baht(monthDue)} sub={`${pendingCount} ห้องค้าง`}    trend="warn" tone="warn"/>
        <KPI label="อัตราเข้าพัก"     value={`${occRate}%`}  sub={`${occupied}/${rooms.length} ห้อง`}   trend="up" tone="sage"/>
        <KPI label="แจ้งซ่อมรอ"       value={repairs.filter(r=>r.status!=="เสร็จแล้ว").length}    sub="ดูทั้งหมด"                trend="link" tone="lilac"/>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 18, marginBottom: 24 }}>
        <Card title="รายได้ 6 เดือนล่าสุด" right={
          <div style={{ display: "flex", gap: 14, fontSize: 11.5, fontWeight: 600 }}>
            <LegendDot c="var(--brand)" label="ชำระแล้ว"/>
            <LegendDot c="var(--warn-soft)" label="ค้างชำระ" border="var(--warn)"/>
          </div>
        }>
          <div style={{ height: 220, display: "flex", alignItems: "flex-end", gap: 28, padding: "16px 8px 0" }}>
            {series.map((s, i) => {
              const dueH = s.due / maxRev * 180;
              const revH = s.rev / maxRev * 180;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <div className="num" style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-2)" }}>{((s.rev+s.due)/1000).toFixed(1)}k</div>
                  <div style={{ width: "100%", maxWidth: 44, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: 180 }}>
                    {s.due > 0 && <div style={{ height: dueH, background: "var(--warn-soft)", border: "1px solid var(--warn)", borderBottom: "none", borderRadius: "8px 8px 0 0" }}/>}
                    <div style={{ height: revH, background: "var(--brand)", borderRadius: s.due > 0 ? 0 : "8px 8px 0 0",
                      boxShadow: i === series.length-1 ? "0 0 0 3px var(--brand-soft)" : "none" }}/>
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-3)", fontWeight: 600 }}>{MONTHS_TH[s.m]}</div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="สถานะห้องพัก">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Donut size={130} segments={[
              { value: occupied, color: "var(--brand)" },
              { value: Math.max(0, rooms.length - occupied), color: "var(--sage-soft)" },
            ]} center={<>
              <div className="num" style={{ fontSize: 24, fontWeight: 700, lineHeight: 1 }}>{occRate}%</div>
              <div style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 3 }}>เข้าพัก</div>
            </>}/>
            <div style={{ flex: 1 }}>
              <LegendRow color="var(--brand)" label="มีผู้เช่า" value={occupied}/>
              <div style={{ height: 8 }}/>
              <LegendRow color="var(--sage)" label="ห้องว่าง" value={Math.max(0, rooms.length - occupied)}/>
              <div style={{ marginTop: 14, padding: "10px 12px", background: "var(--surface-2)", borderRadius: 10 }}>
                <div style={{ fontSize: 11, color: "var(--ink-3)" }}>ห้องว่างพร้อมเช่า</div>
                <div style={{ fontSize: 12.5, fontWeight: 700, marginTop: 2 }}>
                  {rooms.filter(r=>r.status==="ว่าง").map(r=>r.id).join(", ") || "—"}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <Card title="ค้างชำระ" right={<a style={{ fontSize: 12, color: "var(--brand)", fontWeight: 600, cursor: "pointer" }}>ดูทั้งหมด →</a>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {tenants.filter(t => effectivePayments.find(p => p.room_id === t.room && p.year === viewY && p.month === viewM && p.status === "รอชำระ"))
              .slice(0, 4).map(t => {
                const room = rooms.find(r => r.id === t.room);
                const dueTotal = computePaymentTotal ? computePaymentTotal(t.room, viewY, viewM).total : (room?.price || 0);
                return (
                  <div key={t.id} className="lift" onClick={() => onOpenTenant?.(t)} style={{
                    padding: "10px 8px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
                    borderRadius: 10,
                  }}>
                    <Avatar name={t.name}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600 }}>{t.name}</div>
                      <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>ห้อง {t.room} · {room?.type}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="num" style={{ fontSize: 13, fontWeight: 700, color: "var(--brand)" }}>{baht(dueTotal)}</div>
                      <div style={{ fontSize: 10.5, color: "var(--warn)", fontWeight: 700, marginTop: 2 }}>ค้าง</div>
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
        <Card title="งานซ่อมล่าสุด" right={<a style={{ fontSize: 12, color: "var(--brand)", fontWeight: 600, cursor: "pointer" }}>ดูทั้งหมด →</a>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {repairs.slice(0, 4).map(r => {
              const tone = r.status === "เสร็จแล้ว" ? "ok" : r.status === "กำลังดำเนินการ" ? "info" : "warn";
              const colors = { warn:["var(--warn-soft)","var(--warn)"], info:["var(--info-soft)","var(--info)"], ok:["var(--ok-soft)","var(--ok)"] }[tone];
              return (
                <div key={r.id} className="lift" style={{
                  padding: "10px 8px", display: "flex", alignItems: "center", gap: 12, borderRadius: 10, cursor: "pointer",
                }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: colors[0],
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <IconWrench size={16} stroke={colors[1]}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.issue}</div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>ห้อง {r.room_id} · {r.created_at ? new Date(r.created_at).toLocaleDateString("th-TH",{day:"numeric",month:"short"}) : "—"}</div>
                  </div>
                  <span style={{ background: colors[0], color: colors[1], padding: "3px 9px",
                    borderRadius: 100, fontSize: 10.5, fontWeight: 700 }}>{r.status}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

function KPI({ label, value, sub, trend, tone }) {
  const accent = { brand: "var(--brand)", warn: "var(--warn)", sage: "var(--sage-ink)", lilac: "var(--lilac)" }[tone];
  const tintBg = { brand: "var(--brand-soft)", warn: "var(--warn-soft)", sage: "var(--sage-soft)", lilac: "var(--lilac-soft)" }[tone];
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16,
      padding: "16px 18px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: tintBg, opacity: 0.6 }}/>
      <div style={{ position: "relative" }}>
        <div style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 600 }}>{label}</div>
        <div className="num" style={{ fontSize: 24, fontWeight: 700, marginTop: 8, color: "var(--ink)", letterSpacing: -0.5 }}>{value}</div>
        <div style={{ fontSize: 11.5, color: accent, fontWeight: 600, marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
          {trend === "up" && "↗"} {trend === "warn" && "•"} {trend === "link" && "→"} {sub}
        </div>
      </div>
    </div>
  );
}

function Card({ title, right, children }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 18, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.1 }}>{title}</div>
        {right}
      </div>
      {children}
    </div>
  );
}

function LegendDot({ c, label, border }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--ink-3)" }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: c, border: border ? `1px solid ${border}` : "none" }}/>
      {label}
    </div>
  );
}

function LegendRow({ color, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: color }}/>
      <div style={{ flex: 1, fontSize: 12.5, color: "var(--ink-2)" }}>{label}</div>
      <div className="num" style={{ fontSize: 14, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function Donut({ size, segments, center }) {
  const r = size / 2 - 12;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let offset = 0;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        {segments.map((seg, i) => {
          const len = (seg.value / total) * c;
          const dash = `${len} ${c - len}`;
          const el = <circle key={i} cx={size/2} cy={size/2} r={r}
            fill="none" stroke={seg.color} strokeWidth="14"
            strokeDasharray={dash} strokeDashoffset={-offset} strokeLinecap="butt"/>;
          offset += len;
          return el;
        })}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {center}
      </div>
    </div>
  );
}

function Avatar({ name = "?", size = 36 }) {
  const colors = ["var(--brand)","var(--sage)","var(--lilac)","var(--warn)","var(--info)"];
  const hash = (name.charCodeAt(0) || 0) + (name.charCodeAt(1) || 0);
  const bg = colors[hash % colors.length];
  return (
    <div style={{ width: size, height: size, borderRadius: 10, background: bg,
      color: "white", display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.4, fontWeight: 700, flexShrink: 0 }}>
      {name.charAt(0)}
    </div>
  );
}

// ─── TENANTS PAGE ──────────────────────────────────────────────────────────
function TenantsPage({ initial }) {
  const { tenants, rooms, payments, curY, curM } = useData();
  const [sel, setSel] = useState(initial || tenants[0]);
  const [q, setQ] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const list = tenants
    .filter(t => t.name.includes(q) || (t.room || "").toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => {
      const aEvicted = !!a.evicted;
      const bEvicted = !!b.evicted;
      // อดีตผู้เช่าอยู่ด้านล่างเสมอ
      if (aEvicted !== bEvicted) return aEvicted ? 1 : -1;
      // อดีตผู้เช่าทั้งคู่ → เรียงตามวันเลิกเช่าล่าสุดก่อน
      if (aEvicted && bEvicted) {
        if (a.evictedY !== b.evictedY) return b.evictedY - a.evictedY;
        return b.evictedM - a.evictedM;
      }
      // ผู้เช่าปกติ: ยังไม่มีห้องขึ้นก่อนสุด
      if (!a.room && b.room) return -1;
      if (a.room && !b.room) return 1;
      // มีห้องทั้งคู่ → เรียงตามวันเข้าพักใหม่สุดก่อน (newest first)
      const aY = a.sinceY ?? 0, aM = a.sinceM ?? 0;
      const bY = b.sinceY ?? 0, bM = b.sinceM ?? 0;
      if (aY !== bY) return bY - aY;
      if (aM !== bM) return bM - aM;
      return String(a.room || "").localeCompare(String(b.room || ""), undefined, { numeric: true });
    });
  const current = sel ? tenants.find(t => t.id === sel.id) || sel : null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 18, height: "100%" }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 18,
        display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>ผู้เช่า</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>{tenants.length} คน · เดือน{MONTHS_TH[curM]}</div>
            </div>
            <button onClick={() => setShowAdd(true)} style={{ background: "var(--brand)", color: "white", border: "none", borderRadius: 10,
              padding: "8px 12px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
              <IconPlus size={14} stroke="white"/> เพิ่ม
            </button>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", background: "var(--surface-2)",
            borderRadius: 10, padding: "8px 12px", border: "1px solid var(--line)" }}>
            <IconSearch size={15} stroke="var(--ink-3)"/>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="ค้นหาชื่อ หรือเลขห้อง" style={{
              flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 13, color: "var(--ink)",
            }}/>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "8px 8px" }}>
          {list.map(t => {
            const room = rooms.find(r => r.id === t.room);
            const pay = payments.find(p => p.room_id === t.room && p.year === curY && p.month === curM);
            const paid = pay?.status === "ชำระแล้ว";
            const active = current?.id === t.id;
            const hasRoom = !!room;
            const isEvicted = !!t.evicted;
            // Active bg when selected
            const rowBg = active
              ? isEvicted ? "var(--surface-2)" : hasRoom ? "var(--brand-soft)" : "var(--warn-soft)"
              : "transparent";
            // Badge colours
            const badgeBg    = isEvicted ? "var(--surface-2)" : hasRoom ? "var(--brand)"     : "var(--warn-soft)";
            const badgeBorder= isEvicted ? "1px solid var(--line)" : hasRoom ? "none"         : "1.5px dashed var(--warn)";
            const badgeColor = isEvicted ? "var(--ink-4)"           : "white";
            const nameColor  = active
              ? isEvicted ? "var(--ink-3)" : hasRoom ? "var(--brand-ink)" : "var(--warn)"
              : isEvicted ? "var(--ink-3)" : "var(--ink)";
            const subColor   = isEvicted ? "var(--ink-4)" : hasRoom ? "var(--ink-3)" : "var(--warn)";
            return (
              <button key={t.id} onClick={() => setSel(t)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 10px",
                background: rowBg,
                border: "none", borderRadius: 12, cursor: "pointer", marginBottom: 2, textAlign: "left",
                opacity: isEvicted ? 0.72 : 1,
              }}>
                {/* Room-number badge */}
                <div style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  background: badgeBg, border: badgeBorder,
                }}>
                  {isEvicted ? (
                    <span style={{ fontSize: 15, lineHeight: 1, color: "var(--ink-4)" }}>✕</span>
                  ) : hasRoom ? (
                    <>
                      <span className="num" style={{ fontSize: 13, fontWeight: 800, color: "white", lineHeight: 1 }}>{t.room}</span>
                      <span style={{ fontSize: 8, fontWeight: 600, color: "rgba(255,255,255,0.75)", marginTop: 1 }}>{room?.type}</span>
                    </>
                  ) : (
                    <span style={{ fontSize: 16, lineHeight: 1 }}>—</span>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: isEvicted ? 500 : 600, color: nameColor }}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: 11.5, marginTop: 2, color: subColor,
                    fontWeight: isEvicted || hasRoom ? 400 : 600 }}>
                    {isEvicted
                      ? `เข้าพัก ${dld(t.sinceDay||1, t.sinceY, t.sinceM)} · เลิกเช่า ${dld(t.evictedDay||1, t.evictedY, t.evictedM)}`
                      : hasRoom
                        ? `ห้อง ${t.room} · ${room?.type} · เข้าพัก ${dld(t.sinceDay||1, t.sinceY, t.sinceM)}`
                        : "ยังไม่มีห้องพัก"}
                  </div>
                </div>
                {hasRoom && !isEvicted && (
                  <span style={{ background: paid ? "var(--ok-soft)" : "var(--warn-soft)",
                    color: paid ? "var(--ok)" : "var(--warn)", fontSize: 10.5, fontWeight: 700,
                    padding: "2px 8px", borderRadius: 100 }}>{paid ? "✓" : "⏳"}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {current && <TenantDetail tenant={current}/>}
      {showAdd && <AddTenantModal onClose={() => setShowAdd(false)}/>}
    </div>
  );
}

function TenantDetail({ tenant }) {
  const { rooms, payments, recordPayment, updateTenant, deleteTenant, evictTenant, reactivateTenant, computePaymentTotal, curY, curM } = useData();
  // Helper: compute total bill (rent + electricity + water) for a payment row
  const payTotal = (p) => {
    const b = computePaymentTotal ? computePaymentTotal(p.room_id, p.year, p.month) : null;
    return b ? b.total : (p.amount || 0);
  };
  const [editOpen, setEditOpen] = useState(false);
  const [docTab, setDocTab] = useState("pays"); // "pays" | "room" | "docs" | "history"
  const [lightboxId, setLightboxId] = useState(false);
  const [receiptPay, setReceiptPay] = useState(null);
  const [confirmPay, setConfirmPay] = useState(null);
  const [confirmEvict, setConfirmEvict] = useState(false);
  const [evictDay,   setEvictDay]   = useState(() => new Date().getDate());
  const [evictMonth, setEvictMonth] = useState(curM);
  const [evictYear,  setEvictYear]  = useState(curY);
  const [reactivateOpen, setReactivateOpen] = useState(false);
  const [reactivateRoom, setReactivateRoom] = useState("");
  const [reactivateSinceY, setReactivateSinceY] = useState(curY);
  const [reactivateSinceM, setReactivateSinceM] = useState(curM);

  // Load all previous tenancy periods from localStorage
  const [tenancyHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`baan_history_${tenant.id}`) || '[]'); }
    catch { return []; }
  });

  // For evicted tenants, use prevRoom to look up room info + payments
  const roomId = tenant.room || tenant.prevRoom;
  const room = rooms.find(r => r.id === roomId);
  const isEvicted = !!tenant.evicted;

  // End date: eviction date for ex-tenants, current month for active ones
  const endY = isEvicted ? +tenant.evictedY : curY;
  const endM = isEvicted ? +tenant.evictedM : curM;

  // Build payment timeline from move-in to end date.
  // Payments are filtered by date-range so ex-tenant history doesn't bleed
  // into the next tenant's view (they share the same room_id).
  const pays = (() => {
    if (!roomId || tenant.sinceY == null || tenant.sinceM == null) {
      return payments
        .filter(p => p.room_id === roomId)
        .sort((a,b) => b.year !== a.year ? b.year - a.year : b.month - a.month).slice(0, 12);
    }
    const existing = payments.filter(p => {
      if (p.room_id !== roomId) return false;
      // Only payments within this tenant's tenancy period
      const afterStart = p.year > +tenant.sinceY || (p.year === +tenant.sinceY && p.month >= +tenant.sinceM);
      const beforeEnd  = p.year < endY || (p.year === endY && p.month <= endM);
      return afterStart && beforeEnd;
    });
    const byKey = new Map(existing.map(p => [`${p.year}|${p.month}`, p]));
    const out = [];
    let y = +tenant.sinceY, m = +tenant.sinceM;
    let virtualId = -1;
    while (y < endY || (y === endY && m <= endM)) {
      const key = `${y}|${m}`;
      const hit = byKey.get(key);
      if (hit) {
        out.push(hit);
      } else {
        out.push({
          id: `virt-${virtualId--}`,
          room_id: roomId,
          year: y, month: m,
          amount: room?.price || 0,
          status: "รอชำระ",
          paid_at: null,
          _virtual: true,
        });
      }
      m++; if (m > 11) { m = 0; y++; }
    }
    return out.sort((a,b) => b.year !== a.year ? b.year - a.year : b.month - a.month).slice(0, 12);
  })();

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 18,
      overflow: "auto", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24 }}>
        <Avatar name={tenant.name} size={68}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.3, display: "flex", alignItems: "center", gap: 10 }}>
            {tenant.name}
            {isEvicted && (
              <span style={{ fontSize: 11, fontWeight: 700, background: "var(--surface-2)",
                color: "var(--ink-3)", border: "1px solid var(--line)",
                padding: "3px 9px", borderRadius: 100, letterSpacing: 0.3 }}>อดีตผู้เช่า</span>
            )}
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4, display: "flex", gap: 14, flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <IconBuilding size={13} stroke="var(--ink-3)"/>
              {room
                ? isEvicted
                  ? `เคยพักห้อง ${roomId} (${room.type})`
                  : `ห้อง ${tenant.room} (${room.type})`
                : <span style={{ color: "var(--warn)", fontWeight: 600 }}>ยังไม่มีห้อง</span>}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <IconPhone size={13} stroke="var(--ink-3)"/> {tenant.phone}
            </span>
            {tenant.sinceY != null && (
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <IconCal size={13} stroke="var(--ink-3)"/>
                <span className="num">{dld(tenant.sinceDay || 1, tenant.sinceY, tenant.sinceM)}</span>
                {isEvicted && (
                  <>
                    <span style={{ color: "var(--ink-4)" }}>→</span>
                    <span className="num">{dld(tenant.evictedDay || 1, tenant.evictedY, tenant.evictedM)}</span>
                  </>
                )}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setEditOpen(true)} style={detailBtn("ghost")}><IconEdit size={14}/> แก้ไข</button>
          {!isEvicted && tenant.room && (
            <button onClick={() => setConfirmEvict(true)} style={{
              padding: "9px 16px", borderRadius: 12, border: "1px solid var(--danger-soft)",
              background: "var(--surface)", color: "var(--danger)", fontWeight: 700, fontSize: 13,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            }}><IconX size={14} stroke="var(--danger)"/> เลิกเช่า</button>
          )}
          {isEvicted && (
            <button onClick={() => { setReactivateOpen(o => !o); setReactivateRoom(""); }} style={{
              padding: "9px 16px", borderRadius: 12, border: "none",
              background: "var(--brand)", color: "white", fontWeight: 700, fontSize: 13,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            }}><IconCheck size={14} stroke="white"/> เช่าใหม่</button>
          )}
        </div>
      </div>

      {/* Evict confirmation strip */}
      {confirmEvict && !isEvicted && (() => {
        const MONTHS_SHORT = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
        const daysInMonth = new Date(evictYear, evictMonth + 1, 0).getDate();
        const selStyle = { padding: "5px 8px", borderRadius: 8, border: "1px solid var(--danger)",
          background: "white", fontSize: 12.5, cursor: "pointer", color: "var(--ink)" };
        return (
          <div className="screen-in" style={{ marginBottom: 16, background: "var(--danger-soft)", borderRadius: 14,
            padding: "14px 18px", border: "1px solid var(--danger)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--danger)", marginBottom: 6 }}>⚠️ ยืนยันการเลิกเช่า</div>
            <div style={{ fontSize: 12, color: "var(--ink-2)", marginBottom: 10, lineHeight: 1.5 }}>
              ห้อง {tenant.room} จะถูกตั้งเป็น "ว่าง" · ประวัติการชำระจะยังคงอยู่จนกว่าจะลบผู้เช่า
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-2)" }}>วันที่เลิกเช่า:</span>
              <select value={evictDay} onChange={e => setEvictDay(+e.target.value)} style={selStyle}>
                {Array.from({length: daysInMonth}, (_,i) => i+1).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={evictMonth} onChange={e => setEvictMonth(+e.target.value)} style={selStyle}>
                {MONTHS_SHORT.map((mn, i) => <option key={i} value={i}>{mn}</option>)}
              </select>
              <select value={evictYear} onChange={e => setEvictYear(+e.target.value)} style={selStyle}>
                {[curY-1, curY, curY+1, curY+2].map(y => <option key={y} value={y}>{y+543}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setConfirmEvict(false)} style={{
                padding: "8px 14px", borderRadius: 10, border: "1px solid var(--line)",
                background: "var(--surface)", color: "var(--ink-2)", fontWeight: 600, fontSize: 12.5, cursor: "pointer",
              }}>ยกเลิก</button>
              <button onClick={() => { evictTenant(tenant.id, evictDay, evictMonth, evictYear); setConfirmEvict(false); }} style={{
                padding: "8px 18px", borderRadius: 10, border: "none",
                background: "var(--danger)", color: "white", fontWeight: 700, fontSize: 12.5, cursor: "pointer",
              }}>ยืนยันเลิกเช่า</button>
            </div>
          </div>
        );
      })()}

      {/* Re-rent form for evicted tenants */}
      {reactivateOpen && isEvicted && (() => {
        const vacantRooms = rooms.filter(r => r.status === "ว่าง").sort((a,b) => String(a.id).localeCompare(String(b.id), undefined, {numeric:true}));
        const MONTHS = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
        return (
          <div className="screen-in" style={{ marginBottom: 16, background: "var(--brand-soft)", borderRadius: 14,
            padding: "16px 18px", border: "1px solid oklch(0.88 0.06 35)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>เลือกห้องและวันเริ่มเช่าใหม่</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              <select value={reactivateSinceM} onChange={e => setReactivateSinceM(+e.target.value)}
                style={{ padding: "7px 10px", borderRadius: 9, border: "1px solid var(--line)", background: "white", fontSize: 13, cursor: "pointer" }}>
                {MONTHS.map((mn, i) => <option key={i} value={i}>{mn}</option>)}
              </select>
              <select value={reactivateSinceY} onChange={e => setReactivateSinceY(+e.target.value)}
                style={{ padding: "7px 10px", borderRadius: 9, border: "1px solid var(--line)", background: "white", fontSize: 13, cursor: "pointer" }}>
                {[curY-1, curY, curY+1].map(y => <option key={y} value={y}>{y+543}</option>)}
              </select>
            </div>
            {vacantRooms.length === 0 ? (
              <div style={{ fontSize: 12.5, color: "var(--ink-3)", padding: "8px 0" }}>ไม่มีห้องว่างในขณะนี้</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 7, marginBottom: 12 }}>
                {vacantRooms.map(r => (
                  <button key={r.id} onClick={() => setReactivateRoom(r.id)} style={{
                    padding: "9px 4px", borderRadius: 10, cursor: "pointer", textAlign: "center",
                    border: reactivateRoom === r.id ? "1.5px solid var(--brand)" : "1px solid var(--line)",
                    background: reactivateRoom === r.id ? "white" : "var(--surface)",
                  }}>
                    <div className="num" style={{ fontSize: 13, fontWeight: 700,
                      color: reactivateRoom === r.id ? "var(--brand-ink)" : "var(--ink)" }}>{r.id}</div>
                    <div style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 1 }}>{baht(r.price)}</div>
                  </button>
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setReactivateOpen(false)} style={{
                padding: "8px 14px", borderRadius: 10, border: "1px solid var(--line)",
                background: "var(--surface)", color: "var(--ink-2)", fontWeight: 600, fontSize: 12.5, cursor: "pointer",
              }}>ยกเลิก</button>
              <button disabled={!reactivateRoom} onClick={() => {
                reactivateTenant(tenant.id, reactivateRoom, reactivateSinceY, reactivateSinceM);
                setReactivateOpen(false);
              }} style={{
                padding: "8px 20px", borderRadius: 10, border: "none",
                background: reactivateRoom ? "var(--brand)" : "var(--surface-2)",
                color: reactivateRoom ? "white" : "var(--ink-4)", fontWeight: 700, fontSize: 12.5,
                cursor: reactivateRoom ? "pointer" : "not-allowed",
              }}>✓ ยืนยันเช่าใหม่</button>
            </div>
          </div>
        );
      })()}

      {editOpen && <NewEditTenantModal tenant={tenant}
        onClose={() => setEditOpen(false)}
        onSave={(patch) => { updateTenant(tenant.id, patch); setEditOpen(false); }}
        onDelete={(id) => { deleteTenant(id); setEditOpen(false); }}/>}

      {!room && !isEvicted ? (
        <div style={{ background: "var(--warn-soft)", borderRadius: 14, padding: "20px 22px",
          border: "1px solid var(--warn)", display: "flex", alignItems: "flex-start", gap: 14 }}>
          <IconBell size={20} stroke="var(--warn)"/>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--warn)", marginBottom: 4 }}>ผู้เช่ายังไม่ได้รับห้อง</div>
            <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.6 }}>
              {tenant.name} อยู่ในระบบแต่ยังไม่ได้รับการมอบหมายห้องพัก<br/>
              กด <strong>แก้ไข</strong> เพื่อกำหนดห้องให้ผู้เช่ารายนี้
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 22 }}>
          <MiniStat2 label="ค่าเช่า/เดือน" value={room ? baht(room.price) : "—"} tone="brand"/>
          <MiniStat2
            label="เข้าพัก"
            value={tenant.sinceY != null ? dld(tenant.sinceDay || 1, tenant.sinceY, tenant.sinceM) : "—"}
            tone="ok"/>
          <MiniStat2
            label="เลิกเช่า"
            value={isEvicted ? dld(tenant.evictedDay || 1, tenant.evictedY, tenant.evictedM) : "ปัจจุบัน"}
            tone={isEvicted ? "warn" : "lilac"}/>
          <MiniStat2 label="ค้างชำระ" value={pays.filter(p=>p.status==="รอชำระ").length} tone="warn"/>
        </div>
      )}

      {(room || isEvicted) && (<>
        <div style={{ display: "flex", gap: 4, marginBottom: 16, borderBottom: "1px solid var(--line)" }}>
          {[
            { id: "pays", label: "ประวัติชำระ" },
            { id: "room", label: "ข้อมูลห้อง" },
            { id: "docs", label: "เอกสาร" + (tenant.idCardImage ? " ●" : "") },
            ...(tenancyHistory.length > 0 ? [{ id: "history", label: `ประวัติก่อนหน้า (${tenancyHistory.length})` }] : []),
          ].map(t => {
            const on = docTab === t.id;
            return (
              <button key={t.id} onClick={() => setDocTab(t.id)} style={{
                padding: "10px 16px", border: "none", background: "transparent", cursor: "pointer", fontSize: 13.5,
                fontWeight: on ? 700 : 500, color: on ? "var(--ink)" : "var(--ink-3)",
                borderBottom: on ? "2px solid var(--brand)" : "2px solid transparent", marginBottom: -1,
              }}>{t.label}</button>
            );
          })}
        </div>

        {docTab === "pays" && (
          <div style={{ background: "var(--surface-2)", borderRadius: 14, overflow: "hidden", border: "1px solid var(--line)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 0.8fr 1fr 0.6fr", padding: "11px 16px",
              fontSize: 11.5, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: 0.8,
              borderBottom: "1px solid var(--line)" }}>
              <span>เดือน</span><span>จำนวน</span><span>สถานะ</span><span>วันที่ชำระ</span><span></span>
            </div>
            {pays.length === 0 && (
              <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>ยังไม่มีประวัติการชำระ</div>
            )}
            {confirmPay && (
              <div style={{ padding: "12px 16px", background: "var(--brand-soft)", borderBottom: "1px solid oklch(0.88 0.06 35)",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontSize: 13, color: "var(--brand-ink)" }}>
                  <span style={{ fontWeight: 700 }}>ยืนยันบันทึกชำระเงิน</span>
                  <span style={{ marginLeft: 8, color: "var(--ink-2)" }}>
                    {dl(confirmPay.year, confirmPay.month)} · <span className="num" style={{ fontWeight: 700 }}>{baht(payTotal(confirmPay))}</span>
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button onClick={() => setConfirmPay(null)} style={{
                    padding: "7px 14px", borderRadius: 9, border: "1px solid var(--line)",
                    background: "var(--surface)", color: "var(--ink-2)", fontWeight: 600, fontSize: 12.5, cursor: "pointer",
                  }}>ยกเลิก</button>
                  <button onClick={() => { recordPayment({ room_id: confirmPay.room_id, year: confirmPay.year, month: confirmPay.month, amount: payTotal(confirmPay) }); setConfirmPay(null); }} style={{
                    padding: "7px 18px", borderRadius: 9, border: "none",
                    background: "var(--ok)", color: "white", fontWeight: 700, fontSize: 12.5, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 5,
                  }}><IconCheck size={13} stroke="white"/> บันทึกชำระ</button>
                </div>
              </div>
            )}
            {pays.map((p, i) => {
              const paid = p.status === "ชำระแล้ว";
              const b = computePaymentTotal ? computePaymentTotal(p.room_id, p.year, p.month) : null;
              const total = b ? b.total : p.amount;
              const hasUtil = b && (b.elec > 0 || b.water > 0);
              return (
                <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 0.8fr 1fr 0.6fr",
                  padding: "13px 16px", borderBottom: i < pays.length-1 ? "1px solid var(--line)" : "none",
                  alignItems: "center", background: "var(--surface)", fontSize: 13 }}>
                  <span style={{ fontWeight: 600 }}>{dl(p.year, p.month)}</span>
                  <span className="num" title={hasUtil ? `ค่าเช่า ${baht(b.rent)} + ค่าไฟ ${baht(b.elec)} + ค่าน้ำ ${baht(b.water)}` : undefined}>
                    <div style={{ fontWeight: 700 }}>{baht(total)}</div>
                    {hasUtil && (
                      <div style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 500, marginTop: 1 }}>
                        เช่า {baht(b.rent)} · ⚡{baht(b.elec)} · 💧{baht(b.water)}
                      </div>
                    )}
                  </span>
                  <span><span style={{ background: paid ? "var(--ok-soft)" : "var(--warn-soft)",
                    color: paid ? "var(--ok)" : "var(--warn)", fontSize: 11, fontWeight: 700,
                    padding: "3px 10px", borderRadius: 100 }}>{paid ? "✓ ชำระแล้ว" : "⏳ รอชำระ"}</span></span>
                  <span className="num" style={{ color: "var(--ink-3)" }}>{p.paid_at || "—"}</span>
                  <span style={{ textAlign: "right" }}>
                    {paid ? (
                      <button onClick={() => setReceiptPay(p)}
                        style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 12,
                          color: "var(--ok)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 3 }}>
                        🧾 ใบเสร็จ
                      </button>
                    ) : isEvicted ? (
                      <span style={{ fontSize: 11, color: "var(--ink-4)" }}>—</span>
                    ) : (
                      <button
                        onClick={() => setConfirmPay(confirmPay?.id === p.id ? null : p)}
                        style={{ background: confirmPay?.id === p.id ? "var(--brand-soft)" : "transparent",
                          border: confirmPay?.id === p.id ? "1px solid oklch(0.88 0.06 35)" : "none",
                          borderRadius: 8, cursor: "pointer", fontSize: 12, color: "var(--brand)", fontWeight: 700,
                          padding: "3px 8px", transition: "all .15s" }}>
                        บันทึก →
                      </button>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {docTab === "room" && room && (
          <div style={{ background: "var(--surface-2)", borderRadius: 14, padding: 20, border: "1px solid var(--line)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <div style={{ fontSize: 11.5, color: "var(--ink-3)", fontWeight: 700, textTransform: "uppercase", marginBottom: 10, letterSpacing: 1 }}>ข้อมูลห้อง</div>
                <DocRow label="เลขห้อง" value={room.id}/>
                <DocRow label="ประเภท" value={room.type}/>
                <DocRow label="ชั้น" value={`${room.floor}`}/>
                <DocRow label="ค่าเช่า/เดือน" value={baht(room.price)} bold/>
              </div>
              <div>
                <div style={{ fontSize: 11.5, color: "var(--ink-3)", fontWeight: 700, textTransform: "uppercase", marginBottom: 10, letterSpacing: 1 }}>สิ่งอำนวยความสะดวก</div>
                {room.amenities?.length ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {room.amenities.map(a => (
                      <span key={a} style={{ background: "var(--brand-soft)", color: "var(--brand-ink)",
                        fontSize: 12, fontWeight: 600, padding: "5px 10px", borderRadius: 100 }}>{a}</span>
                    ))}
                  </div>
                ) : <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>—</div>}
              </div>
            </div>
          </div>
        )}

        {docTab === "docs" && (
          <div style={{ background: "var(--surface-2)", borderRadius: 14, padding: 20, border: "1px solid var(--line)" }}>
            {!(tenant.address || tenant.idCardNumber || tenant.idCardImage || tenant.email || tenant.emergencyName) ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--ink-3)" }}>
                <div style={{ fontSize: 30, marginBottom: 8 }}>📄</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-2)" }}>ยังไม่มีเอกสารผู้เช่า</div>
                <div style={{ fontSize: 12, marginTop: 6, lineHeight: 1.6 }}>
                  กด <strong>แก้ไข</strong> ด้านบนเพื่อกรอกที่อยู่, เลขบัตรประชาชน,<br/>
                  และแนบรูปถ่ายบัตรประชาชน
                </div>
                <button onClick={() => setEditOpen(true)} style={{
                  marginTop: 14, padding: "9px 18px", background: "var(--brand)", color: "white",
                  border: "none", borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: "pointer",
                }}>+ เพิ่มเอกสาร</button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 22 }}>
                <div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-3)", fontWeight: 700, textTransform: "uppercase", marginBottom: 10, letterSpacing: 1 }}>
                    รูปถ่ายบัตรประชาชน
                  </div>
                  {tenant.idCardImage ? (
                    <div onClick={() => setLightboxId(true)} style={{
                      cursor: "zoom-in", borderRadius: 14, overflow: "hidden", border: "1px solid var(--line)",
                      background: "white", boxShadow: "var(--sh-1)", position: "relative",
                    }}>
                      <img src={tenant.idCardImage} alt="บัตรประชาชน"
                        style={{ width: "100%", display: "block", maxHeight: 260, objectFit: "contain", background: "var(--surface-2)" }}/>
                      <div style={{ position: "absolute", bottom: 8, right: 10, background: "rgba(0,0,0,0.55)",
                        borderRadius: 8, padding: "3px 9px", fontSize: 10.5, color: "white", fontWeight: 600 }}>
                        🔍 คลิกเพื่อขยาย
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: 30, textAlign: "center", border: "1.5px dashed var(--line-2)",
                      borderRadius: 14, fontSize: 12, color: "var(--ink-3)" }}>
                      ยังไม่ได้แนบรูปบัตร
                    </div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-3)", fontWeight: 700, textTransform: "uppercase", marginBottom: 10, letterSpacing: 1 }}>
                    ข้อมูลส่วนบุคคล
                  </div>
                  <DocRow label="เลขบัตรประชาชน" value={tenant.idCardNumber ? formatIdCard(tenant.idCardNumber) : "—"} mono/>
                  <DocRow label="อีเมล" value={tenant.email || "—"}/>
                  <DocRow label="ที่อยู่" value={tenant.address || "—"} multiline/>
                  <DocRow label="ผู้ติดต่อฉุกเฉิน" value={tenant.emergencyName || "—"}/>
                  <DocRow label="เบอร์ฉุกเฉิน" value={tenant.emergencyPhone || "—"} mono last/>
                </div>
              </div>
            )}
          </div>
        )}
      </>)}

      {/* Previous tenancy history tab */}
      {docTab === "history" && tenancyHistory.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[...tenancyHistory].reverse().map((period, idx) => {
            const histRoom = rooms.find(r => r.id === period.roomId);
            const histPays = payments.filter(p => {
              if (p.room_id !== period.roomId) return false;
              const after = p.year > +period.sinceY || (p.year === +period.sinceY && p.month >= +period.sinceM);
              const before = p.year < +period.evictedY || (p.year === +period.evictedY && p.month <= +period.evictedM);
              return after && before;
            }).sort((a,b) => b.year !== a.year ? b.year - a.year : b.month - a.month);
            return (
              <div key={idx} style={{ background: "var(--surface-2)", borderRadius: 14, overflow: "hidden", border: "1px solid var(--line)" }}>
                <div style={{ padding: "12px 16px", background: "var(--surface)", borderBottom: "1px solid var(--line)",
                  display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>
                      ห้อง {period.roomId}{histRoom ? ` (${histRoom.type})` : ""}
                    </div>
                    <div className="num" style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>
                      {dld(period.sinceDay||1, period.sinceY, period.sinceM)} – {dld(period.evictedDay||1, period.evictedY, period.evictedM)}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <div style={{ textAlign: "center" }}>
                      <div className="num" style={{ fontSize: 14, fontWeight: 700, color: "var(--ok)" }}>
                        {histPays.filter(p => p.status === "ชำระแล้ว").length}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--ink-3)" }}>ชำระแล้ว</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div className="num" style={{ fontSize: 14, fontWeight: 700, color: "var(--warn)" }}>
                        {histPays.filter(p => p.status === "รอชำระ").length}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--ink-3)" }}>ค้างชำระ</div>
                    </div>
                  </div>
                </div>
                {histPays.length === 0 ? (
                  <div style={{ padding: "16px", textAlign: "center", fontSize: 12, color: "var(--ink-3)" }}>ไม่พบบันทึกการชำระ</div>
                ) : histPays.map((p, i) => {
                  const paid = p.status === "ชำระแล้ว";
                  return (
                    <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 0.8fr 1fr 0.6fr",
                      padding: "11px 16px", borderTop: i === 0 ? "none" : "1px solid var(--line)",
                      alignItems: "center", background: "var(--surface)", fontSize: 12.5 }}>
                      <span style={{ fontWeight: 600 }}>{dl(p.year, p.month)}</span>
                      <span className="num" style={{ fontWeight: 600 }}>{baht(p.amount)}</span>
                      <span><span style={{ background: paid ? "var(--ok-soft)" : "var(--warn-soft)",
                        color: paid ? "var(--ok)" : "var(--warn)", fontSize: 11, fontWeight: 700,
                        padding: "2px 8px", borderRadius: 100 }}>{paid ? "✓ ชำระแล้ว" : "⏳ รอชำระ"}</span></span>
                      <span className="num" style={{ color: "var(--ink-3)" }}>{p.paid_at || "—"}</span>
                      <span style={{ textAlign: "right" }}>
                        {paid && <button onClick={() => setReceiptPay(p)}
                          style={{ background: "transparent", border: "none", cursor: "pointer",
                            fontSize: 12, color: "var(--ok)", fontWeight: 700 }}>🧾 ใบเสร็จ</button>}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* Receipt modal */}
      {receiptPay && <ReceiptModal payment={receiptPay} onClose={() => setReceiptPay(null)}/>}

      {/* ID card lightbox */}
      {lightboxId && tenant.idCardImage && (
        <div onClick={() => setLightboxId(false)} style={{
          position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out",
        }}>
          <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }} onClick={e => e.stopPropagation()}>
            <img src={tenant.idCardImage} alt="บัตรประชาชนขนาดเต็ม"
              style={{ maxWidth: "85vw", maxHeight: "85vh", objectFit: "contain", borderRadius: 14,
                boxShadow: "0 12px 60px rgba(0,0,0,0.5)", display: "block" }}/>
            <button onClick={() => setLightboxId(false)} style={{
              position: "absolute", top: -14, right: -14, width: 36, height: 36, borderRadius: 18,
              background: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "var(--sh-2)", fontSize: 16, fontWeight: 700, color: "var(--ink)",
            }}>✕</button>
            <div style={{ textAlign: "center", marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
              บัตรประชาชน · {tenant.name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DocRow({ label, value, bold, mono, multiline, last }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: multiline ? "flex-start" : "center",
      gap: 10, padding: "9px 0", borderBottom: last ? "none" : "1px solid var(--line)" }}>
      <span style={{ fontSize: 11.5, color: "var(--ink-3)", flexShrink: 0, paddingTop: multiline ? 2 : 0 }}>{label}</span>
      <span className={mono ? "num" : ""} style={{
        fontSize: bold ? 16 : 13, fontWeight: bold ? 700 : 600, color: "var(--ink)",
        textAlign: "right", lineHeight: multiline ? 1.55 : undefined, whiteSpace: multiline ? "pre-wrap" : "nowrap",
        wordBreak: multiline ? "break-word" : undefined, maxWidth: "70%",
      }}>{value}</span>
    </div>
  );
}

function formatIdCard(n) {
  const s = String(n).replace(/[^0-9]/g, "");
  if (s.length !== 13) return s;
  return `${s[0]}-${s.slice(1,5)}-${s.slice(5,10)}-${s.slice(10,12)}-${s[12]}`;
}

const detailBtn = (kind) => kind === "primary" ? ({
  padding: "9px 14px", background: "var(--ink)", color: "white", border: "none", borderRadius: 11,
  fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
}) : ({
  padding: "9px 14px", background: "var(--surface)", color: "var(--ink-2)", border: "1px solid var(--line)",
  borderRadius: 11, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
});

function MiniStat2({ label, value, tone }) {
  const bg = { brand: "var(--brand-soft)", ok: "var(--ok-soft)", warn: "var(--warn-soft)", lilac: "var(--lilac-soft)" }[tone];
  const fg = { brand: "var(--brand-ink)", ok: "var(--ok)", warn: "var(--warn)", lilac: "var(--lilac)" }[tone];
  return (
    <div style={{ background: bg, borderRadius: 12, padding: "11px 14px" }}>
      <div style={{ fontSize: 11.5, color: fg, opacity: 0.85, fontWeight: 600 }}>{label}</div>
      <div className="num" style={{ fontSize: 18, fontWeight: 700, color: fg, marginTop: 4 }}>{value}</div>
    </div>
  );
}

// ─── ROOMS PAGE ─────────────────────────────────────────────────────────
function RoomsPage({ onOpenTenant }) {
  const { rooms, tenants, moveTenant } = useData();
  const [showAdd, setShowAdd] = useState(false);
  const [roomDetail, setRoomDetail] = useState(null);
  const [addTenantRoom, setAddTenantRoom] = useState(null); // room ID to pre-select when adding tenant
  const floors = Array.from(new Set(rooms.map(r => r.floor))).sort((a, b) => a - b);
  const byRoomId = (a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true });
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.4 }}>ห้องพักทั้งหมด</div>
          <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>{rooms.length} ห้อง · {rooms.filter(r=>r.status==="ไม่ว่าง").length} มีผู้เช่า · {rooms.filter(r=>r.status==="ว่าง").length} ว่าง</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={detailBtn("ghost")}><IconFilter size={14}/> กรอง</button>
          <button onClick={() => setShowAdd(true)} style={detailBtn("primary")}><IconPlus size={14} stroke="white"/> เพิ่มห้องใหม่</button>
        </div>
      </div>

      {floors.map(floor => (
        <div key={floor} style={{ marginBottom: 26 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: 1 }}>ชั้น {floor}</div>
            <div style={{ flex: 1, height: 1, background: "var(--line)" }}/>
            <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{rooms.filter(r=>r.floor===floor).length} ห้อง</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
            {rooms.filter(r => r.floor === floor).sort(byRoomId).map(room => {
              const tenant = tenants.find(t => t.room === room.id);
              const occ = room.status === "ไม่ว่าง";
              return (
                <div key={room.id} onClick={() => setRoomDetail(room.id)} className="lift" style={{
                  background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16,
                  padding: 16, cursor: "pointer", position: "relative", overflow: "hidden",
                }}>
                  <div style={{ position: "absolute", top: 0, right: 0, width: 4, height: "100%", background: occ ? "var(--brand)" : "var(--sage)" }}/>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <div className="num" style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>{room.id}</div>
                      <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>ห้อง{room.type}</div>
                    </div>
                    <span style={{ background: occ ? "var(--brand-soft)" : "var(--sage-soft)",
                      color: occ ? "var(--brand-ink)" : "var(--sage-ink)", padding: "3px 9px",
                      borderRadius: 100, fontSize: 10.5, fontWeight: 700 }}>{room.status}</span>
                  </div>
                  <div className="num" style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", marginBottom: 12 }}>
                    {baht(room.price)}<span style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 500 }}>/เดือน</span>
                  </div>
                  {tenant ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px",
                      background: "var(--surface-2)", borderRadius: 10 }}>
                      <Avatar name={tenant.name} size={24}/>
                      <div style={{ fontSize: 12, fontWeight: 600, flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {tenant.name}
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: "8px 10px", background: "var(--sage-soft)", borderRadius: 10,
                      fontSize: 12, fontWeight: 600, color: "var(--sage-ink)", textAlign: "center" }}>
                      🌿 ว่าง · พร้อมเช่า
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 4, marginTop: 10, flexWrap: "wrap" }}>
                    {(room.amenities || []).slice(0, 4).map(a => {
                      const Ic = amenityIcon(a);
                      return (
                        <span key={a} title={a} style={{ width: 24, height: 24, borderRadius: 6,
                          background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Ic size={13} stroke="var(--ink-3)"/>
                        </span>
                      );
                    })}
                    {(room.amenities?.length || 0) > 4 && (
                      <span style={{ height: 24, padding: "0 6px", borderRadius: 6, background: "var(--surface-2)",
                        display: "flex", alignItems: "center", fontSize: 11, color: "var(--ink-3)", fontWeight: 600 }}>
                        +{room.amenities.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {showAdd && <AddRoomModal onClose={() => setShowAdd(false)}/>}
      {roomDetail && <RoomDetailModal roomId={roomDetail}
        onClose={() => setRoomDetail(null)}
        onMove={(tid, to) => { moveTenant(tid, to); setRoomDetail(to); }}
        onTenant={(t) => { setRoomDetail(null); onOpenTenant && onOpenTenant(t); }}
        onAddTenant={(rid) => { setRoomDetail(null); setAddTenantRoom(rid); }}/>}
      {addTenantRoom && <AddTenantModal initialRoom={addTenantRoom} onClose={() => setAddTenantRoom(null)}/>}
    </div>
  );
}

// ─── REPAIRS PAGE ───────────────────────────────────────────────────────
function RepairsPage() {
  const { repairs, updateRepair, deleteRepair, tenants, addRepair } = useData();
  const [selId, setSelId] = useState(repairs[0]?.id);
  const [showAddRepair, setShowAddRepair] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null); // id waiting confirm
  const sel = repairs.find(r => r.id === selId) || repairs[0];
  const cols = ["รอดำเนินการ","กำลังดำเนินการ","เสร็จแล้ว"];

  const advance = (r) => {
    const next = r.status === "รอดำเนินการ" ? "กำลังดำเนินการ"
              : r.status === "กำลังดำเนินการ" ? "เสร็จแล้ว"
              : "รอดำเนินการ";
    const today = new Date().toISOString().slice(0,10);
    const patch = { status: next, ...(next === "เสร็จแล้ว" ? { done_at: today } : {}) };
    updateRepair(r.id, patch);
  };

  // Group repairs by YYYY-MM from created_at, newest month first
  const mKey = r => r.created_at ? r.created_at.slice(0, 7) : "0000-00";
  const mLabel = key => {
    if (key === "0000-00") return "ไม่ระบุวันที่";
    const [y, m] = key.split("-").map(Number);
    return dl(y, m - 1);
  };
  const groupByMonth = items => {
    const map = {};
    items.forEach(r => { const k = mKey(r); if (!map[k]) map[k] = []; map[k].push(r); });
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
  };

  const handleDel = (id) => {
    if (confirmDel === id) {
      if (sel?.id === id) setSelId(null);
      deleteRepair(id);
      setConfirmDel(null);
    } else {
      setConfirmDel(id);
      setTimeout(() => setConfirmDel(c => c === id ? null : c), 3000);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.4 }}>รายการแจ้งซ่อม</div>
          <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>
            {repairs.length} รายการ · {repairs.filter(r=>r.status!=="เสร็จแล้ว").length} ค้าง · แตะการ์ดเพื่อตอบกลับ
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowAddRepair(true)} style={detailBtn("primary")}><IconPlus size={14} stroke="white"/> เพิ่มงาน</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 16, height: "calc(100% - 80px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, overflow: "auto", alignContent: "start" }}>
          {cols.map(status => {
            const items = repairs.filter(r => r.status === status);
            const isDone = status === "เสร็จแล้ว";
            const tone = isDone ? "ok" : status === "กำลังดำเนินการ" ? "info" : "warn";
            const colors = { warn:["var(--warn-soft)","var(--warn)"], info:["var(--info-soft)","var(--info)"], ok:["var(--ok-soft)","var(--ok)"] }[tone];
            const groups = groupByMonth(items);
            return (
              <div key={status} style={{ background: colors[0], borderRadius: 16, padding: 12, border: `1.5px solid ${colors[1]}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "0 4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: colors[1] }}/>
                    <span style={{ fontSize: 12.5, fontWeight: 700 }}>{status}</span>
                  </div>
                  <span className="num" style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)",
                    background: "var(--surface)", padding: "2px 8px", borderRadius: 100 }}>{items.length}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {items.length === 0 && (
                    <div style={{ padding: "20px 14px", textAlign: "center", fontSize: 11.5, color: "var(--ink-4)" }}>
                      ไม่มีรายการ
                    </div>
                  )}
                  {groups.map(([key, grpItems]) => (
                    <div key={key}>
                      {/* Month header */}
                      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ink-3)", letterSpacing: 0.5,
                        padding: "8px 4px 4px", display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ flex: 1, height: 1, background: "var(--line)" }}/>
                        {mLabel(key)}
                        <span style={{ flex: 1, height: 1, background: "var(--line)" }}/>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 4 }}>
                        {grpItems.map(r => {
                          const active = sel?.id === r.id;
                          return (
                            <div key={r.id} style={{ position: "relative" }}>
                              <button onClick={() => setSelId(r.id)} className="lift" style={{
                                width: "100%", background: "var(--surface)", borderLeft: `4px solid ${colors[1]}`, border: `1px solid ${active ? "var(--brand)" : "var(--line)"}`, borderLeft: `4px solid ${colors[1]}`,
                                borderRadius: 12, padding: 12, cursor: "pointer", textAlign: "left",
                                boxShadow: active ? "0 0 0 3px var(--brand-soft)" : "none",
                              }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                  <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--ink-3)" }}>ห้อง {r.room_id}</span>
                                  <span style={{ background: r.priority === "สูง" ? "var(--danger-soft)" : r.priority === "ปกติ" ? "var(--warn-soft)" : "var(--sage-soft)",
                                    color: r.priority === "สูง" ? "var(--danger)" : r.priority === "ปกติ" ? "var(--warn)" : "var(--sage-ink)",
                                    padding: "1px 7px", borderRadius: 100, fontSize: 9.5, fontWeight: 700 }}>
                                    {r.priority}
                                  </span>
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4, marginBottom: 8 }}>{r.issue}</div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <div style={{ fontSize: 10.5, color: "var(--ink-4)", display: "flex", alignItems: "center", gap: 4 }}>
                                    <IconClock size={11} stroke="var(--ink-4)"/>
                                    {r.done_at ? `เสร็จ ${r.done_at.slice(8)}/${r.done_at.slice(5,7)}` : (r.created_at ? new Date(r.created_at).toLocaleDateString("th-TH",{day:"numeric",month:"short"}) : "—")}
                                  </div>
                                  {r.assigned ? (
                                    <span style={{ fontSize: 10, color: "var(--ink-3)", background: "var(--surface-2)", padding: "2px 7px", borderRadius: 100, fontWeight: 600 }}>{r.assigned}</span>
                                  ) : <span style={{ fontSize: 10, color: "var(--warn)", fontWeight: 700 }}>ยังไม่มอบหมาย</span>}
                                </div>
                              </button>
                              {/* Delete button for completed items */}
                              {isDone && (
                                <button onClick={(e) => { e.stopPropagation(); handleDel(r.id); }} style={{
                                  position: "absolute", top: 8, right: 8,
                                  background: confirmDel === r.id ? "var(--danger)" : "var(--surface-2)",
                                  border: `1px solid ${confirmDel === r.id ? "var(--danger)" : "var(--line)"}`,
                                  borderRadius: 8, padding: "4px 7px", cursor: "pointer",
                                  display: "flex", alignItems: "center", gap: 4,
                                  fontSize: 10, fontWeight: 700,
                                  color: confirmDel === r.id ? "white" : "var(--ink-4)",
                                  zIndex: 1,
                                }}>
                                  <IconTrash size={11} stroke={confirmDel === r.id ? "white" : "var(--ink-4)"}/>
                                  {confirmDel === r.id ? "ยืนยัน?" : ""}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {sel ? <RepairDetail r={sel} tenants={tenants} onAdvance={() => advance(sel)}
            onUpdate={(patch) => updateRepair(sel.id, patch)}
            onDelete={sel.status === "เสร็จแล้ว" ? () => { deleteRepair(sel.id); setSelId(null); } : null}/> :
          <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 18,
            display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-3)" }}>เลือกงานเพื่อตอบกลับ</div>}
      </div>
      {showAddRepair && <AddRepairModal onClose={() => setShowAddRepair(false)}
        onSubmit={(rep) => { addRepair(rep); setShowAddRepair(false); }}/>}
    </div>
  );
}

function RepairDetail({ r, tenants, onAdvance, onUpdate, onDelete }) {
  const tone = r.status === "เสร็จแล้ว" ? "ok" : r.status === "กำลังดำเนินการ" ? "info" : "warn";
  const colors = { warn:["var(--warn-soft)","var(--warn)"], info:["var(--info-soft)","var(--info)"], ok:["var(--ok-soft)","var(--ok)"] }[tone];
  const advanceLabel = r.status === "รอดำเนินการ" ? "เริ่มดำเนินการ" : r.status === "กำลังดำเนินการ" ? "ปิดงาน (เสร็จแล้ว)" : "เปิดงานใหม่";
  const tenant = tenants.find(t => t.room === r.room_id);

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 18,
      padding: 20, overflow: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600 }}>ห้อง {r.room_id} {tenant && `· ${tenant.name}`}</div>
            <div style={{ fontSize: 17, fontWeight: 700, marginTop: 4, lineHeight: 1.3 }}>{r.issue}</div>
          </div>
          <span style={{ background: colors[0], color: colors[1], padding: "4px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>
            {r.status}
          </span>
        </div>
        <div style={{ fontSize: 11.5, color: "var(--ink-4)", marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
          <IconClock size={12} stroke="var(--ink-4)"/>
          แจ้งเมื่อ {r.created_at ? new Date(r.created_at).toLocaleDateString("th-TH",{day:"numeric",month:"long",year:"numeric"}) : "—"}
        </div>
      </div>

      <div style={{ position: "relative", paddingLeft: 18 }}>
        <div style={{ position: "absolute", left: 5, top: 6, bottom: 6, width: 2, background: "var(--line)" }}/>
        <TimelineEvent title="ผู้เช่าแจ้งซ่อม" sub={r.created_at ? new Date(r.created_at).toLocaleDateString("th-TH",{day:"numeric",month:"short",year:"numeric"}) : "—"} done/>
        <TimelineEvent title={r.assigned ? `มอบหมาย ${r.assigned}` : "ยังไม่มอบหมาย"} sub={r.assigned ? "เจ้าของหอกดมอบหมาย" : "—"} done={!!r.assigned}/>
        <TimelineEvent title="เริ่มดำเนินการ" sub={r.status !== "รอดำเนินการ" ? "ตามนัด" : "รอดำเนินการ"} done={r.status !== "รอดำเนินการ"}/>
        <TimelineEvent title="เสร็จสิ้น" sub={r.done_at ? new Date(r.done_at).toLocaleDateString("th-TH",{day:"numeric",month:"long",year:"numeric"}) : (r.eta ? `กำหนดเสร็จ ${r.eta}` : "ยังไม่ระบุ")} done={r.status === "เสร็จแล้ว"} last/>
      </div>

      <div style={{ background: "var(--surface-2)", borderRadius: 14, padding: 14, border: "1px solid var(--line)" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
          ตอบกลับ / อัปเดต
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <RField label="ช่างที่มอบหมาย">
            <input value={r.assigned || ""} onChange={e => onUpdate({ assigned: e.target.value })}
              placeholder="เช่น ช่างเอก" style={inputStyle()}/>
          </RField>
          <RField label="กำหนดเสร็จ">
            <input type="date" value={r.eta || ""} onChange={e => onUpdate({ eta: e.target.value })} style={inputStyle()}/>
          </RField>
        </div>

        <RField label="บันทึก / รายละเอียดงาน">
          <textarea value={r.note || ""} onChange={e => onUpdate({ note: e.target.value })}
            placeholder="เช่น เปลี่ยนคอมเพรสเซอร์ใหม่ รอชิ้นส่วน 2 วัน" rows={3}
            style={{ ...inputStyle(), resize: "vertical", lineHeight: 1.5 }}/>
        </RField>

        {r.status === "เสร็จแล้ว" && (
          <div style={{ marginTop: 10 }}>
            <RField label="ดำเนินการเสร็จเมื่อ">
              <input type="date" value={r.done_at || ""} onChange={e => onUpdate({ done_at: e.target.value })} style={inputStyle()}/>
            </RField>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {onDelete && (
          <button onClick={onDelete} style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid var(--danger-soft)",
            background: "var(--danger-soft)", color: "var(--danger)", fontWeight: 700, fontSize: 13, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6 }}>
            <IconTrash size={14} stroke="var(--danger)"/> ลบ
          </button>
        )}
        <button onClick={onAdvance} style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: "none",
          background: r.status === "เสร็จแล้ว" ? "var(--ink-3)" : "var(--ok)",
          color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <IconCheck size={15} stroke="white"/> {advanceLabel}
        </button>
      </div>
    </div>
  );
}

function TimelineEvent({ title, sub, done, last }) {
  return (
    <div style={{ display: "flex", gap: 12, paddingBottom: last ? 0 : 14, position: "relative" }}>
      <div style={{
        position: "absolute", left: -18, top: 0, width: 16, height: 16, borderRadius: "50%",
        background: done ? "var(--ok)" : "var(--surface-2)",
        border: `2px solid ${done ? "var(--ok)" : "var(--line-2)"}`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "white", fontWeight: 700,
      }}>{done ? "✓" : ""}</div>
      <div style={{ flex: 1, paddingTop: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: done ? "var(--ink)" : "var(--ink-3)" }}>{title}</div>
        <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
}

function RField({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink-2)", marginBottom: 5 }}>{label}</div>
      {children}
    </div>
  );
}

function inputStyle() {
  return {
    width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--line)",
    background: "var(--surface)", outline: "none", fontSize: 13, color: "var(--ink)",
    boxSizing: "border-box", fontFamily: "var(--font-thai)",
  };
}

// ─── HISTORY PAGE ───────────────────────────────────────────────────────
function HistoryPage() {
  const { payments, tenants, rooms, curY, curM, computePaymentTotal } = useData();
  const [year, setYear] = useState(curY);
  const [monthKey, setMonthKey] = useState(null);
  // Pending rent stored in DB is rent-only; tenant detail bill = rent + util.
  // Recalculate via computePaymentTotal so report matches tenant detail.
  const fullAmount = (p) =>
    computePaymentTotal ? computePaymentTotal(p.room_id, p.year, p.month).total : p.amount;

  // Synthesise virtual "รอชำระ" rows for any month inside a tenant's tenancy
  // that has no real payment record yet. Keeps the report in sync with the
  // tenant-detail view (which shows virtual rows) even for tenants created
  // before the all-months-on-create fix.
  const effectivePayments = (() => {
    const realKey = new Set(payments.map(p => `${p.room_id}|${p.year}|${p.month}`));
    const virtual = [];
    tenants.forEach(t => {
      const roomId = t.room || t.prevRoom;
      if (!roomId || t.sinceY == null || t.sinceM == null) return;
      const endY = t.evicted ? +t.evictedY : curY;
      const endM = t.evicted ? +t.evictedM : curM;
      const price = rooms.find(r => r.id === roomId)?.price || 0;
      let y = +t.sinceY, m = +t.sinceM, guard = 0;
      while ((y < endY || (y === endY && m <= endM)) && guard < 120) {
        const k = `${roomId}|${y}|${m}`;
        if (!realKey.has(k)) {
          virtual.push({ id: `virt-${k}`, room_id: roomId, year: y, month: m,
            amount: price, status: "รอชำระ", paid_at: null, _virtual: true });
        }
        m++; if (m > 11) { m = 0; y++; }
        guard++;
      }
    });
    return [...payments, ...virtual];
  })();

  // Helper: was this tenant living in the room during the given year/month?
  const wasInRoom = (t, y, m) => {
    if (t.sinceY == null) return false;
    if (y < t.sinceY || (y === t.sinceY && m < t.sinceM)) return false;
    if (t.evicted && t.evictedY != null) {
      if (y > t.evictedY || (y === t.evictedY && m > t.evictedM)) return false;
    }
    return true;
  };
  // Was someone actually in this room during this year/month? (current or evicted tenant)
  const hadTenant = (room_id, y, m) => tenants.some(t =>
    (t.room === room_id || (t.evicted && t.prevRoom === room_id)) && wasInRoom(t, y, m)
  );
  // Only count payments where a tenant was actually living in the room — hides orphaned records
  const validPayments = effectivePayments.filter(p => hadTenant(p.room_id, p.year, p.month));

  const maxMonth = year === curY ? curM : 11;
  const months = [];
  for (let m = 0; m <= maxMonth; m++) {
    const ms = validPayments.filter(p => p.year === year && p.month === m);
    // Revenue = what was actually paid (amount field already includes util at payment time)
    const rev = ms.filter(p => p.status === "ชำระแล้ว").reduce((s,p)=>s+p.amount, 0);
    // Due = recalculated rent + util so it matches what tenant sees
    const due = ms.filter(p => p.status === "รอชำระ").reduce((s,p) => s + fullAmount(p), 0);
    months.push({ m, rev, due, paid: ms.filter(p => p.status === "ชำระแล้ว").length, total: ms.length });
  }
  const total = months.reduce((s,m) => s + m.rev, 0);
  const maxBar = Math.max(1, ...months.map(x => x.rev + x.due));

  // Real year-over-year comparison
  const prevYearTotal = validPayments.filter(p => p.year === year - 1 && p.status === "ชำระแล้ว").reduce((s,p) => s + p.amount, 0);
  const yearCompare = prevYearTotal === 0
    ? "ยังไม่มีข้อมูลปีก่อน"
    : (() => {
        const diff = total - prevYearTotal;
        const pct = Math.round(Math.abs(diff) / prevYearTotal * 100);
        return `${diff >= 0 ? "+" : "−"}${pct}% จากปี ${year - 1}`;
      })();
  const yearCompareTrend = prevYearTotal === 0 ? "up" : (total >= prevYearTotal ? "up" : "warn");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.4 }}>รายงานรายได้</div>
          <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>ปี {year} · รวม {baht(total)}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setYear(y => y - 1)} style={detailBtn("ghost")}>‹ {year - 1}</button>
          <button style={{ ...detailBtn("primary"), background: "var(--brand)", pointerEvents: "none" }}>{year}</button>
          <button onClick={() => setYear(y => Math.min(curY, y + 1))} style={detailBtn("ghost")} disabled={year >= curY}>{year + 1} ›</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        <KPI label="รายได้รวม" value={baht(total)} sub={yearCompare} trend={yearCompareTrend} tone="brand"/>
        <KPI label="ค่าเฉลี่ย/เดือน" value={baht(months.length ? Math.round(total / months.length) : 0)} sub={`จาก ${months.length} เดือน`} trend="up" tone="sage"/>
        <KPI label="ยังค้างเก็บ" value={baht(months.reduce((s,m)=>s+m.due,0))} sub={`ปี ${year}`} trend="warn" tone="warn"/>
        <KPI label="อัตราเก็บได้" value={`${months.length ? Math.round(months.reduce((s,m)=>s+m.paid,0) / Math.max(1, months.reduce((s,m)=>s+m.total,0)) * 100) : 0}%`} sub="ของยอดรวม" trend="up" tone="lilac"/>
      </div>

      <Card title={`รายได้รายเดือน · ${year}`}>
        <div style={{ background: "var(--surface-2)", borderRadius: 14, overflow: "hidden", border: "1px solid var(--line)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr", padding: "12px 18px",
            fontSize: 11.5, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: 0.8,
            borderBottom: "1px solid var(--line)" }}>
            <span>เดือน</span><span>กราฟ</span><span>รายได้</span><span>ค้างชำระ</span><span style={{textAlign:"right"}}>เก็บได้</span>
          </div>
          {months.slice().reverse().map((mo, i) => {
            const pct = (mo.rev + mo.due) / maxBar;
            const revPct = mo.rev / maxBar;
            return (
              <div key={mo.m} onClick={() => setMonthKey({ year, month: mo.m })} className="lift" style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr",
                padding: "14px 18px", borderBottom: i < months.length-1 ? "1px solid var(--line)" : "none",
                alignItems: "center", background: "var(--surface)", fontSize: 13, cursor: "pointer" }}>
                <span style={{ fontWeight: 600 }}>{MONTHS_FULL[mo.m]}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6, paddingRight: 24 }}>
                  <div style={{ flex: 1, height: 10, background: "var(--surface-2)", borderRadius: 100, overflow: "hidden", position: "relative" }}>
                    <div style={{ position: "absolute", inset: 0, width: `${pct*100}%`, background: "var(--warn-soft)" }}/>
                    <div style={{ position: "absolute", inset: 0, width: `${revPct*100}%`, background: "var(--brand)", borderRadius: 100 }}/>
                  </div>
                </div>
                <span className="num" style={{ fontWeight: 700 }}>{baht(mo.rev)}</span>
                <span className="num" style={{ color: mo.due > 0 ? "var(--warn)" : "var(--ink-4)", fontWeight: 600 }}>{mo.due > 0 ? baht(mo.due) : "—"}</span>
                <span className="num" style={{ textAlign: "right", fontWeight: 700, color: "var(--ink-2)" }}>
                  {mo.total ? Math.round(mo.paid/mo.total*100) : 0}%
                </span>
              </div>
            );
          })}
        </div>
      </Card>
      {monthKey && <MonthDetailModal monthKey={monthKey} onClose={() => setMonthKey(null)}/>}
    </div>
  );
}

// ─── SLIPS PAGE ─────────────────────────────────────────────────────────
function SlipsPage() {
  const { slips, tenants, approveSlip, rejectSlip, deleteSlip, refreshSlips } = useData();
  const [selId, setSelId] = useState(slips.find(s => s.status === "pending")?.id);
  const [filter, setFilter] = useState("pending");
  const [lightbox, setLightbox] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const sel = slips.find(s => s.id === selId) || slips.find(s => s.status === filter);

  const list = slips.filter(s => filter === "all" || s.status === filter);
  const tenant = sel ? tenants.find(t => t.id === sel.tenant_id) : null;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshSlips();
    setRefreshing(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.4 }}>อนุมัติสลิปการชำระ</div>
          <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>
            {slips.filter(s=>s.status==="pending").length} รายการรอตรวจสอบ · ผู้เช่าจะได้รับการยืนยันทันทีหลังกดอนุมัติ
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button onClick={handleRefresh} disabled={refreshing} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
            borderRadius: 11, border: "1px solid var(--line)", background: "var(--surface)",
            color: "var(--ink-2)", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
            opacity: refreshing ? 0.5 : 1,
          }}>
            <span style={{ display: "inline-block", animation: refreshing ? "spin 0.8s linear infinite" : "none" }}>⟳</span>
            {refreshing ? "กำลังโหลด…" : "รีเฟรช"}
          </button>
          {[
            { id: "pending",  label: "รออนุมัติ", n: slips.filter(s=>s.status==="pending").length },
            { id: "approved", label: "อนุมัติแล้ว", n: slips.filter(s=>s.status==="approved").length },
            { id: "rejected", label: "ไม่อนุมัติ",  n: slips.filter(s=>s.status==="rejected").length },
            { id: "all",      label: "ทั้งหมด",    n: slips.length },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              padding: "8px 14px", borderRadius: 11, cursor: "pointer", fontSize: 12.5, fontWeight: 600,
              background: filter === f.id ? "var(--ink)" : "var(--surface)",
              color: filter === f.id ? "white" : "var(--ink-2)",
              border: `1px solid ${filter === f.id ? "var(--ink)" : "var(--line)"}`,
              display: "flex", alignItems: "center", gap: 6,
            }}>{f.label} <span className="num" style={{ opacity: 0.7 }}>{f.n}</span></button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "440px 1fr", gap: 18, height: "calc(100% - 80px)" }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 18, overflow: "hidden",
          display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)", fontSize: 13, fontWeight: 700, color: "var(--ink-2)" }}>
            สลิปทั้งหมด ({list.length})
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: 8 }}>
            {list.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>ไม่มีรายการ</div>}
            {list.map(s => {
              const t = tenants.find(x => x.id === s.tenant_id);
              const active = sel?.id === s.id;
              const tone = s.status === "pending" ? "warn" : s.status === "approved" ? "ok" : "danger";
              const colors = { warn:["var(--warn-soft)","var(--warn)"], ok:["var(--ok-soft)","var(--ok)"], danger:["var(--danger-soft)","var(--danger)"] }[tone];
              return (
                <button key={s.id} onClick={() => { setSelId(s.id); setConfirmDel(false); }} style={{
                  width: "100%", padding: 12, marginBottom: 4, borderRadius: 12, textAlign: "left", cursor: "pointer",
                  background: active ? "var(--brand-soft)" : "transparent", border: "none",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <SlipThumb id={s.thumb} imageUrl={s.imageUrl} status={s.status}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700 }}>{t?.name || s.tenant_id}</div>
                      <span className="num" style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{baht(s.amount)}</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>
                      ห้อง {s.room_id} · {dl(s.year, s.month)} · {s.bank}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                      <span style={{ background: colors[0], color: colors[1], padding: "2px 8px", borderRadius: 100, fontSize: 10, fontWeight: 700 }}>
                        {s.status === "pending" ? "⏳ รออนุมัติ" : s.status === "approved" ? "✓ อนุมัติแล้ว" : "✕ ไม่อนุมัติ"}
                      </span>
                      <span style={{ fontSize: 10.5, color: "var(--ink-4)" }}>{s.uploaded_at}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {sel ? (
          <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 18, padding: 24, overflow: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <Avatar name={tenant?.name || sel.tenant_id || "?"} size={48}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.2 }}>{tenant?.name || `ผู้เช่า ${sel.tenant_id}`}</div>
                <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 2 }}>
                  ห้อง {sel.room_id} · ส่งสลิปเมื่อ {sel.uploaded_at}
                </div>
              </div>
              <span style={{
                padding: "5px 12px", borderRadius: 100, fontSize: 11.5, fontWeight: 700,
                background: sel.status === "pending" ? "var(--warn-soft)" : sel.status === "approved" ? "var(--ok-soft)" : "var(--danger-soft)",
                color:       sel.status === "pending" ? "var(--warn)"      : sel.status === "approved" ? "var(--ok)"      : "var(--danger)",
              }}>
                {sel.status === "pending" ? "⏳ รออนุมัติ" : sel.status === "approved" ? "✓ อนุมัติแล้ว" : "✕ ไม่อนุมัติ"}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 22 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
                  สลิปการโอน
                  {sel.imageUrl && (
                    <span style={{ marginLeft: 8, background: "var(--ok-soft)", color: "var(--ok)", fontSize: 10, fontWeight: 700,
                      padding: "2px 7px", borderRadius: 100, verticalAlign: "middle" }}>
                      ● รูปจริงจากผู้เช่า
                    </span>
                  )}
                </div>
                {sel.imageUrl ? (
                  <div style={{ position: "relative", cursor: "zoom-in", borderRadius: 18, overflow: "hidden",
                    border: "1px solid var(--line)", boxShadow: "var(--sh-2)", maxWidth: 340, margin: "0 auto" }}
                    onClick={() => setLightbox(true)}
                    title="คลิกเพื่อดูขนาดเต็ม">
                    <img src={sel.imageUrl} alt="สลิปการโอน" style={{ width: "100%", display: "block", maxHeight: 420, objectFit: "contain", background: "var(--surface-2)" }}/>
                    <div style={{ position: "absolute", bottom: 8, right: 10, background: "rgba(0,0,0,0.5)", borderRadius: 8,
                      padding: "3px 8px", fontSize: 10, color: "white", fontWeight: 600, backdropFilter: "blur(4px)" }}>
                      🔍 ขยาย
                    </div>
                  </div>
                ) : (
                  <SlipMock {...sel} tenant={tenant || { name: `ผู้เช่า ${sel.tenant_id}`, phone: "—" }}/>
                )}
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>รายละเอียด</div>
                <div style={{ background: "var(--surface-2)", borderRadius: 14, padding: 16, border: "1px solid var(--line)" }}>
                  <InfoRow label="ค่าเช่าเดือน"  value={dl(sel.year, sel.month)}/>
                  <InfoRow label="จำนวนเงิน"   value={baht(sel.amount)} bold/>
                  <InfoRow label="ธนาคารปลายทาง" value={sel.bank}/>
                  <InfoRow label="ส่งเมื่อ"     value={sel.uploaded_at}/>
                  <InfoRow label="ห้อง"        value={sel.room_id} last/>
                </div>

                <div style={{ marginTop: 14, background: "var(--brand-soft)", borderRadius: 12, padding: "12px 14px",
                  display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <IconBell size={16} stroke="var(--brand)"/>
                  <div style={{ fontSize: 12, color: "var(--brand-ink)", lineHeight: 1.5 }}>
                    การอนุมัติจะอัปเดตสถานะการชำระเงินของผู้เช่าทันที และส่งการแจ้งเตือนกลับไปยังผู้เช่า
                  </div>
                </div>

                {sel.status === "pending" ? (
                  <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
                    <button onClick={() => rejectSlip(sel.id)} style={{
                      flex: 1, padding: "12px 0", borderRadius: 12, border: "1px solid var(--danger-soft)",
                      background: "var(--surface)", color: "var(--danger)", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}><IconX size={15} stroke="var(--danger)"/> ไม่อนุมัติ</button>
                    <button onClick={() => approveSlip(sel.id)} style={{
                      flex: 2, padding: "12px 0", borderRadius: 12, border: "none",
                      background: "var(--ok)", color: "white", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}><IconCheck size={15} stroke="white"/> ยืนยันการชำระเงิน</button>
                  </div>
                ) : (
                  <>
                    <div style={{ marginTop: 18, padding: "12px 14px", borderRadius: 12,
                      background: sel.status === "approved" ? "var(--ok-soft)" : "var(--danger-soft)",
                      color:      sel.status === "approved" ? "var(--ok)"      : "var(--danger)",
                      fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                      {sel.status === "approved" ? <IconCheck size={16} stroke="var(--ok)"/> : <IconX size={16} stroke="var(--danger)"/>}
                      {sel.status === "approved" ? "ยืนยันการชำระเงินเรียบร้อย — ผู้เช่าได้รับการแจ้งเตือนแล้ว" : "ไม่อนุมัติ — โปรดติดต่อผู้เช่าให้แนบสลิปใหม่"}
                    </div>

                    {/* Delete slip section */}
                    {!confirmDel ? (
                      <button onClick={() => setConfirmDel(true)} style={{
                        marginTop: 10, width: "100%", padding: "10px 0", borderRadius: 12,
                        border: "1px solid var(--line)", background: "transparent",
                        color: "var(--ink-3)", fontWeight: 600, fontSize: 12.5, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      }}>
                        <IconX size={13} stroke="var(--ink-3)"/> ลบสลิปนี้
                      </button>
                    ) : (
                      <div style={{ marginTop: 10, padding: "12px 14px", borderRadius: 12,
                        border: "1.5px solid var(--danger-soft)", background: "var(--danger-soft)" }}>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--danger)", marginBottom: 8 }}>
                          ยืนยันการลบสลิป?
                        </div>
                        <div style={{ fontSize: 12, color: "var(--ink-2)", marginBottom: 10, lineHeight: 1.5 }}>
                          สลิปนี้จะถูกลบถาวรและไม่สามารถกู้คืนได้ ประวัติการชำระเงินจะยังคงอยู่
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => setConfirmDel(false)} style={{
                            flex: 1, padding: "9px 0", borderRadius: 10, border: "1px solid var(--line)",
                            background: "var(--surface)", color: "var(--ink-2)", fontWeight: 700, fontSize: 12.5, cursor: "pointer",
                          }}>ยกเลิก</button>
                          <button onClick={() => { deleteSlip(sel.id); setSelId(null); setConfirmDel(false); }} style={{
                            flex: 1, padding: "9px 0", borderRadius: 10, border: "none",
                            background: "var(--danger)", color: "white", fontWeight: 700, fontSize: 12.5, cursor: "pointer",
                          }}>ลบถาวร</button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 18,
            display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-3)" }}>
            เลือกสลิปจากรายการเพื่อตรวจสอบ
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && sel?.imageUrl && (
        <div onClick={() => setLightbox(false)} style={{
          position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out",
        }}>
          <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }} onClick={e => e.stopPropagation()}>
            <img src={sel.imageUrl} alt="สลิปขนาดเต็ม" style={{ maxWidth: "80vw", maxHeight: "88vh", objectFit: "contain",
              borderRadius: 16, boxShadow: "0 12px 60px rgba(0,0,0,0.5)", display: "block" }}/>
            <button onClick={() => setLightbox(false)} style={{
              position: "absolute", top: -14, right: -14, width: 36, height: 36, borderRadius: 18,
              background: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "var(--sh-2)", fontSize: 16, fontWeight: 700, color: "var(--ink)",
            }}>✕</button>
            <div style={{ textAlign: "center", marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
              สลิปจริงจากผู้เช่า · ห้อง {sel.room_id} · {dl(sel.year, sel.month)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, bold, last }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "9px 0", borderBottom: last ? "none" : "1px solid var(--line)" }}>
      <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{label}</span>
      <span className="num" style={{ fontSize: bold ? 16 : 13, fontWeight: bold ? 700 : 600, color: "var(--ink)" }}>{value}</span>
    </div>
  );
}

function SlipThumb({ id, imageUrl, status }) {
  const grad = id === "slip-a" ? ["#a8d5b1","#5da375"]
             : id === "slip-b" ? ["#b8a1d3","#7e5fb0"]
             : ["#f1b89a","#d18467"];
  return (
    <div style={{
      width: 52, height: 64, borderRadius: 8, overflow: "hidden", flexShrink: 0,
      background: imageUrl ? "var(--surface-2)" : `linear-gradient(140deg, ${grad[0]}, ${grad[1]})`,
      position: "relative", boxShadow: "var(--sh-1)", border: "1px solid var(--line)",
    }}>
      {imageUrl ? (
        <img src={imageUrl} alt="slip" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}/>
      ) : (
        <svg viewBox="0 0 52 64" width="52" height="64">
          <rect x="6" y="8"  width="20" height="2.5" rx="1" fill="rgba(255,255,255,0.5)"/>
          <rect x="6" y="14" width="32" height="2"   rx="1" fill="rgba(255,255,255,0.35)"/>
          <rect x="6" y="20" width="28" height="2"   rx="1" fill="rgba(255,255,255,0.35)"/>
          <rect x="6" y="34" width="40" height="9"   rx="2" fill="rgba(255,255,255,0.55)"/>
          <rect x="6" y="48" width="18" height="2"   rx="1" fill="rgba(255,255,255,0.35)"/>
          <rect x="6" y="54" width="26" height="2"   rx="1" fill="rgba(255,255,255,0.35)"/>
        </svg>
      )}
      {status === "approved" && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(34,139,90,0.55)",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconCheck size={20} stroke="white" strokeWidth={3}/>
        </div>
      )}
    </div>
  );
}

function SlipMock({ amount, year, month, bank, room_id, uploaded_at, tenant }) {
  const { owner } = useData();
  return (
    <div style={{
      borderRadius: 18, overflow: "hidden", border: "1px solid var(--line)", boxShadow: "var(--sh-2)",
      background: "white", maxWidth: 340, margin: "0 auto",
    }}>
      <div style={{ background: "linear-gradient(135deg, #5da375, #2e7a4a)", padding: "20px 22px", color: "white" }}>
        <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 600 }}>SLIP TRANSFER</div>
        <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>โอนเงินสำเร็จ</div>
        <div style={{ fontSize: 10, opacity: 0.85, marginTop: 6 }}>{uploaded_at}</div>
      </div>
      <div style={{ padding: "16px 22px 22px" }}>
        <div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 4 }}>จาก</div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{tenant?.name}</div>
        <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }} className="num">{tenant?.phone}</div>

        <div style={{ height: 1, background: "var(--line)", margin: "14px 0", borderTop: "1px dashed var(--line-2)", borderBottom: "none" }}/>

        <div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 4 }}>ถึง · {bank}</div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{owner.name} ({owner.dorm})</div>
        <div className="num" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>xxx-x-xxxx5-9</div>

        <div style={{ background: "var(--surface-2)", borderRadius: 10, padding: 14, marginTop: 14, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "var(--ink-3)", fontWeight: 600 }}>จำนวนเงิน</div>
          <div className="num" style={{ fontSize: 26, fontWeight: 700, color: "var(--ink)", letterSpacing: -0.5 }}>{baht(amount)}</div>
          <div style={{ fontSize: 11, color: "var(--ink-3)" }}>ค่าเช่า {dl(year, month)} · ห้อง {room_id}</div>
        </div>

        <div className="num" style={{ marginTop: 12, textAlign: "center", fontSize: 10, color: "var(--ink-4)", letterSpacing: 1 }}>
          REF: 20260521091422
        </div>
      </div>
    </div>
  );
}

// ─── UTILITY PAGE ────────────────────────────────────────────────────────
function UtilityPage() {
  const { rooms, tenants, utils, utilRate, billing, setRoomBilling, curY, curM, saveUtilReading, saveInitialReading } = useData();
  const byRoomId = (a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true });
  const occupiedRooms = rooms.filter(r => r.status === "ไม่ว่าง").sort(byRoomId);
  // All rooms that have had a meter reading (occupied or vacant) + currently occupied
  const allMeterRooms = [...rooms].sort(byRoomId).filter(r =>
    r.status === "ไม่ว่าง" || r.lastElecMeter != null || r.lastWaterMeter != null
  );
  const [roomSel, setRoomSel] = useState(occupiedRooms[0]?.id || allMeterRooms[0]?.id);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [flatRateOpen, setFlatRateOpen] = useState(false);

  const exportAll = () => {
    const head = ["ห้อง","เดือน","ปี","ไฟ_ก่อน","ไฟ_ล่าสุด","ไฟ_หน่วย","ไฟ_บาท","น้ำ_ก่อน","น้ำ_ล่าสุด","น้ำ_หน่วย","น้ำ_บาท","รวม"];
    const rows = utils.map(u => [
      u.room_id, MONTHS_TH[u.month], u.year,
      u.elec_prev, u.elec_cur, u.elec_use, u.elec_amount,
      u.water_prev, u.water_cur, u.water_use, u.water_amount,
      u.elec_amount + u.water_amount,
    ]);
    downloadCsv(`มิเตอร์น้ำไฟ-${curY}.csv`, [head, ...rows]);
  };
  const tenant = tenants.find(t => t.room === roomSel);
  const selRoom = rooms.find(r => r.id === roomSel);
  // Filter utils to only show CURRENT tenant's history (from their sinceY/sinceM onwards)
  // Old tenant's history is preserved in data but hidden from the new tenant's view
  const roomUtils = utils.filter(u => {
    if (u.room_id !== roomSel) return false;
    if (tenant) {
      if (u.year < tenant.sinceY) return false;
      if (u.year === tenant.sinceY && u.month < tenant.sinceM) return false;
    }
    return true;
  }).sort((a,b) => b.year !== a.year ? b.year - a.year : b.month - a.month);
  const cur = roomUtils[0];

  const [newElec, setNewElec] = useState(cur ? cur.elec_cur + 50 : 0);
  const [newWater, setNewWater] = useState(cur ? cur.water_cur + 8 : 0);
  // Initial reading state (for rooms with no readings yet)
  const [initElec, setInitElec] = useState("");
  const [initWater, setInitWater] = useState("");

  // Reset when room changes
  const [lastRoom, setLastRoom] = useState(roomSel);
  if (lastRoom !== roomSel) {
    setLastRoom(roomSel);
    const lc = utils.filter(u => u.room_id === roomSel).sort((a,b) => b.year - a.year || b.month - a.month)[0];
    setNewElec(lc ? lc.elec_cur + 50 : 0);
    setNewWater(lc ? lc.water_cur + 8 : 0);
    setInitElec("");
    setInitWater("");
  }

  const elecUse = newElec - (cur?.elec_cur || 0);
  const waterUse = newWater - (cur?.water_cur || 0);

  // Billing mode for the selected room this month
  const billingKey = `${roomSel}|${curY}|${curM}`;
  const roomBilling = billing.monthly?.[billingKey] || {};
  const eMode = roomBilling.elecMode  || "metered";
  const wMode = roomBilling.waterMode || "metered";
  const eFlat = roomBilling.elecFlat  ?? billing.defaultElecFlat ?? 0;
  const wFlat = roomBilling.waterFlat ?? billing.defaultWaterFlat ?? 0;

  const elecAmt  = eMode === "flat" ? eFlat : Math.max(0, elecUse) * utilRate.electric;
  const waterAmt = wMode === "flat" ? wFlat : Math.max(0, waterUse) * utilRate.water;

  // Compute effective total for a util row — respects flat-rate billing config for that month
  const effAmt = (u) => {
    const k = `${u.room_id}|${u.year}|${u.month}`;
    const b = billing.monthly?.[k] || {};
    const eA = b.elecMode  === "flat" ? (b.elecFlat  ?? billing.defaultElecFlat  ?? 0) : u.elec_amount;
    const wA = b.waterMode === "flat" ? (b.waterFlat ?? billing.defaultWaterFlat ?? 0) : u.water_amount;
    return eA + wA;
  };

  const onSave = () => {
    saveUtilReading({ room_id: roomSel, year: curY, month: curM, elec_cur: Number(newElec), water_cur: Number(newWater) });
  };

  const [selHistM, setSelHistM] = useState(null); // `${year}-${month}` key

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.4 }}>มิเตอร์น้ำ-ไฟ</div>
          <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>
            ค่าน้ำ {baht(utilRate.water)}/หน่วย · ค่าไฟ {baht(utilRate.electric)}/หน่วย · จดทุก 25 ของเดือน
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={exportAll} style={detailBtn("ghost")}><IconDownload size={14}/> ส่งออกข้อมูล</button>
          <button onClick={() => setFlatRateOpen(true)} style={detailBtn("ghost")}>⚡ ตั้งค่าเหมาจ่าย</button>
          <button onClick={() => setBulkOpen(true)} style={detailBtn("primary")}><IconPlus size={14} stroke="white"/> จดมิเตอร์รวม</button>
        </div>
      </div>
      {bulkOpen && <BulkMeterModal onClose={() => setBulkOpen(false)}/>}
      {flatRateOpen && <FlatRateModal onClose={() => setFlatRateOpen(false)}/>}

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 18, height: "calc(100% - 80px)" }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 18, overflow: "hidden",
          display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)", display: "flex",
            justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>ห้องพัก</div>
            <span className="num" style={{ fontSize: 11, color: "var(--ink-3)" }}>
              {occupiedRooms.length} มีผู้เช่า
            </span>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: 8 }}>
            {allMeterRooms.map(r => {
              const occ = r.status === "ไม่ว่าง";
              const u = utils.filter(x => x.room_id === r.id && !x.isInitial).sort((a,b) => b.year - a.year || b.month - a.month)[0];
              const t = tenants.find(x => x.room === r.id);
              const active = roomSel === r.id;
              // Meter subtitle: show latest meter values from room record if available
              const meterLabel = r.lastElecMeter != null
                ? `⚡${r.lastElecMeter} 💧${r.lastWaterMeter ?? 0}${r.lastMeterYear != null ? ` · ${dl(r.lastMeterYear, r.lastMeterMonth)}` : ""}`
                : "ยังไม่จด";
              return (
                <button key={r.id} onClick={() => setRoomSel(r.id)} style={{
                  width: "100%", padding: "10px 12px", marginBottom: 3, borderRadius: 11,
                  background: active ? "var(--brand-soft)" : "transparent", border: "none",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 10, textAlign: "left",
                  opacity: occ ? 1 : 0.72,
                }}>
                  <div className="num" style={{ width: 44, height: 44, borderRadius: 11,
                    background: active ? "var(--brand)" : occ ? "var(--surface-2)" : "oklch(0.93 0 0)",
                    color: active ? "white" : "var(--ink-2)",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, border: occ ? "none" : "1px dashed var(--line-2)",
                  }}>
                    {r.id}
                    <span style={{ fontSize: 8, opacity: 0.7, fontWeight: 500, marginTop: 1 }}>ชั้น {r.floor}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 1 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {occ ? (t?.name || "—") : "ว่าง"}
                      </span>
                      {!occ && (
                        <span style={{ fontSize: 9.5, fontWeight: 700, background: "var(--surface-2)",
                          color: "var(--ink-3)", borderRadius: 4, padding: "1px 5px", flexShrink: 0 }}>ว่าง</span>
                      )}
                    </div>
                    <div className="num" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                      {occ && u ? `${u.elec_use + u.water_use} หน่วย · ${baht(effAmt(u))}` : meterLabel}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ overflow: "auto" }}>
          {tenant && !cur ? (
            // ── No readings yet — initial meter reading form (matches existing form style) ──
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Tenant header — identical to existing form */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 18, padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <Avatar name={tenant.name} size={48}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 17, fontWeight: 700 }}>{tenant.name}</div>
                    <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 2 }}>ห้อง {roomSel} · ยังไม่เคยจดมิเตอร์</div>
                  </div>
                </div>
              </div>

              {/* Initial reading form — same card structure as "จดมิเตอร์ใหม่" */}
              <div style={{ background: "oklch(0.965 0.025 145)", borderRadius: 18, padding: 20, border: "1px solid oklch(0.86 0.07 145)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "oklch(0.35 0.1 145)", textTransform: "uppercase", letterSpacing: 1 }}>
                      มิเตอร์เริ่มต้น · {dl(tenant.sinceY, tenant.sinceM)}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>กรอกค่ามิเตอร์ ณ วันที่ผู้เช่าเข้าพัก</div>
                  </div>
                  <button
                    onClick={() => {
                      saveInitialReading({
                        room_id: roomSel,
                        year: tenant.sinceY,
                        month: tenant.sinceM,
                        elec_cur: +initElec || 0,
                        water_cur: +initWater || 0,
                      });
                      setInitElec("");
                      setInitWater("");
                    }}
                    style={{ background: "oklch(0.42 0.15 145)", color: "white", border: "none", borderRadius: 11,
                      padding: "10px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 6 }}>
                    <IconCheck size={15} stroke="white"/> บันทึก
                  </button>
                </div>

                {/* ── Previous readings banner — quick "use existing" option ── */}
                {selRoom && (selRoom.lastElecMeter != null || selRoom.lastWaterMeter != null) && (
                  <div style={{ background: "white", borderRadius: 12, padding: "12px 14px",
                    border: "1.5px solid oklch(0.85 0.05 240)", marginBottom: 12,
                    display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)",
                        textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>
                        เลขมิเตอร์ล่าสุดของห้องนี้
                        {selRoom.lastMeterYear != null && (
                          <span style={{ fontWeight: 600, textTransform: "none", letterSpacing: 0, marginLeft: 4 }}>
                            ({dl(selRoom.lastMeterYear, selRoom.lastMeterMonth)})
                          </span>
                        )}
                      </div>
                      <div className="num" style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: "oklch(0.48 0.13 80)",
                          display: "flex", alignItems: "center", gap: 4 }}>
                          ⚡ <span style={{ color: "var(--ink)" }}>{selRoom.lastElecMeter ?? 0}</span>
                        </span>
                        <span style={{ width: 1, height: 16, background: "var(--line)" }}/>
                        <span style={{ fontSize: 15, fontWeight: 700, color: "oklch(0.40 0.13 230)",
                          display: "flex", alignItems: "center", gap: 4 }}>
                          💧 <span style={{ color: "var(--ink)" }}>{selRoom.lastWaterMeter ?? 0}</span>
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setInitElec(String(selRoom.lastElecMeter ?? 0));
                        setInitWater(String(selRoom.lastWaterMeter ?? 0));
                      }}
                      style={{ background: "var(--ink)", color: "white", border: "none", borderRadius: 9,
                        padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
                      ↺ ใช้เลขเดิม
                    </button>
                  </div>
                )}

                {/* Two inputs — same grid as MeterInput */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {/* Electricity */}
                  <div style={{ background: "white", border: `1.5px solid oklch(0.88 0.07 80)`, borderRadius: 14, padding: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: "oklch(0.96 0.04 80)",
                        display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <IconSparkle size={18} stroke="oklch(0.55 0.15 80)"/>
                      </div>
                      <div style={{ flex: 1, fontSize: 13.5, fontWeight: 700 }}>ค่าไฟฟ้าเริ่มต้น</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10.5, color: "oklch(0.55 0.15 80)", fontWeight: 700, marginBottom: 4 }}>เลขมิเตอร์</div>
                      <input type="number" min="0" step="1" placeholder="0"
                        value={initElec} onChange={e => setInitElec(e.target.value)}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 9,
                          border: "1.5px solid oklch(0.65 0.15 80)", background: "white",
                          fontSize: 16, fontWeight: 700, color: "var(--ink)",
                          outline: "none", boxSizing: "border-box", fontFamily: "var(--font-num)" }}/>
                    </div>
                    <div style={{ marginTop: 10, padding: "8px 12px", background: "oklch(0.96 0.04 80)", borderRadius: 9,
                      display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="num" style={{ fontSize: 12, fontWeight: 600, color: "oklch(0.55 0.15 80)" }}>หน่วยเริ่มต้น</span>
                      <span className="num" style={{ fontSize: 14, fontWeight: 700, color: "oklch(0.55 0.15 80)" }}>{initElec || 0}</span>
                    </div>
                  </div>
                  {/* Water */}
                  <div style={{ background: "white", border: `1.5px solid oklch(0.88 0.05 230)`, borderRadius: 14, padding: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: "oklch(0.96 0.025 230)",
                        display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <IconWifi size={18} stroke="oklch(0.55 0.13 230)"/>
                      </div>
                      <div style={{ flex: 1, fontSize: 13.5, fontWeight: 700 }}>ค่าน้ำเริ่มต้น</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10.5, color: "oklch(0.40 0.13 230)", fontWeight: 700, marginBottom: 4 }}>เลขมิเตอร์</div>
                      <input type="number" min="0" step="1" placeholder="0"
                        value={initWater} onChange={e => setInitWater(e.target.value)}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 9,
                          border: "1.5px solid oklch(0.55 0.13 230)", background: "white",
                          fontSize: 16, fontWeight: 700, color: "var(--ink)",
                          outline: "none", boxSizing: "border-box", fontFamily: "var(--font-num)" }}/>
                    </div>
                    <div style={{ marginTop: 10, padding: "8px 12px", background: "oklch(0.96 0.025 230)", borderRadius: 9,
                      display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="num" style={{ fontSize: 12, fontWeight: 600, color: "oklch(0.40 0.13 230)" }}>หน่วยเริ่มต้น</span>
                      <span className="num" style={{ fontSize: 14, fontWeight: 700, color: "oklch(0.40 0.13 230)" }}>{initWater || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Note — same style as billing mode strip */}
                <div style={{ marginTop: 14, padding: "10px 14px", background: "oklch(0.93 0.04 145)",
                  borderRadius: 10, fontSize: 12, color: "oklch(0.35 0.1 145)", lineHeight: 1.5,
                  display: "flex", alignItems: "center", gap: 6 }}>
                  💡 <span>ค่าตั้งต้น — <b>ไม่นับเป็นยอดใช้งาน</b> · ระบบจะใช้เป็นฐานคำนวณหน่วยในเดือนถัดไป</span>
                </div>
              </div>
            </div>
          ) : tenant && cur ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 18, padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <Avatar name={tenant.name} size={48}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 17, fontWeight: 700 }}>{tenant.name}</div>
                    <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 2 }}>ห้อง {roomSel} · จดล่าสุด {cur.read_at}</div>
                  </div>
                  <button style={detailBtn("ghost")}><IconBell size={14}/> ส่งเตือนผู้เช่า</button>
                </div>
              </div>

              {/* ── Warning: last record is an isInitial from a previous month ─────── */}
              {cur.isInitial && (cur.year < curY || (cur.year === curY && cur.month < curM)) && (
                <div style={{ background: "oklch(0.960 0.045 75)", border: "1.5px solid oklch(0.84 0.10 75)",
                  borderRadius: 14, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 18, lineHeight: 1 }}>⚠️</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "oklch(0.42 0.13 60)", marginBottom: 3 }}>
                      ยังไม่มีการจดมิเตอร์สิ้นเดือน {MONTHS_TH[cur.month]} {cur.year}
                    </div>
                    <div style={{ fontSize: 12, color: "oklch(0.50 0.10 60)", lineHeight: 1.55 }}>
                      ค่าตั้งต้น ({cur.elec_cur} / {cur.water_cur}) ถูกใช้เป็นฐาน
                      — ถ้าเดือนนั้นผู้เช่าใช้ไฟ/น้ำ กรุณาจดค่าสิ้นเดือนก่อน แล้วจดเดือนปัจจุบันอีกครั้ง
                    </div>
                  </div>
                </div>
              )}

              <div style={{ background: "var(--brand-soft)", borderRadius: 18, padding: 20, border: "1px solid oklch(0.88 0.06 35)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--brand-ink)", textTransform: "uppercase", letterSpacing: 1 }}>
                      จดมิเตอร์ใหม่ · {MONTHS_TH[curM]} {curY}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>กรอกเลขมิเตอร์ล่าสุดที่อ่านได้</div>
                  </div>
                  <button onClick={onSave} style={{ background: "var(--brand)", color: "white", border: "none", borderRadius: 11,
                    padding: "10px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                    <IconCheck size={15} stroke="white"/> บันทึก
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <MeterInput
                    label="ค่าไฟฟ้า" unit="หน่วย" prev={cur.elec_cur}
                    value={newElec} onChange={setNewElec}
                    use={eMode === "flat" ? null : elecUse} amount={elecAmt}
                    flatMode={eMode === "flat"} flatLabel={`เหมา ${baht(eFlat)}`}
                    color="oklch(0.65 0.15 80)" bg="oklch(0.96 0.04 80)"
                    icon={<IconSparkle size={18} stroke="oklch(0.55 0.15 80)"/>}
                  />
                  <MeterInput
                    label="ค่าน้ำประปา" unit="หน่วย" prev={cur.water_cur}
                    value={newWater} onChange={setNewWater}
                    use={wMode === "flat" ? null : waterUse} amount={waterAmt}
                    flatMode={wMode === "flat"} flatLabel={`เหมา ${baht(wFlat)}`}
                    color="oklch(0.55 0.13 230)" bg="oklch(0.96 0.025 230)"
                    icon={<IconWifi size={18} stroke="oklch(0.55 0.13 230)"/>}
                  />
                </div>

                <div style={{ marginTop: 14, padding: "12px 16px", background: "white", borderRadius: 12,
                  display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-2)" }}>ยอดรวมเดือนนี้ (น้ำ + ไฟ)</span>
                  <span className="num" style={{ fontSize: 20, fontWeight: 700, color: "var(--brand-ink)" }}>{baht(elecAmt + waterAmt)}</span>
                </div>

                {/* Billing mode strip */}
                <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  {[
                    { label: "⚡", mode: eMode, flat: eFlat, color: "oklch(0.55 0.15 80)" },
                    { label: "💧", mode: wMode, flat: wFlat, color: "oklch(0.45 0.13 230)" },
                  ].map(({ label, mode, flat, color }) => (
                    <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 11px",
                      borderRadius: 100, fontSize: 11.5, fontWeight: 700,
                      background: mode === "flat" ? `${color}18` : "var(--surface-2)",
                      color: mode === "flat" ? color : "var(--ink-3)",
                      border: `1px solid ${mode === "flat" ? color + "44" : "var(--line)"}` }}>
                      {label} {mode === "flat" ? `เหมา ${baht(flat)}` : "จดมิเตอร์"}
                    </span>
                  ))}
                  <button onClick={() => setFlatRateOpen(true)} style={{
                    marginLeft: "auto", padding: "4px 11px", borderRadius: 100,
                    fontSize: 11.5, fontWeight: 700, cursor: "pointer",
                    background: "transparent", border: "1px solid var(--line)", color: "var(--ink-3)",
                  }}>เปลี่ยนรูปแบบ →</button>
                </div>
              </div>

              <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 18, padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>ประวัติย้อนหลัง · ห้อง {roomSel}</div>
                <div style={{ background: "var(--surface-2)", borderRadius: 12, overflow: "hidden", border: "1px solid var(--line)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr 1fr 1fr", padding: "11px 14px",
                    fontSize: 11.5, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: 0.8,
                    borderBottom: "1px solid var(--line)" }}>
                    <span>เดือน</span><span>ไฟ ก่อน → หลัง</span><span>ไฟ หน่วย</span><span>น้ำ ก่อน → หลัง</span><span>น้ำ หน่วย</span><span style={{textAlign:"right"}}>รวม</span>
                  </div>
                  {roomUtils.map((u, i) => {
                    const notLast = i < roomUtils.length - 1;

                    // ── Initial reading row (move-in baseline) ─────────────
                    if (u.isInitial) return (
                      <Fragment key={u.id}>
                        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr 1fr 1fr",
                          padding: "10px 14px",
                          borderBottom: notLast ? "1px solid var(--line)" : "none",
                          background: "oklch(0.975 0.015 145)", fontSize: 13, alignItems: "center" }}>
                          <span style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                            {dl(u.year, u.month)}
                            <span style={{ fontSize: 10, fontWeight: 700, background: "oklch(0.88 0.08 145)",
                              color: "oklch(0.35 0.1 145)", borderRadius: 5, padding: "2px 6px" }}>เริ่มต้น</span>
                          </span>
                          <span className="num" style={{ color: "var(--ink-3)" }}>— → <b style={{ color: "var(--ink)" }}>{u.elec_cur}</b></span>
                          <span style={{ color: "var(--ink-4)", fontSize: 11 }}>ฐาน</span>
                          <span className="num" style={{ color: "var(--ink-3)" }}>— → <b style={{ color: "var(--ink)" }}>{u.water_cur}</b></span>
                          <span style={{ color: "var(--ink-4)", fontSize: 11 }}>ฐาน</span>
                          <span className="num" style={{ textAlign: "right", color: "var(--ink-3)", fontSize: 11 }}>—</span>
                        </div>
                      </Fragment>
                    );

                    const pr = roomUtils
                      .filter(x => !x.isInitial && (x.year < u.year || (x.year === u.year && x.month < u.month)))
                      .sort((a, b) => b.year !== a.year ? b.year - a.year : b.month - a.month)[0];
                    // Same-month initial (tenant moved in this exact month, not yet replaced by regular reading)
                    const initRec  = roomUtils.find(x => x.isInitial && x.year === u.year && x.month === u.month);
                    // Most-recent initial from ANY previous month (handles: initial in Apr, regular in May → no pr)
                    const initPrev = roomUtils
                      .filter(x => x.isInitial && (x.year < u.year || (x.year === u.year && x.month < u.month)))
                      .sort((a, b) => b.year !== a.year ? b.year - a.year : b.month - a.month)[0];
                    // Always derive "previous" from the actual prior record's elec_cur so the
                    // history reflects continuity even when readings are entered out of order
                    // (e.g. May saved before April → May's stored elec_prev would otherwise be stale).
                    // u.elec_prev is only used as a fallback when no prior record exists
                    // (i.e. the initial reading was overwritten by a same-month regular reading).
                    const ePrev = pr?.elec_cur  ?? initRec?.elec_cur  ?? initPrev?.elec_cur  ?? u.elec_prev  ?? 0;
                    const wPrev = pr?.water_cur ?? initRec?.water_cur ?? initPrev?.water_cur ?? u.water_prev ?? 0;
                    const eUse = Math.max(0, u.elec_cur - ePrev);
                    const wUse = Math.max(0, u.water_cur - wPrev);

                    // If a regular reading is recorded for the tenant's move-in month and the
                    // initial record was overwritten, surface the initial value (preserved in
                    // u.elec_prev / u.water_prev) as a synthesized "เริ่มต้น" row underneath
                    // this monthly row — that way the user sees BOTH the move-in baseline
                    // and the monthly usage, matching the schema-less design.
                    const showSynthInit = tenant
                      && u.year === tenant.sinceY && u.month === tenant.sinceM
                      && !initRec
                      && (u.elec_prev != null || u.water_prev != null);

                    const hKey = `${u.year}-${u.month}`;
                    const isOpen = selHistM === hKey;

                    // Billing detail for this specific month
                    const bk = `${u.room_id}|${u.year}|${u.month}`;
                    const bm = billing.monthly?.[bk] || {};
                    const hEMode = bm.elecMode  || "metered";
                    const hWMode = bm.waterMode || "metered";
                    const hEFlat = bm.elecFlat  ?? billing.defaultElecFlat  ?? 0;
                    const hWFlat = bm.waterFlat ?? billing.defaultWaterFlat ?? 0;
                    const hEAmt  = hEMode === "flat" ? hEFlat : eUse * utilRate.electric;
                    const hWAmt  = hWMode === "flat" ? hWFlat : wUse * utilRate.water;

                    return (
                    <Fragment key={u.id}>
                      <div onClick={() => setSelHistM(isOpen ? null : hKey)}
                        style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr 1fr 1fr",
                          padding: "12px 14px",
                          borderBottom: isOpen ? "none" : (notLast || showSynthInit) ? "1px solid var(--line)" : "none",
                          background: isOpen ? "oklch(0.97 0.015 240)" : "var(--surface)",
                          fontSize: 13, alignItems: "center", cursor: "pointer",
                          transition: "background .15s" }}>
                        <span style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                          {dl(u.year, u.month)}
                          <span style={{ fontSize: 10, color: "var(--ink-3)", transform: isOpen ? "rotate(90deg)" : "none", display: "inline-block", transition: "transform .15s" }}>▶</span>
                        </span>
                        <span className="num" style={{ color: "var(--ink-3)" }}>{ePrev} → <b style={{ color: "var(--ink)" }}>{u.elec_cur}</b></span>
                        <span className="num" style={{ fontWeight: 600, color: "oklch(0.55 0.15 80)" }}>{hEMode === "flat" ? "—" : eUse}</span>
                        <span className="num" style={{ color: "var(--ink-3)" }}>{wPrev} → <b style={{ color: "var(--ink)" }}>{u.water_cur}</b></span>
                        <span className="num" style={{ fontWeight: 600, color: "oklch(0.55 0.13 230)" }}>{hWMode === "flat" ? "—" : wUse}</span>
                        <span className="num" style={{ textAlign: "right", fontWeight: 700 }}>{baht(hEAmt + hWAmt)}</span>
                      </div>

                      {isOpen && (
                        <div style={{ padding: "12px 14px 14px", background: "oklch(0.97 0.015 240)",
                          borderBottom: notLast ? "1px solid var(--line)" : "none",
                          borderTop: "1px dashed oklch(0.88 0.03 240)" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>

                            {/* ไฟฟ้า */}
                            <div style={{ background: "oklch(0.97 0.04 80)", borderRadius: 10, padding: "12px 14px",
                              border: "1.5px solid oklch(0.88 0.07 80)" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                                <span style={{ fontSize: 14 }}>⚡</span>
                                <span style={{ fontSize: 12.5, fontWeight: 700, color: "oklch(0.50 0.13 80)" }}>ค่าไฟฟ้า</span>
                                {hEMode === "flat" && (
                                  <span style={{ marginLeft: "auto", fontSize: 10.5, background: "oklch(0.88 0.09 80)",
                                    color: "oklch(0.42 0.12 80)", padding: "1px 8px", borderRadius: 100, fontWeight: 700 }}>
                                    เหมาจ่าย
                                  </span>
                                )}
                              </div>
                              {hEMode === "flat" ? (
                                <div className="num" style={{ fontSize: 14, color: "var(--ink-2)" }}>
                                  คงที่ <span style={{ fontWeight: 800, color: "oklch(0.42 0.12 80)" }}>{baht(hEFlat)}</span>
                                </div>
                              ) : (
                                <div className="num" style={{ fontSize: 13, color: "var(--ink-2)" }}>
                                  {eUse} หน่วย × {baht(utilRate.electric)}{" "}
                                  <span style={{ fontWeight: 800, color: "oklch(0.42 0.12 80)" }}>= {baht(hEAmt)}</span>
                                </div>
                              )}
                            </div>

                            {/* น้ำ */}
                            <div style={{ background: "oklch(0.97 0.025 230)", borderRadius: 10, padding: "12px 14px",
                              border: "1.5px solid oklch(0.88 0.05 230)" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                                <span style={{ fontSize: 14 }}>💧</span>
                                <span style={{ fontSize: 12.5, fontWeight: 700, color: "oklch(0.42 0.13 230)" }}>ค่าน้ำประปา</span>
                                {hWMode === "flat" && (
                                  <span style={{ marginLeft: "auto", fontSize: 10.5, background: "oklch(0.88 0.06 230)",
                                    color: "oklch(0.32 0.12 230)", padding: "1px 8px", borderRadius: 100, fontWeight: 700 }}>
                                    เหมาจ่าย
                                  </span>
                                )}
                              </div>
                              {hWMode === "flat" ? (
                                <div className="num" style={{ fontSize: 14, color: "var(--ink-2)" }}>
                                  คงที่ <span style={{ fontWeight: 800, color: "oklch(0.32 0.12 230)" }}>{baht(hWFlat)}</span>
                                </div>
                              ) : (
                                <div className="num" style={{ fontSize: 13, color: "var(--ink-2)" }}>
                                  {wUse} หน่วย × {baht(utilRate.water)}{" "}
                                  <span style={{ fontWeight: 800, color: "oklch(0.32 0.12 230)" }}>= {baht(hWAmt)}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div style={{ marginTop: 10, padding: "8px 12px", background: "white",
                            borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600 }}>รวมทั้งหมด</span>
                            <span className="num" style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>{baht(hEAmt + hWAmt)}</span>
                          </div>
                        </div>
                      )}
                      {showSynthInit && (
                        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr 1fr 1fr",
                          padding: "10px 14px",
                          borderBottom: notLast ? "1px solid var(--line)" : "none",
                          background: "oklch(0.975 0.015 145)", fontSize: 13, alignItems: "center" }}>
                          <span style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                            {dl(u.year, u.month)}
                            <span style={{ fontSize: 10, fontWeight: 700, background: "oklch(0.88 0.08 145)",
                              color: "oklch(0.35 0.1 145)", borderRadius: 5, padding: "2px 6px" }}>เริ่มต้น</span>
                          </span>
                          <span className="num" style={{ color: "var(--ink-3)" }}>— → <b style={{ color: "var(--ink)" }}>{u.elec_prev ?? 0}</b></span>
                          <span style={{ color: "var(--ink-4)", fontSize: 11 }}>ฐาน</span>
                          <span className="num" style={{ color: "var(--ink-3)" }}>— → <b style={{ color: "var(--ink)" }}>{u.water_prev ?? 0}</b></span>
                          <span style={{ color: "var(--ink-4)", fontSize: 11 }}>ฐาน</span>
                          <span className="num" style={{ textAlign: "right", color: "var(--ink-3)", fontSize: 11 }}>—</span>
                        </div>
                      )}
                    </Fragment>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : selRoom && !tenant && (selRoom.lastElecMeter != null || selRoom.lastWaterMeter != null) ? (
            // ── Vacant room with last meter data — show read-only summary ──
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 18, padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div className="num" style={{ width: 48, height: 48, borderRadius: 13, background: "var(--surface-2)",
                    color: "var(--ink-3)", display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", fontSize: 14, fontWeight: 700, border: "1px dashed var(--line-2)" }}>
                    {selRoom.id}
                    <span style={{ fontSize: 8, marginTop: 1 }}>ชั้น {selRoom.floor}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 17, fontWeight: 700, color: "var(--ink-2)" }}>ห้อง {selRoom.id} — ว่าง</div>
                    <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 2 }}>
                      มิเตอร์ล่าสุดจดเมื่อ {selRoom.lastMeterYear != null ? dl(selRoom.lastMeterYear, selRoom.lastMeterMonth) : "—"}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 18, padding: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase",
                  letterSpacing: 1, marginBottom: 14 }}>เลขมิเตอร์ล่าสุด (ก่อนย้ายออก)</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ background: "oklch(0.97 0.04 80)", border: "1.5px solid oklch(0.88 0.07 80)",
                    borderRadius: 14, padding: "16px 18px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "oklch(0.48 0.13 80)", marginBottom: 6 }}>⚡ มิเตอร์ไฟ</div>
                    <div className="num" style={{ fontSize: 32, fontWeight: 800, color: "oklch(0.38 0.15 80)", lineHeight: 1 }}>
                      {selRoom.lastElecMeter ?? 0}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 6 }}>หน่วย</div>
                  </div>
                  <div style={{ background: "oklch(0.97 0.025 230)", border: "1.5px solid oklch(0.88 0.05 230)",
                    borderRadius: 14, padding: "16px 18px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "oklch(0.40 0.13 230)", marginBottom: 6 }}>💧 มิเตอร์น้ำ</div>
                    <div className="num" style={{ fontSize: 32, fontWeight: 800, color: "oklch(0.30 0.13 230)", lineHeight: 1 }}>
                      {selRoom.lastWaterMeter ?? 0}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 6 }}>หน่วย</div>
                  </div>
                </div>
                <div style={{ marginTop: 14, padding: "10px 14px", background: "var(--surface-2)",
                  borderRadius: 10, fontSize: 12, color: "var(--ink-3)", lineHeight: 1.5 }}>
                  💡 เมื่อมีผู้เช่าใหม่เข้าพัก ระบบจะใช้ค่านี้เป็นเลขมิเตอร์เริ่มต้นอัตโนมัติ
                </div>
              </div>

              {roomUtils.filter(u => !u.isInitial).length > 0 && (
                <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 18, padding: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>ประวัติมิเตอร์ย้อนหลัง</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {roomUtils.filter(u => !u.isInitial).slice(0, 4).map((u, i, arr) => (
                      <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "8px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--line)" : "none" }}>
                        <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{dl(u.year, u.month)}</span>
                        <div style={{ textAlign: "right" }}>
                          <div className="num" style={{ fontSize: 12.5, fontWeight: 700,
                            display: "flex", gap: 8, justifyContent: "flex-end" }}>
                            <span style={{ color: "oklch(0.48 0.13 80)" }}>⚡ {u.elec_cur}</span>
                            <span style={{ color: "oklch(0.40 0.13 230)" }}>💧 {u.water_cur}</span>
                          </div>
                          <div className="num" style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 1 }}>
                            ใช้ {u.elec_use + u.water_use} หน่วย · {baht(u.elec_amount + u.water_amount)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 18, padding: 60, textAlign: "center", color: "var(--ink-3)" }}>
              เลือกห้องเพื่อดูข้อมูล
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MeterInput({ label, unit, prev, value, onChange, use, amount, color, bg, icon, flatMode, flatLabel }) {
  return (
    <div style={{ background: "white", border: `1.5px solid ${flatMode ? color + "55" : "var(--line)"}`, borderRadius: 14, padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
        <div style={{ flex: 1, fontSize: 13.5, fontWeight: 700 }}>{label}</div>
        {flatMode && (
          <span style={{ fontSize: 10.5, fontWeight: 700, color, background: bg, padding: "2px 8px", borderRadius: 100 }}>
            {flatLabel}
          </span>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <div style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 600 }}>เลขก่อน</div>
          <div className="num" style={{ padding: "10px 12px", background: "var(--surface-2)", borderRadius: 9, fontSize: 16, fontWeight: 700, color: "var(--ink-3)", marginTop: 4 }}>{prev}</div>
        </div>
        <div>
          <div style={{ fontSize: 10.5, color, fontWeight: 700 }}>เลขล่าสุด</div>
          <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} style={{
            width: "100%", padding: "10px 12px", borderRadius: 9, border: `1.5px solid ${color}`,
            background: "white", marginTop: 4, fontSize: 16, fontWeight: 700, color: "var(--ink)",
            outline: "none", boxSizing: "border-box", fontFamily: "var(--font-num)", fontVariantNumeric: "tabular-nums",
          }}/>
        </div>
      </div>
      <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "8px 12px", background: bg, borderRadius: 9 }}>
        {flatMode
          ? <span style={{ fontSize: 12, color, fontWeight: 600 }}>ราคาเหมาจ่าย</span>
          : <span className="num" style={{ fontSize: 12, fontWeight: 600, color }}>ใช้ {use != null && use > 0 ? use : 0} {unit}</span>
        }
        <span className="num" style={{ fontSize: 14, fontWeight: 700, color }}>{baht(amount)}</span>
      </div>
    </div>
  );
}

// ─── SHARED MODAL BASE ───────────────────────────────────────────────────
function Modal({ title, onClose, children, width = 500 }) {
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20,
    }}>
      <div style={{ background: "var(--surface)", borderRadius: 20, width: "100%", maxWidth: width,
        boxShadow: "var(--sh-3)", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--line)",
          display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{title}</div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer",
            color: "var(--ink-3)", padding: 4, display: "flex", alignItems: "center" }}>
            <IconX size={18}/>
          </button>
        </div>
        <div style={{ padding: "20px 22px", overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
}

function ModalField({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-2)", marginBottom: 5 }}>{label}</div>
      {children}
    </div>
  );
}

const modalInputStyle = { width: "100%", padding: "9px 12px", border: "1px solid var(--line)",
  borderRadius: 10, fontSize: 13.5, outline: "none", background: "var(--bg)", boxSizing: "border-box", fontFamily: "inherit" };

const modalSelectStyle = { ...modalInputStyle, cursor: "pointer" };

function ModalActions({ onClose, onSave, saving, disabled }) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
      <button onClick={onClose} style={{ flex: 1, padding: "10px 0", borderRadius: 10,
        border: "1px solid var(--line)", background: "transparent", cursor: "pointer",
        fontSize: 13.5, fontWeight: 600, color: "var(--ink-2)" }}>ยกเลิก</button>
      <button onClick={onSave} disabled={disabled || saving} style={{ flex: 2, padding: "10px 0", borderRadius: 10,
        border: "none", background: disabled ? "var(--line)" : "var(--brand)",
        color: "white", cursor: disabled ? "default" : "pointer", fontSize: 13.5, fontWeight: 700, transition: "background .2s" }}>
        {saving ? "กำลังบันทึก..." : "บันทึก"}
      </button>
    </div>
  );
}

// ─── ADD TENANT MODAL — bridge to faithful design ────────────────────────
function AddTenantModal({ onClose, initialRoom }) {
  const { addTenant, saveInitialReading } = useData();
  return <NewAddTenantModal onClose={onClose} initialRoom={initialRoom} onSubmit={async (t) => {
    const res = await addTenant({
      id: t.id, name: t.name, room_id: t.room, phone: t.phone,
      since_y: t.sinceY, since_m: t.sinceM,
      username: t.username, password: t.password,
      // Personal info & docs
      email: t.email, address: t.address,
      idCardNumber: t.idCardNumber, idCardImage: t.idCardImage,
      emergencyName: t.emergencyName, emergencyPhone: t.emergencyPhone,
    });
    if (res?.ok === false) return res; // pass error back to modal — modal stays open and shows error
    // Save initial meter reading (as baseline "seed" record for the move-in month)
    if (t.room && (t.initElec != null || t.initWater != null)) {
      saveInitialReading({
        room_id: t.room,
        year: t.sinceY,
        month: t.sinceM,
        elec_cur: t.initElec ?? 0,
        water_cur: t.initWater ?? 0,
      });
    }
    onClose();
    return res;
  }}/>;
}

// ─── ADD ROOM MODAL — bridge to faithful design ──────────────────────────
function AddRoomModal({ onClose }) {
  const { addRoom } = useData();
  return <NewAddRoomModal onClose={onClose} onSubmit={(r) => { addRoom(r); onClose(); }}/>;
}

// ─── SETTINGS MODAL — bridge to faithful design ──────────────────────────
function SettingsModal({ onClose }) {
  return <NewSettingsModal onClose={onClose}/>;
}

// Legacy SettingsModal removed — replaced by NewSettingsModal from modals.jsx
