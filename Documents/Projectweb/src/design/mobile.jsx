// Mobile phone frame + login + tenant app
import { useState } from "react";
import { DI, amenityIcon } from "./icons";
import { MONTHS_TH, dl, baht } from "./seed";
import { useData } from "./DataContext";
import { PaymentDueBanner, BankAccounts, SlipUploadTile, UtilityCard } from "./features";
import { supabase } from "../supabaseClient";

const {
  IconHome, IconUser, IconCard, IconWrench, IconBuilding,
  IconLock, IconBell, IconPlus, IconCheck, IconX,
  IconArrowRight, IconChevR, IconCal,
  IconSettings, IconLogout, IconSparkle, IconPhone,
  IconClock, IconEdit, IconBack,
} = DI;

// ─── Phone Frame ─────────────────────────────────────────────────────────
export function Phone({ children }) {
  return (
    <div style={{ width: 390, height: 844, position: "relative" }}>
      <div style={{
        width: "100%", height: "100%",
        background: "var(--bg)",
        borderRadius: 44,
        border: "1px solid var(--line-2)",
        boxShadow: "var(--sh-3)",
        overflow: "hidden",
        position: "relative",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{
          height: 44, display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 24px", fontSize: 14, fontWeight: 600, color: "var(--ink)",
          flexShrink: 0, fontFamily: "var(--font-en)",
        }}>
          <span>9:41</span>
          <div style={{
            position: "absolute", left: "50%", top: 10, transform: "translateX(-50%)",
            width: 100, height: 28, borderRadius: 14, background: "var(--ink)",
          }}/>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <svg width="18" height="11" viewBox="0 0 18 11" fill="currentColor"><rect x="0" y="6" width="3" height="5" rx="0.5"/><rect x="5" y="4" width="3" height="7" rx="0.5"/><rect x="10" y="2" width="3" height="9" rx="0.5"/><rect x="15" y="0" width="3" height="11" rx="0.5"/></svg>
            <svg width="22" height="11" viewBox="0 0 22 11" fill="none" stroke="currentColor" strokeWidth="1"><rect x="0.5" y="0.5" width="18" height="10" rx="2"/><rect x="2" y="2" width="13" height="7" rx="1" fill="currentColor"/><rect x="19.5" y="3.5" width="1.5" height="4" rx="0.5" fill="currentColor"/></svg>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {children}
        </div>
        <div style={{ height: 24, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <div style={{ width: 134, height: 5, borderRadius: 3, background: "var(--ink)" }}/>
        </div>
      </div>
    </div>
  );
}

// ─── Login Screen (role pick) ────────────────────────────────────────────
export function LoginScreen({ onPick }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "32px 28px 28px", background: "linear-gradient(170deg, var(--brand-soft) 0%, var(--bg) 60%)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 56 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--brand-soft)",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <DI.IconBee size={28}/>
        </div>
        <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: -0.2 }}>Bee<span style={{color:"var(--brand)"}}>.</span></div>
      </div>

      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.15, letterSpacing: -0.6, color: "var(--ink)" }}>
          ยินดีต้อนรับ<br/>กลับมาอีกครั้ง
        </div>
        <div style={{ fontSize: 15, color: "var(--ink-3)", marginTop: 12, lineHeight: 1.5 }}>
          ระบบจัดการหอพักที่ทำให้ทั้งเจ้าของและผู้เช่าใช้ชีวิตง่ายขึ้น
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <RoleCard
          bg="var(--surface)" border="var(--line)"
          icon={<IconUser size={22} stroke="var(--brand)"/>}
          title="ผู้เช่า"
          sub="ดูใบแจ้งหนี้ ชำระค่าเช่า แจ้งซ่อมห้อง"
          onClick={() => onPick("tenant")}
        />
        <RoleCard
          bg="var(--ink)" fg="white" border="var(--ink)"
          icon={<DI.IconKey size={22} stroke="white"/>}
          title="เจ้าของ / ผู้จัดการ"
          sub="จัดการห้อง ผู้เช่า รายได้ และงานซ่อม"
          onClick={() => onPick("owner")}
          dark
        />
      </div>

      <div style={{ flex: 1 }}/>
    </div>
  );
}

