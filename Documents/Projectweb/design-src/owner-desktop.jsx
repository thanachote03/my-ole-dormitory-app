// ─── Desktop · Owner Dashboard ───────────────────────────────────────────
const { useState: dState, useMemo: dMemo } = React;
const DDI = window.DI;
const DSEED = window.SEED;

function OwnerDesktop({ initialTab = "overview" }) {
  const [tab, setTab] = dState(initialTab);
  const [tenantSel, setTenantSel] = dState(null);

  return (
    <div style={{ width: 1280, height: 800, background: "var(--bg)", display: "flex",
      borderRadius: 18, overflow: "hidden", border: "1px solid var(--line-2)", boxShadow: "var(--sh-3)" }}>
      {/* Sidebar */}
      <Sidebar tab={tab} setTab={setTab}/>
      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar setTab={setTab}/>
        <div style={{ flex: 1, overflow: "auto", padding: "20px 32px 32px", background: "var(--bg)" }} className="screen-in" key={tab}>
          {tab === "overview" && <Overview onOpenTenant={(t) => { setTenantSel(t); setTab("tenants"); }} setTab={setTab}/>}
          {tab === "tenants"  && <TenantsPage initial={tenantSel} onClear={() => setTenantSel(null)}/>}
          {tab === "rooms"    && <RoomsPage/>}
          {tab === "slips"    && <SlipsPage/>}
          {tab === "utility"  && <UtilityPage/>}
          {tab === "repairs"  && <RepairsPage/>}
          {tab === "history"  && <HistoryPage/>}
        </div>
      </div>
    </div>
  );
}

function Sidebar({ tab, setTab }) {
  const items = [
    { id: "overview", label: "ภาพรวม",  icon: DDI.IconChart },
    { id: "tenants",  label: "ผู้เช่า",  icon: DDI.IconUsers, badge: DSEED.SEED_TENANTS.length },
    { id: "rooms",    label: "ห้องพัก",  icon: DDI.IconBuilding, badge: DSEED.SEED_ROOMS.length },
    { id: "slips",    label: "อนุมัติสลิป", icon: DDI.IconCard, badge: DSEED.SEED_SLIPS.filter(s=>s.status==="pending").length, highlight: true },
    { id: "utility",  label: "ค่าน้ำค่าไฟ", icon: DDI.IconSparkle },
    { id: "repairs",  label: "ซ่อมบำรุง", icon: DDI.IconWrench, dot: true },
    { id: "history",  label: "รายงาน",  icon: DDI.IconTrend },
  ];
  return (
    <div style={{ width: 248, background: "var(--surface)", borderRight: "1px solid var(--line)",
      display: "flex", flexDirection: "column", padding: "22px 16px 16px" }}>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 6px 22px" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--brand)",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <DDI.IconBuilding size={20} stroke="white" strokeWidth={2}/>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: -0.2 }}>Baan<span style={{color:"var(--brand)"}}>.</span></div>
          <div style={{ fontSize: 11, color: "var(--ink-3)" }}>หอพักสุขใจ</div>
        </div>
      </div>

      {/* Nav */}
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

      {/* Bottom upsell */}
      <div style={{ background: "linear-gradient(150deg, var(--brand-soft), var(--sage-soft))",
        borderRadius: 14, padding: 14, position: "relative", overflow: "hidden" }}>
        <DDI.IconSparkle size={18} stroke="var(--brand)" style={{ marginBottom: 6 }}/>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", lineHeight: 1.3 }}>
          อัพเกรดเป็น Pro<br/>เพื่อรายงานละเอียดขึ้น
        </div>
        <button style={{ marginTop: 10, fontSize: 12, fontWeight: 700, padding: "6px 12px",
          borderRadius: 100, background: "var(--ink)", color: "white", border: "none", cursor: "pointer" }}>
          ดูแพ็คเกจ →
        </button>
      </div>

      {/* User */}
      <div style={{ marginTop: 12, padding: "10px 8px", display: "flex", alignItems: "center", gap: 10,
        borderTop: "1px solid var(--line)", paddingTop: 14 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--ink)",
          color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>ส</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600 }}>คุณสมพร</div>
          <div style={{ fontSize: 10.5, color: "var(--ink-3)" }}>เจ้าของหอพัก</div>
        </div>
        <DDI.IconSettings size={16} stroke="var(--ink-3)"/>
      </div>
    </div>
  );
}

