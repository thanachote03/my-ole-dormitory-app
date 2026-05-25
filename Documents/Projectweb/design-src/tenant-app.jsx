// ─── Mobile · Tenant app screens (Payment + Repair) ───────────────────────
const { useState: tState, useMemo: tMemo } = React;
const TDI = window.DI;
const TSEED = window.SEED;

// ── Tenant home (Payment + Repair tabs) ──
function TenantApp({ tenantId = "T2" }) {
  const [tab, setTab] = tState("home");
  const tenant = TSEED.SEED_TENANTS.find(t => t.id === tenantId);
  const room = TSEED.SEED_ROOMS.find(r => r.id === tenant.room);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--bg)", position: "relative" }}>
      {/* Header */}
      <div style={{ padding: "12px 22px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>สวัสดี</div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.3, marginTop: 1 }}>
            คุณ{tenant.name.split(" ")[0]} <span style={{ fontSize: 18 }}>👋</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <IconBtn icon={<TDI.IconBell size={18}/>} dot/>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--brand-soft)",
            display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-ink)",
            fontWeight: 700, fontSize: 13 }}>
            {tenant.name.charAt(0)}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "0 18px 90px" }} className="screen-in" key={tab}>
        {tab === "home"    && <TenantHome   tenant={tenant} room={room} goTo={setTab}/>}
        {tab === "payment" && <TenantPay    tenant={tenant} room={room}/>}
        {tab === "repair"  && <TenantRepair tenant={tenant} room={room}/>}
        {tab === "utility" && <TenantUtility tenant={tenant} room={room}/>}
        {tab === "profile" && <TenantProfile tenant={tenant} room={room}/>}
      </div>

      {/* Bottom Nav */}
      <BottomNav tab={tab} setTab={setTab}/>
    </div>
  );
}

function IconBtn({ icon, dot }) {
  return (
    <button style={{
      width: 40, height: 40, borderRadius: 12, background: "var(--surface)",
      border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", cursor: "pointer", color: "var(--ink-2)"
    }}>
      {icon}
      {dot && <span style={{ position: "absolute", top: 9, right: 9, width: 7, height: 7, borderRadius: "50%", background: "var(--brand)" }}/>}
    </button>
  );
}