function RoleCard({ icon, title, sub, onClick, bg, fg = "var(--ink)", border, dark }) {
  return (
    <button onClick={onClick} className="lift" style={{
      display: "flex", alignItems: "center", gap: 14, padding: "16px 18px",
      background: bg, border: `1px solid ${border}`, borderRadius: 18, cursor: "pointer",
      textAlign: "left", color: fg, boxShadow: "var(--sh-1)",
    }}>
      <div style={{ width: 44, height: 44, borderRadius: 12,
        background: dark ? "rgba(255,255,255,0.10)" : "var(--brand-soft)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.1 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: dark ? "rgba(255,255,255,0.65)" : "var(--ink-3)", marginTop: 2 }}>{sub}</div>
      </div>
      <IconChevR size={18} stroke={dark ? "rgba(255,255,255,0.6)" : "var(--ink-4)"}/>
    </button>
  );
}

// ─── Login Form (Username + Password) ───────────────────────────────────
export function LoginFormScreen({ role = "owner", onBack, onSuccess }) {
  const { tenants, ownerPin, staff } = useData();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState(false);

  const roleLabel = role === "owner" ? "เจ้าของ / ผู้จัดการ" : "ผู้เช่า";

  // Try Supabase Auth first (production); fall back to local check if no auth user.
  // Synthesises an email from the username so the same UI can drive Supabase Auth.
  const tryAuth = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data?.user) return null;
      return data.user;
    } catch { return null; }
  };

  const submit = async () => {
    if (!u || !p) { setErr(true); setTimeout(() => setErr(false), 700); return; }

    if (role === "owner") {
      // Try Supabase Auth: email convention is `<username>@dorm.local`
      const authUser = await tryAuth(`${u.toLowerCase()}@dorm.local`, p);
      if (authUser?.user_metadata?.role === "owner") {
        onSuccess?.({ role: "owner", username: u, authId: authUser.id, staffRole: authUser.user_metadata.staffRole || "admin" }); return;
      }
      // Staff table check: any username in staff with matching password gets in with their role
      const s = staff.find(x => x.username && x.username.toLowerCase() === u.toLowerCase());
      if (s && p === s.password) {
        onSuccess?.({ role: "owner", username: s.username, staffRole: s.role || "admin", staffName: s.name }); return;
      }
      // Legacy fallback: hardcoded admin + ownerPin (works even if staff table is empty)
      if (u === "admin" && p === (ownerPin || "admin1234")) {
        onSuccess?.({ role: "owner", username: u, staffRole: "admin" }); return;
      }
    } else {
      // Find local tenant by username/id/room for fallback path + Supabase Auth attempt
      const t = tenants.find(t =>
        t.id === u || t.id.toLowerCase() === u.toLowerCase() ||
        t.name === u ||
        (t.username && t.username.toLowerCase() === u.toLowerCase()) ||
        (t.room && String(t.room) === String(u)) ||
        (t.room_id && String(t.room_id) === String(u))
      );
      // Try Supabase Auth
      const lookup = (t?.username || u).toLowerCase();
      const authUser = await tryAuth(`${lookup}@dorm.local`, p);
      if (authUser?.user_metadata?.tenant_id) {
        onSuccess?.({ role: "tenant", username: u, tenantId: authUser.user_metadata.tenant_id, authId: authUser.id });
        return;
      }
      // Fallback: local password check
      const expected = t?.password || "tenant";
      if (t && p === expected) { onSuccess?.({ role: "tenant", username: u, tenantId: t.id }); return; }
    }
    setErr(true); setTimeout(() => setErr(false), 700);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px 28px 28px",
      background: "linear-gradient(170deg, var(--brand-soft) 0%, var(--bg) 60%)" }}>
      <button onClick={onBack} style={{
        background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12,
        width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", color: "var(--ink)"
      }}><IconBack size={18}/></button>

      <div style={{ marginTop: 30 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px",
          background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 100,
          fontSize: 11, fontWeight: 700, color: "var(--ink-3)", marginBottom: 14 }}>
          <IconLock size={11} stroke="var(--brand)"/> เข้าสู่ระบบในฐานะ {roleLabel}
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.2 }}>
          ยินดีต้อนรับ{role === "owner" ? "" : "กลับ"}<br/>
          <span style={{ color: "var(--brand)" }}>เข้าสู่ระบบ</span>
        </div>
        <div style={{ fontSize: 13.5, color: "var(--ink-3)", marginTop: 8 }}>
          กรอกชื่อผู้ใช้และรหัสผ่านที่ได้รับจากแอดมิน
        </div>
      </div>

      <div className={err ? "shake" : ""} style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-2)", marginBottom: 6 }}>
            {role === "tenant" ? "หมายเลขห้อง" : "ชื่อผู้ใช้"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 14px",
            background: "var(--surface)", border: `1.5px solid ${err ? "var(--danger)" : "var(--line)"}`,
            borderRadius: 14 }}>
            <IconUser size={18} stroke="var(--ink-3)"/>
            <input value={u} onChange={e => setU(e.target.value)}
              placeholder={role === "tenant" ? "เช่น 101" : "เช่น admin"}
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 15, color: "var(--ink)" }}/>
          </div>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-2)" }}>รหัสผ่าน</div>
            <a style={{ fontSize: 11.5, color: "var(--brand)", fontWeight: 600, cursor: "pointer" }}>ลืมรหัสผ่าน?</a>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 14px",
            background: "var(--surface)", border: `1.5px solid ${err ? "var(--danger)" : "var(--line)"}`,
            borderRadius: 14 }}>
            <IconLock size={18} stroke="var(--ink-3)"/>
            <input value={p} onChange={e => setP(e.target.value)} type={show ? "text" : "password"}
              placeholder="••••••••" onKeyDown={e => e.key === "Enter" && submit()}
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 15, color: "var(--ink)", letterSpacing: show ? 0 : 2 }}/>
            <button onClick={() => setShow(!show)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "var(--ink-3)", fontSize: 11.5, fontWeight: 600 }}>
              {show ? "ซ่อน" : "แสดง"}
            </button>
          </div>
          {err && <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 6, display: "flex", alignItems: "center", gap: 5 }}>
            <IconX size={12} stroke="var(--danger)"/> ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง
          </div>}
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginTop: 2 }}>
          <div onClick={() => setRemember(!remember)} style={{
            width: 22, height: 22, borderRadius: 7, border: `1.5px solid ${remember ? "var(--brand)" : "var(--line-2)"}`,
            background: remember ? "var(--brand)" : "var(--surface)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {remember && <IconCheck size={14} stroke="white" strokeWidth={2.5}/>}
          </div>
          <span style={{ fontSize: 13, color: "var(--ink-2)" }}>จดจำฉันไว้ในอุปกรณ์นี้</span>
        </label>
      </div>

      <button onClick={submit} className="lift" style={{
        marginTop: 22, padding: "15px 0", borderRadius: 16, border: "none", cursor: "pointer",
        background: "var(--ink)", color: "white", fontSize: 15, fontWeight: 700,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}>
        เข้าสู่ระบบ <IconArrowRight size={16} stroke="white"/>
      </button>

      <div style={{ flex: 1 }}/>

      <div style={{ textAlign: "center", fontSize: 12.5, color: "var(--ink-3)", padding: "12px 0" }}>
        เป็นครั้งแรก? <span style={{ color: "var(--brand)", fontWeight: 700, cursor: "pointer" }}>ติดต่อแอดมินเพื่อขอบัญชี</span>
      </div>

    </div>
  );
}

// ─── Tenant App ─────────────────────────────────────────────────────────
export function TenantApp({ tenantId = "T2", onLogout }) {
  const { tenants, rooms } = useData();
  const [tab, setTab] = useState("home");
  const tenant = tenants.find(t => t.id === tenantId) || tenants[0];
  const room = rooms.find(r => r.id === tenant?.room);
  if (!tenant || !room) {
    return <div style={{ padding: 24, fontSize: 13, color: "var(--ink-3)" }}>ไม่พบข้อมูลผู้เช่า</div>;
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--bg)", overflow: "hidden" }}>
      <div style={{ padding: "12px 22px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={onLogout} title="ออกจากระบบ" style={{
            width: 36, height: 36, borderRadius: 10, background: "var(--surface)",
            border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "var(--ink-2)", flexShrink: 0,
          }}><IconBack size={16}/></button>
          <div>
            <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>สวัสดี</div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.3, marginTop: 1 }}>
              คุณ{tenant.name.split(" ")[0]} <span style={{ fontSize: 18 }}>👋</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <IconBtn icon={<IconBell size={18}/>} dot/>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--brand-soft)",
            display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-ink)",
            fontWeight: 700, fontSize: 13 }}>
            {tenant.name.charAt(0)}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 18px 16px" }} className="screen-in" key={tab}>
        {tab === "home"    && <TenantHome   tenant={tenant} room={room} goTo={setTab}/>}
        {tab === "payment" && <TenantPay    tenant={tenant} room={room}/>}
        {tab === "repair"  && <TenantRepair tenant={tenant} room={room}/>}
        {tab === "utility" && <TenantUtility tenant={tenant} room={room}/>}
        {tab === "profile" && <TenantProfile tenant={tenant} room={room} onLogout={onLogout}/>}
      </div>

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
    { id: "home",    label: "หน้าหลัก", icon: IconHome },
    { id: "payment", label: "ชำระเงิน", icon: IconCard },
    { id: "repair",  label: "แจ้งซ่อม", icon: IconWrench },
    { id: "utility", label: "มิเตอร์",   icon: IconSparkle },
    { id: "profile", label: "บัญชี",    icon: IconUser },
  ];
  return (
    <div style={{
      flexShrink: 0, margin: "0 14px 12px",
      background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px) saturate(140%)", WebkitBackdropFilter: "blur(20px) saturate(140%)",
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
  const { payments, curY, curM, computePaymentTotal } = useData();
  const curPay = payments.find(p => p.room_id === tenant.room && p.year === curY && p.month === curM);
  const due = curPay?.status === "รอชำระ";
  // Compute full total (rent + electricity + water) so the displayed amount matches the actual bill
  const breakdown = computePaymentTotal ? computePaymentTotal(tenant.room, curY, curM) : null;
  const totalDue  = breakdown ? breakdown.total : (curPay?.amount || 0);
  const [dismissed, setDismissed] = useState(false);

  return (
    <div>
      {!dismissed && (
        <PaymentDueBanner
          payment={curPay} room={room}
          onPay={() => goTo?.("payment")}
          onDismiss={() => setDismissed(true)}
        />
      )}
      <div style={{
        background: due
          ? "linear-gradient(140deg, var(--brand) 0%, var(--brand-2) 100%)"
          : "linear-gradient(140deg, var(--sage) 0%, oklch(0.65 0.08 165) 100%)",
        borderRadius: 24, padding: "20px 22px", color: "white",
        position: "relative", overflow: "hidden", marginBottom: 16,
        boxShadow: "0 18px 40px -20px var(--brand)",
      }}>
        <svg viewBox="0 0 200 200" style={{ position: "absolute", right: -40, top: -40, width: 180, opacity: 0.18 }}>
          <circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="20"/>
          <circle cx="100" cy="100" r="40" fill="none" stroke="white" strokeWidth="14"/>
        </svg>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, position: "relative" }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.85, fontWeight: 500 }}>{due ? "ยอดค้างชำระ" : "สถานะการชำระ"} · {dl(curY, curM)}</div>
            <div className="num" style={{ fontSize: 34, fontWeight: 700, marginTop: 6, letterSpacing: -1 }}>
              {due ? baht(totalDue) : "ชำระแล้ว"}
            </div>
            {/* Breakdown: rent + water/electricity */}
            {due && breakdown && (breakdown.elec > 0 || breakdown.water > 0) && (
              <div className="num" style={{ fontSize: 11, opacity: 0.85, marginTop: 4, lineHeight: 1.5 }}>
                <div>ค่าเช่า {baht(breakdown.rent)}</div>
                {breakdown.elec  > 0 && <div>⚡ ค่าไฟ {baht(breakdown.elec)}</div>}
                {breakdown.water > 0 && <div>💧 ค่าน้ำ {baht(breakdown.water)}</div>}
              </div>
            )}
          </div>
          <span style={{ background: "rgba(255,255,255,0.18)", padding: "5px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600 }}>
            ห้อง {tenant.room}
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18, position: "relative" }}>
          <div style={{ fontSize: 12, opacity: 0.85 }}>
            {due ? "ครบกำหนด 5 " + MONTHS_TH[curM] + " " + curY : "ชำระเมื่อ " + (curPay?.paid_at || "—")}
          </div>
          <button onClick={() => goTo?.("payment")} style={{
            background: "white", color: due ? "var(--brand-2)" : "var(--sage-ink)",
            border: "none", padding: "8px 16px", borderRadius: 100, fontWeight: 700, fontSize: 12.5,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
          }}>
            {due ? "ชำระเลย" : "ดูใบเสร็จ"} <IconChevR size={14}/>
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        <QuickCard icon={<IconCard size={20} stroke="var(--brand)"/>} title="ชำระเงิน" sub={due ? "มียอดค้าง" : "ตรงเวลา"} tone="brand" onClick={() => goTo?.("payment")}/>
        <QuickCard icon={<IconSparkle size={20} stroke="oklch(0.55 0.13 80)"/>} title="มิเตอร์น้ำ-ไฟ" sub="ดูล่าสุด" tone="sage" onClick={() => goTo?.("utility")}/>
      </div>

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
          {(room.amenities || []).map(a => {
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

      <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 600, color: "var(--ink-3)", paddingLeft: 4, display: "flex", justifyContent: "space-between" }}>
        <span>กิจกรรมล่าสุด</span>
        <span style={{ color: "var(--brand)", fontWeight: 600 }}>ดูทั้งหมด</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <ActivityRow icon={<IconCheck size={16} stroke="var(--ok)"/>} tone="ok" title="ชำระค่าเช่า เดือนก่อน" sub="—"/>
        <ActivityRow icon={<IconClock size={16} stroke="var(--warn)"/>} tone="warn" title="แจ้งซ่อม · ลูกบิดหลวม" sub="กำลังตรวจสอบ"/>
        <ActivityRow icon={<IconBell size={16} stroke="var(--info)"/>} tone="info" title="ประกาศ · ปิดน้ำเร็ว ๆ นี้" sub="แจ้งล่วงหน้า"/>
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
  const { payments, curY, curM, addSlip, computePaymentTotal, slips } = useData();
  const [filter, setFilter] = useState("ทั้งหมด");
  const [slipSent, setSlipSent] = useState(false);
  const [sentImageUrl, setSentImageUrl] = useState(null);
  const allPays = payments.filter(p => p.room_id === tenant.room)
    .sort((a,b) => b.year !== a.year ? b.year - a.year : b.month - a.month);

  const filt = filter === "ทั้งหมด" ? allPays : allPays.filter(p => filter === "ชำระแล้ว" ? p.status === "ชำระแล้ว" : p.status === "รอชำระ");
  const cur = allPays.find(p => p.year === curY && p.month === curM);
  const totalPending = allPays.filter(p => p.status === "รอชำระ").reduce((s,p) => s+p.amount, 0);

  // Use computePaymentTotal if available for rent+util breakdown
  const breakdown = computePaymentTotal ? computePaymentTotal(tenant.room, curY, curM) : null;
  const displayTotal = breakdown ? breakdown.total : cur?.amount || 0;

  const onSubmitSlip = (file, imageUrl) => {
    if (!cur) return;
    addSlip({
      tenant_id: tenant.id, room_id: tenant.room,
      year: cur.year, month: cur.month, amount: displayTotal,
      bank: "KBANK", imageUrl, filename: file?.name,
    });
    setSentImageUrl(imageUrl || null);
    setSlipSent(true);
  };

  return (
    <div>
      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.4, marginBottom: 6 }}>การชำระเงิน</div>
      <div style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 16 }}>ห้อง {tenant.room} · {room.type}</div>

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
                {baht(displayTotal)}
              </div>
              {breakdown && breakdown.utilTotal > 0 && (
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <span style={{ fontSize: 11, color: "var(--ink-3)" }}>ค่าเช่า {baht(breakdown.rent)}</span>
                  <span style={{ fontSize: 11, color: "oklch(0.55 0.15 80)" }}>
                    ⚡ {breakdown.elecMode === "flat" ? `เหมา ${baht(breakdown.elec)}` : baht(breakdown.elec)}
                  </span>
                  <span style={{ fontSize: 11, color: "oklch(0.55 0.13 230)" }}>
                    💧 {breakdown.waterMode === "flat" ? `เหมา ${baht(breakdown.water)}` : baht(breakdown.water)}
                  </span>
                </div>
              )}
            </div>
            <div style={{ background: cur.status === "รอชำระ" ? "var(--brand)" : "var(--ok)",
              color: "white", padding: "5px 12px", borderRadius: 100, fontSize: 11.5, fontWeight: 700,
              display: "inline-flex", alignItems: "center", gap: 4,
            }}>
              {cur.status === "รอชำระ" ? <><IconClock size={12} stroke="white"/> ค้างชำระ</> : <><IconCheck size={12} stroke="white"/> ชำระแล้ว</>}
            </div>
          </div>
          {cur.status !== "รอชำระ" && (
            <div style={{ marginTop: 12, fontSize: 12.5, color: "var(--ink-3)" }}>ชำระเมื่อ {cur.paid_at}</div>
          )}
        </div>
      )}

      {cur && cur.status === "รอชำระ" && !slipSent && (
        <>
          <div style={{ marginTop: 4, fontSize: 13, fontWeight: 600, color: "var(--ink-3)", paddingLeft: 4, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
            <span>โอนเข้าบัญชี</span>
            <span style={{ fontSize: 11, color: "var(--ink-4)" }}>เลือกธนาคารที่สะดวก</span>
          </div>
          <BankAccounts/>
          <div style={{ height: 12 }}/>
          <SlipUploadTile amount={displayTotal} onSubmit={onSubmitSlip}/>
          <div style={{ height: 18 }}/>
        </>
      )}

      {slipSent && (
        <div style={{ background: "var(--ok-soft)", borderRadius: 16, padding: 16, marginBottom: 14, border: "1px solid var(--ok)", display: "flex", gap: 12, alignItems: "flex-start" }}>
          {sentImageUrl ? (
            <img src={sentImageUrl} alt="slip" style={{ width: 60, height: 80, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}/>
          ) : (
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--ok)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <IconCheck size={22} stroke="white"/>
            </div>
          )}
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ok)" }}>ส่งสลิปเรียบร้อย ✓</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>⏳ รอเจ้าของหอตรวจสอบและยืนยัน</div>
            <button onClick={() => setSlipSent(false)} style={{ marginTop: 8, fontSize: 11.5, color: "var(--ink-3)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>ส่งสลิปใหม่</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
        <Stat label="ค้างชำระทั้งหมด" value={baht(totalPending)} tone="brand"/>
        <Stat label="ชำระตรงเวลา" value={`${allPays.filter(p=>p.status==="ชำระแล้ว").length}/${allPays.length}`} tone="sage"/>
      </div>

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
function TenantRepair({ tenant }) {
  const { repairs, addRepair } = useData();
  const [showNew, setShowNew] = useState(false);
  const [issue, setIssue] = useState("");
  const own = repairs.filter(r => r.room_id === tenant.room);
  const list = own.length > 0 ? own : repairs.slice(0, 2);

  const onSend = async () => {
    if (issue.trim()) {
      await addRepair({ room_id: tenant.room, issue: issue.trim() });
    }
    setShowNew(false); setIssue("");
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.4 }}>แจ้งซ่อมห้องพัก</div>
      </div>
      <div style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 18 }}>เราจะส่งช่างไปดูภายใน 24 ชม.</div>

      <button onClick={() => setShowNew(true)} className="lift" style={{
        width: "100%", background: "var(--ink)", color: "white", borderRadius: 18,
        padding: "16px 18px", border: "none", cursor: "pointer", display: "flex",
        alignItems: "center", gap: 14, marginBottom: 18, textAlign: "left",
      }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconPlus size={20} stroke="white"/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>แจ้งซ่อมใหม่</div>
          <div style={{ fontSize: 12, opacity: 0.65, marginTop: 2 }}>เลือกห้องและบอกปัญหาให้เราฟัง</div>
        </div>
        <IconChevR size={18} stroke="white"/>
      </button>

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

      {showNew && <RepairModal onClose={() => { setShowNew(false); setIssue(""); }} onSend={onSend} room={tenant.room} issue={issue} setIssue={setIssue}/>}
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
        <IconCal size={12} stroke="var(--ink-4)"/>
        แจ้งเมื่อ {r.created_at ? new Date(r.created_at).toLocaleDateString("th-TH", {day:"numeric", month:"short", year:"numeric"}) : "—"}
      </div>
    </div>
  );
}

function RepairModal({ onClose, onSend, room, issue, setIssue }) {
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
            <IconBuilding size={18} stroke="var(--brand)"/>
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
          <button onClick={onSend} style={{
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

// ─── Tenant · Utility ────────────────────────────────────────────────────
function TenantUtility({ tenant }) {
  return (
    <div>
      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.4, marginBottom: 6 }}>มิเตอร์น้ำ-ไฟ</div>
      <div style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 16 }}>ห้อง {tenant.room} · จดทุกวันที่ 25 ของเดือน</div>
      <UtilityCard roomId={tenant.room}/>
    </div>
  );
}

// ─── Tenant · Profile ────────────────────────────────────────────────────
function TenantProfile({ tenant, onLogout }) {
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
        <IconEdit size={18} stroke="var(--ink-3)"/>
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-3)", paddingLeft: 4, marginBottom: 8 }}>การตั้งค่า</div>
      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 18, overflow: "hidden" }}>
        {[
          { ic: IconBell, t: "การแจ้งเตือน", v: "เปิด" },
          { ic: IconLock, t: "เปลี่ยนรหัสผ่าน" },
          { ic: IconCard, t: "ช่องทางชำระเงิน", v: "PromptPay" },
          { ic: IconPhone, t: "ติดต่อแอดมิน", v: "081-xxx-xxxx" },
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
              <IconChevR size={16} stroke="var(--ink-4)"/>
            </div>
          );
        })}
      </div>

      <button onClick={onLogout} style={{ width: "100%", marginTop: 18, padding: "13px 0", borderRadius: 14,
        background: "var(--surface)", border: "1px solid var(--danger-soft)", color: "var(--danger)",
        fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
        <IconLogout size={16} stroke="var(--danger)"/> ออกจากระบบ
      </button>
    </div>
  );
}
