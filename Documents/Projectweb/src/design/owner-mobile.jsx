// Mobile · Owner Dashboard — ported from design-bundle/project/owner-mobile.jsx
import { useState } from "react";
import { DI } from "./icons";
import { MONTHS_TH, MONTHS_FULL, CUR_Y, CUR_M, dl, dld, baht } from "./seed";
import { useData } from "./DataContext";
import {
  Avatar, AddTenantModal, EditTenantModal, SettingsModal,
  BulkMeterModal, MonthDetailModal, ReceiptModal,
} from "./modals";

const {
  IconBuilding, IconChart, IconUsers, IconSettings, IconCard,
  IconWrench, IconSparkle, IconTrend, IconArrowRight, IconArrowLeft,
  IconChevR, IconSearch, IconPlus, IconEdit, IconLogout, IconTrash, IconX,
} = DI;

export function OwnerMobile({ initialTab = "overview", staffRole = "admin", staffName, onLogout }) {
  const { owner, addTenant, updateTenant, moveTenant, tenants, rooms, saveInitialReading } = useData();
  const [tab, setTab] = useState(initialTab);
  const [subPage, setSubPage] = useState(null); // "slips" | "repairs" | "meterroom" | null
  const [addOpen, setAddOpen] = useState(false);
  const [addTenantRoom, setAddTenantRoom] = useState(null); // pre-selected room for new tenant
  const [editId, setEditId] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [monthKey, setMonthKey] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [tenantSel, setTenantSel] = useState(null);

  // Meter-only staff role: dedicated screen that ONLY exposes meter readings.
  if (staffRole === "meter") {
    return <MeterOnlyView staffName={staffName} owner={owner} onLogout={onLogout}/>;
  }

  const editingTenant = editId ? tenants.find(t => t.id === editId) : null;
  const detailTenant = tenantSel ? tenants.find(t => t.id === tenantSel) : null;

  const handleTabChange = (t) => { setTab(t); setSubPage(null); setRoomId(null); setTenantSel(null); };

  // Sub-pages override tab content
  if (subPage === "slips") {
    return (
      <div style={{ width: "100%", minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
        <MobileTopBar owner={owner} onOpenSettings={() => setSettingsOpen(true)} onLogout={onLogout}/>
        <div style={{ flex: 1, overflow: "auto" }}>
          <MSlipsPage owner={owner} onBack={() => setSubPage(null)}/>
        </div>
        {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)}/>}
      </div>
    );
  }
  if (subPage === "repairs") {
    return (
      <div style={{ width: "100%", minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
        <MobileTopBar owner={owner} onOpenSettings={() => setSettingsOpen(true)} onLogout={onLogout}/>
        <div style={{ flex: 1, overflow: "auto" }}>
          <MRepairsPage onBack={() => setSubPage(null)}/>
        </div>
        {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)}/>}
      </div>
    );
  }
  if (subPage === "flatrate") {
    return (
      <div style={{ width: "100%", minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
        <MobileTopBar owner={owner} onOpenSettings={() => setSettingsOpen(true)} onLogout={onLogout}/>
        <div style={{ flex: 1, overflow: "auto" }}>
          <MFlatRatePage onBack={() => setSubPage(null)}/>
        </div>
        {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)}/>}
      </div>
    );
  }
  if (subPage === "utilhistory") {
    return (
      <div style={{ width: "100%", minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
        <MobileTopBar owner={owner} onOpenSettings={() => setSettingsOpen(true)} onLogout={onLogout}/>
        <div style={{ flex: 1, overflow: "auto" }}>
          <MUtilHistoryPage onBack={() => setSubPage(null)}/>
        </div>
        {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)}/>}
      </div>
    );
  }

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "var(--bg)", display: "flex",
      flexDirection: "column", position: "relative", paddingBottom: 76 }}>

      <MobileTopBar tab={tab} owner={owner} onOpenSettings={() => setSettingsOpen(true)} onLogout={onLogout}/>

      <div style={{ flex: 1, overflow: "auto", padding: "12px 16px 90px", background: "var(--bg)" }}
        className="screen-in" key={tab}>
        {tab === "overview" && <MOverview owner={owner}
          onAddTenant={() => setAddOpen(true)} setTab={handleTabChange}
          onPickMonth={(k) => setMonthKey(k)} onBulk={() => setBulkOpen(true)}
          onSlips={() => setSubPage("slips")}/>}
        {tab === "tenants"  && (detailTenant
          ? <MTenantDetail tenant={detailTenant} onBack={() => setTenantSel(null)} onEdit={() => setEditId(detailTenant.id)}/>
          : <MTenantsList onPick={(id) => setTenantSel(id)} onAdd={() => setAddOpen(true)}/>)}
        {tab === "rooms"    && (roomId
          ? <MRoomDetail roomId={roomId} onBack={() => setRoomId(null)}
              onMove={(tid, to) => { moveTenant(tid, to); setRoomId(to); }}
              onAddTenant={(rid) => { setAddTenantRoom(rid); setAddOpen(true); }}/>
          : <MRoomsList onPick={(rid) => setRoomId(rid)}/>)}
        {tab === "more"     && <MMorePage onBulk={() => setBulkOpen(true)} setTab={handleTabChange}
          onPickMonth={(k) => setMonthKey(k)} onOpenSettings={() => setSettingsOpen(true)}
          onLogout={onLogout} onSlips={() => setSubPage("slips")} onRepairs={() => setSubPage("repairs")}
          onFlatRate={() => setSubPage("flatrate")} onUtilHistory={() => setSubPage("utilhistory")}/>}
      </div>

      <MobileTabBar tab={tab} setTab={handleTabChange} onMeter={() => setBulkOpen(true)}/>

      {addOpen && <AddTenantModal onClose={() => { setAddOpen(false); setAddTenantRoom(null); }}
        initialRoom={addTenantRoom}
        onSubmit={(t) => {
          addTenant({
            id: t.id, name: t.name, room_id: t.room, phone: t.phone,
            since_y: t.sinceY, since_m: t.sinceM,
            username: t.username, password: t.password,
            email: t.email, address: t.address,
            idCardNumber: t.idCardNumber, idCardImage: t.idCardImage,
            emergencyName: t.emergencyName, emergencyPhone: t.emergencyPhone,
          });
          // Save initial meter reading if user provided one
          if (t.room && (t.initElec != null || t.initWater != null)) {
            saveInitialReading({
              room_id: t.room, year: t.sinceY, month: t.sinceM,
              elec_cur: t.initElec ?? 0, water_cur: t.initWater ?? 0,
            });
          }
          setAddOpen(false); setAddTenantRoom(null);
        }}/>}
      {editingTenant && <EditTenantModal tenant={editingTenant}
        onClose={() => setEditId(null)}
        onSave={(patch) => { updateTenant(editingTenant.id, patch); setEditId(null); }}/>}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)}/>}
      {bulkOpen && <BulkMeterModal onClose={() => setBulkOpen(false)}/>}
      {monthKey && <MonthDetailModal monthKey={monthKey} onClose={() => setMonthKey(null)}/>}
    </div>
  );
}