function Topbar({ setTab }) {
  const [open, setOpen] = dState(false);
  const notifs = DSEED.SEED_NOTIFS;
  const unread = notifs.filter(n => n.unread).length;

  return (
    <div style={{ padding: "16px 32px", borderBottom: "1px solid var(--line)", background: "var(--surface)",
      display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--surface-2)",
        borderRadius: 12, padding: "9px 14px", flex: 1, maxWidth: 420, border: "1px solid var(--line)" }}>
        <DDI.IconSearch size={16} stroke="var(--ink-3)"/>
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
          <DDI.IconBell size={17} stroke={open ? "var(--brand)" : "var(--ink-2)"}/>
          {unread > 0 && (
            <span className="num" style={{ position: "absolute", top: -4, right: -4,
              minWidth: 18, height: 18, padding: "0 5px", borderRadius: 100, background: "var(--brand)",
              color: "white", fontSize: 10, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "2px solid var(--surface)",
            }}>{unread}</span>
          )}
        </button>

        {open && <NotifDropdown notifs={notifs} onPick={(n) => { setOpen(false); n.link && setTab?.(n.link); }} onClose={() => setOpen(false)}/>}
      </div>

      <button style={{ background: "var(--ink)", color: "white", border: "none", borderRadius: 11,
        padding: "9px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
        <DDI.IconPlus size={16} stroke="white"/> เพิ่มผู้เช่าใหม่
      </button>
    </div>
  );
}

function NotifDropdown({ notifs, onPick, onClose }) {
  const iconMap = { card: DDI.IconCard, wrench: DDI.IconWrench, bolt: DDI.IconSparkle };
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
          <button style={{ background: "transparent", border: "none", color: "var(--brand)",
            fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>อ่านทั้งหมด</button>
        </div>
        <div style={{ maxHeight: 380, overflow: "auto" }}>
          {notifs.map(n => {
            const Ic = iconMap[n.icon] || DDI.IconBell;
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
                <DDI.IconChevR size={14} stroke="var(--ink-4)" style={{ marginTop: 6 }}/>
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

// ─── OVERVIEW ───────────────────────────────────────────────────────────
function Overview({ onOpenTenant, setTab }) {
  const tenants = DSEED.SEED_TENANTS;
  const rooms = DSEED.SEED_ROOMS;
  const pays = DSEED.SEED_PAYMENTS;
  const pendingSlips = DSEED.SEED_SLIPS.filter(s => s.status === "pending");
  const occupied = rooms.filter(r => r.status === "ไม่ว่าง").length;
  const occRate = Math.round(occupied / rooms.length * 100);
  const monthRev = pays.filter(p => p.year === DSEED.CUR_Y && p.month === DSEED.CUR_M && p.status === "ชำระแล้ว").reduce((s,p)=>s+p.amount, 0);
  const monthDue = pays.filter(p => p.year === DSEED.CUR_Y && p.month === DSEED.CUR_M && p.status === "รอชำระ").reduce((s,p)=>s+p.amount, 0);
  const pendingCount = pays.filter(p => p.year === DSEED.CUR_Y && p.month === DSEED.CUR_M && p.status === "รอชำระ").length;

  // last 6 months revenue
  const series = [];
  for (let i = 5; i >= 0; i--) {
    let y = DSEED.CUR_Y, m = DSEED.CUR_M - i;
    while (m < 0) { m += 12; y--; }
    const rev = pays.filter(p => p.year === y && p.month === m && p.status === "ชำระแล้ว").reduce((s,p)=>s+p.amount,0);
    const due = pays.filter(p => p.year === y && p.month === m && p.status === "รอชำระ").reduce((s,p)=>s+p.amount,0);
    series.push({ y, m, rev, due });
  }
  const maxRev = Math.max(...series.map(s => s.rev + s.due)) * 1.1;

  return (
    <div>
      {/* Heading */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 500 }}>ภาพรวมเดือนนี้ · {dl(DSEED.CUR_Y, DSEED.CUR_M)}</div>
          <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4, letterSpacing: -0.6 }}>สวัสดีตอนเช้า, คุณสมพร <span style={{ fontSize: 26 }}>☀️</span></div>
          <div style={{ fontSize: 14, color: "var(--ink-3)", marginTop: 6 }}>
            มี <span style={{ color: "var(--brand)", fontWeight: 700 }}>{pendingCount} ห้อง</span> ยังไม่ชำระและงานซ่อม <span style={{ color: "var(--warn)", fontWeight: 700 }}>{DSEED.SEED_REPAIRS.filter(r=>r.status!=="เสร็จแล้ว").length} รายการ</span> รอดูแล
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 11,
            padding: "8px 14px", fontSize: 13, fontWeight: 600, color: "var(--ink-2)", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6 }}>
            <DDI.IconDownload size={15} stroke="var(--ink-2)"/> ส่งออก
          </button>
          <button style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 11,
            padding: "8px 14px", fontSize: 13, fontWeight: 600, color: "var(--ink-2)", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6 }}>
            <DDI.IconCal size={15} stroke="var(--ink-2)"/> พฤษภาคม 2026
          </button>
        </div>
      </div>

      {/* Pending slip alert */}
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
            <DDI.IconCard size={22} stroke="white"/>
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
            ตรวจสอบเลย <DDI.IconArrowRight size={15} stroke="white"/>
          </div>
        </button>
      )}

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        <KPI label="รายได้เดือนนี้"  value={baht(monthRev)} sub="+12.4% vs เดือนก่อน" trend="up" tone="brand"/>
        <KPI label="ค้างชำระ"         value={baht(monthDue)} sub={`${pendingCount} ห้องค้าง`}    trend="warn" tone="warn"/>
        <KPI label="อัตราเข้าพัก"     value={`${occRate}%`}  sub={`${occupied}/${rooms.length} ห้อง`}   trend="up" tone="sage"/>
        <KPI label="แจ้งซ่อมรอ"       value={DSEED.SEED_REPAIRS.filter(r=>r.status!=="เสร็จแล้ว").length}    sub="ดูทั้งหมด"                trend="link" tone="lilac"/>
      </div>

      {/* Chart + side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 18, marginBottom: 24 }}>
        {/* Revenue chart */}
        <Card title="รายได้ 6 เดือนล่าสุด" right={
          <div style={{ display: "flex", gap: 14, fontSize: 11.5, fontWeight: 600 }}>
            <LegendDot c="var(--brand)" label="ชำระแล้ว"/>
            <LegendDot c="var(--warn-soft)" label="ค้างชำระ" border="var(--warn)"/>
          </div>
        }>
          <div style={{ height: 220, display: "flex", alignItems: "flex-end", gap: 28, padding: "16px 8px 0" }}>
            {series.map((s, i) => {
              const totalH = (s.rev + s.due) / maxRev * 180;
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

        {/* Occupancy donut */}
        <Card title="สถานะห้องพัก">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Donut size={130} segments={[
              { value: occupied, color: "var(--brand)" },
              { value: rooms.length - occupied, color: "var(--sage-soft)" },
            ]} center={<>
              <div className="num" style={{ fontSize: 24, fontWeight: 700, lineHeight: 1 }}>{occRate}%</div>
              <div style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 3 }}>เข้าพัก</div>
            </>}/>
            <div style={{ flex: 1 }}>
              <LegendRow color="var(--brand)" label="มีผู้เช่า" value={occupied}/>
              <div style={{ height: 8 }}/>
              <LegendRow color="var(--sage)" label="ห้องว่าง" value={rooms.length - occupied}/>
              <div style={{ marginTop: 14, padding: "10px 12px", background: "var(--surface-2)", borderRadius: 10 }}>
                <div style={{ fontSize: 11, color: "var(--ink-3)" }}>ห้องว่างพร้อมเช่า</div>
                <div style={{ fontSize: 12.5, fontWeight: 700, marginTop: 2 }}>
                  {DSEED.SEED_ROOMS.filter(r=>r.status==="ว่าง").map(r=>r.id).join(", ") || "—"}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Pending + repairs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <Card title="ค้างชำระ" right={<a style={{ fontSize: 12, color: "var(--brand)", fontWeight: 600, cursor: "pointer" }}>ดูทั้งหมด →</a>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {tenants.filter(t => pays.find(p => p.room_id === t.room && p.year === DSEED.CUR_Y && p.month === DSEED.CUR_M && p.status === "รอชำระ"))
              .slice(0, 4).map(t => {
                const room = rooms.find(r => r.id === t.room);
                return (
                  <div key={t.id} className="lift" onClick={() => onOpenTenant?.(t)} style={{
                    padding: "10px 8px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
                    borderRadius: 10,
                  }}>
                    <Avatar name={t.name}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600 }}>{t.name}</div>
                      <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>ห้อง {t.room} · {room.type}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="num" style={{ fontSize: 13, fontWeight: 700, color: "var(--brand)" }}>{baht(room.price)}</div>
                      <div style={{ fontSize: 10.5, color: "var(--warn)", fontWeight: 700, marginTop: 2 }}>ค้าง 3 วัน</div>
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
        <Card title="งานซ่อมล่าสุด" right={<a style={{ fontSize: 12, color: "var(--brand)", fontWeight: 600, cursor: "pointer" }}>ดูทั้งหมด →</a>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {DSEED.SEED_REPAIRS.slice(0, 4).map(r => {
              const tone = r.status === "เสร็จแล้ว" ? "ok" : r.status === "กำลังดำเนินการ" ? "info" : "warn";
              const colors = { warn:["var(--warn-soft)","var(--warn)"], info:["var(--info-soft)","var(--info)"], ok:["var(--ok-soft)","var(--ok)"] }[tone];
              return (
                <div key={r.id} className="lift" style={{
                  padding: "10px 8px", display: "flex", alignItems: "center", gap: 12, borderRadius: 10, cursor: "pointer",
                }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: colors[0],
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <DDI.IconWrench size={16} stroke={colors[1]}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.issue}</div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>ห้อง {r.room_id} · {new Date(r.created_at).toLocaleDateString("th-TH",{day:"numeric",month:"short"})}</div>
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
  const total = segments.reduce((s, x) => s + x.value, 0);
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

function Avatar({ name, size = 36 }) {
  const colors = ["var(--brand)","var(--sage)","var(--lilac)","var(--warn)","var(--info)"];
  const hash = name.charCodeAt(0) + name.charCodeAt(1 || 0);
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
function TenantsPage({ initial, onClear }) {
  const [sel, setSel] = dState(initial || DSEED.SEED_TENANTS[0]);
  const [q, setQ] = dState("");
  const list = DSEED.SEED_TENANTS.filter(t => t.name.includes(q) || t.room.toLowerCase().includes(q.toLowerCase()));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 18, height: "100%" }}>
      {/* List column */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 18,
        display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>ผู้เช่า</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>{DSEED.SEED_TENANTS.length} คน · เดือน{MONTHS_TH[DSEED.CUR_M]}</div>
            </div>
            <button style={{ background: "var(--brand)", color: "white", border: "none", borderRadius: 10,
              padding: "8px 12px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
              <DDI.IconPlus size={14} stroke="white"/> เพิ่ม
            </button>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", background: "var(--surface-2)",
            borderRadius: 10, padding: "8px 12px", border: "1px solid var(--line)" }}>
            <DDI.IconSearch size={15} stroke="var(--ink-3)"/>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="ค้นหาชื่อ หรือเลขห้อง" style={{
              flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 13, color: "var(--ink)",
            }}/>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "8px 8px" }}>
          {list.map(t => {
            const room = DSEED.SEED_ROOMS.find(r => r.id === t.room);
            const pay = DSEED.SEED_PAYMENTS.find(p => p.room_id === t.room && p.year === DSEED.CUR_Y && p.month === DSEED.CUR_M);
            const paid = pay?.status === "ชำระแล้ว";
            const active = sel?.id === t.id;
            return (
              <button key={t.id} onClick={() => setSel(t)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 10px",
                background: active ? "var(--brand-soft)" : "transparent", border: "none",
                borderRadius: 12, cursor: "pointer", marginBottom: 2, textAlign: "left",
              }}>
                <Avatar name={t.name} size={40}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: active ? "var(--brand-ink)" : "var(--ink)" }}>{t.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>ห้อง {t.room} · {room.type}</div>
                </div>
                <span style={{ background: paid ? "var(--ok-soft)" : "var(--warn-soft)",
                  color: paid ? "var(--ok)" : "var(--warn)", fontSize: 10.5, fontWeight: 700,
                  padding: "2px 8px", borderRadius: 100 }}>{paid ? "✓" : "⏳"}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail column */}
      {sel && <TenantDetail tenant={sel}/>}
    </div>
  );
}

function TenantDetail({ tenant }) {
  const room = DSEED.SEED_ROOMS.find(r => r.id === tenant.room);
  const pays = DSEED.SEED_PAYMENTS.filter(p => p.room_id === tenant.room).sort((a,b) => b.year !== a.year ? b.year - a.year : b.month - a.month).slice(0, 8);

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 18,
      overflow: "auto", padding: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24 }}>
        <Avatar name={tenant.name} size={68}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.3 }}>{tenant.name}</div>
          <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4, display: "flex", gap: 14 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}><DDI.IconBuilding size={13} stroke="var(--ink-3)"/> ห้อง {tenant.room} ({room.type})</span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}><DDI.IconPhone size={13} stroke="var(--ink-3)"/> {tenant.phone}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}><DDI.IconCal size={13} stroke="var(--ink-3)"/> เข้าพักตั้งแต่ {dl(tenant.sinceY, tenant.sinceM)}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={detailBtn("ghost")}><DDI.IconEdit size={14}/> แก้ไข</button>
          <button style={detailBtn("primary")}><DDI.IconCard size={14} stroke="white"/> บันทึกการชำระ</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 22 }}>
        <MiniStat2 label="ค่าเช่า/เดือน" value={baht(room.price)} tone="brand"/>
        <MiniStat2 label="ชำระแล้ว" value={pays.filter(p=>p.status==="ชำระแล้ว").length} tone="ok"/>
        <MiniStat2 label="ค้างชำระ" value={pays.filter(p=>p.status==="รอชำระ").length} tone="warn"/>
        <MiniStat2 label="ระยะอยู่" value={`${Math.max(1, (DSEED.CUR_Y - tenant.sinceY)*12 + (DSEED.CUR_M - tenant.sinceM))} ด.`} tone="lilac"/>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16, borderBottom: "1px solid var(--line)" }}>
        {["ประวัติชำระ","ข้อมูลห้อง","เอกสาร"].map((t,i) => (
          <button key={t} style={{
            padding: "10px 16px", border: "none", background: "transparent", cursor: "pointer", fontSize: 13.5,
            fontWeight: i === 0 ? 700 : 500, color: i === 0 ? "var(--ink)" : "var(--ink-3)",
            borderBottom: i === 0 ? "2px solid var(--brand)" : "2px solid transparent", marginBottom: -1,
          }}>{t}</button>
        ))}
      </div>

      {/* Payment history table */}
      <div style={{ background: "var(--surface-2)", borderRadius: 14, overflow: "hidden", border: "1px solid var(--line)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 0.8fr 1fr 0.6fr", padding: "11px 16px",
          fontSize: 11.5, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: 0.8,
          borderBottom: "1px solid var(--line)" }}>
          <span>เดือน</span><span>จำนวน</span><span>สถานะ</span><span>วันที่ชำระ</span><span></span>
        </div>
        {pays.map((p, i) => {
          const paid = p.status === "ชำระแล้ว";
          return (
            <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 0.8fr 1fr 0.6fr",
              padding: "13px 16px", borderBottom: i < pays.length-1 ? "1px solid var(--line)" : "none",
              alignItems: "center", background: "var(--surface)", fontSize: 13 }}>
              <span style={{ fontWeight: 600 }}>{dl(p.year, p.month)}</span>
              <span className="num" style={{ fontWeight: 600 }}>{baht(p.amount)}</span>
              <span><span style={{ background: paid ? "var(--ok-soft)" : "var(--warn-soft)",
                color: paid ? "var(--ok)" : "var(--warn)", fontSize: 11, fontWeight: 700,
                padding: "3px 10px", borderRadius: 100 }}>{paid ? "✓ ชำระแล้ว" : "⏳ รอชำระ"}</span></span>
              <span className="num" style={{ color: "var(--ink-3)" }}>{p.paid_at || "—"}</span>
              <span style={{ textAlign: "right" }}>
                <button style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 12, color: "var(--brand)", fontWeight: 600 }}>
                  {paid ? "ใบเสร็จ" : "บันทึก"} →
                </button>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
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