function BottomNav({ tab, setTab }) {
  const items = [
    { id: "home",    label: "หน้าหลัก", icon: TDI.IconHome },
    { id: "payment", label: "ชำระเงิน", icon: TDI.IconCard },
    { id: "repair",  label: "แจ้งซ่อม", icon: TDI.IconWrench },
    { id: "utility", label: "มิเตอร์",   icon: TDI.IconSparkle },
    { id: "profile", label: "บัญชี",    icon: TDI.IconUser },
  ];
  return (
    <div style={{
      position: "absolute", left: 14, right: 14, bottom: 12,
      background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px) saturate(140%)", WebkitBackdropFilter: "blur(20px) saturate(140%)",
      border: "1px solid var(--line)", borderRadius: 22, padding: "8px 6px",
      display: "flex", justifyContent: "space-around", boxShadow: "var(--sh-2)",
    }}>
      {items.map(it => {
        const active = tab === it.id;
        const Ic = it.icon;
        return (
          <button key={it.id} onClick={() => setTab(it.id)} style={{
            background: "none", border: "none", cursor: "pointer", padding: "8px 6px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            color: active ? "var(--brand)" : "var(--ink-3)", borderRadius: 12,
            position: "relative", transition: "all .2s", flex: 1,
          }}>
            {active && <span style={{ position: "absolute", inset: 0, background: "var(--brand-soft)", borderRadius: 12, zIndex: 0 }}/>}
            <Ic size={19} stroke={active ? "var(--brand)" : "var(--ink-3)"} strokeWidth={active ? 2 : 1.75} style={{ position: "relative", zIndex: 1 }}/>
            <span style={{ fontSize: 9.5, fontWeight: active ? 700 : 500, position: "relative", zIndex: 1 }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Tenant · Home Dashboard ─────────────────────────────────────────────
function TenantHome({ tenant, room, goTo }) {
  const curPay = TSEED.SEED_PAYMENTS.find(p => p.room_id === tenant.room && p.year === TSEED.CUR_Y && p.month === TSEED.CUR_M);
  const due = curPay?.status === "รอชำระ";
  const [dismissed, setDismissed] = tState(false);

  return (
    <div>
      {/* Payment reminder banner */}
      {!dismissed && window.Features?.PaymentDueBanner && (
        <window.Features.PaymentDueBanner
          payment={curPay} room={room}
          onPay={() => goTo?.("payment")}
          onDismiss={() => setDismissed(true)}
        />
      )}
      {/* Hero balance card */}
      <div style={{
        background: due
          ? "linear-gradient(140deg, var(--brand) 0%, var(--brand-2) 100%)"
          : "linear-gradient(140deg, var(--sage) 0%, oklch(0.65 0.08 165) 100%)",
        borderRadius: 24, padding: "20px 22px", color: "white",
        position: "relative", overflow: "hidden", marginBottom: 16,
        boxShadow: "0 18px 40px -20px var(--brand)",
      }}>
        {/* decorative arc */}
        <svg viewBox="0 0 200 200" style={{ position: "absolute", right: -40, top: -40, width: 180, opacity: 0.18 }}>
          <circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="20"/>
          <circle cx="100" cy="100" r="40" fill="none" stroke="white" strokeWidth="14"/>
        </svg>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, position: "relative" }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.85, fontWeight: 500 }}>{due ? "ยอดค้างชำระ" : "สถานะการชำระ"} · {dl(TSEED.CUR_Y, TSEED.CUR_M)}</div>
            <div className="num" style={{ fontSize: 34, fontWeight: 700, marginTop: 6, letterSpacing: -1 }}>
              {due ? baht(curPay.amount) : "ชำระแล้ว"}
            </div>
          </div>
          <span style={{ background: "rgba(255,255,255,0.18)", padding: "5px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600 }}>
            ห้อง {tenant.room}
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18, position: "relative" }}>
          <div style={{ fontSize: 12, opacity: 0.85 }}>
            {due ? "ครบกำหนด 5 " + MONTHS_TH[TSEED.CUR_M] + " " + TSEED.CUR_Y : "ชำระเมื่อ " + (curPay?.paid_at || "—")}
          </div>
          <button style={{
            background: "white", color: due ? "var(--brand-2)" : "var(--sage-ink)",
            border: "none", padding: "8px 16px", borderRadius: 100, fontWeight: 700, fontSize: 12.5,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
          }}>
            {due ? "ชำระเลย" : "ดูใบเสร็จ"} <TDI.IconChevR size={14}/>
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        <QuickCard icon={<TDI.IconCard size={20} stroke="var(--brand)"/>} title="ชำระเงิน" sub={due ? "มียอดค้าง" : "ตรงเวลา"} tone="brand" onClick={() => goTo?.("payment")}/>
        <QuickCard icon={<TDI.IconSparkle size={20} stroke="oklch(0.55 0.13 80)"/>} title="มิเตอร์น้ำ-ไฟ" sub="ดูล่าสุด" tone="sage" onClick={() => goTo?.("utility")}/>
      </div>

      {/* Room info card */}
      <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 600, color: "var(--ink-3)", paddingLeft: 4 }}>ห้องของคุณ</div>
      <div style={{
        background: "var(--surface)", borderRadius: 20, padding: 18, border: "1px solid var(--line)",
        boxShadow: "var(--sh-1)", marginBottom: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16, background: "var(--brand-soft)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          }}>
            <div className="num" style={{ fontSize: 16, fontWeight: 700, color: "var(--brand-ink)", lineHeight: 1 }}>{tenant.room}</div>
            <div style={{ fontSize: 9.5, color: "var(--brand-ink)", opacity: 0.7, marginTop: 2 }}>ชั้น {room.floor}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>ห้อง{room.type} · ชั้น {room.floor}</div>
            <div className="num" style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>
              {baht(room.price)}<span style={{ color: "var(--ink-4)" }}> / เดือน</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {room.amenities.map(a => {
            const Ic = amenityIcon(a);
            return (
              <div key={a} style={{
                display: "flex", alignItems: "center", gap: 5, padding: "5px 10px",
                background: "var(--surface-2)", borderRadius: 100, fontSize: 11.5, color: "var(--ink-2)",
              }}>
                <Ic size={13} stroke="var(--ink-2)"/> {a}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent activity */}
      <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 600, color: "var(--ink-3)", paddingLeft: 4, display: "flex", justifyContent: "space-between" }}>
        <span>กิจกรรมล่าสุด</span>
        <span style={{ color: "var(--brand)", fontWeight: 600 }}>ดูทั้งหมด</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <ActivityRow icon={<TDI.IconCheck size={16} stroke="var(--ok)"/>} tone="ok" title="ชำระค่าเช่า เม.ย. 2026" sub="3 เม.ย. 2026" amount="-" amountNote=""/>
        <ActivityRow icon={<TDI.IconClock size={16} stroke="var(--warn)"/>} tone="warn" title="แจ้งซ่อม · ลูกบิดหลวม" sub="กำลังตรวจสอบ"/>
        <ActivityRow icon={<TDI.IconBell size={16} stroke="var(--info)"/>} tone="info" title="ประกาศ · ปิดน้ำ 23 พ.ค." sub="แจ้งล่วงหน้า 09:00–14:00"/>
      </div>
    </div>
  );
}

function QuickCard({ icon, title, sub, tone, onClick }) {
  const bg = tone === "brand" ? "var(--brand-soft)" : "var(--sage-soft)";
  return (
    <button onClick={onClick} className="lift" style={{
      background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 18,
      padding: 14, textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: 10,
      boxShadow: "var(--sh-1)",
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: bg,
        display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{sub}</div>
      </div>
    </button>
  );
}

function ActivityRow({ icon, tone, title, sub }) {
  const bg = { ok:"var(--ok-soft)", warn:"var(--warn-soft)", info:"var(--info-soft)" }[tone];
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14,
      padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 32, height: 32, borderRadius: 9, background: bg,
        display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{title}</div>
        <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
}

// ─── Tenant · Payment Screen ─────────────────────────────────────────────
function TenantPay({ tenant, room }) {
  const [filter, setFilter] = tState("ทั้งหมด");
  const allPays = tMemo(() => TSEED.SEED_PAYMENTS.filter(p => p.room_id === tenant.room)
    .sort((a,b) => b.year !== a.year ? b.year - a.year : b.month - a.month), [tenant.room]);

  const filt = filter === "ทั้งหมด" ? allPays : allPays.filter(p => filter === "ชำระแล้ว" ? p.status === "ชำระแล้ว" : p.status === "รอชำระ");
  const cur = allPays.find(p => p.year === TSEED.CUR_Y && p.month === TSEED.CUR_M);
  const totalPending = allPays.filter(p => p.status === "รอชำระ").reduce((s,p) => s+p.amount, 0);

  return (
    <div>
      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.4, marginBottom: 6 }}>การชำระเงิน</div>
      <div style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 16 }}>ห้อง {tenant.room} · {room.type}</div>

      {/* Current month card */}
      {cur && (
        <div style={{
          background: cur.status === "รอชำระ" ? "var(--brand-soft)" : "var(--ok-soft)",
          borderRadius: 22, padding: 18, marginBottom: 14,
          border: `1px solid ${cur.status === "รอชำระ" ? "oklch(0.88 0.06 35)" : "oklch(0.88 0.05 155)"}`,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: cur.status === "รอชำระ" ? "var(--brand-ink)" : "var(--ok)", textTransform: "uppercase", letterSpacing: 1 }}>
                เดือนปัจจุบัน · {dl(cur.year, cur.month)}
              </div>
              <div className="num" style={{ fontSize: 30, fontWeight: 700, marginTop: 8, color: "var(--ink)", letterSpacing: -1 }}>
                {baht(cur.amount)}
              </div>
            </div>
            <div style={{ background: cur.status === "รอชำระ" ? "var(--brand)" : "var(--ok)",
              color: "white", padding: "5px 12px", borderRadius: 100, fontSize: 11.5, fontWeight: 700,
              display: "inline-flex", alignItems: "center", gap: 4,
            }}>
              {cur.status === "รอชำระ" ? <><TDI.IconClock size={12} stroke="white"/> ค้างชำระ</> : <><TDI.IconCheck size={12} stroke="white"/> ชำระแล้ว</>}
            </div>
          </div>
          {cur.status === "รอชำระ" ? (
            <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
              <button style={{ flex: 1, background: "var(--brand)", color: "white", border: "none",
                padding: "11px 0", borderRadius: 14, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                ชำระเงิน
              </button>
              <button style={{ background: "var(--surface)", border: "1px solid var(--line)",
                padding: "11px 16px", borderRadius: 14, fontWeight: 600, fontSize: 13, cursor: "pointer", color: "var(--ink-2)" }}>
                ติดต่อแอดมิน
              </button>
            </div>
          ) : (
            <div style={{ marginTop: 12, fontSize: 12.5, color: "var(--ink-3)" }}>ชำระเมื่อ {cur.paid_at}</div>
          )}
        </div>
      )}

      {/* Bank accounts + slip upload (when due) */}
      {cur && cur.status === "รอชำระ" && window.Features && (
        <>
          <div style={{ marginTop: 4, fontSize: 13, fontWeight: 600, color: "var(--ink-3)", paddingLeft: 4, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
            <span>โอนเข้าบัญชี</span>
            <span style={{ fontSize: 11, color: "var(--ink-4)" }}>เลือกธนาคารที่สะดวก</span>
          </div>
          <window.Features.BankAccounts/>
          <div style={{ height: 12 }}/>
          <window.Features.SlipUploadTile amount={cur.amount} onSubmit={() => alert("ส่งสลิปเรียบร้อย — เจ้าของหอจะตรวจสอบและยืนยันภายใน 24 ชม.")}/>
          <div style={{ height: 18 }}/>
        </>
      )}

      {/* Summary stat strip */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
        <Stat label="ค้างชำระทั้งหมด" value={baht(totalPending)} tone="brand"/>
        <Stat label="ชำระตรงเวลา" value={`${allPays.filter(p=>p.status==="ชำระแล้ว").length}/${allPays.length}`} tone="sage"/>
      </div>

      {/* Filter chips */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {["ทั้งหมด","ชำระแล้ว","ค้างชำระ"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "7px 14px", borderRadius: 100, cursor: "pointer", fontSize: 12.5, fontWeight: 600,
            background: filter === f ? "var(--ink)" : "var(--surface)",
            color: filter === f ? "white" : "var(--ink-2)",
            border: `1px solid ${filter === f ? "var(--ink)" : "var(--line)"}`,
          }}>{f}</button>
        ))}
      </div>

      {/* Payment list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filt.map(p => <PayRow key={p.id} p={p}/>)}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }) {
  const bg = tone === "brand" ? "var(--brand-soft)" : tone === "sage" ? "var(--sage-soft)" : "var(--surface-2)";
  const fg = tone === "brand" ? "var(--brand-ink)" : tone === "sage" ? "var(--sage-ink)" : "var(--ink)";
  return (
    <div style={{ background: bg, borderRadius: 16, padding: "12px 14px" }}>
      <div style={{ fontSize: 11, color: fg, opacity: 0.7, fontWeight: 600 }}>{label}</div>
      <div className="num" style={{ fontSize: 17, fontWeight: 700, color: fg, marginTop: 4, letterSpacing: -0.3 }}>{value}</div>
    </div>
  );
}

function PayRow({ p }) {
  const paid = p.status === "ชำระแล้ว";
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14,
      padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{
        width: 42, height: 42, borderRadius: 11,
        background: paid ? "var(--ok-soft)" : "var(--warn-soft)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        color: paid ? "var(--ok)" : "var(--warn)",
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, lineHeight: 1 }}>{MONTHS_TH[p.month].replace(".","")}</div>
        <div className="num" style={{ fontSize: 11, opacity: 0.7, marginTop: 2, lineHeight: 1 }}>{String(p.year).slice(-2)}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{dl(p.year, p.month)}</div>
        <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>
          {paid ? `ชำระเมื่อ ${p.paid_at}` : `ครบกำหนด 5 ${MONTHS_TH[p.month]} ${p.year}`}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div className="num" style={{ fontSize: 14, fontWeight: 700 }}>{baht(p.amount)}</div>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: paid ? "var(--ok)" : "var(--warn)", marginTop: 2 }}>
          {paid ? "✓ ชำระแล้ว" : "⏳ รอชำระ"}
        </div>
      </div>
    </div>
  );
}

// ─── Tenant · Repair Screen ──────────────────────────────────────────────
function TenantRepair({ tenant, room }) {
  const [showNew, setShowNew] = tState(false);
  const [issue, setIssue] = tState("");
  const repairs = TSEED.SEED_REPAIRS.filter(r => r.room_id === tenant.room);
  // for demo we'll show a couple even if none belong to this tenant
  const list = repairs.length > 0 ? repairs : TSEED.SEED_REPAIRS.slice(0,2);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.4 }}>แจ้งซ่อมห้องพัก</div>
      </div>
      <div style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 18 }}>เราจะส่งช่างไปดูภายใน 24 ชม.</div>

      {/* New repair callout */}
      <button onClick={() => setShowNew(true)} className="lift" style={{
        width: "100%", background: "var(--ink)", color: "white", borderRadius: 18,
        padding: "16px 18px", border: "none", cursor: "pointer", display: "flex",
        alignItems: "center", gap: 14, marginBottom: 18, textAlign: "left",
      }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <TDI.IconPlus size={20} stroke="white"/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>แจ้งซ่อมใหม่</div>
          <div style={{ fontSize: 12, opacity: 0.65, marginTop: 2 }}>เลือกห้องและบอกปัญหาให้เราฟัง</div>
        </div>
        <TDI.IconChevR size={18} stroke="white"/>
      </button>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 16 }}>
        <MiniStat n={list.filter(r=>r.status==="รอดำเนินการ").length}      label="รอ"        tone="warn"/>
        <MiniStat n={list.filter(r=>r.status==="กำลังดำเนินการ").length} label="กำลังทำ"   tone="info"/>
        <MiniStat n={list.filter(r=>r.status==="เสร็จแล้ว").length}        label="เสร็จแล้ว" tone="ok"/>
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-3)", paddingLeft: 4, marginBottom: 8 }}>
        ประวัติแจ้งซ่อม
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {list.map(r => <RepairCard key={r.id} r={r}/>)}
      </div>

      {showNew && <RepairModal onClose={() => { setShowNew(false); setIssue(""); }} room={tenant.room} issue={issue} setIssue={setIssue}/>}
    </div>
  );
}

function MiniStat({ n, label, tone }) {
  const colors = { warn:["var(--warn-soft)","var(--warn)"], info:["var(--info-soft)","var(--info)"], ok:["var(--ok-soft)","var(--ok)"] }[tone];
  return (
    <div style={{ background: colors[0], borderRadius: 14, padding: "10px 12px", textAlign: "center" }}>
      <div className="num" style={{ fontSize: 20, fontWeight: 700, color: colors[1], lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: 10.5, color: colors[1], opacity: 0.9, marginTop: 4, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function RepairCard({ r }) {
  const sTone = r.status === "เสร็จแล้ว" ? "ok" : r.status === "กำลังดำเนินการ" ? "info" : "warn";
  const colors = { warn:["var(--warn-soft)","var(--warn)"], info:["var(--info-soft)","var(--info)"], ok:["var(--ok-soft)","var(--ok)"] }[sTone];
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 11.5, color: "var(--ink-3)", fontWeight: 600 }}>ห้อง {r.room_id}</span>
        <span style={{ background: colors[0], color: colors[1], padding: "3px 10px",
          borderRadius: 100, fontSize: 10.5, fontWeight: 700 }}>{r.status}</span>
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>{r.issue}</div>
      <div style={{ fontSize: 11.5, color: "var(--ink-4)", marginTop: 8, display: "flex", alignItems: "center", gap: 5 }}>
        <TDI.IconCal size={12} stroke="var(--ink-4)"/>
        แจ้งเมื่อ {new Date(r.created_at).toLocaleDateString("th-TH", {day:"numeric", month:"short", year:"numeric"})}
      </div>
    </div>
  );
}

function RepairModal({ onClose, room, issue, setIssue }) {
  return (
    <div style={{
      position: "absolute", inset: 0, background: "rgba(20,15,12,0.45)",
      backdropFilter: "blur(6px)", display: "flex", alignItems: "flex-end", zIndex: 100,
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="screen-in" style={{
        background: "var(--surface)", width: "100%", borderRadius: "28px 28px 0 0",
        padding: "16px 24px 28px", maxHeight: "80%", overflow: "auto",
      }}>
        <div style={{ width: 44, height: 5, background: "var(--line-2)", borderRadius: 3, margin: "0 auto 18px" }}/>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>แจ้งซ่อมใหม่</div>
        <div style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 18 }}>กรอกรายละเอียดให้ครบเพื่อให้เราช่วยได้เร็วขึ้น</div>

        <Field label="ห้องของคุณ">
          <div style={{ background: "var(--surface-2)", padding: "12px 14px", borderRadius: 12,
            display: "flex", alignItems: "center", gap: 10, border: "1px solid var(--line)" }}>
            <TDI.IconBuilding size={18} stroke="var(--brand)"/>
            <span style={{ fontWeight: 600 }}>ห้อง {room}</span>
          </div>
        </Field>

        <Field label="ประเภทปัญหา">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["แอร์","น้ำประปา","ไฟฟ้า","ประตู/หน้าต่าง","อื่น ๆ"].map(c => (
              <button key={c} style={{
                padding: "8px 14px", borderRadius: 100, border: "1px solid var(--line)",
                background: c==="ไฟฟ้า" ? "var(--brand-soft)" : "var(--surface)",
                color: c==="ไฟฟ้า" ? "var(--brand-ink)" : "var(--ink-2)",
                borderColor: c==="ไฟฟ้า" ? "var(--brand)" : "var(--line)",
                fontWeight: c==="ไฟฟ้า" ? 700 : 500, fontSize: 12.5, cursor: "pointer",
              }}>{c}</button>
            ))}
          </div>
        </Field>

        <Field label="อธิบายปัญหา">
          <textarea value={issue} onChange={e => setIssue(e.target.value)} placeholder="เช่น สวิตช์ไฟห้องน้ำกดไม่ติด..." style={{
            width: "100%", minHeight: 88, padding: 14, borderRadius: 14,
            border: "1px solid var(--line)", background: "var(--surface-2)", outline: "none",
            fontSize: 14, resize: "none", color: "var(--ink)",
          }}/>
        </Field>

        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "13px 0", borderRadius: 14, background: "var(--surface)",
            border: "1px solid var(--line)", color: "var(--ink-2)", fontWeight: 600, fontSize: 14, cursor: "pointer",
          }}>ยกเลิก</button>
          <button onClick={onClose} style={{
            flex: 2, padding: "13px 0", borderRadius: 14, background: "var(--ink)",
            border: "none", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer",
          }}>ส่งคำขอ</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-2)", marginBottom: 7 }}>{label}</div>
      {children}
    </div>
  );
}