function MobileTopBar({ owner, onOpenSettings, onLogout }) {
  return (
    <div style={{ padding: "14px 16px 12px", background: "var(--surface)", borderBottom: "1px solid var(--line)",
      display: "flex", alignItems: "center", gap: 10, position: "sticky", top: 0, zIndex: 10 }}>
      <div style={{ width: 36, height: 36, borderRadius: 11, background: "var(--brand)",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <IconBuilding size={18} stroke="white"/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600 }}>{owner.dorm}</div>
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.2 }}>{owner.displayName}</div>
      </div>
      <button onClick={onOpenSettings} style={{ width: 38, height: 38, borderRadius: 11, border: "1px solid var(--line)",
        background: "var(--surface)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <IconSettings size={16} stroke="var(--ink-2)"/>
      </button>
      <button onClick={onLogout} title="ออกจากระบบ" style={{ width: 38, height: 38, borderRadius: 11, border: "1px solid var(--line)",
        background: "var(--surface)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <IconLogout size={16} stroke="var(--ink-3)"/>
      </button>
    </div>
  );
}

function MobileTabBar({ tab, setTab, onMeter }) {
  const tabs = [
    { id: "overview", label: "ภาพรวม",  icon: IconChart },
    { id: "tenants",  label: "ผู้เช่า",  icon: IconUsers },
    { id: "rooms",    label: "ห้องพัก",  icon: IconBuilding },
    { id: "meter",    label: "มิเตอร์",  icon: IconSparkle, action: onMeter },
    { id: "more",     label: "เพิ่มเติม", icon: IconSettings },
  ];
  return (
    <div style={{ position: "fixed", left: 0, right: 0, bottom: 0,
      background: "var(--surface)", borderTop: "1px solid var(--line)",
      padding: "6px 4px 14px", display: "flex", justifyContent: "space-around",
      boxShadow: "0 -4px 14px -10px rgba(0,0,0,0.1)", zIndex: 50 }}>
      {tabs.map(t => {
        const Ic = t.icon;
        const active = !t.action && tab === t.id;
        return (
          <button key={t.id} onClick={() => t.action ? t.action() : setTab(t.id)} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            border: "none", background: "transparent", cursor: "pointer", padding: "5px 2px",
            color: active ? "var(--brand)" : "var(--ink-3)",
          }}>
            <Ic size={19} stroke={active ? "var(--brand)" : "var(--ink-3)"} strokeWidth={active ? 2.1 : 1.7}/>
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function MOverview({ owner, onAddTenant, setTab, onPickMonth, onBulk, onSlips }) {
  const { tenants, rooms, payments, repairs, slips, curY, curM } = useData();
  const pendingSlips = slips.filter(s => s.status === "pending");
  const occupied = rooms.filter(r => r.status === "ไม่ว่าง").length;
  const occRate = rooms.length ? Math.round(occupied / rooms.length * 100) : 0;
  const monthRev = payments.filter(p => p.year === curY && p.month === curM && p.status === "ชำระแล้ว").reduce((s, p) => s + p.amount, 0);
  const monthDue = payments.filter(p => p.year === curY && p.month === curM && p.status === "รอชำระ").reduce((s, p) => s + p.amount, 0);
  const pendingCount = payments.filter(p => p.year === curY && p.month === curM && p.status === "รอชำระ").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div style={{ fontSize: 13, color: "var(--ink-3)" }}>สวัสดีตอนเช้า ☀️</div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.3, marginTop: 2 }}>{owner.displayName}</div>
        <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 4 }}>
          <span style={{ color: "var(--brand)", fontWeight: 700 }}>{pendingCount} ห้อง</span> ค้างชำระ ·{" "}
          <span style={{ color: "var(--warn)", fontWeight: 700 }}>{repairs.filter(r => r.status !== "เสร็จแล้ว").length} ซ่อม</span> รอ
        </div>
      </div>

      {pendingSlips.length > 0 && (
        <div className="lift" style={{
          background: "linear-gradient(105deg, var(--brand), var(--brand-2))", color: "white",
          borderRadius: 14, padding: "14px 16px", cursor: "pointer",
          boxShadow: "0 14px 28px -16px var(--brand)", display: "flex", alignItems: "center", gap: 12,
        }} onClick={onSlips}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(255,255,255,0.22)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <IconCard size={18} stroke="white"/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{pendingSlips.length} สลิปรออนุมัติ</div>
            <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>
              รวม {baht(pendingSlips.reduce((s, x) => s + x.amount, 0))} · กดเพื่อตรวจ
            </div>
          </div>
          <IconArrowRight size={16} stroke="white"/>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <MKpi label="รายได้เดือนนี้" value={baht(monthRev)} tone="brand" sub="+12% vs เดือนก่อน"/>
        <MKpi label="ค้างชำระ" value={baht(monthDue)} tone="warn" sub={`${pendingCount} ห้อง`}/>
        <MKpi label="อัตราเข้าพัก" value={`${occRate}%`} tone="sage" sub={`${occupied}/${rooms.length} ห้อง`}/>
        <MKpi label="แจ้งซ่อม" value={repairs.filter(r => r.status !== "เสร็จแล้ว").length} tone="lilac" sub="ค้างดำเนินการ"/>
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase",
          letterSpacing: 1, marginBottom: 8 }}>เมนูทางลัด</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          <QuickBtn icon={IconPlus} label="เพิ่มผู้เช่า" onClick={onAddTenant}/>
          <QuickBtn icon={IconSparkle} label="จดมิเตอร์" onClick={onBulk}/>
          <QuickBtn icon={IconCard} label="อนุมัติสลิป" onClick={onSlips}/>
        </div>
      </div>

      <div style={{ background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)", padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700 }}>ค้างชำระ · {MONTHS_TH[curM]}</div>
          <button onClick={() => setTab("tenants")} style={{ background: "transparent", border: "none",
            color: "var(--brand)", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>ดูทั้งหมด →</button>
        </div>
        {tenants.filter(t => payments.find(p => p.room_id === t.room && p.year === curY && p.month === curM && p.status === "รอชำระ"))
          .slice(0, 3).map(t => {
            const room = rooms.find(r => r.id === t.room);
            return (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
                borderTop: "1px solid var(--line)" }}>
                <Avatar name={t.name} size={32}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)" }}>ห้อง {t.room}</div>
                </div>
                <div className="num" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--brand)" }}>{baht(room?.price || 0)}</div>
              </div>
            );
          })}
      </div>

      <div style={{ background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)", padding: 14 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 10 }}>รายงานรายเดือน</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[0, 1, 2].map(i => {
            const m = (curM - i + 12) % 12;
            const y = curM - i < 0 ? curY - 1 : curY;
            const rev = payments.filter(p => p.year === y && p.month === m && p.status === "ชำระแล้ว").reduce((s, p) => s + p.amount, 0);
            return (
              <button key={i} onClick={() => onPickMonth({ year: y, month: m })} style={{
                background: "var(--surface-2)", border: "none", borderRadius: 10, padding: "10px 12px",
                display: "flex", alignItems: "center", gap: 10, cursor: "pointer", width: "100%", textAlign: "left",
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{MONTHS_FULL[m]}</div>
                <div style={{ flex: 1 }}/>
                <div className="num" style={{ fontSize: 13, fontWeight: 700 }}>{baht(rev)}</div>
                <IconChevR size={14} stroke="var(--ink-3)"/>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MKpi({ label, value, sub, tone }) {
  const bg = { brand: "var(--brand-soft)", warn: "var(--warn-soft)", sage: "var(--sage-soft)", lilac: "var(--lilac-soft)" }[tone];
  const fg = { brand: "var(--brand-ink)", warn: "var(--warn)", sage: "var(--sage-ink)", lilac: "var(--lilac)" }[tone];
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: 14, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -10, right: -10, width: 46, height: 46, borderRadius: "50%", background: bg, opacity: 0.5 }}/>
      <div style={{ position: "relative" }}>
        <div style={{ fontSize: 10.5, fontWeight: 600, color: "var(--ink-3)" }}>{label}</div>
        <div className="num" style={{ fontSize: 18, fontWeight: 700, marginTop: 6, letterSpacing: -0.3 }}>{value}</div>
        <div style={{ fontSize: 10.5, color: fg, fontWeight: 600, marginTop: 4 }}>{sub}</div>
      </div>
    </div>
  );
}

function QuickBtn({ icon: Ic, label, onClick }) {
  return (
    <button onClick={onClick} className="lift" style={{
      background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12,
      padding: "12px 6px", cursor: "pointer", display: "flex", flexDirection: "column",
      alignItems: "center", gap: 6,
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--brand-soft)",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Ic size={17} stroke="var(--brand)"/>
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-2)" }}>{label}</span>
    </button>
  );
}

function MTenantsList({ onPick, onAdd }) {
  const { tenants, rooms, payments, curY, curM } = useData();
  const [q, setQ] = useState("");
  const list = tenants.filter(t => t.name.includes(q) || (t.room || "").toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1, display: "flex", gap: 8, alignItems: "center", background: "var(--surface)",
          borderRadius: 11, padding: "9px 12px", border: "1px solid var(--line)" }}>
          <IconSearch size={15} stroke="var(--ink-3)"/>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="ค้นหาชื่อ หรือเลขห้อง" style={{
            flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 13, color: "var(--ink)",
            fontFamily: "var(--font-thai)",
          }}/>
        </div>
        <button onClick={onAdd} style={{ background: "var(--brand)", color: "white", border: "none", borderRadius: 11,
          padding: "9px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
          <IconPlus size={15} stroke="white"/>
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {list.map(t => {
          const room = rooms.find(r => r.id === t.room);
          const pay = payments.find(p => p.room_id === t.room && p.year === curY && p.month === curM);
          const paid = pay?.status === "ชำระแล้ว";

          // Determine tenant status: active (has room) / evicted / no-room
          const hasRoom  = !!t.room;
          const isEvicted = !!t.evicted;
          // Color palette per status
          // active   → brand (orange)
          // evicted  → warm red
          // no-room  → cool gray-blue
          const badgeBg = hasRoom   ? "var(--brand)"             : isEvicted ? "oklch(0.55 0.16 25)"  : "oklch(0.65 0.04 250)";
          const badgeFg = "white";
          const badgeBd = "transparent";
          const roomLabel = hasRoom ? t.room : "—";

          return (
            <button key={t.id} onClick={() => onPick(t.id)} className="lift" style={{
              display: "flex", alignItems: "center", gap: 12, padding: 12,
              background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12,
              cursor: "pointer", textAlign: "left", width: "100%",
              opacity: hasRoom ? 1 : 0.92,
            }}>
              {/* Room number badge (replaces avatar) */}
              <div className="num" style={{
                width: 42, height: 42, borderRadius: 11,
                background: badgeBg, color: badgeFg, border: `1px solid ${badgeBd}`,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700, flexShrink: 0,
              }}>
                {roomLabel}
                {hasRoom && room?.floor != null && (
                  <span style={{ fontSize: 8, fontWeight: 500, opacity: 0.85, marginTop: 1 }}>ชั้น {room.floor}</span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap",
                    overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>{t.name}</span>
                  {!hasRoom && (
                    <span style={{
                      background: isEvicted ? "oklch(0.94 0.05 25)"  : "oklch(0.94 0.025 250)",
                      color:      isEvicted ? "oklch(0.48 0.16 25)"  : "oklch(0.45 0.08 250)",
                      padding: "1px 7px", borderRadius: 100, fontSize: 9.5, fontWeight: 700, flexShrink: 0,
                    }}>
                      {isEvicted ? "เลิกเช่า" : "ไม่มีห้อง"}
                    </span>
                  )}
                </div>
                <div className="num" style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>
                  {hasRoom
                    ? <>ห้อง {t.room} · {baht(room?.price || 0)}</>
                    : isEvicted && t.evictedY != null
                      ? <>ห้องเดิม {t.prevRoom || "—"} · ออก {dl(t.evictedY, t.evictedM)}</>
                      : <>ยังไม่ได้กำหนดห้อง</>}
                </div>
              </div>
              {hasRoom ? (
                <span style={{ background: paid ? "var(--ok-soft)" : "var(--warn-soft)",
                  color: paid ? "var(--ok)" : "var(--warn)", fontSize: 10.5, fontWeight: 700,
                  padding: "3px 9px", borderRadius: 100, whiteSpace: "nowrap" }}>{paid ? "✓ ชำระ" : "⏳ ค้าง"}</span>
              ) : (
                <span style={{ background: "var(--surface-2)", color: "var(--ink-4)", fontSize: 10.5, fontWeight: 700,
                  padding: "3px 9px", borderRadius: 100, whiteSpace: "nowrap" }}>—</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MTenantDetail({ tenant, onBack, onEdit }) {
  const { rooms, payments, recordPayment, evictTenant, reactivateTenant, computePaymentTotal, curY, curM } = useData();
  // Compute full bill (rent + electricity + water) per payment row
  const payTotal = (p) => {
    const b = computePaymentTotal ? computePaymentTotal(p.room_id, p.year, p.month) : null;
    return b ? b.total : (p.amount || 0);
  };
  const [receiptPay, setReceiptPay]   = useState(null);
  const [confirmPay, setConfirmPay]   = useState(null);
  const [confirmEvict, setConfirmEvict] = useState(false);
  const today = new Date();
  const [evictDay, setEvictDay]   = useState(today.getDate());
  const [evictMonth, setEvictMonth] = useState(today.getMonth());
  const [evictYear, setEvictYear]  = useState(today.getFullYear());
  const isEvicted = !!tenant.evicted;
  const room = rooms.find(r => r.id === tenant.room);

  // Full timeline synthesis (same as desktop TenantDetail)
  const pays = (() => {
    if (!room || tenant.sinceY == null || tenant.sinceM == null) {
      return payments.filter(p => p.room_id === tenant.room)
        .sort((a,b) => b.year !== a.year ? b.year - a.year : b.month - a.month).slice(0, 8);
    }
    const existing = payments.filter(p => p.room_id === tenant.room);
    const byKey = new Map(existing.map(p => [`${p.year}|${p.month}`, p]));
    const out = [];
    let y = +tenant.sinceY, m = +tenant.sinceM, vid = -1;
    while (y < curY || (y === curY && m <= curM)) {
      const hit = byKey.get(`${y}|${m}`);
      out.push(hit || { id: `virt-${vid--}`, room_id: tenant.room, year: y, month: m, amount: room.price, status: "รอชำระ", paid_at: null, _virtual: true });
      m++; if (m > 11) { m = 0; y++; }
    }
    return out.reverse().slice(0, 10);
  })();

  return (
    <div>
      <button onClick={onBack} style={{ background: "transparent", border: "none", color: "var(--ink-2)",
        cursor: "pointer", fontSize: 12.5, fontWeight: 700, padding: 0, marginBottom: 14,
        display: "flex", alignItems: "center", gap: 4 }}>
        <IconArrowLeft size={14} stroke="var(--ink-2)"/> กลับ
      </button>

      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: 16,
        display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
        <Avatar name={tenant.name} size={56}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{tenant.name}</div>
          <div className="num" style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>
            ห้อง {tenant.room} · {room?.type}
          </div>
          <div className="num" style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>
            {tenant.phone} · {dld(tenant.sinceDay || 1, tenant.sinceY, tenant.sinceM)}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        <button onClick={onEdit} style={{ background: "var(--ink)", color: "white", border: "none", borderRadius: 11,
          padding: "11px 0", fontWeight: 700, fontSize: 13, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <IconEdit size={14} stroke="white"/> แก้ไข
        </button>
        {(() => {
          const pending = pays.find(p => p.status === "รอชำระ");
          return (
            <button
              onClick={() => pending && setConfirmPay(pending)}
              disabled={!pending}
              style={{
                background: pending ? "var(--brand)" : "var(--line)",
                color: pending ? "white" : "var(--ink-3)",
                border: "none", borderRadius: 11,
                padding: "11px 0", fontWeight: 700, fontSize: 13,
                cursor: pending ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                opacity: pending ? 1 : 0.55,
              }}>
              <IconCard size={14} stroke={pending ? "white" : "var(--ink-3)"}/>
              บันทึกชำระ
            </button>
          );
        })()}
      </div>

      {/* Evict / Re-rent button — only for active tenants with a room */}
      {!isEvicted && tenant.room && (
        <button onClick={() => setConfirmEvict(true)} style={{
          width: "100%", background: "var(--surface)", color: "var(--danger)",
          border: "1px solid var(--danger-soft)", borderRadius: 11,
          padding: "10px 0", fontWeight: 700, fontSize: 12.5, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 12,
        }}>
          <IconX size={13} stroke="var(--danger)"/> เลิกเช่า
        </button>
      )}
      {isEvicted && (
        <div style={{ background: "oklch(0.94 0.05 25)", border: "1px solid oklch(0.85 0.06 25)",
          borderRadius: 11, padding: "10px 14px", marginBottom: 12, fontSize: 12, color: "oklch(0.48 0.16 25)",
          textAlign: "center", fontWeight: 700 }}>
          🚪 ผู้เช่าออกจากห้องแล้ว
          {tenant.evictedY != null && <span style={{ fontWeight: 500 }}> · {dld(tenant.evictedDay || 1, tenant.evictedY, tenant.evictedM)}</span>}
        </div>
      )}

      {/* Evict confirmation strip */}
      {confirmEvict && !isEvicted && (() => {
        const MONTHS_SHORT = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
        const daysInMonth = new Date(evictYear, evictMonth + 1, 0).getDate();
        const selStyle = { padding: "6px 8px", borderRadius: 8, border: "1px solid var(--danger)",
          background: "white", fontSize: 12, cursor: "pointer", color: "var(--ink)", fontFamily: "var(--font-num)" };
        return (
          <div className="screen-in" style={{ marginBottom: 12, background: "var(--danger-soft)", borderRadius: 14,
            padding: "14px 16px", border: "1px solid var(--danger)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--danger)", marginBottom: 6 }}>⚠️ ยืนยันการเลิกเช่า</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-2)", marginBottom: 10, lineHeight: 1.5 }}>
              ห้อง {tenant.room} จะถูกตั้งเป็น "ว่าง" · ประวัติการชำระยังคงอยู่
            </div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-2)", marginBottom: 6 }}>วันที่เลิกเช่า:</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1.4fr", gap: 6, marginBottom: 12 }}>
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 8 }}>
              <button onClick={() => setConfirmEvict(false)} style={{
                padding: "9px 0", borderRadius: 10, border: "1px solid var(--line)",
                background: "var(--surface)", color: "var(--ink-2)", fontWeight: 600, fontSize: 12.5, cursor: "pointer",
              }}>ยกเลิก</button>
              <button onClick={() => {
                evictTenant(tenant.id, evictDay, evictMonth, evictYear);
                setConfirmEvict(false);
              }} style={{
                padding: "9px 0", borderRadius: 10, border: "none",
                background: "var(--danger)", color: "white", fontWeight: 700, fontSize: 12.5, cursor: "pointer",
              }}>ยืนยันเลิกเช่า</button>
            </div>
          </div>
        );
      })()}

      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>ประวัติการชำระ</div>
        {pays.length === 0 && (
          <div style={{ textAlign: "center", padding: "20px 0", fontSize: 12.5, color: "var(--ink-3)" }}>ยังไม่มีประวัติ</div>
        )}
        {pays.map((p, i) => {
          const paid = p.status === "ชำระแล้ว";
          return (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 0", borderTop: i === 0 ? "none" : "1px solid var(--line)" }}>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>{dl(p.year, p.month)}</div>
                {(() => {
                  const b = computePaymentTotal ? computePaymentTotal(p.room_id, p.year, p.month) : null;
                  const total = b ? b.total : p.amount;
                  const hasUtil = b && (b.elec > 0 || b.water > 0);
                  return (
                    <>
                      <div className="num" style={{ fontSize: 11.5, color: "var(--ink-2)", fontWeight: 700, marginTop: 1 }}>{baht(total)}</div>
                      {hasUtil && (
                        <div className="num" style={{ fontSize: 9.5, color: "var(--ink-3)", marginTop: 1 }}>
                          เช่า {baht(b.rent)} · ⚡{baht(b.elec)} · 💧{baht(b.water)}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ background: paid ? "var(--ok-soft)" : "var(--warn-soft)",
                  color: paid ? "var(--ok)" : "var(--warn)", fontSize: 10, fontWeight: 700,
                  padding: "2px 8px", borderRadius: 100 }}>{paid ? "✓ ชำระแล้ว" : "⏳ รอชำระ"}</span>
                {paid ? (
                  <button onClick={() => setReceiptPay(p)} style={{
                    display: "flex", alignItems: "center", gap: 4,
                    background: "var(--ok-soft)", border: "1.5px solid var(--ok)",
                    borderRadius: 10, cursor: "pointer",
                    fontSize: 12.5, color: "var(--ok)", fontWeight: 700,
                    padding: "5px 10px", whiteSpace: "nowrap",
                  }}>🧾 ใบเสร็จ</button>
                ) : (
                  !p._virtual ? null :
                  <button onClick={() => setConfirmPay(confirmPay?.id === p.id ? null : p)} style={{
                    background: confirmPay?.id === p.id ? "var(--brand-soft)" : "transparent",
                    border: "1px solid var(--brand)", borderRadius: 7,
                    cursor: "pointer", fontSize: 11, color: "var(--brand)", fontWeight: 700, padding: "3px 8px" }}>บันทึก</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment confirmation strip */}
      {confirmPay && (
        <div style={{ position: "fixed", bottom: 76, left: 0, right: 0, zIndex: 200,
          background: "var(--brand-soft)", borderTop: "1px solid oklch(0.88 0.06 35)",
          padding: "12px 16px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--brand-ink)", marginBottom: 8 }}>
            ยืนยันบันทึกชำระเงิน
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ink-2)", marginBottom: 12 }}>
            {dl(confirmPay.year, confirmPay.month)} · <span className="num" style={{ fontWeight: 700 }}>{baht(payTotal(confirmPay))}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button onClick={() => setConfirmPay(null)} style={{
              padding: "12px 0", borderRadius: 12, border: "1px solid var(--line)",
              background: "var(--surface)", color: "var(--ink-2)", fontWeight: 700, fontSize: 13, cursor: "pointer",
            }}>ยกเลิก</button>
            <button onClick={() => { recordPayment({ room_id: confirmPay.room_id, year: confirmPay.year, month: confirmPay.month, amount: payTotal(confirmPay) }); setConfirmPay(null); }} style={{
              padding: "12px 0", borderRadius: 12, border: "none",
              background: "var(--ok)", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer",
            }}>✓ บันทึกชำระ</button>
          </div>
        </div>
      )}

      {receiptPay && <ReceiptModal payment={receiptPay} onClose={() => setReceiptPay(null)}/>}
    </div>
  );
}

function MRoomsList({ onPick }) {
  const { rooms, tenants } = useData();
  const floors = Array.from(new Set(rooms.map(r => r.floor))).sort((a, b) => a - b);
  const byRoomId = (a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true });
  return (
    <div>
      {floors.map(floor => (
        <div key={floor} style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase",
            letterSpacing: 1, marginBottom: 8 }}>ชั้น {floor}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {rooms.filter(r => r.floor === floor).sort(byRoomId).map(room => {
              const tenant = tenants.find(t => t.room === room.id);
              const occ = room.status === "ไม่ว่าง";
              return (
                <button key={room.id} onClick={() => onPick(room.id)} className="lift" style={{
                  background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14,
                  padding: 12, cursor: "pointer", textAlign: "left", position: "relative", overflow: "hidden",
                }}>
                  <div style={{ position: "absolute", top: 0, right: 0, width: 3, height: "100%",
                    background: occ ? "var(--brand)" : "var(--sage)" }}/>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div className="num" style={{ fontSize: 17, fontWeight: 700 }}>{room.id}</div>
                    <span style={{ background: occ ? "var(--brand-soft)" : "var(--sage-soft)",
                      color: occ ? "var(--brand-ink)" : "var(--sage-ink)", padding: "2px 7px",
                      borderRadius: 100, fontSize: 9.5, fontWeight: 700 }}>{room.status}</span>
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 2 }}>ห้อง{room.type}</div>
                  <div className="num" style={{ fontSize: 13, fontWeight: 700, marginTop: 8 }}>
                    {baht(room.price)}<span style={{ fontSize: 10, color: "var(--ink-3)", fontWeight: 500 }}>/ด.</span>
                  </div>
                  {tenant && (
                    <div style={{ marginTop: 8, fontSize: 10.5, color: "var(--ink-3)", display: "flex", alignItems: "center", gap: 5,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <Avatar name={tenant.name} size={18}/>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{tenant.name}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function MRoomDetail({ roomId, onBack, onMove, onAddTenant }) {
  const { rooms, tenants, reactivateTenant, curY, curM } = useData();
  const room = rooms.find(r => r.id === roomId);
  const tenant = tenants.find(t => t.room === roomId);
  const [moveOpen, setMoveOpen] = useState(false);
  const [destRoom, setDestRoom] = useState("");
  const [pickExistingOpen, setPickExistingOpen] = useState(false);
  if (!room) return null;
  const occ = room.status === "ไม่ว่าง";
  const availableTenants = tenants.filter(t => !t.room); // tenants without a current room

  return (
    <div>
      <button onClick={onBack} style={{ background: "transparent", border: "none", color: "var(--ink-2)",
        cursor: "pointer", fontSize: 12.5, fontWeight: 700, padding: 0, marginBottom: 14,
        display: "flex", alignItems: "center", gap: 4 }}>
        <IconArrowLeft size={14} stroke="var(--ink-2)"/> กลับ
      </button>

      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: 16, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div className="num" style={{ width: 56, height: 56, borderRadius: 14,
            background: occ ? "var(--brand)" : "var(--sage-soft)",
            color: occ ? "white" : "var(--sage-ink)", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700 }}>
            {room.id}
            <span style={{ fontSize: 9, fontWeight: 600, opacity: 0.85 }}>ชั้น {room.floor}</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>ห้อง{room.type}</div>
            <div className="num" style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 2 }}>
              {baht(room.price)}<span style={{ color: "var(--ink-4)" }}>/เดือน</span>
            </div>
            <span style={{ marginTop: 4, display: "inline-block", background: occ ? "var(--brand-soft)" : "var(--sage-soft)",
              color: occ ? "var(--brand-ink)" : "var(--sage-ink)", padding: "2px 8px",
              borderRadius: 100, fontSize: 10, fontWeight: 700 }}>{room.status}</span>
          </div>
        </div>
      </div>

      {tenant ? (
        <div style={{ background: "var(--brand-soft)", borderRadius: 14, padding: 14, marginBottom: 12,
          display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar name={tenant.name} size={40}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 700 }}>ผู้เช่าปัจจุบัน</div>
            <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 2 }}>{tenant.name}</div>
            <div className="num" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{tenant.phone}</div>
          </div>
          <button onClick={() => { setMoveOpen(true); setDestRoom(""); }} style={{
            padding: "8px 12px", borderRadius: 10, background: "var(--ink)", color: "white", border: "none",
            fontWeight: 700, fontSize: 11.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
          }}>
            <IconArrowRight size={12} stroke="white"/> ย้าย
          </button>
        </div>
      ) : (
        <>
          <div style={{ background: "var(--sage-soft)", borderRadius: 14, padding: 14, marginBottom: 10, textAlign: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--sage-ink)" }}>🌿 ห้องว่าง พร้อมเช่า</div>
          </div>
          {/* Two action buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            <button onClick={() => setPickExistingOpen(!pickExistingOpen)} style={{
              padding: "11px 12px", borderRadius: 11,
              background: pickExistingOpen ? "var(--brand-soft)" : "var(--surface)",
              color: pickExistingOpen ? "var(--brand-ink)" : "var(--ink-2)",
              border: "1px solid var(--line)",
              fontWeight: 700, fontSize: 12, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <IconUsers size={14} stroke={pickExistingOpen ? "var(--brand)" : "var(--ink-3)"}/> ผู้เช่าเดิม
            </button>
            <button onClick={() => onAddTenant && onAddTenant(roomId)} style={{
              padding: "11px 12px", borderRadius: 11,
              background: "var(--brand)", color: "white", border: "none",
              fontWeight: 700, fontSize: 12, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <IconPlus size={14} stroke="white"/> ผู้เช่าใหม่
            </button>
          </div>
          {/* Existing tenant picker */}
          {pickExistingOpen && (
            <div className="screen-in" style={{ background: "var(--surface)", border: "1px dashed var(--brand)",
              borderRadius: 14, padding: 14, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700 }}>เลือกผู้เช่าเดิม</div>
                  <div style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 2 }}>
                    {availableTenants.length === 0
                      ? "ไม่มีผู้เช่าที่ไม่มีห้อง"
                      : `มี ${availableTenants.length} คน · กดเพื่อให้เข้าพัก`}
                  </div>
                </div>
                <button onClick={() => setPickExistingOpen(false)} style={{ background: "transparent", border: "none",
                  color: "var(--ink-3)", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>✕</button>
              </div>
              {availableTenants.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 320, overflowY: "auto" }}>
                  {availableTenants.map(t => {
                    const isEvicted = !!t.evicted;
                    // Status palette: evicted = warm red, never-assigned = cool gray-blue
                    const statusBg    = isEvicted ? "oklch(0.94 0.05 25)"  : "oklch(0.94 0.025 250)";
                    const statusFg    = isEvicted ? "oklch(0.48 0.16 25)"  : "oklch(0.45 0.08 250)";
                    const statusLabel = isEvicted ? "เลิกเช่า"             : "ไม่มีห้อง";
                    const roomBadgeBg = isEvicted ? "oklch(0.97 0.03 25)"  : "var(--surface)";
                    const roomBadgeFg = isEvicted ? "oklch(0.48 0.16 25)"  : "var(--ink-3)";
                    const roomBadgeBd = isEvicted ? "oklch(0.85 0.06 25)"  : "var(--line)";
                    return (
                      <button key={t.id}
                        onClick={() => {
                          reactivateTenant(t.id, roomId, curY, curM);
                          setPickExistingOpen(false);
                        }}
                        style={{ background: "var(--surface-2)", border: "1px solid var(--line)",
                          borderRadius: 11, padding: "10px 12px", cursor: "pointer", textAlign: "left",
                          display: "flex", alignItems: "center", gap: 10 }}>
                        {/* Room number badge (previous room or dash) */}
                        <div className="num" style={{ width: 38, height: 38, borderRadius: 10,
                          background: roomBadgeBg, color: roomBadgeFg, border: `1px solid ${roomBadgeBd}`,
                          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                          fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                          {t.prevRoom || "—"}
                          {t.prevRoom && <span style={{ fontSize: 7, fontWeight: 500, opacity: 0.7 }}>เดิม</span>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink)",
                              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</span>
                            <span style={{ background: statusBg, color: statusFg,
                              padding: "1px 6px", borderRadius: 100, fontSize: 9, fontWeight: 700, flexShrink: 0 }}>
                              {statusLabel}
                            </span>
                          </div>
                          <div className="num" style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 2 }}>
                            {t.phone || "—"}
                            {isEvicted && t.evictedY != null && <span> · ออก {dl(t.evictedY, t.evictedM)}</span>}
                          </div>
                        </div>
                        <span style={{ background: "var(--brand)", color: "white", padding: "4px 10px",
                          borderRadius: 100, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>
                          เข้าพัก →
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {moveOpen && tenant && (
        <div className="screen-in" style={{ background: "var(--surface)", border: "1px dashed var(--brand)",
          borderRadius: 14, padding: 14, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700 }}>ย้ายไปห้องอื่น</div>
            <button onClick={() => setMoveOpen(false)} style={{ background: "transparent", border: "none",
              color: "var(--ink-3)", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>ยกเลิก ✕</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
            {rooms.filter(r => r.id !== roomId).sort((a,b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true })).map(r => {
              const occu = r.status === "ไม่ว่าง";
              const sel = destRoom === r.id;
              return (
                <button key={r.id} onClick={() => setDestRoom(r.id)} style={{
                  padding: "8px 4px", borderRadius: 9,
                  border: sel ? "1.5px solid var(--brand)" : "1px solid var(--line)",
                  background: sel ? "var(--brand-soft)" : "var(--surface-2)",
                  cursor: "pointer", textAlign: "center",
                }}>
                  <div className="num" style={{ fontSize: 11, fontWeight: 700,
                    color: sel ? "var(--brand-ink)" : "var(--ink)" }}>{r.id}</div>
                  <div style={{ fontSize: 8.5, color: occu ? "var(--warn)" : "var(--ink-3)", fontWeight: occu ? 700 : 500 }}>
                    {occu ? "ไม่ว่าง" : "ว่าง"}
                  </div>
                </button>
              );
            })}
          </div>
          {destRoom && (() => {
            const swap = tenants.find(t => t.room === destRoom);
            return (
              <div style={{ marginTop: 10 }}>
                {swap ? (
                  <div style={{ fontSize: 11.5, color: "var(--warn)", padding: "8px 10px",
                    background: "var(--warn-soft)", borderRadius: 9 }}>
                    ห้อง {destRoom} มี {swap.name} อยู่แล้ว
                  </div>
                ) : (
                  <button onClick={() => { onMove(tenant.id, destRoom); setMoveOpen(false); }} style={{
                    width: "100%", padding: "10px 0", borderRadius: 10, background: "var(--brand)",
                    color: "white", border: "none", fontWeight: 700, fontSize: 12.5, cursor: "pointer",
                  }}>ยืนยันย้าย → {destRoom}</button>
                )}
              </div>
            );
          })()}
        </div>
      )}

      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase",
          letterSpacing: 1, marginBottom: 10 }}>สิ่งอำนวยความสะดวก</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {(room.amenities || []).map(a => (
            <span key={a} style={{ padding: "5px 10px", borderRadius: 100, background: "var(--surface-2)",
              border: "1px solid var(--line)", fontSize: 11, fontWeight: 600 }}>{a}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function MMorePage({ onBulk, setTab, onPickMonth, onOpenSettings, onLogout, onSlips, onRepairs, onFlatRate, onUtilHistory }) {
  const { slips, repairs, curY, curM } = useData();
  const items = [
    { k: "slips",       icon: IconCard,     label: "อนุมัติสลิปการชำระ",      badge: slips.filter(s => s.status === "pending").length, onClick: onSlips },
    { k: "repairs",     icon: IconWrench,   label: "ซ่อมบำรุง",                badge: repairs.filter(r => r.status !== "เสร็จแล้ว").length, onClick: onRepairs },
    { k: "utility",     icon: IconSparkle,  label: "จดมิเตอร์น้ำ-ไฟ",          onClick: onBulk },
    { k: "utilhistory", icon: IconTrend,    label: "รายการใช้น้ำไฟย้อนหลัง",   onClick: onUtilHistory },
    { k: "history",     icon: IconChart,    label: "รายงานรายเดือน",           onClick: () => onPickMonth({ year: curY, month: curM }) },
    { k: "settings",    icon: IconSettings, label: "ตั้งค่าบัญชี / รหัสผ่าน",  onClick: onOpenSettings },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map(it => {
        const Ic = it.icon;
        return (
          <button key={it.k} onClick={it.onClick} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "14px 14px",
            background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12,
            cursor: "pointer", textAlign: "left", width: "100%",
          }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--brand-soft)",
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Ic size={18} stroke="var(--brand)"/>
            </div>
            <div style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{it.label}</div>
            {it.badge ? (
              <span className="num" style={{ background: "var(--brand)", color: "white", fontSize: 10.5, fontWeight: 700,
                padding: "2px 8px", borderRadius: 100 }}>{it.badge}</span>
            ) : null}
            <IconChevR size={14} stroke="var(--ink-3)"/>
          </button>
        );
      })}
      <button onClick={onLogout} style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px",
        background: "var(--surface)", border: "1px solid var(--danger-soft)", borderRadius: 12,
        color: "var(--danger)", fontWeight: 700, fontSize: 13.5, cursor: "pointer", marginTop: 6,
      }}>
        <IconLogout size={16} stroke="var(--danger)"/> ออกจากระบบ
      </button>
    </div>
  );
}

// ─── Mobile Slips Approval Page ────────────────────────────────────────────
function MSlipsPage({ owner, onBack }) {
  const { slips, tenants, approveSlip, rejectSlip, deleteSlip, refreshSlips } = useData();
  const [filter, setFilter] = useState("pending");
  const [selId, setSelId] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshSlips();
    setRefreshing(false);
  };

  const list = slips.filter(s => filter === "all" || s.status === filter)
    .sort((a, b) => (b.uploaded_at || "").localeCompare(a.uploaded_at || ""));
  const pendingCount = slips.filter(s => s.status === "pending").length;
  const pendingAmt   = slips.filter(s => s.status === "pending").reduce((s,x) => s + x.amount, 0);
  const sel = selId ? slips.find(s => s.id === selId) : null;

  const gradientFor = (s) => {
    const g = { "slip-a": "linear-gradient(135deg, #5da375, #2e7a4a)", "slip-b": "linear-gradient(135deg, #7b5ea7, #4a3070)", "slip-c": "linear-gradient(135deg, #c86b3a, #8c3e14)" };
    return g[s.thumb] || "linear-gradient(135deg, var(--brand), var(--brand-2))";
  };

  if (sel) {
    const tenant = tenants.find(t => t.id === sel.tenant_id);
    return (
      <div style={{ padding: "12px 16px 90px" }}>
        <button onClick={() => { setSelId(null); setConfirmDel(false); }} style={{ background: "transparent", border: "none", color: "var(--ink-2)",
          cursor: "pointer", fontSize: 12.5, fontWeight: 700, padding: 0, marginBottom: 14,
          display: "flex", alignItems: "center", gap: 4 }}>
          <IconArrowLeft size={14} stroke="var(--ink-2)"/> กลับรายการสลิป
        </button>

        <div style={{ borderRadius: 18, overflow: "hidden", marginBottom: 14, border: "1px solid var(--line)" }}>
          {sel.imageUrl ? (
            <img src={sel.imageUrl} alt="slip" style={{ width: "100%", display: "block", maxHeight: 300, objectFit: "cover", cursor: "zoom-in" }}
              onClick={() => setLightbox(sel.imageUrl)}/>
          ) : (
            <div style={{ height: 200, background: gradientFor(sel), display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", color: "white" }}>
              <IconCard size={36} stroke="rgba(255,255,255,0.7)"/>
              <div style={{ marginTop: 10, fontSize: 13, fontWeight: 600, opacity: 0.85 }}>ไม่มีรูปสลิป</div>
            </div>
          )}
          {sel.imageUrl && (
            <div style={{ padding: "8px 14px", background: "var(--surface-2)", fontSize: 11.5, color: "var(--ink-3)" }}>
              🖼 ภาพจริงจากผู้เช่า {sel.filename ? `· ${sel.filename}` : ""}
            </div>
          )}
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 700, marginBottom: 8 }}>รายละเอียดสลิป</div>
          {[
            ["ผู้เช่า", tenant?.name || sel.tenant_id],
            ["ห้อง", sel.room_id],
            ["เดือน", `${MONTHS_TH[sel.month]} ${sel.year}`],
            ["จำนวนเงิน", baht(sel.amount)],
            ["ธนาคาร", sel.bank],
            ["เวลาอัปโหลด", sel.uploaded_at],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0",
              borderBottom: "1px solid var(--line)", fontSize: 13 }}>
              <span style={{ color: "var(--ink-3)" }}>{k}</span>
              <span style={{ fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>

        {sel.status === "pending" ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button onClick={() => { rejectSlip(sel.id); setSelId(null); }} style={{
              padding: "14px 0", borderRadius: 14, border: "1.5px solid var(--danger)", background: "var(--danger-soft)",
              color: "var(--danger)", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
            }}>✕ ไม่อนุมัติ</button>
            <button onClick={() => { approveSlip(sel.id); setSelId(null); }} style={{
              padding: "14px 0", borderRadius: 14, border: "none", background: "var(--ok)",
              color: "white", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
            }}>✓ อนุมัติ</button>
          </div>
        ) : (
          <>
            <div style={{ padding: "14px 16px", borderRadius: 14, textAlign: "center",
              background: sel.status === "approved" ? "var(--ok-soft)" : "var(--danger-soft)",
              color: sel.status === "approved" ? "var(--ok)" : "var(--danger)",
              fontWeight: 700, fontSize: 14 }}>
              {sel.status === "approved" ? "✓ อนุมัติแล้ว" : "✕ ไม่อนุมัติ"}
            </div>

            {/* Delete slip */}
            {!confirmDel ? (
              <button onClick={() => setConfirmDel(true)} style={{
                marginTop: 10, width: "100%", padding: "13px 0", borderRadius: 14,
                border: "1px solid var(--line)", background: "transparent",
                color: "var(--ink-3)", fontWeight: 600, fontSize: 13, cursor: "pointer",
              }}>× ลบสลิปนี้</button>
            ) : (
              <div style={{ marginTop: 10, padding: "14px 16px", borderRadius: 14,
                border: "1.5px solid var(--danger-soft)", background: "var(--danger-soft)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--danger)", marginBottom: 6 }}>
                  ยืนยันการลบสลิป?
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-2)", marginBottom: 12, lineHeight: 1.5 }}>
                  สลิปจะถูกลบถาวร ประวัติการชำระยังคงอยู่
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <button onClick={() => setConfirmDel(false)} style={{
                    padding: "12px 0", borderRadius: 12, border: "1px solid var(--line)",
                    background: "var(--surface)", color: "var(--ink-2)", fontWeight: 700, fontSize: 13, cursor: "pointer",
                  }}>ยกเลิก</button>
                  <button onClick={() => { deleteSlip(sel.id); setSelId(null); setConfirmDel(false); }} style={{
                    padding: "12px 0", borderRadius: 12, border: "none",
                    background: "var(--danger)", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer",
                  }}>ลบถาวร</button>
                </div>
              </div>
            )}
          </>
        )}

        {lightbox && (
          <div onClick={() => setLightbox(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20 }}>
            <img src={lightbox} alt="slip fullsize" style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: 12 }}/>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: "12px 16px 90px" }}>
      <button onClick={onBack} style={{ background: "transparent", border: "none", color: "var(--ink-2)",
        cursor: "pointer", fontSize: 12.5, fontWeight: 700, padding: 0, marginBottom: 14,
        display: "flex", alignItems: "center", gap: 4 }}>
        <IconArrowLeft size={14} stroke="var(--ink-2)"/> กลับ
      </button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.3 }}>อนุมัติสลิป</div>
        <button onClick={handleRefresh} disabled={refreshing} style={{
          display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
          borderRadius: 100, border: "1px solid var(--line)", background: "var(--surface)",
          color: "var(--ink-2)", fontSize: 12, fontWeight: 600, cursor: "pointer",
          opacity: refreshing ? 0.5 : 1,
        }}>
          <span style={{ display: "inline-block", animation: refreshing ? "spin 0.8s linear infinite" : "none" }}>⟳</span>
          {refreshing ? "กำลังโหลด…" : "รีเฟรช"}
        </button>
      </div>
      <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginBottom: 14 }}>{pendingCount} รายการรอตรวจสอบ</div>

      {pendingCount > 0 && (
        <div style={{ background: "linear-gradient(105deg, var(--brand), var(--brand-2))", color: "white",
          borderRadius: 14, padding: "14px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(255,255,255,0.22)",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconCard size={20} stroke="white"/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, opacity: 0.85, fontWeight: 600 }}>รวมยอดรออนุมัติ</div>
            <div className="num" style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.3 }}>{baht(pendingAmt)}</div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
        {[
          { id: "pending",  label: "รออนุมัติ",   n: slips.filter(s=>s.status==="pending").length },
          { id: "approved", label: "อนุมัติแล้ว", n: slips.filter(s=>s.status==="approved").length },
          { id: "rejected", label: "ไม่อนุมัติ",  n: slips.filter(s=>s.status==="rejected").length },
          { id: "all",      label: "ทั้งหมด",     n: slips.length },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            padding: "7px 12px", borderRadius: 100, cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
            background: filter === f.id ? "var(--ink)" : "var(--surface)", flexShrink: 0,
            color: filter === f.id ? "white" : "var(--ink-2)",
            border: `1px solid ${filter === f.id ? "var(--ink)" : "var(--line)"}`,
            display: "flex", alignItems: "center", gap: 5,
          }}>{f.label} <span className="num" style={{ opacity: 0.7, fontSize: 11 }}>{f.n}</span></button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {list.length === 0 && (
          <div style={{ padding: "40px 0", textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>ไม่มีรายการ</div>
        )}
        {list.map(s => {
          const tenant = tenants.find(t => t.id === s.tenant_id);
          return (
            <button key={s.id} onClick={() => setSelId(s.id)} className="lift" style={{
              display: "flex", alignItems: "center", gap: 12, padding: 12,
              background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14,
              cursor: "pointer", textAlign: "left", width: "100%",
            }}>
              <div style={{ width: 50, height: 56, borderRadius: 10, flexShrink: 0, overflow: "hidden" }}>
                {s.imageUrl ? (
                  <img src={s.imageUrl} alt="slip" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                ) : (
                  <div style={{ width: "100%", height: "100%", background: gradientFor(s), display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <IconCard size={20} stroke="rgba(255,255,255,0.8)"/>
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tenant?.name || s.tenant_id}</div>
                <div className="num" style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>ห้อง {s.room_id} · {MONTHS_TH[s.month]} {s.year}</div>
                <div className="num" style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginTop: 2 }}>{baht(s.amount)}</div>
              </div>
              <div>
                <span style={{
                  background: s.status === "pending" ? "var(--warn-soft)" : s.status === "approved" ? "var(--ok-soft)" : "var(--danger-soft)",
                  color: s.status === "pending" ? "var(--warn)" : s.status === "approved" ? "var(--ok)" : "var(--danger)",
                  fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 100,
                }}>{s.status === "pending" ? "⏳ รอ" : s.status === "approved" ? "✓ อนุมัติ" : "✕ ไม่อนุมัติ"}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Mobile Utility History Page ────────────────────────────────────────────
function MUtilHistoryPage({ onBack }) {
  const { rooms, tenants, utils, billing, utilRate, curY, curM } = useData();
  const [viewY, setViewY] = useState(curY);
  const [viewM, setViewM] = useState(curM);
  const [selRoom, setSelRoom] = useState(null); // drill-down to room detail
  const [openKey, setOpenKey] = useState(null); // expanded month in detail view

  const isCurrent = viewY === curY && viewM === curM;
  const goPrev = () => viewM === 0 ? (setViewY(viewY - 1), setViewM(11)) : setViewM(viewM - 1);
  const goNext = () => {
    if (isCurrent) return;
    viewM === 11 ? (setViewY(viewY + 1), setViewM(0)) : setViewM(viewM + 1);
  };

  const byRoomId = (a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true });
  const liveAt = (y, m) => rooms.filter(r =>
    tenants.some(t => {
      const inRoom = t.room === r.id || (t.evicted && t.prevRoom === r.id);
      if (!inRoom) return false;
      const movedIn = t.sinceY < y || (t.sinceY === y && t.sinceM <= m);
      if (!movedIn) return false;
      if (t.evicted && t.evictedY != null) {
        const evictedBefore = t.evictedY < y || (t.evictedY === y && (t.evictedM ?? 0) < m);
        if (evictedBefore) return false;
      }
      return true;
    })
  ).sort(byRoomId);
  const occupied = liveAt(viewY, viewM);

  // ── Room detail drill-down ─────────────────────────────────────────
  if (selRoom) {
    const room     = rooms.find(r => r.id === selRoom);
    const tenant   = tenants.find(t => t.room === selRoom);
    // Filter utils to only show CURRENT tenant's history (from their sinceY/sinceM onwards)
    const roomUtils = utils.filter(u => {
      if (u.room_id !== selRoom) return false;
      if (tenant) {
        if (u.year < tenant.sinceY) return false;
        if (u.year === tenant.sinceY && u.month < tenant.sinceM) return false;
      }
      return true;
    }).sort((a, b) => b.year !== a.year ? b.year - a.year : b.month - a.month);

    return (
      <div style={{ padding: "12px 16px 90px" }}>
        {/* Back to list */}
        <button onClick={() => { setSelRoom(null); setOpenKey(null); }} style={{ background: "transparent", border: "none",
          color: "var(--ink-2)", cursor: "pointer", fontSize: 12.5, fontWeight: 700, padding: 0,
          marginBottom: 14, display: "flex", alignItems: "center", gap: 4 }}>
          <IconArrowLeft size={14} stroke="var(--ink-2)"/> กลับ
        </button>

        <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: -0.3, marginBottom: 2 }}>
          ประวัติย้อนหลัง · ห้อง {selRoom}
        </div>
        <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginBottom: 16 }}>{tenant?.name || "—"}</div>

        {roomUtils.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: "var(--ink-4)", fontSize: 13 }}>
            ยังไม่มีข้อมูลการจดมิเตอร์
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {roomUtils.map(u => {
            // ── Initial reading row ────────────────────────────────
            if (u.isInitial) return (
              <div key={u.id} style={{ background: "oklch(0.975 0.015 145)",
                border: "1.5px solid oklch(0.88 0.08 145)", borderRadius: 13, padding: "12px 14px",
                display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{dl(u.year, u.month)}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, background: "oklch(0.88 0.08 145)",
                      color: "oklch(0.35 0.1 145)", borderRadius: 5, padding: "2px 7px" }}>มิเตอร์เริ่มต้น</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
                    ⚡ ตั้งต้น {u.elec_cur} หน่วย &nbsp;·&nbsp; 💧 ตั้งต้น {u.water_cur} หน่วย
                  </div>
                </div>
              </div>
            );

            // Correct prev — strictly earlier (non-initial), or initial record for same month
            const prRec = roomUtils
              .filter(x => !x.isInitial && (x.year < u.year || (x.year === u.year && x.month < u.month)))
              .sort((a, b) => b.year !== a.year ? b.year - a.year : b.month - a.month)[0];
            const initRec = roomUtils.find(x => x.isInitial && x.year === u.year && x.month === u.month);
            const ePrev = prRec?.elec_cur  ?? initRec?.elec_cur  ?? 0;
            const wPrev = prRec?.water_cur ?? initRec?.water_cur ?? 0;
            const eUse  = Math.max(0, u.elec_cur - ePrev);
            const wUse  = Math.max(0, u.water_cur - wPrev);

            // Billing mode for this month
            const bk    = `${u.room_id}|${u.year}|${u.month}`;
            const bm    = billing.monthly?.[bk] || {};
            const hEMode = bm.elecMode  || "metered";
            const hWMode = bm.waterMode || "metered";
            const hEFlat = bm.elecFlat  ?? billing.defaultElecFlat  ?? 0;
            const hWFlat = bm.waterFlat ?? billing.defaultWaterFlat ?? 0;
            const hEAmt  = hEMode === "flat" ? hEFlat : eUse * utilRate.electric;
            const hWAmt  = hWMode === "flat" ? hWFlat : wUse * utilRate.water;
            const total  = hEAmt + hWAmt;

            const hKey   = `${u.year}-${u.month}`;
            const isOpen = openKey === hKey;

            return (
              <div key={u.id} style={{ background: "var(--surface)", border: "1.5px solid var(--line)",
                borderRadius: 13, overflow: "hidden" }}>
                {/* Row summary — tap to expand */}
                <button onClick={() => setOpenKey(isOpen ? null : hKey)}
                  style={{ width: "100%", padding: "11px 13px", background: isOpen ? "oklch(0.97 0.015 240)" : "var(--surface-2)",
                    border: "none", borderBottom: isOpen ? "1px dashed oklch(0.88 0.03 240)" : "none",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 10, textAlign: "left" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, flex: 1 }}>
                    {dl(u.year, u.month)}
                  </span>
                  {/* compact pill: elec units + water units */}
                  <span style={{ fontSize: 11, color: "var(--ink-3)" }}>
                    {hEMode === "flat"
                      ? <span style={{ fontSize: 10, color: "oklch(0.48 0.13 80)", fontWeight: 700 }}>⚡เหมา</span>
                      : <span className="num">⚡{eUse}</span>
                    }
                    {"  "}
                    {hWMode === "flat"
                      ? <span style={{ fontSize: 10, color: "oklch(0.40 0.13 230)", fontWeight: 700 }}>💧เหมา</span>
                      : <span className="num">💧{wUse}</span>
                    }
                  </span>
                  <span className="num" style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)" }}>
                    {baht(total)}
                  </span>
                  <span style={{ fontSize: 10, color: "var(--ink-4)",
                    transform: isOpen ? "rotate(90deg)" : "none", display: "inline-block", transition: "transform .15s" }}>▶</span>
                </button>

                {/* Expanded billing detail */}
                {isOpen && (
                  <div style={{ padding: "10px 12px 12px", background: "oklch(0.97 0.015 240)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                      {[
                        { emoji: "⚡", label: "ค่าไฟฟ้า", mode: hEMode, flat: hEFlat,
                          prev: ePrev, cur: u.elec_cur, use: eUse, amt: hEAmt,
                          color: "oklch(0.48 0.13 80)", bg: "oklch(0.97 0.04 80)", bdr: "oklch(0.88 0.07 80)" },
                        { emoji: "💧", label: "ค่าน้ำ",   mode: hWMode, flat: hWFlat,
                          prev: wPrev, cur: u.water_cur, use: wUse, amt: hWAmt,
                          color: "oklch(0.40 0.13 230)", bg: "oklch(0.97 0.025 230)", bdr: "oklch(0.88 0.05 230)" },
                      ].map(f => (
                        <div key={f.label} style={{ background: f.bg, border: `1.5px solid ${f.bdr}`,
                          borderRadius: 10, padding: "10px 11px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                            <span style={{ fontSize: 13 }}>{f.emoji}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: f.color }}>{f.label}</span>
                            {f.mode === "flat" && (
                              <span style={{ marginLeft: "auto", fontSize: 9.5, fontWeight: 700,
                                color: f.color, background: "white", border: `1px solid ${f.bdr}`,
                                padding: "1px 6px", borderRadius: 100 }}>เหมา</span>
                            )}
                          </div>
                          {f.mode === "flat" ? (
                            <div className="num" style={{ fontSize: 14, fontWeight: 800, color: f.color }}>
                              {baht(f.flat)}
                            </div>
                          ) : (
                            <>
                              <div style={{ fontSize: 10.5, color: "var(--ink-3)", marginBottom: 3 }}>
                                <span className="num">{f.prev}</span>
                                <span style={{ color: "var(--ink-4)", margin: "0 3px" }}>→</span>
                                <span className="num" style={{ fontWeight: 700, color: "var(--ink)" }}>{f.cur}</span>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                <span style={{ fontSize: 10.5, color: "var(--ink-3)" }}>
                                  <span className="num" style={{ fontWeight: 700, color: f.color }}>{f.use}</span> หน่วย
                                </span>
                                <span className="num" style={{ fontSize: 13, fontWeight: 800, color: f.color }}>
                                  {baht(f.amt)}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                    {/* Total row */}
                    <div style={{ padding: "7px 10px", background: "white", borderRadius: 8,
                      display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 600 }}>รวมทั้งหมด</span>
                      <span className="num" style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>
                        {baht(total)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Totals for the footer
  let footerElec = 0, footerWater = 0, footerAmt = 0, footerDone = 0;

  const navBtnStyle = (disabled) => ({
    width: 36, height: 36, borderRadius: 10, border: "1px solid var(--line)",
    background: "var(--surface)", cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.35 : 1,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  });

  return (
    <div style={{ padding: "12px 16px 90px" }}>
      {/* Back */}
      <button onClick={onBack} style={{ background: "transparent", border: "none", color: "var(--ink-2)",
        cursor: "pointer", fontSize: 12.5, fontWeight: 700, padding: 0, marginBottom: 14,
        display: "flex", alignItems: "center", gap: 4 }}>
        <IconArrowLeft size={14} stroke="var(--ink-2)"/> กลับ
      </button>

      <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.3, marginBottom: 2 }}>รายการใช้น้ำไฟ</div>
      <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginBottom: 14 }}>
        ประวัติการใช้น้ำ-ไฟย้อนหลังรายห้อง
      </div>

      {/* Month nav */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16,
        background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 13, padding: "10px 14px" }}>
        <button onClick={goPrev} style={navBtnStyle(false)}>
          <IconArrowLeft size={14} stroke="var(--ink-2)"/>
        </button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{dl(viewY, viewM)}</div>
          {!isCurrent && (
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--warn)",
              background: "var(--warn-soft)", padding: "1px 8px", borderRadius: 100 }}>ย้อนหลัง</span>
          )}
        </div>
        <button onClick={goNext} disabled={isCurrent} style={navBtnStyle(isCurrent)}>
          <IconArrowRight size={14} stroke="var(--ink-2)"/>
        </button>
      </div>

      {/* Room cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {occupied.map(r => {
          const t  = tenants.find(x => x.room === r.id);
          const u  = utils.find(x => x.room_id === r.id && x.year === viewY && x.month === viewM);

          // Billing config for this room+month
          const bk    = `${r.id}|${viewY}|${viewM}`;
          const bm    = billing.monthly?.[bk] || {};
          const eMode = bm.elecMode  || "metered";
          const wMode = bm.waterMode || "metered";
          const eFlat = bm.elecFlat  ?? billing.defaultElecFlat  ?? 0;
          const wFlat = bm.waterFlat ?? billing.defaultWaterFlat ?? 0;

          if (!u && eMode === "metered" && wMode === "metered") {
            return (
              <div key={r.id} style={{ background: "var(--surface)", border: "1px solid var(--line)",
                borderRadius: 14, overflow: "hidden" }}>
                <button onClick={() => { setSelRoom(r.id); setOpenKey(null); }} style={{ width: "100%", padding: "10px 14px",
                  background: "var(--surface-2)", border: "none", borderBottom: "1px solid var(--line)",
                  display: "flex", alignItems: "center", gap: 10, cursor: "pointer", textAlign: "left" }}>
                  <div className="num" style={{ width: 34, height: 34, borderRadius: 9,
                    background: "var(--surface)", border: "1.5px solid var(--line)",
                    color: "var(--ink-3)", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{r.id}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap",
                      overflow: "hidden", textOverflow: "ellipsis" }}>{t?.name || "—"}</div>
                    <div style={{ fontSize: 10.5, color: "var(--ink-3)" }}>ชั้น {r.floor}</div>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--ink-4)" }}>▶</span>
                </button>
                <div style={{ padding: "10px 14px", fontSize: 12.5, color: "var(--ink-4)",
                  fontWeight: 600, textAlign: "center" }}>ยังไม่ได้จดมิเตอร์เดือนนี้</div>
              </div>
            );
          }

          // Correct prev — most recent record strictly before viewY/viewM
          const prRec = utils
            .filter(x => x.room_id === r.id && (x.year < viewY || (x.year === viewY && x.month < viewM)))
            .sort((a, b) => b.year !== a.year ? b.year - a.year : b.month - a.month)[0];
          const ePrev = prRec?.elec_cur  ?? 0;
          const wPrev = prRec?.water_cur ?? 0;
          const eCur  = u?.elec_cur  ?? 0;
          const wCur  = u?.water_cur ?? 0;
          const eUse  = Math.max(0, eCur - ePrev);
          const wUse  = Math.max(0, wCur - wPrev);
          const eAmt  = eMode === "flat" ? eFlat : eUse * utilRate.electric;
          const wAmt  = wMode === "flat" ? wFlat : wUse * utilRate.water;
          const total = eAmt + wAmt;

          footerElec  += eUse;  footerWater += wUse;
          footerAmt   += total; footerDone  += 1;

          return (
            <div key={r.id} style={{ background: "var(--surface)", border: "1.5px solid var(--line)",
              borderRadius: 14, overflow: "hidden" }}>
              {/* Card header — tap to drill-down */}
              <button onClick={() => { setSelRoom(r.id); setOpenKey(null); }} style={{ width: "100%", padding: "9px 12px",
                background: "var(--surface-2)", border: "none", borderBottom: "1px solid var(--line)",
                display: "flex", alignItems: "center", gap: 10, cursor: "pointer", textAlign: "left" }}>
                <div className="num" style={{ width: 34, height: 34, borderRadius: 9,
                  background: "var(--brand-soft)", color: "var(--brand-ink)",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                  {r.id}
                  <span style={{ fontSize: 8, opacity: 0.6 }}>ชั้น{r.floor}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap",
                    overflow: "hidden", textOverflow: "ellipsis" }}>{t?.name || "—"}</div>
                </div>
                <span className="num" style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)" }}>
                  {baht(total)}
                </span>
                <span style={{ fontSize: 11, color: "var(--ink-4)" }}>▶</span>
              </button>

              {/* Elec + Water columns */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                {[
                  { emoji: "⚡", label: "ค่าไฟฟ้า", mode: eMode, flat: eFlat,
                    prev: ePrev, cur: eCur, use: eUse, amt: eAmt,
                    color: "oklch(0.48 0.13 80)", bg: "oklch(0.97 0.04 80)", borderCol: "oklch(0.88 0.07 80)",
                    borderRight: true },
                  { emoji: "💧", label: "ค่าน้ำ",   mode: wMode, flat: wFlat,
                    prev: wPrev, cur: wCur, use: wUse, amt: wAmt,
                    color: "oklch(0.40 0.13 230)", bg: "oklch(0.97 0.025 230)", borderCol: "oklch(0.88 0.05 230)",
                    borderRight: false },
                ].map(f => (
                  <div key={f.label} style={{ padding: "10px 12px",
                    borderRight: f.borderRight ? "1px solid var(--line)" : "none" }}>
                    {/* header row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 7 }}>
                      <span style={{ fontSize: 13 }}>{f.emoji}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: f.color }}>{f.label}</span>
                      {f.mode === "flat" && (
                        <span style={{ marginLeft: "auto", fontSize: 9.5, fontWeight: 700,
                          background: f.bg, color: f.color, border: `1px solid ${f.borderCol}`,
                          padding: "1px 6px", borderRadius: 100 }}>เหมา</span>
                      )}
                    </div>

                    {f.mode === "flat" ? (
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: f.color }}>
                        {baht(f.flat)}
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: 10.5, color: "var(--ink-3)", marginBottom: 3 }}>
                          <span className="num">{f.prev}</span>
                          <span style={{ margin: "0 4px", color: "var(--ink-4)" }}>→</span>
                          <span className="num" style={{ fontWeight: 700, color: "var(--ink)" }}>{f.cur}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <span style={{ fontSize: 10.5, color: "var(--ink-3)" }}>
                            <span className="num" style={{ fontWeight: 700, color: f.color }}>{f.use}</span> หน่วย
                          </span>
                          <span className="num" style={{ fontSize: 13, fontWeight: 800, color: f.color }}>
                            {baht(f.amt)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary footer */}
      {footerDone > 0 && (
        <div style={{ marginTop: 16, padding: "12px 14px", background: "var(--surface)",
          border: "1px solid var(--line)", borderRadius: 14,
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600 }}>
              รวม {footerDone} ห้อง · ⚡ {footerElec} หน่วย · 💧 {footerWater} หน่วย
            </div>
            <div className="num" style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)", marginTop: 2 }}>
              {baht(footerAmt)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Mobile Flat-Rate Billing Page ──────────────────────────────────────────
function MFlatRatePage({ onBack }) {
  const { rooms, tenants, billing, setRoomBilling, curY, curM } = useData();
  const [year, setYear]   = useState(curY);
  const [month, setMonth] = useState(curM);

  const byNum = (a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true });
  const occupied = [...rooms].filter(r => r.status === "ไม่ว่าง").sort(byNum);

  const ELC = "oklch(0.50 0.15 80)";
  const WTR = "oklch(0.40 0.13 230)";

  const modeBtn = (active, color) => ({
    flex: 1, padding: "8px 0", borderRadius: 9, fontSize: 12.5, fontWeight: 700,
    cursor: "pointer", border: `1px solid ${active ? color : "var(--line)"}`,
    background: active ? color + "18" : "transparent",
    color: active ? color : "var(--ink-4)",
  });

  return (
    <div style={{ padding: "12px 16px 90px" }}>
      {/* Back */}
      <button onClick={onBack} style={{ background: "transparent", border: "none", color: "var(--ink-2)",
        cursor: "pointer", fontSize: 12.5, fontWeight: 700, padding: 0, marginBottom: 14,
        display: "flex", alignItems: "center", gap: 4 }}>
        <IconArrowLeft size={14} stroke="var(--ink-2)"/> กลับ
      </button>

      <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.3, marginBottom: 4 }}>ตั้งค่าเหมาจ่ายน้ำ-ไฟ</div>
      <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginBottom: 16 }}>กำหนดรูปแบบการเก็บค่าน้ำ-ไฟรายห้อง</div>

      {/* Month / Year selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <select value={month} onChange={e => setMonth(+e.target.value)} style={{
          flex: 1, padding: "10px 12px", borderRadius: 11, border: "1px solid var(--line)",
          fontSize: 14, background: "var(--surface)", color: "var(--ink)", cursor: "pointer",
        }}>
          {MONTHS_TH.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <input type="number" value={year} onChange={e => setYear(+e.target.value)} min={2020} max={curY + 2}
          style={{ width: 80, padding: "10px 12px", borderRadius: 11, border: "1px solid var(--line)",
            fontSize: 14, background: "var(--surface)", color: "var(--ink)", textAlign: "center" }}/>
      </div>

      {/* Room cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {occupied.map(r => {
          const key   = `${r.id}|${year}|${month}`;
          const b     = billing.monthly[key] || {};
          const eMode = b.elecMode  || "metered";
          const wMode = b.waterMode || "metered";
          const eFlat = b.elecFlat  ?? billing.defaultElecFlat;
          const wFlat = b.waterFlat ?? billing.defaultWaterFlat;
          const t     = tenants.find(x => x.room === r.id);
          const setE  = (patch) => setRoomBilling(r.id, patch, year, month);
          const setW  = (patch) => setRoomBilling(r.id, patch, year, month);

          return (
            <div key={r.id} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 14 }}>
              {/* Room header */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div className="num" style={{ width: 44, height: 44, borderRadius: 11, background: "var(--brand-soft)",
                  color: "var(--brand-ink)", display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                  {r.id}
                  <span style={{ fontSize: 9, fontWeight: 500, opacity: 0.65 }}>ชั้น {r.floor}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{t?.name || "—"}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 1 }}>{baht(r.price)}/เดือน</div>
                </div>
              </div>

              {/* Electric */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: ELC, marginBottom: 6 }}>⚡ ค่าไฟฟ้า</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setE({ elecMode: "metered" })} style={modeBtn(eMode === "metered", ELC)}>จดมิเตอร์</button>
                  <button onClick={() => setE({ elecMode: "flat" })}    style={modeBtn(eMode === "flat",    ELC)}>เหมาจ่าย</button>
                </div>
                {eMode === "flat" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                    <div style={{ fontSize: 12, color: "var(--ink-3)" }}>เหมาจ่าย</div>
                    <input type="number" value={eFlat} onChange={e => setE({ elecFlat: +e.target.value })}
                      style={{ width: 90, padding: "8px 10px", borderRadius: 9, border: `1.5px solid ${ELC}`,
                        fontSize: 14, fontWeight: 700, color: ELC, outline: "none", textAlign: "center",
                        background: "oklch(0.98 0.02 80)" }}/>
                    <div style={{ fontSize: 12, color: "var(--ink-3)" }}>บาท/เดือน</div>
                  </div>
                )}
              </div>

              {/* Water */}
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: WTR, marginBottom: 6 }}>💧 ค่าน้ำประปา</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setW({ waterMode: "metered" })} style={modeBtn(wMode === "metered", WTR)}>จดมิเตอร์</button>
                  <button onClick={() => setW({ waterMode: "flat" })}    style={modeBtn(wMode === "flat",    WTR)}>เหมาจ่าย</button>
                </div>
                {wMode === "flat" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                    <div style={{ fontSize: 12, color: "var(--ink-3)" }}>เหมาจ่าย</div>
                    <input type="number" value={wFlat} onChange={e => setW({ waterFlat: +e.target.value })}
                      style={{ width: 90, padding: "8px 10px", borderRadius: 9, border: `1.5px solid ${WTR}`,
                        fontSize: 14, fontWeight: 700, color: WTR, outline: "none", textAlign: "center",
                        background: "oklch(0.97 0.015 230)" }}/>
                    <div style={{ fontSize: 12, color: "var(--ink-3)" }}>บาท/เดือน</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {occupied.length === 0 && (
          <div style={{ padding: "40px 0", textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>
            ยังไม่มีห้องที่มีผู้เช่า
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Mobile Repairs Page ────────────────────────────────────────────────────
function MRepairsPage({ onBack }) {
  const { repairs, updateRepair, deleteRepair, addRepair } = useData();
  const [selId, setSelId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addIssue, setAddIssue] = useState("");
  const [addRoom, setAddRoom] = useState("");

  const [confirmDel, setConfirmDel] = useState(false);

  const sel = selId ? repairs.find(r => r.id === selId) : null;
  const sorted = [...repairs].sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));

  const statusColors = {
    "รอดำเนินการ":   ["var(--warn-soft)", "var(--warn)"],
    "กำลังดำเนินการ": ["var(--info-soft)", "var(--info)"],
    "เสร็จแล้ว":     ["var(--ok-soft)",   "var(--ok)"],
  };

  // Month grouping helpers
  const mKey = r => r.created_at ? r.created_at.slice(0, 7) : "0000-00";
  const mLabel = key => {
    if (key === "0000-00") return "ไม่ระบุวันที่";
    const [y, m] = key.split("-").map(Number);
    return dl(y, m - 1);
  };
  const grouped = (() => {
    const map = {};
    sorted.forEach(r => { const k = mKey(r); if (!map[k]) map[k] = []; map[k].push(r); });
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
  })();

  if (sel) {
    const sc = statusColors[sel.status] || statusColors["รอดำเนินการ"];
    return (
      <div style={{ padding: "12px 16px 90px" }}>
        <button onClick={() => { setSelId(null); setConfirmDel(false); }} style={{ background: "transparent", border: "none", color: "var(--ink-2)",
          cursor: "pointer", fontSize: 12.5, fontWeight: 700, padding: 0, marginBottom: 14,
          display: "flex", alignItems: "center", gap: 4 }}>
          <IconArrowLeft size={14} stroke="var(--ink-2)"/> กลับรายการซ่อม
        </button>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: 16, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <span className="num" style={{ fontWeight: 700, fontSize: 13 }}>{sel.room_id}</span>
            <span style={{ background: sc[0], color: sc[1], fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 100 }}>{sel.status}</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.5 }}>{sel.issue}</div>
          <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 8 }}>แจ้ง {sel.created_at}</div>
          {sel.assigned && <div style={{ fontSize: 11.5, color: "var(--ink-2)", marginTop: 4 }}>ช่าง: {sel.assigned}</div>}
          {sel.eta && <div style={{ fontSize: 11.5, color: "var(--ink-2)", marginTop: 2 }}>กำหนดเสร็จ: {sel.eta}</div>}
          {sel.note && (
            <div style={{ marginTop: 10, padding: "10px 12px", background: "var(--surface-2)", borderRadius: 10, fontSize: 12, color: "var(--ink-2)" }}>
              📝 {sel.note}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sel.status === "รอดำเนินการ" && (
            <button onClick={() => updateRepair(sel.id, { status: "กำลังดำเนินการ" })} style={{
              padding: "13px 0", borderRadius: 14, border: "none", background: "var(--info)", color: "white",
              fontWeight: 700, fontSize: 13.5, cursor: "pointer",
            }}>▶ เริ่มดำเนินการ</button>
          )}
          {sel.status === "กำลังดำเนินการ" && (
            <button onClick={() => updateRepair(sel.id, { status: "เสร็จแล้ว", done_at: new Date().toISOString().slice(0,10) })} style={{
              padding: "13px 0", borderRadius: 14, border: "none", background: "var(--ok)", color: "white",
              fontWeight: 700, fontSize: 13.5, cursor: "pointer",
            }}>✓ ปิดงาน (เสร็จแล้ว)</button>
          )}
          {sel.status !== "เสร็จแล้ว" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 4, fontWeight: 600 }}>ชื่อช่าง</div>
                <input value={sel.assigned || ""} onChange={e => updateRepair(sel.id, { assigned: e.target.value })} style={{
                  width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--line)",
                  background: "var(--surface-2)", fontSize: 13, color: "var(--ink)", outline: "none", boxSizing: "border-box",
                }}/>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 4, fontWeight: 600 }}>กำหนดเสร็จ</div>
                <input type="date" value={sel.eta || ""} onChange={e => updateRepair(sel.id, { eta: e.target.value })} style={{
                  width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--line)",
                  background: "var(--surface-2)", fontSize: 13, color: "var(--ink)", outline: "none", boxSizing: "border-box",
                }}/>
              </div>
            </div>
          )}
          {/* Delete button — only for completed repairs */}
          {sel.status === "เสร็จแล้ว" && (
            <button onClick={() => {
              if (confirmDel) { deleteRepair(sel.id); setSelId(null); setConfirmDel(false); }
              else { setConfirmDel(true); setTimeout(() => setConfirmDel(false), 3000); }
            }} style={{
              padding: "13px 0", borderRadius: 14, border: "none", cursor: "pointer",
              background: confirmDel ? "var(--danger)" : "var(--surface-2)",
              color: confirmDel ? "white" : "var(--ink-3)",
              fontWeight: 700, fontSize: 13.5,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <IconTrash size={16} stroke={confirmDel ? "white" : "var(--ink-3)"}/>
              {confirmDel ? "กดอีกครั้งเพื่อยืนยันการลบ" : "ลบรายการนี้"}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "12px 16px 90px" }}>
      <button onClick={onBack} style={{ background: "transparent", border: "none", color: "var(--ink-2)",
        cursor: "pointer", fontSize: 12.5, fontWeight: 700, padding: 0, marginBottom: 14,
        display: "flex", alignItems: "center", gap: 4 }}>
        <IconArrowLeft size={14} stroke="var(--ink-2)"/> กลับ
      </button>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.3 }}>ซ่อมบำรุง</div>
        <button onClick={() => setShowAdd(true)} style={{
          background: "var(--brand)", color: "white", border: "none", borderRadius: 10, padding: "8px 14px",
          fontWeight: 700, fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
        }}><IconPlus size={14} stroke="white"/> เพิ่มงาน</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 14 }}>
        {[["รอดำเนินการ","warn"],["กำลังดำเนินการ","info"],["เสร็จแล้ว","ok"]].map(([s, t]) => {
          const n = repairs.filter(r => r.status === s).length;
          const tc = { warn: ["var(--warn-soft)","var(--warn)"], info: ["var(--info-soft)","var(--info)"], ok: ["var(--ok-soft)","var(--ok)"] }[t];
          return (
            <div key={s} style={{ background: tc[0], borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
              <div className="num" style={{ fontSize: 20, fontWeight: 700, color: tc[1] }}>{n}</div>
              <div style={{ fontSize: 9.5, color: tc[1], fontWeight: 600, marginTop: 4, lineHeight: 1.3 }}>{s}</div>
            </div>
          );
        })}
      </div>

      {showAdd && (
        <div className="screen-in" style={{ background: "var(--surface)", border: "1px dashed var(--brand)", borderRadius: 14, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 10 }}>เพิ่มงานซ่อม</div>
          <input value={addRoom} onChange={e => setAddRoom(e.target.value)} placeholder="เลขห้อง เช่น A101" style={{
            width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--line)",
            background: "var(--surface-2)", fontSize: 13, color: "var(--ink)", outline: "none", boxSizing: "border-box", marginBottom: 8,
          }}/>
          <textarea value={addIssue} onChange={e => setAddIssue(e.target.value)} placeholder="รายละเอียดปัญหา..."
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--line)",
              background: "var(--surface-2)", fontSize: 13, color: "var(--ink)", outline: "none", boxSizing: "border-box", height: 70, resize: "none", fontFamily: "var(--font-thai)" }}/>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={() => { setShowAdd(false); setAddIssue(""); setAddRoom(""); }} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid var(--line)", background: "var(--surface-2)", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "var(--ink-2)" }}>ยกเลิก</button>
            <button onClick={() => {
              if (addRoom && addIssue.trim()) {
                addRepair({ room_id: addRoom, issue: addIssue.trim() });
                setShowAdd(false); setAddIssue(""); setAddRoom("");
              }
            }} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "var(--brand)", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ เพิ่มงาน</button>
          </div>
        </div>
      )}

      {/* List grouped by month */}
      {grouped.map(([key, items]) => (
        <div key={key}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "16px 0 8px" }}>
            <span style={{ flex: 1, height: 1, background: "var(--line)" }}/>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", letterSpacing: 0.5 }}>
              {mLabel(key)} · {items.length} รายการ
            </span>
            <span style={{ flex: 1, height: 1, background: "var(--line)" }}/>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {items.map(r => {
              const sc = statusColors[r.status] || statusColors["รอดำเนินการ"];
              return (
                <button key={r.id} onClick={() => setSelId(r.id)} className="lift" style={{
                  display: "flex", alignItems: "flex-start", gap: 12, padding: 12,
                  background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14,
                  cursor: "pointer", textAlign: "left", width: "100%",
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: sc[0], display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <IconWrench size={18} stroke={sc[1]}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <span className="num" style={{ fontSize: 12, fontWeight: 700 }}>{r.room_id}</span>
                      <span style={{ background: sc[0], color: sc[1], fontSize: 9.5, fontWeight: 700, padding: "1px 7px", borderRadius: 100 }}>{r.status}</span>
                      {r.priority === "สูง" && <span style={{ color: "var(--danger)", fontSize: 9.5, fontWeight: 700 }}>🔴 เร่งด่วน</span>}
                    </div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.issue}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{r.created_at}</div>
                  </div>
                  <IconChevR size={14} stroke="var(--ink-3)" style={{ flexShrink: 0, marginTop: 4 }}/>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {repairs.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--ink-4)", fontSize: 13 }}>
          ยังไม่มีรายการแจ้งซ่อม
        </div>
      )}
    </div>
  );
}

// ─── Meter-only staff view ─────────────────────────────────────────────
// A trimmed shell for staff with role='meter'. The bulk meter reading
// interface is the entire app — closing it logs the user out.
function MeterOnlyView({ staffName, owner, onLogout }) {
  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "var(--bg)",
      display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "14px 18px", background: "var(--surface)",
        borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--brand-soft)",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconSparkle size={16} stroke="var(--brand)"/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600 }}>โหมดจดมิเตอร์</div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {staffName || owner?.dorm || "ผู้จดมิเตอร์"}
          </div>
        </div>
        <button onClick={onLogout} style={{ background: "transparent", border: "1px solid var(--line)",
          borderRadius: 10, padding: "7px 11px", cursor: "pointer", display: "flex",
          alignItems: "center", gap: 6, fontSize: 12, color: "var(--ink-2)" }}>
          <IconLogout size={13}/> ออก
        </button>
      </div>
      <BulkMeterModal onClose={onLogout}/>
    </div>
  );
}