// ─── ROOMS PAGE ──────────────────────────────────────────────────────────
function RoomsPage() {
  const rooms = DSEED.SEED_ROOMS;
  const tenants = DSEED.SEED_TENANTS;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.4 }}>ห้องพักทั้งหมด</div>
          <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>{rooms.length} ห้อง · {rooms.filter(r=>r.status==="ไม่ว่าง").length} มีผู้เช่า · {rooms.filter(r=>r.status==="ว่าง").length} ว่าง</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={detailBtn("ghost")}><DDI.IconFilter size={14}/> กรอง</button>
          <button style={detailBtn("primary")}><DDI.IconPlus size={14} stroke="white"/> เพิ่มห้องใหม่</button>
        </div>
      </div>

      {/* Floor groups */}
      {[1,2,3].map(floor => (
        <div key={floor} style={{ marginBottom: 26 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: 1 }}>ชั้น {floor}</div>
            <div style={{ flex: 1, height: 1, background: "var(--line)" }}/>
            <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{rooms.filter(r=>r.floor===floor).length} ห้อง</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
            {rooms.filter(r => r.floor === floor).map(room => {
              const tenant = tenants.find(t => t.room === room.id);
              const occ = room.status === "ไม่ว่าง";
              return (
                <div key={room.id} className="lift" style={{
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
                    {room.amenities.slice(0, 4).map(a => {
                      const Ic = amenityIcon(a);
                      return (
                        <span key={a} title={a} style={{ width: 24, height: 24, borderRadius: 6,
                          background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Ic size={13} stroke="var(--ink-3)"/>
                        </span>
                      );
                    })}
                    {room.amenities.length > 4 && (
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
    </div>
  );
}

// ─── REPAIRS PAGE (with response / completion details) ───────────────────
function RepairsPage() {
  const [repairs, setRepairs] = dState(DSEED.SEED_REPAIRS);
  const [sel, setSel] = dState(repairs[0]);
  const cols = ["รอดำเนินการ","กำลังดำเนินการ","เสร็จแล้ว"];

  const advance = (r) => {
    const next = r.status === "รอดำเนินการ" ? "กำลังดำเนินการ" : "เสร็จแล้ว";
    const today = `2026-05-21`;
    const updated = { ...r, status: next, ...(next === "เสร็จแล้ว" ? { done_at: today } : {}) };
    setRepairs(repairs.map(x => x.id === r.id ? updated : x));
    setSel(updated);
  };
  const setRepair = (patch) => {
    const u = { ...sel, ...patch };
    setRepairs(repairs.map(x => x.id === sel.id ? u : x));
    setSel(u);
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
          <button style={detailBtn("ghost")}><DDI.IconFilter size={14}/> กรอง</button>
          <button style={detailBtn("primary")}><DDI.IconPlus size={14} stroke="white"/> เพิ่มงาน</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 16, height: "calc(100% - 80px)" }}>
        {/* Kanban */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, overflow: "auto", alignContent: "start" }}>
          {cols.map(status => {
            const items = repairs.filter(r => r.status === status);
            const tone = status === "เสร็จแล้ว" ? "ok" : status === "กำลังดำเนินการ" ? "info" : "warn";
            const colors = { warn:["var(--warn-soft)","var(--warn)"], info:["var(--info-soft)","var(--info)"], ok:["var(--ok-soft)","var(--ok)"] }[tone];
            return (
              <div key={status} style={{ background: "var(--surface-2)", borderRadius: 16, padding: 12, border: "1px solid var(--line)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "0 4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: colors[1] }}/>
                    <span style={{ fontSize: 12.5, fontWeight: 700 }}>{status}</span>
                  </div>
                  <span className="num" style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)",
                    background: "var(--surface)", padding: "2px 8px", borderRadius: 100 }}>{items.length}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {items.length === 0 && (
                    <div style={{ padding: "20px 14px", textAlign: "center", fontSize: 11.5, color: "var(--ink-4)" }}>
                      ไม่มีรายการ
                    </div>
                  )}
                  {items.map(r => {
                    const active = sel?.id === r.id;
                    return (
                      <button key={r.id} onClick={() => setSel(r)} className="lift" style={{
                        background: "var(--surface)", border: `1px solid ${active ? "var(--brand)" : "var(--line)"}`,
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
                            <DDI.IconClock size={11} stroke="var(--ink-4)"/>
                            {r.done_at ? `เสร็จ ${r.done_at.slice(8)}/${r.done_at.slice(5,7)}` : new Date(r.created_at).toLocaleDateString("th-TH",{day:"numeric",month:"short"})}
                          </div>
                          {r.assigned ? (
                            <span style={{ fontSize: 10, color: "var(--ink-3)", background: "var(--surface-2)", padding: "2px 7px", borderRadius: 100, fontWeight: 600 }}>{r.assigned}</span>
                          ) : <span style={{ fontSize: 10, color: "var(--warn)", fontWeight: 700 }}>ยังไม่มอบหมาย</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        {sel ? <RepairDetail r={sel} onAdvance={() => advance(sel)} onUpdate={setRepair}/> :
          <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 18,
            display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-3)" }}>เลือกงานเพื่อตอบกลับ</div>}
      </div>
    </div>
  );
}

function RepairDetail({ r, onAdvance, onUpdate }) {
  const tone = r.status === "เสร็จแล้ว" ? "ok" : r.status === "กำลังดำเนินการ" ? "info" : "warn";
  const colors = { warn:["var(--warn-soft)","var(--warn)"], info:["var(--info-soft)","var(--info)"], ok:["var(--ok-soft)","var(--ok)"] }[tone];
  const advanceLabel = r.status === "รอดำเนินการ" ? "เริ่มดำเนินการ" : r.status === "กำลังดำเนินการ" ? "ปิดงาน (เสร็จแล้ว)" : "เปิดงานใหม่";
  const tenant = DSEED.SEED_TENANTS.find(t => t.room === r.room_id);

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
          <DDI.IconClock size={12} stroke="var(--ink-4)"/>
          แจ้งเมื่อ {new Date(r.created_at).toLocaleDateString("th-TH",{day:"numeric",month:"long",year:"numeric"})}
        </div>
      </div>

      {/* Timeline */}
      <div style={{ position: "relative", paddingLeft: 18 }}>
        <div style={{ position: "absolute", left: 5, top: 6, bottom: 6, width: 2, background: "var(--line)" }}/>
        <TimelineEvent icon="📩" title="ผู้เช่าแจ้งซ่อม" sub={new Date(r.created_at).toLocaleDateString("th-TH",{day:"numeric",month:"short",year:"numeric"})} done/>
        <TimelineEvent icon="👷" title={r.assigned ? `มอบหมาย ${r.assigned}` : "ยังไม่มอบหมาย"} sub={r.assigned ? "เจ้าของหอกดมอบหมาย" : "—"} done={!!r.assigned}/>
        <TimelineEvent icon="🛠️" title="เริ่มดำเนินการ" sub={r.status !== "รอดำเนินการ" ? "ตามนัด" : "รอดำเนินการ"} done={r.status !== "รอดำเนินการ"}/>
        <TimelineEvent icon="✅" title="เสร็จสิ้น" sub={r.done_at ? new Date(r.done_at).toLocaleDateString("th-TH",{day:"numeric",month:"long",year:"numeric"}) : (r.eta ? `กำหนดเสร็จ ${r.eta}` : "ยังไม่ระบุ")} done={r.status === "เสร็จแล้ว"} last/>
      </div>

      {/* Owner reply form */}
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
        <button style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: "1px solid var(--line)",
          background: "var(--surface)", color: "var(--ink-2)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
          ส่งข้อความหาผู้เช่า
        </button>
        <button onClick={onAdvance} style={{ flex: 1.4, padding: "12px 0", borderRadius: 12, border: "none",
          background: r.status === "เสร็จแล้ว" ? "var(--ink-3)" : "var(--ok)",
          color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <DDI.IconCheck size={15} stroke="white"/> {advanceLabel}
        </button>
      </div>
    </div>
  );
}

function TimelineEvent({ icon, title, sub, done, last }) {
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

// ─── HISTORY PAGE ────────────────────────────────────────────────────────
function HistoryPage() {
  const pays = DSEED.SEED_PAYMENTS;
  const months = [];
  for (let m = 0; m <= DSEED.CUR_M; m++) {
    const ms = pays.filter(p => p.year === DSEED.CUR_Y && p.month === m);
    const rev = ms.filter(p => p.status === "ชำระแล้ว").reduce((s,p)=>s+p.amount, 0);
    const due = ms.filter(p => p.status === "รอชำระ").reduce((s,p)=>s+p.amount, 0);
    months.push({ m, rev, due, paid: ms.filter(p => p.status === "ชำระแล้ว").length, total: ms.length });
  }
  const total = months.reduce((s,m) => s + m.rev, 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.4 }}>รายงานรายได้</div>
          <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>ปี 2026 · รวม {baht(total)}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={detailBtn("ghost")}>‹ 2025</button>
          <button style={{ ...detailBtn("primary"), background: "var(--brand)" }}>2026</button>
          <button style={detailBtn("ghost")}>2027 ›</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        <KPI label="รายได้รวมปีนี้" value={baht(total)} sub="เทียบปีก่อน +18%" trend="up" tone="brand"/>
        <KPI label="ค่าเฉลี่ย/เดือน" value={baht(Math.round(total / months.length))} sub={`จาก ${months.length} เดือน`} trend="up" tone="sage"/>
        <KPI label="ยังค้างเก็บ" value={baht(months.reduce((s,m)=>s+m.due,0))} sub="ปี 2026" trend="warn" tone="warn"/>
        <KPI label="อัตราเก็บได้" value="92%" sub="ของยอดรวม" trend="up" tone="lilac"/>
      </div>

      <Card title="รายได้รายเดือน · 2026">
        <div style={{ background: "var(--surface-2)", borderRadius: 14, overflow: "hidden", border: "1px solid var(--line)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr", padding: "12px 18px",
            fontSize: 11.5, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: 0.8,
            borderBottom: "1px solid var(--line)" }}>
            <span>เดือน</span><span>กราฟ</span><span>รายได้</span><span>ค้างชำระ</span><span style={{textAlign:"right"}}>เก็บได้</span>
          </div>
          {months.slice().reverse().map((mo, i) => {
            const max = Math.max(...months.map(x => x.rev + x.due));
            const pct = (mo.rev + mo.due) / max;
            const revPct = max ? mo.rev / max : 0;
            return (
              <div key={mo.m} style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr",
                padding: "14px 18px", borderBottom: i < months.length-1 ? "1px solid var(--line)" : "none",
                alignItems: "center", background: "var(--surface)", fontSize: 13 }}>
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
    </div>
  );
}

// ─── SLIPS PAGE (Owner approves slip uploads) ────────────────────────────
function SlipsPage() {
  const [slips, setSlips] = dState(DSEED.SEED_SLIPS);
  const [sel, setSel] = dState(slips.find(s => s.status === "pending"));
  const [filter, setFilter] = dState("pending");

  const list = slips.filter(s => filter === "all" || s.status === filter);
  const tenant = sel ? DSEED.SEED_TENANTS.find(t => t.id === sel.tenant_id) : null;

  const approve = () => {
    if (!sel) return;
    setSlips(slips.map(s => s.id === sel.id ? { ...s, status: "approved" } : s));
    setSel({ ...sel, status: "approved" });
  };
  const reject = () => {
    if (!sel) return;
    setSlips(slips.map(s => s.id === sel.id ? { ...s, status: "rejected" } : s));
    setSel({ ...sel, status: "rejected" });
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
        <div style={{ display: "flex", gap: 6 }}>
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
        {/* List */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 18, overflow: "hidden",
          display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)", fontSize: 13, fontWeight: 700, color: "var(--ink-2)" }}>
            สลิปทั้งหมด ({list.length})
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: 8 }}>
            {list.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>ไม่มีรายการ</div>}
            {list.map(s => {
              const t = DSEED.SEED_TENANTS.find(x => x.id === s.tenant_id);
              const active = sel?.id === s.id;
              const tone = s.status === "pending" ? "warn" : s.status === "approved" ? "ok" : "danger";
              const colors = { warn:["var(--warn-soft)","var(--warn)"], ok:["var(--ok-soft)","var(--ok)"], danger:["var(--danger-soft)","var(--danger)"] }[tone];
              return (
                <button key={s.id} onClick={() => setSel(s)} style={{
                  width: "100%", padding: 12, marginBottom: 4, borderRadius: 12, textAlign: "left", cursor: "pointer",
                  background: active ? "var(--brand-soft)" : "transparent", border: "none",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <SlipThumb id={s.thumb} status={s.status}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700 }}>{t.name}</div>
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

        {/* Detail */}
        {sel && tenant ? (
          <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 18, padding: 24, overflow: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <Avatar name={tenant.name} size={48}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.2 }}>{tenant.name}</div>
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
              {/* Slip image */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>สลิปการโอน</div>
                <SlipMock {...sel} tenant={tenant}/>
              </div>

              {/* Info + actions */}
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
                  <DDI.IconBell size={16} stroke="var(--brand)"/>
                  <div style={{ fontSize: 12, color: "var(--brand-ink)", lineHeight: 1.5 }}>
                    การอนุมัติจะอัปเดตสถานะการชำระเงินของผู้เช่าทันที และส่งการแจ้งเตือนกลับไปยังผู้เช่า
                  </div>
                </div>

                {sel.status === "pending" ? (
                  <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
                    <button onClick={reject} style={{
                      flex: 1, padding: "12px 0", borderRadius: 12, border: "1px solid var(--danger-soft)",
                      background: "var(--surface)", color: "var(--danger)", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}><DDI.IconX size={15} stroke="var(--danger)"/> ไม่อนุมัติ</button>
                    <button onClick={approve} style={{
                      flex: 2, padding: "12px 0", borderRadius: 12, border: "none",
                      background: "var(--ok)", color: "white", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}><DDI.IconCheck size={15} stroke="white"/> ยืนยันการชำระเงิน</button>
                  </div>
                ) : (
                  <div style={{ marginTop: 18, padding: "12px 14px", borderRadius: 12,
                    background: sel.status === "approved" ? "var(--ok-soft)" : "var(--danger-soft)",
                    color:      sel.status === "approved" ? "var(--ok)"      : "var(--danger)",
                    fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                    {sel.status === "approved" ? <DDI.IconCheck size={16} stroke="var(--ok)"/> : <DDI.IconX size={16} stroke="var(--danger)"/>}
                    {sel.status === "approved" ? "ยืนยันการชำระเงินเรียบร้อย — ผู้เช่าได้รับการแจ้งเตือนแล้ว" : "ไม่อนุมัติ — โปรดติดต่อผู้เช่าให้แนบสลิปใหม่"}
                  </div>
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

function SlipThumb({ id, status }) {
  // Tiny faux slip thumbnail (gradient + lines)
  const grad = id === "slip-a" ? ["#a8d5b1","#5da375"]
             : id === "slip-b" ? ["#b8a1d3","#7e5fb0"]
             : ["#f1b89a","#d18467"];
  return (
    <div style={{
      width: 52, height: 64, borderRadius: 8, overflow: "hidden", flexShrink: 0,
      background: `linear-gradient(140deg, ${grad[0]}, ${grad[1]})`,
      position: "relative", boxShadow: "var(--sh-1)", border: "1px solid var(--line)",
    }}>
      <svg viewBox="0 0 52 64" width="52" height="64">
        <rect x="6" y="8"  width="20" height="2.5" rx="1" fill="rgba(255,255,255,0.5)"/>
        <rect x="6" y="14" width="32" height="2"   rx="1" fill="rgba(255,255,255,0.35)"/>
        <rect x="6" y="20" width="28" height="2"   rx="1" fill="rgba(255,255,255,0.35)"/>
        <rect x="6" y="34" width="40" height="9"   rx="2" fill="rgba(255,255,255,0.55)"/>
        <rect x="6" y="48" width="18" height="2"   rx="1" fill="rgba(255,255,255,0.35)"/>
        <rect x="6" y="54" width="26" height="2"   rx="1" fill="rgba(255,255,255,0.35)"/>
      </svg>
      {status === "approved" && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(34,139,90,0.55)",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <DDI.IconCheck size={20} stroke="white" strokeWidth={3}/>
        </div>
      )}
    </div>
  );
}

function SlipMock({ amount, year, month, bank, room_id, uploaded_at, tenant }) {
  return (
    <div style={{
      borderRadius: 18, overflow: "hidden", border: "1px solid var(--line)", boxShadow: "var(--sh-2)",
      background: "white", maxWidth: 340, margin: "0 auto",
    }}>
      {/* Header */}
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
        <div style={{ fontSize: 13, fontWeight: 600 }}>นายสมพร เจริญสุข (หอพักสุขใจ)</div>
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

// ─── UTILITY PAGE (Owner records meter readings) ──────────────────────────
function UtilityPage() {
  const [roomSel, setRoomSel] = dState(DSEED.SEED_ROOMS.find(r => r.status === "ไม่ว่าง")?.id || DSEED.SEED_ROOMS[0].id);
  const rooms = DSEED.SEED_ROOMS.filter(r => r.status === "ไม่ว่าง");
  const utils = DSEED.SEED_UTILS.filter(u => u.room_id === roomSel)
    .sort((a,b) => b.year !== a.year ? b.year - a.year : b.month - a.month);
  const tenant = DSEED.SEED_TENANTS.find(t => t.room === roomSel);
  const cur = utils[0];

  // editable "new reading"
  const [newElec, setNewElec] = dState(cur ? cur.elec_cur + 50 : "");
  const [newWater, setNewWater] = dState(cur ? cur.water_cur + 8 : "");

  const elecUse = newElec - (cur?.elec_cur || 0);
  const waterUse = newWater - (cur?.water_cur || 0);
  const elecAmt = Math.max(0, elecUse) * DSEED.UTIL_RATE.electric;
  const waterAmt = Math.max(0, waterUse) * DSEED.UTIL_RATE.water;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.4 }}>มิเตอร์น้ำ-ไฟ</div>
          <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>
            ค่าน้ำ {baht(DSEED.UTIL_RATE.water)}/หน่วย · ค่าไฟ {baht(DSEED.UTIL_RATE.electric)}/หน่วย · จดทุก 25 ของเดือน
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={detailBtn("ghost")}><DDI.IconDownload size={14}/> ส่งออกข้อมูล</button>
          <button style={detailBtn("primary")}><DDI.IconPlus size={14} stroke="white"/> จดมิเตอร์รวม</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 18, height: "calc(100% - 80px)" }}>
        {/* Room list */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 18, overflow: "hidden",
          display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)", display: "flex",
            justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>ห้องที่มีผู้เช่า</div>
            <span className="num" style={{ fontSize: 11, color: "var(--ink-3)" }}>{rooms.length}</span>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: 8 }}>
            {rooms.map(r => {
              const u = DSEED.SEED_UTILS.filter(x => x.room_id === r.id).sort((a,b) => b.year - a.year || b.month - a.month)[0];
              const t = DSEED.SEED_TENANTS.find(x => x.room === r.id);
              const active = roomSel === r.id;
              return (
                <button key={r.id} onClick={() => setRoomSel(r.id)} style={{
                  width: "100%", padding: "10px 12px", marginBottom: 3, borderRadius: 11,
                  background: active ? "var(--brand-soft)" : "transparent", border: "none",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 10, textAlign: "left",
                }}>
                  <div className="num" style={{ width: 44, height: 44, borderRadius: 11,
                    background: active ? "var(--brand)" : "var(--surface-2)",
                    color: active ? "white" : "var(--ink-2)",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700,
                  }}>
                    {r.id}
                    <span style={{ fontSize: 8, opacity: 0.7, fontWeight: 500, marginTop: 1 }}>ชั้น {r.floor}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t?.name || "—"}</div>
                    <div className="num" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
                      {u ? `${u.elec_use + u.water_use} หน่วย · ${baht(u.elec_amount + u.water_amount)}` : "ยังไม่จด"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail */}
        <div style={{ overflow: "auto" }}>
          {tenant && cur ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Header */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 18, padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <Avatar name={tenant.name} size={48}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 17, fontWeight: 700 }}>{tenant.name}</div>
                    <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 2 }}>ห้อง {roomSel} · จดล่าสุด {cur.read_at}</div>
                  </div>
                  <button style={detailBtn("ghost")}><DDI.IconBell size={14}/> ส่งเตือนผู้เช่า</button>
                </div>
              </div>

              {/* New reading input */}
              <div style={{ background: "var(--brand-soft)", borderRadius: 18, padding: 20, border: "1px solid oklch(0.88 0.06 35)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--brand-ink)", textTransform: "uppercase", letterSpacing: 1 }}>
                      จดมิเตอร์ใหม่ · {MONTHS_TH[DSEED.CUR_M]} {DSEED.CUR_Y}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>กรอกเลขมิเตอร์ล่าสุดที่อ่านได้</div>
                  </div>
                  <button style={{ background: "var(--brand)", color: "white", border: "none", borderRadius: 11,
                    padding: "10px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                    <DDI.IconCheck size={15} stroke="white"/> บันทึก
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <MeterInput
                    label="ค่าไฟฟ้า" unit="หน่วย" prev={cur.elec_cur}
                    value={newElec} onChange={setNewElec} use={elecUse} amount={elecAmt}
                    color="oklch(0.65 0.15 80)" bg="oklch(0.96 0.04 80)"
                    icon={<DDI.IconSparkle size={18} stroke="oklch(0.55 0.15 80)"/>}
                  />
                  <MeterInput
                    label="ค่าน้ำประปา" unit="หน่วย" prev={cur.water_cur}
                    value={newWater} onChange={setNewWater} use={waterUse} amount={waterAmt}
                    color="oklch(0.55 0.13 230)" bg="oklch(0.96 0.025 230)"
                    icon={<DDI.IconWifi size={18} stroke="oklch(0.55 0.13 230)"/>}
                  />
                </div>

                <div style={{ marginTop: 14, padding: "12px 16px", background: "white", borderRadius: 12,
                  display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-2)" }}>ยอดรวมเดือนนี้ (น้ำ + ไฟ)</span>
                  <span className="num" style={{ fontSize: 20, fontWeight: 700, color: "var(--brand-ink)" }}>{baht(elecAmt + waterAmt)}</span>
                </div>
              </div>

              {/* History */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 18, padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>ประวัติย้อนหลัง · ห้อง {roomSel}</div>
                <div style={{ background: "var(--surface-2)", borderRadius: 12, overflow: "hidden", border: "1px solid var(--line)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr 1fr 1fr", padding: "11px 14px",
                    fontSize: 11.5, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: 0.8,
                    borderBottom: "1px solid var(--line)" }}>
                    <span>เดือน</span><span>ไฟ ก่อน → หลัง</span><span>ไฟ หน่วย</span><span>น้ำ ก่อน → หลัง</span><span>น้ำ หน่วย</span><span style={{textAlign:"right"}}>รวม</span>
                  </div>
                  {utils.map((u, i) => (
                    <div key={u.id} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr 1fr 1fr",
                      padding: "12px 14px", borderBottom: i < utils.length-1 ? "1px solid var(--line)" : "none",
                      background: "var(--surface)", fontSize: 13, alignItems: "center" }}>
                      <span style={{ fontWeight: 600 }}>{dl(u.year, u.month)}</span>
                      <span className="num" style={{ color: "var(--ink-3)" }}>{u.elec_prev} → <b style={{ color: "var(--ink)" }}>{u.elec_cur}</b></span>
                      <span className="num" style={{ fontWeight: 600, color: "oklch(0.55 0.15 80)" }}>{u.elec_use}</span>
                      <span className="num" style={{ color: "var(--ink-3)" }}>{u.water_prev} → <b style={{ color: "var(--ink)" }}>{u.water_cur}</b></span>
                      <span className="num" style={{ fontWeight: 600, color: "oklch(0.55 0.13 230)" }}>{u.water_use}</span>
                      <span className="num" style={{ textAlign: "right", fontWeight: 700 }}>{baht(u.elec_amount + u.water_amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
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

function MeterInput({ label, unit, prev, value, onChange, use, amount, color, bg, icon }) {
  return (
    <div style={{ background: "white", border: "1px solid var(--line)", borderRadius: 14, padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
        <div style={{ flex: 1, fontSize: 13.5, fontWeight: 700 }}>{label}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <div style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 600 }}>เลขก่อน</div>
          <div className="num" style={{ padding: "10px 12px", background: "var(--surface-2)", borderRadius: 9, fontSize: 16, fontWeight: 700, color: "var(--ink-3)", marginTop: 4 }}>{prev}</div>
        </div>
        <div>
          <div style={{ fontSize: 10.5, color: color, fontWeight: 700 }}>เลขล่าสุด</div>
          <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} style={{
            width: "100%", padding: "10px 12px", borderRadius: 9, border: `1.5px solid ${color}`,
            background: "white", marginTop: 4, fontSize: 16, fontWeight: 700, color: "var(--ink)",
            outline: "none", boxSizing: "border-box", fontFamily: "var(--font-num)", fontVariantNumeric: "tabular-nums",
          }}/>
        </div>
      </div>
      <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "8px 12px", background: bg, borderRadius: 9 }}>
        <span className="num" style={{ fontSize: 12, fontWeight: 600, color: color }}>ใช้ {use > 0 ? use : 0} {unit}</span>
        <span className="num" style={{ fontSize: 14, fontWeight: 700, color: color }}>{baht(amount)}</span>
      </div>
    </div>
  );
}

window.OwnerDesktop = OwnerDesktop;