// ─── Tenant · Utility (น้ำ-ไฟ) ───────────────────────────────────────────
function TenantUtility({ tenant, room }) {
  return (
    <div>
      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.4, marginBottom: 6 }}>มิเตอร์น้ำ-ไฟ</div>
      <div style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 16 }}>ห้อง {tenant.room} · จดทุกวันที่ 25 ของเดือน</div>
      {window.Features?.UtilityCard && <window.Features.UtilityCard roomId={tenant.room}/>}
    </div>
  );
}

// ─── Tenant · Profile (simple) ───────────────────────────────────────────
function TenantProfile({ tenant, room }) {
  return (
    <div>
      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.4, marginBottom: 18 }}>บัญชีของฉัน</div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 20,
        padding: 18, display: "flex", gap: 14, alignItems: "center", marginBottom: 16 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--brand)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontSize: 22, fontWeight: 700 }}>{tenant.name.charAt(0)}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{tenant.name}</div>
          <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 2 }}>ห้อง {tenant.room} · เข้าพักตั้งแต่ {dl(tenant.sinceY, tenant.sinceM)}</div>
        </div>
        <TDI.IconEdit size={18} stroke="var(--ink-3)"/>
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-3)", paddingLeft: 4, marginBottom: 8 }}>การตั้งค่า</div>
      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 18, overflow: "hidden" }}>
        {[
          { ic: TDI.IconBell, t: "การแจ้งเตือน", v: "เปิด" },
          { ic: TDI.IconLock, t: "เปลี่ยนรหัสผ่าน" },
          { ic: TDI.IconCard, t: "ช่องทางชำระเงิน", v: "PromptPay" },
          { ic: TDI.IconPhone, t: "ติดต่อแอดมิน", v: "081-xxx-xxxx" },
        ].map((r, i, arr) => {
          const Ic = r.ic;
          return (
            <div key={r.t} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
              borderBottom: i < arr.length - 1 ? "1px solid var(--line)" : "none" }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--surface-2)",
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Ic size={16} stroke="var(--ink-2)"/>
              </div>
              <div style={{ flex: 1, fontSize: 13.5, fontWeight: 500 }}>{r.t}</div>
              {r.v && <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{r.v}</div>}
              <TDI.IconChevR size={16} stroke="var(--ink-4)"/>
            </div>
          );
        })}
      </div>

      <button style={{ width: "100%", marginTop: 18, padding: "13px 0", borderRadius: 14,
        background: "var(--surface)", border: "1px solid var(--danger-soft)", color: "var(--danger)",
        fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
        <TDI.IconLogout size={16} stroke="var(--danger)"/> ออกจากระบบ
      </button>
    </div>
  );
}

window.TenantApp = TenantApp;
